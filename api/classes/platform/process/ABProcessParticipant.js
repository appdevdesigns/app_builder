/**
 * ABProcessParticipant
 * manages the participant lanes in a Process Diagram.
 *
 * Participants manage users in the system (when there are no lanes defined)
 * and provide a way to lookup a SiteUser.
 */
const path = require("path");
const ABProcessParticipantCore = require(path.join(
   __dirname,
   "..",
   "..",
   "core",
   "process",
   "ABProcessParticipantCore.js"
));

const _ = require("lodash");

module.exports = class ABProcessParticipant extends ABProcessParticipantCore {
   constructor(attributes, process, application) {
      super(attributes, process, application);
   }

   ////
   //// Instance Methods
   ////
   users() {
      return new Promise((resolve, reject) => {
         var allLookups = [];
         allLookups.push(this.usersForRoles());
         allLookups.push(this.usersForAccounts());

         Promise.all(allLookups)
            .then((results) => {
               var users = results[0].concat(results[1]);
               users = _.uniqBy(users, "id");
               resolve(users);
            })
            .catch(reject);
      });
   }

   usersForAccounts() {
      return new Promise((resolve, reject) => {
         if (!this.useAccount) {
            resolve([]);
            return;
         }
         if (!Array.isArray(this.account)) {
            this.account = [this.account];
         }

         SiteUser.find({ id: this.account })
            .then((listUsers) => {
               resolve(listUsers);
            })
            .catch(reject);
      });
   }

   usersForRoles() {
      return new Promise((resolve, reject) => {
         if (!this.useRole) {
            resolve([]);
            return;
         }

         if (!Array.isArray(this.role)) {
            this.role = [this.role];
         }

         //// TODO: replace with current ABRole:
         Permission.find({ role: this.role })
            .then((list) => {
               var userIDs = {};
               if (list) {
                  list.forEach((l) => {
                     userIDs[l.user] = l;
                  });
               }
               // convert to array of ids
               userIDs = Object.keys(userIDs);

               SiteUser.find({ id: userIDs })
                  .then((listUsers) => {
                     resolve(listUsers);
                  })
                  .catch(reject);
            })
            .catch(reject);
      });
   }
};
