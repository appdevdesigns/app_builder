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
					.fail(function (err) {
						res.AD.error(err);
						cb(err);
					})
					.then(function (app) {
						cb(null, app);
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
					.fail(function (err) {
						cb(err);
					})
					.then(function (result) {
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
			roleIds = req.body.roles || [];

		if (!appId) {
			res.AD.error('Bad request.');
			return;
		}

		appId = parseInt(appId);

		async.series([
			function (cb) {
				// Clear application permissions
				ABApplicationPermission.destroy({ application: appId })
					.fail(function (err) {
						res.AD.error(err);
						cb(err);
					})
					.then(function () {
						cb();
					});
			},
			function (cb) {
				var assignTask = [];

				roleIds.forEach(function (r) {
					assignTask.push(function (callback) {
						ABApplicationPermission.create({
							application: appId,
							permission: r.id,
							isApplicationRole: r.isApplicationRole || false
						})
							.fail(function (err) { callback(err); })
							.then(function () { callback(); });
					});
				});

				async.parallel(assignTask, function (err) {
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