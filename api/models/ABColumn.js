/**
 * ABColumn.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

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

        supportMultilingual: { type: 'boolean' }
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
    }
};

