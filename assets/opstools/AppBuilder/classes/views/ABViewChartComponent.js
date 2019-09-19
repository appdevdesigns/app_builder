/*
 * ABViewChartComponent
 *
 * An ABViewChartComponent defines a UI component that is intended to be part of
 * a chart.   These components are tied to an Object's data field.
 *
 */

import ABViewWidget from "./ABViewWidget"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

export default class ABViewChartComponent extends ABViewWidget {

	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		var commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);

		return commonUI.concat([
			{
				name: 'fieldLabel',
				view: "text",
				disabled: true,
				label: L('ab.component.chart.field.label', '*Field')
			}
		]);

	}

	static propertyEditorPopulate(App, ids, view) {

		super.propertyEditorPopulate(App, ids, view);

		var field = view.field();

		if (field) {
			$$(ids.fieldLabel).setValue(field.label);
		}
	}

	/*
	 * @component()
	 * return a UI component based upon this view.
	 * @param {obj} App 
	 * @return {obj} UI component
	 */
	component(App) {

		// setup 'label' of the element
		var chartView = this.chartComponent(),
			field = this.field(),
			label = '';

		var settings = {};
		if (chartView)
			settings = chartView.settings;

		var isUsers = false;
		if (field.key == "user")
			isUsers = true;

		var templateLabel = '';
		if (settings.showLabel == true) {
			if (settings.labelPosition == 'top')
				templateLabel = "<label style='display:block; text-align: left;' class='webix_inp_top_label'>#label#</label>#display#";
			else
				templateLabel = "<label style='width: #width#px; display: inline-block; float: left; line-height: 32px;'>#label#</label>#display#";
		}

		var template = (templateLabel)
			.replace(/#width#/g, settings.labelWidth)
			.replace(/#label#/g, field.label);
			
		var height = 38;
		if (settings.labelPosition == 'top')
			height = height * 2;

		if (typeof field.settings.useHeight != "undefined" && field.settings.useHeight == 1) {
			height = parseInt(field.settings.imageHeight);
		}

		var _ui = {
			view: "template",
			borderless: true,
			height: height,
			isUsers: isUsers,
			template: template,
			data: { display: '' } // show empty data in template
		};

		// make sure each of our child views get .init() called
		var _init = (options) => {
		}

		var _logic = {

			setValue: (componentId, val) => {

				if ($$(componentId))
					$$(componentId).setValues({ display: val });

			}

		}

		return {
			ui: _ui,
			init: _init,
			logic: _logic
		}

	}

	chartComponent() {
		var form = null;

		var curr = this;
		while (curr.key != 'chart' && !curr.isRoot() && curr.parent) {
			curr = curr.parent;
		}

		if (curr.key == 'chart') {
			form = curr;
		}

		return form;
	}

	field() {

		let chart = this.chartComponent();
		if (chart == null) return null;

		let dataview = chart.dataview;
		if (dataview == null) return null;

		let object = dataview.datasource;
		if (object == null) return null;

		let field = object.fields((v) => v.id == this.settings.fieldId)[0];
		return field;
	}


}