steal(function () {
	var componentIds = {
		editView: 'ab-new-number',
		allowDecimal: 'ab-new-number-allow-decimal',
		numberDefault: 'ab-new-number-default',
		allowRequired: 'ab-new-number-allow-required',
		mustBeUnique: 'ab-new-number-must-be-unique',
		typeFormat: 'ab-new-number-type-format',
		typeDecimals: 'ab-new-number-type-decimals',
		typeDecimalPlaces: 'ab-new-number-type-decimal-places',
		typeRounding: 'ab-new-number-type-rounding',
		typeThousands: 'ab-new-number-type-thousands'
	};

	var formatList = [
		{ id: 'none', value: AD.lang.label.getLabel('ab.dataField.number.none') || "None" },
		{ id: 'dollar', value: AD.lang.label.getLabel('ab.dataField.number.format.dollar') || "$", sign: "$", position: "prefix" },
		{ id: 'pound', value: AD.lang.label.getLabel('ab.dataField.number.format.pound') || "£", sign: "£", position: "prefix" },
		{ id: 'euroBefore', value: AD.lang.label.getLabel('ab.dataField.number.format.euroBefore') || "€ (before)", sign: "€", position: "prefix" },
		{ id: 'euroAfter', value: AD.lang.label.getLabel('ab.dataField.number.format.euroAfter') || "€ (after)", sign: "€", position: "postfix" },
		{ id: 'percent', value: AD.lang.label.getLabel('ab.dataField.number.format.percent') || "%", sign: "%", position: "postfix" },
	];

	// General settings
	var numberDataField = {
		name: 'number',
		type: ['float', 'integer'], // http://sailsjs.org/documentation/concepts/models-and-orm/attributes#?attribute-options
		icon: 'slack',
		menuName: AD.lang.label.getLabel('ab.dataField.number.menuName') || 'Number',
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
						labelRight: AD.lang.label.getLabel('ab.dataField.number.required') || "Required",
						inputWidth: 130,
						labelWidth: 0
					}
					// ,{
					// 	view: "checkbox",
					// 	id: componentIds.mustBeUnique,
					// 	labelRight: "Must be unique",
					// 	inputWidth: 180,
					// 	labelWidth: 0
					// }
				]
			},
			{
				view: "text",
				label: "Default Value",
				labelWidth: "100",
				id: componentIds.numberDefault,
				placeholder: AD.lang.label.getLabel('ab.dataField.number.defaultNumber') || 'Default number'
			},
			{
				view: "richselect",
				id: componentIds.typeFormat,
				label: "Format",
				value: 'none',
				options: formatList
			},
			{
				cols: [
					{
						view: "richselect",
						id: componentIds.typeDecimals,
						label: "Decimals",
						value: 'none',
						options: [
							{ id: 'none', value: AD.lang.label.getLabel('ab.dataField.number.none') || "None" },
							{ id: 'period', value: AD.lang.label.getLabel('ab.dataField.number.period') || "Period" },
							{ id: 'comma', value: AD.lang.label.getLabel('ab.dataField.number.comma') || "Comma" }
						],
						on: {
							'onChange': function (newValue, oldValue) {
								if (newValue == 'none') {
									$$(componentIds.typeDecimalPlaces).disable();
									$$(componentIds.typeRounding).disable();
								}
								else {
									$$(componentIds.typeDecimalPlaces).enable();
									$$(componentIds.typeRounding).enable();
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
					{ id: 'none', value: AD.lang.label.getLabel('ab.dataField.number.default') || "Default" },
					{ id: 'roundUp', value: AD.lang.label.getLabel('ab.dataField.number.roundUp') || "Round Up" },
					{ id: 'roundDown', value: AD.lang.label.getLabel('ab.dataField.number.roundDown') || "Round Down" }
				]
			},
			{
				view: "radio",
				id: componentIds.typeThousands,
				label: "Thousands",
				value: 'none',
				vertical: true,
				options: [
					{ id: 'none', value: AD.lang.label.getLabel('ab.dataField.number.none') || "None" },
					{ id: 'comma', value: AD.lang.label.getLabel('ab.dataField.number.comma') || "Comma" },
					{ id: 'period', value: AD.lang.label.getLabel('ab.dataField.number.period') || "Period" },
					{ id: 'space', value: AD.lang.label.getLabel('ab.dataField.number.space') || "Space" }
				]
			}
		]
	};

	numberDataField.populateSettings = function (application, data) {
		if (!data.type || !data.setting) return;

		$$(componentIds.typeFormat).setValue(data.setting.typeFormat);
		$$(componentIds.typeDecimalPlaces).setValue(data.setting.typeDecimalPlaces);
		$$(componentIds.typeDecimals).setValue(data.setting.typeDecimals);
		$$(componentIds.typeThousands).setValue(data.setting.typeThousands);
		$$(componentIds.typeRounding).setValue(data.setting.typeRounding);
		$$(componentIds.allowRequired).setValue(data.setting.allowRequired);

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
				typeFormat: $$(componentIds.typeFormat).getValue(),
				typeDecimalPlaces: $$(componentIds.typeDecimalPlaces).getValue(),
				typeDecimals: $$(componentIds.typeDecimals).getValue(),
				typeThousands: $$(componentIds.typeThousands).getValue(),
				typeRounding: $$(componentIds.typeRounding).getValue(),
				allowRequired: $$(componentIds.allowRequired).getValue(),

				icon: numberDataField.icon,
				editor: 'number',
				filter_type: 'number',
				template: '<div class="ab-number-format-show"></div>',
				default: $$(componentIds.numberDefault).getValue()
			}
		};
	};

	numberDataField.customDisplay = function (application, object, fieldData, rowId, data, itemNode, options) {
		if (data == null) {
			$(itemNode).find('.ab-number-format-show').html('');
			return true;
		}

		var decimalSizeNum = 0,
			decimalDelimiters = ".",
			groupDelimiters = "";

		if (fieldData.setting.typeDecimals && fieldData.setting.typeDecimals != 'none') {
			if (fieldData.setting.typeDecimalPlaces != undefined && fieldData.setting.typeDecimalPlaces != 'none') {
				decimalSizeNum = fieldData.setting.typeDecimalPlaces;
			}

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

			if (fieldData.setting.typeRounding != undefined) {
				switch (fieldData.setting.typeRounding) {
					case 'roundUp':
						var num = data;
						var precision = -decimalSizeNum;
						var div = Math.pow(10, precision);
						data = Math.ceil(num / div) * div;
						break;
					case 'roundDown':
						var num = data;
						var precision = -decimalSizeNum;
						var div = Math.pow(10, precision);
						data = Math.floor(num / div) * div;
						break;
				}
			}
		}

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

		var numberFormat = webix.Number.format(data, {
			groupDelimiter: groupDelimiters,
			groupSize: 3,
			decimalDelimiter: decimalDelimiters,
			decimalSize: decimalSizeNum
		});

		if (fieldData.setting.typeFormat != undefined && fieldData.setting.typeFormat != 'none') {
			var formatItem = formatList.find(function (item) { return item.id == fieldData.setting.typeFormat });
			if (formatItem) {
				numberFormat = (formatItem.position == 'prefix' ? formatItem.sign + ' ' + numberFormat : numberFormat + ' ' + formatItem.sign);
			}
		}

		$(itemNode).find('.ab-number-format-show').html(numberFormat);

		return true;
	};

	numberDataField.validate = function (fieldData, value) {

		if (fieldData.setting.allowRequired == 1 && (value == "" || value == undefined || value == null)) {
			webix.alert({
				title: AD.lang.label.getLabel('ab.dataField.number.require') || "Required",
				text: AD.lang.label.getLabel('ab.dataField.number.requireDescription') || "This column requires number value",
				ok: AD.lang.label.getLabel('ab.common.ok') || "OK"
			});
			return false;
		}

		if (!new RegExp('^[0-9.]*$').test(value)) {
			webix.alert({
				title: AD.lang.label.getLabel('ab.dataField.number.notNumberTitle') || "This value is invalid",
				text: AD.lang.label.getLabel('ab.dataField.number.notNumberDescription') || "Please enter number",
				ok: AD.lang.label.getLabel('ab.common.ok') || "OK"
			});
			return false;
		}

		if (!isNaN(parseFloat(value)) && isFinite(value) && fieldData.type == 'integer' && isFloat(value)) {
			webix.alert({
				title: AD.lang.label.getLabel('ab.dataField.number.disallowDecimalTitle') || "This value is invalid",
				text: AD.lang.label.getLabel('ab.dataField.number.disallowDecimalDescription') || "This column disallows decimal number",
				ok: AD.lang.label.getLabel('ab.common.ok') || "OK"
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