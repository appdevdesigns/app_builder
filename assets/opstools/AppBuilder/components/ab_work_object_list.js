/*
 * ab_work_object_list
 *
 * Manage the Object List
 *
 */

const ABComponent = require("../classes/platform/ABComponent");
const ABListNewObject = require("./ab_work_object_list_newObject");
const ABListEditMenu = require("./ab_common_popupEditMenu"); // "./ab_work_object_list_popupEditMenu"

module.exports = class AB_Work_Object_List extends ABComponent {
   //.extend(idBase, function(App) {

   constructor(App) {
      super(App, "ab_work_object_list");
      var L = this.Label;

      var labels = {
         common: App.labels,
         component: {
            addNew: L("ab.object.addNew", "*Add new object"),

            confirmDeleteTitle: L("ab.object.delete.title", "*Delete object"),
            confirmDeleteMessage: L(
               "ab.object.delete.message",
               "*Do you want to delete <b>{0}</b>?"
            ),
            title: L("ab.object.list.title", "*Data Objects"),
            listSearch: L("ab.object.list.search", "*Search"),
            searchPlaceholder: L(
               "ab.object.list.search.placeholder",
               "*Object name"
            ),
            listSetting: L("ab.object.list.setting", "*Setting"),
            listSort: L("ab.object.list.sort", "*Sort"),
            listAsc: L("ab.object.list.sort.asc", "*A -> Z"),
            listDesc: L("ab.object.list.sort.desc", "*Z -> A"),
            listGroup: L("ab.object.list.group", "*Group")
         }
      };

      // internal list of Webix IDs to reference our UI components.
      var ids = {
         component: this.unique("component"),

         listSetting: this.unique("listsetting"),
         list: this.unique("editlist"),
         searchText: this.unique("searchText"),
         sort: this.unique("sort"),
         group: this.unique("group"),
         buttonNew: this.unique("buttonNew")
      };

      // There is a Popup for adding a new Object:
      var PopupNewObjectComponent = new ABListNewObject(App);

      // the popup edit list for each entry in the list.
      var PopupEditObjectComponent = new ABListEditMenu(App);

      // console.log("look here------------------>", App.custom.editunitlist.view);

      // Our webix UI definition:
      this.ui = {
         id: ids.component,
         rows: [
            {
               view: App.custom.editunitlist.view, // "editunitlist"
               id: ids.list,
               width: App.config.columnWidthLarge,

               select: true,

               editaction: "custom",
               editable: true,
               editor: "text",
               editValue: "label",

               uniteBy: function(item) {
                  return labels.component.title;
               },
               template: function(obj, common) {
                  return _logic.templateListItem(obj, common);
               },
               type: {
                  height: 35,
                  headerHeight: 35,
                  iconGear:
                     "<div class='ab-object-list-edit'><span class='webix_icon fa fa-cog'></span></div>"
               },
               on: {
                  onAfterSelect: function(id) {
                     _logic.selectObject(id);
                  },
                  onBeforeEditStop: function(state, editor) {
                     _logic.onBeforeEditStop(state, editor);
                  },
                  onAfterEditStop: function(state, editor, ignoreUpdate) {
                     _logic.onAfterEditStop(state, editor, ignoreUpdate);
                  }
               },
               onClick: {
                  "ab-object-list-edit": function(e, id, trg) {
                     _logic.clickEditMenu(e, id, trg);
                  }
               }
            },
            {
               view: "accordion",
               multi: true,
               css: "ab-object-list-filter",
               rows: [
                  {
                     id: ids.listSetting,
                     header: labels.component.listSetting,
                     headerHeight: 45,
                     headerAltHeight: 45,
                     body: {
                        padding: 5,
                        rows: [
                           {
                              id: ids.searchText,
                              view: "search",
                              icon: "fa fa-search",
                              label: labels.component.listSearch,
                              labelWidth: 80,
                              placeholder: labels.component.searchPlaceholder,
                              height: 35,
                              keyPressTimeout: 100,
                              on: {
                                 onTimedKeyPress: function() {
                                    _logic.listSearch();
                                    _logic.save();
                                 }
                              }
                           },
                           {
                              id: ids.sort,
                              view: "segmented",
                              label: labels.component.listSort,
                              labelWidth: 80,
                              height: 35,
                              options: [
                                 {
                                    id: "asc",
                                    value: labels.component.listAsc
                                 },
                                 {
                                    id: "desc",
                                    value: labels.component.listDesc
                                 }
                              ],
                              on: {
                                 onChange: (newVal, oldVal) => {
                                    _logic.listSort(newVal);
                                    _logic.save();
                                 }
                              }
                           },
                           {
                              id: ids.group,
                              view: "checkbox",
                              label: labels.component.listGroup,
                              labelWidth: 80,
                              on: {
                                 onChange: (newVal, oldVal) => {
                                    _logic.listGroup(newVal);
                                    _logic.save();
                                 }
                              }
                           }
                        ]
                     }
                  }
               ],
               on: {
                  onAfterCollapse: (id) => {
                     _logic.listSettingCollapse();
                     _logic.save();
                  },
                  onAfterExpand: (id) => {
                     _logic.listSettingExpand();
                     _logic.save();
                  }
               }
            },
            {
               view: "button",
               id: ids.buttonNew,
               css: "webix_primary",
               value: labels.component.addNew,
               type: "form",
               click: function() {
                  _logic.clickNewObject(true); // pass true so it will select the new object after you created it
               }
            }
         ]
      };

      var CurrentApplication = null;
      var objectList = null;

      let _initialized = false;
      let _settings = {};

      // Our init() function for setting up our UI
      this.init = (options) => {
         // register our callbacks:
         for (var c in _logic.callbacks) {
            _logic.callbacks[c] = options[c] || _logic.callbacks[c];
         }

         if ($$(ids.component)) $$(ids.component).adjust();

         if ($$(ids.list)) {
            webix.extend($$(ids.list), webix.ProgressBar);
            $$(ids.list).adjust();
         }

         PopupNewObjectComponent.init({
            onDone: _logic.callbackNewObject
         });

         PopupEditObjectComponent.init({
            onClick: _logic.callbackObjectEditorMenu,
            hideCopy: true
         });

         _settings = webix.storage.local.get("object_settings") || {
            objectlistIsOpen: false,
            objectlistSearchText: "",
            objectlistSortDirection: "",
            objectlistIsGroup: false
         };

         // mark initialed
         _initialized = true;
      };

      // our internal business logic
      var _logic = (this._logic = {
         callbacks: {
            /**
             * @function onChange
             */
            onChange: function() {}
         },

         /**
          * @function applicationLoad
          *
          * Initialize the Object List from the provided ABApplication
          *
          * If no ABApplication is provided, then show an empty form. (create operation)
          *
          * @param {ABApplication} application  	[optional] The current ABApplication
          *										we are working with.
          */
         applicationLoad: function(application) {
            //
            if (!application) {
               return;
            }

            _logic.listBusy();

            CurrentApplication = application;

            // get a DataCollection of all our objects
            // FIX: when we list included objects in our Designer, the objects
            // in this workspace need to reference the CurrentApplication as their
            // .application
            var includedObjects = [];
            if (application) {
               includedObjects = application.objectsIncluded() || [];
               includedObjects.forEach((obj) => {
                  obj.application = CurrentApplication;
               });
            }
            objectList = new webix.DataCollection({
               data: includedObjects
            });

            // setup object list settings
            $$(ids.listSetting)
               .getParentView()
               .blockEvent();
            $$(ids.listSetting).define(
               "collapsed",
               _settings.objectlistIsOpen != true
            );
            $$(ids.listSetting).refresh();
            $$(ids.listSetting)
               .getParentView()
               .unblockEvent();

            $$(ids.searchText).blockEvent();
            $$(ids.searchText).setValue(_settings.objectlistSearchText);
            $$(ids.searchText).unblockEvent();

            $$(ids.sort).blockEvent();
            $$(ids.sort).setValue(_settings.objectlistSortDirection);
            $$(ids.sort).unblockEvent();

            $$(ids.group).blockEvent();
            $$(ids.group).setValue(_settings.objectlistIsGroup);
            $$(ids.group).unblockEvent();

            // clear our list and display our objects:
            var List = $$(ids.list);
            List.clearAll();
            List.data.unsync();
            List.data.sync(objectList);
            List.refresh();
            List.unselectAll();

            // sort objects
            _logic.listSort(_settings.objectlistSortDirection);

            // filter object list
            _logic.listSearch();

            // hide progress loading cursor
            _logic.listReady();

            // prepare our Popup with the current Application
            PopupNewObjectComponent.applicationLoad(application);
         },

         clickEditMenu: function(e, id, trg) {
            // Show menu
            PopupEditObjectComponent.show(trg);

            return false;
         },

         listSettingCollapse: function() {
            // if (CurrentApplication && CurrentApplication.objectlistIsOpen != false) {
            // 	CurrentApplication.objectlistIsOpen = false;

            _settings.objectlistIsOpen = false;

            // }
         },

         listSettingExpand: function() {
            // if (CurrentApplication && CurrentApplication.objectlistIsOpen != true) {
            // 	CurrentApplication.objectlistIsOpen = true;

            _settings.objectlistIsOpen = true;

            // }
         },

         listBusy: function() {
            if ($$(ids.list) && $$(ids.list).showProgress)
               $$(ids.list).showProgress({ type: "icon" });
         },

         listReady: function() {
            if ($$(ids.list) && $$(ids.list).hideProgress)
               $$(ids.list).hideProgress();
         },

         listSearch: function() {
            var searchText = $$(ids.searchText)
               .getValue()
               .toLowerCase();

            $$(ids.list).filter(function(item) {
               return (
                  !item.label ||
                  item.label.toLowerCase().indexOf(searchText) > -1
               );
            });

            // if (CurrentApplication && CurrentApplication.objectlistSearchText != searchText) {

            _settings.objectlistSearchText = searchText;

            // }
         },

         listSort: function(sortType) {
            if (objectList == null) return;

            objectList.sort("label", sortType);

            _logic.listSearch();

            // // save to database
            // if (CurrentApplication && CurrentApplication.objectlistSortDirection != sortType) {
            // CurrentApplication.objectlistSortDirection = sortType;

            _settings.objectlistSortDirection = sortType;

            // }
         },

         listGroup: function(isGroup) {
            if (isGroup == true) {
               $$(ids.list).define("uniteBy", (item) => {
                  return item.label.toUpperCase().substr(0, 1);
               });
            } else {
               $$(ids.list).define("uniteBy", (item) => {
                  return labels.component.title;
               });
            }

            $$(ids.list).refresh();

            // // save to database
            // if (CurrentApplication && CurrentApplication.objectlistIsGroup != isGroup) {
            // 	CurrentApplication.objectlistIsGroup = isGroup;

            _settings.objectlistIsGroup = isGroup;

            // }
         },

         listCount: function() {
            if ($$(ids.list)) return $$(ids.list).count();
         },

         onAfterEditStop: function(state, editor, ignoreUpdate) {
            _logic.showGear(editor.id);

            if (state.value != state.old) {
               _logic.listBusy();

               var selectedObject = $$(ids.list).getSelectedItem(false);
               selectedObject.label = state.value;

               // Call server to rename
               selectedObject
                  .save()
                  .catch(function() {
                     _logic.listReady();

                     OP.Dialog.Alert({
                        text: labels.common.renameErrorMessage.replace(
                           "{0}",
                           state.old
                        )
                     });
                  })
                  .then(function() {
                     _logic.listReady();

                     // TODO : should use message box
                     OP.Dialog.Alert({
                        text: labels.common.renameSuccessMessage.replace(
                           "{0}",
                           state.value
                        )
                     });
                  });
            }
         },

         onBeforeEditStop: function(state, editor) {
            var selectedObject = $$(ids.list).getSelectedItem(false);
            selectedObject.label = state.value;

            var validator = selectedObject.isValid();
            if (validator.fail()) {
               selectedObject.label = state.old;

               return false; // stop here.
            }

            return true;
         },

         /**
          * @function save()
          *
          */
         save: function() {
            // if this UI does not be initialed, then skip it
            if (!_initialized) return;

            // CurrentApplication.save();
            webix.storage.local.put("object_settings", _settings);
         },

         /**
          * @function selectObject()
          *
          * Perform these actions when an Object is selected in the List.
          */
         selectObject: function(id) {
            var object = $$(ids.list).getItem(id);

            _logic.callbacks.onChange(object);

            _logic.showGear(id);
         },

         showGear: function(id) {
            let $item = $$(ids.list).getItemNode(id);
            if ($item) {
               let gearIcon = $item.querySelector(".ab-object-list-edit");
               if (gearIcon) {
                  gearIcon.style.visibility = "visible";
                  gearIcon.style.display = "block";
               }
            }
         },

         /**
          * @function show()
          *
          * Show this component.
          */
         show: function() {
            $$(ids.component).show();
         },

         /**
          * @function templateListItem
          *
          * Defines the template for each row of our ObjectList.
          *
          * @param {obj} obj the current instance of ABObject for the row.
          * @param {?} common the webix.common icon data structure
          * @return {string}
          */
         templateListItem: function(obj, common) {
            return _templateListItem
               .replace("#label#", obj.label || "??label??")
               .replace("{common.iconGear}", common.iconGear);
         },

         /**
          * @function callbackNewObject
          *
          * Once a New Object was created in the Popup, follow up with it here.
          */
         callbackNewObject: function(err, object, selectNew, callback) {
            if (err) {
               OP.Error.log("Error creating New Object", { error: err });
               return;
            }

            let objects = CurrentApplication.objectsIncluded();
            objectList.parse(objects);

            // if (objectList.exists(object.id))
            // 	objectList.updateItem(object.id, object);
            // else
            // 	objectList.add(object);

            if (selectNew != null && selectNew == true) {
               $$(ids.list).select(object.id);
            } else if (callback) {
               callback();
            }
         },

         /**
          * @function clickNewObject
          *
          * Manages initiating the transition to the new Object Popup window
          */
         clickNewObject: function(selectNew, callback) {
            // show the new popup
            PopupNewObjectComponent.show(selectNew, callback);
         },

         exclude: function() {
            var object = $$(ids.list).getSelectedItem(false);

            _logic.listBusy();

            CurrentApplication.objectRemove(object).then(() => {
               objectList.remove(object.id);

               _logic.listReady();

               // clear object workspace
               _logic.callbacks.onChange(null);
            });
         },

         rename: function() {
            var objectId = $$(ids.list).getSelectedId(false);
            $$(ids.list).edit(objectId);
         },

         remove: function() {
            var selectedObject = $$(ids.list).getSelectedItem(false);

            // verify they mean to do this:
            OP.Dialog.Confirm({
               title: labels.component.confirmDeleteTitle,
               message: labels.component.confirmDeleteMessage.replace(
                  "{0}",
                  selectedObject.label
               ),
               callback: (isOK) => {
                  if (isOK) {
                     _logic.listBusy();

                     selectedObject
                        .destroy()
                        .then(() => {
                           _logic.listReady();

                           objectList.remove(selectedObject.id);

                           // refresh items list
                           _logic.callbackNewObject();

                           // clear object workspace
                           _logic.callbacks.onChange(null);
                        })
                        .catch((err) => {
                           var strError = err.toString();

                           if (strError.indexOf("Not Found")) {
                              // an object that wasn't found works just as good as a .destroy()

                              _logic.listReady();

                              objectList.remove(selectedObject.id);

                              // refresh items list
                              _logic.callbackNewObject();

                              // clear object workspace
                              _logic.callbacks.onChange(null);

                              return;
                           }

                           webix.alert({
                              title: "Error removing object",
                              ok: "fix it",
                              text: strError,
                              type: "alert-error"
                           });
                        });
                  }
               }
            });
         },

         callbackObjectEditorMenu: function(action) {
            switch (action) {
               case "rename":
                  _logic.rename();
                  break;
               case "exclude":
                  _logic.exclude();
                  break;
               case "delete":
                  _logic.remove();
                  break;
            }
         }
      });

      /*
       * _templateListItem
       *
       * The Object Row template definition.
       */
      var _templateListItem = [
         "<div class='ab-object-list-item'>",
         "#label#",
         "{common.iconGear}",
         "</div>"
      ].join("");

      // Expose any globally accessible Actions:
      this.actions({
         /**
          * @function getSelectedObject
          *
          * returns which ABObject is currently selected.
          * @return {ABObject}  or {null} if nothing selected.
          */
         getSelectedObject: function() {
            return $$(ids.list).getSelectedItem();
         },

         addNewObject: function(selectNew, callback) {
            _logic.clickNewObject(selectNew, callback);
         }
      });

      //
      // Define our external interface methods:
      //
      this.applicationLoad = _logic.applicationLoad;
      this.busy = _logic.listBusy;
      this.ready = _logic.listReady;
      this.count = _logic.listCount;
   }
};
