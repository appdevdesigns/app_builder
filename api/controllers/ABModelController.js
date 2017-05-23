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

var reloading = null;

module.exports = {

    
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
    
	
};