/**
 * @module ABQRAppUser
 * @description Model
 * Create a unique QR Token to link together a Mobile App + User
 *
 */

var async = require("async");
var _ = require("lodash");
var child_process = require("child_process");
var uuid = require("uuid/v4");

module.exports = {
   tableName: "appbuilder_qr_appuser",

   autoCreatedAt: false,
   autoUpdatedAt: false,
   autoPK: false,
   // migrate: 'safe',
   migrate: "alter",

   attributes: {
      id: {
         type: "integer",
         size: 11,
         primaryKey: true,
         autoIncrement: true
      },

      // // Foreign key to HRIS
      // ren_id: {
      //     type: 'integer',
      //     size: 11,
      //     unique: true,
      // },

      // Foreign key to SiteUser.guid
      siteuser: {
         type: "string",
         maxLength: 36,
         unique: true
      },

      // which Mobile App ID
      mobile: {
         type: "string",
         maxLength: 36,
         unique: true
      },

      // token: a uuid that is sent to the mobile client.
      // to be allowed to connect to the public server, the client must use this auth token
      // in it's communications.
      token: {
         type: "mediumtext"
      }
   },

   ////
   //// Life cycle callbacks
   ////

   ////
   //// Model class methods
   ////

   /**
    * Generate relay account & encryption keys for the given user.
    *
    * This is a slow process.
    * If an entry for the user already exists, it will be replaced.
    *
    * @param {integer} renID
    * @return {Promise}
    */
   initializeAppUser: function(userGUID, MobileAppID) {
      return new Promise((resolve, reject) => {
         if (!userGUID) {
            reject(new Error("Invalid userGUID"));
            return;
         }

         if (!MobileAppID) {
            reject(new Error("Invalid MobileAppID"));
            return;
         }

         // Save to database
         ABQRAppUser.query(
            `

                REPLACE INTO appbuilder_qr_appuser
                SET
                    siteuser = ?,
                    mobile = ?,
                    token = SHA2(CONCAT(RAND(), UUID()), 224)

            `,
            [userGUID, MobileAppID],
            (err) => {
               if (err) reject(err);
               else resolve();
            }
         );
      });
   }
};
