const ABModelCore = require("../core/ABModelCore");

//
// ABModel
//
// Represents the Data interface for an ABObject data.
//
// 2 ways to use an ABModel to load a DataTable:
// 	Method 1:
// 	gather all the data externally and send to the DataTable
//		Model.findAll()
//		.then((data)=>{
//			DataTable.parse(data);
//		})
//
// 	Method 2:
// 	Set the Model object with a condition / skip / limit, then
// 	use it to load the DataTable:
//		Model.where({})
//		.skip(XX)
//		.limit(XX)
//		.loadInto(DataTable);

/**
 * @method triggerEvent
 * Publish a event when data in the model is changed
 *
 * @param {string} action - create, update, delete
 * @param {ABObject} object
 * @param {*} data
 */
function triggerEvent(action, object, data) {
   // Trigger a event to data collections of application and the live display pages
   AD.comm.hub.publish("ab.datacollection." + action, {
      objectId: object.id,
      data: data
   });
}

function errorPopup(error) {
   // Show the pop up
   if (error && error.data && error.data.error == "READONLY") {
      webix.alert({
         title: "Your action is blocked",
         ok: "Ok",
         text: error.data.message || "",
         type: "alert-warning"
      });
   }
}

// Start listening for server events for object updates and call triggerEvent as the callback
io.socket.on("ab.datacollection.create", function(msg) {
   triggerEvent("create", { id: msg.objectId }, msg.data);
});

io.socket.on("ab.datacollection.delete", function(msg) {
   triggerEvent("delete", { id: msg.objectId }, msg.id);
});

io.socket.on("ab.datacollection.stale", function(msg) {
   triggerEvent("stale", { id: msg.objectId }, msg.data);
});

io.socket.on("ab.datacollection.update", function(msg) {
   triggerEvent("update", { id: msg.objectId }, msg.data);
});

module.exports = class ABModel extends ABModelCore {
   constructor(object) {
      super(object);
   }

   ///
   /// Static Methods
   ///
   /// Available to the Class level object.  These methods are not dependent
   /// on the instance values of the Application.
   ///

   ///
   /// Instance Methods
   ///

   // Prepare multilingual fields to be untranslated
   // Before untranslating we need to ensure that values.translations is set.
   prepareMultilingualData(values) {
      // if this object has some multilingual fields, translate the data:
      var mlFields = this.object.multilingualFields();
      // if mlFields are inside of the values saved we want to translate otherwise do not because it will reset the translation field and you may loose unchanged translations
      var shouldTranslate = false;
      if (mlFields.length) {
         mlFields.forEach(function(field) {
            if (values[field] != null) {
               shouldTranslate = true;
            }
         });
      }
      if (shouldTranslate) {
         if (
            values.translations == null ||
            typeof values.translations == "undefined" ||
            values.translations == ""
         ) {
            values.translations = [];
         }
         OP.Multilingual.unTranslate(values, values, mlFields);
      }
   }

   request(method, params) {
      return OP.Comm.Service[method](params);
   }

   /**
    * @method batchCreate
    * update model values on the server.
    */
   batchCreate(values) {
      values.batch.map((vals) => {
         return this.prepareMultilingualData(vals.data);
      });

      return new Promise((resolve, reject) => {
         OP.Comm.Service.post({
            url: this.object.urlRestBatch(),
            params: values
         })
            .then((data) => {
               this.normalizeData(data);

               resolve(data);

               // FIX: now with sockets, the triggers are fired from socket updates.
               // trigger a create event
               // triggerEvent('create', this.object, data);
            })
            .catch(reject);
      });
   }

   /**
    * @method create
    * update model values on the server.
    */
   create(values) {
      this.prepareMultilingualData(values);

      return new Promise((resolve, reject) => {
         OP.Comm.Service.post({
            url: this.object.urlRest(),
            params: values
         })
            .then((data) => {
               this.normalizeData(data);

               resolve(data);

               // FIX: now with sockets, the triggers are fired from socket updates.
               // trigger a create event
               // triggerEvent('create', this.object, data);
            })
            .catch((err) => {
               errorPopup(err);
               reject(err);
            });
      });
   }

   /**
    * @method delete
    * remove this model instance from the server
    * @param {integer|UUID} id  the .id of the instance to remove.
    * @return {Promise}
    */
   delete(id) {
      return new Promise((resolve, reject) => {
         OP.Comm.Service["delete"]({
            url: this.object.urlRestItem(id)
         })
            .then((data) => {
               resolve(data);

               // FIX: now with sockets, the triggers are fired from socket updates.
               // trigger a delete event
               // triggerEvent('delete', this.object, id);
            })
            .catch((err) => {
               errorPopup(err);
               reject(err);
            });
      });
   }

   /**
    * @method findAll
    * performs a data find with the provided condition.
    */
   findAll(cond) {
      cond = cond || {};

      // 		// prepare our condition:
      // 		var newCond = {};

      // 		// if the provided cond looks like our { where:{}, skip:xx, limit:xx } format,
      // 		// just use this one.
      // 		if (cond.where) {
      // 			newCond = cond;
      // 		} else {

      // 			// else, assume the provided condition is the .where clause.
      // 			newCond.where = cond;
      // 		}

      // /// if this is our depreciated format:
      // if (newCond.where.where) {
      // 	OP.Error.log('Depreciated Embedded .where condition.');
      // }

      return new Promise((resolve, reject) => {
         // OP.Comm.Service.get({
         OP.Comm.Socket.get({
            url: this.object.urlRest(),
            params: cond
            // params: newCond
         })
            .then((data) => {
               this.normalizeData(data.data);

               resolve(data);
            })
            .catch((err) => {
               if (err && err.code) {
                  switch (err.code) {
                     case "ER_PARSE_ERROR":
                        OP.Error.log(
                           "AppBuilder:ABModel:findAll(): Parse Error with provided condition",
                           { error: err, condition: cond }
                        );
                        break;

                     default:
                        OP.Error.log(
                           "AppBuilder:ABModel:findAll(): Unknown Error with provided condition",
                           { error: err, condition: cond }
                        );
                        break;
                  }
               }
               reject(err);
            });
      });
   }

   /**
    * @method loadInto
    * loads the current values into the provided Webix DataTable
    * @param {DataTable} DT  A Webix component that can dynamically load data.
    */
   loadInto(DT) {
      // if a limit was applied, then this component should be loading dynamically
      if (this._limit) {
         DT.define("datafetch", this._limit);
         DT.define("datathrottle", 250); // 250ms???

         // catch the event where data is requested:
         // here we will do our own findAll() so we can persist
         // the provided .where condition.

         // oh yeah, and make sure to remove any existing event handler when we
         // perform a new .loadInto()
         DT.___AD = DT.___AD || {};
         if (DT.___AD.onDataRequestEvent) {
            DT.detachEvent(DT.___AD.onDataRequestEvent);
         }
         DT.___AD.onDataRequestEvent = DT.attachEvent(
            "onDataRequest",
            (start, count) => {
               var cond = {
                  where: this._where,
                  sort: this._sort,
                  limit: count,
                  skip: start
               };

               if (DT.showProgress) DT.showProgress({ type: "icon" });

               this.findAll(cond).then((data) => {
                  data.data.forEach((item) => {
                     if (
                        item.properties != null &&
                        item.properties.height != "undefined" &&
                        parseInt(item.properties.height) > 0
                     ) {
                        item.$height = parseInt(item.properties.height);
                     } else if (parseInt(this._where.height) > 0) {
                        item.$height = parseInt(this._where.height);
                     }
                  });
                  DT.parse(data);

                  if (DT.hideProgress) DT.hideProgress();
               });

               return false; // <-- prevent the default "onDataRequest"
            }
         );

         DT.refresh();
      }

      // else just load it all at once:
      var cond = {};
      if (this._where) cond.where = this._where;
      if (this._sort) cond.sort = this._sort;
      if (this._limit != null) cond.limit = this._limit;
      if (this._skip != null) cond.skip = this._skip;

      if (DT.showProgress) DT.showProgress({ type: "icon" });

      this.findAll(cond)
         .then((data) => {
            data.data.forEach((item) => {
               if (
                  item.properties != null &&
                  item.properties.height != "undefined" &&
                  parseInt(item.properties.height) > 0
               ) {
                  item.$height = parseInt(item.properties.height);
               } else if (parseInt(this._where.height) > 0) {
                  item.$height = parseInt(this._where.height);
               }
            });
            DT.parse(data);

            if (DT.hideProgress) DT.hideProgress();
         })
         .catch((err) => {
            console.error("!!!!!", err);
         });
   }

   /**
    * @method limit
    * set the limit value for this set of data
    * @param {integer} limit  the number or elements to return in this call
    * @return {ABModel} this object that is chainable.
    */
   limit(limit) {
      this._limit = limit;
      return this;
   }

   /**
    * @method skip
    * set the skip value for this set of data
    * @param {integer} skip  the number or elements to skip
    * @return {ABModel} this object that is chainable.
    */
   skip(skip) {
      this._skip = skip;
      return this;
   }

   /**
    * @method update
    * update model values on the server.
    */
   update(id, values) {
      this.prepareMultilingualData(values);

      // remove empty properties
      for (var key in values) {
         if (values[key] == null) delete values[key];
      }

      return new Promise((resolve, reject) => {
         OP.Comm.Service.put({
            url: this.object.urlRestItem(id),
            params: values
         })
            .then((data) => {
               // .data is an empty object ??

               this.normalizeData(data);

               resolve(data);

               // FIX: now with sockets, the triggers are fired from socket updates.
               // trigger a update event
               // triggerEvent('update', this.object, data);
            })
            .catch((err) => {
               errorPopup(err);
               reject(err);
            });
      });
   }

   /**
    * @method batchUpdate
    * update value to many rows on the server.
    */
   batchUpdate({ rowIds, values }) {
      return new Promise((resolve, reject) => {
         OP.Comm.Service.put({
            url: this.object.urlRestBatch(),
            params: {
               rowIds,
               values
            }
         })
            .then(() => {
               resolve(true);
            })
            .catch(reject);
      });
   }
};
