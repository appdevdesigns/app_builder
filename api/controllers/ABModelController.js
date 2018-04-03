/**
 * ABModelController
 *
 * @description :: Server-side logic for managing the data related to a given Object 
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var AD = require('ad-utils');
var _ = require('lodash');
var path = require('path');
var async = require('async');
var cJSON = require('circular-json');


const ValidationError = require('objection').ValidationError;
const {ref, raw} = require('objection');


var reloading = null;


/** 
 * @function updateRelationValues
 * Make sure an object's relationships are properly updated.
 * We expect that when a create or update happens, that the data in the 
 * related fields represent the CURRENT STATE of all it's relations. Any 
 * field not in the relation value is no longer part of the related data.
 * @param {ABObject} object
 * @param {integer} id  the .id of the base object we are working with
 * @param {obj} updateRelationParams  "key"=>"value" hash of the related 
 *                      fields and current state of values.
 * @return {array}  array of update operations to perform the relations.
 */ 
function updateRelationValues(object, id, updateRelationParams) {

    var updateTasks = [];


    // create a new query to update relation data
    // NOTE: when use same query, it will have a "created duplicate" error
    var query = object.model().query();


    //// 
    //// We are given a current state of values that should be related to our object.
    //// It is not clear if these are new relations or existing ones, so we first
    //// remove any existing relation and then go back and add in the one we have been
    //// told to keep.
    //// 

    // NOTE : There is a error when update values and foreign keys at same time
    // - Error: Double call to a write method. You can only call one of the write methods 
    // - (insert, update, patch, delete, relate, unrelate, increment, decrement) and only once per query builder
    if (updateRelationParams != null && Object.keys(updateRelationParams).length > 0) {

        // clear relative values
        Object.keys(updateRelationParams).forEach((colName) => {

            updateTasks.push(() => {

                var clearRelationName = AppBuilder.rules.toFieldRelationFormat(colName);

                return new Promise((resolve, reject) => {

                    query.where(object.PK(), id).first()
                        .catch(err => reject(err))
                        .then(record => {

                            if (record == null) return resolve();

                            var fieldLink = object.fields(f => f.columnName == colName)[0];
                            if (fieldLink == null) return resolve();

                            var objectLink = fieldLink.object;
                            if (objectLink == null) return resolve();

                            record
                                .$relatedQuery(clearRelationName)
                                .unrelate()
                                .catch(err => reject(err))
                                .then(() => { resolve(); });

                        });

                });


            });


        });


        // update relative values
        Object.keys(updateRelationParams).forEach((colName) => {

            // convert relation data to array
            if (!Array.isArray(updateRelationParams[colName])) {
                updateRelationParams[colName] = [updateRelationParams[colName]];
            }

            // We could not insert many relation values at same time
            // NOTE : Error: batch insert only works with Postgresql
            updateRelationParams[colName].forEach(val => {

                // insert relation values of relation
                updateTasks.push(() => {

                    return new Promise((resolve, reject) => {

                        var relationName = AppBuilder.rules.toFieldRelationFormat(colName);

                        query.where(object.PK(), id).first()
                            .catch(err => reject(err))
                            .then(record => {

                                if (record == null) return resolve();

                                record.$relatedQuery(relationName)
                                    .relate(val)
                                    .catch(err => reject(err))
                                    .then(() => { resolve(); });

                            });
                    });

                });



            });

        });

    }

    return updateTasks;
}


/**
 * @function populateFindConditions
 * Add find conditions and include relation data to Knex.query
 * 
 * @param {Knex.query} query 
 * @param {ABObject} object 
 * @param {Object} options - {
 *                              where : {Array}
 *                              sort :  {Array}
 *                              offset: {Integer}
 *                              limit:  {Integer}
 *                              includeRelativeData: {Boolean}
 *                           }
 * @param {string} userData - {
 *                              username: {string},
 *                              guid: {string},
 *                              languageCode: {string}, - 'en', 'th'
 *                              ...
 *                             }
 */
function populateFindConditions(query, object, options, userData) {

    var where = options.where,
        sort = options.sort,
        offset = options.offset,
        limit = options.limit;

    // Apply filters
    if (!_.isEmpty(where)) {


        sails.log.debug('initial .where condition:', JSON.stringify(where, null, 4));


        // @function parseCondition
        // recursive fn() to step through each of our provided conditions and
        // translate them into query.XXXX() operations.
        // @param {obj} condition  a QueryBuilder compatible condition object
        // @param {ObjectionJS Query} Query the query object to perform the operations.
        function parseCondition(condition, Query) {

            // FIX: some improper inputs:
            // if they didn't provide a .glue, then default to 'and'
            // current webix behavior, might not return this 
            // so if there is a .rules property, then there should be a .glue:
            if (condition.rules) {
                condition.glue = condition.glue || 'and';
            }

            // if this is a grouping condition, then decide how to group and 
            // process our sub rules:
            if (condition.glue) {

                var nextCombineKey = 'where';
                if (condition.glue == 'or') {
                    nextCombineKey = 'orWhere';
                }
                condition.rules.forEach((r)=>{

                    Query[nextCombineKey]( function() { 

                        // NOTE: pass 'this' as the Query object
                        // so we can perform embedded queries:
                        // parseCondition(r, this); 

                        // 'this' is changed type QueryBuilder to QueryBuilderBase
                        parseCondition(r, Query);
                    });
                    
                })
                
                return;
            }


            //// Special Case:  'have_no_relation'
            // 1:1 - Get rows that no relation with 
            if (condition.rule == 'have_no_relation') {
                var relation_name = AppBuilder.rules.toFieldRelationFormat(condition.key);

                var field = object._fields.filter(field => field.columnName == condition.key)[0];
                if (!field) return;

                var objectLink = field.objectLink();
                if (!objectLink) return;

                var pkObjectLink = objectLink.PK();

                Query
                    .leftJoinRelation(relation_name)
                    .whereRaw('{relation_name}.{primary_name} IS NULL'
                        .replace('{relation_name}', relation_name)
                        .replace('{primary_name}', pkObjectLink));

                return;
            }



            //// Handle a basic rule:
            // { 
            //     key: fieldName,
            //     rule: 'qb_rule',
            //     value: ''
            // }

            sails.log.verbose('... basic condition:', JSON.stringify(condition, null, 4));

            // We are going to use the 'raw' queries for knex becuase the '.' 
            // for JSON searching is misinterpreted as a sql identifier
            // our basic where statement will be:
            var whereRaw = '{fieldName} {operator} {input}';


            // make sure a value is properly Quoted:
            function quoteMe(value) {
                return "'"+value+"'"
            }


            // convert QB Rule to SQL operation:
            var conversionHash = {
                'equals'        : '=',
                'not_equal'     : '<>',
                'not_equals'    : '<>',   // catch existing wrong entries
                'is_empty'      : '=',
                'is_not_empty'  : '<>',
                'greater'       : '>',
                'greater_or_equal' : '>=',
                'less'          : '<',
                'less_or_equal' : '<='
            }


            // basic case:  simple conversion
            var operator = conversionHash[condition.rule];
            var value = quoteMe(condition.value);



            // special operation cases:
            switch (condition.rule) {
                case "begins_with":
                    operator = 'LIKE';
                    value = quoteMe(condition.value + '%');
                    break;

                case "not_begins_with":
                    operator = "NOT LIKE";
                    value = quoteMe(condition.value + '%');
                    break;

                case "contains":
                    operator = 'LIKE';
                    value = quoteMe('%' + condition.value + '%');
                    break;

                case "not_contains":
                    operator = "NOT LIKE";
                    value = quoteMe('%' + condition.value + '%');
                    break;

                case "ends_with":
                    operator = 'LIKE';
                    value = quoteMe('%' + condition.value);
                    break;

                case "not_ends_with":
                    operator = "NOT LIKE";
                    value = quoteMe('%' + condition.value);
                    break;

                case "between": 
                    operator = "BETWEEN";
                    value = condition.value.map(function(v){ return quoteMe(v)}).join(' AND ');
                    break;

                case 'not_between':
                    operator = "NOT BETWEEN";
                    value = condition.value.map(function(v){ return quoteMe(v)}).join(' AND ');
                    break;

                case "is_current_user":
                    operator = "=";
                    value = quoteMe(userData.username);
                    break;

                case "is_not_current_user":
                    operator = "<>";
                    value = quoteMe(userData.username);
                    break;

                case 'is_null': 
                    operator = "IS NULL";
                    value = '';
                    break;

                case 'is_not_null': 
                    operator = "IS NOT NULL";
                    value = '';
                    break;

                case "in":
                    operator = "IN";
                    value = '(' + condition.value.map(function(v){ return quoteMe(v)}).join(', ') + ')';
                    break;

                case "not_in":
                    operator = "NOT IN";
                    value = '(' + condition.value.map(function(v){ return quoteMe(v)}).join(', ') + ')';
                    break;

            }


            // normal field name:
            var fieldName = '`' + condition.key + '`';

            // if we are searching a multilingual field it is stored in translations so we need to search JSON
            var field = object._fields.filter(field => field.columnName == condition.key)[0];
            if (field && field.settings.supportMultilingual == 1) {
                fieldName = 'JSON_UNQUOTE(JSON_EXTRACT(JSON_EXTRACT(translations, SUBSTRING(JSON_UNQUOTE(JSON_SEARCH(translations, "one", "' + userData.languageCode + '")), 1, 4)), \'$."' + condition.key + '"\'))';
            } 

            // if this is from a LIST, then make sure our value is the .ID
            if (field && field.key == "list" && field.settings && field.settings.options && field.settings.options.filter) {
                // NOTE: Should get 'id' or 'text' from client ??
                var inputID = field.settings.options.filter(option => (option.id == value || option.text == value))[0];
                if (inputID)
                    value = inputID.id;
            }


            // update our where statement:
            whereRaw = whereRaw
                .replace('{fieldName}', fieldName)
                .replace('{operator}', operator)
                .replace('{input}', ((value != null) ?  value  : ''));


            // Now we add in our where
            Query.whereRaw(whereRaw);
        }

        parseCondition(where, query);

    }

    // Apply Sorts
    if (!_.isEmpty(sort)) {
        sort.forEach(function (o) {
            // if we are ordering by a multilingual field it is stored in translations so we need to search JSON but this is different from filters
            // because we are going to sort by the users language not the builder's so the view will be sorted differntly depending on which languageCode
            // you are using but the intent of the sort is maintained
            if (o.isMulti == 1) {
                var by = 'JSON_UNQUOTE(JSON_EXTRACT(JSON_EXTRACT(translations, SUBSTRING(JSON_UNQUOTE(JSON_SEARCH(translations, "one", "' + userData.languageCode + '")), 1, 4)), \'$."' + o.by + '"\'))';
            } else { // If we are just sorting a field it is much simpler
                var by = "`" + o.by + "`";
            }
            query.orderByRaw(by + " " + o.dir);
        })
    }


    // apply any offset/limit if provided.
    if (offset) {
        query.offset(offset);
    }
    if (limit) {
        query.limit(limit);
    }

    // query relation data
    if (options.includeRelativeData) {
        var relationNames = object.connectFields()
            .filter((f) => f.fieldLink() != null)
            .map((f) => f.relationName());

        // includes 'translations' of the external object
        if (object.isExternal &&
            object.model().relationMappings()['translations'])
            relationNames.push('translations');

        if (relationNames.length > 0)
            query.eager('[#fieldNames#]'.replace('#fieldNames#', relationNames.join(', ')));
    }

    sails.log.debug('SQL:', query.toString() );
}

/**
 * @function updateConnectedFields
 * Look at a saved record's object to broadcast a "stale" action on its connected fields
 * 
 * @param {ABObject} object 
 * @param {string} data // updated data
 *
 */
function updateConnectedFields(object, newData, oldData) {
    // Check to see if the object has any connected fields that need to be updated
    var connectFields = object.connectFields();
    // Parse through the connected fields
    connectFields.forEach((f)=>{
        // Get the field object that the field is linked to
        var field = f.fieldLink();
        // Get the relation name so we can separate the linked fields updates from the rest
        var relationName = f.relationName();
        if (Array.isArray(newData)) {
            newData[relationName] = [];
            newData.forEach((n) => {
                newData[relationName] = newData[relationName].concat(n[relationName]);
            });
        }
        // Get all the values of the linked field from the save
        var newItems = newData[relationName];
        // If there was only one it is not returned as an array so lets put it in an array to normalize
        if (!Array.isArray(newItems)) {
            newItems = [newItems];
        }
        
        var items = newItems;
        // check to see if we passed in the previous version of the saved data
        if (oldData !== undefined) {
            // Get all the values of the linked field from the old data
            var oldItems = oldData[relationName];
            // If there was only one it is not returned as an array so lets put it in an array to normalize
            if (!Array.isArray(oldItems)) {
                oldItems = [oldItems];
            }
            // combine the new and the old items and remove duplicates
            items = items.concat(oldItems);
        }
        
        // filter array to only show unique items
        items = _.uniqBy(items, object.PK());
        // parse through all items and broadcast a "stale" action so we can tell the client side the data may have updated
        items.forEach((i) => {
            // Make sure you put the payload together just like before
            var payload = {
                objectId: field.object.id, // get the fields object id
                data: i // pass the whole item 
            }
            // Broadcast the payload and let the clientside figure out what to do next
            sails.sockets.broadcast(field.object.id, "ab.datacollection.stale", payload);
        });
    });
}


/**
 * @function updateTranslationsValues
 * Update translations value of the external table
 * 
 * @param {ABObject} object 
 * @param {int} id 
 * @param {Array} translations - translations data
 * @param {boolean} isInsert
 *
 */
function updateTranslationsValues(object, id, translations, isInsert) {

    if (!object.isExternal)
        return Promise.resolve();
        
    let transModel = object.model().relationMappings()['translations'];
    if (!transModel)
        return Promise.resolve();

    let tasks = [],
        transTableName = transModel.modelClass.tableName;
        multilingualFields = object.fields(f => f.settings.supportMultilingual);

    translations.forEach(trans => {

        tasks.push(new Promise((next, err) => {

            let transKnex = ABMigration.connection()(transTableName);

            // values
            let vals = {};
            vals[object.transColumnName] = id;
            vals['language_code'] = trans['language_code'];

            multilingualFields.forEach(f => {
                vals[f.columnName] = trans[f.columnName];
            });

            // where clause
            let where = {};
            where[object.transColumnName] = id;
            where['language_code'] = trans['language_code'];

            // insert
            if (isInsert) {

                transKnex.insert(vals)
                    .catch(err)
                    .then(function() {
                        next();
                    });
            }
            // update
            else {

                transKnex.update(vals).where(where)
                    .catch(err)
                    .then(function() {
                        next();
                    });
            }

        }));

    });

    return Promise.all(tasks);

}





module.exports = {

    create: function (req, res) {


        AppBuilder.routes.verifyAndReturnObject(req, res)
            .then(function (object) {


                var allParams = req.allParams();
                sails.log.verbose('ABModelController.create(): allParams:', allParams);

                // return the parameters from the input params that relate to this object
                var createParams = object.requestParams(allParams);

                // return the parameters of connectObject data field values 
                var updateRelationParams = object.requestRelationParams(allParams);


                var validationErrors = object.isValidData(createParams);
                if (validationErrors.length == 0) {

                    // this is a create operation, so ... 
                    // createParams.created_at = (new Date()).toISOString();
                    if (!object.isExternal)
                        createParams.created_at = AppBuilder.rules.toSQLDateTime(new Date());

                    sails.log.verbose('ABModelController.create(): createParams:', createParams);

                    var query = object.model().query();

                    query.insert(createParams)
                        .then((newObj) => {

                            var updateTasks = updateRelationValues(object, newObj[object.PK()], updateRelationParams);


                            if (object.isExternal &&
                                createParams.translations)
                                updateTasks.push(updateTranslationsValues(object, newObj[object.PK()], createParams.translations, true));


                                // update relation values sequentially
                            return updateTasks.reduce((promiseChain, currTask) => {
                                return promiseChain.then(currTask);
                            }, Promise.resolve([]))
                                .catch((err) => { return Promise.reject(err); })
                                .then((values) => {

                                    // Query the new row to response to client
                                    var query3 = object.model().query();
                                    populateFindConditions(query3, object, {
                                        where: {
                                            glue:'and',
                                            rules:[
                                                {
                                                    key: object.PK(),
                                                    rule: "equals",
                                                    value: newObj[object.PK()] || ''
                                                }
                                            ]
                                        },
                                        offset: 0,
                                        limit: 1,
                                        includeRelativeData: true
                                    },
                                    req.user.data);

                                    return query3
                                        .catch((err) => { return Promise.reject(err); })
                                        .then((newItem) => {

                                            res.AD.success(newItem[0]);
                                            
                                            // We want to broadcast the change from the server to the client so all datacollections can properly update
                                            // Build a payload that tells us what was updated
                                            var payload = {
                                                objectId: object.id,
                                                data: newItem[0]
                                            }
                                            
                                            // Broadcast the create
                                            sails.sockets.broadcast(object.id, "ab.datacollection.create", payload);
                                            
                                            updateConnectedFields(object, newItem[0]);
                                            
                                            Promise.resolve();

                                        });


                                });


                        }, (err) => {

                            // handle invalid values here:
                            if (err instanceof ValidationError) {

                                //// TODO: refactor these invalid data handlers to a common OP.Validation.toErrorResponse(err)

                                // return an invalid values response:
                                var errorResponse = {
                                    error: 'E_VALIDATION',
                                    invalidAttributes: {

                                    }
                                }

                                var attr = errorResponse.invalidAttributes;

                                for (var e in err.data) {
                                    attr[e] = attr[e] || [];
                                    err.data[e].forEach((eObj) => {
                                        eObj.name = e;
                                        attr[e].push(eObj);
                                    })
                                }

                                res.AD.error(errorResponse);
                            }
                            else {
                                Promise.reject(err);
                            }

                        })
                        .catch((err) => {
                            console.log('... catch(err) !');

                            if (!(err instanceof ValidationError)) {
                                ADCore.error.log('Error performing update!', { error: err })
                                res.AD.error(err);
                                sails.log.error('!!!! error:', err);
                            }
                        })



                } else {

                    // return an invalid values response:
                    var errorResponse = {
                        error: 'E_VALIDATION',
                        invalidAttributes: {

                        }
                    }

                    var attr = errorResponse.invalidAttributes;

                    validationErrors.forEach((e) => {
                        attr[e.name] = attr[e.name] || [];
                        attr[e.name].push(e);
                    })

                    res.AD.error(errorResponse);
                }

            })

    },



    /**
     * find
     *
     * get /app_builder/model/application/:appID/object/:objID
     */
    find: function (req, res) {


        AppBuilder.routes.verifyAndReturnObject(req, res)
            .then(function (object) {
            
                // verify that the request is from a socket not a normal HTTP
                if (req.isSocket) {
                    // Subscribe socket to a room with the name of the object's ID
                    sails.sockets.join(req, object.id);
                }

                var query = object.model().query();


                var where = req.options._where;
                var sort = req.options._sort;
                var offset = req.options._offset;
                var limit = req.options._limit;

                populateFindConditions(query, object, {
                    where: where,
                    sort: sort,
                    offset: offset,
                    limit: limit,
                    includeRelativeData: true
                },
                req.user.data);

                // promise for the total count. this was moved below the filters because webix will get caught in an infinte loop of queries if you don't pass the right count
                var queryCount = object.model().query();
                populateFindConditions(queryCount, object, { where: where, includeRelativeData: false }, req.user.data);
                // added tableName to id because of non unique field error
                var pCount = queryCount.count('{tableName}.{pkName} as count'
                                                .replace("{tableName}", object.model().tableName)
                                                .replace("{pkName}", object.PK())
                                            ).first();
                    
                Promise.all([
                    pCount,
                    query
                ]).then(function (values) {
                    var result = {};
                    var count = values[0].count;
                    var rows = values[1];
                    result.data = rows;

                    // webix pagination format:
                    result.total_count = count;
                    result.pos = offset;

                    result.offset = offset;
                    result.limit = limit;

                    if ((offset + rows.length) < count) {
                        result.offset_next = offset + limit;
                    }



                    //// TODO: evaluate if we really need to do this: 
                    //// ?) do we have a data field that actually needs to post process it's data
                    ////    before returning it to the client?

                    // object.postGet(result.data)
                    // .then(()=>{


                    if (res.header) res.header('Content-type', 'application/json');

                    res.send(result, 200);


                    // })


                })
                .catch((err) => {
console.log(err);
                    res.AD.error(err);

                });


            })
            .catch((err) => {
console.log(err);
            });

    },


    delete: function (req, res) {

        var id = req.param('id', -1);
        var object;
        var oldItem;
        var relatedItems = [];


        if (id == -1) {
            var invalidError = ADCore.error.fromKey('E_MISSINGPARAM');
            invalidError.details = 'missing .id';
            sails.log.error(invalidError);
            res.AD.error(invalidError, 400);
            return;
        }

        async.series([
            // step #1
            function (next) {

                AppBuilder.routes.verifyAndReturnObject(req, res)
                    .catch(next)
                    .then(function (obj) {
                        object = obj;
                        next();
                    });

            },

            // step #2
            function (next) {
                // We are deleting an item...but first fetch its current data  
                // so we can clean up any relations on the client side after the delete
                var queryPrevious = object.model().query();
                populateFindConditions(queryPrevious, object, {
                    where: {
                        glue:'and',
                        rules:[{
                            key: object.PK(),
                            rule: "equals",
                            value: id
                        }]
                    },
                    includeRelativeData: true
                }, req.user.data);
                
                queryPrevious
                    .catch(next)
                    .then((old_item) => {
                        oldItem = old_item;
                        next();
                    });
                    
            },
            
            // step #3
            function (next) {
                // Check to see if the object has any connected fields that need to be updated
                var connectFields = object.connectFields();
                
                // If there are no connected fields continue on
                if (connectFields.length == 0) next();
                
                var relationQueue = [];
                
                // Parse through the connected fields
                connectFields.forEach((f)=>{
                    // Get the field object that the field is linked to
                    var relatedObject = f.objectLink();
                    // Get the relation name so we can separate the linked fields updates from the rest
                    var relationName = f.relationName();
                    
                    // If we have any related item data we need to build a query to report the delete...otherwise just move on
                    if (oldItem[0] &&
                        oldItem[0][relationName] &&
                        oldItem[0][relationName].length) {
                        // Push the ids of the related data into an array so we can use them in a query
                        var relatedIds = [];
                        oldItem[0][relationName].forEach((old) => {
                            relatedIds.push(old.id); // TODO: support various id
                        });
                        // Get all related items info
                        var queryRelated = relatedObject.model().query();
                        populateFindConditions(queryRelated, relatedObject, {
                            where: {
                                glue:'and',
                                rules:[{
                                    key: relatedObject.PK(),
                                    rule: "in",
                                    value: relatedIds
                                }]
                            },
                            includeRelativeData: true
                        }, req.user.data);

                        var p = queryRelated
                            .catch(next)
                            .then((items) => {
                                // push new realted items into the larger related items array
                                relatedItems.push({
                                    object: relatedObject,
                                    items: items
                                });
                            });
                            
                        relationQueue.push(p);
                    }
                });
                
                Promise.all(relationQueue).then(function(values) {
                    console.log("relatedItems: ", relatedItems)
                    next();
                })
                .catch(next);

            },
            
            // step #4
            function (next) {
                // Now we can delete because we have the current record saved as oldItem and our related records saved as relatedItems
                object.model().query()
                    .deleteById(id)
                    .then((numRows) => {

                        res.AD.success({ numRows: numRows });

                        // We want to broadcast the change from the server to the client so all datacollections can properly update
                        // Build a payload that tells us what was updated
                        var payload = {
                            objectId: object.id,
                            id: id
                        }

                        // Broadcast the delete
                        sails.sockets.broadcast(object.id, "ab.datacollection.delete", payload);

                        // Using the data from the oldItem and relateditems we can update all instances of it and tell the client side it is stale and needs to be refreshed
                        updateConnectedFields(object, oldItem[0]);
                        if (relatedItems.length) {
                            relatedItems.forEach((r) => {
                                updateConnectedFields(r.object, r.items);
                            });
                        }
                        next();
                
                    })
                    .catch(next);
    
            },

        ], function (err) {
            if (err) {
                if (!(err instanceof ValidationError)) {
                    ADCore.error.log('Error performing delete!', { error: err })
                    res.AD.error(err);
                    sails.log.error('!!!! error:', err);
                }                
            }
        });



        // AppBuilder.routes.verifyAndReturnObject(req, res)
        //     .then(function (object) {
        // 
        // 
        //         // We are deleting an item...but first fetch its current data  
        //         // so we can clean up any relations on the client side after the delete
        //         var queryPrevious = object.model().query();
        //         populateFindConditions(queryPrevious, object, {
        //             where: {
        //                 glue:'and',
        //                 rules:[{
        //                     key: "id",
        //                     rule: "equals",
        //                     value: id
        //                 }]
        //             },
        //             includeRelativeData: true
        //         }, req.user.data);
        // 
        //         queryPrevious
        //             .catch((err) => { 
        //                 if (!(err instanceof ValidationError)) {
        //                     ADCore.error.log('Error performing find!', { error: err })
        //                     res.AD.error(err);
        //                     sails.log.error('!!!! error:', err);
        //                 }
        //             })
        //             .then((oldItem) => {
        // 
        //                 // Check to see if the object has any connected fields that need to be updated
        //                 var connectFields = object.connectFields();
        //                 // Parse through the connected fields
        //                 connectFields.forEach((f)=>{
        //                     // Get the field object that the field is linked to
        //                     var relatedObject = f.objectLink();
        //                     // Get the relation name so we can separate the linked fields updates from the rest
        //                     var relationName = f.relationName();
        // 
        //                     // If we have any related item data we need to build a query to report the delete...otherwise just move on
        //                     if (oldItem[0][relationName].length) {
        //                         // Push the ids of the related data into an array so we can use them in a query
        //                         var relatedIds = [];
        //                         oldItem[0][relationName].forEach((old) => {
        //                             relatedIds.push(old.id);
        //                         });
        //                         // Get all related items info
        //                         var queryRelated = relatedObject.model().query();
        //                         populateFindConditions(queryRelated, relatedObject, {
        //                             where: {
        //                                 glue:'and',
        //                                 rules:[{
        //                                     key: "id",
        //                                     rule: "in",
        //                                     value: relatedIds
        //                                 }]
        //                             },
        //                             includeRelativeData: true
        //                         }, req.user.data);
        // 
        //                         queryRelated
        //                             .catch((err) => { 
        //                                 if (!(err instanceof ValidationError)) {
        //                                     ADCore.error.log('Error performing find!', { error: err })
        //                                     res.AD.error(err);
        //                                     sails.log.error('!!!! error:', err);
        //                                 }
        //                             })
        //                             .then((relatedItems) => {
        // 
        //                                 // Now we can delete because we have the current record saved as oldItem and our related records saved as relatedItems
        //                                 object.model().query()
        //                                     .deleteById(id)
        //                                     .then((numRows) => {
        // 
        //                                         res.AD.success({ numRows: numRows });
        // 
        //                                         // We want to broadcast the change from the server to the client so all datacollections can properly update
        //                                         // Build a payload that tells us what was updated
        //                                         var payload = {
        //                                             objectId: object.id,
        //                                             id: id
        //                                         }
        // 
        //                                         // Broadcast the delete
        //                                         sails.sockets.broadcast(object.id, "ab.datacollection.delete", payload);
        // 
        //                                         // Using the data from the oldItem and relateditems we can update all instances of it and tell the client side it is stale and needs to be refreshed
        //                                         updateConnectedFields(object, oldItem[0]);
        //                                         updateConnectedFields(relatedObject, relatedItems);
        // 
        //                                     })
        //                                     .catch((err) => {
        //                                         // console.log('... catch(err) !');
        // 
        //                                         if (!(err instanceof ValidationError)) {
        //                                             ADCore.error.log('Error performing update!', { error: err })
        //                                             res.AD.error(err);
        //                                             sails.log.error('!!!! error:', err);
        //                                         }
        //                                     });
        // 
        // 
        //                             });
        //                     } else {
        //                         // Now we can delete because we have the current record saved as oldItem and our related records saved as relatedItems
        //                         object.model().query()
        //                             .deleteById(id)
        //                             .then((numRows) => {
        // 
        //                                 res.AD.success({ numRows: numRows });
        // 
        //                                 // We want to broadcast the change from the server to the client so all datacollections can properly update
        //                                 // Build a payload that tells us what was updated
        //                                 var payload = {
        //                                     objectId: object.id,
        //                                     id: id
        //                                 }
        // 
        //                                 // Broadcast the delete
        //                                 sails.sockets.broadcast(object.id, "ab.datacollection.delete", payload);
        // 
        //                                 // Using the data from the oldItem we can update all instances of it and tell the client side it is stale and needs to be refreshed
        //                                 updateConnectedFields(object, oldItem[0]);
        // 
        //                             })
        //                             .catch((err) => {
        //                                 // console.log('... catch(err) !');
        // 
        //                                 if (!(err instanceof ValidationError)) {
        //                                     ADCore.error.log('Error performing update!', { error: err })
        //                                     res.AD.error(err);
        //                                     sails.log.error('!!!! error:', err);
        //                                 }
        //                             });
        //                     }
        //                 });
        // 
        // 
        // 
        //             });
        // 
        //     })

    },


    update: function (req, res) {

        var id = req.param('id', -1);


        if (id == -1) {
            var invalidError = ADCore.error.fromKey('E_MISSINGPARAM');
            invalidError.details = 'missing .id';
            sails.log.error(invalidError);
            res.AD.error(invalidError, 400);
            return;
        }

        AppBuilder.routes.verifyAndReturnObject(req, res)
            .then(function (object) {


                // We are updating an item...but first fetch it's current data  
                // so we can clean up the client sides relations after the update 
                // because some updates will involve deletes of relations 
                // so assuming creates can be problematic
                var queryPrevious = object.model().query();
                populateFindConditions(queryPrevious, object, {
                    where: {
                        glue:'and',
                        rules:[{
                            key: object.PK(),
                            rule: "equals",
                            value: id
                        }]
                    },
                    includeRelativeData: true
                }, req.user.data);
                
                queryPrevious
                    .catch((err) => { 
                        if (!(err instanceof ValidationError)) {
                            ADCore.error.log('Error performing find!', { error: err })
                            res.AD.error(err);
                            sails.log.error('!!!! error:', err);
                        }
                    })
                    .then((oldItem) => {


                        var allParams = req.allParams();
                        sails.log.verbose('ABModelController.update(): allParams:', allParams);

                        // return the parameters from the input params that relate to this object
                        // exclude connectObject data field values
                        var updateParams = object.requestParams(allParams);

                        // return the parameters of connectObject data field values 
                        var updateRelationParams = object.requestRelationParams(allParams);

                        // get translations values for the external object
                        // it will update to translations table after model values updated
                        var transParams = _.cloneDeep(updateParams.translations);

                        var validationErrors = object.isValidData(updateParams);
                        if (validationErrors.length == 0) {

                            if (object.isExternal) {
                                // translations values does not in same table of the external object
                                delete updateParams.translations;
                            }
                            else {
                                // this is an update operation, so ... 
                                // updateParams.updated_at = (new Date()).toISOString();
                                updateParams.updated_at = AppBuilder.rules.toSQLDateTime(new Date());

                                // Check if there are any properties set otherwise let it be...let it be...let it be...yeah let it be
                                if (allParams.properties != "") {
                                    updateParams.properties = allParams.properties;
                                } else {
                                    updateParams.properties = null;
                                }
                            }

                            // Prevent ER_PARSE_ERROR: when no properties of update params
                            // update `TABLE_NAME` set  where `id` = 'ID'
                            if (updateParams && Object.keys(updateParams).length == 0)
                                updateParams = null;

                            if (updateParams == null) {
                                updateParams = {};
                                updateParams[object.PK()] = ref(object.PK());
                            }

                            sails.log.verbose('ABModelController.update(): updateParams:', updateParams);

                            var query = object.model().query();

                            // Do Knex update data tasks
                            query.patch(updateParams).where(object.PK(), id)
                                .then((values) => {

                                    var updateTasks = updateRelationValues(object, id, updateRelationParams);

                                    // update translation of the external table
                                    if (object.isExternal)
                                        updateTasks.push(updateTranslationsValues(object, id, transParams));

                                    // update relation values sequentially
                                    return updateTasks.reduce((promiseChain, currTask) => {
                                        return promiseChain.then(currTask);
                                    }, Promise.resolve([]))
                                        .catch((err) => { return Promise.reject(err); })
                                        .then((values) => {

                                            // Query the new row to response to client
                                            var query3 = object.model().query();
                                            populateFindConditions(query3, object, {
                                                where: {
                                                    glue:'and',
                                                    rules:[{
                                                        key: object.PK(),
                                                        rule: "equals",
                                                        value: id
                                                    }]
                                                },
                                                offset: 0,
                                                limit: 1,
                                                includeRelativeData: true
                                            },
                                            req.user.data);

                                            return query3
                                                .catch((err) => { return Promise.reject(err); })
                                                .then((newItem) => {
                                                    res.AD.success(newItem[0]);
                                                    
                                                    // We want to broadcast the change from the server to the client so all datacollections can properly update
                                                    // Build a payload that tells us what was updated
                                                    var payload = {
                                                        objectId: object.id,
                                                        data: newItem[0]
                                                    }
                                                    
                                                    // Broadcast the update
                                                    sails.sockets.broadcast(object.id, "ab.datacollection.update", payload);
                                                    
                                                    updateConnectedFields(object, newItem[0], oldItem[0]);
                                                    
                                                    Promise.resolve();
                                                });

                                        });

                                }, (err) => {

                                    console.log('...  (err) handler!', err);

                                    // handle invalid values here:
                                    if (err instanceof ValidationError) {

                                        //// TODO: refactor these invalid data handlers to a common OP.Validation.toErrorResponse(err)

                                        // return an invalid values response:
                                        var errorResponse = {
                                            error: 'E_VALIDATION',
                                            invalidAttributes: {

                                            }
                                        }

                                        var attr = errorResponse.invalidAttributes;

                                        for (var e in err.data) {
                                            attr[e] = attr[e] || [];
                                            err.data[e].forEach((eObj) => {
                                                eObj.name = e;
                                                attr[e].push(eObj);
                                            })
                                        }

                                        res.AD.error(errorResponse);
                                    }

                                })
                                .catch((err) => {
                                    console.log('... catch(err) !');

                                    if (!(err instanceof ValidationError)) {
                                        ADCore.error.log('Error performing update!', { error: err })
                                        res.AD.error(err);
                                        sails.log.error('!!!! error:', err);
                                    }
                                })



                        } else {

                            // return an invalid values response:
                            var errorResponse = {
                                error: 'E_VALIDATION',
                                invalidAttributes: {

                                }
                            }

                            var attr = errorResponse.invalidAttributes;

                            validationErrors.forEach((e) => {
                                attr[e.name] = attr[e.name] || [];
                                attr[e.name].push(e);
                            })

                            res.AD.error(errorResponse);
                        }
                        
                    });

            })

    },



    refresh: function (req, res) {

        AppBuilder.routes.verifyAndReturnObject(req, res)
            .then(function (object) {

                object.modelRefresh();

                res.AD.success({});

            });

    }


};

