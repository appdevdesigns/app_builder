/**
 * ABColumnTrans.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  tableName: 'appbuilder_list_trans',


  connection: 'appdev_default',



  attributes: {

    ablist: { model: 'ABList' },

    label: { type: 'string' },

    language_code: { type: 'string' },

    weight: { type: 'integer' }
  }
};

