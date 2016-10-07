steal(function () {
	var componentIds = {
		editView: 'ab-new-longText',
		supportMultilingual: 'ab-new-longText-support-multilingual',
	};

	// General settings
	var textDataField = {
		name: 'text',
		type: 'text', // http://sailsjs.org/documentation/concepts/models-and-orm/attributes#?attribute-options
		icon: 'align-right',
		menuName: 'Long text',
		includeHeader: true,
		description: 'A long text field that can span multiple lines.'
	};

	// Edit definition
	textDataField.editDefinition = {
		id: componentIds.editView,
		rows: [
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
	textDataField.populateSettings = function (application, data) {
		if (!data) return;

		$$(componentIds.supportMultilingual).setValue(data.supportMultilingual);
	};

	// For save field
	textDataField.getSettings = function () {
		return {
			supportMultilingual: $$(componentIds.supportMultilingual).getValue(),
			fieldName: textDataField.name,
			type: textDataField.type,
			setting: {
				icon: textDataField.icon,
				editor: 'popup', // http://docs.webix.com/desktop__editing.html
				filter_type: 'text' // DataTableFilterPopup - filter type
			}
		};
	};

	// Reset state
	textDataField.resetState = function () {
		$$(componentIds.supportMultilingual).setValue(1);
	}

	return textDataField;
});