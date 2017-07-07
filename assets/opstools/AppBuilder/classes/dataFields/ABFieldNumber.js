/*
 * ABFieldNumber
 *
 * An ABFieldNumber defines a Number field type.
 *
 */

import ABField from "./ABField"
import ABFieldComponent from "./ABFieldComponent"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}



var ABFieldNumberDefaults = {
	key: 'number', // unique key to reference this specific DataField
	icon: 'hashtag',   // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'

	// menuName: what gets displayed in the Editor drop list
	menuName: L('ab.dataField.number.menuName', '*Number'),

	// description: what gets displayed in the Editor description.
	description: L('ab.dataField.number.description', '*A Float or Integer Value')
}



var formatList = [
	{ id: 'none', value: L('ab.dataField.number.none', "*None") },
	{ id: 'dollar', value: L('ab.dataField.number.format.dollar', "$"), sign: "$", position: "prefix" },
	{ id: 'pound', value: L('ab.dataField.number.format.pound', "£"), sign: "£", position: "prefix" },
	{ id: 'euroBefore', value: L('ab.dataField.number.format.euroBefore', "€ (before)"), sign: "€", position: "prefix" },
	{ id: 'euroAfter', value: L('ab.dataField.number.format.euroAfter', "€ (after)"), sign: "€", position: "postfix" },
	{ id: 'percent', value: L('ab.dataField.number.format.percent', "%"), sign: "%", position: "postfix" },
];

var delimiterList = [
	{ id: 'none', value: L('ab.dataField.number.none', "*None") },
	{ id: 'comma', value: L('ab.dataField.number.comma', "*Comma"), sign: ',' },
	{ id: 'period', value: L('ab.dataField.number.period', "*Period"), sign: '.' },
	{ id: 'space', value: L('ab.dataField.number.space', "*Space"), sign: ' ' }
];

var defaultValues = {
	'allowRequired': 0,
	'numberDefault': '',
	'typeFormat': 'none',
	'typeDecimals': 'none',
	'typeDecimalPlaces': 'none',
	'typeRounding': 'none',
	'typeThousands': 'none',
	'validation': 0,
	'validateMinimum': '',
	'validateMaximum': ''
}


/**
 * ABFieldNumberComponent
 *
 * Defines the UI Component for this Data Field.  The ui component is responsible
 * for displaying the properties editor, populating existing data, retrieving
 * property values, etc.
 *
 * @param {obj} App  the current Component Application instance for the current UI.
 * @return {obj} the Component object.
 */
var ABFieldNumberComponent = new ABFieldComponent({

	fieldDefaults: ABFieldNumberDefaults,

	elements: (App, field) => {



		// var idBase = ABFieldNumberDefaults.type;
		// var ids = {
		// 	typeDecimalPlaces: this.unique(App, '_typeDecimalPlaces'),  // App.unique(idBase +'_typeDecimalPlaces'),
		// 	typeRounding: App.unique(idBase +'_typeRounding'),
		// 	validateMinimum: App.unique(idBase + '_validateMinimum'),
		// 	validateMaximum: App.unique(idBase + '_validateMaximum')
		// }

		var ids = {
			allowRequired: '',
			numberDefault: '',
			typeDecimalPlaces: '',
			typeRounding: '',
			validate: '',
			validateMinimum: '',
			validateMaximum: ''
		}
		ids = field.idsUnique(ids, App);

		return [
			// {
			// 	view: "text",
			// 	name:'textDefault',
			// 	labelWidth: App.config.labelWidthLarge,
			// 	placeholder: L('ab.dataField.string.default', '*Default text')
			// },
			{
				view: "checkbox",
				id: ids.allowRequired,
				name: "allowRequired",
				labelRight: L("ab.dataField.number.required", "*Required"),
				// inputWidth: 130,
				labelWidth: 0,
				on: {
					onChange: (newVal, oldVal) => {
						// when require number, then should have default value
						if (newVal && !$$(ids.numberDefault).getValue()) {
							$$(ids.numberDefault).setValue('0');
						}
					}
				}
			},
			{
				view: "text",
				label: L("ab.dataField.number.defaultValue", "*Default Value"),
				labelWidth: App.config.labelWidthLarge,
				id: ids.numberDefault,
				name: "numberDefault",
				placeholder: L('ab.dataField.number.defaultNumber', '*Default number'),
				on: {
					onChange: function (newVal, oldVal) {
						// Validate number
						if (!new RegExp('^[0-9.]*$').test(newVal)) {
							// $$(componentIds.numberDefault).setValue(oldVal);
							this.setValue(oldVal);
						}
						// when require number, then should have default value
						else if ($$(ids.allowRequired).getValue() && !newVal) {
							this.setValue('0');
						}

					}
				}
			},
			{
				view: "richselect",
				// id: componentIds.typeFormat,
				name: 'typeFormat',
				label: L('ab.dataField.number.format', "*Format"),
				value: 'none',
				labelWidth: App.config.labelWidthLarge,
				options: formatList
			},
			{
				view: "richselect",
				// id: componentIds.typeDecimals,
				name: 'typeDecimals',
				disallowEdit: true,
				label: L('ab.dataField.number.decimals', "*Decimals"),
				value: 'none',
				labelWidth: App.config.labelWidthLarge,
				options: delimiterList,
				on: {
					'onChange': function (newValue, oldValue) {
						if (newValue == 'none') {
							$$(ids.typeDecimalPlaces).disable();
							$$(ids.typeRounding).disable();
							$$(ids.typeDecimalPlaces).hide();
							$$(ids.typeRounding).hide();
						}
						else {
							$$(ids.typeDecimalPlaces).enable();
							$$(ids.typeRounding).enable();
							$$(ids.typeDecimalPlaces).show();
							$$(ids.typeRounding).show();
						}
					}
				}
			},
			{
				view: "richselect",
				id: ids.typeDecimalPlaces,
				name: 'typeDecimalPlaces',
				disallowEdit: true,
				label: "Places",
				value: 'none',
				labelWidth: App.config.labelWidthLarge,
				disabled: true,
				hidden: true,
				options: [
					{ id: 'none', value: "0" },
					{ id: 1, value: "1" },
					{ id: 2, value: "2" },
					{ id: 3, value: "3" },
					{ id: 4, value: "4" },
					{ id: 5, value: "5" },
					{ id: 10, value: "10" }
				]
			},
			{
				view: "richselect",
				id: ids.typeRounding,
				name: 'typeRounding',
				label: L('ab.dataField.number.rounding', "*Rounding"),
				value: 'none',
				labelWidth: App.config.labelWidthLarge,
				vertical: true,
				disabled: true,
				hidden: true,
				options: [
					{ id: 'none', value: L('ab.dataField.number.default', "*Default") },
					{ id: 'roundUp', value: L('ab.dataField.number.roundUp', "*Round Up") },
					{ id: 'roundDown', value: L('ab.dataField.number.roundDown', "*Round Down") }
				]
			},
			{
				view: "richselect",
				// id: componentIds.typeThousands,
				name: 'typeThousands',
				label: L('ab.dataField.number.thousands', "*Thousands"),
				value: 'none',
				labelWidth: App.config.labelWidthLarge,
				vertical: true,
				options: delimiterList
			},



			{
				view: 'checkbox',
				id: ids.validate,
				name: 'validation',
				labelWidth: App.config.labelWidthCheckbox,
				labelRight: L('ab.dataField.number.validation', "*Validation"),
				on: {
					onChange: function (newVal) {
						if (newVal) {
							$$(ids.validateMinimum).enable();
							$$(ids.validateMaximum).enable();
							$$(ids.validateMinimum).show();
							$$(ids.validateMaximum).show();
						}
						else {
							$$(ids.validateMinimum).disable();
							$$(ids.validateMaximum).disable();
							$$(ids.validateMinimum).hide();
							$$(ids.validateMaximum).hide();
						}
					}
				}
			},
			{
				view: 'text',
				id: ids.validateMinimum,
				name: 'validateMinimum',
				label: L('ab.dataField.number.minimum', "*Minimum"),
				labelWidth: App.config.labelWidthLarge,
				disabled: true,
				hidden: true,
				on: {
					onChange: function (newVal, oldVal) {
						// Validate number
						if (!new RegExp('^[0-9.]*$').test(newVal)) {
							$$(ids.validateMinimum).setValue(oldVal || '');
						}
					}
				}
			},
			{
				view: 'text',
				id: ids.validateMaximum,
				name: 'validateMaximum',
				label: L('ab.dataField.number.maximum', "*Maximum"),
				labelWidth: App.config.labelWidthLarge,
				disabled: true,
				hidden: true,
				on: {
					onChange: function (newVal, oldVal) {
						// Validate number
						if (!new RegExp('^[0-9.]*$').test(newVal)) {
							$$(ids.validateMaximum).setValue(oldVal || '');
						}
					}
				}
			}

		]
	},

	// defaultValues: the keys must match a .name of your elements to set it's default value.
	defaultValues: defaultValues,

	// rules: basic form validation rules for webix form entry.
	// the keys must match a .name of your .elements for it to apply
	rules: {
		// 'textDefault':webix.rules.isNotEmpty,
		// 'supportMultilingual':webix.rules.isNotEmpty
	},

	// include additional behavior on default component operations here:
	// The base routines will be processed first, then these.  Any results
	// from the base routine, will be passed on to these:
	// 	@param {obj} ids  the list of ids used to generate the UI.  your
	//					  provided .elements will have matching .name keys
	//					  to access them here.
	//  @param {obj} values the current set of values provided for this instance
	// 					  of ABField:
	//					  {
	//						id:'',			// if already .saved()
	// 						label:'',
	// 						columnName:'',
	//						settings:{
	//							showIcon:'',
	//
	//							your element key=>values here
	//						}
	//					  }
	//
	// 		.clear(ids)  : reset the display to an empty state
	// 		.isValid(ids, isValid): perform validation on the current editor values
	// 		.populate(ids, values) : populate the form with your current settings
	// 		.show(ids)   : display the form in the editor
	// 		.values(ids, values) : return the current values from the form
	logic: {

		isValid: (ids, isValid) => {

			// validate min/max values
			if ($$(ids.validation).getValue() == true &&
				$$(ids.validateMinimum).getValue() &&
				$$(ids.validateMaximum).getValue()) {

				isValid = $$(ids.validateMinimum).getValue() < $$(ids.validateMaximum).getValue();

				if (!isValid) {
					OP.Dialog.Alert({
						title: 'Validate values are invalid',
						text: 'Maximum value should be greater than minimum value'
					});
				}

			}

			return isValid;
		},

		populate: (ids, values) => {
			if (values.settings.validation) {
				$$(ids.validateMinimum).enable();
				$$(ids.validateMaximum).enable();
			} else {
				$$(ids.validateMinimum).disable();
				$$(ids.validateMaximum).disable();
			}
		}
	},

	// perform any additional setup actions here.
	// @param {obj} ids  the hash of id values for all the current form elements.
	//					 it should have your elements + the default Header elements:
	//						.label, .columnName, .fieldDescription, .showIcon
	init: function (ids) {
		// want to hide the description? :
		// $$(ids.fieldDescription).hide();
	}

})





class ABFieldNumber extends ABField {

    constructor(values, object) {
		super(values, object, ABFieldNumberDefaults);

    	/*
    	{
			settings: {
				'allowRequired':0,
				'numberDefault':null,
				'typeFormat': 'none',
				'typeDecimals': 'none',
				'typeDecimalPlaces': 'none',
				'typeRounding' : 'none',
				'typeThousands': 'none',
				'validation':0,
				'validateMinimum':null,
				'validateMaximum':null
			}
    	}
    	*/

		// we're responsible for setting up our specific settings:
		for (var dv in defaultValues) {
			this.settings[dv] = values.settings[dv] || defaultValues[dv];
		}


		// text to Int:
		this.settings.allowRequired = parseInt(this.settings.allowRequired);
		this.settings.validation = parseInt(this.settings.validation);

	}


	// return the default values for this DataField
	static defaults() {
		return ABFieldNumberDefaults;
	}



	/*
	 * @function propertiesComponent
	 *
	 * return a UI Component that contains the property definitions for this Field.
	 *
	 * @param {App} App the UI App instance passed around the Components.
	 * @return {Component}
	 */
	static propertiesComponent(App) {
		return ABFieldNumberComponent.component(App);
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

	// return the grid column header definition for this instance of ABFieldNumber
	columnHeader(isObjectWorkspace) {
		var config = super.columnHeader(isObjectWorkspace);

		config.editor = 'number';		// [edit_type] simple inline editing.

		config.format = (d) => {
			return this.getNumberFormat(d);
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

		// if no default value is set, then don't insert a value.
		if (this.settings.numberDefault != '') {
			values[this.columnName] = this.settings.numberDefault;
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

		if (data[this.columnName] != null && data[this.columnName] != '') {
			var value = data[this.columnName];

			// if this is an integer:
			if (this.settings.typeDecimals == 'none') {

				value = parseInt(value);

			} else {
				var places = parseInt(this.settings.typeDecimalPlaces) || 2;
				value = parseFloat(parseFloat(value).toFixed(places));
			}

			var isNumeric = (n) => {
				return !Number.isNaN(parseFloat(n)) && Number.isFinite(n);
			}
			if (!isNumeric(value)) {
				validator.addError(this.columnName, 'invalid number');
			}

			// validate Minimum
			if (this.settings.validation == true &&
				this.settings.validateMinimum != null &&
				this.settings.validateMinimum > value) {

				var errMessage = 'should be greater than {min}'
					.replace('{min}', this.settings.validateMinimum);

				validator.addError(this.columnName, errMessage);
			}

			// validate Maximum
			if (this.settings.validation == true &&
				this.settings.validateMaximum != null &&
				this.settings.validateMaximum < value) {

				var errMessage = 'should be less than {max}'
					.replace('{max}', this.settings.validateMaximum);

				validator.addError(this.columnName, errMessage);
			}
		}

	}

	getNumberFormat(data) {
		var formatSign = formatList.filter((item) => item.id == this.settings.typeFormat)[0],
			thousandsSign = delimiterList.filter((item) => item.id == this.settings.typeThousands)[0],
			decimalSign = delimiterList.filter((item) => item.id == this.settings.typeDecimals)[0],
			decimalPlaces = this.settings.typeDecimalPlaces != 'none' ? parseInt(this.settings.typeDecimalPlaces) : 0;

		var prefix = '',
			postfix = '';

		if (formatSign && formatSign.sign) {
			switch (formatSign.position) {
				case 'prefix':
					prefix = formatSign.sign;
					break;
				case 'postfix':
					postfix = formatSign.sign;
					break;
			}
		}

		decimalSign = decimalSign.sign || '';
		thousandsSign = thousandsSign.sign || '';

		// round number
		if (this.settings.typeRounding == 'roundDown') {
			var digit = Math.pow(10, decimalPlaces);
			data = Math.floor(data * digit) / digit;
		}

		return '{prefix} {number} {postfix}'
			.replace('{prefix}', prefix)
			.replace('{postfix}', postfix)
			.replace('{number}', webix.Number.format(data, {
				groupDelimiter: thousandsSign,
				groupSize: 3,
				decimalDelimiter: decimalSign,
				decimalSize: decimalPlaces
			}));
	}

}


// NOTE: if you need a unique [edit_type] by your returned config.editor above:
webix.editors.number = webix.extend({
	// TODO : Validate number only
}, webix.editors.text);


//// NOTE: if you need a unique [sort_type] by your returned config.sort above:
// webix.DataStore.prototype.sorting.as.[sort_type] = function(a,b){
//     return a > b ? 1 : -1;
// }

export default ABFieldNumber;
