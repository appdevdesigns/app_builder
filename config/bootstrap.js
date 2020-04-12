/**
 * Bootstrap
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#documentation
 */
var path = require("path");
var AD = require("ad-utils");
var fs = require("fs");
var async = require("async");

var ABGraphObject = require(path.join("..", "api", "graphModels", "ABObject"));
var ABGraphQuery = require(path.join("..", "api", "graphModels", "ABQuery"));

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

            initialGraphDB,
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
            cb(err);
         }
      );
   });
   // AppBuilder.buildDirectory.init();		// start the build directory re creation
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

   tasks.push(
      new Promise((resolve, reject) => {
         ABGraphObject.find()
            .catch(reject)
            .then((objects) => {
               objects.forEach((obj) => {
                  // it will be cached here
                  obj.toABClass();
               });

               resolve();
            });
      })
   );

   tasks.push(
      new Promise((resolve, reject) => {
         ABGraphQuery.find({
            relations: ["objects"]
         })
            .catch(reject)
            .then((queries) => {
               (queries || []).forEach((q) => {
                  // it will be cached here
                  q.toABClass();
               });

               resolve();
            });
      })
   );

   Promise.all(tasks)
      .catch(next)
      .then(() => next());
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
            // 	delay += sails.config.appbuilder.mcc.pollFrequency;
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
                     `Provided email was not found. [${createParams["New Coach Email"]}]`
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
      // 			notify,
      // 			recipients,
      // 			body
      // 		});

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

function initialGraphDB(next) {
   ABGraphDB.initial()
      .catch(next)
      .then(() => {
         next();
      });
}

function initialSystemObjects(next) {
   ABSystemObject.initial()
      .catch(next)
      .then(() => {
         next();
      });
}
