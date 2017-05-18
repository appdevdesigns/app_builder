/**
 * ABMigrationController
 *
 * @description :: Server-side logic for managing updating the table & column information 
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var AD = require('ad-utils');
var _ = require('lodash');
var path = require('path');
var async = require('async');


var reloading = null;

module.exports = {

    
    /**
     * Not used
     *
     * post app_builder/migrate/application/:appID/object/:objID
     */
    createObject: function(req, res) {
        res.set('content-type', 'application/javascript');
        

        var appID = req.param('appID', -1);
        var objID = req.param('objID', -1);


console.log('... appID:'+appID);
console.log('... objID:'+objID);

        // Verify input params are valid:
        var invalidError = null;

        if (appID == -1) {
            invalidError = ADCore.error.fromKey('E_MISSINGPARAM');
            invalidError.details = 'missing application.id';
        } else if (objID == -1) {
            invalidError = ADCore.error.fromKey('E_MISSINGPARAM');
            invalidError.details = 'missing object.id';
        }
        if(invalidError) {
            res.AD.error(invalidError, 400);
            return;
        }
        


        ABApplication.findOne({id: appID})
        .then(function(app) {

            if( app ) {

                var Application = app.toABClass();
                var object = Application.objects((o) => { return o.id == objID; })[0];

                if (object) {

//// LEFT OFF HERE:
// do we create a server side OP.*  ?
// implement ABFieldManager & ABDataFields

                    ABMigration.createObject(object)
                    .then(function(){

res.AD.success({good:'job'});

                    })
                    .catch(function(err){
                        ADCore.error.log('ABApplication.findOne() failed:', { error:err, id:appID });
                        res.AD.error(err, 500);
                    })


                } else {

// error: object not found!
                    var err = ADCore.error.fromKey('E_NOTFOUND');
                    err.message = "Object not found.";
                    err.objid = objID;
                    res.AD.error(err, 404);
                }
            } else {

// error: app not found
                    var err = ADCore.error.fromKey('E_NOTFOUND');
                    err.message = "Application not found.";
                    err.appID = appID;
                    res.AD.error(err, 404);
            }

        })
        .catch(function(err) {
            ADCore.error.log('ABApplication.findOne() failed:', { error:err, message:err.message, id:appID });
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


    // get /app_builder/reloadStatus 
    reloadStatus: function(req, res) {

        if (reloading && reloading.state() == 'pending') {
            res.AD.success({state:'pending'});
        } else {
            res.AD.success({state:'done'});
        }
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
console.log('*** !!! Run full reload again');
            reloading.always(function() {
                // Wait until current reload is finished before starting
                self.fullReload(req, res);
            });
            return;
        }
        reloading = AD.sal.Deferred();
        
        var appIDs = [],
            objIDs = [];

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


            // Make sure our build directory is ready: 
            function(next) {
              
                AppBuilder.buildDirectory.ready()
                .fail(next)
                .done(function(){
                    next();
                })

            },


            // Remove any current Model links in our new sails build directory
            function(next) {

                // fs.readdir() for each target:
                var pathModelDir = path.join(AppBuilder.paths.sailsBuildDir(), 'api', 'models');
                fs.readdir(pathModelDir, function(err, files){
                    if (err) {
                        ADCore.error.log('Unable to read from sailsBuildDir.api.models directory:', {error:err});
                        next(err);
                    } else {

                        function unlinkIt(list, ok) {
                            if (list.length == 0) {
                                ok();
                            } else {
                                var target = list.shift();
                                fs.unlink(path.join(pathModelDir, target), function (err) {
                                    // Ignore errors. If file does not exist, that's fine.
                                    unlinkIt(list, ok);
                                });
                            }
                        }
                        unlinkIt(files, next);
                    }
                })
                    

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

            // Reload ORM
            function(next) {
                AppBuilder.reload(appID)
                .fail(function(err){

                    ADCore.error.log("Error during the Reload Process", { 
                        error: err, 
                        appID:appID,
                        message:err.message, 
                        stack:err.stack,
                        user:req.AD.user().GUID()
                    });

                    next(err);
                })
                .done(function() {
                    next();
                });
            },

            // Update columns are synced
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
                reloading.reject(err);
            } else {
                reloading.resolve();
            }
        });

        res.AD.success({});
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
                                res.send({ 
                                    status: 'error',
                                    message: err.message,
                                    error: err
                                });
                                //res.AD.error(err);
                            })
                            .done(function() {
                                res.send({ status: "server" });
                            });
                        } catch (err) {
                            console.log('jsonImport parse error', err);
                             res.send({ 
                                status: 'error',
                                message: 'json parse error',
                                error: err,
                            });
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
                result = _.map(result, function(r) {
                    return { 
                        objectId: null,
                        modelName: r
                    };
                });

                next();
            },

            // Get object id to model
            function (next) {
                ABObject.find({ application: { '!': appID }, isImported: { '!': 1 } })
                    .populate('application')
                    .exec(function (err, list) {
                        list.forEach(function (obj) {
                            var appName = AppBuilder.rules.toApplicationNameFormat(obj.application.name);
                            var objModelName = AppBuilder.rules.toObjectNameFormat(appName, obj.name).toLowerCase();

                            // Populate object id to models
                            for (var i = 0; i < result.length; i++) {
                                if (result[i].modelName == objModelName) {
                                    result[i].objectId = obj.id;
                                }
                            }

                        });

                        next();
                    });
            }
        
        ], function(err) {
            if (err) res.AD.error(err);
            else res.AD.success(result);
        });
    },
    
    
    // POST /app_builder/application/:appID/importModel
    importModel: function (req, res) {
        var appID = req.param('appID');
        var modelObjectId = req.param('objectID') || '';
        var modelName = req.param('model') || '';
        var columns = req.param('columns') || [];
        
        AppBuilder.modelToObject(appID, modelObjectId, modelName, columns)
        .fail(function(err) {
            res.AD.error(err);
        })
        .done(function(object) {
            res.AD.success(object);
        });
    
    },

    // GET /app_builder/application/findModelAttributes
    findModelAttributes: function(req, res) {
        var modelName = req.param('model') || '';

        AppBuilder.findModelAttributes(modelName)
        .fail(function(err) {
            res.AD.error(err);
        })
        .done(function(columns) {
            res.AD.success(columns);
        });
    }
    
	
};



