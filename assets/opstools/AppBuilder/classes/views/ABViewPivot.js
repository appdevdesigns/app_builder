/*
 * ABViewPivot
 *
 * An ABViewPivot defines a UI label display component.
 *
 */

import ABViewWidget from "./ABViewWidget"
import ABPropertyComponent from "../ABPropertyComponent"

import ABFieldNumber from "../dataFields/ABFieldNumber"
import { runInNewContext } from "vm";

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var ABViewPivotPropertyComponentDefaults = {
	dataviewID: null,
	removeMissed: 0,
	totalColumn: 0,
	separateLabel: 0,
	min: 0,
	max: 0,
	height: 0
}


var ABViewDefaults = {
	key: 'pivot',		// {string} unique key for this view
	icon: 'cube',		// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.pivot' // {string} the multilingual label key for the class label
}


export default class ABViewPivot extends ABViewWidget {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABViewWidget} parent the ABViewWidget this view is a child of. (can be null)
	 */
	constructor(values, application, parent) {
		super(values, application, parent, ABViewDefaults);


	}

	static common() {
		return ABViewDefaults;
	}

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

		obj.views = [];
		obj.settings = obj.settings || {};

		if (this.settings.structure)
			obj.settings.structure = JSON.stringify(this.settings.structure);

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

		// Convert to boolean
		this.settings.removeMissed = JSON.parse(this.settings.removeMissed || ABViewPivotPropertyComponentDefaults.removeMissed);
		this.settings.totalColumn = JSON.parse(this.settings.totalColumn || ABViewPivotPropertyComponentDefaults.totalColumn);
		this.settings.separateLabel = JSON.parse(this.settings.separateLabel || ABViewPivotPropertyComponentDefaults.separateLabel);
		this.settings.min = JSON.parse(this.settings.allowDelete || ABViewPivotPropertyComponentDefaults.min);
		this.settings.max = JSON.parse(this.settings.max || ABViewPivotPropertyComponentDefaults.max);

		if (this.settings.structure && typeof this.settings.structure == 'string')
			this.settings.structure = JSON.parse(this.settings.structure);

		// "0" -> 0
		this.settings.height = parseInt(this.settings.height || ABViewPivotPropertyComponentDefaults.height);

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

		var idBase = 'ABViewPivotEditorComponent';
		var ids = {
			component: App.unique(idBase + '_component')
		};

		var componentBase = this.component(App);
		var component = _.cloneDeep(componentBase);

		component.ui.id = ids.component;
		component.ui.readonly = false;
		component.ui.on = {

			onBeforeApply: (structure) => {

				this.settings.structure = structure;
				this.save();

			}

		};

		component.init = (options) => {

			componentBase.init({
				componentId: ids.component
			});

		};


		return component;

	}

	//
	// Property Editor
	// 

	// static propertyEditorComponent(App) {
	// 	return ABViewPropertyComponent.component(App);
	// }


	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		var commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);

		return commonUI.concat([
			{
				name: 'dataview',
				view: 'richselect',
				label: L('ab.components.pivot.dataSource', "*Data Source"),
				labelWidth: App.config.labelWidthLarge
			},
			{
				view: 'counter',
				name: "height",
				label: L("ab.component.pivot.height", "*Height:"),
				labelWidth: App.config.labelWidthLarge,
			},
			{
				view: "checkbox",
				name: "removeMissed",
				labelRight: L('ab.component.pivot.removeMissed', '*Remove empty data.'),
				labelWidth: App.config.labelWidthCheckbox
			},
			{
				view: "checkbox",
				name: "totalColumn",
				labelRight: L('ab.component.pivot.totalColumn', '*Show a total column.'),
				labelWidth: App.config.labelWidthCheckbox
			},
			{
				view: "checkbox",
				name: "separateLabel",
				labelRight: L('ab.component.pivot.separateLabel', '*Separate header label.'),
				labelWidth: App.config.labelWidthCheckbox
			},
			{
				view: "checkbox",
				name: "min",
				labelRight: L('ab.component.pivot.min', '*Highlighting of a cell(s) with the least value in a row.'),
				labelWidth: App.config.labelWidthCheckbox
			},
			{
				view: "checkbox",
				name: "max",
				labelRight: L('ab.component.pivot.max', '*Highlighting of a cell(s) with the biggest value in a row.'),
				labelWidth: App.config.labelWidthCheckbox
			}
		]);

	}

	static propertyEditorPopulate(App, ids, view) {

		super.propertyEditorPopulate(App, ids, view);

		var dataviewId = (view.settings.dataviewID ? view.settings.dataviewID : null);
		var SourceSelector = $$(ids.dataview);

		// Pull data collections to options
		var dcOptions = view.application.dataviews().map((dc) => {

			return {
				id: dc.id,
				value: dc.label
			};
		});

		dcOptions.unshift({
			id: null,
			value: '[Select]'
		});
		SourceSelector.define('options', dcOptions);
		SourceSelector.define('value', dataviewId);
		SourceSelector.refresh();

		$$(ids.removeMissed).setValue(view.settings.removeMissed);
		$$(ids.totalColumn).setValue(view.settings.totalColumn);
		$$(ids.separateLabel).setValue(view.settings.separateLabel);
		$$(ids.min).setValue(view.settings.min);
		$$(ids.max).setValue(view.settings.max);
		$$(ids.height).setValue(view.settings.height);


	}


	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		view.settings.dataviewID = $$(ids.dataview).getValue();

		view.settings.removeMissed = $$(ids.removeMissed).getValue();
		view.settings.totalColumn = $$(ids.totalColumn).getValue();
		view.settings.separateLabel = $$(ids.separateLabel).getValue();
		view.settings.min = $$(ids.min).getValue();
		view.settings.max = $$(ids.max).getValue();
		view.settings.height = $$(ids.height).getValue();

	}


	/*
	 * @component()
	 * return a UI component based upon this view.
	 * @param {obj} App 
	 * @return {obj} UI component
	 */
	component(App) {

		let baseCom = super.component(App);

		var idBase = 'ABViewPivot_' + this.id;
		var ids = {
			component: App.unique(idBase + '_component'),
		}


		// an ABViewLabel is a simple Label
		var _ui = {
			id: ids.component,
			view: "pivot",
			readonly: true,
			removeMissed: this.settings.removeMissed,
			totalColumn: this.settings.totalColumn,
			separateLabel: this.settings.separateLabel,
			min: this.settings.min,
			max: this.settings.max,
			height: this.settings.height
		};


		// make sure each of our child views get .init() called
		var _init = (options) => {

			options = options || {};
			options.componentId = options.componentId || ids.component;

			return Promise.resolve()

				// get data
				.then(() => {

					return new Promise((next, err) => {

						let dv = this.dataview;
						if (!dv) return next();

						let data = dv.getData();
						if (data.length > 0) return next(data);

						// load data at first

						dv.loadData()
							.catch(err)
							.then(() => {

								next(dv.getData());

							});
					});

				})

				// populate data into pivot
				.then((data) => {

					return new Promise((next, err) => {

						let dv = this.dataview;
						if (!dv) return next();

						let object = dv.datasource;
						if (!object) return next();

						var dataMapped = data.map(d => {

							var result = {};

							object.fields().forEach(f => {

								if (f instanceof ABFieldNumber)
									result[f.columnName] = d[f.columnName];
								else
									result[f.columnName] = f.format(d);

							});

							return result;

						});

						$$(options.componentId).parse(dataMapped);

						next();
					});

				})

				// set pivot configuration
				.then(() => {

					return new Promise((next, err) => {

						if (this.settings.structure)
							$$(options.componentId).setStructure(this.settings.structure);

						next();

					});

				});

		}


		return {
			ui: _ui,
			init: _init,

			onShow: baseCom.onShow
		};

	}

	/*
	 * @method componentList
	 * return the list of components available on this view to display in the editor.
	 */
	componentList() {
		return [];
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

			var reportDef = {
				table: {
					body: []
				}
			};

			var colIds = [];


			// Create pivot widget
			var mockApp = {
				unique: (id) => {
					return "ABViewPivotPDF_MockApp_" + id
				}
			}
			var comp = this.component(mockApp);
			var $pivot = webix.ui(comp.ui);


			// Set data to pivot widget
			comp.init()
				.catch(reject)
				.then(() => {

					var $treetable = $pivot.getChildViews()[1];


					// Headers
					var headers = [];
					$treetable.config.columns.forEach(col => {

						// store id of the column
						colIds.push(col.id);

						var headerText = col.header[0].text;

						// remove html tags
						headerText = headerText.replace(/<(?:.|\n)*?>/gm, '');

						headers.push(headerText);
					});
					reportDef.table.body.push(headers);


					// Data
					$treetable.data.find({}).forEach(d => {

						var rowData = [];

						colIds.forEach(colId => {

							var data = d[colId];

							// add - to prefix
							if (colId == 'name') {
								for (var i = 1; i < d.$level; i++) {
									data = '-' + data;
								}
							}

							// add a row
							rowData.push(data);
						});

						reportDef.table.body.push(rowData);

					});


					resolve(reportDef);

				});


		});

	}

}