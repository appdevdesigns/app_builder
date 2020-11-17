/**
 * ABModelLifecycle
 *
 * A TEMPORARY interface for allowing models to register lifecycle callbacks
 * and having them processed before Model operations.
 *
 * Lifecycle callbacks include:
 *  beforeCreate(recordToCreate, cb)
 *  afterCreate(createdRecord, cb)
 *  beforeUpdate(valuesToUpdate, cb)
 *  afterUpdate(updatedRecord, cb)
 *  beforeDestroy(criteria, cb)
 *  afterDestroy(deletedRecord, cb)
 *
 * Each callback is a function that receives a copy of the provided information
 * submitted with the request and a node style callback ( cb(err) ).
 *  beforeCreate( data, cb ) {
 *      // validate data
 *      cb();  // or cb(Error) if there was a problem
 *  }
 */

var Handlers = {
   /* key : fn() */
};

module.exports = {
   /**
    * process
    * register a handler for a given lifecycle callback key
    * @param {string} key  the object+lifecycle key of the
    *      handler we are calling.
    * @param {obj} data the lifecycle specific data provided
    *      for the handler.
    * @param {fn} cb the final callback.
    */
   process: function(key, data, cb) {
      // if no handlers for the provided key, then just
      // call the callback successfully.
      if (!Handlers[key]) {
         cb();
         return;
      }

      console.log(`processing lifecycle: ${key}`);
      //process the callback:
      Handlers[key](data, (err) => {
         if (err) {
            var error = new Error("Lifecycle Error.");
            error.code = "E_OBJLIFECYCLE";
            error.lifecycle = key;
            error.data = data;
            error.error = err;
            err = error;
         }
         cb(err);
      });
   },

   /**
    * register
    * register a handler for a given lifecycle callback key
    * @param {string} key  the key should be in format:
    *                      [obj.uuid].[lifecycleKey]
    *                      so for object with uuid = "001"
    *                      handling the beforeCreate calls, the
    *                      key should be "001.beforeCreate"
    * @param {fn} fn the function to call.
    */
   register: function(key, fn) {
      Handlers[key] = fn;
   }
};
