/*
 * ABViewFormBuilder
 *
 * An ABViewFormBuilder defines a UI label display component.
 *
 */

import ABViewWidget from "./ABViewWidget"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var ABViewFormBuilderPropertyComponentDefaults = {
	formDefinition: {} // JSON
};


var ABViewDefaults = {
	key: 'formBuilder',		// {string} unique key for this view
	icon: 'tasks',			// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.formBuilder' // {string} the multilingual label key for the class label
};

export default class ABViewFormBuilder extends ABViewWidget {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABViewWidget} parent the ABViewWidget this view is a child of. (can be null)
	 */
	constructor(values, application, parent) {

		super(values, application, parent, ABViewDefaults);

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
		return ABViewDefaults;
	}

	///
	/// Instance Methods
	///

	/**
	 * @method toObj()
	 *
	 * properly compile the current state of this ABViewFormBuilder instance
	 * into the values needed for saving.
	 *
	 * @return {json}
	 */
	toObj() {

		// OP.Multilingual.unTranslate(this, this, ['label', 'text']);

		var obj = super.toObj();

		obj.views = [];

		// NOTE: use JSON.stringify to resolve - Uncaught TypeError: this.dataValue.trim is not a function
		if (obj.settings &&
			obj.settings.formDefinition) {
			obj.settings.formDefinition = JSON.stringify(obj.settings.formDefinition);
		}

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

		// NOTE: use JSON.stringify to resolve - Uncaught TypeError: this.dataValue.trim is not a function
		if (this.settings &&
			this.settings.formDefinition &&
			typeof this.settings.formDefinition == "string") {
			this.settings.formDefinition = JSON.parse(this.settings.formDefinition);
		}

	}

	//
	//	Editor Related
	//

	/** 
	 * @method editorComponent
	 * return the Editor for this UI component.
	 * the editor should display either a "block" view or "preview" of 
	 * the current layout of the view.
	 * @return {Component} 
	 */
	editorComponent(App, ) {

		var idBase = 'ABViewFormBuilderEditorComponent_' + this.id;

		return this.component(App, idBase);

	}

	//
	// Property Editor
	// 

	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		var idBase = 'ABViewFormBuilderPropertyEditor';

		let commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);

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
	 * @method component()
	 * return a UI component based upon this view.
	 * @param {obj} App 
	 * @return {obj} UI component
	 */
	component(App, idBase) {

		var idBase = idBase || 'ABViewFormBuilder_' + this.id;
		var ids = {
			component: App.unique(idBase + '_component'),
			formBuilder: App.unique(idBase + '_formBuilder'),
		}

		let _ui = {
			type: "space",
			padding: 17,
			rows: [
				{
					id: ids.component,
					view: 'template',
					borderless: true,
					template: `<div id="${ids.formBuilder}"></div>`,
					css: { "padding": "10px" }
				}
			]
		};

		// make sure each of our child views get .init() called
		let _init = (options) => {

			let elem = document.getElementById(ids.formBuilder);
			if (!elem) return;

			let formDefinition = {};

			if (this.settings &&
				this.settings.formDefinition)
				formDefinition = this.settings.formDefinition;

			// Render Formio's builder
			Formio.builder(elem, formDefinition).then(form => {

				form.on('change', (changed) => {

					// check it has form definition
					if (changed.components) {

						// store JSON from definition
						this.settings.formDefinition = changed;

						this.save();
					}

				});

			});

		};

		let _logic = {

			onShow: () => {
			},

		}

		return {
			ui: _ui,
			init: _init,
			logic: _logic,

			onShow: _logic.onShow
		};

	}

	get formDefinition() {
		return this.settings.formDefinition || {};
	}

}