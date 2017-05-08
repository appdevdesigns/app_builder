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
	name : 'string', // unique key to reference this specific DataField
	type : 'string', // http://sailsjs.org/documentation/concepts/models-and-orm/attributes#?attribute-options
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
 *
 * @param {obj} App  the current Component Application instance for the current UI.
 * @return {obj} the Component object.
 */
// var ABFieldStringComponent = function(App) {

// 	labels.common = App.labels;

// 	var idBase = 'ab_datafield_string';


// 	var componentDefaults = {
// 		textDefault: '', 
// 		supportMultilingual:1
// 	};



// 	var ids = {

// 		component: App.unique(idBase+'_component'),

// 		textDefault: App.unique(idBase+'_textdefault'),
// 		supportMultilingual: App.unique(idBase+'_supportMultilingual'),


// 		// the common property fields
// 		label: App.unique(idBase+'_label'),
// 		columnName: App.unique(idBase+'_columnName'),
// 		fieldDescription: App.unique(idBase+'_fieldDescription'),
// 		showIcon: App.unique(idBase+'_showIcon'),
// 	}


// 	//// NOTE: we merge in the common headers below.
// 	var _ui = {
// 		view:'form',
// 		id: ids.component,
// 		autoheight:true,
// 		borderless:true,
// 		elements: [
// 			{
// 				view: "text",
// 				id: ids.textDefault,
// 				name:'textDefault',
// 				placeholder: labels.component.defaultText
// 			},
// 			{
// 				view: "checkbox",
// 				id: ids.supportMultilingual,
// 				name:'supportMultilingual',
// 				labelRight: labels.component.supportMultilingual,
// 				labelWidth: 0,
// 				value: true
// 			}
// 		],

// 		rules:{
// 			'label':webix.rules.isNotEmpty,
// 			'columnName':webix.rules.isNotEmpty
// 		}
// 	}



// 	var _init = function() {

// 		// perform any additional setup actions.
// 		// for example, don't want to show the description, then .hide() it here:
// 		// $$(ids.fieldDescription).hide();
// 	}



// 	var _logic = {

// 		/*
// 		 * @function clear
// 		 *
// 		 * clear the form.
// 		 */
// 		clear: function () {

// 			ABField.clearEditor(App, ids);

// 			for(var f in componentDefaults) { 
// 				var component = $$(ids[f]);
// 				component.setValue(componentDefaults[f]);
// 			}

// 			$$(ids.component).clearValidation();
// 		},


// 		/*
// 		 * @function isValid
// 		 *
// 		 * checks the current values on the componet to see if they are Valid
// 		 */
// 		isValid: function () {

// 			return $$(ids.component).validate();

// 		},


		
// 		 * @function labelOnChange
// 		 *
// 		 * The ABField.definitionEditor implements a default operation
// 		 * to update the value of the .columnName with the current value of 
// 		 * label.
// 		 * 
// 		 * if you want to override that functionality, implement this fn()
// 		 *
// 		 * @param {string} newVal	The new value of label
// 		 * @param {string} oldVal	The previous value
		 
// 		// labelOnChange: function (newVal, oldVal) {

// 		// 	// When the Label value changes, update our Column Name value 
// 		// 	// to match.

// 		// 	oldVal = oldVal || '';
// 		// 	if (newVal != oldVal &&
// 		// 		oldVal == $$(ids.columnName).getValue()) {
// 		// 		$$(ids.columnName).setValue(newVal);
// 		// 	}
// 		// },


// 		/*
// 		 * @function populate
// 		 *
// 		 * populate the form with the given ABField instance provided.
// 		 *
// 		 * @param {ABFieldString} field
// 		 */
// 		populate: function (field) {
// console.error('TODO: .populate()');
// 		},


// 		/*
// 		 * @function show
// 		 *
// 		 * show this component.
// 		 */
// 		show: function() {
// 			$$(ids.component).clearValidation();
// 			$$(ids.component).show();
// 		},


// 		/*
// 		 * @function values
// 		 *
// 		 * return the values for this form.
// 		 * @return {obj}  
// 		 */
// 		values: function () {

// 			var settings = $$(ids.component).getValues();
// 			var values = ABField.editorValues(settings);

// 			values.type = ABFieldStringDefaults.type;
	
// 			return values;
// 		}

// 	}


// 	// get the common UI headers entries, and insert them above ours here:
// 	// NOTE: put this here so that _logic is defined.
// 	var commonUI = ABField.definitionEditor(App, ids, _logic, ABFieldStringDefaults);
// 	_ui.elements = commonUI.rows.concat(_ui.elements);


// 	// return the current instance of this component:
// 	return {
// 		ui:_ui,					// {obj} 	the webix ui definition for this component
// 		init:_init,				// {fn} 	init() to setup this component  
// 		// actions:_actions,		// {ob}		hash of fn() to expose so other components can access.


// 		// DataField exposed actions:
// 		clear: _logic.clear,
// 		isValid:_logic.isValid,
// 		populate: _logic.populate,
// 		show: _logic.show,
// 		values: _logic.values,


// 		_logic: _logic			// {obj} 	Unit Testing
// 	}
// }


var ABFieldStringComponent = new ABFieldComponent({

	fieldDefaults: ABFieldStringDefaults,

	elements:[
		{
			view: "text",
			name:'textDefault',
			placeholder: L('ab.dataField.string.default', '*Default text')
		},
		{
			view: "checkbox",
			name:'supportMultilingual',
			labelRight: L('ab.dataField.string.supportMultilingual', '*Support multilingual'),
			labelWidth: 0,
			value: true
		}
	],

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

	// return the grid column header definition for this instance of ABFieldString
	columnHeader (isObjectWorkspace) {
		var config = super.columnHeader(isObjectWorkspace);

		config.editor = 'text';
		config.sort   = 'string'

		return config;
	}

}


export default ABFieldString;
