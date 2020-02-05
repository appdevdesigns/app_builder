require("../../data/ABRole");
const ABRoleCore = require("../core/ABRoleCore");
const ABScope = require("./ABScope");

const Model = OP.Model.get('opstools.BuildApp.ABRole');

module.exports = class ABRole extends ABRoleCore {

	constructor(values) {

		super(values);

		this.Model = Model;

	}

	static find(cond) {

		return new Promise((resolve, reject) => {

			Model.staticData.roleFind(cond)
				.catch(reject)
				.then(roles => {

					var result = [];

					(roles || []).forEach(r => {
						// prevent processing of null values.
						if (r) {
							result.push(new ABRole(r));
						}
					})

					resolve(result);

				});

		});

	}

	static roleScopeOfUser(username) {

		return new Promise((resolve, reject) => {

			Model.roleScopeOfUser(username)
				.catch(reject)
				.then(data => {

					let result = [];

					(data || []).forEach(d => {
						// prevent processing of null values.
						if (d) {
							result.push({
								role: new ABRole(d.role),
								scope: new ABScope(d.scope),
							});
						}
					})

					resolve(result);

				});

		});

	}


	fromValues(values = {}) {

		super.fromValues(values);

		// multilingual fields: name, description
		OP.Multilingual.translate(this, this, ['name', 'description']);

	}

	toObj() {

		OP.Multilingual.unTranslate(this, this, ['name', 'description']);

		return super.toObj();

	}

	save() {

		return this.Model.staticData.roleSave(this.toObj());

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
	 * @method roleUsers()
	 *
	 * remove the current ABRole from our list of ._roles.
	 *
	 * @return {Promise} - An array of usernames
	 */
	roleUsers() {

		return new Promise((resolve, reject) => {

			this.Model.staticData.roleUsers(this.id)
				.catch(reject)
				.then(scopeUsers => {

					scopeUsers = (scopeUsers || []).map(r => {
						return {
							scope: new ABScope(r.scope),
							username: r.username
						}
					});

					resolve(scopeUsers || []);

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

};