/*
 * ABViewFormCustom
 *
 *
 */

import ABViewFormField from "./ABViewFormField"
import ABPropertyComponent from "../ABPropertyComponent"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var ABViewFormCustomPropertyComponentDefaults = {
}


var ABViewFormCustomDefaults = {
	key: 'fieldcustom',		// {string} unique key for this view
	icon: 'object-group',		// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.custom' // {string} the multilingual label key for the class label
}

export default class ABViewFormCustom extends ABViewFormField {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABView} parent the ABView this view is a child of. (can be null)
	 */
	constructor(values, application, parent) {

		super(values, application, parent, ABViewFormCustomDefaults);

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
		return ABViewFormCustomDefaults;
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

		var idBase = 'ABViewFormCustomEditorComponent';
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
		var form = this.formComponent();

		var idBase = 'ABViewFormCustom_' + this.id;
		var ids = {
			component: App.unique(idBase + '_component'),
		}

		var settings = {};
		if (form)
			settings = form.settings;

		var templateLabel = '';
		if (settings.showLabel == true) {
			if (settings.labelPosition == 'top')
				templateLabel = "<label style='display:block; text-align: left; margin: 0; padding:1px 7.5px 0 3px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;' class='webix_inp_top_label'>#label#</label>";
			else
				templateLabel = "<label style='width: #width#px; display: inline-block; line-height: 32px; float: left; margin: 0; padding:1px 7.5px 0 3px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;'>#label#</label>";
		}

		var template = (templateLabel + "#template#")
			.replace(/#width#/g, settings.labelWidth)
			.replace(/#label#/g, field.label)
			.replace(/#template#/g, field.columnHeader(null, settings.labelWidth).template);

		component.ui.id = ids.component;
		component.ui.view = "template";
		component.ui.css = "webix_el_box";
		if (typeof field.settings.useHeight != "undefined" && field.settings.useHeight == 1) {
			component.ui.height = parseInt(field.settings.imageHeight);
		} else {
			component.ui.height = 38;
		}
		component.ui.borderless = true;
		component.ui.template = '<div class="customField">' + template + '</div>';
		component.ui.onClick = {
			"customField": function (id, e, trg) {
				var rowData = {},
					node = $$(ids.component).$view;
				field.customEdit(rowData, App, node);
			}
		};

		// make sure each of our child views get .init() called
		component.init = (options) => {
			var elem = $$(ids.component);
			if (!elem) return;

			var rowData = {},
				node = elem.$view;

			field.customDisplay(rowData, App, node);

		}

		component.logic = {

			getValue: (rowData) => {

				var application = this.application,
					object = field.object,
					elem = $$(ids.component),
					dom = $$(ids.component).$view;


				return field.getValue(application,
					object,
					field,
					dom,
					rowData,
					elem
				);

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