/**
 * ABRelay
 *
 * Interface for communicating with the MobileCommCenter (MCC).
 *
 */

var RP = require('request-promise-native');
var _ = require('lodash');
var crypto = require('crypto');

// setup a timed request to poll for MCC data to process:

module.exports = {

    _formatRequest:function(method, dataField, opt) {

        var url = opt.url || '/';
        if (url[0] == '/') {
            url = sails.config.appbuilder.mcc.url + url;
        }

        var options = {
            method: method,
            uri: url,
            headers: {
                'authorization': sails.config.appbuilder.mcc.accessToken
            },
            json: true // Automatically stringifies the body to JSON
        };

        var data = opt.data || {};
        options[dataField] = data;

        return options;
    },


    get:function(opt) {

        var options = this._formatRequest('GET', 'qs', opt);
        return RP(options);
    },


    post:function(opt) {
         
        var options = this._formatRequest('POST', 'body', opt);
        return RP(options);
    },



    pollMCC:function() {
        return new Promise((resolve, reject)=>{

            ABRelay.get({url:'/mcc/initresolve'})
            .then((response)=>{

                var all = [];
                response.data.forEach((entry)=>{
                    all.push(ABRelay.resolve(entry))
                })

                return Promise.all(all)
            })
            .then(resolve)
            .catch((err)=>{

                // if err was related to a timeout :
                // var error = new Error('Server Timeout')
                // error.error = err;
                // error.code = 'E_SERVER_TIMEOUT'
                // reject(error);

                reject(err);
            });

        })
    },


    resolve:function(entry) {

        return Promise.resolve()
        // find the ABRelayUser
        .then(()=>{

            if (entry.user) {
                return ABRelayUser.findOne({user:entry.user});
            } else {
                return null;
            }
        })
        .then((relayUser)=>{
            if (relayUser) {

                var key = relayUser.rsa_private_key;
                try {
                    var plaintext = crypto.privateDecrypt(
                        {
                            key: key,
                            //padding: crypto.constants.RSA_NO_PADDING
                            padding: crypto.constants.RSA_PKCS1_PADDING
                            //padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
                        },
                        Buffer.from(entry.rsa_aes, 'base64')
                    );
                    if (plaintext) {
                        return { relayUser:relayUser, aes:plaintext.toString() };
                    } else {
                        return null;
                    }
                } catch (err) {
                    // could not decrypt
                    sails.log.error('Unable to decrypt RSA', err);
                    return null;
                }

            } else {

                return null;
            }

        })

        // Now create an AppUser entry connected to relayUser
        .then((values)=>{
            if (values) {

                var newAppUser = {
                    aes:JSON.parse(values.aes).aesKey,
                    appUUID:entry.appUUID,
                    appID:entry.appID
                }

                var relayUser = values.relayUser;
                relayUser.appUser.add(newAppUser);

                // I wish .save() was a promise
                return new Promise((resolve, reject)=>{

                    relayUser.save((err)=>{
                        if (err) {
                            ADCore.error.log('AppBuilder:ABRelay:.resolve():Unable to save New App User entry.', {error:err, newAppUser:newAppUser });
                            reject(err);
                            return;
                        }

                        resolve();
                    })
                });
            }
        })
    }
   

};