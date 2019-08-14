/*
 * ABFieldAutoIndex
 *
 * An ABFieldAutoIndex defines a AutoIndex field type.
 *
 */

import ABField from "./ABField"
import ABFieldComponent from "./ABFieldComponent"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var ids = {
	prefixText: 'prefixText',
	delimiterText: 'delimiterText',
	displayLength: 'diisplayLength',
	previewText: 'previewText',
	currentIndex: 'currentIndex',
}

var ABFieldAutoIndexDefaults = {
	key: 'AutoIndex', // unique key to reference this specific DataField
	icon: 'key',   // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'		

	// menuName: what gets displayed in the Editor drop list
	menuName: L('ab.dataField.AutoIndex.menuName', '*Auto Index'),

	// description: what gets displayed in the Editor description.
	description: L('ab.dataField.AutoIndex.description', '*Auto Increment Value'),

}



// defaultValues: the keys must match a .name of your elements to set it's default value.
var defaultValues = { 
	'displayLength':4,
	'currentIndex': 0
}


var delimiterList = [
	{ id: 'comma', value: "Comma", sign: ", " },
	{ id: 'slash', value: "Slash", sign: "/" },
	{ id: 'space', value: "Space", sign: " " },
	{ id: 'dash', value: "Dash", sign: "-" },
	{ id: 'colon', value: "Colon", sign: ":" },
];

/**
 * 
 * Private methods 
 * 
 */

function previewChange() {

	var prefixText = $$(ids.prefixText);
	var displayLength = $$(ids.displayLength);
	var delimiterText = $$(ids.delimiterText);
	var previewText = $$(ids.previewText);
	var previewResult = setValueToIndex(prefixText.getValue(), delimiterText.getValue(), displayLength.getValue(), 0);
	if(previewText) {
		previewText.setValue(previewResult);
	}
}

function getDelimiterSign(text) {
	var delimiterItem = delimiterList.filter((item) => {
		return item.id == text;
	})[0];

	return delimiterItem ? delimiterItem.sign : '';
}

function setValueToIndex(prefix, delimiter, displayLength, displayNumber) {
	var resultIndex = prefix + getDelimiterSign(delimiter) + ("0000000000" + displayNumber).slice(-parseInt(displayLength));

	return resultIndex;
}

/**
 * 
 * End Private methods 
 * 
 */



/**
 * ABFieldAutoIndexComponent
 *
 * Defines the UI Component for this Data Field.  The ui component is responsible
 * for displaying the properties editor, populating existing data, retrieving
 * property values, etc.
 *
 * @param {obj} App  the current Component Application instance for the current UI.
 * @return {obj} the Component object.
 */
var ABFieldAutoIndexComponent = new ABFieldComponent({

	fieldDefaults: ABFieldAutoIndexDefaults,

	elements: (App, field) => {

		ids = field.idsUnique(ids, App);

		return [
			{
				id: ids.prefixText,
				view: "text",
				name: 'prefix',
				labelWidth: App.config.labelWidthLarge,
				label: L('ab.dataField.prefixText', '*Prefix'),
				placeholder: L('ab.dataField.prefixTextPlaceholder', '*US'),
				on: {
					onChange: (newVal, oldVal) => {
						previewChange();
					}
				}
				
			},
			{
				id: ids.delimiterText,
				view: "richselect", 
				name: 'delimiter',
				labelWidth: App.config.labelWidthLarge,
				label: L('ab.dataField.delimiter', '*Delimiter'),
				value: "dash", options: delimiterList,
				on: {
					onChange: (newVal, oldVal) => {
						previewChange();
					}
				}
			},
			{
				id: ids.displayLength,
				view: "counter",
				name: 'displayLength',
				labelWidth: App.config.labelWidthLarge,
				label: L('ab.dataField.displayLength', '*Length'),
				step: 1,
				value: 4,
				min: 1,
				max: 10,
				on: {
					onChange: (newVal, oldVal) => {
						previewChange();
					}
				}
			},
			{
				id: ids.previewText,
				view: "text",
				name: 'previewText',
				labelWidth: App.config.labelWidthLarge,
				label: L('ab.dataField.previewText', '*Preview'),
				disabled: true,
			},
			{
				id: ids.currentIndex,
				view: "text",
				name: 'currentIndex',
				value: 0,
				hidden: true
			}
			// {
			// 	view: "checkbox",
			// 	name:'supportMultilingual',
			// 	labelRight: L('ab.dataField.string.supportMultilingual', '*Support multilingual'),
			// 	labelWidth: App.config.labelWidthCheckbox,
			// 	value: true
			// }
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
		populate: (ids, values) => {
			var currentObject = ABFieldAutoIndexComponent.currentObject;
			previewChange();

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





class ABFieldAutoIndex extends ABField {

	constructor(values, object) {
		super(values, object, ABFieldAutoIndexDefaults);

    	/*
    	{
			settings: {
				textDefault: 'string',
				supportMultilingual: true/false
			}
    	}
    	*/

		// we're responsible for setting up our specific settings:
		for (var dv in defaultValues) {
			this.settings[dv] = values.settings[dv] || defaultValues[dv];
		}

		// // text to Int:
		// this.settings.supportMultilingual = parseInt(this.settings.supportMultilingual);
		this.settings.currentIndex = parseInt(this.settings.currentIndex || 1);
		this.settings.displayLength = parseInt(this.settings.displayLength);

	}


  	// return the default values for this DataField
  	static defaults() {
		return ABFieldAutoIndexDefaults;
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
		return ABFieldAutoIndexComponent.component(App, idBase);
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

	// return the grid column header definition for this instance of ABFieldAutoIndex
	columnHeader(options) {
		var config = super.columnHeader(options);

		config.editor = null; // read only
		config.css = 'textCell';
		config.template = (rowData) => {
			return this.format(rowData);
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
		if (!values[this.columnName]) {

			if (this.settings.currentIndex == null) {
				this.settings.currentIndex = 1;
			}

			// Set default value
			values[this.columnName] = this.settings.currentIndex;
			this.settings.currentIndex += 1;
			this.save();
		}
	}

	format(rowData) {

		if (!rowData[this.columnName])
			return "";

		try {
			var resultAutoIndex = setValueToIndex(this.settings.prefix, this.settings.delimiter, this.settings.displayLength, rowData[this.columnName]);

			return resultAutoIndex;	
		}
		catch (err) {
			return "";
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

		var validator = super.isValid();

		// validator.addError(this.columnName, L('ab.validation.object.name.unique', 'Field columnName must be unique (#name# already used in this Application)').replace('#name#', this.name) );

		return validator;

	}


	/*
	 * @property isMultilingual
	 * does this field represent multilingual data?
	 * @return {bool}
	 */
	get isMultilingual() {
		// return this.settings.supportMultilingual == 1;
		return false;
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
		
		return super.formComponent('fieldreadonly');
	}


	detailComponent() {
		
		let detailComponentSetting = super.detailComponent();

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


export default ABFieldAutoIndex;
