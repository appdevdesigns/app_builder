/**
 * ABMobileQRController
 *
 * The AppBuilder uses QR information to coordinate the code and initialization of 
 * a mobile App.  This can happen with or without the Relay service.
 *
 * A QR code contains the following info:
 *		userAuthToken:  enables the Mobile Framework to communicate with 
 *						AppBuilder services (including the Public Relay Server)
 *						(found in ABRelayUser.publicAuthToken)
 *		applicationID:  relates what Mobile App the AppBuilder is building that
 *						should be running on the device.
 *		codePushKeys:   The Microsoft CodePush keys used to update the version
 *						of code being run on the device. Useful for switching to 
 *						#develop or #testing versions of the Mobile Device
 * 
 * A QR Code is effective for a User + MobileApp
 *
 *
 */

var async = require('async');
var _ = require('lodash');

var RP = require('request-promise-native');


var QRCode = require('qrcode');


module.exports = {

	// POST: /app_builder/QR/sendEmail
	// send a QR code to a specified Site User
	// @param {string} user 	  the SiteUser.guid 
	// @param {string} mobileApp  id of the Mobile App
	// @param {string} email      the email address to send to.
	sendEmail: function (req, res) {

		var user = req.param('user') || '--';
		var mobileApp = req.param('mobileApp') || '--';
		var email = req.param('email') || '--';

		var QRAppUser = null;

		async.series([

			// find entry for ABQRAppUser
			(next) => {

				ABRelayUser.find({
					site_user:user,
					mobile:mobileApp
				})
				.then((list)=>{

					if (Array.isArray(list)) {
						QRAppUser = list[0];
					}
					next();

				})
				.catch(next);
			},

			// Create ABQRAppUser if it didn't exist:
			(next) => {
				// skip if it is there
				if (QRAppUser) {
					next();
					return;
				} 

				ABRelayUser.initializeAppUser(user, mobileApp)
				.then((abru)=>{
					QRAppUser = abru;
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

				var options = {
				    method: 'POST',
				    uri: sails.config.appbuilder.mcc.url+'/mcc/users',
				    headers: {
				        'authorization': sails.config.appbuilder.mcc.accessToken
				    },
				    body: {
				        users: restUsers
				    },
				    json: true // Automatically stringifies the body to JSON
				};
				 
				RP(options)
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