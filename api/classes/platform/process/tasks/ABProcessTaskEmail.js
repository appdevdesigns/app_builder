// import ABApplication from "./ABApplication"
// const ABApplication = require("./ABApplication"); // NOTE: change to require()

const async = require("async");
const _ = require("lodash");
const path = require("path");
const ABProcessTaskEmailCore = require(path.join(
   __dirname,
   "..",
   "..",
   "..",
   "core",
   "process",
   "tasks",
   "ABProcessTaskEmailCore.js"
));

const ABProcessParticipant = require(path.join(
   __dirname,
   "..",
   "ABProcessParticipant"
));

const retry = require("../../UtilRetry.js");

const AB = require("ab-utils");
const reqAB = AB.reqAB({}, {});
reqAB.jobID = "ABProcessTaskEmail";

// const cote = require("cote");
// const client = new cote.Requester({
//     name: "ABProcessTaskEmail > emailer"
// });

module.exports = class ABProcessTaskEmail extends ABProcessTaskEmailCore {
   ////
   //// Process Instance Methods
   ////

   laneUserEmails(allLanes, instance) {
      if (!Array.isArray(allLanes)) {
         allLanes = [allLanes];
      }

      return new Promise((resolve, reject) => {
         var emails = [];
         var missingEmails = [];
         async.each(
            allLanes,
            (myLane, cb) => {
               let startElementData = this.startElements[0]
                  ? this.startElements[0].myState(instance).data
                  : null;

               myLane
                  .users(this.objectOfStartElement, startElementData)
                  .then((list) => {
                     list.forEach((l) => {
                        if (l.email) {
                           emails.push(l.email);
                        } else {
                           missingEmails.push(l.username);
                        }
                     });
                     cb();
                  })
                  .catch(cb);
            },
            (err) => {
               if (err) {
                  reject(err);
                  return;
               }
               if (missingEmails.length > 0) {
                  var text = "These Accounts have missing emails: ";
                  text += missingEmails.join(", ");
                  var error = new Error(text);
                  error.accounts = missingEmails;
                  reject(error);
               } else {
                  resolve(_.uniq(emails));
               }
            }
         );
      });
   }

   resolveAddresses(instance, field, method, select, custom) {
      return new Promise((resolve, reject) => {
         method = parseInt(method);

         switch (method) {
            case 0:
               // select by current/next lane

               var myLanes = [];

               // if "to" field, we look for Next Lane
               if (field == "to") {
                  // get next tasks.
                  var tasks = this.nextTasks(instance);

                  // find any tasks that are NOT in my current Lane
                  tasks = tasks.filter((t) => {
                     return t.laneDiagramID != this.laneDiagramID;
                  });

                  // HOWEVER, if NONE of my next tasks are in another lane,
                  // then go back to my original set of tasks, and use my SAME
                  // Lane ...
                  if (tasks.length == 0) {
                     tasks = this.nextTasks(instance);
                  }

                  // get the lanes associated with these tasks
                  tasks.forEach((t) => {
                     myLanes.push(
                        this.process.elementForDiagramID(tasks[0].laneDiagramID)
                     );
                  });
               } else {
                  // else "from" field: get current lane
                  myLanes.push(this.myLane());
               }

               if (myLanes.length == 0) {
                  var msg = `[${this.diagramID}].${field} == "${
                     field == "to" ? "Next" : "Current"
                  } Participant", but no lanes found.`;
                  var error = new Error(msg);
                  reject(error);
                  return;
               }

               this.laneUserEmails(myLanes, instance)
                  .then((emails) => {
                     var data = {};
                     data[field] = emails;
                     this.stateUpdate(instance, data);
                     resolve();
                  })
                  .catch(reject);

               break;

            case 1:
               // specify a role/user account

               // separate root object fields and process task fields
               var rootFields = [];
               var processFields = [];
               this.toUsers.fields.forEach((f) => {
                  if (f.indexOf(".") == -1) {
                     rootFields.push(f);
                  } else {
                     processFields.push(f);
                  }
               });

               var getUsersPromise = [];

               // pull user data from the user fields
               if (processFields.length) {
                  var jobData = {
                     name: this.name,
                     process: instance.id,
                     definition: this.process.id
                  };

                  var processData = {};
                  var listDataFields = this.process.processDataFields(this);
                  listDataFields.forEach((entry) => {
                     processData[entry.key] = this.process.processData(this, [
                        instance,
                        entry.key
                     ]);

                     if (
                        entry &&
                        entry.field &&
                        entry.field.key == "connectObject"
                     ) {
                        processData[
                           `${entry.key}.format`
                        ] = this.process.processData(this, [
                           instance,
                           `${entry.key}.format`
                        ]);
                     }
                  });
                  jobData.data = processData;

                  jobData.users = jobData.users || [];

                  // Copy the array because I don't want to mess up this.toUsers.account
                  jobData.users = jobData.users.slice(0, jobData.users.length);

                  // Combine user list
                  var allUserFields = [];
                  (processFields || []).forEach((pKey) => {
                     let userData = jobData.data[pKey] || [];
                     if (userData && !Array.isArray(userData))
                        userData = [userData];

                     allUserFields = allUserFields.concat(
                        userData
                           .filter((u) => u)
                           .map((u) => u.uuid || u.id || u)
                     );
                  });
                  allUserFields = allUserFields.filter((uId) => uId);

                  getUsersPromise.push(
                     new Promise((resolve, reject) => {
                        retry(() => SiteUser.find({ username: allUserFields }))
                           .then((listUsers) => {
                              // Remove empty items
                              jobData.email = listUsers.map((u) => u.email);

                              // Remove duplicate items
                              jobData.email = _.uniq(
                                 jobData.email,
                                 false,
                                 (u) => u.toString() // support compare with different types
                              );

                              resolve(jobData.email);
                           })
                           .catch(reject);
                     })
                  );
               }
               if (rootFields.length) {
                  // the logic for the users is handled in the
                  // ABProcessParticipant object.  So let's create a new
                  // object with our config values, and ask it for it's user
                  var tempLane = new ABProcessParticipant(
                     select,
                     this.process,
                     this.application
                  );
                  getUsersPromise.push(
                     new Promise((resolve, reject) => {
                        this.laneUserEmails(tempLane, instance)
                           .then((emails) => {
                              resolve(emails);
                           })
                           .catch(reject);
                     })
                  );
               }
               Promise.all(getUsersPromise)
                  .then((emails) => {
                     var allEmails = [];
                     emails.forEach((set) => {
                        allEmails = allEmails.concat(set);
                     });
                     var data = {};
                     data[field] = _.uniq(allEmails);
                     this.stateUpdate(instance, data);
                     resolve();
                  })
                  .catch(reject);
               break;

            case 2:
               // manually enter email(s)
               var data = {};
               data[field] = custom.split(",");
               this.stateUpdate(instance, data);
               resolve();
               break;
         }
      });
   }

   resolveToAddresses(instance) {
      return this.resolveAddresses(
         instance,
         "to",
         this.to,
         this.toUsers,
         this.toCustom
      );
   }

   resolveFromAddresses(instance) {
      return this.resolveAddresses(
         instance,
         "from",
         this.from,
         this.fromUsers,
         this.fromCustom
      );
   }

   /**
    * do()
    * this method actually performs the action for this task.
    * @param {obj} instance  the instance data of the running process
    * @return {Promise}
    *      resolve(true/false) : true if the task is completed.
    *                            false if task is still waiting
    */
   do(instance) {
      return new Promise((resolve, reject) => {
         var tasks = [];
         tasks.push(this.resolveToAddresses(instance));
         tasks.push(this.resolveFromAddresses(instance));

         Promise.all(tasks)
            .then(() => {
               var myState = this.myState(instance);
               if (!Array.isArray(myState.to)) {
                  myState.to = [myState.to];
               }
               if (Array.isArray(myState.from)) {
                  myState.from = myState.from.shift();
               }
               var jobData = {
                  email: {
                     to: myState.to,
                     //    .to  {array}|{CSV list} of email addresses

                     from: myState.from,
                     //    .from {string} the From Email

                     subject: myState.subject,
                     //    .subject {string} The subject text of the email

                     html: myState.message
                     //    .text {string|Buffer|Stream|attachment-like obj} plaintext version of the message
                     //    .html {string|Buffer|Stream|attachment-like obj} HTML version of the email.
                  }
               };

               reqAB.serviceRequest(
                  "notification_email.email",
                  jobData,
                  (err, results) => {
                     if (err) {
                        // err objects are returned as simple {} not instances of {Error}
                        var error = new Error(
                           `NotificationEmail responded with an error (${err.code ||
                              err.toString()})`
                        );
                        for (var v in err) {
                           error[v] = err[v];
                        }
                        reject(error);
                        return;
                     }

                     this.stateCompleted(instance);
                     this.log(instance, "Email Sent successfully");
                     resolve(true);
                  }
               );

               // client.send(
               //     {
               //         type: "notification.email",
               //         param: jobData
               //         // __timeout: 1000 * 60 * 2 // 2 min
               //     },
               //     (err, results) => {
               //         debugger;
               //         if (err) {
               //             // err objects are returned as simple {} not instances of {Error}
               //             var error = new Error(
               //                 `NotificationEmail responded with an error (${err.code ||
               //                     err.toString()})`
               //             );
               //             for (var v in err) {
               //                 error[v] = err[v];
               //             }
               //             reject(error);
               //             return;
               //         }

               //         this.stateCompleted(instance);
               //         this.log(instance, "Email Sent successfully");
               //         resolve(true);
               //     }
               // );
            })
            .catch((error) => {
               console.error(error);
               reject(error);
            });
      });
   }
};
