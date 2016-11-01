/**
 * Import and export AppBuilder apps.
 */

var fs = require('fs');
var path = require('path');
var AD = require('ad-utils');


module.exports = {
    
    appToJSON: function(appID) {
        var dfd = AD.sal.Deferred();
        var data = {
            app: {},
            objects: [],
            pages: [],
            columns: [],
            lists: [],
            components: []
        };
        
        var objectIDs = [];
        var pageIDs = [];
        
        async.series([
            function(next) {
                ABApplication.find({ id: appID })
                .populate('translations')
                .exec(function(err, list) {
                    if (err) next(err);
                    else if (!list || !list[0]) {
                        next(new Error('No match for app ID ' + appID));
                    }
                    else {
                        data.app = list[0];
                        next();
                    }
                });
            },
            
            function(next) {
                ABObject.find({ application: appID })
                .populate('translations')
                .sort('id')
                .exec(function(err, list) {
                    if (err) next(err);
                    else if (!list || !list[0]) {
                        next();
                    }
                    else {
                        data.objects = list;
                        list.forEach(function(obj) {
                            objectIDs.push(obj.id);
                        });
                        next();
                    }
                });
            },
            
            function(next) {
                ABColumn.find({ object: objectIDs })
                .populate('translations')
                .sort('id')
                .exec(function(err, list) {
                    if (err) next(err);
                    else if (!list || !list[0]) {
                        next();
                    }
                    else {
                        data.columns = list;
                        next();
                    }
                });
            },
            
            function(next) {
                var columnIDs = [];
                data.columns.forEach(function(col) {
                    columnIDs.push(col.id);
                });
                ABList.find({ column: columnIDs })
                .sort('id')
                .exec(function(err, list) {
                    if (err) next(err);
                    else if (!list || !list[0]) {
                        next();
                    }
                    else {
                        data.lists = list;
                        next();
                    }
                });
            },
            
            function(next) {
                ABPage.find({ application: appID })
                .populate('translations')
                .sort('id')
                .exec(function(err, list) {
                    if (err) next(err);
                    else if (!list || !list[0]) {
                        next();
                    }
                    else {
                        data.pages = list;
                        list.forEach(function(p) {
                            pageIDs.push(p.id);
                        });
                        next();
                    }
                });
            },
            
            function(next) {
                ABPageComponent.find({ page: pageIDs })
                .sort('id')
                .exec(function(err, list) {
                    if (err) next(err);
                    else if (!list || !list[0]) {
                        next();
                    }
                    else {
                        data.components = list;
                        next();
                    }
                });
            }
        
        ], function(err) {
            if (err) {
                dfd.reject(err);
            } else {
                dfd.resolve(data);
            }
        });
        
        return dfd;
    },
    
    
    
    appFromJSON: function(data) {
        var dfd = AD.sal.Deferred();
        
        // This will hold the new application ID assigned by the database after
        // the entry is created.
        var appID;
        
        var appName;
        
        // This will map the old object IDs to the new IDs assigned by the
        // database.
        var objIDs = {
        /*
            oldID: newID,
            ...
        */
        };
        
        var colIDs = {
        /*
            oldID: newID,
            ...
        */
        };
        
        var pageIDs = {
        /*
            oldID: newID,
            ...
        */
        };
        
        // Some columns reference other columns via settings.linkVia.
        // These will need to be remapped in a 2nd pass.
        var columnsNeedRemap = [];
        
        
        async.series([
            // Find unique app name
            function(next) {
                appName = data.app.name;
                if (!appName) {
                    next(new Error('No app name given'));
                    return;
                }
                
                async.during(
                    // Condition test
                    function(done) {
                        // Check if the given name is already being used
                        ABApplication.find({ name: appName })
                        .exec(function(err, list) {
                            if (err) {
                                sails.log(err);
                                // Error. Abort.
                                done(err);
                            }
                            else if (list && list[0]) {
                                // Already being used. Keep trying.
                                done(null, true);
                            }
                            else {
                                // Success
                                done(null, false);
                            }
                        });
                    },
                    // Loop
                    function(tryAgain) {
                        // Increment the number at the end of the name
                        var match = appName.match(/^(.+?)_?(\d+)?$/);
                        if (!match) {
                            throw new Error('bad name?');
                        }
                        var base = match[1];
                        var count = parseInt(match[2]);
                        if (count) {
                            appName = base + '_' + (count+1);
                        } else {
                            appName = base + '_1';
                        }
                        tryAgain();
                    },
                    // Completion
                    function(err) {
                        if (err) next(err);
                        else next();
                    }
                );
            },
            
            // Create app
            function(next) {
                var appData = {
                    name: appName,
                    role: data.app.role,
                };
                ABApplication.create(appData)
                .exec(function(err, result) {
                    if (err) next(err);
                    else {
                        appID = result.id;
                        next();
                    }
                });
            },
            
            // App translations
            function(next) {
                async.each(data.app.translations, function(trans, transDone) {
                    var transData = {
                        abapplication: appID,
                        label: trans.label,
                        description: trans.description,
                        language_code: trans.language_code
                    }
                    ABApplicationTrans.create(transData)
                    .exec(function(err, result) {
                        if (err) transDone(err);
                        else {
                            transDone();
                        }
                    });
                }, function(err) {
                    if (err) next(err);
                    else {
                        next();
                    }
                });
            },
            
            // Create objects
            function(next) {
                async.each(data.objects, function(obj, objDone) {
                    var oldID = obj.id;
                    var objData = {
                        application: appID,
                        name: obj.name,
                        labelFormat: obj.labelFormat,
                    };
                    ABObject.create(objData)
                    .exec(function(err, result) {
                        if (err) objDone(err);
                        else {
                            console.log('Object created');
                            console.log(result);
                            var newID = result.id;
                            objIDs[ oldID ] = newID;
                            
                            // Object translations
                            async.each(obj.translations, function(trans, transDone) {
                                var transData = {
                                    abobject: newID,
                                    label: trans.label,
                                    language_code: trans.language_code,
                                };
                                ABObjectTrans.create(transData)
                                .exec(function(err, result) {
                                    if (err) transDone(err);
                                    else {
                                        transDone();
                                    }
                                });
                            }, function(err) {
                                if (err) objDone(err);
                                else {
                                    objDone();
                                }
                            });
                        }
                    });
                }, function(err) {
                    if (err) next(err);
                    else {
                        next();
                    }
                });
            },
            
            // Create columns
            function(next) {
                async.each(data.columns, function(col, colDone) {
                    var oldObjID = col.object;
                    var oldColID = col.id;
                    
                    var setting = col.setting;
                    if (setting) {
                        // Application name is duplicated here. Make sure it
                        // uses the adjusted name.
                        setting.appName = appName;
                        
                        // Remap the linked object IDs
                        var oldLinkObject = setting.linkObject;
                        if (oldLinkObject) {
                            var newLinkObject = objIDs[oldLinkObject];
                            if (!newLinkObject) {
                                sails.log('Warning! Unable to remap object id in column setting.linkObject', col.setting);
                            }
                            setting.linkObject = newLinkObject;
                        }
                    }
                    
                    var colData = {
                        object: objIDs[oldObjID],
                        name: col.name,
                        fieldName: col.fieldName,
                        type: col.type,
                        weight: col.weight,
                        required: col.required,
                        unique: col.unique,
                        setting: setting,
                        linkType: col.linkType,
                        linkVia: col.linkVia,
                        linkDefault: col.linkDefault,
                        supportMultilingual: col.supportMultilingual
                    };
                    ABColumn.create(colData)
                    .exec(function(err, result) {
                        if (err) colDone(err);
                        else {
                            var newID = result.id;
                            colIDs[ oldColID ] = newID;
                            
                            // If this column references another column's ID,
                            // that ID will need to be remapped later.
                            if (setting.linkVia) {
                                columnsNeedRemap.push(newID);
                            }
                            
                            
                            // Column translations
                            async.each(col.translations, function(trans, transDone) {
                                var transData = {
                                    abcolumn: newID,
                                    label: trans.label,
                                    language_code: trans.language_code,
                                };
                                ABColumnTrans.create(transData)
                                .exec(function(err, result) {
                                    if (err) transDone(err);
                                    else {
                                        transDone();
                                    }
                                });
                            }, function(err) {
                                if (err) colDone(err);
                                else {
                                    colDone();
                                }
                            });
                        }
                    });
                
                }, function(err) {
                    if (err) next(err);
                    else {
                        next();
                    }
                });
            },
            
            // Remap column linkVia ID references
            function(next) {
                async.each(columnsNeedRemap, function(colID, colDone) {
                    
                    ABColumn.findOne({ id: colID })
                    .exec(function(err, result) {
                        if (err) colDone(err);
                        else if (!result) {
                            colDone(new Error('Column not found: ' + colID));
                        }
                        else {
                            var oldLinkVia = result.setting.linkVia;
                            var newLinkVia = colIDs[oldLinkVia];
                            result.setting.linkVia = newLinkVia;
                            ABColumn.update({ id: colID }, result)
                            .exec(function(err) {
                                if (err) colDone(err);
                                else {
                                    colDone();
                                }
                            });
                        }
                    });
                
                }, function(err) {
                    if (err) next(err);
                    else {
                        next();
                    }
                });
            },
            
            // Column list items
            function(next) {
                async.each(data.lists, function(list, listDone) {
                    var listData = {
                        column: colIDs[list.column],
                        key: list.key,
                        value: list.value,
                    };
                    ABList.create(listData)
                    .exec(function(err, result) {
                        if (err) listDone(err);
                        else {
                            listDone();
                        }
                    });
                }, function(err) {
                    if (err) next(err);
                    else {
                        next();
                    }
                });
            },
            
            // Create pages
            function(next) {
                async.each(data.pages, function(page, pageDone) {
                    var oldPageID = page.id;
                    var parentPageID = null;
                    if (page.parent && pageIDs[page.parent]) {
                        parentPageID = pageIDs[page.parent];
                    }
                    var pageData = {
                        application: appID,
                        name: page.name,
                        parent: parentPageID,
                        permissionActionKey: page.permissionActionKey,
                    };
                    ABPage.create(pageData)
                    .exec(function(err, result) {
                        if (err) pageDone(err);
                        else {
                            var newPageID = result.id;
                            pageIDs[oldPageID] = newPageID;
                            
                            // Page translations
                            async.each(page.translations, function(trans, transDone) {
                                var transData = {
                                    abpage: newPageID,
                                    label: trans.label,
                                    language_code: trans.language_code,
                                };
                                ABPageTrans.create(transData)
                                .exec(function(err, result) {
                                    if (err) transDone(err);
                                    else {
                                        transDone();
                                    }
                                });
                            }, function(err) {
                                if (err) pageDone(err);
                                else {
                                    pageDone();
                                }
                            });
                        }
                    });
                
                }, function(err) {
                    if (err) next(err);
                    else {
                        next();
                    }
                });
            },
            
            // Page components
            function(next) {
                async.each(data.components, function(comp, compDone) {
                    var compData = {
                        page: pageIDs[ comp.page ],
                        component: comp.component,
                        weight: comp.weight,
                        setting: comp.setting,
                    };
                    ABPageComponent.create(compData)
                    .exec(function(err, result) {
                        if (err) compDone(err);
                        else {
                            compDone();
                        }
                    });
                }, function(err) {
                    if (err) next(err);
                    else {
                        next();
                    }
                });
            }
            
        ], function(err) {
            if (err) {
                dfd.reject(err);
            } else {
                dfd.resolve();
            }
        });
        
        return dfd;
    },
    
};