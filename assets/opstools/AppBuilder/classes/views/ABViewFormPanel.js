/*
 * ABViewFormPanel
 * 
 *
 */

import ABView from "./ABView"
import ABPropertyComponent from "../ABPropertyComponent"
import ABViewManager from "../ABViewManager"
import ABViewFormField from "./ABViewFormField"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var ABFormPanelDefaults = {
	key: 'formpanel',		// {string} unique key for this view
	icon: 'newspaper-o',	// {string} fa-[icon] reference for this view
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

		// "Add new field" popup UI
		var popup = {
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
						id: "ab-component-form-select-field",
						view: 'list',
						select: true,
						template: function (item, common) {
							// prevent add duplicate field
							common.disabled = item.disabled;

							var formComponent = ABViewManager.allViews((v) => v.common().key == item.fieldFormComponentKey())[0];

							return "#label# <div class='ab-component-form-fields-component-info'> <i class='fa fa-#icon#'></i> #component# </div>"
								.replace("#label#", item.label)
								.replace("#icon#", (formComponent ? formComponent.common().icon : "fw"))
								.replace("#component#", (formComponent ? L(formComponent.common().labelKey, "") : ""));
						},
						scheme: {
							$init: function (item) {
								if (item.disabled)
									item.$css = "disabled";
								else
									item.$css = "";
							}
						},
						on: {
							onBeforeSelect: function (id) {
								return !this.getItem(id).disabled;
							}
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
								click: () => {
									_logic.closeNewFieldPopup();
								}
							},
							{
								view: "button",
								value: L('ab.components.form.addField', "*Add a new field"),
								autowidth: true,
								type: "form",
								click: () => {
									var field = $$("ab-component-form-select-field").getSelectedItem(false);

									_logic.addNewField(field);
								}
							}
						]
					}
				]
			}
		};



		// _logic functions

		_logic.openNewFieldPopup = () => {

			var FormView = _logic.currentEditObject();

			var object = FormView.formComponent().object();
			if (object == null) {
				// TODO:
				alert('No select object');
				return;
			}

			// show 'add new field' popup
			webix.ui(popup).show();

			var existsFields = FormView.formComponent().fieldComponents();

			var fields = object.fields().map((f) => {
				// prevent duplicate fields
				f.disabled = existsFields.filter((com) => {
					return f.id == com.settings.fieldId;
				}).length > 0;

				return f;
			});
			$$("ab-component-form-select-field").parse(fields);
		}

		_logic.closeNewFieldPopup = () => {
			if ($$("ab-component-form-add-new-field-popup"))
				$$("ab-component-form-add-new-field-popup").hide();
		}

		_logic.addNewField = (field) => {

			if (field == null)
				return _logic.closeNewFieldPopup();

			var formComponent = ABViewManager.allViews((v) => v.common().key == field.fieldFormComponentKey())[0];
			if (formComponent == null)
				return _logic.closeNewFieldPopup();

			var FormView = _logic.currentEditObject();

			FormView._views.push(ABViewManager.newView({
				key: formComponent.common().key,
				label: field.label,
				settings: {
					fieldId: field.id
				}
			}, FormView.application, FormView));

			_logic.closeNewFieldPopup();

			// trigger a save()
			this.propertyEditorSave(ids, FormView);
		}




		// Properties UI
		return commonUI.concat([
			{
				view: 'button',
				value: L('ab.components.form.addField', "*Add a new field"),
				click: () => {
					_logic.openNewFieldPopup();
				}
			}
		]);


	}

	static propertyEditorPopulate(ids, view) {

		super.propertyEditorPopulate(ids, view);

	}

	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

	}

	/*
	 * @method componentList
	 * return the list of components available on this view to display in the editor.
	 */
	componentList() {
		var viewsToAllow = ['label', 'layout', 'button'],
			allComponents = ABViewManager.allViews();

		return allComponents.filter((c) => {
			return viewsToAllow.indexOf(c.common().key) > -1;
		});
	}



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

	fieldComponents() {

		var flattenComponents = (views) => {
			var components = [];

			_.each(views, (comp) => {
				components.push(comp);
				comp._views && (components = _.union(components, flattenComponents(comp._views)))
			});

			return components
		}

		if (this._views && this._views.length > 0) {
			var allComponents = flattenComponents(this._views);

			return allComponents.filter((comp) => comp instanceof ABViewFormField);
		}
		else {
			return [];
		}
	}



};