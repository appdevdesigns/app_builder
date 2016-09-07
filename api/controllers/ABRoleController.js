/**
 * ABRoleController
 *
 * @description :: Server-side logic for managing Abobjects
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var async = require('async');

function nameFilter(name) {
    return String(name).replace(/[^a-z0-9]/gi, '');
}

function getValidAppName(appName) {
	return 'AB_' + nameFilter(appName);
}

function getActionKeyName(appName) {
	return 'opstools.' + getValidAppName(appName) + '.view';
}

module.exports = {

	// GET: /app_builder/:id/role
	getRoles: function (req, res) {
		var appId = req.param('id');

		if (!appId) {
			res.AD.error('Application id is invalid.');
			return;
		}

		appId = parseInt(appId);

		async.waterfall([
			function (next) {
				// Find application
				ABApplication.findOne({ id: appId })
					.exec(function (err, app) {
						if (err) {
							res.AD.error(err);
							next(err);
							return;
						}

						next(null, app);
					});
			},
			function (app, next) {
				// Get roles from action key
				var action_key = getActionKeyName(app.name);
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
			res.AD.error('Application id is invalid.');
			return;
		}

		appId = parseInt(appId);

		async.waterfall([
			function (next) {
				// Find application
				ABApplication.findOne({ id: appId })
					.populate('role')
					.exec(function (err, record) {
						if (err) {
							res.AD.error(err);
							next(err);
							return;
						}

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
							app.save(function (err) {
								if (err) {
									res.AD.error(err);
									next(err);
									return;
								}

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
			res.AD.error('Role id is invalid.');
			return;
		}

		appId = parseInt(appId);

		async.waterfall([
			function (next) {
				// Find application
				ABApplication.findOne({ id: appId })
					.populate('role')
					.exec(function (err, app) {
						if (err) {
							res.AD.error(err);
							next(err);
							return;
						}

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
			res.AD.error('Bad request.');
			return;
		}

		appId = parseInt(appId);
		roleIds = roleIds.filter(function (r) { return r && r.id !== null && typeof r.id !== 'undefined' });

		async.waterfall([
			function (next) {
				// Get application
				ABApplication.findOne({ id: appId })
					.exec(function (err, app) {
						if (err) {
							res.AD.error(err);
							next(err);
							return;
						}

						next(null, app);
					});
			},
			function (app, next) {
				// Register the permission action
				Permissions.action.create({
					key: getActionKeyName(app.name),
					description: 'Allow the user to view the ' + getValidAppName(app.name) + ' base page',
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
				Permissions.clearPermissionRole(getActionKeyName(app.name))
					.fail(function (err) { next(err); })
					.then(function () { next(null, app); });
			},
			function (app, next) {
				// Assign permission action to roles
				var assignActionTasks = [];

				roleIds.forEach(function (r) {
					assignActionTasks.push(function (callback) {
						Permissions.assignAction(r.id, getActionKeyName(app.name))
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