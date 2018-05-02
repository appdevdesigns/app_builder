/**
 * ABApplicationController
 *
 * @description :: Server-side logic for managing Abapplications
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var AD = require('ad-utils');
var fs = require('fs');
var _ = require('lodash');
var path = require('path');
var async = require('async');

var ABViewPage = require(path.join('..', 'classes', 'ABViewPage'));
var ABViewPagePlugin = require(path.join('..', 'classes', 'ABViewPagePlugin'));

module.exports = {

    _config: {
        model: "abapplication", // all lowercase model name
        actions: false,
        shortcuts: false,
        rest: true
    },

    /* Objects */

    /**
     * PUT /app_builder/application/:appID/object
     * 
     * Add/Update a object into ABApplication
     */
    objectSave: function (req, res) {
        var appID = req.param('appID');
        var object = req.body.object;


        jsonDataSave( appID, 'objects', object, req, res );


        // ABApplication.findOne({ id: appID })
        //     .fail(res.AD.error)
        //     .then(function (app) {

        //         if (app) {

        //             app.json.objects = app.json.objects || [];

        //             var indexObj = -1;
        //             var updateObj = app.json.objects.filter(function (obj, index) {

        //                 var isExists = obj.id == object.id;
        //                 if (isExists) indexObj = index;

        //                 return isExists;
        //             })[0];

        //             // update
        //             if (updateObj) {
        //                 app.json.objects[indexObj] = object;
        //             }
        //             // add new
        //             else {
        //                 app.json.objects.push(object);
        //             }

        //             // save to database
        //             app.save(function (err) {
        //                 if (err)
        //                     res.AD.error(true);
        //                 else
        //                     res.AD.success(true);
        //             });
        //         }
        //         else {
        //             res.AD.success(true);
        //         }


        //     });

    },

    /**
     * DELETE /app_builder/application/:appID/object/:id
     * 
     * Delete a object in ABApplication
     */
    objectDestroy: function (req, res) {
        var appID = req.param('appID');
        var objectID = req.param('id');

        jsonDataDestroy( appID, 'objects', objectID, req, res);

        // ABApplication.findOne({ id: appID })
        //     .fail(res.AD.error)
        //     .then(function (app) {

        //         if (app) {

        //             app.json.objects = app.json.objects || [];

        //             var indexObj = -1;
        //             var updateObj = app.json.objects.filter(function (obj, index) {

        //                 var isExists = obj.id == objectID;
        //                 if (isExists) indexObj = index;

        //                 return isExists;
        //             })[0];

        //             // remove
        //             if (indexObj > -1) {
        //                 app.json.objects.splice(indexObj, 1);
        //             }

        //             // save to database
        //             app.save(function (err) {
        //                 if (err)
        //                     res.AD.error(true);
        //                 else
        //                     res.AD.success(true);
        //             });
        //         }
        //         else {
        //             res.AD.success(true);
        //         }


        //     });

    },



    /* Pages */

    /**
     * PUT /app_builder/application/:appID/page
     * 
     * Add/Update a page into ABApplication
     */
    pageSave: function (req, res) {
        var appID = req.param('appID');
        var resolveUrl = req.body.resolveUrl;
        var vals = req.body.data;

        Promise.resolve()
            .catch((err) => { res.AD.error(err); })
            .then(() => {

                // Pull a application
                return new Promise((resolve, reject) => {

                    ABApplication.findOne({ id: appID })
                        .exec((err, result) => {
                            if (err) return reject(err);

                            resolve({
                                app: result,
                                appClass: result.toABClass()
                            });
                        });

                });
            })
            .then((data) => {

                // Update page info to application
                return new Promise((resolve, reject) => {

                    if (data == null) return resolve();

                    var updateItem = data.appClass.urlResolve(resolveUrl);

                    // update
                    if (updateItem) {

                        var ignoreProps = ['id', 'pages', '_pages'];

                        // clear old values
                        for (var key in updateItem) {

                            if (ignoreProps.indexOf(key) > -1)
                                continue;

                            delete updateItem[key];
                        }

                        // add update values
                        for (var key in vals) {

                            if (ignoreProps.indexOf(key) > -1)
                                continue;

                            updateItem[key] = vals[key];
                        }

                    }


                    // add new
                    else {

                        // get the parent of view
                        var parts = resolveUrl.split('/');
                        parts.pop();
                        var parentUrl = parts.join('/');
                        var parent = data.appClass.urlResolve(parentUrl);

                        // add new page/view to the parent
                        if (parent && parent.push) {

                            switch(vals.key) {
                                
                                case 'pageplugin':
                                    parent.push(new ABViewPagePlugin(vals, data.appClass));
                                    break;

                                case 'page':
                                default:
                                    parent.push(new ABViewPage(vals, data.appClass));
                                    break;
                            }
                            
                        }
                    }

                    // update data to application
                    var updateApp = data.appClass.toObj();
                    data.app.json = updateApp.json;

                    // save to database
                    data.app.save(function (err) {
                        if (err)
                            reject(true);
                        else {

                            // refresh application class
                            data.appClass = data.app.toABClass();

                            resolve(data);
                        }
                    });


                });
            })
            .then((data) => {

                // Update page's nav view
                return new Promise((resolve, reject) => {

                    if (data == null) return resolve();

                    var pageClass = data.appClass._pages.filter(p => p.id == vals.id)[0];

                    if (pageClass)
                        return AppBuilder.updateNavView(data.app, pageClass)
                            .catch(reject)
                            .then(resolve);
                    else
                        resolve();

                });

            })
            .then(() => {

                // Finish
                return new Promise((resolve, reject) => {

                    res.AD.success(true);
                    resolve();

                });
            });

    },

    /**
     * DELETE /app_builder/application/:appID/page
     * 
     * Delete a page in ABApplication
     */
    pageDestroy: function (req, res) {
        var appID = req.param('appID');
        var resolveUrl = req.body.resolveUrl;
        var pageName;

        Promise.resolve()
            .catch((err) => { res.AD.error(err); })
            .then(() => {

                // Pull a application
                return new Promise((resolve, reject) => {

                    ABApplication.findOne({ id: appID })
                        .exec((err, result) => {
                            if (err) reject(err);
                            else resolve(result);
                        });

                });
            })
            .then((Application) => {

                // Remove a page in the list
                return new Promise((resolve, reject) => {

                    if (Application == null) return resolve();

                    var appClass = Application.toABClass();

                    // get the delete page in list
                    var deletePage = appClass.urlResolve(resolveUrl);
                    if (!deletePage) return resolve();

                    if (deletePage.parent == null)
                        pageName = deletePage.name;

                    // get the parent(array) of view
                    var parts = resolveUrl.split('/');
                    parts.pop();
                    var parentUrl = parts.join('/');
                    var parent = appClass.urlResolve(parentUrl); // should be a array

                    // get index of item
                    var indexPage = parent.findIndex(function (page) {
                        return page.id == deletePage.id;
                    });

                    // remove
                    if (indexPage > -1) {
                        parent.splice(indexPage, 1);
                    }

                    // update data to application
                    var updateApp = appClass.toObj();
                    Application.json = updateApp.json;

                    // save to database
                    Application.save(function (err) {
                        if (err)
                            reject(err);
                        else
                            resolve(Application);
                    });
                });

            })
            .then((Application) => {

                // Remove page's nav view
                return new Promise((resolve, reject) => {

                    if (Application == null ||
                        !pageName)
                        return resolve();

                    return AppBuilder.removeNavView(Application, pageName)
                        .catch(reject)
                        .then(resolve);
                });

            })
            .then(() => {

                // Finish
                return new Promise((resolve, reject) => {

                    res.AD.success(true);
                    resolve();

                });
            });

    },
    
    /**
     * GET /app_builder/page/:action_key/role
     *
     * Request the current page's list of permission roles as well as all possible roles with descriptions
     */
    getPageRoles: function (req, res) {
        var action_key = req.param('action_key');

        Permissions.getUserRoles(req, true)
        .fail(function(err){
            res.AD.error(err);
        })
        .then(function(result){
            var roles = result;

            Permissions.getRolesByActionKey(action_key)
            .fail(function(err){
                res.AD.error(err);
            })
            .then(function(result){
                res.AD.success({
                    roles: roles,
                    selected: result
                });
            });
            
        })
        

    },
    
    /**
     * PUT /app_builder/page/:action_key/role/assign
     *
     * Add new role to the current page's list of permission roles
     */
    addPageRoles: function (req, res) {
        var role_id = req.param('role_id');
        var action_key = req.param('action_key');

        Permissions.assignAction(role_id, action_key)
        .fail(function(err){
            res.AD.error(err);
        })
        .then(function(result){

            res.AD.success({
                body: result
            });
            
        })
    },

    /**
     * DELETE /app_builder/page/:action_key/role
     *
     * Delete role from the current page's list of permission roles
     */
    deletePageRoles: function (req, res) {
        var role_id = req.param('role_id');
        var action_key = req.param('action_key');

        Permissions.removeAction(role_id, action_key)
        .fail(function(err){
            res.AD.error(err);
        })
        .then(function(result){

            res.AD.success({
                body: result
            });
            
        })
    },



    /**
     * GET /app_builder/appJSON/:id?download=1
     * 
     * Export an app in JSON format
     */
    jsonExport: function (req, res) {
        var appID = req.param('id');
        var forDownload = req.param('download');

        AppBuilderExport.appToJSON(appID)
            .fail(function (err) {
                res.AD.error(err);
            })
            .done(function (data) {
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
    jsonImport: function (req, res) {
        req.file('upload').upload(function (err, files) {
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
                fs.readFile(files[0].fd, function (err, data) {
                    if (err) {
                        console.log('jsonImport read error', err);
                        res.send({ status: 'error' });
                        //res.AD.error(err);
                    }
                    else {
                        try {
                            var jsonData = JSON.parse(data.toString());
                            AppBuilderExport.appFromJSON(jsonData)
                                .fail(function (err) {
                                    console.log('jsonImport import error', err);
                                    res.send({
                                        status: 'error',
                                        message: err.message,
                                        error: err
                                    });
                                    //res.AD.error(err);
                                })
                                .done(function () {
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

        ABApplication.find({ id: { '!': appID } })
            .populate('translations')
            .fail(res.AD.error)
            .then(function (apps) {

                // pull objects to array
                apps.forEach(function (app) {

                    if (app.json.objects != null) {

                        // get properties of objects
                        var objects = app.json.objects.map(function (obj) {
                            return {
                                id: obj.id,
                                name: obj.name,
                                fields: obj.fields,
                                translations: obj.translations,
                                application: app
                            }
                        });

                        result = result.concat(objects);

                    }

                });

                res.AD.success(result);

            });

    },


    // POST /app_builder/application/:appID/importModel
    importModel: function (req, res) {
        var targetAppID = parseInt(req.param('appID') || 0);
        var sourceAppID = parseInt(req.param('sourceAppId') || 0);
        var objectID = req.param('objectId') || '';
        var columns = req.param('columns') || [];

        // Convert "true"/"false" to boolean
        columns = columns.map(function(col) {

            col.isHidden = JSON.parse(col.isHidden);
            return col;

        });

        var currLangCode = ADCore.user.current(req).getLanguageCode(); // 'en';

        Promise.resolve()
            .catch((err) => { res.AD.error(err); })
            .then(() => {

                // Import a object
                return new Promise((resolve, reject) => {

                    AppBuilder.importObject(sourceAppID, targetAppID, objectID, columns, currLangCode)
                        .catch(reject)
                        .then((objId) => {
                            resolve(objId);
                        });

                });
            })
            .then((objId) => {

                // Pull a application
                return new Promise((resolve, reject) => {

                    ABApplication.findOne({ id: targetAppID })
                        .fail(reject)
                        .then(function (app) {

                            var appClass = app.toABClass();
                            var newObject = appClass.objects(obj => obj.id == objId)[0];
                            if (!newObject) {
                                return reject(new Error("Could not found new object"));
                            }

                            res.AD.success(newObject.toObj());

                            resolve();
                        });

                });
            });

    },




    /* Queries */

    /**
     * PUT /app_builder/application/:appID/query
     * 
     * Add/Update a object into ABApplication
     */
    querySave: function (req, res) {
        var appID = req.param('appID');
        var query = req.param('data');

console.log('querySave():');
console.log('allParams:', req.allParams());

        jsonDataSave( appID, 'queries', query, req, res );

    },

    /**
     * DELETE /app_builder/application/:appID/query/:id
     * 
     * Delete a query in ABApplication
     */
    queryDestroy: function (req, res) {
        var appID = req.param('appID');
        var queryID = req.param('id');

        jsonDataDestroy( appID, 'queries', queryID, req, res )

    },

};



function jsonDataSave( appID, keyData, jsonEntry, req, res ) {
console.log();
console.log('jsonDataSave(): keyData['+ keyData + ']  jsonEntry:', jsonEntry);
console.log();
    ABApplication.findOne({ id: appID })
        .fail(res.AD.error)
        .then(function (app) {

            if (app) {

                app.json[keyData] = app.json[keyData] || [];

                var indexObj = -1;
                var updateObj = app.json[keyData].filter(function (obj, index) {

                    var isExists = obj && obj.id == jsonEntry.id;
                    if (isExists) indexObj = index;

                    return isExists;
                })[0];

                // update
                if (updateObj) {
                    app.json[keyData][indexObj] = jsonEntry;
                }
                // add new
                else {
                    app.json[keyData].push(jsonEntry);
                }
console.log('app.json['+keyData+'] : ', app.json[keyData]);
console.log();
                // save to database
                app.save(function (err) {
                    if (err)
                        res.AD.error(true);
                    else
                        res.AD.success(true);
                });
            }
            else {
                res.AD.success(true);
            }

        });

}


function jsonDataDestroy( appID, keyData, itemID, req, res ) {

    ABApplication.findOne({ id: appID })
        .fail(res.AD.error)
        .then(function (app) {

            if (app) {

                app.json[keyData] = app.json[keyData] || [];

                var indexObj = -1;
                var updateObj = app.json[keyData].filter(function (obj, index) {

                    var isExists = obj.id == itemID;
                    if (isExists) indexObj = index;

                    return isExists;
                })[0];

                // remove
                if (indexObj > -1) {
                    app.json[keyData].splice(indexObj, 1);
                }

                // save to database
                app.save(function (err) {
                    if (err)
                        res.AD.error(true);
                    else
                        res.AD.success(true);
                });
            }
            else {
                res.AD.success(true);
            }


        });

}

