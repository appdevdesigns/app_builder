/*
 * ABFieldJson
 *
 * An ABFieldJson defines a JSON field type.
 *
 */

import ABField from "./ABField"
import ABFieldComponent from "./ABFieldComponent"


function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var ABFieldJsonDefaults = {
	key: 'json',	// unique key to reference this specific DataField
	icon: 'font',	// font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'

	// menuName: what gets displayed in the Editor drop list
	menuName: L('ab.dataField.json.menuName', '*JSON'),

	// description: what gets displayed in the Editor description.
	description: L('ab.dataField.json.description', '*JSON value')

}


var defaultValues = {
};



/**
 * ABFieldJsonComponent
 *
 * Defines the UI Component for this Data Field.  The ui component is responsible
 * for displaying the properties editor, populating existing data, retrieving
 * property values, etc.
 */
var ABFieldJsonComponent = new ABFieldComponent({

	fieldDefaults: ABFieldJsonDefaults,

	elements: function (App, field) {

		var ids = {
		}
		ids = field.idsUnique(ids, App);

		return []
	},

	// defaultValues: the keys must match a .name of your elements to set it's default value.
	defaultValues: defaultValues,

	// rules: basic form validation rules for webix form entry.
	// the keys must match a .name of your .elements for it to apply
	rules: {
		// 'default':webix.rules.isNotEmpty,
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
		// requiredOnChange: (newVal, oldVal, ids) => {

		// 	// when require value, then default value needs to be reqired
		// 	$$(ids.default).define("required", newVal);
		// 	$$(ids.default).refresh();

		// },

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





class ABFieldJson extends ABField {

	constructor(values, object) {
		super(values, object, ABFieldJsonDefaults);
	}


	// return the default values for this DataField
	static defaults() {
		return ABFieldJsonDefaults;
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
		return ABFieldJsonComponent.component(App, idBase);
	}



	///
	/// Instance Methods
	///


	// isValid() {

	// 	var validator = super.isValid();

	// 	// validator.addError('columnName', L('ab.validation.object.name.unique', 'Field columnName must be unique (#name# already used in this Application)').replace('#name#', this.name) );

	// 	return validator;
	// }


	// /**
	//  * @method fromValues()
	//  *
	//  * initialze this object with the given set of values.
	//  * @param {obj} values
	//  */
	// fromValues(values) {

	// 	super.fromValues(values);

	// }


	// /**
	//  * @method toObj()
	//  *
	//  * properly compile the current state of this ABApplication instance
	//  * into the values needed for saving to the DB.
	//  *
	//  * Most of the instance data is stored in .json field, so be sure to
	//  * update that from all the current values of our child fields.
	//  *
	//  * @return {json}
	//  */
	// toObj() {

	// 	var obj = super.toObj();

	// 	return obj;
	// }




	///
	/// Working with Actual Object Values:
	///

	// return the grid column header definition for this instance of ABFieldJson
	columnHeader(options) {
		var config = super.columnHeader(options);

		// config.editor = null; // read only for now
		config.editor = 'text';
		config.css = 'textCell';

		return config;
	}


	// /**
	//  * @method isValidData
	//  * Parse through the given data and return an error if this field's
	//  * data seems invalid.
	//  * @param {obj} data  a key=>value hash of the inputs to parse.
	//  * @param {OPValidator} validator  provided Validator fn
	//  * @return {array} 
	//  */
	isValidData(data, validator) {

		super.isValidData(data, validator);

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

		// read-only for now
		return super.formComponent('fieldreadonly');
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



export default ABFieldJson;
