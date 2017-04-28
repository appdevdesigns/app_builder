
/*
 * ab_work_object_workspace
 *
 * Manage the Object Workspace area.
 *
 */

import ABApplication from "../classes/ABApplication"
import "./ab_work_object_workspace_popupNewDataField"



function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var labels = {

	component: {

		addNewRow: L('ab.object.addNewRow', "*Add new row"),

		// formHeader: L('ab.application.form.header', "*Application Info"),

		// Toolbar:
		hideFields: L('ab.object.toolbar.hideFields', "*Hide fields"),
		filterFields: L('ab.object.toolbar.filterFields', "*Add filters"),
		sortFields: L('ab.object.toolbar.sortFields', "*Apply sort"),
		frozenColumns: L('ab.object.toolbar.frozenColumns', "*Frozen columns"),
		defineLabel: L('ab.object.toolbar.defineLabel', "*Define label"),
		permission: L('ab.object.toolbar.permission', "*Permission"),
		addFields: L('ab.object.toolbar.addFields', "*Add new column"),
		"export": L('ab.object.toolbar.export', "*Export")
	}
}



OP.Component.extend('ab_work_object_workspace', function(App) {

	labels.common = App.labels;



	



	// internal list of Webix IDs to reference our UI components.
	var ids = {
		component: App.unique('ab_work_object_workspace_component'),

		buttonAddField: App.unique('ab_work_object_workspace_buttonAddField'),
		buttonExport: App.unique('ab_work_object_workspace_buttonExport'),
		buttonFieldsVisible: App.unique('ab_work_object_workspace_buttonFieldsVisible'),
		buttonFilter: App.unique('ab_work_object_workspace_buttonFilter'),
		buttonFrozen: App.unique('ab_work_object_workspace_buttonFrozen'),
		buttonLabel: App.unique('ab_work_object_workspace_buttonLabel'),
		buttonRowNew: App.unique('ab_work_object_workspace_buttonRowNew'),
		buttonSort: App.unique('ab_work_object_workspace_buttonSort'),


		datatable: App.unique('ab_work_object_workspace_datatable'),


		// Toolbar:
		toolbar: App.unique('ab_work_object_workspace_toolbar'),



		noSelection: App.unique('ab_work_object_workspace_noSelection'),
		selectedObject: App.unique('ab_work_object_workspace_selectedObject'),
		
	}








	// Our webix UI definition:
	var _ui = {
		view:'multiview',
		id: ids.component,
		rows:[
			{
				// view:''
				id: ids.noSelection,
				rows:[
					{ view:'label', label:'* Select an Object to work with' }
				]
			},


			{
				id: ids.selectedObject,
				rows: [
					{
						view: 'toolbar',
						id: ids.toolbar,
						hidden: true,
						cols: [
							{ 
								view: "button",
								id: ids.buttonFieldsVisible, 
								label: labels.component.hideFields, 
popup: 'self.webixUiId.visibleFieldsPopup', 
								icon: "columns", 
								type: "icon", 
								width: 120, 
								badge: 0 
							},
							{
								view: 'button',
								id: ids.buttonFilter, 
								label: labels.component.filterFields, 
								icon: "filter", 
								type: "icon", 
								width: 120, 
								badge: 0,
								click: function () {
									_logic.toolbarFilter(this);
								}
							},
							{
								view: 'button', 
								id: ids.buttonSort, 
								label: labels.component.sortFields, 
								icon: "sort", 
								type: "icon", 
								width: 120, 
								badge: 0,
								click: function () {
									_logic.toolbarSort(this.$view);
								}
							},
							{ 
								view: 'button', 
								id: ids.buttonFrozen, 
								label: labels.component.frozenColumns, 
popup: 'self.webixUiId.frozenColumnsPopup', 
								icon: "table", 
								type: "icon", 
								width: 150, 
								badge: 0 
							},
							{ 
								view: 'button', 
								id: ids.buttonLabel,
								label: labels.component.defineLabel, 
popup: 'self.webixUiId.defineLabelPopup', 
								icon: "newspaper-o", 
								type: "icon", 
								width: 130 
							},
							{ 
								view: 'button', 
								label: labels.component.permission, 
								icon: "lock", 
								type: "icon", 
								width: 120 
							},
							{ 
								view: 'button', 
								id: ids.buttonAddField, 
								label: labels.component.addFields, 
								icon: "plus", 
								type: "icon", 
								width: 150,
								click:function() {
									_logic.toolbarAddFields(this.$view);
								}
							},
							{ 
								view: 'button', 
								id: ids.buttonExport, 
								label: labels.component.export, 
popup: 'self.webixUiId.exportDataPopup', 
								icon: "file-o", 
								type: "icon", 
								width: 90 
							}
						]
					},
											// {
											// 	view: "datatable",
											// 	id: ids.datatable,
											// 	resizeColumn: true,
											// 	resizeRow: true,
											// 	prerender: false,
											// 	editable: true,
											// 	fixedRowHeight: false,
											// 	editaction: "custom",
											// 	select: "cell",
											// 	dragColumn: true,
											// 	on: {
											// 		onBeforeSelect: function (data, preserve) {

											// 			var itemNode = this.getItemNode({ row: data.row, column: data.column });

											// 			var column = AD.classes.AppBuilder.currApp.currObj.columns.filter(function (col) { return col.name == data.column; });
											// 			if (!column || column.length < 1) {
											// 				console.log('System could not found this column data');
											// 				return false;
											// 			} else
											// 				column = column[0];

											// 			return dataFieldsManager.customEdit(AD.classes.AppBuilder.currApp, AD.classes.AppBuilder.currApp.currObj, column, data.row, itemNode);
											// 		},
											// 		onAfterSelect: function (data, prevent) {
											// 			var columnConfig = $$(self.webixUiId.objectDatatable).getColumnConfig(data.column),
											// 				fieldData = AD.classes.AppBuilder.currApp.currObj.columns.filter(function (col) { return col.name == data.column; });

											// 			if (!fieldData || fieldData.length < 1) {
											// 				console.log('System could not found this column data');
											// 				return false;
											// 			} else
											// 				fieldData = fieldData[0];

											// 			// Custom update data
											// 			if (dataFieldsManager.hasCustomEdit(columnConfig.fieldName, fieldData))
											// 				return false;

											// 			// Normal update data
											// 			this.editCell(data.row, data.column);
											// 		},
											// 		onCheck: function (row, col, val) { // Update checkbox data
											// 			var item = $$(self.webixUiId.objectDatatable).getItem(row);

											// 			self.updateRowData({ value: (val > 0 ? true : false) }, { row: row, column: col }, false)
											// 				.fail(function (err) {
											// 					// Rollback
											// 					item[col] = !val;
											// 					$$(self.webixUiId.objectDatatable).updateItem(row, item);
											// 					$$(self.webixUiId.objectDatatable).refresh(row);

											// 					$$(self.webixUiId.objectDatatable).hideProgress();
											// 				})
											// 				.then(function (result) {
											// 					$$(self.webixUiId.objectDatatable).hideProgress();
											// 				});
											// 		},
											// 		onBeforeEditStop: function (state, editor) {
											// 			var column = AD.classes.AppBuilder.currApp.currObj.columns.filter(function (col) { return col.name == editor.column; });

											// 			if (!column || column.length < 1) return true;
											// 			column = column[0];

											// 			var passValidate = dataFieldsManager.validate(column, state.value);

											// 			if (!passValidate) {
											// 				$$(self.webixUiId.objectDatatable).editCancel();
											// 			}

											// 			return passValidate;
											// 		},
											// 		onAfterEditStop: function (state, editor, ignoreUpdate) {

											// 			var item = $$(self.webixUiId.objectDatatable).getItem(editor.row);

											// 			self.updateRowData(state, editor, ignoreUpdate)
											// 				.fail(function (err) { // Cached
											// 					item[editor.column] = state.old;
											// 					$$(self.webixUiId.objectDatatable).updateItem(editor.row, item);
											// 					$$(self.webixUiId.objectDatatable).refresh(editor.row);

											// 					// TODO : Message

											// 					$$(self.webixUiId.objectDatatable).hideProgress();
											// 				})
											// 				.then(function (result) {
											// 					if (item) {
											// 						item[editor.column] = state.value;

											// 						if (result && result.constructor.name === 'Cached' && result.isUnsync())
											// 							item.isUnsync = true;

											// 						$$(self.webixUiId.objectDatatable).updateItem(editor.row, item);
											// 					}

											// 					// TODO : Message

											// 					$$(self.webixUiId.objectDatatable).hideProgress();
											// 				});
											// 		},
											// 		onColumnResize: function (id, newWidth, oldWidth, user_action) {
											// 			var columnConfig = $$(self.webixUiId.objectDatatable).getColumnConfig(id);
											// 			var column = self.data.columns.filter(function (col) { return col.id == columnConfig.dataId; });
											// 			if (column && column[0])
											// 				column[0].setWidth(newWidth);

											// 			// if (typeof columnConfig.template !== 'undefined' && columnConfig.template !== null) {
											// 			// 	// For calculate/refresh row height
											// 			// 	$$(self.webixUiId.objectDatatable).render();
											// 			// }
											// 		},
											// 		onBeforeColumnDrag: function (sourceId, event) {
											// 			if (sourceId === 'appbuilder_trash') // Remove column
											// 				return false;
											// 			else
											// 				return true;
											// 		},
											// 		onBeforeColumnDrop: function (sourceId, targetId, event) {
											// 			if (targetId === 'appbuilder_trash') // Remove column
											// 				return false;

											// 			if ($$(self.webixUiId.visibleButton).config.badge > 0) {
											// 				webix.alert({
											// 					title: self.labels.object.couldNotReorderField,
											// 					ok: self.labels.common.ok,
											// 					text: self.labels.object.couldNotReorderFieldDetail
											// 				});

											// 				return false;
											// 			}
											// 		},
											// 		onAfterColumnDrop: function (sourceId, targetId, event) {
											// 			self.reorderColumns();
											// 		},
											// 		onAfterColumnShow: function (id) {
											// 			$$(self.webixUiId.visibleFieldsPopup).showField(id);
											// 		},
											// 		onAfterColumnHide: function (id) {
											// 			$$(self.webixUiId.visibleFieldsPopup).hideField(id);
											// 		}
											// 	}
											// },
					{
						cols: [
							{
								autowidth: true
							},
							{
								view: "button",
								id: ids.buttonRowNew,
								value: labels.component.addNewRow,
								width: 150,
								align: 'right',
								click: function () {
		// TODO:
									_logic.rowAdd();
									// self.addNewRow({});
								}
							}
						]
					}
				]

			}
		]
	}
		



	// Our init() function for setting up our UI
	var _init = function() {
		// webix.extend($$(ids.form), webix.ProgressBar);



		$$(ids.noSelection).show();
	}



	// our internal business logic 
	var _logic = {

		



		// /**
		//  * @function formReady()
		//  *
		//  * remove the busy indicator from the form.
		//  */
		// formReady: function() {
		// 	$$(ids.form).hideProgress();
		// },


		/**
		 * @function show()
		 *
		 * Show this component.
		 */
		show:function() {

			$$(ids.component).show();
		},


		fieldCreated:function(field) {
console.error('TODO: !! ReREnder the dataTable with current Object!');
		},

		toolbarAddFields: function($view) {
			PopupNewDataField.show($view);
		},

		/**
		 * @function toolbarFilter
		 *
		 * Show the progress indicator to indicate a Form operation is in 
		 * progress.
		 */
		toolbarFilter: function($view) {
// self.refreshPopupData();
// $$(self.webixUiId.filterFieldsPopup).show($view);
console.error('TODO: button filterFields()');
		},


		toolbarSort:function($view) {
// self.refreshPopupData();
// $$(self.webixUiId.sortFieldsPopup).show($view);
console.error('TODO: toolbarSort()');
		}
	}



	// NOTE: declare this after _logic  for the callbacks:
	var PopupNewDataFieldComponent = OP.Component['ab_work_object_workspace_popupNewDataField'](App);
	var PopupNewDataField = webix.ui(PopupNewDataFieldComponent.ui);
	PopupNewDataFieldComponent.init({
		onSave:_logic.fieldCreated			// be notified when a new Field is created
	});



	// Expose any globally accessible Actions:
	var _actions = {


		/**
		 * @function populateApplicationForm()
		 *
		 * Initialze the Form with the values from the provided ABApplication.
		 *
		 * If no ABApplication is provided, then show an empty form. (create operation)
		 *
		 * @param {ABApplication} Application  	[optional] The current ABApplication 
		 *										we are working with.
		 */
		clearObjectWorkspace:function(){
			
			$$(ids.noSelection).show();
console.error('TODO: clearObjectWorkspace()');
		},


		/**
		 * @function populateObjectWorkspace()
		 *
		 * Initialize the Object Workspace with the provided ABObject.
		 *
		 * @param {ABObject} object  	current ABObject instance we are working with.
		 */
		populateObjectWorkspace: function(object) {

			$$(ids.toolbar).show();
			$$(ids.selectedObject).show();

			App.actions.populateObjectPopupAddDataField(object);
		}

	}


	// return the current instance of this component:
	return {
		ui:_ui,					// {obj} 	the webix ui definition for this component
		init:_init,				// {fn} 	init() to setup this component  
		actions:_actions,		// {ob}		hash of fn() to expose so other components can access.

		_logic: _logic			// {obj} 	Unit Testing
	}

})