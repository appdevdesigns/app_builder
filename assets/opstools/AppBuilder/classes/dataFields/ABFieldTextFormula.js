/*
 * ABFieldTextFormula
 *
 * An ABFieldTextFormula defines a TextFormula field type.
 *
 */

import ABField from "./ABField"
import ABFieldComponent from "./ABFieldComponent"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}



var ABFieldTextFormulaDefaults = {
	key: 'TextFormula', // unique key to reference this specific DataField
	icon: 'font',   // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'		

	// menuName: what gets displayed in the Editor drop list
	menuName: L('ab.dataField.TextFormula.menuName', '*Text Formula'),

	// description: what gets displayed in the Editor description.
	description: L('ab.dataField.TextFormula.description', '*Text Formula'),

}



// defaultValues: the keys must match a .name of your elements to set it's default value.
var defaultValues = {
	// 'useWidth':0,
	// 'imageWidth':'',
	// 'useHeight': 0,
	// 'imageHeight': ''
}



/**
 * ABFieldTextFormulaComponent
 *
 * Defines the UI Component for this Data Field.  The ui component is responsible
 * for displaying the properties editor, populating existing data, retrieving
 * property values, etc.
 *
 * @param {obj} App  the current Component Application instance for the current UI.
 * @return {obj} the Component object.
 */
var ABFieldTextFormulaComponent = new ABFieldComponent({

	fieldDefaults: ABFieldTextFormulaDefaults,

	elements: (App, field) => {

		// NOTE: you might not need to define your own ids, but if you do, do it like this:
		var ids = {
			textFormula: 'formulaTextArea',
			formulaSuggest: 'formulaSuggest',
		}
		ids = field.idsUnique(ids, App);

		return [
			{
				id: ids.textFormula,
				view: "textarea",
				label: "Text Formula",
				name: "textFormula",
				editor: "text",
				labelWidth: App.config.labelWidthLarge,
				placeholder: L('ab.dataField.textformula.placeholder', '*{Firstname} {Lastname}'),
				on: {
					onFocus: (current_view, prev_view) => {
						$$(ids.formulaSuggest).show();
					},
					onBlur: (prev_view) => {
						$$(ids.formulaSuggest).hide();
					}
				}
			},
			{
				view: "layout",
				cols:[
					{},
					{
						id: ids.formulaSuggest,
						name: "formulaSuggest",
						view: "dataview",
						xCount: 1,
						yCount: 2.8,
						hidden: true,
						select: true,
						type: {
							height: 30,
							width: 246,
						},
						template: "#value#",
						on: {
							onItemClick: (id, event, node) => {
								var item = $$(ids.formulaSuggest).getItem(id);
								var inputSuggestString = item.type == "field" ? "{" + item.value + "}" : item.value;
								$$(ids.textFormula).setValue($$(ids.textFormula).getValue() + inputSuggestString);
								$$(ids.formulaSuggest).unselect();
							}
						}
					}
				]
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
		objectLoad: (object) => {
			ABFieldTextFormulaComponent.currentObject = object;
		},
		populate: (ids, values) => {
			var currentObject = ABFieldTextFormulaComponent.currentObject;
			var textAreaFormula = $$(ids.textFormula);
			var formulaSuggest = $$(ids.formulaSuggest);
			var formulaData = [];

			currentObject._fields.forEach(field => {
				if (field.columnName != currentObject.name) {
					formulaData.push({ id: field.id, value: field.columnName, type: "field" });
				}
			});

			formulaSuggest.clearAll();
			formulaSuggest.parse(formulaData);

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

class ABFieldTextFormula extends ABField {

	constructor(values, object) {
		super(values, object, ABFieldTextFormulaDefaults);

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

	}


  	// return the default values for this DataField
  	static defaults() {
		return ABFieldTextFormulaDefaults;
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
		return ABFieldTextFormulaComponent.component(App, idBase);
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

	// return the grid column header definition for this instance of ABFieldTextFormula
	columnHeader(isObjectWorkspace) {
		var config = super.columnHeader(isObjectWorkspace);

		config.editor = null; // read only

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

			// Set default value
			// values[this.columnName] = this.settings.DEFAULT_VALUE;

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
	* @function customDisplay
	* perform any custom display modifications for this field.  
	* @param {object} row is the {name=>value} hash of the current row of data.
	* @param {App} App the shared ui App object useful more making globally
	*					unique id references.
	* @param {HtmlDOM} node  the HTML Dom object for this field's display.
	*/
	customDisplay(row, App, node, options) {
		// sanity check.
		if (!node) { return }
		
		options = options || {};

		if (this.settings.textFormula) {

			//Check Field value first
			var fieldRegExp = /{\w+}/gm;
			var resultFormula = this.settings.textFormula;
			var matches_field_array = resultFormula.match(fieldRegExp);
			matches_field_array.forEach(element => {
				var columnName = element.replace(/{|}|\"/g, '');
				if (row.hasOwnProperty(columnName)) {
					resultFormula = resultFormula.replace(element, row[columnName] ? row[columnName] : "");
				}
			});

			node.innerText = resultFormula;
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
		
		return super.formComponent('[form_component_key]');
	}


	detailComponent() {
		
		var detailComponentSetting = super.detailComponent();

		detailComponentSetting.common = () => {
			return {
				key: '[detail_component_key]'
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


export default ABFieldTextFormula;
