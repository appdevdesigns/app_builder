/**
 * ABObject.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var async = require('async'),
    _ = require('lodash');

module.exports = {

    tableName: 'appbuilder_object',

    connection: 'appdev_default',


    attributes: {

        name: {
            type: 'string',
            required: true
        },

        labelFormat: { type: 'string' },

        columns: { collection: 'ABColumn', via: 'object' },

        application: { model: 'ABApplication' },

        isImported: {
            type: 'boolean',
            defaultsTo: false
        },
        
        urlPath: {
            type: 'string',
            size: 80,
            defaultsTo: '',
            required: false
        },


        // this will pull in the translations using .populate('translations')
        translations: {
            collection: 'ABObjectTrans',
            via: 'abobject'
        },

        translate: function (code) {
            return ADCore.model.translate({
                model: this,         // this instance of a Model
                code: code,          // the language code of the translation to use.
                ignore: ['abobject']     // don't include this field when translating
            });
        },

        _Klass: function () {
            return ABObject;
        }
    },


    beforeCreate: function (values, cb) {
        if (values.name)
            values.name = values.name.replace(/ /g, '_');

        cb();
    },


    beforeUpdate: function (values, cb) {
        if (values.name)
            values.name = values.name.replace(/ /g, '_');

        cb();
    },


    afterDestroy: function (destroyedObjects, cb) {

        var ids = _.map(destroyedObjects, 'id');

        if (ids && ids.length) {
            async.parallel([
                function (callback) {
                    ABObjectTrans.destroy({ abobject: ids })
                        .fail(function (err) {
                            callback(err)
                        })
                        .then(function () {
                            callback();
                        });
                },
                function (callback) {
                    ABColumn.destroy({ object: ids })
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