/**
 * Generate models and controllers for AppBuilder apps.
 */

var fs = require('fs');
var path = require('path');
var AD = require('ad-utils');
var reloadTimeLimit = 2 * 1000 * 60; // 2 minutes

var cliCommand = path.join(
    process.cwd(),
    'node_modules', 'app_builder',
    'node_modules', 'appdev',
    'bin', 'appDev.js'
);

function nameFilter(name) {
    return String(name).replace(/[^a-z0-9]/gi, '');
}

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
        
        var appFolders = [];
        
        // Notify all clients that the server is reloading
        sails.sockets.blast('server-reload', { reloading: true });
        
        async.auto({
            find: function(next) {
                ABApplication.find()
                .then(function(list) {
                    if (!list || !list[0]) {
                        throw new Error('no apps found');
                    }
                    for (var i=0; i<list.length; i++) {
                        appFolders.push('ab_' + nameFilter(list[i].name).toLowerCase());
                    }
                    next();
                    return null;
                })
                .catch(next);
            },
            
            // Run setup.js for every AB application
            setup: ['find', function(next) {
                var cwd = process.cwd();
                async.eachSeries(appFolders, function(folder, ok) {
                    try {
                        process.chdir(path.join(cwd, 'node_modules', folder));
                    } catch (err) {
                        console.log('Folder not found: ' + folder);
                        return ok();
                    }
                    
                    // Can't just require() it, because it's not guaranteed to 
                    // execute after the first time, due to caching.
                    AD.spawn.command({
                        command: 'node',
                        options: [
                            path.join('setup', 'setup.js')
                        ]
                    })
                    .fail(ok)
                    .done(function() {
                        ok();
                    })
                    
                }, function(err) {
                    process.chdir(cwd);
                    if (err) next(err);
                    else next();
                });
            }],
            
            controllers: ['setup', function(next) {
                sails.log('Reloading controllers');
                sails.hooks.controllers.loadAndRegisterControllers(function() {
                    next();
                });
            }],
            
            /*
            i18n: ['controllers', function(next) {
                sails.log('Reloading i18n');
                sails.hooks.i18n.initialize(function() {
                    next();
                });
            }],
            
            services: ['controllers', function(next) {
                sails.log('Reloading services');
                sails.hooks.services.loadModules(function() {
                    next();
                });
            }],
            */
            
            orm: ['setup', function(next) {
                sails.log('Reloading ORM');
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
            }],
            
            blueprints: ['controllers', 'orm', function(next) {
                sails.log('Reloading blueprints');
                clearTimeout(timeout);
                sails.hooks.blueprints.extendControllerMiddleware();
                sails.router.flush();
                sails.hooks.blueprints.bindShadowRoutes();
                next();
            }]
        
        }, function(err) {
            sails.sockets.blast('server-reload', { reloading: false });
            sails.log('End reload');
            if (err) dfd.reject(err);
            else dfd.resolve();
        });

        return dfd;
    },
    
    
    /**
     * Generate the application directory structure
     */
    buildApplication: function(appID) {
        var dfd = AD.sal.Deferred();
        var cwd = process.cwd();
        
        var pluginExists = false;
        var appName, moduleName;
        
        async.series([
            function(next) {
                ABApplication.find({ id: appID })
                .then(function(list) {
                    if (!list || !list[0]) {
                        throw new Error('Application not found');
                    }
                    var obj = list[0];
                    // Only numbers and alphabets will be used
                    appName = 'AB_' + nameFilter(obj.name);
                    moduleName = appName.toLowerCase();
                    next();
                    return null;
                })
                .catch(function(err) {
                    next(err);
                    return null;
                });
            },
            
            // Check if plugin already exists
            function(next) {
                process.chdir('node_modules'); // sails/node_modules/
                fs.stat(moduleName, function(err, stat) {
                    if (!err) {
                        pluginExists = true;
                    }
                    next();
                });
            },
            
            // Create opstool plugin with appdev-cli
            function(next) {
                if (pluginExists) {
                    // Skip this step if plugin already exists
                    return next();
                }
                AD.spawn.command({
                    command: cliCommand,
                    options: [
                        'opstoolplugin',
                        appName,
                        '1' // isOPView
                    ],
                    shouldEcho: true,
                    responses: {
                        'unit test capabilities': 'no\n',
                        'author': 'AppBuilder\n',
                        'description': '\n',
                        'version': '\n',
                        'repository': '\n',
                    }
                })
                .fail(next)
                .done(function() {
                    next();
                });
            },
            
            // Delete old .adn file
            function(next) {
                process.chdir(moduleName); // sails/node_modules/ab_{appName}/
                async.each(['.adn'], function(target, ok) {
                    // Delete file if it exists
                    fs.unlink(target, function(err) {
                        // Ignore errors. If file does not exist, that's fine.
                        ok();
                    });
                }, function(err) {
                    next();
                });
            },
            
            // Symlink the .adn file
            function(next) {
                fs.symlink(path.join(cwd, '.adn'), '.adn', next);
            }
            
        ], function(err) {
            process.chdir(cwd);
            if (err) dfd.reject(err);
            else dfd.resolve({});
        });
        
        return dfd;
    },
    
    
    
    /**
     * Generate the models and controllers for a given AB Object.
     *
     * @param integer objectID
     *      The ABObject primary key ID.
     * @return Deferred
     */
    buildObject: function(objectID) {
        var dfd = AD.sal.Deferred();
        
        var appName, moduleName;
        var objName, fullName;
        var pages = [];
        var columns = [];
        
        //var modelsPath = sails.config.paths.models;
        var modelsPath = path.join('api', 'models'); // in the submodule
        
        var fullPath, fullPathTrans;
        var cwd = process.cwd();
        
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
                    appName = 'AB_' + nameFilter(obj.application.name);
                    moduleName = appName.toLowerCase();
                    
                    objName = nameFilter(obj.name);
                    columns = obj.columns;
                    fullName = appName + '_' + objName;
                    
                    fullPath = path.join(modelsPath, fullName) + '.js';
                    fullPathTrans = path.join(modelsPath, fullName) + 'Trans.js';
                    
                    next();
                    return null;
                })
                .catch(function(err) {
                    next(err);
                });
            },
            
            // Delete old model definition files
            function(next) {
                process.chdir(path.join('node_modules', moduleName)); // sails/node_modules/ab_{appName}/
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
                var cliParams = [ 
                    'resource', // appdev-cli command
                    path.join('opstools', appName), // client side location
                    fullName, // server side location
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
            process.chdir(cwd);
            if (err) dfd.reject(err);
            else dfd.resolve();
        });
            
        return dfd;
    },
    
    
    /**
     * Generate the client side controller for an application's page
     *
     * @param integer pageID
     * @return Deferred
     */
    buildPage: function(pageID) {
        var dfd = AD.sal.Deferred();
        var cwd = process.cwd();
        
        var appName, pageName;
        var appID;
        var objectIncludes = [];
        var controllerIncludes = [];
        
        async.series([
            // Find page info
            function(next) {
                ABPage.find({ id: pageID })
                .populate('application')
                .then(function(list) {
                    var obj = list[0];
                    if (!obj) throw new Error('invalid page id');
                    
                    appID = obj.application.id;
                    
                    // Only numbers and alphabets will be used
                    appName = 'AB_' + nameFilter(obj.application.name);
                    pageName = nameFilter(obj.name);
                    
                    next();
                    return null;
                })
                .catch(function(err) {
                    next(err);
                    return null;
                });
            },
            
            // Generate the client side controller for the app page
            function(next) {
                AD.spawn.command({
                    command: cliCommand,
                    options: [
                        'controllerUI',
                        path.join('opstools', appName),
                        pageName
                    ],
                    shouldEcho: true
                })
                .fail(next)
                .done(function() {
                    controllerIncludes.push({
                        key: 'opstools.' + appName + '.' + pageName,
                        path: 'opstools/' + appName + '/controllers/'
                            + pageName + '.js'
                    });
                    next();
                });
            
            },
            
            // Find related objects
            function(next) {
                ABObject.find({ application: appID })
                .then(function(list) {
                    for (var i=0; i<list.length; i++) {
                        var obj = list[i];
                        objectIncludes.push({ 
                            key: 'opstools.' + appName + '.' + obj.name, 
                            path: 'opstools/' + appName + '/models/'
                                    + appName + '_' + obj.name + '.js' 
                        });
                    }
                    next();
                    return null;
                })
                .catch(function(err) {
                    next(err);
                    return null;
                });
            },
            
            // Create OPView entry
            function(next) {
                OPSPortal.View.createOrUpdate(
                    'opstools.' + appName,
                    objectIncludes,
                    controllerIncludes
                )
                .fail(next)
                .done(function() {
                    next();
                });
            },
            
            // Register the permission action
            function(next) {
                Permissions.action.create({
                    key: 'opstools.' + appName + '.view',
                    description: 'Allow the user to view the ' + appName + ' base page',
                    language_code: 'en'
                })
                .always(function() {
                    // Don't care if there was an error.
                    // If permission action already exists, that's fine.
                    next();
                });
            }
            
        ], function(err) {
            if (err) dfd.reject(err);
            else dfd.resolve({});
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
     /*
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
    */

};