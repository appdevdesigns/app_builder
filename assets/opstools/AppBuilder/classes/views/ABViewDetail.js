/*
 * ABViewDetail
 *
 *
 *
 */

import ABViewDetailPanel from "./ABViewDetailPanel"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var ABViewDetailDefaults = {
	key: 'detail',		// {string} unique key for this view
	icon: 'file-text-o',		// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.detail' // {string} the multilingual label key for the class label
}

var ABViewDetailPropertyComponentDefaults = {
	showLabel: true,
	labelPosition: 'left',
	labelWidth: 80
}

export default class ABViewDetail extends ABViewDetailPanel {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABView} parent the ABView this view is a child of. (can be null)
	 */
	constructor(values, application, parent) {

		super(values, application, parent, ABViewDetailDefaults);

	}

	static common() {
		return ABViewDetailDefaults;
	}


	///
	/// Instance Methods
	///



	//
	// Property Editor
	// 

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
				name: 'showLabel',
				view: 'checkbox',
				label: L('ab.components.detail.showlabel', "*Display Label")
			},
			{
				name: 'labelPosition',
				view: 'richselect',
				label: L('ab.components.detail.labelPosition', "*Label Position"),
				options: [
					{
						id: 'left',
						value: L('ab.components.detail.left', "*Left")
					},
					{
						id: 'top',
						value: L('ab.components.detail.top', "*Top")
					}
				]
			},
			{
				name: 'labelWidth',
				view: 'counter',
				label: L('ab.components.detail.labelWidth', "*Label Width"),
			}

		]);

	}

	static propertyEditorPopulate(ids, view) {

		super.propertyEditorPopulate(ids, view);

		$$(ids.object).enable();
		$$(ids.showLabel).setValue(view.settings.showLabel || ABViewDetailPropertyComponentDefaults.showLabel);
		$$(ids.labelPosition).setValue(view.settings.labelPosition || ABViewDetailPropertyComponentDefaults.labelPosition);
		$$(ids.labelWidth).setValue(view.settings.labelWidth || ABViewDetailPropertyComponentDefaults.labelWidth);
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
	* @param {obj } App 
	* @return {obj } UI component
	*/
	component(App) {

		var idBase = 'ABViewDetail_' + this.id;
		var ids = {
			component: App.unique(idBase + '_component'),
		}


		var _ui = {
			view: 'layout',
			rows: []
		};

		// make sure each of our child views get .init() called
		var _init = (options) => {
		};

		var _logic = {
		};


		return {
			ui: _ui,
			init: _init,
			logic: _logic
		}
	}


	object() {
		return this.application.objects((obj) => obj.id == this.settings.object)[0];
	}




}