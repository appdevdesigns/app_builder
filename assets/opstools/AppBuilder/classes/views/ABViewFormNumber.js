/*
 * ABViewFormNumber
 *
 * An ABViewFormNumber defines a UI check box component.
 *
 */

import ABViewFormField from "./ABViewFormField"
import ABPropertyComponent from "../ABPropertyComponent"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var ABViewFormNumberPropertyComponentDefaults = {
}


var ABViewFormNumberDefaults = {
	key: 'numberbox',		// {string} unique key for this view
	icon: 'hashtag',		// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.number' // {string} the multilingual label key for the class label
}

export default class ABViewFormNumber extends ABViewFormField {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABView} parent the ABView this view is a child of. (can be null)
	 */
	constructor(values, application, parent) {

		super(values, application, parent, ABViewFormNumberDefaults);

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
		return ABViewFormNumberDefaults;
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

		var idBase = 'ABViewFormNumberEditorComponent';
		var ids = {
			component: App.unique(idBase + '_component')
		}


		var numberElem = this.component(App).ui;
		numberElem.id = ids.component;

		var _ui = {
			rows: [
				numberElem,
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


	/*
	 * @component()
	 * return a UI component based upon this view.
	 * @param {obj} App 
	 * @return {obj} UI component
	 */
	component(App) {

		var component = super.component(App);
		var field = this.field();

		var idBase = 'ABViewFormNumber_' + this.id;
		var ids = {
			component: App.unique(idBase + '_component'),
		}


		component.ui.id = ids.component;
		component.ui.view = "counter";
		component.ui.validate = (val) => { return !isNaN(val * 1); };

		// make sure each of our child views get .init() called
		component.init = (options) => {
		}


		return component;
	}


	/*
	 * @method componentList
	 * return the list of components available on this view to display in the editor.
	 */
	componentList() {
		return [];
	}


};