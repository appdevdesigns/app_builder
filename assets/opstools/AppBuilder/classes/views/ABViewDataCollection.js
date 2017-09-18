/*
 * ABViewDataCollection
 *
 *
 */

import ABView from "./ABView"
import ABPropertyComponent from "../ABPropertyComponent"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var ABViewPropertyComponentDefaults = {
}


var ABViewDefaults = {
	key: 'datacollection',		// {string} unique key for this view
	icon: 'database',		// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.datacollection' // {string} the multilingual label key for the class label
}

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
		this.init();

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

				var parent = this.parentPage;

				parent.dataCollectionSave(this)
					.then(resolve)
					.catch(reject);
			}
		)
	}



	///
	/// Instance Methods
	///

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

			if (DataTable.showProgress == null)
				webix.extend(DataTable, webix.ProgressBar);

			DataTable.clearAll();
			DataTable.showProgress({ type: 'icon' });

			// refresh a data collection
			this.init()
				.then(() => {

					// get data collection & object
					var dc = this.dataCollection();
					var object = this.datasource;

					if (dc != null && object != null) {

						var columns = object.fields().map((f) => {
							return {
								id: f.columnName,
								header: f.label
							};
						});

						DataTable.define("columns", columns);

						if (DataTable.data)
							DataTable.data.sync(dc);

						DataTable.refresh();
					}

					DataTable.hideProgress();


				});

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

		_logic.selectObject = (objectId) => {
			// TODO
		};

		_logic.selectLinkDc = (dataCollectionId) => {
			// TODO
		};

		var commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);

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
						// TODO : link to another data collection
						// {
						// 	view: "select",
						// 	name: "linkedObject",
						// 	label: L('ab.component.datacollection.linkedObject', '*Linked To:'),
						// 	labelWidth: App.config.labelWidthLarge,
						// 	options: [],
						// 	// hidden: 1,
						// 	on: {
						// 		onChange: function (newv, oldv) {
						// 			if (newv == oldv) return;

						// 			_logic.selectLinkDc(newv);
						// 		}
						// 	}
						// },
						// {
						// 	view: "select",
						// 	name: "linkedField",
						// 	label: L('ab.component.datacollection.linkedField', '*Linked Field:'),
						// 	labelWidth: App.config.labelWidthLarge,
						// 	options: [],
						// 	hidden: 1
						// }
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
										// _logic.toolbarFilter(this.$view);
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
										// _logic.toolbarSort(this.$view);
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

	}

	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		view.settings.object = $$(ids.dataSource).getValue();

		// get object url
		if (view.settings.object) {
			var obj = view.application.objects(obj => obj.id == view.settings.object)[0];

			view.settings.objectUrl = obj.urlPointer();

			// update label
			view.label = obj.label;
			// super.propertyEditorPopulate(ids, view);
		}
		else {
			delete view.settings.objectUrl;
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
	* @method dataCollectionRefresh
	* get a data collection to cache
	*
	* @return {Promise}
	*			.resolve()
	*/
	init() {

		return new Promise(
			(resolve, reject) => {

				var obj = this.datasource;
				if (obj == null) return resolve(null);

				var model = obj.model();

				model.findAll({/* TODO : add filter condition */ })
					.catch(reject)
					.then((data) => {

						this.__dataCollection = model.dataCollectionNew(data);

						resolve();

					});

			}
		);

	}

	/**
	* @method dataCollection
	* return a webix's data collection to match object id of this component.
	*
	* @return {Object}
	*/
	dataCollection() {
		return this.__dataCollection;
	}


	/**
	 * @method bind
	 * 
	 * 
	 * @param {Object} component - a webix element instance
	*/
	bind(component) {

		var dc = this.dataCollection();

		if (component.config.view == 'datatable') {
			if (dc)
				component.data.sync(dc);
			else
				component.data.unsync();
		}
		else if (component.bind) {
			if (dc)
				component.bind(dc);
			else
				component.unbind();
		}

		component.refresh();

	}


	setCursor(rowId) {

		var dc = this.dataCollection();
		if (dc) {
			dc.setCursor(rowId);
		}

	}


}