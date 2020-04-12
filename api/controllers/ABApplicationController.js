/**
 * ABApplicationController
 *
 * @description :: Server-side logic for managing Abapplications
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var AD = require("ad-utils");
var fs = require("fs");
var _ = require("lodash");
var path = require("path");

var ABView = require(path.join("..", "classes", "platform", "views", "ABView"));

var ApplicationGraph = require(path.join("..", "graphModels", "ABApplication"));
var DataviewGraph = require(path.join("..", "graphModels", "ABDataview"));
var ObjectGraph = require(path.join("..", "graphModels", "ABObject"));
var QueryGraph = require(path.join("..", "graphModels", "ABQuery"));

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

      ApplicationGraph.find({
         where: cond
      }).then(
         (apps) => {
            res.AD.success((apps || []).map((a) => a.toValidJsonFormat()));
         },
         (err) => {
            if (err.code == 404) {
               res.AD.error("System cound not found this application", 404);
            } else {
               res.AD.error(false);
            }

            console.error(cond, err);
         }
      );
   },

   /**
    * GET /app_builder/application/:appID
    *
    */
   findOne: function(req, res) {
      let appID = req.param("appID");

      ApplicationGraph.findOne(appID).then(
         (app) => {
            if (app) {
               let result = app.toValidJsonFormat();

               res.AD.success(result);
            } else res.AD.success(null);
         },
         (err) => {
            if (err.code == 404) {
               res.AD.error("System cound not found this application", 404);
            } else {
               res.AD.error(false);
            }

            console.error(err);
         }
      );
   },

   /**
    * GET /app_builder/application/info
    * Return application id and label
    *
    */
   applicationInfo: function(req, res) {
      let cond = req.query;

      ApplicationGraph.find({
         select: ["id", "json.translations"],
         where: cond
      }).then(
         (apps) => {
            res.AD.success((apps || []).map((a) => a.toValidJsonFormat()));
         },
         (err) => {
            if (err.code == 404) {
               res.AD.error("System cound not found this application", 404);
            } else {
               res.AD.error(false);
            }

            console.error(cond, err);
         }
      );
   },

   /**
    * POST /app_builder/application
    * create new application
    *
    */
   applicationCreate: function(req, res) {
      let appValues = req.body;

      ApplicationGraph.insert(appValues).then(
         (app) => {
            res.AD.success(app);
         },
         (err) => {
            if (err.code == 404) {
               res.AD.error("System cound not found this application", 404);
            } else {
               res.AD.error(false);
            }

            console.error(err);
         }
      );
   },

   /**
    * PUT /app_builder/application/:appID
    * update an application
    *
    */
   applicationUpdate: function(req, res) {
      let appID = req.param("appID");
      let appValues = req.body;

      if (!appID) return res.AD.error("Not found", 404);

      ApplicationGraph.update(appID, appValues).then(
         (app) => {
            res.AD.success(app);
         },
         (err) => {
            if (err.code == 404) {
               res.AD.error("System cound not found this application", 404);
            } else {
               res.AD.error(false);
            }

            console.error(err);
         }
      );
   },

   /**
    * DELETE /app_builder/application/:appID
    * remove an application
    *
    */
   applicationRemove: function(req, res) {
      let appID = req.param("appID");

      ApplicationGraph.remove(appID).then(
         () => {
            res.AD.success(true);
         },
         (err) => {
            if (err.code == 404) {
               res.AD.error("System cound not found this application", 404);
            } else {
               res.AD.error(false);
            }

            console.error(err);
         }
      );
   },

   /**
    * PUT /app_builder/application/:appID/info
    *
    * Save info (name/description) of ABApplicaiton
    *
    */
   applicationSave: function(req, res) {
      var appID = req.param("appID");
      var appInfo = req.body.translations;
      var appIsAdmin = JSON.parse(req.body.isAdminApp || false);

      if (!appID) {
         return res.AD.error("Not found", 404);
      }

      Promise.resolve()
         .catch(() => {
            res.AD.error(true);
         })
         .then(() => {
            // Save application data
            return new Promise((next, err) => {
               let appValues = {
                  isAdminApp: appIsAdmin,
                  json: {
                     translations: appInfo
                  }
               };

               ApplicationGraph.update(appID, appValues)
                  .catch(res.AD.error)
                  .then(function(app) {
                     if (app) {
                        // TODO return valid app values
                        next(app);
                     } else {
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

   /* Views */

   /**
    * PUT /app_builder/application/:appID/view
    *
    * Add/Update a page/view into ABApplication
    */
   viewSave: function(req, res) {
      var appID = req.param("appID");
      var resolveUrl = req.body.resolveUrl;
      var vals = req.body.data || {};
      var updateItem;

      Promise.resolve()
         .catch((err) => {
            res.AD.error(err);
         })
         .then(() => {
            // Pull a application
            return new Promise((resolve, reject) => {
               ApplicationGraph.findOne(appID)
                  .catch(reject)
                  .then((result) => {
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

               updateItem = data.appClass.urlResolve(resolveUrl);

               // update
               if (updateItem) {
                  let ignoreProps = [
                     "id",
                     "application",
                     "pages",
                     "_pages",
                     "views",
                     "_views"
                  ];

                  // clear old values
                  for (let key in updateItem) {
                     if (ignoreProps.indexOf(key) > -1) continue;

                     delete updateItem[key];
                  }

                  // add update values
                  for (let key in vals) {
                     if (ignoreProps.indexOf(key) > -1) continue;

                     updateItem[key] = vals[key];
                  }

                  // Update sub-views
                  if (vals.views && vals.views.length) {
                     updateItem._views = [];
                     (vals.views || []).forEach((v) => {
                        updateItem._views.push(
                           updateItem.viewNew(v, data.appClass, updateItem)
                        );
                     });
                  }
               }

               // add new
               else {
                  // get the parent of view
                  var parts = resolveUrl.split("/");
                  parts.pop();
                  var parentUrl = parts.join("/");
                  var parent = data.appClass.urlResolve(parentUrl);

                  // add new page/view to the parent
                  if (parent && parent.push) {
                     updateItem = new ABView(vals, data.appClass);
                     parent.push(updateItem);
                  }
               }

               // update data to application
               var updateApp = data.appClass.toObj();
               data.app.json = updateApp.json;

               // save to database
               data.app
                  .save()
                  .catch(reject)
                  .then(() => {
                     // refresh application class
                     data.appClass = data.app.toABClass();

                     resolve(data);
                  });
            });
         })
         .then((data) => {
            if (updateItem == null) return Promise.resolve();

            let langCode = ADCore.user.current(req).getLanguageCode(); // 'en';

            // Update nav page
            return _UpdateNavPage(
               data.appClass,
               data.app,
               langCode,
               updateItem
            );
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
    * PUT /app_builder/application/:appID/viewReorder
    *
    * Reorder sub-views
    */
   viewReorder: function(req, res) {
      let appID = req.param("appID");
      let resolveUrl = req.body.resolveUrl;
      let subviews = req.body.data || [];
      let updateItem;

      Promise.resolve()
         .catch((err) => {
            res.AD.error(err);
         })
         .then(() => {
            // Pull a application
            return new Promise((resolve, reject) => {
               ApplicationGraph.findOne(appID)
                  .catch(reject)
                  .then((result) => {
                     resolve({
                        app: result,
                        appClass: result.toABClass()
                     });
                  });
            });
         })
         .then((data) => {
            // Update .position of sub-views
            return new Promise((resolve, reject) => {
               updateItem = data.appClass.urlResolve(resolveUrl);
               if (updateItem == null) return resolve();

               (updateItem._views || []).forEach((v) => {
                  let subView = subviews.filter((subV) => subV.id == v.id)[0];
                  if (subView && subView.position) {
                     v.position = subView.position;
                  }
               });

               // update data to application
               var updateApp = data.appClass.toObj();
               data.app.json = updateApp.json;

               // save to database
               data.app
                  .save()
                  .catch(reject)
                  .then(() => {
                     // refresh application class
                     data.appClass = data.app.toABClass();

                     resolve(data);
                  });
            });
         })
         .then((data) => {
            if (updateItem == null) return Promise.resolve();

            let langCode = ADCore.user.current(req).getLanguageCode(); // 'en';

            // Update nav page
            return _UpdateNavPage(
               data.appClass,
               data.app,
               langCode,
               updateItem
            );
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
    * DELETE /app_builder/application/:appID/view
    *
    * Delete a page/view in ABApplication
    */
   viewDestroy: function(req, res) {
      var appID = req.param("appID");
      var resolveUrl = req.body.resolveUrl;
      var pageName;

      Promise.resolve()
         .catch((err) => {
            res.AD.error(err);
         })
         .then(() => {
            // Pull a application
            return new Promise((resolve, reject) => {
               ApplicationGraph.findOne(appID)
                  .catch(reject)
                  .then((result) => {
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

               if (deletePage.parent == null) pageName = deletePage.name;

               // get the parent(array) of view
               var parts = resolveUrl.split("/");
               parts.pop();
               var parentUrl = parts.join("/");
               var parent = appClass.urlResolve(parentUrl); // should be a array

               // get index of item
               var indexPage = parent.findIndex(function(page) {
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
               if (Application == null || !pageName) return resolve();

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
   getPageRoles: function(req, res) {
      var action_key = req.param("action_key");

      Permissions.getUserRoles(req, true)
         .fail(function(err) {
            res.AD.error(err);
         })
         .then(function(result) {
            var roles = result;

            Permissions.getRolesByActionKey(action_key)
               .fail(function(err) {
                  res.AD.error(err);
               })
               .then(function(result) {
                  res.AD.success({
                     roles: roles,
                     selected: result
                  });
               });
         });
   },

   /**
    * PUT /app_builder/page/:action_key/role/assign
    *
    * Add new role to the current page's list of permission roles
    */
   addPageRoles: function(req, res) {
      var role_id = req.param("role_id");
      var action_key = req.param("action_key");

      Permissions.assignAction(role_id, action_key)
         .fail(function(err) {
            res.AD.error(err);
         })
         .then(function(result) {
            res.AD.success({
               body: result
            });
         });
   },

   /**
    * DELETE /app_builder/page/:action_key/role
    *
    * Delete role from the current page's list of permission roles
    */
   deletePageRoles: function(req, res) {
      var role_id = req.param("role_id");
      var action_key = req.param("action_key");

      Permissions.removeAction(role_id, action_key)
         .fail(function(err) {
            res.AD.error(err);
         })
         .then(function(result) {
            res.AD.success({
               body: result
            });
         });
   },

   /**
    * GET /app_builder/application/:appID/livepage/:pageID
    *
    * Return live display
    */
   livePage: function(req, res) {
      let appID = req.param("appID");
      let pageID = req.param("pageID");

      let datacollectionIds = [];
      let datasources = [];

      Promise.resolve()
         .then(() => {
            // Find application and page
            return new Promise((next, err) => {
               ApplicationGraph.findOne(appID).then((app) => {
                  if (!app) return next(null);

                  let result = app.toValidJsonFormat();

                  // Reduce data size to the live display
                  if (pageID && result.json) {
                     result.json.pages = (result.json.pages || []).filter(
                        (p) => p.id == pageID
                     );
                  }

                  next(result);
               }, err);
            });
         }, console.error)

         .then((app) => {
            if (!app) return Promise.resolve();

            let addDataviewIdToList = (views) => {
               (views || []).forEach((v) => {
                  if (!v) return;

                  // add data view id
                  let dvIDS =
                     v.settings && v.settings.dataviewID
                        ? v.settings.dataviewID
                        : "";
                  if (dvIDS) {
                     // multi dv ids
                     if (dvIDS.indexOf(",") > -1) {
                        dvIDS.split(",").forEach((dvId) => {
                           if (datacollectionIds.indexOf(dvId) < 0) {
                              datacollectionIds.push(dvId);
                           }
                        });
                     }
                     // single dv id
                     else {
                        if (datacollectionIds.indexOf(dvIDS) < 0) {
                           datacollectionIds.push(dvIDS);
                        }
                     }
                  }

                  addDataviewIdToList(v.pages || []);
                  addDataviewIdToList(v.views || []);
               });
            };

            addDataviewIdToList(app.json.pages);

            return Promise.resolve(app);
         })

         // Pull data views
         .then((app) => {
            return new Promise((next, err) => {
               if (!app) return next();

               // pull ids of data view
               DataviewGraph.find({
                  relations: ["object"],
                  where: {
                     _key: { in: datacollectionIds }
                  }
               })
                  .catch(err)
                  .then((dataviews) => {
                     let tasks = [];

                     // pull Query data source
                     (dataviews || []).forEach((dv) => {
                        tasks.push(dv.pullQueryDatasource());
                     });

                     Promise.all(tasks)
                        .catch(err)
                        .then(() => {
                           app.json.datacollections = dataviews || [];

                           next(app);
                        });
                  });
            });
         }, console.error)

         // Pull link objects who are used in detail and form widgets
         .then((app) => {
            return new Promise((next, err) => {
               if (!app) return next();

               let remainsObjectIds = [];

               // Pull objects and queries from data views
               datasources = app.json.datacollections
                  .map((dv) => {
                     if (dv.query && dv.query[0]) {
                        return dv.query[0];
                     } else if (dv.object && dv.object[0]) {
                        return dv.object[0];
                     }
                  })
                  .filter((ds) => ds);

               // Find missing objects
               datasources.forEach((ds) => {
                  if (ds && ds.fields) {
                     (ds.fields || []).forEach((f) => {
                        if (
                           f.key != "connectObject" ||
                           !f.settings ||
                           !f.settings.linkObject
                        )
                           return;

                        if (
                           datasources.filter(
                              (d) => d.id == f.settings.linkObject
                           ).length < 1
                        )
                           remainsObjectIds.push(f.settings.linkObject);
                     });
                  }
               });

               if (remainsObjectIds.length < 1) return next(app);

               ObjectGraph.find({
                  where: {
                     _key: { in: remainsObjectIds }
                  }
               })
                  .catch(err)
                  .then((objects) => {
                     app.json.objects = objects;

                     next(app);
                  });
            });
         })

         // Pull queries from 'in_query' filter of data collections
         .then(
            (app) =>
               new Promise((next, err) => {
                  if (!app) return next();

                  let remainsQueryIds = [];

                  (app.json.datacollections || []).forEach((dc) => {
                     if (
                        dc.settings &&
                        dc.settings.objectWorkspace &&
                        dc.settings.objectWorkspace.filterConditions
                     ) {
                        (
                           dc.settings.objectWorkspace.filterConditions.rules ||
                           []
                        ).forEach((r) => {
                           if (
                              (r.rule == "in_query" ||
                                 r.rule == "not_in_query") &&
                              datasources.filter((ds) => ds.id == r.value)
                                 .length < 1
                           ) {
                              remainsQueryIds.push(r.value);
                           }
                        });
                     }
                  });

                  if (remainsQueryIds.length < 1) return next(app);

                  QueryGraph.find({
                     where: {
                        _key: { in: remainsQueryIds }
                     }
                  })
                     .catch(err)
                     .then((queries) => {
                        app.json.queries = queries;

                        next(app);
                     });
               })
         )

         .then((app) => {
            if (app) res.AD.success(app);
            else res.AD.error("Not found this application", 404);
         });
   },

   /**
    * GET /app_builder/appJSON/:id?download=1
    *
    * Export an app in JSON format
    */
   jsonExport: function(req, res) {
      var appID = req.param("id");
      var forDownload = req.param("download");

      AppBuilderExport.appToJSON(appID)
         .fail(function(err) {
            res.AD.error(err);
         })
         .done(function(data) {
            if (forDownload) {
               res.set(
                  "Content-Disposition",
                  'attachment; filename="app.json"'
               );
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
      req.file("upload").upload(function(err, files) {
         if (err) {
            console.log("jsonImport upload error", err);
            res.send({ status: "error" });
            //res.AD.error(err);
         } else if (!files || !files[0]) {
            //res.AD.error(new Error('No file was uploaded'));
            res.send({ status: "error" });
         } else {
            fs.readFile(files[0].fd, function(err, data) {
               if (err) {
                  console.log("jsonImport read error", err);
                  res.send({ status: "error" });
                  //res.AD.error(err);
               } else {
                  try {
                     var jsonData = JSON.parse(data.toString());
                     AppBuilderExport.appFromJSON(jsonData)
                        .fail(function(err) {
                           console.log("jsonImport import error", err);
                           res.send({
                              status: "error",
                              message: err.message,
                              error: err
                           });
                           //res.AD.error(err);
                        })
                        .done(function() {
                           res.send({ status: "server" });
                        });
                  } catch (err) {
                     console.log("jsonImport parse error", err);
                     res.send({
                        status: "error",
                        message: "json parse error",
                        error: err
                     });
                     //res.AD.error(err);
                  }
               }
            });
         }
      });
   },

   // GET /app_builder/application/:appID/findModels
   findModels: function(req, res) {
      var appID = req.param("appID");
      var result = [];

      ApplicationGraph.find({ id: { "!": appID } })
         .populate("translations")
         .fail(res.AD.error)
         .then(function(apps) {
            // pull objects to array
            apps.forEach(function(app) {
               if (app.json.objects != null) {
                  // get properties of objects
                  var objects = app.json.objects.map(function(obj) {
                     return {
                        id: obj.id,
                        name: obj.name,
                        fields: obj.fields,
                        translations: obj.translations,
                        application: app
                     };
                  });

                  result = result.concat(objects);
               }
            });

            res.AD.success(result);
         });
   },

   // POST /app_builder/application/:appID/importModel
   importModel: function(req, res) {
      var targetAppID = parseInt(req.param("appID") || 0);
      var sourceAppID = parseInt(req.param("sourceAppId") || 0);
      var objectID = req.param("objectId") || "";
      var columns = req.param("columns") || [];

      // Convert "true"/"false" to boolean
      columns = columns.map(function(col) {
         col.isHidden = JSON.parse(col.isHidden);
         return col;
      });

      var currLangCode = ADCore.user.current(req).getLanguageCode(); // 'en';

      Promise.resolve()
         .catch((err) => {
            res.AD.error(err);
         })
         .then(() => {
            // Import a object
            return new Promise((resolve, reject) => {
               AppBuilder.importObject(
                  sourceAppID,
                  targetAppID,
                  objectID,
                  columns,
                  currLangCode
               )
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
                  .then(function(app) {
                     var appClass = app.toABClass();
                     var newObject = appClass.objects(
                        (obj) => obj.id == objId
                     )[0];
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
    * GET /app_builder/mobile/apps
    *
    * return a list of all Mobile Apps across all Applications.
    * (administrative)
    *
    * the returned list is a list of { .id  .label .appID }
    *
    */
   listMobileApps: function(req, res) {
      AppBuilder.mobileApps()
         .then((list) => {
            var objList = [];
            list.forEach((l) => {
               objList.push(l.toObj());
            });

            res.AD.success(objList);
         })
         .catch((err) => {
            ADCore.Error.log(
               "ABApplicationController:listMobileApps:Error getting mobile apps:",
               { error: err }
            );
            res.AD.error(err);
         });
   }
};

function _UpdateNavPage(appClass, app, langCode, updateItem) {
   // Update page's nav view
   return new Promise((resolve, reject) => {
      if (appClass == null || app == null) return resolve();

      let rootPage = updateItem.isRoot() ? updateItem : updateItem.pageRoot();
      let rootPageId = rootPage.id;
      let rootPageLabel = rootPage.label;

      var pageClass = appClass._pages.filter((p) => p.id == rootPageId)[0];
      if (pageClass) {
         // find page name
         var pageLabel;
         (pageClass.translations || []).forEach((trans) => {
            if (trans.language_code == "en") {
               pageLabel = trans.label.replace(/[^a-z0-9 ]/gi, "");
            }
         });

         let options = {
            name: pageClass.name,
            label: pageLabel || rootPageLabel || pageClass.name,
            pageID: pageClass.id,
            icon: pageClass.icon
         };

         return AppBuilder.updateNavView(app, options, langCode)
            .catch(reject)
            .then(resolve);
      } else resolve();
   });
}

function jsonDataSave(appID, keyData, jsonEntry, req, res) {
   console.log();
   console.log(
      "jsonDataSave(): keyData[" + keyData + "]  jsonEntry:",
      jsonEntry
   );
   console.log();
   ApplicationGraph.findOne({ id: appID })
      .fail(res.AD.error)
      .then(function(app) {
         if (app) {
            app.json[keyData] = app.json[keyData] || [];

            var indexObj = -1;
            var updateObj = app.json[keyData].filter(function(obj, index) {
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
            console.log("app.json[" + keyData + "] : ", app.json[keyData]);
            console.log();
            // save to database
            app.save()
               .catch((err) => {
                  res.AD.error(true);
               })
               .then(() => {
                  res.AD.success(true);
               });
         } else {
            res.AD.success(true);
         }
      });
}

function jsonDataDestroy(appID, keyData, itemID, req, res) {
   ApplicationGraph.findOne({ id: appID })
      .fail(res.AD.error)
      .then(function(app) {
         if (app) {
            app.json[keyData] = app.json[keyData] || [];

            var indexObj = -1;
            var updateObj = app.json[keyData].filter(function(obj, index) {
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
         } else {
            res.AD.success(true);
         }
      });
}
