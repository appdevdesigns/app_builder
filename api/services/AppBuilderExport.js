/**
 * Import and export AppBuilder apps.
 */

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
 * references to maintain consistency. This is done for exports.
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
            reference[key].map[ parseInt(obj.id) ] = reference[key].counter;
            obj.id = reference[key].counter;
            reference[key].counter += 1;
        });
    };
    
    // Second pass: adjust internal references
    data.objects.forEach(function(obj) {
        obj.application = appID;
    });
    data.pages.forEach(function(page) {
        page.parent = reference.pages.map[ parseInt(page.parent) ];
        page.application = appID;
    });
    data.columns.forEach(function(col) {
        col.object = reference.objects.map[ parseInt(col.object) ];
        if (col.setting) {
            remap(col, 'linkObject', 'objects', reference);
            remap(col, 'linkVia', 'columns', reference);
        }
    });
    data.lists.forEach(function(list) {
        list.column = reference.columns.map[ parseInt(list.column) ];
    });
    data.components.forEach(function(comp) {
        comp.page = reference.pages.map[ parseInt(comp.page) ];
        if (comp.setting) {
            ['viewPage', 'editPage', 'pageIds'].forEach(function(key) {
                remap(comp, key, 'pages', reference);
            });
            ['viewId', 'editForm'].forEach(function(key) {
                remap(comp, key, 'components', reference);
            });
            ['linkField', 'columns', 'visibleFieldIds'].forEach(function(key) {
                remap(comp, key, 'columns', reference)
            });
            ['object', 'linkedTo'].forEach(function(key) {
                remap(comp, key, 'objects', reference);
            });
            if (comp.component == 'link') {
                remap(comp, 'linkTo', 'pages', reference);
            } else {
                remap(comp, 'linkTo', 'objects', reference);
            }
        }
    });
};


/**
 * Remaps IDs within a `setting` object based on a given reference object.
 * This is used during both import and export.
 *
 * @param Object obj
 *      A single AppBuilder object/column/page/component/list
 * @param String settingKey
 *      The index key of the setting property that is being remapped
 * @param String objType
 *      'objects', 'columns', 'lists', 'pages', or 'components'
 * @param Object reference
 *      {
 *          'objects': { 'map': {
 *              oldID: newID,
 *              oldID2: newID2,
 *              ...
 *          }},
 *          'columns': { ... },
 *          'lists': { ... },
 *          ...
 *      }
 * @private
 */
var remap = function(obj, settingKey, objType, reference) {
    var value = obj.setting[settingKey];
    if (Array.isArray(value)) {
        for (var i=0; i<value.length; i++) {
            var oldID = value[i];
            var newID = reference[objType].map[oldID];
            if (newID) {
                obj.setting[settingKey][i] = newID;
            } else {
                //obj.setting[settingKey][i] = oldID + '!!';
                throw new Error(`Unable to remap ${settingKey} ${objType}: ${oldID}`);
            }
            
        }
    } else {
        var oldID = parseInt(obj.setting[settingKey]);
        if (oldID) {
            var newID = reference[objType].map[oldID];
            if (newID) {
                obj.setting[settingKey] = newID;
            } else {
                //obj.setting[settingKey] = oldID + '!!';
                throw new Error(`Unable to remap ${settingKey} ${objType}: ${oldID}`);
            }
        }
    }
};


/**
 * Find a unique app name or label
 * 
 * @param string name
 * @param string type
 *      'app' or 'label'
 * @param string langCode
 * @return Deferred
 *
 * @private
 */
var uniqueName = function(name, type, langCode) {
    var dfd = AD.sal.Deferred();
    name = name || 'imported';
    type = type || 'name';
    
    async.during(
        // Condition test
        function(done) {
            var model = ABApplication;
            var cond = { name: name };
            if (type == 'label') {
                model = ABApplicationTrans;
                cond = {
                    label: name,
                    language_code: langCode
                };
            }
            
            // Check if the given name is already being used
            model.find(cond)
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
            var match = name.match(/^(.+?)_?(\d+)?$/);
            if (!match) {
                throw new Error('bad name?');
            }
            var base = match[1];
            var count = parseInt(match[2]);
            if (count) {
                name = base + '_' + (count+1);
            } else {
                name = base + '_1';
            }
            tryAgain();
        },
        // Completion
        function(err) {
            if (err) dfd.reject(err);
            else dfd.resolve(name);
        }
    );
    
    return dfd;
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
                .populate('translations')
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
                try {
                    normalizeIDs(data);
                } catch(normalizeErr) {
                    dfd.reject(normalizeErr);
                }
                
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
        var reference = {
            objects: { map: {} },
            columns: { map: {} },
            lists: { map: {} },
            pages: { map: {} },
            components: { map: {} }
        };
        
        // Some columns reference other columns via `settings.linkVia`.
        // These will need to be remapped in a 2nd pass.
        var columnsNeedRemap = [];
        var componentsNeedRemap = [];
        
        
        async.series([
            // Find unique app name
            function(next) {
                appName = data.app.name;
                
                uniqueName(appName, 'app')
                .fail(next)
                .done(function(result) {
                    appName = result;
                    next();
                });
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
                    uniqueName(trans.label, 'label', trans.language_code)
                    .fail(transDone)
                    .done(function(uniqueResult) {
                        var transData = {
                            abapplication: appID,
                            label: uniqueResult,
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
                            reference.objects.map[ oldID ] = newID;
                            
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
                    
                    if (col.setting) {
                        // Application name is duplicated here. Make sure it
                        // uses the adjusted name.
                        col.setting.appName = appName;
                        
                        // Remap the linked object IDs
                        try {
                            remap(col, 'linkObject', 'objects', reference);
                        } catch (remapErr) {
                            colDone(remapErr);
                            return;
                        }
                    }
                    
                    var colData = {
                        object: reference.objects.map[ oldObjID ],
                        name: col.name,
                        fieldName: col.fieldName,
                        type: col.type,
                        weight: col.weight,
                        required: col.required,
                        unique: col.unique,
                        setting: col.setting,
                        linkType: col.linkType,
                        linkVia: col.linkVia,
                        linkDefault: col.linkDefault,
                        supportMultilingual: col.supportMultilingual
                    };
                    ABColumn.create(colData)
                    .exec(function(err, result) {
                        if (err) colDone(err);
                        else {
                            var newColID = result.id;
                            reference.columns.map[ oldColID ] = newColID;
                            
                            // If this column references another column's ID,
                            // that ID will need to be remapped later.
                            if (col.setting.linkVia) {
                                columnsNeedRemap.push(newColID);
                            }
                            
                            // Column translations
                            async.each(col.translations, function(trans, transDone) {
                                var transData = {
                                    abcolumn: newColID,
                                    label: trans.label,
                                    language_code: trans.language_code
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
                            try {
                                remap(result, 'linkVia', 'columns', reference);
                            } catch (remapErr) {
                                colDone(remapErr);
                                return;
                            }
                            ABColumn.update(
                                { id: colID }, 
                                { setting: result.setting }
                            )
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
                        column: reference.columns.map[ list.column ],
                        key: list.key,
                        value: list.value,
                    };
                    ABList.create(listData)
                    .exec(function(err, result) {
                        if (err) listDone(err);
                        else {
                            // List item translations
                            var listID = result.id;
                            async.each(list.translations, function(trans, transDone) {
                                var transData = {
                                    ablist: listID,
                                    label: trans.label,
                                    language_code: trans.language_code,
                                    weight: trans.weight
                                };
                                ABListTrans.create(transData)
                                .exec(function(err) {
                                    if (err) transDone(err);
                                    else transDone();
                                });
                            }, function(err) {
                                if (err) listDone(err);
                                else listDone();
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
            
            // Create pages
            function(next) {
                async.each(data.pages, function(page, pageDone) {
                    var oldPageID = page.id;
                    var pageData = {
                        application: appID,
                        name: page.name,
                        parent: page.parent, // will be remapped later
                        permissionActionKey: page.permissionActionKey,
                    };
                    ABPage.create(pageData)
                    .exec(function(err, result) {
                        if (err) pageDone(err);
                        else {
                            var newPageID = result.id;
                            reference.pages.map[ oldPageID ] = newPageID;
                            
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
            
            // Remap parent page references
            function(next) {
                async.eachOf(reference.pages.map, function(pageID, oldPageID, pageDone) {
                    ABPage.findOne({ id: pageID })
                    .exec(function(err, result) {
                        if (err) pageDone(err);
                        else if (!result) {
                            pageDone(new Error('page not found: ' + pageID));
                        }
                        else if (!result.parent) {
                            // This is a root page
                            pageDone();
                        }
                        else {
                            // Remap the parent page ID
                            result.parent = reference.pages.map[ parseInt(result.parent) ];
                            ABPage.update(
                                { id: pageID }, 
                                { parent: result.parent }
                            )
                            .exec(function(err) {
                                if (err) pageDone(err);
                                else pageDone();
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
                    if (comp.setting) {
                        try {
                            if (comp.component == 'link') {
                                remap(comp, 'linkTo', 'pages', reference);
                            } else {
                                remap(comp, 'linkTo', 'objects', reference);
                            }
                            ['object', 'linkedTo'].forEach(function(key) {
                                remap(comp, key, 'objects', reference);
                            });
                            ['pageIds', 'pages', 'viewPage', 'editPage'].forEach(function(key) {
                                remap(comp, key, 'pages', reference);
                            });
                            ['linkedField', 'linkField', 'columns', 'visibleFieldIds'].forEach(function(key) {
                                remap(comp, key, 'columns', reference);
                            });
                        } catch (remapErr) {
                            compDone(remapErr);
                            return;
                        }
                    }
                    var compData = {
                        page: reference.pages.map[ parseInt(comp.page) ],
                        component: comp.component,
                        weight: comp.weight,
                        setting: comp.setting,
                    };
                    ABPageComponent.create(compData)
                    .exec(function(err, result) {
                        if (err) compDone(err);
                        else {
                            var newCompID = result.id;
                            reference.components.map[ oldCompID ] = newCompID;
                            // Some settings reference other components.
                            // These will be remapped later.
                            ['viewId', 'editForm'].forEach(function(key) {
                                if (compData.setting[key]) {
                                    componentsNeedRemap.push(newCompID);
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
                            try {
                                ['viewId', 'editForm'].forEach(function(key) {
                                    remap(result, key, 'components', reference);
                                });
                            } catch (remapErr) {
                                compDone(remapErr);
                                return;
                            }
                            ABPageComponent.update(
                                { id: compID }, 
                                { setting: result.setting }
                            )
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