/**
 * ABPage.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var async = require('async'),
  _ = require('lodash');

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

    application: { model: 'ABApplication' },

    components: {
      collection: 'ABPageComponent',
      via: 'page'
    }
  },

  beforeValidate: function (values, cb) {
    for (var key in values) {
      if (values[key] == null || typeof values[key] == 'undefined' || values[key] != values[key] /* NaN */)
        delete values[key];
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
      async.parallel([
        function (callback) {
          ABPage.count({ parent: ids })
            .fail(function (err) {
              callback(err)
            })
            .then(function (found) {
              if (found > 0) {
                ABPage.destroy({ parent: ids })
                  .fail(function (err) {
                    callback(err)
                  })
                  .then(function () {
                    callback();
                  });
              }
              else {
                callback();
              }
            });
        },
        function (callback) {
          ABPageComponent.destroy({ page: ids })
            .fail(function (err) {
              callback(err)
            })
            .then(function () {
              callback();
            });
        },
        function (callback) {
          ABPageTrans.destroy({ abpage: ids })
            .fail(function (err) {
              callback(err)
            })
            .then(function () {
              callback();
            });
        }
      ], cb);
    }
    else {
      cb();
    }

  }
};

