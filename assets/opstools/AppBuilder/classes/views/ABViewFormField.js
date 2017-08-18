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

export default class ABViewFormField extends ABView {

	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		var commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);

		return commonUI.concat([
			{
				name: 'fieldLabel',
				view: "text",
				disabled: true,
				label: L('ab.component.form.field.label', '*Field')
			}
		]);

	}


	static propertyEditorPopulate(ids, view) {

		super.propertyEditorPopulate(ids, view);

		var field = view.field();

		if (field) {
			$$(ids.fieldLabel).setValue(field.label);
		}
	}

	/*
	 * @component()
	 * return a UI component based upon this view.
	 * @param {obj} App 
	 * @return {obj} UI component
	 */
	component(App) {

		// setup 'label' of the element
		var form = this.formComponent(),
			field = this.field(),
			label = '';

		var _ui = {
			labelPosition: form.settings.labelPosition,
			labelWidth: form.settings.labelWidth,
			label: label
		};

		if (field != null) {

			_ui.name = field.columnName;

			// default value
			var data = {};
			field.defaultValue(data);
			_ui.value = data[field.columnName];

			if (form.settings.showLabel == true) {
				_ui.label = field.label;
			}
		}

		return {
			ui: _ui
		}
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

	field() {
		var form = this.formComponent();
		if (form == null) return null;

		var object = form.object();
		if (object == null) return null;

		var field = object.fields((v) => v.id == this.settings.fieldId)[0];
		return field;
	}


}