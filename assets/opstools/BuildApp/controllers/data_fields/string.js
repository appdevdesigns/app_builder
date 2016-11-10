steal(function () {

	// String 
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
	// String uniquely defines:
	//		.textDefault : the default value for this field. (should be multilingual)
	// 		.supportMultilingual : {bool} is this a multilingual field?  
	//
	// Note:
	// 	- when a String is defined as a multilingual field, it causes the Object to 
	//	  keep track of an entry for each language for this field.
	//


	// General settings
	// 
	// To plug-in to the AppBuilder, each DataField must define the following:
	//		.name 	{string}	unique key to referenc this specific DataField
	//		.type 	{string}	the fundamental data type for this DataField.
	//							the type should match one of the given sails attribute types:
	//							http://sailsjs.org/documentation/concepts/models-and-orm/attributes#?attribute-options
	//		.icon 	{string}	A font-awesome icon to represent this DataField
	//							the icon is specified without the 'fa-' prefix.
	//							so .icon='user'  is the 'fa-user' icon.
	//		.menuName {string}  The multilingual key for displaying the name of this 
	//							DataField to the User.
	var stringDataField = {
		name: 'string', // unique key to reference this specific DataField
		type: 'string', // http://sailsjs.org/documentation/concepts/models-and-orm/attributes#?attribute-options
		icon: 'font',   // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'

// TODO: .menuName needs to be a multilingual Key		
		menuName: AD.lang.label.getLabel('ab.dataField.string.menuName') || 'Single line text',  
		includeHeader: true,
		description: ''
	};


	/*
	 * componentIds:
	 *
	 * Definitions of the Webix.id for the items in this DataField's Editor
	 *
	 *	.editView : 	the .id of the editor for this DataField
	 */
	var componentIds = {
		editView: 'ab-new-singleText',
		textDefault: 'ab-new-singleText-default',
		supportMultilingual: 'ab-new-singleText-support-multilingual',
	};


	/*
	 * .editDefinition
	 * 
	 * Define the Webix UI description for the Editor that defines this DataField.
	 *
	 * This UI is used for both the initial create, as well as the Edit form.
	 *
	 */
	stringDataField.editDefinition = {
		id: componentIds.editView,
		rows: [
			{
				view: "text",
				id: componentIds.textDefault,
				placeholder: AD.lang.label.getLabel('ab.dataField.string.default') || 'Default text'
			},
			{
				view: "checkbox",
				id: componentIds.supportMultilingual,
				labelRight: AD.lang.label.getLabel('ab.dataField.string.supportMultilingual') || 'Support multilingual',
				labelWidth: 0,
				value: true
			}
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
	stringDataField.populateSettings = function (application, data) {
		if (!data.setting) return;

		$$(componentIds.textDefault).setValue(data.setting.default);
		$$(componentIds.supportMultilingual).setValue(data.setting.supportMultilingual);
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
	 * 					Unique String settings:
	 *						.default 	:  the default value for this text field
	 *						.supportMultilingual : track multiple language entries for this field?
	 *
	 *
	 * @return {json}  data formatted to be saved in ABColumn instance.
	 */
	stringDataField.getSettings = function () {
		return {
			fieldName: stringDataField.name,
			type: stringDataField.type,
			setting: {
				icon: stringDataField.icon,
				editor: 'text', // http://docs.webix.com/desktop__editing.html
				filter_type: 'text', // DataTableFilterPopup - filter type
				default: $$(componentIds.textDefault).getValue(), // Default value
				supportMultilingual: $$(componentIds.supportMultilingual).getValue(),
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
	stringDataField.resetState = function () {
		$$(componentIds.textDefault).setValue('');
		$$(componentIds.supportMultilingual).setValue(1);
	};

	return stringDataField;
});