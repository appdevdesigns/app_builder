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


var ABFieldEmailDefaults = {
	key: 'email', // unique key to reference this specific DataField

	icon: 'envelope',   // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'

	// menuName: what gets displayed in the Editor drop list
	menuName: L('ab.dataField.email.menuName', '*Email'),

	// description: what gets displayed in the Editor description.
	description: L('ab.dataField.email.description', '*Email fields are used to store email addresses.'),

	supportRequire: true

}


var defaultValues = {
	default: ""
}

/**
 * ABFieldBooleanComponent
 *
 * Defines the UI Component for this Data Field.  The ui component is responsible
 * for displaying the properties editor, populating existing data, retrieving
 * property values, etc.
 */
var ABFieldEmailComponent = new ABFieldComponent({
	fieldDefaults: ABFieldEmailDefaults,

	elements: (App, field) => {

		var ids = {
			default: ''
		}
		ids = field.idsUnique(ids, App);

		return [
			{
				view: "text",
				id: ids.default,
				name:'default',
				labelWidth: App.config.labelWidthXLarge,
				label: L('ab.dataField.email.defaultLabel', '*Default'),
				placeholder: L('ab.dataField.email.default', '*Enter default email')
			}
		]
	},

	// defaultValues: the keys must match a .name of your elements to set it's default value.
	defaultValues: defaultValues,

	// rules: basic form validation rules for webix form entry.
	// the keys must match a .name of your .elements for it to apply
	rules: {},

	// include additional behavior on default component operations here:
	// The base routines will be processed first, then these.  Any results
	// from the base routine, will be passed on to these:
	logic:{
		
		/*
		 * @function requiredOnChange
		 *
		 * The ABField.definitionEditor implements a default operation
		 * to look for a default field and set it to a required field 
		 * if the field is set to required
		 * 
		 * if you want to override that functionality, implement this fn()
		 *
		 * @param {string} newVal	The new value of label
		 * @param {string} oldVal	The previous value
		 */
		requiredOnChange: (newVal, oldVal, ids) => {

			// when require value, then default value needs to be reqired
			$$(ids.default).define("required", newVal);
			$$(ids.default).refresh();

		},

		isValid: (ids, isValid) => {

			$$(ids.component).clearValidation();

			var isRequired = $$(ids.required).getValue(),
				emailDefault = $$(ids.default).getValue();

			if (isRequired || emailDefault) {

				if (!webix.rules.isEmail(emailDefault)) {
					$$(ids.component).markInvalid('default', '*This email is invalid');
					return false;
				}
				else 
					return true;
			}
			else
				return true;

		}

	},

	// perform any additional setup actions here.
	// @param {obj} ids  the hash of id values for all the current form elements.
	//					 it should have your elements + the default Header elements:
	//						.label, .columnName, .fieldDescription, .showIcon
	init: function (ids) {
	}


});


class ABFieldEmail extends ABField {
	constructor(values, object) {
		super(values, object, ABFieldEmailDefaults);

		// we're responsible for setting up our specific settings:
		for (var dv in defaultValues) {
			this.settings[dv] = values.settings[dv] || defaultValues[dv];
		}

		this.settings.default = values.settings.default || '';
	}

	// return the default values for this DataField
	static defaults() {
		return ABFieldEmailDefaults;
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
		return ABFieldEmailComponent.component(App, idBase);
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
	columnHeader(isObjectWorkspace) {
		var config = super.columnHeader(isObjectWorkspace);

		config.editor = 'text';
		// config.template = '<div class="ab-boolean-display">{common.checkbox()}</div>';
		// config.css = 'center';

		return config;
	}


	/**
	 * @method defaultValue
	 * insert a key=>value pair that represent the default value
	 * for this field.
	 * @param {obj} values a key=>value hash of the current values.
	 */
	defaultValue(values) {
		// if no default value is set, then don't insert a value.
		if (!values[this.columnName]) {

			// Set default string
			if (this.settings.default) {
				values[this.columnName] = this.settings.default;
			}

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

		if (data[this.columnName]) {

			var Reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

			var value = data[this.columnName];
			value = String(value).toLowerCase();
			if (!Reg.test(value)) {

				validator.addError(this.columnName, 'Invalid email');

			}
		}

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
		
		// NOTE: what is being returned here needs to mimic an ABView CLASS.
		// primarily the .common() and .newInstance() methods.
		var formComponentSetting = super.formComponent();

		// .common() is used to create the display in the list
		formComponentSetting.common = () => {
			return {
				key: 'textbox',
				settings: {
					type: 'single'
				}
			}
		};

		return formComponentSetting; 
	}


	detailComponent() {
		
		var detailComponentSetting = super.detailComponent();

		detailComponentSetting.common = () => {
			return {
				key: 'detailtext'
			}
		};

		return detailComponentSetting;
	}

}


export default ABFieldEmail;