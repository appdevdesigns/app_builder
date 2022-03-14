/**
 * ABRelayUser
 * @module      :: Model
 * Manage the encryption details for a user to send data via the Relay connections.
 *
 * The AppBuilder generates a RelayUser entry for a site user.
 * this ABRelayUser{.user, .publickey, .authToken } gets sent to the public server
 * A QRCode{ codePushKeys, .authToken } for an Application is sent to the site user's account
 * The mobile device updates it's code using the codePushKeys (new codebase defines publicServerURL, and AppID)
 * The mobile device contacts the public server, gets an initialization packet (for a given AppID)
 * The mobile device uses this setup info to generate an AES key (encrypted in RSA)
 * The mobile device sends this response packet {.AES, .appid, user } back to the public server
 * the AppBuilder queries the PublicServer and receives the ResponsePacket{.AES, .appID, .user}
 * the AppBuilder creates a new ABRelayApplicationUser entry with {.AES, appID, .user }
 * All further communications between the AppBuilder and that users' application are Encrypted/Decrypted using ABRelayApplicationUser
 * 
 *
 *

So it sounds like a QR code needs to include the following info:
    userAuthToken
    codepushkeys

The AppBuilder MobileFramework (MF) should be able to decode the QR code and:
    - receive a new set of code from Microsoft CodePush using the codePushKeys
    - The new set of code contains the server url for the Public Server
    - The new set of code contains the AppID of the mobile app 
    - The MF then initiates a PublicServer.mobile/init {userAuthToken, AppID }
    - PublicServer responds with { userUUID, rsaPublic, appPolicy for AppID }
    - MF generates an AES key, encrypts it with rsaPublic: rsa_aes
    - MF generates an AppUUID (a unique ID for an App on a specific user's device)
            Note: if a user downloads this app on multiple devices, 
                  each device will generate a unique AES key 
    - MF contacts PublicServer.mobile/initresolve  { rsa_aes, userUUID, AppID, AppUUID }

    - from now on MF makes requests with POST PublicServer.mobile/relay using data encrypted with AES key.
            each request needs: userAuthToken,  and AppUUID


    - AppBuilderRelayServer (ABRS) communicates with PublicServer.mcc/initresolve  and receives pending resoultions
    - ABRS unencrypts rsa_aes using the user's rsa_private key.
    - ABRS stores a ABRelayAppUser entry: { siteUserID, AppUUID, AES }


    - from now on ABRS polls GET PublicServer.mcc/relay  looking for messages to receive and respond to.
            each message is unencrypted based upon the AppUUID--> AES key from ABRelayAppUser

    - ABRS responds to POST PublicServer.mcc/relay  with packets encrypted with AES key
            each message contains AppUUID

    - MF polls GET PublicServer.mobile/relay { AppUUID }  and receives packets for this AppUUID


    


 
 */

var async = require("async");
var _ = require("lodash");
var child_process = require("child_process");
var uuid = require("uuid/v4");
var crypto = require("crypto");

module.exports = {
   tableName: "appbuilder_relay_user",

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
      siteuser_guid: {
         type: "string",
         maxLength: 36,
         unique: true
      },

      // user: a uuid that is sent to the mobile client.
      // each data packet sent from the client will reference this uuid
      user: {
         type: "string",
         maxLength: 40
      },

      // unique random string to be embedded in a URL that the user will use to activate their mobile app
      registrationToken: {
         type: "string",
         maxLength: 100
      },

      // initial rsa key
      // used to send to the client, so they can encrypt their aes key and
      // return it back to us.
      rsa_public_key: {
         type: "mediumtext"
      },

      rsa_private_key: {
         type: "mediumtext"
      },

      // appUser
      // any instances of our mobile app's encryption keys:
      appUser: {
         collection: "abrelayappuser",
         via: "relayUser"
      },

      //// Instance model methods

      toJSON: function() {
         // This model's data is not intended to be sent to the client.
         // But if for some reason that is done, the private key must
         // remain secret.
         var obj;
         if (this.toObject) {
            obj = this.toObject();
         } else {
            obj = _.clone(this);
         }
         delete obj.rsa_private_key;
         return obj;
      }
   },

   ////
   //// Life cycle callbacks
   ////

   ////
   //// Model class methods
   ////

    // Return an sha2 hash in base64 encoding.
    hash: function(plaintext) {
        let hasher = crypto.createHash('sha256');
        hasher.update(plaintext);
        return hasher.digest('base64');
    },
    
   /**
    * Generate relay account registration token & encryption keys for the 
    * given user.
    *
    * This is a slow process.
    * 
    * If the account already exists, encryption keys will not be overwritten
    * unless requested in the options. The registration token will always be
    * overwritten.
    *
    * @param {integer} userGUID
    *    The AppBuilder site_user.guid value of this user.
    * @param {object} options
    * @param {boolean} [options.overwriteKeys]
    *    Overwrite with new encryption keys if the account already exists.
    *    Default is false.
    * @return {Promise}
    */
   initializeUser: function(userGUID, options = {}) {
      return new Promise((resolve, reject) => {
         if (!userGUID) {
            reject(new Error("Invalid userGUID"));
            return;
         }

         var relayAccountExists = false;
         var siteUserGUID = userGUID; // appbuilder user GUID
         var userUUID; // relay user UUID
         var privateKey, publicKey;

         async.series(
            [
               // Make sure the userGUID is valid
               (next) => {
                  ABRelayUser.query(
                     `
                        SELECT id 
                        FROM site_user
                        WHERE siteuser_guid = ?
                     `,
                     [userGUID],
                     (err, list) => {
                        if (err) next(err);
                        else if (!list || !list[0]) next(new Error("Invalid userGUID"));
                        else next();
                     }
                  );
               },

               (next) => {
                  // Check if the relay account already exists
                  ABRelayUser.query(
                     `
                        SELECT user
                        FROM appbuilder_relay_user
                        WHERE siteuser_guid = ?
                     `,
                     [siteUserGUID],
                     (err, list) => {
                        if (err) next(err);
                        else if (list && list[0]) {
                           // Relay account exists
                           relayAccountExists = true;
                           userUUID = list[0].user;
                           next();
                        }
                        else {
                           // Relay account does not exist yet
                           next();
                        }
                     }
                  );
               },

               (next) => {
                  if (relayAccountExists && !options.overwriteKeys) {
                     return next();
                  }

                  // Generate private key
                  child_process.exec("openssl genrsa 2048", (err, stdout) => {
                     if (err) next(err);
                     else {
                        privateKey = stdout;
                        next();
                     }
                  });
               },

               (next) => {
                  if (relayAccountExists && !options.overwriteKeys) {
                     return next();
                  }

                  // Generate public key
                  var proc = child_process.exec(
                     "openssl rsa -outform PEM -pubout",
                     (err, stdout) => {
                        if (err) next(err);
                        else {
                           publicKey = stdout;
                           next();
                        }
                     }
                  );
                  proc.stdin.write(privateKey);
                  proc.stdin.end();
               },

               (next) => {
                  if (relayAccountExists) {
                     return next();
                  }

                  // Create new DB entry if needed.
                  userUUID = uuid();
                  ABRelayUser.query(
                    `
                        INSERT INTO appbuilder_relay_user
                        SET
                           siteuser_guid = ?,
                           user = ?
                    `,
                     [siteUserGUID, userUUID],
                     (err) => {
                        if (err) next(err);
                        else next();
                     }
                  );
                },

                (next) => {
                  // Add new registration token
                  ABRelayUser.query(
                     `
                        UPDATE appbuilder_relay_user
                        SET
                           registrationToken = SHA2(CONCAT(RAND(), UUID()), 224)
                        WHERE
                           siteuser_guid = ?
                     `,
                     [siteUserGUID],
                     (err) => {
                        if (err) next(err);
                        else next();
                     }
                  );
               },

               (next) => {
                  // Save encryption keys if needed
                  if (!privateKey || !publicKey) {
                     return next();
                  }

                  ABRelayUser.query(
                     `
                        UPDATE appbuilder_relay_user
                        SET
                           rsa_private_key = ?,
                           rsa_public_key = ?
                        WHERE
                           siteuser_guid = ?
                        
                    `,
                     [privateKey, publicKey, siteUserGUID],
                     (err) => {
                        if (err) next(err);
                        else next();
                     }
                  );
               }
            ],
            (err) => {
               if (err) reject(err);
               else resolve();
            }
         );
      });
   },

   /**
    * Create relay accounts for current workers in HRIS who don't have
    * accounts yet.
    *
    * @return {Promise}
    */
   initializeFromHRIS: function() {
      return new Promise((resolve, reject) => {
         var hrisRen = [];
         var relayUsers = [];

         async.series(
            [
               (next) => {
                  // Find active workers
                  LHRISWorker.query(
                     `
                        
                        SELECT
                            w.ren_id
                        FROM
                            hris_worker w
                            JOIN hris_ren_data r
                                ON w.ren_id = r.ren_id
                        WHERE
                            r.statustype_id IN (3, 4, 5)
                            AND (
                                w.worker_terminationdate = '1000-01-01'
                                OR w.worker_terminationdate > NOW()
                            )
                        
                    `,
                     [],
                     (err, list) => {
                        if (err) next(err);
                        else {
                           hrisRen = list.map((x) => x.ren_id) || [];
                           next();
                        }
                     }
                  );
               },

               (next) => {
                  // Find existing relay users
                  RelayUser.query(
                     `
                        
                        SELECT ren_id
                        FROM appbuilder_relay_user
                        
                    `,
                     [],
                     (err, list) => {
                        if (err) next(err);
                        else {
                           relayUsers = list.map((x) => x.ren_id) || [];
                           next();
                        }
                     }
                  );
               },

               (next) => {
                  var diff = _.difference(hrisRen, relayUsers);
                  sails.log(
                     "Initializing " + diff.length + " relay accounts..."
                  );

                  // Initialize new users one at a time
                  async.eachSeries(
                     diff,
                     (renID, userDone) => {
                        this.initializeUser(renID)
                           .then(() => {
                              sails.log.verbose("...initialized user " + renID);
                              userDone();
                           })
                           .catch((err) => {
                              userDone(err);
                           });
                     },
                     (err) => {
                        err && sails.log.error(err);
                        sails.log("...done");

                        if (err) next(err);
                        else next();
                     }
                  );

               }
            ],
            (err) => {
               if (err) {
                  sails.log.error(
                     "Error initializing relay users from HRIS",
                     err
                  );
                  reject(err);
               } else resolve();
            }
         );
      });
   }
};
