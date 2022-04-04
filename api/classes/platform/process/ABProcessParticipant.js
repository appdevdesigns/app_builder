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
   // exportIDs(ids) {
   //    ids.push(this.id);
   // }

   /**
    * @method exportData()
    * export the relevant data from this object necessary for the operation of
    * it's associated application.
    * @param {hash} data
    *        The incoming data structure to add the relevant export data.
    *        .ids {array} the ABDefinition.id of the definitions to export.
    *        .siteObjectConnections {hash} { Obj.id : [ ABField.id] }
    *                A hash of Field.ids for each System Object that need to
    *                reference these importedFields
    *        .roles {hash}  {Role.id: RoleDef }
    *                A Definition of a role related to this Application
    *        .scope {hash} {Scope.id: ScopeDef }
    *               A Definition of a scope related to this Application.
    *               (usually from one of the Roles being included)
    */
   exportData(data) {
      if (data.ids.indexOf(this.id) > -1) return;

      data.ids.push(this.id);

      if (this.useRole) {
         var roles = this.role;
         if (!Array.isArray(roles)) {
            roles = [roles];
         }
         roles.forEach((rid) => {
            data.roles[rid] = rid;
         });
      }
   }

   users(object, data) {
      return new Promise((resolve, reject) => {
         var allLookups = [];
         allLookups.push(this.usersForRoles());
         allLookups.push(this.usersForAccounts());
         allLookups.push(this.usersForFields(object, data));

         Promise.all(allLookups)
            .then((results) => {
               var users = results[0].concat(results[1]).concat(results[2]);
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

   /**
    * @function usersForFields
    * Get the user id list from the field options
    *
    * @param {ABObject} object
    * @param {Object} data - the process data
    * @returns {Promise} - the user list
    */
   usersForFields(object, data) {
      if (
         !this.useField ||
         !this.fields ||
         !this.fields.length ||
         object == null ||
         data == null
      )
         return Promise.resolve([]);

      // pull ABFieldUser list
      let userFields = object.fields(
         (f) => (this.fields || []).indexOf(f.id) > -1
      );

      // Collect all usernames
      let usernames = [];
      (userFields || []).forEach((f) => {
         let userData = data[f.columnName];
         if (!userData) return;

         if (!Array.isArray(userData)) userData = [userData];

         // Add an username to the list
         usernames = usernames.concat(
            userData.map((uData) => uData.id || uData.text || uData)
         );
      });

      // Remove empty items
      usernames = usernames.filter((uName) => uName);

      return new Promise((resolve, reject) => {
         // Pull uuid of users by username
         SiteUser.find({ username: usernames })
            .then((listUsers) => {
               // return user list
               resolve(listUsers);
            })
            .catch(reject);
      });
   }
};
