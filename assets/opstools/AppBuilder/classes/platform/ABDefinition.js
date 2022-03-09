// import ABApplication from "./ABApplication"

var ABDefinitionCore = require("../core/ABDefinitionCore");

// var ABDefinitionModel = require("../data/ABDefinition");

var __AllDefinitions = {};

module.exports = class ABDefinition extends ABDefinitionCore {
   constructor(attributes, application) {
      super(attributes, application);

      this.fromValues(attributes);

      // listen
      AD.comm.hub.subscribe("ab.abdefinition.update", (msg, data) => {
         if (this.id == data.objectId) this.fromValues(data.data);
      });
   }

   ///
   /// Static Methods
   ///
   /// Available to the Class level object.  These methods are not dependent
   /// on the instance values of the Application.
   ///

   /**
    * @method all()
    *
    * return the current definitions.
    *
    * @param {fn} filter   an optional filter that works on the ABDefinition
    * @return [array] of ABDefinition
    */
   static all(filter = () => true) {
      return Object.keys(__AllDefinitions)
         .map((k) => {
            return __AllDefinitions[k];
         })
         .filter(filter)
         .map((d) => {
            return d.json;
         });
   }

   static allObjects(f = () => true) {
      var allObjs = ABDefinition.all((d) => {
         return d.type == "object";
      });
      return allObjs.filter(f);
   }

   static allQueries(f = () => true) {
      var allObjs = ABDefinition.all((d) => {
         return d.type == "query";
      });
      return allObjs.filter(f);
   }

   static allDatacollections(f = () => true) {
      var allObjs = ABDefinition.all((d) => {
         return d.type == "datacollection";
      });
      return allObjs.filter(f);
   }

   /**
    * @method create()
    *
    * create a given ABDefinition
    *
    * @param {obj} data   the values of the ABDefinition obj
    * @return {Promise}   the updated value of the ABDefinition entry from the server.
    */
   static create(data) {
      return OP.Comm.Service.post({
         url: `/app_builder/abdefinitionmodel`,
         data: data
      }).then((serverDef) => {
         return (__AllDefinitions[serverDef.id] = serverDef);
      });
   }

   /**
    * @method destroy()
    *
    * remove a given ABDefinition
    *
    * @param {obj} data   the values of the ABDefinition obj
    * @return {Promise}   the updated value of the ABDefinition entry from the server.
    */
   static destroy(id) {
      return OP.Comm.Service.delete({
         url: `/app_builder/abdefinitionmodel/${id}`
      }).then((serverDef) => {
         delete __AllDefinitions[id];
      });
   }

   /**
    * @method loadAll()
    *
    * load all the Definitions for The current AppBuilder:
    *
    * Feb 24, 2022: Johnny - Attempt to fix performance issues
    * NOTE: we will check to see if our local copy of our definitions are
    * out of date with the servers /definitionhash.
    * If not, we simply return our local copy.
    * Otherwise, we reload the definitions from the server.
    *
    * @return {array}
    */
   static loadAll() {
      return new Promise((resolve, reject) => {
         // AppBuilder and LiveView both call this so lets only call it once.
         if (Object.keys(__AllDefinitions).length > 0) {
            resolve(__AllDefinitions);
            return;
         }

         function processDefs(allDefinitions) {
            // if we don't slow this down then ABApplication.isReady() has issues
            // getting the dfdReady._resolve() set in time for it to be used.
            setTimeout(() => {
               (allDefinitions || []).forEach((def) => {
                  __AllDefinitions[def.id] = def;
               });
               resolve(allDefinitions);
            }, 5);
         }

         function requestDefs(hash) {
            console.log("===> Requesting New Definitions.");
            OP.Comm.Socket.get({
               url: `/app_builder/abdefinitionmodel`
            }).then((allDefinitions) => {
               try {
                  webix.storage.local.put("ab-definitions", allDefinitions);
                  webix.storage.local.put("ab-definition-hash", hash);
               } catch (err) {
                  console.warn("unable to cache definitions");
                  let strErr = (err.toString() || "").toLowerCase();
                  if (strErr.indexOf("quota") > -1) {
                     try {
                        var strData = JSON.stringify(allDefinitions);
                        let len = strData.length;
                        let unit = "bytes";
                        ["KB", "MB", "GB"].forEach((u) => {
                           if (len > 1024) {
                              len = len / 1024;
                              unit = u;
                           }
                        });
                        console.warn(
                           "Quota Exceeded: incoming definition data takes " +
                              Math.round(len) +
                              unit
                        );
                     } catch (errr) {
                        console.warn(
                           "Quota Exceeded: incoming definition data takes up too much space"
                        );
                     }
                  } else {
                     console.error(err);
                  }
               }

               processDefs(allDefinitions);
            });
         }

         // check to see if our local definitions are up to date:
         var currDefs = webix.storage.local.get("ab-definition-hash");
         OP.Comm.Socket.get({
            url: `/app_builder/definitionhash`
         }).then((response) => {
            if (response.hash == currDefs) {
               console.log("===> reusing local definitions.");
               // if so, use them
               var defs = webix.storage.local.get("ab-definitions");
               processDefs(defs);
            } else {
               // otherwise, request a new batch
               requestDefs(response.hash);
            }
         });
      });
   }

   /**
    * @method update()
    *
    * update a given ABDefinition
    *
    * @param {string} id  the id of the definition to update
    * @param {obj} data   the values of the ABDefinition obj
    * @return {Promise}   the updated value of the ABDefinition entry from the server.
    */
   static update(id, data) {
      return OP.Comm.Service.put({
         url: `/app_builder/abdefinitionmodel/${id}`,
         data: data
      })
         .then((serverDef) => {
            return (__AllDefinitions[serverDef.id] = serverDef);
         })
         .catch((err) => {
            if (err.toString().indexOf("Not Found") > -1) {
               return this.create(data);
            }
            // keep the error propagating:
            console.error(err);
            throw err;
         });
   }

   static definition(id) {
      var def = __AllDefinitions[id];
      if (def) {
         return def.json;
      }
      return null;
   }

   static insert(def) {
      if (def) {
         __AllDefinitions[def.id] = def;
      }
   }

   fromValues(attributes) {
      /*
      {
         id: uuid(),
         name: 'name',
         type: 'xxxxx',
         json: "{json}"
      }
      */

      super.fromValues(attributes);
   }

   /**
    * @method toObj()
    *
    * properly compile the current state of this ABApplication instance
    * into the values needed for saving to the DB.
    *
    * Most of the instance data is stored in .json field, so be sure to
    * update that from all the current values of our child fields.
    *
    * @return {json}
    */
   toObj() {
      // OP.Multilingual.unTranslate(this, this, ["label"]);

      var result = super.toObj();

      return result;
   }

   /// ABApplication data methods

   /**
    * @method destroy()
    *
    * destroy the current instance of ABObject
    *
    * also remove it from our parent application
    *
    * @return {Promise}
    */
   destroy() {
      return ABDefinition.destroy(this.id);
   }

   /**
    * @method save()
    * persist this instance of ABObject with it's parent ABApplication
    * @return {Promise}
    *         .resolve( {this} )
    */
   save() {
      if (this.id) {
         return ABDefinition.update(this.id, this.toObj());
      } else {
         return ABDefinition.create(this.toObj());
      }
   }
};
