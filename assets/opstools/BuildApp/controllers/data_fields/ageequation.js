steal(function () {
	var componentIds = {
		editView: 'ab-new-age',
		name: 'ab-new-age-name',
		equaltionType: 'ab-new-age-equaltionType',
		dateType: 'ab-new-age-dateType',
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
	
		menuName: 'Age equation',  
		includeHeader: true,
		description: ''
	};

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



	ageequationDataField.populateSettings = function (application, data) {
		
		if (!data.setting) return;


	};



	ageequationDataField.getSettings = function () {
		var type = 'integer';
		
		return {
			fieldName: ageequationDataField.name,
			type: type,
			setting: {
				equaltionType : $$(componentIds.equaltionType).getValue(),
				dateType : $$(componentIds.dateType).getValue(),
				resultType : $$(componentIds.resultType).getValue(),
				equation : $$(componentIds.equation).getValue(),
				decimals : $$(componentIds.decimals).getValue(),
				decimalplaces : $$(componentIds.decimalplaces).getValue(),
				typeRounding : $$(componentIds.typeRounding).getValue(),
				typeThousands : $$(componentIds.typeThousands).getValue(),
				typeFormat : $$(componentIds.typeFormat).getValue(),
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


	};


	return ageequationDataField;
});
