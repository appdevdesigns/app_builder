/**
 * ABUserController
 *
 * @description :: Server-side logic for managing Abobjects
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const ABGraphRole = require("../graphModels/ABRole");

module.exports = {

	// REST API: /app_builder/abuser
	_config: {
		model: "abuser", // all lowercase model name
		// actions: true,
		// shortcuts: true,
		rest: true
	},

	// GET: /app_builder/user/roles
	getRoles: function (req, res) {

		let username = req.user.username();

		ABGraphRole.getRolesByUsername(username)
			.catch(error => {
				res.AD.error(error);
			})
			.then(roles => {

				res.AD.success(roles || []);

			});

	},

	// GET /app_builder/user/:username/role
	userRoles: (req, res) => {

		// TODO: this function should allow to admin only

		let username = req.param('username');

		ABGraphRole.getRolesByUsername(username)
			.catch(error => {
				res.AD.error(error);
			})
			.then(roles => {

				res.AD.success(roles || []);

			});

	},

	// GET: /app_builder/user/list
	getUserList: function (req, res) {

		ABUser.find({}, {
			select: [
				'username',
				'image_id'
			]
		})
			.fail(function (err) { res.AD.error(err); })
			.then(function (result) {
				res.AD.success(result || []);
			});

	}

};