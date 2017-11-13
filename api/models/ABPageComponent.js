/**
 * ABPageComponent.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  tableName: 'appbuilder_page_component',


  connection: 'appdev_default',



  attributes: {

    page: { model: 'ABPage' },

    component: { type: 'string' },

    weight: { type: 'integer' },

    setting: { type: 'json' }
  },


  beforeValidate: function (values, cb) {
    for (var key in values) {
      if (values[key] == null || typeof values[key] == 'undefined' || values[key] != values[key] /* NaN */)
        delete values[key];
    }

    cb();
  }

};

