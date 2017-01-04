steal(function () {
	var componentIds = {
		editView: 'ab-new-date',
		includeTime: 'ab-new-date-include-time',
		datedisPlay: 'ab-new-date-date-display',
		
		includeDayFormat : 'ab-new-date-includedayFormat',
		includeMonthFormat : 'ab-new-date-includemonthFormat',
		includeYearFormat : 'ab-new-date-includeyearFormat',
		
		typeDayFormatDelimiters  : 'ab-new-date-typedayformatDatetime',
		typeMonthFormatDelimiters  : 'ab-new-date-typemonthdayformatDatetime',
		typeYearFormatDelimiters  : 'ab-new-date-typeyearformatDatetime',
		
		includeDayOrder  : 'ab-new-date-includedayOrder',
		includeMonthOrder  : 'ab-new-date-includemonthOrder',
		includeYearOrder  : 'ab-new-date-includeyearOrder',
		
	};

	// General settings
	var dateDataField = {
		name: 'date',
		type: ['datetime', 'date'], // http://sailsjs.org/documentation/concepts/models-and-orm/attributes#?attribute-options
		icon: 'calendar',
		menuName: AD.lang.label.getLabel('ab.dataField.date.menuName') || 'Date',
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
	
	function setFormatDateTimeOrder(orderDay,orderMonth,orderYear,includeDayFormat,includeMonthFormat,includeYearFormat,
		typeDayFormatDelimiters,typeMonthFormatDelimiters,typeYearFormatDelimiters){
		
		var orderFormatDate = [];
		
		//check orderDay
		if(orderDay == 1){
			orderFormatDate[0] = includeDayFormat + getDelimiters(typeDayFormatDelimiters);
		}
		else if (orderDay == 2){
			orderFormatDate[1] = includeDayFormat + getDelimiters(typeDayFormatDelimiters);
		}
		else if (orderDay == 3){
			orderFormatDate[2] = includeDayFormat ;
		}
		
		//check orderMonth
		if(orderMonth == 1){
			orderFormatDate[0] = includeMonthFormat + getDelimiters(typeMonthFormatDelimiters);
		}
		else if(orderMonth == 2){
			orderFormatDate[1] = includeMonthFormat + getDelimiters(typeMonthFormatDelimiters);
		}
		else if(orderMonth == 3){
			orderFormatDate[2] = includeMonthFormat;
		}
		
		//check OrderYear
		if(orderYear == 1){
			orderFormatDate[0] = includeYearFormat + getDelimiters(typeYearFormatDelimiters);
		}
		else if(orderYear == 2){
			orderFormatDate[1] = includeYearFormat + getDelimiters(typeYearFormatDelimiters);
		}
		else if(orderYear == 3){
			orderFormatDate[2] = includeYearFormat;
		}
		
		return orderFormatDate[0]+orderFormatDate[1]+orderFormatDate[2];
		
		
	}
	
	function showdateDisplay(){
		if(($$(componentIds.includeDayFormat).getValue().split("-")[1] && $$(componentIds.includeDayFormat).getValue().split("-")[1] != 'none')
			&& ($$(componentIds.includeMonthFormat).getValue().split("-")[1] && $$(componentIds.includeMonthFormat).getValue().split("-")[1] != 'none')
			&& ($$(componentIds.includeYearFormat).getValue().split("-")[1] && $$(componentIds.includeYearFormat).getValue().split("-")[1] != 'none')
			&& ($$(componentIds.typeDayFormatDelimiters).getValue() && $$(componentIds.typeDayFormatDelimiters).getValue() != 'none')
			&& ($$(componentIds.typeMonthFormatDelimiters).getValue() && $$(componentIds.typeMonthFormatDelimiters).getValue() != 'none')
			&& ($$(componentIds.typeYearFormatDelimiters).getValue() && $$(componentIds.typeYearFormatDelimiters).getValue() != 'none')
			)
		{
		    	//var dateformat = $$(componentIds.includedayFormat).getValue().split("-")[1]+  getDelimiters($$(componentIds.typedayformatDelimiters).getValue())
			//   	+ $$(componentIds.includemonthFormat).getValue().split("-")[1] + getDelimiters($$(componentIds.typemonthformatDelimiters).getValue())
			 // 	+ $$(componentIds.includeyearFormat).getValue().split("-")[1] + getDelimiters($$(componentIds.typeyearformatDelimiters).getValue()); 
			 
			 
			 var formatDateOrder = setFormatDateTimeOrder(
			 	$$(componentIds.includeDayOrder).getValue(),
			 	$$(componentIds.includeMonthOrder).getValue(),
			 	$$(componentIds.includeYearOrder).getValue(),
			 	$$(componentIds.includeDayFormat).getValue().split("-")[1],
			 	$$(componentIds.includeMonthFormat).getValue().split("-")[1],
			 	$$(componentIds.includeYearFormat).getValue().split("-")[1],
			 	$$(componentIds.typeDayFormatDelimiters).getValue(),
			 	$$(componentIds.typeMonthFormatDelimiters).getValue(),
			 	$$(componentIds.typeYearFormatDelimiters).getValue()
			 	);

			 $$(componentIds.datedisPlay).setValue("");;
			 var fullDatetime = moment(new Date()).format(formatDateOrder);
			 var $container = $$(componentIds.datedisPlay).setValue(fullDatetime);
			 
			 
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
					id: componentIds.includeDayFormat,
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
					id: componentIds.includeDayOrder,
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
					id: componentIds.typeDayFormatDelimiters,
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
						id: componentIds.includeMonthFormat,
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
						id: componentIds.includeMonthOrder,
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
					id: componentIds.typeMonthFormatDelimiters,
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
						id: componentIds.includeYearFormat,
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
						id: componentIds.includeYearOrder,
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
					id: componentIds.typeYearFormatDelimiters,
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
		showdateDisplay();
		if (!data.type || !data.setting) return;
		showdateDisplay();
		$$(componentIds.includeDayFormat).setValue("includeDay-" + data.setting.includeDayFormat);
		$$(componentIds.typeDayFormatDelimiters).setValue(data.setting.typeDayFormatDelimiters);
		$$(componentIds.includeMonthFormat).setValue("includeMonth-" + data.setting.includeMonthFormat);
		$$(componentIds.typeMonthFormatDelimiters).setValue(data.setting.typeMonthFormatDelimiters);
		$$(componentIds.includeYearFormat).setValue("includeYear-" +data.setting.includeYearFormat);
		$$(componentIds.typeYearFormatDelimiters).setValue(data.setting.typeYearFormatDelimiters);
		
		$$(componentIds.includeDayOrder).setValue(data.setting.includeDayOrder);
		$$(componentIds.includeMonthOrder).setValue(data.setting.includeMonthOrder);
		$$(componentIds.includeYearOrder).setValue(data.setting.includeYearOrder);
		
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
				includeDayFormat: $$(componentIds.includeDayFormat).getValue().split("-")[1],
				typeDayFormatDelimiters : $$(componentIds.typeDayFormatDelimiters).getValue(),
				includeMonthFormat: $$(componentIds.includeMonthFormat).getValue().split("-")[1],
				typeMonthFormatDelimiters : $$(componentIds.typeMonthFormatDelimiters).getValue(),
				includeYearFormat: $$(componentIds.includeYearFormat).getValue().split("-")[1],
				typeYearFormatDelimiters : $$(componentIds.typeYearFormatDelimiters).getValue(),
				includeDayOrder :  $$(componentIds.includeDayOrder).getValue(),
				includeMonthOrder :  $$(componentIds.includeMonthOrder).getValue(),
				includeYearOrder :  $$(componentIds.includeYearOrder).getValue(),
			}
		};
	};
	
	dateDataField.customDisplay = function (application, object, fieldData, rowData, data, viewId, itemNode, options) {
		console.log("startdisplay");
		if (data == null) {
			console.log("startdisplay : null");
			$(itemNode).find('.ab-date-data-field').html('');
			return true;
		}
		console.log("startdisplay2 : notnull");
		var $container = $(itemNode).find('.ab-date-data-field');
		$container.html('');
		
		//var datadateFormat = "mm/dd/YYYY";
		
		//if(fieldData.setting.dateformat  && fieldData.setting.dateformat != 'none')
		//{
		//	datadateFormat = fieldData.setting.dateformat;
		//}
		
		//setdateformat
		var dateformat = "mm/dd/yyyy";
		if((fieldData.setting.includeDayFormat && fieldData.setting.includeDayFormat != 'none')
			&& (fieldData.setting.includeMonthFormat && fieldData.setting.includeMonthFormat != 'none')
			&& (fieldData.setting.includeYearFormat && fieldData.setting.includeYearFormat != 'none')
			&& (fieldData.setting.typeDayFormatDelimiters && fieldData.setting.typeDayFormatDelimiters != 'none')
			&& (fieldData.setting.typeMonthFormatDelimiters && fieldData.setting.typeMonthFormatDelimiters != 'none')
			&& (fieldData.setting.typeYearFormatDelimiters && fieldData.setting.typeYearFormatDelimiters != 'none')
			)
		{
		    	//dateformat = fieldData.setting.includedayFormat +  getDelimiters(fieldData.setting.typedayformatDelimiters)
			  // 	+ fieldData.setting.includemonthFormat + getDelimiters(fieldData.setting.typemonthformatDelimiters)
			 // 	+ fieldData.setting.includeyearFormat ;
			 
			 dateformat =  setFormatDateTimeOrder(fieldData.setting.includeDayOrder,
			 	fieldData.setting.includeMonthOrder,
			 	fieldData.setting.includeYearOrder,
			 	fieldData.setting.includeDayFormat,
			 	fieldData.setting.includeMonthFormat,
			 	fieldData.setting.includeYearFormat,
			 	fieldData.setting.typeDayFormatDelimiters,
			 	fieldData.setting.typeMonthFormatDelimiters,
			 	fieldData.setting.typeYearFormatDelimiters
			 	);
			 
			 
			}
			

			var dateDiv = null; 
			console.log("startdisplay2 : " + data);
			if ( !data || data == '') {
				dateDiv = "no data";
			} else {
            	// else display the image:

            	var date = new Date(data);
            	var formattedDate = moment(date).format(dateformat);
            	
            	dateDiv = formattedDate;
            }

	        // insert the image to display
        	//$container.html(dateDiv);
        	console.log("startdisplay4 : dateDiv "+dateDiv );
        	$container.html(dateDiv);
        	
        	return true;
        };
        
	/*dateDataField.validate = function (fieldData, value) {
		
		if(orderday == ordermonth){
		   webix.alert({
				title: "testtitle",
				text: "testtitle",
				ok: "testtitle ok"
			});
			return false;
		}
	};*/

	

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
