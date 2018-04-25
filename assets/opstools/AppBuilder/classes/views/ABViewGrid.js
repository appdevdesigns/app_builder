/*
 * ABViewGrid
 *
 * An ABViewGrid defines a Grid view type.
 *
 */

import ABViewWidget from "./ABViewWidget"
import ABPropertyComponent from "../ABPropertyComponent"
import ABWorkspaceDatatable from "../../components/ab_work_object_workspace_datatable"
import ABPopupHideFields from "../../components/ab_work_object_workspace_popupHideFields"
import ABPopupSortField from "../../components/ab_work_object_workspace_popupSortFields"
import ABPopupFrozenColumns from "../../components/ab_work_object_workspace_popupFrozenColumns"
import ABPopupMassUpdate from "../../components/ab_work_object_workspace_popupMassUpdate"
import ABPopupSummaryColumns from "../../components/ab_work_object_workspace_popupSummaryColumns"
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
	isFilterable:0,
	isSortable:0,
	// linkedObject:'',
	// linkedField:'',
	// linkedPage:'',
	// linkedPageView:'',
	// linkedEditPage:'',
	// linkedEditPageForm:'',
	detailsPage:'',
	editPage:'',
	objectWorkspace: {
		// sortFields:[], // array of columns with their sort configurations
		// filterConditions:[], // array of filters to apply to the data table
		frozenColumnID:"", // id of column you want to stop freezing
		hiddenFields:[], // array of [ids] to add hidden:true to
	},
	summaryFields: [], // array of [field ids] to add the summary column in footer
	height: 0
}


var ABViewDefaults = {
	key: 'grid',		// {string} unique key for this view
	icon: 'table',		// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.grid' // {string} the multilingual label key for the class label
}

var PopupHideFieldComponent = null;
var PopupFrozenColumnsComponent = null;
var PopupSummaryColumnsComponent = null;

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
		this.settings.isFilterable = JSON.parse(this.settings.isFilterable || ABViewGridPropertyComponentDefaults.isFilterable);
		this.settings.isSortable = JSON.parse(this.settings.isSortable || ABViewGridPropertyComponentDefaults.isSortable);

		// this.settings.linkedObject = this.settings.linkedObject || ABViewGridPropertyComponentDefaults.linkedObject;
		// this.settings.linkedField = this.settings.linkedField || ABViewGridPropertyComponentDefaults.linkedField;
		// this.settings.linkedPage = this.settings.linkedPage || ABViewGridPropertyComponentDefaults.linkedPage;
		// this.settings.linkedPageView = this.settings.linkedPageView || ABViewGridPropertyComponentDefaults.linkedPageView;
		// this.settings.linkedEditPage = this.settings.linkedEditPage || ABViewGridPropertyComponentDefaults.linkedEditPage;
		// this.settings.linkedEditPageForm = this.settings.linkedEditPageForm || ABViewGridPropertyComponentDefaults.linkedEditPageForm;
		this.settings.detailsPage = this.settings.detailsPage || ABViewGridPropertyComponentDefaults.detailsPage;
		this.settings.editPage = this.settings.editPage || ABViewGridPropertyComponentDefaults.editPage;
		
		this.settings.objectWorkspace = this.settings.objectWorkspace || ABViewGridPropertyComponentDefaults.objectWorkspace;
		
		if (typeof(this.settings.objectWorkspace) != "undefined") {
			if (typeof(this.settings.objectWorkspace.sortFields) == "undefined") this.settings.objectWorkspace.sortFields = [];
			if (typeof(this.settings.objectWorkspace.filterConditions) == "undefined") this.settings.objectWorkspace.filterConditions = [];
			if (typeof(this.settings.objectWorkspace.frozenColumnID) == "undefined") this.settings.objectWorkspace.frozenColumnID = "";
			if (typeof(this.settings.objectWorkspace.hiddenFields) == "undefined") this.settings.objectWorkspace.hiddenFields = [];
			if (typeof(this.settings.objectWorkspace.summaryColumns) == "undefined") this.settings.objectWorkspace.summaryColumns = [];
		}

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
		PopupFrozenColumnsComponent = new ABPopupFrozenColumns(App, idBase+"_freeze");
		PopupSummaryColumnsComponent = new ABPopupSummaryColumns(App, idBase+"_summary");
		
		_logic.newObject = () => {
			var currObj = _logic.currentEditObject();
			currObj.settings.objectWorkspace = {
				sortFields:[],
				filterConditions:[],
				frozenColumnID:"",
				hiddenFields:[],
				summaryColumns:[]
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

		_logic.summaryColumns = ($view) => {
			PopupSummaryColumnsComponent.show($view, {pos:"top"});
		}
		
		_logic.callbackSaveWorkspace = (data) => {
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
		
		PopupSummaryColumnsComponent.init({
			onChange: _logic.onChange					// be notified when there is a change in the summary columns
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
						{
							view:"checkbox",
							name:"isFilterable",
							labelRight: L('ab.component.label.isFilterable', '*User can filter records.'),
							labelWidth: App.config.labelWidthCheckbox
						},
						{
							view:"checkbox",
							name:"isSortable",
							labelRight: L('ab.component.label.isSortable', '*User can sort records.'),
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
									icon: "gear",
									type: "icon",
									badge: 0,
									click: function () {
										_logic.toolbarFieldsVisible(this.$view);
									}
								}
							]
						},
						// {
						// 	cols: [
						// 		{ 
						// 		    view:"label", 
						// 		    label: L("ab.component.label.filterData", "*Filter Data:"),
						// 			width: App.config.labelWidthLarge,
						// 		},
						// 		{
						// 			view: view,
						// 			// id: ids.buttonFilter,
						// 			label: L("ab.component.label.settings", "*Settings"),
						// 			icon: "gear",
						// 			type: "icon",
						// 			badge: 0,
						// 			click: function () {
						// 				_logic.toolbarFilter(this.$view);
						// 			}
						// 		}
						// 	]
						// },
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
									icon: "gear",
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
									icon: "gear",
									type: "icon",
									badge: 0,
									click: function(){
										_logic.summaryColumns(this.$view);
									}
								}
							]
						},

						{
							view: 'counter',
							name: "height",
							label: L("ab.component.grid.height", "*Height:"),
							labelWidth: App.config.labelWidthXLarge,
						}

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
		$$(ids.isFilterable).setValue(view.settings.isFilterable);
		$$(ids.isSortable).setValue(view.settings.isSortable);
		// $$(ids.linkedObject).setValue(view.settings.linkedObject);
		// $$(ids.linkedField).setValue(view.settings.linkedField);
		// $$(ids.linkedPage).setValue(view.settings.linkedPage);
		// $$(ids.linkedPageView).setValue(view.settings.linkedPageView);
		// $$(ids.linkedEditPage).setValue(view.settings.linkedEditPage);
		// $$(ids.linkedEditPageForm).setValue(view.settings.linkedEditPageForm);
		$$(ids.detailsPage).setValue(view.settings.detailsPage);
		$$(ids.editPage).setValue(view.settings.editPage);
		$$(ids.height).setValue(view.settings.height);

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
	
	}
	
	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		// Retrive the values of your properties from Webix and store them in the view
		view.settings.dataSource = $$(ids.dataSource).getValue();
		view.settings.isEditable = $$(ids.isEditable).getValue();
		view.settings.massUpdate = $$(ids.massUpdate).getValue();
		view.settings.allowDelete = $$(ids.allowDelete).getValue();
		view.settings.isFilterable = $$(ids.isFilterable).getValue();
		view.settings.isSortable = $$(ids.isSortable).getValue();
		// view.settings.linkedObject = $$(ids.linkedObject).getValue();
		// view.settings.linkedField = $$(ids.linkedField).getValue();
		// view.settings.linkedPage = $$(ids.linkedPage).getValue();
		// view.settings.linkedPageView = $$(ids.linkedPageView).getValue();
		// view.settings.linkedEditPage = $$(ids.linkedEditPage).getValue();
		// view.settings.linkedEditPageForm = $$(ids.linkedEditPageForm).getValue();
		view.settings.detailsPage = $$(ids.detailsPage).getValue();
		view.settings.editPage = $$(ids.editPage).getValue();
		view.settings.height = $$(ids.height).getValue();

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
			buttonDeleteSelected: App.unique(idBase+'_deleteSelected'),
			// buttonExport: App.unique('buttonExport'),
			buttonFilter: App.unique(idBase+'_buttonFilter'),
			buttonMassUpdate: App.unique(idBase+'_buttonMassUpdate'),
			buttonSort: App.unique(idBase+'_buttonSort'),

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
			summaryColumns: this.settings.objectWorkspace.summaryColumns
		}
		
		var isFiltered = false,
			waitMilliseconds = 50,
			filterTimeoutId;

		var DataTable = new ABWorkspaceDatatable(App, idBase, settings);
		var PopupMassUpdateComponent = new ABPopupMassUpdate(App, idBase+"_mass");
		var PopupSortDataTableComponent = new ABPopupSortField(App, idBase+"_sort");
		var rowFilter = new RowFilter(App, idBase+"_filter");
		var filter_popup = webix.ui({
			view: "popup",
			width: 800,
			hidden: true,
			body: rowFilter.ui
		});


		var _init = () => {

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
					onChange:_logic.callbackFilterData		// be notified when there is a change in the filter
				});
				
				if (this.settings.massUpdate == false && this.settings.isFilterable == false && this.settings.isSortable == false) {
					$$(ids.toolbar).hide();
				}
				
				if (this.settings.massUpdate == false) {
					$$(ids.buttonMassUpdate).hide();
					$$(ids.buttonDeleteSelected).hide();
				}

				if (this.settings.allowDelete == false) {
					$$(ids.buttonDeleteSelected).hide();
				}
				
				if (this.settings.isFilterable == false) {
					$$(ids.buttonFilter).hide();
				}
				
				if (this.settings.isSortable == false) {
					$$(ids.buttonSort).hide();
				}

				// var dataSource = this.application.objects((o)=>{
				// 	return o.id == this.settings.dataSource;
				// });
				var dc = this.dataCollection();
				
				if (dc) {

					var dataCopy = _.cloneDeep(dc.datasource);
					dataCopy.objectWorkspace = this.settings.objectWorkspace;
					CurrentObject = dataCopy;

					DataTable.objectLoad(CurrentObject);
					PopupMassUpdateComponent.objectLoad(CurrentObject, DataTable);
					PopupSortDataTableComponent.objectLoad(CurrentObject, this);
					rowFilter.objectLoad(CurrentObject);
					DataTable.refreshHeader();

					dc.bind($$(DataTable.ui.id));

					var editPage = this.settings.editPage;
					var detailsPage = this.settings.detailsPage;
					$$(DataTable.ui.id).attachEvent("onItemClick", function (id, e, node) {

						if (e.target.className.indexOf('eye') > -1) {
							var item = id;
							_logic.changePage(dc, item, detailsPage);
						}
						else if (e.target.className.indexOf('pencil') > -1) {
							var item = id;
							_logic.changePage(dc, item, editPage);
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
				type: "layout",
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
									_logic.toolbarSort(this.$view);
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
			
			callbackSortData: () => {

				// client sort data
				$$(DataTable.ui.id).sort(PopupSortDataTableComponent.sort);

			},

			callbackFilterData: () => {

				$$(DataTable.ui.id).filter(function(rowData) {

					return rowFilter.isValid(rowData);

				});

			},

			changePage: (dc, id, page) => {
				dc.setCursor(id);
				super.changePage(page);
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

			toolbarMassUpdate: function ($view) {
				PopupMassUpdateComponent.show($view);
			},
		
		}


		var _onShow = () => {

			if ($$(DataTable.ui.id)) {
				$$(DataTable.ui.id).adjust();
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
					// editForms.push({id:j.parent.id+"|"+j.id, value:j.label});
					editForms.push({id:j.parent.id, value:j.label});				
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
		var dc = this.dataCollection();

		if (!dc) return;

		var dataCopy = _.cloneDeep(dc.datasource);
		dataCopy.objectWorkspace = view.settings.objectWorkspace;

		// if (view.settings.dataSource != "") {
			// var dataSource = view.application.objects((o)=>{
			// 	return o.id == view.settings.dataSource;
			// });
			// var dataSource = this.dataCollection();
			// var dataCopy = _.cloneDeep(dataSource.datasource);
			// console.log(view);
			// dataCopy.objectWorkspace = view.settings.objectWorkspace;
			PopupHideFieldComponent.objectLoad(dataCopy, view);
			// PopupFilterDataTableComponent.objectLoad(dataCopy, view);
			// PopupSortFieldComponent.objectLoad(dataCopy, view);
			PopupFrozenColumnsComponent.objectLoad(dataCopy, view);
			PopupSummaryColumnsComponent.objectLoad(dataCopy, view);
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
				// find views inside Tab component
				else if (v.key == "tab") {
					var tabViews = v.views();
					tabViews.forEach(tab => {

						var subViews = tab.views(subV => subV.key == type && subV.settings.datacollection == view.settings.dataSource);
						if (subViews.length > 0)
							detailViews.push({id:v.pageParent().id, value:v.label});

					});

				}
			});
			return detailViews;
		}
		return detailViews;
	}
	
	/**
	 * @method dataCollection
	 * return ABViewDataCollection of this form
	 * 
	 * @return {ABViewDataCollection}
	 */
	dataCollection() {
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