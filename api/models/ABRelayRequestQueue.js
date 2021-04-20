/**
 * @module  ABRelayRequestQueue
 * @description    :: Model
 * Store any Relay Requests that are currently in process of processing.
 * If a request is successfully processed, it should be removed from the Queue.
 * Any remaining requests that are > 25s old, treat as if they are missing responses
 * due to server errors (crashes, etc..);
 */

var uuid = require("uuid/v4");

module.exports = {
   tableName: "appbuilder_relay_request_queue",

   // migrate: 'safe',
   migrate: "alter",

   attributes: {
      // Job Token: this is a uuid to identify this request
      jt: {
         type: "string",
         maxLength: 36,
         unique: true
      },

      // the {json} obj provided for this request.
      request: {
         type: "json"
      }
   }

   ////
   //// Life cycle callbacks
   ////

   ////
   //// Model class methods
   ////
};
