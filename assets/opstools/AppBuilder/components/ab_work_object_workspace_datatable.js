
/*
 * ab_work_object_workspace
 *
 * Manage the Object Workspace area.
 *
 */

import "./ab_work_object_workspace_popupHeaderEditMenu"


function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var labels = {

	component: {
		confirmDeleteRowTitle : L('ab.object.deleteRow.title', "*Delete data"),
		confirmDeleteRowMessage : L('ab.object.deleteRow.message', "*Do you want to delete this row?"),
	}
}


var idBase = 'ab_work_object_workspace_datatable';
OP.Component.extend(idBase, function(App) {

	labels.common = App.labels;


	// internal list of Webix IDs to reference our UI components.
	var ids = {
		component: App.unique(idBase+'_component'),

	}



	// Our webix UI definition:
	var _ui = {
		view: "datatable",
		id: ids.component,
		resizeColumn: true,
		resizeRow: true,
		prerender: false,
		editable: true,
		fixedRowHeight: false,
		editaction: "custom",
		select: "cell",
		dragColumn: true,
//height:800,  // #hack!
		on: {
			onBeforeSelect: function (data, preserve) {

console.error('!! ToDo: onBeforeSelect()');
				// var itemNode = this.getItemNode({ row: data.row, column: data.column });

				// var column = AD.classes.AppBuilder.currApp.currObj.columns.filter(function (col) { return col.name == data.column; });
				// if (!column || column.length < 1) {
				// 	console.log('System could not found this column data');
				// 	return false;
				// } else
				// 	column = column[0];

				// return dataFieldsManager.customEdit(AD.classes.AppBuilder.currApp, AD.classes.AppBuilder.currApp.currObj, column, data.row, itemNode);
			},
			onAfterSelect: function (data, prevent) {
				_logic.onAfterSelect(data, prevent);
			},
			onCheck: function (row, col, val) { // Update checkbox data
console.error('!! ToDo: onCheck()');
				// var item = $$(self.webixUiId.objectDatatable).getItem(row);

				// self.updateRowData({ value: (val > 0 ? true : false) }, { row: row, column: col }, false)
				// 	.fail(function (err) {
				// 		// Rollback
				// 		item[col] = !val;
				// 		$$(self.webixUiId.objectDatatable).updateItem(row, item);
				// 		$$(self.webixUiId.objectDatatable).refresh(row);

				// 		$$(self.webixUiId.objectDatatable).hideProgress();
				// 	})
				// 	.then(function (result) {
				// 		$$(self.webixUiId.objectDatatable).hideProgress();
				// 	});
			},
			onBeforeEditStop: function (state, editor) {
console.error('!! ToDo: onBeforeEditStop()');
				// var column = AD.classes.AppBuilder.currApp.currObj.columns.filter(function (col) { return col.name == editor.column; });

				// if (!column || column.length < 1) return true;
				// column = column[0];

				// var passValidate = dataFieldsManager.validate(column, state.value);

				// if (!passValidate) {
				// 	$$(self.webixUiId.objectDatatable).editCancel();
				// }

				// return passValidate;
			},
			onAfterEditStop: function (state, editor, ignoreUpdate) {
				_logic.onAfterEditStop(state, editor, ignoreUpdate);
			},
			onAfterLoad: function () {
				_logic.onAfterLoad();
			},
			onColumnResize: function (id, newWidth, oldWidth, user_action) {
console.error('!! ToDo: onColumnResize()');
				// var columnConfig = $$(self.webixUiId.objectDatatable).getColumnConfig(id);
				// var column = self.data.columns.filter(function (col) { return col.id == columnConfig.dataId; });
				// if (column && column[0])
				// 	column[0].setWidth(newWidth);

				// // if (typeof columnConfig.template !== 'undefined' && columnConfig.template !== null) {
				// // 	// For calculate/refresh row height
				// // 	$$(self.webixUiId.objectDatatable).render();
				// // }
			},
			onBeforeColumnDrag: function (sourceId, event) {
console.error('!! ToDo: onBeforeColumnDrag()');
				// if (sourceId === 'appbuilder_trash') // Remove column
				// 	return false;
				// else
				// 	return true;
			},
			onBeforeColumnDrop: function (sourceId, targetId, event) {
console.error('!! ToDo: onBeforeColumnDrag()');
				// if (targetId === 'appbuilder_trash') // Remove column
				// 	return false;

				// if ($$(self.webixUiId.visibleButton).config.badge > 0) {
				// 	webix.alert({
				// 		title: self.labels.object.couldNotReorderField,
				// 		ok: self.labels.common.ok,
				// 		text: self.labels.object.couldNotReorderFieldDetail
				// 	});

				// 	return false;
				// }
			},
			onAfterColumnDrop: function (sourceId, targetId, event) {
console.error('!! ToDo: onAfterColumnDrop()');
				// self.reorderColumns();
			},
			onAfterColumnShow: function (id) {
console.error('!! ToDo: onAfterColumnShow()');
				// $$(self.webixUiId.visibleFieldsPopup).showField(id);
			},
			onAfterColumnHide: function (id) {
console.error('!! ToDo: onAfterColumnHide()');
				// $$(self.webixUiId.visibleFieldsPopup).hideField(id);
			},

			onHeaderClick: function (id, e, node) {
				_logic.onHeaderClick(id, e, node);
			}
		}
	}





	// Our init() function for setting up our UI
	var _init = function(options) {

		// register our callbacks:
		for(var c in _logic.callbacks) {
			_logic.callbacks[c] = options[c] || _logic.callbacks[c];
		}

		// webix.extend($$(ids.form), webix.ProgressBar);

		// NOTE: register the onAfterRender() here, so it only registers
		// one.
		var DataTable = $$(ids.component);
		var throttleOnAfterRender = null;
		DataTable.attachEvent("onAfterRender", function(data){

			if (throttleOnAfterRender) clearTimeout(throttleOnAfterRender);
			throttleOnAfterRender = setTimeout(()=>{
				if (CurrentObject) {
					CurrentObject.customDisplays(data, App, DataTable);
				}
			}, 150);

		});


		// Process our onItemClick events. 
		// this is a good place to check if our delete/trash icon was clicked.
		DataTable.attachEvent("onItemClick", function (id, e, node) {

			// make sure we have an object selected before processing this.
			if (!CurrentObject) { return; }


			// if this was our trash icon:
			if (e.target.className.indexOf('trash') > -1) {

				OP.Dialog.Confirm({
					title: labels.component.confirmDeleteRowTitle,
					text:  labels.component.confirmDeleteRowMessage,
					callback: function (result) {
						if (result) {

							CurrentObject.model()
							.delete(id)
							.then((response)=>{

								if (response.numRows > 0) {
									DataTable.remove(id);
									DataTable.clearSelection();
								} else {

									OP.Dialog.Alert({
										text:'No rows were effected.  This does not seem right.'
									})
//// TODO: what do we do here?
								}
							})
							.catch((err)=>{

								OP.Error.log('Error deleting item:', {error:err});

//// TODO: what do we do here?	
							})
						}

						DataTable.clearSelection();
						return true;
					}
				});
			}	
			
		});



	}


	var CurrentObject = null;		// current ABObject being displayed
	var EditField	= null;			// which field (column header) is popup editor for
	var EditNode	= null;			// which html node (column header) is popup editor for

	// our internal business logic
	var _logic = {


		callbacks:{

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
			onEditorMenu: function(action, field) {  }
		},


		/**
		 * @function callbackHeaderEdit
		 *
		 * call back for when an item in the Header Edit Menu has been selected.
		 * @param {string} action the action requested for this field:
		 */
		callbackHeaderEdit: function(action) {

			PopupHeaderEdit.hide();
			_logic.callbacks.onEditorMenu(action, EditField, EditNode);
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
		 * @function getColumnConfig
		 *
		 * return the column config of a datagrid
		 * @param {string} id datagrid id you want the column info from
		 */
		getFieldList: function() {
			var DataTable = $$(ids.component);

			return DataTable.fieldList;
		},



		/**
		 * @function onAfterEditStop
		 * When an editor is finished.
		 * @param {json} state
		 * @param {} editor
		 * @param {} ignoreUpdate
		 * @return
		 */
		onAfterEditStop: function (state, editor, ignoreUpdate) {

			// state:   {value: "new value", old: "old value"}
			// editor:  { column:"columnName", row:ID, value:'value', getInputNode:fn(), config:{}, focus: fn(), getValue: fn(), setValue: function, getInputNode: function, render: function…}

			var DataTable = $$(ids.component);

			if (state.value != state.old) {



				var item = DataTable.getItem(editor.row);
				item[editor.column] = state.value;

				DataTable.removeCellCss(item.id, editor.column, "webix_invalid");
				DataTable.removeCellCss(item.id, editor.column, "webix_invalid_cell");

				var validator = CurrentObject.isValidData(item);
				if (validator.pass()) {


//// Question: do we submit full item updates?  or just patches?
var patch = {};
patch[editor.column] = item[editor.column];  // NOTE: isValidData() might also condition the data for sending.state.value;

					CurrentObject.model()
					.update(item.id, item)
// .update(item.id, patch)
					.then(()=>{

						DataTable.updateItem(editor.row, item);
						DataTable.clearSelection();
						DataTable.refresh(editor.row);

					})
					.catch((err)=>{

						OP.Error.log('Error saving item:', {error:err});

						DataTable.clearSelection();
						if (OP.Validation.isGridValidationError(err, editor.row, DataTable)) {

// Do we reset the value?
// item[editor.column] = state.old;
// DataTable.updateItem(editor.row, item);

						} else {

// this was some other Error!

						}


					})

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
			_logic.sortTable();
		},



		/**
		 * @function onAfterSelect
		 * This is when a user clicks on a cell.  We use the onAfterSelect to
		 * trigger a normal .editCell() if there isn't a custom editor for this field.
		 * @param {json} data webix cell data
		 * @return
		 */
		onAfterSelect: function (data, prevent) {
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
		 * @function onHeaderClick
		 *
		 * process the user clicking on the header for one of our columns.
		 */
		onHeaderClick: function (id, e, node) {

			// Ignore system columns
			if (id.column == 'appbuilder_trash')
				return false;

			// save our EditNode & EditField:
			EditNode = node;

			EditField = CurrentObject.fields(function(f){ return f.id == id.column; })[0];
			if (EditField) {

				// show the popup
				PopupHeaderEdit.show(node);
			}

			return false;
		},


		objectLoad:function(object) {

			CurrentObject = object;

			PopupHeaderEditComponent.objectLoad(object);

			_logic.refresh();
		},



		// rebuild the data table view:
		refresh: function() {

			// wait until we have an Object defined:
			if (CurrentObject) {

				var DataTable = $$(ids.component);
				DataTable.clearAll();


				//// update DataTable structure:
				// get column list from our CurrentObject
				var columnHeaders = CurrentObject.columnHeaders(true);

				// add the delete / Trash column
				columnHeaders.push({
					id: "appbuilder_trash",
					header: "",
					width: 40,
					template: "<span class='trash'>{common.trashIcon()}</span>",
					css: { 'text-align': 'center' }
				})
				DataTable.refreshColumns(columnHeaders)


				// freeze columns:
				if (CurrentObject.workspaceFrozenColumnID != "") {
					DataTable.define('leftSplit', DataTable.getColumnIndex(CurrentObject.workspaceFrozenColumnID) + 1);
					DataTable.refreshColumns()
				}


				// render custom displays:
// 				var throttleOnAfterRender = null;
// 				DataTable.attachEvent("onAfterRender", function(data){
// webix.message('onAfterRender check')
// 					if (throttleOnAfterRender) clearTimeout(throttleOnAfterRender);
// 					throttleOnAfterRender = setTimeout(()=>{
// webix.message("onAfterRender()");
// 						CurrentObject.onAfterRender(data, App);
// 					}, 150);
// 				});

				//// update DataTable Content

				// Set the Model object with a condition / skip / limit, then
				// use it to load the DataTable:
				//// NOTE: this should take advantage of Webix dynamic data loading on
				//// larger data sets.
				CurrentObject.model()
				.where({})
				.skip(0)
				.limit(30)
				.loadInto(DataTable);
			}
		},


		/**
		 * @function rowAdd()
		 *
		 * add a new row to the data table
		 */
		rowAdd:function() {
			var emptyObj = CurrentObject.defaultValues();
			CurrentObject.model()
			.create(emptyObj)
			.then((obj)=>{
				var DataTable = $$(ids.component);
				DataTable.add(obj, 0);
			})
		},


		/**
		 * @function show()
		 *
		 * Show this component.
		 */
		show:function() {

			$$(ids.component).show();
		},

		/**
		 * @function sort(dir, a, b)
		 *
		 * Sort this component.
		 */
		sort:function(dir, aValue, bValue) {
			var result = false;

			if (dir == 'asc') {
				result = aValue > bValue ? 1 : -1;
			}
			else {
				result = aValue < bValue ? 1 : -1;
			}
			return result;
		},

		sortNext:function(dir, a, b, sorts, index) {
			var index = index+1,
				a = a,
				b = b,
				aValue = a[sorts[index].by],
				bValue = b[sorts[index].by],
				result = false;

			if (aValue == bValue && sorts.length > index+1) {
				result = _logic.sortNext(sorts[index].dir, a, b, sorts, index)
			} else {
				result = _logic.sort(sorts[index].dir, aValue, bValue);
			}
			return result;
		},

		sortTable:function() {
			var DataTable = $$(ids.component);

			if (CurrentObject) {
				var sorts = CurrentObject.workspaceSortFields;

				if (sorts.length > 0) {
					var columnOrders = [];

					DataTable.sort(function (a, b) {
						var result = false,
							index = 0,
							aValue = a[sorts[index].by],
							bValue = b[sorts[index].by];

						if (aValue == bValue && sorts.length > index+1) {
							result = _logic.sortNext(sorts[index].dir, a, b, sorts, index);
						} else {
							result = _logic.sort(sorts[index].dir, aValue, bValue);
						}

						return result;
					});

				}
			}
		}


	}



	//// NOTE: declare these after _logic  for the callbacks:

	var PopupHeaderEditComponent = OP.Component['ab_work_object_workspace_popupHeaderEditMenu'](App);
	var PopupHeaderEdit = webix.ui(PopupHeaderEditComponent.ui);
	PopupHeaderEditComponent.init({
		onClick:_logic.callbackHeaderEdit		// be notified when there is a change in the hidden fields
	})



	// Expose any globally accessible Actions:
	var _actions = {


	}


	// return the current instance of this component:
	return {
		ui:_ui,					// {obj} 	the webix ui definition for this component
		init:_init,				// {fn} 	init() to setup this component
		actions:_actions,		// {ob}		hash of fn() to expose so other components can access.

		// interface methods for parent component:
		objectLoad: _logic.objectLoad,
		refresh: _logic.refresh,
		addRow: _logic.rowAdd,

		// expose data for badge on frozen button
		getColumnIndex: _logic.getColumnIndex,

		// expose data for column sort UI
		getFieldList: _logic.getFieldList,
		sortTable: _logic.sortTable,

		_logic: _logic			// {obj} 	Unit Testing
	}

})
