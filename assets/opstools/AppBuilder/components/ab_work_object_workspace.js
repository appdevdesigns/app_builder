
/*
 * ab_work_object_workspace
 *
 * Manage the Object Workspace area.
 *
 */

import ABApplication from "../classes/ABApplication"
import ABWorkspaceDatatable from "./ab_work_object_workspace_datatable"
import ABPopupDefineLabel from "./ab_work_object_workspace_popupDefineLabel"
import ABPopupFilterDataTable from "./ab_work_object_workspace_popupFilterDataTable"
import ABPopupFrozenColumns from "./ab_work_object_workspace_popupFrozenColumns"
import ABPopupHideFields from "./ab_work_object_workspace_popupHideFields"
import ABPopupNewDataField from "./ab_work_object_workspace_popupNewDataField"
import ABPopupSortField from "./ab_work_object_workspace_popupSortFields"


export default class ABWorkObjectWorkspace extends OP.Component {
    
    /**
     * @param {object} ??
     */
    constructor(App) {
        super(App, 'ab_work_object_workspace');
        var L = this.Label;
        
        var labels = {
            common: App.labels,
            component: {
                addNewRow: L('ab.object.addNewRow', "*Add new row"),
                selectObject: L('ab.object.selectObject', "*Select an object to work with."),
                // formHeader: L('ab.application.form.header', "*Application Info"),
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
        };



    	// internal list of Webix IDs to reference our UI components.
    	var ids = {
    		component: this.unique('component'),

    		buttonAddField: this.unique('buttonAddField'),
    		buttonExport: this.unique('buttonExport'),
    		buttonFieldsVisible: this.unique('buttonFieldsVisible'),
    		buttonFilter: this.unique('buttonFilter'),
    		buttonFrozen: this.unique('buttonFrozen'),
    		buttonLabel: this.unique('buttonLabel'),
    		buttonRowNew: this.unique('buttonRowNew'),
    		buttonSort: this.unique('buttonSort'),

    		datatable: this.unique('datatable'),

    		// Toolbar:
    		toolbar: this.unique('toolbar'),

    		noSelection: this.unique('noSelection'),
    		selectedObject: this.unique('selectedObject'),

    	}


        // The DataTable that displays our object:
        var DataTable = new ABWorkspaceDatatable(App);

        // Various Popups on our page:
        var PopupDefineLabelComponent = new ABPopupDefineLabel(App);

        var PopupFilterDataTableComponent = new ABPopupFilterDataTable(App);

        var PopupFrozenColumnsComponent = new ABPopupFrozenColumns(App);

        var PopupHideFieldComponent = new ABPopupHideFields(App);

        var PopupNewDataFieldComponent = new ABPopupNewDataField(App);

        var PopupSortFieldComponent = new ABPopupSortField(App);

    	// Our webix UI definition:
    	this.ui = {
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
    								icon: "eye-slash",
    								type: "icon",
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
    								autowidth: true,
    								badge: 0,
    								click: function () {
    									_logic.toolbarFilter(this.$view);
    								}
    							},
    							{
    								view: 'button',
    								id: ids.buttonSort,
    								label: labels.component.sortFields,
    								icon: "sort",
    								type: "icon",
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
    									_logic.rowAdd();
    								}
    							}
    						]
    					}
    				]

    			}
    		]
    	}




    	// Our init() function for setting up our UI
    	this.init = function() {
    		// webix.extend($$(ids.form), webix.ProgressBar);

    		DataTable.init({
    			onEditorMenu:_logic.callbackHeaderEditorMenu
    		});

    		PopupDefineLabelComponent.init({
    			onChange:_logic.callbackDefineLabel		// be notified when there is a change in the label
    		});

            PopupFilterDataTableComponent.init({
    			onChange:_logic.callbackFilterDataTable		// be notified when there is a change in the filters
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

// ?? what is this for ??
    		var fieldList = DataTable.getFieldList();

    		PopupSortFieldComponent.init({
    			onChange:_logic.callbackSortFields		// be notified when there is a change in the sort fields
    		});


    		$$(ids.noSelection).show();
    	}

        

        var CurrentApplication = null;
        var CurrentObject = null;


    	// our internal business logic
    	var _logic = {


			/**
			 * @function applicationLoad
			 *
			 * Initialize the Object Workspace with the given ABApplication.
			 *
			 * @param {ABApplication} application
			 */
			applicationLoad: (application) => {
				CurrentApplication = application;

				PopupNewDataFieldComponent.applicationLoad(application);
			},

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
    		 * @function callbackFilterDataTable
    		 *
    		 * call back for when the Define Label popup is finished.
    		 */
    		callbackFilterDataTable: function() {
                // Since we are making server side requests lets offload the badge count to another function so it can be called independently
                _logic.getBadgeFilters();
                // this will be handled by the server side request now
                DataTable.refresh();
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
    			// DataTable.refresh();

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

										// TODO workaround : where should I destroy a link object
										if (field.key == "connectObject") {
											var linkObject = CurrentApplication.objects((obj) => obj.id == field.settings.linkObject)[0];
											var linkField = linkObject.fields((f) => f.id == field.settings.linkColumn)[0];

											if (linkField) {
												linkField.destroy().then(() => {});
											}
										}

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
                _logic.getBadgeSortFields();
                DataTable.refresh();
    		},
            
            /**
    		 * @function getBadgeFilters
    		 *
    		 * we need to set the badge count for filters on load and after filters are added or removed
    		 */            
            getBadgeFilters: function() {
                var filterConditions = CurrentObject.workspaceFilterConditions;

                if (typeof(filterConditions) != "undefined") {
                    $$(ids.buttonFilter).define('badge', filterConditions.length);
                    $$(ids.buttonFilter).refresh();
                }
            },
            
            /**
    		 * @function getBadgeSortFields
    		 *
    		 * we need to set the badge count for sorts on load and after sorts are added or removed
    		 */                        
            getBadgeSortFields: function() {
                var sortFields = CurrentObject.workspaceSortFields;

    			if (typeof(sortFields) != "undefined") {
    				$$(ids.buttonSort).define('badge', sortFields.length);
    				$$(ids.buttonSort).refresh();
    			}
            },


    		/**
    		 * @function rowAdd()
    		 *
    		 * When our [add row] button is pressed, alert our DataTable
    		 * component to add a row.
    		 */
    		rowAdd:function() {
    			DataTable.addRow();
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
    			PopupDefineLabelComponent.show($view);
    		},

    		/**
    		 * @function toolbarFieldsVisible
    		 *
    		 * Show the popup to allow the user to hide columns for this view.
    		 */
    		toolbarFieldsVisible: function($view) {
    			PopupHideFieldComponent.show($view);
    		},


    		/**
    		 * @function toolbarFilter
    		 *
    		 * show the popup to add a filter to the datatable
    		 */
    		toolbarFilter: function($view) {
                PopupFilterDataTableComponent.show($view);
    		},


    		/**
    		 * @function toolbarFrozen
    		 *
    		 * show the popup to freeze columns for the datatable
    		 */
    		toolbarFrozen: function ($view) {
    			PopupFrozenColumnsComponent.show($view);
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
    			PopupSortFieldComponent.show($view);
                    // self.refreshPopupData();
                    // $$(self.webixUiId.sortFieldsPopup).show($view);
                    //console.error('TODO: toolbarSort()');
    		}
    	}
        this._logic = _logic;



    	// Expose any globally accessible Actions:
    	this.actions({



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

    			PopupDefineLabelComponent.objectLoad(object);
                PopupFilterDataTableComponent.objectLoad(object);
    			PopupFrozenColumnsComponent.objectLoad(object);
    			PopupHideFieldComponent.objectLoad(object);
    			PopupSortFieldComponent.objectLoad(object);

    			// We can hide fields now that data is loaded
                _logic.callbackFieldsVisible();
                
                // get badge counts for server side components
                _logic.getBadgeSortFields();
                _logic.getBadgeFilters();
    		}


    	});

		// 
		// Define our external interface methods:
		// 
		this.applicationLoad = this._logic.applicationLoad;

    }

}
