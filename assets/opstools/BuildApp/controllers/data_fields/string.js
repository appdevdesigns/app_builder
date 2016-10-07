steal(function () {
	var componentIds = {
		editView: 'ab-new-singleText',
		textDefault: 'ab-new-singleText-default',
		supportMultilingual: 'ab-new-singleText-support-multilingual',
	};

	// General settings
	var stringDataField = {
		name: 'string',
		type: 'string', // http://sailsjs.org/documentation/concepts/models-and-orm/attributes#?attribute-options
		icon: 'font',
		menuName: 'Single line text',
		includeHeader: true,
		description: ''
	};

	// Edit definition
	stringDataField.editDefinition = {
		id: componentIds.editView,
		rows: [
			{
				view: "text",
				id: componentIds.textDefault,
				placeholder: 'Default text'
			},
			{
				view: "checkbox",
				id: componentIds.supportMultilingual,
				labelRight: 'Support multilingual',
				labelWidth: 0,
				value: true
			}
		]
	};

	// Populate settings (when Edit field)
	stringDataField.populateSettings = function (application, data) {
		if (!data) return;

		$$(componentIds.textDefault).setValue(data.default);
		$$(componentIds.supportMultilingual).setValue(data.supportMultilingual);
	};

	// For save field
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

	// Reset state
	stringDataField.resetState = function () {
		$$(componentIds.textDefault).setValue('');
		$$(componentIds.supportMultilingual).setValue(1);
	};

	return stringDataField;
});