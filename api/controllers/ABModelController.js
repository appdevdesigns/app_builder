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

            var Model = object.model();
console.log('... jsonSchema:', Model.jsonSchema);

console.log('... jsonSchema.translations:', Model.jsonSchema.properties.translations )

for(var t in Model.jsonSchema.properties.translations.items) {
    console.log('... '+t+': ', Model.jsonSchema.properties.translations.items[t]);
}

            Model.query()
            .then((objects) => {
console.log('... .findAll(): objects:', objects);

//// LEFT OFF:
// why is my translations not being converted into an OBJECT automatically?
// - add post processing to convert JSON
// - add paging
// - client side ABObject.model() to return an object with .findAll() to access this route
// - pass in filter to findAll()
//      -> { where:{}, skip:xx, pagingParamX:yy }


                res.AD.success(objects);
            })



        });

    },
    
	
};