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

         // make sure there aren't any null values in our list
         ids.forEach((id) => {
            if (id) {
               // NOTE: go directly to the Model to get the full ABDefinition entry:
               data.definitions.push(ABDefinitionModel.objForID(id));
            }
         });

         var SiteUser = data.definitions.find(
            (d) => d.id == "228e3d91-5e42-49ec-b37c-59323ae433a1"
         );
         var USERNAME_FIELD_ID = "5760560b-c078-47ca-98bf-e18ac492a561";

         var userFields = data.definitions.filter(
            (d) => d.type == "field" && d.json.key == "user"
         );
         console.log(`converting ${userFields.length} user fields.`);

         (userFields || []).forEach((fDef) => {
            var field = fDef.json;

            // only do this if we have not RE-IMPORTED this field:
            // in this case, a user field will NOT have a field.settings.linkColumn defined:
            var prevExport = ABDefinitionModel.objForID(
               field.settings.linkColumn
            );
            if (!prevExport) {
               // find field's object
               var objDef = data.definitions.find(
                  (d) =>
                     d.type == "object" &&
                     d.json.fieldIDs.indexOf(field.id) > -1
               );
               if (objDef) {
                  var object = objDef.json;

                  // Convert the Old User field definitions to the new ConnectObject
                  // format:
                  field.settings.linkObject = SiteUser.id;
                  field.settings.isCustomFK = 1;
                  field.settings.isSource = 1;

                  if (field.settings.isMultiple) {
                     field.settings.indexField2 = USERNAME_FIELD_ID;
                     field.settings.linkType = "many";
                     field.settings.linkViaType = "many";
                  } else {
                     field.settings.indexField = USERNAME_FIELD_ID;
                     field.settings.linkType = "one";
                     field.settings.linkViaType = "many";
                  }

                  var uuidLinkF = uuidv4();
                  field.settings.linkColumn = uuidLinkF;

                  // now new ConnectObject Field on SiteUser:
                  var linkF = {
                     type: "field",
                     key: "connectObject",
                     icon: "external-link",
                     isImported: "0",
                     columnName: object.tableName,
                     settings: {
                        showIcon: field.settings.showIcon,
                        linkObject: object.id,
                        linkType: field.settings.linkViaType,
                        linkViaType: field.settings.linkType,
                        isCustomFK: field.settings.isCustomFK,
                        indexField: field.settings.indexField,
                        indexField2: field.settings.indexField2,
                        isSource: 0,
                        width: 100,
                        required: 0,
                        unique: 0,
                        linkColumn: field.id
                     },
                     translations: [
                        {
                           language_code: "en",
                           label:
                              object.translations[0].label +
                              "." +
                              field.translations[0].label
                        }
                     ],
                     id: uuidLinkF
                  };

                  SiteUser.json.fieldIDs.push(linkF.id);

                  // Bundle the LinkField json into a proper Defintiion:
                  var defLinkF = {
                     id: linkF.id,
                     type: linkF.type,
                     name: "USER->" + linkF.translations[0].label,
                     json: linkF,
                     createdAt: fDef.createdAt,
                     updatedAt: fDef.updatedAt
                  };

                  data.definitions.push(defLinkF);
               } // if objDef
            } else {
               // be sure to include the definition for our previously created
               // linkField if it isn't already included:
               var exists = data.definitions.find((d) => d.id == prevExport.id);
               if (!exists) {
                  data.definitions.push(prevExport);
               }
            } // if !reimport
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
