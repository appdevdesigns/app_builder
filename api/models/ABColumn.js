/**
 * ABColumn.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var async = require('async'),
    _ = require('lodash');

module.exports = {

    tableName: 'appbuilder_column',


    connection: 'appdev_default',
    migrate: 'alter',

    attributes: {

        // this will pull in the translations using .populate('translations')
        translations: {
            collection: 'ABColumnTrans',
            via: 'abcolumn'
        },

        translate: function (code) {
            return ADCore.model.translate({
                model: this,         // this instance of a Model
                code: code,          // the language code of the translation to use.
                ignore: ['abcolumn']     // don't include this field when translating
            });
        },

        _Klass: function () {
            return ABColumn;
        },

        object: { model: 'ABObject' },

        name: {
            type: 'string',
            required: true
        },

        fieldName: {
            type: 'string',
            required: true
        },

        type: {
            type: 'string',
            required: true
        },

        weight: {
            type: 'integer',
            required: false
        },

        width: {
            type: 'integer',
            required: false
        },

        required: { type: 'boolean' },

        unique: { type: 'boolean' },

        setting: { type: 'json' }

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

        if (values.weight == null) {
            // Set weight
            ABColumn.count({ object: values.object }).exec(function (err, found) {
                values.weight = found + 1;
                cb();
            });
        }
        else {
            cb();
        }

    },

    beforeUpdate: function (values, cb) {
        if (values.name)
            values.name = values.name.replace(/ /g, '_');

        cb();
    },

    afterDestroy: function (destroyedColumns, cb) {

        var ids = _.map(destroyedColumns, 'id');

        if (ids && ids.length) {
            async.parallel([
                function (callback) {
                    ABColumnTrans.destroy({ abcolumn: ids })
                        .fail(function (err) {
                            callback(err)
                        })
                        .then(function () {
                            callback();
                        });
                },
                function (callback) {
                    ABList.destroy({ column: ids })
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