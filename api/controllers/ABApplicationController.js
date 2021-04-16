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

var ABApplication = require("../classes/platform/ABApplication");
const moment = require("moment");

module.exports = {
   // _config: {
   //    model: "abapplication", // all lowercase model name
   //    actions: false,
   //    shortcuts: false,
   //    rest: false
   // },

   /**
    * @route {GET} /app_builder/page/:action_key/role
    *
    * @description Request the current page's list of permission roles as well as all possible roles with descriptions
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
    * @route {PUT} /app_builder/page/:action_key/role
    *
    * @description Add new role to the current page's list of permission roles
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
    * @route{DELETE} /app_builder/page/:action_key/role
    *
    * @description Delete role from the current page's list of permission roles
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
    * @route {GET} /app_builder/appJSON/:id?download=1
    *
    * @description Export an app in JSON format
    */
   jsonExport: function(req, res) {
      var appID = req.param("id");
      var forDownload = req.param("download");

      var Application = ABSystemObject.getApplication();

      var nameTag = "app";
      var Application = ABApplication.applicationForID(appID);
      if (Application && Application.name) {
         nameTag = _.camelCase(Application.name);
      }
      var dateTag = moment().format("YYYYMMDD");
      AppBuilderExport.appToJSON(appID)
         .then(function(data) {
            if (forDownload) {
               res.set(
                  "Content-Disposition",
                  `attachment; filename="${nameTag}_${dateTag}.json"`
               );
            }
            res.json(data);
         })
         .catch(function(err) {
            console.log(err);
            res.AD.error(err);
         });
   },

   /**
    * @route {GET} /app_builder/appJSONall/
    *
    * @description Export an app in JSON format
    */
   jsonExportAll: function(req, res) {
      var appID = req.param("id");
      var forDownload = req.param("download");

      var allExports = [];
      // {array} of promises
      // Tracks each of the .appToJSON() functions so we know when they
      // are complete.

      var exportData = null;
      // {obj}
      // this will mimic the final output format to return to the request.
      // {
      //    abVersion: "x.x.x",
      //    definitions; [ {def}, ... ]
      // }

      var dataHash = {};
      // {hash}  {def.id : def }
      // we use this to exclude any duplicate definitions. We parse this into
      // our final list at the end.

      var allApps = ABApplication.applications();
      (allApps || []).forEach((app) => {
         allExports.push(
            AppBuilderExport.appToJSON(app.id).then(function(data) {
               if (!exportData) {
                  exportData = data;
               }
               (data.definitions || []).forEach((def) => {
                  dataHash[def.id] = def;
               });
            })
         );
      });

      Promise.all(allExports)
         .then(function(data) {
            // reset our export.definitions
            exportData.definitions = [];

            // parse each entry in our dataHash & store it in our
            // definitions
            Object.keys(dataHash).forEach((k) => {
               exportData.definitions.push(dataHash[k]);
            });

            var dateTag = moment().format("YYYYMMDD");

            if (forDownload) {
               res.set(
                  "Content-Disposition",
                  `attachment; filename="appbuilder_${dateTag}.json"`
               );
            }
            res.json(exportData);
         })
         .catch(function(err) {
            console.log(err);
            res.AD.error(err);
         });
   },

   /**
    * @route {POST} /app_builder/appJSON
    *
    * @description Import an app from uploaded JSON data file.
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
                     AppBuilderExport.appFromJSON(jsonData, req.user.data)
                        .then(function() {
                           res.AD.success({ done: true });
                           // unless we need to return the data to the browser:
                           // res.AD.success(jsonData);
                        })
                        .catch(function(err) {
                           console.log(
                              "ABApplicationController.jsonImport(): import error",
                              err
                           );
                           err.message = `json import error : ${err.message}`;
                           res.AD.error(err, 500);
                           //res.AD.error(err);
                        });
                  } catch (err) {
                     console.log("jsonImport parse error", err);
                     err.message = `json parse error : ${err.message}`;
                     res.AD.error(err, 500);
                  }
               }
            });
         }
      });
   },

   /* Mobile Apps */
   /* An Application may have one or more Mobile Apps. */

   /**
    * @route {GET} /app_builder/mobile/apps
    *
    * @description return a list of all Mobile Apps across all Applications.
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
