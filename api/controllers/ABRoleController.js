/**
 * ABRoleController
 *
 * @description :: Server-side logic for managing Abobjects
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const async = require('async');

const ApplicationGraph = require("../graphModels/ABApplication");
// const RoleGraph = require("../graphModels/ABRole");
// const ScopeGraph = require("../graphModels/ABScope");

const ABModelController = require("./ABModelController");


function getRoleObject() {
	const ROLE_OBJECT_ID = ABSystemObject.getObjectRoleId();
	return ABObjectCache.get(ROLE_OBJECT_ID);
}

function getScopeObject() {
	const SCOPE_OBJECT_ID = ABSystemObject.getObjectScopeId();
	return ABObjectCache.get(SCOPE_OBJECT_ID);
}

let ABRoleController = {

	// GET /app_builder/role
	find: function (req, res) {

		let cond = req.body || {};
		let RoleModel = getRoleObject();

		if (cond.populate == null)
			cond.populate = true;

		RoleModel.queryFind(cond, req.user.data)
			.catch(res.AD.error)
			.then(roles => {
				res.AD.success(roles || []);
			});

	},

	// GET /app_builder/role/:id
	findOne: function (req, res) {

		let id = req.param('id');
		let RoleModel = getRoleObject();

		return new Promise((resolve, reject) => {

			RoleModel.queryFind({
				where: {
					glue: 'and',
					rules: [
						{
							key: RoleModel.PK(),
							rule: "equals",
							value: id
						}
					]
				},
				limit: 1,
				populate: true
			}, req.user.data)
				.catch(err => {
					if (res)
						res.AD.error(err);

					reject(err);
				})
				.then((role = []) => {

					if (res)
						res.AD.success(role[0]);

					resolve(role[0]);

				});

		});

	},

	// PUT /app_builder/role
	save: function (req, res) {

		req.params["objID"] = ABSystemObject.getObjectRoleId();

		if (!req.body.id)
			return ABModelController.create(req, res);
		else
			return ABModelController.update(req, res);

	},

	// DELETE /app_builder/role/:id
	destroy: function (req, res) {

		req.params["objID"] = ABSystemObject.getObjectRoleId();

		return ABModelController.delete(req, res);

	},

	// GET /app_builder/role/:id/scope
	roleScope: function (req, res) {

		let id = req.param('id');

		let ScopeModel = getScopeObject();

		let connectedField = ScopeModel.fields(f => (f.settings || {}).linkObject == ABSystemObject.getObjectRoleId())[0];
		if (!connectedField) {
			res.AD.success([]);
			return Promise.resolve([]);
		}

		let where = {
			glue: "and",
			rules: [
				{
					key: connectedField.id,
					rule: "equals",
					value: id
				}
			]
		};

		return ScopeModel.queryFind({
			where: where
		}, req.user.data);

	},

	// GET /app_builder/role/:id/users
	roleUsers: function (req, res) {

		return Promise.resolve()
			// Find role
			.then(() => ABRoleController.findOne(req))
			.then(result => {

				let usernames = (result.users || []).map(u => u.id || u);

				res.AD.success(usernames);
			});

	},

	// POST /app_builder/role/:id/username/:username
	addUser: (req, res) => {

		req.params["objID"] = ABSystemObject.getObjectRoleId();

		return Promise.resolve()
			// Find role
			.then(() => ABRoleController.findOne(req))

			// Add user
			.then(role => new Promise((next, err) => {

				if (!role)
					return next();

				let username = req.param('username');

				req.body.id = req.param('id');
				req.body.users = role.users || [];

				let exists = req.body.users.filter(u => (u.id || u) == username)[0];
				if (!exists) {
					req.body.users.push({
						id: username,
						image: "",
						text: username
					});
				}

				next(role);

			}))

			// Update to DB
			.then(role => new Promise((next, err) => {

				if (!role){
					res.AD.success(true);
					return next();
				}

				ABModelController.update(req, res);
				next();

			}));

	},

	// DELETE /app_builder/role/:id/username/:username
	removeUser: function (req, res) {

		req.params["objID"] = ABSystemObject.getObjectRoleId();

		return Promise.resolve()
			// Find role
			.then(() => ABRoleController.findOne(req))

			// Add user
			.then(role => new Promise((next, err) => {

				if (!role) 
					return next();

				let username = req.param('username');

				req.body.id = req.param('id');
				req.body.users = (role.users || []).filter(u => (u.id || u) != username);

				next(role);

			}))

			// Update to DB
			.then(role => new Promise((next, err) => {

				if (!role){
					res.AD.success(true);
					return next();
				}

				ABModelController.update(req, res);
				next();

			}));

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

module.exports = ABRoleController;