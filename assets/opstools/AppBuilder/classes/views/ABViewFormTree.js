/*
 * ABViewFormTree
 *
 * An ABViewFormTree defines a UI text box component.
 *
 */

import ABViewFormCustom from "./ABViewFormCustom"
import ABPropertyComponent from "../ABPropertyComponent"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var ABViewFormTreePropertyComponentDefaults = {
	// type: 'tree' // 'richselect' or 'radio'
}


var ABTreeDefaults = {
	key: 'formtree',		// {string} unique key for this view
	icon: 'sitemap',		// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.tree' // {string} the multilingual label key for the class label
}

export default class ABViewFormTree extends ABViewFormCustom {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABView} parent the ABView this view is a child of. (can be null)
	 */
	constructor(values, application, parent) {

		super(values, application, parent, ABTreeDefaults);

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
		return ABTreeDefaults;
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

		var idBase = 'ABViewFormTreeEditorComponent';
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
			// {
			// 	name: 'type',
			// 	view: 'richselect',
			// 	label: L('ab.component.selectsingle.type', '*Type'),
			// 	options: [
			// 		{
			// 			id: 'richselect',
			// 			value: L('ab.component.selectsingle.selectlist', '*Select list')
			// 		},
			// 		{
			// 			id: 'radio',
			// 			value: L('ab.component.selectsingle.radio', '*Radio')
			// 		}
			// 	]
			// }

		]);

	}

	static propertyEditorPopulate(App, ids, view) {

		super.propertyEditorPopulate(App, ids, view);

		// $$(ids.type).setValue(view.settings.type || ABViewFormTreePropertyComponentDefaults.type);

	}

	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		// view.settings.type = $$(ids.type).getValue();

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
		
 		// this field may be deleted
 		if (!field) return component;

 		var idBase = 'ABViewFormTree_' + this.id + "_f_" + form.uniqueInstanceID;
 		var ids = {
 			component: App.unique(idBase + '_component')
 		}

 		var settings = {};
 		if (form)
 			settings = form.settings;

 		var templateLabel = '';
 		if (settings.showLabel == true) {
 			if (settings.labelPosition == 'top')
 				templateLabel = '<label style="display:block; text-align: left; margin: 0; padding:1px 7.5px 0 3px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;" class="webix_inp_top_label">#label#</label>';
 			else
 				templateLabel = '<label style="width: #width#px; display: inline-block; line-height: 32px; float: left; margin: 0; padding:1px 7.5px 0 3px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">#label#</label>';
 		}

 		var newWidth = settings.labelWidth;
 		if (typeof this.settings.formView != "undefined")
 			newWidth += 40;

 		var template = (templateLabel + "#template#")
 			.replace(/#width#/g, settings.labelWidth)
 			.replace(/#label#/g, field.label)
 			.replace(/#template#/g, field.columnHeader(null, newWidth).template);

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
				
				rowData[field.columnName] = component.logic.getValue();
 				field.customEdit(rowData, App, node, component);
 			}
 		};

 		component.onShow = () => {

			
 		};

 		// make sure each of our child views get .init() called
 		component.init = (options) => {


 		}

 		component.logic = {

 			getValue: () => {

				var vals = $$(ids.component).getValues();
				// Pass empty string if the returned values is empty array
				if (Array.isArray(vals) && vals.length == 0)
					vals = "";
				return vals;
				
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