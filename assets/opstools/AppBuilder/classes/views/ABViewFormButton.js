/*
 * ABViewFormButton
 *
 * An ABViewFormButton defines a UI form component.
 *
 */

import ABView from "./ABView"
import ABPropertyComponent from "../ABPropertyComponent"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var ABViewFormButtonPropertyComponentDefaults = {
	includeSave: true,
	includeCancel: true,
	alignment: 'right'
}

var ABViewFormButtonDefaults = {
	key: 'button',		// {string} unique key for this view
	icon: 'square',		// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.button' // {string} the multilingual label key for the class label
}

export default class ABViewFormButton extends ABView {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABView} parent the ABView this view is a child of. (can be null)
	 */
	constructor(values, application, parent) {

		super(values, application, parent, ABViewFormButtonDefaults);

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
		return ABViewFormButtonDefaults;
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

		var idBase = 'ABViewFormButtonEditorComponent';
		var ids = {
			component: App.unique(idBase + '_component')
		}

		var button = this.component(App).ui;
		button.id = ids.component;

		var _ui = {
			rows: [
				button,
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
				name: 'includeSave',
				view: 'checkbox',
				label: L('ab.component.button.includeSave', '*Save')
			},
			{
				name: 'includeCancel',
				view: 'checkbox',
				label: L('ab.component.button.includeCancel', '*Cancel')
			},
			{
				name: 'alignment',
				view: 'richselect',
				label: L('ab.component.button.alignment', '*Alignment'),
				options: [
					{ id: 'left', value: L('ab.component.button.alignment.left', '*Left') },
					{ id: 'center', value: L('ab.component.button.alignment.center', '*Center') },
					{ id: 'right', value: L('ab.component.button.alignment.right', '*Right') }
				]
			}
		]);

	}

	static propertyEditorPopulate(ids, view) {

		super.propertyEditorPopulate(ids, view);

		$$(ids.includeSave).setValue(view.settings.includeSave != null ? view.settings.includeSave : ABViewFormButtonPropertyComponentDefaults.includeSave);
		$$(ids.includeCancel).setValue(view.settings.includeCancel != null ? view.settings.includeCancel : ABViewFormButtonPropertyComponentDefaults.includeCancel);
		$$(ids.alignment).setValue(view.settings.alignment || ABViewFormButtonPropertyComponentDefaults.alignment);

	}

	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		view.settings.includeSave = $$(ids.includeSave).getValue();
		view.settings.includeCancel = $$(ids.includeCancel).getValue();
		view.settings.alignment = $$(ids.alignment).getValue();

	}



	/**
	 * @method component()
	 * return a UI component based upon this view.
	 * @param {obj} App 
	 * @return {obj} UI component
	 */
	component(App) {

		var idBase = 'ABViewFormButton_' + this.id;
		var ids = {
			component: App.unique(idBase + '_component'),
		}


		var _ui = {
			id: ids.component,
			cols: []
		};

		var alignment = this.settings.alignment || ABViewFormButtonPropertyComponentDefaults.alignment;

		// spacer
		if (alignment == 'center' || alignment == 'right') {
			_ui.cols.push({});
		}

		// cancel button
		if (this.settings.includeCancel != null ? JSON.parse(this.settings.includeCancel) : ABViewFormButtonPropertyComponentDefaults.includeCancel) {
			_ui.cols.push({
				view: "button",
				type: "standard",
				css: "ab-cancel-button",
				width: 80,
				value: L('ab.component.button.cancel', '*Cancel'),
				click: function () {
					_logic.onCancel(this);
				}
			});
		}

		// save button
		if (this.settings.includeSave != null ? JSON.parse(this.settings.includeSave) : ABViewFormButtonPropertyComponentDefaults.includeSave) {
			_ui.cols.push({
				view: "button",
				type: "form",
				width: 80,
				value: L('ab.component.button.save', '*Save'),
				click: function () {
					_logic.onSave(this);
				}
			});
		}

		// spacer
		if (alignment == 'center' || alignment == 'left') {
			_ui.cols.push({});
		}

		// make sure each of our child views get .init() called
		var _init = (options) => {
		};

		var _logic = {

			onCancel: (cancelButton) => {
				// get form component
				var form = this.formComponent();

				// get ABViewDataCollection
				var dc = form.dataCollection();

				// clear cursor of DC
				if (dc) {
					dc.setCursor(null);
				}

				if (cancelButton.getFormView())
					cancelButton.getFormView().clear();
			},

			onSave: (saveButton) => {

				// get form component
				var form = this.formComponent();
				var formView = saveButton.getFormView();

				// disable the save button
				saveButton.disable();

				// save data
				form.saveData(formView)
					.catch(() => { saveButton.enable(); })
					.then(() => { saveButton.enable(); });

			},

		};


		return {
			ui: _ui,
			init: _init,
			logic: _logic
		}
	}


	/**
	 * @method componentList
	 * return the list of components available on this view to display in the editor.
	 */
	componentList() {
		return [];
	}


	/**
	 * @method formComponent
	 * return the list of components available on this view to display in the editor.
	 */
	formComponent() {
		var form = null;

		var curr = this;
		while (curr.key != 'form' && !curr.isRoot() && curr.parent) {
			curr = curr.parent;
		}

		if (curr.key == 'form') {
			form = curr;
		}

		return form;
	}



};