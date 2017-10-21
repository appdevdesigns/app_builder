/*
 * ABViewChartPie
 *
 * An ABViewChartPie defines a ChartPie view type.
 *
 */

import ABPropertyComponent from "../ABPropertyComponent"
import ABViewChart from "./ABViewChart"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var ABViewChartPiePropertyComponentDefaults = {
	dataObject: null,
	columnValue: null,
	columnLabel: null,
	isPercentage: true,
	pieType: 'pie',
	isLegend: true,
	chartWidth: 600,
	chartHeight: 400
}


var ABViewDefaults = {
	key: 'pie',		// {string} unique key for this view
	icon: 'pie-chart',		// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.chart.pie' // {string} the multilingual label key for the class label
}



export default class ABViewChartPie extends ABViewChart {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABView} parent the ABView this view is a child of. (can be null)
	 */
    constructor(values, application, parent) {

    	super( values, application, parent, ABViewDefaults );

    	OP.Multilingual.translate(this, this, ['pieLabel']);

  	}


  	static common() {
  		return ABViewDefaults;
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
	fromValues (values) {

		super.fromValues(values);

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

		var idBase = 'ABViewChartPieEditorComponent';
		var ids = {
			component: App.unique(idBase+'_component')
		}
		var component = this.component(App);
		var _ui = component.ui;
		_ui.id = ids.component;

		var _init = (options) => {
			component.init(options);
		}

		var _logic = component.logic; 

		return {
			ui:_ui,
			init:_init,
			logic:_logic
		}
	}



	//
	// Property Editor
	// 

	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		var commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);
		

		// in addition to the common .label  values, we 
		// ask for:
		return commonUI.concat([
			{
				name: 'dataObject',
				view: 'richselect',
				label: L('ab.component.chart.pie.dataObject', '*Chart Data')
			},
			{
				name: 'columnValue',
				view: 'richselect',
				label: L('ab.component.chart.pie.columnValue', '*Value Column')
			},
			{
				name: 'columnLabel',
				view: 'richselect',
				label: L('ab.component.chart.pie.columnLabel', '*Label Column')
			},
			{
				name: 'pieType',
				view: 'richselect',
				label: L('ab.component.chart.pie.pieType', '*Chart Type'),
				options: [
					{ id: 'pie', value: L('ab.component.chart.pie.standard', '*Standard') },
					{ id: 'pie3D', value: L('ab.component.chart.pie.pie3d', '*Pie3D') },
					{ id: 'donut', value: L('ab.component.chart.pie.donut', '*Donut') }
				]
			},
			{
				name: 'isPercentage',
				view: 'checkbox',
				label: L('ab.component.chart.isPercentage', '*Percentage')
			},
			{
				name: 'isLegend',
				view: 'checkbox',
				label: L('ab.component.chart.isLegend', '*Show Legend')
			},

		]);

	}


	static propertyEditorPopulate(ids, view) {

		super.propertyEditorPopulate(ids, view);
		this.view = view;
		
		$$(ids.dataObject).setValue(view.settings.dataObject);

		view.populateEditor(ids, view);

		// Make sure you set the values for this property editor in Webix
		$$(ids.isPercentage).setValue(view.settings.isPercentage != null ? view.settings.isPercentage : ABViewChartPiePropertyComponentDefaults.isPercentage);
		$$(ids.dataObject).setValue(view.settings.dataObject || ABViewChartPiePropertyComponentDefaults.dataObject);
		$$(ids.columnValue).setValue(view.settings.columnValue || ABViewChartPiePropertyComponentDefaults.columnValue);
		$$(ids.columnLabel).setValue(view.settings.columnLabel || ABViewChartPiePropertyComponentDefaults.columnLabel);
		$$(ids.pieType).setValue(view.settings.pieType != null ? view.settings.pieType : ABViewChartPiePropertyComponentDefaults.pieType);
		$$(ids.isLegend).setValue(view.settings.isLegend != null ? view.settings.isLegend : ABViewChartPiePropertyComponentDefaults.isLegend);
	}


	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		// Retrive the values of your properties from Webix and store them in the view
		view.settings.isPercentage = $$(ids.isPercentage).getValue();
		view.settings.dataObject = $$(ids.dataObject).getValue();
		view.settings.columnValue = $$(ids.columnValue).getValue();
		view.settings.columnLabel = $$(ids.columnLabel).getValue();
		view.settings.pieType = $$(ids.pieType).getValue();
		view.settings.isLegend = $$(ids.isLegend).getValue();
	}


	/*
	 * @component()
	 * return a UI component based upon this view.
	 * @param {obj} App 
	 * @return {obj} UI component
	 */
	component(App) {

		// get a UI component for each of our child views
		var viewComponents = [];
		this.views().forEach((v)=>{
			viewComponents.push(v.component(App));
		})


		var idBase = 'ABViewChartPie_'+this.id;
		var ids = {
			component: App.unique(idBase+'_component'),
		}

		var _ui = {
			id: ids.component,
			cols: []
		};

		// if (this.settings.pieType != null ? JSON.parse(this.settings.pieType) : ABViewChartPiePropertyComponentDefaults.pieType) {
			_ui.cols.push({
				view: "chart",
				type: this.settings.pieType != null ? this.settings.pieType : ABViewChartPiePropertyComponentDefaults.pieType,
				value: "#value#",
				color: "#color#",
				legend: this.settings.isLegend == true ? "#label#" : "",
				pieInnerText: "#value#",
				shadow: 1,
				height: this.settings.chartHeight != null ? this.settings.chartHeight : ABViewChartPiePropertyComponentDefaults.chartHeight,
				width: this.settings.chartWidth != null ? this.settings.chartWidth : ABViewChartPiePropertyComponentDefaults.chartWidth,
				data:
				[
					{ value:"20", label:"Jan", color: "#ee3639" },
					{ value:"30", label:"Feb", color: "#ee9e36" },
					{ value:"50", label:"Mar", color: "#eeea36" },
					{ value:"40", label:"Apr", color: "#a9ee36" },
					{ value:"70", label:"May", color: "#36d3ee" },
					{ value:"80", label:"Jun", color: "#367fee" },
					{ value:"60", label:"Jul", color: "#9b36ee" }
				]
			});
		// }

		// make sure each of our child views get .init() called
		var _init = (options) => {
		}


		var _logic = {
		}


		return {
			ui:_ui,
			init:_init,
			logic:_logic
		}
	}


	/*
	 * @method componentList
	 * return the list of components available on this view to display in the editor.
	 */
	componentList() {
		return [];
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

	populateEditor(ids, view) {

		// Set the objects you can choose from in the list
		var defaultOption = {id:'', value:L('ab.component.label.selectObject', '*Select an object')};

		var objectOptions = view.pageRoot().dataCollections().map((dc) => {
			return {
				id: dc.id,
				value: dc.label
			};
		});
		objectOptions.unshift(defaultOption);
		$$(ids.dataObject).define("options", objectOptions);
		$$(ids.dataObject).refresh();

		if (view.settings.dataObject != '') {
			$$(ids.dataObject).setValue(view.settings.dataObject);
		} else {
			$$(ids.dataObject).setValue('');
		}
		view.populateColumnEditor(ids,view);
	}

	populateColumnEditor(ids,view) {

		var defaultOption = {id:'', value:L('ab.component.label.selectColumn', '*Select a column'), key:''};
		var dc = view.pageRoot().dataCollections().map((dc) => {
			return {
				id: dc.id,
				value: dc.label,
				datasource: dc.datasource
			};
		});

		var columnValueOptions = [];
		var columnLabelOptions = [];

		dc.forEach((data) => {
			var value = data.datasource.fields((f) => f.key == 'number').map((opt) => {
				return {
					id: opt.id,
					value: opt.columnName,
					key: opt.key
				}
			});
			columnValueOptions = value;

			var label = data.datasource.fields().map((opt) => {
				return {
					id: opt.id,
					value: opt.columnName,
					key: opt.key
				}
			});
			columnLabelOptions = label;
		});

		columnValueOptions.unshift(defaultOption);

		$$(ids.columnValue).define("options", columnValueOptions);
		$$(ids.columnValue).refresh();

		if (view.settings.columnValue != '') {
			$$(ids.columnValue).setValue(view.settings.columnValue);
		} else {
			$$(ids.columnValue).setValue('');
		}

		columnLabelOptions.unshift(defaultOption);

		$$(ids.columnLabel).define("options", columnLabelOptions);
		$$(ids.columnLabel).refresh();

		if (view.settings.columnLabel != '') {
			$$(ids.columnLabel).setValue(view.settings.columnLabel);
		} else {
			$$(ids.columnLabel).setValue('');
		}
	}

}