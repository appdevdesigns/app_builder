//
// OP.Comm.Socket.*
//
// Map our old jQuery deferred comm utilities with ES6 promises.
//

var sockets = {
   // OP.Comm.Socket.get(options, cb) => {promise}
   get: function(options, cb) {
      return new Promise((resolve, reject) => {
         AD.comm.socket.get(options, cb).then(resolve, reject);
      });
   },

   // OP.Comm.Socket.post(options, cb) => {promise}
   post: function(options, cb) {
      return new Promise((resolve, reject) => {
         AD.comm.socket.post(options, cb).then(resolve, reject);
      });
   },

   // OP.Comm.Socket.put(options, cb) => {promise}
   put: function(options, cb) {
      return new Promise((resolve, reject) => {
         AD.comm.socket.put(options, cb).then(resolve, reject);
      });
   }
};

// OP.Comm.Socket.delete(options, cb) => {promise}
sockets["delete"] = function(options, cb) {
   return new Promise((resolve, reject) => {
      AD.comm.socket["delete"](options, cb).then(resolve, reject);
   });
};

export default sockets;
