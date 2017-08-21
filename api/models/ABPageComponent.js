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

    // this will pull in the translations using .populate('translations')
    translations: {
      collection: 'ABPageComponentTrans',
      via: 'abpage'
    },

    translate: function (code) {
      return ADCore.model.translate({
        model: this,                // this instance of a Model
        code: code,                 // the language code of the translation to use.
        ignore: ['abpagecomponent'] // don't include this field when translating
      });
    },

    _Klass: function () {
      return ABPageComponent;
    },

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

