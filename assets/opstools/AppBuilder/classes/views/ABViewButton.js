/*
 * ABViewButton
 *
 * An ABViewButton defines a UI form component.
 *
 */

import ABView from "./ABView"
import ABPropertyComponent from "../ABPropertyComponent"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var ABViewButtonPropertyComponentDefaults = {
	type: 'submit',
	width: 150
}

var ABButtonDefaults = {
	key: 'button',		// {string} unique key for this view
	icon: 'square-o',		// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.button' // {string} the multilingual label key for the class label
}

export default class ABViewButton extends ABView {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABView} parent the ABView this view is a child of. (can be null)
	 */
	constructor(values, application, parent) {

		super(values, application, parent, ABButtonDefaults);

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
		return ABButtonDefaults;
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

		var idBase = 'ABViewButtonEditorComponent';
		var ids = {
			component: App.unique(idBase + '_component')
		}

		var button = this.component(App).ui;
		button.id = ids.component;

		var _ui = {
			rows: [
				{
					cols: [
						{},
						button,
						{}
					]
				},
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
				view: 'richselect',
				label: L('ab.component.button.type', '*Type'),
				options: [
					{
						id: 'submit',
						value: L('ab.component.button.type.submit', '*Submit')
					},
					{
						id: 'cancel',
						value: L('ab.component.button.type.cancel', '*Cancel')
					}
				]
			},
			{
				name: 'width',
				view: 'text',
				label: L('ab.component.button.width', '*Width')
			}
		]);

	}

	static propertyEditorPopulate(ids, view) {

		super.propertyEditorPopulate(ids, view);

		$$(ids.type).setValue(view.settings.type || ABViewButtonPropertyComponentDefaults.type);
		$$(ids.width).setValue(view.settings.width || ABViewButtonPropertyComponentDefaults.width);

	}

	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		view.settings.type = $$(ids.type).getValue();
		view.settings.width = parseInt($$(ids.width).getValue() || 0);

	}



	/*
	 * @component()
	 * return a UI component based upon this view.
	 * @param {obj} App 
	 * @return {obj} UI component
	 */
	component(App) {

		var idBase = 'ABButtonLabel_' + this.id;
		var ids = {
			component: App.unique(idBase + '_component'),
		}


		var _ui = {
			id: ids.component,
			view: "button"
		};

		_ui.width = this.settings.width || ABViewButtonPropertyComponentDefaults.width;

		var buttonType = this.settings.type || ABViewButtonPropertyComponentDefaults.type;
		// Submit
		if (buttonType == 'submit') {
			_ui.type = "form";
			_ui.value = L('ab.component.button.save', '*Save');
		}
		// Cancel
		else {
			_ui.type = "standard";
			_ui.css = "ab-cancel-button";
			_ui.value = L('ab.component.button.cancel', '*Cancel');
		}


		// make sure each of our child views get .init() called
		var _init = (options) => {
		}


		return {
			ui: _ui,
			init: _init
		}
	}


	/*
	 * @method componentList
	 * return the list of components available on this view to display in the editor.
	 */
	componentList() {
		return [];
	}


};