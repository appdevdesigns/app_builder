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

        list: { collection: 'ABList', via: 'column' },

        name: {
            type: 'string',
            required: true
        },

        type: {
            type: 'string',
            required: true
        },

        required: { type: 'boolean' },

        unique: { type: 'boolean' },

        default: { type: 'string' },

        setting: { type: 'json' },

        linkToObject: { type: 'string' },

        isMultipleRecords: { type: 'boolean' },

        supportMultilingual: { type: 'boolean' },

    },

    beforeCreate: function (values, cb) {
        if (values.name)
            values.name = values.name.replace(' ', '_');

        // Add select list data
        if (values.options && values.options.length > 0) {
            var list_key = '',
                createEvents = [],
                listIds = [];

            list_key = 'TODO';

            values.options.forEach(function (opt, index) {

                createEvents.push(function (callback) {
                    Multilingual.model.create({
                        model: ABList,
                        data: {
                            key: list_key,
                            weight: index,
                            value: opt.value,
                            label: opt.value,
                            language_code: 'en'
                        }
                    }).fail(function (err) {
                        callback(err);
                    }).then(function (result) {

                        listIds.push(result.id);

                        callback();
                    });
                });

            });

            async.parallel(createEvents, function (err) {
                delete values.options;
                console.log('list: ', listIds);
                values.list = listIds;

                cb(err);
            });
        }
        else {
            cb();
        }
    },

    beforeUpdate: function (values, cb) {
        if (values.name)
            values.name = values.name.replace(' ', '_');

        // Add select list data
        if (values.options && values.options.length > 0) {
            cb();
        }
        else {
            cb();
        }
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