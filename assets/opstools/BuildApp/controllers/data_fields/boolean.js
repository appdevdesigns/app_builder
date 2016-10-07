steal(function () {
	var componentIds = {
		editView: 'ab-new-boolean',
		headerName: 'ab-new-boolean-header',
		labelName: 'ab-new-boolean-label'
	};

	// General settings
	var boolDataField = {
		name: 'boolean',
		type: 'boolean', // http://sailsjs.org/documentation/concepts/models-and-orm/attributes#?attribute-options
		icon: 'check-square-o',
		menuName: 'Checkbox'
	};

	// Edit definition
	boolDataField.editDefinition = {
		id: componentIds.editView,
		rows: [
			{
				view: "label",
				label: "<span class='webix_icon fa-{0}'></span>{1}".replace('{0}', boolDataField.icon).replace('{1}', boolDataField.menuName)
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
				label: "A single checkbox that can be checked or unchecked."
			}
		]
	};

	// Populate settings (when Edit field)
	boolDataField.populateSettings = function (data) {
		$$(componentIds.headerName).setValue(data.name.replace(/_/g, ' '));
		$$(componentIds.labelName).setValue(data.label);
	};

	// For save field
	boolDataField.getSettings = function () {
		return {
			name: $$(componentIds.headerName).getValue(),
			label: $$(componentIds.labelName).getValue(),
			fieldName: boolDataField.name,
			type: boolDataField.type,
			setting: {
				icon: boolDataField.icon,
				// editor: 'inline-text', // http://docs.webix.com/desktop__editing.html
				filter_type: 'boolean',
				template: "{common.checkbox()}"
			}
		};
	};

	// Reset state
	boolDataField.resetState = function () {
		$$(componentIds.headerName).setValue('');
		$$(componentIds.headerName).enable();
		$$(componentIds.labelName).setValue('');
	};

	return boolDataField;
});