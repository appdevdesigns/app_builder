
/*
 * ab_work_object_workspace
 *
 * Manage the Object Workspace area.
 *
 */

import ABApplication from "../classes/ABApplication"
import "./ab_work_object_workspace_datatable"
import "./ab_work_object_workspace_popupDefineLabel"
import "./ab_work_object_workspace_popupHideFields"
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


var idBase = 'ab_work_object_workspace';
OP.Component.extend(idBase, function(App) {

	labels.common = App.labels;


	// internal list of Webix IDs to reference our UI components.
	var ids = {
		component: App.unique(idBase + '_component'),

		buttonAddField: App.unique(idBase + '_buttonAddField'),
		buttonExport: App.unique(idBase + '_buttonExport'),
		buttonFieldsVisible: App.unique(idBase + '_buttonFieldsVisible'),
		buttonFilter: App.unique(idBase + '_buttonFilter'),
		buttonFrozen: App.unique(idBase + '_buttonFrozen'),
		buttonLabel: App.unique(idBase + '_buttonLabel'),
		buttonRowNew: App.unique(idBase + '_buttonRowNew'),
		buttonSort: App.unique(idBase + '_buttonSort'),


		datatable: App.unique(idBase + '_datatable'),


		// Toolbar:
		toolbar: App.unique(idBase + '_toolbar'),



		noSelection: App.unique(idBase + '_noSelection'),
		selectedObject: App.unique(idBase + '_selectedObject'),
		
	}



	// The DataTable that displays our object:
	var DataTable = OP.Component['ab_work_object_workspace_datatable'](App);




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
// popup: 'self.webixUiId.visibleFieldsPopup', 
								icon: "columns", 
								type: "icon", 
								width: 120, 
								badge: 0,
								click: function () {
									_logic.toolbarFieldsVisible(this.$view);
								}
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
								icon: "table", 
								type: "icon", 
								width: 150, 
								badge: 0,
								click: function(){
									_logic.toolbarFrozen(this.$view);
								}
							},
							{ 
								view: 'button', 
								id: ids.buttonLabel,
								label: labels.component.defineLabel, 
								icon: "newspaper-o", 
								type: "icon", 
								width: 130,
								click: function () {
									_logic.toolbarDefineLabel(this.$view);
								}
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
					DataTable.ui,
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

		DataTable.init();

		$$(ids.noSelection).show();
	}


	var CurrentObject = null;

	// our internal business logic 
	var _logic = {


		/**
		 * @function callbackDefineLabel
		 *
		 * call back for when the Define Label popup is finished.
		 */
		callbackAddFields:function(field) {
			DataTable.refresh();
		},


		/**
		 * @function callbackDefineLabel
		 *
		 * call back for when the Define Label popup is finished.
		 */
		callbackDefineLabel: function() {

		},


		/**
		 * @function callbackFieldsVisible
		 *
		 * call back for when the hidden fields have changed.
		 */
		callbackFieldsVisible: function() {

			var hiddenFields = CurrentObject.workspaceHiddenFields;
			$$(ids.buttonFieldsVisible).define('badge', hiddenFields.length);
			$$(ids.buttonFieldsVisible).refresh();

			DataTable.refresh();
		},


		/**
		 * @function clearObjectWorkspace()
		 *
		 * Clear the object workspace. 
		 */
		clearObjectWorkspace:function(){
			
			$$(ids.noSelection).show();
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
		 * @function toolbarAddFields
		 *
		 * Show the popup to allow the user to create new fields for 
		 * this object.
		 */
		toolbarAddFields: function($view) {
			PopupNewDataField.show($view);
		},


		/**
		 * @function toolbarDefineLabel
		 *
		 * Show the popup to allow the user to define the default label for 
		 * this object.
		 */
		toolbarDefineLabel: function($view) {
			PopupDefineLabel.show($view);
		},


		/**
		 * @function toolbarFieldsVisible
		 *
		 * Show the popup to allow the user to hide columns for this view.
		 */
		toolbarFieldsVisible: function($view) {
			PopupHideField.show($view);
		},


		/**
		 * @function toolbarFilter
		 *
		 * show the popup to add a filter to the datatable
		 */
		toolbarFilter: function($view) {
// self.refreshPopupData();
// $$(self.webixUiId.filterFieldsPopup).show($view);
console.error('TODO: button filterFields()');
		},


		/**
		 * @function toolbarFrozen
		 *
		 * show the popup to freeze columns for the datatable
		 */
		toolbarFrozen: function ($view) {
console.error('TODO: toolbarFrozen()');
		},


		/**
		 * @function toolbarSort
		 *
		 * show the popup to sort the datatable
		 */
		toolbarSort:function($view) {
// self.refreshPopupData();
// $$(self.webixUiId.sortFieldsPopup).show($view);
console.error('TODO: toolbarSort()');
		}
	}



	// NOTE: declare these after _logic  for the callbacks:
	var PopupDefineLabelComponent = OP.Component['ab_work_object_workspace_popupDefineLabel'](App);
	var PopupDefineLabel = webix.ui(PopupDefineLabelComponent.ui);
	PopupDefineLabelComponent.init({
		onChange:_logic.callbackDefineLabel		// be notified when there is a change in the label
	})


	var PopupNewDataFieldComponent = OP.Component['ab_work_object_workspace_popupNewDataField'](App);
	var PopupNewDataField = webix.ui(PopupNewDataFieldComponent.ui);
	PopupNewDataFieldComponent.init({
		onSave:_logic.callbackAddFields			// be notified when a new Field is created & saved
	});


	var PopupHideFieldComponent = OP.Component['ab_work_object_workspace_popupHideFields'](App);
	var PopupHideField = webix.ui(PopupHideFieldComponent.ui);
	PopupHideFieldComponent.init({
		onChange:_logic.callbackFieldsVisible		// be notified when there is a change in the hidden fields
	})


	// Expose any globally accessible Actions:
	var _actions = {


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

			CurrentObject = object;

			App.actions.populateObjectPopupAddDataField(object);

			// update hiddenFields 
			_logic.callbackFieldsVisible();

			PopupDefineLabelComponent.objectLoad(object);
			PopupHideFieldComponent.objectLoad(object);
			DataTable.objectLoad(object);
		}

	}


	// return the current instance of this component:
	return {
		ui:_ui,					// {obj} 	the webix ui definition for this component
		init:_init,				// {fn} 	init() to setup this component  
		actions:_actions,		// {ob}		hash of fn() to expose so other components can access.

		// interface methods for parent component:
		clearObjectWorkspace:_logic.clearObjectWorkspace,

		_logic: _logic			// {obj} 	Unit Testing
	}

})