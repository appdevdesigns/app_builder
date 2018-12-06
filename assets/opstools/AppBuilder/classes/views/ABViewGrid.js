/*
 * ABViewGrid
 *
 * An ABViewGrid defines a Grid view type.
 *
 */

import ABPropertyComponent from "../ABPropertyComponent"
import ABWorkspaceDatatable from "../../components/ab_work_object_workspace_datatable"
import ABPopupHideFields from "../../components/ab_work_object_workspace_popupHideFields"
import ABPopupSortField from "../../components/ab_work_object_workspace_popupSortFields"
import ABPopupFrozenColumns from "../../components/ab_work_object_workspace_popupFrozenColumns"
import ABPopupMassUpdate from "../../components/ab_work_object_workspace_popupMassUpdate"
import ABPopupSummaryColumns from "../../components/ab_work_object_workspace_popupSummaryColumns"
import ABPopupCountColumns from "../../components/ab_work_object_workspace_popupCountColumns"
import ABPopupExport from "../../components/ab_work_object_workspace_popupExport"
import ABViewGridFilterMenu from "../rules/ABViewGridFilterMenu"
import ABViewWidget from "./ABViewWidget"
import ABFieldImage from "../dataFields/ABFieldImage"

import RowFilter from '../RowFilter'


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
	// isFilterable:0,
	isSortable:0,
	isExportable:0,
	// linkedObject:'',
	// linkedField:'',
	// linkedPage:'',
	// linkedPageView:'',
	// linkedEditPage:'',
	// linkedEditPageForm:'',
	detailsPage:'',
	detailsTab:'',
	editPage:'',
	editTab:'',
	objectWorkspace: {
		// sortFields:[], // array of columns with their sort configurations
		// filterConditions:[], // array of filters to apply to the data table
		frozenColumnID:"", // id of column you want to stop freezing
		hiddenFields:[], // array of [ids] to add hidden:true to
	},
	height: 0,
	gridFilter: {
		filterOption: 0,
		queryRules: [],
		userFilterPosition: 'toolbar'
	},
	summaryFields: [], // array of [field ids] to add the summary column in footer
	countFields: [], // array of [field ids] to add the summary column in footer
	height: 0,
	hideHeader:0,
	labelAsField:0,
	hideButtons:0,
	groupBy: '' // id of field
}


var ABViewDefaults = {
	key: 'grid',		// {string} unique key for this view
	icon: 'table',		// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.grid' // {string} the multilingual label key for the class label
}

var PopupHideFieldComponent = null;
var PopupFrozenColumnsComponent = null;
var PopupGridFilterMenu = null;
var PopupSummaryColumnsComponent = null;
var PopupCountColumnsComponent = null;

export default class ABViewGrid extends ABViewWidget  {
	
	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABViewWidget} parent the ABViewWidget this view is a child of. (can be null)
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
		
		// Convert to boolean
		this.settings.isEditable = JSON.parse(this.settings.isEditable || ABViewGridPropertyComponentDefaults.isEditable);
		this.settings.massUpdate = JSON.parse(this.settings.massUpdate || ABViewGridPropertyComponentDefaults.massUpdate);
		this.settings.allowDelete = JSON.parse(this.settings.allowDelete || ABViewGridPropertyComponentDefaults.allowDelete);
		// this.settings.isFilterable = JSON.parse(this.settings.isFilterable || ABViewGridPropertyComponentDefaults.isFilterable);
		this.settings.isSortable = JSON.parse(this.settings.isSortable || ABViewGridPropertyComponentDefaults.isSortable);
		this.settings.isExportable = JSON.parse(this.settings.isExportable || ABViewGridPropertyComponentDefaults.isExportable);
		this.settings.hideHeader = JSON.parse(this.settings.hideHeader || ABViewGridPropertyComponentDefaults.hideHeader);
		this.settings.labelAsField = JSON.parse(this.settings.labelAsField || ABViewGridPropertyComponentDefaults.labelAsField);
		this.settings.hideButtons = JSON.parse(this.settings.hideButtons || ABViewGridPropertyComponentDefaults.hideButtons);

		// this.settings.linkedObject = this.settings.linkedObject || ABViewGridPropertyComponentDefaults.linkedObject;
		// this.settings.linkedField = this.settings.linkedField || ABViewGridPropertyComponentDefaults.linkedField;
		// this.settings.linkedPage = this.settings.linkedPage || ABViewGridPropertyComponentDefaults.linkedPage;
		// this.settings.linkedPageView = this.settings.linkedPageView || ABViewGridPropertyComponentDefaults.linkedPageView;
		// this.settings.linkedEditPage = this.settings.linkedEditPage || ABViewGridPropertyComponentDefaults.linkedEditPage;
		// this.settings.linkedEditPageForm = this.settings.linkedEditPageForm || ABViewGridPropertyComponentDefaults.linkedEditPageForm;
		this.settings.detailsPage = this.settings.detailsPage || ABViewGridPropertyComponentDefaults.detailsPage;
		this.settings.editPage = this.settings.editPage || ABViewGridPropertyComponentDefaults.editPage;
		this.settings.detailsTab = this.settings.detailsTab || ABViewGridPropertyComponentDefaults.detailsTab;
		this.settings.editTab = this.settings.editTab || ABViewGridPropertyComponentDefaults.editTab;
		
		this.settings.objectWorkspace = this.settings.objectWorkspace || ABViewGridPropertyComponentDefaults.objectWorkspace;
		
		if (typeof(this.settings.objectWorkspace) != "undefined") {
			if (typeof(this.settings.objectWorkspace.sortFields) == "undefined") this.settings.objectWorkspace.sortFields = [];
			if (typeof(this.settings.objectWorkspace.filterConditions) == "undefined") this.settings.objectWorkspace.filterConditions = [];
			if (typeof(this.settings.objectWorkspace.frozenColumnID) == "undefined") this.settings.objectWorkspace.frozenColumnID = "";
			if (typeof(this.settings.objectWorkspace.hiddenFields) == "undefined") this.settings.objectWorkspace.hiddenFields = [];
			if (typeof(this.settings.objectWorkspace.summaryColumns) == "undefined") this.settings.objectWorkspace.summaryColumns = [];
			if (typeof(this.settings.objectWorkspace.countColumns) == "undefined") this.settings.objectWorkspace.countColumns = [];
		}


		if (this.settings.gridFilter == null)
			this.settings.gridFilter = {
				queryRules: []
			};

		this.settings.gridFilter.filterOption = JSON.parse(this.settings.gridFilter.filterOption || 0);

		//Convert some condition from string to integer
		(this.settings.gridFilter.queryRules || []).forEach(qr => {
			if (qr.queryRules[0] != "") {
				qr.queryRules[0].rules.forEach(rule => {
					if (/^[+-]?\d+(\.\d+)?$/.exec(rule.value)) {
						rule.value = JSON.parse(rule.value);
					}

				});
			}
		});

    	// we are not allowed to have sub views:
    	this._views = [];

    	// convert from "0" => 0
		// this.settings.format = parseInt(this.settings.format);
		this.settings.height = parseInt(this.settings.height || 0);

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

		var DataTable = this.component(App, idBase);

		return {
			ui: DataTable.ui,
			logic: DataTable.logic,
			onShow: DataTable.onShow,

			init: () => {

				// remove id of the component in caching for refresh .bind of the data collection
				let dc = this.dataCollection;
				if (dc)
					dc.removeComponent(DataTable.ui.id);

				DataTable.init();
			}
		};

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
		PopupFrozenColumnsComponent = new ABPopupFrozenColumns(App, idBase+"_freeze");

		PopupGridFilterMenu = new ABViewGridFilterMenu();
		PopupGridFilterMenu.component(App, idBase + "_gridfiltermenu");
		PopupSummaryColumnsComponent = new ABPopupSummaryColumns(App, idBase+"_summary");
		PopupCountColumnsComponent = new ABPopupCountColumns(App, idBase+"_count");
		
		_logic.newObject = () => {
			var currObj = _logic.currentEditObject();
			currObj.settings.objectWorkspace = {
				sortFields:[],
				filterConditions:[],
				frozenColumnID:"",
				hiddenFields:[],
				summaryColumns:[],
				countColumns:[]
			};
			currObj.populatePopupEditors(currObj);
			
		}
		
		// Open our popup editors when their settings button is clicked
		_logic.toolbarFieldsVisible = ($view) => {
			PopupHideFieldComponent.show($view, {pos:"top"});
		}
		
		// _logic.toolbarFilter = ($view) => {
		// 	PopupFilterDataTableComponent.show($view, null, {pos:"top"});
		// }
		
		// _logic.toolbarSort = ($view) => {
		// 	PopupSortFieldComponent.show($view, null, {pos:"top"});
		// }
		
		_logic.toolbarFrozen = ($view) => {
			PopupFrozenColumnsComponent.show($view, {pos:"top"});
		}

		_logic.gridFilterMenuShow = () => {

			var currView = _logic.currentEditObject();

			PopupGridFilterMenu.fromSettings(currView.settings.gridFilter);
			PopupGridFilterMenu.show();
	
		}

		_logic.summaryColumns = ($view) => {
			PopupSummaryColumnsComponent.show($view, {pos:"top"});
		}

		_logic.countColumns = ($view) => {
			PopupCountColumnsComponent.show($view, {pos:"top"});
		}
		
		_logic.callbackSaveWorkspace = (data) => {
			// when we make a change in the popups we want to make sure we save the new workspace to the properties to do so just fire an onChange event
			_logic.onChange();
		}

		_logic.gridFilterSave = (settings) => {

			var currView = _logic.currentEditObject();
			currView.settings.gridFilter = settings;
			// currView.settings.isFilterable = settings.filterOption == 1 ? true : false;

			// trigger a save()
			this.propertyEditorSave(ids, currView);
		}

		_logic.callbackSaveSummaryColumns = (data) => {

			var currObj = _logic.currentEditObject();
			currObj.settings.objectWorkspace.summaryColumns = data;

			// when we make a change in the popups we want to make sure we save the new workspace to the properties to do so just fire an onChange event
			_logic.onChange();
		}

		_logic.callbackSaveCountColumns = (data) => {

			var currObj = _logic.currentEditObject();
			currObj.settings.objectWorkspace.countColumns = data;

			// when we make a change in the popups we want to make sure we save the new workspace to the properties to do so just fire an onChange event
			_logic.onChange();
		}
		
		// _logic.updateDetailsView = (value) => {
		// 	if (value != "") {
		// 		var vals = value.split("|");
		// 		var page = vals[0];
		// 		var component = vals[1];
		// 		// console.log("updateDetailsView");
		// 		// console.log(value);
		// 		$$(ids.linkedPage).setValue(page);
		// 		$$(ids.linkedPageView).setValue(component);
		// 	} else {
		// 		$$(ids.linkedPage).setValue("");
		// 		$$(ids.linkedPageView).setValue("");
		// 	}
		// }
		// 
		// _logic.updateEditForm = (value) => {
		// 	if (value != "") {
		// 		var vals = value.split("|");
		// 		var page = vals[0];
		// 		var component = vals[1];
		// 		// console.log("updateEditForm");
		// 		// console.log(value);
		// 		$$(ids.linkedEditPage).setValue(page);
		// 		$$(ids.linkedEditPageForm).setValue(component);
		// 	} else {
		// 		$$(ids.linkedEditPage).setValue("");
		// 		$$(ids.linkedEditPageForm).setValue("");
		// 	}
		// }
		
		PopupHideFieldComponent.init({
			onChange:_logic.callbackSaveWorkspace		// be notified when there is a change in the hidden fields
		});
		
		// PopupFilterDataTableComponent.init({
		// 	onChange:_logic.callbackSaveWorkspace		// be notified when there is a change in the hidden fields
		// });
		
		// PopupSortFieldComponent.init({
		// 	onChange:_logic.callbackSaveWorkspace		// be notified when there is a change in the hidden fields
		// });
		
		PopupFrozenColumnsComponent.init({
			onChange:_logic.callbackSaveWorkspace		// be notified when there is a change in the hidden fields
		});


		PopupGridFilterMenu.init({
			onSave: _logic.gridFilterSave
		});
		
		PopupSummaryColumnsComponent.init({
			onChange: _logic.callbackSaveSummaryColumns	// be notified when there is a change in the summary columns
		});

		PopupCountColumnsComponent.init({
			onChange: _logic.callbackSaveCountColumns	// be notified when there is a change in the count columns
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
					type: "clean",
					paddingY: 20,
					paddingX: 10,
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
						},
						// {
						// 	view:"checkbox",
						// 	name:"isFilterable",
						// 	labelRight: L('ab.component.label.isFilterable', '*User can filter records.'),
						// 	labelWidth: App.config.labelWidthCheckbox
						// },
						{
							view:"checkbox",
							name:"isSortable",
							labelRight: L('ab.component.label.isSortable', '*User can sort records.'),
							labelWidth: App.config.labelWidthCheckbox
						},
						{
							view:"checkbox",
							name:"isExportable",
							labelRight: L('ab.component.label.isExportable', '*User can export.'),
							labelWidth: App.config.labelWidthCheckbox
						},
					]
				}
			},
			{ 
				view: "fieldset", 
				label: L('ab.component.label.dataSource', '*Grid Data:'),
				labelWidth: App.config.labelWidthLarge,
				body:{
					type: "clean",
					paddingY: 20,
					paddingX: 10,
			        rows:[
						{
							view:"select",
							name:"dataSource",
							label: L('ab.component.label.dataSource', '*Object:'),
							labelWidth: App.config.labelWidthLarge,
							on: {
								onChange: function(newv, oldv) {
									if (newv != oldv) {
										// _logic.newObject();
										// $$(ids.linkedObject).setValue("");
										// $$(ids.linkedField).setValue("");
										// $$(ids.linkedPage).setValue("");
										// $$(ids.linkedPageView).setValue("");
										// $$(ids.linkedEditPage).setValue("");
										// $$(ids.linkedEditPageForm).setValue("");
										$$(ids.detailsPage).setValue("");
										$$(ids.editPage).setValue("");

										var currDc = _logic.currentEditObject().pageRoot().dataCollections(dc => dc.id == newv)[0];
										// disallow edit data of query
										if (currDc && currDc.sourceType == "query") {

											$$(ids.isEditable).setValue(false);
											$$(ids.massUpdate).setValue(false);
											$$(ids.allowDelete).setValue(false);
											$$(ids.isEditable).disable();
											$$(ids.massUpdate).disable();
											$$(ids.allowDelete).disable();
										}
										else {
											$$(ids.isEditable).enable();
											$$(ids.massUpdate).enable();
											$$(ids.allowDelete).enable();
										}

									}
								}
							}
						},
						// {
						// 	view:"select",
						// 	name:"linkedObject",
						// 	label: L('ab.component.label.linkedObject', '*Linked To:'), 
						// 	labelWidth: App.config.labelWidthLarge,
						// 	hidden: 1,
						// 	on: {
						// 		onChange: function(newv, oldv) {
						// 			if (newv != oldv) {
						// 				$$(ids.linkedField).setValue("");
						// 			}
						// 		}
						// 	}
						// },
						// {
						// 	view:"select",
						// 	name:"linkedField",
						// 	label: L('ab.component.label.linkedField', '*Linked Field:'),
						// 	labelWidth: App.config.labelWidthLarge,
						// 	hidden: 1
						// }
			        ]
		    	}
			},
			{				
				view: "fieldset", 
				label: L('ab.component.grid.group', '*Group:'),
				labelWidth: App.config.labelWidthLarge,
				body: {
					type: "clean",
					paddingY: 20,
					paddingX: 10,
					rows:[
						{
							view:"select",
							name:"groupBy",
							label: L('ab.component.grid.groupBy', '*Group by:'),
							labelWidth: App.config.labelWidthLarge,
							options: []
						}
					]
				}
			},
			{ 
				view: "fieldset", 
				label: L('ab.component.label.linkedPages', '*Linked Pages:'),
				labelWidth: App.config.labelWidthLarge,
				body:{
					type: "clean",
					paddingY: 20,
					paddingX: 10,
			        rows:[
						{
							view:"select",
							name:"detailsPage",
							label: L('ab.component.label.detailsPage', '*Details Page:'),
							labelWidth: App.config.labelWidthLarge,
							// on: {
							// 	onChange: function(newv, oldv) {
							// 		if (newv != oldv) {
							// 			_logic.updateDetailsView(newv);
							// 		}
							// 	}
							// }
						},
						// {
						// 	view:"text",
						// 	name:"linkedPage",
						// 	height:0
						// },
						// {
						// 	view:"text",
						// 	name:"linkedPageView",
						// 	height:0
						// },
						{
							view:"select",
							name:"editPage",
							label: L('ab.component.label.editForm', '*Edit Form:'), 
							labelWidth: App.config.labelWidthLarge,
							// on: {
							// 	onChange: function(newv, oldv) {
							// 		if (newv != oldv) {
							// 			_logic.updateEditForm(newv);
							// 		}
							// 	}
							// }
						},
						// {
						// 	view:"text",
						// 	name:"linkedEditPage",
						// 	height:0
						// },
						// {
						// 	view:"text",
						// 	name:"linkedEditPageForm",
						// 	height:0
						// }
			        ]
		    	}
		    },
			{
				view: "fieldset", 
				label: L('ab.component.label.customizeDisplay', '*Customize Display:'),
				labelWidth: App.config.labelWidthLarge,
				body:{
					type: "clean",
					paddingY: 20,
					paddingX: 10,
					rows: [
						{
							cols: [
								{ 
								    view:"label", 
								    label: L("ab.component.label.hiddenFields", "*Hidden Fields:"),
									css: 'ab-text-bold',
									width: App.config.labelWidthXLarge,
								},
								{
									view: view,
									name: "buttonFieldsVisible",
									label: L("ab.component.label.settings", "*Settings"),
									icon: "fa fa-gear",
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
								    label: L("ab.component.label.filterData", "*Filter Option:"),
									css: 'ab-text-bold',
									width: App.config.labelWidthXLarge,
								},
								{
									view: view,
									id: ids.gridFilterMenuButton,
									label: L("ab.component.label.settings", "*Settings"),
									icon: "fa fa-gear",
									type: "icon",
									badge: 0,
									click: function () {
										_logic.gridFilterMenuShow(this.$view);
									}
								}
							]
						},
						// {
						// 	cols: [
						// 		{ 
						// 		    view:"label", 
						// 		    label: L("ab.component.label.sortData", "*Sort Data:"),
						// 			width: App.config.labelWidthLarge,
						// 		},
						// 		{
						// 			view: view,
						// 			label: L("ab.component.label.settings", "*Settings"),
						// 			icon: "gear",
						// 			type: "icon",
						// 			badge: 0,
						// 			click: function () {
						// 				_logic.toolbarSort(this.$view);
						// 			}
						// 		}
						// 	]
						// },
						{
							cols: [
								{ 
								    view:"label", 
								    label: L("ab.component.label.freezeColumns", "*Freeze Columns:"),
									css: 'ab-text-bold',
									width: App.config.labelWidthXLarge,
								},
								{
									view: view,
									name: "buttonFieldsFreeze",
									label: L("ab.component.label.settings", "*Settings"),
									icon: "fa fa-gear",
									type: "icon",
									badge: 0,
									click: function(){
										_logic.toolbarFrozen(this.$view);
									}
								}
							]
						},

						{
							cols: [
								{ 
								    view:"label", 
								    label: L("ab.component.label.summaryFields", "*Summary Fields:"),
									css: 'ab-text-bold',
									width: App.config.labelWidthXLarge,
								},
								{
									view: view,
									name: "buttonSummaryFields",
									label: L("ab.component.label.settings", "*Settings"),
									icon: "fa fa-gear",
									type: "icon",
									badge: 0,
									click: function(){
										_logic.summaryColumns(this.$view);
									}
								}
							]
						},

						{
							cols: [
								{ 
								    view:"label", 
								    label: L("ab.component.label.summaryFields", "*Count Fields:"),
									css: 'ab-text-bold',
									width: App.config.labelWidthXLarge,
								},
								{
									view: view,
									name: "buttonCountFields",
									label: L("ab.component.label.settings", "*Settings"),
									icon: "fa fa-gear",
									type: "icon",
									badge: 0,
									click: function(){
										_logic.countColumns(this.$view);
									}
								}
							]
						},

						{
							view: 'counter',
							name: "height",
							label: L("ab.component.grid.height", "*Height:"),
							labelWidth: App.config.labelWidthXLarge,
						},
						
						{
							view:"checkbox",
							name:"hideHeader",
							labelRight: L('ab.component.label.hideHeader', '*Hide table header'),
							labelWidth: App.config.labelWidthCheckbox
						},

						{
							view:"checkbox",
							name:"labelAsField",
							labelRight: L('ab.component.label.labelAsField', '*Show a field using label template'),
							labelWidth: App.config.labelWidthCheckbox
						},

						{
							view:"checkbox",
							name:"hideButtons",
							labelRight: L('ab.component.label.hideButtons', '*Hide edit and view buttons'),
							labelWidth: App.config.labelWidthCheckbox
						},

					]
				}
			},
			{}
		]);

	}


	static propertyEditorPopulate(App, ids, view) {

		super.propertyEditorPopulate(App, ids, view);
		
		this.view = view;

		$$(ids.dataSource).setValue(view.settings.dataSource);
		$$(ids.isEditable).setValue(view.settings.isEditable);
		$$(ids.massUpdate).setValue(view.settings.massUpdate);
		$$(ids.allowDelete).setValue(view.settings.allowDelete);
		// $$(ids.isFilterable).setValue(view.settings.isFilterable);
		$$(ids.isSortable).setValue(view.settings.isSortable);
		$$(ids.isExportable).setValue(view.settings.isExportable);
		// $$(ids.linkedObject).setValue(view.settings.linkedObject);
		// $$(ids.linkedField).setValue(view.settings.linkedField);
		// $$(ids.linkedPage).setValue(view.settings.linkedPage);
		// $$(ids.linkedPageView).setValue(view.settings.linkedPageView);
		// $$(ids.linkedEditPage).setValue(view.settings.linkedEditPage);
		// $$(ids.linkedEditPageForm).setValue(view.settings.linkedEditPageForm);
		var details = view.settings.detailsPage;
		if (view.settings.detailsTab != "") {
			details += ":"+view.settings.detailsTab;
		}
		$$(ids.detailsPage).setValue(details);
		var edit = view.settings.editPage;
		if (view.settings.editTab != "") {
			edit += ":"+view.settings.editTab;
		}
		$$(ids.editPage).setValue(edit);
		$$(ids.height).setValue(view.settings.height);
		$$(ids.hideHeader).setValue(view.settings.hideHeader);
		$$(ids.labelAsField).setValue(view.settings.labelAsField);
		$$(ids.hideButtons).setValue(view.settings.hideButtons);
		$$(ids.groupBy).setValue(view.settings.groupBy);

		// initial populate of properties and popups
		view.populateEditor(ids, view);
		view.populatePopupEditors(view);
		view.populateBadgeNumber(ids, view);

		// when a change is made in the properties the popups need to reflect the change
		this.updateEventIds = this.updateEventIds || {}; // { viewId: boolean, ..., viewIdn: boolean }
		if (!this.updateEventIds[view.id]) {
			this.updateEventIds[view.id] = true;

			view.addListener('properties.updated', function() {
				view.populateEditor(ids, view);
				view.populatePopupEditors(view);
				view.populateBadgeNumber(ids, view);
			}, this);
		}
		
		//Load Datacollection to QueryBuilder
		this.propertyUpdateGridFilterObject(ids, view);

	}
	
	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		// Retrive the values of your properties from Webix and store them in the view
		view.settings.dataSource = $$(ids.dataSource).getValue();
		view.settings.isEditable = $$(ids.isEditable).getValue();
		view.settings.massUpdate = $$(ids.massUpdate).getValue();
		view.settings.allowDelete = $$(ids.allowDelete).getValue();
		// view.settings.isFilterable = $$(ids.isFilterable).getValue();
		view.settings.isSortable = $$(ids.isSortable).getValue();
		view.settings.isExportable = $$(ids.isExportable).getValue();
		// view.settings.linkedObject = $$(ids.linkedObject).getValue();
		// view.settings.linkedField = $$(ids.linkedField).getValue();
		// view.settings.linkedPage = $$(ids.linkedPage).getValue();
		// view.settings.linkedPageView = $$(ids.linkedPageView).getValue();
		// view.settings.linkedEditPage = $$(ids.linkedEditPage).getValue();
		// view.settings.linkedEditPageForm = $$(ids.linkedEditPageForm).getValue();
		
		var detailsPage = $$(ids.detailsPage).getValue();
		var detailsTab = "";
		if (detailsPage.split(":").length > 1) {
			var detailsVals = detailsPage.split(":");
			detailsPage = detailsVals[0];
			detailsTab = detailsVals[1];
		} 
		view.settings.detailsPage = detailsPage;
		view.settings.detailsTab = detailsTab;
		
		var editPage = $$(ids.editPage).getValue();
		var editTab = "";
		if (editPage.split(":").length > 1) {
			var editVals = editPage.split(":");
			editPage = editVals[0];
			editTab = editVals[1];
		} 
		view.settings.editPage = editPage;
		view.settings.editTab = editTab;
		
		view.settings.height = $$(ids.height).getValue();
		view.settings.hideHeader = $$(ids.hideHeader).getValue();
		view.settings.labelAsField = $$(ids.labelAsField).getValue();
		view.settings.hideButtons = $$(ids.hideButtons).getValue();
		view.settings.groupBy = $$(ids.groupBy).getValue();

	}

	static propertyUpdateGridFilterObject(ids, view) {
		
		if (!view) return;

		// Populate values to QueryBuilder
		var selectedDc = view.dataCollection;

		if (selectedDc) {
			// if (view.settings.gridFilter.filterOption == 2) {
			// 	//Force to LoadAll
			// 	selectedDc.settings.loadAll = true;
			// }

			var dataCopy = selectedDc.datasource.clone();
			dataCopy.objectWorkspace = view.settings.objectWorkspace;
			dataCopy.isLoadAll = selectedDc.settings.loadAll;

			PopupGridFilterMenu.objectLoad(dataCopy);
		}
	}
	/*
	 * @component()
	 * return a UI component based upon this view.
	 * @param {obj} App 
	 * @return {obj} UI component
	 */
	component(App, objId) {

		let baseCom = super.component(App);

		var idBase = objId || 'ABViewGrid_'+this.id;
		var ids = {
			component: App.unique(idBase+'_component'),
			toolbar: App.unique(idBase+'_toolbar'),
			buttonDeleteSelected: App.unique(idBase+'_deleteSelected'),
			// buttonExport: App.unique('buttonExport'),
			buttonFilter: App.unique(idBase+'_buttonFilter'),
			buttonMassUpdate: App.unique(idBase+'_buttonMassUpdate'),
			buttonSort: App.unique(idBase+'_buttonSort'),
			buttonExport: App.unique(idBase+'_buttonExport'),

			filterMenutoolbar: App.unique(idBase+'_filterMenuToolbar'),
			resetFilterButton: App.unique(idBase+'_resetFilterButton')

		}
		
		var labels = {
			common: App.labels
		};
		
		var CurrentObject = null;
		
		// var linkedPage = null;
		// if (this.settings.linkedPage != "undefined" && this.settings.linkedPage != "" && this.settings.linkedPageView != "undefined" && this.settings.linkedPageView != "") {
		// 	linkedPage = this.settings.linkedPage+"|"+this.settings.linkedPageView;
		// }
		// 
		// var linkedEditPage = null;
		// if (this.settings.linkedEditPage != "undefined" && this.settings.linkedEditPage != "" && this.settings.linkedEditPageForm != "undefined" && this.settings.linkedEditPageForm != "") {
		// 	linkedEditPage = this.settings.linkedEditPage+"|"+this.settings.linkedEditPageForm;
		// }
		
		// there must be a better way...
		// if (this.settings.allowDelete == "1") {
		// 	this.settings.allowDelete = true;
		// } else {
		// 	this.settings.allowDelete = false;
		// }
		// if (this.settings.isEditable == "1") {
		// 	this.settings.isEditable = true;
		// } else {
		// 	this.settings.isEditable = false;
		// }
		// if (this.settings.massUpdate == "1") {
		// 	this.settings.massUpdate = true;
		// } else {
		// 	this.settings.massUpdate = false;
		// }
		var settings = {
			allowDelete: this.settings.allowDelete,
			detailsView: this.settings.detailsPage,
			editView: this.settings.editPage,
			isEditable: this.settings.isEditable,
			massUpdate: this.settings.massUpdate,
			configureHeaders: false,
			summaryColumns: this.settings.objectWorkspace.summaryColumns,
			countColumns: this.settings.objectWorkspace.countColumns,
			hideHeader: this.settings.hideHeader,
			labelAsField: this.settings.labelAsField,
			hideButtons: this.settings.hideButtons,
			groupBy: this.settings.groupBy
		}
		
		var isFiltered = false,
			waitMilliseconds = 50,
			filterTimeoutId;

		let DataTable = new ABWorkspaceDatatable(App, idBase, settings);
		let PopupMassUpdateComponent = new ABPopupMassUpdate(App, idBase+"_mass");
		let PopupSortDataTableComponent = new ABPopupSortField(App, idBase+"_sort");
		let rowFilter = new RowFilter(App, idBase+"_filter");
		let rowFilterForm = new RowFilter(App, idBase+"_filter_form");
		let exportPopup = new ABPopupExport(App, idBase+"_export");
		let filter_popup = webix.ui({
			view: "popup",
			width: 800,
			hidden: true,
			body: rowFilter.ui
		});


		let _init = () => {

			if (this.settings.dataSource != "") {
				DataTable.init({
					onCheckboxChecked: _logic.callbackCheckboxChecked
				});

				PopupMassUpdateComponent.init({
					// onSave:_logic.callbackAddFields			// be notified of something...who knows...
				});

				PopupSortDataTableComponent.init({
					onChange: _logic.callbackSortData
				});

				rowFilter.init({
					onChange: () => {
						_logic.callbackFilterData(rowFilter);	// be notified when there is a change in the filter
					}
				});

				rowFilterForm.init({
					onChange: () => {
						_logic.callbackFilterData(rowFilterForm);	// be notified when there is a change in the filter
					}
				});

				exportPopup.init({});
				
				if (this.settings.massUpdate ||
					this.settings.isSortable ||
					this.settings.isExportable ||
					(this.settings.gridFilter.filterOption && 
					this.settings.gridFilter.userFilterPosition == "toolbar")) {
					$$(ids.toolbar).show();
				}
				
				if (this.settings.massUpdate == false) {
					$$(ids.buttonMassUpdate).hide();
					$$(ids.buttonDeleteSelected).hide();
				}

				if (this.settings.allowDelete == false) {
					$$(ids.buttonDeleteSelected).hide();
				}
				
				if (this.settings.gridFilter.filterOption != 1 || 
					this.settings.gridFilter.userFilterPosition != "toolbar") {
					$$(ids.buttonFilter).hide();
				}
				
				if (this.settings.gridFilter.filterOption == 1 && 
					this.settings.gridFilter.userFilterPosition == "form") {
					$$(rowFilterForm.ui.id).show();
				}
				else {
					$$(rowFilterForm.ui.id).hide();
				}
				
				if (this.settings.isSortable == false) {
					$$(ids.buttonSort).hide();
				}

				if (this.settings.isExportable == false) {
					$$(ids.buttonExport).hide();
				}
				
				if (this.settings.hideHeader == true) {
					DataTable.hideHeader();
				}

				if (this.settings.gridFilter.filterOption == 2) {
					$$(ids.filterMenutoolbar).show();
				}
				// var dataSource = this.application.objects((o)=>{
				// 	return o.id == this.settings.dataSource;
				// });
				var dc = this.dataCollection;

				if (dc && dc.datasource) {

					var dataCopy = dc.datasource.clone();
					dataCopy.objectWorkspace = this.settings.objectWorkspace;
					CurrentObject = dataCopy;

					DataTable.objectLoad(CurrentObject);
					PopupMassUpdateComponent.objectLoad(CurrentObject, DataTable);
					PopupSortDataTableComponent.objectLoad(CurrentObject, this);
					rowFilter.viewLoad(this);
					rowFilter.objectLoad(CurrentObject);
					rowFilterForm.viewLoad(this);
					rowFilterForm.objectLoad(CurrentObject);
					exportPopup.objectLoad(CurrentObject);
					exportPopup.setGridComponent($$(DataTable.ui.id));
					exportPopup.setHiddenFields(dataCopy.objectWorkspace.hiddenFields);
					exportPopup.setFilename(this.label);
					DataTable.refreshHeader();

					dc.bind($$(DataTable.ui.id));

					var editPage = this.settings.editPage;
					var detailsPage = this.settings.detailsPage;
					var editTab = this.settings.editTab;
					var detailsTab = this.settings.detailsTab;
					var isEditable = this.settings.isEditable;
					
					// we need to recursivly look backwards to toggle tabs into view when a user choosed to select a tab for edit or details views
					function toggleTab(parentTab, wb) {
						
						// find the tab
						var tab = wb.getTopParentView().queryView({id:parentTab});
						// if we didn't pass and id we may have passed a domNode
						if (tab == null) {
							tab = $$(parentTab);
						}

						if (tab == null) return;
						
						// set the tabbar to to the tab
						var tabbar = tab.getParentView().getParentView();
						
						if (tabbar == null) return;
						
						if (tabbar.setValue) { // if we have reached the top we won't have a tab
							tabbar.setValue(parentTab);
						}
						
						// find if it is in a multiview of a tab
						var nextTab = tabbar.queryView({view:"scrollview"}, "parent");
						// if so then do this again
						if (nextTab) {
							toggleTab(nextTab, wb);
						}
					}
					
					$$(DataTable.ui.id).attachEvent("onItemClick", function (id, e, node) {
						var item = id;

						if (e.target.className.indexOf('eye') > -1) {
							_logic.changePage(dc, item, detailsPage);
							toggleTab(detailsTab, this);
						} else if (e.target.className.indexOf('pencil') > -1) {
							_logic.changePage(dc, item, editPage);
							toggleTab(editTab, this);
						} else if (e.target.className.indexOf('trash') > -1) {
							// don't do anything for delete it is handled elsewhere
						} else if ( !isEditable && detailsPage.length ) {
							_logic.changePage(dc, item, detailsPage);
							toggleTab(detailsTab, this);
						} else if ( !isEditable && !detailsPage.length && editPage.length) {
							_logic.changePage(dc, item, editPage);
							toggleTab(editTab, this);
						}
						
					});

					// $$(DataTable.ui.id).attachEvent('onBeforeRender', function (data) {
					// 	_logic.clientSideDataFilter();
					// });

					$$(DataTable.ui.id).adjust();
				}
				
				
			}	
			
		};

		// specify height of the grid
		if (this.settings.height)
			DataTable.ui.height = this.settings.height;

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
				padding: 17,
				rows: [
					rowFilterForm.ui,
					{
						view: 'toolbar',
						id: ids.toolbar,
						hidden: true,
						css: "ab-data-toolbar",
						cols: [
							{
								view: "button",
								id: ids.buttonMassUpdate,
								label: L("ab.component.label.massUpdate", "*Edit fields"),
								icon: "fa fa-pencil-square-o",
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
								icon: "fa fa-trash",
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
								icon: "fa fa-filter",
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
								icon: "fa fa-sort",
								type: "icon",
								badge: 0,
								autowidth: true,
								click: function () {
									_logic.toolbarSort(this.$view);
								}
							},
							{
								view: "button",
								id: ids.buttonExport,
								label: L("ab.component.label.export", "*Export"),
								icon: "fa fa-print",
								type: "icon",
								badge: 0,
								autowidth: true,
								click: function () {
									_logic.toolbarExport(this.$view);
								}
							},
							/*
							{
								view: view,
								id: ids.buttonExport,
								label: labels.component.export,
								icon: "fa fa-download",
								type: "icon",
								click: function() {
									_logic.toolbarButtonExport(this.$view);
								}
							}
							*/
						]
					},
					{
						view: 'toolbar',
						id: ids.filterMenutoolbar,
						css: "ab-data-toolbar",
						hidden: true,
						cols: [
							{
								view: "button",
								id: ids.resetFilterButton,
								label: L("ab.component.label.resetFilter", "*Reset Filter"),
								icon: "fa fa-ban",
								type: "icon",
								badge: 0,
								autowidth: true,
								click: function() {
									_logic.resetFilterMenu();
								}
							}
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
			
			callbackSortData: () => {

				var sortRules = (this.settings.objectWorkspace.sortFields || []);

				$$(ids.buttonSort).define('badge', sortRules.length);
				$$(ids.buttonSort).refresh();

				// client sort data
				$$(DataTable.ui.id).sort(PopupSortDataTableComponent.sort);

			},

			callbackFilterData: (row_filter) => {

				var filterRules = (row_filter.getValue().rules || []);

				if ($$(ids.buttonFilter)) {
					$$(ids.buttonFilter).define('badge', filterRules.length);
					$$(ids.buttonFilter).refresh();
				}

				// client filter data
				$$(DataTable.ui.id).filter(function(rowData) {

					return row_filter.isValid(rowData);

				});

			},

			changePage: (dc, id, page) => {
				dc.setCursor(id);
				super.changePage(page);
			},
			
			selectRow: (rowData) => {

				if (!$$(DataTable.ui.id)) return;

				if (rowData && rowData.id)
					$$(DataTable.ui.id).select(rowData.id, false);
				else
					$$(DataTable.ui.id).select(null, false);
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
				filter_popup.show($view);
			},

			toolbarSort: ($view) => {
				PopupSortDataTableComponent.show($view);
			},

			toolbarExport: ($view) => {
				exportPopup.show($view);
			},

			toolbarMassUpdate: function ($view) {
				PopupMassUpdateComponent.show($view);
			},
		
			resetFilterMenu: () => {
				$$(DataTable.ui.id).filter();
			},

			applyFilterMenuToDataTable: (queryRules) => {

				var id = "hiddenQB_"+webix.uid();

				var ui = {
					id:id,
					hidden:true,
					view:'querybuilder'
				}
				var hiddenQB = webix.ui(ui);
		
				hiddenQB.setValue(queryRules);
		
				var QBHelper = hiddenQB.getFilterHelper();
		
				hiddenQB.destructor();	// remove the QB 

				$$(DataTable.ui.id).filter(QBHelper);
			}

		}


		var _onShow = () => {

			baseCom.onShow();

			if ($$(DataTable.ui.id)) {
				$$(DataTable.ui.id).adjust();
			}


			if (this.settings.gridFilter.filterOption == 2) {
				if (this.settings.gridFilter.queryRules.length > 0) {
					this.settings.gridFilter.queryRules.forEach(qr => {
						var filterRuleButton = {
							view: "button",
							label: qr.ruleName,
							icon: "fa fa-filter",
							type: "icon",
							badge: 0,
							autowidth: true,
							click: function() {
								_logic.applyFilterMenuToDataTable(qr.queryRules);
							}
						};
						$$(ids.filterMenutoolbar).addView(filterRuleButton);
					});
				}
			}
			
			var dc = this.dataCollection;
			if (dc) {

				this.eventAdd({
					emitter: dc,
					eventName: 'changeCursor',
					listener: _logic.selectRow
				});

			}
			
		};


		return {
			ui: tableUI,
			init: _init,
			logic: _logic,

			onShow: _onShow
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
		var defaultOption = {id:'', value:L('ab.component.label.selectObject', '*Select an object')};
		// view.application._objects.forEach((o)=>{
		// 	objects.push({id:o.id, value:o.label});
		// });
		// Pull data collections to options
		var objectOptions = view.pageRoot().dataCollections().map((dc) => {
			return {
				id: dc.id,
				value: dc.label
			};
		});
		objectOptions.unshift(defaultOption);
		$$(ids.dataSource).define("options", objectOptions);
		$$(ids.dataSource).refresh();
		// console.log("getting data source");
		// console.log($$(ids.dataSource).getValue());
		// console.log(view.settings.dataSource);
		if (view.settings.dataSource != '') {
			$$(ids.dataSource).setValue(view.settings.dataSource);
			// $$(ids.linkedObject).show();
		} else {
			$$(ids.dataSource).setValue('');
			// $$(ids.linkedObject).hide();
		}

		// Grouping options
		let groupFields = [
			{ id: '', value: L('ab.component.grid.noGroupBy', '*No group field') }
		];
		var dc = this.dataCollection;
		if (dc && dc.datasource) {
			dc.datasource.fields(f => {
				return f.key != 'connectObject' && view.settings.objectWorkspace.hiddenFields.indexOf(f.columnName) < 0;
			}).forEach(f => {
				groupFields.push({
					id: f.columnName,
					value: f.label
				});
			});
		}
		$$(ids.groupBy).define("options", groupFields);
		$$(ids.groupBy).refresh();

		// Set the connected objects you can choose from in the list
		// var linkedObjects = [];
		// var linkedObjectsOptions = {id:'', value:L('ab.component.label.noLinkedObject', '*No linked object')};
		// linkedObjects = view.application.connectedObjects(view.settings.dataSource);
		// linkedObjects.unshift(linkedObjectsOptions);
		// 
		// $$(ids.linkedObject)
		// $$(ids.linkedObject).define("options", linkedObjects);
		// $$(ids.linkedObject).refresh();
		// if (view.settings.linkedObject != '') {
		// 	$$(ids.linkedObject).setValue(view.settings.linkedObject);
		// 	$$(ids.linkedField).show();
		// } else {
		// 	$$(ids.linkedObject).setValue('');
		// 	$$(ids.linkedField).hide();
		// }

		// 	Set the connected fields you can choose from in the list
		// var connectedFields = [];
		// // var connectedFieldsOptions = {id:'', value:L('ab.component.label.selectField', '*Select a field')};
		// if (view.settings.linkedObject != '') {
		// 	connectedFields = view.application.connectedFields(view.settings.dataSource, view.settings.linkedObject);
		// 	// connectedFields.unshift(connectedFieldsOptions);			
		// }
		// 
		// $$(ids.linkedField).define("options", connectedFields);
		// $$(ids.linkedField).refresh();
		// $$(ids.linkedField).setValue(view.settings.linkedField);
		
		// Set the options of the possible detail views
		var detailViews = [
			{ id:'', value:L('ab.component.label.noLinkedView', '*No linked view') }
		];

		detailViews = view.loopPages(view, view.application._pages, detailViews, "detail");
		$$(ids.detailsPage).define("options", detailViews);
		$$(ids.detailsPage).refresh();
		// console.log("populate details view dropdown");
		// if (view.settings.linkedPage != "" && view.settings.linkedPageView != "") {
		// 	$$(ids.detailsPage).setValue(view.settings.linkedPage+"|"+view.settings.linkedPageView);
		// }

		// Set the options of the possible edit forms
		var editForms = [
			{id:'', value:L('ab.component.label.noLinkedForm', '*No linked form')}
		];
		editForms = view.loopPages(view, view.application._pages, editForms, "form");
		view.application._pages.forEach((o)=>{
			o._views.forEach((j)=>{
				if (j.key == "form" && j.settings.object == view.settings.dataSource) {
					editForms.push({id:j.parent.id, value:j.label});				
				}
				if (j.key == "tab") {
					j._views.forEach((k)=>{
						k._views.forEach((l)=>{	
							if (l.key == "form" && l.settings.datacollection == view.settings.dataSource) {
								editForms.push({id:l.parent.id, value:l.label});				
							}
						});
					});
				}
			});
		});
		$$(ids.editPage).define("options", editForms);
		$$(ids.editPage).refresh();
		// if (view.settings.linkedEditPage != "" && view.settings.linkedEditPageForm != "") {
		// 	$$(ids.editForm).setValue(view.settings.linkedEditPage+"|"+view.settings.linkedEditPageForm);
		// }
	}
	
	populatePopupEditors(view, dataSource) {
		var dc = this.dataCollection;

		if (!dc || !dc.datasource) return;
		// if (view.settings.gridFilter.filterOption == 2) {
		// 	//Force to LoadAll
		// 	dc.settings.loadAll = true;
		// }

		var dataCopy = dc.datasource.clone();
		dataCopy.objectWorkspace = view.settings.objectWorkspace;
		dataCopy.isLoadAll = dc.settings.loadAll;

		// if (view.settings.dataSource != "") {
			// var dataSource = view.application.objects((o)=>{
			// 	return o.id == view.settings.dataSource;
			// });
			// var dataSource = this.dataCollection;
			// var dataCopy = dataSource.datasource.clone();
			// console.log(view);
			// dataCopy.objectWorkspace = view.settings.objectWorkspace;
			PopupHideFieldComponent.objectLoad(dataCopy, view);
			// PopupFilterDataTableComponent.objectLoad(dataCopy, view);
			// PopupSortFieldComponent.objectLoad(dataCopy, view);
			PopupFrozenColumnsComponent.objectLoad(dataCopy, view);
			PopupGridFilterMenu.objectLoad(dataCopy);

			PopupSummaryColumnsComponent.objectLoad(dataCopy, view);
			PopupSummaryColumnsComponent.setValue(view.settings.objectWorkspace.summaryColumns);

			PopupCountColumnsComponent.objectLoad(dataCopy, view);
			PopupCountColumnsComponent.setValue(view.settings.objectWorkspace.countColumns);
		// }
	}

	populateBadgeNumber(ids, view) {

		// set badge numbers to setting buttons
		if (view.settings.objectWorkspace && 
			view.settings.objectWorkspace.hiddenFields) {
			$$(ids.buttonFieldsVisible).define('badge', view.settings.objectWorkspace.hiddenFields.length);
			$$(ids.buttonFieldsVisible).refresh();
		}
		else {
			$$(ids.buttonFieldsVisible).define('badge', 0);
			$$(ids.buttonFieldsVisible).refresh();
		}


		if (view.settings.objectWorkspace &&
			view.settings.objectWorkspace.frozenColumnID) {
			$$(ids.buttonFieldsFreeze).define('badge', "Y");
			$$(ids.buttonFieldsFreeze).refresh();
		}
		else {
			$$(ids.buttonFieldsFreeze).define('badge', 0);
			$$(ids.buttonFieldsFreeze).refresh();
		}


		if (view.settings.objectWorkspace &&
			view.settings.objectWorkspace.summaryColumns) {
			$$(ids.buttonSummaryFields).define('badge', view.settings.objectWorkspace.summaryColumns.length);
			$$(ids.buttonSummaryFields).refresh();
		}
		else {
			$$(ids.buttonSummaryFields).define('badge', 0);
			$$(ids.buttonSummaryFields).refresh();
		}


		if (view.settings.objectWorkspace &&
			view.settings.objectWorkspace.countColumns) {
			$$(ids.buttonCountFields).define('badge', view.settings.objectWorkspace.countColumns.length);
			$$(ids.buttonCountFields).refresh();
		}
		else {
			$$(ids.buttonCountFields).define('badge', 0);
			$$(ids.buttonCountFields).refresh();
		}

	}
	
	loopPages(view, pages, detailViews, type) {
		if (typeof pages == "array" || typeof pages == "object") {
			pages.forEach((p)=>{
				if (p._pages.length > 0) {
					detailViews = view.loopPages(view, p._pages, detailViews, type);
				}
				detailViews = view.loopViews(view, p._views, detailViews, type);
			});
		}
		detailViews = view.loopViews(view, pages, detailViews);
		return detailViews;
	}
	
	loopViews(view, views, detailViews, type) {
		if (typeof views == "array" || typeof views == "object") {
			views.forEach((v)=>{
				if (v.key == type && v.settings.datacollection == view.settings.dataSource) {
					detailViews.push({id:v.pageParent().id, value:v.label});
				}
				// find views inside layouts
				else if (v.key == "layout" || v.key == "viewcontainer") {
					detailViews = view.loopViews(view, v._views, detailViews, type);
				}
				// find views inside Tab component
				else if (v.key == "tab") {
					var tabViews = v.views();
					tabViews.forEach(tab => {
						
						var viewContainer = tab.views(subT => subT.key == "tab");
						viewContainer.forEach(vc => {

							vc.views().forEach((st)=>{
								// detailViews = view.loopViews(view, st._views, detailViews, type);							
								var subViews = st.views(subV => subV.key == type && subV.settings.datacollection == view.settings.dataSource);
								subViews.forEach( (sub)=>{
									detailViews.push({id:v.pageParent().id + ":" + st.id, value:st.label + ":" + sub.label});								
								});
							});

						});

						var subViews = tab.views(subV => subV.key == type && subV.settings.datacollection == view.settings.dataSource);
						subViews.forEach( (sub)=>{
							detailViews.push({id:v.pageParent().id + ":" + tab.id, value:tab.label + ":" + sub.label});								
						});

					});

				}
			});
			return detailViews;
		}
		return detailViews;
	}
	
	/**
	 * @property dataCollection
	 * return ABViewDataCollection of this form
	 * 
	 * @return {ABViewDataCollection}
	 */
	get dataCollection() {
		return this.pageRoot().dataCollections((dc) => dc.id == this.settings.dataSource)[0];
	}
	
	removeField(field, cb) {
		
		var shouldSave = false;

		// check to see if there is a frozenColumnID and if it matches the deleted field
		if (this.settings.objectWorkspace.frozenColumnID && this.settings.objectWorkspace.frozenColumnID == field.columnName) {
			// remove the column name from the frozen column id
			this.settings.objectWorkspace.frozenColumnID = "";
			// flag the object to be saved later
			shouldSave = true;
		}
		
		// check to see if there are hidden fields
		if (this.settings.objectWorkspace.hiddenFields && this.settings.objectWorkspace.hiddenFields.length) {
			// find if the deleted field is in the array
			var index = this.settings.objectWorkspace.hiddenFields.indexOf(field.columnName);
			// if so splice it out of the array
			if (index > -1) {
				this.settings.objectWorkspace.hiddenFields.splice(index, 1);
				// flag the object to be saved later
				shouldSave = true;
			}
		}
		
		// if settings were changed call the callback
	
		cb(null, shouldSave);
		
		
	}


	//// Report ////

	/**
	 * @method print
	 * 
	 * 
	 * @return {Object} - PDF object definition
	 */
	print() {

		return new Promise((resolve, reject) => {

			var reportDef = {};

			var dc = this.dataCollection;
			if (!dc) return resolve(reportDef);
	
			var object = dc.datasource;
			if (!object) return resolve(reportDef);
	
			reportDef = {
				table: {
					headerRows: 1,
					widths: [],
					body: [
						[] // header
					]
				}
			};
	
			// Hidden fields
			var hiddenFieldNames = [];
			if (this.settings && 
				this.settings.objectWorkspace &&
				this.settings.objectWorkspace.hiddenFields)
				hiddenFieldNames = this.settings.objectWorkspace.hiddenFields || [];
	
	
			var rowData = dc.getData();
			var tasks = [];


			object.fields(f => hiddenFieldNames.indexOf(f.columnName) < 0).forEach((f, indexField) => {
		
				// Headers
				reportDef.table.widths[indexField] = 'auto'; // TODO ; width
				reportDef.table.body[0][indexField] = f.label;
	
				// Data
				rowData.forEach((d, rowIndex) => {
	
					rowIndex = rowIndex + 1;
	
					if (reportDef.table.body[rowIndex] == null) 
						reportDef.table.body[rowIndex] = [];
	
	
					// pull image data
					if (f instanceof ABFieldImage) {

						// add load image async
						tasks.push(new Promise((next, err) => {

							f.toBase64(d).then(imageData => {

								if (imageData && imageData.data) {
									reportDef.table.body[rowIndex][indexField] = {
										image: imageData.data,
										width: parseInt(f.settings.imageWidth || imageData.width),
										height: parseInt(f.settings.imageHeight || imageData.height)
									};
								}
								else {
									reportDef.table.body[rowIndex][indexField] = {};
								}

								next();
	
							}).catch(err);

						}));
					}
					// pull normal data
					else
						reportDef.table.body[rowIndex][indexField] = f.format(d);
	
				});
	
			});

			// wait until load all images
			Promise.all(tasks)
				.then(() => {

					resolve(reportDef);

				})
				.catch(reject);
	

		});

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
