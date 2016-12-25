steal(function () {
	var componentIds = {
		editView: 'ab-new-age',
		name: 'ab-new-age-name',
		equaltionType: 'ab-new-age-equaltionType',
		equaltionType: 'ab-new-age-dateType',
		resultType: 'ab-new-age-resultType',
		equation: 'ab-new-age-equation',
		decimals: 'ab-new-age-decimals',
		decimalplaces: 'ab-new-age-decimalplaces',
		typeRounding: 'ab-new-age-typeRounding',
		typeThousands: 'ab-new-age-typeThousands',
		typeFormat: 'ab-new-age-typeFormat',



	};
	
	var formatList = [
		{ id: 'none', value:  "None" },
		{ id: 'dollar', value:  "$", sign: "$", position: "prefix" },
		{ id: 'pound', value: "£", sign: "£", position: "prefix" },
		{ id: 'euroBefore', value: "€ (before)", sign: "€", position: "prefix" },
		{ id: 'euroAfter', value:  "€ (after)", sign: "€", position: "postfix" },
		{ id: 'percent', value:  "%", sign: "%", position: "postfix" },
	];
	
	var ageequationDataField = {
		name: 'ageequation', // unique key to reference this specific DataField
		type: 'string', // http://sailsjs.org/documentation/concepts/models-and-orm/attributes#?attribute-options
		icon: 'font',   // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'

// TODO: to support a proper multilingual display, 
//       .menuName & .description  need to be  multilingual Keys
//       not straight up labels.		
		menuName: 'Age equation',  
		includeHeader: true,
		description: ''
	};


	/*
	 * componentIds:
	 *
	 * Definitions of the Webix.id for the items in this DataField's Editor
	 *
	 *	.editView : 	the .id of the editor for this DataField
	 *					->  [DataFieldType]DataField.editDefinition.id
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
	ageequationDataField.editDefinition = {
		id: componentIds.editView,
		rows: [
			{
				view: "text",
				label: "Name",
				labelWidth: "100",
				id: componentIds.name,
				placeholder: 'Age'
			},
			{
				view: "radio",
				id: componentIds.equaltionType,
				label: "equaltionType",
				value: 'none',
				vertical: true,
				options: [
					{ id: 'numeric',value: "Numeric" },
					{ id: 'date',value:  "Date" },
					
				]
			},
			{
				cols: [
					{
						view: "richselect",
						id: componentIds.dateType,
						label: "Date Type",
						value: 'none',
						options: [
							{ id: 'hours', value:  "Hours" },
							{ id: 'days', value:  "Days" },
							{ id: 'weeks', value: "Weeks" },
							{ id: 'years', value: "Years" },
						]
					},
					{
						view: "richselect",
						id: componentIds.resultType,
						label: "Result Type",
						value: 'none',
						disabled: true,
						options: [
							{ id: 'number', value: "Number" },
							{ id: 'date', value: "Date" },
							
						]
					}
				 
				]
				
			},
			{
				view: "label",
				label: "Example Output"
			},	
			{
				view: "richselect",
				label: "Equation",
				labelWidth: "100",
				id: componentIds.equation,
				placeholder: 'currentTime() - {Birthday}',
				//options: application.currObj.getColumns
			},
			{
				cols: [
					{
						view: "richselect",
						id: componentIds.decimals,
						label: "Date Type",
						value: 'none',
						options: [
							{ id: 'none', value: "None" },
							{ id: 'period', value: "Period" },
							{ id: 'comma', value: "Comma" }
						],
					},
					{
						view: "richselect",
						id: componentIds.decimalplaces,
						label: "Result Type",
						value: 'none',
						options: [
							 { id: 'none', value: "0" },
							 { id: 1, value: "1" },
							 { id: 2, value: "2" },
							 { id: 3, value: "3" },
							 { id: 4, value: "4" },
							 { id: 5, value: "5" },
							 { id: 10, value: "10" }
						]
					},
				 ]
			},
			{
					view: "radio",
					id: componentIds.typeRounding,
					label: "Rounding",
					value: 'none',
					vertical: true,
					options: [
						{ id: 'none', value:  "Default" },
						{ id: 'roundUp', value:  "Round Up" },
						{ id: 'roundDown', value:  "Round Down" }
					]
			},
			{
					view: "radio",
					id: componentIds.typeThousands,
					label: "Thousands",
					value: 'none',
					vertical: true,
					options: [
						{ id: 'none', value:  "None" },
						{ id: 'comma', value: "Comma" },
						{ id: 'period', value:  "Period" },
						{ id: 'space', value: "Space" }
					]
			},
			{
					view: "richselect",
					id: componentIds.typeFormat,
					label: "Format",
					value: 'none',
					options: formatList
			},
					
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
	ageequationDataField.populateSettings = function (application, data) {
		
		if (!data.setting) return;

		// Access the Webix components defined in [DataFieldType]DataField.editDefinition 
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
	 * 					Unique [DataFieldType] settings:
	 *						[field] 	:  [description]
	 *
	 * @return {json}  data formatted to be saved in ABColumn instance.
	 */
	ageequationDataField.getSettings = function () {
		return {
			fieldName: ageequationDataField.name,
			type: ageequationDataField.type,
			setting: {
				icon: ageequationDataField.icon,
				editor: 'text', // http://docs.webix.com/desktop__editing.html
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
	ageequationDataField.resetState = function () {

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
/*
	ageequationDataField.customDisplay = function (application, object, fieldData, rowId, data, itemNode, options) {
		// for this to work right: 
		// set your 
		//     	[DataFieldType]DataField.type =  'someNonStandardValue'
		// 		[DataFieldType]DataField.getSettings().setting.editor = 'someNonStandardValue'
		//      [DataFieldType]DataField.getSettings().setting.template = '<div class="classReferenceInTemplate"></div>'
		
		// // Example Custom Display:
		// var key = fieldData.fieldName+"-"+rowId;					// unique reference
		// $(itemNode).find('.classReferenceInTemplate').append('<div id="' + key + '"></div>');		// create a div
		// webix.ui({												// attach a webix component 
		// 	container: key,										    // to our new div
		// 	template:'<img src="'+data+'" style="width:'+fieldData.setting.width+'px;height:'+fieldData.setting.height+'px;">'
		// })
		return true;
	};
*/


	return ageequationDataField;
});
