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


function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var ABViewGridPropertyComponentDefaults = {
	label:'',	// label is required and you can add more if the component needs them
	// format:0  	// 0 - normal, 1 - title, 2 - description
	dataSource:'',
	linkedObject:'',
	linkedField:'',
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
		this.settings.linkedObject = this.settings.linkedObject || ABViewGridPropertyComponentDefaults.linkedObject;
		this.settings.linkedField = this.settings.linkedField || ABViewGridPropertyComponentDefaults.linkedField;
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
			console.log(currObj);
			currObj.settings.objectWorkspace = {
				sortFields:[],
				filterConditions:[],
				frozenColumnID:"",
				hiddenFields:[]
			};
			console.log(currObj);
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
				label: L('ab.component.label.dataSource', '*Data Source:'),
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
		view.settings.dataSource  = $$(ids.dataSource).getValue();
		view.settings.linkedObject = $$(ids.linkedObject).getValue();
		view.settings.linkedField = $$(ids.linkedField).getValue();
		
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
		}
		var DataTable = new ABWorkspaceDatatable(App, idBase, true);
				
		var _init = () => {
			DataTable.init({
			});			
			var dataSource = this.application.objects((o)=>{
				return o.id == this.settings.dataSource;
			});
			
			var dataCopy = _.cloneDeep(dataSource[0]);
			dataCopy.objectWorkspace = this.settings.objectWorkspace;

			if (dataSource.length > 0) {
				DataTable.objectLoad(dataCopy);
				DataTable.refresh();
			}
		};
		
		return {
			ui: DataTable.ui,
			init: _init
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
		if (view.settings.dataSource != '') {
			$$(ids.dataSource).setValue(view.settings.dataSource);
			$$(ids.linkedObject).show();
		} else {
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
			$$(ids.linkedField).hide();
		}

		// 	Set the connected fields you can choose from in the list
		var connectedFields = [];
		var connectedFieldsOptions = {id:'', value:L('ab.component.label.selectField', '*Select a field')};
		if (view.settings.linkedObject != '') {
			connectedFields = view.application.connectedFields(view.settings.dataSource, view.settings.linkedObject);
			connectedFields.unshift(connectedFieldsOptions);			
		}

		$$(ids.linkedField).define("options", connectedFields);
		$$(ids.linkedField).refresh();
		$$(ids.linkedField).setValue(view.settings.linkedField);
	}
	
	populatePopupEditors(view) {
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