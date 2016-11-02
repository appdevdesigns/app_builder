/**
 * Import and export AppBuilder apps.
 */

var fs = require('fs');
var path = require('path');
var AD = require('ad-utils');

/**
 * Deeply iterates through an object or array and removes any properties
 * named 'createdAt' or 'updatedAt'. Also removes primary and foreign keys
 * from translations.
 *
 * @param Mixed thing
 *      Array or Object to remove timestamp properties from.
 * @param Array toRemove
 *      Optional array of properties to remove from `thing`.
 *      Default is 'createdAt' and 'updatedAt'.
 * @private
 */
var removeTimestamps = function(thing, toRemove) {
    toRemove = toRemove || ['createdAt', 'updatedAt'];
    if (Array.isArray(thing)) {
        thing.forEach(function(t) {
            removeTimestamps(t, toRemove);
        });
    }
    else if (typeof thing == 'object') {
        for (var key in thing) {
            if (toRemove.indexOf(key) >= 0) {
                delete thing[key];
            }
            else if (key == 'translations') {
                removeTimestamps(thing[key], toRemove.concat(['id', 'abapplication', 'abobject', 'abcolumn', 'abpage']));
            }
            else {
                removeTimestamps(thing[key], toRemove);
            }
        }
    }
    else {
        // nothing to do
    }
};


/**
 * Changes all primary keys to start from 1, and remapping all internal 
 * references to maintain consistency.
 *
 * @param JSON data
 *      This is the data object used for app exports.
 * @private
 */
var normalizeIDs = function(data) {
    var appID = 1;
    var reference = {};
    for (var key in data) {
        if (key == 'app') continue;
        reference[key] = {
            counter: 1,
            map: {}
        };
    }
    
    // First pass: normalize primary keys
    data.app.id = appID;
    for (var key in data) {
        if (key == 'app') continue;
        data[key].forEach(function(obj) {
            reference[key].map[ obj.id ] = reference[key].counter;
            obj.id = reference[key].counter;
            reference[key].counter += 1;
        });
    };
    
    // Second pass: adjust references
    data.objects.forEach(function(obj) {
        obj.application = appID;
    });
    data.pages.forEach(function(page) {
        page.parent = reference.pages.map[ page.parent ];
        page.application = appID;
    });
    data.columns.forEach(function(col) {
        col.object = reference.objects.map[ col.object ];
        if (col.setting) {
            col.setting.linkObject = reference.objects.map[ col.setting.linkObject ];
            col.setting.linkVia = reference.columns.map[ col.setting.linkVia ];
        }
    });
    data.lists.forEach(function(list) {
        list.column = reference.columns.map[ list.column ];
    });
    data.components.forEach(function(comp) {
        comp.page = reference.pages.map[ comp.page ];
        if (comp.setting) {
            comp.setting.object = reference.objects.map[ parseInt(comp.setting.object) ];
            if (Array.isArray(comp.setting.visibleFieldIds)) {
                for (var i=0; i<comp.setting.visibleFieldIds.length; i++) {
                    var colID = parseInt(comp.setting.visibleFieldIds[i]);
                    comp.setting.visibleFieldIds[i] = reference.columns.map[ colID ] || (colID + '!!');
                }
            }
            if (Array.isArray(comp.setting.pageIds)) {
                for (var i=0; i<comp.setting.pageIds.length; i++) {
                    var pageID = parseInt(comp.setting.pageIds[i]);
                    comp.setting.pageIds[i] = reference.pages.map[ pageID ] || (pageID + '!!');
                }
            }
            if (Array.isArray(comp.setting.columns)) {
                for (var i=0; i<comp.setting.columns.length; i++) {
                    var colID = parseInt(comp.setting.columns[i]);
                    comp.setting.columns[i] = reference.columns.map[ colID ] || (colID + '!!');
                }
            }
            ['viewPage', 'editPage'].forEach(function(key) {
                if (!comp.setting[key]) return;
                var pageID = parseInt(comp.setting[key]);
                comp.setting[key] = reference.pages.map[ pageID ] || (pageID + '!!');
            });
            ['viewId', 'editForm'].forEach(function(key) {
                if (!comp.setting[key]) return;
                var compID = parseInt(comp.setting[key]);
                comp.setting[key] = reference.components.map[ compID ] || (compID + '!!');
            });
        }
    });
};



module.exports = {
    
    /**
     * Export an application's metadata to JSON
     *
     * @param integer appID
     * @return JSON object
     */
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
                removeTimestamps(data);
                normalizeIDs(data);
                
                dfd.resolve(data);
            }
        });
        
        return dfd;
    },
    
    
    /**
     * Import JSON data to create an application.
     *
     * @param JSON data
     *      This is the JSON object produced by appToJSON()
     */
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
        var colIDs = {};
        var pageIDs = {};
        var componentIDs = {};
        
        // Some columns reference other columns via `settings.linkVia`.
        // These will need to be remapped in a 2nd pass.
        var columnsNeedRemap = [];
        var componentsNeedRemap = [];
        
        
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
                                // Name is already being used. Keep trying.
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
            
            // Remap column `linkVia` ID references
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
                    var oldCompID = comp.id;
                    var setting = comp.setting;
                    if (setting) {
                        if (Array.isArray(setting.visibleFieldIds)) {
                            for (var i=0; i<setting.visibleFieldIds.length; i++) {
                                var oldID = parseInt(setting.visibleFieldIds[i]);
                                setting.visibleFieldIds[i] = colIDs[oldID];
                            }
                        }
                        if (Array.isArray(setting.pageIds)) {
                            for (var i=0; i<setting.pageIds.length; i++) {
                                var oldID = parseInt(setting.pageIds[i]);
                                setting.pageIds[i] = pageIDs[oldID];
                            }
                        }
                        if (Array.isArray(setting.columns)) {
                            for (var i=0; i<setting.columns.length; i++) {
                                var oldID = parseInt(setting.columns[i]);
                                setting.columns[i] = colIDs[oldID];
                            }
                        }
                        ['viewPage', 'editPage'].forEach(function(key) {
                            if (!setting[key]) return;
                            var oldID = parseInt(setting[key]);
                            setting[key] = pageIDs[oldID];
                        });
                    }
                    var compData = {
                        page: pageIDs[ comp.page ],
                        component: comp.component,
                        weight: comp.weight,
                        setting: setting,
                    };
                    ABPageComponent.create(compData)
                    .exec(function(err, result) {
                        if (err) compDone(err);
                        else {
                            componentIDs[oldCompID] = compData.id;
                            // Some settings reference other components.
                            // These will be remapped later.
                            ['viewId', 'editForm'].forEach(function(key) {
                                if (setting[key]) {
                                    componentsNeedRemap.push(compData.id);
                                }
                            });
                            compDone();
                        }
                    });
                }, function(err) {
                    if (err) next(err);
                    else {
                        next();
                    }
                });
            },
            
            // Remap component references
            function(next) {
                async.each(componentsNeedRemap, function(compID, compDone) {
                    
                    ABPageComponent.findOne({ id: compID })
                    .exec(function(err, result) {
                        if (err) compDone(err);
                        else if (!result) {
                            compDone(new Error('component not found: ' + compID));
                        }
                        else {
                            ['viewId', 'editForm'].forEach(function(key) {
                                var oldID = parseInt(result.setting[key]);
                                if (oldID) {
                                    result.setting[key] = componentIDs[oldID];
                                }
                            });
                            ABPageComponent.update({ id: compID }, result)
                            .exec(function(err) {
                                if (err) compDone(err);
                                else compDone();
                            });
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