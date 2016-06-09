/**
 * Converts between Sails model definition files and App Builder Object entries.
 */

var fs = require('fs');
var path = require('path');
var AD = require('ad-utils');
var reloadTimeLimit = 1000 * 60; // 60 seconds

module.exports = {
    
    /**
     * Reload Sails controllers, routes, and models.
     *
     * @return Deferred
     */
    reload: function() {
        var dfd = AD.sal.Deferred();
        
        var timeout = setTimeout(function() {
            dfd.reject(new Error('reload timed out'));
        }, reloadTimeLimit);
        
        var env1 = sails.config.environment,
            env2 = process.env.NODE_ENV;
        
        async.auto({
            controllers: function(next) {
                sails.hooks.controllers.loadAndRegisterControllers(function() {
                    next();
                });
            },
            
            /*
            i18n: ['controllers', function(next) {
                sails.hooks.i18n.initialize(function() {
                    next();
                });
            }],
            
            services: ['controllers', function(next) {
                sails.hooks.services.loadModules(function() {
                    next();
                });
            }],
            */
            
            orm: function(next) {
                // Temporarily set environment to development so Waterline will
                // respect the migrate:alter setting
                sails.config.evnironment = 'development';
                process.env.NODE_ENV = 'developement';
                
                sails.hooks.orm.reload();
                sails.once('hook:orm:reloaded', function() {
                    // Restore original environment
                    sails.config.environment = env1;
                    process.env.NODE_ENV = env2;
                    next();
                });
            },
            
            blueprints: ['controllers', 'orm', function(next) {
                clearTimeout(timeout);
                sails.hooks.blueprints.extendControllerMiddleware();
                sails.router.flush();
                sails.hooks.blueprints.bindShadowRoutes();
                next();
            }]
        
        }, function(err) {
            if (err) dfd.reject(err);
            else dfd.resolve();
        });

        return dfd;
    },
    
    
    /**
     * Generate a Sails model definition file.
     *
     * @param integer objectID
     *      The ABObject primary key ID.
     * @return Deferred
     */
    objectToModel: function(objectID) {
        var dfd = AD.sal.Deferred();
        
        ABObject.find({ id: objectID })
            .populate('columns')
            .populate('application')
            .then(function(list) {
                var obj = list[0];
                var fullName = obj.application.name + '_' + obj.name;
                
                if (!obj) throw new Error('invalid object id');
                
                sails.renderView(path.join('app_builder', 'model'), {
                    layout: false,
                    modelName: 'AB_' + fullName,
                    tableName: fullName,
                    columns: obj.columns
                }, function(err, str) {
                    if (err) {
                        dfd.reject(err);
                    } else {
                        // Normally this is "/api/models"
                        var modelsPath = sails.config.paths.models;
                        
                        fs.writeFile(
                            path.join(modelsPath, 'AB_' + fullName + '.js'),
                            str,
                            function(err) {
                                if (err) dfd.reject(err);
                                else {
                                    dfd.resolve(str);
                                }
                            }
                        );
                    }
                });
                
                return null;
            })
            .catch(function(err) {
                dfd.reject(err);
            });
            
        return dfd;
    },
    
    
    /**
     * Generate AppBuilder data entries based on a Sails model that was
     * previously created by AppBuilder.
     *
     * @param string modelName
     *      The model name including the "AB_" prefix.
     * @return Deferred
     */
    modelToObject: function(modelName) {
        var dfd = AD.sal.Deferred();
        var model = sails.models[modelName.toLowerCase()];
        
        if (!model || !model.definition) {
            dfd.reject(new Error('unrecognized model'));
        }
        else {
            var def = model.definition;
            var modelName = model.identity.replace(/^AB_\w+_/i, '');
            var appID, objectID;
            
            async.series([
                // Find Object in database
                function(next) {
                    ABObject.find({ name: modelName })
                    .then(function(list) {
                        if (list && list[0]) {
                            appID = list[0].application;
                            objectID = list[0].id;
                        }
                        next();
                        return null;
                    })
                    .catch(next);
                },
                
                // Create Object in database if needed
                function(next) {
                    if (!objectID) {
                        ABObject.create({
                            application: appID,
                            name: modelName
                        })
                        .then(function(obj) {
                            objectID = obj.id;
                            next();
                            return null;
                        })
                        .catch(next);
                    } else {
                        next();
                    }
                },
                
                // Delete old Columns from database
                function(next) {
                    ABColumn.destroy({
                        object: objectID
                    })
                    .then(function() {
                        next();
                        return null;
                    })
                    .catch(next);
                },
                
                // Create Columns in database
                function(next) {
                    async.forEachOfSeries(def, function(col, colName, ok) {
                        
                        // Skip these columns
                        var ignore = [
                            'createdAt', 'updatedAt',
                        ];
                        if (ignore.indexOf(colName) >= 0) {
                            return ok();
                        }
                        
                        var defaultValue = col.default;
                        if (typeof col.default == 'function') {
                            defaultValue = col.default();
                        }
                        
                        var setting = model._attributes[colName].setting;
                        
                        ABColumn.create({
                            object: objectID,
                            name: colName,
                            type: col.type,
                            required: col.required,
                            unique: col.unique,
                            default: defaultValue,
                            setting: setting
                        })
                        .then(function() {
                            ok();
                            return null;
                        })
                        .catch(ok);
                        
                    }, function(err) {
                        if (err) next(err);
                        else next();
                    });
                }
            
            ], function(err) {
                if (err) dfd.reject(err);
                else {
                    dfd.resolve();
                }
            });
        }
        
        return dfd;
    },

};