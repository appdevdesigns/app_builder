/*
 * ab_work_query_list
 *
 * Manage the Query List
 *
 */

const ABComponent = require("../classes/platform/ABComponent");

const ABListNewQuery = require("./ab_work_query_list_newQuery");
const ABListEditMenu = require("./ab_common_popupEditMenu"); // "./ab_work_object_list_popupEditMenu"

module.exports = class AB_Work_Query_List extends ABComponent {
   //.extend(idBase, function(App) {

   constructor(App) {
      super(App, "ab_work_query_list");
      var L = this.Label;

      var labels = {
         common: App.labels,
         component: {
            // formHeader: L('ab.application.form.header', "*Application Info"),
            addNew: L("ab.query.addNew", "*Add new query"),

            // TODO: create the lables:
            confirmDeleteTitle: L("ab.query.delete.title", "*Delete query"),
            searchPlaceholder: L(
               "ab.query.list.search.placeholder",
               "*Query name"
            ),

            // Reuse these object labels here:
            confirmDeleteMessage: L(
               "ab.object.delete.message",
               "*Do you want to delete <b>{0}</b>?"
            ),
            listSearch: L("ab.object.list.search", "*Search"),
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

      // // There is a Popup for adding a new Object:
      var PopupNewQueryComponent = new ABListNewQuery(App);

      // the popup edit list for each entry in the list.
      var PopupEditObjectComponent = new ABListEditMenu(App);

      // Our webix UI definition:
      this.ui = {
         id: ids.component,
         rows: [
            //// NOTE: when you UI refactor guys get ahold of this, consider how to
            ////   pull out the Settings component into a reusable ui component and just
            ////   plop it into this spot:

            // {
            // 	view: "accordion",
            // 	multi: true,
            // 	css: "ab-object-list-filter",
            // 	rows: [
            // 		{
            // 			id: ids.listSetting,
            // 			header: labels.component.listSetting,
            // 			headerHeight: 30,
            // 			headerAltHeight: 30,
            // 			body: {
            // 				padding: 5,
            // 				rows: [
            // 					{
            // 						id: ids.searchText,
            // 						view: "search",
            // 						icon: "fa fa-search",
            // 						label: labels.component.listSearch,
            // 						labelWidth: 80,
            // 						placeholder: labels.component.searchPlaceholder,
            // 						height: 35,
            // 						keyPressTimeout: 100,
            // 						on: {
            // 							onTimedKeyPress: function() {
            // 								_logic.listSearch();
            // 							}
            // 						}
            // 					},
            // 					{
            // 						id: ids.sort,
            // 						view: "segmented",
            // 						label: labels.component.listSort,
            // 						labelWidth: 80,
            // 						height: 35,
            // 						options: [
            // 							{ id: "asc", value: labels.component.listAsc },
            // 							{ id: "desc", value: labels.component.listDesc }
            // 						],
            // 						on: {
            // 							onChange: (newVal, oldVal) => {
            // 								_logic.listSort(newVal);
            // 							}
            // 						}
            // 					},
            // 					{
            // 						id: ids.group,
            // 						view: "checkbox",
            // 						label: labels.component.listGroup,
            // 						labelWidth: 80,
            // 						on: {
            // 							onChange: (newVal, oldVal) => {
            // 								_logic.listGroup(newVal);
            // 							}
            // 						}
            // 					}
            // 				]
            // 			}
            // 		}
            // 	],
            // 	on: {
            // 		onAfterCollapse: (id) => {
            // 			_logic.listSettingCollapse();
            // 		},
            // 		onAfterExpand: (id) => {
            // 			_logic.listSettingExpand();
            // 		}
            // 	}
            // },
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
                  return L("ab.query.header", "*Data Queries");
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
               view: "button",
               css: "webix_primary",
               id: ids.buttonNew,
               value: labels.component.addNew,
               type: "form",
               click: function() {
                  _logic.clickNewObject(true); // pass true so it will select the new object after you created it
               }
            }
         ]
      };

      var CurrentApplication = null;
      var CurrentQuery = null;
      var queryList = null;

      // Our init() function for setting up our UI
      this.init = (options) => {
         if ($$(ids.component)) $$(ids.component).adjust();

         if ($$(ids.list)) {
            webix.extend($$(ids.list), webix.ProgressBar);
            $$(ids.list).adjust();
         }

         PopupNewQueryComponent.init({
            onDone: _logic.callbackNewQuery
         });

         PopupEditObjectComponent.init({
            onClick: _logic.callbackObjectEditorMenu,
            hideCopy: true,
            hideExclude: false
         });

         // attach any passed in callbacks.
         for (var c in _logic.callbacks) {
            if (options[c]) {
               _logic.callbacks[c] = options[c];
            }
         }
      };

      // our internal business logic
      var _logic = (this._logic = {
         callbacks: {
            onItemSelected: function(query) {
               /* do something with query */
            }
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

            CurrentQuery = null;
            CurrentApplication = application;

            _logic.refresh();

            // prepare our Popup with the current Application
            PopupNewQueryComponent.applicationLoad(application);
         },

         clickEditMenu: function(e, id, trg) {
            // Show menu
            PopupEditObjectComponent.show(trg);

            return false;
         },

         listSettingCollapse: function() {
            if (
               CurrentApplication &&
               CurrentApplication.objectlistIsOpen != false
            ) {
               CurrentApplication.objectlistIsOpen = false;
               CurrentApplication.save();
            }
         },

         listSettingExpand: function() {
            if (
               CurrentApplication &&
               CurrentApplication.objectlistIsOpen != true
            ) {
               CurrentApplication.objectlistIsOpen = true;
               CurrentApplication.save();
            }
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
            // var searchText = $$(ids.searchText).getValue().toLowerCase();
            // $$(ids.list).filter(function (item) {
            // 	return !item.label || item.label.toLowerCase().indexOf(searchText) > -1;
            // });
            // // save to database
            // if (CurrentApplication && CurrentApplication.objectlistSearchText != searchText) {
            // 	CurrentApplication.objectlistSearchText = searchText;
            // 	CurrentApplication.save();
            // }
         },

         listSort: function(sortType) {
            // if (queryList == null) return;
            // queryList.sort("label", sortType);
            // _logic.listSearch();
            // // save to database
            // if (CurrentApplication && CurrentApplication.objectlistSortDirection != sortType) {
            // 	CurrentApplication.objectlistSortDirection = sortType;
            // 	CurrentApplication.save();
            // }
         },

         listGroup: function(isGroup) {
            // if (isGroup == true) {
            // 	$$(ids.list).define("uniteBy", (item) => {
            // 		return item.label.toUpperCase().substr(0,1);
            // 	});
            // }
            // else {
            // 	$$(ids.list).define("uniteBy", (item) => {
            // 		return "   ";
            // 	});
            // }
            // $$(ids.list).refresh();
            // // save to database
            // if (CurrentApplication && CurrentApplication.objectlistIsGroup != isGroup) {
            // 	CurrentApplication.objectlistIsGroup = isGroup;
            // 	CurrentApplication.save();
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
          * @function selectObject()
          *
          * Perform these actions when an Object is selected in the List.
          */
         selectObject: function(id) {
            CurrentQuery = $$(ids.list).getItem(id);

            _logic.callbacks.onItemSelected(CurrentQuery);

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
               .replace(
                  "{iconWarning}",
                  obj.isDisabled()
                     ? '<i class="fa fa-exclamation-triangle"></i> '
                     : ""
               )
               .replace("#label#", obj.label || "??label??")
               .replace("{common.iconGear}", common.iconGear);
         },

         /**
          * @function callbackNewQuery
          *
          * Once a New Query was created in the Popup, follow up with it here.
          */
         callbackNewQuery: function(err, query, selectNew, callback) {
            if (err) {
               OP.Error.log("Error creating New Query", { error: err });
               return;
            }

            // add it to our list.
            queryList.add(query);

            if (selectNew != null && selectNew == true) {
               $$(ids.list).select(query.id);
            }

            if (callback) callback();
         },

         /**
          * @function clickNewObject
          *
          * Manages initiating the transition to the new Object Popup window
          */
         clickNewObject: function(selectNew, callback) {
            // show the new popup
            PopupNewQueryComponent.show(selectNew, callback);
         },

         rename: function() {
            let queryId = $$(ids.list).getSelectedId(false);
            $$(ids.list).edit(queryId);
         },

         exclude: function() {
            let queryId = $$(ids.list).getSelectedId(false);

            _logic.listBusy();

            CurrentApplication.queryExclude(queryId).then(() => {
               queryList.remove(queryId);

               _logic.listReady();

               // clear query workspace
               _logic.callbacks.onItemSelected(null);
            });
         },

         remove: function() {
            var selectedQuery = $$(ids.list).getSelectedItem(false);
            if (!selectedQuery) return;

            // verify they mean to do this:
            OP.Dialog.Confirm({
               title: labels.component.confirmDeleteTitle,
               message: labels.component.confirmDeleteMessage.replace(
                  "{0}",
                  selectedQuery.label
               ),
               callback: (isOK) => {
                  if (isOK) {
                     _logic.listBusy();

                     selectedQuery.destroy().then(() => {
                        _logic.listReady();

                        queryList.remove(selectedQuery.id);

                        _logic.callbacks.onItemSelected(null);
                        // App.actions.clearQueryWorkspace();
                     });
                  }
               }
            });
         },

         refresh: function() {
            // setup object list settings
            // $$(ids.listSetting).define("collapsed", CurrentApplication.objectlistIsOpen != true);
            // $$(ids.listSetting).refresh();
            // $$(ids.searchText).setValue(CurrentApplication.objectlistSearchText);
            // $$(ids.sort).setValue(CurrentApplication.objectlistSortDirection);
            // $$(ids.group).setValue(CurrentApplication.objectlistIsGroup);

            // get a DataCollection of all our queries
            if (queryList == null) queryList = new webix.DataCollection();

            queryList.clearAll();

            if (CurrentApplication)
               queryList.parse(CurrentApplication.queries());

            queryList.sort("label", "asc");

            // clear our list and display our objects:
            var List = $$(ids.list);
            List.clearAll();
            List.data.unsync();
            List.data.sync(queryList);
            List.refresh();
            List.unselectAll();

            if (CurrentQuery) List.select(CurrentQuery.id);

            // sort objects
            _logic.listSort(CurrentApplication.objectlistSortDirection);

            // filter object list
            _logic.listSearch();

            // hide progress loading cursor
            _logic.listReady();
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
         "{iconWarning}",
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

         addNewQuery: function(selectNew, callback) {
            _logic.clickNewObject(selectNew, callback);
         }
      });

      //
      // Define our external interface methods:
      //
      this.applicationLoad = _logic.applicationLoad;
      this.refresh = _logic.refresh;
      this.busy = _logic.listBusy;
      this.ready = _logic.listReady;
      this.count = _logic.listCount;
   }
};
