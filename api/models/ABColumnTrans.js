/**
 * ABColumnTrans.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  tableName:'appbuilder_column_trans',


  connection:'appdev_default',



  attributes: {

    abcolumn: { model: 'ABColumn' },

    label : { type: 'string' },

    language_code : { type: 'string' }
  }
};

