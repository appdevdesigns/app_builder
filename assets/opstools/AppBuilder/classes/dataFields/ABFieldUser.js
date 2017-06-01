/*
 * ABFieldUser
 *
 * An ABFieldUser defines a user field type.
 *
 */

import ABField from "./ABField"
import ABFieldComponent from "./ABFieldComponent"

// import RBAC from "../../../../../../../assets/opstools/RBAC/RBAC"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var ABFieldUserDefaults = {
	key : 'user', // unique key to reference this specific DataField
	icon : 'user-o',   // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'

	// menuName: what gets displayed in the Editor drop list
	menuName : L('ab.dataField.user.menuName', '*User'),

	// description: what gets displayed in the Editor description.
	description: L('ab.dataField.user.description', '*Add user/s to a record.')
}




/**
 * ABFieldStringComponent
 *
 * Defines the UI Component for this Data Field.  The ui component is responsible
 * for displaying the properties editor, populating existing data, retrieving
 * property values, etc.
 */
var ABFieldUserComponent = new ABFieldComponent({

	fieldDefaults: ABFieldUserDefaults,

	elements:function(App) {
		return [
			{
				view: 'checkbox',
				name: 'editable',
				// id: componentIds.editable,
				labelRight: L('ab.dataField.string.editableLabel', '*Editable'),
				labelWidth: App.config.labelWidthCheckbox
			},
			{
				view: 'checkbox',
				name: 'multiSelect',
				// id: componentIds.multiSelect,
				labelRight: L('ab.dataField.string.multiSelectLabel', '*Allow multiple users'),
				labelWidth: App.config.labelWidthCheckbox
			},
			{
				view: 'checkbox',
				name: 'defaultCurrentUser',
				// id: componentIds.defaultCurrentUser,
				labelRight: L('ab.dataField.string.defaultLabel', '*Default value as current user'),
				labelWidth: App.config.labelWidthCheckbox
			}
		]
	},

	// defaultValues: the keys must match a .name of your elements to set it's default value.
	defaultValues:{
		'editable':0,
		'multiSelect':0,
		'defaultCurrentUser':0
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





class ABFieldUser extends ABField {

    constructor(values, object) {
    	super(values, object, ABFieldUserDefaults);

    	/*
    	{
			settings: {
				textDefault: 'string',
				supportMultilingual: true/false
			}
    	}
    	*/

    	// we're responsible for setting up our specific settings:
    	this.settings.editable = values.settings.editable+"" || "0";
    	this.settings.multiSelect = values.settings.multiSelect+"" || "0";
		this.settings.defaultCurrentUser = values.settings.defaultCurrentUser+"" || "0";

    	// text to Int:
    	this.settings.editable = parseInt(this.settings.editable);
		this.settings.multiSelect = parseInt(this.settings.multiSelect);
		this.settings.defaultCurrentUser = parseInt(this.settings.defaultCurrentUser);
  	}


  	// return the default values for this DataField
  	static defaults() {
  		return ABFieldUserDefaults;
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
  		return ABFieldUserComponent.component(App);
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

	// return the grid column header definition for this instance of ABFieldUser
	columnHeader (isObjectWorkspace) {
		var config = super.columnHeader(isObjectWorkspace);

		config.editor = 'editselectivity';
		config.sort   = 'string';
		config.suggest = {
			// data: OP.Model.get('opstools.RBAC.SiteUser')
		};

		return config;
	}

}

//// NOTE: if you need a unique [edit_type] by your returned config.editor above:
// webix.editors = {
//   "selectivityUsers": {
//     focus: function () {...}
//     getValue: function () {...},
//     setValue: function (value) {...},
//     render: function () {...}
//   }
// };

export default ABFieldUser;
