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
	includeReset: false,
	resetLabel: '*reset',
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
				labelWidth: App.config.labelWidthLarge,
				label: L('ab.component.button.saveLabel', '*Save Label'),
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
				labelWidth: App.config.labelWidthLarge,
				label: L('ab.component.button.cancelLabel', '*Cancel Label'),
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
				labelWidth: App.config.labelWidthLarge,
				label: L('ab.component.button.resetLabel', '*Reset Label'),
				placeholder: L('ab.component.button.resetLabelPlaceholder', '*Reset Placeholder'),
			},
			{
				name: 'afterCancel',
				view: 'richselect',
				labelWidth: App.config.labelWidthLarge,
				label: L('ab.component.button.afterCancel', '*After Cancel')
				// options: []
			},
			{
				name: 'alignment',
				view: 'richselect',
				labelWidth: App.config.labelWidthLarge,
				label: L('ab.component.button.alignment', '*Alignment'),
				options: [
					{ id: 'left', value: L('ab.component.button.alignment.left', '*Left') },
					{ id: 'center', value: L('ab.component.button.alignment.center', '*Center') },
					{ id: 'right', value: L('ab.component.button.alignment.right', '*Right') }
				]
			}
		]);

	}

	static propertyEditorPopulate(App, ids, view) {

		super.propertyEditorPopulate(App, ids, view);

		var pagesList = [];
		var allPage = view.application._pages;
		view.AddPagesToList(pagesList, view.application, view.pageRoot().id);

		var opts = pagesList.map(function (opt) {
			return {
				id: opt.id,
				value: opt.value
			}
		});
		$$(ids.afterCancel).define('options', opts);

		$$(ids.includeSave).setValue(view.settings.includeSave != null ? view.settings.includeSave : ABViewFormButtonPropertyComponentDefaults.includeSave);
		$$(ids.saveLabel).setValue(view.settings.saveLabel != null ? view.settings.saveLabel : ABViewFormButtonPropertyComponentDefaults.saveLabel);
		$$(ids.includeCancel).setValue(view.settings.includeCancel != null ? view.settings.includeCancel : ABViewFormButtonPropertyComponentDefaults.includeCancel);
		$$(ids.cancelLabel).setValue(view.settings.cancelLabel != null ? view.settings.cancelLabel : ABViewFormButtonPropertyComponentDefaults.cancelLabel);
		$$(ids.includeReset).setValue(view.settings.includeReset != null ? view.settings.includeReset : ABViewFormButtonPropertyComponentDefaults.includeReset);
		$$(ids.resetLabel).setValue(view.settings.resetLabel != null ? view.settings.resetLabel : ABViewFormButtonPropertyComponentDefaults.resetLabel);
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

		var idBase = this.parentFormUniqueID('ABViewFormButton_' + this.id + "_f_"); 
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
				autowidth: true,
				value: this.settings.cancelLabel != null ? this.settings.cancelLabel : ABViewFormButtonPropertyComponentDefaults.cancelLabel,
				click: function () {
					_logic.onCancel(this);
				}
			});
		}
		
		// reset button
		if (this.settings.includeReset != null ? JSON.parse(this.settings.includeReset) : ABViewFormButtonPropertyComponentDefaults.includeReset) {
			_ui.cols.push({
				view: "button",
				type: "standard",
				css: "ab-reset-button",
				autowidth: true,
				value: this.settings.resetLabel != null ? this.settings.resetLabel : ABViewFormButtonPropertyComponentDefaults.resetLabel,
				click: function () {
					_logic.onClear(this);
				}
			});
		}

		// save button
		if (this.settings.includeSave != null ? JSON.parse(this.settings.includeSave) : ABViewFormButtonPropertyComponentDefaults.includeSave) {
			_ui.cols.push({
				view: "button",
				type: "form",
				autowidth: true,
				value: this.settings.saveLabel != null ? this.settings.saveLabel : ABViewFormButtonPropertyComponentDefaults.saveLabel,
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
			// register our callbacks:
			if (options) {
				for(var c in _logic.callbacks) {
					_logic.callbacks[c] = options[c] || _logic.callbacks[c];
				}
			}
		};

		var _logic = this._logic = {
			
			callbacks:{
			
				onCancelClick:function(){
					return true;
				}
			
			},			


			onCancel: (cancelButton) => {
				
				// attempt to call onCancleClick callback...if no override is set we simply return false
				var shouldContinue = _logic.callbacks.onCancelClick();
				
				// if override was called we should have returned true so we can stop now
				if (!shouldContinue ) {
					return false;
				}
					
				// get form component
				var form = this.parentFormComponent();

				// get ABViewDataCollection
				var dc = form.dataCollection;

				// clear cursor of DC
				if (dc) {
					dc.setCursor(null);
				}

				if (cancelButton.getFormView())
					cancelButton.getFormView().clear();

				if (this.settings.afterCancel)
					super.changePage(this.settings.afterCancel);
				// If the redirect page is not defined, then redirect to parent page
				else {
					var noPopupFilter = p => p.settings && p.settings.type != 'popup';

					var pageCurr = this.pageParent();
					var pageParent = pageCurr.pageParent(noPopupFilter) || pageCurr;
					super.changePage(pageParent.id);
				}
			},

			onClear: (resetButton) => {
				// get form component
				var form = this.parentFormComponent();

				// get ABViewDataCollection
				var dc = form.dataCollection;

				// clear cursor of DC
				if (dc) {
					dc.setCursor(null);
				}

				if (resetButton.getFormView())
					resetButton.getFormView().clear();

			},
			
			onSave: (saveButton) => {

				// get form component
				var form = this.parentFormComponent();
				var formView = saveButton.getFormView();

				// disable the save button
				saveButton.disable();

				// save data
				form.saveData(formView)
					.catch(() => { saveButton.enable(); })
					.then(() => { 
						saveButton.enable(); 

						//Focus on first focusable component
						form.focusOnFirst();

					});

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