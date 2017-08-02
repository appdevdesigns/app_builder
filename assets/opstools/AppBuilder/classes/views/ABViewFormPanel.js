/*
 * ABViewFormPanel
 * 
 *
 */

import ABView from "./ABView"
import ABPropertyComponent from "../ABPropertyComponent"
import ABViewManager from "../ABViewManager"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var ABViewFormPanelPropertyComponentDefaults = {
}

var ABFormPanelDefaults = {
	key: 'formpanel',		// {string} unique key for this view
	icon: 'list-alt',		// {string} fa-[icon] reference for this view
}


export default class ABViewFormPanel extends ABView {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABView} parent the ABView this view is a child of. (can be null)
	 */
	constructor(values, application, parent) {

		super(values, application, parent, ABFormPanelDefaults);

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
		return ABFormPanelDefaults;
	}



	///
	/// Instance Methods
	///

	//
	// Property Editor
	// 

	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		var commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);

		return commonUI.concat([
			{
				name: 'object',
				view: 'richselect',
				label: L('ab.components.form.objects', "*Objects")
			},
			{
				view: 'button',
				value: L('ab.components.form.addField', "*Add a new field"),
				click: () => {
					// open a popup
					var FormView = _logic.currentEditObject();
					FormView.openNewFieldPopup();
				}
			}
		]);


	}

	static propertyEditorPopulate(ids, view) {

		super.propertyEditorPopulate(ids, view);

		var objects = view.application.objects().map((obj) => {
			// label option of webix richselect
			obj.value = obj.label;
			return obj;
		});

		$$(ids.object).define('options', objects);
		$$(ids.object).refresh();

		$$(ids.object).setValue(view.settings.object);
	}

	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		view.settings.object = $$(ids.object).getValue();

	}

	/*
	 * @method componentList
	 * return the list of components available on this view to display in the editor.
	 */
	componentList() {
		var viewsToAllow = ['label', 'layout'],
			allComponents = ABViewManager.allViews();

		return allComponents.filter((c) => {
			return viewsToAllow.indexOf(c.common().key) > -1;
		});
	}


	openNewFieldPopup() {

		var object = this.application.objects((obj) => obj.id == this.settings.object)[0];

		if (object == null) {
			// TODO:
			alert('No select object');
			return;
		}

		var fields = object.fields();
		// TODO: prevent duplicate fields

		webix.ui({
			id: "ab-component-form-add-new-field-popup",
			view: "window",
			height: 400,
			width: 400,
			modal: true,
			head: L('ab.components.form.addField', "*Add a new field"),
			position: "center",
			body: {
				rows: [
					{
						view: 'list',
						select: true,
						data: fields,
						template: function (item) {

							var formComponent = ABViewManager.allViews((v) => v.common().key == item.fieldFormComponentKey())[0];

							return "#label# <div class='ab-component-form-fields-component-info'> <i class='fa fa-#icon#'></i> #component# </div>"
								.replace("#label#", item.label)
								.replace("#icon#", (formComponent ? formComponent.common().icon : "fw"))
								.replace("#component#", (formComponent ? L(formComponent.common().labelKey, "") : ""));
						}
					},
					// action buttons
					{
						cols: [
							{ fillspace: true },
							{
								view: "button",
								value: L('ab.common.cancel', "*Cancel"),
								css: "ab-cancel-button",
								autowidth: true,
								click: function () {
									$$("ab-component-form-add-new-field-popup").hide();
								}
							},
							{
								view: "button",
								value: L('ab.components.form.addField', "*Add a new field"),
								autowidth: true,
								type: "form",
								click: function () {
								}
							}
						]
					}
				]
			}
		}).show();

	}


};