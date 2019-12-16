/**
 * ABScopeController
 *
 * @description :: Server-side logic for managing Abapplications
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const path = require('path');

const ABGraphScope = require(path.join('..', 'graphModels', 'ABScope'));

module.exports = {

	// GET /app_builder/application/:appID/scope
	scopeApplication: (req, res) => {

		let appID = req.param('appID');

		ABGraphScope.findWithRelation('applications', appID)
			.catch(error => {
				res.AD.error(error);
			})
			.then(scopes => {

				res.AD.success(scopes || []);

			});

	},

	// GET /app_builder/scope
	find: function (req, res) {

		let cond = req.query;

		ABGraphScope.find({
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

		ABGraphScope.findOne(scopeId)
			.catch(res.AD.error)
			.then(scope => {

				res.AD.success(scope);

			});

	},

	// PUT /app_builder/scope
	save: function (req, res) {

		let appID = req.query.appID;
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

			// Set relation to application
			.then(scope => {

				return new Promise((next, error) => {

					if (appID == null)
						return next();

					scope.relate('applications', appID)
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

	// PUT /app_builder/application/:appID/scope/:scopeID'
	import: function (req, res) {

		let appID = req.param('appID'),
			scopeID = req.param('scopeID');

		Promise.resolve()

			// Get a scope
			.then(() => {

				return new Promise((next, err) => {

					ABGraphScope.findOne(scopeID, {
						relations: ['applications']
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
					if (scope.applications.filter(app => app.id == appID)[0]) {
						res.AD.success(scope);
						return next();
					}

					scope.relate('applications', appID)
						.catch(err)
						.then(() => {

							res.AD.success(scope);
							next();

						});

				});

			});

	},

	// DELETE /app_builder/application/:appID/scope/:scopeID'
	exclude: function (req, res) {

		let appID = req.param('appID'),
			scopeID = req.param('scopeID');

		ABGraphScope.unrelate(
			ABGraphScope.relations.applications,
			appID,
			scopeID
		)
			.catch(res.AD.error)
			.then(() => {

				res.AD.success(true);

			});

	}

};