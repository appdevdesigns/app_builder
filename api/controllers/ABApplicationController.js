/**
 * ABApplicationController
 *
 * @description :: Server-side logic for managing Abapplications
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var AD = require('ad-utils');
var fs = require('fs');
var _ = require('lodash');
var reloading = null;

module.exports = {

    _config: {
        model: "abapplication", // all lowercase model name
        actions: false,
        shortcuts: false,
        rest: true
    },
    
    
    /**
     * Not used
     *
     * GET /app_builder/requirements
     */
    requirements: function(req, res) {
        res.set('content-type', 'application/javascript');
        
        var output = '';
        
        ABApplication.find()
        .then(function(list) {
            for (var i=0; i<list.length; i++) {
                output += 'System.import("opstools/AB_' + list[i].name + '");\n';
            }
            res.send(output);
            return null;
        })
        .catch(function(err) {
            res.AD.error(err);
            return null;
        });
        
    },
    
    
    /**
     * Generate the server side folder structure for an application.
     *
     * Objects and Pages are not generated.
     * Reloading the ORM is also needed to complete the activation.
     *
     * POST /app_builder/prepareApp/:id
     */
    prepare: function(req, res) {
        var appID = req.param('id');
        
        AppBuilder.buildApplication(appID)
        .fail(function(err) {
            res.AD.error(err);
        })
        .done(function() {
            res.AD.success({});
        });
    },
    
    
    /**
     * POST /app_builder/reloadORM/:id
     *
     */
    reloadORM: function(req, res) {
        var appID = req.param('id');

        if (!appID) {
            res.AD.error('Application ID is not defined.');
            return;
        }

        if (reloading && reloading.state() == 'pending') {
            reloading.always(function() {
                // Wait until current reload is finished before starting
                self.reloadORM(req, res);
            });
            return;
        }
        reloading = AD.sal.Deferred();
        
        AppBuilder.reload(appID)
        .fail(function(err) {
            res.AD.error(err);
            reloading.reject(err);
        })
        .done(function() {
            res.AD.success({});
            reloading.resolve();
        });
    },
    
    
    /**
     * Generate the server side model definitions of a given AB application
     * and then reload the ORM.
     *
     * POST /app_builder/fullReload/:id
     */
    fullReload: function(req, res) {
        var self = this,
            appID = req.param('id');

        if (!appID) {
            res.AD.error('Application ID is not defined.');
            return;
        }

        if (reloading && reloading.state() == 'pending') {
            reloading.always(function() {
                // Wait until current reload is finished before starting
                self.fullReload(req, res);
            });
            return;
        }
        reloading = AD.sal.Deferred();
        
        var appIDs = [],
            objIDs = [],
            pageIDs = [];

        async.series([
            // Find the application info
            function(next) {
                ABApplication.find({ id : appID })
                .populate('objects')
                .then(function(list) {
                    if (!list || !list[0]) {
                        throw new Error('No application found');
                    }
                    
                    for (var i=0; i<list.length; i++) {
                        appIDs.push(list[i].id);
                        for (var j=0; j<list[i].objects.length; j++) {
                            objIDs.push( list[i].objects[j].id );
                        }
                    }
                    objIDs.sort(function(a, b) {
                        return parseInt(a) - parseInt(b);
                    });
                    
                    next();
                    return null;
                })
                .catch(function(err) {
                    next(err);
                    return null;
                });
            },
            
            // Create model definitions for each AB Object
            function(next) {
                async.eachSeries(objIDs, function(id, ok) {
                    AppBuilder.buildObject(id)
                    .fail(ok)
                    .done(function() {
                        ok();
                    });
                }, function(err) {
                    if (err) next(err);
                    else next();
                });
            },
            
            // Find all AB root Pages
            function(next) {
                ABPage.find({ parent: null, application: appID })
                .then(function(list) {
                    if (list && list[0]) {
                        for (var i=0; i<list.length; i++) {
                            pageIDs.push( list[i].id );
                        }
                    }
                    next();
                    return null;
                })
                .catch(function(err) {
                    next(err);
                    return null;
                });
            },
            
            // Reload ORM
            function(next) {
                AppBuilder.reload(appID)
                .fail(next)
                .done(function() {
                    next();
                });
            },

            // Set columns are synced
            function(next) {
                ABObject.find({ application : appID })
                    .then(function(list) {
                        var updateTasks = [];
                        
                        list.forEach(function(object) {
                            updateTasks.push(function(ok) {
                                ABColumn.update({ object: object.id }, { isSynced: true }).exec(ok);
                            });
                        });

                        async.parallel(updateTasks, next);
                    });
            },
            
            
        ], function(err) {
            if (err) {
                console.error(err);
                res.AD.error(err);
                reloading.reject(err);
            } else {
                res.AD.success({});
                reloading.resolve();
            }
        });
    },
    
    
    /**
     * GET /app_builder/appJSON/:id?download=1
     * 
     * Export an app in JSON format
     */
    jsonExport: function(req, res) {
        var appID = req.param('id');
        var forDownload = req.param('download');
        
        AppBuilderExport.appToJSON(appID)
        .fail(function(err) {
            res.AD.error(err);
        })
        .done(function(data) {
            if (forDownload) {
                res.set('Content-Disposition', 'attachment; filename="app.json"');
            }
            res.json(data);
        });
    },
    
    
    /**
     * POST /app_builder/appJSON
     *
     * Import an app from uploaded JSON data file.
     *
     * The file is expected to be uploaded via the Webix uploader widget.
     */
    jsonImport: function(req, res) {
        req.file('upload').upload(function(err, files) {
            if (err) {
                console.log('jsonImport upload error', err);
                res.send({ status: 'error' });
                //res.AD.error(err);
            }
            else if (!files || !files[0]) {
                //res.AD.error(new Error('No file was uploaded'));
                res.send({ status: 'error' });
            }
            else {
                fs.readFile(files[0].fd, function(err, data) {
                    if (err) {
                        console.log('jsonImport read error', err);
                        res.send({ status: 'error' });
                        //res.AD.error(err);
                    }
                    else {
                        try {
                            var jsonData = JSON.parse(data.toString());
                            AppBuilderExport.appFromJSON(jsonData)
                            .fail(function(err) {
                                console.log('jsonImport import error', err);
                                res.send({ status: 'error' });
                                //res.AD.error(err);
                            })
                            .done(function() {
                                res.send({ status: "server" });
                            });
                        } catch (err) {
                            console.log('jsonImport parse error', err);
                            res.send({ status: 'error' });
                            //res.AD.error(err);
                        }
                    }
                });
            }
        });
    },
    
    
    // GET /app_builder/application/:appID/findModels
    findModels: function (req, res) {
        var appID = req.param('appID');
        var result = [];
        var application, appName;
        var appModels = [];
        
        async.series([
            // Find application
            function(next) {
                ABApplication.find({ id: appID })
                .exec(function(err, list) {
                    if (err) next(err);
                    else if (!list || !list[0]) {
                        next(new Error('Application not found: ' + appID));
                    }
                    else {
                        application = list[0];
                        appName = AppBuilder.rules.toApplicationNameFormat(application.name);
                        next();
                    }
                });
            },
            
            // Find all objects within this application
            function(next) {
                ABObject.find()
                .where({ application: appID })
                .exec(function(err, list) {
                    if (err) next(err);
                    else {
                        list = list || [];
                        // Make a list of model names from objects within
                        // this application.
                        appModels = _.map(list, function(o) {
                            var name;
                            if (o.isImported) name = o.name;
                            else name = AppBuilder.rules.toObjectNameFormat(appName, o.name);
                            return name.toLowerCase();
                        });
                        next();
                    }
                });
            },
            
            function(next) {
                // Result is all the sails models that are not currently in
                // this application.
                var sailsModels = Object.keys(sails.models);
                result = _.difference(sailsModels, appModels);
                next();
            }
        
        ], function(err) {
            if (err) res.AD.error(err);
            else res.AD.success(result);
        });
    },
    
    
    // POST /app_builder/application/:appID/importModel
    importModel: function (req, res) {
        var appID = req.param('appID');
        var modelName = req.param('model') || '';
        
        AppBuilder.modelToObject(appID, modelName)
        .fail(function(err) {
            res.AD.error(err);
        })
        .done(function(object) {
            res.AD.success(object);
        });
    
    }
    
	
};

