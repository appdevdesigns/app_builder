
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
import ABPopupMassUpdate from "./ab_work_object_workspace_popupMassUpdate"
import ABPopupNewDataField from "./ab_work_object_workspace_popupNewDataField"
import ABPopupSortField from "./ab_work_object_workspace_popupSortFields"


export default class ABWorkObjectWorkspace extends OP.Component {

    /**
     * @param {object} App
	 * @param {string} idBase
	 * @param {object} settings - {
	 * 								allowDelete: bool,
	 * 								detailsView: string,
	 * 								editView: string,
	 * 								isInsertable: bool,
	 * 								isEditable: bool,
	 * 								massUpdate: bool,
	 * 								configureHeaders: bool,
	 * 
	 * 								isFieldAddable: bool
	 * 							}
     */
    constructor(App, idBase, settings) {

		idBase = idBase || 'ab_work_object_workspace';

        super(App, idBase);
        var L = this.Label;
        
        var labels = {
            common: App.labels,
            component: {
                addNewRow: L('ab.object.addNewRow', "*Add new row"),
                selectObject: L('ab.object.selectObject', "*Select an object to work with."),
                // formHeader: L('ab.application.form.header', "*Application Info"),
                deleteSelected: L('ab.object.toolbar.deleteRecords', "*Delete records"),
                hideFields: L('ab.object.toolbar.hideFields', "*Hide fields"),
                massUpdate: L('ab.object.toolbar.massUpdate', "*Edit records"),
                filterFields: L('ab.object.toolbar.filterFields', "*Add filters"),
                sortFields: L('ab.object.toolbar.sortFields', "*Apply sort"),
                frozenColumns: L('ab.object.toolbar.frozenColumns', "*Frozen fields"),
                defineLabel: L('ab.object.toolbar.defineLabel', "*Define label"),
                permission: L('ab.object.toolbar.permission', "*Permission"),
                addFields: L('ab.object.toolbar.addFields', "*Add field"),
                "export": L('ab.object.toolbar.export', "*Export"),
                confirmDeleteTitle : L('ab.object.delete.title', "*Delete data field"),
                confirmDeleteMessage : L('ab.object.delete.message', "*Do you want to delete <b>{0}</b>?")
            }
		};

		// default settings
		settings = settings || {};
		if (settings.allowDelete == null)
			settings.allowDelete = true;

		if (settings.isInsertable == null)
			settings.isInsertable = true;

		if (settings.isEditable == null)
			settings.isEditable = true;

		if (settings.massUpdate == null)
			settings.massUpdate = true;

		if (settings.configureHeaders == null)
			settings.configureHeaders = true;

		if (settings.isFieldAddable == null)
			settings.isFieldAddable = true;



    	// internal list of Webix IDs to reference our UI components.
    	var ids = {
    		component: this.unique(idBase + '_component'),

    		buttonAddField: this.unique(idBase + '_buttonAddField'),
            buttonDeleteSelected: this.unique(idBase + '_deleteSelected'),
    		buttonExport: this.unique(idBase + '_buttonExport'),
    		buttonFieldsVisible: this.unique(idBase + '_buttonFieldsVisible'),
    		buttonFilter: this.unique(idBase + '_buttonFilter'),
    		buttonFrozen: this.unique(idBase + '_buttonFrozen'),
    		buttonLabel: this.unique(idBase + '_buttonLabel'),
            buttonMassUpdate: this.unique(idBase + '_buttonMassUpdate'),
    		buttonRowNew: this.unique(idBase + '_buttonRowNew'),
    		buttonSort: this.unique(idBase + '_buttonSort'),

    		datatable: this.unique(idBase + '_datatable'),

    		// Toolbar:
    		toolbar: this.unique(idBase + '_toolbar'),

    		noSelection: this.unique(idBase + '_noSelection'),
    		selectedObject: this.unique(idBase + '_selectedObject'),

    	}


        // The DataTable that displays our object:
        var DataTable = new ABWorkspaceDatatable(App, idBase, settings);

        // Various Popups on our page:
        var PopupDefineLabelComponent = new ABPopupDefineLabel(App, idBase);

        var PopupFilterDataTableComponent = new ABPopupFilterDataTable(App, idBase);

        var PopupFrozenColumnsComponent = new ABPopupFrozenColumns(App, idBase);

        var PopupHideFieldComponent = new ABPopupHideFields(App, idBase);

        var PopupMassUpdateComponent = new ABPopupMassUpdate(App, idBase);

        var PopupNewDataFieldComponent = new ABPopupNewDataField(App, idBase);

        var PopupSortFieldComponent = new ABPopupSortField(App, idBase);
        
        var view = "button";

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
    								view: view,
    								id: ids.buttonAddField,
    								label: labels.component.addFields,
    								icon: "plus",
    								type: "icon",
									disabled: !settings.isFieldAddable,
									// autowidth: true,
    								click:function() {
    									_logic.toolbarAddFields(this.$view);
    								}
								},
                                {
    								view: view,
    								id: ids.buttonMassUpdate,
    								label: labels.component.massUpdate,
    								icon: "pencil-square-o",
    								type: "icon",
    								// autowidth: true,
    								badge: 0,
                                    disabled:true,
    								click: function () {
    									_logic.toolbarMassUpdate(this.$view);
    								}
    							},
                                {
    								view: view,
    								id: ids.buttonDeleteSelected,
    								label: labels.component.deleteSelected,
    								icon: "trash",
    								type: "icon",
    								// autowidth: true,
    								badge: 0,
                                    disabled:true,
    								click: function () {
    									_logic.toolbarDeleteSelected(this.$view);
    								}
    							},
    							{
    								view: view,
    								id: ids.buttonFieldsVisible,
    								label: labels.component.hideFields,
    								icon: "eye-slash",
    								type: "icon",
    								// autowidth: true,
    								badge: 0,
    								click: function () {
    									_logic.toolbarFieldsVisible(this.$view);
    								}
    							},
    							{
    								view: view,
    								id: ids.buttonFilter,
    								label: labels.component.filterFields,
    								icon: "filter",
    								type: "icon",
    								// autowidth: true,
    								badge: 0,
    								click: function () {
    									_logic.toolbarFilter(this.$view);
    								}
    							},
    							{
    								view: view,
    								id: ids.buttonSort,
    								label: labels.component.sortFields,
    								icon: "sort",
    								type: "icon",
    								// autowidth: true,
    								badge: 0,
    								click: function () {
    									_logic.toolbarSort(this.$view);
    								}
    							},
    							{
    								view: view,
    								id: ids.buttonFrozen,
    								label: labels.component.frozenColumns,
    								icon: "thumb-tack",
    								type: "icon",
    								// autowidth: true,
    								badge: 0,
    								click: function(){
    									_logic.toolbarFrozen(this.$view);
    								}
    							},
    							{
    								view: view,
    								id: ids.buttonLabel,
    								label: labels.component.defineLabel,
    								icon: "crosshairs",
    								type: "icon",
    								// autowidth: true,
    								click: function () {
    									_logic.toolbarDefineLabel(this.$view);
    								}
    							},
    							// {
    							// 	view: view,
    							// 	label: labels.component.permission,
    							// 	icon: "lock",
    							// 	type: "icon",
    							// 	// autowidth: true,
    							// 	click: function() {
    							// 		_logic.toolbarPermission(this.$view);
    							// 	}
                                // 
    							// },
    							{
    								view: view,
    								id: ids.buttonExport,
    								label: labels.component.export,
    								icon: "download",
    								type: "icon",
    								// autowidth: true,
    								click: function() {
    									_logic.toolbarButtonExport(this.$view);
    								}
    							}
    						]
    					},
						DataTable.ui,
						(settings.isInsertable ? 
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
						} : 
						{ 
							view: 'layout',
							rows: [],
							hidden: true
						})
    				]

    			}
    		]
    	}




    	// Our init() function for setting up our UI
    	this.init = function() {
    		// webix.extend($$(ids.form), webix.ProgressBar);

    		DataTable.init({
    			onEditorMenu:_logic.callbackHeaderEditorMenu,
                onColumnOrderChange:_logic.callbackColumnOrderChange,
                onCheckboxChecked:_logic.callbackCheckboxChecked
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

            PopupMassUpdateComponent.init({
    			// onSave:_logic.callbackAddFields			// be notified of something...who knows...
    		});

			if (settings.isFieldAddable) {
				PopupNewDataFieldComponent.init({
					onSave:_logic.callbackAddFields			// be notified when a new Field is created & saved
				});
			}

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
                DataTable.refreshHeader();
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
                // We need to load data first because there isn't anything to look at if we don't
                DataTable.refreshHeader();
                DataTable.refresh();

                _logic.getBadgeFrozenColumn();
    		},

    		/**
    		 * @function callbackFieldsVisible
    		 *
    		 * call back for when the hidden fields have changed.
    		 */
    		callbackFieldsVisible: function() {
                _logic.getBadgeHiddenFields();
    			// if you unhide a field it may fall inside the frozen columns range so lets check
    			_logic.callbackFrozenColumns();
    		},

            /**
    		 * @function callbackCheckboxChecked
    		 *
    		 * call back for when the checkbox of datatable is checked
    		 */            
            callbackCheckboxChecked: function(state) {
                if (state == "enable") {
                    _logic.enableUpdateDelete();
                } else {
                    _logic.disableUpdateDelete();
                }
            },

            /**
    		 * @function callbackColumnOrderChange
    		 *
    		 */
    		callbackColumnOrderChange: function(object) {
                _logic.getBadgeHiddenFields();
                _logic.getBadgeFrozenColumn();
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
                        var newFields = [];
                        var isHidden = CurrentObject.workspaceHiddenFields.filter((fID) => { return fID == field.columnName;}).length>0;
                        if (isHidden) {
                            // get remaining fields
                            newFields = CurrentObject.workspaceHiddenFields.filter((fID)=>{ return fID != field.columnName;});
                        } else {
                            newFields = CurrentObject.workspaceHiddenFields;
                            newFields.push(field.columnName);
                        }

                        // update our Object with current hidden fields
                        CurrentObject.workspaceHiddenFields = newFields;
                        CurrentObject.save()
                        .then(function(){
                            _logic.callbackFieldsVisible();
                        })
                        .catch(function(err){
                            OP.Error.log('Error trying to save workspaceHiddenFields', {error:err, fields:newFields });
                        })
                        break;
    				case 'filter':
                        _logic.toolbarFilter($$(ids.buttonFilter).$view, field.id);
                        break;
    				case 'sort':
                        _logic.toolbarSort($$(ids.buttonSort).$view, field.id);
    					break;
                    case 'freeze':
                        CurrentObject.workspaceFrozenColumnID = field.columnName;
                        CurrentObject.save()
                        .then(function(){
                            _logic.callbackFrozenColumns();
                        })
                        .catch(function(err){
                            OP.Error.log('Error trying to save workspaceFrozenColumnID', {error:err, fields:field.columnName });
                        });
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
                                        DataTable.refreshHeader();
    									DataTable.refresh();
                                        
                                        // recursive fn to remove any form/detail fields related to this field
                                        function checkPages(list, cb) {
                                            if (list.length == 0) {
                                                cb();
                                            } else {
                                                
                                                var page = list.shift();
                                                
                                                // begin calling removeField for each main page in the app 
                                                // this will kick off a chain of events that will have removeField called on 
                                                // all pages, subpages, widgets and views.
                                                page.removeField(field, (err)=>{
                                                    if (err) {
                                                        cb(err);
                                                    } else {
                                                        checkPages(list, cb);
                                                    }
                                                });
                                                
                                                
                                            }
                                        }
                                        checkPages(CurrentApplication.pages(), (err)=> {
                                            
                                        })
                                        
    								});

    							}
    						}
    					})
    					break;
    			}

    		},
            
            /**
             * @function callbackMassUpdate
             *
             * call back for when the mass update is fired
             */
            callbackMassUpdate: function() {
                // _logic.getBadgeSortFields();
                DataTable.refresh();
            },

    		/**
    		 * @function callbackSortFields
    		 *
    		 * call back for when the sort fields popup changes
    		 */
    		callbackSortFields: function() {
                _logic.getBadgeSortFields();
                DataTable.refreshHeader();
                DataTable.refresh();
    		},
            
            /**
             * @function enableUpdateDelete
             * 
             * enable the update or delete buttons in the toolbar if there are any items selected
             * we will make this externally accessible so we can call it from within the datatable component
             */
            enableUpdateDelete: function() {
                $$(ids.buttonMassUpdate).enable();
                $$(ids.buttonDeleteSelected).enable();
            },

            /**
             * @function enableUpdateDelete
             * 
             * disable the update or delete buttons in the toolbar if there no items selected
             * we will make this externally accessible so we can call it from within the datatable component
             */
            disableUpdateDelete: function() {
                $$(ids.buttonMassUpdate).disable();
                $$(ids.buttonDeleteSelected).disable();
            },
            
            /**
    		 * @function getBadgeFilters
    		 *
    		 * we need to set the badge count for filters on load and after filters are added or removed
    		 */            
            getBadgeFilters: function() {
				var filterConditions = CurrentObject.workspaceFilterConditions;
				var numberOfFilter = 0;

				if (filterConditions &&
					filterConditions.rules && 
					filterConditions.rules.length)
					numberOfFilter = filterConditions.rules.length;

				if (typeof(filterConditions) != "undefined") {
                    $$(ids.buttonFilter).define('badge', numberOfFilter);
                    $$(ids.buttonFilter).refresh();
                }
            },
            
            /**
    		 * @function getBadgeFrozenColumn
    		 *
    		 * we need to set the badge count for frozen columns on load and after changed are added or removed
    		 */                        
            getBadgeFrozenColumn: function() {
                var frozenID = CurrentObject.workspaceFrozenColumnID;

                if (typeof(frozenID) != "undefined") {
                    var badgeNumber = DataTable.getColumnIndex(frozenID) + 1;

                    $$(ids.buttonFrozen).define('badge', badgeNumber);
                    $$(ids.buttonFrozen).refresh();
                }
            },
            
            /**
    		 * @function getBadgeHiddenFields
    		 *
    		 * we need to set the badge count for hidden fields on load and after fields are hidden or shown
    		 */                        
            getBadgeHiddenFields: function() {
                var hiddenFields = CurrentObject.workspaceHiddenFields;

                if (typeof(hiddenFields) != "undefined") {
                    $$(ids.buttonFieldsVisible).define('badge', hiddenFields.length);
                    $$(ids.buttonFieldsVisible).refresh();
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

            toolbarDeleteSelected: function($view) {
                var deleteTasks = [];
                $$(DataTable.ui.id).data.each(function(obj){
                    if (typeof(obj) != "undefined" && obj.hasOwnProperty("appbuilder_select_item") && obj.appbuilder_select_item == 1) {
                        deleteTasks.push(function (next) {
                            CurrentObject.model()
                            .delete(obj.id)
                            .then((response)=>{
                                if (response.numRows > 0) {
                                    $$(DataTable.ui.id).remove(obj.id);
                                }
                                next();
                            }, next);
                        });
                    }
                });

                if (deleteTasks.length > 0) {
                    OP.Dialog.Confirm({
                        title: "Delete Multiple Records",
                        text:  "Are you sure you want to delete the selected records?",
                        callback: function (result) {
                            if (result) {
                                async.parallel(deleteTasks, function (err) {
                                    if (err) {
                                        // TODO : Error message
                                    } else {
                                        // Anything we need to do after we are done.
                                        _logic.disableUpdateDelete();
                                    }
                                });
                            }
                        }
                    });                    
                } else {
                    OP.Dialog.Alert({
						title: 'No Records Selected',
						text: 'You need to select at least one record...did you drink your coffee today?'
					});
                }

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
    		toolbarFilter: function($view, fieldId) {
                PopupFilterDataTableComponent.show($view, fieldId);
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

            toolbarMassUpdate: function ($view) {
                PopupMassUpdateComponent.show($view);
            },

    		/**
    		 * @function toolbarSort
    		 *
    		 * show the popup to sort the datatable
    		 */
    		toolbarSort:function($view, fieldId) {
    			PopupSortFieldComponent.show($view, fieldId);
                    // self.refreshPopupData();
                    // $$(self.webixUiId.sortFieldsPopup).show($view);
                    //console.error('TODO: toolbarSort()');
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

				// the replicated tables are read only
				if (object.isImported) {
					DataTable.readonly();

					if ($$(ids.buttonRowNew))
						$$(ids.buttonRowNew).disable();
				}
				else {
					DataTable.editable();

					if ($$(ids.buttonRowNew))
						$$(ids.buttonRowNew).enable();
				}

				DataTable.objectLoad(CurrentObject);

				PopupNewDataFieldComponent.objectLoad(CurrentObject);
				PopupDefineLabelComponent.objectLoad(CurrentObject);
				PopupFilterDataTableComponent.objectLoad(CurrentObject);
				PopupFrozenColumnsComponent.objectLoad(CurrentObject);
				PopupHideFieldComponent.objectLoad(CurrentObject);
				PopupMassUpdateComponent.objectLoad(CurrentObject, DataTable);
				PopupSortFieldComponent.objectLoad(CurrentObject);

				// We can hide fields now that data is loaded
				_logic.callbackFieldsVisible();
				
				// get badge counts for server side components
				_logic.getBadgeSortFields();
				_logic.getBadgeFilters();

				// $$(ids.component).setValue(ids.selectedObject);
				$$(ids.selectedObject).show(true, false);

				// disable add fields into the object
				if (object.isExternal || object.isImported || !settings.isFieldAddable) {
					$$(ids.buttonAddField).disable();
				}
				else {
					$$(ids.buttonAddField).enable();
				}


			},


			/**
    		 * @function clearObjectWorkspace()
    		 *
    		 * Clear the object workspace.
    		 */
    		clearObjectWorkspace:function(){
				
				// NOTE: to clear a visual glitch when multiple views are updating
				// at one time ... stop the animation on this one:
				$$(ids.noSelection).show(false, false);
			}


		}
        this._logic = _logic;



    	// Expose any globally accessible Actions:
    	this.actions({
    	});

		// 
		// Define our external interface methods:
		// 
		this.applicationLoad = this._logic.applicationLoad;
		this.populateObjectWorkspace = this._logic.populateObjectWorkspace;
		this.clearObjectWorkspace = this._logic.clearObjectWorkspace;

    }

}
