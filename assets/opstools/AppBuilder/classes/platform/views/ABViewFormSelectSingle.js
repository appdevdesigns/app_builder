const ABViewFormSelectSingleCore = require("../../core/views/ABViewFormSelectSingleCore");

const ABViewFormSelectSinglePropertyComponentDefaults = ABViewFormSelectSingleCore.defaultValues();

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABViewFormSelectSingle extends ABViewFormSelectSingleCore {

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

		var idBase = 'ABViewFormSelectSingleEditorComponent';
		var ids = {
			component: App.unique(idBase + '_component'),
			options: App.unique(idBase + '_option'),
		}

		var selectlist = this.component(App).ui;
		selectlist.id = ids.component;

		var _ui = {
			rows: [
				selectlist,
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
				label: L('ab.component.selectsingle.type', '*Type'),
				options: [
					{
						id: 'richselect',
						value: L('ab.component.selectsingle.selectlist', '*Select list')
					},
					{
						id: 'radio',
						value: L('ab.component.selectsingle.radio', '*Radio')
					}
				]
			}

		]);

	}

	static propertyEditorPopulate(App, ids, view) {

		super.propertyEditorPopulate(App, ids, view);

		$$(ids.type).setValue(view.settings.type || ABViewFormSelectSinglePropertyComponentDefaults.type);

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
		var field = this.field();


		var idBase = this.parentFormUniqueID('ABViewFormSelectSingle_' + this.id + "_f_");
		var ids = {
			component: App.unique(idBase + '_component'),
		}

		component.ui.view = this.settings.type || ABViewFormSelectSinglePropertyComponentDefaults.type;

		var options = [];

		if (field && field.key == "user")
			options = field.getUsers();
		else if (field)
			options = field.settings.options || this.settings.options || [];
		else
			options = this.settings.options || [];

		component.ui.id = ids.component;
		component.ui.options = options.map((opt) => {
			return {
				id: opt.id,
				value: opt.text || opt.value
			};
		})

		// radio element could not be empty options
		if (component.ui.view == 'radio' && component.ui.options.length < 1) {
			component.ui.options.push({
				id: 'temp',
				value: 'Option'
			});
		}

		// make sure each of our child views get .init() called
		component.init = (options) => {
		}

		return component;
	}

}