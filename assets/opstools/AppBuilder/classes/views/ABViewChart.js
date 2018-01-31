/*
 * ABViewChart
 *
 * An ABViewChart defines a Chart view type.
 *
 */

// import ABViewWidget from "./ABViewWidget"
import ABViewContainer from "./ABViewContainer"
import ABViewManager from "../ABViewManager"
import ABViewChartComponent from "./ABViewChartComponent"
import ABPropertyComponent from "../ABPropertyComponent"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var ABViewChartPropertyComponentDefaults = {
	dataSource: null,
	columnValue: null,
	columnLabel: null,
	isPercentage: true,
	showLabel: true,
	labelPosition: 'left',
	labelWidth: 120,
	height: 200
}


var ABViewChartDefaults = {
	key: 'chart',		// {string} unique key for this view
	icon: 'bar-chart',		// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.chart' // {string} the multilingual label key for the class label
}



export default class ABViewChart extends ABViewContainer  {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABView} parent the ABView this view is a child of. (can be null)
	 */
    constructor(values, application, parent, defaultValues) {

    	super( values, application, parent, (defaultValues || ABViewChartDefaults) );

    	OP.Multilingual.translate(this, this, ['chartLabel']); 

  	}


  	static common() {
  		return ABViewChartDefaults;
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

		this.settings.isPercentage = JSON.parse(this.settings.isPercentage || ABViewChartPropertyComponentDefaults.isPercentage);
		
		this.settings.labelPosition = this.settings.labelPosition || ABViewChartPropertyComponentDefaults.labelPosition;

		// convert from "0" => true/false
		this.settings.showLabel = JSON.parse(this.settings.showLabel != null ? this.settings.showLabel : ABViewChartPropertyComponentDefaults.showLabel);

		// convert from "0" => 0
		this.settings.labelWidth = parseInt(this.settings.labelWidth || ABViewChartPropertyComponentDefaults.labelWidth);
		this.settings.height = parseInt(this.settings.height || ABViewChartPropertyComponentDefaults.height);

	}

	//
	// Property Editor
	// 

	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		var commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);

		return commonUI.concat([
			{
				name: 'dataSource',
				view: 'richselect',
				label: L('ab.component.chart.pie.dataSource', '*Chart Data'),
				labelWidth: App.config.labelWidthLarge
			},
			{
				name: 'columnLabel',
				view: 'richselect',
				label: L('ab.component.chart.pie.columnLabel', '*Label Column'),
				labelWidth: App.config.labelWidthLarge
			},
			{
				name: 'columnValue',
				view: 'richselect',
				label: L('ab.component.chart.pie.columnValue', '*Value Column'),
				labelWidth: App.config.labelWidthLarge
			},
			{
				name: 'isPercentage',
				view: 'checkbox',
				labelRight: L('ab.component.chart.isPercentage', '*Percentage'),
				labelWidth: App.config.labelWidthCheckbox
			},
			{
				name: 'showLabel',
				view: 'checkbox',
				label: L('ab.components.chart.showlabel', "*Display Label")
			},
			{
				name: 'labelPosition',
				view: 'richselect',
				label: L('ab.components.chart.labelPosition', "*Label Position"),
				options: [
					{
						id: 'left',
						value: L('ab.components.chart.left', "*Left")
					},
					{
						id: 'top',
						value: L('ab.components.chart.top', "*Top")
					}
				]
			},
			{
				name: 'labelWidth',
				view: 'counter',
				label: L('ab.components.chart.labelWidth', "*Label Width"),
			},
			{
				view: 'counter',
				name: "height",
				label: L("ab.component.chart.height", "*Height:"),
				labelWidth: App.config.labelWidthLarge,
			}

		]);

	}


	static propertyEditorPopulate(App, ids, view) {

		super.propertyEditorPopulate(ids, view);

		this.populateDataCollection(ids, view);
		this.populateFieldOptions(ids, view);

		$$(ids.dataSource).setValue(view.settings.dataSource || ABViewChartPropertyComponentDefaults.dataSource);
		$$(ids.columnValue).setValue(view.settings.columnValue || ABViewChartPropertyComponentDefaults.columnValue);
		$$(ids.columnLabel).setValue(view.settings.columnLabel || ABViewChartPropertyComponentDefaults.columnLabel);
		$$(ids.isPercentage).setValue(view.settings.isPercentage != null ? view.settings.isPercentage : ABViewChartPiePropertyComponentDefaults.isPercentage);
		
		$$(ids.showLabel).setValue(view.settings.showLabel || ABViewChartPropertyComponentDefaults.showLabel);
		$$(ids.labelPosition).setValue(view.settings.labelPosition || ABViewChartPropertyComponentDefaults.labelPosition);
		$$(ids.labelWidth).setValue(view.settings.labelWidth || ABViewChartPropertyComponentDefaults.labelWidth);
		$$(ids.height).setValue(view.settings.height || ABViewChartPropertyComponentDefaults.height);

	}


	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		view.settings.dataSource = $$(ids.dataSource).getValue();
		view.settings.columnValue = $$(ids.columnValue).getValue();
		view.settings.columnLabel = $$(ids.columnLabel).getValue();
		view.settings.isPercentage = $$(ids.isPercentage).getValue();

		view.settings.showLabel = $$(ids.showLabel).getValue();
		view.settings.labelPosition = $$(ids.labelPosition).getValue();
		view.settings.labelWidth = $$(ids.labelWidth).getValue();
		view.settings.height = $$(ids.height).getValue();

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
	 * @method componentList
	 * return the list of components available on this view to display in the editor.
	 */
	componentList() {
		var viewsToAllow = ['label', 'pie', 'bar', 'line'/*, 'area'*/],
			allComponents = ABViewManager.allViews();

		var ret = allComponents.filter((c) => {
			return viewsToAllow.indexOf(c.common().key) > -1;
		});
		return ret;
	}

	/*
	 * @component()
	 * return a UI component based upon this view.
	 * @param {obj} App 
	 * @return {obj} UI component
	 */
	component(App) {

		// get a UI component for each of our child views
		var viewComponents = {}; // { viewId: viewComponent }

		var idBase = 'ABViewChart_' + this.id;
		var ids = {
			component: App.unique(idBase + '_component'),
		}

		// get webix.dashboard
		var container = super.component(App);

		var _ui = {
			type: "form",
			borderless: true,
			// height: this.settings.height || ABViewChartPropertyComponentDefaults.height,
			rows: [
				{
					// view: "scrollview",
					body: container.ui
				}
			]
		};

		// make sure each of our child views get .init() called
		var _init = (options) => {
		}

		var _logic = {
		};

		return {
			ui: _ui,
			init: _init,
			logic: _logic
		}
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

			var labelKey = item[labelColName] || item.id;
			var numberVal = parseFloat(item[numberColName] || 0);

			if (sumData[labelKey] == null) {

				var label = labelKey;

				// Get label of the connect field
				if (labelCol.key == "connectObject") {
					var relateValues = labelCol.pullRelationValues(item);
					if (relateValues != null)
						label = relateValues.text;
				}

				sumData[labelKey] = {
					label: label || item.id,
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