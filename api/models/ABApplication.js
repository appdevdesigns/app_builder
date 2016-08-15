/**
 * ABApplication.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var async = require('async'),
    _ = require('lodash'),
    AD = require('ad-utils');

function addAppRole(applicationName) {
    var q = AD.sal.Deferred(),
        roleName = applicationName + ' Application Role',
        roleDescription = applicationName + ''; // TODO: role description

    Permissions.createRole(roleName, roleDescription)
        .fail(function (err) { q.reject(err); })
        .then(function (result) {
            q.resolve(result);
        });

    return q;
}

function save(values) {
    var q = AD.sal.Deferred(),
        applicationName = values.name;

    if (values.name)
        values.name = applicationName.replace(' ', '_');

    if (values.addNewRole) {
        // Create new role for app
        if (values.id) {
            ABApplicationPermission.count({
                application: values.id,
                isApplicationRole: true
            })
                .fail(function (err) { q.reject(err) })
                .then(function (found) {
                    if (found < 1) {
                        addAppRole(applicationName)
                            .fail(function (err) { q.reject(err) })
                            .then(function (result) {
                                if (!values.permissions) values.permissions = [];

                                values.permissions.push({
                                    // TODO: application:
                                    permission: result.id,
                                    isApplicationRole: true
                                });

                                q.resolve();
                            });
                    }
                    else {
                        q.resolve();
                    }
                });
        }
        else {
            addAppRole(applicationName)
                .fail(function (err) { q.reject(err) })
                .then(function () { q.resolve(); });
        }
    }
    else {
        if (values.id) {
            // Delete the app permission role
            ABApplicationPermission.find({
                application: values.id,
                isApplicationRole: true
            }).then(function (perms) {
                var deleteTasks = [];

                perms.forEach(function (p) {
                    deleteTasks.push(function (callback) {
                        PermissionRole.destroy({ id: p.permission })
                            .fail(function (err) { callback(err); })
                            .then(function () {
                                ABApplicationPermission.destroy({ id: p.id })
                                    .fail(function (err) { callback(err); })
                                    .then(function () { callback(); });
                            });
                    });
                })

                async.parallel(deleteTasks, function (err, results) {
                    if (err) {
                        q.reject(err);
                        return;
                    }

                    q.resolve();
                });
            });
        }
        else {
            q.resolve();
        }
    }

    return q;
}

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

        permissions: {
            collection: 'ABApplicationPermission',
            via: 'application',
        },

        name: {
            type: 'string',
            required: true,
            unique: true
        }
    },

    beforeCreate: function (values, cb) {
        save(values)
            .fail(function (err) { cb(err); })
            .then(function () { cb(); });
    },

    beforeUpdate: function (values, cb) {
        save(values)
            .fail(function (err) { cb(err); })
            .then(function () { cb(); });
    },

    afterCreate: function (newlyInsertedRecord, cb) {
        // TODO : Assign permission action to permission role
        cb();
    },

    afterUpdate: function (updatedRecord, cb) {
        // TODO : Assign permission action to permission role
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
                },
                function (callback) {
                    ABApplicationPermission.destroy({ application: ids })
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

