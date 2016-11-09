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
		menuName: AD.lang.label.getLabel('ab.dataField.text.menuName') || 'Long text',
		includeHeader: true,
		description: AD.lang.label.getLabel('ab.dataField.text.description') || 'A long text field that can span multiple lines.'
	};

	// Edit definition
	textDataField.editDefinition = {
		id: componentIds.editView,
		rows: [
			{
				view: "checkbox",
				id: componentIds.supportMultilingual,
				labelRight: AD.lang.label.getLabel('ab.dataField.text.supportMultilingual') || 'Support multilingual',
				labelWidth: 0,
				value: true
			}
		]
	};

	// Populate settings (when Edit field)
	textDataField.populateSettings = function (application, data) {
		if (!data.setting) return;

		$$(componentIds.supportMultilingual).setValue(data.setting.supportMultilingual);
	};

	// For save field
	textDataField.getSettings = function () {
		return {
			fieldName: textDataField.name,
			type: textDataField.type,
			setting: {
				icon: textDataField.icon,
				editor: 'popup', // http://docs.webix.com/desktop__editing.html
				filter_type: 'text', // DataTableFilterPopup - filter type
				supportMultilingual: $$(componentIds.supportMultilingual).getValue()
			}
		};
	};

	// Reset state
	textDataField.resetState = function () {
		$$(componentIds.supportMultilingual).setValue(1);
	}

	return textDataField;
});