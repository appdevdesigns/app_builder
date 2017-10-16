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
	saveLabel: '*save',
	includeCancel: true,
	cancelLabel: '*cancel',
	includeReset: true,
	resetLabel: '*reset',
	afterSave: null,
	afterCancel: null,
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
				name:'saveLabel',
				view: "text",
				label: L('ab.component.button.saveLabel', '*Save'),
				placeholder: L('ab.component.button.saveLabelPlaceholder', '*Save Placeholder'),
			},
			{
				name: 'includeCancel',
				view: 'checkbox',
				label: L('ab.component.button.includeCancel', '*Cancel')
			},
			{
				name:'cancelLabel',
				view: "text",
				label: L('ab.component.button.cancelLabel', '*Cancel'),
				placeholder: L('ab.component.button.cancelLabelPlaceholder', '*Cancel Placeholder'),
			},
			{
				name: 'includeReset',
				view: 'checkbox',
				label: L('ab.component.button.includeReset', '*Reset')
			},
			{
				name:'resetLabel',
				view: "text",
				label: L('ab.component.button.resetLabel', '*Reset'),
				placeholder: L('ab.component.button.resetLabelPlaceholder', '*Reset Placeholder'),
			},
			{
				name: 'afterSave',
				view: 'richselect',
				label: L('ab.component.button.afterSave', '*After Save')
				// options: []
			},
			{
				name: 'afterCancel',
				view: 'richselect',
				label: L('ab.component.button.afterCancel', '*After Cancel')
				// options: []
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

		var pagesList = [];
		var allPage = view.application._pages;
		view.AddPagesToList(pagesList, view.application, view.pageRoot().id);

		var opts = pagesList.map(function (opt) {
			return {
				id: opt.id,
				value: opt.value
			}
		});
		$$(ids.afterSave).define('options', opts);
		$$(ids.afterCancel).define('options', opts);

		$$(ids.includeSave).setValue(view.settings.includeSave != null ? view.settings.includeSave : ABViewFormButtonPropertyComponentDefaults.includeSave);
		$$(ids.saveLabel).setValue(view.settings.saveLabel != null ? view.settings.saveLabel : ABViewFormButtonPropertyComponentDefaults.saveLabel);
		$$(ids.includeCancel).setValue(view.settings.includeCancel != null ? view.settings.includeCancel : ABViewFormButtonPropertyComponentDefaults.includeCancel);
		$$(ids.cancelLabel).setValue(view.settings.cancelLabel != null ? view.settings.cancelLabel : ABViewFormButtonPropertyComponentDefaults.cancelLabel);
		$$(ids.includeReset).setValue(view.settings.includeReset != null ? view.settings.includeReset : ABViewFormButtonPropertyComponentDefaults.includeReset);
		$$(ids.resetLabel).setValue(view.settings.resetLabel != null ? view.settings.resetLabel : ABViewFormButtonPropertyComponentDefaults.resetLabel);
		$$(ids.afterSave).setValue(view.settings.afterSave || ABViewFormButtonPropertyComponentDefaults.afterSave);
		$$(ids.afterCancel).setValue(view.settings.afterCancel || ABViewFormButtonPropertyComponentDefaults.afterCancel);
		$$(ids.alignment).setValue(view.settings.alignment || ABViewFormButtonPropertyComponentDefaults.alignment);

	}

	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		view.settings.includeSave = $$(ids.includeSave).getValue();
		view.settings.saveLabel = $$(ids.saveLabel).getValue();
		view.settings.includeCancel = $$(ids.includeCancel).getValue();
		view.settings.cancelLabel = $$(ids.cancelLabel).getValue();
		view.settings.includeReset = $$(ids.includeReset).getValue();
		view.settings.resetLabel = $$(ids.resetLabel).getValue();
		view.settings.afterSave = $$(ids.afterSave).getValue();
		view.settings.afterCancel = $$(ids.afterCancel).getValue();
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
		var aftersave = this.settings.afterSave || ABViewFormButtonPropertyComponentDefaults.afterSave;
		var aftersave = this.settings.afterCancel || ABViewFormButtonPropertyComponentDefaults.afterCancel;

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
				value: this.settings.cancelLabel != null ? this.settings.cancelLabel : ABViewFormButtonPropertyComponentDefaults.cancelLabel,
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
				value: this.settings.saveLabel != null ? this.settings.saveLabel : ABViewFormButtonPropertyComponentDefaults.saveLabel,
				click: function () {
					_logic.onSave(this);
				}
			});
		}

		// reset button
		if (this.settings.includeReset != null ? JSON.parse(this.settings.includeReset) : ABViewFormButtonPropertyComponentDefaults.includeReset) {
			_ui.cols.push({
				view: "button",
				type: "form",
				width: 80,
				value: this.settings.resetLabel != null ? this.settings.resetLabel : ABViewFormButtonPropertyComponentDefaults.resetLabel,
				click: function () {
					_logic.onClear(this);
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

				super.changePage(this.settings.afterCancel);
			},

			onClear: (resetButton) => {
				// get form component
				var form = this.formComponent();

				// get ABViewDataCollection
				var dc = form.dataCollection();

				// clear cursor of DC
				if (dc) {
					dc.setCursor(null);
				}

				if (resetButton.getFormView())
					resetButton.getFormView().clear();
				
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

				super.changePage(this.settings.afterSave);
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

	AddPagesToList(pagesList, parent, rootPageId) {
	
		if (!parent || !parent.pages || !pagesList) return;

		var pages = parent.pages() || [];

		pages.forEach((page) => {
			if (page.parent != null || page.id == rootPageId) {
				pagesList.push({
					id: page.id,
					value: page.label
				});

				this.AddPagesToList(pagesList, page, page.id);

			};

		});
	}

};