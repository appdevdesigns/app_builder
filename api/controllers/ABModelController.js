/**
 * ABModelController
 *
 * @description :: Server-side logic for managing the data related to a given Object
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var AD = require("ad-utils");
var _ = require("lodash");
var path = require("path");
var async = require("async");
var cJSON = require("circular-json");
var uuid = require("uuid/v4");

const ValidationError = require("objection").ValidationError;
const { ref, raw } = require("objection");

var reloading = null;

var countPendingTransactions = 0;
var countResolvedTransactions = 0;

setInterval(() => {
   if (countResolvedTransactions > 0) {
      var countRemaining = countPendingTransactions - countResolvedTransactions;
      sails.log(
         `::: ${countResolvedTransactions} processed in last second. ${countRemaining} Transactions still in Process. `
      );
   }
   countPendingTransactions =
      countPendingTransactions - countResolvedTransactions;
   if (countPendingTransactions < 0) countPendingTransactions = 0;
   countResolvedTransactions = 0;
}, 1000);

function newPendingTransaction() {
   countPendingTransactions += 1;
}

function resolvePendingTransaction() {
   countResolvedTransactions += 1;
   if (countResolvedTransactions > countPendingTransactions) {
      countPendingTransactions = countResolvedTransactions;
   }
}

/**
 * @functon cleanUp
 * clean up data before response to clients
 *
 * @param {ABObject} - object
 * @param {Object|Array} - data
 */
function cleanUp(object, data) {
   if (data == null) return null;

   if (object.PK() === "uuid") {
      // array
      if (data.forEach) {
         data.forEach((d) => {
            delete d.id;
         });
      }
      // object
      else {
         delete data.id;
      }
   }

   return data;
}

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

   ////
   //// We are given a current state of values that should be related to our object.
   //// It is not clear if these are new relations or existing ones, so we first
   //// remove any existing relation and then go back and add in the one we have been
   //// told to keep.
   ////

   // NOTE : There is a error when update values and foreign keys at same time
   // - Error: Double call to a write method. You can only call one of the write methods
   // - (insert, update, patch, delete, relate, unrelate, increment, decrement) and only once per query builder
   if (
      updateRelationParams != null &&
      Object.keys(updateRelationParams).length > 0
   ) {
      let clearRelate = (obj, columnName, rowId) => {
         return new Promise((resolve, reject) => {
            // WORKAROUND : HRIS tables have non null columns
            if (obj.isExternal) return resolve();

            // create a new query to update relation data
            // NOTE: when use same query, it will have a "created duplicate" error
            let query = obj.model().query();

            let clearRelationName = AppBuilder.rules.toFieldRelationFormat(
               columnName
            );

            query
               .where(obj.PK(), rowId)
               .first()
               .catch((err) => reject(err))
               .then((record) => {
                  if (record == null) return resolve();

                  let fieldLink = obj.fields(
                     (f) => f.columnName == columnName
                  )[0];
                  if (fieldLink == null) return resolve();

                  let objectLink = fieldLink.object;
                  if (objectLink == null) return resolve();

                  record
                     .$relatedQuery(clearRelationName)
                     .alias(
                        "#column#_#relation#"
                           .replace("#column#", columnName)
                           .replace("#relation#", clearRelationName)
                     ) // FIX: SQL syntax error because alias name includes special characters
                     .unrelate()
                     .catch((err) => reject(err))
                     .then(() => {
                        resolve();
                     });
               });
         });
      };

      let setRelate = (obj, columnName, rowId, value) => {
         return new Promise((resolve, reject) => {
            // create a new query to update relation data
            // NOTE: when use same query, it will have a "created duplicate" error
            let query = obj.model().query();

            let relationName = AppBuilder.rules.toFieldRelationFormat(
               columnName
            );

            query
               .where(obj.PK(), rowId)
               .first()
               .catch((err) => reject(err))
               .then((record) => {
                  if (record == null) return resolve();

                  record
                     .$relatedQuery(relationName)
                     .alias(
                        "#column#_#relation#"
                           .replace("#column#", columnName)
                           .replace("#relation#", relationName)
                     ) // FIX: SQL syntax error because alias name includes special characters
                     .relate(value)
                     .catch((err) => reject(err))
                     .then(() => {
                        resolve();
                     });
               });
         });
      };

      // update relative values
      Object.keys(updateRelationParams).forEach((colName) => {
         // SPECIAL CASE: 1-to-1 relation self join,
         // Need to update linked data
         let field = object.fields((f) => f.columnName == colName)[0];
         if (
            field &&
            field.settings.linkObject == object.id &&
            field.settings.linkType == "one" &&
            field.settings.linkViaType == "one" &&
            !object.isExternal
         ) {
            let sourceField = field.settings.isSource ? field : field.fieldLink;
            if (sourceField == null) return resolve();

            let relateRowId = null;
            if (updateRelationParams[colName])
               // convert to int
               relateRowId = parseInt(updateRelationParams[colName]);

            // clear linked data
            updateTasks.push(() => {
               return new Promise((resolve, reject) => {
                  let update = {};
                  update[sourceField.columnName] = null;

                  let query = object.model().query();
                  query
                     .update(update)
                     .clearWhere()
                     .where(object.PK(), id)
                     .orWhere(object.PK(), relateRowId)
                     .orWhere(sourceField.columnName, id)
                     .orWhere(sourceField.columnName, relateRowId)
                     .catch((err) => reject(err))
                     .then(() => {
                        resolve();
                     });
               });
            });

            // set linked data
            if (updateRelationParams[colName]) {
               updateTasks.push(() => {
                  return new Promise((resolve, reject) => {
                     let update = {};
                     update[sourceField.columnName] = relateRowId;

                     let query = object.model().query();
                     query
                        .update(update)
                        .clearWhere()
                        .where(object.PK(), id)
                        .catch((err) => reject(err))
                        .then(() => {
                           resolve();
                        });
                  });
               });

               updateTasks.push(() => {
                  return new Promise((resolve, reject) => {
                     let update = {};
                     update[sourceField.columnName] = id;

                     let query = object.model().query();
                     query
                        .update(update)
                        .clearWhere()
                        .where(object.PK(), relateRowId)
                        .catch((err) => reject(err))
                        .then(() => {
                           resolve();
                        });
                  });
               });
            }
         }

         // Normal relations
         else {
            let needToClear = true;

            // If link column is in the table, then will not need to clear connect data
            if (
               updateRelationParams[colName] &&
               field &&
               field.settings &&
               // 1:M
               ((field.settings.linkType == "one" &&
                  field.settings.linkViaType == "many") ||
                  // 1:1 isSource = true
                  (field.settings.linkType == "one" &&
                     field.settings.linkViaType == "one" &&
                     field.settings.isSource))
            ) {
               needToClear = false;
            }

            // Clear relations
            if (needToClear) {
               updateTasks.push(() => clearRelate(object, colName, id));
            }

            // convert relation data to array
            if (!Array.isArray(updateRelationParams[colName])) {
               updateRelationParams[colName] = [updateRelationParams[colName]];
            }

            // We could not insert many relation values at same time
            // NOTE : Error: batch insert only works with Postgresql
            updateRelationParams[colName].forEach((val) => {
               // insert relation values of relation
               updateTasks.push(() => {
                  return setRelate(object, colName, id, val);
               });
            });
         }
      });
   }

   return updateTasks;
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
   connectFields.forEach((f) => {
      // Get the field object that the field is linked to
      var field = f.fieldLink;
      if (!field) {
         var err = new Error(
            `ABModelController.updateConnectedFields(): object[${object.name}][${object.id}] had connected field[${f.label}][${f.id}] with no linked field reference`
         );
         sails.log.error(err);
         sails.log.error("object:", object);
         sails.log.error("field:", f);
         return;
      }

      // Get the relation name so we can separate the linked fields updates from the rest
      var relationName = f.relationName();
      if (Array.isArray(newData)) {
         newData[relationName] = [];
         newData.forEach((n) => {
            newData[relationName] = newData[relationName].concat(
               n[relationName]
            );
         });
      }
      // Get all the values of the linked field from the save
      var newItems = newData ? newData[relationName] : [];
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

      if (field) {
         // filter array to only show unique items
         items = _.uniqBy(items, field.object.PK());
         // parse through all items and broadcast a "stale" action so we can tell the client side the data may have updated
         items.forEach((i) => {
            // Make sure you put the payload together just like before
            var payload = {
               objectId: field.object.id, // get the fields object id
               data: i // pass the whole item
            };
            // Broadcast the payload and let the clientside figure out what to do next
            sails.sockets.broadcast(
               field.object.id,
               "ab.datacollection.stale",
               payload
            );
         });
      }
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
   if (!object.isExternal || !object.isImported) return Promise.resolve();

   let transModel = object.model().relationMappings()["translations"];
   if (!transModel) return Promise.resolve();

   let tasks = [],
      transTableName = transModel.modelClass.tableName;
   multilingualFields = object.fields((f) => f.settings.supportMultilingual);

   (translations || []).forEach((trans) => {
      tasks.push(
         new Promise((next, err) => {
            let transKnex = ABMigration.connection()(transTableName);

            // values
            let vals = {};
            vals[object.transColumnName] = id;
            vals["language_code"] = trans["language_code"];

            multilingualFields.forEach((f) => {
               vals[f.columnName] = trans[f.columnName];
            });

            // where clause
            let where = {};
            where[object.transColumnName] = id;
            where["language_code"] = trans["language_code"];

            // insert
            if (isInsert) {
               transKnex
                  .insert(vals)
                  .catch(err)
                  .then(function() {
                     next();
                  });
            }
            // update
            else {
               Promise.resolve()
                  .then(() => {
                     // NOTE: There is a bug to update TEXT column of federated table
                     // https://bugs.mysql.com/bug.php?id=63446
                     // WORKAROUND: first update the cell to NULL and then update it again
                     return new Promise((resolve, reject) => {
                        var longTextFields = multilingualFields.filter(
                           (f) => f.key == "LongText"
                        );
                        if (longTextFields.length < 1) return resolve();

                        var clearVals = {};

                        longTextFields.forEach((f) => {
                           clearVals[f.columnName] = null;
                        });

                        transKnex
                           .update(clearVals)
                           .where(where)
                           .catch(reject)
                           .then(resolve);
                     });
                  })
                  .then(() => {
                     return new Promise((resolve, reject) => {
                        transKnex
                           .update(vals)
                           .where(where)
                           .catch(reject)
                           .then(resolve);
                     });
                  })
                  .then(next)
                  .catch(err);
            }
         })
      );
   });

   return Promise.all(tasks);
}

module.exports = {
   batchCreate: function(req, res) {
      var allParams = req.allParams();
      sails.log.verbose(
         "ABModelController.batchCreate(): allParams:",
         allParams
      );

      let result = {};

      // log error into a variable
      let errorRows = {};
      let onError = (rowIndex, error) => {
         errorRows[rowIndex] = error;
      };

      var batch = allParams.batch;
      var batchCreate = [];
      if (batch && Array.isArray(batch)) {
         batch.forEach((newRecord) => {
            batchCreate.push(
               new Promise((resolve, reject) => {
                  this.create(
                     req,
                     null,
                     null,
                     newRecord.data,
                     (newRow) => {
                        result[newRecord.id] = newRow;
                        resolve(newRow);
                     },
                     (errorResponse) => {
                        onError(newRecord.id, errorResponse);
                        resolve();
                     }
                  );
               })
            );
         });
         Promise.all(batchCreate)
            // .catch((error) => {
            //    res.AD.error(error);
            // })
            .then((data) => {
               res.AD.success({
                  data: result,
                  errors: errorRows // Return error messages of each rows
               });
            });
      }
   },

   create: function(req, res, callbacks, batchRecord, resolve, reject) {
      newPendingTransaction();
      var allParams;
      if (batchRecord) {
         allParams = batchRecord;
      } else {
         allParams = req.allParams();
      }
      sails.log.verbose("ABModelController.create(): allParams:", allParams);

      var createParams; // used in several process steps below:
      var object; // the ABObject to use for this operation
      var newItem; // the new entry that is created in the DB
      var validationErrors; // any errors found by object.isValid(createParams)
      var errorQueryInsertThen = false;
      // flag for errors that are reported during the query.find(success(), err())
      var errorQueryInsertCatch = false;
      // flag for errors that are reported during the query.find().catch(err);

      async.series(
         [
            ////
            //// Step 1:  Process and prepare the incoming data
            ////
            (next) => {
               AppBuilder.routes
                  .verifyAndReturnObject(req, res)
                  .then(function(foundObject) {
                     object = foundObject;

                     var initialUUID = allParams.uuid;

                     // return the parameters from the input params that relate to this object
                     createParams = object.requestParams(allParams);

                     // 21 May 2019 : Johnny
                     // object.requestParams() will not return UUID by default.
                     // however, since a mobile client can pass that in, we need to make
                     // sure it is included in our data:
                     if (initialUUID) {
                        createParams.uuid = initialUUID;
                     }

                     // TODO:: this logic should be in the ABField...js
                     object.fields().forEach((e) => {
                        if (
                           e.key == "string" &&
                           e.settings.default.indexOf("{uuid}") >= 0 &&
                           typeof createParams[e.columnName] == "undefined"
                        ) {
                           createParams[e.columnName] = uuid();
                        } else if (
                           e.key == "user" &&
                           e.settings.isCurrentUser == 1 &&
                           typeof createParams[e.columnName] == "undefined"
                        ) {
                           createParams[e.columnName] = req.user.data.username;
                        }
                     });

                     // add UUID of a new row
                     createParams = cleanUp(object, createParams);

                     // 21 May '19 : Johnny : mobile devices will initiate .create()
                     // operations with uuid already set.  We can't overwrite them
                     // here:
                     if (object.PK() === "uuid" && !createParams["uuid"])
                        createParams.uuid = uuid();

                     validationErrors = object.isValidData(createParams);
                     if (validationErrors.length == 0) {
                        // this is a create operation, so ...
                        // createParams.created_at = (new Date()).toISOString();
                        if (!object.isExternal && !object.isImported) {
                           createParams.created_at = AppBuilder.rules.toSQLDateTime(
                              new Date()
                           );
                        }

                        sails.log.verbose(
                           "ABModelController.create(): createParams:",
                           createParams
                        );
                        next();
                     } else {
                        var error = new Error("E_VALIDATION");
                        error.code = "E_VALIDATION";
                        next(error);
                     }
                  })
                  .catch(next);
            },

            ////
            //// Step 2:  Process any beforeCreate() lifecycle handlers
            ////
            (next) => {
               var key = `${object.id}.beforeCreate`;
               ABModelLifecycle.process(key, createParams, next);
            },

            ////
            //// Step 3:  Perform the operation
            ////
            (next) => {
               var query = object.model().query();

               query
                  .insert(createParams)
                  .then(
                     (newObj) => {
                        let rowId = newObj[object.PK()];

                        // track logging
                        ABTrack.logInsert({
                           objectId: object.id,
                           rowId,
                           username: req.user.data.username,
                           data: createParams
                        });

                        // return the parameters of connectObject data field values
                        var updateRelationParams = object.requestRelationParams(
                           allParams
                        );
                        var updateTasks = updateRelationValues(
                           object,
                           rowId,
                           updateRelationParams
                        );

                        // update translation of the external object
                        if (
                           (object.isExternal || object.isImported) &&
                           createParams.translations
                        )
                           updateTasks.push(
                              updateTranslationsValues(
                                 object,
                                 newObj[object.PK()],
                                 createParams.translations,
                                 true
                              )
                           );

                        // update relation values sequentially
                        return updateTasks
                           .reduce((promiseChain, currTask) => {
                              return promiseChain.then(currTask);
                           }, Promise.resolve([]))
                           .catch((err) => {
                              return Promise.reject(err);
                           })
                           .then((values) => {
                              // // Query the new row to response to client
                              return object
                                 .queryFind(
                                    {
                                       where: {
                                          glue: "and",
                                          rules: [
                                             {
                                                key: object.PK(),
                                                rule: "equals",
                                                value: newObj[object.PK()] || ""
                                             }
                                          ]
                                       },
                                       offset: 0,
                                       limit: 1,
                                       populate: true
                                    },
                                    req.user.data
                                 )
                                 .then((itemLookup) => {
                                    newItem = itemLookup[0];
                                    next(null, newItem);
                                 });
                           });
                     },
                     (err) => {
                        errorQueryInsertThen = true;
                        next(err);
                        // handle invalid values here:
                     }
                  )
                  .catch((err) => {
                     errorQueryInsertCatch = true;
                     next(err);
                  });
            },

            ////
            //// Step 4:  Process any afterCreate() lifecycle handlers
            ////
            (next) => {
               var key = `${object.id}.added`;
               ABProcess.trigger(key, newItem)
                  .then(() => {
                     next();
                  })
                  .catch(next);
            },

            ////
            //// Step 4b:  (old Method) Process any afterCreate() lifecycle handlers
            ////
            (next) => {
               var key = `${object.id}.afterCreate`;
               ABModelLifecycle.process(key, newItem, next);
            }
         ],
         (err, data) => {
            // final:  format and prepare a response

            // if this is an Error:
            if (err) {
               console.error(err);
               //// Object discovered validation errors:

               // return an invalid values response:
               var errorResponse = {
                  error: "E_VALIDATION",
                  invalidAttributes: {}
               };

               var attr = errorResponse.invalidAttributes;

               // if error from object.isValidData(createParams)
               if (validationErrors && validationErrors.length > 0) {
                  validationErrors.forEach((e) => {
                     attr[e.name] = attr[e.name] || [];
                     attr[e.name].push(e);
                  });
               } else if (errorQueryInsertThen) {
                  // if error from the query.insert.then()

                  if (err instanceof ValidationError) {
                     for (var e in err.data) {
                        attr[e] = attr[e] || [];
                        err.data[e].forEach((eObj) => {
                           eObj.name = e;
                           attr[e].push(eObj);
                        });
                     }
                  } else {
                     // probably a result from our sql operation:
                     // scan error messages and fill out our errorResponse:

                     // WORKAROUND : Get invalid field
                     var invalidFields = object.fields(
                        (f) =>
                           (err.sqlMessage || "")
                              .toLowerCase()
                              .indexOf((f.columnName || "").toLowerCase()) > -1
                     );
                     invalidFields.forEach((f) => {
                        let errorMessage;

                        switch (err.code) {
                           case "ER_DUP_ENTRY":
                              errorMessage =
                                 "The value is a duplicate value and therefore, not valid.";
                              break;
                           default:
                              errorMessage = err.sqlMessage;
                              break;
                        }

                        errorResponse.invalidAttributes[f.columnName] = [
                           {
                              message: errorMessage
                           }
                        ];
                     });
                  }
               } else if (errorQueryInsertCatch) {
                  // something threw an error:
                  // if (!(err instanceof ValidationError)) {
                  ADCore.error.log("Error performing object.create()!", {
                     error: err,
                     data: createParams,
                     object: object.name
                  });
                  errorResponse = err;
                  // }
               } else if (err.code == "E_OBJLIFECYCLE") {
                  // if there was a complaint due to an object lifecycle task,
                  // we return that error here.
                  errorResponse = err;
               }

               // now send the error message:
               resolvePendingTransaction();
               if (res) {
                  res.AD.error(errorResponse);
               } else {
                  reject(errorResponse);
               }
               return;
            }

            // We want to broadcast the change from the server to the client so all datacollections can properly update
            // Build a payload that tells us what was updated
            var payload = {
               objectId: object.id,
               data: newItem
            };

            // Broadcast the create
            sails.sockets.broadcast(
               object.id,
               "ab.datacollection.create",
               payload
            );

            // return a Successful operation:
            resolvePendingTransaction();
            if (res) {
               updateConnectedFields(object, newItem);
               res.AD.success(newItem);
            } else {
               resolve(newItem);
            }
         }
      );

      /*
        newPendingTransaction();
        AppBuilder.routes.verifyAndReturnObject(req, res)
            .then(function (object) {


                var allParams = req.allParams();
                sails.log.verbose('ABModelController.create(): allParams:', allParams);

                var initialUUID = allParams.uuid;

                // return the parameters from the input params that relate to this object
                var createParams = object.requestParams(allParams);

                // 21 May 2019 : Johnny
                // object.requestParams() will not return UUID by default.
                // however, since a mobile client can pass that in, we need to make
                // sure it is included in our data:
                if (initialUUID) {
                    createParams.uuid = initialUUID;
                }

                // return the parameters of connectObject data field values 
                var updateRelationParams = object.requestRelationParams(allParams);

                // TODO:: this logic should be in the ABField...js 
                object.fields().forEach((e) => {
                    if (e.key == "string" && e.settings.default.indexOf("{uuid}") >= 0 && typeof createParams[e.columnName] == "undefined") {
                        createParams[e.columnName] = uuid();
                    } else if (e.key == "user" && e.settings.isCurrentUser == 1 && typeof createParams[e.columnName] == "undefined") {
                        createParams[e.columnName] = req.user.data.username;
                    }
                });

                // add UUID of a new row
                createParams = cleanUp(object, createParams);

                // 21 May '19 : Johnny : mobile devices will initiate .create()
                // operations with uuid already set.  We can't overwrite them 
                // here:
                if ((object.PK() === 'uuid') && (!createParams['uuid']))
                    createParams.uuid = uuid();

                var validationErrors = object.isValidData(createParams);
                if (validationErrors.length == 0) {

                    // this is a create operation, so ... 
                    // createParams.created_at = (new Date()).toISOString();
                    if (!object.isExternal && !object.isImported)
                        createParams.created_at = AppBuilder.rules.toSQLDateTime(new Date());

                    sails.log.verbose('ABModelController.create(): createParams:', createParams);

                    var query = object.model().query();

                    query.insert(createParams)
                        .then((newObj) => {

                            var updateTasks = updateRelationValues(object, newObj[object.PK()], updateRelationParams);


                            // update translation of the external object
                            if ((object.isExternal || object.isImported) &&
                                createParams.translations)
                                updateTasks.push(updateTranslationsValues(object, newObj[object.PK()], createParams.translations, true));


                            // update relation values sequentially
                            return updateTasks.reduce((promiseChain, currTask) => {
                                return promiseChain.then(currTask);
                            }, Promise.resolve([]))
                                .catch((err) => { return Promise.reject(err); })
                                .then((values) => {

                                    // // Query the new row to response to client
                                    return object.queryFind({
                                        where: {
                                            glue: 'and',
                                            rules: [
                                                {
                                                    key: object.PK(),
                                                    rule: "equals",
                                                    value: newObj[object.PK()] || ''
                                                }
                                            ]
                                        },
                                        offset: 0,
                                        limit: 1,
                                        populate: true
                                    },
                                        req.user.data)
                                        .then((newItem) => {

                                            resolvePendingTransaction();
                                            res.AD.success(newItem[0]);

                                            // We want to broadcast the change from the server to the client so all datacollections can properly update
                                            // Build a payload that tells us what was updated
                                            var payload = {
                                                objectId: object.id,
                                                data: newItem[0]
                                            };

                                            // Broadcast the create
                                            sails.sockets.broadcast(object.id, "ab.datacollection.create", payload);

                                            // updateConnectedFields(object, newItem[0]);

                                            // TODO:: what is this doing?
                                            Promise.resolve();

                                        });


                                });


                        }, (err) => {
console.error(err);
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

                                resolvePendingTransaction();
                                res.AD.error(errorResponse);
                            }
                            else {

                                 var errorResponse = {
                                    error: 'E_VALIDATION',
                                    invalidAttributes: {}
                                };

                                // WORKAROUND : Get invalid field
                                var invalidFields = object.fields(f => ((err.sqlMessage || "").toLowerCase()).indexOf((f.columnName || "").toLowerCase()) > -1);
                                invalidFields.forEach(f => {

                                    let errorMessage;

                                    switch (err.code) {
                                        case "ER_DUP_ENTRY": 
                                            errorMessage = "The value is a duplicate value and therefore, not valid.";
                                            break;
                                        default:
                                            errorMessage = err.sqlMessage;
                                            break;
                                    }

                                    errorResponse.invalidAttributes[f.columnName] = [
                                        {
                                            message: errorMessage
                                        }
                                    ];

                                });

                                resolvePendingTransaction();
                                res.AD.error(errorResponse);
                            }

                        })
                        .catch((err) => {
                            console.log('... catch(err) !');

                            if (!(err instanceof ValidationError)) {
                                ADCore.error.log('Error performing update!', { error: err })
                                resolvePendingTransaction();
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

                    resolvePendingTransaction();
                    res.AD.error(errorResponse);
                }

            })
*/
   },

   /**
    * find
    *
    * get /app_builder/model/application/:appID/object/:objID
    */
   find: function(req, res) {
      newPendingTransaction();
      AppBuilder.routes
         .verifyAndReturnObject(req, res)
         .then(function(object) {
            // verify that the request is from a socket not a normal HTTP
            if (req.isSocket) {
               // Subscribe socket to a room with the name of the object's ID
               sails.sockets.join(req, object.id);
            }

            var where = req.options._where;
            var whereCount = _.cloneDeep(req.options._where); // ABObject.populateFindConditions changes values of this object
            var sort = req.options._sort;
            var offset = req.options._offset;
            var limit = req.options._limit;

            var populate = req.options._populate;
            if (populate == null) populate = true;

            // promise for the total count. this was moved below the filters because webix will get caught in an infinte loop of queries if you don't pass the right count
            var pCount = object.queryCount(
               { where: whereCount, populate: false },
               req.user.data
            );

            var query = object.queryFind(
               {
                  where: where,
                  sort: sort,
                  offset: offset,
                  limit: limit,
                  populate: populate
               },
               req.user.data
            );

            // TODO:: we need to refactor to remove Promise.all so we no longer have Promise within Promises.
            Promise.all([pCount, query])
               .then(function(queries) {
                  Promise.all([queries[0], queries[1]])
                     .then(function(values) {
                        var result = {};
                        var count = values[0].count;
                        var rows = values[1];

                        result.data = rows;

                        // webix pagination format:
                        result.total_count = count;
                        result.pos = offset;

                        result.offset = offset;
                        result.limit = limit;

                        if (offset + rows.length < count) {
                           result.offset_next = offset + limit;
                        }

                        //// TODO: evaluate if we really need to do this:
                        //// ?) do we have a data field that actually needs to post process it's data
                        ////    before returning it to the client?

                        // object.postGet(result.data)
                        // .then(()=>{

                        resolvePendingTransaction();
                        if (res.header)
                           res.header("Content-type", "application/json");

                        res.send(result, 200);

                        // })
                     })
                     .catch((err) => {
                        resolvePendingTransaction();
                        console.log(err);
                        res.AD.error(err);
                     });
               })
               .catch((err) => {
                  resolvePendingTransaction();
                  console.log(err);
                  res.AD.error(err);
               });
         })
         .catch((err) => {
            resolvePendingTransaction();
            ADCore.error.log(
               "AppBuilder:ABModelController:find(): find() did not complete",
               { error: err }
            );
            if (!err) {
               err = new Error(
                  "AppBuilder:ABModelController:find(): find() did not complete. No Error Provided."
               );
            }
            res.AD.error(err, err.HTTPCode || 400);
         });
   },

   delete: function(req, res) {
      var id = req.param("id", -1);
      var object;
      var oldItem;
      var relatedItems = [];
      var numRows = null;

      if (id == -1) {
         var invalidError = ADCore.error.fromKey("E_MISSINGPARAM");
         invalidError.details = "missing .id";
         sails.log.error(invalidError);
         res.AD.error(invalidError, 400);
         return;
      }

      newPendingTransaction();
      async.series(
         [
            // step #1
            function(next) {
               AppBuilder.routes
                  .verifyAndReturnObject(req, res)
                  .catch(next)
                  .then(function(obj) {
                     object = obj;
                     next();
                  });
            },

            // step #2
            function(next) {
               // We are deleting an item...but first fetch its current data
               // so we can clean up any relations on the client side after the delete
               object
                  .queryFind(
                     {
                        where: {
                           glue: "and",
                           rules: [
                              {
                                 key: object.PK(),
                                 rule: "equals",
                                 value: id
                              }
                           ]
                        },
                        populate: true
                     },
                     req.user.data
                  )
                  .then((old_item) => {
                     oldItem = old_item;
                     next();
                  });

               // queryPrevious
               //     .catch(next)
               //     .then((old_item) => {
               //         oldItem = old_item;
               //         next();
               //     });
            },

            // step #3
            function(next) {
               // NOTE: We will update relation data of deleted items on client side
               return next();

               // Check to see if the object has any connected fields that need to be updated
               var connectFields = object.connectFields();

               // If there are no connected fields continue on
               if (connectFields.length == 0) next();

               var relationQueue = [];

               // Parse through the connected fields
               connectFields.forEach((f) => {
                  // Get the field object that the field is linked to
                  var relatedObject = f.datasourceLink;
                  // Get the relation name so we can separate the linked fields updates from the rest
                  var relationName = f.relationName();

                  // If we have any related item data we need to build a query to report the delete...otherwise just move on
                  if (!Array.isArray(oldItem[0][relationName]))
                     oldItem[0][relationName] = [oldItem[0][relationName]];
                  if (
                     oldItem[0] &&
                     oldItem[0][relationName] &&
                     oldItem[0][relationName].length
                  ) {
                     // Push the ids of the related data into an array so we can use them in a query
                     var relatedIds = [];
                     oldItem[0][relationName].forEach((old) => {
                        if (old && old.id) relatedIds.push(old.id); // TODO: support various id
                     });

                     // If no relate ids, then skip
                     if (relatedIds.length < 1) return;

                     // Get all related items info
                     var p = relatedObject
                        .queryFind(
                           {
                              where: {
                                 glue: "and",
                                 rules: [
                                    {
                                       key: relatedObject.PK(),
                                       rule: "in",
                                       value: relatedIds
                                    }
                                 ]
                              },
                              populate: true
                           },
                           req.user.data
                        )
                        .then((items) => {
                           // push new realted items into the larger related items array
                           relatedItems.push({
                              object: relatedObject,
                              items: items
                           });
                        });

                     // var p = queryRelated
                     //     .catch(next)
                     //     .then((items) => {
                     //         // push new realted items into the larger related items array
                     //         relatedItems.push({
                     //             object: relatedObject,
                     //             items: items
                     //         });
                     //     });

                     relationQueue.push(p);
                  }
               });

               Promise.all(relationQueue)
                  .then(function(values) {
                     console.log("relatedItems: ", relatedItems);
                     next();
                  })
                  .catch(next);
            },

            // step #4
            function(next) {
               // Now we can delete because we have the current record saved as oldItem and our related records saved as relatedItems
               object
                  .model()
                  .query()
                  .delete()
                  .where(object.PK(), "=", id)
                  .then((countRows) => {
                     // track logging
                     ABTrack.logDelete({
                        objectId: object.id,
                        rowId: id,
                        username: req.user.data.username,
                        data: oldItem
                     });

                     resolvePendingTransaction();
                     numRows = countRows;
                     next();
                  })
                  .catch(next);
            },

            // step #5: Process the .deleted object lifecycle
            (next) => {
               if (!oldItem) {
                  next();
                  return;
               }

               var key = `${object.id}.deleted`;
               ABProcess.trigger(key, oldItem[0])
                  .then(() => {
                     next();
                  })
                  .catch(next);
            },

            // step #6: now resolve the transaction and return data to the client
            (next) => {
               res.AD.success({ numRows: numRows });

               // We want to broadcast the change from the server to the client so all datacollections can properly update
               // Build a payload that tells us what was updated
               var payload = {
                  objectId: object.id,
                  id: id
               };

               // Broadcast the delete
               sails.sockets.broadcast(
                  object.id,
                  "ab.datacollection.delete",
                  payload
               );

               // Using the data from the oldItem and relateditems we can update all instances of it and tell the client side it is stale and needs to be refreshed
               updateConnectedFields(object, oldItem[0]);
               if (relatedItems.length) {
                  relatedItems.forEach((r) => {
                     updateConnectedFields(r.object, r.items);
                  });
               }
               next();
            }
         ],
         function(err) {
            if (err) {
               resolvePendingTransaction();

               // This object does not allow to update or delete (blocked by MySQL.Trigger)
               if (
                  err.code == "ER_SIGNAL_EXCEPTION" &&
                  err.sqlState == "45000"
               ) {
                  let errResponse = {
                     error: "READONLY",
                     message: err.sqlMessage
                  };

                  res.AD.error(errResponse);
               } else if (!(err instanceof ValidationError)) {
                  ADCore.error.log("Error performing delete!", {
                     error: err
                  });
                  res.AD.error(err);
                  sails.log.error("!!!! error:", err);
               }
            }
         }
      );

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
      //                     var relatedObject = f.objectLink;
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

   update: function(req, res) {
      var id = req.param("id", -1);

      if (id == -1) {
         var invalidError = ADCore.error.fromKey("E_MISSINGPARAM");
         invalidError.details = "missing .id";
         sails.log.error(invalidError);
         res.AD.error(invalidError, 400);
         return;
      }

      newPendingTransaction();
      AppBuilder.routes.verifyAndReturnObject(req, res).then(function(object) {
         // NOTE: We will update relation data on client side

         // We are updating an item...but first fetch it's current data
         // so we can clean up the client sides relations after the update
         // because some updates will involve deletes of relations
         // so assuming creates can be problematic
         // var queryPrevious = object.queryFind({
         //     where: {
         //         glue: 'and',
         //         rules: [{
         //             key: object.PK(),
         //             rule: "equals",
         //             value: id
         //         }]
         //     },
         //     populate: true
         // }, req.user.data);

         // queryPrevious
         //     .catch((err) => {
         //         if (!(err instanceof ValidationError)) {
         //             ADCore.error.log('Error performing find!', { error: err })
         //             res.AD.error(err);
         //             sails.log.error('!!!! error:', err);
         //         }
         //     })
         //     .then((oldItem) => {

         var allParams = req.allParams();
         sails.log.verbose("ABModelController.update(): allParams:", allParams);

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
            if (object.isExternal || object.isImported) {
               // translations values does not in same table of the external object
               delete updateParams.translations;
            } else {
               // this is an update operation, so ...
               // updateParams.updated_at = (new Date()).toISOString();

               updateParams.updated_at = AppBuilder.rules.toSQLDateTime(
                  new Date()
               );

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

            updateParams = cleanUp(object, updateParams);

            sails.log.verbose(
               "ABModelController.update(): updateParams:",
               updateParams
            );

            let defaultUpdate = {};
            defaultUpdate[object.PK()] = id;

            var query = object.model().query();

            // Do Knex update data tasks
            query
               .patch(updateParams || defaultUpdate)
               .where(object.PK(), id)
               .then(
                  (values) => {
                     // track logging
                     ABTrack.logUpdate({
                        objectId: object.id,
                        rowId: id,
                        username: req.user.data.username,
                        data: Object.assign(
                           updateParams,
                           updateRelationParams,
                           transParams
                        )
                     });

                     // create a new query when use same query, then new data are created duplicate
                     var updateTasks = updateRelationValues(
                        object,
                        id,
                        updateRelationParams
                     );

                     // update translation of the external table
                     if (object.isExternal || object.isImported)
                        updateTasks.push(
                           updateTranslationsValues(object, id, transParams)
                        );

                     // update relation values sequentially
                     return updateTasks
                        .reduce((promiseChain, currTask) => {
                           return promiseChain.then(currTask);
                        }, Promise.resolve([]))
                        .catch((err) => {
                           return Promise.reject(err);
                        })
                        .then((values) => {
                           // Query the new row to response to client
                           var query3 = object.queryFind(
                              {
                                 where: {
                                    glue: "and",
                                    rules: [
                                       {
                                          key: object.PK(),
                                          rule: "equals",
                                          value: id
                                       }
                                    ]
                                 },
                                 offset: 0,
                                 limit: 1,
                                 populate: true
                              },
                              req.user.data
                           );

                           return query3
                              .catch((err) => {
                                 return Promise.reject(err);
                              })
                              .then((newItem) => {
                                 let result = newItem[0];

                                 var key = `${object.id}.updated`;
                                 return ABProcess.trigger(key, result)
                                    .then(() => {
                                       resolvePendingTransaction();
                                       res.AD.success(result);
                                       updateConnectedFields(object, result);

                                       // We want to broadcast the change from the server to the client so all datacollections can properly update
                                       // Build a payload that tells us what was updated
                                       var payload = {
                                          objectId: object.id,
                                          data: result
                                       };

                                       // Broadcast the update
                                       sails.sockets.broadcast(
                                          object.id,
                                          "ab.datacollection.update",
                                          payload
                                       );
                                    })
                                    .catch((err) => {
                                       return Promise.reject(err);
                                    });
                              });
                        });
                  },
                  (err) => {
                     console.log("...  (err) handler!", err);

                     resolvePendingTransaction();

                     // handle invalid values here:
                     if (err instanceof ValidationError) {
                        //// TODO: refactor these invalid data handlers to a common OP.Validation.toErrorResponse(err)

                        // return an invalid values response:
                        let errorResponse = {
                           error: "E_VALIDATION",
                           invalidAttributes: {}
                        };

                        var attr = errorResponse.invalidAttributes;

                        for (var e in err.data) {
                           attr[e] = attr[e] || [];
                           err.data[e].forEach((eObj) => {
                              eObj.name = e;
                              attr[e].push(eObj);
                           });
                        }

                        res.AD.error(errorResponse);
                     }
                     // This object does not allow to update or delete (blocked by MySQL.Trigger)
                     else if (
                        err.code == "ER_SIGNAL_EXCEPTION" &&
                        err.sqlState == "45000"
                     ) {
                        let errResponse = {
                           error: "READONLY",
                           message: err.sqlMessage
                        };

                        res.AD.error(errResponse);
                     } else {
                        let errorResponse = {
                           error: "E_VALIDATION",
                           invalidAttributes: {}
                        };

                        // WORKAROUND : Get invalid field
                        var invalidFields = object.fields(
                           (f) =>
                              (err.sqlMessage || "")
                                 .toLowerCase()
                                 .indexOf((f.columnName || "").toLowerCase()) >
                              -1
                        );
                        invalidFields.forEach((f) => {
                           let errorMessage;

                           switch (err.code) {
                              case "ER_DUP_ENTRY":
                                 errorMessage =
                                    "The value is a duplicate value and therefore, not valid.";
                                 break;
                              default:
                                 errorMessage = err.sqlMessage;
                                 break;
                           }

                           errorResponse.invalidAttributes[f.columnName] = [
                              {
                                 message: errorMessage
                              }
                           ];
                        });

                        res.AD.error(errorResponse);
                     }
                  }
               )
               .catch((err) => {
                  console.log("... catch(err) !");

                  if (!(err instanceof ValidationError)) {
                     ADCore.error.log("Error performing update!", {
                        error: err
                     });
                     resolvePendingTransaction();
                     res.AD.error(err);
                     sails.log.error("!!!! error:", err);
                  }
               });
         } else {
            // return an invalid values response:
            var errorResponse = {
               error: "E_VALIDATION",
               invalidAttributes: {}
            };

            var attr = errorResponse.invalidAttributes;

            validationErrors.forEach((e) => {
               attr[e.name] = attr[e.name] || [];
               attr[e.name].push(e);
            });

            resolvePendingTransaction();
            res.AD.error(errorResponse);
         }

         // });
      });
   },

   upsert: function(req, res) {
      var object;

      newPendingTransaction();

      Promise.resolve()
         .then(() => {
            // Pull ABObject
            return new Promise((resolve, reject) => {
               AppBuilder.routes
                  .verifyAndReturnObject(req, res)
                  .then(function(result) {
                     object = result;
                     resolve();
                  });
            });
         })
         .then(() => {
            // Get column names
            return new Promise((resolve, reject) => {
               object
                  .model()
                  .query()
                  .columnInfo()
                  .then(function(columns) {
                     var columnNames = Object.keys(columns);

                     resolve(columnNames);
                  })
                  .catch(reject);
            });
         })
         .then((columnNames) => {
            return new Promise((resolve, reject) => {
               var model = object.model();

               var allParams = req.body;

               delete allParams.created_at;

               // get translations values for the external object
               // it will update to translations table after model values updated
               // var transParams = _.cloneDeep(allParams.translations);

               // filter invalid columns
               var relationNames = Object.keys(model.getRelations());
               Object.keys(allParams).forEach((prop) => {
                  // remove no column of this object
                  if (
                     prop != "id" &&
                     columnNames.indexOf(prop) < 0 &&
                     relationNames.indexOf(prop) < 0
                  ) {
                     delete allParams[prop];
                  }
                  // remove updated_at, created_at of relation data
                  else if (relationNames.indexOf(prop) > -1) {
                     if (allParams[prop]) {
                        delete allParams[prop].text;

                        delete allParams[prop].updated_at;
                        delete allParams[prop].created_at;

                        if (!allParams[prop].properties)
                           delete allParams[prop].properties;
                     }
                  }
               });

               // Validate
               var validationErrors = object.isValidData(allParams);
               if (validationErrors && validationErrors.length > 0) {
                  // return an invalid values response:
                  var errorResponse = {
                     error: "E_VALIDATION",
                     invalidAttributes: {}
                  };

                  var attr = errorResponse.invalidAttributes;

                  for (var e in err.data) {
                     attr[e] = attr[e] || [];
                     err.data[e].forEach((eObj) => {
                        eObj.name = e;
                        attr[e].push(eObj);
                     });
                  }

                  res.AD.error(errorResponse);
               } else {
                  var errorResponse = {
                     error: "E_VALIDATION",
                     invalidAttributes: {}
                  };

                  return;
               }

               if (object.isExternal || object.isImported) {
                  // translations values does not in same table of the external object
                  delete allParams.translations;
               } else {
                  // this is an update operation, so ...
                  // updateParams.updated_at = (new Date()).toISOString();

                  allParams.updated_at = AppBuilder.rules.toSQLDateTime(
                     new Date()
                  );

                  // Check if there are any properties set otherwise let it be...let it be...let it be...yeah let it be
                  if (allParams.properties) {
                     allParams.properties = allParams.properties;
                  } else {
                     allParams.properties = null;
                  }
               }

               allParams = cleanUp(object, allParams);

               sails.log.verbose(
                  "ABModelController.upsert(): allParams:",
                  allParams
               );

               // Upsert data
               model
                  .query()
                  .upsertGraph(
                     allParams,
                     // Knex's upsert options
                     {
                        relate: true,
                        unrelate: true,
                        noDelete: true,
                        noUpdate: ["created_at"]
                     }
                  )
                  .then((values) => {
                     var valId = values[object.PK()];

                     resolve(valId);
                  })
                  .catch(reject);
            });
         })

         .then((updateId) => {
            // Query the new row to response to client
            return new Promise((resolve, reject) => {
               object
                  .queryFind(
                     {
                        where: {
                           glue: "and",
                           rules: [
                              {
                                 key: object.PK(),
                                 rule: "equals",
                                 value: updateId
                              }
                           ]
                        },
                        offset: 0,
                        limit: 1,
                        populate: true
                     },
                     req.user.data
                  )
                  .then((updateItem) => {
                     resolvePendingTransaction();
                     res.AD.success(updateItem);

                     // We want to broadcast the change from the server to the client so all datacollections can properly update
                     // Build a payload that tells us what was updated
                     var payload = {
                        objectId: object.id,
                        data: updateItem
                     };

                     // Broadcast the update
                     sails.sockets.broadcast(
                        object.id,
                        "ab.datacollection.upsert",
                        payload
                     );

                     resolve();
                  })
                  .catch(reject);
            });
         })
         .catch((err) => {
            console.log("...  (err) handler!", err);

            resolvePendingTransaction();

            // handle invalid values here:
            if (err instanceof ValidationError) {
               //// TODO: refactor these invalid data handlers to a common OP.Validation.toErrorResponse(err)

               // return an invalid values response:
               var errorResponse = {
                  error: "E_VALIDATION",
                  invalidAttributes: {}
               };

               var attr = errorResponse.invalidAttributes;

               for (var e in err.data) {
                  attr[e] = attr[e] || [];
                  err.data[e].forEach((eObj) => {
                     eObj.name = e;
                     attr[e].push(eObj);
                  });
               }

               res.AD.error(errorResponse);
            }
         });
   },

   refresh: function(req, res) {
      newPendingTransaction();
      AppBuilder.routes.verifyAndReturnObject(req, res).then(function(object) {
         object.modelRefresh();

         resolvePendingTransaction();
         res.AD.success({});
      });
   },

   count: function(req, res) {
      newPendingTransaction();
      AppBuilder.routes.verifyAndReturnObject(req, res).then(function(object) {
         var where = req.param("where");

         // promise for the total count. this was moved below the filters because webix will get caught in an infinte loop of queries if you don't pass the right count
         object
            .queryCount({ where: where, populate: false }, req.user.data)
            .first()
            .catch((err) => {
               resolvePendingTransaction();
               res.AD.error(err);
            })
            .then((result) => {
               resolvePendingTransaction();
               res.AD.success(result);
            });
      });
   }
};

