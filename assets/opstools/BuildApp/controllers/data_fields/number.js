steal(function () {
	var componentIds = {
		editView: 'ab-new-number',
		allowDecimal: 'ab-new-number-allow-decimal',
		numberDefault: 'ab-new-number-default',
		allowRequired: 'ab-new-number-allow-required',
		mustBeUnique: 'ab-new-number-must-be-unique',
		typeDecimals: 'ab-new-number-type-decimals',
		typeDecimalPlaces: 'ab-new-number-type-decimal-places',
		typeRounding: 'ab-new-number-type-rounding',
		typeFormat: 'ab-new-number-type-format',
		typeThousands: 'ab-new-number-type-thousands',
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
				cols: [
					{
						view: "checkbox",
						id: componentIds.allowRequired,
						labelRight: "Required",
						inputWidth: 130,
						labelWidth: 0
					},
					{
						view: "checkbox",
						id: componentIds.mustBeUnique,
						labelRight: "Must be unique",
						inputWidth: 180,
						labelWidth: 0
					}
				]
			},
			{
				view: "text",
				label: "Default Value",
				labelWidth: "100",
				id: componentIds.numberDefault,
				placeholder: 'Default number'
			},
			{
				cols: [
					{
						view: "richselect",
						id: componentIds.typeDecimals,
						label: "Decimals",
						value: 'none',
						options: [
							{ id: 'none', value: "None" },
							{ id: 'period', value: "Period" },
							{ id: 'comma', value: "Comma" }
						],
						on: {
							'onChange': function (newValue, oldValue) {
								if (newValue == 'none') {
									$$(componentIds.typeDecimalPlaces).disable();
									$$(componentIds.typeRounding).disable();
									$$(componentIds.typeThousands).disable();
									$$(componentIds.typeFormat).disable();
								}
								else {
									$$(componentIds.typeDecimalPlaces).enable();
									$$(componentIds.typeRounding).enable();
									$$(componentIds.typeThousands).enable();
									$$(componentIds.typeFormat).enable();
								}
							}
						}
					},
					{
						view: "richselect",
						id: componentIds.typeDecimalPlaces,
						label: "Places",
						value: 'none',
						disabled: true,
						options: [
							{ id: 'none', value: "0" },
							{ id: 1, value: "1" },
							{ id: 2, value: "2" },
							{ id: 3, value: "3" },
							{ id: 4, value: "4" },
							{ id: 5, value: "5" },
							{ id: 10, value: "10" }
						]
					}
				]
			},
			{
				view: "radio",
				id: componentIds.typeRounding,
				label: "Rounding",
				value: 'none',
				vertical: true,
				disabled: true,
				options: [
					{ id: 'none', value: "Default" },
					{ id: 'roundUp', value: "Round Up" },
					{ id: 'roundDown', value: "Round Down" }
				]
			},
			{
				view: "radio",
				id: componentIds.typeThousands,
				label: "Rounding",
				value: 'none',
				vertical: true,
				disabled: true,
				options: [
					{ id: 'none', value: "None" },
					{ id: 'comma', value: "Comma" },
					{ id: 'period', value: "Period" },
					{ id: 'space', value: "Space" }
				]
			},
			{
				view: "combo",
				id: componentIds.typeFormat,
				label: "Format",
				value: 'none',
				disabled: true,
				options: [
					{ id: 'none', value: "None" },
					{ id: 'dollar', value: "$" },
					{ id: 'pound', value: "£" },
					{ id: 'percent', value: "%" }
				]
			}
		]
	};

	numberDataField.populateSettings = function (application, data) {
		if (!data.type || !data.setting) return;

		$$(componentIds.typeDecimalPlaces).setValue(data.setting.typeDecimalPlaces);
		$$(componentIds.typeDecimals).setValue(data.setting.typeDecimals);
		$$(componentIds.typeThousands).setValue(data.setting.typeThousands);
		$$(componentIds.typeRounding).setValue(data.setting.typeRounding);
		$$(componentIds.allowRequired).setValue(data.setting.allowRequired);
		$$(componentIds.typeFormat).setValue(data.setting.typeFormat);

		if (data.setting.default)
			$$(componentIds.numberDefault).setValue(data.setting.default);
	};

	numberDataField.getSettings = function () {
		var type = 'integer',
			format = 'intFormat';

		if ($$(componentIds.typeDecimals).getValue() !== 'none') {
			type = 'float';
			format = 'numberFormat';
		}


		return {
			fieldName: numberDataField.name,
			type: type,

			setting: {
				typeDecimalPlaces: $$(componentIds.typeDecimalPlaces).getValue(),
				typeDecimalPlacesText: $$(componentIds.typeDecimalPlaces).getText(),
				typeDecimals: $$(componentIds.typeDecimals).getValue(),
				typeThousands: $$(componentIds.typeThousands).getValue(),
				typeRounding: $$(componentIds.typeRounding).getValue(),
				allowRequired: $$(componentIds.allowRequired).getValue(),
				typeFormat: $$(componentIds.typeFormat).getValue(),
				typeFormatText: $$(componentIds.typeFormat).getText(),

				icon: numberDataField.icon,
				editor: 'number',
				filter_type: 'number',
				template: '<div class="number-format-show"></div>',
				default: $$(componentIds.numberDefault).getValue()
			}
		};
	};

	numberDataField.customDisplay = function (application, object, fieldData, rowId, data, itemNode, options) {

		var decimalSizeNum = 0;
		if (fieldData.setting.typeDecimalPlaces != undefined && fieldData.setting.typeDecimalPlaces != 'none') {
			decimalSizeNum = fieldData.setting.typeDecimalPlacesText;
		}

		var decimalDelimiters = ".";
		if (fieldData.setting.typeDecimals != undefined) {
			switch (fieldData.setting.typeDecimals) {
				case 'period':
					decimalDelimiters = ".";
					break;
				case 'comma':
					decimalDelimiters = ",";
					break;
			}
		}

		var groupDelimiters = "";
		if (fieldData.setting.typeThousands != undefined) {
			switch (fieldData.setting.typeThousands) {
				case 'comma':
					groupDelimiters = ",";
					break;
				case 'period':
					groupDelimiters = ".";
					break;
				case 'space':
					groupDelimiters = " ";
					break;
			}
		}

		var sum = data;
		if (fieldData.setting.typeRounding != undefined) {
			switch (fieldData.setting.typeRounding) {
				case 'roundUp':
					var num = data;
					var precision = -decimalSizeNum;
					var div = Math.pow(10, precision);
					sum = Math.ceil(num / div) * div;
					break;
				case 'roundDown':
					var num = data;
					var precision = -decimalSizeNum;
					var div = Math.pow(10, precision);
					sum = Math.floor(num / div) * div;
					break;
			}
		}

		var numberFormat = webix.Number.format(sum, {
			groupDelimiter: groupDelimiters,
			groupSize: 3,
			decimalDelimiter: decimalDelimiters,
			decimalSize: decimalSizeNum
		});

		if (fieldData.setting.typeFormat != undefined) {
			switch (fieldData.setting.typeFormat) {
				case 'dollar':
					numberFormat = fieldData.setting.typeFormatText + "" + numberFormat;
					break;
				case 'pound':
					numberFormat = numberFormat + "" + fieldData.setting.typeFormatText;
					break;
			}
		}

		var container = $(itemNode).find('.number-format-show');
		container.html(numberFormat);

		return true;
	};

	numberDataField.validate = function (fieldData, value) {

		if (fieldData.setting.allowRequired == 1 && value == "") {
			webix.alert({
				title: "This value is invalid",
				text: "This column Required number",
				ok: "OK"
			});
			return false;
		}

		if (!isNaN(parseFloat(value)) && isFinite(value) && fieldData.type == 'integer' && isFloat(value)) {
			webix.alert({
				title: "This value is invalid",
				text: "This column disallows decimal number",
				ok: "OK"
			});
			return false;
		}

		return true;
	};

	numberDataField.resetState = function () {
		// TODO
		$$(componentIds.numberDefault).setValue('');
	};

	return numberDataField;
});