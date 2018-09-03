/**
 * ABRelay
 *
 * Interface for communicating with the MobileCommCenter (MCC).
 *
 */

var RP = require('request-promise-native');
var _ = require('lodash');
var crypto = require('crypto');


var cookieJar = RP.jar();

var CSRF = {
    token: null,
    /**
     * Fetch the user's CSRF token from sails.js
     * @return Deferred
     *    Resolves with the CSRF token string when it has been fetched
     */
    fetch: function () {
        return new Promise((resolve, reject)=>{

            var options = {
                method: 'GET',
                uri: sails.config.appbuilder.baseURL + '/csrfToken',
                json: true,
                jar:cookieJar
            }

options.rejectUnauthorized = false;
// console.log('::: csrf.fetch()');
            RP(options)
            .then((data)=>{

                CSRF.token = data._csrf;
                resolve(CSRF.token);
            })
            .catch((err)=>{
                var csrfError = new Error('ABRelay:: unable to get CSRF token: '+err.message);
                sails.log.error(csrfError)
                reject(csrfError);
            })
        })
    }
}


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
            timeout:2000,   // 2s timeout to wait for a connection to the MCC
time:true,  // capture timing information during communications process
resolveWithFullResponse: true,
            json: true // Automatically stringifies the body to JSON
        };

        var data = opt.data || {};
        options[dataField] = data;

        return options;
    },


    get:function(opt) {

        var options = this._formatRequest('GET', 'qs', opt);
        return RP(options)
            .then((fullResponse)=>{
                // sails.log('    response:', fullResponse.timings, fullResponse.timingPhases);
                return fullResponse.body;   // just send back the body as a simple response 
            })
    },


    post:function(opt) {
         
        var options = this._formatRequest('POST', 'body', opt);
        return RP(options)
            .then((fullResponse)=>{
                // sails.log('    response:', fullResponse.timings, fullResponse.timingPhases);
                return fullResponse.body;   // just send back the body as a simple response 
            })
    },



    /**
     * _formatServerRequest
     * create the parameters necessary for us to pass the request on
     * to the CoreServer:
     * @param {obj} opt  the passed in request options
     * @param {ABRelayUser} relayUser the relayUser making this request.
     * @return {obj}
     */
    _formatServerRequest:function(opt, relayUser) {

        var method = opt.type || opt.method || 'GET';
        var dataField = 'body';

        switch(method) {
            case 'GET':
                dataField = 'qs';
                break;
            case 'POST':
                dataField = 'body';
                break;
        }

        var url = opt.url || '/';
        if (url[0] == '/') {
            url = sails.config.appbuilder.baseURL + url;
        }

        var options = {
            method: method,
            uri: url,
            headers: {
                'authorization': relayUser.publicAuthToken
            },
            json: true // Automatically stringifies the body to JSON
        };

        var data = opt.data || opt.params || {};
        options[dataField] = data;


        // CSRF Token
        if (method != 'GET') {
            options.headers['X-CSRF-Token'] = CSRF.token;
            options.jar = cookieJar;
        }

// default for all https requests
// (whether using https directly, request, or another module)
// require('https').globalAgent.options.ca = rootCas;
// options.globalAgent = {
//     options:{
//         ca : rootCas
//     }
// }
//// LEFT OFF HERE:
// debugging RelayServer to make request to AppBuilder
// 1) having problems with SSL certs: currently doing this:
options.rejectUnauthorized = false;

// but that isn't very safe...


        return options;
    },


    /**
     * encrypt
     * return an AES encrypted blob of the stringified representation of the given
     * data.
     * @param {obj} data
     * @param {string} key  the AES key to use to encrypt this data
     * @return {string}
     */
    encrypt: function(data, key) {

        var encoded = "";

        if (data && key) {

            // Encrypt data
            var plaintext = JSON.stringify(data);
            var iv = crypto.randomBytes(16).toString('hex');

            var cipher = crypto.createCipheriv(
                'aes-256-cbc',
                Buffer.from(key, 'hex'),
                Buffer.from(iv, 'hex')
            );
            var ciphertext = cipher.update(plaintext, 'utf8', 'base64');
            ciphertext += cipher.final('base64');

            // <base64 encoded cipher text>:::<hex encoded IV>
            encoded = ciphertext.toString() + ':::' + iv;

        }

        return encoded;
    },


    /**
     * decrypt
     * return a javascript obj that represents the data that was encrypted
     * using our AES key.
     * @param {string} data
     * @return {obj}
     */
    decrypt: function(data, key) {

        var finalData = null;

        // Expected format of encrypted data:
        // <base64 encoded ciphertext>:::<hex encoded IV>
        var dataParts = data.split(':::');
        var ciphertext = dataParts[0];
        var iv = dataParts[1];

        try {
            
            var decipher = crypto.createDecipheriv(
                'aes-256-cbc', 
                Buffer.from(key, 'hex'), 
                Buffer.from(iv, 'hex')
            );
            var plaintext = decipher.update(ciphertext, 'base64', 'utf8');
            plaintext += decipher.final('utf8');
            
            // Parse JSON
            try {
                finalData = JSON.parse(plaintext);
            } catch (err) {
                finalData = plaintext;
            }


        } catch (err) {
            // could not decrypt
            sails.log.error('Unable to decrypt AES', err);
        }


        return finalData;

    },



    pollMCC:function() {
        return new Promise((resolve, reject)=>{

            // 1) get any key resolutions and process them
            ABRelay.get({url:'/mcc/initresolve'})
            .then((response)=>{

                var all = [];
                response.data.forEach((entry)=>{
                    all.push(ABRelay.resolve(entry))
                })

                return Promise.all(all)
            })

            // 2) get any message requests and process them
            .then(()=>{

                return ABRelay.get({url:'/mcc/relayrequest'})
                .then((response)=>{

                    var all = [];
                    response.data.forEach((request)=>{
                        all.push(ABRelay.request(request));
                    })
                    // Johnny: in debugging a problem with our polling taking too long,
                    // I decided to NOT wait until all the responses were completed before
                    // contining on with the polling.  Seems to work fine.
                    // return Promise.all(all)
                })

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
        // make sure we don't already have an entry with the same .appUUID
        // there should be only one, so don't add a duplicate:
        .then(()=>{

            return ABRelayAppUser.findOne({appUUID:entry.appUUID})
        })

        // find the ABRelayUser
        .then((existingAppUser)=>{

            // if we had an existing AppUser, PASS
            if (existingAppUser) {
                return null;
            }

            // otherwise continue on
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
    },



    request: function(request) {

        var appUser = null;
        var relayUser = null;

var errorOptions = null;

        return Promise.resolve()

        // 1) get the RelayAppUser from the given appUUID
        .then(()=>{

            return ABRelayAppUser.findOne({appUUID:request.appUUID})
            .populate('relayUser')
            .then((entry)=>{
                if (entry) {

                    appUser = entry;
                    relayUser = entry.relayUser;

                } else {

                    var error = new Error('ABRelay:request:1) can not find ABRelayAppUser for appUUID:'+request.appUUID);
                    ADCore.error.log('ABRelay:request:(1) can not find ABRelayAppUser for appUUID:'+request.appUUID, { error:error, request: request });
                    throw error;
                }

// return entry;
            })
        })

        // 2) Decode the data:
        .then(()=>{

            return this.decrypt(request.data, appUser.aes);

        })

        // 2b) Make sure we have a CSRF token if we need one:
        .then((params)=>{
            var method = params.type || params.method || 'GET';
            if ((method == 'GET') || (CSRF.token)) {
                return params;
            } else {

                return CSRF.fetch()
                .then((token)=>{
                    return params;
                })
            }
        })

        // 3) use data to make server call:
        .then((params) => {
// console.log('::: ABRelay.request(): params:', params);
            // params should look like:
            // {
            //     type:'GET',
            //     url:'/path/to/url',
            //     data:{ some:data }
            // }
    
            var options = this._formatServerRequest(params, relayUser);
errorOptions = options;
            return new Promise((resolve, reject)=>{
// console.log('::: ABRelay.request(): options:', options);
                // make the call
                RP(options)
                .then((response)=>{

                    // pass back the default responses
                    resolve(response);
                })
                .catch((err)=>{

                    // if we received an error, check to see if it looks like a standard error
                    // response from our API.  If so, just return that:
                    if (err.error) {
                        if (err.error.status == 'error' && err.error.data) {
                            
                            // sails.log.error('::: ABRelay.request(): response was an error: ', { request:options, code: err.error.data.code, message:err.error.data.sqlMessage || 'no sql msg', sql:err.error.data.sql || ' - no sql -' } );
                            ADCore.error.log('ABRelay:request(): response was an error: ', { request:options, code: err.error.data.code, message:err.error.data.sqlMessage || 'no sql msg', sql:err.error.data.sql || ' - no sql -', error:err } )
                            err.error._request = {
                                data: errorOptions.body || errorOptions.qs,
                                method: errorOptions.method,
                                uri: errorOptions.uri
                            };

                            resolve(err.error);
                            return ;
                        }
                    }


                    // if a different error, then pass this along our chain() and process in our .catch() below
                    reject(err);
                });
            });

        })

        // 4) encrypt the response:
        .then((response)=>{
            return this.encrypt(response, appUser.aes);
        })

        // 4b) break the encrypted data in smaller packets
        .then((encryptedData)=>{
            var packets=[];
            packIt(encryptedData, packets);
            return packets;
        })

        // 5) update MCC with the response for this request:
        .then((encryptedDataPackets)=>{

            // sendOne()
            // recursive fn() to send off the responses to the MCC.
            // this should handle timeout errors and resend the missed attempts.
            var sendOne = (i, cb) => {

                // if we have sent all the packets -> cb()
                if (i >= encryptedDataPackets.length) {
                    cb();

                } else {

                    var returnPacket = {
                        appUUID:request.appUUID,
                        data:encryptedDataPackets[i],
                        jobToken:request.jobToken,
                        packet:i,
                        totalPackets:encryptedDataPackets.length
                    }

                    ABRelay.post({ url:'/mcc/relayrequest', data:returnPacket }) 
                        .then((resRP)=>{

                            // send the next one
                            sendOne( i+1, cb);
                        })
                        .catch((err)=>{

                            if (err.error && err.error.code == 'ETIMEDOUT') {
                                sails.log.error('!!! time out error with MCC!');
                            } else {

                                // if this wasn't a ETIMEDOUT error, log it here:
                                ADCore.error.log('::: ABRelay:request(): caught error in response to MCC', { error:err, request: errorOptions });
                            }

                            // retry this one:
                            sendOne(i, cb);
                        })

                }
            }

            return new Promise((resolve, reject)=>{

                sendOne(0, (err)=>{
                    resolve();
                })
            })
            
        })
        .catch((err)=>{

            if (err.statusCode && err.statusCode == 413) {
                sails.log.error('::: ABRelay.request(): caught error: 413 Request Entity Too Large :'+ err.message);
                return;
            }

            // on a forbidden, just attempt to re-request the CSRF token and try again?
            if (err.statusCode && err.statusCode == 403) {

                // if we haven't just tried a new token
                if (!request.csrfRetry) {

                    sails.log.error('::: ABRelay.request(): attempt to reset CSRF token ');
                    request.csrfRetry = true;
                    CSRF.token = null;
                    return ABRelay.request(request);
                }
            }


sails.log.error('::: ABRelay.request(): caught error:', err.statusCode || err, { request:errorOptions }, err.error, err);

        })

        // that's it?
        
    }
   

};


/** 
 * packIt
 * a recursive routine to break our data down into approved packet sizes to prevent
 * 413 Request Entity Too Large - errors.
 * @param {string} data  the encrypted data chunk we are evaluating
 * @param {array}  list  the list of data chunks we are sending back 
 */
function packIt(data,list) {

    if (data.length <= sails.config.appbuilder.mcc.maxPacketSize ) {
        list.push(data);
    } else {

        // split the data into 1/2
        let n = Math.floor(data.length / 2)

        let arrayFirstHalf = data.slice(0, n); // data[0:n]; 
        let arraySecondHalf = data.slice(n, data.length); // data[n:];

        // now send each half (in order) to packIt
        packIt(arrayFirstHalf, list);
        packIt(arraySecondHalf, list);
    }
}