/*
 * ABFieldLongText
 *
 * An ABFieldLongText defines a LongText field type.
 *
 */

import ABField from "./ABField"
import ABFieldComponent from "./ABFieldComponent"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}



var ABFieldLongTextDefaults = {
	key: 'LongText', // unique key to reference this specific DataField
	type: 'longtext', 
	icon: 'align-right',   // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'		

	// menuName: what gets displayed in the Editor drop list
	menuName: L('ab.dataField.LongText.menuName', '*Long text'),

	// description: what gets displayed in the Editor description.
	description: L('ab.dataField.LongText.description', '*Multiple lines of text'),

}



// defaultValues: the keys must match a .name of your elements to set it's default value.
var defaultValues = {
	'textDefault': '',
	'supportMultilingual': 0
}



/**
 * ABFieldLongTextComponent
 *
 * Defines the UI Component for this Data Field.  The ui component is responsible
 * for displaying the properties editor, populating existing data, retrieving
 * property values, etc.
 *
 * @param {obj} App  the current Component Application instance for the current UI.
 * @return {obj} the Component object.
 */
var ABFieldLongTextComponent = new ABFieldComponent({

	fieldDefaults: ABFieldLongTextDefaults,

	elements: (App, field) => {

		// NOTE: you might not need to define your own ids, but if you do, do it like this:
		var ids = {
			textDefault: ''
		}
		ids = field.idsUnique(ids, App);

		return [
			{
				view: "text",
				id: ids.textDefault,
				name: 'textDefault',
				label: L('ab.dataField.string.defaultLabel', '*Default'),
				labelPosition:"top",
				placeholder: L('ab.dataField.string.default', '*Default text')
			},
			{
				view: "checkbox",
				name: 'supportMultilingual',
				disallowEdit: true,
				labelRight: L('ab.dataField.string.supportMultilingual', '*Support multilingual'),
				labelWidth: App.config.labelWidthCheckbox,
				value: false
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
			$$(ids.textDefault).define("required", newVal);
			$$(ids.textDefault).refresh();

		},

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





class ABFieldLongText extends ABField {

	constructor(values, object) {
		super(values, object, ABFieldLongTextDefaults);

    	/*
    	{
			settings: {
				textDefault: 'string',
				supportMultilingual: 1/0
			}
    	}
    	*/

		// we're responsible for setting up our specific settings:
		for (var dv in defaultValues) {
			this.settings[dv] = values.settings[dv] || defaultValues[dv];
		}

		// // text to Int:
		this.settings.supportMultilingual = parseInt(this.settings.supportMultilingual);

	}


	// return the default values for this DataField
	static defaults() {
		return ABFieldLongTextDefaults;
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
		return ABFieldLongTextComponent.component(App);
	}



	///
	/// Instance Methods
	///


	isValid() {

		var validator = super.isValid();

		// validator.addError('columnName', L('ab.validation.object.name.unique', 'Field columnName must be unique (#name# already used in this Application)').replace('#name#', this.name) );

		return validator;
	}


	/*
	 * @function isMultilingual
	 * does this field represent multilingual data?
	 * @return {bool}
	 */
	isMultilingual() {
		return this.settings.supportMultilingual == 1;
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

	// return the grid column header definition for this instance of ABFieldLongText
	columnHeader(isObjectWorkspace) {
		var config = super.columnHeader(isObjectWorkspace);

		config.editor = 'text';  // '[edit_type]'   for your unique situation
		// config.sort = 'string' // '[sort_type]'   for your unique situation

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
			if (typeof this.settings.textDefault == 'string') {
				values[this.columnName] = this.settings.textDefault;
			}
			else {
				values[this.columnName] = '';
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
		
		super.isValidData(data, validator);
		
		if (data && data[this.columnName]) {
			var max_length = 5000;
			
			if (data[this.columnName].length > max_length) {
				validator.addError(this.columnName, 'should NOT be longer than {max} characters'.replace('{max}', max_length));
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
					type: 'multiple'
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



//// NOTE: if you need a unique [edit_type] by your returned config.editor above:
// webix.editors = {
//   "[edit_type]": {
//     focus: function () {...}
//     getValue: function () {...},
//     setValue: function (value) {...},
//     render: function () {...}
//   }
// };


//// NOTE: if you need a unique [sort_type] by your returned config.sort above:
// webix.DataStore.prototype.sorting.as.[sort_type] = function(a,b){ 
//     return a > b ? 1 : -1; 
// }


export default ABFieldLongText;
