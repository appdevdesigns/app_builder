/**
 * Bootstrap
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#documentation
 */
var _ = require("lodash");
var path = require("path");
var AD = require("ad-utils");
var fs = require("fs");
var async = require("async");

const ABDefinition = require(path.join(
   __dirname,
   "..",
   "api",
   "classes",
   "platform",
   "ABDefinition"
));

const ABApplication = require(path.join(
   __dirname,
   "..",
   "api",
   "classes",
   "platform",
   "ABApplication"
));
const ABObject = require(path.join(
   __dirname,
   "..",
   "api",
   "classes",
   "platform",
   "ABObject"
));

var allDefinitions = [];

module.exports = function(cb) {
   AD.module.bootstrap(__dirname, (err) => {
      if (err) {
         cb(err);
         return;
      }

      // verify that sails.config.appbuilder.deeplink is set:
      if (!sails.config.appbuilder.deeplink) {
         sails.config.appbuilder.deeplink = sails.config.appbuilder.baseURL;
      }

      // let's verify some setup items are in place:
      async.series(
         [
            // verify .well-known directory exists:
            verifyWellKnownDir,
            verifyWellKnownConfigs,
            verifyDataDir,

            // define our ABDefinition Lifecycle callbacks
            loadDefinitionCallbacks,

            // load all our ABDefinitions
            loadDefinitions,

            // initialGraphDB,
            initialSystemObjects,
            cacheABClassObjects,

            setupPollingMCC,

            // NOTE: remove this when we no longer manually add the SDC app info:
            addSDCAppInfo,
            defaultEmailNotificationInvite,
            addSDCAppDataDirectory,
            addSDCObjectLifecycleBeforeCreate
         ],
         (err, data) => {
            if (err) {
               if (err.message) {
                  sails.log.error(
                     "Error during AppBuilder/config/bootstrap.js"
                  );
                  sails.log.error(err.message);
               }
            }
            cb(err);
         }
      );
   });
   // AppBuilder.buildDirectory.init();      // start the build directory re creation
};

function verifyWellKnownDir(next) {
   var pathDir = path.join(process.cwd(), "assets", ".well-known"); // path is from sails root
   fs.lstat(pathDir, function(err, stat) {
      if (err) {
         fs.mkdirSync(pathDir);
      }
      next();
   });
}

function verifyDataDir(next) {
   var pathDir = path.join(
      sails.config.appPath,
      sails.config.appbuilder.pathFiles
   );
   fs.lstat(pathDir, function(err, stat) {
      if (err) {
         sails.log.warn(
            "... making default AppBuilder data directory:",
            pathDir
         );
         fs.mkdirSync(pathDir);
      }
      next();
   });
}

function verifyWellKnownConfigs(next) {
   var CWD = process.cwd();

   // The deeplink config files:
   var defaultConfigContents = [
      { file: "assetlinks.json", content: "[]" },
      {
         file: "apple-app-site-association",
         content: '{"applinks":{"apps":[],"details":[]}}'
      }
   ];
   function processConfig(list, done) {
      if (list.length == 0) {
         done();
      } else {
         var config = list.shift();
         var filePath = path.join(CWD, "assets", ".well-known", config.file); // path is from sails root
         fs.lstat(filePath, function(err, stat) {
            function makeIt() {
               sails.log.warn(
                  "AppBuilder: " +
                     filePath.replace(CWD, "") +
                     " not found: creating"
               );
               fs.writeFileSync(filePath, config.content, "utf8");
               processConfig(list, done);
            }

            if (err) {
               makeIt();
            } else {
               if (stat.isFile()) {
                  processConfig(list, done);
               } else {
                  makeIt();
               }
            }
         });
      }
   }
   processConfig(defaultConfigContents, next);
}

function cacheABClassObjects(next) {
   let tasks = [];

   var genApp = ABSystemObject.getApplication();
   var objDefs = (allDefinitions || []).filter((d) => d.type == "object");
   objDefs.forEach((o) => {
      new ABObject(o.json, genApp);
   });

   // once the objects are created, then recreate the Queries that were
   // initially created without ABObjects in place.
   genApp.queriesClear();
   genApp.queriesAll();

   next();
}

function setupPollingMCC(next) {
   // skip this step
   if (
      sails.config.appbuilder &&
      sails.config.appbuilder.mcc &&
      sails.config.appbuilder.mcc.enabled === false
   )
      return next();

   var delay = sails.config.appbuilder.mcc.pollFrequency || 1000 * 5; // every 5 sec

   var timerId = setTimeout(function request() {
      // sails.log.debug(':: ABRelay.pollMCC():', delay);
      ABRelay.pollMCC()
         .then(() => {
            // do it again:
            timerId = setTimeout(request, delay);
         })
         .catch((err) => {
            // if (err.code == 'E_SERVER_TIMEOUT') {
            //    delay += sails.config.appbuilder.mcc.pollFrequency;
            // }

            var errString = err.toString();

            if (
               err.error &&
               (err.error.code == "ETIMEDOUT" ||
                  (err.message && err.message.indexOf("ESOCKETTIMEDOUT") > -1))
            ) {
               sails.log.debug(
                  "!!! ABRelay.pollMCC().catch() : Timeout detected!"
               );
            } else {
               if (errString.indexOf("ECONNREFUSED") > -1) {
                  // Problems communicating with MCC:
                  // we only want to ADCore.error.log()  once.
                  if (!sails.config.appbuilder._reportedConnRefused) {
                     sails.config.appbuilder._reportedConnRefused = 1;
                     ADCore.error.log(
                        "!!! ABRelay.pollMCC().catch(): MCC Communication: Connection Refused. ",
                        { errStr: errString, error: err }
                     );
                  } else {
                     sails.log.debug(
                        "!!! ABRelay.pollMCC().catch(): MCC Communication: Connection Refused. "
                     );
                  }
               } else {
                  // catch other errors
                  ADCore.error.log(
                     "!!! ABRelay.pollMCC().catch(): unexpected error:",
                     { errStr: err.toString(), error: err }
                  );
               }
            }

            // if still ok to continue then:
            timerId = setTimeout(request, delay);
         });
   }, delay);

   next();
}

function addSDCAppInfo(next) {
   var CWD = process.cwd();

   // get all MobileApps
   AppBuilder.mobileApps()
      .then((list) => {
         // Find the SDC app
         var SDC = list.filter((f) => {
            return f.id == "SDC.id";
         })[0];
         if (!SDC) next();

         // update Android data:  .well-known/assetlinks.json
         var filePath = path.join(
            CWD,
            "assets",
            ".well-known",
            "assetlinks.json"
         );
         var contents = fs.readFileSync(filePath, "utf8");
         var jsonContents = JSON.parse(contents);
         var deepLinkInfo = SDC.deepLinkConfig("android");
         var isThere = jsonContents.filter((c) => {
            return c.target.namespace == deepLinkInfo.target.namespace;
         })[0];
         if (!isThere) {
            jsonContents.push(deepLinkInfo);
            var newContents = JSON.stringify(jsonContents, null, 4);
            fs.writeFileSync(filePath, newContents, "utf8");
         }

         // update ios data: .well-known/apple-app-site-association
         filePath = path.join(
            CWD,
            "assets",
            ".well-known",
            "apple-app-site-association"
         );
         contents = fs.readFileSync(filePath, "utf8");
         jsonContents = JSON.parse(contents);
         var deepLinkInfo = SDC.deepLinkConfig("ios");
         var isThere = jsonContents.applinks.details.filter((c) => {
            return c.appID == deepLinkInfo.appID;
         })[0];
         if (!isThere) {
            jsonContents.applinks.details.push(deepLinkInfo);
            var newContents = JSON.stringify(jsonContents, null, 4);
            fs.writeFileSync(filePath, newContents, "utf8");
         }
         next();
      })
      .catch(next);
}

function defaultEmailNotificationInvite(next) {
   // Unit test: skip this step
   if (
      sails.config.appbuilder &&
      sails.config.appbuilder.email &&
      sails.config.appbuilder.email.enabled === false
   )
      return next();

   var filePath = path.join(
      __dirname,
      "..",
      "setup",
      "install",
      "mobile_qr_invite.ejs"
   );
   var contents = null; // fs.readFileSync(filePath, 'utf8');

   AppBuilder.mobileApps().then((list) => {
      function checkApp(list, cb) {
         if (list.length == 0) {
            cb();
         } else {
            var app = list.shift();
            sails.log("... checking default email for app:" + app.label);

            var Trigger = app.emailInviteTrigger();
            EmailNotifications.emailForTrigger(Trigger)
               .then((listEmails) => {
                  sails.log("    ... existing emails for app:", listEmails);

                  if (!listEmails || listEmails.length == 0) {
                     if (!contents) {
                        contents = fs.readFileSync(filePath, "utf8");
                     }

                     // Add default Email template here:
                     ENTemplateDesign.create({
                        templateTitle: app.label + " mobile invitation ",
                        templateBody: contents,
                        templateType: "One Column"
                     })
                        .then((template) => {
                           sails.log(
                              "     ... new template created:",
                              template
                           );

                           ENNotification.create({
                              notificationTitle: app.label + "install info", // can be anything
                              emailSubject: app.label + " app",
                              fromName: app.label,
                              fromEmail: "ric@zteam.biz",
                              setupType: "System",
                              eventTrigger: app.emailInviteTrigger(),
                              status: "Active",
                              templateDesignId: template.id
                           })
                              .then((enNotification) => {
                                 sails.log(
                                    "     ... new enNotification:",
                                    enNotification
                                 );
                                 checkApp(list, cb);
                              })
                              .catch(cb);
                        })
                        .catch(cb);

                     return;
                  }
                  checkApp(list, cb);
               })
               .catch(cb);
         }
      }
      checkApp(list, (err) => {
         if (err) {
            next(err);
            return;
         }

         next();
      });
   });
}

function addSDCAppDataDirectory(next) {
   // get all MobileApps
   AppBuilder.mobileApps()
      .then((list) => {
         // Find the SDC app
         var SDC = list.filter((f) => {
            return f.id == "SDC.id";
         })[0];
         if (!SDC) next();

         var pathFile = SDC.pathAPK();
         var parts = pathFile.split(path.sep);
         parts.pop();
         var pathMobileDir = parts.join(path.sep);

         fs.lstat(pathMobileDir, function(err, stat) {
            if (err) {
               sails.log.warn(
                  "... making default SDC data directory:",
                  pathMobileDir
               );
               fs.mkdirSync(pathMobileDir);
            }
            next();
         });
      })
      .catch(next);
}

function sdcObjectByID(ID) {
   // a helper fn() to reuse the .verifyAndReturnObject() method
   // of finding an Object.
   var mockReq = {
      param: (/* objID */) => {
         return ID;
      }
   };
   return AppBuilder.routes.verifyAndReturnObject(mockReq, {});
}

/**
 * @function addSDCObjectLifecycleBeforeCreate
 * setup the SDC beforeCreate lifecycle handler.
 * @param {fn} next  a node style callback
 */
function addSDCObjectLifecycleBeforeCreate(next) {
   // the SDC Coach Change Request object's beforeCreate key:
   var CoachChangeReqID = "fc8dac75-05cc-468b-b196-bce72286296a";

   ///
   /// The 1st handler we need to register is the ability to pre populate
   /// the .New Coach entry on a CoachChangeRequest when a NewCoachEmail is
   /// provided.
   ///
   /// this handler should be on the .beforeCreate object lifecycle:
   var key = `${CoachChangeReqID}.beforeCreate`;
   var handler = (createParams, cb) => {
      var allTasks = [];

      // //// testing:
      // createParams["New Coach Email"] = "jhausman@zteam.biz";
      // debugger;

      // if we have the New Coach Email but are missing a New Coach entry:
      if (createParams["New Coach Email"] && !createParams["New Coach"]) {
         // common error handler if we have any hiccups along the way:
         var bailError = (code, msg) => {
            var error = new Error(msg);
            error.code = code;
            throw error;
         };

         // get New Coach Email
         // get renData
         // add renData.Staff to createParams["New Coach"];

         var foundEmail;
         var task = Promise.resolve()
            .then(() => {
               // get the HrisEmail object:
               return sdcObjectByID("83a364fb-e181-45a9-a8de-c9db674fe641");
            })
            .then((objHRISEmail) => {
               if (!objHRISEmail) {
                  bailError("E_NOTFOUND", "Could not find HRIS Email Object.");
                  return;
               }
               return objHRISEmail.queryFind(
                  {
                     where: {
                        glue: "and",
                        rules: [
                           {
                              key: "email_address",
                              rule: "equals",
                              value: createParams["New Coach Email"]
                           }
                        ]
                     },
                     offset: 0,
                     limit: 1,
                     populate: false
                  },
                  {}
               );
            })
            .then((emailRows) => {
               console.log("Found Email Row:", emailRows);
               if (!emailRows || emailRows.length == 0) {
                  bailError(
                     "E_NOTFOUND",
                     `Provided email was not found. [${
                        createParams["New Coach Email"]
                     }]`
                  );
                  return;
               }
               foundEmail = emailRows[0];
               // now get the Staff object
               return sdcObjectByID("4759b063-67c6-4580-9c2e-fdede54ef51c");
            })
            .then((objStaff) => {
               if (!objStaff) {
                  bailError("E_NOTFOUND", `Could not find the Staff object.`);
                  return;
               }
               return objStaff.queryFind(
                  {
                     where: {
                        glue: "and",
                        rules: [
                           {
                              key: "Profile",
                              rule: "equals",
                              value: foundEmail.ren_id
                           }
                        ]
                     },
                     offset: 0,
                     limit: 1,
                     populate: false
                  },
                  {}
               );
            })
            .then((staffRows) => {
               if (!staffRows || staffRows.length == 0) {
                  bailError(
                     "E_NOTFOUND",
                     `Could not find Staff information for the provided email address.`
                  );
                  return;
               }

               // now update our create parameters with the populated Staff information.
               createParams["New Coach"] = staffRows[0].uuid;
            });

         allTasks.push(task);
      }

      // insert any other tasks here:

      Promise.all(allTasks)
         .then(() => {
            cb();
         })
         .catch(cb);
   };

   ///
   /// The 2nd handler we need to register is the ability to send an email
   /// to people related to a new coach change request.
   ///
   /// this handler should be on the .afterCreate object lifecycle:
   var key2 = `${CoachChangeReqID}.afterCreate`;
   var handler2 = (createParams, cb) => {
      console.log(`::: ${key2} handler.`);
      console.log(createParams);

      var notify = {
         emailSubject:
            "A coach change request has been made that you need to approve/deny.",
         fromName: "AppDev Team",
         fromEmail: "appdev@zteam.biz"
      };
      var recipients = [];
      var body = `
Please open the “myDevelopment” tool in your Connexted! app and tap on “Change Coach/Coachee” item and then tap on “Change Requests” to approve or deny the current coach change requests that you are connected to.

Thank you,
AppDev Team
`;

      var okToSend = true; // optimistic

      // decide who gets this email based upon the current Use Case.
      switch (createParams.UseCase) {
         case 1:
            if (
               createParams["New Coach Email"] &&
               createParams["Current Coach Email"]
            ) {
               recipients.push(createParams["New Coach Email"]);
               recipients.push(createParams["Current Coach Email"]);
            } else {
               okToSend = false;
            }
            break;

         case 2:
            if (createParams["New Coach Email"]) {
               recipients.push(createParams["New Coach Email"]);
            } else {
               okToSend = false;
            }
            break;

         case 4:
            if (
               createParams["Coachee Email"] &&
               createParams["Current Coach Email"]
            ) {
               recipients.push(createParams["Current Coach Email"]);
               recipients.push(createParams["Coachee Email"]);
            } else {
               okToSend = false;
            }
            break;
      }

      // recipients = ["jhausman@zteam.biz", "james.duncan@zteam.biz"];
      // okToSend = true;

      // console.log("Email to Send:", {
      //          notify,
      //          recipients,
      //          body
      //       });

      if (okToSend) {
         EmailNotifications.send({
            notify,
            recipients,
            body
         })
            .fail(cb)
            .then(function() {
               sails.log(
                  "ChangeCoachRequest.afterCreate(): Email sent successfully."
               );
               cb();
            });
      } else {
         sails.log(
            "Warning: ChangeCoachRequest.afterCreate(): not enough info to send email."
         );
         // Question: do we error out here?  or do we leave this, since this is expected in the
         // Object Builder interface when they click [add new row]?
         cb();
      }
   };

   ABModelLifecycle.register(key, handler);
   ABModelLifecycle.register(key2, handler2);
   next();
}

// function initialGraphDB(next) {
//    ABGraphDB.initial()
//       .catch(next)
//       .then(() => {
//          next();
//       });
// }

function prepareDefinition(values) {
   var def = values.json;
   if (typeof def == "string") {
      try {
         def = JSON.parse(def);
      } catch (e) {}
   }
   return def;
}
function loadDefinitionCallbacks(next) {
   //
   // Application Lifecycle
   //
   var ApplicationMaintainance = [
      "application.afterCreate",
      "application.afterUpdate"
   ];
   ApplicationMaintainance.forEach((key) => {
      ABModelLifecycle.register(key, (values, cb) => {
         var def = prepareDefinition(values);
         var pending = [];
         // track any Async operations.

         // .upudateNavBarArea() will update it if it exists, or create it if it
         // doesn't.  Will work for both .afterCreate && .afterUpdate:
         pending.push(AppBuilder.updateNavBarArea(def.id));

         // make sure all Async operations are complete before calling
         // our CB()
         Promise.all(pending)
            .then(() => {
               cb();
            })
            .catch((err) => {
               sails.log.error("application.afterCreate :: Error:", err);
               cb(err);
            });
      });
   });

   ABModelLifecycle.register("application.beforeDestroy", (values, cb) => {
      var def = prepareDefinition(values);
      var pending = [];
      // track any Async operations.

      debugger;
      // figure out our actionKeyName:
      var appName = AppBuilder.rules.toApplicationNameFormat(def.name);
      var actionKeys = [`opstools.${appName}.view`];
      var areaKey = _.kebabCase(`ab-${def.name}`);

      Promise.resolve()
         .then(() => {
            return Permissions.action.destroyKeys(actionKeys);
         })
         .then(() => {
            return OPSPortal.NavBar.Area.remove(areaKey);
         })
         .then(() => {
            cb();
         })
         .catch((err) => {
            sails.log.error("application.beforeDestroy :: Error:", err);
            cb(err);
         });
   });

   // ABObject.beforeCreate Lifecycle
   ABModelLifecycle.register("object.beforeCreate", (values, cb) => {
      var def = prepareDefinition(values);
      var pending = [];
      // track any Async operations.

      // Make sure .tableName is set:
      if (!def.tableName) {
         // NOTE: do NOT use ABSystemObject.getApplication() here!
         def.tableName = AppBuilder.rules.toObjectNameFormat(def.name);
      }

      // make sure all Async operations are complete before calling
      // our CB()
      Promise.all(pending)
         .then(() => {
            cb();
         })
         .catch((err) => {
            sails.log.error("object.beforeCreate :: Error:", err);
            cb(err);
         });
   });

   // ABObject.beforeCreate Lifecycle
   ABModelLifecycle.register("object.afterUpdate", (values, cb) => {
      var def = prepareDefinition(values);
      var pending = [];
      // track any Async operations.

      // After an Update, create a new instance of ABObject so
      // we update our ABObjectCache
      new ABObject(def, ABSystemObject.getApplication());

      // sails.log("object.afterUpdate(): new Object definitions:", def);

      // make sure all Async operations are complete before calling
      // our CB()
      Promise.all(pending)
         .then(() => {
            cb();
         })
         .catch((err) => {
            sails.log.error("object.afterUpdate :: Error:", err);
            cb(err);
         });
   });

   // ABField.afterUpdate Lifcycle
   ABModelLifecycle.register("field.afterUpdate", (values, cb) => {
      var def = prepareDefinition(values);
      var pending = [];
      // track any Async operations.

      // figure out which object is referencing this field
      var relatedObj = null;
      var allObjs = ABObjectCache.list();
      for (var i = 0; i < allObjs.length; i++) {
         var obj = allObjs[i];
         var field = obj.fields((f) => f.id == def.id)[0];
         if (field) {
            relatedObj = obj;
            break;
         }
      }

      // then re-create the object
      if (relatedObj) {
         sails.log("field.afterUpdate(): refreshing obj:", relatedObj.label);
         var objDef = ABDefinitionModel.definitionForID(relatedObj.id);
         if (objDef) {
            new ABObject(objDef, ABSystemObject.getApplication());
         } else {
            sails.error(
               "field.afterUpdate(): unable to pull definition for related object : ",
               relatedObj.id
            );
         }
      } else {
         sails.log(
            "field.afterUpdate(): unable to find ABObject for updated field:",
            def.id
         );
      }

      // make sure all Async operations are complete before calling
      // our CB()
      Promise.all(pending)
         .then(() => {
            cb();
         })
         .catch((err) => {
            sails.log.error("field.afterUpdate :: Error:", err);
            cb(err);
         });
   });

   // ABObjectQuery.beforeCreate Lifecycle
   var QueryDataValidations = ["query.beforeCreate", "query.beforeUpdate"];
   QueryDataValidations.forEach((key) => {
      ABModelLifecycle.register(key, (values, cb) => {
         var def = prepareDefinition(values);
         var pending = [];
         // track any Async operations.

         // Make sure .viewName is set:
         if (!def.viewName || def.viewName == "") {
            def.viewName = AppBuilder.rules.toObjectNameFormat(
               "View_" + def.name
            );
         }

         // make sure all Async operations are complete before calling
         // our CB()
         Promise.all(pending)
            .then(() => {
               cb();
            })
            .catch((err) => {
               sails.log.error(`${key} :: Error:`, err);
               cb(err);
            });
      });
   });

   // ABObjectQuery.afterCreate Lifecycle
   var QueryMaintainance = ["query.afterCreate", "query.afterUpdate"];
   QueryMaintainance.forEach((key) => {
      ABModelLifecycle.register(key, (values, cb) => {
         var def = prepareDefinition(values);
         var pending = [];
         // track any Async operations.

         // perform a Migrate.create() to create/update the Query Table.
         var qClass = ABSystemObject.getApplication().queryNew(def);
         pending.push(ABMigration.createQuery(qClass));

         // make sure all Async operations are complete before calling
         // our CB()
         Promise.all(pending)
            .then(() => {
               cb();
            })
            .catch((err) => {
               sails.log.error(`${key} :: Error:`, err);
               cb(err);
            });
      });
   });

   // ABObjectQuery.afterCreate Lifecycle
   var ViewMaintainance = ["view.afterCreate", "view.afterUpdate"];
   ViewMaintainance.forEach((key) => {
      ABModelLifecycle.register(key, (values, cb) => {
         var def = prepareDefinition(values);
         var pending = [];
         // track any Async operations.

         // If this is a New Page, that is a Root page (def.isRoot)
         // then create the OPs portal permissions:
         if (def.key == "page" && def.isRoot === "true") {
            // var Page = ABSystemObject.getApplication().pageNew(def);

            sails.log(`::: View.Page Create NavView (${def.name})`);

            // Find the Parent ABApplication
            var appDef = ABDefinition.definition(def.myAppID);
            if (appDef) {
               var pApp = new ABApplication(appDef);
               let pageName = "Application Admin Page";

               // 1)  Update Admin App page
               if (pApp.isAdminApp) {
                  let optionsAdmin = {
                     isAdminPage: true,
                     name: pageName,
                     label: "Admin",
                     icon: "fa-circle-o-notch" // TODO admin app icon
                  };

                  pending.push(AppBuilder.updateNavView(pApp, optionsAdmin));
               }
               // Remove Admin App page
               else {
                  pending.push(AppBuilder.removeNavView(pApp, pageName));
               }

               // 2) manage the pages Nav View Permission
               var label = def.name;
               if (def.translations && def.translations.length) {
                  label = def.translations[0].label;
               }
               let options = {
                  name: def.name,
                  label: label,
                  pageID: def.id,
                  icon: def.icon
               };

               pending.push(AppBuilder.updateNavView(pApp, options));
            } else {
               if (typeof def.myAppID == "undefined") {
                  sails.log(
                     `${key} :: Page[${def.id}] did not define a .myAppID, not configuring a NavBar view for this.`
                  );
               } else {
                  var err = new Error(
                     `${key} :: Error:Could not find Application[${def.myAppID}] for Page[${def.id}]`
                  );

                  sails.log.error(err);
                  //// TODO: better way to respond to this failed operation!
               }
            }
         }

         // make sure all Async operations are complete before calling
         // our CB()
         Promise.all(pending)
            .then(() => {
               cb();
            })
            .catch((err) => {
               sails.log.error(`${key} :: Error:`, err);
               cb(err);
            });
      });
   });

   ABModelLifecycle.register("view.beforeDestroy", (values, cb) => {
      var def = prepareDefinition(values);
      var pending = [];
      // track any Async operations.

      // If this is a Page, then remove the OPs portal permissions:
      if (def.key == "page") {
         // var Page = ABSystemObject.getApplication().pageNew(def);

         // Find the Parent ABApplication
         var appDef = ABDefinition.definition(def.myAppID);
         if (appDef) {
            var pApp = new ABApplication(appDef);
            let pageName = "Application Admin Page";

            // 1)  Remove Admin App page
            if (pApp.isAdminApp) {
               pending.push(AppBuilder.removeNavView(pApp, pageName));
            }

            // 2) remove the pages Nav View Permission
            pending.push(AppBuilder.removeNavView(pApp, def.name));
         } else {
            var err = new Error(
               `view.beforeDestroy :: Error:Could not find Application[${def.myAppID}] for Page[${def.id}]`
            );
            sails.log.error(err);

            //// TODO: better way to respond to this failed operation!
         }
      }

      // make sure all Async operations are complete before calling
      // our CB()
      Promise.all(pending)
         .then(() => {
            cb();
         })
         .catch((err) => {
            // if a NavView() fn returns an error, just post it here
            sails.log.error("view.beforeDestroy :: Error:", err);
            // and continue
            cb();
         });
   });

   next();
}

function loadDefinitions(next) {
   ABDefinitionModel.refresh()
      .then((allDefs) => {
         allDefinitions = allDefs;
         next();
      })
      .catch(next);
}

function initialSystemObjects(next) {
   ABSystemObject.initial()
      .catch(next)
      .then(() => {
         next();
      });
}
