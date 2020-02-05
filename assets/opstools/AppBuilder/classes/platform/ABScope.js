const ABScopeCore = require("../core/ABScopeCore");

module.exports = class ABScope extends ABScopeCore {

	constructor(values) {

		super(values);

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

	save(role) {

		return this.Model.staticData.scopeSave(this.toObj(), (role ? role.id : null));

	}

	destroy() {

		return this.Model.staticData.scopeDestroy(this.id);

	}

	scopeFind(cond) {

		return new Promise((resolve, reject) => {

			this.Model.staticData.scopeFind(cond)
				.catch(reject)
				.then(scopes => {

					var result = [];

					(scopes || []).forEach(s => {
						// prevent processing of null values.
						if (s) {
							result.push(new ABScope(s));
						}
					})

					resolve(result);

				});

		});

	}

	scopeOfRole(roleId) {

		return new Promise((resolve, reject) => {

			this.Model.staticData.scopeOfRole(roleId)
				.catch(reject)
				.then(scopes => {

					var result = [];

					(scopes || []).forEach(s => {
						// prevent processing of null values.
						if (s) {
							result.push(new ABScope(s));
						}
					})

					resolve(result);

				});

		});

	}


	/**
	 * @method scopeImport()
	 *
	 * import the current ABScope to ._scopes of the role.
	 *
	 * @param {ABScope} scope
	 * @param {ABRole} role
	 * @return {Promise}
	 */
	scopeImport(scope, role) {

		return new Promise((resolve, reject) => {

			this.Model.staticData.scopeImport(role.id, scope.id)
				.catch(reject)
				.then(newScope => {

					// add to list
					var isIncluded = (role.scopes(s => s.id == newScope.id).length > 0);
					if (!isIncluded) {
						role._scopes.push(scope);
					}

					resolve(scope);

				});

		});

	}

	/**
	 * @method scopeExclude()
	 *
	 *
	 * @param {uuid} scopeId
	 * @param {ABRole} role
	 * @return {Promise}
	 */
	scopeExclude(scopeId, role) {

		return new Promise((resolve, reject) => {

			this.Model.staticData.scopeExclude(role.id, scopeId)
				.catch(reject)
				.then(() => {

					// remove query from list
					role._scopes = role.scopes(s => s.id != scopeId);

					resolve();

				});

		});

	}

	scopeAddUser(roleId, scopeId, username) {

		return new Promise((resolve, reject) => {

			this.Model.staticData.scopeAddUser(roleId, scopeId, username)
				.catch(reject)
				.then(() => {

					resolve();

				});

		});

	}

	scopeRemoveUser(roleId, scopeId, username) {

		return new Promise((resolve, reject) => {

			this.Model.staticData.scopeRemoveUser(roleId, scopeId, username)
				.catch(reject)
				.then(() => {

					resolve();

				});

		});

	}

};