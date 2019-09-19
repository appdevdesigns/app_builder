/**
 * ABRoleController
 *
 * @description :: Server-side logic for managing Abobjects
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var async = require('async');
var path = require('path');

var ApplicationGraph = require(path.join('..', 'graphModels', 'ABApplication'));

module.exports = {

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