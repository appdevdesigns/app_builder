/**
 * ABObjectTrans.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  tableName:'appbuilder_object_trans',


  connection:'appdev_default',



  attributes: {

    abobject: { model: 'ABObject' },

    label : { type: 'string' },

    language_code : { type: 'string' }
  }
};

