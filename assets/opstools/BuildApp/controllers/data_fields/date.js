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
				case 'dash':
					return "-";
					break;
			}
	}
	
	function setformatdatetimeOrder(orderday,ordermonth,orderyear,includedayformat,includemonthformat,includeyearformat,
					typedayformatdelimiters,typemonthformatdelimiters,typeyearformatdelimiters){
		
		var orderformatdate = [];
		
		//check orderDay
		if(orderday == 1){
			orderformatdate[0] = includedayformat + getDelimiters(typedayformatdelimiters);
		}
		else if (orderday == 2){
			orderformatdate[1] = includedayformat + getDelimiters(typedayformatdelimiters);
		}
		else if (orderday == 3){
			orderformatdate[2] = includedayformat ;
		}
		
		//check orderMonth
		if(ordermonth == 1){
			orderformatdate[0] = includemonthformat + getDelimiters(typemonthformatdelimiters);
		}
		else if(ordermonth == 2){
			orderformatdate[1] = includemonthformat + getDelimiters(typemonthformatdelimiters);
		}
		else if(ordermonth == 3){
			orderformatdate[2] = includemonthformat;
		}
		
		//check OrderYear
		if(orderyear == 1){
			orderformatdate[0] = includeyearformat + getDelimiters(typeyearformatdelimiters);
		}
		else if(orderyear == 2){
			orderformatdate[1] = includeyearformat + getDelimiters(typeyearformatdelimiters);
		}
		else if(orderyear == 3){
			orderformatdate[2] = includeyearformat;
		}
		
		return orderformatdate[0]+orderformatdate[1]+orderformatdate[2];
		
		
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
		    	//var dateformat = $$(componentIds.includedayFormat).getValue().split("-")[1]+  getDelimiters($$(componentIds.typedayformatDelimiters).getValue())
			//   	+ $$(componentIds.includemonthFormat).getValue().split("-")[1] + getDelimiters($$(componentIds.typemonthformatDelimiters).getValue())
			 // 	+ $$(componentIds.includeyearFormat).getValue().split("-")[1] + getDelimiters($$(componentIds.typeyearformatDelimiters).getValue()); 
		  	
			  
			   var formatdateorder = setformatdatetimeOrder(
				   		 $$(componentIds.includedayOrder).getValue(),
						 $$(componentIds.includemonthOrder).getValue(),
						 $$(componentIds.includeyearOrder).getValue(),
				   		 $$(componentIds.includedayFormat).getValue().split("-")[1],
				   		 $$(componentIds.includemonthFormat).getValue().split("-")[1],
				   		 $$(componentIds.includeyearFormat).getValue().split("-")[1],
				   		 $$(componentIds.typedayformatDelimiters).getValue(),
						 $$(componentIds.typemonthformatDelimiters).getValue(),
				   		 $$(componentIds.typeyearformatDelimiters).getValue()
			   			);

			  $$(componentIds.datedisPlay).setValue("");;
			  var fulldatetime = moment(new Date()).format(formatdateorder);
			  var $container = $$(componentIds.datedisPlay).setValue(fulldatetime);
			  
			 
			  //console.log("fulldate:" + fulldate);
			  
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
				disabled: true,
				//value : showdateDisplay(),
				placeholder: "date-display"
			},
			{
				cols: [
				{
					view: "richselect",
					id: componentIds.includedayFormat,
					label: "Day",
					value: 'includeDay-ddd',
					options: [
						{ id: 'includeDay-D', value: "1 2 ... 30 31" },
						{ id: 'includeDay-Do', value: "1st 2nd ... 30th 31st" },
						{ id: 'includeDay-DD', value: "01 02 ... 30 31" },
						{ id: 'includeDay-dd', value: "Su Mo ... Fr Sa" },
						{ id: 'includeDay-ddd', value: "Sun Mon ... Fri Sat" },
						{ id: 'includeDay-dddd', value: "Sunday Monday ... Friday Saturday" },
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
						value: 1,
						//disabled: true,
						options: [
							{ id: 1, value: "1" },
							{ id: 2, value: "2" },
							{ id: 3, value: "3" },
					
						],
						on: {
							'onChange': function (newValue, oldValue) {
								showdateDisplay();
							}
						}
				 }
				]
	
			},
			{
				view: "radio",
				id: componentIds.typedayformatDelimiters,
				label: "Delimiters",
				value: 'slash',
				vertical: true,
				options: [
					{ id: 'comma', value: "Comma" },
					{ id: 'slash', value: "Slash" },
					{ id: 'space', value: "Space" },
					{ id: 'dash', value: "Dash" }
				],
						on: {
							'onChange': function (newValue, oldValue) {
								showdateDisplay();
							}
						}
			},
			{
				cols: [
					{
						view: "richselect",
						id: componentIds.includemonthFormat,
						label: "Month",
						value: 'includeMonth-MMM',
						options: [
							{ id: 'includeMonth-M', value: "1 2 ... 11 12" },
							{ id: 'includeMonth-Mo', value: "1st 2nd ... 11th 12th" },
							{ id: 'includeMonth-MM', value: "01 02 ... 11 12" },
							{ id: 'includeMonth-MMM', value: "Jan Feb ... Nov Dec" },
							{ id: 'includeMonth-MMMM', value: "January February ... November December" }
							],
						on: {
							'onChange': function (newValue, oldValue) {
								showdateDisplay();
							}
						}
					},
					{
						view: "richselect",
						id: componentIds.includemonthOrder,
						label: "Places",
						value: 2,
						//disabled: true,
						options: [
							{ id: 1, value: "1" },
							{ id: 2, value: "2" },
							{ id: 3, value: "3" },
						],
						on: {
							'onChange': function (newValue, oldValue) {
								showdateDisplay();
							}
						}
					}
					]
			},
			{
				view: "radio",
				id: componentIds.typemonthformatDelimiters,
				label: "Delimiters",
				value: 'slash',
				vertical: true,
				options: [
					{ id: 'comma', value: "Comma" },
					{ id: 'slash', value: "Slash" },
					{ id: 'space', value: "Space" },
					{ id: 'dash', value: "Dash" }
				],
						on: {
							'onChange': function (newValue, oldValue) {
								showdateDisplay();
							}
						}
			},
			{
				cols: [
					{
						view: "richselect",
						id: componentIds.includeyearFormat,
						label: "Year",
						value: 'includeYear-YYYY',
						options: [
							{ id: 'includeYear-YY', value: "70 71 ... 29 30" },
							{ id: 'includeYear-YYYY', value: "1970 1971 ... 2029 2030" },
							
							],
						on: {
							'onChange': function (newValue, oldValue) {
								showdateDisplay();
							}
						}
					},
					{
						view: "richselect",
						id: componentIds.includeyearOrder,
						label: "Places",
						value: 3,
						//disabled: true,
						options: [
							{ id: 1, value: "1" },
							{ id: 2, value: "2" },
							{ id: 3, value: "3" },		
						],
						on: {
							'onChange': function (newValue, oldValue) {
								showdateDisplay();
							}
						}
					}
				]
	
			},
			{
				view: "radio",
				id: componentIds.typeyearformatDelimiters,
				label: "Delimiters",
				value: 'slash',
				vertical: true,
				options: [
					{ id: 'comma', value: "Comma" },
					{ id: 'slash', value: "slash" },
					{ id: 'space', value: "Space" },
					{ id: 'dash', value: "Dash" }
				],
						on: {
							'onChange': function (newValue, oldValue) {
								showdateDisplay();
							}
						}
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
		
		$$(componentIds.includedayOrder).setValue(data.setting.includedayOrder);
		$$(componentIds.includemonthOrder).setValue(data.setting.includemonthOrder);
		$$(componentIds.includeyearOrder).setValue(data.setting.includeyearOrder);
		
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
				includedayOrder :  $$(componentIds.includedayOrder).getValue(),
				includemonthOrder :  $$(componentIds.includemonthOrder).getValue(),
				includeyearOrder :  $$(componentIds.includeyearOrder).getValue(),
			}
		};
	};
	
	dateDataField.customDisplay = function (application, object, fieldData, rowId, data, itemNode, options) {
		showdateDisplay();
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
		    	//dateformat = fieldData.setting.includedayFormat +  getDelimiters(fieldData.setting.typedayformatDelimiters)
			  // 	+ fieldData.setting.includemonthFormat + getDelimiters(fieldData.setting.typemonthformatDelimiters)
			 // 	+ fieldData.setting.includeyearFormat ;
			  
			  dateformat =  setformatdatetimeOrder(fieldData.setting.includedayOrder,
							       fieldData.setting.includemonthOrder,
							       fieldData.setting.includeyearOrder,
							       fieldData.setting.includedayFormat,
							       fieldData.setting.includemonthFormat,
							       fieldData.setting.includeyearFormat,
							       fieldData.setting.typedayformatDelimiters,
							       fieldData.setting.typemonthformatDelimiters,
							       fieldData.setting.typeyearformatDelimiters
							       );
			  
			  
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


/*
[To do]
Bug on 19/12/2016
- Add Date page
1. validate duplicate order in date format.
2. Default show display not work for new loading.
(done)3. check show display for moment .js 
4. check validate dateformat order equal 3 should show / hide for delimiters ?
5. check the funtion include time [check box] what is the fuction ?
6. check the default value all the dropdown
7. 

- Page Layout [Interface]
1. Add date format not work.

Bug on 20/12/2016
(done)1. Drow down Day , Month , should display follow: http://momentjs.com/docs/#/displaying/format/
2. when select places duplicate , display date show invalid date.
3. Delimiter title value should be show symbol example Comma(,) Slash (/) ...

- Page Layout [Interface]
1. Add date format not work.
2. when add 2 date date 1 and date 2 format not the same display


*/
