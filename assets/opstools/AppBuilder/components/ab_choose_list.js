/*
 * AB Choose List
 *
 * Display a list of Applications for the user to select.
 *
 */
const ABApplication = require("../classes/platform/ABApplication");
const ABComponent = require("../classes/platform/ABComponent");
const AB_Choose_List_Menu = require("./ab_common_popupEditMenu");

module.exports = class ABChooseList extends ABComponent {
   constructor(App) {
      super(App, "ab_choose_list");

      var L = this.Label;

      var labels = {
         common: App.labels,

         component: {
            title: L("ab.application.application", "*Applications"),
            administration: L(
               "ab.application.administration",
               "*Administration"
            ),
            settings: L("ab.application.settings", "*Settings"),
            createNew: L("ab.application.createNew", "*Add new application"),
            noApplication: L(
               "ab.application.noApplication",
               "*There is no application data"
            ),

            confirmDeleteTitle: L(
               "ab.application.delete.title",
               "*Delete application"
            ),
            confirmDeleteMessage: L(
               "ab.application.delete.message",
               "*Do you want to delete <b>{0}</b>?"
            )
         }
      };

      var ids = {
         component: this.unique("component"),

         uploader: this.unique("uploader"),
         exporter: this.unique("exporter"),
         list: this.unique("list"),
         toolBar: this.unique("toolbar"),
         buttonCreateNewApplication: this.unique("buttonNewApp")
      };

      var MenuComponent = new AB_Choose_List_Menu(App);

      this.ui = {
         id: ids.component,
         responsive: "hide",
         type: "space",

         cols: [
            {
               maxWidth: App.config.appListSpacerColMaxWidth,
               minWidth: App.config.appListSpacerColMinWidth,
               width: App.config.appListSpacerColMaxWidth
            },
            {
               responsiveCell: false,
               rows: [
                  {
                     maxHeight: App.config.appListSpacerRowHeight,
                     hidden: App.config.hideMobile
                  },
                  //
                  // ToolBar
                  //
                  {
                     view: "toolbar",
                     css: "webix_dark",
                     id: ids.toolBar,
                     cols: [
                        { view: "spacer", width: 10 },
                        {
                           view: "label",
                           label: labels.component.title,
                           fillspace: true
                        },
                        {
                           view: "button",
                           type: "icon",
                           label: labels.component.administration,
                           icon: "fa fa-user",
                           autowidth: true,
                           css: "webix_transparent",
                           click: () => {
                              App.actions.transitionAdministration();
                           }
                        },
                        {
                           view: "button",
                           type: "icon",
                           label: labels.component.settings,
                           icon: "fa fa-cog",
                           autowidth: true,
                           css: "webix_transparent",
                           click: () => {
                              this.emit("view.config");
                           }
                        },
                        {
                           id: ids.buttonCreateNewApplication,
                           view: "button",
                           label: labels.component.createNew,
                           autowidth: true,
                           type: "icon",
                           icon: "fa fa-plus",
                           css: "webix_transparent",
                           click: function() {
                              // Inform our Chooser we have a request to create an Application:
                              App.actions.transitionApplicationForm(/* leave empty for a create */);
                           }
                        },
                        {
                           view: "uploader",
                           id: ids.uploader,
                           label: labels.common.import,
                           autowidth: true,
                           upload: "/app_builder/appJSON",
                           multiple: false,
                           type: "icon",
                           icon: "fa fa-upload",
                           autosend: true,
                           css: "webix_transparent",
                           on: {
                              onAfterFileAdd: function() {
                                 _logic.onAfterFileAdd();
                              },
                              onFileUpload: function(item, response) {
                                 _logic.onFileUpload(item, response);
                              },
                              onFileUploadError: function(details, response) {
                                 _logic.onFileUploadError(details, response);
                              }
                           }
                        },
                        {
                           view: "button",
                           id: ids.exporter,
                           label: labels.common.export,
                           autowidth: true,
                           type: "icon",
                           icon: "fa fa-download",
                           css: "webix_transparent",
                           click: function() {
                              window.location.assign(
                                 "/app_builder/appJSONall?download=1"
                              );
                           }
                        }
                     ]
                  },

                  //
                  // The List of Applications
                  //
                  {
                     id: ids.list,
                     view: "list",
                     css: "ab-app-select-list",
                     template: function(obj, common) {
                        return _logic.templateListItem(obj, common);
                     },
                     type: {
                        height: App.config.appListRowHeight, // Defines item height
                        iconGear: "<span class='webix_icon fa fa-cog'></span>",
                        iconAdmin: function(app) {
                           return app.isAdminApp
                              ? "<span class='webix_icon fa fa-circle-o-notch'></span> "
                              : "";
                        }
                     },
                     select: false,
                     onClick: {
                        "ab-app-list-item": function(ev, id, trg) {
                           return _logic.onClickListItem(ev, id, trg);
                        },
                        "ab-app-list-edit": function(ev, id, trg) {
                           return _logic.onClickListEdit(ev, id, trg);
                        }
                     },
                     onHover: {}
                  },
                  {
                     maxHeight: App.config.appListSpacerRowHeight,
                     hidden: App.config.hideMobile
                  }
               ]
            },
            {
               maxWidth: App.config.appListSpacerColMaxWidth,
               minWidth: App.config.appListSpacerColMinWidth,
               width: App.config.appListSpacerColMaxWidth
            }
         ]
      };

      var _data = {};

      var _logic = {
         /**
          * @function busy
          *
          * show a busy indicator on our App List
          */
         busy: function() {
            $$(ids.list).disable();

            if ($$(ids.list).showProgress)
               $$(ids.list).showProgress({ type: "icon" });
         },

         callbackApplicationEditorMenu: function(action) {
            var selectedApp = $$(ids.list).getSelectedItem();

            switch (action) {
               case "edit":
                  _logic.editApplication(selectedApp.id);
                  break;

               case "delete":
                  OP.Dialog.ConfirmDelete({
                     title: labels.component.confirmDeleteTitle,
                     text: labels.component.confirmDeleteMessage.replace(
                        "{0}",
                        selectedApp.label
                     ),
                     callback: function(result) {
                        if (!result) return;

                        App.actions.deleteApplication(selectedApp);
                     }
                  });
                  break;

               case "export":
                  // Download the JSON file to disk
                  window.location.assign(
                     "/app_builder/appJSON/" + selectedApp.id + "?download=1"
                  );
                  break;
            }
         },

         /**
          * @function loadData
          *
          * Load all the ABApplications and display them in our App List
          */
         loadData: () => {
            if (this.loaded) return;

            this.loaded = true;

            // Get applications data from the server
            _logic.busy();

            // Q: is it possible this might be delayed before the
            //    .applicationInfo() below is complete, continues and this info
            //    is needed?
            ABApplication.initRoles();

            // ABApplication.allApplications()
            ABApplication.applicationInfo()
               .then(function(data) {
                  // make sure our overlay is updated when items are added/removed
                  // from our data list.
                  data.attachEvent("onAfterAdd", function(id, index) {
                     _logic.refreshOverlay();
                  });

                  data.attachEvent("onAfterDelete", function(id) {
                     _logic.refreshOverlay();
                  });

                  _data.listApplications = data;

                  _data.listApplications.sort("label");

                  _logic.refreshList();

                  _logic.ready();
               })
               .catch(function(err) {
                  _logic.ready();
                  webix.message({
                     type: "error",
                     text: err
                  });
                  AD.error.log("App Builder : Error loading application data", {
                     error: err
                  });
               });
         },

         /**
          * @function onAfterFileAdd
          *
          * UI updates for when a file upload is initiated
          */
         onAfterFileAdd: function() {
            $$(ids.uploader).disable();
            _logic.busy();
         },

         /**
          * @function onClickListEdit
          *
          * UI updates for when the edit gear is clicked
          */
         onClickListEdit: function(ev, id, trg) {
            var options = [
               {
                  label: labels.common.edit,
                  icon: "fa fa-pencil-square-o",
                  command: "edit"
               },
               {
                  label: labels.common.export,
                  icon: "fa fa-download",
                  command: "export"
               },
               {
                  label: labels.common.delete,
                  icon: "fa fa-trash",
                  command: "delete"
               }
            ];

            MenuComponent.menuOptions(options);

            // Show menu
            MenuComponent.show(trg);
            $$(ids.list).select(id);

            return false; // block default behavior
         },

         pullApplication: (appId) => {
            return new Promise((resolve, reject) => {
               let selectedApp = $$(ids.list).getItem(appId);

               // Since moving to ABDefinition, we no longer have
               // to pull a fuller version of the ABApplication from
               // the server:

               if (selectedApp) {
                  resolve(selectedApp);
                  return;
               }
               reject(new Error(`unknown App.id [${appId}]`));

               /*
               // loaded full data of application already
               if (selectedApp._isFullLoaded) {
                  resolve(selectedApp);
               }
               // there is meta of application, need to load full data
               else {
                  ABApplication.get(appId).then((app) => {
                     app._isFullLoaded = true;

                     // update to list
                     // _data.listApplications.updateItem(appId, app);

                     // NOTE: could not use .updateItem() because it redirects same object not new Application instance from .get()
                     _data.listApplications.remove(appId, app);
                     _data.listApplications.add(app);
                     _data.listApplications.sort("label");

                     resolve(_data.listApplications.getItem(appId));
                  });
               }
               */
            });
         },

         /**
          * @function onClickListItem
          *
          * An item in the list is selected. So update the workspace with that
          * object.
          */
         onClickListItem: function(ev, id, trg) {
            _logic.busy();

            $$(ids.list).select(id);

            Promise.resolve()

               .then(() => _logic.pullApplication(id))

               .then((selectedApp) => {
                  return new Promise((next, err) => {
                     if (selectedApp) {
                        // set the common App so it is accessible for all the Applications views
                        selectedApp.App = App;

                        // We've selected an Application to work with
                        App.actions.transitionWorkspace(selectedApp);
                     }

                     _logic.ready();
                     next();
                  });
               });

            return false; // block default behavior
         },

         editApplication: (appId) => {
            _logic.busy();

            Promise.resolve()

               .then(() => _logic.pullApplication(appId))

               .then((selectedApp) => {
                  return new Promise((next, err) => {
                     if (selectedApp) {
                        App.actions.transitionApplicationForm(selectedApp);
                     }

                     _logic.ready();
                     next();
                  });
               });
         },

         /**
          * @function onFileUpload
          *
          * The File Upload process finished.
          */
         onFileUpload: (item, response) => {
            this.loaded = false;
            _logic.loadData(); // refresh app list
            $$(ids.uploader).enable();
            _logic.ready();
         },

         /**
          * @function onFileUploadError
          *
          * The File Upload process exited with an error.
          */
         onFileUploadError: function(details, response) {
            var errorMessage = "Error: " + (response && response.message);
            OP.Dialog.Alert({
               text: errorMessage
            });
            // webix.message({
            // 	type: 'error',
            // 	text: errorMessage
            // });
            _logic.loadData(); // refresh app list
            $$(ids.uploader).enable();
            _logic.ready();
         },

         /**
          * @function refreshOverlay
          *
          * If we have no items in our list, display a Message.
          */
         refreshOverlay: function() {
            var appList = $$(ids.list);

            if (!appList.count())
               //if no data is available
               appList.showOverlay(labels.component.noApplication);
            else appList.hideOverlay();
         },

         /**
          * @function ready
          *
          * remove the busy indicator on our App List
          */
         ready: function() {
            $$(ids.list).enable();

            if ($$(ids.list).hideProgress) $$(ids.list).hideProgress();
         },

         /**
          * @function reset
          *
          * Return our App List to an unselected state.
          */
         reset: function() {
            $$(ids.list).unselectAll();
         },

         /**
          * @function refreshList
          *
          * Apply our list of ABApplication data to our AppList
          */
         refreshList: function() {
            var appList = $$(ids.list);

            appList.clearAll();
            appList.data.unsync();
            appList.data.sync(_data.listApplications);

            appList.sort("label", "asc");

            _logic.refreshOverlay();

            appList.refresh();

            _logic.ready();
         },

         /**
          * @function show
          *
          * Trigger our List component to show
          */
         show: function() {
            $$(ids.component).show();

            // start things off by loading the current list of Applications
            _logic.loadData();
         },

         /**
          * @function templateListItem
          *
          * Defines the template for each row of our AppList.
          *
          * @param {obj} obj the current instance of ABApplication for the row.
          * @param {?} common the webix.common icon data structure
          * @return {string}
          */
         templateListItem: function(obj, common) {
            return _templateListItem
               .replace("#label#", obj.label || "")
               .replace("#description#", obj.description || "")
               .replace("{common.iconAdmin}", common.iconAdmin(obj))
               .replace("{common.iconGear}", common.iconGear);
         }
      };
      this._logic = _logic;

      /*
       * _templateListItem
       *
       * The AppList Row template definition.
       */
      var _templateListItem = [
         "<div class='ab-app-list-item'>",
         "<div class='ab-app-list-info'>",
         "<div class='ab-app-list-name'>{common.iconAdmin}#label#</div>",
         "<div class='ab-app-list-description'>#description#</div>",
         "</div>",
         "<div class='ab-app-list-edit'>",
         "{common.iconGear}",
         "</div>",
         "</div>"
      ].join("");

      /*
       * @function _init
       *
       * The init() that performs the necessary setup for our AppList chooser.
       */
      this.init = function() {
         webix.extend($$(ids.list), webix.ProgressBar);
         webix.extend($$(ids.list), webix.OverlayBox);

         MenuComponent.init({
            onClick: _logic.callbackApplicationEditorMenu
         });

         this.show();
      };

      /*
       * The exported methods available to other Components.
       */
      this.actions({
         /**
          * @function unselectApplication
          *
          * resets the AppList to an unselected state.
          */
         unselectApplication: function() {
            _logic.reset();
         },

         /**
          * @function getSelectedApplication
          *
          * returns which ABApplication is currently selected.
          * @return {ABApplication}  or {null} if nothing selected.
          */
         getSelectedApplication: function() {
            return $$(ids.list).getSelectedItem();
         },

         /**
          * @function deleteApplication
          *
          * deletes the given ABAppliction.
          *
          * NOTE: this assumes the component using this method has already
          * provided the delete confirmation.
          *
          * @param {ABApplication} app  the ABAppliction to delete.
          */
         deleteApplication: function(app) {
            if (!app) return;

            // Delete application data
            _logic.busy();

            app.destroy()
               .then(function(result) {
                  _logic.refreshList();
                  _logic.reset();
                  _logic.ready();

                  webix.message({
                     type: "success",
                     text: labels.common.deleteSuccessMessage.replace(
                        "{0}",
                        app.label
                     )
                  });
               })
               .catch(function(err) {
                  _logic.reset();
                  _logic.ready();

                  webix.message({
                     type: "error",
                     text: labels.common.deleteErrorMessage.replace(
                        "{0}",
                        app.label
                     )
                  });

                  AD.error.log("App Builder : Error delete application data", {
                     error: err
                  });
               });
         },

         /**
          * @function transitionApplicationList
          *
          * Trigger our List component to show
          */
         transitionApplicationList: () => {
            _logic.refreshList();
            this.show();
         }
      });

      this.show = _logic.show;
   }
};
