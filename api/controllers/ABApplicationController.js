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

                    var indexObj = -1;
                    var updateObj = app.json.objects.filter(function (obj, index) {

                        var isExists = obj.id == objectID;
                        if (isExists) indexObj = index;

                        return isExists;
                    })[0];

                    // remove
                    if (indexObj > 0) {
                        delete app.json.objects[indexObj];
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
     * PUT /app_builder/application/:appID
     * 
     * Add/Update a page into ABApplication
     */
    pageSave: function (req, res) {
        var appID = req.param('appID');
        var page = req.body.page;

        ABApplication.findOne({ id: appID })
            .fail(res.AD.error)
            .then(function (app) {

                if (app) {

                    var indexPage = -1;
                    var updatePage = app.json.pages.filter(function (p, index) {

                        var isExists = p.id == page.id;
                        if (isExists) indexPage = index;

                        return isExists;
                    })[0];

                    // update
                    if (updatePage) {
                        app.json.pages[indexPage] = page;
                    }
                    // add new
                    else {
                        app.json.pages.push(page);
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
     * DELETE /app_builder/application/:appID/page/:id
     * 
     * Delete a page in ABApplication
     */
    pageDestroy: function (req, res) {
        var appID = req.param('appID');
        var pageID = req.param('id');

        ABApplication.findOne({ id: appID })
            .fail(res.AD.error)
            .then(function (app) {

                if (app) {

                    var indexPage = -1;
                    var updatePage = app.json.pages.filter(function (page, index) {

                        var isExists = page.id == pageID;
                        if (isExists) indexPage = index;

                        return isExists;
                    })[0];

                    // remove
                    if (indexPage > 0) {
                        delete app.json.pages[indexPage];
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



