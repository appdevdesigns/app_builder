// import ABApplication from "./ABApplication"

var ABDefinitionCore = require("../core/ABDefinitionCore");

module.exports = class ABDefinition extends ABDefinitionCore {
   ///
   /// Static Methods
   ///
   /// Available to the Class level object.  These methods are not dependent
   /// on the instance values of the Application.
   ///

   /**
    * @method create()
    *
    * create a given ABDefinition
    *
    * @param {object} data   the values of the ABDefinition obj
    * @param {object} logOption - {
    *                                  user: "username" | "AB_PROCESS",
    *                                  type: "create" | "update" | "delete" | "import",
    *                                  json: {Object} | {String}
    *                               }
    * @return {Promise}   the updated value of the ABDefinition entry from the server.
    */
   static create(data, logOption = {}) {
      return new Promise((resolve, reject) => {
         ABDefinitionModel.create(data)
            .catch(reject)
            .then((result) => {
               // Log
               logOption.type = logOption.type || "create";
               logOption.definitionId = result.id;
               if (logOption.json == null) logOption.json = data;
               ABDefinitionLogger.add(logOption);

               resolve(result);
            });
      });
   }

   /**
    * @method destroy()
    *
    * remove a given ABDefinition
    *
    * @param {obj} data   the values of the ABDefinition obj
    * @param {object} logOption - {
    *                                  user: "username" | "AB_PROCESS",
    *                                  type: "create" | "update" | "delete" | "import",
    *                                  json: {Object} | {String}
    *                               }
    * @return {Promise}   the updated value of the ABDefinition entry from the server.
    */
   static destroy(id, logOption = {}) {
      let defJson = this.definition(id);

      return new Promise((resolve, reject) => {
         ABDefinitionModel.destroy(id)
            .catch(reject)
            .then(() => {
               // Log
               logOption.type = "delete";
               logOption.definitionId = id;
               logOption.json = defJson;
               ABDefinitionLogger.add(logOption);

               resolve();
            });
      });
   }

   /**
    * @method loadAll()
    *
    * load all the Definitions for The current AppBuilder:
    *
    * @return {array}
    */
   static loadAll() {
      return ABDefinitionModel.refresh();
   }

   /**
    * @method update()
    *
    * update a given ABDefinition
    *
    * @param {string} id  the id of the definition to update
    * @param {obj} data   the values of the ABDefinition obj
    * @param {object} logOption - {
    *                                  user: "username" | "AB_PROCESS",
    *                                  type: "create" | "update" | "delete" | "import",
    *                                  json: {Object} | {String}
    *                               }
    * @return {Promise}   the updated value of the ABDefinition entry from the server.
    */
   static update(id, data, logOption = {}) {
      return new Promise((resolve, reject) => {
         ABDefinitionModel.update({ id: id }, data)
            .catch(reject)
            .then(() => {
               // Log
               logOption.type = "update";
               logOption.definitionId = id;
               logOption.json = data;
               ABDefinitionLogger.add(logOption);

               resolve();
            });
      });
   }

   /**
    * @method definition()
    *
    * return the current Definition data for the requested object id.
    *
    * Note: this returns the actual ABDefinition.json data that our System
    * objects can use to create a new instance of itself.  Not the ABDefinition
    * itself.
    *
    * @param {string} id  the id of the definition to update
    * @return {obj}   the updated value of the ABDefinition entry from the server.
    */
   static definition(id) {
      var def = ABDefinitionModel.definitionForID(id);
      if (typeof def == "string") {
         try {
            def = JSON.parse(def);
         } catch (e) {}
      }
      return def;
   }

   /**
    * @method definitions()
    *
    * return the definitions that match the provided filter fn.
    *
    * Note: this returns the actual ABDefinition.json data that our System
    * objects can use to create a new instance of itself.  Not the ABDefinition
    * itself.
    *
    * @param {string} id  the id of the definition to update
    * @return {obj}   the updated value of the ABDefinition entry from the server.
    */
   static definitions(fn = () => true) {
      return ABDefinitionModel.definitions(fn);
   }

   static allQueries(fn = () => true) {
      return ABDefinitionModel.definitions((d) => d.type == "query").filter(fn);
   }

   //
   // Instance Methods
   //

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
    *
    * persist this instance of ABObject with it's parent ABApplication
    *
    *
    * @return {Promise}
    *                      .resolve( {this} )
    */
   save() {
      if (this.id) {
         return ABDefinition.update(this.id, this.toObj());
      } else {
         return ABDefinition.create(this.toObj());
      }
   }
};
