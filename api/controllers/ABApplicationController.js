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

module.exports = {

    _config: {
        model: "abapplication", // all lowercase model name
        actions: false,
        shortcuts: false,
        rest: true
    },

    /* Objects */

    /**
     * PUT /app_builder/application/:appID
     * 
     * Add/Update a object into ABApplication
     */
    objectSave: function (req, res) {
        var appID = req.param('appID');
        var object = req.body.object;

        ABApplication.findOne({ id: appID })
            .fail(res.AD.error)
            .then(function (app) {

                if (app) {

                    app.json.objects = app.json.objects || [];

                    var indexObj = -1;
                    var updateObj = app.json.objects.filter(function (obj, index) {

                        var isExists = obj.id == object.id;
                        if (isExists) indexObj = index;

                        return isExists;
                    })[0];

                    // update
                    if (updateObj) {
                        app.json.objects[indexObj] = object;
                    }
                    // add new
                    else {
                        app.json.objects.push(object);
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

    },

    /**
     * DELETE /app_builder/application/:appID/object/:id
     * 
     * Delete a object in ABApplication
     */
    objectDestroy: function (req, res) {
        var appID = req.param('appID');
        var objectID = req.param('id');

        ABApplication.findOne({ id: appID })
            .fail(res.AD.error)
            .then(function (app) {

                if (app) {

                    app.json.objects = app.json.objects || [];

                    var indexObj = -1;
                    var updateObj = app.json.objects.filter(function (obj, index) {

                        var isExists = obj.id == objectID;
                        if (isExists) indexObj = index;

                        return isExists;
                    })[0];

                    // remove
                    if (indexObj > -1) {
                        app.json.objects.splice(indexObj, 1);
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

    },



    /* Pages */

    /**
     * PUT /app_builder/application/:appID/interface
     * 
     * Add/Update a page/view into ABApplication
     */
    interfaceSave: function (req, res) {
        var appID = req.param('appID');
        var resolveUrl = req.body.resolveUrl;
        var type = req.body.type; // 'page' or 'view'
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

                        var ignoreProps = ['id', 'pages', '_pages', 'views', '_views'];

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

                            // ABViewPage
                            if (type == 'page') {
                                parent.push(new ABViewPage(vals, data.appClass));
                            }
                            // ABView
                            else {
                                parent.push(vals);
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

                    if (type != 'page' || data == null) return resolve();

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
     * DELETE /app_builder/application/:appID/interface
     * 
     * Delete a page/view in ABApplication
     */
    interfaceDestroy: function (req, res) {
        var appID = req.param('appID');
        var resolveUrl = req.body.resolveUrl;
        var type = req.body.type; // 'page' or 'view'
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
                        type == 'page' ||
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
        var appID = req.param('appID');
        var modelObjectId = req.param('objectID') || '';
        var modelName = req.param('model') || '';
        var columns = req.param('columns') || [];

        AppBuilder.modelToObject(appID, modelObjectId, modelName, columns)
            .fail((err) => {
                res.AD.error(err);
            })
            .done((obj) => {
                res.AD.success(obj);
            });

    }

};



