/**
 * @module SiteUser
 * @description :: Database store of user accounts on the site
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

var crypto = require("crypto");
var _ = require("lodash");

module.exports = {
   tableName: "site_user",
   // autoCreatedAt:true,
   // autoUpdatedAt:true,
   // autoPK:false,
   migrate: "safe", // don't update the tables!

   // connection:"appdev_default",

   attributes: {
      // id: {
      //     type: 'integer',
      //     primaryKey: true,
      //     autoIncrement: true
      // },

      // GUID from external authentication service such as CAS
      guid: {
         type: "string",
         maxLength: 36,
         unique: true
      },

      username: {
         type: "string",
         maxLength: 36,
         unique: true,
         required: true
      },

      // hashed password
      password: {
         type: "text",
         defaultsTo: ""
      },

      salt: {
         type: "string",
         size: 64
      },

      email: {
         type: "text",
         email: true
      },

      isActive: {
         type: "integer",
         size: 1,
         defaultsTo: 1
      },

      lastLogin: {
         type: "datetime",
         defaultsTo: function() {
            return new Date();
         }
      },

      failedLogins: {
         type: "integer",
         defaultsTo: 0
      },

      languageCode: {
         type: "string",
         size: 25,
         defaultsTo: function() {
            return sails.config.appdev["lang.default"];
         }
      },

      ren_id: {
         type: "integer",
         size: 11
      },

      // permission: {
      // 	collection: 'Permission',
      // 	via: 'user'
      // },

      sendEmailNotifications: {
         type: "integer",
         size: 1,
         defaultsTo: 1
      },

      image_id: {
         type: "string",
         maxLength: 36,
         unique: true
      },

      //// Instance model methods

      toJSON: function() {
         var obj = null;
         if (this.toObject) {
            obj = this.toObject();
         } else {
            obj = _.clone(this);
         }
         delete obj.password;
         delete obj.salt;
         return obj;
      },

      /**
       * To be called whenever a user login is attempted. Updates the
       * failedLogins counter and lastLogin timestamp.
       *
       * @param bool success
       *      Was the login successful?
       * @return Waterline promise
       */
      loginUpdate: function(success) {
         if (success) {
            this.lastLogin = new Date();
            this.failedLogins = 0;
         } else {
            this.failedLogins += 1;
         }
         return this.save();
      }
   },

   ////////////////////////////
   // Model class properties
   ////////////////////////////

   maxFailedLogins: 5,
   minPasswordLength: 8,

   ////////////////////////////
   // Model class methods
   ////////////////////////////

   /**
    * Returns a hex string of 32 random bytes for use as the user's password
    * salt.
    *
    * @return string
    */
   generateSalt: function() {
      return crypto.randomBytes(32).toString("hex");
   },

   /**
    * Generate a password hash from its plaintext value and salt.
    * The hash algorithm is intentionally slow in order to thwart brute force
    * password cracking.
    *
    * @param string password
    * @param string salt
    * @return {Promise}
    */
   hash: function(password, salt) {
      return new Promise((resolve, reject) => {
         // verify salt is not null.
         // #fix: migration issue with old accounts not having a salt value.
         if (salt == null) {
            var err = new Error(
               "user can not have a null salt. Perhaps this is an old account needing updating?"
            );
            reject(err);
         } else {
            crypto.pbkdf2(password, salt, 100000, 512, "sha1", function(
               err,
               key
            ) {
               if (err) {
                  reject(err);
               } else {
                  resolve(key.toString("hex"));
               }
            });
         }
      });
   },

   /**
    * Authentication without password.
    * (For use with OAuth, CAS, etc., or just deserializing from session data)
    * You should probably use `guid` or `username`.
    *
    * This is mainly to provide a consistent interface with
    * findByUsernamePassword().
    *
    * @param object findOpts
    * @return {Promise}
    */
   findWithoutPassword: function(findOpts) {
      return new Promise((resolve, reject) => {
         ABUser.find(findOpts)
            .populate("permission")
            .then(function(list) {
               if (!list || !list[0]) {
                  resolve(false);
               } else if (list.length > 1) {
                  // findOpts was not specific enough.
                  // Finding by a unique field will prevent this.
                  reject(new Error("Too many matches"));
               } else {
                  resolve(list[0]);
                  // Don't update lastLogin timestamp here because
                  // this may have just been a deserialization from
                  // session data.
               }
               return null;
            })
            .catch(reject);
      });
   },

   /**
    * Local authentication by plaintext username & password
    *
    * @param object findOpts
    *      - username
    *      - password
    *          Plaintext password
    * @return jQuery Deferred
    *      Resolves with the matching SiteUser object instance
    *      or false if there is no match.
    */
   findByUsernamePassword: function(findOpts) {
      var username = findOpts.username,
         password = findOpts.password;
      var user, salt, hashedPassword;

      // 1. Find by username
      // 2. Fetch user's salt
      // 3. Hash the given password with user's salt
      // 4. Compare hashed passwords

      return new Promise((resolve, reject) => {
         ABUser.find({ username: username })
            .populate("permission")
            .then(function(list) {
               if (!list || !list[0]) {
                  // No username match. But keep going so attackers can't
                  // tell the difference by watching the response time.
                  user = null;
                  salt = "";
                  hashedPassword = "";
               } else {
                  user = list[0];
                  salt = user.salt;
                  hashedPassword = user.password;
               }

               if (user && user.failedLogins > ABUser.maxFailedLogins) {
                  reject(
                     new Error(
                        "Too many failed attempts. Please contact an admin."
                     )
                  );
               } else {
                  ABUser.hash(password, salt)
                     .done(function(hashResult) {
                        if (user && hashResult == hashedPassword) {
                           resolve(user);
                           // Don't update lastLogin timestamp here because
                           // this may have just been a deserialization from
                           // session data.
                        } else {
                           resolve(false);
                           if (user) {
                              // Increment failed login count
                              user.loginUpdate(false);
                           }
                        }
                     })
                     .fail(reject);
               }
               return null;
            })
            .catch(reject); // ABUser.find() error
      });
   },

   ////////////////////////////
   // Model lifecycle callbacks
   ////////////////////////////

   // afterCreate: function (newlyInsertedRecord, next) {

   // 	var safeData = _.clone(newlyInsertedRecord);
   // 	delete safeData.password;
   // 	delete safeData.salt;
   // 	ADCore.queue.publish('ABUser.created', { user: safeData });
   // 	next();
   // },

   beforeCreate: function(values, next) {
      // Set username = GUID if not provided
      if (!values.username && values.guid) {
         values.username = values.guid;
      }

      // Set GUID = username if not provided
      if (!values.guid && values.username) {
         values.guid = values.username;
      }

      // Create salt and hash the password
      if (values.password) {
         values.salt = ABUser.generateSalt();
         ABUser.hash(values.password, values.salt)
            .fail(next)
            .done(function(hashedPassword) {
               values.password = hashedPassword;
               next();
            });
      } else {
         next();
      }
   },

   // afterUpdate: function (updatedRecord, next) {

   // 	var safeData = _.clone(updatedRecord);
   // 	delete safeData.password;
   // 	delete safeData.salt;
   // 	ADCore.queue.publish('ABUser.updated', { user: safeData });
   // 	next();
   // },

   beforeUpdate: function(values, next) {
      // A hashed password is 1024 characters long. If the given password
      // is shorter, treat it as plaintext that needs to be hashed before
      // saving.
      if (values.password && values.password.length < 1024) {
         // Create new salt and hash
         values.salt = ABUser.generateSalt();
         ABUser.hash(values.password, values.salt)
            .fail(next)
            .done(function(hashedPassword) {
               values.password = hashedPassword;
               next();
            });
      } else {
         next();
      }
   }

   // afterDestroy: function (destroyedRecords, next) {

   // 	var safeData = [];
   // 	destroyedRecords.forEach(function (rec) {
   // 		var r = _.clone(rec);
   // 		delete r.password;
   // 		delete r.salt;
   // 		safeData.push(r);
   // 	});
   // 	ADCore.queue.publish('ABUser.destroyed', { user: safeData });
   // 	next();
   // }
};
