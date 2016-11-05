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
		rows: [{
			cols: [
					{
						view: "checkbox",
						id: componentIds.allowRequired,
						label: "required",
						inputWidth:130,
						labelWidth: 100
					},
					{
						view: "checkbox",
						id: componentIds.mustBeUnique,
						label: "Must be unique",
						inputWidth:180,
						labelWidth: 150
					}
				]
			},
			{
			cols: [
					{
						view: "text",
						label:"Default Value",
						labelWidth:"100",
						labelAlign:"right",
						id: componentIds.numberDefault,
						//placeholder: 'Default number'
					}
				]
			},
			{
			cols: [
					{
						view: "checkbox",
						id: componentIds.allowDecimal,
						labelRight: "Allow decimal numbers",
						labelWidth: 0
					}
				]
			},
			{
			cols: [
					{
						view: "combo",
						id: componentIds.typeDecimals,
						label: "Decimals",
						value:1,
						options:[
						    { id:1, value:"None" }, 
						    { id:2, value:"Period" }, 
						    { id:3, value:"Comma" }
						    ]
					},
					{
						view: "combo",
						id: componentIds.typeDecimalPlaces,
						label: "Decimal places",
						value:1,
						options:[
						    { id:0, value:"0" }, 
						    { id:1, value:"1" }, 
						    { id:2, value:"2" }, 
						    { id:3, value:"3" }, 
						    { id:4, value:"4" }, 
						    { id:5, value:"5" }, 
						    { id:10, value:"10" }
						    ]
					}
				]
			},
			{
			cols: [
					{
						view: "radio",
						id: componentIds.typeRounding,
						label: "Rounding",
						value:1,
						vertical:true,
						options:[
						    { id:1, value:"Default" }, 
						    { id:2, value:"Round Up" }, 
						    { id:2, value:"Round Down" }
						    ]
					}
				]
			},
			{
			cols: [
					{
						view: "radio",
						id: componentIds.typeThousands,
						label: "Rounding",
						value:1,
						vertical:true,
						options:[
						    { id:1, value:"None" }, 
						    { id:2, value:"Comma" }, 
						    { id:3, value:"Period" },
						    { id:4, value:"Space" }
						    ]
					}
				]
			},
			{
			cols: [
					{
						view: "combo",
						id: componentIds.typeFormat,
						label: "Format",
						value:1,
						options:[
						    { id:1, value:"$" }, 
						    { id:2, value:"%" }
						    ]
					}
				]
			}
		]
	};

	numberDataField.populateSettings = function (application, data) {
		if (!data.type || !data.setting) return;

		$$(componentIds.allowDecimal).setValue(data.type == 'float');
		$$(componentIds.allowDecimal).disable();
	
		$$(componentIds.typeDecimalPlaces).setValue(data.setting.typeDecimalPlaces);
		$$(componentIds.typeDecimals).setValue(data.setting.typeDecimals);
		$$(componentIds.typeThousands).setValue(data.setting.typeThousands);
		
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
				typeDecimalPlaces:$$(componentIds.typeDecimalPlaces).getValue(),
				typeDecimals:$$(componentIds.typeDecimals).getValue(),
				typeThousands:$$(componentIds.typeThousands).getValue(),
				icon: numberDataField.icon,
				editor: 'number',
				filter_type: 'number',
				template:'<div class="note1234"></div>',
				//format: format,
				default: $$(componentIds.numberDefault).getValue()
			}
		};
	};
	
	numberDataField.customDisplay = function (application, object, fieldData, rowId, data, itemNode, options){
	console.log("fewfwefw");
		console.log(data);
		var decimalSizeNum = 0;
		console.log(fieldData.setting.typeDecimalPlaces);
		if (fieldData.setting.typeDecimalPlaces!=undefined) {

		decimalSizeNum = fieldData.setting.typeDecimalPlaces;
		}
		
		var decimalDelimiters = ".";
		if (fieldData.setting.typeDecimals!=undefined) {
			if (fieldData.setting.typeDecimals==2) {	
				decimalDelimiters = ".";
			}
			else if (fieldData.setting.typeDecimals==3) {	
				decimalDelimiters = ",";
			}
		}
		
		var groupDelimiters = "";
		if (fieldData.setting.typeThousands!=undefined) {
			if (fieldData.setting.typeThousands==2) {	
				groupDelimiters = ",";
			}
			else if (fieldData.setting.typeThousands==3) {	
				groupDelimiters = ".";
			}
			else if (fieldData.setting.typeThousands==4) {	
				groupDelimiters = " ";
			}
		}
		
		var string1 = webix.Number.format(data,{
		    groupDelimiter:groupDelimiters,
		    groupSize:3,
		    decimalDelimiter:decimalDelimiters,
		    decimalSize:decimalSizeNum
		});
		
	
		console.log(decimalSizeNum);
		console.log("www");
		
		
	var $container = $(itemNode).find('.note1234');

		// clear contents
		$container.html(string1);
	
		
		
		return true;
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