/*
 * ab_common_list
 *
 * A common interface for displaying AB category list widget
 *
 */

import ABListEditMenu from "./ab_common_popupEditMenu";

export default class AB_Common_List extends OP.Component {
   //.extend(idBase, function(App) {

   constructor(App, attributes) {
      attributes.idBase = attributes.idBase || "ab_common_list";
      super(App, attributes.idBase);
      var L = this.Label;

      var labels = {
         common: App.labels,
         component: {
            addNew: L("ab.common.list.addNew", "*Add new item"),
            confirmDeleteTitle: L(
               "ab.common.list.delete.title",
               "*Delete Item"
            ),
            title: L("ab.common.list.title", "*Items"),
            searchPlaceholder: L(
               "ab.common.list.search.placeholder",
               "*Item name"
            ),

            // we can reuse some of the Object ones:
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

      // copy in any passed in labels:
      if (attributes.labels) {
         for (var key in attributes.labels) {
            labels.component[key] = attributes.labels[key];
         }
      }

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

      // There is a Popup for adding a new Process:
      // var PopupNewProcessComponent = new ABListNewProcess(App);

      // the popup edit list for each entry in the list.
      var PopupEditProcessComponent = new ABListEditMenu(App);
      attributes.menu = attributes.menu || {};
      attributes.menu.copy =
         typeof attributes.menu.copy == "undefined"
            ? true
            : attributes.menu.copy;
      attributes.menu.exclude =
         typeof attributes.menu.exclude == "undefined"
            ? true
            : attributes.menu.exclude;
      //PopupListEditMenuComponent
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
                     _logic.selectProcess(id);
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
                                 { id: "asc", value: labels.component.listAsc },
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
               css: "webix_primary",
               id: ids.buttonNew,
               value: labels.component.addNew,
               type: "form",
               click: function() {
                  _logic.clickAddNew(true); // pass true so it will select the new object after you created it
               }
            }
         ]
      };

      var CurrentApplication = null;
      var itemList = null;

      let _initialized = false;
      let _settings = {};

      // Our init() function for setting up our UI
      this.init = (options) => {
         // register our callbacks:
         // for (var c in _logic.callbacks) {
         //     _logic.callbacks[c] = options[c] || _logic.callbacks[c];
         // }

         if ($$(ids.component)) $$(ids.component).adjust();

         if ($$(ids.list)) {
            webix.extend($$(ids.list), webix.ProgressBar);
            $$(ids.list).adjust();
         }

         // PopupNewProcessComponent.init({
         // 	onDone: _logic.callbackNewProcess
         // });

         PopupEditProcessComponent.init({
            // onClick: _logic.callbackProcessEditorMenu,
            hideCopy: !attributes.menu.copy,
            hideExclude: !attributes.menu.exclude
         });

         PopupEditProcessComponent.on("click", (command) => {
            var selectedItem = $$(ids.list).getSelectedItem(false);
            switch (command) {
               case "delete":
                  this._logic.remove();
                  break;

               case "rename":
                  this._logic.rename();
                  break;

               case "exclude":
                  this.emit("exclude", selectedItem);
                  break;

               case "copy":
                  this._logic.copy(selectedItem);
                  // this.emit("copy", selectedItem);
                  break;

               default:
                  this.emit("menu", { command: command, id: selectedItem.id });
                  break;
            }
         });

         _settings = webix.storage.local.get(this.idBase) || {
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
          * Initialize the Process List from the provided ABApplication
          *
          * If no ABApplication is provided, then show an empty form. (create operation)
          *
          * @param {ABApplication} application  	[optional] The current ABApplication
          *										we are working with.
          */
         applicationLoad: function(application) {
            CurrentApplication = application;
         },

         dataLoad: function(data) {
            _logic.listBusy();

            // get a DataCollection of all our objects
            itemList = new webix.DataCollection({
               data: data
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
            List.data.sync(itemList);
            List.refresh();
            List.unselectAll();

            // sort objects
            _logic.listSort(_settings.objectlistSortDirection);

            // filter object list
            _logic.listSearch();

            // hide progress loading cursor
            _logic.listReady();

            // prepare our Popup with the current Application
            // PopupNewProcessComponent.applicationLoad(application);
         },

         clickEditMenu: function(e, id, trg) {
            // Show menu
            PopupEditProcessComponent.show(trg);

            return false;
         },

         /*
          * @function copy
          * make a copy of the current selected item.
          *
          * copies should have all the same .toObj() data,
          * but will need unique names, and ids.
          *
          * we start the process by making a copy and then
          * having the user enter a new label/name for it.
          *
          * our .afterEdit() routines will detect it is a copy
          * then alert the parent UI component of the "copied" data
          *
          * @param {obj} selectedItem the currently selected item in
          * 		our list.
          */
         copy: function(selectedItem) {
            var newItem = selectedItem.toObj();
            newItem.id = "copy_" + (itemList ? itemList.count() : "01");
            delete newItem.translations;
            newItem.name = newItem.name + " copy";
            newItem.label = newItem.name;

            // find the current index of the item being copied:
            var list = $$(ids.list);
            var selectedIndex = list.getIndexById(list.getSelectedId());

            // insert copy in it's place and make it editable:
            list.add(newItem, selectedIndex);
            list.select(newItem.id);
            list.edit(newItem.id);
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
            if (itemList == null) return;

            itemList.sort("label", sortType);

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

         onAfterEditStop: (state, editor, ignoreUpdate) => {
            _logic.showGear(editor.id);

            if (state.value != state.old) {
               _logic.listBusy();

               var selectedItem = $$(ids.list).getSelectedItem(false);
               selectedItem.label = state.value;

               // if this item supports .save()
               if (selectedItem.save) {
                  // Call server to rename
                  selectedItem
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
                        // OP.Dialog.Alert({
                        // 	text: labels.common.renameSuccessMessage.replace("{0}", state.value)
                        // });
                     });
               } else {
                  // maybe this is from a .copy() command:
                  if (selectedItem.id.indexOf("copy_") == 0) {
                     // if so, then our default name should be what
                     // the label is:
                     selectedItem.name = selectedItem.label;
                     var currID = selectedItem.id;

                     // remove our temp id
                     delete selectedItem.id;

                     // alert the parent UI of the copied data:
                     this.emit("copied", {
                        item: selectedItem,
                        currID: currID
                     });
                  }
               }
            }
         },

         onBeforeEditStop: function(state, editor) {
            var selectedItem = $$(ids.list).getSelectedItem(false);
            selectedItem.label = state.value;

            // if this item supports isValid()
            if (selectedItem.isValid) {
               var validator = selectedItem.isValid();
               if (validator.fail()) {
                  selectedItem.label = state.old;

                  return false; // stop here.
               }
            }

            return true;
         },

         /**
          * @function save()
          *
          */
         save: () => {
            // if this UI does not be initialed, then skip it
            if (!_initialized) return;

            // CurrentApplication.save();
            webix.storage.local.put(this.idBase, _settings);
         },

         /**
          * @function selectProcess()
          *
          * Perform these actions when an Process is selected in the List.
          */
         selectProcess: (id) => {
            var process = $$(ids.list).getItem(id);

            // _logic.callbacks.onChange(object);
            this.emit("selected", process);

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
         // show:function() {

         // 	$$(ids.component).show();
         // },

         /**
          * @function templateListItem
          *
          * Defines the template for each row of our ProcessList.
          *
          * @param {obj} obj the current instance of ABProcess for the row.
          * @param {?} common the webix.common icon data structure
          * @return {string}
          */
         templateListItem: function(obj, common) {
            return _templateListItem
               .replace("#label#", obj.label || "??label??")
               .replace("{common.iconGear}", common.iconGear);
         },

         /**
          * @function callbackNewProcess
          *
          * Once a New Process was created in the Popup, follow up with it here.
          */
         // callbackNewProcess:function(err, object, selectNew, callback){

         // 	if (err) {
         // 		OP.Error.log('Error creating New Process', {error: err});
         // 		return;
         // 	}

         // 	let objects = CurrentApplication.objects();
         // 	itemList.parse(objects);

         // 	// if (processList.exists(object.id))
         // 	// 	processList.updateItem(object.id, object);
         // 	// else
         // 	// 	processList.add(object);

         // 	if (selectNew != null && selectNew == true) {
         // 		$$(ids.list).select(object.id);
         // 	}
         // 	else if (callback) {
         // 		callback();
         // 	}

         // },

         /**
          * @function clickAddNew
          *
          * Manages initiating the transition to the new Process Popup window
          */
         clickAddNew: (selectNew) => {
            this.emit("addNew", selectNew);
         },

         /**
          * @function exclude()
          *
          * alert calling UI that a list item was chosen for "exclude"
          */
         exclude: () => {
            var item = $$(ids.list).getSelectedItem(false);
            this.emit("exclude", item);

            return;

            // var itemId = $$(ids.list).getSelectedId(false);

            // _logic.listBusy();

            // CurrentApplication.objectExclude(itemId)
            // 	.then(() => {

            // 		itemList.remove(itemId);

            // 		_logic.listReady();

            // 		// clear object workspace
            // 		this.emit("selected", null);
            // 		// _logic.callbacks.onChange(null);
            // 	});
         },

         rename: function() {
            var itemId = $$(ids.list).getSelectedId(false);
            $$(ids.list).edit(itemId);
         },

         remove: () => {
            var selectedItem = $$(ids.list).getSelectedItem(false);

            // verify they mean to do this:
            OP.Dialog.Confirm({
               title: labels.component.confirmDeleteTitle,
               message: labels.component.confirmDeleteMessage.replace(
                  "{0}",
                  selectedItem.label
               ),
               callback: (isOK) => {
                  if (isOK) {
                     _logic.listBusy();

                     selectedItem.destroy().then(() => {
                        _logic.listReady();

                        itemList.remove(selectedItem.id);

                        // let the calling component know about
                        // the deletion:
                        this.emit("deleted", selectedItem);

                        // clear object workspace
                        this.emit("selectd", null);
                     });
                  }
               }
            });
         },

         select: (id) => {
            $$(ids.list).select(id);
         },

         callbackProcessEditorMenu: function(action) {
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
       * The Process Row template definition.
       */
      var _templateListItem =
         attributes.templateListItem ||
         [
            "<div class='ab-object-list-item'>",
            "#label#",
            "{common.iconGear}",
            "</div>"
         ].join("");

      // Expose any globally accessible Actions:
      this.actions({
         /**
          * @function getSelectedProcess
          *
          * returns which ABProcess is currently selected.
          * @return {ABProcess}  or {null} if nothing selected.
          */
         getSelectedProcess: function() {
            return $$(ids.list).getSelectedItem();
         },

         addNewProcess: function(selectNew, callback) {
            _logic.clickNewProcess(selectNew, callback);
         }
      });

      //
      // Define our external interface methods:
      //
      this.applicationLoad = _logic.applicationLoad;
      this.dataLoad = _logic.dataLoad;
      this.busy = _logic.listBusy;
      this.ready = _logic.listReady;
      this.count = _logic.listCount;
      this.select = _logic.select;
   }
}
