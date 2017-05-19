/**
 * ABMigrationController
 *
 * @description :: Server-side logic for managing updating the table & column information 
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var AD = require('ad-utils');
var _ = require('lodash');
var path = require('path');
var async = require('async');


var reloading = null;

module.exports = {

    
    /**
     * createObject
     *
     * post app_builder/migrate/application/:appID/object/:objID
     */
    createObject: function(req, res) {
        res.set('content-type', 'application/javascript');
        
        sails.log.info('ABMigrationConroller.createObject()');

        // NOTE: verifyAnd...() handles any errors and responses internally.
        // only need to responde to an object being passed back on .resolve()
        verifyAndReturnObject(req, res)
        .then(function(object){

            ABMigration.createObject(object)
            .then(function(){

                res.AD.success({good:'job'});

            })
            .catch(function(err){
                ADCore.error.log('ABMigration.createObject() failed:', { error:err, object:object });
                res.AD.error(err, 500);
            })

        })
        
    },
    

    /**
     * dropObject
     *
     * delete app_builder/migrate/application/:appID/object/:objID
     */
    dropObject: function(req, res) {
        res.set('content-type', 'application/javascript');
        
        sails.log.info('ABMigrationConroller.dropObject()');

        // NOTE: verifyAnd...() handles any errors and responses internally.
        // only need to responde to an object being passed back on .resolve()
        verifyAndReturnObject(req, res)
        .then(function(object){

            ABMigration.dropObject(object)
            .then(function(){

                res.AD.success({good:'bye'});

            })
            .catch(function(err){
                ADCore.error.log('ABMigration.dropObject() failed:', { error:err, object:object });
                res.AD.error(err, 500);
            })
            
        })
        
    },




    /**
     * createField
     *
     * post app_builder/migrate/application/:appID/object/:objID/field/:fieldID
     */
    createField: function(req, res) {
        res.set('content-type', 'application/javascript');
        
        sails.log.info('ABMigrationConroller.createField()');

        // NOTE: verifyAnd...() handles any errors and responses internally.
        // only need to respond to a field being passed back on .resolve()
        verifyAndReturnField(req, res)
        .then(function(field){

            ABMigration.createField(field)
            .then(function(){

                res.AD.success({good:'job'});

            })
            .catch(function(err){
                ADCore.error.log('ABMigration.createField() failed:', { error:err, field:field });
                res.AD.error(err, 500);
            })

        })

    },




    /**
     * dropField
     *
     * delete app_builder/migrate/application/:appID/object/:objID/field/:fieldID
     */
    dropField: function(req, res) {
        res.set('content-type', 'application/javascript');
        
        sails.log.info('ABMigrationConroller.dropField()');

        // NOTE: verifyAnd...() handles any errors and responses internally.
        // only need to respond to a field being passed back on .resolve()
        verifyAndReturnField(req, res)
        .then(function(field){

            ABMigration.dropField(field)
            .then(function(){

                res.AD.success({ good:'job'});

            })
            .catch(function(err){
                ADCore.error.log('ABMigration.dropField() failed:', { error:err, field:field });
                res.AD.error(err, 500);
            })

        })
        
    },
	
};



// Utility:
function verifyAndReturnObject(req, res) {

    return new Promise(
        (resolve, reject) => {

            var appID = req.param('appID', -1);
            var objID = req.param('objID', -1);

            sails.log.verbose('... appID:'+appID);
            sails.log.verbose('... objID:'+objID);

            // Verify input params are valid:
            var invalidError = null;

            if (appID == -1) {
                invalidError = ADCore.error.fromKey('E_MISSINGPARAM');
                invalidError.details = 'missing application.id';
            } else if (objID == -1) {
                invalidError = ADCore.error.fromKey('E_MISSINGPARAM');
                invalidError.details = 'missing object.id';
            }
            if(invalidError) {
                sails.log.error(invalidError);
                res.AD.error(invalidError, 400);
                reject();
            }
            

            ABApplication.findOne({id: appID})
            .then(function(app) {

                if( app ) {

                    var Application = app.toABClass();
                    var object = Application.objects((o) => { return o.id == objID; })[0];

                    if (object) {

                        resolve( object );

                    } else {

                        // error: object not found!
                        var err = ADCore.error.fromKey('E_NOTFOUND');
                        err.message = "Object not found.";
                        err.objid = objID;
                        sails.log.error(err);
                        res.AD.error(err, 404);
                        reject();
                    }

                } else {

                        // error: couldn't find the application
                        var err = ADCore.error.fromKey('E_NOTFOUND');
                        err.message = "Application not found.";
                        err.appID = appID;
                        sails.log.error(err);
                        res.AD.error(err, 404);
                        reject();
                }

            })
            .catch(function(err) {
                ADCore.error.log('ABApplication.findOne() failed:', { error:err, message:err.message, id:appID });
                res.AD.error(err);
                reject();
            });

        }
    )

}


function verifyAndReturnField(req, res) {

    return new Promise(
        (resolve, reject) => {

            verifyAndReturnObject(req, res)
            .then(function(object){


                var fieldID = req.param('fieldID', -1);

                sails.log.verbose('... fieldID:'+fieldID);

                // Verify input params are valid:
                if (fieldID == -1) {
                    var invalidError = ADCore.error.fromKey('E_MISSINGPARAM');
                    invalidError.details = 'missing field.id';
                    sails.log.error(invalidError);
                    res.AD.error(invalidError, 400);
                    reject();
                } 


                // find and return our field
                var field = object.fields((f) => { return f.id == fieldID; })[0];
                if (field) {

                    resolve( field );

                } else {

                    // error: field not found!
                    var err = ADCore.error.fromKey('E_NOTFOUND');
                    err.message = "Field not found.";
                    err.fieldID = fieldID;
                    sails.log.error(err);
                    res.AD.error(err, 404);
                    reject();
                }


            }, reject)
            .catch(reject);

        }
    )

}


