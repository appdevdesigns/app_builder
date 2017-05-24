/*
 * ABFieldImage
 *
 * An ABFieldImage defines a Image field type.
 *
 */

import ABField from "./ABField"
import ABFieldComponent from "./ABFieldComponent"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}



var ABFieldImageDefaults = {
	key : 'image', // unique key to reference this specific DataField
	// type : 'string', // http://sailsjs.org/documentation/concepts/models-and-orm/attributes#?attribute-options
	icon : 'file-image-o',   // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'		
	
	// menuName: what gets displayed in the Editor drop list
	menuName : L('ab.dataField.image.menuName', '*Image Attachment'),
	
	// description: what gets displayed in the Editor description.
	description: L('ab.dataField.image.description', '*Attach an image to this object.')
}



var defaultValues = {
	'useWidth':0,
	'imageWidth':'',
	'useHeight': 0,
	'imageHeight': '',
	'removeExistingData': 0
}



/**
 * ABFieldImageComponent
 *
 * Defines the UI Component for this Data Field.  The ui component is responsible
 * for displaying the properties editor, populating existing data, retrieving
 * property values, etc.
 *
 * @param {obj} App  the current Component Application instance for the current UI.
 * @return {obj} the Component object.
 */
var ABFieldImageComponent = new ABFieldComponent({

	fieldDefaults: ABFieldImageDefaults,

	elements:(App, field) => {

		var ids = {
			imageWidth: '',
			imageHeight: ''
		}
		ids = field.idsUnique(ids, App);

		return [
			{
				cols: [
					{
						view:"checkbox",
						name:"useWidth", 
						labelRight:L('ab.dataField.image.width', "*width"), 
			            width: 80,
			            labelWidth: 0,
						value:1,
			            click: function() {
							if (this.getValue())
								$$(ids.imageWidth).enable()
							else
								$$(ids.imageWidth).disable();
			            }
					},
					{
						view: 'text',
						name:'imageWidth',
						id: ids.imageWidth
					}
				]
			},
			{
				cols: [
					{
						view:"checkbox",
						name:"useHeight",
// id:componentIds.useHeight, 
						labelRight:L('ab.dataField.image.height', "*height"), 
			          	width: 80,
			            labelWidth: 0,
						value:1,
			            click: function() {
							if (this.getValue())
								$$(ids.imageHeight).enable()
							else
								$$(ids.imageHeight).disable();
			            }

					},
					{
						view: 'text',
						name: 'imageHeight',
			          	id: ids.imageHeight
					}
				]
			}
		]
	},

	// defaultValues: the keys must match a .name of your elements to set it's default value.
	defaultValues: defaultValues,

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





class ABFieldImage extends ABField {

    constructor(values, object) {
    	super(values, object, ABFieldImageDefaults);

    	/*
    	{
			settings: {
				'useWidth':0,
				'imageWidth':'',
				'useHeight': 0,
				'imageHeight': '',
				'removeExistingData': 0
			}
    	}
    	*/

    	// we're responsible for setting up our specific settings:
    	for (var dv in defaultValues) {
    		this.settings[dv] = values.settings[dv] || defaultValues[dv];
    	}


    	// text to Int:
    	this.settings.useWidth = parseInt(this.settings.useWidth);
    	this.settings.useHeight = parseInt(this.settings.useHeight);
    	this.settings.removeExistingData = parseInt(this.settings.removeExistingData);
  	}


  	// return the default values for this DataField
  	static defaults() {
  		return ABFieldImageDefaults;
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
  		return ABFieldImageComponent.component(App);
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
	 * @function destroy
	 * On a destroy operation, ask if the user wants to keep the related images.
	 */
	destroy () {
		return new Promise(
			(resolve, reject) => {

				// verify we have been .save()d before:
				if (this.id) {

					// Ask the user what to do about the existing images:
					OP.Dialog.Confirm({
						title: L('ab.dataField.image.keepImages', '*Keep Images?'),
						message: L('ab.dataField.image.keepImagesDescription', '*Do you want to keep the images referenced by #label#?').replace('#label#', this.label),
						callback: (result) => {

							// update this setting so the server can respond correctly in
							// ABFieldImage.migrateDrop()
							this.settings.removeExistingData = result ? 0: 1;
							this.save()
							.then(()=>{

// TODO: a reminder that you still got alot on the server to do!
OP.Dialog.Alert({
	title:'!! TODO !!',
	text:'Tell a Developer to actually pay attention to this!'
})
								// now the default .destroy() 
								super.destroy()
								.then(resolve)
								.catch(reject);
							})
							.catch(reject);
						}
					})

				} else {
					resolve();  // nothing to do really
				}
				
			}
		)
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

	// return the grid column header definition for this instance of ABFieldImage
	columnHeader (isObjectWorkspace) {
		var config = super.columnHeader(isObjectWorkspace);

		config.editor = 'text';  // '[edit_type]'   for your unique situation
		config.sort   = 'string' // '[sort_type]'   for your unique situation

		return config;
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


export default ABFieldImage;
