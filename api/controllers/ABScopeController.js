/**
 * ABScopeController
 *
 * @description :: Server-side logic for managing Abapplications
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const ABGraphScope = require("../graphModels/ABScope");
const ABGraphRole = require("../graphModels/ABRole");

module.exports = {

	// GET /app_builder/scope
	find: function (req, res) {

		let cond = req.body;

		ABGraphScope.find(cond)
			.catch(res.AD.error)
			.then(scopes => {
				res.AD.success(scopes || []);
			});

	},

	// GET /app_builder/scope/:scopeId
	findOne: function (req, res) {

		let scopeId = req.param('scopeId');

		ABGraphScope.findOne(scopeId)
			.catch(res.AD.error)
			.then(scope => {

				res.AD.success(scope);

			});

	},

	// GET /app_builder/scope/:scopeId/role
	scopeRole: function (req, res) {

		let scopeId = req.param('scopeId');

		ABGraphRole.findWithRelation(ABGraphRole.relations.scopes, scopeId)
			.catch(res.AD.error)
			.then(roles => {

				res.AD.success(roles || []);

			});

	},

	// PUT /app_builder/scope
	save: function (req, res) {

		let roleID = req.query.roleID;
		let scope = req.body.scope;

		Promise.resolve()

			// Save scope
			.then(() => {

				return new Promise((next, error) => {

					ABGraphScope.upsert(scope.id, scope)
						.catch(errMessage => {

							error(errMessage);
							res.AD.error(true);

						})
						.then(result => {

							next(result);

						});

				});

			})

			// Set relation to role
			.then(scope => {

				return new Promise((next, error) => {

					if (roleID == null)
						return next();

					scope.relate('roles', roleID)
						.catch(errMessage => {

							error(errMessage);
							res.AD.error(true);

						})
						.then(() => {

							res.AD.success(scope);
							next();

						});

				});

			})
			
			// Set relation to object
			.then(scope => {

				return new Promise((next, error) => {

					if (scope.object == null)
						return next();

					scope.relate('object', object)
						.catch(errMessage => {

							error(errMessage);
							res.AD.error(true);

						})
						.then(() => {

							res.AD.success(scope);
							next();

						});

				});

			});

	},

	// DELETE /app_builder/scope/:scopeId'
	destroy: function (req, res) {

		let scopeId = req.param('scopeId');

		ABGraphScope.remove(scopeId)
			.catch(res.AD.error)
			.then(() => {

				res.AD.success(true);
			});
	},

	// PUT /app_builder/role/:roleID/scope/:scopeID'
	import: function (req, res) {

		let roleID = req.param('roleID'),
			scopeID = req.param('scopeID');

		Promise.resolve()

			// Get a scope
			.then(() => {

				return new Promise((next, err) => {

					ABGraphScope.findOne(scopeID, {
						relations: ['roles']
					})
						.catch(err)
						.then(scope => {
							next(scope);
						});


				});

			})

			// Set relate
			.then(scope => {

				return new Promise((next, err) => {

					// if exists
					if (scope.roles.filter(app => app.id == roleID)[0]) {
						res.AD.success(scope);
						return next();
					}

					scope.relate('roles', roleID)
						.catch(err)
						.then(() => {

							res.AD.success(scope);
							next();

						});

				});

			});

	},

	// DELETE /app_builder/role/:roleID/scope/:scopeID'
	exclude: function (req, res) {

		let roleID = req.param('roleID'),
			scopeID = req.param('scopeID');

		ABGraphScope.unrelate(
			ABGraphScope.relations.roles,
			roleID,
			scopeID
		)
			.catch(res.AD.error)
			.then(() => {

				res.AD.success(true);

			});

	}

};