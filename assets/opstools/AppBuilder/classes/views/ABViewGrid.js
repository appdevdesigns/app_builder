/*
 * ABViewGrid
 *
 * An ABViewGrid defines a Grid view type.
 *
 */

import ABView from "./ABView"
import ABPropertyComponent from "../ABPropertyComponent"
import ABWorkspaceDatatable from "../../components/ab_work_object_workspace_datatable"
import ABPopupHideFields from "../../components/ab_work_object_workspace_popupHideFields"
import ABPopupFilterDataTable from "../../components/ab_work_object_workspace_popupFilterDataTable"
import ABPopupSortField from "../../components/ab_work_object_workspace_popupSortFields"
import ABPopupFrozenColumns from "../../components/ab_work_object_workspace_popupFrozenColumns"
import ABPopupMassUpdate from "../../components/ab_work_object_workspace_popupMassUpdate"


function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var ABViewGridPropertyComponentDefaults = {
	label:'',	// label is required and you can add more if the component needs them
	// format:0  	// 0 - normal, 1 - title, 2 - description
	dataSource:'',
	isEditable:0,
	massUpdate:0,
	allowDelete:0,
	linkedObject:'',
	linkedField:'',
	linkedPage:'',
	linkedPageView:'',
	linkedEditPage:'',
	linkedEditPageForm:'',
	objectWorkspace: {
		sortFields:[], // array of columns with their sort configurations
		filterConditions:[], // array of filters to apply to the data table
		frozenColumnID:"", // id of column you want to stop freezing
		hiddenFields:[], // array of [ids] to add hidden:true to
	}
}


var ABViewDefaults = {
	key: 'grid',		// {string} unique key for this view
	icon: 'table',		// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.grid' // {string} the multilingual label key for the class label
}

var PopupHideFieldComponent = null;
var PopupFilterDataTableComponent = null;
var PopupSortFieldComponent = null;
var PopupFrozenColumnsComponent = null;

export default class ABViewGrid extends ABView  {
	
	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABView} parent the ABView this view is a child of. (can be null)
	 */
    constructor(values, application, parent) {

    	super( values, application, parent, ABViewDefaults );
		
    	// OP.Multilingual.translate(this, this, ['text']);

  	}


  	static common() {
  		return ABViewDefaults;
  	}

	///
	/// Instance Methods
	///

	/**
	 * @method toObj()
	 *
	 * properly compile the current state of this ABViewLabel instance
	 * into the values needed for saving.
	 *
	 * @return {json}
	 */
	toObj () {

		// OP.Multilingual.unTranslate(this, this, ['label', 'text']);

		var obj = super.toObj();
		obj.views = [];
		return obj;
	}


	/**
	 * @method fromValues()
	 *
	 * initialze this object with the given set of values.
	 * @param {obj} values
	 */
	fromValues (values) {

		super.fromValues(values);

    	// if this is being instantiated on a read from the Property UI,
    	this.settings.dataSource = this.settings.dataSource || ABViewGridPropertyComponentDefaults.dataSource;
		this.settings.isEditable = this.settings.isEditable || ABViewGridPropertyComponentDefaults.isEditable;
		this.settings.massUpdate = this.settings.massUpdate || ABViewGridPropertyComponentDefaults.massUpdate;
		this.settings.allowDelete = this.settings.allowDelete || ABViewGridPropertyComponentDefaults.allowDelete;
		this.settings.linkedObject = this.settings.linkedObject || ABViewGridPropertyComponentDefaults.linkedObject;
		this.settings.linkedField = this.settings.linkedField || ABViewGridPropertyComponentDefaults.linkedField;
		this.settings.linkedPage = this.settings.linkedPage || ABViewGridPropertyComponentDefaults.linkedPage;
		this.settings.linkedPageView = this.settings.linkedPageView || ABViewGridPropertyComponentDefaults.linkedPageView;
		this.settings.linkedEditPage = this.settings.linkedEditPage || ABViewGridPropertyComponentDefaults.linkedEditPage;
		this.settings.linkedEditPageForm = this.settings.linkedEditPageForm || ABViewGridPropertyComponentDefaults.linkedEditPageForm;
		
		this.settings.objectWorkspace = this.settings.objectWorkspace || ABViewGridPropertyComponentDefaults.objectWorkspace;
		
		if (typeof(this.settings.objectWorkspace) != "undefined") {
			if (typeof(this.settings.objectWorkspace.sortFields) == "undefined") this.settings.objectWorkspace.sortFields = [];
			if (typeof(this.settings.objectWorkspace.filterConditions) == "undefined") this.settings.objectWorkspace.filterConditions = [];
			if (typeof(this.settings.objectWorkspace.frozenColumnID) == "undefined") this.settings.objectWorkspace.frozenColumnID = "";
			if (typeof(this.settings.objectWorkspace.hiddenFields) == "undefined") this.settings.objectWorkspace.hiddenFields = [];
		}

    	// we are not allowed to have sub views:
    	this._views = [];

    	// convert from "0" => 0
    	// this.settings.format = parseInt(this.settings.format);

	}



	//
	//	Editor Related
	//


	/** 
	 * @method editorComponent
	 * return the Editor for this UI component.
	 * the editor should display either a "block" view or "preview" of 
	 * the current layout of the view.
	 * @param {string} mode what mode are we in ['block', 'preview']
	 * @return {Component} 
	 */
	editorComponent(App, mode) {
		
		var idBase = 'ABViewGridEditorComponent';
		var ids = {
			component: App.unique(idBase+'_component')
		}

		var DataTable = this.component(App, idBase);
		DataTable.ui.id = ids.component;
		
		return DataTable;
		
	}



	//
	// Property Editor
	// 

	// static propertyEditorComponent(App) {
	// 	return ABViewPropertyComponent.component(App);
	// }


	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		var commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);
		
		var idBase = 'ABViewGridPropertyEditor';

		// initialize our popup editors with unique names so we don't overwrite the previous editor each time
		PopupHideFieldComponent = new ABPopupHideFields(App, idBase+"_hide");
		PopupFilterDataTableComponent = new ABPopupFilterDataTable(App, idBase+"_filter");
		PopupSortFieldComponent = new ABPopupSortField(App, idBase+"_sort");
		PopupFrozenColumnsComponent = new ABPopupFrozenColumns(App, idBase+"_freeze");
		
		_logic.newObject = () => {
			var currObj = _logic.currentEditObject();
			currObj.settings.objectWorkspace = {
				sortFields:[],
				filterConditions:[],
				frozenColumnID:"",
				hiddenFields:[]
			};
			currObj.populatePopupEditors(currObj);
		}
		
		// Open our popup editors when their settings button is clicked
		_logic.toolbarFieldsVisible = ($view) => {
			PopupHideFieldComponent.show($view, {pos:"top"});
		}
		
		_logic.toolbarFilter = ($view) => {
			PopupFilterDataTableComponent.show($view, null, {pos:"top"});
		}
		
		_logic.toolbarSort = ($view) => {
			PopupSortFieldComponent.show($view, null, {pos:"top"});
		}
		
		_logic.toolbarFrozen = ($view) => {
			PopupFrozenColumnsComponent.show($view, {pos:"top"});
		}
		
		_logic.callbackSaveWorkspace = (data) => {
			// when we make a change in the popups we want to make sure we save the new workspace to the properties to do so just fire an onChange event
			_logic.onChange();
		}
		
		_logic.updateDetailsView = (value) => {
			if (value != "") {
				var vals = value.split("|");
				var page = vals[0];
				var component = vals[1];
				// console.log("updateDetailsView");
				// console.log(value);
				$$(ids.linkedPage).setValue(page);
				$$(ids.linkedPageView).setValue(component);
			} else {
				$$(ids.linkedPage).setValue("");
				$$(ids.linkedPageView).setValue("");
			}
		}

		_logic.updateEditForm = (value) => {
			if (value != "") {
				var vals = value.split("|");
				var page = vals[0];
				var component = vals[1];
				// console.log("updateEditForm");
				// console.log(value);
				$$(ids.linkedEditPage).setValue(page);
				$$(ids.linkedEditPageForm).setValue(component);
			} else {
				$$(ids.linkedEditPage).setValue("");
				$$(ids.linkedEditPageForm).setValue("");
			}
		}
		
		PopupHideFieldComponent.init({
			onChange:_logic.callbackSaveWorkspace		// be notified when there is a change in the hidden fields
		});
		
		PopupFilterDataTableComponent.init({
			onChange:_logic.callbackSaveWorkspace		// be notified when there is a change in the hidden fields
		});
		
		PopupSortFieldComponent.init({
			onChange:_logic.callbackSaveWorkspace		// be notified when there is a change in the hidden fields
		});
		
		PopupFrozenColumnsComponent.init({
			onChange:_logic.callbackSaveWorkspace		// be notified when there is a change in the hidden fields
		});
		
		var view = "button";
		// in addition to the common .label  values, we 
		// ask for:
		return commonUI.concat([
			
			{ 
				view: "fieldset", 
				label: L('ab.component.label.gridProperties', '*Grid Properties:'),
				labelWidth: App.config.labelWidthLarge,
				body:{
					rows:[
						{
							view:"checkbox",
							name:"isEditable",
							labelRight: L('ab.component.label.isEditable', '*User can edit in grid.'),
							labelWidth: App.config.labelWidthCheckbox
						},
						{
							view:"checkbox",
							name:"massUpdate",
							labelRight: L('ab.component.label.massUpdate', '*User can edit multiple items at one time.'),
							labelWidth: App.config.labelWidthCheckbox
						},
						{
							view:"checkbox",
							name:"allowDelete",
							labelRight: L('ab.component.label.allowDelete', '*User can delete records.'),
							labelWidth: App.config.labelWidthCheckbox
						}
					]
				}
			},
			{ 
				view: "fieldset", 
				label: L('ab.component.label.dataSource', '*Grid Data:'),
				labelWidth: App.config.labelWidthLarge,
				body:{
			        rows:[
						{
							view:"select",
							name:"dataSource",
							label: L('ab.component.label.dataSource', '*Object:'),
							labelWidth: App.config.labelWidthLarge,
							on: {
								onChange: function(newv, oldv) {
									if (newv != oldv) {
										_logic.newObject();
										$$(ids.linkedObject).setValue("");
										$$(ids.linkedField).setValue("");
										$$(ids.linkedPage).setValue("");
										$$(ids.linkedPageView).setValue("");
										$$(ids.linkedEditPage).setValue("");
										$$(ids.linkedEditPageForm).setValue("");
									}
								}
							}
						},
						{
							view:"select",
							name:"linkedObject",
							label: L('ab.component.label.linkedObject', '*Linked To:'), 
							labelWidth: App.config.labelWidthLarge,
							hidden: 1,
							on: {
								onChange: function(newv, oldv) {
									if (newv != oldv) {
										$$(ids.linkedField).setValue("");
									}
								}
							}
						},
						{
							view:"select",
							name:"linkedField",
							label: L('ab.component.label.linkedField', '*Linked Field:'),
							labelWidth: App.config.labelWidthLarge,
							hidden: 1
						}
			        ]
		    	}
		    },
			{ 
				view: "fieldset", 
				label: L('ab.component.label.dataSource', '*Linked Views:'),
				labelWidth: App.config.labelWidthLarge,
				body:{
			        rows:[
						{
							view:"select",
							name:"detailsView",
							label: L('ab.component.label.dataSource', '*Details View:'),
							labelWidth: App.config.labelWidthLarge,
							on: {
								onChange: function(newv, oldv) {
									if (newv != oldv) {
										_logic.updateDetailsView(newv);
									}
								}
							}
						},
						{
							view:"text",
							name:"linkedPage",
							height:0
						},
						{
							view:"text",
							name:"linkedPageView",
							height:0
						},
						{
							view:"select",
							name:"editForm",
							label: L('ab.component.label.linkedObject', '*Edit Form:'), 
							labelWidth: App.config.labelWidthLarge,
							on: {
								onChange: function(newv, oldv) {
									if (newv != oldv) {
										_logic.updateEditForm(newv);
									}
								}
							}
						},
						{
							view:"text",
							name:"linkedEditPage",
							height:0
						},
						{
							view:"text",
							name:"linkedEditPageForm",
							height:0
						}
			        ]
		    	}
		    },
			{
				view: "fieldset", 
				label: L('ab.component.label.customizeDisplay', '*Customize Display:'),
				labelWidth: App.config.labelWidthLarge,
				body:{
					rows: [
						{
							cols: [
								{ 
								    view:"label", 
								    label: L("ab.component.label.hiddenFields", "*Hidden Fields:"),
									width: App.config.labelWidthLarge,
								},
								{
									view: view,
									// id: ids.buttonFieldsVisible,
									label: L("ab.component.label.settings", "*Settings"),
									icon: "gear",
									type: "icon",
									badge: 0,
									click: function () {
										_logic.toolbarFieldsVisible(this.$view);
									}
								}
							]
						},
						{
							cols: [
								{ 
								    view:"label", 
								    label: L("ab.component.label.filterData", "*Filter Data:"),
									width: App.config.labelWidthLarge,
								},
								{
									view: view,
									// id: ids.buttonFilter,
									label: L("ab.component.label.settings", "*Settings"),
									icon: "gear",
									type: "icon",
									badge: 0,
									click: function () {
										_logic.toolbarFilter(this.$view);
									}
								}
							]
						},
						{
							cols: [
								{ 
								    view:"label", 
								    label: L("ab.component.label.sortData", "*Sort Data:"),
									width: App.config.labelWidthLarge,
								},
								{
									view: view,
									label: L("ab.component.label.settings", "*Settings"),
									icon: "gear",
									type: "icon",
									badge: 0,
									click: function () {
										_logic.toolbarSort(this.$view);
									}
								}
							]
						},
						{
							cols: [
								{ 
								    view:"label", 
								    label: L("ab.component.label.freezeColumns", "*Freeze Columns:"),
									width: App.config.labelWidthLarge,
								},
								{
									view: view,
									label: L("ab.component.label.settings", "*Settings"),
									icon: "gear",
									type: "icon",
									badge: 0,
									click: function(){
										_logic.toolbarFrozen(this.$view);
									}
								}							
							]
						}
					]
				}
			},
			{}
		]);

	}


	static propertyEditorPopulate(ids, view) {

		super.propertyEditorPopulate(ids, view);
		
		this.view = view;
		
		$$(ids.dataSource).setValue(view.settings.dataSource);
		$$(ids.isEditable).setValue(view.settings.isEditable);
		$$(ids.massUpdate).setValue(view.settings.massUpdate);
		$$(ids.allowDelete).setValue(view.settings.allowDelete);
		$$(ids.linkedObject).setValue(view.settings.linkedObject);
		$$(ids.linkedField).setValue(view.settings.linkedField);
		$$(ids.linkedPage).setValue(view.settings.linkedPage);
		$$(ids.linkedPageView).setValue(view.settings.linkedPageView);
		$$(ids.linkedEditPage).setValue(view.settings.linkedEditPage);
		$$(ids.linkedEditPageForm).setValue(view.settings.linkedEditPageForm);
		
		// initial populate of properties and popups
		view.populateEditor(ids, view);
		view.populatePopupEditors(view);
		
		// when a change is made in the properties the popups need to reflect the change
		view.addListener('properties.updated', function() {
			view.populateEditor(ids, view);
			view.populatePopupEditors(view);
		});
	
	}
	
	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		// Retrive the values of your properties from Webix and store them in the view
		view.settings.dataSource = $$(ids.dataSource).getValue();
		view.settings.isEditable = $$(ids.isEditable).getValue();
		view.settings.massUpdate = $$(ids.massUpdate).getValue();
		view.settings.allowDelete = $$(ids.allowDelete).getValue();
		view.settings.linkedObject = $$(ids.linkedObject).getValue();
		view.settings.linkedField = $$(ids.linkedField).getValue();
		view.settings.linkedPage = $$(ids.linkedPage).getValue();
		view.settings.linkedPageView = $$(ids.linkedPageView).getValue();
		view.settings.linkedEditPage = $$(ids.linkedEditPage).getValue();
		view.settings.linkedEditPageForm = $$(ids.linkedEditPageForm).getValue();
		
	}


	/*
	 * @component()
	 * return a UI component based upon this view.
	 * @param {obj} App 
	 * @return {obj} UI component
	 */
	component(App, objId) {

		var idBase = objId || 'ABViewGrid_'+this.id;
		var ids = {
			component: App.unique(idBase+'_component'),
			toolbar: App.unique(idBase+'_toolbar'),
			buttonDeleteSelected: App.unique('deleteSelected'),
			// buttonExport: App.unique('buttonExport'),
			buttonFilter: App.unique('buttonFilter'),
			buttonMassUpdate: App.unique('buttonMassUpdate'),
			buttonSort: App.unique('buttonSort'),

		}
		
		var CurrentObject = null;
		
		var linkedPage = null;
		if (this.settings.linkedPage != "undefined" && this.settings.linkedPage != "" && this.settings.linkedPageView != "undefined" && this.settings.linkedPageView != "") {
			linkedPage = this.settings.linkedPage+"|"+this.settings.linkedPageView;
		}

		var linkedEditPage = null;
		if (this.settings.linkedEditPage != "undefined" && this.settings.linkedEditPage != "" && this.settings.linkedEditPageForm != "undefined" && this.settings.linkedEditPageForm != "") {
			linkedEditPage = this.settings.linkedEditPage+"|"+this.settings.linkedEditPageForm;
		}
		
		// there must be a better way...
		if (this.settings.allowDelete == "1") {
			this.settings.allowDelete = true;
		} else {
			this.settings.allowDelete = false;
		}
		if (this.settings.isEditable == "1") {
			this.settings.isEditable = true;
		} else {
			this.settings.isEditable = false;
		}
		if (this.settings.massUpdate == "1") {
			this.settings.massUpdate = true;
		} else {
			this.settings.massUpdate = false;
		}
		var settings = {
			allowDelete: this.settings.allowDelete,
			detailsView: linkedPage,
			editView: linkedEditPage,
			isEditable: this.settings.isEditable,
			massUpdate: this.settings.massUpdate
		}
		var DataTable = new ABWorkspaceDatatable(App, idBase, settings);
		var PopupMassUpdateComponent = new ABPopupMassUpdate(App, idBase+"_mass");
		var PopupFilterDataTableComponent = new ABPopupFilterDataTable(App, idBase+"_filter");
		
		var _init = () => {

			if (this.settings.dataSource != "") {
				DataTable.init({
					onCheckboxChecked: _logic.callbackCheckboxChecked
				});			

				PopupMassUpdateComponent.init({
					// onSave:_logic.callbackAddFields			// be notified of something...who knows...
				});
				
				PopupFilterDataTableComponent.init({
					onChange:_logic.callbackSaveWorkspace		// be notified when there is a change in the hidden fields
				});

				var dataSource = this.application.objects((o)=>{
					return o.id == this.settings.dataSource;
				});

				var dataCopy = _.cloneDeep(dataSource[0]);
				dataCopy.objectWorkspace = this.settings.objectWorkspace;
				CurrentObject = dataCopy;
				// console.log("dataCopy");
				// console.log(dataCopy);

				if (dataSource.length > 0) {
					DataTable.objectLoad(dataCopy);
					PopupMassUpdateComponent.objectLoad(dataCopy, DataTable);
					PopupFilterDataTableComponent.objectLoad(dataCopy);
					DataTable.refresh();
				}
				
				$$(ids.component).adjust();
				
			}	
			
		};
		
		var tableUI = {
			type: "space",
			rows: [
				{ 
					view:"label", 
					label: "Select an object to load.",
					inputWidth:200, 
					align:"center"
				},
				{}
			]
		};
		if (this.settings.dataSource != "") {
			tableUI = {
				type: "space",
				rows: [
					{
						view: 'toolbar',
						id: ids.toolbar,
						css: "ab-data-toolbar",
						cols: [
							{
								view: "button",
								id: ids.buttonMassUpdate,
								label: L("ab.component.label.massUpdate", "*Edit fields"),
								icon: "pencil-square-o",
								type: "icon",
								badge: 0,
								disabled:true,
								autowidth: true,
								click: function () {
									_logic.toolbarMassUpdate(this.$view);
								}
							},
							{
								view: "button",
								id: ids.buttonDeleteSelected,
								label: L("ab.component.label.deleteSelected", "*Delete Records"),
								icon: "trash",
								type: "icon",
								badge: 0,
								disabled:true,
								autowidth: true,
								click: function () {
									_logic.toolbarDeleteSelected(this.$view);
								}
							},
							{
								view: "button",
								id: ids.buttonFilter,
								label: L("ab.component.label.filterFields", "*Add filters"),
								icon: "filter",
								type: "icon",
								badge: 0,
								autowidth: true,
								click: function () {
									_logic.toolbarFilter(this.$view);
								}
							},
							{
								view: "button",
								id: ids.buttonSort,
								label: L("ab.component.label.sortFields", "*Apply sort"),
								icon: "sort",
								type: "icon",
								badge: 0,
								autowidth: true,
								click: function () {
									// _logic.toolbarSort(this.$view);
								}
							},
							/*
							{
								view: view,
								id: ids.buttonExport,
								label: labels.component.export,
								icon: "download",
								type: "icon",
								click: function() {
									_logic.toolbarButtonExport(this.$view);
								}
							}
							*/
						]
					},
					DataTable.ui
				]
			};
		}
		
		// our internal business logic
    	var _logic = {
			
			callbackCheckboxChecked: (state) => {
				if (state == "enable") {
                    _logic.enableUpdateDelete();
                } else {
                    _logic.disableUpdateDelete();
                }
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
			
			toolbarFilter: ($view) => {
				PopupFilterDataTableComponent.show($view, null);
			},

			toolbarMassUpdate: function ($view) {
				PopupMassUpdateComponent.show($view);
			},
		
		}
		
		return {
			ui: tableUI,
			init: _init,
			logic: _logic
		};
	}


	/*
	 * @method componentList
	 * return the list of components available on this view to display in the editor.
	 */
	componentList() {
		return [];
	}

	populateEditor(ids, view) {
		// Set the objects you can choose from in the list
		var objects = [
			{id:'', value:L('ab.component.label.selectObject', '*Select an object')}
		];
		view.application._objects.forEach((o)=>{
			objects.push({id:o.id, value:o.label});
		});
		$$(ids.dataSource).define("options", objects);
		$$(ids.dataSource).refresh();
		// console.log("getting data source");
		// console.log($$(ids.dataSource).getValue());
		// console.log(view.settings.dataSource);
		if (view.settings.dataSource != '') {
			$$(ids.dataSource).setValue(view.settings.dataSource);
			$$(ids.linkedObject).show();
		} else {
			$$(ids.dataSource).setValue('');
			$$(ids.linkedObject).hide();
		}

		// Set the connected objects you can choose from in the list
		var linkedObjects = [];
		var linkedObjectsOptions = {id:'', value:L('ab.component.label.noLinkedObject', '*No linked object')};
		linkedObjects = view.application.connectedObjects(view.settings.dataSource);
		linkedObjects.unshift(linkedObjectsOptions);

		$$(ids.linkedObject)
		$$(ids.linkedObject).define("options", linkedObjects);
		$$(ids.linkedObject).refresh();
		if (view.settings.linkedObject != '') {
			$$(ids.linkedObject).setValue(view.settings.linkedObject);
			$$(ids.linkedField).show();
		} else {
			$$(ids.linkedObject).setValue('');
			$$(ids.linkedField).hide();
		}

		// 	Set the connected fields you can choose from in the list
		var connectedFields = [];
		// var connectedFieldsOptions = {id:'', value:L('ab.component.label.selectField', '*Select a field')};
		if (view.settings.linkedObject != '') {
			connectedFields = view.application.connectedFields(view.settings.dataSource, view.settings.linkedObject);
			// connectedFields.unshift(connectedFieldsOptions);			
		}

		$$(ids.linkedField).define("options", connectedFields);
		$$(ids.linkedField).refresh();
		$$(ids.linkedField).setValue(view.settings.linkedField);
		
		// Set the options of the possible detail views
		var detailViews = [
			{id:'', value:L('ab.component.label.noLinkedView', '*No linked view')}
		];
		detailViews = view.loopPages(view, view.application._pages, detailViews, "detail");
		$$(ids.detailsView).define("options", detailViews);
		$$(ids.detailsView).refresh();
		// console.log("populate details view dropdown");
		if (view.settings.linkedPage != "" && view.settings.linkedPageView != "") {
			$$(ids.detailsView).setValue(view.settings.linkedPage+"|"+view.settings.linkedPageView);
		}

		// Set the options of the possible edit forms
		var editForms = [
			{id:'', value:L('ab.component.label.noLinkedForm', '*No linked form')}
		];
		editForms = view.loopPages(view, view.application._pages, editForms, "form");
		view.application._pages.forEach((o)=>{
			o._views.forEach((j)=>{
				if (j.key == "form" && j.settings.object == view.settings.dataSource) {
					editForms.push({id:j.parent.id+"|"+j.id, value:j.label});				
				}
			});
		});
		$$(ids.editForm).define("options", editForms);
		$$(ids.editForm).refresh();
		if (view.settings.linkedEditPage != "" && view.settings.linkedEditPageForm != "") {
			$$(ids.editForm).setValue(view.settings.linkedEditPage+"|"+view.settings.linkedEditPageForm);
		}
	}
	
	populatePopupEditors(view) {
		if (view.settings.dataSource != "") {
			var dataSource = view.application.objects((o)=>{
				return o.id == view.settings.dataSource;
			});
			var dataCopy = _.cloneDeep(dataSource[0]);
			
			dataCopy.objectWorkspace = view.settings.objectWorkspace;
			
			PopupHideFieldComponent.objectLoad(dataCopy, view);
			PopupFilterDataTableComponent.objectLoad(dataCopy, view);
			PopupSortFieldComponent.objectLoad(dataCopy, view);
			PopupFrozenColumnsComponent.objectLoad(dataCopy, view);
		}
	}
	
	loopPages(view, o, detailViews, type) {
		console.log(typeof o);
		if (typeof o == "array" || typeof o == "object") {
			o.forEach((p)=>{
				console.log("page below");
				console.log(p);
				detailViews = view.loopPages(view, p._pages, detailViews, type);
				detailViews = view.loopViews(view, p._views, detailViews, type);
			});
		}
		detailViews = view.loopViews(view, o, detailViews);
		return detailViews;
	}
	
	loopViews(view, o, detailViews, type) {
		console.log(typeof o);
		if (typeof o == "array" || typeof o == "object") {
			o.forEach((j)=>{
				console.log("view below");
				console.log(j);
				if (j.key == type && j.settings.object == view.settings.dataSource) {
					detailViews.push({id:j.parent.id+"|"+j.id, value:j.label});				
				}
			});
			return detailViews;			
		}
		return detailViews;
	}

	// Custom functions needed for UI

	/*
	 * uiFormatting
	 * a common routine to properly update the displayed label
	 * UI with the css formatting for the given .settings
	 * @param {obj} _ui the current webix.ui definition
	 * @return {obj} a properly formatted webix.ui definition
	 */
	// uiFormatting(_ui) {
	// 
	// 	// add different css settings based upon it's format 
	// 	// type.
	// 	switch(parseInt(this.settings.format)) {
	// 
	// 		// normal
	// 		case 0: 
	// 			break;
	// 
	// 		// title
	// 		case 1: 
	// 			_ui.css = 'ab-component-header ab-ellipses-text';
	// 			break;
	// 
	// 		// description
	// 		case 2:
	// 			_ui.css = 'ab-component-description ab-ellipses-text';
	// 			break;
	// 	}
	// 
	// 	return _ui;
	// }

}