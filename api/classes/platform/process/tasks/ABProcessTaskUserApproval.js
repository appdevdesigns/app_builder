// import ABApplication from "./ABApplication"
// const ABApplication = require("./ABApplication"); // NOTE: change to require()

const path = require("path");
const ABProcessTaskUserApprovalCore = require(path.join(
   __dirname,
   "..",
   "..",
   "..",
   "core",
   "process",
   "tasks",
   "ABProcessTaskUserApprovalCore.js"
));

const ABProcessParticipant = require(path.join(
   __dirname,
   "..",
   "ABProcessParticipant"
));

const AB = require("ab-utils");
const reqAB = AB.reqAB({}, {});
reqAB.jobID = "ABProcessTaskUserApproval";

module.exports = class ABProcessTaskUserApproval extends ABProcessTaskUserApprovalCore {
   ////
   //// Process Instance Methods
   ////

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
         var myState = this.myState(instance);
         // if we haven't created a form entry yet, then do that:
         if (!myState.userFormID) {
            this._requestNewForm(instance)
               .then(resolve)
               .catch(reject);
         } else {
            // check the status of our user form:
            this._requestFormStatus(instance)
               .then(resolve)
               .catch(reject);
         }
      });
   }

   _requestNewForm(instance) {
      return Promise.resolve()
         .then(
            () =>
               new Promise((resolve, reject) => {
                  var jobData = {
                     name: this.name,
                     process: instance.id,
                     definition: this.process.id,
                     ui: this.formBuilder
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

                  if (parseInt(this.who) == 1) {
                     if (parseInt(this.toUsers.useRole) == 1) {
                        jobData.roles = this.toUsers.role;
                     }

                     if (parseInt(this.toUsers.useAccount) == 1) {
                        jobData.users = this.toUsers.account;
                     }

                     // pull user data from the user fields
                     if (parseInt(this.toUsers.useField) == 1) {
                        jobData.users = jobData.users || [];

                        // Copy the array because I don't want to mess up this.toUsers.account
                        jobData.users = jobData.users.slice(
                           0,
                           jobData.users.length
                        );

                        // Combine user list
                        (this.toUsers.fields || []).forEach((pKey) => {
                           let userData = jobData.data[pKey] || [];
                           if (userData && !Array.isArray(userData))
                              userData = [userData];

                           jobData.users = jobData.users.concat(
                              userData
                                 .filter((u) => u)
                                 .map((u) => u.uuid || u.id || u)
                           );
                        });

                        // Remove empty items
                        jobData.users = jobData.users.filter((uId) => uId);

                        // Remove duplicate items
                        jobData.users = _.uniq(
                           jobData.users,
                           false,
                           (u) => u.toString() // support compare with different types
                        );

                        resolve(jobData);
                     } else {
                        resolve(jobData);
                     }
                  } else {
                     // get roles & users from Lane

                     var myLane = this.myLane();
                     if (!myLane) {
                        var configError = new Error(
                           `Misconfiguration: no lane found for id:[${this.laneDiagramID}]`
                        );
                        reject(configError);
                        return;
                     }
                     if (myLane.useRole) {
                        jobData.roles = myLane.role;
                     }
                     if (myLane.useAccount) {
                        jobData.users = myLane.account;
                     }

                     resolve(jobData);
                  }
               })
         )
         .then(
            (jobData) =>
               new Promise((resolve, reject) => {
                  reqAB.serviceRequest(
                     "process_manager.userform.create",
                     jobData,
                     (err, userForm) => {
                        if (err) {
                           this.log(
                              instance,
                              "Error creating user form: " + err.toString()
                           );
                           reject(err);
                           return;
                        }
                        this.log(
                           instance,
                           `created  user form [${userForm.uuid}]`
                        );
                        var data = { userFormID: userForm.uuid };
                        this.stateUpdate(instance, data);
                        resolve(false);
                     }
                  );
               })
         );
   }

   _requestFormStatus(instance) {
      var myState = this.myState(instance);
      return new Promise((resolve, reject) => {
         var jobData = {
            formID: myState.userFormID
         };
         reqAB.log(`checking status on user form [${myState.userFormID}]`);
         reqAB.serviceRequest(
            "process_manager.userform.status",
            jobData,
            (err, userForm) => {
               if (err) {
                  this.log(
                     instance,
                     "Error checking user form status: " + err.toString()
                  );
                  reject(err);
                  return;
               }

               if (!userForm) {
                  var message = `unable to find userForm[${myState.userFormID}]!`;
                  var missingUserFormError = new Error(message);
                  this.log(message);
                  reject(missingUserFormError);
                  return;
               }

               if (userForm.status && userForm.status != "pending") {
                  var data = {
                     userFormResponse: userForm.response,
                     responder: userForm.responder
                  };
                  this.stateUpdate(instance, data);
                  this.stateCompleted(instance);
                  resolve(true);
               } else {
                  // still pending:
                  resolve(false);
               }
            }
         );
      });
   }

   _getUserListOfStartElement(instance) {
      let startElement = this.startElements[0];
      let objectOfStartElement = this.objectOfStartElement;

      if (
         !this.toUsers.fields ||
         !this.toUsers.fields.length ||
         startElement == null ||
         objectOfStartElement == null
      )
         return Promise.resolve([]);

      let processData = startElement.myState(instance).data || {};
      let abParticipant = new ABProcessParticipant(
         this.toUsers,
         this.process,
         this.application
      );
      return abParticipant.usersForFields(objectOfStartElement, processData);
   }
};
