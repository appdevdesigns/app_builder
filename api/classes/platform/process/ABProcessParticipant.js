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

function getRoleObject() {
   const ROLE_OBJECT_ID = ABSystemObject.getObjectRoleId();
   return ABObjectCache.get(ROLE_OBJECT_ID);
}

module.exports = class ABProcessParticipant extends ABProcessParticipantCore {
   constructor(attributes, process, application) {
      super(attributes, process, application);
   }

   ////
   //// Instance Methods
   ////

   /**
    * @method exportIDs()
    * export any relevant .ids for the necessary operation of this application.
    * @param {array} ids
    *        the array of ids to store our relevant .ids into
    */
   exportIDs(ids) {
      ids.push(this.id);
   }

   users() {
      return new Promise((resolve, reject) => {
         var allLookups = [];
         allLookups.push(this.usersForRoles());
         allLookups.push(this.usersForAccounts());

         Promise.all(allLookups)
            .then((results) => {
               var users = results[0].concat(results[1]);
               users = _.uniqBy(users, "uuid");
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

         SiteUser.find({ uuid: this.account })
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

         // lookup the current list of Roles we are defined to use.
         let RoleModel = getRoleObject();
         RoleModel.queryFind(
            {
               where: {
                  glue: "and",
                  rules: [
                     {
                        key: RoleModel.PK(),
                        rule: "in",
                        value: this.role
                     }
                  ]
               },
               populate: true
            },
            {} // <-- user data isn't used in our condition
         )
            .catch((err) => {
               reject(err);
            })
            .then((result = []) => {
               // for each role, compile a list of Users->usernames
               var allUsers = [];
               (result || []).forEach((role) => {
                  var usernames = (role.users || []).map((u) => {
                     // the data entry is a ABFieldUser instance,
                     // so it is in the format:
                     // {
                     //    id: "username",
                     //    image:"",
                     //    text: "username"
                     // }
                     return u.id || u;
                  });
                  allUsers = allUsers.concat(usernames);
               });

               // make sure we remove any duplicates
               allUsers = _.uniq(allUsers);

               // now return our SiteUsers based upon these usernames
               SiteUser.find({ username: allUsers })
                  .then((listUsers) => {
                     resolve(listUsers);
                  })
                  .catch(reject);
            });
      });
   }
};
