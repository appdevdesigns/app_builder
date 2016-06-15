/**
 * ABPage.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  tableName: 'appbuilder_page',


  connection: 'appdev_default',



  attributes: {

    // this will pull in the translations using .populate('translations')
    translations: {
      collection: 'ABPageTrans',
      via: 'abpage'
    },

    translate: function (code) {
      return ADCore.model.translate({
        model: this,         // this instance of a Model
        code: code,          // the language code of the translation to use.
        ignore: ['abpage']     // don't include this field when translating
      });
    },

    _Klass: function () {
      return ABPage;
    },

    name: {
      type: 'string',
      required: true,
      unique: true
    },

    parent: {
      model: 'ABPage'
    },

    children: {
      collection: 'ABPage',
      via: 'parent'
    },

    application: { model: 'ABApplication' }
  },

  beforeValidate: function (values, cb) {
    for (var key in values) {
      if (!values[key]) delete values[key];
    }

    cb();
  },

  beforeCreate: function (values, cb) {
    if (values.name)
      values.name = values.name.replace(' ', '_');

    cb();
  },

  beforeUpdate: function (values, cb) {
    if (values.name)
      values.name = values.name.replace(' ', '_');

    cb();
  },

  afterDestroy: function (destroyedObjects, cb) {

    var ids = _.map(destroyedObjects, 'id');

    if (ids && ids.length) {
      ABPageTrans.destroy({ abpage: ids })
        .fail(function (err) {
          cb(err)
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

