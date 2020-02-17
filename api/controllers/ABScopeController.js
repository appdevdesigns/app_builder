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

		ABGraphScope.find({
			relations: ['objects'],
			where: cond
		})
			.catch(res.AD.error)
			.then(scopes => {
				res.AD.success(scopes || []);
			});

	},

	// GET /app_builder/scope/:scopeId
	findOne: function (req, res) {

		let scopeId = req.param('scopeId');

		ABGraphScope.findOne(scopeId, {
			relations: ['objects']
		})
			.catch(res.AD.error)
			.then(scope => {

				res.AD.success(scope);

			});

	},

	// GET /app_builder/scope/:scopeId/role
	scopeRole: function (req, res) {

		let scopeId = req.param('scopeId');

		ABGraphRole.findWithRelation(ABGraphRole.relations.scopes, scopeId, {
			relations: ['objects']
		})
			.catch(res.AD.error)
			.then(roles => {

				res.AD.success(roles || []);

			});

	},

	// PUT /app_builder/scope
	save: function (req, res) {

		let roleID = req.query.roleID;
		let objectIds = req.body.scope.objectIds || [];
		let scopeValues = req.body.scope;

		delete scopeValues.objectIds;

		Promise.resolve()

			// Save scope
			.then(() => {

				return new Promise((next, error) => {

					ABGraphScope.upsert(scopeValues.id, scopeValues)
						.catch(errMessage => {

							error(errMessage);
							res.AD.error(true);

						})
						.then(scope => {

							next(scope);

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

							next(scope);

						});

				});

			})

			// Reset relation to object
			.then(scope => {

				return new Promise((next, error) => {

					scope.unrelate('objects')
						.catch(errMessage => {

							error(errMessage);
							res.AD.error(true);

						})
						.then(() => {

							next(scope);

						});

				});

			})

			// Set relation to object
			.then(scope => {

				if (!objectIds || !objectIds.length)
					return Promise.resolve(scope);

				let tasks = [];

				(objectIds || []).forEach(objectId => {
					if (!objectId)
						return;

					tasks.push(() => {
						return new Promise((next, err) => {

							scope.relate('objects', objectId)
								.catch(err)
								.then(() => {
									next();
								});

						});
					})

				});

				tasks.push(() => Promise.resolve(scope));

				return tasks.reduce((promiseChain, currTask) => {
					return promiseChain.then(currTask);
				}, Promise.resolve([]));
			})

			// Final
			.then(scope => {
				res.AD.success(scope);
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
						relations: ['roles', 'objects']
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