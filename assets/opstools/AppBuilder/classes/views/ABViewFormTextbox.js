/*
 * ABViewFormTextbox
 *
 * An ABViewFormTextbox defines a UI text box component.
 *
 */

import ABViewFormField from "./ABViewFormField"
import ABPropertyComponent from "../ABPropertyComponent"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var ABViewFormTextboxPropertyComponentDefaults = {
	type: 'single' // 'single', 'multiple' or 'rich'
}


var ABViewFormTextboxDefaults = {
	key: 'textbox',		// {string} unique key for this view
	icon: 'i-cursor',		// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.textbox' // {string} the multilingual label key for the class label
}

export default class ABViewFormTextbox extends ABViewFormField {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABView} parent the ABView this view is a child of. (can be null)
	 */
	constructor(values, application, parent) {

		super(values, application, parent, ABViewFormTextboxDefaults);

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
		return ABViewFormTextboxDefaults;
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

		var idBase = 'ABViewFormTextboxEditorComponent';
		var ids = {
			component: App.unique(idBase + '_component')
		}


		var textboxElem = this.component(App).ui;
		textboxElem.id = ids.component;

		var _ui = {
			rows: [
				textboxElem,
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
			{
				name: 'type',
				view: "radio",
				label: L('ab.component.textbox.type', '*Type'),
				vertical: true,
				options: [
					{ id: 'single', value: L('ab.component.textbox.single', '*Single line') },
					{ id: 'multiple', value: L('ab.component.textbox.multiple', '*Multiple lines') },
					{ id: 'rich', value: L('ab.component.textbox.rich', '*Rich editor') }
				]
			}
		]);

	}

	static propertyEditorPopulate(ids, view) {

		super.propertyEditorPopulate(ids, view);


		$$(ids.type).setValue(view.settings.type || ABViewFormTextboxPropertyComponentDefaults.type);


	}

	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);


		view.settings.type = $$(ids.type).getValue();

	}



	/*
	 * @component()
	 * return a UI component based upon this view.
	 * @param {obj} App 
	 * @return {obj} UI component
	 */
	component(App) {

		var component = super.component(App);

		var idBase = 'ABViewFormTextbox_' + this.id;
		var ids = {
			component: App.unique(idBase + '_component'),
		}


		component.ui.id = ids.component;

		switch (this.settings.type || ABViewFormTextboxPropertyComponentDefaults.type) {
			case 'single':
				component.ui.view = "text";
				break;
			case 'multiple':
				component.ui.view = "textarea";
				component.ui.height = 200;
				break;
			case 'rich':
				webix.codebase = "/js/webix/extras/";
				component.ui.view = "tinymce-editor";
				component.ui.height = 200;
				break;
		}


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