/**
 * ABRelay
 *
 * Interface for communicating with the MobileCommCenter (MCC).
 *
 */

var RP = require("request-promise-native");
var _ = require("lodash");
var crypto = require("crypto");

var cookieJar = RP.jar();

var _RequestsInProcess = false;
var _RetryInProcess = false;

var CSRF = {
   token: null,
   /**
    * Fetch the user's CSRF token from sails.js
    * @return Deferred
    *    Resolves with the CSRF token string when it has been fetched
    */
   fetch: function() {
      return new Promise((resolve, reject) => {
         var options = {
            method: "GET",
            uri: sails.config.appbuilder.baseURL + "/csrfToken",
            json: true,
            jar: cookieJar
         };

         options.rejectUnauthorized = false;
         // console.log('::: csrf.fetch()');
         RP(options)
            .then((data) => {
               CSRF.token = data._csrf;
               resolve(CSRF.token);
            })
            .catch((err) => {
               var csrfError = new Error(
                  "ABRelay:: unable to get CSRF token: " + err.message
               );
               sails.log.error(csrfError);
               reject(csrfError);
            });
      });
   }
};

// setup a timed request to poll for MCC data to process:

module.exports = {
   _formatRequest: function(method, dataField, opt) {
      var url = opt.url || "/";
      if (url[0] == "/") {
         url = sails.config.appbuilder.mcc.url + url;
      }

      var options = {
         method: method,
         uri: url,
         headers: {
            authorization: sails.config.appbuilder.mcc.accessToken
         },
         timeout: opt.timeout || 4000, // 4s timeout to wait for a connection to the MCC
         time: true, // capture timing information during communications process
         resolveWithFullResponse: true,
         json: true // Automatically stringifies the body to JSON
      };

      var data = opt.data || {};
      options[dataField] = data;

      return options;
   },

   get: function(opt) {
      var options = this._formatRequest("GET", "qs", opt);
      return RP(options).then((fullResponse) => {
         // sails.log('    response:', fullResponse.timings, fullResponse.timingPhases);
         return fullResponse.body; // just send back the body as a simple response
      });
   },

   post: function(opt) {
      var options = this._formatRequest("POST", "body", opt);
      return RP(options).then((fullResponse) => {
         // sails.log('    response:', fullResponse.timings, fullResponse.timingPhases);
         return fullResponse.body; // just send back the body as a simple response
      });
   },

   /**
    * _formatServerRequest
    * create the parameters necessary for us to pass the request on
    * to the CoreServer:
    * @param {obj} opt  the passed in request options
    * @param {ABRelayUser} relayUser the relayUser making this request.
    * @return {obj}
    */
   _formatServerRequest: function(opt, relayUser) {
      var method = opt.type || opt.method || "GET";
      var dataField = "body";

      switch (method) {
         case "GET":
            dataField = "qs";
            break;
         case "POST":
            dataField = "body";
            break;
      }

      var url = opt.url || "/";
      if (url[0] == "/") {
         url = sails.config.appbuilder.baseURL + url;
      }

      var options = {
         method: method,
         uri: url,
         headers: {
            authorization: relayUser.publicAuthToken
         },
         json: true // Automatically stringifies the body to JSON
      };

      var data = opt.data || opt.params || {};
      options[dataField] = data;

      // CSRF Token
      if (method != "GET") {
         options.headers["X-CSRF-Token"] = CSRF.token;
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
         var iv = crypto.randomBytes(16).toString("hex");

         var cipher = crypto.createCipheriv(
            "aes-256-cbc",
            Buffer.from(key, "hex"),
            Buffer.from(iv, "hex")
         );
         var ciphertext = cipher.update(plaintext, "utf8", "base64");
         ciphertext += cipher.final("base64");

         // <base64 encoded cipher text>:::<hex encoded IV>
         encoded = ciphertext.toString() + ":::" + iv;
      }

      return encoded;
   },

   /**
    * decrypt
    * return a javascript obj that represents the data that was encrypted
    * using our AES key.
    * @param {string} data
    * @param {string} key
    *    The AES key in hex format
    * @return {obj}
    */
   decrypt: function(data, key) {
      var finalData = null;

      // Expected format of encrypted data:
      // <base64 encoded ciphertext>:::<hex encoded IV>
      var dataParts = data.split(":::");
      var ciphertext = dataParts[0];
      var iv = dataParts[1];

      try {
         var decipher = crypto.createDecipheriv(
            "aes-256-cbc",
            Buffer.from(key, "hex"),
            Buffer.from(iv, "hex")
         );
         var plaintext = decipher.update(ciphertext, "base64", "utf8");
         plaintext += decipher.final("utf8");

         // Parse JSON
         try {
            finalData = JSON.parse(plaintext);
         } catch (err) {
            finalData = plaintext;
         }
      } catch (err) {
         // could not decrypt
         sails.log.error("Unable to decrypt AES", err);
      }

      return finalData;
   },

   pollMCC: function() {
      return new Promise((resolve, reject) => {
         if (!sails.config.appbuilder.mcc.enabled) {
            resolve();
            return;
         }

         // 1) get any key resolutions and process them
         ABRelay.get({ url: "/mcc/initresolve" })
            .then((response) => {
               var all = [];
               response.data.forEach((entry) => {
                  all.push(ABRelay.resolve(entry));
               });

               return Promise.all(all);
            })

            // 2) get any message requests and process them
            .then(() => {
               // if we are still processing a previous batch of requests
               // skip this round.
               if (_RequestsInProcess) {
                  return;
               }

               return ABRelay.get({ url: "/mcc/relayrequest" }).then(
                  (response) => {
                     _RequestsInProcess = true;
                     processRequests(response.data, function(err) {
                        _RequestsInProcess = false;
                     });
                  }
               );
            })
            // 3) check for any old requests in our ABRelayRequestQueue and process them
            .then(() => {
               // if we are already processing our retries, then skip
               if (_RetryInProcess) {
                  return;
               }

               var now = new Date();
               var seconds =
                  (sails.config.appbuilder.mcc.pollFrequency || 5000) * 2;
               var timeout = new Date(now.getTime() - seconds);
               return ABRelayRequestQueue.find({
                  createdAt: { "<=": timeout }
               }).then((listOfRequests) => {
                  if (listOfRequests && listOfRequests.length > 0) {
                     console.log(
                        "ABRelay.Poll():Found Old Requests : " +
                           listOfRequests.length
                     );

                     // convert requests to array of just request data.
                     var allRequests = [];
                     listOfRequests.forEach((req) => {
                        // Don't log the full error on repeat requests
                        req.request.suppressErrors = true;
                        allRequests.push(req.request);
                     });

                     _RetryInProcess = true;
                     processRequests(allRequests, function(err) {
                        _RetryInProcess = false;
                     });

                     // listOfRequests.forEach((req)=>{
                     //     ABRelay.request(req.request);
                     // })
                  }
               });
            })
            .then(resolve)
            .catch((err) => {
               // if err was related to a timeout :
               // var error = new Error('Server Timeout')
               // error.error = err;
               // error.code = 'E_SERVER_TIMEOUT'
               // reject(error);

               reject(err);
            });
      });
   },

   resolve: function(entry) {
      return (
         Promise.resolve()
            // make sure we don't already have an entry with the same .appUUID
            // there should be only one, so don't add a duplicate:
            .then(() => {
               return ABRelayAppUser.findOne({ appUUID: entry.appUUID });
            })

            // find the ABRelayUser
            .then((existingAppUser) => {
               // if we had an existing AppUser, PASS
               if (existingAppUser) {
                  return null;
               }

               // otherwise continue on
               if (entry.user) {
                  return ABRelayUser.findOne({ user: entry.user });
               } else {
                  return null;
               }
            })
            .then((relayUser) => {
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
                        Buffer.from(entry.rsa_aes, "base64")
                     );
                     if (plaintext) {
                        return {
                           relayUser: relayUser,
                           aes: plaintext.toString()
                        };
                     } else {
                        return null;
                     }
                  } catch (err) {
                     // could not decrypt
                     sails.log.error("Unable to decrypt RSA", err);
                     return null;
                  }
               } else {
                  return null;
               }
            })

            // Now create an AppUser entry connected to relayUser
            .then((values) => {
               if (values) {
                  var newAppUser = {
                     aes: JSON.parse(values.aes).aesKey,
                     appUUID: entry.appUUID,
                     appID: entry.appID
                  };

                  var relayUser = values.relayUser;
                  relayUser.appUser.add(newAppUser);

                  // I wish .save() was a promise
                  return new Promise((resolve, reject) => {
                     relayUser.save((err) => {
                        if (err) {
                           ADCore.error.log(
                              "AppBuilder:ABRelay:.resolve():Unable to save New App User entry.",
                              { error: err, newAppUser: newAppUser }
                           );
                           reject(err);
                           return;
                        }

                        resolve();
                     });
                  });
               }
            })
      );
   },

   request: function(request) {
      // request = {
      //     appUUID:'uuid',
      //     data: '<encryptedData>',
      //     jobToken: 'uuid',
      //     suppressErrors: boolean, // if true then don't log the full error
      // }

      var appUser = null;
      var relayUser = null;

      var errorOptions = null;

      return (
         Promise.resolve()

            // 0) store this request in our Queue
            .then(() => {
               return new Promise((resolve, reject) => {
                  // attempt to create this entry.
                  // if this is a retry, then this will error because the jt already exists,
                  // so just continue on anyway:
                  ABRelayRequestQueue.create({
                     jt: request.jobToken,
                     request: request
                  })
                     .then(resolve)
                     .catch(resolve);
               });
            })

            // 1) get the RelayAppUser from the given appUUID
            .then(() => {
               return ABRelayAppUser.findOne({ appUUID: request.appUUID })
                  .populate("relayUser")
                  .then((entry) => {
                     if (entry) {
                        appUser = entry;
                        relayUser = entry.relayUser;
                     } else {
                        var error = new Error(
                           "ABRelay:request:1) can not find ABRelayAppUser for appUUID:" +
                              request.appUUID
                        );
                        if (!request.suppressErrors) {
                           ADCore.error.log(
                              "ABRelay:request:(1) can not find ABRelayAppUser for appUUID:" +
                                 request.appUUID,
                              { error: error, request: request }
                           );
                        }
                        throw error;
                     }

                     // return entry;
                  });
            })

            // 2) Decode the data:
            .then(() => {
               return this.decrypt(request.data, appUser.aes);
            })

            // 2b) Make sure we have a CSRF token if we need one:
            .then((params) => {
               var method = params.type || params.method || "GET";
               if (method == "GET" || CSRF.token) {
                  return params;
               } else {
                  return CSRF.fetch().then((token) => {
                     return params;
                  });
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
               return new Promise((resolve, reject) => {
                  // console.log('::: ABRelay.request(): options:', options);
                  var lastError = null;

                  var tryIt = (attempt, cb) => {
                     if (attempt >= 5) {
                        cb(lastError);
                     } else {
                        // make the call
                        RP(options)
                           .then((response) => {
                              // pass back the default responses
                              cb(null, response);
                           })
                           .catch((err) => {
                              // if we received an error, check to see if it looks like a standard error
                              // response from our API.  If so, just return that:
                              if (err.error) {
                                 if (
                                    err.error.status == "error" &&
                                    err.error.data
                                 ) {
                                    // PROTOCOL_CONNECTION_LOST
                                    // If we received a connection lost, then let's try to retry the attempt
                                    if (
                                       err.error.data ==
                                       "PROTOCOL_CONNECTION_LOST"
                                    ) {
                                       lastError = err;

                                       // let's try the command again:
                                       tryIt(attempt + 1, cb);
                                       return;
                                    }

                                    // if the error response was due to a connection fault with MySQL: try again
                                    var messages = [
                                       "Handshake inactivity timeout",
                                       "Could not connect to MySQL",
                                       "Connection lost:"
                                    ];
                                    if (err.message) {
                                       var foundMessage = false;
                                       messages.forEach((m) => {
                                          if (err.message.indexOf(m) > -1) {
                                             foundMessage = true;
                                          }
                                       });
                                       if (foundMessage) {
                                          lastError = err;

                                          tryIt(attempt + 1, cb);
                                          return;
                                       }
                                    }

                                    // sails.log.error('::: ABRelay.request(): response was an error: ', { request:options, code: err.error.data.code, message:err.error.data.sqlMessage || 'no sql msg', sql:err.error.data.sql || ' - no sql -' } );
                                    ADCore.error.log(
                                       "ABRelay:request(): response was an error: ",
                                       {
                                          request: options,
                                          code: err.error.data.code,
                                          message:
                                             err.error.data.sqlMessage ||
                                             "no sql msg",
                                          sql:
                                             err.error.data.sql ||
                                             " - no sql -",
                                          error: err
                                       }
                                    );
                                    err.error._request = {
                                       data:
                                          errorOptions.body || errorOptions.qs,
                                       method: errorOptions.method,
                                       uri: errorOptions.uri
                                    };

                                    cb(null, err.error);
                                    return;
                                 }
                              }

                              // [Fix] Johnny
                              // it seems a web client disconnecting a socket can get caught in our
                              // process.  just try again:
                              var errorString = err.toString();
                              if (
                                 errorString.indexOf("Error: socket hang up") >
                                 -1
                              ) {
                                 lastError = err;
                                 tryIt(attempt + 1, cb);
                                 return;
                              }

                              // [Fix] Johnny
                              // if we get here and we have a 403: it is likely it is a CSRF mismatch error
                              // but in production, sails won't return 'CSRF mismatch', so lets attempt to
                              // retrieve a new CSRF token and try again:
                              if (
                                 errorString.indexOf("CSRF mismatch") > -1 ||
                                 (err.statusCode && err.statusCode == 403)
                              ) {
                                 sails.log.error(
                                    "::: ABRelay.request(): attempt to reset CSRF token "
                                 );
                                 lastError = err;
                                 CSRF.token = null;
                                 CSRF.fetch().then((token) => {
                                    tryIt(attempt + 1, cb);
                                 });
                                 return;
                              }

                              //// ACTUALLY no.  it there was an error that didn't follow our error format, then it was
                              // probably due to a problem with the request itself.  Just package an error and send it back:
                              var data = {
                                 status: "error",
                                 data: err,
                                 message: errorString
                              };
                              ADCore.error.log(
                                 "ABRelay:request(): response was an unexpected error: ",
                                 { request: options, error: data }
                              );
                              cb(null, data);
                           });
                     }
                  };
                  tryIt(0, (err, data) => {
                     if (err) {
                        reject(err);
                     } else {
                        resolve(data);
                     }
                  });
               });
            })

            // 4) encrypt the response:
            .then((response) => {
               return this.encrypt(response, appUser.aes);
            })

            // 4b) break the encrypted data in smaller packets
            .then((encryptedData) => {
               var packets = [];
               packIt(encryptedData, packets);
               return packets;
            })

            // 5) update MCC with the response for this request:
            .then((encryptedDataPackets) => {
               // sendOne()
               // recursive fn() to send off the responses to the MCC.
               // this should handle timeout errors and resend the missed attempts.
               var sendOne = (i, cb, retry = 0, lastErr = null) => {
                  if (retry >= 3) {
                     // Failed too many times:
                     ADCore.error.log(
                        "::: I'M STUCK ::: ABRelay:request(): caught unexpected error in response to MCC",
                        { error: lastErr, request: errorOptions }
                     );

                     // an error with 1 packet will invalidate the whole response:
                     cb();
                     return;
                  }

                  // if we have sent all the packets -> cb()
                  if (i >= encryptedDataPackets.length) {
                     cb();
                  } else {
                     var returnPacket = {
                        appUUID: request.appUUID,
                        data: encryptedDataPackets[i],
                        jobToken: request.jobToken,
                        packet: i,
                        totalPackets: encryptedDataPackets.length
                     };

                     ABRelay.post({
                        url: "/mcc/relayrequest",
                        data: returnPacket
                     })
                        .then((resRP) => {
                           // send the next one
                           sendOne(i + 1, cb);
                        })
                        .catch((err) => {
                           if (
                              (err.error && err.error.code == "ETIMEDOUT") ||
                              (err.message &&
                                 err.message.indexOf("ESOCKETTIMEDOUT") > -1)
                           ) {
                              sails.log.error(
                                 "!!! time out error with MCC! [" +
                                    i +
                                    " / " +
                                    encryptedDataPackets.length +
                                    "]  jt[" +
                                    request.jobToken +
                                    "]"
                              );
                           } else {
                              // if this wasn't a ETIMEDOUT error, log it here:
                              if (returnPacket.data.length > 10) {
                                 returnPacket.data = `${returnPacket.data.slice(
                                    0,
                                    10
                                 )} ...`;
                              }
                              ADCore.error.log(
                                 `::: ABRelay:request():${retry}: caught unexpected error in response to MCC`,
                                 {
                                    error: err,
                                    request: errorOptions,
                                    response: returnPacket
                                 }
                              );
                           }

                           // retry this one:
                           sendOne(i, cb, retry + 1, err);
                        });
                  }
               };

               return new Promise((resolve /*, reject */) => {
                  sendOne(0, (err) => {
                     resolve();
                  });
               });
            })

            // now remove the request from our Queue:
            .then(() => {
               return ABRelayRequestQueue.destroy({ jt: request.jobToken });
            })

            .catch((err) => {
               if (err.statusCode && err.statusCode == 413) {
                  sails.log.error(
                     "::: ABRelay.request(): caught error: 413 Request Entity Too Large :" +
                        err.message
                  );
                  return;
               }

               // on a forbidden, just attempt to re-request the CSRF token and try again?
               if (
                  (err.statusCode && err.statusCode == 403) ||
                  err.toString().indexOf("CSRF") > -1
               ) {
                  // if we haven't just tried a new token
                  if (!request.csrfRetry) {
                     sails.log.error(
                        "::: ABRelay.request(): attempt to reset CSRF token "
                     );
                     request.csrfRetry = true;
                     CSRF.token = null;
                     return ABRelay.request(request);
                  }
               }

               // Requests that were previously queued will have errors simplified on the console log.
               // Full error messages repeating every 5 seconds can spiral out of control over time.
               if (request.suppressErrors) {
                  ADCore.error.log(
                     "::: ABRelay.request(): caught error: ",
                     err.message || err
                  );
                  return;
               }

               ADCore.error.log("::: ABRelay.request(): caught error: ", {
                  request: errorOptions,
                  error: err
               });
               // sails.log.error('::: ABRelay.request(): caught error:', err.statusCode || err, { request:errorOptions }, err.error, err);
            })
      );

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
function packIt(data, list) {
   if (data.length <= sails.config.appbuilder.mcc.maxPacketSize) {
      list.push(data);
   } else {
      // split the data into 1/2
      let n = Math.floor(data.length / 2);

      let arrayFirstHalf = data.slice(0, n); // data[0:n];
      let arraySecondHalf = data.slice(n, data.length); // data[n:];

      // now send each half (in order) to packIt
      packIt(arrayFirstHalf, list);
      packIt(arraySecondHalf, list);
   }
}

/**
 * processRequests()
 * is an attempt to throttle the number of ABRelay requests we process at a time.
 * if we attempt too many, the server runs out of memory, so this fn() limits
 * the number of requests to [numParallel] requests at a time.  But each of those
 * "threads" will sequentially continue to process requests until the given list
 * is complete.
 * @param {array} allRequests  an array of the request objects
 * @param {function} done  the callback fn for when all the requests have been processed.
 */
function processRequests(allRequests, done) {
   ////
   //// Assemble packets into complete requests
   ////
   var jobs = {
   /*
      <jobToken>: {
         0: { <packet> },
         1: { <packet> },
         ...
      },
      ...
   */
   };
   allRequests.forEach((row) => {
      let jobToken = row.jobToken;
      jobs[jobToken] = jobs[jobToken] || {};
      jobs[jobToken][row.packet] = row;
   });
   var assembledRequests = [];
   for (let jobToken in jobs) {
      let thisJob = jobs[jobToken];
      let finalData = '';
      thisJob.totalPackets = thisJob.totalPackets || 1;
      for (i=0; i<thisJob.totalPackets; i++) {
         if (thisJob[i]) {
            finalData += thisJob[i].data;
         }
         // This should never happen because the relay will only send packets
         // together with the whole set.
         else {
            ADCore.error.log("::: ABRelay job missing a packet [" + i + "/" + thisJob.totalPackets + "]");
            ADCore.error.log("::: ABRelay jobToken [" + jobToken + "]");
            let appUUID = Object.values(thisJob)[0].appUUID;
            ADCore.error.log("::: ABRelay appUUID [" + appUUID + "]");
         }
      }
      assembledRequests.push({
         appUUID: thisJob.appUUID,
         jobToken: jobToken,
         data: finalData
      });
   }


   ////
   //// Attempt to throttle the number of requests we process at a time
   ////

   // processRequest()
   // processes 1 request, when it is finished, process another
   function processRequestSequential(list, cb) {
      if (list.length == 0) {
         cb();
      } else {
         var request = list.shift();
         ABRelay.request(request)
            .then(() => {
               processRequestSequential(list, cb);
            })
            .catch((err) => {
               ADCore.error.log(
                  "::: ABRelay.processRequestSequential(): caught error: ",
                  err.message || err
               );
               cb(err);
            });
      }
   }

   // decide how many in parallel we will allow:
   // NOTE : we can run out of memory if we allow too many.
   var numParallel = sails.config.appbuilder.mcc.numParallelRequests || 15;
   var numDone = 0;
   function onDone(err) {
      if (err) {
         done(err);
         return;
      }

      // once all our parallel tasks report done, we are done.
      numDone++;
      if (numDone >= numParallel) {
         // we are all done now.
         done();
      }
   }

   // fire off our requests in parallel.
   for (var i = 0; i < numParallel; i++) {
      processRequestSequential(assembledRequests, onDone);
   }
}
