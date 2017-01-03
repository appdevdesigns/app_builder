/**
 * ABColumn.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var async = require('async'),
    _ = require('lodash'),
    AD = require('ad-utils');

module.exports = {

    tableName: 'appbuilder_column',


    connection: 'appdev_default',
    migrate: 'alter',

    attributes: {

        object: { model: 'ABObject' },

        name: {
            type: 'string',
            required: true
        },

        fieldName: {
            type: 'string',
            required: true
        },

        type: {
            type: 'string',
            required: true
        },

        weight: {
            type: 'integer',
            required: false
        },

        width: {
            type: 'integer',
            required: false
        },

        required: { type: 'boolean' },

        unique: { type: 'boolean' },

        setting: { type: 'json' },



        //// Multilingual Definitions

        // this will pull in the translations using .populate('translations')
        translations: {
            collection: 'ABColumnTrans',
            via: 'abcolumn'
        },

        translate: function (code) {
            return ADCore.model.translate({
                model: this,         // this instance of a Model
                code: code,          // the language code of the translation to use.
                ignore: ['abcolumn']     // don't include this field when translating
            });
        },

        _Klass: function () {
            return ABColumn;
        },

        isSynced: { type: 'boolean' }


    },
    
    ////
    // Lifecycle callbacks
    ////
    
    beforeValidate: function (values, cb) {
        for (var key in values) {
            if (values[key] == null || typeof values[key] == 'undefined' || values[key] != values[key] /* NaN */)
                delete values[key];
            else if (values[key] === '')
                values[key] = null;
        }

        cb();
    },

    beforeCreate: function (values, cb) {
        if (values.name)
            values.name = values.name.replace(/ /g, '_');

        if (values.weight == null) {
            // Set weight
            ABColumn.count({ object: values.object }).exec(function (err, found) {
                values.weight = found + 1;
                cb();
            });
        }
        else {
            cb();
        }

    },

    beforeUpdate: function (values, cb) {
        if (values.name)
            values.name = values.name.replace(/ /g, '_');

        cb();
    },

    afterDestroy: function (destroyedColumns, cb) {

        var ids = _.map(destroyedColumns, 'id');

        if (ids && ids.length) {
            async.parallel([
                function (callback) {
                    ABColumnTrans.destroy({ abcolumn: ids })
                        .fail(function (err) {
                            callback(err)
                        })
                        .then(function () {
                            callback();
                        });
                },
                function (callback) {
                    ABList.destroy({ column: ids })
                        .fail(function (err) {
                            callback(err)
                        })
                        .then(function () {
                            callback();
                        });
                }
            ], cb);
        }
        else {
            cb();
        }

    },
    
    ////
    // Defaults for column types
    ////
    
    typeDefaults: {
        
        boolean: {
            type: 'boolean',
            fieldName: 'boolean',
            setting: {
                icon: 'check-square-o',
                filter_type: 'boolean',
                template: '{common.checkbox()}',
            }
        },
        
        date: {
            type: 'date',
            fieldName: 'date',
            setting: {
                icon: 'calendar',
                editor: 'date',
                filter_type: 'date',
                format: 'dateFormatStr',
            }
        },
        
        float: {
            type: 'float',
            fieldName: 'number',
            setting: {
                icon: 'slack',
                editor: 'number',
                filter_type: 'number',
                format: 'numberFormat',
            }
        },
        
        integer: {
            type: 'integer',
            fieldName: 'number',
            setting: {
                icon: 'slack',
                editor: 'number',
                filter_type: 'number',
                format: 'numberFormat',
            }
        },
        
        list: {
            type: 'string',
            fieldName: 'list',
            setting: {
                icon: 'th-list',
                filter_type: 'list',
                editor: 'richselect',
                options: [],
            }
        },
        
        string: {
            type: 'string',
            fieldName: 'string',
            setting: {
                icon: 'font',
                editor: 'text',
                filter_type: 'text',
                supportMultilingual: '0',
            }
        },
        
        text: {
            type: 'text',
            fieldName: 'text',
            setting: {
                icon: 'align-right',
                editor: 'popup',
                filter_type: 'text',
                supportMultilingual: '0',
            }
        },
        
        attachment: {
            type: 'string',
            fieldName: 'attachment',
            setting: {
                // under construction
            }
        },
        
        image: {
            type: 'string',
            fieldName: 'image',
            setting: {
                icon: 'file-image-o',
                editor: 'imageDataField',
                template: '<div class="ab-image-data-field"></div>',
                filter_type: 'text',
                /*
                useWidth: '1',
                imageWidth: '100',
                useHeight: '1',
                imageHeight: '100',
                width: '100',
                */
                css: 'ab-column-no-padding'
            }
        },
        
        connectObject: {
            type: 'connectObject',
            fieldName: 'connectObject',
            setting: {
                appName: '',
                //linkType: 'model' or 'collection',
                //linkObject: {integer},
                //linkViaType: 'model' or 'collection',
                icon: 'external-link',
                editor: 'selectivity',
                template: '<div class="connect-data-values"></div>',
                filter_type: 'multiselect'
            }
        }
        
    },
    
    
    ////
    // Model class methods
    ////
    
    /**
     * Create an AppBuilder column entry. This is separate from building the
     * generated app's model.
     *
     * Examples:
     *     ABColumn.createColumn('float', { name: 'Price', object: 123 })
     *     ABColumn.createColumn('text', 'en', { name: 'Description', object: 123 })
     *     ABColumn.createColumn('list', {
     *         name: 'Toppings',
     *         object: 123,
     *         weight: 3,
     *         setting: {
     *             options: [
     *                 {dataId: 46, id: "Crushed peanuts"},
     *                 {dataId: 47, id: "Pickled chili peppers"},
     *                 {dataId: 48, id: "Ketchup"}
     *             ]
     *         }
     *     )
     *
     * @param {string} type
     *     One of the following: 
     *         boolean, date, float, integer, list, string, text,
     *         attachment, image.
     *
     *     Default values for `data` will be populated based on this. 
     *     See ABColumn.typeDefaults.
     *
     *     Note that this `type` parameter is different from `data.type` or
     *     `data.fieldName` in some situations.
     *     For connections to other objects, use ABColumn.createLink() instead.
     *
     * @param {string} [currentLanguage]
     *     Optional language code of the current language.
     *     The `data.name` value will be copied to the column label in the 
     *     current language. A language code prefix will be added to all other 
     *     language labels.
     * @param {object} data
     * @param {string} data.name
     *     The name of the column. Required.
     * @param {integer} data.object
     *     The primary key ID of the ABObject that this column belongs to.
     *     Required.
     * @param {string} [data.type]
     *     Optional. If you want to override the default for some reason.
     * @param {string} [data.fieldName]
     *     Optional. If you want to override the default for some reason.
     * @param {integer} [data.weight]
     *     Optional. Default is to put the column at the bottom.
     * @param {string/object} [data.setting]
     *     Stringified JSON, or JSON basic object.
     * @return Deferred
     *     Resolves with the new column's data.
     */
    createColumn: function (type, currentLanguage, data) {
        var dfd = AD.sal.Deferred();
        
        // Check if currentLanguage was omitted
        if (arguments.length == 2) {
            data = currentLanguage;
            currentLanguage = '';
        
            // Can use site default language
            if (sails.config.appdev && sails.config.appdev['lang.default']) {
                currentLanguage = sails.config.appdev['lang.default'];
            }
        }
        
        var defaultData = ABColumn.typeDefaults[type] || {};
        
        var columnData = data || {};
        _.defaults(data, {
            type: defaultData.type,
            fieldName: defaultData.fieldName,
            setting: {}
        });
        _.defaults(columnData.setting, defaultData.setting);
        
        var column;
        var languages = [];
        var appID, columnID;
        
        async.series([
            // Preliminary checks
            function(next) {
                if (!ABColumn.typeDefaults[type]) return next(new Error('Type is not recognized: ' + type));
                if (!columnData.object) return next(new Error('data.object is required'));
                if (!columnData.name) return next(new Error('data.name is required'));
                next();
            },
            
            // Check ABObject
            function(next) {
                ABObject.find({ id: columnData.object })
                .exec(function(err, list) {
                    if (err) next(err);
                    else if (!list || !list[0]) next(new Error('Object not found'));
                    else {
                        appID = list[0].application;
                        next();
                    }
                });
            },
            
            // Determine column weight if needed
            function(next) {
                if (typeof columnData.weight == 'number') return next();
                ABColumn.count({ object: columnData.object })
                .exec(function(err, found) {
                    if (err) next(err);
                    else {
                        // Put the new column at the end
                        columnData.weight = found;
                        next();
                    }
                });
            },
            
            // The `settings` field needs to have the app name for some reason
            function(next) {
                // Skip if app name is already given
                if (columnData.setting.appName) return next();
                
                ABApplication.find({ id: appID })
                .exec(function(err, list) {
                    if (err) next(err);
                    else if (!list || !list[0]) {
                        next(new Error('Application not found:' + appID));
                    }
                    else {
                        columnData.setting.appName = list[0].name;
                        next();
                    }
                });
            },
        
            // Create column entry
            function(next) {
                ABColumn.create(columnData)
                .exec(function(err, result) {
                    if (err) next(err);
                    else {
                        column = result;
                        next();
                    }
                });
            },
            
            // Find installed languages
            function(next) {
                SiteMultilingualLanguage.find()
                .exec(function(err, list) {
                    if (err) next(err);
                    else {
                        languages = _.map(list, 'language_code');
                        next();
                    }
                });
            },
            
            // Create column translations
            function(next) {
                async.forEach(languages, function(langCode, transDone) {
                    var label = column.name;
                    if (langCode != currentLanguage) {
                        label = `[${langCode}] ${label}`;
                    }
                    
                    ABColumnTrans.create({
                        abcolumn: column.id,
                        label: label,
                        language_code: langCode
                    })
                    .exec(function(err, result) {
                        if (err) transDone(err);
                        else transDone();
                    });
                }, function(err) {
                    if (err) next(err);
                    else next();
                });
            }
            
        ], function(err) {
            if (err) dfd.reject(err);
            dfd.resolve(column);
        });
        
        return dfd;
    },
    
    
    /**
     * Create a connection column, together with the return connection column.
     * It is possible for both the source and target to be same object.
     *
     * Example:
     * ABColumn.createLink('MyLinkName', {
     *     sourceObjectID: 5,
     *     targetObjectID: 7,
     *     sourceRelation: 'one',
     *     targetRelation: 'many'
     * }).then( ... )
     *
     * @param {string} name
     * @param {string} [currentLanguage]
     * @param {object} data
     * @param {integer} data.sourceObjectID
     *     The primary key value of the object containing the column.
     * @param {integer} data.targetObjectID
     *     The primary key value of the object being linked to.
     * @param {string} data.sourceRelation
     *     Either "one" or "many".
     * @param {string} data.targetRelation
     *     Either "one" or "many".
     * @return Deferred
     *     Resolves with (sourceObjectColumn, targetObjectColumn)
     */
    createLink: function(name, currentLanguage, data) {
        var dfd = AD.sal.Deferred();
        
        // Check if currentLanguage was omitted
        if (arguments.length == 2) {
            data = currentLanguage;
            currentLanguage = '';
        
            // Can use site default language
            if (sails.config.appdev && sails.config.appdev['lang.default']) {
                currentLanguage = sails.config.appdev['lang.default'];
            }
        }
        
        var sourceSetting = {
            linkObject: data.targetObjectID,
        };
        var targetSetting = {
            linkObject: data.sourceObjectID,
        };
        if (data.targetRelation != 'many') {
            sourceSetting.linkType = 'model';
            targetSetting.linkViaType = 'model';
        } else {
            sourceSetting.linkType = 'collection';
            targetSetting.linkViaType = 'collection';
        }
        if (data.sourceRelation != 'many') {
            targetSetting.linkType = 'model';
            sourceSetting.linkViaType = 'model';
        } else {
            targetSetting.linkType = 'collection';
            sourceSetting.linkViaType = 'collection';
        }
        
        var sourceColumn, targetColumn;
        
        async.series([
            // Preliminary checks
            function(next) {
                var msg = null;
                [
                    'sourceObjectID', 'targetObjectID', 
                    'sourceRelation', 'targetRelation'
                ].forEach(function(paramName) {
                    if (!data[paramName]) msg = `data.${paramName} is required`;
                });
                
                if (msg) next(new Error(msg));
                else next();
            },
            
            // Create source connection column
            function(next) {
                ABColumn.createColumn('connectObject', currentLanguage, {
                    name: name,
                    object: data.sourceObjectID,
                    setting: sourceSetting
                })
                .fail(next)
                .done(function(col) {
                    sourceColumn = col;
                    sourceSetting = col.setting;
                    if (data.sourceRelation == 'many') {
                        // This will be created in the next step
                        targetSetting.linkVia = col.id;
                    }
                    next();
                });
            },
            
            // Create target connection column
            function(next) {
                ABColumn.createColumn('connectObject', currentLanguage, {
                    name: name + 'Link',
                    object: data.targetObjectID,
                    setting: targetSetting
                })
                .fail(next)
                .done(function(col) {
                    targetColumn = col;
                    if (data.targetRelation == 'many') {
                        // This will be updated in the next step
                        sourceSetting.linkVia = col.id;
                    }
                    next();
                });
            },
            
            // Update the source connection column that was just created earlier
            function(next) {
                // Skip this step if not needed
                if (!sourceSetting.linkVia) return next();
                
                ABColumn.update(sourceColumn.id, { setting: sourceSetting })
                .fail(next)
                .done(function(col) {
                    sourceColumn = col;
                    next();
                });
            }
        
        ], function(err) {
            if (err) dfd.reject(err);
            else dfd.resolve(sourceColumn, targetColumn);
        });
        
        return dfd;
    },

};