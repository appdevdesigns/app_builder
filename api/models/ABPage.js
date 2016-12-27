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
      required: true
    },

    parent: {
      model: 'ABPage'
    },

    children: {
      collection: 'ABPage',
      via: 'parent'
    },

    application: { model: 'ABApplication' },


    /**
     * The key used in the creation of our Permission.action
     */
    permissionActionKey: { type: 'string' },


    type: {
      type: 'string',
      enum: ['page', 'modal', 'tab']
    },

    weight: {
      type: 'integer',
      required: false
    },

    components: {
      collection: 'ABPageComponent',
      via: 'page'
    }

  },

  beforeValidate: function (values, cb) {
    for (var key in values) {
      if (values[key] == null || typeof values[key] == 'undefined' || values[key] != values[key] /* NaN */)
        delete values[key];
      else if (values[key] === '')
        values[key] = null;
    }

    cb();
  },

  beforeCreate: function (values, cb) {
    if (values.name)
      values.name = values.name.replace(/ /g, '_');

    cb();
  },

  afterCreate: function (newPage, cb) {
    if (newPage && !newPage.parent) { // Root page - build new page
      AppBuilder.buildPage(newPage.id).then(function () { cb() }, cb);
    }
    else
      cb();
  },

  beforeUpdate: function (values, cb) {
    if (values.name)
      values.name = values.name.replace(/ /g, '_');

    cb();
  },

  afterDestroy: function (destroyedPages, cb) {
    var ids = _.map(destroyedPages, 'id');

    if (!ids || ids.length < 1) return cb();

    async.parallel([
      // Delete sub-pages
      function (next) {
        ABPage.count({ parent: ids })
          .then(function (found) {
            if (found < 1) return next();

            ABPage.destroy({ parent: ids })
              .then(function () {
                next();
              }, next);
          }, next);
      },
      // Delete components
      function (next) {
        ABPageComponent.destroy({ page: ids })
          .then(function () {
            next();
          }, next);
      },
      // Delete translations of pages
      function (next) {
        ABPageTrans.destroy({ abpage: ids })
          .then(function () {
            next();
          }, next);
      },

      function (next) {
        AppBuilder.removePages(destroyedPages)
          .then(function() {
            next();
          }, next);
      }
    ], cb);

  }
};

