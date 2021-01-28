/*
 * ab_work_object_workspace_datatable
 *
 * Manage the Object Workspace area.
 *
 */

const ABComponent = require("../classes/platform/ABComponent");
const AB_Work_HeaderEditMenu = require("./ab_work_object_workspace_popupHeaderEditMenu");

var FilterComplex = require("../classes/platform/FilterComplex");

module.exports = class ABWorkObjectDatatable extends ABComponent {
   /**
     *
     * @param {*} App
     * @param {*} idBase
     * @param {Object} params - {
     *			allowDelete: bool,
    			detailsView: {string} - id of page,
    			editView:	 {string} - id of page,
    			isEditable:  bool,
    			massUpdate:  bool,
				configureHeaders: bool,
                summaryColumns:	 {array} - an array of field id
                countColumns:	 {array} - an array of field id
			}
     */

   constructor(App, idBase, params) {
      idBase = idBase || "ab_work_object_workspace_datatable";
      super(App, idBase);

      params = params || {};

      var settings = {
         allowDelete: params.allowDelete != null ? params.allowDelete : true,
         detailsView: params.detailsView || null,
         editView: params.editView || null,
         trackView: params.trackView || null,
         isEditable: params.isEditable != null ? params.isEditable : true,
         massUpdate: params.massUpdate != null ? params.massUpdate : true,
         configureHeaders:
            params.configureHeaders != null ? params.configureHeaders : true,
         summaryColumns: params.summaryColumns || [],
         countColumns: params.countColumns || [],
         labelAsField: params.labelAsField || false,
         hideButtons: params.hideButtons || false,
         groupBy: params.groupBy || "",
         hiddenFields: params.hiddenFields || [],
         frozenColumnID: params.frozenColumnID,

         isTreeDatable: params.isTreeDatable || 0 // if true webix.treedatable, otherwise webix.datatable
      };
      this._settings = settings;

      var L = this.Label;
      var labels = {
         common: App.labels,
         component: {
            confirmDeleteRowTitle: L(
               "ab.object.deleteRow.title",
               "*Delete data"
            ),
            confirmDeleteRowMessage: L(
               "ab.object.deleteRow.message",
               "*Do you want to delete this row?"
            )
         }
      };

      // internal list of Webix IDs to reference our UI components.
      var ids = {
         component: this.unique(idBase + "_datatable"),
         tooltip: this.unique(idBase + "_datatable_tooltip"),
         rules: this.unique(idBase + "_datatable_rules")
      };

      var defaultHeight = 0;
      var imageFields = [];
      var selectedItems = [];
      var columnSplitRight = 0;
      var columnSplitLeft = 0;
      var validationError = false;

      var PopupHeaderEditComponent = new AB_Work_HeaderEditMenu(App, idBase);

      var selectType = "cell";
      if (!settings.isEditable && (settings.detailsView || settings.editView)) {
         selectType = "row";
      }

      // Our webix UI definition:
      this.ui = {
         view: "datatable",
         id: ids.component,
         resizeColumn: { size: 10 },
         resizeRow: { size: 10 },
         prerender: false,
         editable: settings.isEditable,
         fixedRowHeight: false,
         editaction: "custom",
         select: selectType,
         footer:
            settings.summaryColumns.length > 0 ||
            settings.countColumns.length > 0, // show footer when there are summary columns
         tooltip: {
            // id: ids.tooltip,
            template: function(obj, common) {
               return _logic.toolTip(obj, common);
            },
            on: {
               // When showing a larger image preview the tooltip sometime displays part of the image off the screen...this attempts to fix that problem
               onBeforeRender: function() {
                  _logic.toolTipOnBeforeRender(this.getNode());
               },
               onAfterRender: function(data) {
                  _logic.toolTipOnAfterRender(this.getNode());
               }
            }
         },
         dragColumn: true,
         on: {
            onBeforeSelect: function(data, preserve) {
               var skippable = [
                  "appbuilder_select_item",
                  "appbuilder_view_detail",
                  "appbuilder_view_track",
                  "appbuilder_view_edit",
                  "appbuilder_trash"
               ];
               if (skippable.indexOf(data.column) != -1) {
                  return false;
               } else if (settings.isEditable) {
                  var selectField = CurrentObject.fields((f) => {
                     return f.columnName == data.column;
                  })[0];

                  if (selectField == null) return true;

                  var cellNode = this.getItemNode({
                        row: data.row,
                        column: data.column
                     }),
                     rowData = this.getItem(data.row);

                  return selectField.customEdit(rowData, App, cellNode);
               } else if (!settings.detailsView && !settings.editView) {
                  return false;
               }
            },
            onAfterSelect: function(data, prevent) {
               if (settings.isEditable) {
                  _logic.onAfterSelect(data, prevent);
               }
            },
            onBeforeEditStart: function(id) {
               if (!this.getItem(id) == "appbuilder_select_item") return false;
            },
            onCheck: function(row, col, val) {
               // Update checkbox data
               if (col == "appbuilder_select_item") {
                  // do nothing because we will parse the table once we decide if we are deleting or updating rows
                  _logic.toggleUpdateDelete();
               } else {
                  if (settings.isEditable) {
                     // if the colum is not the select item column move on to the next step to save
                     var state = {
                        value: val
                     };

                     var editor = {
                        row: row,
                        column: col,
                        config: null
                     };
                     _logic.onAfterEditStop(state, editor);
                  } else {
                     var node = this.getItemNode({
                        row: row,
                        column: col
                     });
                     var checkbox = node.querySelector(
                        'input[type="checkbox"]'
                     );
                     if (val == 1) {
                        checkbox.checked = false;
                     } else {
                        checkbox.checked = true;
                     }
                  }
               }
            },
            onBeforeEditStop: function(state, editor) {
               console.warn("!! ToDo: onBeforeEditStop()");
               // var column = AD.classes.AppBuilder.currApp.currObj.columns.filter(function (col) { return col.name == editor.column; });

               // if (!column || column.length < 1) return true;
               // column = column[0];

               // var passValidate = dataFieldsManager.validate(column, state.value);

               // if (!passValidate) {
               // 	$$(self.webixUiId.objectDatatable).editCancel();
               // }

               // return passValidate;
            },
            onAfterEditStop: function(state, editor, ignoreUpdate) {
               if (validationError == false)
                  _logic.onAfterEditStop(state, editor, ignoreUpdate);
            },
            onValidationError: function() {
               validationError = true;
            },
            onValidationSuccess: function() {
               validationError = false;
            },
            // We are sorting with server side requests now so we can remove this
            // onAfterLoad: function () {
            // 	_logic.onAfterLoad();
            // },
            onColumnResize: function(
               columnName,
               newWidth,
               oldWidth,
               user_action
            ) {
               // if we resize the delete column we want to resize the last column but Webix will not allow since the column is split
               var rightSplitItems = [
                  "appbuilder_view_detail",
                  "appbuilder_view_track",
                  "appbuilder_view_edit",
                  "appbuilder_trash"
               ];
               if (rightSplitItems.indexOf(columnName) != -1) {
                  // Block events so we can leave the delete column alone
                  this.blockEvent();
                  this.setColumnWidth(columnName, oldWidth); // keeps original width
                  this.unblockEvent();
                  // Listen to events again

                  // find the last column's config
                  var column = _logic.getLastColumn();

                  columnName = column.id;

                  // determine if we are making the column larger or smaller
                  if (newWidth < oldWidth) {
                     newWidth = column.width + 40; // add 40 because there is not any more space to drag so we will allow 40px increments
                  } else {
                     newWidth = column.width - (newWidth - 40); // take the column's width and subtrack the difference of the expanded delet column drag
                  }
                  // we don't want columns to be smaller than 50 ?? do we ?? I could be wrong maybe a checkbox could be smaller so this could change
                  if (newWidth < 50) {
                     newWidth = 50;
                  }
                  // minWidth is important because we are using fillspace:true
                  column.minWidth = newWidth;
                  // Sets the UI
                  this.setColumnWidth(columnName, newWidth);
               }
               // Saves the new width
               if (user_action) {
                  _logic.onColumnResize(
                     columnName,
                     newWidth,
                     oldWidth,
                     user_action
                  );
               }
            },
            onRowResize: function(rowId) {
               _logic.onRowResize(rowId);
            },
            onBeforeColumnDrag: function(sourceId, event) {
               var skippable = [
                  "appbuilder_select_item",
                  "appbuilder_view_detail",
                  "appbuilder_view_track",
                  "appbuilder_view_edit",
                  "appbuilder_trash"
               ];
               if (skippable.indexOf(sourceId) != -1) return false;
               else return true;
            },
            onBeforeColumnDrop: function(sourceId, targetId, event) {
               var skippable = [
                  "appbuilder_select_item",
                  "appbuilder_view_detail",
                  "appbuilder_view_track",
                  "appbuilder_view_edit",
                  "appbuilder_trash"
               ];
               if (skippable.indexOf(targetId) != -1) return false;
            },
            onAfterColumnDrop: function(sourceId, targetId, event) {
               _logic.onAfterColumnDrop(sourceId, targetId, event);
            },
            onAfterColumnShow: function(id) {
               console.warn("!! ToDo: onAfterColumnShow()");
               // $$(self.webixUiId.visibleFieldsPopup).showField(id);
            },
            onAfterColumnHide: function(id) {
               console.warn("!! ToDo: onAfterColumnHide()");
               // $$(self.webixUiId.visibleFieldsPopup).hideField(id);
            },

            onHeaderClick: function(id, e, node) {
               if (settings.configureHeaders) _logic.onHeaderClick(id, e, node);
            }
         }
      };

      // Grouping
      if (settings.isTreeDatable || settings.groupBy) {
         // switch datatable to support tree
         this.ui.view = "treetable";
         // this.ui.scheme = {
         //     $group: {
         //         by: settings.groupBy
         //     }
         // };
      }

      // Our init() function for setting up our UI
      this.init = (options, accessLevel) => {
         if (!accessLevel) {
            // if no access level is passed we are going to not change anything
            accessLevel = 2;
         }

         // WORKAROUND : Where should we define this ??
         // For include PDF.js
         webix.codebase = "";
         webix.cdn = "/js/webix";

         // register our callbacks:
         for (var c in _logic.callbacks) {
            _logic.callbacks[c] = options[c] || _logic.callbacks[c];
         }

         // webix.extend($$(ids.form), webix.ProgressBar);

         PopupHeaderEditComponent.init({
            onClick: _logic.callbackHeaderEdit // be notified when there is a change in the hidden fields
         });

         // NOTE: register the onAfterRender() here, so it only registers
         // one.
         var DataTable = $$(ids.component);
         var throttleCustomDisplay = null;
         // var items = [];

         webix.extend(DataTable, webix.ProgressBar);

         DataTable.config.accessLevel = accessLevel;
         if (accessLevel < 2) {
            DataTable.define("editable", false);
         }

         let customDisplays = (data) => {
            if (!CurrentObject || !DataTable.data) return;

            var displayRecords = [];

            let verticalScrollState = DataTable.getScrollState().y,
               rowHeight = DataTable.config.rowHeight,
               height = DataTable.$view.querySelector(".webix_ss_body")
                  .clientHeight,
               startRecIndex = Math.floor(verticalScrollState / rowHeight),
               endRecIndex = startRecIndex + DataTable.getVisibleCount(),
               index = 0;

            DataTable.data.order.each(function(id) {
               if (id != null && startRecIndex <= index && index <= endRecIndex)
                  displayRecords.push(id);

               index++;
            });

            var editable = settings.isEditable;
            if (DataTable.config.accessLevel < 2) {
               editable = false;
            }
            CurrentObject.customDisplays(
               data,
               App,
               DataTable,
               displayRecords,
               editable
            );
         };

         DataTable.attachEvent("onAfterRender", function(data) {
            DataTable.resize();

            // items = [];
            // data.order.each(function (i) {
            //     if (typeof i != "undefined") items.push(i);
            // });

            if (throttleCustomDisplay) clearTimeout(throttleCustomDisplay);
            throttleCustomDisplay = setTimeout(() => {
               if (CurrentObject) {
                  if (scrollStarted) clearTimeout(scrollStarted);
                  customDisplays(this.data);
               }
            }, 350);
         });

         // we have some data types that have custom displays that don't look right after scrolling large data sets we need to call customDisplays again
         var scrollStarted = null;
         DataTable.attachEvent("onScroll", function() {
            if (scrollStarted) clearTimeout(scrollStarted);
            if (throttleCustomDisplay) clearTimeout(throttleCustomDisplay);

            scrollStarted = setTimeout(() => {
               customDisplays(this.data);
            }, 1500);
         });

         // we have some data types that have custom displays that don't look right after scrolling large data sets we need to call customDisplays again
         DataTable.attachEvent("onAfterScroll", function() {
            if (throttleCustomDisplay) clearTimeout(throttleCustomDisplay);

            throttleCustomDisplay = setTimeout(() => {
               if (CurrentObject) {
                  if (scrollStarted) clearTimeout(scrollStarted);
                  customDisplays(this.data);
               }
            }, 350);
         });

         // Process our onItemClick events.
         // this is a good place to check if our delete/trash icon was clicked.
         DataTable.attachEvent("onItemClick", function(id, e, node) {
            // make sure we have an object selected before processing this.
            if (!CurrentObject) {
               return;
            }

            if (settings.isEditable == 0) {
               // console.log(e);
               // console.log(id);
               // console.log(node);
               // console.log(DataTable.getItem(id));
               var items = DataTable.getItem(id);
            }
            // if this was our edit icon:
            // console.log(e.target.className);
            if (e == "auto") {
               // just pass by if we are going to call change page in ABViewGrid later
            } else if (e.target.className.indexOf("pencil") > -1) {
               // alert("edit");
            } else if (e.target.className.indexOf("eye") > -1) {
               // if this was our view icon:
               // alert("view");
            } else if (e.target.className.indexOf("track") > -1) {
               App.actions.openObjectTrack(CurrentObject, id.row);
            } else if (e.target.className.indexOf("trash") > -1) {
               // if this was our trash icon:

               OP.Dialog.Confirm({
                  title: labels.component.confirmDeleteRowTitle,
                  text: labels.component.confirmDeleteRowMessage,
                  callback: function(result) {
                     if (result) {
                        CurrentObject.model()
                           .delete(id.row)
                           .then((response) => {
                              if (response.numRows > 0) {
                                 DataTable.remove(id);
                                 DataTable.clearSelection();
                              } else {
                                 OP.Dialog.Alert({
                                    text:
                                       "No rows were effected.  This does not seem right."
                                 });
                              }
                           })
                           .catch((err) => {
                              OP.Error.log("Error deleting item:", {
                                 error: err
                              });

                              //// TODO: what do we do here?
                           });
                     }

                     DataTable.clearSelection();
                     return true;
                  }
               });
            }
         });
      };

      var CurrentObject = null; // current ABObject being displayed
      var CurrentDatacollection = null; // current ABDatacollection
      var EditField = null; // which field (column header) is popup editor for
      var EditNode = null; // which html node (column header) is popup editor for

      // our internal business logic
      var _logic = (this._logic = {
         callbacks: {
            /**
             * @function onEditorMenu
             * report back which menu action was clicked.
             * We get the info from our popupHeaderEditor component, but all the
             * logic to respond to those options are in our parent. So we pass it
             * on ...
             *
             * @param {string} action [ 'hide', 'filter', 'sort', 'edit', 'delete' ]
             * @param {ABField} field  the field to which the action is to be applied
             * @param {dom} node  the optional html node for this header item.
             */
            onEditorMenu: function(action, field) {},

            onColumnOrderChange: function(object) {},

            onCheckboxChecked: function(state) {}
         },

         /**
          * @function callbackHeaderEdit
          *
          * call back for when an item in the Header Edit Menu has been selected.
          * @param {string} action the action requested for this field:
          */
         callbackHeaderEdit: function(action) {
            PopupHeaderEditComponent.hide();
            _logic.callbacks.onEditorMenu(action, EditField, EditNode);
         },

         toggleUpdateDelete: function() {
            var DataTable = $$(ids.component);
            var checkedItems = 0;
            DataTable.data.each(function(obj) {
               if (
                  typeof obj != "undefined" &&
                  obj.hasOwnProperty("appbuilder_select_item") &&
                  obj.appbuilder_select_item == 1
               ) {
                  checkedItems++;
               }
            });
            if (checkedItems > 0) {
               _logic.callbacks.onCheckboxChecked("enable");
            } else {
               _logic.callbacks.onCheckboxChecked("disable");
            }
         },

         /**
          * @function getColumnConfig
          *
          * return the column index of a given column ID
          * @param {string} id column id you want the index of
          */
         getColumnConfig: function(id) {
            var DataTable = $$(ids.component);

            return DataTable.getColumnConfig(id);
         },

         /**
          * @function getColumnIndex
          *
          * return the column index of a given column ID
          * @param {string} id column id you want the index of
          */
         getColumnIndex: function(id) {
            var DataTable = $$(ids.component);

            return DataTable.getColumnIndex(id);
         },

         /**
          * @function getFieldList
          *
          * return the column config of a datagrid
          */
         getFieldList: function() {
            var DataTable = $$(ids.component);

            return DataTable.fieldList;
         },

         /**
          * @function getLastColumn
          *
          * return the last column of a datagrid that is resizeable
          */
         getLastColumn: function() {
            var DataTable = $$(ids.component);
            var lastColumn = {};

            // Loop through each columns config to find out if it is in the split 1 region and set it as the last item...then it will be overwritten by next in line
            DataTable.eachColumn(function(columnId) {
               var columnConfig = DataTable.getColumnConfig(columnId);
               if (columnConfig.split == 1) lastColumn = columnConfig;
            });

            return lastColumn;
         },

         hideHeader: function() {
            var DataTable = $$(ids.component);
            DataTable.define("header", false);
            DataTable.refresh();
         },

         freezeDeleteColumn: function() {
            var DataTable = $$(ids.component);
            // we are going to always freeze the delete column if the datatable is wider than the container so it is easy to get to
            // console.log("right split: " + columnSplitRight);
            return DataTable.define("rightSplit", columnSplitRight);
         },

         /**
          * @function onAfterColumnDrop
          * When an editor drops a column to save a new column order
          * @param {string} sourceId the columnName of the item dragged
          * @param {string} targetId the columnName of the item dropped on
          * @param {event} event
          */
         onAfterColumnDrop: function(sourceId, targetId, event) {
            CurrentObject.fieldReorder(sourceId, targetId)
               .then(() => {
                  var DataTable = $$(ids.component);
                  // reset each column after a drop so we do not have multiple fillspace and minWidth settings
                  var editiable = settings.isEditable;
                  if (DataTable.config.accessLevel < 2) {
                     editiable = false;
                  }
                  var columnHeaders = CurrentObject.columnHeaders(
                     true,
                     editiable
                  );
                  columnHeaders.forEach(function(col) {
                     if (col.id == sourceId && col.fillspace == true) {
                        columnHeader.fillspace = false;
                        columnHeader.minWidth = columnHeader.width;
                     }
                  });

                  _logic.callbacks.onColumnOrderChange(CurrentObject);
                  // freeze columns:
                  let frozenColumnID =
                     settings.frozenColumnID != null
                        ? settings.frozenColumnID
                        : CurrentObject.workspaceFrozenColumnID;
                  if (frozenColumnID != "") {
                     DataTable.define(
                        "leftSplit",
                        DataTable.getColumnIndex(frozenColumnID) +
                           columnSplitLeft
                     );
                  } else {
                     DataTable.define("leftSplit", columnSplitLeft);
                  }
                  _logic.freezeDeleteColumn();
                  DataTable.refreshColumns();
               })
               .catch((err) => {
                  OP.Error.log("Error saving new column order:", {
                     error: err
                  });
               });
         },

         /**
          * @function onAfterEditStop
          * When an editor is finished.
          * @param {json} state
          * @param {} editor
          * @param {} ignoreUpdate
          * @return
          */
         onAfterEditStop: function(state, editor, ignoreUpdate) {
            // state:   {value: "new value", old: "old value"}
            // editor:  { column:"columnName", row:ID, value:'value', getInputNode:fn(), config:{}, focus: fn(), getValue: fn(), setValue: function, getInputNode: function, render: function…}

            var DataTable = $$(ids.component);

            // if you don't edit an empty cell we just need to move on
            if (
               (state.old == null && state.value === "") ||
               (state.old === "" && state.value === "")
            ) {
               DataTable.clearSelection();
               return false;
            }

            if (editor.config) {
               switch (editor.config.editor) {
                  case "number":
                     state.value = parseFloat(state.value);
                     break;
                  case "datetime":
                     state.value = state.value.getTime();
                     if (state && state.old && state.old.getTime)
                        state.old = state.old.getTime();
                     break;
                  default:
                  // code block
               }
            }

            if (state.value != state.old) {
               var item = DataTable.getItem(editor.row);
               item[editor.column] = state.value;

               DataTable.removeCellCss(item.id, editor.column, "webix_invalid");
               DataTable.removeCellCss(
                  item.id,
                  editor.column,
                  "webix_invalid_cell"
               );

               var validator = CurrentObject.isValidData(item);
               if (validator.pass()) {
                  //// Question: do we submit full item updates?  or just patches?
                  var patch = {};
                  patch.id = item.id;
                  patch[editor.column] = item[editor.column]; // NOTE: isValidData() might also condition the data for sending.state.value;
                  CurrentObject.model()
                     // .upsert(item)
                     .update(item.id, item)
                     // .update(item.id, patch)
                     .then(() => {
                        if (DataTable.exists(editor.row)) {
                           DataTable.updateItem(editor.row, item);
                           DataTable.clearSelection();
                           DataTable.refresh(editor.row);
                        }
                     })
                     .catch((err) => {
                        OP.Error.log("Error saving item:", {
                           error: err
                        });

                        DataTable.clearSelection();
                        if (
                           OP.Validation.isGridValidationError(
                              err,
                              editor.row,
                              DataTable
                           )
                        ) {
                           // Do we reset the value?
                           // item[editor.column] = state.old;
                           // DataTable.updateItem(editor.row, item);
                        } else {
                           // this was some other Error!
                        }
                     });
               } else {
                  validator.updateGrid(editor.row, DataTable);
               }
            } else {
               DataTable.clearSelection();
            }
            return false;

            // var item = $$(self.webixUiId.objectDatatable).getItem(editor.row);

            // self.updateRowData(state, editor, ignoreUpdate)
            // 	.fail(function (err) { // Cached
            // 		item[editor.column] = state.old;
            // 		$$(self.webixUiId.objectDatatable).updateItem(editor.row, item);
            // 		$$(self.webixUiId.objectDatatable).refresh(editor.row);

            // 		// TODO : Message

            // 		$$(self.webixUiId.objectDatatable).hideProgress();
            // 	})
            // 	.then(function (result) {
            // 		if (item) {
            // 			item[editor.column] = state.value;

            // 			if (result && result.constructor.name === 'Cached' && result.isUnsync())
            // 				item.isUnsync = true;

            // 			$$(self.webixUiId.objectDatatable).updateItem(editor.row, item);
            // 		}

            // 		// TODO : Message

            // 		$$(self.webixUiId.objectDatatable).hideProgress();
            // 	});
         },

         onAfterLoad: function() {
            // We are going to do this with a server side call now
            // _logic.sortTable();
         },

         /**
          * @function onAfterSelect
          * This is when a user clicks on a cell.  We use the onAfterSelect to
          * trigger a normal .editCell() if there isn't a custom editor for this field.
          * @param {json} data webix cell data
          * @return
          */
         onAfterSelect: function(data, prevent) {
            // data: {row: 1, column: "name", id: "1_name", toString: function}
            // data.row: .model.id
            // data.column => columnName of the field

            // Normal update data
            $$(ids.component).editCell(data.row, data.column);

            // var columnConfig = $$(self.webixUiId.objectDatatable).getColumnConfig(data.column),
            // 	fieldData = AD.classes.AppBuilder.currApp.currObj.columns.filter(function (col) { return col.name == data.column; });

            // if (!fieldData || fieldData.length < 1) {
            // 	console.log('System could not found this column data');
            // 	return false;
            // } else
            // 	fieldData = fieldData[0];

            // // Custom update data
            // if (dataFieldsManager.hasCustomEdit(columnConfig.fieldName, fieldData))
            // 	return false;

            // // Normal update data
            // this.editCell(data.row, data.column);
         },

         /**
          * @function onColumnResize
          * This is when a user adjusts the size of a column
          * @param {} columnName
          * @param {int} newWidth
          * @param {int} oldWidth
          * @param {} user_action
          * @return
          */
         onColumnResize: function(columnName, newWidth, oldWidth, user_action) {
            CurrentObject.columnResize(columnName, newWidth, oldWidth)
               .then(() => {
                  var DataTable = $$(ids.component);
                  _logic.freezeDeleteColumn();
                  DataTable.refreshColumns();
               })
               .catch((err) => {
                  OP.Error.log("Error saving new column size:", {
                     error: err
                  });
               });
         },

         /**
          * @function onRowResize
          * This is when a user adjusts the size of a row
          * @param {} rowId
          * @param {int} newHeight
          * @param {int} oldHeight
          * @param {} user_action
          * @return
          */
         onRowResize: function(rowId) {
            var DataTable = $$(ids.component);

            var item = DataTable.getItem(rowId);
            var height = item.$height;

            var properties = item.properties || {};
            properties.height = height;

            item.properties = properties;

            CurrentObject.model()
               .update(item.id, item)
               .then(() => {})
               .catch((err) => {
                  OP.Error.log("Error saving item:", { error: err });
               });
         },

         /**
          * @function onHeaderClick
          *
          * process the user clicking on the header for one of our columns.
          */
         onHeaderClick: function(id, e, node) {
            // Ignore system columns
            var skippable = [
               "appbuilder_select_item",
               "appbuilder_view_detail",
               "appbuilder_view_track",
               "appbuilder_view_edit",
               "appbuilder_trash"
            ];
            if (skippable.indexOf(id.column) != -1) return false;

            // save our EditNode & EditField:
            EditNode = node;

            EditField = CurrentObject.fields(function(f) {
               return f.columnName == id.column;
            })[0];
            if (EditField) {
               // show the popup
               PopupHeaderEditComponent.show(node, EditField);
            }

            return false;
         },

         objectLoad: function(object) {
            CurrentObject = object;

            var DataTable = $$(ids.component);
            var minHeight = 0;
            defaultHeight = 0;
            CurrentObject.fields().forEach(function(f) {
               if (f.key == "image") {
                  imageFields.push(f.columnName);
                  if (
                     parseInt(f.settings.useHeight) == 1 &&
                     parseInt(f.settings.imageHeight) > minHeight
                  ) {
                     minHeight = parseInt(f.settings.imageHeight) + 20;
                  }
               }
            });
            if (minHeight > 0) {
               defaultHeight = minHeight;
            }

            PopupHeaderEditComponent.objectLoad(object);

            // grouping
            // _logic.grouping(settings.groupBy);

            // supressed this because it seems to be making an extra call?
            // _logic.refresh();
         },

         /**
          * @method datacollectionLoad
          *
          * @param datacollection {ABDatacollection}
          */
         datacollectionLoad: (datacollection) => {
            let DataTable = $$(this.ui.id);
            CurrentDatacollection = datacollection;
            if (CurrentDatacollection) {
               if (
                  CurrentDatacollection.datacollectionLink &&
                  CurrentDatacollection.fieldLink
               ) {
                  CurrentDatacollection.bind(
                     DataTable,
                     CurrentDatacollection.datacollectionLink,
                     CurrentDatacollection.fieldLink
                  );
               } else {
                  CurrentDatacollection.bind(DataTable);
               }
               CurrentDatacollection.on("initializingData", () => {
                  _logic.busy();
               });
               CurrentDatacollection.on("initializedData", () => {
                  _logic.ready();
               });
               CurrentDatacollection.on("loadData", () => {
                  let $treetable = $$(this.ui.id);
                  if (
                     $treetable &&
                     $treetable.config.view == "treetable" &&
                     CurrentObject &&
                     !CurrentObject.isGroup
                  ) {
                     $treetable.clearAll();
                     $treetable.parse(CurrentDatacollection.getData());

                     _logic.grouping();
                     _logic.ready();
                  }
               });
               _logic.grouping();
            } else DataTable.unbind();
         },

         // // rebuild the data table view:
         // refresh: function(loadAll) {

         // 	// wait until we have an Object defined:
         // 	if (CurrentObject) {
         //         var DataTable = $$(ids.component);
         //         DataTable.clearAll();
         // 		//// update DataTable Content

         // 		// Set the Model object with a condition / skip / limit, then
         // 		// use it to load the DataTable:
         // 		//// NOTE: this should take advantage of Webix dynamic data loading on
         // 		//// larger data sets.
         //         var wheres = {};
         //         if (CurrentObject.workspaceFilterConditions &&
         //             CurrentObject.workspaceFilterConditions.rules &&
         //             CurrentObject.workspaceFilterConditions.rules.length > 0) {
         //             wheres = CurrentObject.workspaceFilterConditions;
         //         }
         //         var sorts = {};
         //         if (CurrentObject.workspaceSortFields &&
         //             CurrentObject.workspaceSortFields.length > 0) {
         //             sorts = CurrentObject.workspaceSortFields;
         //         }
         //         CurrentObject.model()
         //         .where(wheres)
         //         .sort(sorts)
         // 		.skip(0)
         // 		.limit(loadAll ? null : 30)
         // 		.loadInto(DataTable);
         // 	}
         // },

         /**
          * @function refreshHeader()
          *
          * refresh the header for the table apart from the refresh() command
          */
         refreshHeader: function() {
            columnSplitRight = 0;
            // wait until we have an Object defined:
            if (!CurrentObject) return;

            var DataTable = $$(ids.component);
            var accessLevel = DataTable.config.accessLevel;
            DataTable.define("leftSplit", 0);
            DataTable.define("rightSplit", 0);
            // DataTable.clearAll();

            var editable = settings.isEditable;
            if (DataTable.config.accessLevel < 2) {
               editable = false;
            }

            //// update DataTable structure:
            // get column list from our CurrentObject
            var columnHeaders = CurrentObject.columnHeaders(
               true,
               editable,
               settings.summaryColumns,
               settings.countColumns,
               settings.hiddenFields
            );

            var fieldValidations = [];
            var rulePops = [];

            columnHeaders.forEach(function(col) {
               col.fillspace = false;

               // parse the rules because they were stored as a string
               // check if rules are still a string...if so lets parse them
               if (
                  col.validationRules &&
                  typeof col.validationRules === "string"
               ) {
                  col.validationRules = JSON.parse(col.validationRules);
               }

               if (col.validationRules && col.validationRules.length) {
                  var validationUI = [];
                  // there could be more than one so lets loop through and build the UI
                  col.validationRules.forEach((rule) => {
                     var Filter = new FilterComplex(
                        App,
                        col.id + "_" + webix.uid()
                     );
                     // add the new ui to an array so we can add them all at the same time
                     validationUI.push(Filter.ui);
                     // store the filter's info so we can assign values and settings after the ui is rendered
                     fieldValidations.push({
                        filter: Filter,
                        view: Filter.ids.querybuilder,
                        columnName: col.id,
                        validationRules: rule.rules,
                        invalidMessage: rule.invalidMessage
                     });
                  });
                  // create a unique view id for popup
                  var popUpId = ids.rules + "_" + col.id + "_" + webix.uid();
                  // store the popup ids so we can remove the later
                  rulePops.push(popUpId);
                  // add the popup to the UI but don't show it
                  webix.ui({
                     view: "popup",
                     css: "ab-rules-popup",
                     id: popUpId,
                     body: {
                        rows: validationUI
                     }
                  });
               }

               // group header
               if (
                  settings.groupBy &&
                  (settings.groupBy || "").indexOf(col.id) > -1
               ) {
                  var groupField = CurrentObject.fields(
                     (f) => f.columnName == col.id
                  )[0];
                  if (groupField) {
                     col.template = function(obj, common) {
                        // return common.treetable(obj, common) + obj.value;
                        if (obj.$group) {
                           let rowData = _.clone(obj);
                           rowData[groupField.columnName] = rowData.value;

                           return (
                              common.treetable(obj, common) +
                              groupField.format(rowData)
                           );
                        } else return groupField.format(obj);
                     };
                  }
               }
            });

            if (fieldValidations.length) {
               // we need to store the rules for use later so lets build a container array
               var complexValidations = [];
               fieldValidations.forEach((f) => {
                  // init each ui to have the properties (app and fields) of the object we are editing
                  f.filter.applicationLoad(CurrentObject.application);
                  f.filter.fieldsLoad(CurrentObject.fields());
                  // now we can set the value because the fields are properly initialized
                  f.filter.setValue(f.validationRules);
                  // if there are validation rules present we need to store them in a lookup hash
                  // so multiple rules can be stored on a single field
                  if (!Array.isArray(complexValidations[f.columnName]))
                     complexValidations[f.columnName] = [];

                  // now we can push the rules into the hash
                  complexValidations[f.columnName].push({
                     filters: $$(f.view).getFilterHelper(),
                     values: $$(ids.component).getSelectedItem(),
                     invalidMessage: f.invalidMessage
                  });
               });
               var rules = {};
               var dataTable = $$(ids.component);
               // store the rules in a data param to be used later
               dataTable.$view.complexValidations = complexValidations;
               // use the lookup to build the validation rules
               Object.keys(complexValidations).forEach(function(key) {
                  rules[key] = function(value, data) {
                     // default valid is true
                     var isValid = true;
                     var invalidMessage = "";
                     dataTable.$view.complexValidations[key].forEach(
                        (filter) => {
                           // convert rowData from { colName : data } to { id : data }
                           var newData = {};
                           (CurrentObject.fields() || []).forEach((field) => {
                              newData[field.id] = data[field.columnName];
                           });
                           // for the case of "this_object" conditions:
                           if (data.uuid) {
                              newData["this_object"] = data.uuid;
                           }

                           // use helper funtion to check if valid
                           var ruleValid = filter.filters(newData);
                           // if invalid we need to tell the field
                           if (ruleValid == false) {
                              isValid = false;
                              invalidMessage = filter.invalidMessage;
                           }
                        }
                     );
                     if (isValid == false) {
                        // we also need to define an error message
                        webix.message({
                           type: "error",
                           text: invalidMessage
                        });
                     }
                     return isValid;
                  };
               });
               // define validation rules
               dataTable.define("rules", rules);
               // store the array of view ids on the webix object so we can get it later
               dataTable.config.rulePops = rulePops;
               dataTable.refresh();
            } else {
               var dataTable = $$(ids.component);
               // check if the previous datatable had rule popups and remove them
               if (dataTable.config.rulePops) {
                  dataTable.config.rulePops.forEach((popup) => {
                     if ($$(popup)) $$(popup).destructor();
                  });
               }
               // remove any validation rules from the previous table
               dataTable.define("rules", {});
               dataTable.refresh();
            }

            if (settings.labelAsField) {
               console.log(CurrentObject);
               columnHeaders.unshift({
                  id: "appbuilder_label_field",
                  header: "Label",
                  fillspace: true,
                  template: function(obj) {
                     return CurrentObject.displayData(obj);
                  }
                  // css: { 'text-align': 'center' }
               });
            }

            if (settings.massUpdate && accessLevel == 2) {
               columnHeaders.unshift({
                  id: "appbuilder_select_item",
                  header: { content: "masterCheckbox", contentId: "mch" },
                  width: 40,
                  template:
                     "<div class='singleSelect'>{common.checkbox()}</div>",
                  css: { "text-align": "center" }
               });
               columnSplitLeft = 1;
            } else {
               columnSplitLeft = 0;
            }
            if (settings.detailsView != null && !settings.hideButtons) {
               columnHeaders.push({
                  id: "appbuilder_view_detail",
                  header: "",
                  width: 40,
                  template: function(obj, common) {
                     return "<div class='detailsView'><span class='webix_icon fa fa-eye'></span></div>";
                  },
                  css: { "text-align": "center" }
               });
               columnSplitRight++;
            }
            if (settings.trackView != null && accessLevel == 2) {
               columnHeaders.push({
                  id: "appbuilder_view_track",
                  header: "",
                  width: 40,
                  template:
                     "<div class='track'><span class='track fa fa-history'></span></div>",
                  css: { "text-align": "center", cursor: "pointer" }
               });
               columnSplitRight++;
            }
            if (
               settings.editView != null &&
               !settings.hideButtons &&
               accessLevel == 2
            ) {
               columnHeaders.push({
                  id: "appbuilder_view_edit",
                  header: "",
                  width: 40,
                  template: "<div class='edit'>{common.editIcon()}</div>",
                  css: { "text-align": "center" }
               });
               columnSplitRight++;
            }
            if (settings.allowDelete && accessLevel == 2) {
               columnHeaders.push({
                  id: "appbuilder_trash",
                  header: "",
                  width: 40,
                  template: "<div class='trash'>{common.trashIcon()}</div>",
                  css: { "text-align": "center" }
               });
               columnSplitRight++;
            }

            // add fillspace to last editiable column
            var hiddenFields = settings.hiddenFields
               ? settings.hiddenFields.length
               : 0;
            var lastCol =
               columnHeaders[
                  columnHeaders.length - hiddenFields - columnSplitRight - 1
               ];
            if (lastCol) {
               lastCol.fillspace = true;
               lastCol.minWidth = lastCol.width;
               lastCol.width = 150; // set a width for last column but by default it will fill the available space or use the minWidth to take up more
            }

            DataTable.refreshColumns(columnHeaders);

            // freeze columns:
            let frozenColumnID =
               settings.frozenColumnID != null
                  ? settings.frozenColumnID
                  : CurrentObject.workspaceFrozenColumnID;
            if (frozenColumnID != "") {
               DataTable.define(
                  "leftSplit",
                  DataTable.getColumnIndex(frozenColumnID) + 1
               );
            } else {
               DataTable.define("leftSplit", columnSplitLeft);
            }
            _logic.freezeDeleteColumn();
            DataTable.refreshColumns();

            // }
         },

         grouping: () => {
            if (!this._settings.groupBy) return;

            let $treetable = $$(this.ui.id);

            // map: {
            //     votes:["votes", "sum"],
            //     title:["year"]
            // }
            let baseGroupMap = {};
            CurrentObject.fields().forEach((f) => {
               // if (f.columnName == settings.groupBy) return;

               switch (f.key) {
                  case "number":
                     baseGroupMap[f.columnName] = [f.columnName, "sum"];
                     break;
                  case "calculate":
                  case "formula":
                     baseGroupMap[f.columnName] = [
                        f.columnName,
                        function(prop, listData) {
                           if (!listData) return 0;

                           let sum = 0;

                           listData.forEach((r) => {
                              sum += f.format(r) * 1;
                           });

                           return sum;
                        }
                     ];
                     break;
                  case "connectObject":
                     baseGroupMap[f.columnName] = [
                        f.columnName,
                        function(prop, listData) {
                           if (!listData || !listData.length) return 0;

                           let count = 0;

                           listData.forEach((r) => {
                              var valRelation = r[f.relationName()];

                              // array
                              if (valRelation && valRelation.length != null)
                                 count += valRelation.length;
                              // object
                              else if (valRelation) count += 1;
                           });

                           return count;
                        }
                     ];
                     break;
                  default:
                     baseGroupMap[f.columnName] = [
                        f.columnName,
                        function(prop, listData) {
                           if (!listData || !listData.length) return 0;

                           let count = 0;

                           listData.forEach((r) => {
                              var val = prop(r);

                              // // "false" to boolean
                              // if (f.key == "boolean") {

                              //     try {
                              //         val = JSON.parse(val || 0);
                              //     }
                              //     catch (err) {
                              //         val = false;
                              //     }
                              // }

                              // count only exists data
                              if (val) {
                                 count += 1;
                              }
                           });

                           return count;
                        }
                     ];
                     break;
               }
            });

            // set group definition
            // DataTable.define("scheme", {
            //    $group: {
            //       by: settings.groupBy,
            //       map: groupMap
            //    }
            // });

            // NOTE: https://snippet.webix.com/e3a2bf60
            let groupBys = (this._settings.groupBy || "")
               .split(",")
               .map((g) => g.trim());
            // Reverse the array NOTE: call .group from child to root
            groupBys = groupBys.reverse();
            groupBys.forEach((colName, gIndex) => {
               let by;
               let groupMap = _.clone(baseGroupMap);

               // Root
               if (gIndex == groupBys.length - 1) {
                  by = colName;
               }
               // Sub groups
               else {
                  by = (row) => {
                     let byValue = row[colName];
                     for (let i = gIndex + 1; i < groupBys.length; i++) {
                        byValue = `${row[groupBys[i]]} - ${byValue}`;
                     }
                     return byValue;
                  };

                  // remove parent group data
                  groupBys.forEach((gColName) => {
                     if (gColName != colName) groupMap[gColName] = [gColName];
                  });
               }

               $treetable.data.group({
                  by: by,
                  map: groupMap
               });
            });
         },

         /**
          * @function rowAdd()
          *
          * add a new row to the data table
          */
         rowAdd: function() {
            if (!settings.isEditable) return;

            var emptyObj = CurrentObject.defaultValues();
            CurrentObject.model()
               .create(emptyObj)
               .then((obj) => {
                  if (obj == null) return;

                  // var DataTable = $$(ids.component);
                  // if (!DataTable.exists(obj.id))
                  //     DataTable.add(obj, 0);
                  if (
                     CurrentDatacollection &&
                     CurrentDatacollection.__dataCollection &&
                     !CurrentDatacollection.__dataCollection.exists(obj.id)
                  )
                     CurrentDatacollection.__dataCollection.add(obj, 0);
               });
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
          * @function toolTip()
          *
          * Retrieve the items toolTip
          */
         toolTip: function(obj, common) {
            var tip = "";
            var columnName = common.column.id.replace(" ", "");
            if (Array.isArray(obj[columnName])) {
               obj[columnName].forEach(function(o) {
                  if (o.text) tip += o.text + "<br/>";
               });
            } else if (typeof obj[columnName + "__relation"] != "undefined") {
               var relationData = obj[columnName + "__relation"];
               if (!Array.isArray(relationData)) relationData = [relationData];

               (relationData || []).forEach(function(o) {
                  if (o) tip += o.text + "<br/>";
               });
            } else if (
               typeof obj[columnName + "__relation"] != "undefined" &&
               typeof obj[columnName] == "number"
            ) {
               tip = obj[columnName + "__relation"].text;
            } else if (imageFields.indexOf(columnName) != -1) {
               if (obj[columnName] == null) {
                  return "";
               } else {
                  tip =
                     "<img style='max-width: 500px; max-height: 500px;' src='/opsportal/image/" +
                     CurrentObject.application.name +
                     "/" +
                     obj[columnName] +
                     "' />";
               }
            } else if (common.column.editor == "date") {
               tip = common.column.format(obj[columnName]);
            } else if (common.column.editor == "richselect") {
               CurrentObject.fields().forEach(function(f) {
                  if (f.columnName == columnName) {
                     if (f.settings.options) {
                        f.settings.options.forEach(function(o) {
                           if (o.id == obj[columnName]) {
                              tip = o.text;
                           }
                        });
                     }
                  }
               });
            } else {
               tip = obj[columnName];
            }
            if (tip == null) {
               return "";
            } else {
               return tip;
            }
         },

         /**
          * @function toolTipOnBeforeRender()
          *
          * Add visibility "hidden" to all tooltips before render so we can move to a new location without the visual jump
          */
         toolTipOnBeforeRender: function(node) {
            // var node = $$(ids.tooltip).getNode();
            node.style.visibility = "hidden";
         },

         /**
          * @function toolTipOnAfterRender()
          *
          * If the tooltip is displaying off the screen we want to try to reposition it for a better experience
          */
         toolTipOnAfterRender: function(node) {
            // var node = $$(ids.tooltip).getNode();
            if (node.firstChild != null && node.firstChild.nodeName == "IMG") {
               setTimeout(function() {
                  var imgBottom =
                     parseInt(node.style.top.replace("px", "")) + 500;
                  var imgRight =
                     parseInt(node.style.left.replace("px", "")) + 500;
                  if (imgBottom > window.innerHeight) {
                     var imgOffsetY = imgBottom - window.innerHeight;
                     var newTop =
                        parseInt(node.style.top.replace("px", "")) - imgOffsetY;
                     node.style.top = newTop + "px";
                  }
                  if (imgRight > window.innerWidth) {
                     var imgOffsetX = imgRight - window.innerWidth;
                     var newLeft =
                        parseInt(node.style.left.replace("px", "")) -
                        imgOffsetX;
                     node.style.left = newLeft + "px";
                  }
                  node.style.visibility = "visible";
               }, 250);
            } else {
               node.style.visibility = "visible";
            }
         },

         busy: () => {
            if ($$(this.ui.id) && $$(this.ui.id).showProgress)
               $$(this.ui.id).showProgress({ type: "icon" });
         },

         ready: () => {
            if ($$(this.ui.id) && $$(this.ui.id).hideProgress)
               $$(this.ui.id).hideProgress();
         },

         editable: function() {
            var DataTable = $$(ids.component);

            DataTable.define("editable", true);
            DataTable.refresh();

            settings.isEditable = true;
            settings.allowDelete = true;
            settings.massUpdate = true;
         },

         readonly: function() {
            var DataTable = $$(ids.component);

            DataTable.define("editable", false);
            DataTable.refresh();

            settings.isEditable = false;
            settings.allowDelete = false;
            settings.massUpdate = false;
         },

         loadAll: function() {
            if (CurrentDatacollection) {
               CurrentDatacollection.settings.loadAll = true;
               CurrentDatacollection.reloadData(null, null);
            }

            // _logic.refresh(isLoadAll);
         }
      });

      // Expose any globally accessible Actions:
      this.actions({
         onRowResizeAuto: function(rowId, height) {
            var DataTable = $$(ids.component);

            var item = DataTable.getItem(rowId);
            var height = height;

            var properties = item.properties || {};
            properties.height = height;

            item.properties = properties;

            CurrentObject.model()
               .update(item.id, item)
               .then(() => {
                  item.$height = height;
                  DataTable.refresh();
               })
               .catch((err) => {
                  OP.Error.log("Error saving item:", { error: err });
               });
         }
      });

      //
      // Define our external interface methods:
      //
      this.datacollectionLoad = _logic.datacollectionLoad;
      this.objectLoad = _logic.objectLoad;
      // this.refresh = _logic.refresh;
      this.refreshHeader = _logic.refreshHeader;
      this.addRow = _logic.rowAdd;

      // allow getColumnConfig for sort data table component
      this.getColumnConfig = _logic.getColumnConfig;
      // expose data for badge on frozen button
      this.getColumnIndex = _logic.getColumnIndex;

      // expose data for column sort UI
      this.getFieldList = _logic.getFieldList;

      this.hideHeader = _logic.hideHeader;

      this.editable = _logic.editable;
      this.readonly = _logic.readonly;

      // expose load all records
      this.loadAll = _logic.loadAll;

      this.show = _logic.show;
   }
};

