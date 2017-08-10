/*
 * ABViewForm
 *
 * An ABViewFormPanel that represents a "Form" in the system.
 *
 *
 */

import ABViewFormPanel from "./ABViewFormPanel"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var ABViewFormDefaults = {
	key: 'form',		// unique key identifier for this ABViewForm
	icon: 'list-alt',		// icon reference: (without 'fa-' )
	labelKey: 'ab.components.form' // {string} the multilingual label key for the class label

}

var ABViewFormPropertyComponentDefaults = {
	showLabel: true,
	labelPosition: 'left',
	labelWidth: 80
}

export default class ABViewForm extends ABViewFormPanel {

	constructor(values, application, parent) {

		super(values, application, parent, ABViewFormDefaults);


		// 	{
		// 		id:'uuid',					// uuid value for this obj
		// 		key:'viewKey',				// unique key for this View Type
		// 		icon:'font',				// fa-[icon] reference for an icon for this View Type
		// 		label:'',					// pulled from translation

		//		settings: {					// unique settings for the type of field
		//		},

		//		translations:[]
		// 	}


	}


	static common() {
		return ABViewFormDefaults;
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

		// convert from "0" => 0
		this.settings.labelWidth = parseInt(this.settings.labelWidth);

	}

	//
	// Property Editor
	// 

	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		var commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);

		return commonUI.concat([
			{
				name: 'object',
				view: 'richselect',
				label: L('ab.components.form.objects', "*Objects")
			},
			{
				name: 'showLabel',
				view: 'checkbox',
				label: L('ab.components.form.showlabel', "*Display Label")
			},
			{
				name: 'labelPosition',
				view: 'richselect',
				label: L('ab.components.form.labelPosition', "*Label Position"),
				options: [
					{
						id: 'left',
						value: L('ab.components.form.left', "*Left")
					},
					{
						id: 'top',
						value: L('ab.components.form.top', "*Top")
					}
				]
			},
			{
				name: 'labelWidth',
				view: 'counter',
				label: L('ab.components.form.labelWidth', "*Label Width"),
			}

		]);

	}

	static propertyEditorPopulate(ids, view) {

		super.propertyEditorPopulate(ids, view);

		var objects = view.application.objects().map((obj) => {
			// label option of webix richselect
			obj.value = obj.label;
			return obj;
		});

		$$(ids.object).define('options', objects);
		$$(ids.object).refresh();

		$$(ids.object).setValue(view.settings.object);
		$$(ids.showLabel).setValue(view.settings.showLabel || ABViewFormPropertyComponentDefaults.showLabel);
		$$(ids.labelPosition).setValue(view.settings.labelPosition || ABViewFormPropertyComponentDefaults.labelPosition);
		$$(ids.labelWidth).setValue(view.settings.labelWidth || ABViewFormPropertyComponentDefaults.labelWidth);
	}

	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		view.settings.object = $$(ids.object).getValue();
		view.settings.showLabel = $$(ids.showLabel).getValue();
		view.settings.labelPosition = $$(ids.labelPosition).getValue();
		view.settings.labelWidth = $$(ids.labelWidth).getValue();

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

		var idBase = 'ABViewForm_' + this.id,
			ids = {
				component: App.unique(idBase + '_component'),
			};


		// an ABViewForm_ is a collection of rows:
		var _ui = {
			id: ids.component,
			view: 'form',
			elements: []
		}

		// insert each of our sub views into our rows:
		viewComponents.forEach((view) => {
			_ui.elements.push(view.ui);
		})


		// make sure each of our child views get .init() called
		var _init = (options) => {
			viewComponents.forEach((view) => {
				if (view.init)
					view.init();
			})

			$$(ids.component).adjust();
		}


		return {
			ui: _ui,
			init: _init
		}
	}


	object() {
		return this.application.objects((obj) => obj.id == this.settings.object)[0];
	}





}
