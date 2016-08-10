/**
 * ABApplication.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var async = require('async'),
    _ = require('lodash');

module.exports = {

    tableName: 'appbuilder_application',


    connection: 'appdev_default',



    attributes: {

        // this will pull in the translations using .populate('translations')
        translations: {
            collection: 'ABApplicationTrans',
            via: 'abapplication'
        },

        translate: function (code) {
            return ADCore.model.translate({
                model: this,         // this instance of a Model
                code: code,          // the language code of the translation to use.
                ignore: ['abapplication']     // don't include this field when translating
            });
        },

        _Klass: function () {
            return ABApplication;
        },

        object: { collection: 'ABObject', via: 'application' },

        permissions: { collection: 'PermissionRole', dominant: true },

        name: {
            type: 'string',
            required: true,
            unique: true
        }
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

    afterDestroy: function (destroyedApplications, cb) {

        var ids = _.map(destroyedApplications, 'id');

        if (ids && ids.length) {
            async.parallel([
                function (callback) {
                    ABApplicationTrans.destroy({ abapplication: ids })
                        .fail(function (err) {
                            callback(err)
                        })
                        .then(function () {
                            callback();
                        });
                },
                function (callback) {
                    ABObject.destroy({ application: ids })
                        .fail(function (err) {
                            callback(err)
                        })
                        .then(function () {
                            callback();
                        });
                },
                function (callback) {
                    ABPage.destroy({ application: ids })
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

