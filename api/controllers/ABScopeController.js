/**
 * ABScopeController
 *
 * @description :: Server-side logic for managing Abapplications
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

// const ABGraphScope = require("../graphModels/ABScope");
// const ABGraphRole = require("../graphModels/ABRole");

const ABModelController = require("./ABModelController");

const SCOPE_OBJECT_ID = "af10e37c-9b3a-4dc6-a52a-85d52320b659";

let ABScopeController = {

	// GET /app_builder/scope
	find: function (req, res) {

		let cond = req.body || {};
		let ScopeModel = ABObjectCache.get(SCOPE_OBJECT_ID);

		if (cond.populate == null)
			cond.populate = true;

		ScopeModel.queryFind(cond, req.user.data)
			.catch(res.AD.error)
			.then(scopes => {
				res.AD.success(scopes || []);
			});

	},

	// GET /app_builder/scope/:id
	findOne: function (req, res) {

		let id = req.param('id');
		let ScopeModel = ABObjectCache.get(SCOPE_OBJECT_ID);

		return new Promise((resolve, reject) => {

			ScopeModel.queryFind({
				where: {
					glue: 'and',
					rules: [
						{
							key: ScopeModel.PK(),
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
				.then((scope = []) => {

					if (res)
						res.AD.success(scope[0]);

					resolve(scope[0]);

				});

		});

	},

	// GET /app_builder/scope/:id/roles
	scopeRole: function (req, res) {

		let scopeId = req.param('id');

		let RoleModel = ABObjectCache.get(ROLE_OBJECT_ID);

		let connectedField = RoleModel.fields(f => (f.settings || {}).linkObject == SCOPE_OBJECT_ID)[0];
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
					value: scopeId
				}
			]
		};

		return RoleModel.queryFind({
			where: where
		}, req.user.data);

	},

	// PUT /app_builder/scope
	save: function (req, res) {

		let roleID = req.query.roleID;
		if (roleID)
			req.body.roles = [roleID];

		req.params["objID"] = SCOPE_OBJECT_ID;

		if (!req.body.id)
			return ABModelController.create(req, res);
		else
			return ABModelController.update(req, res);

	},

	// DELETE /app_builder/scope/:id'
	destroy: function (req, res) {

		req.params["objID"] = SCOPE_OBJECT_ID;

		return ABModelController.delete(req, res);

	},

	// PUT /app_builder/role/:roleID/scope/:id'
	import: function (req, res) {

		req.params["objID"] = SCOPE_OBJECT_ID;
		let roleID = req.param('roleID');

		Promise.resolve()
			// Pull the scope
			.then(() => ABScopeController.findOne(req))

			// Update roles data
			.then(scope => new Promise((next, err) => {
				if (!scope)
					return next();

				let exists = (scope.roles || []).filter(r => (r.id || r) == roleID)[0];
				if (!exists)
					req.body.roles = scope.roles || [];

				next(scope);
			}))

			// Save
			.then(scope => new Promise((next, err) => {

				if (!scope) {
					res.AD.success(null);
					return next();
				}

				ABModelController.update(req, res)
					.catch(err)
					.then(() => next());
			}));

	},

	// DELETE /app_builder/role/:roleID/scope/:id'
	exclude: function (req, res) {

		let roleID = req.param('roleID');
		req.params["objID"] = SCOPE_OBJECT_ID;

		Promise.resolve()
			// Pull the scope
			.then(() => ABScopeController.findOne(req))

			// Update roles data
			.then(scope => new Promise((next, err) => {
				if (!scope)
					return next();

				req.body.roles = (scope.roles || []).filter(r => (r.id || r) != roleID);

				next(scope);
			}))

			// Save
			.then(scope => new Promise((next, err) => {

				if (!scope) {
					res.AD.success(null);
					return next();
				}

				ABModelController.update(req, res);
				next();
			}));

	}

};

module.exports = ABScopeController;