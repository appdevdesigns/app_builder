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
	icon: 'list-alt',	// {string} fa-[icon] reference for this view
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

		// _logic functions

		_logic.listTemplate = (field, common) => {
			var formComponent;
			var formComponentInfo = field.fieldFormComponent();

			if (formComponentInfo)
				formComponent = ABViewManager.allViews((v) => v.common().key == formComponentInfo.key)[0];

			return common.markCheckbox(field) + " #label# <div class='ab-component-form-fields-component-info'> <i class='fa fa-#icon#'></i> #component# </div>"
				.replace("#label#", field.label)
				.replace("#icon#", (formComponent ? formComponent.common().icon : "fw"))
				.replace("#component#", (formComponent ? L(formComponent.common().labelKey, "") : ""));
		};

		_logic.check = (e, fieldId) => {
			var currView = _logic.currentEditObject();

			// update UI list
			var item = $$(ids.fields).getItem(fieldId);
			item.selected = item.selected ? 0 : 1;
			$$(ids.fields).updateItem(fieldId, item);

			// add a field to the form
			if (item.selected) {
				_logic.addFieldToForm(item);
			}
			// remove field in the form
			else {
				var formView = currView.formComponent();
				var fieldView = formView.fieldComponents().filter(c => c.settings.fieldId == fieldId)[0];

				if (fieldView)
					fieldView.destroy();

			}

			// trigger a save()
			currView.emit('properties.updated', currView);

		};

		_logic.addFieldToForm = (field) => {

			if (field == null)
				return;

			var formComponentInfo = field.fieldFormComponent();
			if (formComponentInfo == null)
				return;

			var formComponent = ABViewManager.allViews((v) => v.common().key == formComponentInfo.key)[0];
			if (formComponent == null)
				return;

			var FormView = _logic.currentEditObject();

			// set settings to component
			var settings = formComponentInfo.settings || {};
			settings.fieldId = field.id;

			FormView._views.push(ABViewManager.newView({
				key: formComponent.common().key,
				label: field.label,
				settings: settings
			}, FormView.application, FormView));

		}


		// Properties UI
		return commonUI.concat([
			{
				name: 'object',
				view: 'richselect',
				label: L('ab.components.form.objects', "*Objects")
				// ,on: {
				// 	onChange: () => {
				// 		this.propertyEditorPopulate(ids, view);
				// 	}
				// }
			},
			{
				name: 'fields',
				view: 'list',
				select: false,
				minHeight: 200,
				template: _logic.listTemplate,
				type: {
					markCheckbox: function (item) {
						return "<span class='check webix_icon fa-" + (item.selected ? "check-" : "") + "square-o'></span>";
					}
				},
				onClick: {
					"check": _logic.check
				}
			}
		]);


	}

	static propertyEditorPopulate(ids, view) {

		super.propertyEditorPopulate(ids, view);

		var formComponent = view.formComponent();
		var objectId = formComponent.settings.object;

		// Pull object list
		var objectOptions = view.application.objects().map((obj) => {

			// label option of webix richselect
			obj.value = obj.label;
			return obj;
		});

		// Pull field list
		var object = view.application.objectByID(objectId);
		var existsFields = formComponent.fieldComponents();
		var fieldOptions = [];
		if (object != null) {
			fieldOptions = object.fields().map((f) => {

				// prevent duplicate fields
				f.selected = existsFields.filter((com) => {
					return f.id == com.settings.fieldId;
				}).length > 0;

				return f;
			});
		}

		$$(ids.object).define('options', objectOptions);
		$$(ids.object).refresh();
		$$(ids.object).setValue(objectId);

		// Disable to select object in layout
		// We can select object in form component only
		$$(ids.object).disable();

		$$(ids.fields).parse(fieldOptions);
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