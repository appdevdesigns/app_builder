/**
 * ABRoleController
 *
 * @description :: Server-side logic for managing Abobjects
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var async = require('async');

module.exports = {

	// POST: /app_builder/:id/role
	createRole: function (req, res) {
		var appId = req.param('id');

		if (!appId) {
			res.AD.error('Application id is invalid.');
			return;
		}

		appId = parseInt(appId);

		async.waterfall([
			function (cb) {
				ABApplication.findOne({ id: appId })
					.populate('permissions')
					.exec(function (err, record) {
						if (err) {
							res.AD.error(err);
							cb(err);
							return;
						}

						cb(null, record);
					});
			},
			function (app, cb) {
				var appRole = app.permissions.filter(function (p) { return p.isApplicationRole; });

				if (appRole && appRole.length > 0) {
					res.AD.success(appRole);
					cb();
				}
				else { // Create new application role
					var appName = app.name.replace(/_/g, ' '),
						roleName = appName + ' Application Role',
						roleDesc = appName; // TODO : Description

					Permissions.createRole(roleName, roleDesc)
						.fail(function (err) {
							res.AD.error(err);
							cb(err);
						})
						.then(function (result) {
							res.AD.success(result);
							cb();
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
			function (cb) {
				// Find application roles
				ABApplicationPermission.find({
					application: appId,
					isApplicationRole: true
				})
					.exec(function (err, result) {
						if (err) {
							cb(err);
							return;
						}

						cb(null, result);
					});
			},
			function (perms, cb) {
				var delRoleTasks = [];

				// Delete application roles
				perms.forEach(function (p) {
					delRoleTasks.push(function (callback) {
						Permissions.deleteRole(p.permission)
							.fail(function (err) { callback(err) })
							.then(function () { callback(); });
					});
				});

				async.parallel(delRoleTasks, function (err) {
					cb(err);
				});
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
			roleIds = req.body.roles || [],
			appModel;

		if (!appId) {
			res.AD.error('Bad request.');
			return;
		}

		appId = parseInt(appId);
		roleIds = roleIds.filter(function (r) { return r && r.id !== null && typeof r.id !== 'undefined' });

		async.series([
			function (cb) {
				// Get application object
				ABApplication.findOne({ id: appId })
					.exec(function (err, result) {
						if (err) {
							res.AD.error(err);
							cb(err);
							return;
						}

						appModel = result;
						cb();
					});
			},
			function (cb) {
				// Clear application permission roles
				ABApplicationPermission.destroy({ application: appId })
					.exec(function (err) {
						if (err) {
							res.AD.error(err);
							cb(err);
							return;
						}

						cb();
					});
			},
			function (cb) {
				// Assigns roles
				var assignTask = [];

				roleIds.forEach(function (r) {
					assignTask.push(function (callback) {
						ABApplicationPermission.create({
							application: appId,
							permission: r.id,
							isApplicationRole: r.isApplicationRole || false
						})
							.exec(function (err) {
								if (err) {
									callback(err);
									return;
								}

								callback();
							});
					});
				});

				async.parallel(assignTask, function (err) {
					if (err) {
						res.AD.error(err);
						cb(err);
						return;
					}

					cb();
				});
			},
			function (cb) {
				// Register the permission action
				Permissions.action.create({
					key: 'opstools.' + appModel.name + '.view',
					description: 'Allow the user to view the ' + appModel.name + ' base page',
					language_code: 'en'
				})
					.always(function () {
						// Don't care if there was an error.
						// If permission action already exists, that's fine.
						cb();
					});
			},
			function (cb) {
				// Clear permission action to roles
				Permissions.clearPermissionRole('opstools.' + appModel.name + '.view')
					.fail(function (err) { cb(err); })
					.then(function () { cb(); });
			},
			function (cb) {
				// Assign permission action to roles
				var assignActionTasks = [];

				roleIds.forEach(function (r) {
					assignActionTasks.push(function (callback) {
						Permissions.assignAction(r.id, 'opstools.' + appModel.name + '.view')
							.fail(function (err) { callback(err); })
							.then(function () { callback(); });
					});
				});

				async.parallel(assignActionTasks, function (err) {
					if (err) {
						res.AD.error(err);
						cb(err);
						return;
					}

					res.AD.success();
					cb();
				});
			}
		]);
	}

};