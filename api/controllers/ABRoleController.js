/**
 * ABRoleController
 *
 * @description :: Server-side logic for managing Abobjects
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const async = require('async');

const ApplicationGraph = require("../graphModels/ABApplication");
const RoleGraph = require("../graphModels/ABRole");
const ScopeGraph = require("../graphModels/ABScope");

module.exports = {

	// GET /app_builder/application/:appID/role
	roleApplication: (req, res) => {

		let appID = req.param('appID');
		let cond = req.body.query || {};

		RoleGraph.findWithRelation('applications', appID, cond)
			.catch(error => {
				res.AD.error(error);
			})
			.then(roles => {

				res.AD.success(roles || []);

			});

	},


	// GET /app_builder/role
	find: function (req, res) {

		let cond = req.body;

		RoleGraph.find(cond)
			.catch(res.AD.error)
			.then(roles => {
				res.AD.success(roles || []);
			});

	},

	// GET /app_builder/role/:roleId
	findOne: function (req, res) {

		let roleId = req.param('roleId');

		RoleGraph.findOne(roleId)
			.catch(res.AD.error)
			.then(role => {

				res.AD.success(role);

			});

	},

	// PUT /app_builder/role
	save: function (req, res) {

		let appID = req.query.appID;
		let role = req.body.role;

		Promise.resolve()

			// Save role
			.then(() => {

				return new Promise((next, error) => {

					RoleGraph.upsert(role.id, role)
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
			.then(role => {

				return new Promise((next, error) => {

					if (appID == null)
						return next();

					role.relate('applications', appID)
						.catch(errMessage => {

							error(errMessage);
							res.AD.error(true);

						})
						.then(() => {

							res.AD.success(role);
							next();

						});

				});

			});

	},

	// DELETE /app_builder/role/:roleId
	destroy: function (req, res) {

		let roleId = req.param('roleId');

		RoleGraph.remove(roleId)
			.catch(res.AD.error)
			.then(() => {

				res.AD.success(true);
			});
	},

	// PUT /app_builder/application/:appID/role/:roleID
	import: function (req, res) {

		let appID = req.param('appID'),
			roleID = req.param('roleID');

		Promise.resolve()

			// Get a role
			.then(() => {

				return new Promise((next, err) => {

					RoleGraph.findOne(roleID, {
						relations: ['applications']
					})
						.catch(err)
						.then(role => {
							next(role);
						});


				});

			})

			// Set relate
			.then(role => {

				return new Promise((next, err) => {

					// if exists
					if (role.applications.filter(app => app.id == appID)[0]) {
						res.AD.success(role);
						return next();
					}

					role.relate('applications', appID)
						.catch(err)
						.then(() => {

							res.AD.success(role);
							next();

						});

				});

			});

	},

	// DELETE /app_builder/application/:appID/role/:roleID
	exclude: function (req, res) {

		let appID = req.param('appID'),
			roleID = req.param('roleID');

		RoleGraph.unrelate(
			RoleGraph.relations.applications,
			appID,
			roleID
		)
			.catch(res.AD.error)
			.then(() => {

				res.AD.success(true);

			});

	},

	// GET /app_builder/role/:roleId/scope
	roleScope: function (req, res) {

		let roleId = req.param('roleId');

		ScopeGraph.findWithRelation(ScopeGraph.relations.roles, roleId)
			.catch(res.AD.error)
			.then(scope => {

				res.AD.success(scope);

			});

	},


	///
	/// Roles of Application to display live view
	///

	// GET: /app_builder/:id/role
	getRoles: function (req, res) {
		var appId = req.param('id');

		if (!appId) {
			var error = ADCore.error.fromKey('E_INVALIDPARAMS');
			error.invalidParam = 'id';
			error.expectedURLFormat = 'get /app_builder/:id/role';
			res.AD.error(error);
			return;
		}

		// appId = parseInt(appId);

		async.waterfall([
			function (next) {
				// Find application
				ApplicationGraph.findOne(appId)
					.catch(err => {
						res.AD.error(err);
						next(err);
					})
					.then(app => {
						next(null, app);
					});
			},
			function (app, next) {
				// Get roles from action key
				var action_key = app.actionKeyName();
				Permissions.getRolesByActionKey(action_key)
					.fail(function (err) {
						res.AD.error(err);
						next(err);
					})
					.then(function (roles) {
						next(null, roles);
					});
			},
			function (roles, next) {
				// Return role ids 
				async.map(roles,
					function (item, callback) {
						callback(null, item.id);
					},
					function (err, roleIds) {
						if (err) {
							res.AD.error(err);
							next(err);
							return;
						}

						res.AD.success(roleIds);
						next();
					});
			}
		]);
	},

	// POST: /app_builder/:id/role
	createRole: function (req, res) {
		var appId = req.param('id');

		if (!appId) {
			var error = ADCore.error.fromKey('E_INVALIDPARAMS');
			error.invalidParam = 'id';
			error.expectedURLFormat = 'post /app_builder/:id/role';
			res.AD.error(error);
			return;
		}

		// appId = parseInt(appId);

		async.waterfall([
			function (next) {
				// Find application
				ApplicationGraph.findOne(appId)
					.catch(err => {
						res.AD.error(err);
						next(err);
					})
					.then(record => {
						next(null, record);
					});
			},
			function (app, next) {
				if (app.role) { // Exists
					res.AD.success(app.role);
					next();
				}
				else { // Create new application role
					var appName = app.name.replace(/_/g, ' '),
						roleName = appName + ' Application Role',
						roleDesc = appName; // TODO : Description

					Permissions.createRole(roleName, roleDesc)
						.fail(function (err) {
							res.AD.error(err);
							next(err);
						})
						.then(function (role) {
							app.role = role.id;
							app.save()
								.catch(err => {
									res.AD.error(err);
									next(err);
								})
								.then(() => {
									res.AD.success(role);
									next();
								});
						});
				}
			},
		]);
	},

	// DELETE: /app_builder/:id/role
	deleteRole: function (req, res) {
		var appId = req.param('id');

		if (!appId) {
			var error = ADCore.error.fromKey('E_INVALIDPARAMS');
			error.invalidParam = 'id';
			error.expectedURLFormat = 'delete /app_builder/:id/role';
			res.AD.error(error);
			return;
		}

		// appId = parseInt(appId);

		async.waterfall([
			function (next) {
				// Find application
				ApplicationGraph.findOne(appId)
					.catch(err => {
						res.AD.error(err);
						next(err);
					})
					.then(app => {
						next(null, app);
					});

			},
			function (app, next) {
				if (app.role && app.role.id) {
					// Delete role
					Permissions.deleteRole(app.role.id)
						.fail(function (err) { next(err) })
						.then(function () { next(); });
				}
				else {
					next();
				}
			}
		], function (err) {
			if (err) {
				res.AD.error(err);
				return;
			}

			res.AD.success();
		})
	},

	// PUT: /app_builder/:id/role/assign
	assignRole: function (req, res) {
		var appId = req.param('id'),
			roleIds = req.body.roles || [];

		if (!appId) {
			var error = ADCore.error.fromKey('E_INVALIDPARAMS');
			error.invalidParam = 'id';
			error.expectedURLFormat = '/app_builder/:id/role/assign';
			res.AD.error(error);
			return;
		}

		// appId = parseInt(appId);
		roleIds = roleIds.filter(function (r) { return r && r.id !== null && typeof r.id !== 'undefined' });

		async.waterfall([
			function (next) {
				// Get application
				ApplicationGraph.findOne(appId)
					.catch(err => {
						res.AD.error(err);
						next(err);
					})
					.then(app => {
						next(null, app);
					});
			},
			function (app, next) {
				// Register the permission action
				Permissions.action.create({
					key: app.actionKeyName(),
					description: 'Allow the user to view the ' + app.validAppName() + ' base page',
					language_code: 'en'
				})
					.always(function () {
						// Don't care if there was an error.
						// If permission action already exists, that's fine.
						next(null, app);
					});
			},
			function (app, next) {
				// Clear permission action to roles
				Permissions.clearPermissionRole(app.actionKeyName())
					.fail(function (err) { next(err); })
					.then(function () { next(null, app); });
			},
			function (app, next) {
				// Assign permission action to roles
				var assignActionTasks = [];

				roleIds.forEach(function (r) {
					assignActionTasks.push(function (callback) {
						Permissions.assignAction(r.id, app.actionKeyName())
							.fail(function (err) { callback(err); })
							.then(function () { callback(); });
					});
				});

				async.parallel(assignActionTasks, function (err) {
					if (err) {
						res.AD.error(err);
						next(err);
						return;
					}

					res.AD.success();
					next();
				});
			}
		]);
	}

};