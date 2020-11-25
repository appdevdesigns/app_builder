/**
 * Generate models and controllers for AppBuilder apps.
 */

const fs = require("fs");
const path = require("path");
const AD = require("ad-utils");
const _ = require("lodash");
const moment = require("moment");
const uuid = require("node-uuid");

const ABApplication = require(path.join(
   "..",
   "classes",
   "platform",
   "ABApplication"
));
// const ABGraphApplication = require(path.join(
//    "..",
//    "graphModels",
//    "ABApplication"
// ));
// const ABGraphObject = require(path.join("..", "graphModels", "ABObject"));
// const ABGraphQuery = require(path.join("..", "graphModels", "ABQuery"));

const FieldManager = require(path.join(
   "..",
   "classes",
   "core",
   "ABFieldManager.js"
));

// Build a reference of AB defaults for all supported Sails data field types
var sailsToAppBuilderReference = {};
FieldManager.allFields().forEach((Field) => {
   let field = new Field({ settings: {} }, {});
   field.fieldOrmTypes().forEach((type) => {
      sailsToAppBuilderReference[type] = {
         key: field.key,
         icon: field.icon,
         settings: field.settings
      };
   });
});

var reloadTimeLimit = 10 * 1000 * 60; // 10 minutes
var cliCommand = "appdev"; // use the global appdev command

var appsBuildInProgress = {}; // a hash of deferreds for apps currently being built.
// {  ABApplication.id : dfd }

// var __dfdBuildDirectoryCreated = null;

var DataFields = {};

function importDataFields(next) {
   var dataFieldPath = path.join(__dirname, "data_fields");

   DataFields = {};

   var ignoreFiles = [".DS_Store", "dataFieldTemplate.js"];

   fs.readdir(dataFieldPath, function(err, files) {
      if (err) {
         ADCore.error.log("Service:AppBuilder:Error reading in Data Fields.", {
            error: err,
            path: dataFieldPath
         });
         next(err);
         return;
      }

      files.forEach(function(file) {
         // if not one of our ignored files:
         if (ignoreFiles.indexOf(file) == -1) {
            DataFields[path.parse(file).name] = require(path.join(
               dataFieldPath,
               file
            ));
         }
      });

      next();
   });
}

function notifyToClients(reloading, step, action, options) {
   var data = {
      reloading: reloading
   };

   if (step) data.step = step;

   if (action) data.action = action;

   if (options) data.options = options;

   sails.sockets.blast("server-reload", data);
}

function getObjectModel(objectId) {
   var dfd = AD.sal.Deferred();
   ABObject.findOne({ id: objectId })
      .fail(function(err) {
         dfd.reject(err);
      })
      .then(function(result) {
         dfd.resolve(result);
      });

   return dfd;
}

function getPageKey(appName, pageName) {
   return ["opstools", appName, pageName.toLowerCase()].join("."); // appName.pageName
}

module.exports = {
   /**
    * AppBuilder.paths
    *
    * methods to return specific paths for common items:
    */
   paths: {
      sailsBuildDir: function() {
         return path.join(
            sails.config.appPath,
            "data",
            "app_builder",
            "sailsAlter"
         );
      }
   },

   routes: {
      /**
       * @method AppBuilder.routes.verifyAndReturnObject
       * pulls the current ABApplication and ABObject from the provided input url parameters:
       * @param {request} req  sails.req object
       * @param {response} res sails.res object
       * @return {Promise}  .resolve( {ABObject} )
       */
      verifyAndReturnObject: function(req, res) {
         let result;
         let objID = req.param("objID", -1);

         sails.log.verbose("... objID:" + objID);

         // Verify input params are valid:
         let invalidError = null;

         if (objID == -1) {
            invalidError = ADCore.error.fromKey("E_MISSINGPARAM");
            invalidError.details = "missing object.id";
         }
         if (invalidError) {
            sails.log.error(invalidError);
            invalidError.HTTPCode = 400;
            // res.AD.error(invalidError, 400);
            return Promise.reject(invalidError);
         }

         let newInstance = (def) => {
            if (def.type == "query") {
               return ABServerApp.queryNew(def);
            } else {
               // this must be an Object
               return ABServerApp.objectNew(def);
            }
         };

         let sendError = () => {
            if (!result) {
               // error: couldn't find the application
               var err = ADCore.error.fromKey("E_NOTFOUND");
               err.message = "Object/Query not found.";
               // err.appID = appID;
               err.objID = objID;
               sails.log.error(err);
               res.AD.error(err, 404);
               return Promise.reject(err);
            }
         };

         return Promise.resolve()
            .then(() => {
               // Get from caching
               result = ABObjectCache.get(objID);
               return Promise.resolve();
            })
            .then(() => {
               // if object already in the ABObjectCache, skip this step
               if (result) {
                  return;
               }

               // lookup object (if it isn't already in the cache):
               return new Promise((next, error) => {
                  // check the definition cache:
                  var def = ABDefinitionModel.definitionForID(objID);
                  if (def) {
                     result = newInstance(def);
                     next();
                     return;
                  } else {
                     // try a manual lookup then ...
                     ABDefinitionModel.find({ id: objID })
                        .then((list) => {
                           if (list && list.length > 0) {
                              def = list[0].json;
                              result = newInstance(def);
                           }
                           next();
                        })
                        .catch(error);
                  }
               });
            })
            .then(() => {
               if (result) {
                  return result;
               } else {
                  return sendError();
               }
            });
      }
   },

   /**
    * AppBuilder.rules
    *
    * A set of rules for AppBuilder objects.
    */
   rules: {
      /**
       * AppBuilder.rules.nameFilter
       *
       * return a properly formatted name for an AppBuilder object.
       *
       * @param {string} name  The name of the object we are conditioning.
       * @return {string}
       */
      nameFilter: function(name) {
         return String(name).replace(/[^a-z0-9]/gi, "");
      },

      /**
       * AppBuilder.rules.toApplicationNameFormat
       *
       * return a properly formatted Application Name
       *
       * @param {string} name  The name of the Application we are conditioning.
       * @return {string}
       */
      toApplicationNameFormat: function(name) {
         return "AB_" + AppBuilder.rules.nameFilter(name);
      },

      /**
       * AppBuilder.rules.toObjectNameFormat
       *
       * return a properly formatted Object/Table Name
       *
       * @param {string} objectName  The name of the Object we are conditioning.
       * @return {string}
       */
      toObjectNameFormat: function(objectName, oldFormat) {
         if (oldFormat) {
            objectName = oldFormat;
            // temp alert to catch any missing internal API calls:
            var alertErr = new Error(
               "Depreciated API: .toObjectNameFormat() no longer needs appName"
            );
            console.error(alertErr);
         }
         return "AB_" + AppBuilder.rules.nameFilter(objectName);
      },

      /**
       * AppBuilder.rules.toSQLDate
       *
       * return a properly formatted DateTime string for MYSQL 5.7 but ignore the time information
       *
       * @param {string} date  String of a date you want converted
       * @return {string}
       */
      toSQLDate: function(date) {
         return moment(date).format("YYYY-MM-DD");
         // return moment(date).format("YYYY-MM-DD 00:00:00");
      },

      /**
       * AppBuilder.rules.toSQLDateTime
       *
       * return a properly formatted DateTime string for MYSQL 5.7
       *
       * @param {string} date  String of a date you want converted
       * @return {string}
       */
      toSQLDateTime: function(date) {
         return moment(date)
            .utc()
            .format("YYYY-MM-DD HH:mm:ss");
      },

      /**
       * AppBuilder.rules.SQLDateRegExp
       *
       * property is a regular expression to validate SQL Date format
       */
      SQLDateRegExp: "^[0-9]{4}-[0-9]{2}-[0-9]{2}$",

      /**
       * AppBuilder.rules.SQLDateTimeRegExp
       *
       * property is a regular expression to validate SQL DateTime format
       */
      SQLDateTimeRegExp:
         "^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}$",

      /**
       * AppBuilder.rules.toFieldRelationFormat
       *
       * This function uses for define relation name of Knex Objection
       * return a relation name of column
       *
       * @param {string} colName  The name of the Column
       * @return {string}
       */
      toFieldRelationFormat: function(colName) {
         return AppBuilder.rules.nameFilter(colName) + "__relation";
      },

      /**
       * AppBuilder.rules.toJunctionTableNameFormat
       *
       * return many-to-many junction table name
       *
       * @param {string} appName  The name of the Application for this object
       * @param {string} sourceTableName  The name of the source object we are conditioning.
       * @param {string} targetTableName  The name of the target object we are conditioning.
       * @param {string} colName
       * @return {string}
       */
      toJunctionTableNameFormat: function(
         appName,
         sourceTableName,
         targetTableName,
         colName
      ) {
         // The maximum length of a table name in MySql is 64 characters
         appName = this.toApplicationNameFormat(appName);
         if (appName.length > 17) appName = appName.substring(0, 17);

         if (sourceTableName.length > 15)
            sourceTableName = sourceTableName.substring(0, 15);

         if (targetTableName.length > 15)
            targetTableName = targetTableName.substring(0, 15);

         colName = this.nameFilter(colName);
         if (colName.length > 14) colName = colName.substring(0, 14);

         return "{appName}_{sourceName}_{targetName}_{colName}"
            .replace("{appName}", appName)
            .replace("{sourceName}", sourceTableName)
            .replace("{targetName}", targetTableName)
            .replace("{colName}", colName);
      },

      /**
       * AppBuilder.rules.toJunctionTableFK
       *
       * return foriegnkey (FK) column name for a junction table name
       *
       * @param {string} objectName  The name of the Object with a connection
       * @param {string} columnName  The name of the connection columnName.
       * @return {string}
       */
      toJunctionTableFK: function(objectName, columnName) {
         var fkName = objectName + "_" + columnName;

         if (fkName.length > 64) fkName = fkName.substring(0, 64);

         return fkName;
      },

      /**
       * @method AppBuilder.rules.isUuid
       *
       * @param {string} key
       * @return {boolean}
       */
      isUuid: function(key) {
         var checker = RegExp(
            "^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
            "i"
         );
         return checker.test(key);
      }
   },

   registerNavBarArea: function(appID) {
      return new Promise((resolve, reject) => {
         var Application = null;

         // if we get here, we start building this app:
         // So mark that it is in progress:
         // appsBuildInProgress[appID] = dfd;

         async.series(
            [
               function(next) {
                  var appDef = ABDefinitionModel.definitionForID(appID);
                  if (appDef) {
                     Application = new ABApplication(appDef);
                     next();
                  } else {
                     var error = new Error(
                        `AppBuilder.registerNavBarArea(): unknown Application[${appID}]`
                     );
                     next(error);
                  }
               },

               // make sure OpsPortal navigation has an area for this application defined:
               function(next) {
                  // if this was our first time to create the App,
                  // then create an area.
                  // Dont keep creating one since they might want to remove it using the
                  // Live Navigation Editor

                  var areaName = Application.name;
                  var areaKey = Application.areaKey();
                  var label = areaName; // default if no translations provided

                  // now take the 1st translation we find:
                  (Application.json.translations || []).some(function(trans) {
                     if (label == areaName) {
                        label = trans.label;
                        return true; // stops the looping.
                     }
                  });

                  var defaultArea = {
                     key: areaKey,
                     icon: "fa-cubes",
                     isDefault: false,
                     label: label,
                     context: areaKey
                  };

                  // Note: this will only create it if it doesn't already exist.
                  OPSPortal.NavBar.Area.create(defaultArea, function(
                     err,
                     area
                  ) {
                     // area is null if already existed,
                     // not null if just created:

                     next(err);
                  });
               }
            ],
            function(err) {
               if (err) reject(err);
               else resolve({});
            }
         );
      });
   },

   /**
    * Update NavBar.area label
    */
   updateNavBarArea: function(appID) {
      return new Promise((resolve, reject) => {
         var Application;

         async.series(
            [
               function(next) {
                  var appDef = ABDefinitionModel.definitionForID(appID);
                  if (appDef) {
                     Application = new ABApplication(appDef);
                     next();
                  } else {
                     var error = new Error(
                        `AppBuilder.registerNavBarArea(): unknown Application[${appID}]`
                     );
                     next(error);
                  }
               },
               function(next) {
                  var areaName = Application.name;
                  var areaKey = Application.areaKey();
                  var label = areaName; // default if no translations provided
                  (Application.json.translations || []).some(function(trans) {
                     if (label == areaName) {
                        label = trans.label;
                        return true; // stops the looping.
                     }
                  });
                  var updateArea = {
                     key: areaKey,
                     label: label
                  };

                  OPSPortal.NavBar.Area.exists(areaKey).then(function(exists) {
                     if (exists) {
                        OPSPortal.NavBar.Area.update(updateArea).then(function(
                           err
                        ) {
                           next(err);
                        });
                     } else {
                        AppBuilder.registerNavBarArea(appID)
                           .then(function() {
                              next();
                           })
                           .catch(next);
                     }
                  }, next);
               }
            ],
            function(err) {
               if (err) reject(err);
               else resolve();
            }
         );
      });
   },

   /**
    * @method updateNavView
    *
    * @param {ABApplication} application
    * @param {Object} options - {
    *                              name: string,
    *                              label: string,
    *                              pageID: uuid,
    *                              icon: string [optional - "file-o"],
    *                              isAdminPage: boolean
    *                          }
    * @param {string} langCode
    *
    * @return Promise
    */
   updateNavView: function(application, options, langCode) {
      if (!options) return Promise.reject(new Error("invalid page"));

      var appID = application.id,
         appName = AppBuilder.rules.toApplicationNameFormat(application.name),
         pageName = AppBuilder.rules.nameFilter(options.name),
         pageKey = getPageKey(appName, pageName),
         toolKey = _.kebabCase(pageKey),
         toolLabel = options.label,
         pagePermsAction = pageKey + ".view",
         pagePerms = "adcore.admin," + pagePermsAction;

      let controllerIncludes = [];

      // Admin page
      if (options.isAdminPage) {
         controllerIncludes = [
            {
               // Switching to the new ABAdminLiveTool controller:
               key: "opstools.BuildApp.ABAdminLiveTool",
               path: "opstools/BuildApp/controllers/ABAdminLiveTool.js",
               init: {
                  app: application.id
               }
            }
         ];
      }
      // Normal page
      else {
         controllerIncludes = [
            {
               // Switching to the new ABLiveTool controller:
               key: "opstools.BuildApp.ABLiveTool",
               path: "opstools/BuildApp/controllers/ABLiveTool.js",
               init: {
                  app: application.id,
                  page: options.pageID
               }
            }
         ];
      }

      var roles = [];
      var objectIncludes = [];
      var pages = {};
      var modelNames = [];

      return (
         Promise.resolve()

            // Create Page's permission action
            .then(() => {
               return new Promise((resolve, reject) => {
                  // var page = pages[pageID];
                  // page.permissionActionKey = pagePermsAction;

                  Permissions.action
                     .create({
                        key: pagePermsAction,
                        description:
                           "Allow the user to view the " +
                           appName +
                           "'s " +
                           pageName +
                           " page",
                        language_code: langCode || "en"
                     })
                     .always(function() {
                        // If permission action already exists, that's fine.
                        resolve();
                     });
               });
            })

            // Find assign roles
            .then(() => {
               return new Promise((resolve, reject) => {
                  // 'opstools.' + appName + '.view';
                  var action_key = application.actionKeyName();

                  Permissions.getRolesByActionKey(action_key).then(function(
                     result
                  ) {
                     roles = result;

                     resolve();
                  },
                  reject);
               });
            })

            // Assign Page's permission action to assign roles
            .then(() => {
               return new Promise((resolve, reject) => {
                  var assignActionTasks = [];

                  roles.forEach(function(r) {
                     assignActionTasks.push(function(callback) {
                        Permissions.assignAction(r.id, pagePermsAction)
                           .fail(function(err) {
                              callback(err);
                           })
                           .then(function() {
                              callback();
                           });
                     });
                  });

                  async.parallel(assignActionTasks, function(err) {
                     if (err) {
                        reject(err);
                     } else {
                        resolve();
                     }
                  });
               });
            })

            // Create OPView entry
            .then(() => {
               return new Promise((resolve, reject) => {
                  OPSPortal.View.createOrUpdate(
                     pageKey,
                     objectIncludes,
                     controllerIncludes
                  )
                     .fail(reject)
                     .done(function() {
                        resolve();
                     });
               });
            })

            // create a Tool Definition for the OP Portal Navigation
            .then(() => {
               return new Promise((resolve, reject) => {
                  // sails.log('create tool definition')
                  var areaName = application.name;
                  var areaKey = application.areaKey();

                  var def = {
                     key: toolKey,
                     permissions: pagePerms,
                     icon: options.icon || "file-o",
                     label: toolLabel,
                     // context: pageKey,
                     controller: "OPView",
                     isController: false,
                     options: { url: "/opsportal/view/" + pageKey },
                     version: "0"
                  };

                  OPSPortal.NavBar.ToolDefinition.exists(toolKey, function(
                     error,
                     exists
                  ) {
                     if (error) return reject(error);

                     // update
                     if (exists) {
                        OPSPortal.NavBar.ToolDefinition.update(def, function(
                           err,
                           toolDef
                        ) {
                           if (err) reject(err);
                           else resolve();
                        });
                     }
                     // create new
                     else {
                        OPSPortal.NavBar.ToolDefinition.create(def, function(
                           err,
                           toolDef
                        ) {
                           if (err) reject(err);
                           else resolve();
                        });
                     }
                  });
               });
            })

            // make sure our ToolDefinition is linked to our Area Definition.
            .then(() => {
               return new Promise((resolve, reject) => {
                  // sails.log('... todo: link tooldef to area');

                  OPSPortal.NavBar.Area.link(
                     {
                        keyArea: application.areaKey(),
                        keyTool: toolKey,
                        instance: {
                           icon: "fa-cube",
                           permissions: pagePerms,
                           options: {
                              is: "there"
                           }
                        }
                     },
                     function(err) {
                        if (err) {
                           if (err.code == "E_AREANOTFOUND") {
                              sails.log.info(
                                 "... Area[" +
                                    application.areaKey() +
                                    "] not found.  Move along ... "
                              );
                              // this probably means that they deleted this default area
                              // using the Navigation Editor.
                              // no problem here:
                              resolve();
                              return;
                           }

                           reject(err);
                        }

                        resolve();
                     }
                  );
               });
            })

            // change label of tool to display UI
            .then(() => {
               return new Promise((resolve, reject) => {
                  let options = {
                     toolkey: toolKey,
                     language_code: langCode || "en",
                     label: toolLabel
                  };

                  OPSPortal.NavBar.Tool.updateLabel(options, function(err) {
                     if (err) reject(err);
                     else resolve();
                  });
               });
            })
      );
   },

   removeNavView: function(application, pageName) {
      if (!pageName) return Promise.reject(new Error("invalid page"));

      pageName = AppBuilder.rules.nameFilter(pageName);

      var appID = application.id,
         appName = AppBuilder.rules.toApplicationNameFormat(application.name),
         pageKey = getPageKey(appName, pageName),
         toolKey = _.kebabCase(pageKey),
         pagePermsAction = pageKey + ".view";

      return Promise.resolve()

         .then(() => {
            return new Promise((resolve, reject) => {
               OPConfigTool.destroy({ key: toolKey }).then(function(result) {
                  resolve();
               }, reject);
            });
         })
         .then(() => {
            // Remove OPView entry
            return new Promise((resolve, reject) => {
               OPSPortal.View.remove(pageKey).then(function() {
                  resolve();
               }, reject);
            });
         })
         .then(() => {
            // Remove a Tool Definition for the OP Portal Navigation
            return new Promise((resolve, reject) => {
               OPSPortal.NavBar.ToolDefinition.remove(toolKey).then(function() {
                  resolve();
               }, reject);
            });
         })
         .then(() => {
            // Remove permissions of pages
            return new Promise((resolve, reject) => {
               Permissions.action
                  .destroyKeys([pagePermsAction])
                  .then(function(data) {
                     resolve();
                  }, reject);
            });
         });
   },

   /**
    * AppBuilder.mobileApps(appID)
    * return all the mobileApps for a given Application.
    * if appID is not provided, then ALL mobile apps will be returned.
    * @param {int} appID  the ABApplication.id of the ABApplication
    * @return {Promise} resolved with a [ {ABMobileApp}]
    */
   mobileApps: function(appID) {
      return new Promise((resolve, reject) => {
         var mobileApps = [];

         var cond = {};
         if (appID) {
            cond = { id: appID };
         }

         var list = ABApplication.applications();
         list.forEach((l) => {
            var listMA = l.mobileApps();

            //// NOTE: at this point each listMA entry is an instance of ABMobileApp
            if (listMA.length > 0) {
               mobileApps = mobileApps.concat(listMA);
            }
         });

         /// NOTE: we can remove this reference once we stop hardcoding the SDCApp:
         var ABMobileApp = require(path.join(
            "..",
            "classes",
            "platform",
            "ABMobileApp"
         ));

         /// Hard Code the SDC App here:
         /// 1st verify sails.config.codepush.* settings are defined:
         sails.config.codepush = sails.config.codepush || {};
         sails.config.codepush.production =
            sails.config.codepush.production || {};
         sails.config.codepush.staging = sails.config.codepush.staging || {};
         sails.config.codepush.develop = sails.config.codepush.develop || {};

         var SDCApp = new ABMobileApp({
            id: "SDC.id",
            settings: {
               deepLink: "",
               codePushKeys: {
                  production: {
                     ios:
                        sails.config.codepush.production.ios ||
                        "ios.codepush.production.key",
                     android:
                        sails.config.codepush.production.android ||
                        "android.codepush.production.key"
                  },
                  staging: {
                     ios:
                        sails.config.codepush.staging.ios ||
                        "ios.codepush.staging.key",
                     android:
                        sails.config.codepush.staging.android ||
                        "android.codepush.staging.key"
                  },
                  develop: {
                     ios:
                        sails.config.codepush.develop.ios ||
                        "ios.codepush.develop.key",
                     android:
                        sails.config.codepush.develop.android ||
                        "android.codepush.develop.key"
                  }
               },
               platforms: {
                  ios: {
                     // deeplink info:
                     deeplink: {
                        appID: "723276MJFQ.net.appdevdesigns.connexted",
                        paths: ["/ul"]
                     }
                  },
                  android: {
                     apk: {
                        // appbuilder/mobile/:mobileID/apk:
                        // should return one of these files:

                        // current points to the version that should be considered the
                        // 'current' one to download
                        current: "0",

                        // version id :  fileName
                        // '5':'mobileApp_v5.apk',
                        // '4':'mobileApp_v4.apk',
                        // '3':'mobileApp_v3.apk',
                        // '2':'mobileApp_v2.apk',
                        // '1':'mobileApp_v1.apk',
                        "0": "sdc-android.apk"
                     },
                     deeplink: {
                        relation: [
                           "delegate_permission/common.handle_all_urls"
                        ],
                        target: {
                           namespace: "connexted",
                           package_name: "net.appdevdesigns.connexted",
                           sha256_cert_fingerprints: [
                              "67:72:07:40:E0:CF:CA:9C:27:35:14:53:8E:A0:CA:E6:A1:EE:15:1C:A5:36:BB:47:E8:18:BF:CE:0D:47:D4:13"
                           ]
                        }
                     }
                  }
               }
            },
            translations: [
               {
                  language_code: "en",
                  label: "SDC App",
                  description: "Keep things running"
               }
            ],

            appID: "App.id" // not normally part of mobileApp data.  but can get from mobileApp.parent.id
         });

         mobileApps.unshift(SDCApp);

         // perform a translation:
         mobileApps.forEach((app) => {
            app.translate();
         });

         resolve(mobileApps);
      });
   }
};
