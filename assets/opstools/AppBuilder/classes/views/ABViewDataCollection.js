/*
 * ABViewDataCollection
 *
 *
 */

import ABView from "./ABView"
import ABPropertyComponent from "../ABPropertyComponent"
import ABPopupFilterDataTable from "../../components/ab_work_object_workspace_popupFilterDataTable"
import ABPopupSortField from "../../components/ab_work_object_workspace_popupSortFields"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var ABViewPropertyComponentDefaults = {
	object: '', // id of ABObject
	objectUrl: '', // url of ABObject
	objectWorkspace: {
		filterConditions: [], // array of filters to apply to the data table
		sortFields: [] // array of columns with their sort configurations
	}
}


var ABViewDefaults = {
	key: 'datacollection',		// {string} unique key for this view
	icon: 'database',		// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.datacollection' // {string} the multilingual label key for the class label
}

var PopupFilterDataTableComponent = null;
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

		// refresh a data collection
		// this.init();

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
	 * @method fromValues()
	 *
	 * initialze this object with the given set of values.
	 * @param {obj} values
	 */
	fromValues(values) {

		super.fromValues(values);

		// if this is being instantiated on a read from the Property UI,
		this.settings.object = this.settings.object || ABViewPropertyComponentDefaults.object;
		this.settings.objectUrl = this.settings.objectUrl || ABViewPropertyComponentDefaults.objectUrl;
		this.settings.objectWorkspace = this.settings.objectWorkspace || {
			filterConditions: [],
			sortFields: []
		};

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

		var idBase = 'ABViewDataCollectionEditorComponent';
		var ids = {
			component: App.unique(idBase + '_component')
		};

		var _ui = {
			id: ids.component,
			view: 'datatable'
		};

		var _init = (options) => {

			var DataTable = $$(ids.component);

			DataTable.clearAll();

			// get data collection & object
			var object = this.datasource;

			if (object != null) {

				var columns = object.fields().map((f) => {
					return {
						id: f.columnName,
						header: f.label
					};
				});

				DataTable.define("columns", columns);

				// bind a data collection to the display grid
				this.bind(DataTable);
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


	//
	// Property Editor
	// 

	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		var commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);


		// create filter & sort popups
		this.initPopupEditors(App, _logic);


		// == Logic ==

		_logic.selectObject = (objectId) => {

			// re-create filter & sort popups
			this.initPopupEditors(App, _logic);

		};

		_logic.toolbarFilter = ($view) => {
			PopupFilterDataTableComponent.show($view, null, { pos: "top" });
		}

		_logic.toolbarSort = ($view) => {
			PopupSortFieldComponent.show($view, null, { pos: "top" });
		}

		return commonUI.concat([
			{
				view: "fieldset",
				label: L('ab.component.datacollection.dataSource', '*Data Source:'),
				labelWidth: App.config.labelWidthLarge,
				body: {
					rows: [
						{
							view: "select",
							name: "dataSource",
							label: L('ab.component.datacollection.object', '*Object:'),
							labelWidth: App.config.labelWidthLarge,
							options: [],
							on: {
								onChange: function (newv, oldv) {
									if (newv == oldv) return;

									_logic.selectObject(newv);
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
				label: L('ab.component.datacollection.advancedOptions', '*Advanced Options:'),
				labelWidth: App.config.labelWidthLarge,
				body: {
					rows: [
						{
							cols: [
								{
									view: "label",
									label: L("ab.component.datacollection.filterData", "*Filter Data:"),
									width: App.config.labelWidthLarge,
								},
								{
									view: "button",
									label: L("ab.component.datacollection.settings", "*Settings"),
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
									view: "label",
									label: L("ab.component.datacollection.sortData", "*Sort Data:"),
									width: App.config.labelWidthLarge,
								},
								{
									view: "button",
									label: L("ab.component.datacollection.settings", "*Settings"),
									icon: "gear",
									type: "icon",
									badge: 0,
									click: function () {
										_logic.toolbarSort(this.$view);
									}
								}
							]
						}
					]
				}
			}
		]);

	}

	static propertyEditorPopulate(ids, view) {

		super.propertyEditorPopulate(ids, view);

		// Objects
		var objects = view.application.objects().map((obj) => {
			return {
				id: obj.id,
				value: obj.label
			}
		});
		objects.unshift({ id: '', value: L('ab.component.datacollection.selectObject', '*Select an object') });

		$$(ids.dataSource).define("options", objects);
		$$(ids.dataSource).refresh();
		$$(ids.dataSource).setValue(view.settings.object || '');


		// populate link data collection options
		this.initLinkDataCollectionOptions(ids, view);

		// populate link fields
		this.initLinkFieldOptions(ids, view);

		// initial populate of popups
		this.populatePopupEditors(view);

		// when a change is made in the properties the popups need to reflect the change
		view.addListener('properties.updated', () => {
			this.populatePopupEditors(view);
		});



	}

	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);


		// if object is changed, then clear filter & sort settings
		if (view.settings.object != $$(ids.dataSource).getValue()) {

			view.settings.objectWorkspace = {
				filterConditions: [],
				sortFields: []
			};

			this.populatePopupEditors(view);

		}


		view.settings.object = $$(ids.dataSource).getValue();

		// get object url
		if (view.settings.object) {
			var obj = view.application.objects(obj => obj.id == view.settings.object)[0];

			view.settings.objectUrl = obj.urlPointer();

			// update label
			view.label = obj.label;
			$$(ids.label).define('value', obj.label);
			$$(ids.label).refresh();
		}
		else {
			delete view.settings.objectUrl;
		}

		// set id of link data collection
		view.settings.linkDataCollection = $$(ids.linkDataSource).getValue();
		if (!view.settings.linkDataCollection)
			delete view.settings.linkDataCollection;

		// set id of link field
		view.settings.linkField = $$(ids.linkField).getValue();
		if (!view.settings.linkField)
			delete view.settings.linkField;


		// populate link data collections
		this.initLinkDataCollectionOptions(ids, view);

		// populate link fields
		this.initLinkFieldOptions(ids, view);

		// refresh data collection
		view.init();

	}


	static initLinkDataCollectionOptions(ids, view) {

		// get linked data collection list
		var rootPage = view.pageRoot();
		var objSource = view.datasource;
		if (objSource != null) {
			var linkFields = objSource.linkFields();
			var linkObjectIds = linkFields.map((f) => f.settings.linkObject);

			var linkDcOptions = [];

			// pull data collections that are link to object
			var linkDcs = rootPage.dataCollections((dc) => {

				return linkObjectIds.filter((objId) => dc.settings.object == objId).length > 0;

			});

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
			var linkFields = linkObject.linkFields().filter((link) => link.settings.linkObject == object.id);

			// pull fields to options
			linkFields.forEach((f) => {
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


	static initPopupEditors(App, _logic) {

		var idBase = 'ABViewDataCollectionPropertyEditor';

		PopupFilterDataTableComponent = new ABPopupFilterDataTable(App, idBase + "_filter");
		PopupFilterDataTableComponent.init({
			// when we make a change in the popups we want to make sure we save the new workspace to the properties to do so just fire an onChange event
			onChange: _logic.onChange
		});

		PopupSortFieldComponent = new ABPopupSortField(App, idBase + "_sort");
		PopupSortFieldComponent.init({
			// when we make a change in the popups we want to make sure we save the new workspace to the properties to do so just fire an onChange event
			onChange: _logic.onChange
		});

	}


	static populatePopupEditors(view) {
		if (view.datasource == null) return;

		// Clone ABObject
		var objectCopy = _.cloneDeep(view.datasource);
		objectCopy.objectWorkspace = view.settings.objectWorkspace;

		// Populate data to popups
		PopupFilterDataTableComponent.objectLoad(objectCopy, view);
		PopupSortFieldComponent.objectLoad(objectCopy, view);

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

		var model = this.model;
		if (model) {

			this.__dataCollection = model.dataCollectionNew();
			this.__dataCollection.attachEvent("onAfterCursorChange", () => {

				var currData = this.getCursor();

				this.emit("changeCursor", currData);

			});

		}

		var linkDc = this.dataCollectionLink;
		if (linkDc) {

			// filter data by match link data collection
			var linkData = linkDc.getCursor();
			this.filterLinkCursor(linkData);

			// add listeners when cursor of link data collection is changed
			// linkDc.removeListener("changeCursor", this.filterLinkCursor)
			// 	.on("changeCursor", this.filterLinkCursor);
			linkDc.on("changeCursor", (currData) => {
				this.filterLinkCursor(currData);
			});

		}

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
		var linkDc = this.dataCollectionLink;
		if (!linkDc) return null;

		var object = linkDc.datasource;
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
		var obj = this.datasource;

		var defaultHeight = 0;
		var minHeight = 0;
		obj._fields.forEach(function (f) {
			if (f.key == "image") {
				if (parseInt(f.settings.useHeight) == 1 && parseInt(f.settings.imageHeight) > minHeight) {
					minHeight = parseInt(f.settings.imageHeight);
				}
			}
		});
		if (minHeight > 0) {
			defaultHeight = minHeight;
		}

		// get ABModel
		var model = obj.model();

		if (component.config.view == 'datatable') {
			if (dc) {
				component.define("datafetch", 20);
				component.define("datathrottle", 500);

				component.data.sync(dc);

				var wheres = this.settings.objectWorkspace.filterConditions || {};
				var sorts = this.settings.objectWorkspace.sortConditions || {};

				// get data to data collection
				var cond = {
					where: {
						where: wheres,
						sort: sorts,
						height: defaultHeight
					},
					limit: 20,
					skip: 0
				}
				model.findAll(cond)
					.then((data) => {
						data.data.forEach((item) => {
							if (item.properties != null && item.properties.height != "undefined" && parseInt(item.properties.height) > 0) {
								item.$height = parseInt(item.properties.height);
							} else if (defaultHeight > 0) {
								item.$height = defaultHeight;
							}
						});
						dc.parse(data);
					});

				component.___AD = component.___AD || {};
				if (component.___AD.onDataRequestEvent) {
					component.detachEvent(component.___AD.onDataRequestEvent);
				}
				component.attachEvent("onDataRequest", function (start, count) {
					var cond = {
						where: {
							where: wheres,
							sort: sorts,
							height: defaultHeight
						},
						limit: count,
						skip: start
					}

					if (component.showProgress)
						component.showProgress({ type: "icon" });

					model.findAll(cond)
						.then((data) => {
							data.data.forEach((item) => {
								if (item.properties != null && item.properties.height != "undefined" && parseInt(item.properties.height) > 0) {
									item.$height = parseInt(item.properties.height);
								} else if (defaultHeight > 0) {
									item.$height = defaultHeight;
								}
							});
							dc.parse(data);

							if (component.hideProgress)
								component.hideProgress();

						})

					return false;	// <-- prevent the default "onDataRequest"
				});
			} else {
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
		}

		component.refresh();

	}


	setCursor(rowId) {

		var dc = this.__dataCollection;
		if (dc) {
			dc.setCursor(rowId);
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


	/**
	 * @method filterLinkCursor
	 * filter data in data collection by match id of link data collection
	 * 
	 * @param {Object} - current data of link data collection
	 */
	filterLinkCursor(linkCursor) {

		var fieldLink = this.fieldLink;

		if (this.__dataCollection && fieldLink) {
			this.__dataCollection.filter((item) => {

				// if cursor is not be set.
				if (linkCursor == null) return true;

				var linkField = item[fieldLink.relationName()];
				if (linkField == null) return false;

				// array - 1:M , M:N
				if (linkField.filter) {
					return linkField.filter((obj) => obj.id == linkCursor.id).length > 0;
				}
				else {
					return (linkField.id || linkField) == linkCursor.id;
				}

			});
		}

	}


}