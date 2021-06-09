require("../../data/ABRole");
const ABRoleCore = require("../core/ABRoleCore");
const ABScope = require("./ABScope");

const Model = OP.Model.get("opstools.BuildApp.ABRole");

module.exports = class ABRole extends ABRoleCore {
   constructor(values) {
      super(values);

      this.Model = Model;
   }

   static find(cond) {
      return new Promise((resolve, reject) => {
         Model.staticData
            .roleFind(cond)
            .catch(reject)
            .then((roles) => {
               var result = [];

               (roles || []).forEach((r) => {
                  // prevent processing of null values.
                  if (r) {
                     result.push(new ABRole(r));
                  }
               });

               resolve(result);
            });
      });
   }

   static rolesOfUser(username) {
      return new Promise((resolve, reject) => {
         Model.staticData
            .rolesOfUser(username)
            .catch(reject)
            .then((roles) => {
               let result = [];

               (roles || []).forEach((r) => {
                  // prevent processing of null values.
                  if (r) {
                     result.push(new ABRole(r));
                  }
               });

               resolve(result);
            });
      });
   }

   fromValues(values = {}) {
      super.fromValues(values);

      this._scopes = [];
      (values.scopes__relation || values.scopes || []).forEach((s) => {
         this._scopes.push(new ABScope(s));
      });

      // multilingual fields: name, description
      OP.Multilingual.translate(this, this, ["name", "description"]);
   }

   toObj() {
      OP.Multilingual.unTranslate(this, this, ["name", "description"]);

      return super.toObj();
   }

   save() {
      return this.id
         ? this.Model.staticData.roleUpdate(this.toObj())
         : this.Model.staticData.roleCreate(this.toObj());
   }

   create() {
      return this.Model.staticData.roleCreate(this.toObj());
   }

   update() {
      return this.Model.staticData.roleUpdate(this.toObj());
   }

   destroy() {
      return this.Model.staticData.roleDestroy(this.id);
   }

   // roleLoad(cond) {

   // 	if (this.loadedRole)
   // 		return Promise.resolve();

   // 	return new Promise((resolve, reject) => {

   // 		this.Model.staticData.roleLoad(this.id, cond)
   // 			.catch(reject)
   // 			.then(roles => {

   // 				this.loadedRole = true;

   // 				var newRoles = [];
   // 				(roles || []).forEach(s => {
   // 					// prevent processing of null values.
   // 					if (s) {
   // 						newRoles.push(this.roleNew(s));
   // 					}
   // 				})
   // 				this._roles = newRoles;

   // 				resolve(this._roles);

   // 			});

   // 	});

   // }

   /**
    * @method getUsers()
    *
    * pull users of the role from the server
    *
    * @return {Promise} - An array of usernames
    */
   getUsers() {
      return new Promise((resolve, reject) => {
         this.Model.staticData
            .roleUsers(this.id)
            .catch(reject)
            .then((usernames) => {
               resolve(usernames || []);
            });
      });
   }

   // roleImport(roleId) {

   // 	return new Promise((resolve, reject) => {

   // 		this.Model.staticData.roleImport(this.id, roleId)
   // 			.catch(reject)
   // 			.then(newRole => {

   // 				let newRoleClass = this.roleNew(newRole);

   // 				// add to list
   // 				var isIncluded = (this.roles(s => s.id == newRole.id).length > 0);
   // 				if (!isIncluded) {
   // 					this._roles.push(newRoleClass);
   // 				}

   // 				resolve(newRoleClass);

   // 			});

   // 	});

   // }

   // roleExclude(roleId) {

   // 	return new Promise((resolve, reject) => {

   // 		this.Model.staticData.roleExclude(this.id, roleId)
   // 			.catch(reject)
   // 			.then(() => {

   // 				// remove query from list
   // 				this._roles = this.roles(s => s.id != roleId);

   // 				resolve();

   // 			});

   // 	});

   // }

   scopeLoad() {
      return new Promise((resolve, reject) => {
         this.Model.staticData
            .scopeOfRole(this.id)
            .catch(reject)
            .then((scopes) => {
               this._scopes = [];

               (scopes || []).forEach((s) => {
                  // prevent processing of null values.
                  if (s) {
                     this._scopes.push(new ABScope(s));
                  }
               });

               resolve(this._scopes);
            });
      });
   }

   /**
    * @method scopeImport()
    *
    * import the current ABScope to ._scopes of the role.
    *
    * @param {ABScope} scope
    * @return {Promise}
    */
   scopeImport(scope) {
      return new Promise((resolve, reject) => {
         this.Model.staticData
            .scopeImport(this.id, scope.id)
            .catch(reject)
            .then((newScope) => {
               // add to list
               var isIncluded =
                  this.scopes((s) => s.id == newScope.id).length > 0;
               if (!isIncluded) {
                  this._scopes.push(scope);
               }

               resolve(scope);
            });
      });
   }

   /**
    * @method scopeExclude()
    *
    * @param {uuid} scopeId
    * @return {Promise}
    */
   scopeExclude(scopeId) {
      return new Promise((resolve, reject) => {
         this.Model.staticData
            .scopeExclude(this.id, scopeId)
            .catch(reject)
            .then(() => {
               // remove query from list
               this._scopes = this.scopes((s) => s.id != scopeId);

               resolve();
            });
      });
   }

   userAdd(username) {
      return new Promise((resolve, reject) => {
         this.Model.staticData
            .addUser(this.id, username)
            .catch(reject)
            .then(() => {
               resolve();
            });
      });
   }

   userRemove(username) {
      return new Promise((resolve, reject) => {
         this.Model.staticData
            .removeUser(this.id, username)
            .catch(reject)
            .then(() => {
               resolve();
            });
      });
   }
};
