/**
 * ABApplicationController
 *
 * @description :: Server-side logic for managing Abapplications
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var AD = require('ad-utils');
var reloading = null;

module.exports = {

    _config: {
        model: "abapplication", // all lowercase model name
        actions: false,
        shortcuts: false,
        rest: true
    },
    
    
    /**
     * Generate the server side model definitions of all objects
     * in an application.
     *
     * Reloading the ORM is still needed to complete the activation.
     *
     * POST /app_builder/prepareApp/:id
     */
    prepare: function(req, res) {
        var appID = req.param('id');
        
        ABApplication.find({ id: appID })
        .populate('object')
        .then(function(list) {
            if (!list || !list[0]) {
                throw new Error('No matches for app id');
            }
            async.eachSeries(list[0].object, function(obj, next) {
                AppBuilder.objectToModel(obj.id)
                .fail(next)
                .done(function() {
                    next();
                });
            }, function(err) {
                if (err) throw err;
                else {
                    res.AD.success({});
                }
            });
            return null;
        })
        .catch(function(err) {
            console.log(err);
            res.AD.error(err);
        });
    },
    
    
    /**
     * POST /app_builder/reloadORM
     *
     */
    reloadORM: function(req, res) {
        if (reloading && reloading.state() == 'pending') {
            reloading.always(function() {
                // Wait until current reload is finished before starting
                self.reloadORM(req, res);
            });
            return;
        }
        reloading = AD.sal.Deferred();
        
        AppBuilder.reload()
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
     * Generate the server side model definitions of all AB applications
     * and then reload the ORM.
     *
     * POST /app_builder/fullReload
     */
    fullReload: function(req, res) {
        var self = this;
        if (reloading && reloading.state() == 'pending') {
            reloading.always(function() {
                // Wait until current reload is finished before starting
                self.fullReload(req, res);
            });
            return;
        }
        reloading = AD.sal.Deferred();
        
        var objIDs = [];
        
        async.series([
            // Find all AB Objects
            function(next) {
                ABApplication.find()
                .populate('object')
                .then(function(list) {
                    if (!list || !list[0]) {
                        throw new Error('No applications found');
                    }
                    for (var i=0; i<list.length; i++) {
                        for (var j=0; j<list[i].object.length; j++) {
                            objIDs.push( list[i].object[j].id );
                        }
                    }
                    next();
                    return null;
                })
                .catch(function(err) {
                    next(err);
                });
            },
            
            // Create model definitions for each AB Object
            function(next) {
                async.eachSeries(objIDs, function(id, ok) {
                    AppBuilder.objectToModel(id)
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
                AppBuilder.reload()
                .fail(next)
                .done(function() {
                    next();
                });
            }
            
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
    }
	
};

