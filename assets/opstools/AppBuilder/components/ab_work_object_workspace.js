
/*
 * ab_work_object_workspace
 *
 * Manage the Object Workspace area.
 *
 */

import ABApplication from "../classes/ABApplication"
import "./ab_work_object_workspace_datatable"
import "./ab_work_object_workspace_popupDefineLabel"
import "./ab_work_object_workspace_popupFrozenColumns"
import "./ab_work_object_workspace_popupHideFields"
import "./ab_work_object_workspace_popupNewDataField"
import "./ab_work_object_workspace_popupSortFields"



function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var labels = {

	component: {

		addNewRow: L('ab.object.addNewRow', "*Add new row"),

		selectObject: L('ab.object.selectObject', "*Select an object to work with."),

		// formHeader: L('ab.application.form.header', "*Application Info"),

		// Toolbar:
		hideFields: L('ab.object.toolbar.hideFields', "*Hide fields"),
		filterFields: L('ab.object.toolbar.filterFields', "*Add filters"),
		sortFields: L('ab.object.toolbar.sortFields', "*Apply sort"),
		frozenColumns: L('ab.object.toolbar.frozenColumns', "*Frozen columns"),
		defineLabel: L('ab.object.toolbar.defineLabel', "*Define label"),
		permission: L('ab.object.toolbar.permission', "*Permission"),
		addFields: L('ab.object.toolbar.addFields', "*Add new column"),
		"export": L('ab.object.toolbar.export', "*Export"),

		confirmDeleteTitle : L('ab.object.delete.title', "*Delete data field"),
		confirmDeleteMessage : L('ab.object.delete.message', "*Do you want to delete <b>{0}</b>?")
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


	// Various Popups on our page:
	var PopupDefineLabelComponent = OP.Component['ab_work_object_workspace_popupDefineLabel'](App);
	var PopupDefineLabel = webix.ui(PopupDefineLabelComponent.ui);

	var PopupFrozenColumnsComponent = OP.Component['ab_work_object_workspace_popupFrozenColumns'](App);
	var PopupFrozenColumns = webix.ui(PopupFrozenColumnsComponent.ui);

	var PopupHideFieldComponent = OP.Component['ab_work_object_workspace_popupHideFields'](App);
	var PopupHideField = webix.ui(PopupHideFieldComponent.ui);

	var PopupNewDataFieldComponent = OP.Component['ab_work_object_workspace_popupNewDataField'](App);
	// var PopupNewDataField = webix.ui(PopupNewDataFieldComponent.ui);
	webix.ui(PopupNewDataFieldComponent.ui);

	var PopupSortFieldComponent = OP.Component['ab_work_object_workspace_popupSortFields'](App);
	var PopupSortField = webix.ui(PopupSortFieldComponent.ui);

	// Our webix UI definition:
	var _ui = {
		view:'multiview',
		id: ids.component,
		rows:[
			{
				id: ids.noSelection,
				rows:[
					{
						maxHeight: App.config.xxxLargeSpacer,
						hidden: App.config.hideMobile
					},
					{
						view:'label',
						align: "center",
						label:labels.component.selectObject
					},
					{
						maxHeight: App.config.xxxLargeSpacer,
						hidden: App.config.hideMobile
					}
				]
			},
			{
				id: ids.selectedObject,
				rows: [
					{
						view: 'toolbar',
						id: ids.toolbar,
						hidden: true,
						css: "ab-data-toolbar",
						cols: [
							{
								view: "button",
								id: ids.buttonFieldsVisible,
								label: labels.component.hideFields,
// popup: 'self.webixUiId.visibleFieldsPopup',
								icon: "eye-slash",
								type: "icon",
								// width: 120,
								autowidth: true,
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
								// width: 120,
								autowidth: true,
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
								// width: 120,
								autowidth: true,
								badge: 0,
								click: function () {
									_logic.toolbarSort(this.$view);
								}
							},
							{
								view: 'button',
								id: ids.buttonFrozen,
								label: labels.component.frozenColumns,
								icon: "thumb-tack",
								type: "icon",
								autowidth: true,
								badge: 0,
								click: function(){
									_logic.toolbarFrozen(this.$view);
								}
							},
							{
								view: 'button',
								id: ids.buttonLabel,
								label: labels.component.defineLabel,
								icon: "crosshairs",
								type: "icon",
								// width: 130,
								autowidth: true,
								click: function () {
									_logic.toolbarDefineLabel(this.$view);
								}
							},
							{
								view: 'button',
								label: labels.component.permission,
								icon: "lock",
								type: "icon",
								autowidth: true,
								click: function() {
									_logic.toolbarPermission(this.$view);
								}

							},
							{
								view: 'button',
								id: ids.buttonAddField,
								label: labels.component.addFields,
								icon: "plus",
								type: "icon",
								// width: 150,
								autowidth: true,
								click:function() {
									_logic.toolbarAddFields(this.$view);
								}
							},
							{
								view: 'button',
								id: ids.buttonExport,
								label: labels.component.export,
								icon: "download",
								type: "icon",
								autowidth: true,
								click: function() {
									_logic.toolbarButtonExport(this.$view);
								}
							}
						]
					},
					DataTable.ui,
					{
						cols: [
							{
								view: "button",
								id: ids.buttonRowNew,
								value: labels.component.addNewRow,
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

		DataTable.init({
			onEditorMenu:_logic.callbackHeaderEditorMenu
		});

		PopupDefineLabelComponent.init({
			onChange:_logic.callbackDefineLabel		// be notified when there is a change in the label
		});

		PopupFrozenColumnsComponent.init({
			onChange:_logic.callbackFrozenColumns		// be notified when there is a change in the frozen columns
		});

		PopupHideFieldComponent.init({
			onChange:_logic.callbackFieldsVisible		// be notified when there is a change in the hidden fields
		});

		PopupNewDataFieldComponent.init({
			onSave:_logic.callbackAddFields			// be notified when a new Field is created & saved
		});

		var fieldList = DataTable.getFieldList();

		PopupSortFieldComponent.init({
			onChange:_logic.callbackSortFields		// be notified when there is a change in the sort fields
		});


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
		 * @function callbackFrozenColumns
		 *
		 * call back for when the hidden fields have changed.
		 */
		callbackFrozenColumns: function() {

			var frozenID = CurrentObject.workspaceFrozenColumnID;

			if (typeof(frozenID) != "undefined") {
				var badgeNumber = DataTable.getColumnIndex(frozenID) + 1;

				$$(ids.buttonFrozen).define('badge', badgeNumber);
				$$(ids.buttonFrozen).refresh();
			}

			DataTable.refresh();
		},

		/**
		 * @function callbackFieldsVisible
		 *
		 * call back for when the hidden fields have changed.
		 */
		callbackFieldsVisible: function() {

			var hiddenFields = CurrentObject.workspaceHiddenFields;

			if (typeof(hiddenFields) != "undefined") {
				$$(ids.buttonFieldsVisible).define('badge', hiddenFields.length);
				$$(ids.buttonFieldsVisible).refresh();

			}
			DataTable.refresh();

			// if you unhide a field it may fall inside the frozen columns range so lets check
			_logic.callbackFrozenColumns();
		},


		/**
		 * @function callbackHeaderEditorMenu
		 *
		 * call back for when an editor menu action has been selected.
		 * @param {string} action [ 'hide', 'filter', 'sort', 'edit', 'delete' ]
		 */
		callbackHeaderEditorMenu: function(action, field, node) {

			switch(action) {

				case 'hide':
				case 'filter':
				case 'sort':
console.error('!! TODO: callbackHeaderEditorMenu():  unimplemented action:'+action);
					break;

				case 'edit':
					// pass control on to our Popup:
					PopupNewDataFieldComponent.show(node, field);
					break;

				case 'delete':

					// verify they mean to do this:
					OP.Dialog.Confirm({
						title: labels.component.confirmDeleteTitle,
						message: labels.component.confirmDeleteMessage.replace('{0}', field.label),
						callback:function( isOK ) {

							if (isOK) {

								field.destroy()
								.then(()=>{
									DataTable.refresh();
								});

							}
						}
					})
					break;
			}

		},

		/**
		 * @function callbackSortFields
		 *
		 * call back for when the sort fields popup changes
		 */
		callbackSortFields: function() {

			var sortFields = CurrentObject.workspaceSortFields;

			if (typeof(sortFields) != "undefined") {
				$$(ids.buttonSort).define('badge', sortFields.length);
				$$(ids.buttonSort).refresh();
			}

			DataTable.sortTable();
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
			PopupNewDataFieldComponent.show($view);
		},


		toolbarButtonExport: function($view) {
console.error('TODO: Button Export()');
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
			PopupFrozenColumns.show($view);
		},


		toolbarPermission: function ($view) {
console.error('TODO: toolbarPermission()');
		},


		/**
		 * @function toolbarSort
		 *
		 * show the popup to sort the datatable
		 */
		toolbarSort:function($view) {
			PopupSortField.show($view);
// self.refreshPopupData();
// $$(self.webixUiId.sortFieldsPopup).show($view);
//console.error('TODO: toolbarSort()');
		}
	}



	// Expose any globally accessible Actions:
	var _actions = {



		/**
		 * @function clearObjectWorkspace()
		 *
		 * Clear the object workspace.
		 */
		clearObjectWorkspace:function(){

			// NOTE: to clear a visual glitch when multiple views are updating
			// at one time ... stop the animation on this one:
			$$(ids.noSelection).show(false, false);
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

			CurrentObject = object;

			App.actions.populateObjectPopupAddDataField(object);

			DataTable.objectLoad(object);

			// update hiddenFields

			PopupDefineLabelComponent.objectLoad(object);
			PopupFrozenColumnsComponent.objectLoad(object);
			PopupHideFieldComponent.objectLoad(object);
			PopupSortFieldComponent.objectLoad(object);

			_logic.callbackFieldsVisible();
			_logic.callbackFrozenColumns();
			_logic.callbackSortFields();

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
