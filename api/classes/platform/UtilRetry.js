/**
 * @function retry()
 * Attempt to retry the provided fn() if it results in an interrupted
 * Network operation error.
 *
 * The provided fn() needs to return a {Promise} that resolves() with
 * the expected return data, and rejects() with the Network errors.
 *
 * @param {fn} fn
 *        The promise based network operation
 * @return {Promise}
 */

// ERRORS_RETRY
// the error.code of typical sql errors that simply need to be retried.
var ERRORS_RETRY = [
   "ECONNRESET",
   "ETIMEDOUT",
   "PROTOCOL_SEQUENCE_TIMEOUT",
   "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR",
   "PROTOCOL_PACKETS_OUT_OF_ORDER",

   "ER_LOCK_DEADLOCK",
   "Lock deadlock; Retry transaction", // shows up in embedded sql error
   "ER_LOCK_WAIT_TIMEOUT"
];

module.exports = function retry(fn) {
   return fn().catch((error) => {
      // retry on a connection reset
      var strErr = `${error.code}:${error.toString()}`;
      var isRetry = false;
      var msg = "";
      ERRORS_RETRY.forEach((e) => {
         if (strErr.indexOf(e) > -1) {
            isRetry = true;
            msg = `... received ${e}, retrying`;
         }
      });
      if (isRetry) {
         console.error(msg);
         return retry(fn);
      }

      // propogate the error
      throw error;
   });
};
