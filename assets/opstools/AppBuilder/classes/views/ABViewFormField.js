/*
 * ABViewFormField
 * 
 *
 */

import ABView from "./ABView"
import ABPropertyComponent from "../ABPropertyComponent"
import ABViewManager from "../ABViewManager"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var ABViewFormFieldPropertyComponentDefaults = {
	required: 0,
	disable: 0
}

export default class ABViewFormField extends ABView {

	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		var commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);

		return commonUI.concat([
			{
				name: 'fieldLabel',
				view: "text",
				disabled: true,
				label: L('ab.component.form.field.label', '*Field')
			},
			{
				name: 'required',
				view: 'checkbox',
				labelWidth: App.config.labelWidthCheckbox,
				labelRight: L('ab.common.required', '*Required')
			},
			{
				name: 'disable',
				view: 'checkbox',
				labelWidth: App.config.labelWidthCheckbox,
				labelRight: L('ab.common.disable', '*Disable')
			}
		]);

	}


	static propertyEditorPopulate(App, ids, view) {

		super.propertyEditorPopulate(App, ids, view);

		var field = view.field();

		$$(ids.fieldLabel).setValue(field ? field.label : "");

		if (field && field.settings.required == 1) {
			$$(ids.required).setValue(field.settings.required);
			$$(ids.required).disable();
		} 
		else {
			$$(ids.required).setValue((view.settings.required != null) ? view.settings.required : ABViewFormFieldPropertyComponentDefaults.required);
		}

		if (view && view.settings.disable == 1) {
			$$(ids.disable).setValue(view.settings.disable);
		} 
		else {
			$$(ids.disable).setValue(ABViewFormFieldPropertyComponentDefaults.disable);
		}

	}
	
	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		// console.log("here");
		view.settings.required = $$(ids.required).getValue();
		view.settings.disable = $$(ids.disable).getValue();
		// console.log(view);

	}

	/*
	 * @component()
	 * return a UI component based upon this view.
	 * @param {obj} App 
	 * @return {obj} UI component
	 */
	component(App) {

		// setup 'label' of the element
		var form = this.parentFormComponent(),
			field = this.field(),
			label = '';

		var settings = {};
		if (form)
			settings = form.settings;

		var _ui = {
			labelPosition: settings.labelPosition,
			labelWidth: settings.labelWidth,
			label: label
		};

		if (field != null) {

			_ui.name = field.columnName;

			// default value
			var data = {};
			field.defaultValue(data);
			if (data[field.columnName])
				_ui.value = data[field.columnName];

			if (settings.showLabel == true) {
				_ui.label = field.label;
			}
			
			if (field.settings.required || this.settings.required) {
				_ui.required = 1;
			}


			if (this.settings.disable == 1) {
				_ui.disabled = true;
			}

			_ui.validate = (val, data, colName) => {

				let validator = OP.Validation.validator();

				field.isValidData(data, validator);

				return validator.pass();

			};

		}

		var _init = () => {}

		return {
			ui: _ui,
			init: _init
		}
	}





	// formComponent() {
	// 	var form = null;

	// 	var curr = this;
	// 	while (curr.key != 'form' && !curr.isRoot() && curr.parent) {
	// 		curr = curr.parent;
	// 	}

	// 	if (curr.key == 'form') {
	// 		form = curr;
	// 	}

	// 	return form;
	// }

	field() {
		var object = this.application.objects((obj) => obj.id == this.settings.objectId)[0];
		if (object == null) return null;

		var field = object.fields((v) => v.id == this.settings.fieldId)[0];
		return field;
	}


}