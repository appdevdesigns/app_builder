var __ObjectPool = {};

module.exports = {
   /**
    * @function cache
    *
    * @param {ABClassObject} object
    */
   cache: function(object) {
      if (object == null) return;
      if (object.id) {
         __ObjectPool[object.id] = object;
      } else {
         var error = new Error(
            "ABObjectCache.cache(): received object with invalid .id field"
         );
         console.error(error);
         console.error(object);
      }
   },

   /**
    * @function get
    *
    * @param {uuid} id
    *
    * @return {ABClassObject}
    */
   get: function(id) {
      return __ObjectPool[id] || null;
   },

   /**
    * @function remove
    *
    * @param {uuid} id
    */
   remove: function(id) {
      if (id == null) return;

      delete __ObjectPool[id];
   },

   /**
    * @function list
    *
    * @param {function} filter
    */
   list: function(filter = () => true) {
      let result = [];

      for (let id in __ObjectPool || {}) {
         // let obj = __ObjectPool[id];
         // if (filter(obj)) result.push(obj);
         result.push(__ObjectPool[id]);
      }

      // prevent case where an invalid object might be stored in
      // __ObjectPool[id]
      return result.filter((o) => o && filter(o));
   }
};
