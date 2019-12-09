/*
 * ABViewChartBar
 *
 * An ABViewChartBar defines a ChartBar view type.
 *
 */

import ABViewChartComponent from "./ABViewChartComponent"
// import ABPropertyComponent from "../ABPropertyComponent"
// import ABViewChart from "./ABViewChart"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var ABViewChartBarPropertyComponentDefaults = {
	barType: 'bar',
	barPreset: 'column',
	isLegend: true,
	// chartWidth: 600,
	height: 200,
	labelFontSize: 12,
	stepValue: 20,
	maxValue: 100,

}


var ABViewDefaults = {
	key: 'bar',		// {string} unique key for this view
	icon: 'bar-chart',		// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.chart.bar' // {string} the multilingual label key for the class label
}



export default class ABViewChartBar extends ABViewChartComponent {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABView} parent the ABView this view is a child of. (can be null)
	 */
	constructor(values, application, parent) {

		super(values, application, parent, ABViewDefaults);

		OP.Multilingual.translate(this, this, ['barLabel']);

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

		this.settings.isLegend = JSON.parse(this.settings.isLegend || ABViewChartBarPropertyComponentDefaults.isLegend);

		// this.settings.chartWidth = parseInt(this.settings.chartWidth || ABViewChartBarPropertyComponentDefaults.chartWidth);
		this.settings.height = parseInt(this.settings.height || ABViewChartBarPropertyComponentDefaults.height);

		this.settings.labelFontSize = parseInt(this.settings.labelFontSize || ABViewChartBarPropertyComponentDefaults.labelFontSize);
		this.settings.stepValue = parseInt(this.settings.stepValue || ABViewChartBarPropertyComponentDefaults.stepValue);
		this.settings.maxValue = parseInt(this.settings.maxValue || ABViewChartBarPropertyComponentDefaults.maxValue);

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

		let idBase = 'ABViewChartBarEditorComponent';
		let ids = {
			component: App.unique(idBase + '_component')
		};

		let baseEditor = super.editorComponent(App, mode, {
			componentId: ids.component
		});

		return baseEditor;
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
				name: 'barType',
				view: 'richselect',
				label: L('ab.component.chart.bar.barType', '*Chart Type'),
				labelWidth: App.config.labelWidthLarge,
				options: [
					{ id: 'bar', value: L('ab.component.chart.bar.column', '*Vertical') },
					{ id: 'barH', value: L('ab.component.chart.bar.stick', '*Horizontal') }
				]
			},
			{
				name: 'barPreset',
				view: 'richselect',
				label: L('ab.component.chart.bar.barPreset', '*Chart Preset'),
				labelWidth: App.config.labelWidthLarge,
				options: [
					{ id: 'column', value: L('ab.component.chart.bar.column', '*Column') },
					{ id: 'stick', value: L('ab.component.chart.bar.stick', '*Stick') },
					{ id: 'alpha', value: L('ab.component.chart.bar.alpha', '*Alpha') }
				]
			},
			// {
			// 	name: 'chartWidth',
			// 	view: 'counter',
			// 	min: 1,
			// 	label: L('ab.component.chart.bar.chartWidth', '*Width')
			// },
			{
				name: 'height',
				view: 'counter',
				min: 1,
				label: L('ab.component.chart.bar.chartHeight', '*Height')
			},
			{
				name: 'stepValue',
				view: 'counter',
				min: 1,
				label: L('ab.component.chart.bar.stepValue', '*Step')
			},
			{
				name: 'maxValue',
				view: 'counter',
				min: 1,
				label: L('ab.component.chart.bar.maxValue', '*Max Value')
			},
			{
				name: 'labelFontSize',
				view: 'counter',
				min: 1,
				label: L('ab.component.chart.bar.labelFontSize', '*Label Font Size'),
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
		// $$(ids.chartWidth).setValue(view.settings.chartWidth != null ? view.settings.chartWidth : ABViewChartBarPropertyComponentDefaults.chartWidth);
		$$(ids.height).setValue(view.settings.height != null ? view.settings.height : ABViewChartBarPropertyComponentDefaults.height);
		$$(ids.labelFontSize).setValue(view.settings.labelFontSize != null ? view.settings.labelFontSize : ABViewChartBarPropertyComponentDefaults.labelFontSize);
		$$(ids.stepValue).setValue(view.settings.stepValue != null ? view.settings.stepValue : ABViewChartBarPropertyComponentDefaults.stepValue);
		$$(ids.maxValue).setValue(view.settings.maxValue != null ? view.settings.maxValue : ABViewChartBarPropertyComponentDefaults.maxValue);
		$$(ids.barType).setValue(view.settings.barType != null ? view.settings.barType : ABViewChartBarPropertyComponentDefaults.barType);
		$$(ids.barPreset).setValue(view.settings.barPreset != null ? view.settings.barPreset : ABViewChartBarPropertyComponentDefaults.barPreset);
		$$(ids.isLegend).setValue(view.settings.isLegend != null ? view.settings.isLegend : ABViewChartBarPropertyComponentDefaults.isLegend);
	}


	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		// Retrive the values of your properties from Webix and store them in the view
		view.settings.barType = $$(ids.barType).getValue();
		view.settings.barPreset = $$(ids.barPreset).getValue();
		view.settings.isLegend = $$(ids.isLegend).getValue();
		// view.settings.chartWidth = $$(ids.chartWidth).getValue();
		view.settings.height = $$(ids.height).getValue();
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

		let baseComp = super.component(App);

		// get a UI component for each of our child views
		var viewComponents = [];
		this.views().forEach((v) => {
			viewComponents.push(v.component(App));
		})


		var idBase = 'ABViewChartBar_' + this.id;
		var ids = {
			component: App.unique(idBase + '_component'),
		}


		if (this.settings.barType == "bar" || this.settings.barType == null) {
			var _ui = {
				id: ids.component,
				view: "chart",
				type: this.settings.barType != null ? this.settings.barType : ABViewChartBarPropertyComponentDefaults.barType,
				preset: this.settings.barPreset != null ? this.settings.barPreset : ABViewChartBarPropertyComponentDefaults.barPreset,
				value: "#value#",
				color: "#color#",
				yAxis: {
					start: 0,
					step:  this.settings.stepValue != null ? this.settings.stepValue : ABViewChartBarPropertyComponentDefaults.stepValue,//"#stepValue#",
					end:  this.settings.maxValue != null ? this.settings.maxValue : ABViewChartBarPropertyComponentDefaults.maxValue,//"#maxValue#"
				},
				xAxis: {
					template: this.settings.isLegend == true ? "<div style='font-size:" + this.settings.labelFontSize + "px;'>#label#</div>" : ""
				},
				legend: this.settings.isLegend == true ? "<div style='font-size:" + this.settings.labelFontSize + "px;'>#label#</div>" : "",
				height: this.settings.height != null ? this.settings.height : ABViewChartBarPropertyComponentDefaults.height,
				// width: this.settings.chartWidth != null ? this.settings.chartWidth : ABViewChartBarPropertyComponentDefaults.chartWidth,
				// data: reportData
			};
		}
		else {
			var _ui = {
				id: ids.component,
				view: "chart",
				type: this.settings.barType != null ? this.settings.barType : ABViewChartBarPropertyComponentDefaults.barType,
				preset: this.settings.barPreset != null ? this.settings.barPreset : ABViewChartBarPropertyComponentDefaults.barPreset,
				value: "#value#",
				color: "#color#",
				yAxis: {
					template: this.settings.isLegend == true ? "<div style='font-size:" + this.settings.labelFontSize + "px;'>#label#</div>" : ""	
				},
				xAxis: {
					start: 0,
					step: "#stepValue#",
					end: "#maxValue#"
				},
				legend: this.settings.isLegend == true ? {
					template: "<div style='font-size:" + this.settings.labelFontSize + "px;'>#label#</div>",
					values: [] // TODO : bug in webix 5.1.7
				} : null,
				height: this.settings.height != null ? this.settings.height : ABViewChartBarPropertyComponentDefaults.height,
				// width: this.settings.chartWidth != null ? this.settings.chartWidth : ABViewChartBarPropertyComponentDefaults.chartWidth,
				// data: reportData
			};

		};

		let _init = () => {
			baseComp.init({
				componentId: ids.component
			});
		};
		let _logic = baseComp.logic;
		let _onShow = baseComp.onShow;


		return {
			ui: _ui,
			init: _init,
			logic: _logic,

			onShow: _onShow
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