steal(
	'opstools/BuildApp/controllers/EquationManager.js',
	function (EquationManager) {

		var componentIds = {
			editView: 'ab-new-equation',
			name: 'ab-new-equation-name',
			equationType: 'ab-new-equation-equationType',
			dateType: 'ab-new-equation-dateType',
			resultType: 'ab-new-equation-resultType',
			equation: 'ab-new-equation-equation',
			typeDecimals: 'ab-new-equation-typeDecimals',
			typeDecimalPlaces: 'ab-new-equation-typeDecimalPlaces',
			typeRounding: 'ab-new-equation-typeRounding',
			typeThousands: 'ab-new-equation-typeThousands',
			typeFormat: 'ab-new-equation-typeFormat',

		};

		var formatList = [
		{ id: 'none', value: AD.lang.label.getLabel('ab.dataField.number.none') || "None" },
		{ id: 'dollar', value: AD.lang.label.getLabel('ab.dataField.number.format.dollar') || "$", sign: "$", position: "prefix" },
		{ id: 'pound', value: AD.lang.label.getLabel('ab.dataField.number.format.pound') || "£", sign: "£", position: "prefix" },
		{ id: 'euroBefore', value: AD.lang.label.getLabel('ab.dataField.number.format.euroBefore') || "€ (before)", sign: "€", position: "prefix" },
		{ id: 'euroAfter', value: AD.lang.label.getLabel('ab.dataField.number.format.euroAfter') || "€ (after)", sign: "€", position: "postfix" },
		{ id: 'percent', value: AD.lang.label.getLabel('ab.dataField.number.format.percent') || "%", sign: "%", position: "postfix" },
		];

		var equationDataField = {
		name: 'equation', // unique key to reference this specific DataField
		type: 'string', // http://sailsjs.org/documentation/concepts/models-and-orm/attributes#?attribute-options
		icon: 'font',   // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'

		menuName: AD.lang.label.getLabel('ab.dataField.equation.menuName') ||'Equation',  
		includeHeader: true,
		description: ''
	};


	function getDataField(type){
		if(type == 'date'){
			return { 
				editDefinition : {
					id:'typeSettings',
					rows: [
					{
						
						/*cols: [
						{
							view: "richselect",
							id: componentIds.dateType,
							label: "Date Type",
							labelWidth: "110",
							value: 'none',
							options: [
							{ id: 'hours', value:  "Hours" },
							{ id: 'days', value:  "Days" },
							{ id: 'weeks', value: "Weeks" },
							{ id: 'years', value: "Years" },
							]
						},
						{*/
							view: "richselect",
							id: componentIds.resultType,
							label: "Result Type",
							labelWidth: "110",
							value: 'number',
							//disabled: true,
							options: [
							{ id: 'number', value: "Number" },
							//{ id: 'date', value: "Date" },

							]/*
						},
						]*/

					},
					{
						view: "label",
						label: "Example Output year()-year(birthdate)"
					},	
					{
						view: "text",
						label: "Equation",
						labelWidth: "100",
						id: componentIds.equation,
						popup:"my_pop",
						on: {
							"onKeyPress" : function(code, e){ 
								//var value = this.getValue().toLowerCase();
								//$$("testkid").setValue("eiei");
								//webix.message(code);
							}
						}
					},
					]
				},
				getSettings : function () {
					
					var type = 'integer';

					var settings = {
						fieldName: equationDataField.name,
						type: type,
						setting: {
							equationType : $$(componentIds.equationType).getValue(),
							equation : $$(componentIds.equation).getValue(),
							template:'<div class="ab-equation-data-field"></div>',
						}
					};

					var resultType = getDataField(settings.setting.equationType);

					settings.setting.resultSettings = resultType.getSettings();

					return settings;
				},
				populateSettings : function (application, data) {
					if (!data.setting) return;
					
					$$(componentIds.equaltionType).setValue(data.setting.equaltionType);
					$$(componentIds.equation).setValue(data.setting.equation);
					console.log("setting equation 2");
					
					var resultSettings = {
						setting: data.setting.resultSettings
					}

					var resultType = getDataField(settings.setting.equationType);

					resultType.populateSettings(application, resultSettings);
				},
			}
		}
		else if (type == 'numeric') {
			return { 
				editDefinition : {
					id:'typeSettings',
					rows: [
					{
						view: "label",
						label: "Example Output    4*3=12"
					},	
					{
						view: "text",
						label: "Equation",
						labelWidth: "100",
						popup:"my_pop",
						id: componentIds.equation,

					},
					{
						cols: [
						{
							view: "richselect",
							id: componentIds.typeDecimals,
							label: "Decimals",
							value: 'none',
							options: [
							{ id: 'none', value: AD.lang.label.getLabel('ab.dataField.equation.none') || "None" },
							{ id: 'period', value: AD.lang.label.getLabel('ab.dataField.equation.period') || "Period" },
							{ id: 'comma', value: AD.lang.label.getLabel('ab.dataField.equation.comma') || "Comma" }
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
							label: "Decimal Places",
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
						},
						]
					},
					{
						view: "radio",
						id: componentIds.typeRounding,
						label: "Rounding",
						value: 'none',
						vertical: true,
						options: [
						{ id: 'none', value: AD.lang.label.getLabel('ab.dataField.equation.default') || "Default" },
						{ id: 'roundUp', value: AD.lang.label.getLabel('ab.dataField.equation.roundUp') || "Round Up" },
						{ id: 'roundDown', value: AD.lang.label.getLabel('ab.dataField.equation.roundDown') || "Round Down" }
						]
					},
					{
						view: "radio",
						id: componentIds.typeThousands,
						label: "Thousands",
						value: 'none',
						vertical: true,
						options: [
						{ id: 'none', value: AD.lang.label.getLabel('ab.dataField.equation.none') || "None" },
						{ id: 'comma', value: AD.lang.label.getLabel('ab.dataField.equation.comma') || "Comma" },
						{ id: 'period', value: AD.lang.label.getLabel('ab.dataField.equation.period') || "Period" },
						{ id: 'space', value: AD.lang.label.getLabel('ab.dataField.equation.space') || "Space" }
						]
					},
					{
						view: "richselect",
						id: componentIds.typeFormat,
						label: "Format",
						value: 'none',
						options: formatList
					}
					]
				},
				getSettings : function () {
					var type = 'integer';

					var settings = {
						fieldName: equationDataField.name,
						type: type,
						setting: {
							equationType : $$(componentIds.equationType).getValue(),
							equation : $$(componentIds.equation).getValue(),
							template:'<div class="ab-equation-data-field"></div>',
						}
					};

					var resultType = getDataField(settings.setting.equationType);

					settings.setting.resultSettings = resultType.getSettings();

					return settings;
					
				},
				populateSettings : function (application, data) {
					if (!data.setting) return;
					
					$$(componentIds.equationType).setValue(data.setting.equationType);
					$$(componentIds.equation).setValue(data.setting.equation);

					var resultSettings = {
						setting: data.setting.resultSettings
					}
					console.log("setting equation 3");
					var resultType = getDataField(settings.setting.equationType);

					resultType.populateSettings(application, resultSettings);
				},
			}
			
		}
	}

	function showSettings(type){
		
		var resultType = getDataField(type);

		var typeSettings = resultType.editDefinition;
		webix.ui({
			view:"popup",
			id:"my_pop",
			body:{
				view:"list",
				id: "popuplist",
				width:400,
				height:200,
				top: 30,
				left:30,
				template:"#title#",
				select:true,
				//data:[
				//{ id:1, title:"year()"},
				//{ id:2, title:"year(datevalue)"},
				//{ id:3, title:"Item 3"}
				//],
				on: {
					"onItemClick": function(newv, oldv){
						var getEquation = $$(componentIds.equation).getValue();
						var getEquationFunction = newv;
						//var test2 = $$("popuplist").getItem(newv).title;
						$$(componentIds.equation).setValue(getEquation + getEquationFunction);
						$$("my_pop").hide();
					},

				}
			}
		});

		//@addlistdata
		addListEquation(type);

		webix.ui(typeSettings, $$('typeSettings'));  //<<——— update section with the webix definition of the component

	}

	function addListEquation(type){

		var listItem = EquationManager.getDescriptions(type);
		//console.log(listItem);
		for(i = 0 ; i < listItem.length ; i++){
			$$("popuplist").add({ id:listItem[i].split(":")[0], title: listItem[i]});
		}

	}


	equationDataField.editDefinition = {
		id: componentIds.editView,
		rows: [
		{
			view: "radio",
			id: componentIds.equationType,
			label: "Equation Type",
			labelWidth: "110",
			value: 'none',
			vertical: true,
			options: [
			{ id: 'numeric',value: "Numeric" },
			{ id: 'date',value:  "Date" },

			],
			on: {
				'onChange': function (newValue, oldValue) {
					showSettings(newValue);

				}
			}
		},
		{ 

			label: 'choose a type',
			id:'typeSettings',
		},
		{
			view:"popup",
			id:"my_popup",
			body:{
				template:"Some text" 
			}
		},
		]
	};

	equationDataField.populateSettings = function (application, data) {

		if (!data.type || !data.setting) return;

		$$(componentIds.equationType).setValue(data.setting.equationType);
		$$(componentIds.typeDecimals).setValue(data.setting.typeDecimals);
		$$(componentIds.typeDecimalPlaces).setValue(data.setting.typeDecimalPlaces);
		$$(componentIds.typeRounding).setValue(data.setting.typeRounding);
		$$(componentIds.typeThousands).setValue(data.setting.typeThousands);
		$$(componentIds.typeFormat).setValue(data.setting.typeFormat);
		$$(componentIds.equation).setValue(data.setting.equation);


	};



	equationDataField.getSettings = function () {

		var type = 'integer';
		console.log("getSettingssna");	
		return {
			fieldName: equationDataField.name,
			type: type,
			setting: {	
				template:'<div class="ab-equation-data-field"></div>',
				equationType :  $$(componentIds.equationType).getValue(),
				typeDecimals : $$(componentIds.typeDecimals).getValue(),
				typeDecimalPlaces : $$(componentIds.typeDecimalPlaces).getValue(),
				typeRounding : $$(componentIds.typeRounding).getValue(),
				typeThousands : $$(componentIds.typeThousands).getValue(),
				typeFormat : $$(componentIds.typeFormat).getValue(),
				equation : $$(componentIds.equation).getValue(),


			}
		};


	};


	equationDataField.customDisplay = function (application, object, fieldData, rowData, data, viewId, itemNode, options) {
		
		if (rowData == null) {
			$(itemNode).find('.ab-equation-data-field').html('');
			return true;
		}

		try {
			var parser = EquationManager.parse(fieldData.setting.equation);
			//console.log("parser: " + parser);
			if (parser) {

				var data = parser(rowData);
				
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

				//console.log("numberFormatkid: "+ numberFormat);
				if (fieldData.setting.typeFormat != undefined && fieldData.setting.typeFormat != 'none') {
					var formatItem = formatList.find(function (item) { return item.id == fieldData.setting.typeFormat });
					if (formatItem) {
						numberFormat = (formatItem.position == 'prefix' ? formatItem.sign + ' ' + numberFormat : numberFormat + ' ' + formatItem.sign);
					}
				}
		
				//$(itemNode).find('.ab-equation-data-field').html(numberFormat);
				
				if (fieldData == null) {
					$(itemNode).find('.ab-equation-data-field').html('');
					return true;
				}
		

				$(itemNode).find('.ab-equation-data-field').html(data);
			} 
			else {
				console.log("parser:false");
				$(itemNode).find('.ab-equation-data-field').html('invalid equation:'+fieldData.setting.equation);
			}

			return true;

		} 
		catch(e) {
				// handle error
			
		}


};
	/**
	 * @function resetState
	 *
	 * Find our current Webix UI editor instance, and reset all the entry 
	 * fields.
	 *
	 */
	 equationDataField.resetState = function () {


	 };


	 return equationDataField;
	});
