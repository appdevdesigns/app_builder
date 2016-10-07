steal(function () {
	var componentIds = {
		editView: 'ab-new-number',
		allowDecimal: 'ab-new-number-allow-decimal',
		numberFormat: 'ab-new-number-format',
		numberDefault: 'ab-new-number-default',
	};

	// General settings
	var numberDataField = {
		name: 'number',
		type: ['float', 'integer'], // http://sailsjs.org/documentation/concepts/models-and-orm/attributes#?attribute-options
		icon: 'slack',
		menuName: 'Number',
		includeHeader: true,
		description: ''
	};

	// Edit definition
	numberDataField.editDefinition = {
		id: componentIds.editView,
		rows: [
			{
				view: "combo",
				id: componentIds.numberFormat,
				value: 'Number',
				label: 'Format',
				labelWidth: 60,
				options: [
					{ format: 'numberFormat', value: 'Number' },
					{ format: 'priceFormat', value: 'Price' },
				]
			},
			{
				view: "checkbox",
				id: componentIds.allowDecimal,
				labelRight: "Allow decimal numbers",
				labelWidth: 0
			},
			{
				view: "text",
				id: componentIds.numberDefault,
				placeholder: 'Default number'
			}
		]
	};

	numberDataField.populateSettings = function (application, data) {
		if (!data) return;

		$$(componentIds.allowDecimal).setValue(data.type == 'float');
		$$(componentIds.allowDecimal).disable();

		var selectedFormat = $$(componentIds.numberFormat).getList().find(function (format) { return format.format == data.setting.format; });
		if (selectedFormat && selectedFormat.length > 0)
			$$(componentIds.numberFormat).setValue(selectedFormat[0].value);

		if (data.default)
			$$(componentIds.numberDefault).setValue(data.default);
	};

	numberDataField.getSettings = function () {
		var type = 'integer';
		if ($$(componentIds.allowDecimal).getValue())
			type = 'float';

		var selectedFormat = $$(componentIds.numberFormat).getList().find(function (format) {
			return format.value == $$(componentIds.numberFormat).getValue();
		})[0];

		return {
			default: $$(componentIds.numberDefault).getValue(),
			fieldName: numberDataField.name,
			type: type,
			setting: {
				icon: numberDataField.icon,
				editor: 'number',
				filter_type: 'number',
				format: selectedFormat.format
			}
		};
	}

	numberDataField.resetState = function () {
		$$(componentIds.numberFormat).setValue('Number');
		$$(componentIds.allowDecimal).setValue(false);
		$$(componentIds.allowDecimal).enable();
		$$(componentIds.numberDefault).setValue('');
	};

	return numberDataField;
});