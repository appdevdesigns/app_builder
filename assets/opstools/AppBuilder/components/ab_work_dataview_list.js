const ABComponent = require("../classes/platform/ABComponent");
const ABListNewDatacollection = require("./ab_work_dataview_list_newDataview");
const ABListEditMenu = require("./ab_common_popupEditMenu");

module.exports = class AB_Work_Datacollection_List extends ABComponent {
   constructor(App) {
      super(App, "ab_work_dataview_list");
      var L = this.Label;

      var labels = {
         common: App.labels,
         component: {
            addNew: L("ab.datacollection.addNew", "*Add new data view"),

            confirmDeleteTitle: L(
               "ab.datacollection.delete.title",
               "*Delete data view"
            ),
            confirmDeleteMessage: L(
               "ab.datacollection.delete.message",
               "*Do you want to delete <b>{0}</b>?"
            ),
            title: L("ab.datacollection.list.title", "*Data Collections")
         }
      };

      // internal list of Webix IDs to reference our UI components.
      var ids = {
         component: this.unique("component"),

         list: this.unique("editlist"),
         buttonNew: this.unique("buttonNew")
      };

      // There is a Popup for adding a new Data view:
      var PopupNewDatacollectionComponent = new ABListNewDatacollection(App);

      // the popup edit list for each entry in the list.
      var PopupEditObjectComponent = new ABListEditMenu(App);

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
                     _logic.selectDatacollection(id);
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
               view: "button",
               css: "webix_primary",
               id: ids.buttonNew,
               value: labels.component.addNew,
               type: "form",
               click: function() {
                  _logic.clickNewDatacollection(true); // pass true so it will select the new object after you created it
               }
            }
         ]
      };

      var CurrentApplication = null;
      var CurrentDatacollection = null;
      var datacollectionList = null;

      let _initialized = false;

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

         PopupNewDatacollectionComponent.init({
            onDone: _logic.callbackNewDatacollection
         });

         PopupEditObjectComponent.init({
            onClick: _logic.callbackDatacollectionEditorMenu,
            hideCopy: true
         });

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
            _logic.listBusy();

            CurrentApplication = application;

            // get a DataCollection of all our objects
            datacollectionList = new webix.DataCollection({
               data: application.datacollectionsIncluded()
            });
            datacollectionList.sort("label", "asc");

            // clear our list and display our objects:
            var List = $$(ids.list);
            List.clearAll();
            List.data.unsync();
            List.data.sync(datacollectionList);
            List.refresh();
            List.unselectAll();

            // hide progress loading cursor
            _logic.listReady();

            // prepare our Popup with the current Application
            PopupNewDatacollectionComponent.applicationLoad(application);
         },

         selectDatacollection: function(datacollectionId) {
            CurrentDatacollection = $$(ids.list).getItem(datacollectionId);

            _logic.callbacks.onChange(CurrentDatacollection);
         },

         /**
          * @function templateListItem
          *
          * Defines the template for each row of our Data view list.
          *
          * @param {ABDatacollection} obj the current instance of ABDatacollection for the row.
          * @param {?} common the webix.common icon data structure
          * @return {string}
          */
         templateListItem: function(datacollection, common) {
            return `<div class='ab-datacollection-list-item'>
					<i class="fa ${
                  datacollection.settings.isQuery ? "fa-filter" : "fa-database"
               }"></i>
					${datacollection.label || "??label??"}
					${common.iconGear}
					</div>`;
         },

         onBeforeEditStop: function(state, editor) {
            var selectedObject = $$(ids.list).getSelectedItem(false);
            selectedObject.label = state.value;

            return true;
         },

         onAfterEditStop: function(state, editor, ignoreUpdate) {
            if (state.value == state.old) return;

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
         },

         /**
          * @function clickNewDatacollection
          *
          * Manages initiating the transition to the new Object Popup window
          */
         clickNewDatacollection: function(selectNew, callback) {
            // show the new popup
            PopupNewDatacollectionComponent.show(selectNew, callback);
         },

         /**
          * @function callbackNewDatacollection
          *
          * Once a New Data view was created in the Popup, follow up with it here.
          */
         callbackNewDatacollection: function(
            err,
            datacollection,
            selectNew,
            callback
         ) {
            if (err) {
               OP.Error.log("Error creating New Datacollection", {
                  error: err
               });
               return;
            }

            let datacollections = CurrentApplication.datacollectionsIncluded();
            datacollectionList.parse(datacollections);

            // if (objectList.exists(object.id))
            // 	objectList.updateItem(object.id, object);
            // else
            // 	objectList.add(object);

            if (selectNew != null && selectNew == true) {
               $$(ids.list).select(datacollection.id);
            } else if (callback) {
               callback();
            }
         },

         clickEditMenu: function(e, id, trg) {
            // Show menu
            PopupEditObjectComponent.show(trg);

            return false;
         },

         callbackDatacollectionEditorMenu: function(action) {
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
         },

         exclude: function() {
            var datacollection = $$(ids.list).getSelectedItem(false);

            _logic.listBusy();

            CurrentApplication.datacollectionRemove(datacollection).then(() => {
               if (datacollectionList.exists(datacollection.id))
                  datacollectionList.remove(datacollection.id);

               _logic.listReady();

               // clear object workspace
               _logic.callbacks.onChange(null);
            });
         },

         rename: function() {
            var datacollectionId = $$(ids.list).getSelectedId(false);
            $$(ids.list).edit(datacollectionId);
         },

         remove: function() {
            var selectedDatacollection = $$(ids.list).getSelectedItem(false);

            // verify they mean to do this:
            OP.Dialog.Confirm({
               title: labels.component.confirmDeleteTitle,
               message: labels.component.confirmDeleteMessage.replace(
                  "{0}",
                  selectedDatacollection.label
               ),
               callback: (isOK) => {
                  if (isOK) {
                     _logic.listBusy();

                     selectedDatacollection.destroy().then(() => {
                        _logic.listReady();

                        if (
                           datacollectionList.exists(selectedDatacollection.id)
                        )
                           datacollectionList.remove(selectedDatacollection.id);

                        // refresh items list
                        // _logic.callbackNewDatacollection();

                        // clear object workspace
                        _logic.callbacks.onChange(null);
                     });
                  }
               }
            });
         },

         listBusy: () => {
            if ($$(ids.list) && $$(ids.list).showProgress)
               $$(ids.list).showProgress({ type: "icon" });
         },

         listReady: () => {
            if ($$(ids.list) && $$(ids.list).hideProgress)
               $$(ids.list).hideProgress();
         },

         listCount: () => {
            if ($$(ids.list)) return $$(ids.list).count();
         }
      });

      // Expose any globally accessible Actions:
      this.actions({
         addNewDatacollection: function(selectNew, callback) {
            _logic.clickNewDatacollection(selectNew, callback);
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
