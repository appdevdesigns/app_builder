/*
 * ABFieldString
 *
 * An ABFieldString defines a string field type.
 *
 */

import ABField from "./ABField"
import ABFieldComponent from "./ABFieldComponent"



function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var ABFieldStringDefaults = {
	key : 'string', // unique key to reference this specific DataField
	// type : 'string', // http://sailsjs.org/documentation/concepts/models-and-orm/attributes#?attribute-options
	icon : 'font',   // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'

	// menuName: what gets displayed in the Editor drop list
	menuName : L('ab.dataField.string.menuName', '*Single line text'),

	// description: what gets displayed in the Editor description.
	description: L('ab.dataField.string.description', '*short string value')
}




/**
 * ABFieldStringComponent
 *
 * Defines the UI Component for this Data Field.  The ui component is responsible
 * for displaying the properties editor, populating existing data, retrieving
 * property values, etc.
 */
var ABFieldStringComponent = new ABFieldComponent({

	fieldDefaults: ABFieldStringDefaults,

	elements:function(App) {
		return [
			{
				view: "text",
				name:'textDefault',
				labelWidth: App.config.labelWidthMedium,
				label: L('ab.dataField.string.defaultLabel', '*Default'),
				placeholder: L('ab.dataField.string.default', '*Enter default value')
			},
			{
				view: "checkbox",
				name:'supportMultilingual',
				disallowEdit: true,
				labelRight: L('ab.dataField.string.supportMultilingual', '*Support multilingual'),
				labelWidth: App.config.labelWidthCheckbox,
				value: true
			}
		]
	},

	// defaultValues: the keys must match a .name of your elements to set it's default value.
	defaultValues:{
		'textDefault': '',
		'supportMultilingual':1
	},

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





class ABFieldString extends ABField {

    constructor(values, object) {
    	super(values, object, ABFieldStringDefaults);

    	/*
    	{
			settings: {
				textDefault: 'string',
				supportMultilingual: true/false
			}
    	}
    	*/

    	// we're responsible for setting up our specific settings:
    	this.settings.textDefault = values.settings.textDefault || '';
    	this.settings.supportMultilingual = values.settings.supportMultilingual+"" || "1";

    	// text to Int:
    	this.settings.supportMultilingual = parseInt(this.settings.supportMultilingual);

  	}


  	// return the default values for this DataField
  	static defaults() {
  		return ABFieldStringDefaults;
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
  		return ABFieldStringComponent.component(App);
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

	// return the grid column header definition for this instance of ABFieldString
	columnHeader (isObjectWorkspace) {
		var config = super.columnHeader(isObjectWorkspace);

		config.editor = 'text';
		config.sort   = 'string'

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
			if (this.settings.textDefault) {
				values[this.columnName] = this.settings.textDefault;
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
	}


	/*
	 * @function isMultilingual
	 * does this field represent multilingual data?
	 * @return {bool}
	 */
	isMultilingual() {
		return this.settings.supportMultilingual == 1;
	}



}



export default ABFieldString;
