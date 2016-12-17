steal(function () {
	var componentIds = {
		editView: 'ab-new-date',
		includeTime: 'ab-new-date-include-time',
		datedisPlay: 'ab-new-date-date-display',
		
		includedayFormat : 'ab-new-date-includedayFormat',
		includemonthFormat : 'ab-new-date-includemonthFormat',
		includeyearFormat : 'ab-new-date-includeyearFormat',
		
		typedayformatDelimiters  : 'ab-new-date-typedayformatDatetime',
		typemonthformatDelimiters  : 'ab-new-date-typemonthdayformatDatetime',
		typeyearformatDelimiters  : 'ab-new-date-typeyearformatDatetime',
		
		includedayOrder  : 'ab-new-date-includedayOrder',
		includemonthOrder  : 'ab-new-date-includemonthOrder',
		includeyearOrder  : 'ab-new-date-includeyearOrder',
		
	};

	// General settings
	var dateDataField = {
		name: 'date',
		type: ['datetime', 'date'], // http://sailsjs.org/documentation/concepts/models-and-orm/attributes#?attribute-options
		icon: 'calendar',
		menuName: 'Date',
		includeHeader: true,
		description: ''
	};
	
	function getDelimiters(d){
		switch (d) {
				case 'comma':
					return ",";
					break;
				case 'slash':
					return "/";
					break;
				case 'space':
					return " ";
					break;
			}
	}
	
	
	function showdateDisplay(){
		if(($$(componentIds.includedayFormat).getValue().split("-")[1] && $$(componentIds.includedayFormat).getValue().split("-")[1] != 'none')
		   && ($$(componentIds.includemonthFormat).getValue().split("-")[1] && $$(componentIds.includemonthFormat).getValue().split("-")[1] != 'none')
		   && ($$(componentIds.includeyearFormat).getValue().split("-")[1] && $$(componentIds.includeyearFormat).getValue().split("-")[1] != 'none')
		   && ($$(componentIds.typedayformatDelimiters).getValue() && $$(componentIds.typedayformatDelimiters).getValue() != 'none')
		   && ($$(componentIds.typemonthformatDelimiters).getValue() && $$(componentIds.typemonthformatDelimiters).getValue() != 'none')
		   && ($$(componentIds.typeyearformatDelimiters).getValue() && $$(componentIds.typeyearformatDelimiters).getValue() != 'none')
		   )
		  {
		    	var dateformat = $$(componentIds.includemonthFormat).getValue().split("-")[1]+  $$(componentIds.typedayformatDelimiters).getValue()
			   	+ $$(componentIds.includemonthFormat).getValue().split("-")[1] + $$(componentIds.typemonthformatDelimiters).getValue()
			  	+ $$(componentIds.includeyearFormat).getValue().split("-")[1] + $$(componentIds.typeyearformatDelimiters).getValue(); 
		  	
			  var $container = $(componentIds.datedisPlay).val("kid");
			  
		  }
		
		
	}

	// Edit definition
	dateDataField.editDefinition = {
		id: componentIds.editView,
		rows: [
			{
				view: "label",
				label: "Pick one from a calendar."
			},
			{
				view: "checkbox",
				id: componentIds.includeTime,
				labelRight: "Include time",
				labelWidth: 0
			},
			{
				view: "label",
				label: "Date format options"
			},
			{
				view: "text",
				label: "Date Display",
				labelWidth: "100",
				id: componentIds.datedisPlay,
				placeholder: "date-display"
			},
			{
				cols: [
				{
					view: "richselect",
					id: componentIds.includedayFormat,
					label: "Day",
					value: 'none',
					options: [
						{ id: 'includeDay-d', value: "1" },
						{ id: 'includeDay-dd', value: "01" },
						{ id: 'includeDay-ddd', value: "Fri" },
						{ id: 'includeDay-dddd', value: "Monday" }
						],
						on: {
							'onChange': function (newValue, oldValue) {
								showdateDisplay();
							}
						}
					
				 },
				 {
						view: "richselect",
						id: componentIds.includedayOrder,
						label: "Places",
						value: 'none',
						//disabled: true,
						options: [
							{ id: 1, value: "1" },
							{ id: 2, value: "2" },
							{ id: 3, value: "3" },
					
						]
				 }
				]
	
			},
			{
				view: "radio",
				id: componentIds.typedayformatDelimiters,
				label: "dayformat",
				value: 'none',
				vertical: true,
				options: [
					{ id: 'comma', value: "Comma" },
					{ id: 'slash', value: "Slash" },
					{ id: 'space', value: "Space" }
				]
			},
			{
				cols: [
					{
						view: "richselect",
						id: componentIds.includemonthFormat,
						label: "Month",
						value: 'none',
						options: [
							{ id: 'includeMonth-M', value: "1" },
							{ id: 'includeMonth-MM', value: "01" },
							{ id: 'includeMonth-MMM', value: "Jun" },
							{ id: 'includeMonth-MMMM', value: "June" }
							]
					},
					{
						view: "richselect",
						id: componentIds.includemonthOrder,
						label: "Places",
						value: 'none',
						//disabled: true,
						options: [
							{ id: 1, value: "1" },
							{ id: 2, value: "2" },
							{ id: 3, value: "3" },
						]
					}
					]
			},
			{
				view: "radio",
				id: componentIds.typemonthformatDelimiters,
				label: "monthformat",
				value: 'none',
				vertical: true,
				options: [
					{ id: 'comma', value: "Comma" },
					{ id: 'slash', value: "Slash" },
					{ id: 'space', value: "Space" }
				]
			},
			{
				cols: [
					{
						view: "richselect",
						id: componentIds.includeyearFormat,
						label: "Year",
						value: 'none',
						options: [
							{ id: 'includeYear-Y', value: "1" },
							{ id: 'includeYear-YY', value: "01" },
							{ id: 'includeYear-YYY', value: "001" },
							{ id: 'includeYear-YYYY', value: "0001" }
							]
					},
					{
						view: "richselect",
						id: componentIds.includeyearOrder,
						label: "Places",
						value: 'none',
						//disabled: true,
						options: [
							{ id: 1, value: "1" },
							{ id: 2, value: "2" },
							{ id: 3, value: "3" },		
						]
					}
				]
	
			},
			{
				view: "radio",
				id: componentIds.typeyearformatDelimiters,
				label: "yearformat",
				value: 'none',
				vertical: true,
				options: [
					{ id: 'comma', value: "Comma" },
					{ id: 'Slash', value: "Slash" },
					{ id: 'space', value: "Space" }
				]
			}

		]
	};

	// Populate settings (when Edit field)
	dateDataField.populateSettings = function (application, data) {
		if (!data.type || !data.setting) return;
		
		$$(componentIds.includedayFormat).setValue("includeDay-" + data.setting.includedayFormat);
		$$(componentIds.typedayformatDelimiters).setValue(data.setting.typedayformatDelimiters);
		$$(componentIds.includemonthFormat).setValue("includeMonth-" + data.setting.includemonthFormat);
		$$(componentIds.typemonthformatDelimiters).setValue(data.setting.typemonthformatDelimiters);
		$$(componentIds.includeyearFormat).setValue("includeYear-" +data.setting.includeyearFormat);
		$$(componentIds.typeyearformatDelimiters).setValue(data.setting.typeyearformatDelimiters);
		
		$$(componentIds.includeTime).setValue(data.type == 'datetime');
		$$(componentIds.includeTime).disable();
	};

	// For save field
	dateDataField.getSettings = function () {
		var type = 'date',
			editor = 'date'
			//format = 'dateFormatStr';

		if ($$(componentIds.includeTime).getValue()) {
			type = 'datetime';
			editor = 'datetime';
			//format = 'fullDateFormatStr';
		}
		
		return {
			fieldName: dateDataField.name,
			type: type,
			setting: {
				icon: dateDataField.icon,
				editor: editor, // http://docs.webix.com/desktop__editing.html
				filter_type: 'date', // DataTableFilterPopup - filter type
				template:'<div class="ab-date-data-field"></div>',
				includedayFormat: $$(componentIds.includedayFormat).getValue().split("-")[1],
				typedayformatDelimiters : $$(componentIds.typedayformatDelimiters).getValue(),
				includemonthFormat: $$(componentIds.includemonthFormat).getValue().split("-")[1],
				typemonthformatDelimiters : $$(componentIds.typemonthformatDelimiters).getValue(),
				includeyearFormat: $$(componentIds.includeyearFormat).getValue().split("-")[1],
				typeyearformatDelimiters : $$(componentIds.typeyearformatDelimiters).getValue(),
			}
		};
	};
	
	dateDataField.customDisplay = function (application, object, fieldData, rowId, data, itemNode, options) {
		if (data == null) {
			$(itemNode).find('.ab-date-data-field').html('');
			return true;
		}
		
		var $container = $(itemNode).find('.ab-date-data-field');
		$container.html('');
		
		//var datadateFormat = "mm/dd/YYYY";
		
		//if(fieldData.setting.dateformat  && fieldData.setting.dateformat != 'none')
		//{
		//	datadateFormat = fieldData.setting.dateformat;
		//}
		
		//setdateformat
		var dateformat = "mm/dd/yyyy";
		if((fieldData.setting.includedayFormat && fieldData.setting.includedayFormat != 'none')
		   && (fieldData.setting.includemonthFormat && fieldData.setting.includemonthFormat != 'none')
		   && (fieldData.setting.includeyearFormat && fieldData.setting.includeyearFormat != 'none')
		   && (fieldData.setting.typedayformatDelimiters && fieldData.setting.typedayformatDelimiters != 'none')
		   && (fieldData.setting.typemonthformatDelimiters && fieldData.setting.typemonthformatDelimiters != 'none')
		   && (fieldData.setting.typeyearformatDelimiters && fieldData.setting.typeyearformatDelimiters != 'none')
		   )
		  {
		    	dateformat = fieldData.setting.includedayFormat +  getDelimiters(fieldData.setting.typedayformatDelimiters)
			   	+ fieldData.setting.includemonthFormat + getDelimiters(fieldData.setting.typemonthformatDelimiters)
			  	+ fieldData.setting.includeyearFormat ;
		  }
		

        	var imgDiv = null; 

		 if ( !data || data == '') {
            		dateDiv = "no data";
        	} else {
            	// else display the image:

			var date = new Date(data);
			var formattedDate = moment(date).format(dateformat);
	    		
			dateDiv = formattedDate;
        	}

	        // insert the image to display
        	$container.html(dateDiv);
		
		
		return true;
	};
	

	dateDataField.resetState = function () {
		$$(componentIds.includeTime).setValue(false);
		$$(componentIds.includeTime).enable();
	};

	return dateDataField;

});
