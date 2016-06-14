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
        
        var appName, objName, fullName;
        var columns = [];
        
        var modelsPath = sails.config.paths.models; // "/api/models"
        var fullPath, fullPathTrans;
        
        async.series([
            // Find object info
            function(next) {
                ABObject.find({ id: objectID })
                .populate('columns')
                .populate('application')
                .then(function(list) {
                    var obj = list[0];
                    if (!obj) throw new Error('invalid object id');
                    
                    // Only numbers and alphabets will be used
                    appName = obj.application.name.replace(/[^a-z0-9]/ig, '');
                    objName = obj.name.replace(/[^a-z0-9]/ig, '');
                    columns = obj.columns;
                    fullName = 'AB_' + appName + '_' + objName;
                    
                    fullPath = path.join(modelsPath, fullName) + '.js';
                    fullPathTrans = path.join(modelsPath, fullName) + 'Trans.js';
                    
                    next();
                    return null;
                })
                .catch(function(err) {
                    next(err);
                });
            },
            
            // Delete old model definition
            function(next) {
                async.each([fullPath, fullPathTrans], function(target, ok) {
                    // Delete file if it exists
                    fs.unlink(target, function(err) {
                        // Ignore errors. If file does not exist, that's fine.
                        ok();
                    });
                }, function(err) {
                    next();
                });
            },
            
            // Generate model definitions with appdev-cli
            function(next) {
                var cliCommand = path.join(
                    'node_modules', 'app_builder',
                    'node_modules', 'appdev',
                    'bin', 'appDev.js'
                );
                var cliParams = [ 
                    'resource', // appdev-cli command
                    appName,
                    fullName,
                    'connection:appBuilder', // Sails connection name
                    'tablename:' + fullName.toLowerCase()
                ];
                for (var i=0; i<columns.length; i++) {
                    var col = columns[i];
                    var colString = col.name + ':' + col.type;
                    if (col.supportMultilingual) {
                        colString += ':multilingual';
                    }
                    else if (col.linkToObject) {
                        colString += ':model:' + col.linkToObject;
                    }
                    cliParams.push(colString);
                }
                
                AD.spawn.command({
                    command: cliCommand,
                    options: cliParams
                })
                .fail(next)
                .done(function() {
                    next();
                });
            },
            
            /*
            // Render sails model definition
            function(next) {
                sails.renderView(path.join('app_builder', 'model'), {
                    layout: false,
                    modelName: fullName,
                    tableName: fullName,
                    columns: obj.columns
                }, function(err, str) {
                    if (err) {
                        next(err);
                    } else {
                        
                        fs.writeFile(
                            path.join(modelsPath, fullName + '.js'),
                            str,
                            function(err) {
                                if (err) next(err);
                                else {
                                    next();
                                }
                            }
                        );
                    }
                });
            },
            */
            
            // Patch model definition
            function(next) {
                async.each([fullPath, fullPathTrans], function(target, ok) {
                    fs.readFile(target, 'utf8', function(err, data) {
                        // Ignore errors. If file does not exist, that's fine.
                        if (err) {
                            ok();
                        } else {
                            var newData = data.replace(
                                /module.exports = {/i,
                                "module.exports = {\n" +
                                "  migrate: 'alter',"
                            );
                            fs.writeFile(target, newData, ok);
                        }
                    });
                }, function(err) {
                    next();
                });
            }
        
        ], function(err) {
            if (err) dfd.reject(err);
            else dfd.resolve();
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