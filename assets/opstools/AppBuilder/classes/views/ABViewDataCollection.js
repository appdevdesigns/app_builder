/*
 * ABViewDataCollection
 *
 *
 */

import ABView from "./ABView"
import ABPropertyComponent from "../ABPropertyComponent"
import ABPopupSortField from "../../components/ab_work_object_workspace_popupSortFields"
import ABWorkspaceDatatable from "../../components/ab_work_object_workspace_datatable"

import RowFilter from "../RowFilter"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

function dataCollectionNew(instance, data) {
	// get a webix data collection
	var dc = new webix.DataCollection({
		data: data || [],
	});

	// Apply this data collection to support multi-selection
	// https://docs.webix.com/api__refs__selectionmodel.html
	webix.extend(dc, webix.SelectionModel);

	// Implement .onDataRequest for paging loading
	if (!instance.settings.loadAll) {

		dc.___AD = dc.___AD || {};

		if (dc.___AD.onDataRequestEvent) dc.detachEvent(dc.___AD.onDataRequestEvent);
		dc.___AD.onDataRequestEvent = dc.attachEvent("onDataRequest", (start, count) => {

			if (start < 0) start = 0;

			// load more data to the data collection
			instance.loadData(start, count);

			return false;	// <-- prevent the default "onDataRequest"
		});


		if (dc.___AD.onAfterLoadEvent) dc.detachEvent(dc.___AD.onAfterLoadEvent);
		dc.___AD.onAfterLoadEvent = dc.attachEvent("onAfterLoad", () => {

			instance.emit("loadData", {});

		});

	}

	// override unused functions of selection model
	dc.addCss = function () { };
	dc.removeCss = function () { };
	dc.render = function () { };

	dc.attachEvent("onAfterLoad", () => {

		instance.hideProgressOfComponents();

	});

	return dc;
}



var ABViewPropertyDefaults = {
	object: '', // id of ABObject
	objectUrl: '', // url of ABObject
	objectWorkspace: {
		filterConditions: { // array of filters to apply to the data table
			glue: 'and',
			rules: []
		},
		sortFields: [] // array of columns with their sort configurations
	},
	loadAll: false,
	isQuery: false, // if true it is a query, otherwise it is a object.

	fixSelect: "" // _CurrentUser, _FirstRecord, _FirstRecordDefault or row id
}


var ABViewDefaults = {
	key: 'datacollection',		// {string} unique key for this view
	icon: 'database',		// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.datacollection' // {string} the multilingual label key for the class label
}

var FilterComponent = null;
var PopupSortFieldComponent = null;

export default class ABViewDataCollection extends ABView {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABView} parent the ABView this view is a child of. (can be null)
	 */
	constructor(values, application, parent) {

		super(values, application, parent, ABViewDefaults);

		// OP.Multilingual.translate(this, this, ['label']);

		this.__dataCollection = dataCollectionNew(this, []);

		// Set filter value
		this.__filterComponent = new RowFilter();
		this.__filterComponent.objectLoad(this.datasource);
		this.__filterComponent.viewLoad(this);
		this.__filterComponent.setValue(this.settings.objectWorkspace.filterConditions || ABViewPropertyDefaults.objectWorkspace.filterConditions);

		this.__bindComponentIds = [];

		// refresh a data collection
		// this.init();

		// mark data status does not be initialized
		this._dataStatus = this.dataStatusFlag.notInitial;

	}


	static common() {

		return ABViewDefaults;

	}


	/**
     * @method save()
     *
     * persist this instance of ABViewDataCollection with it's parent
     *
     *
     * @return {Promise}
     *         .resolve( {this} )
     */
	save() {
		return new Promise(
			(resolve, reject) => {

				// if this is our initial save()
				if (!this.id) {
					this.id = OP.Util.uuid();   // setup default .id
				}

				var parent = this.parent;

				parent.dataCollectionSave(this)
					.then(resolve)
					.catch(reject);
			}
		)
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
	toObj() {

		var obj = super.toObj();

		return obj;
	}

	/**
	 * @method fromValues()
	 *
	 * initialze this object with the given set of values.
	 * @param {obj} values
	 */
	fromValues(values) {

		super.fromValues(values);

		// if this is being instantiated on a read from the Property UI,
		this.settings.object = this.settings.object || ABViewPropertyDefaults.object;
		this.settings.objectUrl = this.settings.objectUrl || ABViewPropertyDefaults.objectUrl;
		this.settings.objectWorkspace = this.settings.objectWorkspace || {
			filterConditions: ABViewPropertyDefaults.objectWorkspace.filterConditions,
			sortFields: ABViewPropertyDefaults.objectWorkspace.sortFields
		};

		// Convert to boolean
		this.settings.loadAll = JSON.parse(this.settings.loadAll || ABViewPropertyDefaults.loadAll);
		this.settings.isQuery = JSON.parse(this.settings.isQuery || ABViewPropertyDefaults.isQuery);

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

		var idBase = 'ABViewDataCollectionDataComponent';
		var ids = {
			component: App.unique(idBase + '_component')
		};

		var settings = {
			allowDelete: 0,
			detailsView: "",
			editView: "",
			isEditable: 0,
			massUpdate: 0
		}

		var DataTable = new ABWorkspaceDatatable(App, idBase, settings);

		var _ui = DataTable.ui;

		var _init = (options) => {

			DataTable.init({
			});

			// get data collection & object
			var object = this.datasource;

			if (object != null) {

				DataTable.objectLoad(object);
				DataTable.refreshHeader();

				// bind a data collection to the display grid
				this.bind($$(DataTable.ui.id));

				$$(DataTable.ui.id).adjust();
			}

		};

		var _logic = {
		};

		return {
			ui: _ui,
			init: _init,
			logic: _logic
		}
	}

	removeField(field, cb) {

		var shouldSave = false;

		// check filter conditions for any settings
		if (this.settings.objectWorkspace.filterConditions &&
			this.settings.objectWorkspace.filterConditions.rules &&
			this.settings.objectWorkspace.filterConditions.rules.length) {
			// if settings are present look for deleted field id in each one
			this.settings.objectWorkspace.filterConditions.rules.find((o, i) => {
				if (o.key === field.id) {
					// if found splice from array
					this.settings.objectWorkspace.filterConditions.rules.splice(i, 1);
					// flag the object to be saved later
					shouldSave = true;
				}
			});
		}

		// check to see if sort fields settings are present
		if (this.settings.objectWorkspace.sortFields && this.settings.objectWorkspace.sortFields.length) {
			// if so look for deleted field in settings
			this.settings.objectWorkspace.sortFields.find((o, i) => {
				if (o.by === field.columnName) {
					// if found splice setting from array
					this.settings.objectWorkspace.sortFields.splice(i, 1);
					// flag the object to be saved later
					shouldSave = true;
				}
			});
		}

		// if settings were changed call the callback
		cb(null, shouldSave);

	}


	//
	// Property Editor
	// 

	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		var commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);

		// == Logic ==

		_logic.selectSource = (sourceId, oldId) => {

			if ($$(ids.dataSource).getList().getItem(sourceId).disabled) {
				// prevents re-calling onChange from itself
				$$(ids.dataSource).blockEvent();
				$$(ids.dataSource).setValue(oldId || "")
				$$(ids.dataSource).unblockEvent();
			}

			var view = _logic.currentEditObject();

			var object = view.application.objects(obj => obj.id == sourceId)[0];
			var query = view.application.queries(q => q.id == sourceId)[0];

			if (object) {

				// populate fix selector
				this.populateFixSelector(ids, view, object);

				// re-create filter & sort popups
				this.initPopupEditors(App, ids, _logic);

				// show options
				$$(ids.filterPanel).show();
				$$(ids.sortPanel).show();


			}
			else if (query) {

				// hide options
				$$(ids.filterPanel).hide();
				$$(ids.sortPanel).hide();
			}


		};

		_logic.showFilterPopup = ($view) => {
			this.filter_popup.show($view, null, { pos: "top" });
		};

		_logic.showSortPopup = ($view) => {
			PopupSortFieldComponent.show($view, null, { pos: "top" });
		};

		_logic.onFilterChange = () => {

			var view = _logic.currentEditObject();

			var filterValues = FilterComponent.getValue();

			view.settings.objectWorkspace.filterConditions = filterValues;


			var allComplete = true;
			filterValues.rules.forEach((f) => {

				// if all 3 fields are present, we are good.
				if ((f.key)
					&& (f.rule)
					&& (f.value || 
						// these rules do not have input value
						(f.rule == 'is_current_user' ||
						f.rule == 'is_not_current_user' ||
						f.rule == 'same_as_user' ||
						f.rule == 'not_same_as_user'))) {
					allComplete = allComplete && true;
				} else {

					// else, we found an entry that wasn't complete:
					allComplete = false;
				}
			})

			// only perform the update if a complete row is specified:
			if (allComplete) {

				// we want to call .save() but give webix a chance to properly update it's 
				// select boxes before this call causes them to be removed:
				setTimeout(() => {
					this.propertyEditorSave(ids, view);
				}, 10);

			}


		};

		// create filter & sort popups
		this.initPopupEditors(App, ids, _logic);

		return commonUI.concat([
			{
				view: "fieldset",
				label: L('ab.component.datacollection.dataSource', '*Data Source:'),
				labelWidth: App.config.labelWidthLarge,
				body: {
					type: "clean",
					paddingY: 20,
					paddingX: 10,
					rows: [
						{
							view: "richselect",
							name: "dataSource",
							label: L('ab.component.datacollection.source', '*Source:'),
							labelWidth: App.config.labelWidthLarge,
							options: {
								data: []
							},
							on: {
								onChange: function (newv, oldv) {
									if (newv == oldv) return;

									_logic.selectSource(newv, oldv);
								}
							}
						},
						// link to another data collection
						{
							view: "select",
							name: "linkDataSource",
							label: L('ab.component.datacollection.linkDataSource', '*Linked To:'),
							labelWidth: App.config.labelWidthLarge,
							options: [],
							hidden: 1
						},
						{
							view: "select",
							name: "linkField",
							label: L('ab.component.datacollection.linkedField', '*Linked Field:'),
							labelWidth: App.config.labelWidthLarge,
							options: [],
							hidden: 1
						}
					]
				}
			},
			{
				view: "fieldset",
				name: "advancedOption",
				label: L('ab.component.datacollection.advancedOptions', '*Advanced Options:'),
				labelWidth: App.config.labelWidthLarge,
				body: {
					type: "clean",
					paddingY: 20,
					paddingX: 10,
					rows: [
						{
							name: "filterPanel",
							cols: [
								{
									view: "label",
									label: L("ab.component.datacollection.filterData", "*Filter Data:"),
									width: App.config.labelWidthLarge,
								},
								{
									view: "button",
									name: "buttonFilter",
									label: L("ab.component.datacollection.settings", "*Settings"),
									icon: "gear",
									type: "icon",
									badge: 0,
									click: function () {
										_logic.showFilterPopup(this.$view);
									}
								}
							]
						},
						{
							name: "sortPanel",
							cols: [
								{
									view: "label",
									label: L("ab.component.datacollection.sortData", "*Sort Data:"),
									width: App.config.labelWidthLarge,
								},
								{
									view: "button",
									name: "buttonSort",
									label: L("ab.component.datacollection.settings", "*Settings"),
									icon: "gear",
									type: "icon",
									badge: 0,
									click: function () {
										_logic.showSortPopup(this.$view);
									}
								}
							]
						},
						{
							cols: [
								{
									view: "label",
									label: L("ab.component.datacollection.loadAll", "*Load all:"),
									width: App.config.labelWidthLarge,
								},
								{
									view: "checkbox",
									name: "loadAll",
									label: ""
								}
							]
						},
						{
							view: "select",
							name: "fixSelect",
							label: L('ab.component.datacollection.fixSelect', '*Select:'),
							labelWidth: App.config.labelWidthLarge,
							options: []
						}
					]
				}
			}

		]);

	}

	static propertyEditorPopulate(App, ids, view) {

		super.propertyEditorPopulate(App, ids, view);

		var sources = [];

		// Objects
		var objects = view.application.objects().map((obj) => {
			return {
				id: obj.id,
				value: obj.label,
				icon: 'database'
			}
		});
		sources = sources.concat(objects);

		// Queries
		var queries = view.application.queries().map((q) => {
			return {
				id: q.id,
				value: q.label,
				icon: 'cubes',
				disabled: q.isDisabled()
			}
		});
		sources = sources.concat(queries);

		sources.unshift({ id: '', value: L('ab.component.datacollection.selectSource', '*Select an source') });

		$$(ids.dataSource).define("options", {
			body: {
				scheme: {
					$init: function (obj) {
						if (obj.disabled)
							obj.$css = "disabled";
					}
				},
				data: sources
			}
		});
		$$(ids.dataSource).define("value", view.settings.object || '');
		$$(ids.dataSource).refresh();

		// populate link data collection options
		this.initLinkDataCollectionOptions(ids, view);

		// populate link fields
		this.initLinkFieldOptions(ids, view);

		// initial populate of popups
		this.populatePopupEditors(view);

		this.populateBadgeNumber(ids, view);

		// set .loadAll flag
		$$(ids.loadAll).setValue(view.settings.loadAll != null ? view.settings.loadAll : ABViewPropertyDefaults.loadAll);

		// populate data items to fix select options
		var object = view.datasource;
		this.populateFixSelector(ids, view, object);

		// when a change is made in the properties the popups need to reflect the change
		this.updateEventIds = this.updateEventIds || {}; // { viewId: boolean, ..., viewIdn: boolean }
		if (!this.updateEventIds[view.id]) {
			this.updateEventIds[view.id] = true;

			view.addListener('properties.updated', () => {
				this.populatePopupEditors(view);
				this.populateBadgeNumber(ids, view);

				if (view.__dataCollection)
					view.__dataCollection.clearAll();

				view.loadData();
			});
		}

		// Set UI of the filter popup
		// $$(ids.filter_popup).define('body', FilterComponent.ui);

		// if selected soruce is a query, then hide advanced options UI
		if (view.application.queries(q => q.id == view.settings.object)[0]) {
			$$(ids.filterPanel).hide();
			$$(ids.sortPanel).hide();
			// $$(ids.advancedOption).hide();
		}
		else {
			$$(ids.filterPanel).show();
			$$(ids.sortPanel).show();
			// $$(ids.advancedOption).show();
		}

		// initial data
		if (view._dataStatus == view.dataStatusFlag.notInitial) {
			view.loadData();
		}


	}

	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);


		// if object is changed, then clear filter & sort settings
		if (view.settings.object != $$(ids.dataSource).getValue()) {

			view.settings.objectWorkspace = {
				filterConditions: ABViewPropertyDefaults.objectWorkspace.filterConditions,
				sortFields: ABViewPropertyDefaults.objectWorkspace.sortFields
			};

		}


		view.settings.object = $$(ids.dataSource).getValue();

		// get object or query url
		if (view.settings.object) {
			var obj = view.application.objects(obj => obj.id == view.settings.object)[0];
			var query = view.application.queries(q => q.id == view.settings.object)[0];

			var source;
			if (obj) {
				source = obj;
				view.settings.isQuery = false;
			}
			else if (query) {
				source = query;
				view.settings.isQuery = true;
			}

			if (source)
				view.settings.objectUrl = source.urlPointer();
			else
				delete view.settings.objectUrl;


			var defaultLabel = view.parent.label + '.' + view.defaults.key;

			// update label
			if (view.label == '?label?' || view.label == defaultLabel) {
				view.label = source.label;
				$$(ids.label).define('value', source.label);
				$$(ids.label).refresh();
			}
		}
		else {
			delete view.settings.objectUrl;
			delete view.settings.isQuery;
		}

		// set id of link data collection
		view.settings.linkDataCollection = $$(ids.linkDataSource).getValue();
		if (!view.settings.linkDataCollection)
			delete view.settings.linkDataCollection;

		// set id of link field
		view.settings.linkField = $$(ids.linkField).getValue();
		if (!view.settings.linkField)
			delete view.settings.linkField;

		// populate filter & sort values to popups
		this.populatePopupEditors(view);

		// populate link data collections
		this.initLinkDataCollectionOptions(ids, view);

		// populate link fields
		this.initLinkFieldOptions(ids, view);

		// set loadAll flag
		view.settings.loadAll = $$(ids.loadAll).getValue();

		// set fix select value
		view.settings.fixSelect = $$(ids.fixSelect).getValue();

		// refresh data collection
		view.init();

	}

	static populateBadgeNumber(ids, view) {

		if (view.settings.objectWorkspace &&
			view.settings.objectWorkspace.filterConditions &&
			view.settings.objectWorkspace.filterConditions.rules) {
			$$(ids.buttonFilter).define('badge', view.settings.objectWorkspace.filterConditions.rules.length);
			$$(ids.buttonFilter).refresh();
		}
		else {
			$$(ids.buttonFilter).define('badge', 0);
			$$(ids.buttonFilter).refresh();
		}

		if (view.settings.objectWorkspace &&
			view.settings.objectWorkspace.sortFields) {
			$$(ids.buttonSort).define('badge', view.settings.objectWorkspace.sortFields.length);
			$$(ids.buttonSort).refresh();
		}
		else {
			$$(ids.buttonSort).define('badge', 0);
			$$(ids.buttonSort).refresh();
		}
	}

	static populateFixSelector(ids, view, object) {

		var dataItems = view.getData().map((item) => {
			return {
				id: item.id,
				value: object ? object.displayData(item) : ""
			}
		});

		// Add a current user option to allow select first row that match the current user
		if (object) {
			var userFields = object.fields((f) => f.key == 'user');
			if (userFields.length > 0)
				dataItems.unshift({ id: '_CurrentUser', value: L('ab.component.datacollection.currentUser', '[Current User]') });

			// Add a first record option to allow select first row
			dataItems.unshift(
				{ id: '_FirstRecord', value: L('ab.component.datacollection.firstRecord', '[First Record]') },
				{ id: '_FirstRecordDefault', value: L('ab.component.datacollection.firstRecordDefault', '[Default to First Record]') }
			);

		}

		dataItems.unshift({ id: '', value: L('ab.component.datacollection.fixSelect', '*Select fix cursor') });

		$$(ids.fixSelect).define("options", dataItems);
		$$(ids.fixSelect).refresh();
		$$(ids.fixSelect).setValue(view.settings.fixSelect || '');

	}


	static initLinkDataCollectionOptions(ids, view) {

		// get linked data collection list
		var rootPage = view.pageRoot();
		var objSource = view.datasource;
		if (objSource != null) {
			var linkFields = objSource.connectFields();
			var linkObjectIds = linkFields.map((f) => f.settings.linkObject);

			var linkDcOptions = [];

			// pull data collections that are link to object
			var linkDcs = rootPage.dataCollections((dc) => {

				return linkObjectIds.filter((objId) => dc.settings.object == objId).length > 0;

			});

			if (linkDcs && linkDcs.length > 0) {

				// set data collections to options
				linkDcs.forEach((dc) => {
					linkDcOptions.push({
						id: dc.id,
						value: dc.label
					});
				});

				linkDcOptions.unshift({ id: '', value: L('ab.component.datacollection.selectLinkSource', '*Select a link source') });

				$$(ids.linkDataSource).show();
				$$(ids.linkDataSource).define("options", linkDcOptions);
				$$(ids.linkDataSource).refresh();
				$$(ids.linkDataSource).setValue(view.settings.linkDataCollection || '');
			}
			else {

				// hide options
				$$(ids.linkDataSource).hide();
				$$(ids.linkField).hide();
			}

		}
		else {

			// hide options
			$$(ids.linkDataSource).hide();
			$$(ids.linkField).hide();
		}

	}


	static initLinkFieldOptions(ids, view) {

		var linkFieldOptions = [];

		// get fields that link to our ABObject
		if (view.dataCollectionLink) {
			var object = view.datasource;
			var linkObject = view.dataCollectionLink.datasource;
			var relationFields = object.connectFields().filter((link) => link.settings.linkObject == linkObject.id);

			// pull fields to options
			relationFields.forEach((f) => {
				linkFieldOptions.push({
					id: f.id,
					value: f.label
				});
			});
		}

		if (linkFieldOptions.length > 0)
			$$(ids.linkField).show();
		else
			$$(ids.linkField).hide();

		$$(ids.linkField).define("options", linkFieldOptions);
		$$(ids.linkField).refresh();
		$$(ids.linkField).setValue(view.settings.linkField || (linkFieldOptions[0] ? linkFieldOptions[0].id : ''));

	}


	static initPopupEditors(App, ids, _logic) {

		var idBase = 'ABViewDataCollectionPropertyEditor';


		FilterComponent = new RowFilter(App, idBase + "_filter");
		FilterComponent.init({
			// when we make a change in the popups we want to make sure we save the new workspace to the properties to do so just fire an onChange event
			onChange: _logic.onFilterChange
		});

		this.filter_popup = webix.ui({
			view: "popup",
			width: 800,
			hidden: true,
			body: FilterComponent.ui
		});


		PopupSortFieldComponent = new ABPopupSortField(App, idBase + "_sort");
		PopupSortFieldComponent.init({
			// when we make a change in the popups we want to make sure we save the new workspace to the properties to do so just fire an onChange event
			onChange: _logic.onChange
		});

	}


	static populatePopupEditors(view) {

		var filterConditions = ABViewPropertyDefaults.objectWorkspace.filterConditions;

		// Clone ABObject
		if (view.datasource) {

			var objectCopy = view.datasource.clone();
			if (objectCopy) {
				objectCopy.objectWorkspace = view.settings.objectWorkspace;
	
				filterConditions = objectCopy.objectWorkspace.filterConditions || ABViewPropertyDefaults.objectWorkspace.filterConditions;
			}
	
			// Populate data to popups
			FilterComponent.objectLoad(objectCopy);
			FilterComponent.viewLoad(view);
			FilterComponent.setValue(filterConditions);
			view.__filterComponent.objectLoad(objectCopy);
			view.__filterComponent.viewLoad(view);
			view.__filterComponent.setValue(filterConditions);
	
			PopupSortFieldComponent.objectLoad(objectCopy, view);
	
		}

	}


	/**
	* @method component()
	* return a UI component based upon this view.
	* @param {obj} App 
	* @return {obj} UI component
	*/
	component(App) {

		var _ui = {
		};

		// make sure each of our child views get .init() called
		var _init = (options) => {
		};

		return {
			ui: _ui,
			init: _init
		};

	}


	/**
	* @method componentList
	* return the list of components available on this view to display in the editor.
	*/
	componentList() {
		return [];
	}


	/**
	 * @property datasourceURL
	 * return a url to the ABObject.
	 * 
	 * @return string
	 */
	get datasourceURL() {
		return this.settings.objectUrl;
	}


	/**
	* @property datasource
	* return a object of this component.
	*
	* @return ABObject
	*/
	get datasource() {

		var obj = this.application.urlResolve(this.settings.objectUrl || '');

		return obj;
	}


	/**
	* @property sourceType
	* return type of source.
	*
	* @return {string} - 'object' or 'query'
	*/
	get sourceType() {

		if (this.datasource) {

			if (this.application.objects(obj => obj.id == this.datasource.id)[0])
				return 'object';
			else if (this.application.queries(q => q.id == this.datasource.id)[0])
				return 'query';
			else
				return "";

		}
		else {
			return "";
		}

	}


	/**
	 * @property model
	 * return a source model
	 * 
	 * @return ABModel
	 */
	get model() {
		var obj = this.datasource;

		if (obj) {
			return obj.model();
		}
		else {
			return null;
		}

	}


	/**
	* @method dataCollectionRefresh
	* create a data collection to cache
	*
	* @return {Promise}
	*			.resolve()
	*/
	init() {

		// prevent initialize many times
		if (this.initialized) return;
		this.initialized = true;

		this.__dataCollection.attachEvent("onAfterCursorChange", () => {

			var currData = this.getCursor();

			this.emit("changeCursor", currData);

		});

		// events
		AD.comm.hub.subscribe('ab.datacollection.create', (msg, data) => {

			let obj = this.datasource;
			if (!obj)
				return;

			if (obj.id != data.objectId)
				return;

			var rowData = data.data;

			// normalize data before add to data collection
			var model = obj.model();
			model.normalizeData(rowData);

			// filter condition before add 
			if (!this.__filterComponent.isValid(rowData))
				return;

			if (!this.__dataCollection.exists(rowData.id)) {
				this.__dataCollection.add(rowData, 0);
				// this.__dataCollection.setCursor(rowData.id);
			}

			// filter link data collection's cursor
			this.refreshLinkCursor();

		});

		AD.comm.hub.subscribe('ab.datacollection.update', (msg, data) => {

			let obj = this.datasource;
			if (!obj)
				return;

			if (obj.id != data.objectId)
				return;

			// updated values
			var values = data.data;
			if (!values) return;

			// various PK name
			if (!values.id && obj.PK() != 'id')
				values.id = values[obj.PK()];

			if (this.__dataCollection.exists(values.id)) {
				// normalize data before update data collection
				var model = obj.model();
				model.normalizeData(values);
				this.__dataCollection.updateItem(values.id, values);

				// If the update item is current cursor, then should tell components to update.
				var currData = this.getCursor();
				if (currData && currData.id == values.id) {
					this.emit("changeCursor", currData);
				}
			}
			// filter before add new record
			else if (this.__filterComponent.isValid(values)) {

				// this means the updated record was not loaded yet so we are adding it to the top of the grid
				// the placemet will probably change on the next load of the data
				this.__dataCollection.add(values, 0);
			}

			// filter link data collection's cursor
			this.refreshLinkCursor();

		});

		// We are subscribing to notifications from the server that an item may be stale and needs updating
		// We will improve this later and verify that it needs updating before attempting the update on the client side
		AD.comm.hub.subscribe('ab.datacollection.stale', (msg, data) => {
			
			// if we don't have a datasource or model, there is nothing we can do here:
			// Verify the datasource has the object we are listening for if not just stop here
			if (!this.datasource || !this.model || this.datasource.id != data.objectId) { 
				return; 
			}

				

			// updated values
			var values = data.data;

			// use the Object's defined Primary Key:
			var PK = this.model.object.PK();
			if (!values[PK]) {
				PK = 'id';
			}

			if (values) {

				if (this.__dataCollection.exists(values[PK])) {
					var cond = { where:{} };
					cond.where[PK] = values[PK];
					// this data collection has the record so we need to query the server to find out what it's latest data is so we can update all instances
					this.model.staleRefresh(cond).then((res) => {

						// check to make sure there is data to work with
						if (Array.isArray(res.data) && res.data.length) {
							// tell the webix data collection to update using their API with the row id (values.id) and content (res.data[0]) 
							if (this.__dataCollection.exists(values[PK])) {
								this.__dataCollection.updateItem(values[PK], res.data[0]);
							}

							// If the update item is current cursor, then should tell components to update.
							var currData = this.getCursor();
							if (currData && currData[PK] == values[PK]) {
								this.emit("changeCursor", currData);
							}
						} else {
							// If there is no data in the object then it was deleted...lets clean things up
							// If the deleted item is current cursor, then the current cursor should be cleared.
							var currId = this.getCursor();
							if (currId == values[PK])
								this.emit("changeCursor", null);

							this.__dataCollection.remove(values[PK]);
						}
					});

				}
			}

			// filter link data collection's cursor
			this.refreshLinkCursor();

		});

		AD.comm.hub.subscribe('ab.datacollection.delete', (msg, data) => {

			if (this.datasource &&
				this.datasource.id != data.objectId)
				return;

			// id of a deleted item
			var deleteId = data.data;

			if (this.__dataCollection.exists(deleteId)) {

				// If the deleted item is current cursor, then the current cursor should be cleared.
				var currData = this.getCursor();
				if (currData && currData.id == deleteId)
					this.emit("changeCursor", null);

				this.__dataCollection.remove(deleteId);
			}
		});


		// add listeners when cursor of link data collection is changed
		let linkDc = this.dataCollectionLink;
		if (linkDc) {
			this.eventAdd({
				emitter: linkDc,
				eventName: "changeCursor",
				listener: () => { this.refreshLinkCursor(); }
			});
		}

		// load data to initial the data collection
		// this.loadData();

		// if (this.settings.loadAll)
		// 	this.loadData();
		// else
		// 	this.__dataCollection.loadNext(20, 0);

	}

	/**
	* @method dataCollectionLink
	* return a ABViewDataCollection that link of this.
	*
	* @return {ABViewDataCollection}
	*/
	get dataCollectionLink() {
		return this
			.pageRoot()
			.dataCollections((dc) => dc.id == this.settings.linkDataCollection)[0];
	}

	/**
	* @method fieldLink
	* return a ABFieldConnect field that link of this.
	*
	* @return {ABFieldConnect}
	*/
	get fieldLink() {

		var object = this.datasource;
		if (!object) return null;

		return object.fields((f) => f.id == this.settings.linkField)[0];
	}


	/**
	 * @method bind
	 * 
	 * 
	 * @param {Object} component - a webix element instance
	*/
	bind(component) {

		var dc = this.__dataCollection;

		// prevent bind many times
		if (this.__bindComponentIds.indexOf(component.config.id) > -1 && 
				$$(component.config.id).data &&
				$$(component.config.id).data.find &&
				$$(component.config.id).data.find({}).length > 0)
			return;
		// keep component id to an array
		else 
			this.__bindComponentIds.push(component.config.id);

		if (component.config.view == 'datatable' ||
			component.config.view == 'dataview' ||
			component.config.view == 'treetable') {

			if (dc) {

				var items = dc.count();
				if (items == 0 &&
					(this._dataStatus == this.dataStatusFlag.notInitial ||
					this._dataStatus == this.dataStatusFlag.initializing) &&
					component.showProgress) {
					component.showProgress({ type: "icon" });
				}

				component.define("datafetch", 20);
				component.define("datathrottle", 500);

				// initial data of treetable
				if (component.config.view == 'treetable') {

					// NOTE: tree data does not support dynamic loading when scrolling
					// https://forum.webix.com/discussion/3078/dynamic-loading-in-treetable
					component.parse(dc.find({}));

				}
				else {
					component.data.sync(dc);
				}

				// Implement .onDataRequest for paging loading
				if (!this.settings.loadAll) {

					component.___AD = component.___AD || {};
					// if (component.___AD.onDataRequestEvent) component.detachEvent(component.___AD.onDataRequestEvent);
					if (!component.___AD.onDataRequestEvent) {
						component.___AD.onDataRequestEvent = component.attachEvent("onDataRequest", (start, count) => {

							if (component.showProgress)
								component.showProgress({ type: "icon" });

							// load more data to the data collection
							dc.loadNext(count, start);

							return false;	// <-- prevent the default "onDataRequest"
						});
					}

					// NOTE : treetable should use .parse or TreeCollection
					// https://forum.webix.com/discussion/1694/tree-and-treetable-using-data-from-datacollection
					if (component.config.view == 'treetable') {

						component.___AD = component.___AD || {};
						if (!component.___AD.onDcLoadData) {
							component.___AD.onDcLoadData = this.on("loadData", () => {

								component.parse(dc.find({}));

							});
						}

					}

				}


			}
			else {
				component.data.unsync();
			}
		}
		else if (component.bind) {
			if (dc) {
				// Do I need to check if there is any data in the collection before binding?
				component.bind(dc);
			} else {
				component.unbind();
			}

			if (component.refresh)
				component.refresh();

		}


	}

	clone(settings) {
		settings = settings || this.toObj();
		var clonedDataCollection = new ABViewDataCollection(settings, this.application, this.parent);

		return new Promise((resolve, reject) => {

			// load the data
			clonedDataCollection.loadData()
				.then(() => {

					// set the cursor
					var cursorID = this.getCursor();

					if (cursorID) {
						// NOTE: webix documentation issue: .getCursor() is supposed to return
						// the .id of the item.  However it seems to be returning the {obj} 
						if (cursorID.id) cursorID = cursorID.id;

						clonedDataCollection.setCursor(cursorID);
					}

					resolve(clonedDataCollection);
				})
				.catch(reject);
		})
	}

	filteredClone(filters) {
		var obj = this.toObj();

		// check to see that filters are set (this is sometimes helpful to select the first record without doing so at the data collection level)
		if (typeof filters != "undefined") {
			obj.settings.objectWorkspace.filterConditions = { glue: 'and', rules: [obj.settings.objectWorkspace.filterConditions, filters] }
		}

		return this.clone(obj); // new ABViewDataCollection(settings, this.application, this.parent);

	}


	setCursor(rowId) {

		// If the static cursor is set, then this DC could not set cursor to other rows
		if (this.settings.fixSelect && 
			(this.settings.fixSelect != "_FirstRecordDefault" || this.settings.fixSelect == rowId))
			return;

		var dc = this.__dataCollection;
		if (dc) {

			if (dc.getCursor() != rowId)
				dc.setCursor(rowId);
			// If set rowId equal current cursor, it will not trigger .onAfterCursorChange event
			else {
				this.emit("changeCursor", this.getCursor());
			}
		}

	}


	getCursor() {

		var dc = this.__dataCollection;
		if (dc) {

			var currId = dc.getCursor();
			var currItem = dc.getItem(currId);

			return currItem;
		}
		else {
			return null;
		}

	}

	getFirstRecord() {

		var dc = this.__dataCollection;
		if (dc) {

			var currId = dc.getFirstId();
			var currItem = dc.getItem(currId);

			return currItem;
		}
		else {
			return null;
		}

	}

	getNextRecord(record) {

		var dc = this.__dataCollection;
		if (dc) {

			var currId = dc.getNextId(record.id);
			var currItem = dc.getItem(currId);

			return currItem;
		}
		else {
			return null;
		}

	}

	loadData(start, limit, callback) {

		// mark data status is initializing
		if (this._dataStatus == this.dataStatusFlag.notInitial)
			this._dataStatus = this.dataStatusFlag.initializing;

		var obj = this.datasource;
		if (obj == null) {
			this._dataStatus = this.dataStatusFlag.initialized;
			return Promise.resolve([]);
		}

		var model = obj.model();
		if (model == null) {
			this._dataStatus = this.dataStatusFlag.initialized;
			return Promise.resolve([]);
		}

		var sorts = this.settings.objectWorkspace.sortFields || [];

		// pull filter conditions
		var wheres = this.settings.objectWorkspace.filterConditions;

		// calculate default value of $height of rows
		var defaultHeight = 0;
		var minHeight = 0;
		var imageFields = obj.fields((f) => f.key == 'image');
		imageFields.forEach(function (f) {
			if (parseInt(f.settings.useHeight) == 1 && parseInt(f.settings.imageHeight) > minHeight) {
				minHeight = parseInt(f.settings.imageHeight) + 20;
			}
		});
		if (minHeight > 0) {
			defaultHeight = minHeight;
		}

		// set query condition
		var cond = {
			where: wheres,
			limit: limit || 20,
			skip: start || 0,
			sort: sorts,
		};

		// load all data
		if (this.settings.loadAll) {
			delete cond.limit;
		}

		return Promise.resolve()
			.then(() => {

				// check data status of link data collection and listen change cursor event
				return new Promise((resolve, reject) => {

					let linkDc = this.dataCollectionLink;
					if (!linkDc) return resolve();

					switch (linkDc.dataStatus) {

						case linkDc.dataStatusFlag.notInitial:
							linkDc.loadData().catch(reject);
							// no break;

						case linkDc.dataStatusFlag.initializing:

							// wait until the link dc initialized data
							// NOTE: if linked data collections are recursive, then it is infinity looping.
							this.eventAdd({
								emitter: linkDc,
								eventName: "initializedData",
								listener: () => {

									// go next
									resolve();

								}
							});

							break;

						case linkDc.dataStatusFlag.initialized:
							resolve();
							break;

					}

				});

			})

			// pull data to data collection
			.then(() => {

				return new Promise((resolve, reject) => {

					model.findAll(cond)
					.then((data) => {

						data.data.forEach((d) => {
	
							// define $height of rows to render in webix elements
							if (d.properties != null && d.properties.height != "undefined" && parseInt(d.properties.height) > 0) {
								d.$height = parseInt(d.properties.height);
							} else if (defaultHeight > 0) {
								d.$height = defaultHeight;
							}
	
						});


						// mark initialized data
						if (this._dataStatus != this.dataStatusFlag.initialized) {
							this._dataStatus = this.dataStatusFlag.initialized;
							this.emit("initializedData", {});
						}


						// populate data to webix's data collection and the loading cursor is hidden here
						this.__dataCollection.parse(data);
	
	
						var linkDc = this.dataCollectionLink;
						if (linkDc) {
	
							// filter data by match link data collection
							this.refreshLinkCursor();
	
						}
						else {
	
							// set static cursor
							this.setStaticCursor();
	
						}

						if (callback)
							callback();
	
						resolve();
		
					})
					.catch(err => {
		
						this.hideProgressOfComponents();
		
						if (callback)
							callback(err);

						reject(err);
		
					});

				});

			});

	}

	reloadData() {
		this.__dataCollection.clearAll();
		return this.loadData(null, null, null);
	}


	getData(filter) {

		var dc = this.__dataCollection;
		if (dc) {

			return dc.find(row => {

				// data collection filter
				var isValid = this.__filterComponent.isValid(row);

				// parent dc filter
				var linkDc = this.dataCollectionLink;
				if (isValid && linkDc) {
					isValid = this.isParentFilterValid(row);
				}

				// addition filter
				if (isValid && filter) {
					isValid = filter(row);
				}

				return isValid;
			});
		}
		else {
			return [];
		}

	}


	/**
	 * @method refreshLinkCursor
	 * filter data in data collection by match id of link data collection
	 * 
	 * @param {Object} - current data of link data collection
	 */
	refreshLinkCursor() {

		var linkCursor;
		var linkDc = this.dataCollectionLink;
		if (linkDc) {
			linkCursor = linkDc.getCursor();
		}

		if (this.__dataCollection) {
			this.__dataCollection.filter(rowData => {

				// if link dc cursor is null, then show all data
				if (linkCursor == null)
					return true;
				else
					return this.isParentFilterValid(rowData);

			});

			this.setStaticCursor();

		}

	}

	isParentFilterValid(rowData) {

		// data is empty
		if (rowData == null) return null;

		var linkDc = this.dataCollectionLink;
		if (linkDc == null) return true;

		var fieldLink = this.fieldLink;
		if (fieldLink == null) return true;

		// the parent's cursor is not set.
		var linkCursor = linkDc.getCursor();
		if (linkCursor == null) return false;

		var linkVal = rowData[fieldLink.relationName()];
		if (linkVal == null) {

			// try to get relation value(id) again
			if (rowData[fieldLink.columnName]) {
				linkVal = rowData[fieldLink.columnName];
			}
			else {
				return false;
			}
		}

		// array - 1:M , M:N
		if (linkVal.filter) {
			return linkVal.filter(val => (val.id || val) == linkCursor.id).length > 0;
		}
		else {
			return (linkVal.id || linkVal) == linkCursor.id;
		}


	}

	setStaticCursor() {

		if (this.settings.fixSelect) {

			// set cursor to the current user
			if (this.settings.fixSelect == "_CurrentUser") {

				var username = OP.User.username();
				var userFields = this.datasource.fields((f) => f.key == "user");

				// find a row that contains the current user
				var row = this.__dataCollection.find((r) => {

					var found = false;

					userFields.forEach((f) => {

						if (found || r[f.columnName] == null) return;

						if (r[f.columnName].filter) { // Array - isMultiple
							found = r[f.colName].filter((data) => data.id == username).length > 0;
						}
						else if (r[f.columnName] == username) {
							found = true;
						}

					});

					return found;

				}, true);

				// set a first row of current user to cursor
				if (row)
					this.__dataCollection.setCursor(row.id);
			}
			else if (this.settings.fixSelect == "_FirstRecord" || this.settings.fixSelect == "_FirstRecordDefault") {
				// // find a row that contains the current user
				// var row = this.__dataCollection.find((r) => {

				// 	var found = false;
				// 	if (!found) {
				// 		found = true;
				// 		return true; // just give us the first record
				// 	}

				// }, true);

				// // set a first row of current user to cursor
				// if (row)
				// 	this.__dataCollection.setCursor(row.id);

				// set a first row to cursor
				var rowId = this.__dataCollection.getFirstId();
				if (rowId)
					this.__dataCollection.setCursor(rowId);
			}
			else {
				this.__dataCollection.setCursor(this.settings.fixSelect);
			}

		}

	}

	hideProgressOfComponents() {

		this.__bindComponentIds.forEach(comId => {

			if ($$(comId) &&
				$$(comId).hideProgress)
				$$(comId).hideProgress();

		});

	}

	get dataStatusFlag() {
		return {
			notInitial: 0,
			initializing: 1,
			initialized: 2
		};
	}

	get dataStatus() {

		return this._dataStatus;

	}

	removeComponent(comId) {

		// get index
		let index = this.__bindComponentIds.indexOf(comId);

		// delete
		this.__bindComponentIds.splice(index, 1);

	}


}