
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
console.error('!! todo: onAfterSelect()');
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
console.error('!! ToDo: onCheck()');
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
console.error('!! ToDo: onAfterEditStop()');
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


				// update DataTable structure:
				var columnHeaders = CurrentObject.columnHeaders(true);
				DataTable.refreshColumns(columnHeaders)


				// update DataTable Content
			}
		},


		/**
		 * @function show()
		 *
		 * Show this component.
		 */
		show:function() {

			$$(ids.component).show();
		},


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


		_logic: _logic			// {obj} 	Unit Testing
	}

})
