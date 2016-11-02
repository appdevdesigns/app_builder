steal(function () {

	// image 
	//
	// A DataField that handles simple text data for an Object.
	//
	// Each DataField already defines:
	//		.headerName	: becomes the created object's field reference.
	//		.labelName  : is what is shown in the UI for this field's data
	//
	//				ex: you create a "Person"  object. Then add a string field: {
	//						headerName: 'name_surname', labelName:'Surname' }
	//
	//				when you work with the data from a model, person.name_surname has
	//				the value.
	//
	//				but the Webix Grid will display .labelName for the column header.
	//
	// image  uniquely defines:
	//		.[field] : [description]


	// General settings
	// 
	// To plug-in to the AppBuilder, each DataField must define the following:
	//		.name 	{string}	unique key to reference this specific DataField
	//		.type 	{string}	the fundamental data type for this DataField.
	//							the type should match one of the given sails attribute types:
	//							http://sailsjs.org/documentation/concepts/models-and-orm/attributes#?attribute-options
	//		.icon 	{string}	A font-awesome icon to represent this DataField
	//							the icon is specified without the 'fa-' prefix.
	//							so .icon='user'  is the 'fa-user' icon.
	//		.menuName {string}  The multilingual key for displaying the name of this 
	//							DataField to the User.
	//      .includeHeader {bool} allow the AppBuilder to add in the [name] and [label] fields
	//							for you.  (why reinvent the wheel?)
	// 
	var imageDataField = {
		name: 'image',  // unique key to reference this specific DataField
		type: 'image',  // use a non-standard type to prevent Webix from using default displays.
		icon: 'file-image-o',   // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'

// TODO: to support a proper multilingual display, 
//       .menuName & .description  need to be  multilingual Keys
//       not straight up labels.		
		menuName: 'Image Attachment',  
		includeHeader: true,
		description: 'Attach an image to this object.'
	};


	/*
	 * componentIds:
	 *
	 * Definitions of the Webix.id for the items in this DataField's Editor
	 *
	 *	.editView : 	the .id of the editor for this DataField
	 *					->  imageDataField.editDefinition.id
	 */
	var componentIds = {
		editView: 'ab-new-image',

		//
		// For each property field you want to reference,
		// create a  [key]: [uniqueKeyReference]   combo here:

		// [field] : 'ab-unique-field-reference',
		// textDefault: 'ab-new-singleText-default',
		// supportMultilingual: 'ab-new-singleText-support-multilingual',
	};


	/*
	 * .editDefinition
	 * 
	 * Define the Webix UI description for the Editor that defines this DataField.
	 *
	 * This UI is used for both the initial create, as well as the Edit form.
	 *
	 */
	imageDataField.editDefinition = {
		id: componentIds.editView,
		rows: [

			//
			// put your webix json description here
			//


			// Example: a Text entry and a Checkbox:
			// 
			// {
			// 	view: "text",
			// 	id: componentIds.textDefault,
			// 	placeholder: 'Default text'
			// },
			// {
			// 	view: "checkbox",
			// 	id: componentIds.supportMultilingual,
			// 	labelRight: 'Support multilingual',
			// 	labelWidth: 0,
			// 	value: true
			// }
		]
	};


	/**
	 * @function populateSettings
	 *
	 * initialize this DataFields Editor with the provided data.
	 *
	 * @param {ABApplication} application the ABApplication object that defines 
	 *							this App.  From this we can access any additional
	 *							info required for this DataField to work.
	 *							ex: attempting to access other objects ..
	 *
	 * @param {ABColumn} data  the ABColumn info saved for this DataField.
	 */
	imageDataField.populateSettings = function (application, data) {
		if (!data.setting) return;

		// Access the Webix components defined in imageDataField.editDefinition 
		// and set their values according to their references in data.setting
		// (NOTE: see .getSettings() for when you store the values)

		// 
		// Example: a Text entry and a Checkbox:
		// 
		// $$(componentIds.textDefault).setValue(data.setting.default);
		// $$(componentIds.supportMultilingual).setValue(data.setting.supportMultilingual);
	};


	/**
	 * @function getSettings
	 *
	 * pull the data out of this DataField's Editor, and format it to be
	 * saved in an ABColumn instance.
	 *
	 * Note: fields that are common for ABColumn:
	 *		.name 		: the column name for the related Object 
	 *		.label 		: UI label to display for this field
	 *		.fieldName 	: The reference to this DataField
	 *		.type 		: the SailsJS data type
	 *
	 * If your DataField has more info than this, it should be stored in 
	 *		.setting 	: {json} representation of unique data for this DataField
	 *
	 *					common setting values:
	 *						.icon: the icon for this field entry
	 *						.editor: Webix UI editor type for this entry
	 *						.filter_type: Webix UI filter type 
	 *
	 * 					Unique image settings:
	 *						[field] 	:  [description]
	 *
	 * @return {json}  data formatted to be saved in ABColumn instance.
	 */
	imageDataField.getSettings = function () {
		return {
			fieldName: imageDataField.name,
			type: imageDataField.type,
			setting: {
				icon: imageDataField.icon,
// 1) 
editor: 'imageDataField',
template:'<div class="ab-image-data-field"></div>',

				filter_type: 'text', // DataTableFilterPopup - filter type

				// 
				// Your unique fields here:
			
				// 
				// Example: a Text entry and a Checkbox:
				//
				// default: $$(componentIds.textDefault).getValue(), // Default value
				// supportMultilingual: $$(componentIds.supportMultilingual).getValue(),
			}
		};
	};


	/**
	 * @function resetState
	 *
	 * Find our current Webix UI editor instance, and reset all the entry 
	 * fields.
	 *
	 */
	imageDataField.resetState = function () {

		// this should be almost identical to .populateSettings() but with
		// all values set to proper 'empty' values.

		// 
		// Example: a Text entry and a Checkbox:
		//
		// $$(componentIds.textDefault).setValue('');
		// $$(componentIds.supportMultilingual).setValue(1);
	};


	/*
	 * @function customDisplay
	 *
	 * This is an optional method for a Data Field.  
	 *
	 * If this method exists, then the App Builder will call this method to 
	 * display the Data Field in the appropriate Grid/Form element.
	 *
	 * @param {obj} application : The current ABApplication instance 
	 * @param {obj} object  : The ABObject that contains this DataField
	 * @param {obj} fieldData : The ABColumn instance that defines this DataField
	 * @param {int} rowId   : the .id of the Model instance from which we are 
	 *						  getting the data for this DataField
	 * @param {} data       : the value of this DataField
	 * @param {el} itemNode : the DOM element of the Webix Cell that contains
	 * 						  the display of this DataField
	 * @param {obj} options : provided by the calling UI component (Grid/Form)
	 *						  .readOnly  {bool}  should we display as readOnly?
	 * @return {bool}       : True if we have a custom display
	 *						  False if we don't.  (or just comment this out)
	 */
	imageDataField.customDisplay = function (application, object, fieldData, rowId, data, itemNode, options) {

		var inHere = true;

		var keyField = [ application.name, object.name, fieldData.name, rowId].join('-');
		$(itemNode).find('.ab-image-data-field').append('<div id="' + keyField + '">'+keyField+'</div>');

		// // Example Custom Display:
		// var key = fieldData.fieldName+"-"+rowId;					// unique reference
		// $(itemNode).append('<div id="' + key + '"></div>');		// create a div

		// webix.ui({												// attach a webix component 
		// 	container: key,										    // to our new div
		// 	template:'<img src="'+data+'" style="width:'+fieldData.setting.width+'px;height:'+fieldData.setting.height+'px;">'
		// })

		return true;
	};


	return imageDataField;
});