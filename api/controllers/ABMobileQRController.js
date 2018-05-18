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
		var appID = req.param('mobileApp') || '--';
		var email = req.param('email') || '--';

		var QRAppUser = null;
		var MobileApp = null;

		async.series([

			// verify Email
			// if no email is provided, then lookup SiteUser's email:
			(next) => {
				
				// if they provided an email, move along
				if (email != '--') {
					next();
					return;
				} 

				// lookup SiteUser
				SiteUser.findOne({guid:user})
				.then((lookupUser)=>{

					if (!lookupUser) {
						var error = new Error('Unknown user');
						error.code = 403;
						next(error);
						return;
					}

					email = lookupUser.email;
					next();
				})
				.catch(next)
			},

//// NOTE: in usage, we don't use the QRToken in ABQRAppUser
//// we might remove these next 2 steps in the future:

			// find entry for ABQRAppUser
			(next) => {

				ABQRAppUser.find({
					siteuser:user,
					mobile:appID
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

				ABQRAppUser.initializeAppUser(user, appID)
				.then((abru)=>{
					QRAppUser = abru;
					next();
				})
				.catch(next);

			},


			// Get the MobileApp object
			(next) => {

				AppBuilder.mobileApps()
				.then((listApps)=>{

					var App = listApps.filter((a)=>{return a.id == appID; })[0];

					if (!App) {
						var error = new Error('Unknown Mobile App');
						error.code = 403;
						next(error);
						return;
					}

					MobileApp = App;
					next();

				})
				.catch(next);
			},


			// now build Email info and send to user
			(next) => {

//// LEFT OFF HERE:
// - deeplink url:  make a sails.config.appbuilder.deeplink setting for this
// - reduce current Email to a generic Base Email format.
// - bootstrap an entry for EmailNotifications for this Email
// - fill out missing params

				var triggerID = MobileApp.emailInviteTrigger(); // 'appbuilder.mobileinvite.'+MobileApp.id;
var protocol = req.connection.encrypted?'https':'http';
var baseUrl = protocol + '://' + req.headers.host + '/';

				var deepLink  = baseUrl;

sails.log.error(":::: deepLink:", deepLink);
next();
				// EmailNotifications.trigger(triggerID, {
	   //              to: [email],
	   //              variables: {
	   //                  image: urlQR, // data URL base64 encoded
	   //                  userInfo,
	   //                  relationships,
	   //                  tokenQR,      // token to use in renQrCode() route
	   //                  cidQR: cidQR,   // CID for the QR code attachment
	   //                  deepLink,
	   //              },
	   //              attachments: attachments
	   //          })
	   //          .done((html) => {
	   //              res.send(html || 'OK');
	   //          })
	   //          .fail((err) => {
	   //              throw err;
	   //          });

			}

		], (err, data)=>{
			if (err) {
				res.AD.error(err, err.code || 400);
			} else {
				res.AD.success(users);
			}
		})
	},




};