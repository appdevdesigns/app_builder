/*
 * ABViewChartPie
 *
 * An ABViewChartPie defines a ChartPie view type.
 *
 */

import ABViewChartComponent from "./ABViewChartComponent"
// import ABPropertyComponent from "../ABPropertyComponent"
// import ABViewChart from "./ABViewChart"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var ABViewChartPiePropertyComponentDefaults = {
	pieType: 'pie',
	isLegend: true,
	// chartWidth: 600,
	height: 200,
	innerFontSize: 12,
	labelFontSize: 12,

}


var ABViewDefaults = {
	key: 'pie',		// {string} unique key for this view
	icon: 'pie-chart',		// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.chart.pie' // {string} the multilingual label key for the class label
}



export default class ABViewChartPie extends ABViewChartComponent {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABView} parent the ABView this view is a child of. (can be null)
	 */
	constructor(values, application, parent) {

		super(values, application, parent, ABViewDefaults);

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
	fromValues(values) {

		super.fromValues(values);

		this.settings.isLegend = JSON.parse(this.settings.isLegend || ABViewChartPiePropertyComponentDefaults.isLegend);

		// this.settings.chartWidth = parseInt(this.settings.chartWidth || ABViewChartPiePropertyComponentDefaults.chartWidth);
		this.settings.height = parseInt(this.settings.height || ABViewChartPiePropertyComponentDefaults.height);

		this.settings.innerFontSize = parseInt(this.settings.innerFontSize || ABViewChartPiePropertyComponentDefaults.innerFontSize);
		this.settings.labelFontSize = parseInt(this.settings.labelFontSize || ABViewChartPiePropertyComponentDefaults.labelFontSize);

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

		let idBase = 'ABViewChartPieEditorComponent';
		let ids = {
			component: App.unique(idBase + '_component')
		}
		let component = this.component(App);
		let _ui = component.ui;
		_ui.id = ids.component;

		let _init = () => {
			component.init({
				componentId: ids.component
			});
		};
		let _logic = component.logic;
		let _onShow = component.onShow;

		return {
			ui: _ui,
			init: _init,
			logic: _logic,
			onShow: _onShow
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
				name: 'pieType',
				view: 'richselect',
				label: L('ab.component.chart.pie.pieType', '*Chart Type'),
				labelWidth: App.config.labelWidthLarge,
				options: [
					{ id: 'pie', value: L('ab.component.chart.pie.standard', '*Standard') },
					{ id: 'pie3D', value: L('ab.component.chart.pie.pie3d', '*Pie3D') },
					{ id: 'donut', value: L('ab.component.chart.pie.donut', '*Donut') }
				]
			},
			// {
			// 	name: 'chartWidth',
			// 	view: 'counter',
			// 	min: 1,
			// 	label: L('ab.component.chart.pie.chartWidth', '*Width')
			// },
			{
				name: 'height',
				view: 'counter',
				min: 1,
				label: L('ab.component.chart.pie.chartHeight', '*Height')
			},
			{
				name: 'innerFontSize',
				view: 'counter',
				min: 1,
				label: L('ab.component.chart.pie.innerFontSize', '*Inner Font Size'),
				labelWidth: App.config.labelWidthXLarge
			},
			{
				name: 'labelFontSize',
				view: 'counter',
				min: 1,
				label: L('ab.component.chart.pie.labelFontSize', '*Label Font Size'),
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
		// $$(ids.chartWidth).setValue(view.settings.chartWidth != null ? view.settings.chartWidth : ABViewChartPiePropertyComponentDefaults.chartWidth);
		$$(ids.height).setValue(view.settings.height != null ? view.settings.height : ABViewChartPiePropertyComponentDefaults.height);
		$$(ids.innerFontSize).setValue(view.settings.innerFontSize != null ? view.settings.innerFontSize : ABViewChartPiePropertyComponentDefaults.innerFontSize);
		$$(ids.labelFontSize).setValue(view.settings.labelFontSize != null ? view.settings.labelFontSize : ABViewChartPiePropertyComponentDefaults.labelFontSize);
		$$(ids.pieType).setValue(view.settings.pieType != null ? view.settings.pieType : ABViewChartPiePropertyComponentDefaults.pieType);
		$$(ids.isLegend).setValue(view.settings.isLegend != null ? view.settings.isLegend : ABViewChartPiePropertyComponentDefaults.isLegend);
	}


	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		// Retrive the values of your properties from Webix and store them in the view
		view.settings.pieType = $$(ids.pieType).getValue();
		view.settings.isLegend = $$(ids.isLegend).getValue();
		// view.settings.chartWidth = $$(ids.chartWidth).getValue();
		view.settings.height = $$(ids.height).getValue();
		view.settings.innerFontSize = $$(ids.innerFontSize).getValue();
		view.settings.labelFontSize = $$(ids.labelFontSize).getValue();

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


		var idBase = 'ABViewChartPie_' + this.id;
		var ids = {
			component: App.unique(idBase + '_component'),
		}
		
		var _ui = {
			id: ids.component,
			view: "chart",
			type: this.settings.pieType != null ? this.settings.pieType : ABViewChartPiePropertyComponentDefaults.pieType,
			value: "#value#",
			color: "#color#",
			legend: this.settings.isLegend == true ? "<div style='font-size:" + this.settings.labelFontSize + "px;'>#label#</div>" : "",
			pieInnerText: "<div style='font-size:" + this.settings.innerFontSize + "px;'>#value#</div>",
			shadow: 1,
			height: this.settings.height != null ? this.settings.height : ABViewChartPiePropertyComponentDefaults.height,
			// width: this.settings.chartWidth != null ? this.settings.chartWidth : ABViewChartPiePropertyComponentDefaults.chartWidth,
			// data: reportData
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