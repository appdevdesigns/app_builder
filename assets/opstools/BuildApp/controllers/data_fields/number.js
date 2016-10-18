steal(function () {
	var componentIds = {
		editView: 'ab-new-number',
		allowDecimal: 'ab-new-number-allow-decimal',
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

	function isInt(n) {
		n = parseFloat(n);
		return Number(n) === n && n % 1 === 0;
	}

	function isFloat(n) {
		n = parseFloat(n);
		return Number(n) === n && n % 1 !== 0;
	}

	// Edit definition
	numberDataField.editDefinition = {
		id: componentIds.editView,
		rows: [
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
		if (!data.type || !data.setting) return;

		$$(componentIds.allowDecimal).setValue(data.type == 'float');
		$$(componentIds.allowDecimal).disable();

		if (data.setting.default)
			$$(componentIds.numberDefault).setValue(data.setting.default);
	};

	numberDataField.getSettings = function () {
		var type = 'integer',
			format = 'intFormat';

		if ($$(componentIds.allowDecimal).getValue()) {
			type = 'float';
			format = 'numberFormat';
		}

		return {
			fieldName: numberDataField.name,
			type: type,
			setting: {
				icon: numberDataField.icon,
				editor: 'number',
				filter_type: 'number',
				format: format,
				default: $$(componentIds.numberDefault).getValue()
			}
		};
	};

	numberDataField.validate = function (fieldData, value) {
		if (!isNaN(parseFloat(value)) && isFinite(value)) {

			if (fieldData.type == 'integer' && isFloat(value)) {
				webix.alert({
					title: "This value is invalid",
					text: "This column disallows decimal number",
					ok: "OK"
				});
				return false;
			}
			else {
				return true;
			}
		}
		else {
			webix.alert({
				title: "This value is invalid",
				text: "Please enter number value",
				ok: "OK"
			});

			return false;
		}
	};

	numberDataField.resetState = function () {
		$$(componentIds.allowDecimal).setValue(false);
		$$(componentIds.allowDecimal).enable();
		$$(componentIds.numberDefault).setValue('');
	};

	return numberDataField;
});