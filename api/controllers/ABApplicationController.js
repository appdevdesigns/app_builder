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

module.exports = {
   _config: {
      model: "abapplication", // all lowercase model name
      actions: false,
      shortcuts: false,
      rest: false
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
    * PUT /app_builder/page/:action_key/role
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
    * GET /app_builder/appJSON/:id?download=1
    *
    * Export an app in JSON format
    */
   jsonExport: function(req, res) {
      var appID = req.param("id");
      var forDownload = req.param("download");

      AppBuilderExport.appToJSON(appID)
         .then(function(data) {
            if (forDownload) {
               res.set(
                  "Content-Disposition",
                  'attachment; filename="app.json"'
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
