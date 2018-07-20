/**
 * ABRelayController
 *
 * @description :: Server-side logic for managing the ABRelay settings
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var async = require('async');
var _ = require('lodash');



module.exports = {

	// GET: /app_builder/relay/users
	// return a list of user accounts that are currently 
	// setup in ABRelayUser:
	users: function (req, res) {
		

		ABRelayUser.find()
		.then((list)=>{

			var users = [];
			list.forEach((l)=>{
				users.push(l.siteuser_guid);
			})
			res.AD.success(users);

		})
		.catch((err)=>{
			res.AD.error(err);
		});

	},


	// GET: /app_builder/relay/uninitializedusers
	// return a list of user accounts that are NOT currently 
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

			// find all requested users:
			(next) => {

				SiteUser.find({username:users })
				.then((listUsers)=>{
					siteUsers = listUsers;
					next();
				})
				.catch(next);
			},

			// initialize each of them:
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
	},


	// POST: /app_builder/relay/publishusers
	// initialize the Public Server with the current list of ABRelayUsers:
	publishusers: function (req, res) {

		var restUsers = [];

		async.series([


			// get list of registered ABRelayUsers :
			(next) => {
				
				ABRelayUser.find()
				.then((list)=>{

					list.forEach((l)=>{
						var entry = { user:l.user, rsa:l.rsa_public_key, authToken:l.publicAuthToken }
						restUsers.push(entry);
					})
					next();

				})
				.catch(next);
				
			},

			(next) => {

				ABRelay.post({
					url:'/mcc/users', 
					data:{
				        users: restUsers
				    }
				})
			    .then(function (parsedBody) {

					next();
			        
			    })
			    .catch(next);
			    
			}

		], (err, data)=>{
			if (err) {
				if(err.statusCode == 403) {
					ADCore.error.log("ABRelayController:publishusers:Request was forbidden. Does our authToken match?", {error:err, authToken:sails.config.appbuilder.mcc.accessToken})
					var error = new Error('Communications Error with Relay Server. Contact your Administrator.');
					res.AD.error(error);
					return;
				}
				// otherwise pass
				ADCore.error.log("ABRelayController:publishusers:Error with publishusers:", {error:err, authToken:sails.config.appbuilder.mcc.accessToken});
				var error = new Error('Unable to complete transaction. Contact your administrator.');
				res.AD.error(error);

			} else {
				res.AD.success();
			}
		})
	},




};