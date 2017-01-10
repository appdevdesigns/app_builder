/**
 * Generate models and controllers for AppBuilder apps.
 */

var fs = require('fs');
var path = require('path');
var AD = require('ad-utils');
var _ = require('lodash');

var reloadTimeLimit = 3 * 1000 * 60; // 3 minutes

// var cliCommand = path.join(
//     process.cwd(),
//     'node_modules', 'app_builder',
//     'node_modules', 'appdev',
//     'bin', 'appDev.js'
// );
var cliCommand = 'appdev';  // use the global appdev command


var appsBuildInProgress = {};  // a hash of deferreds for apps currently being built.
// {  ABApplication.id : dfd }



var DataFields = {};


function importDataFields() {
    var dataFieldPath = path.join(__dirname, 'data_fields');

    DataFields = {};
 
    var ignoreFiles = ['.DS_Store', 'dataFieldTemplate.js'];

     fs.readdirSync(dataFieldPath).forEach(function (file) {
                         
        // if not one of our ignored files:      
        if ( ignoreFiles.indexOf(file) == -1) {
             DataFields[path.parse(file).name] = require(path.join(dataFieldPath, file));
         }
     });

}


function notifyToClients(reloading, step, action) {
    var data = {
        reloading: reloading
    };

    if (step)
        data.step = step;

    if (action)
        data.action = action;

    sails.sockets.blast('server-reload', data);
}

function getObjectModel(objectId) {
    var dfd = AD.sal.Deferred();
    ABObject.findOne({ id: objectId })
        .fail(function (err) { dfd.reject(err); })
        .then(function (result) { dfd.resolve(result); });

    return dfd;
}

module.exports = {

    /**
     * AppBuilder.util
     *
     * A set of rules for AppBuilder objects.
     */
    rules: {

        /** 
         * AppBuilder.rules.nameFilter
         * 
         * return a properly formatted name for an AppBuilder object.
         *
         * @param {string} name  The name of the object we are conditioning.
         * @return {string}
         */
        nameFilter: function (name) {
            return String(name).replace(/[^a-z0-9]/gi, '');
        },


        /** 
         * AppBuilder.rules.toApplicationNameFormat
         * 
         * return a properly formatted Application Name
         *
         * @param {string} name  The name of the Application we are conditioning.
         * @return {string}
         */
        toApplicationNameFormat: function (name) {
            return 'AB_' + AppBuilder.rules.nameFilter(name);
        },

        toObjectNameFormat: function (appName, objectName) {
            return (appName + '_' + AppBuilder.rules.nameFilter(objectName));
        }

    },


    // getApplicationName: function (name) {
    //     return 'AB_' + AppBuilder.rules.nameFilter(name);
    // },

    /**
     * Reload Sails controllers, routes, and models.
     *
     * @return Deferred
     */
    reload: function (appID) {
        var dfd = AD.sal.Deferred();

        var timeout = setTimeout(function () {
            dfd.reject(new Error('reload timed out'));
        }, reloadTimeLimit);

        var env1 = sails.config.environment,
            env2 = process.env.NODE_ENV;

        var appFolders = [];

        // Notify all clients that the server is reloading
        notifyToClients(true);

        async.auto({
            find: function (next) {
                notifyToClients(true, 'findApplication', 'start');

                ABApplication.find({ id: appID })
                    .then(function (list) {
                        if (!list || !list[0]) {
                            throw new Error('no apps found');
                        }
                        for (var i = 0; i < list.length; i++) {
                            appFolders.push('ab_' + AppBuilder.rules.nameFilter(list[i].name).toLowerCase());
                        }
                        next();

                        notifyToClients(true, 'findApplication', 'done');

                        return null;
                    })
                    .catch(next);
            },

            // Run setup.js for every AB application
            setup: ['find', function (next) {
                notifyToClients(true, 'prepareFolder', 'start');

                var cwd = process.cwd();
                async.eachSeries(appFolders, function (folder, ok) {
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
                        .done(function () {
                            ok();
                        })

                }, function (err) {
                    process.chdir(cwd);

                    notifyToClients(true, 'prepareFolder', 'done');

                    if (err) next(err);
                    else next();
                });
            }],

            controllers: ['setup', function (next) {
                sails.log('Reloading controllers');

                notifyToClients(true, 'reloadControllers', 'start');

                sails.hooks.controllers.loadAndRegisterControllers(function () {
                    notifyToClients(true, 'reloadControllers', 'done');

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

            orm: ['setup', function (next) {
                sails.log('Reloading ORM');

                notifyToClients(true, 'reloadORM', 'start');

                // Temporarily set environment to development so Waterline will
                // respect the migrate:alter setting
                sails.config.evnironment = 'development';
                process.env.NODE_ENV = 'developement';

                sails.hooks.orm.reload();
                sails.once('hook:orm:reloaded', function () {
                    // Restore original environment
                    sails.config.environment = env1;
                    process.env.NODE_ENV = env2;

                    notifyToClients(true, 'reloadORM', 'done');

                    next();
                });
            }],

            blueprints: ['controllers', 'orm', function (next) {
                sails.log('Reloading blueprints');
                notifyToClients(true, 'reloadBlueprints', 'start');

                clearTimeout(timeout);
                sails.hooks.blueprints.extendControllerMiddleware();
                sails.router.flush();
                sails.hooks.blueprints.bindShadowRoutes();

                notifyToClients(true, 'reloadBlueprints', 'done');
                next();
            }]

        }, function (err) {
            sails.log('End reload');

            notifyToClients(false);

            if (err) dfd.reject(err);
            else dfd.resolve();
        });

        return dfd;
    },


    /**
     * Generate the application directory structure
     */
    buildApplication: function (appID) {
        var dfd = AD.sal.Deferred();
        var cwd = process.cwd();

        var pluginExists = false;

        var appName, moduleName, areaName, areaKey;

        var Application = null;

        // if we are currently building it:
        if (appsBuildInProgress[appID]) {
            // console.log('... App Build in progress : waiting!');
            return appsBuildInProgress[appID];
        }


        // if we get here, we start building this app:
        // So mark that it is in progress:
        appsBuildInProgress[appID] = dfd;

        async.series([
            function (next) {
                ABApplication.find({ id: appID })
                    .populate('translations')
                    .then(function (list) {
                        if (!list || !list[0]) {
                            throw new Error('Application not found');
                        }
                        var obj = list[0];
                        // Only numbers and alphabets will be used
                        Application = obj;
                        appName = AppBuilder.rules.toApplicationNameFormat(obj.name);
                        moduleName = appName.toLowerCase();
                        next();
                        return null;
                    })
                    .catch(function (err) {
                        next(err);
                        return null;
                    });

            },

            // Check if plugin already exists
            function (next) {
                process.chdir('node_modules'); // sails/node_modules/
                fs.stat(moduleName, function (err, stat) {
                    if (!err) {
                        pluginExists = true;
                    }
                    next();
                });
            },

            // Create opstool plugin with appdev-cli
            function (next) {
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
                    .done(function () {
                        next();
                    });
            },

            // Delete old .adn file
            function (next) {
                process.chdir(moduleName); // sails/node_modules/ab_{appName}/
                async.each(['.adn'], function (target, ok) {
                    // Delete file if it exists
                    fs.unlink(target, function (err) {
                        // Ignore errors. If file does not exist, that's fine.
                        ok();
                    });
                }, function (err) {
                    next();
                });
            },

            // Symlink the .adn file
            function (next) {
                fs.symlink(path.join(cwd, '.adn'), '.adn', next);
            },


            // make sure OpsPortal navigation has an area for this application defined:
            function (next) {

                // if this was our first time to create the App, 
                // then create an area.  
                // Dont keep creating one since they might want to remove it using the
                // Live Navigation Editor
                if (!pluginExists) {

                    var areaName = Application.name;
                    var areaKey = Application.areaKey();
                    var label = areaName;  // default if no translations provided
                    Application.translations.some(function (trans) {
                        if (label == areaName) {
                            label = trans.label;
                            return true;  // stops the looping.
                        }
                    })
                    var defaultArea = {
                        key: areaKey,
                        icon: 'fa-cubes',
                        isDefault: false,
                        label: label,
                        context: areaKey
                    }

                    // Note: this will only create it if it doesn't already exist.
                    OPSPortal.NavBar.Area.create(defaultArea, function (err, area) {

                        // area is null if already existed, 
                        // not null if just created:

                        next(err);
                    })

                } else {
                    next();
                }

            }

        ], function (err) {
            process.chdir(cwd);
            if (err) dfd.reject(err);
            else dfd.resolve({});

            // now remove our flag:
            // console.log('... App Build finished!');
            delete appsBuildInProgress[appID];
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
    buildObject: function (objectID) {
        var dfd = AD.sal.Deferred();

        var appName, moduleName;
        var objName, fullName;
        var pages = [];
        var columns = [];

        //var modelsPath = sails.config.paths.models;
        var modelsPath = path.join('api', 'models'); // in the submodule

        var fullPath, fullPathTrans, clientPath, baseClientPath;
        var cwd = process.cwd();

        importDataFields();

        async.series([
            // Find object info
            function (next) {
                ABObject.find({ id: objectID })
                    .populate('columns')
                    .populate('application')
                    .then(function (list) {
                        var obj = list[0];
                        if (!obj) throw new Error('invalid object id');
                        if (obj.isImported) {
                            // Imported objects should not be synced to the server
                            next('IMPORTED OBJECT');
                            return null;
                        }

                        // Only numbers and alphabets will be used
                        appName = AppBuilder.rules.toApplicationNameFormat(obj.application.name);
                        moduleName = appName.toLowerCase();

                        objName = AppBuilder.rules.nameFilter(obj.name);
                        columns = obj.columns;
                        fullName = AppBuilder.rules.toObjectNameFormat(appName, objName);

                        fullPath = path.join(modelsPath, fullName) + '.js';
                        fullPathTrans = path.join(modelsPath, fullName) + 'Trans.js';
                        clientPath = path.join('assets', 'opstools', appName, 'models', fullName + '.js');
                        baseClientPath = path.join('assets', 'opstools', appName, 'models', 'base', fullName + '.js');

                        next();
                        return null;
                    })
                    .catch(function (err) {
                        next(err);
                    });
            },

            // Delete old model definition files
            function (next) {
                process.chdir(path.join('node_modules', moduleName)); // sails/node_modules/ab_{appName}/
                async.each([fullPath, fullPathTrans, clientPath, baseClientPath], function (target, ok) {
                    // Delete file if it exists
                    fs.unlink(target, function (err) {
                        // Ignore errors. If file does not exist, that's fine.
                        ok();
                    });
                }, function (err) {
                    next();
                });
            },

            // Generate model definitions with appdev-cli
            function (next) {
                var cliParams = [
                    'resource', // appdev-cli command
                    path.join('opstools', appName), // client side location
                    fullName, // server side location
                    'connection:appBuilder', // Sails connection name
                    'tablename:' + fullName.toLowerCase(),
                    'preventNull:true'
                ];

                async.series([
                    // Define columns
                    function (callback) {
                        async.eachSeries(columns, function (col, ok) {

                            var colString = '',
                                isDefinedLabel = false,
                                field = DataFields[col.fieldName];

                            if (!field) {
                                ok('System could not found this field type: ' + col.fieldName);
                                return;
                            }

                            field.getFieldString(col)
                                .fail(ok)
                                .then(function (colStr) {
                                    colString = colStr;

                                    if (!isDefinedLabel &&
                                        ((colString.indexOf(':string:') > -1)
                                            || (colString.indexOf(':text:') > -1))) {

                                        colString += ':label';
                                        isDefinedLabel = true;
                                    }

                                    cliParams.push(colString);

                                    ok();
                                })

                            // if (col.linkObject && col.linkVia) {
                            //     ABColumn.findOne({ id: col.id })
                            //         .populate('linkObject')
                            //         .populate('linkVia')
                            //         .fail(ok)
                            //         .then(function (linkedCol) {
                            //             colString += linkedCol.name;
                            //             colString += ':' + linkedCol.linkType; // model, collection
                            //             colString += ':' + AppBuilder.rules.toObjectNameFormat(appName, linkedCol.linkObject.name) // model name

                            //             if (linkedCol.linkVia)
                            //                 colString += ':' + linkedCol.linkVia.name; // viaReference

                            //             cliParams.push(colString);

                            //             ok();
                            //         });
                            // }
                            // else {
                            //     colString += col.name + ':' + col.type;

                            //     if (col.supportMultilingual) {
                            //         colString += ':multilingual';
                            //     }
                            //     // if this field is the Label, then:
                            //     if (!isDefinedLabel && (col.type === 'string' || col.type === 'text')) {
                            //         colString += ':label';
                            //         isDefinedLabel = true;
                            //     }
                            //     cliParams.push(colString);

                            //     ok();
                            // }
                        }, callback);
                    }
                ], function (err) {
                    if (err) {
                        next(err);
                        return;
                    }

                    AD.spawn.command({
                        command: cliCommand,
                        options: cliParams
                    })
                        .fail(next)
                        .done(function () {
                            next();
                        });
                });
            },

            // Patch model definition
            function (next) {
                async.each([fullPath, fullPathTrans], function (target, ok) {
                    fs.readFile(target, 'utf8', function (err, data) {
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
                }, function (err) {
                    next();
                });
            }

        ], function (err) {
            process.chdir(cwd);
            if (err) {
                if (err == 'IMPORTED OBJECT') {
                    // Build was skipped because object was imported.
                    dfd.resolve();
                }
                else dfd.reject(err);
            }
            else dfd.resolve();
        });

        return dfd;
    },


    /**
     * Generate the client side controller for a root page
     *
     * @param integer pageID
     * @return Deferred
     */
    buildPage: function (pageID) {
        var dfd = AD.sal.Deferred();
        var cwd = process.cwd();


        var appID, appName, pageName, pageKey, pagePerms, toolLabel;
        var roles = [];
        var objectIncludes = [];
        var controllerIncludes = [];

        var Application = null;

        var pages = {};
        var modelNames = [];

        async.series([
            // Find basic page info
            function (next) {
                ABPage.find({ id: pageID })
                    .populate('application')
                    .populate('components')
                    .populate('translations')
                    .then(function (list) {
                        if (!list || !list[0]) {
                            var err = new Error('invalid page id');
                            next(err);
                            return;
                        }
                        var page = list[0];
                        if (page.parent > 0) throw new Error('not a root page');

                        appID = page.application.id;
                        appName = AppBuilder.rules.toApplicationNameFormat(page.application.name);
                        pageName = AppBuilder.rules.nameFilter(page.name);
                        toolLabel = pageName;
                        page.translations.some(function (trans) {
                            if (toolLabel == pageName) {
                                toolLabel = trans.label;
                                return true;
                            }
                        })

                        // Only numbers and alphabets will be used
                        Application = page.application;

                        pageKey = ['opstools', appName, pageName].join('.'); // appName.pageName
                        pagePerms = 'adcore.admin,' + pageKey + '.view';

                        controllerIncludes.push({
                            key: 'opstools.' + appName + '.' + pageName,
                            path: 'opstools/' + appName + '/controllers/'
                            + pageName + '.js'
                        });

                        pages[pageID] = page;

                        next();
                        return null;
                    })
                    .catch(function (err) {
                        next(err);
                        return null;
                    });
            },

            // Find assign roles
            function (next) {
                var action_key = Application.actionKeyName(); // 'opstools.' + appName + '.view';

                Permissions.getRolesByActionKey(action_key)
                    .fail(function (err) {
                        next(err);
                        return null;
                    })
                    .then(function (result) {
                        roles = result;

                        next();
                    });
            },

            // Find all sub-pages
            function (next) {
                var pageQueue = [pageID];
                var completed = [];

                async.whilst(
                    function () { return (pageQueue.length > 0) },
                    function (ok) {
                        var pID = pageQueue.pop();
                        ABPage.find()
                            .where({ parent: pID })
                            .populate('components')
                            .then(function (list) {
                                completed.push(pID);
                                if (list && list[0]) {
                                    list.forEach(function (page) {
                                        if (completed.indexOf(page.id) < 0) {
                                            pageQueue.push(page.id);
                                        }
                                        pages[page.id] = page;
                                    });
                                }
                                ok();
                                return null;
                            })
                            .catch(function (err) {
                                ok(err);
                                return null;
                            });
                    },
                    function (err) {
                        if (err) next(err);
                        else next();
                    }
                );

            },

            // // Prepare additional component metadata
            // function (next) {
            //     async.forEachOf(pages, function (page, pageID, pageDone) {
            //         async.each(page.components, function (item, itemDone) {
            //             switch (item.component.toLowerCase()) {
            //                 case 'grid':
            //                     // Add a `columns` property
            //                     item.columns = [];
            //                     if (!Array.isArray(item.setting.columns)) {
            //                         sails.log('Unknown `setting` format:', item.setting);
            //                         itemDone();
            //                         return;
            //                     }
            //                     async.each(item.setting.columns, function (col, colDone) {
            //                         var colID;
            //                         if (typeof col == 'string' || typeof col == 'number') {
            //                             // Old format
            //                             colID = col;
            //                         }
            //                         else if (col.dataId) {
            //                             // New format
            //                             colID = col.dataId;
            //                         }
            //                         else if (col.id && col.id == 'appbuilder_trash') {
            //                             item.columns.push('trash');
            //                             colDone();
            //                             return;
            //                         }
            //                         else {
            //                             sails.log('Unexpected column format:', col);
            //                             colDone();
            //                             return;
            //                         }
            //                         ABColumn.find({ id: colID })
            //                             .populate('object')
            //                             .populate('translations')
            //                             .then(function (list) {
            //                                 if (list && list[0]) {
            //                                     item.modelName = appName + '_' + AppBuilder.rules.nameFilter(list[0].object.name);
            //                                     item.columns.push({
            //                                         id: AppBuilder.rules.nameFilter(list[0].name),
            //                                         header: list[0].translations[0].label
            //                                     });
            //                                 }
            //                                 colDone();
            //                                 return null;
            //                             })
            //                             .catch(function (err) {
            //                                 colDone(err);
            //                                 return null;
            //                             });
            //                     }, function (err) {
            //                         if (err) itemDone(err);
            //                         else itemDone();
            //                     });
            //                     break;

            //                 default:
            //                     itemDone();
            //                     break;
            //             }
            //         }, function (err) {
            //             if (err) pageDone(err);
            //             else pageDone();
            //         });
            //     }, function (err) {
            //         if (err) next(err);
            //         else next();
            //     });
            // },

            // Find related objects
            function (next) {
                ABObject.find({ application: appID })
                    .then(function (list) {
                        for (var i = 0; i < list.length; i++) {
                            var obj = list[i];
                            objectIncludes.push({
                                key: 'opstools.' + appName + '.'
                                + appName + '_' + AppBuilder.rules.nameFilter(obj.name),
                                path: 'opstools/' + appName + '/models/'
                                + appName + '_' + AppBuilder.rules.nameFilter(obj.name) + '.js'
                            });

                            modelNames.push(AppBuilder.rules.nameFilter(obj.name));
                        }
                        next();
                        return null;
                    })
                    .catch(function (err) {
                        next(err);
                        return null;
                    });
            },

            // Generate the client side controller for the app page
            function (next) {
                sails.renderView(path.join('app_builder', 'page_controller'), {
                    layout: false,
                    appId: appID,
                    appName: appName,
                    pageName: pageName,
                    pages: pages,
                    models: modelNames,
                    rootPageID: pageID,
                    domID: function (pid) {
                        pid = pid || '';
                        return 'abpage-' + appName + '-' + pageName + '-' + pid;
                    }
                }, function (err, output) {
                    if (err) next(err);
                    else {
                        fs.writeFile(
                            path.join(
                                'assets', 'opstools', appName,
                                'controllers', pageName + '.js'
                            ),
                            output,
                            function (err) {
                                if (err) next(err);
                                else next();
                            }
                        );
                    }
                });
                /*
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
                    next();
                });
                */
            },

            // Create Page's permission action
            function (next) {
                var page = pages[pageID];
                page.permissionActionKey = pageKey + '.view';
                Permissions.action.create({
                    key: page.permissionActionKey,
                    description: 'Allow the user to view the ' + appName + "'s " + pageName + ' page',
                    language_code: 'en'
                })
                    .always(function () {
                        // If permission action already exists, that's fine.
                        next();
                    });
            },

            // Assign permission actions to assign roles
            function (next) {
                var assignActionTasks = [];

                roles.forEach(function (r) {
                    assignActionTasks.push(function (callback) {
                        Permissions.assignAction(r.id, pageKey + '.view')
                            .fail(function (err) { callback(err); })
                            .then(function () { callback(); });
                    });
                });

                async.parallel(assignActionTasks, function (err) {
                    if (err) {
                        next(err);
                        return null;
                    }

                    next();
                });
            },

            // Create OPView entry
            function (next) {
                OPSPortal.View.createOrUpdate(
                    pageKey,
                    objectIncludes,
                    controllerIncludes
                )
                    .fail(next)
                    .done(function () {
                        next();
                    });
            },

            // create a Tool Definition for the OP Portal Navigation
            function (next) {
                // sails.log('create tool definition')
                var areaName = Application.name;
                var areaKey = Application.areaKey();

                var def = {
                    key: _.kebabCase(pageKey),
                    permissions: pagePerms,
                    icon: 'fa-lock', // TODO: get this from Page Definition.
                    label: toolLabel,
                    // context: pageKey,
                    controller: 'OPView',
                    isController: false,
                    options: { url: '/opsportal/view/' + pageKey },
                    version: '0'
                }
                OPSPortal.NavBar.ToolDefinition.create(def, function (err, toolDef) {

                    next(err);
                })
            },


            // make sure our ToolDefinition is linked to our Area Definition.
            function (next) {
                // sails.log('... todo: link tooldef to area');

                OPSPortal.NavBar.Area.link({
                    keyArea: Application.areaKey(),
                    keyTool: _.kebabCase(pageKey),
                    instance: {
                        icon: 'fa-cube',
                        permissions: pagePerms,
                        options: {
                            is: 'there'
                        }
                    }
                }, function (err) {
                    if (err) {
                        if (err.code == 'E_AREANOTFOUND') {
                            console.log('... Area[' + Application.areaKey() + '] not found.  Move along ... ');
                            // this probably means that they deleted this default area 
                            // using the Navigation Editor.
                            // no problem here:
                            next();
                            return;
                        }
                    }
                    next(err);
                });

            }


        ], function (err) {
            if (err) dfd.reject(err);
            else {
                var page = pages[pageID];

                // save any updates to our page instance.
                page.save(function (err) {
                    // should we pay attention to this error?

                    dfd.resolve({});
                })

            }
        });

        return dfd;
    },
    
    
    
    /**
     * Imports an existing Sails model for use in an AB application.
     * An AB object will be created for that model.
     * New client side model files will be generated for that object.
     *
     * @param integer appID
     * @param string modelName
     * @return Deferred
     *     Resolves with a dictionary of models that were imported, with each
     *     model's matching object ID.
     *     {
     *         <modelName>: <modelID>,
     *         <modelName2>: <modelID2>,
     *         ...
     *     }
     */
    modelToObject: function (appID, modelName) {
        var dfd = AD.sal.Deferred();
        var model = sails.models[modelName.toLowerCase()];
       
        if (!model || !model.definition) {
            dfd.reject(new Error('unrecognized model: ' + modelName));
        }
        else {
            var application, object;
            var appName, moduleName, clientPath;
            var languages = [];
            var columns = [];
            var associations = [];
            var multilingualFields = [];
            
            async.series([
                // Find app in database
                function(next) {
                    ABApplication.find({ id: appID })
                    .exec(function(err, list) {
                        if (err) {
                            next(err);
                        }
                        else if (!list || !list[0]) {
                            next(new Error('application not found: ' + appID));
                        }
                        else {
                            application = list[0];
                            appName = AppBuilder.rules.toApplicationNameFormat(application.name);
                            moduleName = appName.toLowerCase();
                            modelFileName = AppBuilder.rules.toObjectNameFormat(appName, modelName);
                            clientPath = path.join('node_modules', moduleName, 'assets', 'opstools', appName);
                            next();
                        }
                    });
                },
                
                // Create Object in database
                function(next) {
                    Multilingual.model.create({
                        model: ABObject,
                        data: {
                            application: appID,
                            name: modelName,
                            label: modelName,
                            isImported: true
                        }
                    })
                    .fail(next)
                    .done(function(result) {
                        object = result;
                        next();
                    });
                },
                
                // Create Columns in database
                function(next) {
                    async.forEachOfSeries(model.definition, function(col, colName, colDone) {
                       
                        // Skip these columns
                        var ignore = ['id', 'createdAt', 'updatedAt'];
                        if (ignore.indexOf(colName) >= 0) {
                            return colDone();
                        }
                       
                        var defaultValue = col.default;
                        if (typeof col.default == 'function') {
                            defaultValue = col.default();
                        }
                        
                        // For the client side model
                        columns.push({
                            name: colName,
                            type: col.type
                        });
                        
                        var colData = {
                            name: colName,
                            object: object.id,
                            required: col.required,
                            unique: col.unique
                        };
                        
                        var typeMap = {
                            integer: 'number',
                            float: 'number',
                            datetime: 'date',
                        };
                        var fieldType = typeMap[col.type] || col.type;
                        
                        // Special case for float type
                        if (col.type == 'float') {
                            fieldType = 'number';
                            colData.type = 'float';
                        }
                        
                        ABColumn.createColumn(fieldType, colData)
                        .fail(colDone)
                        .done(function(column) {
                            colDone();
                        });
                       
                    }, function(err) {
                        if (err) next(err);
                        else next();
                    });
                },
                
                // Create associations in database
                function(next) {
                    /*
                        model.associations == [
                            {
                                alias: 'assoc name 1',
                                type: 'collection',
                                collection: 'model name',
                                via: 'column name'
                            },
                            {
                                alias: 'assoc name 2',
                                type: 'object',
                                model: 'model name'
                            }
                        ]
                    */
                    
                    async.forEach(model.associations, function(assoc, assocDone) {
                        
                        // Multilingual translations aren't treated like normal
                        // associations. The associated text fields will be
                        // created as local multilingual columns later.
                        if (assoc.alias == 'translations' && assoc.type == 'collection') {
                            var transModelName = assoc.collection.toLowerCase();
                            var transModel = sails.models[transModelName];
                            for (var colName in transModel.definition) {
                                var col = transModel.definition[colName];
                                if (_.contains(['string', 'text'], col.type)) {
                                    // For later steps
                                    multilingualFields.push({
                                        name: colName,
                                        type: col.type
                                    });
                                }
                            }
                            assocDone();
                            return;
                        }
                        
                        // For the client side model
                        associations.push({
                            name: assoc.alias,
                            model: assoc.collection || assoc.model
                        });
                        
                        var targetLinkName, targetRelation, targetModelName;
                        
                        if (assoc.type == 'model') {
                            targetRelation = 'one';
                            targetModelName = assoc.model;
                        } else {
                            targetRelation = 'many';
                            targetModelName = assoc.collection;
                        }
                        
                        var targetModel = sails.models[targetModelName];
                        var sourceRelation = 'one';
                        if (Array.isArray(targetModel.associations)) {
                            targetModel.associations.forEach(function(targetModelAssoc) {
                                if (targetModelAssoc.collection == modelName.toLowerCase()) {
                                    sourceRelation = 'many';
                                    targetLinkName = targetModelAssoc.alias;
                                }
                                else if (targetModelAssoc.model == modelName.toLowerCase()) {
                                    targetLinkName = targetModelAssoc.alias;
                                }
                            });
                        }
                        
                        // Look for target object within AppBuilder
                        ABObject.find({ and: [
                            { name: targetModelName },
                            { application: appID }
                        ])
                        .exec(function(err, list) {
                            if (err) {
                                assocNext(err);
                            }
                            else if (!list || !list[0]) {
                                // Target model has not been imported into 
                                // this AppBuilder app
                                return assocDone();
                            }
                            else {
                                // Target model already in AppBuilder.
                                // Create connection links now.
                                ABColumn.createLink({
                                    name: assoc.alias,
                                    sourceObjectID: object.id,
                                    targetObjectID: list[0].id,
                                    sourceRelation: sourceRelation,
                                    targetRelation: targetRelation,
                                    targetName: targetLinkName
                                })
                                .fail(assocDone)
                                .done(function(sourceColumn, targetColumn) {
                                    assocDone();
                                });
                            }
                        });
                            
                    }, function(err) {
                        if (err) next(err);
                        else next();
                    });
                },
                
                // Create multilingual columns
                // (these were from the 'translations' association earlier)
                function(next) {
                    async.forEach(multilingualFields, function(col, colDone) {
                        ABColumn.createColumn(col.type, {
                            name: col.name,
                            object: object.id,
                            setting: {
                                supportMultilingual: '1'
                            }
                        })
                        .fail(colDone)
                        .done(function(result) {
                            colDone();
                        });
                    }, function(err) {
                        if (err) next(err);
                        else next();
                    });
                },
                
                // Create client side models
                function(next) {
                    var fieldLabel = 'id';
                    for (var colName in model.definition) {
                        var column = model.definition[colName];
                        if (fieldLabel != 'id') continue;
                        if (column.type == 'string' || column.type == 'text') {
                            fieldLabel = colName;
                        }
                    }
                    
                    // Determine the model blueprints base URL
                    var controllerInfo = _.find(sails.controllers, function(c) {
                        // 1st try: look for `model` config in the controllers
                        if (c._config && c._config.model == modelName.toLowerCase()) return true;
                        return false;
                    });
                    if (!controllerInfo) {
                        // 2nd try: look for matching controller-model name
                        controllerInfo = _.find(sails.controllers, function(c) {
                            var nameParts = c.identitiy.split('/');
                            var finalName = nameParts[ nameParts.length-1 ];
                            if (finalName == modelName.toLowerCase()) return true;
                            return false;
                        });                    
                    }
                    var modelURL = controllerInfo.identity;
                    
                    sails.renderView(path.join('app_builder', 'clientModelBase'), {
                        layout: false,
                        appName: appName,
                        objectName: modelName,
                        fieldLabel: fieldLabel,
                        modelURL: modelURL,
                        columns: columns,
                        associations: associations,
                        multilingualFields: multilingualFields,
                        
                    }, function (err, output) {
                        if (err) next(err);
                        else {
                            var dest = path.join(clientPath, 'models', 'base', modelName) + '.js';
                            fs.writeFile(dest, output, function(err) {
                                if (err) next(err);
                                else next();
                            });
                        }
                    });
                },
                function(next) {
                    sails.renderView(path.join('app_builder', 'clientModel'), {
                        layout: false,
                        appName: appName,
                        objectName: modelName,
                        
                    }, function (err, output) {
                        if (err) next(err);
                        else {
                            var dest = path.join(clientPath, 'models', modelName) + '.js';
                            fs.writeFile(dest, output, function(err) {
                                if (err) next(err);
                                else next();
                            });
                        }
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