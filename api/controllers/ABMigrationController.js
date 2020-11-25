/**
 * ABMigrationController
 *
 * @description :: Server-side logic for managing updating the table & column information
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var AD = require("ad-utils");
var _ = require("lodash");
var path = require("path");
var async = require("async");

var reloading = null;

module.exports = {
   /**
    * createObject
    *
    * post app_builder/migrate/object/:objID
    */
   createObject: function(req, res) {
      simpleObjectOperation(req, res, "createObject");
   },

   /**
    * dropObject
    *
    * delete app_builder/migrate/object/:objID
    */
   dropObject: function(req, res) {
      simpleObjectOperation(req, res, "dropObject");
   },

   /**
    * createField
    *
    * post app_builder/migrate/object/:objID/field/:fieldID
    */
   createField: function(req, res) {
      simpleFieldOperation(req, res, "createField");
   },

   /**
    * updateField
    *
    * put app_builder/migrate/object/:objID/field/:fieldID
    */
   updateField: function(req, res) {
      simpleFieldOperation(req, res, "updateField");
   },

   /**
    * dropField
    *
    * delete app_builder/migrate/object/:objID/field/:fieldID
    */
   dropField: function(req, res) {
      simpleFieldOperation(req, res, "dropField");
   },

   /**
    * createIndex
    *
    * post app_builder/migrate/object/:objID/index/:indexID
    */
   createIndex: function(req, res) {
      simpleIndexOperation(req, res, "createIndex");
   },

   /**
    * dropField
    *
    * delete app_builder/migrate/object/:objID/index/:indexID
    */
   dropIndex: function(req, res) {
      simpleIndexOperation(req, res, "dropIndex");
   }
};

// // Utility:
// function verifyAndReturnObject(req, res) {

//     return new Promise(
//         (resolve, reject) => {

//             var appID = req.param('appID', -1);
//             var objID = req.param('objID', -1);

//             sails.log.verbose('... appID:'+appID);
//             sails.log.verbose('... objID:'+objID);

//             // Verify input params are valid:
//             var invalidError = null;

//             if (appID == -1) {
//                 invalidError = ADCore.error.fromKey('E_MISSINGPARAM');
//                 invalidError.details = 'missing application.id';
//             } else if (objID == -1) {
//                 invalidError = ADCore.error.fromKey('E_MISSINGPARAM');
//                 invalidError.details = 'missing object.id';
//             }
//             if(invalidError) {
//                 sails.log.error(invalidError);
//                 res.AD.error(invalidError, 400);
//                 reject();
//             }

//             ABApplication.findOne({id: appID})
//             .then(function(app) {

//                 if( app ) {

//                     var Application = app.toABClass();
//                     var object = Application.objects((o) => { return o.id == objID; })[0];

//                     if (object) {

//                         resolve( object );

//                     } else {

//                         // error: object not found!
//                         var err = ADCore.error.fromKey('E_NOTFOUND');
//                         err.message = "Object not found.";
//                         err.objid = objID;
//                         sails.log.error(err);
//                         res.AD.error(err, 404);
//                         reject();
//                     }

//                 } else {

//                         // error: couldn't find the application
//                         var err = ADCore.error.fromKey('E_NOTFOUND');
//                         err.message = "Application not found.";
//                         err.appID = appID;
//                         sails.log.error(err);
//                         res.AD.error(err, 404);
//                         reject();
//                 }

//             })
//             .catch(function(err) {
//                 ADCore.error.log('ABApplication.findOne() failed:', { error:err, message:err.message, id:appID });
//                 res.AD.error(err);
//                 reject();
//             });

//         }
//     )

// }

function verifyAndReturnField(req, res) {
   return new Promise((resolve, reject) => {
      let objID = req.param("objID", -1);
      let object = ABObjectCache.get(objID);

      // AppBuilder.routes.verifyAndReturnObject(req, res)
      // ABGraphObject.findOne(objID)
      Promise.resolve()
         .then(() => {
            // if object already in the ABObjectCache, skip this step
            if (object) {
               sails.log.info("object returned form ABObjectCache");
               return;
            }

            // lookup the object information
            return AppBuilder.routes
               .verifyAndReturnObject(req, res)
               .then((obj) => {
                  object = obj;
               });
         })
         // .then(()=>{

         //     // if object already in the ABObjectCache, skip this step
         //     if (object) {
         //         return;
         //     }

         //     // lookup object if it isn't already in the cache:
         //     return new Promise((next, error) =>{

         //         var def = ABDefinitionModel.definitionForID(objID);
         //         if (def) {
         //             object = ABServerApp.objectNew(def);
         //             next();
         //             return;
         //         } else {
         //             ABDefinitionModel.find({id:objID})
         //             .then((list)=>{
         //                 if (list && list.length > 0) {
         //                     object = ABServerApp.objectNew(list[0].json);
         //                 }
         //                 next();
         //             })
         //             .catch(error);
         //         }
         //     });
         // })
         .then(function(objectData) {
            if (!object) {
               var missingObj = new Error("Missing Object");
               missingObj.objID = objID;
               console.log(`Error: Missing Object from id: ${objID}`);
               return reject(missingObj);
            }

            var fieldID = req.param("fieldID", -1);

            sails.log.verbose("... fieldID:" + fieldID);

            // Verify input params are valid:
            if (fieldID == -1) {
               var invalidError = ADCore.error.fromKey("E_MISSINGPARAM");
               invalidError.details = "missing field.id";
               sails.log.error(invalidError);
               res.AD.error(invalidError, 400);
               reject();
            }

            // find and return our field
            var field = object.fields((f) => {
               return f.id == fieldID;
            })[0];
            if (field) {
               resolve(field);
            } else {
               // error: field not found!
               var err = ADCore.error.fromKey("E_NOTFOUND");
               err.message = "Field not found.";
               err.fieldID = fieldID;
               sails.log.error(err);
               res.AD.error(err, 404);
               reject();
            }
         }, reject)
         .catch(reject);
   });
}

function simpleObjectOperation(req, res, operation) {
   res.set("content-type", "application/javascript");

   sails.log.info("ABMigrationConroller." + operation + "()");

   let objID = req.param("objID", -1);

   // NOTE: verifyAnd...() handles any errors and responses internally.
   // only need to responde to an object being passed back on .resolve()
   AppBuilder.routes
      .verifyAndReturnObject(req, res)
      // ABGraphObject.findOne(objID)
      .then(function(object) {
         // let object = objectData.toABClass();

         ABMigration[operation](object)
            .then(function() {
               res.AD.success({ good: "job" });
            })
            .catch(function(err) {
               ADCore.error.log("ABMigration" + operation + "() failed:", {
                  error: err,
                  object: object
               });
               res.AD.error(err, 500);
            });
      })
      .catch((err) => {
         console.log(err);
         // NOTE: verifyAndReturnObject() should already have handled the error
         // response.  So we don't need to do anything else here, but we
         // add the .catch() to prevent additional "unhandled" error messages.
      });
}

function simpleFieldOperation(req, res, operation) {
   res.set("content-type", "application/javascript");

   sails.log.info("ABMigrationConroller." + operation + "()");

   // NOTE: verifyAnd...() handles any errors and responses internally.
   // only need to respond to a field being passed back on .resolve()

   verifyAndReturnField(req, res)
      .then(function(field) {
         sails.log.info("  -> found field:", field);

         ABMigration[operation](field)
            .then(function() {
               // make sure this field's object's model cache is reset
               field.object.modelRefresh();

               res.AD.success({ good: "job" });
            })
            .catch(function(err) {
               // make sure this field's object's model cache is reset
               // even though it was an error, not sure just how far things
               // went.
               field.object.modelRefresh();

               ADCore.error.log("ABMigration." + operation + "() failed:", {
                  error: err,
                  field: field
               });
               res.AD.error(err, 500);
            });
      })
      .catch((err) => {
         console.log(err);
         // NOTE: verifyAndReturnField() should already have handled the error
         // response.  So we don't need to do anything else here, but we
         // add the .catch() to prevent additional "unhandled" error messages.
      });
}

function simpleIndexOperation(req, res, operation) {
   res.set("content-type", "application/javascript");

   sails.log.info("ABMigrationConroller." + operation + "()");

   let objID = req.param("objID", -1);
   let indexID = req.param("indexID", -1);
   if (!objID || !indexID) {
      res.AD.error("Bad parameters", 400);
      return;
   }

   // NOTE: verifyAnd...() handles any errors and responses internally.
   // only need to responde to an object being passed back on .resolve()

   AppBuilder.routes
      .verifyAndReturnObject(req, res)
      // ABGraphObject.findOne(objID)
      .then(
         (object) =>
            new Promise((next, err) => {
               // Now get our index
               let index = object.indexes((idx) => idx.id == indexID)[0];
               if (!index) {
                  let missingIndex = new Error("Missing Index");
                  missingIndex.objID = indexID;
                  console.log(`Error: Missing Index from id: ${indexID}`);
                  return err(missingIndex);
               }

               next(index);
            })
      )
      .then((index) =>
         ABMigration[operation](index).then(function() {
            res.AD.success({ good: "job" });
         })
      )
      .catch(function(err) {
         ADCore.error.log(`ABMigration.${operation}() failed:`, {
            error: err
         });
         res.AD.error(err, 500);
      });
}
