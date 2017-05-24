
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


export default class ABWorkObject extends OP.Component {
    
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
            component: this.unique('_component'),
    
            buttonAddField: this.unique('_buttonAddField'),
            buttonExport: this.unique('_buttonExport'),
            buttonFieldsVisible: this.unique('_buttonFieldsVisible'),
            buttonFilter: this.unique('_buttonFilter'),
            buttonFrozen: this.unique('_buttonFrozen'),
            buttonLabel: this.unique('_buttonLabel'),
            buttonRowNew: this.unique('_buttonRowNew'),
            buttonSort: this.unique('_buttonSort'),
    
            datatable: this.unique('_datatable'),
    
            // Toolbar:
            toolbar: this.unique('_toolbar'),
    
            noSelection: this.unique('_noSelection'),
            selectedObject: this.unique('_selectedObject'),
        };
        
        
        // The DataTable that displays our object:
        var DataTable = OP.Component['ab_work_object_workspace_datatable'](App);
    
        // Various Popups on our page:
        var PopupDefineLabelComponent = OP.Component['ab_work_object_workspace_popupDefineLabel'](App);
        var PopupDefineLabel = webix.ui(PopupDefineLabelComponent.ui);
        
        var PopupNewDataFieldComponent = OP.Component['ab_work_object_workspace_popupNewDataField'](App);
        // var PopupNewDataField = webix.ui(PopupNewDataFieldComponent.ui);
        webix.ui(PopupNewDataFieldComponent.ui);
        
        var PopupHideFieldComponent = OP.Component['ab_work_object_workspace_popupHideFields'](App);
        var PopupHideField = webix.ui(PopupHideFieldComponent.ui);
        
        
        // Our webix UI definition:
        this.ui = {
            view:'multiview',
            id: ids.component,
            rows:[
                {
                    id: ids.noSelection,
                    rows:[
                        { 
                            view:'label', 
                            label:labels.component.selectObject 
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
        };
        
        
        // Our init() function for setting up our UI
        this.init = function() {
            // webix.extend($$(ids.form), webix.ProgressBar);
    
            DataTable.init({
                onEditorMenu:_logic.callbackHeaderEditorMenu
            });
    
            PopupDefineLabelComponent.init({
                onChange:_logic.callbackDefineLabel		// be notified when there is a change in the label
            });
    
            PopupNewDataFieldComponent.init({
                onSave:_logic.callbackAddFields			// be notified when a new Field is created & saved
            });
    
            PopupHideFieldComponent.init({
                onChange:_logic.callbackFieldsVisible		// be notified when there is a change in the hidden fields
            });
    
    
            $$(ids.noSelection).show();
        };
        
        
        var CurrentObject = null;
        
        
        // internal business logic
        var _logic = this.logic = {
    
    
            /**
             * @function callbackDefineLabel
             *
             * call back for when the Define Label popup is finished.
             */
            callbackAddFields: function(field) {
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
             * @function callbackFieldsVisible
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
                            callback: function(isOK) {
                                if (isOK) {
                                    field.destroy()
                                    .then(()=>{
                                        DataTable.refresh();
                                    });
                                }
                            }
                        });
                        break;
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
                console.error('TODO: toolbarFrozen()');
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
                // self.refreshPopupData();
                // $$(self.webixUiId.sortFieldsPopup).show($view);
                console.error('TODO: toolbarSort()');
            }
        }
    
    
    
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
    
                // update hiddenFields 
                _logic.callbackFieldsVisible();
    
    
                PopupDefineLabelComponent.objectLoad(object);
                PopupHideFieldComponent.objectLoad(object);
                DataTable.objectLoad(object);
            }
    
        });
    }
    
}
