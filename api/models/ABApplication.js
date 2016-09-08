/**
 * ABApplication.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var async = require('async'),
    _ = require('lodash'),
    AD = require('ad-utils');

module.exports = {

    tableName: 'appbuilder_application',

    connection: 'appdev_default',


    attributes: {

        object: { collection: 'ABObject', via: 'application' },


        name: {
            type: 'string',
            required: true,
            unique: true
        },

//// TODO: This should change.  Can be in multiple roles.
        role: {
            model: 'PermissionRole'
        },


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


        areaKey: function() {
            return _.kebabCase('ab-'+this.name);
        },

        actionKeyName:function(){
            return 'opstools.' + this.validAppName() + '.view'; 
        },

        validAppName:function() {
            return 'AB_' + nameFilter(this.name);
        }

    },



    beforeValidate: function (values, cb) {
        if (!values['role']) values['role'] = null;

        cb();
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


function nameFilter(name) {
    return String(name).replace(/[^a-z0-9]/gi, '');
}