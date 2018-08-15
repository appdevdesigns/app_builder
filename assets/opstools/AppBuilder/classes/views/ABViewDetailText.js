/*
 * ABViewDetailText
 *
 * An ABViewDetailText defines a UI string component in the detail component.
 *
 */

import ABViewDetailComponent from "./ABViewDetailComponent"
import ABPropertyComponent from "../ABPropertyComponent"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var ABViewDetailTextPropertyComponentDefaults = {
}


var ABViewDetailTextDefaults = {
	key: 'detailtext',		// {string} unique key for this view
	icon: 'etsy',			// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.detail.text' // {string} the multilingual label key for the class label
}


export default class ABViewDetailText extends ABViewDetailComponent {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABView} parent the ABView this view is a child of. (can be null)
	 */
	constructor(values, application, parent) {

		super(values, application, parent, ABViewDetailTextDefaults);

		// OP.Multilingual.translate(this, this, ['text']);

		// 	{
		// 		id:'uuid',					// uuid value for this obj
		// 		key:'viewKey',				// unique key for this View Type
		// 		icon:'font',				// fa-[icon] reference for an icon for this View Type
		// 		label:'',					// pulled from translation

		//		settings: {					// unique settings for the type of field
		//			format: x				// the display style of the text
		//		},

		// 		views:[],					// the child views contained by this view.

		//		translations:[]				// text: the actual text being displayed by this label.

		// 	}

	}


	static common() {
		return ABViewDetailTextDefaults;
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

		var idBase = 'ABViewDetailTextEditorComponent';
		var ids = {
			component: App.unique(idBase + '_component')
		}


		var textElem = this.component(App).ui;
		textElem.id = ids.component;

		var _ui = {
			rows: [
				textElem,
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

		var idBase = 'ABViewDetailText_' + (idPrefix || '') + this.id;
		var ids = {
			component: App.unique(idBase + '_component'),
		}

		component.ui.id = ids.component;

		component.ui.css = "ab-text";

		return {
			ui: component.ui,
			init: component.init,

			logic: {

				setValue: (val) => {

					component.logic.setValue(ids.component, val);

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


}