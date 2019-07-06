/*
 * ABViewWidget
 *
 * An ABViewWidget defines a UI label display component.
 *
 */

import ABView from "./ABView"
import ABPropertyComponent from "../ABPropertyComponent"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var ABPropertyComponentDefaults = {
	columnSpan: 1,
	rowSpan: 1
}


var ABViewDefaults = {
	key: 'viewwidget',		// {string} unique key for this view
	icon: 'circle-o-notch ',		// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.widget' // {string} the multilingual label key for the class label
}



export default class ABViewWidget extends ABView {


	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABView} parent the ABView this view is a child of. (can be null)
	 * @param {obj} defaultValues special sub class defined default values.
	 */
	constructor(values, application, parent, defaultValues) {

		super(values, application, parent, (defaultValues || ABViewDefaults));

	}

	/**
	 * @method toObj()
	 *
	 * properly compile the current state of this ABView instance
	 * into the values needed for saving to the DB.
	 *
	 * @return {json}
	 */
	toObj() {

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

	}


	//
	// Property Editor
	// 

	// static propertyEditorComponent(App) {
	// 	return ABViewPropertyComponent.component(App);
	// }

	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		var commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);


		// in addition to the common .label  values, we 
		// ask for:
		return commonUI.concat([
			{
				name: 'columnSpan',
				view: 'counter',
				min: 1,
				label: L('ab.components.container.columnSpan', "*Column Span"),

				hidden: true // TODO
			},
			{
				name: 'rowSpan',
				view: 'counter',
				min: 1,
				label: L('ab.components.container.rowSpan', "*Row Span"),

				hidden: true // TODO
			}
		]);

	}


	static propertyEditorPopulate(App, ids, view) {

		super.propertyEditorPopulate(App, ids, view);

		$$(ids.columnSpan).setValue(view.position.dx || ABPropertyComponentDefaults.columnSpan);
		$$(ids.rowSpan).setValue(view.position.dy || ABPropertyComponentDefaults.rowSpan);

	}


	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		view.position.dx = $$(ids.columnSpan).getValue();
		view.position.dy = $$(ids.rowSpan).getValue();

	}


	/**
	 * @function component()
	 * return a UI component based upon this view.
	 * @param {obj} App 
	 * @return {obj} UI component
	 */
	component(App) {

		let base = super.component(App);

		base.onShow = (viewId) => {

			let dc = this.dataCollection; // get from a function or a (get) property
			if (dc &&
				dc.dataStatus == dc.dataStatusFlag.notInitial) {

				// load data when a widget is showing
				dc.loadData();

			}

		}

		return base;
	}

}