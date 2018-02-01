/*
 * ABViewChartArea
 *
 * An ABViewChartArea defines a ChartArea view type.
 *
 */

import ABViewWidget from "./ABViewWidget"
import ABPropertyComponent from "../ABPropertyComponent"
// import ABViewChart from "./ABViewChart"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var ABViewChartAreaPropertyComponentDefaults = {
	areaType: 'area',
	isLegend: true,
	// chartWidth: 600,
	// chartHeight: 400,
	labelFontSize: 12,
	stepValue: 20,
	maxValue: 100,

}


var ABViewDefaults = {
	key: 'area',		// {string} unique key for this view
	icon: 'area-chart',		// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.chart.area' // {string} the multilingual label key for the class label
}



export default class ABViewChartArea extends ABViewWidget {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABView} parent the ABView this view is a child of. (can be null)
	 */
	constructor(values, application, parent) {

		super(values, application, parent, ABViewDefaults);

		OP.Multilingual.translate(this, this, ['areaLabel']);

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
	fromValues(values) {

		super.fromValues(values);

		this.settings.isLegend = JSON.parse(this.settings.isLegend || ABViewChartAreaPropertyComponentDefaults.isLegend);

		// this.settings.chartWidth = parseInt(this.settings.chartWidth || ABViewChartAreaPropertyComponentDefaults.chartWidth);
		// this.settings.chartHeight = parseInt(this.settings.chartHeight || ABViewChartAreaPropertyComponentDefaults.chartHeight);

		this.settings.labelFontSize = parseInt(this.settings.labelFontSize || ABViewChartAreaPropertyComponentDefaults.labelFontSize);
		this.settings.stepValue = parseInt(this.settings.stepValue || ABViewChartAreaPropertyComponentDefaults.stepValue);
		this.settings.maxValue = parseInt(this.settings.maxValue || ABViewChartAreaPropertyComponentDefaults.maxValue);

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

		var idBase = 'ABViewChartAreaEditorComponent';
		var ids = {
			component: App.unique(idBase + '_component')
		}
		var component = this.component(App);
		var _ui = component.ui;
		_ui.id = ids.component;

		var _init = (options) => {
			var reportData = this.parent.getReportData();
			$$(ids.component).data.sync(reportData);
		}

		var _logic = component.logic;

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


		// in addition to the common .label  values, we 
		// ask for:
		return commonUI.concat([
			{
				name: 'areaType',
				view: 'richselect',
				label: L('ab.component.chart.area.areaType', '*Chart Type'),
				labelWidth: App.config.labelWidthLarge,
				options: [
					{ id: 'area', value: L('ab.component.chart.area.area', '*Area') },
					{ id: 'stackedArea', value: L('ab.component.chart.area.stackedArea', '*Stacked Area') }
				]
			},
			// {
			// 	name: 'chartWidth',
			// 	view: 'counter',
			// 	min: 1,
			// 	label: L('ab.component.chart.area.chartWidth', '*Width')
			// },
			// {
			// 	name: 'chartHeight',
			// 	view: 'counter',
			// 	min: 1,
			// 	label: L('ab.component.chart.area.chartHeight', '*Height')
			// },
			{
				name: 'stepValue',
				view: 'counter',
				min: 1,
				label: L('ab.component.chart.area.stepValue', '*Step')
			},
			{
				name: 'maxValue',
				view: 'counter',
				min: 1,
				label: L('ab.component.chart.area.maxValue', '*Max Value')
			},
			{
				name: 'labelFontSize',
				view: 'counter',
				min: 1,
				label: L('ab.component.chart.area.labelFontSize', '*Label Font Size'),
				labelWidth: App.config.labelWidthXLarge
			},
			{
				name: 'isLegend',
				view: 'checkbox',
				labelRight: L('ab.component.chart.isLegend', '*Show Legend'),
				labelWidth: App.config.labelWidthCheckbox
			},

		]);

	}


	static propertyEditorPopulate(App, ids, view) {

		super.propertyEditorPopulate(App, ids, view);

		// Make sure you set the values for this property editor in Webix
		// $$(ids.chartWidth).setValue(view.settings.chartWidth != null ? view.settings.chartWidth : ABViewChartAreaPropertyComponentDefaults.chartWidth);
		// $$(ids.chartHeight).setValue(view.settings.chartHeight != null ? view.settings.chartHeight : ABViewChartAreaPropertyComponentDefaults.chartHeight);
		$$(ids.labelFontSize).setValue(view.settings.labelFontSize != null ? view.settings.labelFontSize : ABViewChartAreaPropertyComponentDefaults.labelFontSize);
		$$(ids.stepValue).setValue(view.settings.stepValue != null ? view.settings.stepValue : ABViewChartAreaPropertyComponentDefaults.stepValue);
		$$(ids.maxValue).setValue(view.settings.maxValue != null ? view.settings.maxValue : ABViewChartAreaPropertyComponentDefaults.maxValue);
		$$(ids.areaType).setValue(view.settings.areaType != null ? view.settings.areaType : ABViewChartAreaPropertyComponentDefaults.areaType);
		$$(ids.isLegend).setValue(view.settings.isLegend != null ? view.settings.isLegend : ABViewChartAreaPropertyComponentDefaults.isLegend);
	}


	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		// Retrive the values of your properties from Webix and store them in the view
		view.settings.areaType = $$(ids.areaType).getValue();
		view.settings.isLegend = $$(ids.isLegend).getValue();
		// view.settings.chartWidth = $$(ids.chartWidth).getValue();
		// view.settings.chartHeight = $$(ids.chartHeight).getValue();
		view.settings.labelFontSize = $$(ids.labelFontSize).getValue();
		view.settings.stepValue = $$(ids.stepValue).getValue();
		view.settings.maxValue = $$(ids.maxValue).getValue();

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
		this.views().forEach((v) => {
			viewComponents.push(v.component(App));
		})


		var idBase = 'ABViewChartArea_' + this.id;
		var ids = {
			component: App.unique(idBase + '_component'),
		}

		var _ui = {
			id: ids.component,
			view: "chart",
			type: this.settings.areaType != null ? this.settings.areaType : ABViewChartAreaPropertyComponentDefaults.areaType,
			yAxis: {
				start: 0,
				step:  this.settings.stepValue != null ? this.settings.stepValue : ABViewChartAreaPropertyComponentDefaults.stepValue,//"#stepValue#",
				end:  this.settings.maxValue != null ? this.settings.maxValue : ABViewChartAreaPropertyComponentDefaults.maxValue,//"#maxValue#"
			},
			xAxis: {
				template: this.settings.isLegend == true ? "<div style='font-size:" + this.settings.labelFontSize + "px;'>#label#</div>" : ""
			},
			// legend: this.settings.isLegend == true ? "<div style='font-size:" + this.settings.labelFontSize + "px;'>#label#</div>" : "",
			series: [ 
				{
					alpha: 0.7,
					value: "#value#",
					color: "#ee4339",
				},
				{
					alpha: 0.4,
					value: "#value2#",
					color: "#a7ee70",
				}
			],
			// height: this.settings.chartHeight != null ? this.settings.chartHeight : ABViewChartAreaPropertyComponentDefaults.chartHeight,
			// width: this.settings.chartWidth != null ? this.settings.chartWidth : ABViewChartAreaPropertyComponentDefaults.chartWidth,
			// data: reportData
		};

		// make sure each of our child views get .init() called
		var _init = (options) => {
			var reportData = this.parent.getReportData();
			$$(ids.component).data.sync(reportData);
		}


		var _logic = {
		}


		return {
			ui: _ui,
			init: _init,
			logic: _logic
		}
	}


	/*
	 * @method componentList
	 * return the list of components available on this view to display in the editor.
	 */
	componentList() {
		return [];
	}

}