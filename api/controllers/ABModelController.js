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
sails.log.error('!!!! TODO: create() ');
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


            var result = {};
            var offset = req.options._offset;
            var limit = req.options._limit;

            // promise for the total count.
            var pCount = query.clone().count('* as count').first();
            
            // apply any offset/limit if provided.
            if (offset) {
                query.offset(offset);
            }
            if (limit) {
                query.limit(limit);
            }

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
sails.log.error('!!!! TODO: delete() ');
    },


    update: function(req, res) {

        var id = req.param('id', -1);
console.log('... id:', id);

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


            var validationErrors = object.isValidParams(updateParams);
            if (validationErrors.length == 0) {

                // this is an update operation, so ... 
                updateParams.updated_at = (new Date()).toISOString();

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

                        res.AD.error(err);
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

//// LEFT OFF HERE:
// pull out known fields.
// save them in the table.
// finished.


    }
    
	
};