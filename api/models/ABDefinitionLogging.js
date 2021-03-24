/**
 * ABDefinitionLogging.js
 *
 * @description :: ABDefinitionLogging is a generic object definition store.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
   tableName: "appbuilder_definition_logs",

   // migrate: "safe",

   attributes: {
      id: { type: "number", autoIncrement: true, primaryKey: true },

      definitionId: { type: "string", required: true },

      type: {
         type: "string",
         required: true,
         enum: ["create", "update", "delete", "import"]
      },

      user: { type: "string", required: true },

      json: { type: "json", required: true }
   }
};
