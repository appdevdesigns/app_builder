/**
 * ABApplicationTrans.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
   tableName: "appbuilder_application_trans",

   // connection: 'appdev_default',

   attributes: {
      abapplication: { model: "ABApplication" },

      label: { type: "string" },

      description: { type: "text" },

      language_code: { type: "string" }
   }
};
