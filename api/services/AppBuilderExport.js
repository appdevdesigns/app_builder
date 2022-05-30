/**
 * Import and export AppBuilder apps.
 */
const _ = require("lodash");
const async = require("async");
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

// NOTE: taken from api/controllers/OPImageUploadController:
function destinationPath(appKey) {
   // in case settings are not set ...
   sails.config.opsportal.opimageupload =
      sails.config.opsportal.opimageupload || {};
   sails.config.opsportal.opimageupload.basePath =
      sails.config.opsportal.opimageupload.basePath ||
      path.join("data", "opimageupload");

   return path.join(
      sails.config.appPath,
      sails.config.opsportal.opimageupload.basePath,
      appKey
   );
}

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
   appToJSON: function (appID) {
      var data = {
         abVersion: "0.0.0",
         definitions: [],
         files: {
            /* file.id : {
               meta: {
                  // Wanted:
                  created_at: createdAt
                  updated_at: updatedAt,
                  field: {ABField.id},
                  object: {ABField.object.id},
                  pathFile: ???
                  file: {file | image}, // the name of the original file
                  size: size
                  uploadedBy: null
                  type: type
                  info: info || null
               },
               contents: "base64(contents)"
            }
            */
         },
         errors: [],
         siteObjectConnections: {},
         /* SiteObject.id : [ importField.id, importField.id, ... ] */
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
         var exportData = {
            settings: {
               includeSystemObjects: Application.isAdminApp,
               // {bool}
            },
            ids: [],
            siteObjectConnections: {
               // SiteUser.id : [ ABField.ID, ],
               // SiteRole.id : [ ABField.ID,, ]
            },
            roles: {
               /* Role.id : Role.id */
            },
         };
         Application.exportData(exportData);

         // make sure there aren't any null values in our data
         exportData.ids.forEach((id) => {
            if (id) {
               // NOTE: go directly to the Model to get the full ABDefinition entry:
               data.definitions.push(ABDefinitionModel.objForID(id));
            }
         });

         data.siteObjectConnections = {};
         (Object.keys(exportData.siteObjectConnections) || []).forEach((k) => {
            data.siteObjectConnections[k] = (
               exportData.siteObjectConnections[k] || []
            ).filter((f) => f);
         });

         let SOC = data.siteObjectConnections;
         // {hash} { SiteObject.id : [ {importedField}.id, ...]}
         // just a shortcut variable.

         ///
         /// Transition Code:
         /// Gather UserFields and create users as connections
         ///

         var userFields = data.definitions.filter(
            (d) => d.type == "field" && d.json.key == "user"
         );

         const SITE_USER_OBJECT_ID = "228e3d91-5e42-49ec-b37c-59323ae433a1";
         // let SiteUser = Application.objects(
         //    (o) => o.id == SITE_USER_OBJECT_ID
         // )[0];

         // if (!SiteUser) {
         //    return reject(
         //       new Error("Unable to find live SiteUser Object by ID")
         //    );
         // }

         // if (!SiteUser) {
         //    SiteUser = ABDefinitionModel.objForID(SITE_USER_OBJECT_ID);

         //    if (userFields.length > 0) {
         //       // we need to add SITEUSER defs to our output:
         //       var ObjSiteUser = Application.objects(
         //          (o) => o.id == SITE_USER_OBJECT_ID
         //       )[0];
         //       if (!ObjSiteUser) {
         //          return reject(
         //             new Error("Unable to find live SiteUser Object by ID")
         //          );
         //       }

         //       // // add to our ids:
         //       // ObjSiteUser.exportIDs(ids);
         //       // ids = _.uniq(ids);

         //       // // Rebuild data.definitions
         //       // data.definitions = [];
         //       // ids.forEach((id) => {
         //       //    if (id) {
         //       //       // NOTE: go directly to the Model to get the full ABDefinition entry:
         //       //       data.definitions.push(ABDefinitionModel.objForID(id));
         //       //    }
         //       // });

         //       // NOTE: must pull userFields & SiteUser from data.definitions
         //       userFields = data.definitions.filter(
         //          (d) => d.type == "field" && d.json.key == "user"
         //       );

         //       SiteUser = data.definitions.find(
         //          (f) => f.id == SITE_USER_OBJECT_ID
         //       );
         //    }
         // }

         var USERNAME_FIELD_ID = "5760560b-c078-47ca-98bf-e18ac492a561";

         console.log(`converting ${userFields.length} user fields.`);

         if (userFields.length > 0) {
            SOC[SITE_USER_OBJECT_ID] = SOC[SITE_USER_OBJECT_ID] || [];
         }

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
                  field.settings.linkObject = SITE_USER_OBJECT_ID;
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
                     id: uuidLinkF,
                     type: "field",
                     key: "connectObject",
                     icon: "external-link",
                     isImported: "0",
                     columnName: `${object.tableName}_${field.columnName}`,
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
                        linkColumn: field.id,
                     },
                     translations: [
                        {
                           language_code: "en",
                           label:
                              object.translations[0].label +
                              "." +
                              field.translations[0].label,
                        },
                     ],
                  };

                  SOC[SITE_USER_OBJECT_ID].push(linkF.id);

                  // Bundle the LinkField json into a proper Defintiion:
                  var defLinkF = {
                     id: linkF.id,
                     type: linkF.type,
                     name: "USER->" + linkF.translations[0].label,
                     json: linkF,
                     createdAt: fDef.createdAt,
                     updatedAt: fDef.updatedAt,
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
               // and make sure our SiteUser.fieldIDs include the .id
               if (SOC[SITE_USER_OBJECT_ID].indexOf(prevExport.id) == -1) {
                  SOC[SITE_USER_OBJECT_ID].push(prevExport.id);
               }
            } // if !reimport
         });

         // convert user detail views from detailtext -> detailconnect
         var userDetailViews = data.definitions.filter(
            (d) => d.json.key == "detailtext"
         );
         // foreach view
         (userDetailViews || []).forEach((v) => {
            // get the def for : def.json.settings.fieldId
            // if that def.json.key == "user" add to our viewToChange
            var def = data.definitions.find(
               (d) => d.id == v.json.settings.fieldId
            );
            if (def && def.json.key == "user") {
               // update this view to detailconnect
               v.json.key = "detailconnect";
            }
         });

         ///
         /// Convert ABObjectQuery definitions that include user fields
         /// to properly reference SITE_USER object
         ///

         var hashQueriesWithUserFields = {};
         // { query.id : { query:{ABObjectQueryDef}, fieldDef:{alias, objectID, fieldID }, field}}
         var queries = data.definitions
            .filter((d) => d.type == "query")
            .map((d) => d.json);
         (queries || []).forEach((q) => {
            (q.fields || []).forEach((f) => {
               var field = data.definitions.find((d) => d.id == f.fieldID);
               if (field) {
                  field = field.json;
                  if (field.key == "user") {
                     hashQueriesWithUserFields[q.id] = {
                        query: q,
                        fieldDef: f,
                        field,
                     };
                  }
               }
            });
         });

         function parseJoinByAlias(curr, alias) {
            if (curr.alias == alias) {
               return curr;
            }

            var found = null;
            (curr.links || []).forEach((l) => {
               if (!found) {
                  found = parseJoinByAlias(l, alias);
               }
            });

            return found;
         }

         Object.keys(hashQueriesWithUserFields).forEach((key) => {
            var entry = hashQueriesWithUserFields[key];

            // add a new join for the current .fieldDef.alias  to the SITE_USER obj
            var join = parseJoinByAlias(
               entry.query.joins,
               entry.fieldDef.alias
            );
            if (!join) {
               console.log(
                  `Query[${entry.query.name}] could not resolve alias[${entry.fieldDef.alias}] `
               );
               return;
            }

            join.links = join.links || [];
            join.links.push({
               alias: uuidv4().split("-")[0],
               fieldId: entry.field.id,
               type: "left",
            });
         });

         ///
         /// Find Views that need to be updated due to the removal of Selectivity.
         ///
         try {
            let customViews = data.definitions
               .filter((d) => d.type == "view" && d.json.key == "fieldcustom")
               .map((d) => d.json);

            customViews.forEach((v) => {
               let field = data.definitions.find(
                  (d) => d.id == v.settings.fieldId
               );

               // if USER field -> Change View to a "connect" view
               if (field && field.json.key == "user") {
                  // change this view into a "connect"

                  v.key = "connect";
                  v.settings.objectWorkspace = {
                     filterConditions: {
                        glue: "and",
                     },
                  };
               }

               // if LIST (multiple) -> Change View to a "selectmultiple"
               if (
                  field &&
                  field.json.key == "list" &&
                  field.json.settings.isMultiple == 1
               ) {
                  v.key = "selectmultiple";
               }
            });

            // for all detailcustom views
            let detailCustomViews = data.definitions
               .filter((d) => d.type == "view" && d.json.key == "detailcustom")
               .map((d) => d.json);

            detailCustomViews.forEach((v) => {
               let field = data.definitions.find(
                  (d) => d.id == v.settings.fieldId
               );

               // if LIST (multiple) -> Change View to a "detailtext"
               if (
                  field &&
                  field.json.key == "list" &&
                  field.json.settings.isMultiple == 1
               ) {
                  v.key = "detailtext";
               }
            });
         } catch (e) {
            console.error("!!!!");
            console.error("!!!! ERROR Checking FieldCustom:", e);
            console.error("!!!!");
         }

         ///
         /// Refactoring objectUrls => objectIDs
         ///

         try {
            // pull all the Form definitions.
            let allForms = data.definitions
               .filter((d) => d.type == "view" && d.json.key == "form")
               .map((d) => d.json);

            // search the settings.recordRules[].actionSettings  for an .objectUrl reference.
            allForms.forEach((f) => {
               if (
                  f.settings.recordRules &&
                  f.settings.recordRules.length > 0
               ) {
                  f.settings.recordRules.forEach((rule) => {
                     if (
                        rule.actionSettings &&
                        rule.actionSettings.updateObjectURL
                     ) {
                        // replace with Object.id
                        let objRef = Application.urlResolve(
                           rule.actionSettings.updateObjectURL
                        );
                        if (!objRef) {
                           console.error(
                              `!!! Could not lookup object by url [${rule.actionSettings.updateObjectURL}]`,
                              rule
                           );
                           return;
                        }

                        rule.actionSettings.updateObjectID = objRef.id;
                        // delete rule.actionSettings.updateObjectURL;
                     }
                  });
               }
            });
         } catch (e) {
            console.error("Error scanning for .updateObjectURL", e);
         }

         ///
         /// Gather any related files and include in json definitions.
         ///

         async.series(
            [
               // Pull out our Roles
               (done) => {
                  var roleIDs = Object.keys(exportData.roles || {});
                  if (roleIDs.length == 0) {
                     done();
                     return;
                  }
                  const objRole = ABSystemObject.getObjectRole();
                  const PK = objRole.PK();
                  objRole
                     .modelAPI()
                     .findAll({
                        where: {
                           glue: "and",
                           rules: [
                              {
                                 key: PK,
                                 rule: "in",
                                 value: roleIDs,
                              },
                           ],
                        },
                        populate: true,
                     })
                     .then((list) => {
                        // clean up our entries to not try to include
                        // current User data and redundant __relation fields
                        (list || []).forEach((role) => {
                           delete role.id;
                           role.users = [];
                           delete role.scopes__relation;
                           (role.scopes || []).forEach((s) => {
                              delete s.id;
                              s.createdBy = null;
                           });
                        });
                        data.roles = list;
                        done();
                     })
                     .catch((err) => {
                        done(err);
                     });
               },

               // start with the ABFieldImage.defaultImage references:
               // ABFieldImage
               (done) => {
                  var imageFields = data.definitions.filter(
                     (d) => d.type == "field" && d.json.key == "image"
                  );
                  var doOne = (cb) => {
                     if (imageFields.length == 0) {
                        return cb();
                     }

                     var fieldDef = imageFields.shift();
                     var imageID = fieldDef.json.settings.defaultImageUrl;
                     var objectOfField = null;
                     Application.objectsAll().forEach((o) => {
                        if (!objectOfField) {
                           if (
                              o.fields((f) => f.id == fieldDef.id).length > 0
                           ) {
                              objectOfField = o;
                           }
                        }
                     });

                     OPImageUpload.find({
                        uuid: imageID,
                     })
                        .then(function (opImage) {
                           console.log("opImage:", opImage);
                           if (opImage.length == 0) {
                              var errmsg = `Error: unable to find default image row for field[${fieldDef.id}] defaultImageUrl[${imageID}]`;
                              console.error(errmsg);
                              data.errors.push(errmsg);
                              doOne(cb); // keep going
                              return;
                           }

                           var image = opImage[0];
                           data.files[imageID] = {
                              meta: {
                                 // Wanted:
                                 created_at: AppBuilder.rules.toSQLDateTime(
                                    image.createdAt
                                 ),
                                 updated_at: AppBuilder.rules.toSQLDateTime(
                                    image.updatedAt
                                 ),
                                 field: fieldDef.id,
                                 object: objectOfField
                                    ? objectOfField.id
                                    : null,
                                 // pathFile: ???
                                 file: image.image, // the name of the original file
                                 size: image.size,
                                 uploadedBy: null,
                                 type: image.type,
                                 info: null,
                              },
                              contents: "--data--",
                           };

                           var pathFile = path.join(
                              destinationPath(image.app_key),
                              image.image
                           );
                           fs.readFile(
                              pathFile,
                              { encoding: "base64" },
                              (err, fileData) => {
                                 if (err) {
                                    var fileErr = `Error: unable to find default image file for field[${fieldDef.id}] path[${pathFile}]`;
                                    console.error(fileErr);
                                    data.errors.push(fileErr);
                                    // data.files[imageID].contents = null;
                                 }
                                 data.files[imageID].contents = fileData;
                                 doOne(cb);
                              }
                           );
                        })
                        .catch(function (err) {
                           var strErr = err.toString();
                           console.error(strErr);
                           data.errors.push(strErr);
                           doOne(cb); // keep going
                        });
                  };

                  doOne((err) => {
                     done(err);
                  });
               },

               // Now lookup any docx views and pull the embedded templates:
               (done) => {
                  var templateViews = data.definitions.filter(
                     (d) => d.type == "view" && d.json.key == "docxBuilder"
                  );

                  var doOne = (cb) => {
                     if (templateViews.length == 0) {
                        return cb();
                     }

                     var viewDef = templateViews.shift();
                     var fileID = viewDef.json.settings.filename;

                     OPFileUpload.find({ uuid: fileID })
                        .then((files) => {
                           if (files.length == 0) {
                              var errmsg = `Error: unable to find docx template[${fileID}] for view[${viewDef.id}]`;
                              console.error(errmsg);
                              data.errors.push(errmsg);
                              doOne(cb); // keep going
                              return;
                           }

                           var file = files[0];
                           data.files[fileID] = {
                              meta: {
                                 // Wanted:
                                 created_at: AppBuilder.rules.toSQLDateTime(
                                    file.createdAt
                                 ),
                                 updated_at: AppBuilder.rules.toSQLDateTime(
                                    file.updatedAt
                                 ),
                                 field: null,
                                 object: null,
                                 // pathFile: ???
                                 file: file.file, // the name of the original file
                                 size: file.size,
                                 uploadedBy: null,
                                 type: file.type,
                                 info: null,
                              },
                              contents: "--data--",
                           };

                           var pathFile = path.join(file.pathFile, file.file);
                           fs.readFile(
                              pathFile,
                              { encoding: "base64" },
                              (err, fileData) => {
                                 if (err) {
                                    var fileErr = `Error: unable to find docx file for field[${viewDef.id}] path[${pathFile}]`;
                                    console.error(fileErr);
                                    data.errors.push(fileErr);
                                    // data.files[imageID].contents = null;
                                 }
                                 data.files[fileID].contents = fileData;
                                 doOne(cb);
                              }
                           );
                        })
                        .catch(function (err) {
                           var strErr = err.toString();
                           console.error(strErr);
                           data.errors.push(strErr);
                           doOne(cb); // keep going
                        });
                  };

                  doOne((err) => {
                     done(err);
                  });
               },
            ],
            (err) => {
               if (err) {
                  return reject(err);
               }

               resolve(data);
            }
         );
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
   appFromJSON: function (data, userData) {
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
                           type: "import",
                        }).catch((err) => {
                           //                            console.log(`>>>>>>>>>>>>>>>>>>>>>>
                           // ${err.toString()}
                           // >>>>>>>>>>>>>>>>>>>>>>`);

                           if (err.toString().indexOf("already exists") > -1) {
                              // console.log("===> trying an update instead.");
                              return ABDefinition.update(def.id, def, {
                                 user: userData.username,
                                 json: { filename: importFileName },
                                 type: "import",
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
                           type: "import",
                        }).catch((err) => {
                           if (err.toString().indexOf("already exists") > -1) {
                              // console.log("===> trying an update instead.");
                              return ABDefinition.update(def.id, def, {
                                 user: userData.username,
                                 json: { filename: importFileName },
                                 type: "import",
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
   },
};
