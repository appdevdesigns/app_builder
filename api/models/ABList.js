/**
 * ABList.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var _ = require('lodash');

module.exports = {

  tableName: 'appbuilder_list',


  connection: 'appdev_default',



  attributes: {

    // this will pull in the translations using .populate('translations')
    translations: {
      collection: 'ABListTrans',
      via: 'ablist'
    },

    translate: function (code) {
      return ADCore.model.translate({
        model: this,         // this instance of a Model
        code: code,          // the language code of the translation to use.
        ignore: ['ablist']     // don't include this field when translating
      });
    },

    _Klass: function () {
      return ABList;
    },

    column: { model: 'ABColumn' },

    key: { type: 'string' },

    value: { type: 'string' }
  },

  beforeCreate: function (values, cb) {
    if (values.value)
      values.value = values.value.replace(/ /g, '_');

    cb();
  },

  beforeUpdate: function (values, cb) {
    if (values.value)
      values.value = values.value.replace(/ /g, '_');

    cb();
  },

  afterDestroy: function (destroyedObjects, cb) {

    var ids = _.map(destroyedObjects, 'id');

    if (ids && ids.length) {
      ABListTrans.destroy({ ablist: ids })
        .fail(function (err) {
          cb(err);
        })
        .then(function () {
          cb();
        });
    }
    else {
      cb();
    }

  }

};

