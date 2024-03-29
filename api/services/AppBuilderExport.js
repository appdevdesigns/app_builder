/**
 * Import and export AppBuilder apps.
 */
const fs = require("fs");
const path = require("path");
const uuidv4 = require("uuid");
const ABDefinition = require(path.join(
   __dirname,
   "..",
   "classes",
   "platform",
   "ABDefinition"
));
const ABApplication = require(path.join(
   __dirname,
   "..",
   "classes",
   "platform",
   "ABApplication"
));

module.exports = {
   /**
    * Export an application's metadata to JSON
    *
    * @param {string} appID
    *        the {uuid} of the ABApplication definition we are exporting.
    * @return {json} data
    *         a data structure that contains all the necessary definitions
    *         to recreate an Application in an AB Runtime environment.
    */
   appToJSON: function(appID) {
      var data = {
         abVersion: "0.0.0",
         definitions: []
      };
      var Application = null;

      return new Promise((resolve, reject) => {
         var def = ABDefinition.definition(appID);
         if (def) {
            Application = new ABApplication(def);
         }

         if (!Application) {
            var error = new Error("Not Found");
            error.code = 404;
            error.detailMsg = `AppBuilderExport.appToJSON(): Can't find Application ID [${appID}]`;
            return reject(error);
         }

         // gathering all the Definition, IDs:
         var ids = [];
         Application.exportIDs(ids);

         // for a thorough list, there will be duplicate ids, so lets only include
         // unique entries:
         // ids = _.uniq(ids);
         ids.forEach((id) => {
            if (id) {
               // NOTE: go directly to the Model to get the full ABDefinition entry:
               data.definitions.push(ABDefinitionModel.objForID(id));
            }
         });
         resolve(data);
      });
   },

   /**
    * Import JSON data to create an application.
    *
    * @param JSON data
    *      This is the JSON object produced by appToJSON()
    * @param userData {Object} -  {
    *                               username: STRING
    *                             }
    */
   appFromJSON: function(data, userData) {
      var Application = ABSystemObject.getApplication();
      var hashSaved = {};
      var allObjects = [];

      let importFolder = path.join(
         sails.config.appPath,
         sails.config.appbuilder.pathFiles,
         "import"
      );
      let importFileName = `${uuidv4()}.json`;

      return new Promise((resolve, reject) => {
         Promise.resolve()
            .then(
               () =>
                  // Check/Create the import logging folder
                  new Promise((next, bad) => {
                     console.log(
                        "::: IMPORT : checking/creating the import logging folder"
                     );
                     fs.stat(importFolder, (err) => {
                        // exists
                        if (!err) return next();

                        // create the import folder
                        fs.mkdir(importFolder, () => {
                           next();
                        });
                     });
                  })
            )
            .then(
               () =>
                  // Save the JSON definition to a log file
                  new Promise((next, bad) => {
                     console.log(
                        "::: IMPORT : storing the definition JSON to a logging file"
                     );
                     fs.writeFile(
                        path.join(importFolder, importFileName),
                        JSON.stringify((data || {}).definitions || ""),
                        (err) => {
                           if (err) return bad(err);
                           next();
                        }
                     );
                  })
            )
            .then(() => {
               // Insert all the ABDefinitions for Applications, fields and objects:
               console.log(
                  "::: IMPORT : importing initial definitions (Application, Fields, objects)"
               );
               sails.controllers["app_builder/abdefinitionmodel"].hashClear();
               var allSaves = [];
               (data.definitions || [])
                  .filter(
                     (d) =>
                        d &&
                        ["object", "field", "index", "application"].indexOf(
                           d.type
                        ) > -1
                  )
                  .forEach((def) => {
                     hashSaved[def.id] = def;
                     allSaves.push(
                        ABDefinition.create(def, {
                           user: userData.username,
                           json: { filename: importFileName },
                           type: "import"
                        }).catch((err) => {
                           //                            console.log(`>>>>>>>>>>>>>>>>>>>>>>
                           // ${err.toString()}
                           // >>>>>>>>>>>>>>>>>>>>>>`);

                           if (err.toString().indexOf("already exists") > -1) {
                              // console.log("===> trying an update instead.");
                              return ABDefinition.update(def.id, def, {
                                 user: userData.username,
                                 json: { filename: importFileName },
                                 type: "import"
                              });
                           }
                        })
                     );
                  });

               return Promise.all(allSaves);
            })
            .then(() => {
               // create instances of all objects first.
               // this way we make sure our connectFields can reference other
               // objects properly.
               (data.definitions || [])
                  .filter((d) => d && d.type == "object")
                  .forEach((o) => {
                     var object = Application.objectNew(o.json);
                     allObjects.push(object);
                  });
            })
            .then(() => {
               // now load all the Objects, and do a .migrageCreate() on them:
               // NOTE: there is a timing issue with ABFieldConnect fields.
               // We have to 1st, create ALL the object tables before we can
               // create connections between them.

               console.log("::: IMPORT : creating base objects");

               var allMigrates = [];
               (allObjects || []).forEach((object) => {
                  object.stashConnectFields(); // effectively ignores connectFields
                  object.stashIndexFieldsWithConnection();
                  // NOTE: keep .stashIndexNormal() after .stashIndexFieldsWithConnection()
                  object.stashIndexNormal();
                  allMigrates.push(
                     ABMigration.createObject(object).catch((err) => {
                        console.log(`>>>>>>>>>>>>>>>>>>>>>>
Pass 1: creating objects WITHOUT connectFields:
ABMigration.createObject() error:
${err.toString()}
>>>>>>>>>>>>>>>>>>>>>>`);
                     })
                  );
               });

               return Promise.all(allMigrates);
            })
            .then(() => {
               // Create our normal Indexes:
               console.log("::: IMPORT : creating Normal Indexes");

               var allIndexes = [];
               var allUpdates = [];

               (allObjects || []).forEach((object) => {
                  var stashed = object.getStashedIndexNormals();
                  if (stashed && stashed.length > 0) {
                     allIndexes = allIndexes.concat(stashed);
                     object.applyIndexNormal();
                  }
               });

               (allIndexes || []).forEach((indx) => {
                  if (indx) {
                     allUpdates.push(ABMigration.createIndex(indx));
                  }
               });

               return Promise.all(allUpdates).then(() => {
                  // Now make sure knex has the latest object data
                  (allObjects || []).forEach((object) => {
                     ABMigration.refreshObject(object);
                  });
               });
            })
            .then(() => {
               // Now that all the tables are created, we can go back
               // and create the connections between them:

               console.log("::: IMPORT : creating connected fields");

               var allConnections = [];
               var allRetries = [];

               // reapply connectFields to all objects BEFORE doing any
               // .createField() s
               (allObjects || []).forEach((object) => {
                  object.applyConnectFields(); // reapply connectFields
               });

               (allObjects || []).forEach((object) => {
                  (object.connectFields() || []).forEach((f) => {
                     allConnections.push(
                        ABMigration.createField(f).catch((err) => {
                           var strErr = err.toString();
                           if (strErr.indexOf("ER_LOCK_DEADLOCK") != -1) {
                              allRetries.push(f);
                              return;
                           }
                           console.log(`>>>>>>>>>>>>>>>>>>>>>>
Pass 2: creating connectFields:
ABMigration.createObject() error:
${err.toString()}
>>>>>>>>>>>>>>>>>>>>>>`);
                        })
                     );
                  });
               });

               function seqRetry(cb) {
                  // seqRetry()
                  // a recursive function to sequencially process each of the
                  // fields in the allRetries[].

                  if (allRetries.length == 0) {
                     cb();
                  } else {
                     var f = allRetries.shift();
                     f._deadlockRetry = f._deadlockRetry || 1;
                     console.log(
                        `::: ER_LOCK_DEADLOCK on Field[${f.name}] ... retrying`
                     );

                     ABMigration.createField(f)
                        .then(() => {
                           seqRetry(cb);
                        })
                        .catch((err) => {
                           var strErr = err.toString();
                           if (strErr.indexOf("ER_LOCK_DEADLOCK") != -1) {
                              f._deadlockRetry++;
                              if (f._deadlockRetry < 4) {
                                 allRetries.push(f);
                                 seqRetry(cb);
                              } else {
                                 console.log(
                                    `:::ER_LOCK_DEADLOCK too many attempts for Field[${f.name}]`
                                 );
                                 cb(err);
                              }
                              return;
                           }
                           console.log(`>>>>>>>>>>>>>>>>>>>>>>
Pass 2: creating connectFields:
ER_LOCK_DEADLOCK Retry...
ABMigration.createObject() error:
${err.toString()}
>>>>>>>>>>>>>>>>>>>>>>`);
                           cb(err);
                        });
                  }
               }

               return Promise.all(allConnections).then(() => {
                  return new Promise((resolve, reject) => {
                     seqRetry((err) => {
                        if (err) {
                           return reject(err);
                        }
                        resolve();
                     });
                  });
               });
            })
            .then(() => {
               // OK, now we can finish up with the Indexes that were
               // based on connectFields:

               console.log("::: IMPORT : Final Index Imports");

               var allIndexes = [];
               var allUpdates = [];

               (allObjects || []).forEach((object) => {
                  var stashed = object.getStashedIndexes();
                  if (stashed && stashed.length > 0) {
                     allIndexes = allIndexes.concat(stashed);
                     object.applyIndexes();
                  }
               });

               (allIndexes || []).forEach((indx) => {
                  if (indx) {
                     allUpdates.push(ABMigration.createIndex(indx));
                  }
               });

               return Promise.all(allUpdates).then(() => {
                  // Now make sure knex has the latest object data
                  (allObjects || []).forEach((object) => {
                     ABMigration.refreshObject(object);
                  });
               });
            })
            .then(() => {
               // now save all the rest:
               var numRemaining =
                  data.definitions.length - Object.keys(hashSaved).length;
               console.log(
                  `::: IMPORT : insert remaining definitions #${numRemaining}`
               );
               var allSaves = [];
               (data.definitions || []).forEach((def) => {
                  if (def && !hashSaved[def.id]) {
                     allSaves.push(
                        ABDefinition.create(def, {
                           user: userData.username,
                           json: { filename: importFileName },
                           type: "import"
                        }).catch((err) => {
                           if (err.toString().indexOf("already exists") > -1) {
                              // console.log("===> trying an update instead.");
                              return ABDefinition.update(def.id, def, {
                                 user: userData.username,
                                 json: { filename: importFileName },
                                 type: "import"
                              });
                           }

                           console.log(`>>>>>>>>>>>>>>>>>>>>>>
ABDefinition.create() error:
${err.toString()}
>>>>>>>>>>>>>>>>>>>>>>`);
                        })
                     );
                  }
               });
               return Promise.all(allSaves);
            })
            .then(() => {
               console.log(":::");
               console.log("::: IMPORT : Finished");
               console.log(":::");
               resolve(data);
            });
      });
   }
};
