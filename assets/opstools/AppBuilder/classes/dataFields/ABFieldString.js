/* 
 * ABFieldString
 * 
 * An ABFieldString defines a string field type.
 *
 */

import ABField from "./ABField"


function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var labels = {

	component: {

		defaultText: L('ab.dataField.string.default', '*Default text'),
		supportMultilingual: L('ab.dataField.string.supportMultilingual', '*Support multilingual'),


		// should be common?
		headerLabel: L('ab.dataField.common.headerLabel', '*Label'),
		headerLabelPlaceholder: L('ab.dataField.common.headerLabelPlaceholder', '*Header Name'),

		columnName: L('ab.dataField.common.columnName', '*Name'),
		columnNamePlaceholder: L('ab.dataField.common.columnNamePlaceholder', '*Column Name'),

		showIcon: L('ab.dataField.common.showIcon', '*show icon?')
	}
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
var ABFieldStringComponent = function(App) {

	labels.common = App.labels;

	var idBase = 'ab_datafield_string';
	var componentDefaults = {
		textDefault: '', 
		supportMultilingual:1
	};
	var ids = {

		component: App.unique(idBase+'_component'),

		textDefault: App.unique(idBase+'_textdefault'),
		supportMultilingual: App.unique(idBase+'_supportMultilingual'),


		// the common property fields
		label: App.unique(idBase+'_label'),
		columnName: App.unique(idBase+'_columnName'),
		fieldDescription: App.unique(idBase+'_fieldDescription'),
		showIcon: App.unique(idBase+'_showIcon'),
	}


	//// NOTE: we merge in the common headers below.
	var _ui = {
		view:'form',
		id: ids.component,
		autoheight:true,
		borderless:true,
		elements: [
			{
				view: "text",
				id: ids.textDefault,
				name:'textDefault',
				placeholder: labels.component.defaultText
			},
			{
				view: "checkbox",
				id: ids.supportMultilingual,
				name:'multilingual',
				labelRight: labels.component.supportMultilingual,
				labelWidth: 0,
				value: true
			}
		],

		rules:{
			'label':webix.rules.isNotEmpty,
			'columnName':webix.rules.isNotEmpty
		}
	}



	var _init = function() {

		// perform any additional setup actions.
		// for example, don't want to show the description, then .hide() it here:
		// $$(ids.fieldDescription).hide();
	}



	var _logic = {

		/*
		 * @function clear
		 *
		 * clear the form.
		 */
		clear: function () {

			ABField.clearEditor(App, ids);

			for(var f in componentDefaults) { 
				var component = $$(ids[f]);
				component.setValue(componentDefaults[f]);
			}

			$$(ids.component).clearValidation();
		},


		/*
		 * @function isValid
		 *
		 * checks the current values on the componet to see if they are Valid
		 */
		isValid: function () {

			return $$(ids.component).validate();

		},


		/*
		 * @function labelOnChange
		 *
		 * The ABField.definitionEditor implements a default operation
		 * to update the value of the .columnName with the current value of 
		 * label.
		 * 
		 * if you want to override that functionality, implement this fn()
		 *
		 * @param {string} newVal	The new value of label
		 * @param {string} oldVal	The previous value
		 */
		// labelOnChange: function (newVal, oldVal) {

		// 	// When the Label value changes, update our Column Name value 
		// 	// to match.

		// 	oldVal = oldVal || '';
		// 	if (newVal != oldVal &&
		// 		oldVal == $$(ids.columnName).getValue()) {
		// 		$$(ids.columnName).setValue(newVal);
		// 	}
		// },


		/*
		 * @function populate
		 *
		 * populate the form with the given ABField instance provided.
		 *
		 * @param {ABFieldString} field
		 */
		populate: function (field) {
console.error('TODO: .populate()');
		},


		/*
		 * @function show
		 *
		 * show this component.
		 */
		show: function() {
			$$(ids.component).clearValidation();
			$$(ids.component).show();
		},


		/*
		 * @function values
		 *
		 * return the values for this form.
		 * @return {obj}  
		 */
		values: function () {

			var values = $$(ids.component).getValues();
			values.type = ABFieldString.type();

			return values;
		},

	}


	// get the common UI headers entries, and insert them above ours here:
	// NOTE: put this here so that _logic is defined.
	var commonUI = ABField.definitionEditor(App, ids, _logic, ABFieldString);
	_ui.elements = commonUI.rows.concat(_ui.elements);


	// return the current instance of this component:
	return {
		ui:_ui,					// {obj} 	the webix ui definition for this component
		init:_init,				// {fn} 	init() to setup this component  
		// actions:_actions,		// {ob}		hash of fn() to expose so other components can access.


		// DataField exposed actions:
		clear: _logic.clear,
		isValid:_logic.isValid,
		populate: _logic.populate,
		show: _logic.show,
		values: _logic.values,


		_logic: _logic			// {obj} 	Unit Testing
	}
}



class ABFieldString extends ABField {

    constructor(values, object) {
    	super(values, object);


    	this.id = values.id;
    	this.type = values.type || ABFieldString.type();
    	this.icon = values.icon || ABFieldString.icon();
    	
    	this.textDefault = values.textDefault || '';
    	this.supportMultilingual = values.supportMultilingual || true;


   		// add this if there are more multilingual labels than what our super() defines:
    	// OP.Multilingual.translate(this, values, ['label']);

 		this.object  = object;
  	}



  	///
  	/// Static Methods
  	///
  	/// Return the Definition related values for a String data field.
  	///

	// unique key to reference this specific DataField
  	static name() {
  		return 'string'
  	}

  	// http://sailsjs.org/documentation/concepts/models-and-orm/attributes#?attribute-options
  	static type() {
  		return 'string';
  	}

  	// font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'		
  	static icon() {
  		return 'font'
  	}

  	// the multilingual text for the name of this data field.
  	static  menuName() {
  		return L('ab.dataField.string.menuName', '*Single line text');
  	} 

  	// the multilingual text for the name of this data field.
  	static  description() {
  		return L('ab.dataField.string.description', '*short string value');
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
  		return ABFieldStringComponent(App);
  	}


  	//// 
  	//// These refer to the Webix Component definitions for this data field:
  	////

  	// // 
  	// static editor () {
  	// 	return 'text'
  	// }

  	// static filterType () {
  	// 	return 'text'
  	// }



	isValid() {

		var errors = super.isValid();

		// errors = OP.Form.validationError({
		// 	name:'columnName',
		// 	message:L('ab.validation.object.name.unique', 'Field columnName must be unique (#name# already used in this Application)').replace('#name#', this.name),
		// }, errors);

		return errors;
	} 



	///
	/// Instance Methods
	///


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
	toObj () {

		var obj = super.toObj();

		obj.id = this.id;
		obj.type = this.type;
		obj.icon = this.icon;
		obj.textDefault = this.textDefault ;
    	obj.supportMultilingual = this.supportMultilingual;


		return obj;
	}






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


// ABFieldString.name = 'string'; // unique key to reference this specific DataField
// ABFieldString.type = 'string'; // http://sailsjs.org/documentation/concepts/models-and-orm/attributes#?attribute-options
// ABFieldString.icon = 'font';   // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'		
// ABFieldString.menuName = L('ab.dataField.string.menuName', '*Single line text');  



export default ABFieldString;
