/*
 * ab_work_object_list
 *
 * Manage the Object List
 *
 */

const ABComponent = require("../classes/platform/ABComponent");
const ABApplication = require("../classes/platform/ABApplication");
const AB_Work_Interface_List_NewPage = require("./ab_work_interface_list_newPage");
const AB_Common_PopupEditMenu = require("./ab_common_popupEditMenu");

module.exports = class AB_Work_Interface_List extends ABComponent {
   constructor(App) {
      super(App, "ab_work_interface_list");

      var L = this.Label;

      var labels = {
         common: App.labels,

         component: {
            title: L("ab.interface.header", "Pages"),
            addNew: L("ab.interface.addNewPage", "*Add new Page"),

            confirmDeleteTitle: L("ab.interface.delete.title", "*Delete Page"),
            confirmDeleteMessage: L(
               "ab.interface.delete.message",
               "*Do you want to delete <b>{0}</b>?"
            )
         }
      };

      // internal list of Webix IDs to reference our UI components.
      var ids = {
         component: this.unique("component"),

         list: this.unique("editlist"),
         buttonNew: this.unique("buttonNew")
      };

      // // Note: put these here so _logic is defined:
      // // There is a Popup for adding a new Object:
      var PopupNewPageComponent = new AB_Work_Interface_List_NewPage(App);
      var PopupEditPageComponent = new AB_Common_PopupEditMenu(App);

      // Our webix UI definition:
      this.ui = {
         id: ids.component,
         rows: [
            {
               view: "unitlist",
               uniteBy: labels.component.title,
               height: 34,
               data: [" "],
               type: {
                  height: 0,
                  headerHeight: 35
               }
            },
            {
               view: App.custom.edittree.view, // "edittree",
               id: ids.list,
               width: App.config.columnWidthLarge,

               select: true,

               editaction: "custom",
               editable: true,
               editor: "text",
               editValue: "label",
               css: "ab-tree-ui",

               template: function(obj, common) {
                  return _logic.templateListItem(obj, common);
               },
               type: {
                  iconGear: "<span class='webix_icon fa fa-cog'></span>"
               },
               on: {
                  onAfterRender: function() {
                     _logic.onAfterRender();
                  },
                  onAfterSelect: function(id) {
                     _logic.onAfterSelect(id);
                  },
                  onAfterOpen: function() {
                     _logic.onAfterOpen();
                  },
                  onAfterClose: function() {
                     _logic.onAfterClose();
                  },
                  onBeforeEditStop: function(state, editor) {
                     _logic.onBeforeEditStop(state, editor);
                  },
                  onAfterEditStop: function(state, editor, ignoreUpdate) {
                     _logic.onAfterEditStop(state, editor, ignoreUpdate);
                  }
               },
               onClick: {
                  "ab-page-list-edit": function(e, id, trg) {
                     _logic.clickEditMenu(e, id, trg);
                  }
               }
            },
            {
               view: "button",
               css: "webix_primary",
               id: ids.buttonNew,
               css: "webix_primary",
               type: "form",
               value: labels.component.addNew,
               click: function() {
                  App.actions.clickNewView();
               }
            }
         ]
      };

      // Our init() function for setting up our UI
      this.init = function() {
         if ($$(ids.component)) $$(ids.component).adjust();

         let $List = $$(ids.list);

         if ($List) {
            webix.extend($List, webix.ProgressBar);
            $List.data.unsync();
            $List.data.sync(viewList);
            $List.adjust();
         }

         PopupNewPageComponent.init({
            onSave: _logic.callbackNewPage
         });

         PopupEditPageComponent.init({
            onClick: _logic.callbackPageEditMenu,
            hideExclude: true
         });
      };

      // our internal business logic
      var _logic = (this._logic = {
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

            // this so it looks right/indented in a tree view:
            viewList.clearAll();

            var addPage = function(page, index, parentId) {
               if (!page) return;

               viewList.add(page, index, parentId);

               page.pages().forEach((childPage, childIndex) => {
                  addPage(childPage, childIndex, page.id);
               });
            };
            application.pages().forEach((p, index) => {
               addPage(p, index);
            });

            // clear our list and display our objects:
            var List = $$(ids.list);
            List.refresh();
            List.unselectAll();

            //
            _logic.listReady();

            // // prepare our Popup with the current Application
            PopupNewPageComponent.applicationLoad(application);
         },

         /**
          * @function callbackNewObject
          *
          * Once a New Page was created in the Popup, follow up with it here.
          */
         callbackNewPage: function(page) {
            var parentPage = page.pageParent();
            var parentPageId = parentPage.id != page.id ? parentPage.id : null;
            if (!viewList.exists(page.id))
               viewList.add(page, null, parentPageId);

            // add sub-pages to tree-view
            page.pages().forEach((p, index) => {
               if (!viewList.exists(p.id)) viewList.add(p, index, page.id);
            });

            $$(ids.list).refresh();

            if (parentPageId) $$(ids.list).open(parentPageId);

            $$(ids.list).select(page.id);

            PopupNewPageComponent.hide();
         },

         /**
          * @function callbackPageEditMenu
          *
          * Respond to the edit menu selection.
          */
         callbackPageEditMenu: function(action) {
            switch (action) {
               case "rename":
                  _logic.rename();
                  break;
               case "copy":
                  _logic.copy();
                  break;
               case "delete":
                  _logic.remove();
                  break;
            }
         },

         clickEditMenu: function(e, id, trg) {
            // Show menu
            PopupEditPageComponent.show(trg);

            return false;
         },

         listBusy: function() {
            if ($$(ids.list) && $$(ids.list).showProgress)
               $$(ids.list).showProgress({ type: "icon" });
         },

         listReady: function() {
            if ($$(ids.list) && $$(ids.list).hideProgress)
               $$(ids.list).hideProgress();
         },

         onAfterClose: function() {
            var selectedIds = $$(ids.list).getSelectedId(true);

            // Show gear icon
            selectedIds.forEach((id) => {
               _logic.showGear(id);
            });
         },

         onAfterEditStop: function(state, editor, ignoreUpdate) {
            _logic.showGear(editor.id);

            if (state.value != state.old) {
               _logic.listBusy();

               var selectedPage = $$(ids.list).getSelectedItem(false);
               selectedPage.label = state.value;

               // Call server to rename
               selectedPage
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

                     // refresh the root page list
                     PopupNewPageComponent.applicationLoad(CurrentApplication);

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

         onAfterOpen: function() {
            var id = $$(ids.list).getSelectedId(false);
            if (id) {
               _logic.showGear(id);
            }
         },

         onAfterRender: function() {
            var id = $$(ids.list).getSelectedId(false);
            if (id) {
               _logic.showGear(id);
            }
         },

         /**
          * @function onAfterSelect()
          *
          * Perform these actions when a View is selected in the List.
          */
         onAfterSelect: function(id) {
            var view = $$(ids.list).getItem(id);
            App.actions.populateInterfaceWorkspace(view);

            _logic.showGear(id);
         },

         onBeforeEditStop: function(state, editor) {
            console.warn("!! todo: onBeforeEditStop() editing");
            // if (!inputValidator.validateFormat(state.value)) {
            // 	return false;
            // }

            // // Validation - check duplicate
            // if (!inputValidator.rules.preventDuplicateObjectName(state.value, editor.id) && state.value != state.old) {
            // 	webix.alert({
            // 		title: self.labels.object.invalidName,
            // 		ok: self.labels.common.ok,
            // 		text: self.labels.object.duplicateName.replace("{0}", state.value)
            // 	});

            // 	return false;
            // }
         },

         rename: function() {
            var pageID = $$(ids.list).getSelectedId(false);
            $$(ids.list).edit(pageID);
         },

         copy: function() {
            let selectedPage = $$(ids.list).getSelectedItem(false);

            // show loading cursor
            _logic.listBusy();

            // get a copy of the page
            selectedPage
               .copy(null, selectedPage.parent)
               .then((copiedPage) => {
                  copiedPage.parent = selectedPage.parent;
                  copiedPage.label = copiedPage.label + " (copied)";
                  copiedPage.save().then(() => {
                     _logic.callbackNewPage(copiedPage);
                     _logic.listReady();
                  });
               })
               .catch((err) => {
                  var strError = err.toString();
                  webix.alert({
                     title: "Error copying page",
                     ok: "fix it",
                     text: strError,
                     type: "alert-error"
                  });
                  console.log(err);
                  _logic.listReady();
               });
         },

         remove: function() {
            var selectedPage = $$(ids.list).getSelectedItem(false);
            if (!selectedPage) return;

            // verify they mean to do this:
            OP.Dialog.Confirm({
               title: labels.component.confirmDeleteTitle,
               message: labels.component.confirmDeleteMessage.replace(
                  "{0}",
                  selectedPage.label
               ),
               callback: (isOK) => {
                  if (isOK) {
                     _logic.listBusy();

                     selectedPage.destroy().then(() => {
                        _logic.listReady();

                        if (viewList.exists(selectedPage.id)) {
                           viewList.remove(selectedPage.id);
                        }

                        // refresh the root page list
                        PopupNewPageComponent.applicationLoad(
                           CurrentApplication
                        );

                        App.actions.clearInterfaceWorkspace();
                     });
                  }
               }
            });
         },

         showGear: function(id) {
            var domNode = $$(ids.list).getItemNode(id);
            if (domNode) {
               var gearIcon = domNode.querySelector(".ab-page-list-edit");
               gearIcon.style.visibility = "visible";
               gearIcon.style.display = "block";
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
         templateListItem: function(item, common) {
            var template = _templateListItem;

            template = template.replace(
               "#iconGear#",
               "<div class='ab-page-list-edit'>{common.iconGear}</div>"
            );
            template = template.replace(
               "#typeIcon#",
               item.icon || item.viewIcon()
            );
            // template = template.replace('#typeIcon#', item.settings.type == 'popup' ? 'fa-clone fa-flip-horizontal' : 'fa-file-o');

            // // Disallow rename/delete on Tabs
            // if (item.type !== 'tab')
            // 	template = template.replace("#iconGear#", "<div class='ab-page-list-edit'>{common.iconGear}</div>");
            // else
            // 	template = template.replace("#iconGear#", "");

            // switch (item.type) {
            // 	case 'modal':
            // 		template = template.replace('#typeIcon#', 'fa-list-alt');
            // 		break;
            // 	case 'tab':
            // 		template = template.replace('#typeIcon#', 'fa-folder-o');
            // 		break;
            // 	case 'page':
            // 	default:
            // 		template = template.replace('#typeIcon#', 'fa-file-o');
            // 		break;
            // }

            // now register a callback to update this display when this view is updated:
            item
               .removeListener("properties.updated", _logic.refreshTemplateItem)
               .once("properties.updated", _logic.refreshTemplateItem);

            return template
               .replace("#label#", item.label)
               .replace("{common.icon()}", common.icon(item))
               .replace("{common.iconGear}", common.iconGear);
         },

         refreshTemplateItem: function(view) {
            // make sure this item is updated in our list:
            view = view.updateIcon(view);
            viewList.updateItem(view.id, view);
            // $$(ids.list).updateItem(view.id, view);
         }

         // rename: function () {
         // 	var objectId = $$(ids.list).getSelectedId(false);
         // 	$$(ids.list).edit(objectId);
         // },

         // remove: function () {

         // 	var selectedObject = $$(ids.list).getSelectedItem(false);

         // 	// verify they mean to do this:
         // 	OP.Dialog.Confirm({
         // 		title: labels.component.confirmDeleteTitle,
         // 		message: labels.component.confirmDeleteMessage.replace('{0}', selectedObject.label),
         // 		callback: (isOK) => {

         // 			if (isOK) {
         // 				_logic.listBusy();

         // 				selectedObject.destroy()
         // 					.then(() => {
         // 						_logic.listReady();

         // 						$$(ids.list).remove(selectedObject.id);
         // 						App.actions.clearObjectWorkspace();
         // 					});

         // 			}
         // 		}
         // 	})
         // },

         // callbackObjectEditorMenu: function (action) {
         // 	switch (action) {
         // 		case 'rename':
         // 			_logic.rename();
         // 			break;
         // 		case 'delete':
         // 			_logic.remove();
         // 			break;
         // 	}
         // }
      });

      /*
       * _templateListItem
       *
       * The Object Row template definition.
       */
      var _templateListItem = [
         "<div class='ab-page-list-item'>",
         "{common.icon()} <span class='webix_icon fa fa-#typeIcon#'></span> #label# #iconGear#",
         "</div>"
      ].join("");

      var CurrentApplication = null;
      var viewList = new webix.TreeCollection();

      // Expose any globally accessible Actions:
      this.actions({
         /**
          * @function selectInterfacePage()
          *
          * Select the page Workspace with the provided ABViewPage.
          *
          * @param {ABViewPage} view     current ABViewPage instance we are working with.
          */
         selectInterfacePage: function(view) {
            var List = $$(ids.list);

            if (List.getSelectedId() != view.id) {
               List.select(view.id);
            }
         },

         /**
          * @function clickNewView
          *
          * Manages initiating the transition to the new Object Popup window
          */
         clickNewView: function() {
            // show the new popup
            PopupNewPageComponent.show();
         }
      });

      //
      // Define our external interface methods:
      //
      this.applicationLoad = _logic.applicationLoad;
   }
};
