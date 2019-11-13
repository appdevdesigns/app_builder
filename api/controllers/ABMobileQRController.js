/**
 * ABMobileQRController
 *
 * The AppBuilder uses QR information to coordinate the code and initialization of 
 * a mobile App.  This can happen with or without the Relay service.
 *
 * A QR code contains the following info:
 *      userAuthToken:  enables the Mobile Framework to communicate with 
 *                      AppBuilder services (including the Public Relay Server)
 *                      (found in ABRelayUser.publicAuthToken)
 *      applicationID:  relates what Mobile App the AppBuilder is building that
 *                      should be running on the device.
 *      codePushKeys:   The Microsoft CodePush keys used to update the version
 *                      of code being run on the device. Useful for switching to 
 *                      #develop or #testing versions of the Mobile Device
 * 
 * A QR Code is effective for a User + MobileApp
 *
 *
 */

var path = require('path');
var fs   = require('fs');

var async = require('async');
var _     = require('lodash');

var RP = require('request-promise-native');
var QRCode = require('qrcode');

var Base64Images = require('../classes/Base64Images.js');

module.exports = {


    // GET: /app_builder/mobile/:mobileID/apk
    // return the current APK for the specified Mobile App
    // @param {string} version    which version of the App ('current' is default)
    sendAPK: function (req, res) {

        var mobileID = req.param('mobileID') || '--';
        var version  = req.param('version')  || 'current';  // default

        var missingParams = [];
        if (mobileID == '--') {
            missingParams.push('mobileID');
        }

        if (missingParams.length > 0) {
            var error = ADCore.error.fromKey('E_MISSINGPARAM');
            error.missingParams = missingParams;
            res.AD.error(error, 422);  // 422 for missing parameters ? (http://stackoverflow.com/questions/3050518/what-http-status-response-code-should-i-use-if-the-request-is-missing-a-required)
            return;
        }

        var MobileApp = null;   // which mobile app are we requesting an APK from
        var fileName  = null;   // the name of the file we are sending
        var destFile  = null;   // the path to the file to send

        async.series([

            (next) => {

                // get MobileApp
                AppBuilder.mobileApps()
                .then((listApps)=>{

                    var App = listApps.filter((a)=>{return a.id == mobileID; })[0];

                    if (!App) {
                        var error = new Error('Unknown Mobile App');
                        error.code = 'E_UNKNOWNMOBILEAPP';
                        error.httpResponseCode = 403;
                        next(error);
                        return;
                    }

                    MobileApp = App;
                    next();

                })
                .catch(next);

            },


            (next) => {

                destFile = MobileApp.pathAPK(version);
                var parts = destFile.split(path.sep);
                fileName = parts.pop();

                fs.access(destFile, fs.constants.R_OK , function(err) {
                    if (err) {

                        var nError = new Error('cannot access file.');
                        nError.code = 'EACCESS';
                        nError.error = err;
                        nError.destFile = destFile;
                        ADCore.error.log('AppBuilder:ABMobileQRController:sendAPK:Unable to access APK file:', {error:nError});

                        var clientError = new Error('Error processing your request');
                        clientError.httpResponseCode = 500;
                        next(clientError);
                    } else {
                        next();
                    }
                });
            }



        ],(err,data)=>{

            if (err) {
                
                ADCore.Comm.error(res, err, err.httpResponseCode || 400);
    
            } else {

                // Adding header so the client knows the file content type and the file name
                res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
                    
                // stream file to response on success
                fs.createReadStream(destFile)
                .on('error', function (err) {
                    ADCore.error.log("ABMobileQRController:sendAPK:Unexpected Error streaming file to client", {error:err});
                    return ADCore.Comm.error(res, err, 500);
                })
                .pipe(res);
            }

        })


    },



    // POST: /app_builder/QR/sendEmail
    // send a QR code to a specified Site User
    // @param {string} user       the SiteUser.guid 
    // @param {string} mobileApp  id of the Mobile App
    // @param {string} email      the email address to send to.
    sendEmail: function (req, res) {

        var user = req.param('user') || '--';
        var appID = req.param('mobileApp') || '--';
        var email = req.param('email') || '--';
        var username = req.param('username') || '--';

        var QRAppUser = null;
        var MobileApp = null;

        var UserPublicToken = null;


        // variables used in Email Sent:
        var triggerID = null;   // EmailNotifications trigger ID for the QR Code Email;
        var deepLink  = null;   // base deeplink url
        var apkURL = null;      // url to access the android version of the mobile app
        var cidQR = 'qr-code-key';  // unique key to point to QR image in attachment
        var attachments = [];
        
        var connextImgID = 'connexted-png';
        var connextedBase64 = "data:image/png;base64,"+Base64Images.connextedImg;
        var connextedImgBuffer = Buffer.from(connextedBase64.substring(22), 'base64');

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
                        error.httpResponseCode = 404;
                        next(error);
                        return;
                    }

                    email = lookupUser.email;
                    username = lookupUser.username;
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

                ABMobile.app(appID)
                .then((App)=>{

                    if (!App) {
                        var error = new Error('Unknown Mobile App');
                        error.httpResponseCode = 403;
                        next(error);
                        return;
                    }

                    MobileApp = App;
                    next();
                })
                .catch(next);

                // AppBuilder.mobileApps()
                // .then((listApps)=>{

                //     var App = listApps.filter((a)=>{return a.id == appID; })[0];

                //     if (!App) {
                //         var error = new Error('Unknown Mobile App');
                //         error.httpResponseCode = 403;
                //         next(error);
                //         return;
                //     }

                //     MobileApp = App;
                //     next();

                // })
                // .catch(next);
            },


            // Get the User's Public Auth Token:
            (next) => {

                ABMobile.publicAuthTokenForUser(user)
                .then((token)=>{

                    if (token) {
                        UserPublicToken = token;
                        next();
                        return;
                    }

                    // this is an error:
                    var error = new Error('Requested User not setup for Relay.');
                    next(error);
                })
                .catch(next);

                // ABRelayUser.findOne({siteuser_guid: user})
                // .then((ru)=>{
                //     if (ru) {
                //         UserPublicToken = ru.publicAuthToken;
                //         next();
                //         return;
                //     }

                //     // this is an error:
                //     var error = new Error('Requested User not setup for Relay.');
                //     next(error);
                // })
                // .catch(next);

            },


            // package together our Email Data
            (next) => {


                triggerID = MobileApp.emailInviteTrigger();     // EmailNotifications trigger ID for the QR Code Email;
                deepLink  = sails.config.appbuilder.deeplink;   // base deeplink url
                apkURL = MobileApp.urlAPK();                    // url to access the android version of the mobile app
                cidQR = 'qr-code-key';                          // QR image attachment data
                attachments = [];
                

                // package the data for our QR Code 
                var QRData = ABMobile.getQRCodeData({
                    UserPublicToken:UserPublicToken,
                    codePushKeys: MobileApp.codePushKeys()
                })

                // deepLink needs to include this data for the MobileApp 
                deepLink += "?settings=" + encodeURIComponent(QRData);

                // now convert to a Base64 image 
                ABMobile.getQRCodeBase64(QRData)
                .then((qrcodeBuffer)=>{

                    // add attachment
                    attachments.push({
                        filename: 'qrcode.png',
                        content: qrcodeBuffer,
                        contents: qrcodeBuffer, // old version syntax
                        cid: cidQR
                    });

                    next();
                })
                .catch(next);

                // QRCode.toDataURL(QRData, (err, image) => {
                //     if (err) next(err);
                //     else {

                //         base64QR = image.substring(22);
                //         var qrcodeBuffer = Buffer.from(base64QR, 'base64');

                //         // add attachment
                //         attachments.push({
                //             filename: 'qrcode.png',
                //             content: qrcodeBuffer,
                //             contents: qrcodeBuffer, // old version syntax
                //             cid: cidQR
                //         });

                //         next();
                //     }
                // });

            },


            // now build Email info and send to user
            (next) => {
                
                if (email) {
                    
                    // add attachment
                    attachments.push({
                        filename: 'connexted.png',
                        content: connextedImgBuffer,
                        contents: connextedImgBuffer, // old version syntax
                        cid: connextImgID
                    });
                    
                    EmailNotifications.trigger(triggerID, {
                        to: [email],
                        variables: {
                            apkURL: apkURL,       // url to android apk file
                            cidQR: cidQR,       // CID for the QR code attachment
                            connextImgID: connextImgID,
                            deepLink: deepLink,
                            username: username
                        },
                        attachments: attachments
                    })
                    .done((html) => {
                        next(); // res.send(html || 'OK');
                    })
                    .fail((err)=>{

                        // pass a generic error back to the Client:
                        var error = new Error('Error Sending Email.');
                        error.httpResponseCode = 500;
                        next(error);
                        
                    });
                } else {
                    // pass a generic error back to the Client:
                    var error = new Error('User does not have an email address.');
                    error.httpResponseCode = 500;
                    next(error);
                }

            }

        ], (err, data)=>{
            if (err) {
                res.AD.error(err, err.httpResponseCode || 400);
            } else {
                res.AD.success({sent:true});    
            }
        })
    },


    // POST: /app_builder/QR/adminQRCode
    // send a QR code to a specified Site User
    // @param {string} user       the SiteUser.guid 
    // @param {string} mobileApp  id of the Mobile App
    adminQRCode:function(req, res) {

// console.log('!!! adminQRCode:');

        var user = req.param('user') || '--';
        var appID = req.param('mobileApp') || '--';
        var version = req.param('version') || '--';


        var MobileApp = null;
        var UserPublicToken = null;

        var qrcodeBuffer = null;  // final data

        async.series([

            // Get the MobileApp object
            (next) => {

                ABMobile.app(appID)
                .then((App)=>{

                    if (!App) {
                        var error = new Error('Unknown Mobile App');
                        error.httpResponseCode = 403;
                        next(error);
                        return;
                    }

                    MobileApp = App;
                    next();
                })
                .catch(next);
            },


            // Get the User's Public Auth Token:
            (next) => {

                ABMobile.publicAuthTokenForUser(user)
                .then((token)=>{

                    if (token) {
                        UserPublicToken = token;
                        next();
                        return;
                    }

                    // this is an error:
                    var error = new Error('Requested User not setup for Relay.');
                    next(error);
                })
                .catch(next);

            },


            // package together our Email Data
            (next) => {

                // package the data for our QR Code 
                var QRData = ABMobile.getQRCodeData({
                    UserPublicToken:UserPublicToken,
                    codePushKeys: MobileApp.codePushKeys(version)
                })

                // now convert to a Base64 image 
                ABMobile.getQRCodeImage(QRData)
                .then((image)=>{
                    qrcodeBuffer = image;
                    next();
                })
                .catch(next);
            }

        ], (err, data)=>{
            if (err) {
                res.AD.error(err, err.httpResponseCode || 400);
            } else {

// testing: simulate a remote call delay
// setTimeout(()=>{
                res.AD.success({image:qrcodeBuffer});    
// }, 5000);
                
            }
        })
    },
    
    // GET: /app_builder/qr/user-qr-code
    // send a QR code to a specified Site User
    // @param {string} user       the SiteUser.guid 
    // @param {string} mobileApp  id of the Mobile App
    userQRCode:function(req, res) {

// console.log('!!! adminQRCode:');
        // TODO we need to find out who the user is not allow them to tell us
        var user = null;
        var appID = req.param('mobileApp') || '--';
        var version = req.param('version') || '--';
        var deepLink = null;


        var MobileApp = null;
        var UserPublicToken = null;
        
        var qrcodeBuffer = null;  // final data

        async.series([

            // Get the MobileApp object
            (next) => {

                ABMobile.app(appID)
                .then((App)=>{

                    if (!App) {
                        var error = new Error('Unknown Mobile App');
                        error.httpResponseCode = 403;
                        next(error);
                        return;
                    }

                    MobileApp = App;
                    next();
                })
                .catch(next);
            },
            
            // Get the current user's username
            (next) => {
                
                // get current user
                user = req.user.username();
                next();

            },
            
            // Get the User's Public Auth Token:
            (next) => {

                ABMobile.publicAuthTokenForUser(user)
                .then((token)=>{

                    if (token) {
                        UserPublicToken = token;
                        next();
                        return;
                    }

                    // this is an error:
                    var error = new Error('Requested User not setup for Relay.');
                    next(error);
                })
                .catch(next);

            },


            // package together our Email Data
            (next) => {

                // package the data for our QR Code 
                var QRData = ABMobile.getQRCodeData({
                    UserPublicToken:UserPublicToken,
                    codePushKeys: MobileApp.codePushKeys(version)
                })

                deepLink  = sails.config.appbuilder.deeplink;   // base deeplink url
                // deepLink needs to include this data for the MobileApp 
                deepLink += "?settings=" + encodeURIComponent(QRData);

                // now convert to a Base64 image 
                ABMobile.getQRCodeImage(QRData)
                .then((image)=>{
                    qrcodeBuffer = image;
                    next();
                })
                .catch(next);
            }

        ], (err, data)=>{
            if (err) {
                res.AD.error(err, err.httpResponseCode || 400);
            } else {

                var body = "<div style='width: 500px; margin: 100px auto; text-align: center; font-family: helvetica, sans-serif; font-size: 14px; font-weight: bold;'><div style='width: 280px; height: 280px; margin: 0 auto 20px; background-size: cover; background-image:url("+qrcodeBuffer+");'></div><br/><a href='"+deepLink+"'>Tap this link if you are on your phone and have ConneXted installed.</a></div>";

                res.end(body);
                
            }
        })
    }



};
