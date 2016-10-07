steal(function () {
	var componentIds = {
		editView: 'ab-new-longText',
		headerName: 'ab-new-longText-header',
		labelName: 'ab-new-longText-label',
		supportMultilingual: 'ab-new-longText-support-multilingual',
	};

	// General settings
	var textDataField = {
		name: 'text',
		type: 'text', // http://sailsjs.org/documentation/concepts/models-and-orm/attributes#?attribute-options
		icon: 'align-right',
		menuName: 'Long text'
	};

	// Edit definition
	textDataField.editDefinition = {
		id: componentIds.editView,
		rows: [
			{
				view: "label",
				label: "<span class='webix_icon fa-{0}'></span>{1}".replace('{0}', textDataField.icon).replace('{1}', textDataField.menuName)
			},
			{
				view: "text",
				id: componentIds.headerName,
				label: "Name",
				placeholder: "Name",
				labelWidth: 50,
				css: 'ab-new-field-name', // Highlight this when open
				on: {
					onChange: function (newValue, oldValue) {
						if (oldValue == $$(componentIds.labelName).getValue())
							$$(componentIds.labelName).setValue(newValue);
					}
				}
			},
			{
				view: "text",
				id: componentIds.labelName,
				label: 'Label',
				placeholder: 'Header name',
				labelWidth: 50,
				css: 'ab-new-label-name'
			},
			{
				view: "label",
				label: 'A long text field that can span multiple lines.'
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
	textDataField.populateSettings = function (data) {
		$$(componentIds.headerName).setValue(data.name.replace(/_/g, ' '));
		$$(componentIds.labelName).setValue(data.label);
		$$(componentIds.supportMultilingual).setValue(data.supportMultilingual);
	};

	// For save field
	textDataField.getSettings = function () {
		return {
			name: $$(componentIds.headerName).getValue(),
			label: $$(componentIds.labelName).getValue(),
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
		$$(componentIds.headerName).setValue('');
		$$(componentIds.headerName).enable();
		$$(componentIds.labelName).setValue('');
		$$(componentIds.supportMultilingual).setValue(1);
	}

	return textDataField;
});