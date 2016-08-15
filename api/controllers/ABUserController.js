/**
 * ABUserController
 *
 * @description :: Server-side logic for managing Abobjects
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

	// GET: app_builder/user/roles
	getRoles: function (req, res) {
		Permissions.getUserRoles(req, true)
			.fail(function (err) { res.AD.error(err); })
			.then(function (result) { res.AD.success(result); });
	}

};