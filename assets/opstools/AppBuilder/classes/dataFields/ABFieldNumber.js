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
	key : 'number', // unique key to reference this specific DataField
	icon : 'slack',   // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'

	// menuName: what gets displayed in the Editor drop list
	menuName : L('ab.dataField.number.menuName', '*Number'),

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

var defaultValues = {
	'allowRequired':0,
	'numberDefault':'',
	'typeFormat': 'none',
	'typeDecimals': 'none',
	'typeDecimalPlaces': 'none',
	'typeRounding' : 'none',
	'typeThousands': 'none',
	'validation':0,
	'validateMinimum':'',
	'validateMaximum':''
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

	elements:(App, field) => {



		// var idBase = ABFieldNumberDefaults.type;
		// var ids = {
		// 	typeDecimalPlaces: this.unique(App, '_typeDecimalPlaces'),  // App.unique(idBase +'_typeDecimalPlaces'),
		// 	typeRounding: App.unique(idBase +'_typeRounding'),
		// 	validateMinimum: App.unique(idBase + '_validateMinimum'),
		// 	validateMaximum: App.unique(idBase + '_validateMaximum')
		// }

		var ids = {
			typeDecimalPlaces 	: '',
			typeRounding 		: '',
			validateMinimum 	: '',
			validateMaximum 	: ''
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
// id: componentIds.allowRequired,
				name:"allowRequired",
				labelRight: L("ab.dataField.number.required", "*Required"),
				// inputWidth: 130,
				labelWidth: 0
			},
			{
				view: "text",
				label: L("ab.dataField.number.defaultValue", "*Default Value"),
				labelWidth: App.config.labelWidthLarge,
// id: componentIds.numberDefault,
				name:"numberDefault",
				placeholder: L('ab.dataField.number.defaultNumber', '*Default number'),
				on: {
					onChange: function (newVal, oldVal) {
						// Validate number
						if (!new RegExp('^[0-9.]*$').test(newVal)) {
							// $$(componentIds.numberDefault).setValue(oldVal);
							this.setValue(oldVal);
						}
					}
				}
			},
			{
				view: "richselect",
// id: componentIds.typeFormat,
				name:'typeFormat',
				label: L('ab.dataField.number.format', "*Format"),
				value: 'none',
				labelWidth: App.config.labelWidthLarge,
				options: formatList
			},
			{
				view: "richselect",
// id: componentIds.typeDecimals,
				name:'typeDecimals',
				label: L('ab.dataField.number.decimals', "*Decimals"),
				value: 'none',
				labelWidth: App.config.labelWidthLarge,
				options: [
					{ id: 'none', value: L('ab.dataField.number.none', "*None") },
					{ id: 'period', value: L('ab.dataField.number.period', "*Period") },
					{ id: 'comma', value: L('ab.dataField.number.comma', "*Comma") }
				],
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
				name:'typeDecimalPlaces',
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
				name:'typeRounding',
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
				name:'typeThousands',
				label: L('ab.dataField.number.thousands', "*Thousands"),
				value: 'none',
				labelWidth: App.config.labelWidthLarge,
				vertical: true,
				options: [
					{ id: 'none', value: L('ab.dataField.number.none', "*None") },
					{ id: 'comma', value: L('ab.dataField.number.comma', "*Comma") },
					{ id: 'period', value: L('ab.dataField.number.period', "*Period") },
					{ id: 'space', value: L('ab.dataField.number.space', "*Space") }
				]
			},



			{
				view: 'checkbox',
// id: componentIds.validate,
				name:'validation',
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
				name:'validateMinimum',
				label: L('ab.dataField.number.minimum', "*Minimum"),
				labelWidth: App.config.labelWidthLarge,
				disabled: true,
				hidden: true,
				on: {
					onChange: function(newVal, oldVal) {
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
				name:'validateMaximum',
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
	defaultValues:defaultValues,

	// rules: basic form validation rules for webix form entry.
	// the keys must match a .name of your .elements for it to apply
	rules:{
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
	logic:{

		populate:function(ids, values) {
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
	init:function(ids) {
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

		var errors = super.isValid();

		// errors = OP.Form.validationError({
		// 	name:'columnName',
		// 	message:L('ab.validation.object.name.unique', 'Field columnName must be unique (#name# already used in this Application)').replace('#name#', this.name),
		// }, errors);

		return errors;
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
	columnHeader (isObjectWorkspace) {
		var config = super.columnHeader(isObjectWorkspace);

		config.editor = 'number';		// [edit_type] simple inline editing.
		config.sort   = 'int';			// [sort_type]

		return config;
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
