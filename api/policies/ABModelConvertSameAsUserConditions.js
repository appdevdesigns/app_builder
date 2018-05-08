/**
 * ABModelConvertSameAsUserConditions
 * 
 * @module      :: Policy
 * @description :: Scan any provided conditions to see if we have a 'same_as_user' 
 *                 or 'not_same_as_user' clause.  If we do, convert it to an IN or NOT IN
 *                 clause.
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */

var url = require('url');
var AD = require('ad-utils');
var _ = require('lodash');


module.exports = function(req, res, next) {
    

    // our QB Conditions look like:
    // {
    //   "glue": "and",
    //   "rules": [{
    //     "key": "name_first",
    //     "rule": "begins_with",
    //     "value": "a"
    //   }, {
    //     "key": "name_family",
    //     "rule": "begins_with",
    //     "value": "a"
    //   }, {
    //     "glue": "or",
    //     "rules": [{
    //       "glue": "and",
    //       "rules": [{
    //         "key": "name_first",
    //         "rule": "not_begins_with",
    //         "value": "Apple"
    //       }, {
    //         "key": "name_family",
    //         "rule": "not_contains",
    //         "value": "Pie"
    //       }]
    //     }, {
    //       "glue": "and",
    //       "rules": [{
    //         "key": "name_first",
    //         "rule": "ends_with",
    //         "value": "Crumble"
    //       }, {
    //         "key": "name_family",
    //         "rule": "equal",
    //         "value": "Goodness"
    //       }]
    //     }]
    //   }]
    // }  
    //
    //   


    // move along if no or empty where clause
    if (_.isEmpty(req.options._where)) {
        next();
        return;
    }


    parseCondition(req.options._where, null, req, res, (err) => {
        if (err) {
            ADCore.error.log('AppBuilder:Policy:ABModelConvertSameAsUserConditions:Error processing condition', {error:err});
        }
        next(err);
    })
 

};



/**
 * @function findEntry
 * analyze the current condition to see if it is one we are looking for.
 * if it is a grouping entry ( 'and', 'or') then search it's children looking 
 * for an entry as well.
 * if no entry is found, return null.
 * @param {obj} a condition entry
 * @return {obj} a condition entry that matches our type we are looking for:
 */
function findEntry(_where) {

    if (_where.rules) {

        var entry = null;
        for(var i=0; i < _where.rules.length; i++) {
            entry = findEntry(_where.rules[i]);
            if (entry) {
                return entry;
                break;
            }
        }
        return entry;

    } else {

        if ((_where.rule == 'same_as_user') || (_where.rule == 'not_same_as_user')) {
            return _where;
        } else {
            return null;
        }
    }
}



function parseCondition(_where, object, req, res, cb) {

    var cond = findEntry(_where);
    if (!cond) {
        cb();
    } else {

        // the first time we find a cond to process, we then
        // lookup the object for this route:
        if (!object) {
            AppBuilder.routes.verifyAndReturnObject(req, res)
                .then(function (obj) {
                    object = obj;

                    // try again with an object now:
                    parseCondition(_where, object, req, res, cb);
                })
                .catch((err)=>{
                    ADCore.error.log('AppBuilder:Policy:ABModelConvertSameAsUserConditions:error finding object for this route:', {error:err});
                    
                    // exit with error:
                    cb(err);
                });

        } else {

            // get list of object->field lookups with the last one being the closest obj that has a [user] field type
            // foreach entry (LIFO)
                // lookup matching entries, use PKs to lookup next round

            // when done, we should have object.field = [of matching values from user]
            // rebuild current condition using results:

// we want to recursively do a DepthFirstSearch DFS to find the first object that has a [user] field.
// along the way, build an array of lookups {obj, fieldOut, fieldCond, }
// each step along the way, we should be able to do a lookup on obj where fieldCond in results of previous lokup
// the first lookup, have fieldCond = [user], 
// the look up will get all objs where fieldCond=[user], and will return an [] of values from the fieldOut column
// that result will return to the next lookup, where it will find all obj->fieldCond IN previous results
// etc... 

            processObjectWithUser(object, [], req,  (err, lookups)=>{

                processLookup(lookups, (err, data)=>{

                    if (err) {
                        cb(err);
                        return;
                    }

                    if (!data) {

// TODO:
// looks like we did not return any data from the lookups:
// - if 'same' then return a false condition?
// - if no same, then return a true condition?


                    } else {
//// QUESTION:  if data == [], what does this mean?  
// we want entries that either match / or don't match 


                        // current cond should be in format:
                            //  cond.key   : the sql column name
                            //  cond.rule  : the rule key: 
                            //  cond.value :  (empty)

                        
                        // cond.key = cond.key;     // cond.key should be the field.id 
                        // convert cond.key into the columnName for the query
                        var field = object.fields().filter((f)=>{ return f.id == cond.key; })[0];
                        if (field) {
                            cond.key = field.columnName;
                        }

                        // cond.rule  : should be either ["in", "not_in"]
                        var convert = {
                            'same_as_user' : 'in',
                            'not_same_as_user' : 'not_in'
                        }
                        cond.rule = convert[cond.rule];

                        // cond.value : should be an [] of values that matched the [user]
                        // cond.key is the field in data that we want to match on
                        var fieldValues = data.map((d)=>{ return d[cond.key]; });

// TODO: simplify fieldValues to a unique list
                        cond.value = fieldValues; 


                        // we've updated this condition, now try to process another one:
                        parseCondition(_where, object, req, res, cb);

                    }

                })


            });  // processObjectWithUser()


        } // if !object

    } // if !cond
}







// processObjectWithUser
// attempt to find the closest object to the provided obj, that has a [user] field.
// @param {ABObj} obj The current obj to evaluate
// @param {array} listAlreadyChecked  an array of obj.id's that have already been checked.  
//                                    To prevent circular searches
// @param {fn}    cb  A node style callback (err, data)  that is called when we have finished
// @return  null if no object with a [user] field is found.
//          {array} of lookup definitions from found obj  
function processObjectWithUser( obj, listAlreadyChecked, req,  cb ) {

    // add the current obj into our list of objects being checked:
    listAlreadyChecked.push(obj.id);

    var userField = obj.fields((f)=> { return f.key == 'user';})[0];
    if (userField) {
        // this obj has a USER field!!! 


        // return a lookup for this object, with entries where userField == current user
        var cond = {
            glue:'and',
            rules:[{
                key:userField.columnName,
                rule:'equals',
                value:req.user.data.username
            }]
        };

        var lookup = {
            object:obj,
            cond:cond
        }

        var stack = [];
        stack.push(lookup);

        cb(null, stack);
        return


    } else {

        var connectionFields = obj.fields((f) => { return f.key == 'connectObject'; });

        if (connectionFields.length == 0) {
            cb(null, null);
            return;
        }

        
        ProcessField(connectionFields, obj, listAlreadyChecked, req,  cb);

    } // if !user

} // function  processObjectWithUser()




function ProcessField( list, obj, listAlreadyChecked, req, cb) {

    // if we got to the end, then there were no successful fields:
    if (list.length == 0) {
        cb(null, null);   
    } else {

        // get current field
        var currField = list.shift();

        // check to see if currField's obj has a solution:
        var connectedObj = currField.datasourceLink;  // obj.application.objects((o)=>{ return o.id == currField.linkObject; })[0];
        if (!connectedObj) {

            // if no connectedObj, then on to next field:
            ProcessField(list, obj, listAlreadyChecked, req, cb);
            return;
        }


        // if this object has already been checked, then continue to next Field:
        if (listAlreadyChecked.indexOf(connectedObj.id) != -1) {
            ProcessField(list, obj, listAlreadyChecked, req, cb);
            return;
        }


        // does this object give us a solution?
        processObjectWithUser(connectedObj, listAlreadyChecked, req, (err, result)=>{

            // if no results with this object, move on to next Field:
            if (!result) {  
                ProcessField(list, obj, listAlreadyChecked, req, cb);
            } else {

                // we now have a solution.  So figure out how to decode the data returned 
                // by connectedObj to limit the current obj:

                var linkCase = currField.linkType()+':'+currField.linkViaType();

                switch(linkCase.toLowerCase()) {

                    case 'one:one':
                    case 'one:many':

                        // in this case, this obj[currField.columnName] = the PK of the connectedObj 
                        // values we will receive 

                        // NOTE: also the lookup format changes for lookups that depend on the results
                        // of previous calls:
                        var lookup = {
                            obj:obj,
                            field: currField.columnName,
                            dataColumn: connectedObj.PK()
                        }
                        result.push(lookup);
                        cb(null, result);
                        break;


                    case 'many:one':
                        // in this case, this obj.PK  is in the connectedObj[currField.columnName]

                        var linkedField = currField.fieldLink();

                        var lookup = {
                            obj:obj,
                            field: obj.PK(),  
                            dataColumn: linkedField.columnName
                        }
                        result.push(lookup);
                        cb(null, result);
                        break;


                    case 'many:many':

                        // push a query for the joinTable 
                        // ok the resulting data contains the PK for the connectedObj that must
                        // be used to lookup the joinTable

                        var lookupJoin = {
                            joinTable: currField.joinTableName(),
                            field: connectedObj.name,
                            dataColumn: connectedObj.PK()

                        }
                        result.push(lookupJoin);


                        // push a query for this obj
                        // then we need to push a lookup for this obj where our PK is in the 
                        // joinTable results:
                        var lookup = {
                            obj:obj,
                            field: obj.PK(),
                            dataColumn: obj.name
                        }
                        result.push(lookup);

                        cb(null, result);
                        break;

                } // end switch

            } // end if(result)


        }); // ProcessObjectWithUser()

    }  // if list.length > 0
    
} // end ProcessField()




/**
 * @function processLookup
 * perform the lookups on the provided list and return the final data
 * @param {array} list  [{lookup}]
 * @param {fn}    cb    call back for when the processing is finished.
 * @param {array} data  array of rows of data returned from previous lookup.
 */
function processLookup( list, cb, data) {

    if (!list) {
        // this is the case where there were no objects found.
        cb(null, null);
        return;
    }

    
    if (list.length == 0) {
        // we have processed all our lookups, return the data:
        cb(null, data);
        return;
    }


    // peform a lookup on the next available one
    var lookup = list.shift();

    // there are 3 types of lookups:
    // A) initial [user] lookup
    // B) lookup based on previous data
    // C) lookup from an intermediate lookup table


    // A) initial [user] lookup
    // lookup in format:
    // {
    //     object:obj,
    //     cond:{
    //         glue:'and',
    //         rules:[{
    //             key:'columnName',
    //             rule:'equals',
    //             value:'username'
    //         }]
    //     }
    // }
    if (lookup.cond) {
        
        lookup.object.queryFind({where:lookup.cond})
        .then((rows) => {

            // now pass these back to the next lookup:
            processLookup(list, cb, rows);

            // TODO: refactor to not use cb, but instead chain promises???
            return null;

        })
        .catch((err)=>{
            cb(err);
        })
        return;
    }


    // B) lookup based on previous data
    // lookup in format:
    // {
    //     obj:obj,
    //     field: 'fieldName for condition',  
    //     dataColumn: 'columnName for data'
    // }
    if (lookup.obj) {
        
        var values = data.map((d)=>{ return d[lookup.dataColumn]; });
        var cond = {
            glue:'and',
            rules:[{
                key:lookup.field,
                rule:'in',
                value:values
            }]
        }

        lookup.obj.queryFind({where:cond})
        .then((items) => {

            // now pass these back to the next lookup:
            processLookup(list, cb, items);
            return null;
        })
        .catch((err)=>{
            cb(err);
        })
        return;
    }


    // C) lookup from an intermediate lookup table
    // lookup in format:
    // {
    //     joinTable: currField.joinTableName(),
    //     field: connectedObj.name,
    //     dataColumn: connectedObj.PK()
    // }
    if (lookup.joinTable) {

        var values = data.map((d)=>{ return d[lookup.dataColumn]; });

        var linkTableQuery = ABMigration.connection().queryBuilder();
        linkTableQuery.select()
            .from(lookup.joinTable)
            .where(lookup.field, 'IN', values)
            .then((items)=>{

                // now pass these back to the next lookup:
                processLookup(list, cb, items);
                return null;
            })
            .catch((err) => {
                cb(err);
            })
        return;
    }



    //// Error:
    // if we get here, then lookup was not formed properly:
    var error = new Error('improperly formed lookup');
    error.data = { lookup: lookup }
    cb(error);

}









