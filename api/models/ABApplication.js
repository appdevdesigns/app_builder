/**
 * ABApplication.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var async = require('async'),
    _ = require('lodash'),
    AD = require('ad-utils'),
    path = require('path');

var ABClassApplication = require(path.join('..', 'classes', 'ABClassApplication'));


module.exports = {

    tableName: 'appbuilder_application',

    // connection: 'appdev_default',


    attributes: {

        json : 'json', 
        
        // objects: { collection: 'ABObject', via: 'application' },

        pages: { collection: 'ABPage', via: 'application' },


        name: {
            type: 'string',
            required: true,
            unique: true,
            maxLength: 20
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


        areaKey: function () {
            return _.kebabCase('ab-' + this.name);
        },

        actionKeyName: function () {
            return actionKeyName(this.validAppName()); // 'opstools.' + this.validAppName() + '.view'; 
        },

        toABClass: function () {

            return new ABClassApplication(this);

        },

        validAppName: function () {
            return validAppName(this.name);
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


    afterCreate: function (newRecord, cb) {

        // if we have a proper ABApplication.id given:
        if ((newRecord)
            && (newRecord.id)) {

            sails.log.info('ABApplication:afterCreate() triggering registerNavBarArea('+newRecord.id+')');
            AppBuilder.registerNavBarArea(newRecord.id);
        }

        // don't wait around:
        cb();
    },

    afterUpdate: function (updatedRecord, cb) {

         // if we have a proper ABApplication.id given:
        if ((updatedRecord)
            && (updatedRecord.id)) {
// console.log('... update application: ', updatedRecord);

            Promise.resolve()

                // Update Nav bar area
                .then(() => {
                    return AppBuilder.updateNavBarArea(updatedRecord.id);
                })

                // pull ABApplication
                .then(() => {
                    return new Promise((resolve, reject) => {

                        ABApplication.findOne({ id: updatedRecord.id })
                            .exec((err, result) => {
                                if (err) reject(err);
                                else resolve(result);
                            });

                    });
                })

                .then((Application) => {

                    var buildPageTasks = [],
                        appliationClass = Application.toABClass();

                    // TODO : should clear old pages from nav

                    // get .pages
                    if (appliationClass._pages && appliationClass._pages.forEach) {
                        appliationClass._pages.forEach(function(page) {

                            buildPageTasks.push(AppBuilder.updateNavView(Application, page));

                        });
                    }

                    return Promise.all(buildPageTasks);

                });

        }

        cb();
    },

    beforeDestroy: function (criteria, cb) {

        var applications = [],
            appIds = [];

        async.series([
            function (callback) {
                ABApplication.find(criteria)
                    .then(function (apps) {
                        if (apps) {
                            applications = apps;
                            applications.forEach(function (app) {
                                appIds.push(app.id);
                            });

                            callback();
                        }
                        else {
                            callback();
                        }
                    }, callback);
            },
            function (callback) {
                ABApplicationTrans.destroy({ abapplication: appIds })
                    .then(function () {
                        callback();
                    }, callback);
            },
            // function (callback) {
            //     ABObject.destroy({ application: appIds })
            //         .then(function () {
            //             callback();
            //         }, callback);
            // },
            // function (callback) {
            //     ABPage.destroy({ application: appIds })
            //         .then(function () {
            //             callback();
            //         }, callback);
            // },

            function ABApplication_AfterDelete_RemovePermissions(callback) {

                var actionKeys = [];
                applications.forEach(function (deletedApp) {
                    actionKeys.push(actionKeyName(validAppName(deletedApp.name)));
                })

                Permissions.action.destroyKeys(actionKeys)
                    .then(function (data) {
                        callback();
                    }, callback);

            },

            function (callback) {
                var appKeys = _.map(applications, function(app) { return app.areaKey(); });

                OPSPortal.NavBar.Area.remove(appKeys)
                    .then(function () {
                        callback();
                    }, callback);
            }

        ], cb);

    }

};

function actionKeyName(name) {
    return 'opstools.' + name + '.view';
}

function validAppName(name) {
    return AppBuilder.rules.toApplicationNameFormat(name);
}
