const ABViewFormCheckboxCore = require("../../core/views/ABViewFormCheckboxCore");

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABViewFormCheckbox extends ABViewFormCheckboxCore {

	constructor(values, application, parent, defaultValues) {

		super(values, application, parent, defaultValues);

	}


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

		var idBase = 'ABViewFormCheckboxEditorComponent';
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


	/**
	 * @method component()
	 * return a UI component based upon this view.
	 * @param {obj} App 
	 * @return {obj} UI component
	 */
	component(App) {

		var component = super.component(App);

		var idBase = this.parentFormUniqueID('ABViewFormCheckbox_' + this.id + "_f_");
		var ids = {
			component: App.unique(idBase + '_component'),
		}


		component.ui.id = ids.component;
		component.ui.view = "checkbox";


		// make sure each of our child views get .init() called
		component.init = (options) => {
		}


		return component;
	}

}