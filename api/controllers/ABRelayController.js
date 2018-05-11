/**
 * ABRelayController
 *
 * @description :: Server-side logic for managing the ABRelay settings
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var async = require('async');
var _ = require('lodash');

module.exports = {

	// GET: /app_builder/relay/uninitializedusers
	// return a list of user accounts that are not currently 
	// setup in ABRelayUser:
	uninitializedUsers: function (req, res) {

		var restUsers = [];
		var users = [];
		async.series([

			// find all initialized users:
			(next) => {

				ABRelayUser.find()
				.then((list)=>{

					list.forEach((l)=>{
						restUsers.push(l.siteuser_guid);
					})
					next();

				})
				.catch(next);
			},

			// get list of remaining users:
			(next) => {

				var cond = {};
				if (restUsers.length > 0) {
					cond = { guid:{'!':restUsers}};
				}

				SiteUser.find(cond)
				.then((listUsers)=>{
					listUsers.forEach((u)=>{
						users.push(u.username)
					})
					next();
				})
				.catch(next);
			}

		], (err, data)=>{
			if (err) {
				res.AD.error(err);
			} else {
				res.AD.success(users);
			}
		})
	},


	// POST: /app_builder/relay/initialize
	// initialize a set of user accounts to work with the relay system
	initialize: function (req, res) {

		var users = req.param('users');

		if (!users) {
			res.AD.error('missing param: users');
			return;
		}

		var siteUsers = null;
		async.series([

			// find all initialized users:
			(next) => {

				SiteUser.find({username:users })
				.then((listUsers)=>{
					siteUsers = listUsers;
					next();
				})
				.catch(next);
			},

			// get list of remaining users:
			(next) => {
				
				var numDone = 0;
				siteUsers.forEach((su)=>{

					ABRelayUser.initializeUser(su.guid)
					.then(()=>{
						numDone++;
						if (numDone>= siteUsers.length) {
							next();
						}
					})
					.catch(next);
				})
				
				if (siteUsers.length == 0) {
					next();
				}
				
			}

		], (err, data)=>{
			if (err) {
				res.AD.error(err);
			} else {
				res.AD.success();
			}
		})
	}

};