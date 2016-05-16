/**
 * ABObject.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    tableName: 'appbuilder_object',


    connection: 'appdev_default',



    attributes: {

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
        },

        name: {
            type: 'string',
            required: true,
            unique: true
        },

        columns: { collection: 'ABColumn', via: 'object' },

        application: { model: 'ABApplication' }
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

