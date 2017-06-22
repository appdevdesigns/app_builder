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


var reloading = null;





module.exports = {

    create: function(req, res) {   


        AppBuilder.routes.verifyAndReturnObject(req, res)
        .then(function(object){


            var allParams = req.allParams();
            sails.log.verbose('ABModelController.create(): allParams:', allParams);

            // return the parameters from the input params that relate to this object
            var createParams = object.requestParams(allParams);  


            var validationErrors = object.isValidData(createParams);
            if (validationErrors.length == 0) {

                // this is a create operation, so ... 
                // createParams.created_at = (new Date()).toISOString();
                createParams.created_at = AppBuilder.rules.toSQLDateTime(new Date());

                sails.log.verbose('ABModelController.create(): createParams:', createParams);

                var query = object.model().query();

                query.insert(createParams)
                .then((newObj)=>{

                    res.AD.success(newObj);

                }, (err)=>{

                    // handle invalid values here:
                    if (err instanceof ValidationError) {

//// TODO: refactor these invalid data handlers to a common OP.Validation.toErrorResponse(err)

// return an invalid values response:
var errorResponse = {
    error:'E_VALIDATION',
    invalidAttributes:{

    }
}

var attr = errorResponse.invalidAttributes;

for(var e in err.data) {
    attr[e] = attr[e] || [];
    err.data[e].forEach((eObj)=>{
        eObj.name = e;
        attr[e].push(eObj);
    })
}

                        res.AD.error(errorResponse);
                    }

                })
                .catch((err)=>{
console.log('... catch(err) !');

                    if (!(err instanceof ValidationError)) {
                        ADCore.error.log('Error performing update!', {error:err})
                        res.AD.error(err);
                        sails.log.error('!!!! error:', err);
                    }
                })



            } else {

                // return an invalid values response:
                var errorResponse = {
                    error:'E_VALIDATION',
                    invalidAttributes:{

                    }
                }

                var attr = errorResponse.invalidAttributes;

                validationErrors.forEach((e)=>{
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
    find: function(req, res) {


        AppBuilder.routes.verifyAndReturnObject(req, res)
        .then(function(object){

            var query = object.model().query();


/// IMPLEMENT .where()  here
            var where = req.options._where;

            var result = {};

            // 
            if (!_.isEmpty(where)) {
                var whereObj = {};
                var index = 0;
                where.forEach(function (w) {
                    // We need to put back together our sql statment
                    switch(w.operator) {
                        case "contains":
                            var operator = "LIKE";
                            var input = "%"+w.inputValue+"%";
                            break;
                        case "doesn't contain":
                            var operator = "NOT LIKE";
                            var input = "%"+w.inputValue+"%";
                            break;
                        case "is not":
                            var operator = "!=";
                            var input = w.inputValue;
                            break
                        case "is before":
                            var operator = "<";
                            var input = w.inputValue;
                            break;
                        case "is after":
                            var operator = ">";
                            var input = w.inputValue;
                            break;
                        case "is on or before":
                            var operator = "<=";
                            var input = w.inputValue;
                            break;
                        case "is on or after":
                            var operator = ">=";
                            var input = w.inputValue;
                            break;
                        case ":":
                            var operator = "=";
                            var input = w.inputValue;
                            break;
                        case "≠":
                            var operator = "!=";
                            var input = w.inputValue;
                            break;
                        case "<":
                            var operator = "<";
                            var input = w.inputValue;
                            break;
                        case ">":
                            var operator = ">";
                            var input = w.inputValue;
                            break;
                        case "≤":
                            var operator = "<=";
                            var input = w.inputValue;
                            break;
                        case "≥":
                            var operator = ">=";
                            var input = w.inputValue;
                            break;
                        case "equals":
                            var operator = "=";
                            var input = w.inputValue;
                            break;
                        case "does not equal":
                            var operator = "!=";
                            var input = w.inputValue;
                            break;
                        case "is checked":
                            var operator = "=";
                            var input = w.inputValue;
                            break;
                        case "is not checked":
                            var operator = "=";
                            var input = w.inputValue;
                            break;
                        default:
                            var operator = "=";
                            var input = w.inputValue;
                    }
                    // if we are searching a multilingual field it is stored in translations so we need to search JSON
                    if (w.isMultiLingual == 1) {
                        fieldName = 'JSON_UNQUOTE(JSON_EXTRACT(JSON_EXTRACT(translations, SUBSTRING(JSON_UNQUOTE(JSON_SEARCH(translations, "one", "' + w.languageCode + '")), 1, 4)), "$.' + w.fieldName + '"))';
                    } else { // If we are just searching a field it is much simpler
                        fieldName = w.fieldName;
                    }
                    // We are going to use the 'raw' queries for knex becuase the '.' for JSON searching is misinterpreted as a sql identifier
                    var where = fieldName + " " + operator + " '" + input + "'";
                    // Now we add in all of our where statements
                    if (index == 0) {
                        query.whereRaw(where);
                    } else if (w.combineCondtion == "Or") {
                        query.orWhereRaw(where);
                    } else {
                        // the default whereRaw will provide an "AND" if there is already one present
                        query.whereRaw(where);                        
                    }
                    index++;
                })
            }
            
            // promise for the total count. this was moved below the filters because webix will get caught in an infinte loop of queries if you don't pass the right count
            var pCount = query.clone().count('* as count').first(); 

            var offset = req.options._offset;
            var limit = req.options._limit;

            // apply any offset/limit if provided.
            if (offset) {
                query.offset(offset);
            }
            if (limit) {
                query.limit(limit);
            }            
            
            // query relation data
            var linkedFieldNames = object.fields((f) => { return f.key == 'connectObject'; }).map((f) => { return f.columnName; });
            if (linkedFieldNames.length > 0)
                query.eager('[#fieldNames#]'.replace('#fieldNames#', linkedFieldNames.join(', ')));
                
                console.log(query.toString());
                console.log("check that out");

            Promise.all([
              pCount,
              query
            ]).then(function(values) {
                var count = values[0].count;
                var rows = values[1];
                result.data = rows;

                // webix pagination format:
                result.total_count = count;
                result.pos = offset;

                result.offset = offset;
                result.limit = limit;
                
                if ((offset + rows.length) < count) {
                    result.offset_next = offset+limit;
                }



//// TODO: evaluate if we really need to do this: 
//// ?) do we have a data field that actually needs to post process it's data
////    before returning it to the client?

                // object.postGet(result.data)
                // .then(()=>{


                    if(res.header) res.header('Content-type', 'application/json');
                    
                    res.send(result, 200);


                // })

                
            })
            .catch((err)=>{

                res.AD.error(err);

            });


        });

    },


    delete: function(req, res) {

        var id = req.param('id', -1);


        if (id == -1) {
            var invalidError = ADCore.error.fromKey('E_MISSINGPARAM');
            invalidError.details = 'missing .id';
            sails.log.error(invalidError);
            res.AD.error(invalidError, 400);
            return;
        }

        AppBuilder.routes.verifyAndReturnObject(req, res)
        .then(function(object){


                object.model().query()
                .deleteById(id)
                .then((numRows)=>{

                    res.AD.success({numRows:numRows});

                }, (err)=>{

// console.log('...  (err) handler!', err);

                    res.AD.error(err);
                    

                })
                .catch((err)=>{
// console.log('... catch(err) !');

                    if (!(err instanceof ValidationError)) {
                        ADCore.error.log('Error performing update!', {error:err})
                        res.AD.error(err);
                        sails.log.error('!!!! error:', err);
                    }
                })

        })

    },


    update: function(req, res) {

        var id = req.param('id', -1);


        if (id == -1) {
            var invalidError = ADCore.error.fromKey('E_MISSINGPARAM');
            invalidError.details = 'missing .id';
            sails.log.error(invalidError);
            res.AD.error(invalidError, 400);
            return;
        }

        AppBuilder.routes.verifyAndReturnObject(req, res)
        .then(function(object){


            var allParams = req.allParams();
            sails.log.verbose('ABModelController.update(): allParams:', allParams);

            // return the parameters from the input params that relate to this object
            var updateParams = object.requestParams(allParams);  


            var validationErrors = object.isValidData(updateParams);
            if (validationErrors.length == 0) {

                // this is an update operation, so ... 
                // updateParams.updated_at = (new Date()).toISOString();
                updateParams.updated_at = AppBuilder.rules.toSQLDateTime(new Date());

                sails.log.verbose('ABModelController.update(): updateParams:', updateParams);

                var query = object.model().query();
                query.patch(updateParams)
                .where('id', id)
                .then((numRows)=>{

                    res.AD.success({numRows:numRows});

                }, (err)=>{

console.log('...  (err) handler!', err);

                    // handle invalid values here:
                    if (err instanceof ValidationError) {

//// TODO: refactor these invalid data handlers to a common OP.Validation.toErrorResponse(err)

// return an invalid values response:
var errorResponse = {
    error:'E_VALIDATION',
    invalidAttributes:{

    }
}

var attr = errorResponse.invalidAttributes;

for(var e in err.data) {
    attr[e] = attr[e] || [];
    err.data[e].forEach((eObj)=>{
        eObj.name = e;
        attr[e].push(eObj);
    })
}

                        res.AD.error(errorResponse);
                    }

                })
                .catch((err)=>{
console.log('... catch(err) !');

                    if (!(err instanceof ValidationError)) {
                        ADCore.error.log('Error performing update!', {error:err})
                        res.AD.error(err);
                        sails.log.error('!!!! error:', err);
                    }
                })



            } else {

                // return an invalid values response:
                var errorResponse = {
                    error:'E_VALIDATION',
                    invalidAttributes:{

                    }
                }

                var attr = errorResponse.invalidAttributes;

                validationErrors.forEach((e)=>{
                    attr[e.name] = attr[e.name] || [];
                    attr[e.name].push(e);
                })

                res.AD.error(errorResponse);
            }
            
        })

    }
    
	
};