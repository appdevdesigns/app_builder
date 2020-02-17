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

		Permissions.getUserRoles(req, true)
			.fail(function (err) { res.AD.error(err); })
			.then(function (result) { res.AD.success(result); });

		// let username = req.user.username();

		// ABGraphRole.getRolesByUsername(username)
		// 	.catch(error => {
		// 		res.AD.error(error);
		// 	})
		// 	.then(roles => {

		// 		res.AD.success(roles || []);

		// 	});

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

	},

	// GET: /app_builder/user/:user/rolescope
	getRoleScope: function (req, res) {

		let username = req.param('user');

		ABGraphRole.query(`
			FOR join IN scopeUser
			FOR r in role
			FOR s in scope
			FOR rScope in roleScope
			FILTER join.username == '${username}'
			&& join._from == r._id
			&& join._to == s._id
			&& rScope._from == r._id
			&& rScope._to == s._id
			RETURN {
				role: r,
				scope: s
			}
		`)
		.catch(res.AD.error)
		.then(result => {
			res.AD.success(result || []);
		});

	}

};