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

var ABViewPage = require(path.join('..', 'classes', 'ABViewPage'));

var ApplicationGraph = require(path.join('..', 'graphModels', 'ABApplication'));

module.exports = {

    _config: {
        model: "abapplication", // all lowercase model name
        actions: false,
        shortcuts: false,
        rest: false
    },

    /* Application */

    /**
     * GET /app_builder/application
     * 
     */
    find: function(req, res) {

        let cond = req.query;

        ApplicationGraph
            .find(cond)
            .then(apps => {

                res.AD.success((apps || []).map(a => a.toValidJsonFormat()));

            },
            err => {

                if (err.code == 404) {
                    res.AD.error("System cound not found this application", 404);
                }
                else {
                    res.AD.error(false);
                }

                console.error(cond, err);

            });

    },


    /**
     * GET /app_builder/application/:appID
     * 
     */
    findOne: function(req, res) {

        var appID = req.param('appID');

        ApplicationGraph
            .findOne(appID)
            .then(app => {

                if (app)
                    res.AD.success(app.toValidJsonFormat());
                else
                    res.AD.success(null);

            },
            err => {

                if (err.code == 404) {
                    res.AD.error("System cound not found this application", 404);
                }
                else {
                    res.AD.error(false);
                }

                console.error(err);

            });

    },

    /**
     * POST /app_builder/application
     * create new application
     * 
     */
    applicationCreate: function(req, res) {

        let appValues = req.body;

        ApplicationGraph.insert(appValues)
            .then(app => {

                res.AD.success(app);

            },
            err => {

                if (err.code == 404) {
                    res.AD.error("System cound not found this application", 404);
                }
                else {
                    res.AD.error(false);
                }

                console.error(err);

            });

    },

    /**
     * PUT /app_builder/application/:appID
     * update an application
     * 
     */
    applicationUpdate: function(req, res) {

        let appID = req.param('appID');
        let appValues = req.body;

        ApplicationGraph.update(appID, appValues)
            .then(app => {

                res.AD.success(app);

            },
            err => {

                if (err.code == 404) {
                    res.AD.error("System cound not found this application", 404);
                }
                else {
                    res.AD.error(false);
                }

                console.error(err);

            });

    },

    /**
     * DELETE /app_builder/application/:appID
     * remove an application
     * 
     */
    applicationRemove: function(req, res) {

        let appID = req.param('appID');

        ApplicationGraph.remove(appID)
            .then(() => {

                res.AD.success(true);

            },
            err => {

                if (err.code == 404) {
                    res.AD.error("System cound not found this application", 404);
                }
                else {
                    res.AD.error(false);
                }

                console.error(err);

            });

    },

    /**
     * PUT /app_builder/application/:appID/info
     * 
     * Save info (name/description) of ABApplicaiton
     * 
     */
    applicationSave: function(req, res) {
        var appID = req.param('appID');
        var appInfo = req.body.translations;
        var appIsAdmin = JSON.parse(req.body.isAdminApp || false);

        Promise.resolve()
            .catch(() => {
                res.AD.error(true);
            })
            .then(() => {

                // Save application data
                return new Promise((next, err) => {

                    let appValues = {
                        isAdminApp: appIsAdmin,
                        translations: appInfo
                    };

                    ApplicationGraph.update(appID, appValues)
                    .catch(res.AD.error)
                    .then(function (app) {
        
                        if (app) {
                            // TODO return valid app values
                            next(app);
                        }
                        else {
                            err("NOT FOUND");
                            res.AD.error("Could not found this application");
                        }

                    });

                });
            })
            .then((app) => {

                return new Promise((next, err) => {

                    let pageName = "Application Admin Page";

                    // Update Admin App page
                    if (appIsAdmin) {
                        let options = {
                            isAdminPage: true,
                            name: pageName,
                            label: "Admin",
                            icon: "fa-circle-o-notch" // TODO admin app icon
                        };
    
                        AppBuilder.updateNavView(app, options)
                            .catch(err)
                            .then(() => {
                                next();
                            });
                    }
                    // Remove Admin App page
                    else {

                        AppBuilder.removeNavView(app, pageName)
                            .catch(err)
                            .then(() => {
                                next();
                            });
                    }

                });
            })
            .then(() => {

                // final
                return new Promise((next, err) => {

                    res.AD.success(true);
                    next();

                });
            });


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

                    ApplicationGraph.findOne(appID)
                        .catch(reject)
                        .then(result => {

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

                            parent.push(new ABViewPage(vals, data.appClass));

                        }
                    }

                    // update data to application
                    var updateApp = data.appClass.toObj();
                    data.app.json = updateApp.json;

                    // save to database
                    data.app.save()
                        .catch(reject)
                        .then(() => {

                            // refresh application class
                            data.appClass = data.app.toABClass();

                            resolve(data);
                    });


                });
            })
            .then((data) => {

                // Update page's nav view
                return new Promise((resolve, reject) => {

                    if (data == null) return resolve();

                    var langCode = ADCore.user.current(req).getLanguageCode(); // 'en';

                    var pageClass = data.appClass._pages.filter(p => p.id == vals.id)[0];
                    if (pageClass) {

                        // find page name
                        var pageLabel;
                        (pageClass.translations || []).forEach((trans) => {
                            if (trans.language_code == 'en') {
                               pageLabel = trans.label.replace(/[^a-z0-9 ]/gi, '');
                            }
                        });

                        let options ={
                            name: pageClass.name,
                            label: pageLabel || vals.label || pageClass.name,
                            urlPointer: pageClass.urlPointer(),
                            icon: pageClass.icon
                        };

                        return AppBuilder.updateNavView(data.app, options, langCode)
                            .catch(reject)
                            .then(resolve);
                    }
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

                    ApplicationGraph.findOne(appID)
                        .catch(reject)
                        .then(result => {
                            resolve(result);
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
                    Application.save()
                        .catch(reject)
                        .then(() => {
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

        ApplicationGraph.find({ id: { '!': appID } })
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

                    ApplicationGraph.findOne({ id: targetAppID })
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


    /* Mobile Apps */
    /* An Application may have one or more Mobile Apps. */

    /**
     * GET /app_builder/application/allmobileapps
     * 
     * return a list of all Mobile Apps across all Applications.
     * (administrative)
     * 
     * the returned list is a list of { .id  .label .appID }
     *
     */
    listMobileApps: function (req, res) {

        AppBuilder.mobileApps()
        .then((list)=>{
            var objList = [];
            list.forEach((l)=>{
                objList.push(l.toObj());
            })
            
            res.AD.success(objList);
        })
        .catch((err)=>{
            ADCore.Error.log('ABApplicationController:listMobileApps:Error getting mobile apps:', {error:err});
            res.AD.error(err);
        })

    }

};



function jsonDataSave( appID, keyData, jsonEntry, req, res ) {
console.log();
console.log('jsonDataSave(): keyData['+ keyData + ']  jsonEntry:', jsonEntry);
console.log();
    ApplicationGraph.findOne({ id: appID })
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
                app.save()
                    .catch(err => {
                        res.AD.error(true);
                    })
                    .then(() => {
                        res.AD.success(true);
                    });
            }
            else {
                res.AD.success(true);
            }

        });

}


function jsonDataDestroy( appID, keyData, itemID, req, res ) {

    ApplicationGraph.findOne({ id: appID })
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
                app.save()
                    .catch(() => {
                        res.AD.error(true);
                    })
                    .then(() => {
                        res.AD.success(true);
                    });
            }
            else {
                res.AD.success(true);
            }


        });

}

