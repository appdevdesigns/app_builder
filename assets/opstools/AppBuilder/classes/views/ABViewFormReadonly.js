/*
 * ABViewFormReadonly
 *
 *
 */

import ABViewFormField from "./ABViewFormField"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var ABViewFormReadonlyDefaults = {
	key: 'fieldreadonly',		// {string} unique key for this view
	icon: 'calculator',			// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.readonly' // {string} the multilingual label key for the class label
}

export default class ABViewFormReadonly extends ABViewFormField {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABView} parent the ABView this view is a child of. (can be null)
	 */
	constructor(values, application, parent, defaultValues) {

		super(values, application, parent, (defaultValues || ABViewFormReadonlyDefaults));

		// 	{
		// 		id:'uuid',					// uuid value for this obj
		// 		key:'viewKey',				// unique key for this View Type
		// 		icon:'font',				// fa-[icon] reference for an icon for this View Type
		// 		label:'',					// pulled from translation

		//		settings: {					// unique settings for the type of field
		//		},

		// 		views:[],					// the child views contained by this view.

		//		translations:[]				// text: the actual text being displayed by this label.

		// 	}

	}


	static common() {
		return ABViewFormReadonlyDefaults;
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

		var idBase = 'ABViewFormReadonlyEditorComponent';
		var ids = {
			component: App.unique(idBase + '_component')
		}


		var templateElem = this.component(App).ui;
		templateElem.id = ids.component;

		var _ui = {
			rows: [
				templateElem,
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
		var form = this.parentFormComponent();

		// this field may be deleted
		if (!field) return component;

		var idBase = this.parentFormUniqueID('ABViewFormReadonly_' + this.id);
		var ids = {
			component: App.unique(idBase + '_component'),
			template: App.unique(idBase + 'template')
		};


		component.ui = {
			id: ids.component,
			view: "forminput",
			labelWidth: 0,
			paddingY: 0,
			paddingX: 0,
			readonly: true,
			css: "ab-readonly-field",
			// name: component.ui.name,
			// label:  field.label,
			// labelPosition: settings.labelPosition, // webix.forminput does not have .labelPosition T T
			// labelWidth: settings.labelWidth,
			body: {
				id: ids.template,
				view: 'label',
				borderless: true,
				css: { "background-color": "#fff" },
				label: ""
			}
		};

		let settings = {};
		if (form)
			settings = form.settings;

		if (settings.showLabel == true && settings.labelPosition == 'top') {
			component.ui.body.height = 80;
		}
		else if (field.settings.useHeight) {
			component.ui.body.height = parseInt(field.settings.imageHeight) || 38;
		}
		else {
			component.ui.body.height = 38;
		}

		// make sure each of our child views get .init() called
		component.init = (options) => {

			let $elem = $$(ids.component);
			if (!$elem) return;

			let $form = $elem.getFormView();
			if (!$form) return;

			let rowData = $form.getValues();
			component.logic.refresh(rowData);

			$form.attachEvent("onChange", function (newv, oldv) {

				let rowData = $form.getValues();
				component.logic.refresh(rowData);

			});
		};

		component.onShow = () => {

			var $elem = $$(ids.component);
			if (!$elem) return;

			let $form = $elem.getFormView();
			if (!$form) return;

			let rowData = $form.getValues();
			component.logic.refresh(rowData);

		};

		component.logic = {

			getValue: (rowData) => {

				return null;

			},

			refresh: (rowData) => {

				let field = this.field(),
					form = this.parentFormComponent();

				let settings = {};
				if (form)
					settings = form.settings;

				let templateLabel = '';
				if (settings.showLabel == true) {
					if (settings.labelPosition == 'top')
						templateLabel = `<label style="display:block; text-align: left; margin: 0; padding:1px 7.5px 0 3px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;" class="webix_inp_top_label">${field.label}</label>`;
					else
						templateLabel = `<label style="width: ${settings.labelWidth}px; display: inline-block; line-height: 32px; float: left; margin: 0; padding:1px 7.5px 0 3px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${field.label}</label>`;
				}

				let newWidth = settings.labelWidth;
				if (this.settings.formView)
					newWidth += 40;
				else if (settings.showLabel == true && settings.labelPosition == 'top')
					newWidth = 0;

				let template = (`<div class="readonlyField">${templateLabel}#template#</div>`)
					.replace(/#template#/g, field.columnHeader(null, newWidth, true).template(rowData));

				// Re-build template element
				if ($$(ids.template)) {
					$$(ids.template).setHTML(template);
				}

			}

		};

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