/*
 * ABFieldBoolean
 *
 * An ABFieldBoolean defines a boolean field type.
 *
 */

import ABField from "./ABField"
import ABFieldComponent from "./ABFieldComponent"


function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var ABFieldBooleanDefaults = {
	key: 'boolean', // unique key to reference this specific DataField

	icon: 'check-square-o',   // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'

	// menuName: what gets displayed in the Editor drop list
	menuName: L('ab.dataField.boolean.menuName', '*Checkbox'),

	// description: what gets displayed in the Editor description.
	description: L('ab.dataField.boolean.description', '*A single checkbox that can be checked or unchecked.'),

	supportRequire: true

}


var defaultValues = {
	default: 0
}

/**
 * ABFieldBooleanComponent
 *
 * Defines the UI Component for this Data Field.  The ui component is responsible
 * for displaying the properties editor, populating existing data, retrieving
 * property values, etc.
 */
var ABFieldBooleanComponent = new ABFieldComponent({
	fieldDefaults: ABFieldBooleanDefaults,

	elements: (App, field) => {
		// ids = field.idsUnique(ids, App);

		return [
			{
				name: "default",
				view: "checkbox",
				label: L("ab.common.default", "*Default"),
				labelPosition: "left",
				labelWidth: 70,
				labelRight: L("ab.dataField.boolean.uncheck", "*Uncheck"),
				css: "webix_table_checkbox",
				on: {
					onChange: function (newVal, oldVal) {

						let checkLabel = L("ab.dataField.boolean.check", "*Check");
						let uncheckLabel = L("ab.dataField.boolean.uncheck", "*Uncheck");

						this.define('labelRight', newVal ? checkLabel : uncheckLabel);
						this.refresh();
					}
				}
			}
		];
	},

	// defaultValues: the keys must match a .name of your elements to set it's default value.
	defaultValues: defaultValues,

	// rules: basic form validation rules for webix form entry.
	// the keys must match a .name of your .elements for it to apply
	rules: {},

	// include additional behavior on default component operations here:
	// The base routines will be processed first, then these.  Any results
	// from the base routine, will be passed on to these:
	logic: {

		// isValid: function (ids, isValid) {

		// }

		// populate: function (ids, values) {
		// 	if (values.settings.validation) {
		// 		$$(ids.validateMinimum).enable();
		// 		$$(ids.validateMaximum).enable();
		// 	} else {
		// 		$$(ids.validateMinimum).disable();
		// 		$$(ids.validateMaximum).disable();
		// 	}
		// }

	},

	// perform any additional setup actions here.
	// @param {obj} ids  the hash of id values for all the current form elements.
	//					 it should have your elements + the default Header elements:
	//						.label, .columnName, .fieldDescription, .showIcon
	init: function (ids) {
	}


});


class ABFieldBoolean extends ABField {
	constructor(values, object) {
		super(values, object, ABFieldBooleanDefaults);

		// we're responsible for setting up our specific settings:
		for (var dv in defaultValues) {
			this.settings[dv] = values.settings[dv] || defaultValues[dv];
		}

		if (this.settings.default != null)
			this.settings.default = parseInt(this.settings.default);
	}

	// return the default values for this DataField
	static defaults() {
		return ABFieldBooleanDefaults;
	}

	/*
	* @function propertiesComponent
	*
	* return a UI Component that contains the property definitions for this Field.
	*
	* @param {App} App the UI App instance passed around the Components.
	* @param {stirng} idBase
	* @return {Component}
	*/
	static propertiesComponent(App, idBase) {
		return ABFieldBooleanComponent.component(App, idBase);
	}

	///
	/// Instance Methods
	///


	isValid() {

		var validator = super.isValid();

		// validator.addError('columnName', L('ab.validation.object.name.unique', 'Field columnName must be unique (#name# already used in this Application)').replace('#name#', this.name) );

		return validator;
	}


	/**
	 * @method toObj()
	 *
	 * properly compile the current state of this ABApplication instance
	 * into the values needed for saving to the DB.
	 *
	 * Most of the instance data is stored in .json field, so be sure to
	 * update that from all the current values of our child fields.
	 *
	 * @return {json}
	 */
	// toObj () {

	// 	var obj = super.toObj();

	// 	// obj.settings = this.settings;  // <--  super.toObj()

	// 	return obj;
	// }




	///
	/// Working with Actual Object Values:
	///

	// return the grid column header definition for this instance of ABFieldBoolean
	columnHeader(isObjectWorkspace, width, isEditable) {
		var config = super.columnHeader(isObjectWorkspace);

		config.editor = 'template';
		config.css = 'center';
		config.template = (row, common, value, config) => {

			// Group header
			if (row.$group)
				return row[this.columnName];

			// editable
			if (isEditable) {
				return '<div class="ab-boolean-display">' + common.checkbox(row, common, value, config) + '</div>';
			}

			// readonly
			else {
				if (value)
					return "<div class='webix_icon fa fa-check-square-o'></div>";
				else
					return "<div class='webix_icon fa fa-square-o'></div>";
			}

		};

		return config;
	}


	/**
	 * @method defaultValue
	 * insert a key=>value pair that represent the default value
	 * for this field.
	 * @param {obj} values a key=>value hash of the current values.
	 */
	defaultValue(values) {

		if (values[this.columnName] == null) {

			values[this.columnName] = this.settings.default;

		}
	}


	/**
	 * @method isValidData
	 * Parse through the given data and return an error if this field's
	 * data seems invalid.
	 * @param {obj} data  a key=>value hash of the inputs to parse.
	 * @param {OPValidator} validator  provided Validator fn
	 * @return {array} 
	 */
	isValidData(data, validator) {
	}


	/*
	* @funciton formComponent
	* returns a drag and droppable component that is used on the UI
	* interface builder to place form components related to this ABField.
	* 
	* an ABField defines which form component is used to edit it's contents.
	* However, what is returned here, needs to be able to create an instance of
	* the component that will be stored with the ABViewForm.
	*/
	formComponent() {

		return super.formComponent('checkbox');
	}


	detailComponent() {

		var detailComponentSetting = super.detailComponent();

		detailComponentSetting.common = () => {
			return {
				key: 'detailcheckbox'
			}
		};

		return detailComponentSetting;
	}


}


export default ABFieldBoolean;