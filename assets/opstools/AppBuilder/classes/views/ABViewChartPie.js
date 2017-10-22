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
	dataSource: null,
	columnValue: null,
	columnLabel: null,
	isPercentage: true,
	pieType: 'pie',
	isLegend: true,
	// chartWidth: 600,
	// chartHeight: 400,
	innerFontSize: 12,
	labelFontSize: 12,

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

		this.settings.isPercentage = JSON.parse(this.settings.isPercentage || ABViewChartPiePropertyComponentDefaults.isPercentage);
		this.settings.isLegend = JSON.parse(this.settings.isLegend || ABViewChartPiePropertyComponentDefaults.isLegend);

		// this.settings.chartWidth = parseInt(this.settings.chartWidth || ABViewChartPiePropertyComponentDefaults.chartWidth);
		// this.settings.chartHeight = parseInt(this.settings.chartHeight || ABViewChartPiePropertyComponentDefaults.chartHeight);

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

		var idBase = 'ABViewChartPieEditorComponent';
		var ids = {
			component: App.unique(idBase + '_component')
		}
		var component = this.component(App);
		var _ui = component.ui;
		_ui.id = ids.component;

		var _init = (options) => {
			component.init(options);
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
				name: 'dataSource',
				view: 'richselect',
				label: L('ab.component.chart.pie.dataSource', '*Chart Data')
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
				name: 'columnLabel',
				view: 'richselect',
				label: L('ab.component.chart.pie.columnLabel', '*Label Column')
			},
			{
				name: 'columnValue',
				view: 'richselect',
				label: L('ab.component.chart.pie.columnValue', '*Value Column')
			},
			// {
			// 	name: 'chartWidth',
			// 	view: 'counter',
			// 	min: 1,
			// 	label: L('ab.component.chart.pie.chartWidth', '*Width')
			// },
			// {
			// 	name: 'chartHeight',
			// 	view: 'counter',
			// 	min: 1,
			// 	label: L('ab.component.chart.pie.chartHeight', '*Height')
			// },
			{
				name: 'innerFontSize',
				view: 'counter',
				min: 1,
				label: L('ab.component.chart.pie.innerFontSize', '*Inner Font Size')
			},			
			{
				name: 'labelFontSize',
				view: 'counter',
				min: 1,
				label: L('ab.component.chart.pie.labelFontSize', '*Label Font Size')
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

		this.populateDataCollection(ids, view);
		this.populateFieldOptions(ids, view);

		$$(ids.dataSource).setValue(view.settings.dataSource);

		// Make sure you set the values for this property editor in Webix
		$$(ids.isPercentage).setValue(view.settings.isPercentage != null ? view.settings.isPercentage : ABViewChartPiePropertyComponentDefaults.isPercentage);
		$$(ids.dataSource).setValue(view.settings.dataSource || ABViewChartPiePropertyComponentDefaults.dataSource);
		$$(ids.columnValue).setValue(view.settings.columnValue || ABViewChartPiePropertyComponentDefaults.columnValue);
		$$(ids.columnLabel).setValue(view.settings.columnLabel || ABViewChartPiePropertyComponentDefaults.columnLabel);
		// $$(ids.chartWidth).setValue(view.settings.chartWidth != null ? view.settings.chartWidth : ABViewChartPiePropertyComponentDefaults.chartWidth);
		// $$(ids.chartHeight).setValue(view.settings.chartHeight != null ? view.settings.chartHeight : ABViewChartPiePropertyComponentDefaults.chartHeight);
		$$(ids.innerFontSize).setValue(view.settings.innerFontSize != null ? view.settings.innerFontSize : ABViewChartPiePropertyComponentDefaults.innerFontSize);
		$$(ids.labelFontSize).setValue(view.settings.labelFontSize != null ? view.settings.labelFontSize : ABViewChartPiePropertyComponentDefaults.labelFontSize);
		$$(ids.pieType).setValue(view.settings.pieType != null ? view.settings.pieType : ABViewChartPiePropertyComponentDefaults.pieType);
		$$(ids.isLegend).setValue(view.settings.isLegend != null ? view.settings.isLegend : ABViewChartPiePropertyComponentDefaults.isLegend);
	}


	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		// Retrive the values of your properties from Webix and store them in the view
		view.settings.isPercentage = $$(ids.isPercentage).getValue();
		view.settings.dataSource = $$(ids.dataSource).getValue();
		view.settings.columnValue = $$(ids.columnValue).getValue();
		view.settings.columnLabel = $$(ids.columnLabel).getValue();
		view.settings.pieType = $$(ids.pieType).getValue();
		view.settings.isLegend = $$(ids.isLegend).getValue();
		// view.settings.chartWidth = $$(ids.chartWidth).getValue();
		// view.settings.chartHeight = $$(ids.chartHeight).getValue();
		view.settings.innerFontSize = $$(ids.innerFontSize).getValue();
		view.settings.labelFontSize = $$(ids.labelFontSize).getValue();

		this.populateFieldOptions(ids, view);
	}

	static populateDataCollection(ids, view) {

		// Set the objects you can choose from in the list
		var objectOptions = view.pageRoot().dataCollections().map((dc) => {
			return {
				id: dc.id,
				value: dc.label
			};
		});

		// Add a default option
		var defaultOption = { id: '', value: L('ab.component.label.selectObject', '*Select an object') };
		objectOptions.unshift(defaultOption);

		$$(ids.dataSource).define("options", objectOptions);
		$$(ids.dataSource).refresh();

	}

	static populateFieldOptions(ids, view) {

		// clear options
		$$(ids.columnLabel).define("options", []);
		$$(ids.columnLabel).refresh();

		$$(ids.columnValue).define("options", []);
		$$(ids.columnValue).refresh();


		var dc = view.dataCollection();
		if (dc == null) return;

		var obj = dc.datasource;
		var allFields = obj.fields();
		var numFields = obj.fields((f) => f.key == 'number');


		var convertOption = (opt) => {
			return {
				id: opt.id,
				value: opt.columnName,
				key: opt.key
			}
		};

		var columnLabelOptions = allFields.map(convertOption);
		var columnValueOptions = numFields.map(convertOption);


		var defaultOption = { id: '', value: L('ab.component.label.selectColumn', '*Select a column'), key: '' };
		columnLabelOptions.unshift(defaultOption);
		columnValueOptions.unshift(defaultOption);


		$$(ids.columnLabel).define("options", columnLabelOptions);
		$$(ids.columnLabel).refresh();

		$$(ids.columnValue).define("options", columnValueOptions);
		$$(ids.columnValue).refresh();

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


		var idBase = 'ABViewChartPie_' + this.id;
		var ids = {
			component: App.unique(idBase + '_component'),
		}

		var _ui = {
			id: ids.component,
			cols: []
		};

		var reportData = this.getReportData();

		// if (this.settings.pieType != null ? JSON.parse(this.settings.pieType) : ABViewChartPiePropertyComponentDefaults.pieType) {
		_ui.cols.push({
			view: "chart",
			type: this.settings.pieType != null ? this.settings.pieType : ABViewChartPiePropertyComponentDefaults.pieType,
			value: "#value#",
			color: "#color#",
			legend: this.settings.isLegend == true ? "<div style='font-size:" + this.settings.labelFontSize + "px;'>#label#</div>" : "",
			pieInnerText: "<div style='font-size:" + this.settings.innerFontSize + "px;'>#value#</div>",
			shadow: 1,
			// height: this.settings.chartHeight != null ? this.settings.chartHeight : ABViewChartPiePropertyComponentDefaults.chartHeight,
			// width: this.settings.chartWidth != null ? this.settings.chartWidth : ABViewChartPiePropertyComponentDefaults.chartWidth,
			data: reportData
		});
		// }

		// make sure each of our child views get .init() called
		var _init = (options) => {
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

	/**
	 * @method dataCollection
	 * return ABViewDataCollection of this form
	 * 
	 * @return {ABViewDataCollection}
	 */
	dataCollection() {
		return this.pageRoot().dataCollections((dc) => dc.id == this.settings.dataSource)[0];
	}

	labelField() {
		var dc = this.dataCollection();
		if (!dc) return null;

		var obj = dc.datasource;
		
		return obj.fields((f) => f.id == this.settings.columnLabel)[0]
	}

	valueField() {
		var dc = this.dataCollection();
		if (!dc) return null;

		var obj = dc.datasource;
		
		return obj.fields((f) => f.id == this.settings.columnValue)[0]
	}


	getReportData() {

		var dc = this.dataCollection();
		if (dc == null) return [];

		var obj = dc.datasource;
		var dInfo = dc.getData();

		var colorList = ["#ee4339", "#ee9336", "#eed236", "#d3ee36", "#a7ee70", "#58dccd", "#36abee", "#476cee", "#a244ea", "#e33fc7"];

		var labelCol = this.labelField();
		var valueCol = this.valueField();

		if (!labelCol || !valueCol) return [];

		var labelColName = labelCol.columnName;
		var numberColName = valueCol.columnName;


		var result = [];
		var sumData = {};
		var sumNumber = 0;

		dInfo.forEach((item) => {

			var labelKey = item[labelColName];
			var numberVal = parseFloat(item[numberColName]);

			if (sumData[labelKey] == null) {

				// TODO:
				var label = labelKey;

				// Get label of the connect field
				if (labelCol.key == "connectObject") {
					var relateValues = labelCol.pullRelationValues(item);
					if (relateValues != null)
						label = relateValues.text;
				}

				sumData[labelKey] = {
					label: label,
					value: 0
				};
			}

			sumData[labelKey].value += numberVal;

			sumNumber += numberVal;

		});

		var index = 0;
		for (var key in sumData) {

			var val = sumData[key].value;
			if (val <= 0) continue;

			// Display to percent values
			if (this.settings.isPercentage) {
				val = (val / sumNumber * 100);
				val = Math.round(val * 100) / 100; // round decimal 2 digits
				val = val + ' %';
			}



			result.push({
				label: sumData[key].label,
				value: val,
				color: colorList[index % colorList.length]
			});

			index += 1;
		}

		return result;
	}

}