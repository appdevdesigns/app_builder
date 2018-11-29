/*
 * ABViewDetailCheckbox
 *
 * An ABViewDetailCheckbox defines a UI string component in the detail component.
 *
 */

import ABViewDetailComponent from "./ABViewDetailComponent"
import ABPropertyComponent from "../ABPropertyComponent"
// import { resolve } from "app_builder/node_modules/url";

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var ABViewDetailCheckboxPropertyComponentDefaults = {
}


var ABViewDetailCheckboxDefaults = {
	key: 'detailcheckbox',		// {string} unique key for this view
	icon: 'check-square-o',		// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.detail.checkbox' // {string} the multilingual label key for the class label
}


export default class ABViewDetailCheckbox extends ABViewDetailComponent {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABView} parent the ABView this view is a child of. (can be null)
	 */
	constructor(values, application, parent) {

		super(values, application, parent, ABViewDetailCheckboxDefaults);

	}


	static common() {
		return ABViewDetailCheckboxDefaults;
	}

	///
	/// Instance Methods
	///

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

		var idBase = 'ABViewDetailCheckboxEditorComponent';
		var ids = {
			component: App.unique(idBase + '_component')
		}


		var checkboxElem = this.component(App).ui;
		checkboxElem.id = ids.component;

		var _ui = {
			rows: [
				checkboxElem,
				{}
			]
		};

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



	//
	// Property Editor
	// 

	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		var commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);


		// in addition to the common .label  values, we 
		// ask for:
		return commonUI.concat([
		]);

	}

	static propertyEditorPopulate(App, ids, view) {

		super.propertyEditorPopulate(App, ids, view);

	}

	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

	}



	/**
	 * @component()
	 * return a UI component based upon this view.
	 * @param {obj} App 
	 * @param {string} idPrefix
	 * 
	 * @return {obj} UI component
	 */
	component(App, idPrefix) {

		var component = super.component(App);

		var idBase = 'ABViewDetailCheckbox_' + (idPrefix || '') + this.id;
		var ids = {
			component: App.unique(idBase + '_component'),
		}

		component.ui.id = ids.component;

		return {
			ui: component.ui,
			init: component.init,

			logic: {

				setValue: (val) => {

					var checkbox = '';

					// Check
					if (val && JSON.parse(val))
						checkbox = '<span class="check webix_icon fa fa-check-square-o"></span>';
					// Uncheck
					else
						checkbox = '<span class="check webix_icon fa fa-square-o"></span>';

					component.logic.setValue(ids.component, checkbox);

				}

			}
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

			var reportDef = {};

			var detailCom = this.detailComponent();
			if (!detailCom) return resolve(reportDef);

			var field = this.field();
			if (!field) return resolve(reportDef);

			var text = "";

			var currData = this.getCurrentData();
			if (currData) {
				// TODO : Support multilingual
				text = currData ? "Yes" : "No";
			}

			reportDef = {
				columns: [
					{
						bold: true,
						text: field.label,
						width: detailCom.settings.labelWidth
					},
					{
						text: text
					}
				]
			};

			resolve(reportDef);

		});

	}


}