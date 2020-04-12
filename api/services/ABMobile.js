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
    * return a string with encoded JSON data for our mobile apps to use in
    * their initializations.
    * @param {obj} options
    *              options.UserPublicToken  {string} the public auth token
    *                          the user.  Found in {ABRelayUser}.
    * @return {string}  or {null} if invalid data provided.
    */
   getQRCodeData: function(options) {
      var UserPublicToken = options.UserPublicToken;
      var codePushKeys = options.codePushKeys;

      var error;

      if (!UserPublicToken) {
         if (!error) {
            error = new Error("Missing parameters to ABMobile.getQRCodeImage");
            error.code = "EMISSINGPARAMS";
            error.details = [];
         }
         error.details.push("options.UserPublicToken");
      }

      if (!codePushKeys) {
         if (!error) {
            error = new Error("Missing parameters to ABMobile.getQRCodeImage");
            error.code = "EMISSINGPARAMS";
            error.details = [];
         }
         error.details.push("options.codePushKeys");
      }

      if (error) {
         ADCore.error.log("ABMobile:getQRCodeData:Missing Data", {
            error: error
         });
         // throw error;
         return null;
      }

      var QRData = JSON.stringify({
         userInfo: {
            auth_token: UserPublicToken,
            updateKeys: codePushKeys
         }
      });

      return QRData;
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
    * publicAuthTokenForUser
    * return the public auth token for the provided User
    * @param {string} userGUID  the user's GUID (siteuser.guid)
    * @return {Promise}  resolved with {string} publicAuthToken
    *                    or {undefined} if not found.
    */
   publicAuthTokenForUser: function(userGUID) {
      return new Promise((resolve, reject) => {
         ABRelayUser.findOne({ siteuser_guid: userGUID })
            .then((ru) => {
               if (ru) {
                  resolve(ru.publicAuthToken);
                  return;
               }

               resolve();
            })
            .catch(reject);
      });
   }
};
