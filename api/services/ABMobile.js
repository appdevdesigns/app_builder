/**
 * ABRelay
 *
 * Interface for communicating with the MobileCommCenter (MCC).
 *
 */

var QRCode = require("qrcode");

// setup a timed request to poll for MCC data to process:

module.exports = {
   /**
    * app
    * return the MobileApp for the provided appID
    * @param {string} appID  the uuid of the Mobile App
    * @return {Promise}  {MobileApp} if found, {undefined} if not.
    */
   app: function(appID) {
      return new Promise((resolve, reject) => {
         AppBuilder.mobileApps()
            .then((listApps) => {
               var App = listApps.find((a) => {
                  return a.id == appID;
               });

               // just return whatever we found, even if nothing:
               resolve(App);
            })
            .catch(reject);
      });
   },

   /**
    * getQRCodeData
    * return the string to be embedded as a QR code
    * @param {obj} options
    *              options.token  {string} the registration token of the user.  
    *                             Found in {ABRelayUser}.
    * @return {string}
    */
   getQRCodeData: function(options) {
      var error;

      if (!options.token) {
         error = new Error("Missing parameters to ABMobile.getQRCodeImage");
         error.code = "EMISSINGPARAMS";
         error.details = ["options.token"];
         ADCore.error.log("ABMobile:getQRCodeData:Missing Data", {
            error: error
         });
      }

      if (!sails.config.appbuilder.pwaURL) {
         error = new Error("appbuilder.pwaURL not set in config/local.js");
         error.code = "EMISSINGCONFIG";
         ADCore.error.log("appbuilder.pwaURL not set in config/local.js", {
            error: error
         });
      }

      if (error) return "";
      else {
         return sails.config.appbuilder.pwaURL + "#JRR=" + options.token;
      }
   },

   /**
    * getQRCodeImage
    * return a string with the encoded url data for the QR Code image.
    * @param {string} data  the data to encode in the QR Code.
    * @return {Promise}  resolved with {string} of QRCode Image.
    */
   getQRCodeImage: function(data) {
      return new Promise((resolve, reject) => {
         QRCode.toDataURL(data, (err, image) => {
            if (err) reject(err);
            else {
               resolve(image);
            }
         });
      });
   },

   /**
    * getQRCodeBase64
    * return the QRCodeImage in Base64 format
    * @param {string} data  the data to encode in the QR Code.
    * @return {Promise}  resolved with {Base64String} of QRCode Image.
    */
   getQRCodeBase64: function(data) {
      return ABMobile.getQRCodeImage(data).then((image) => {
         var base64QR = image.substring(22);
         var qrcodeBuffer = Buffer.from(base64QR, "base64");

         return qrcodeBuffer;
      });
   },

   /**
    * registrationTokenForUser
    * generate and return a new registration token for the provided User
    * @param {string} userGUID  the user's GUID (siteuser.guid)
    * @return {Promise}  resolved with {string} registrationToken
    *                    or {undefined} if not found.
    */
   registrationTokenForUser: function(userGUID) {
      return ABRelayUser.initializeUser(userGUID)
         .then(() => {
            return ABRelayUser.findOne({ siteuser_guid: userGUID });
         })
         .then((ru) => {
            if (ru) {
               return ru.registrationToken;
            }
         });
   }
};
