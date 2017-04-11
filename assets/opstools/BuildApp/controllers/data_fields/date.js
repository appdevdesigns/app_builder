steal(function () {
	var componentIds = {
		editView: 'ab-new-date',
		includeTime: 'ab-new-date-include-time',
		currentToDefault: 'ab-new-current-date-default',
		default: 'ab-new-date-default',
		dateDisplay: 'ab-new-date-date-display',

		includeDayFormat: 'ab-new-date-includedayFormat',
		includeMonthFormat: 'ab-new-date-includemonthFormat',
		includeYearFormat: 'ab-new-date-includeyearFormat',

		typeDayFormatDelimiters: 'ab-new-date-typedayformatDatetime',
		typeMonthFormatDelimiters: 'ab-new-date-typemonthdayformatDatetime',
		typeYearFormatDelimiters: 'ab-new-date-typeyearformatDatetime',

		includeDayOrder: 'ab-new-date-includedayOrder',
		includeMonthOrder: 'ab-new-date-includemonthOrder',
		includeYearOrder: 'ab-new-date-includeyearOrder',

		validateCondition: 'ab-new-date-validate-condition',
		validateRange: 'ab-new-date-validate-range', 
		validateLeft: 'ab-new-date-left-comparer',
		validateRight: 'ab-new-date-right-comparer',

		validateRangeUnit: 'ab-new-date-range-unit',
		validateRangeBeforeLabel: 'ab-new-date-range-before-label',
		validateRangeBefore: 'ab-new-date-range-before',
		validateRangeAfterLabel: 'ab-new-date-range-after-label',
		validateRangeAfter: 'ab-new-date-range-after'

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

	function getDelimiters(d) {
		switch (d) {
			case 'comma':
				return ",";
			case 'slash':
				return "/";
			case 'space':
				return " ";
			case 'dash':
				return "-";
		}
	}

	function setFormatDateTimeOrder(orderDay, orderMonth, orderYear, includeDayFormat, includeMonthFormat, includeYearFormat,
		typeDayFormatDelimiters, typeMonthFormatDelimiters, typeYearFormatDelimiters) {

		var orderFormatDate = [];

		//check orderDay
		if (orderDay == 1) {
			orderFormatDate[0] = includeDayFormat + getDelimiters(typeDayFormatDelimiters);
		}
		else if (orderDay == 2) {
			orderFormatDate[1] = includeDayFormat + getDelimiters(typeDayFormatDelimiters);
		}
		else if (orderDay == 3) {
			orderFormatDate[2] = includeDayFormat;
		}

		//check orderMonth
		if (orderMonth == 1) {
			orderFormatDate[0] = includeMonthFormat + getDelimiters(typeMonthFormatDelimiters);
		}
		else if (orderMonth == 2) {
			orderFormatDate[1] = includeMonthFormat + getDelimiters(typeMonthFormatDelimiters);
		}
		else if (orderMonth == 3) {
			orderFormatDate[2] = includeMonthFormat;
		}

		//check OrderYear
		if (orderYear == 1) {
			orderFormatDate[0] = includeYearFormat + getDelimiters(typeYearFormatDelimiters);
		}
		else if (orderYear == 2) {
			orderFormatDate[1] = includeYearFormat + getDelimiters(typeYearFormatDelimiters);
		}
		else if (orderYear == 3) {
			orderFormatDate[2] = includeYearFormat;
		}

		return orderFormatDate[0] + orderFormatDate[1] + orderFormatDate[2];


	}

	function showDateDisplay() {
		if (($$(componentIds.includeDayFormat).getValue().split("-")[1] && $$(componentIds.includeDayFormat).getValue().split("-")[1] != 'none')
			&& ($$(componentIds.includeMonthFormat).getValue().split("-")[1] && $$(componentIds.includeMonthFormat).getValue().split("-")[1] != 'none')
			&& ($$(componentIds.includeYearFormat).getValue().split("-")[1] && $$(componentIds.includeYearFormat).getValue().split("-")[1] != 'none')
			&& ($$(componentIds.typeDayFormatDelimiters).getValue() && $$(componentIds.typeDayFormatDelimiters).getValue() != 'none')
			&& ($$(componentIds.typeMonthFormatDelimiters).getValue() && $$(componentIds.typeMonthFormatDelimiters).getValue() != 'none')
			&& ($$(componentIds.typeYearFormatDelimiters).getValue() && $$(componentIds.typeYearFormatDelimiters).getValue() != 'none')
		) {
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

			$$(componentIds.dateDisplay).setValue("");;
			var fullDatetime = moment(new Date()).format(formatDateOrder);
			var $container = $$(componentIds.dateDisplay).setValue(fullDatetime);

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
				labelWidth: 0,
				on: {
					onChange: function (newVal, oldVal) {
						// Re-render default date picker
						webix.ui({
							view: 'datepicker',
							label: "Default",
							id: componentIds.default,
							timepicker: newVal ? true : false,
							disabled: $$(componentIds.currentToDefault).getValue() == true
						}, $$(componentIds.default));
					}
				}
			},
			{
				view: 'checkbox',
				id: componentIds.currentToDefault,
				labelRight: 'Set current date to default value',
				labelWidth: 0,
				on: {
					onChange: function (newVal, oldVal) {
						if (newVal) {
							$$(componentIds.default).disable();
						}
						else {
							$$(componentIds.default).enable();
						}
					}
				}
			},
			{
				view: 'datepicker',
				label: "Default",
				id: componentIds.default,
				timepicker: false
			},
			{
				view: "label",
				label: "Date format options"
			},
			{
				view: "text",
				label: "Date Display",
				labelWidth: "100",
				id: componentIds.dateDisplay,
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
								showDateDisplay();
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
								showDateDisplay();
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
						showDateDisplay();
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
								showDateDisplay();
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
								showDateDisplay();
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
						showDateDisplay();
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
								showDateDisplay();
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
								showDateDisplay();
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
						showDateDisplay();
					}
				}
			},

			// Validator
			{
				view: 'label',
				label: 'Validation criteria',
				css: 'ab-text-bold'
			},
			{
				id: componentIds.validateCondition,
				view: "select",
				label: "Condition",
				value: 'none',
				options: [
					{ id: 'none', value: '[Condition]' },
					{ id: 'dateRange', value: 'Range' },
					{ id: 'between', value: 'Between' },
					{ id: 'notBetween', value: 'Not between' },
					{ id: '=', value: 'Equal to' },
					{ id: '<>', value: 'Not equal to' },
					{ id: '>', value: 'Greater than' },
					{ id: '<', value: 'Less than' },
					{ id: '>=', value: 'Greater than or Equal to' },
					{ id: '<=', value: 'Less than or Equal to' }
				],
				on: {
					onChange: function (newVal, oldVal) {
						switch (newVal) {
							case 'none':
								$$(componentIds.validateRange).hide();
								$$(componentIds.validateLeft).hide();
								$$(componentIds.validateRight).hide();
								break;
							case 'dateRange':
								$$(componentIds.validateRange).show();
								$$(componentIds.validateLeft).hide();
								$$(componentIds.validateRight).hide();
								break;
							case 'between':
							case 'notBetween':
								$$(componentIds.validateRange).hide();
								$$(componentIds.validateLeft).define('label', 'Start Date');
								$$(componentIds.validateLeft).refresh();
								$$(componentIds.validateLeft).show();
								$$(componentIds.validateRight).show();
								break;
							case '=':
							case '<>':
							case '>':
							case '<':
							case '>=':
							case '<=':
								$$(componentIds.validateRange).hide();
								$$(componentIds.validateLeft).define('label', 'Date');
								$$(componentIds.validateLeft).refresh();
								$$(componentIds.validateLeft).show();
								$$(componentIds.validateRight).hide();
								break;
						}
					}
				}
			},
			{
				id: componentIds.validateRange,
				rows: [
					{
						id: componentIds.validateRangeUnit,
						view: "select",
						label: 'Unit',
						options: [
							{ id: 'days', value: 'Days' },
							{ id: 'months', value: 'Months' },
							{ id: 'years', value: 'Years' }
						],
						on: {
							onChange: function(newVal) {
								$$(componentIds.validateRangeBeforeLabel).refresh();
								$$(componentIds.validateRangeAfterLabel).refresh();
							}
						}
					},
					{
						cols: [
							{
								id: componentIds.validateRangeBeforeLabel,
								view: 'template',
								align: 'left',
								width: 125,
								borderless: true,
								template: function() {
									var beforeLabel = 'Before #number# #unit#'
										.replace('#number#', $$(componentIds.validateRangeBefore).getValue())
										.replace('#unit#', $$(componentIds.validateRangeUnit).getValue());

									return beforeLabel;
								}
							},
							{
								view: 'label',
								label: '[Current date]',
								align: 'center'
							},
							{
								id: componentIds.validateRangeAfterLabel,
								view: 'template',
								align: 'right',
								borderless: true,
								template: function() {
									var afterLabel = 'After #number# #unit#'
											.replace('#number#', $$(componentIds.validateRangeAfter).getValue())
											.replace('#unit#', $$(componentIds.validateRangeUnit).getValue());

									return afterLabel;
								}
							}
						]
					},
					{
						cols: [
							{
								id: componentIds.validateRangeBefore,
								view: 'slider',
								on: {
									onChange: function (newVal, oldValue) {
										$$(componentIds.validateRangeBeforeLabel).refresh();
									}
								}
							},
							{
								id: componentIds.validateRangeAfter,
								view: 'slider',
								on: {
									onChange: function (newVal, oldValue) {
										$$(componentIds.validateRangeAfterLabel).refresh();
									}
								}
							}
						]
					}
				]
			},
			{
				id: componentIds.validateLeft,
				view: 'datepicker',
				label: 'Start Date',
			},
			{
				id: componentIds.validateRight,
				view: 'datepicker',
				label: 'End Date'
			}

		]
	};

	// Populate settings (when Edit field)
	dateDataField.populateSettings = function (application, data) {

		if (!data.type || !data.setting) return;
		showDateDisplay();

		$$(componentIds.includeDayFormat).setValue("includeDay-" + data.setting.includeDayFormat);
		$$(componentIds.typeDayFormatDelimiters).setValue(data.setting.typeDayFormatDelimiters);
		$$(componentIds.includeMonthFormat).setValue("includeMonth-" + data.setting.includeMonthFormat);
		$$(componentIds.typeMonthFormatDelimiters).setValue(data.setting.typeMonthFormatDelimiters);
		$$(componentIds.includeYearFormat).setValue("includeYear-" + data.setting.includeYearFormat);
		$$(componentIds.typeYearFormatDelimiters).setValue(data.setting.typeYearFormatDelimiters);

		$$(componentIds.includeDayOrder).setValue(data.setting.includeDayOrder);
		$$(componentIds.includeMonthOrder).setValue(data.setting.includeMonthOrder);
		$$(componentIds.includeYearOrder).setValue(data.setting.includeYearOrder);

		$$(componentIds.includeTime).setValue(data.type == 'datetime');
		$$(componentIds.includeTime).disable();

		$$(componentIds.currentToDefault).setValue(data.setting.currentDateDefault);

		if (data.setting && data.setting.default) {
			$$(componentIds.default).setValue(new Date(data.setting.default));
		}

		$$(componentIds.validateCondition).setValue(data.setting.validateCondition);

		$$(componentIds.validateRangeUnit).setValue(data.setting.validateRangeUnit);
		if (data.setting && data.setting.validateRangeBefore)
			$$(componentIds.validateRangeBefore).setValue(parseInt(data.setting.validateRangeBefore));
		if (data.setting && data.setting.validateRangeAfter)
			$$(componentIds.validateRangeAfter).setValue(parseInt(data.setting.validateRangeAfter));

		if (data.setting && data.setting.validateLeft)
			$$(componentIds.validateLeft).setValue(new Date(data.setting.validateLeft));

		if (data.setting && data.setting.validateRight)
			$$(componentIds.validateRight).setValue(new Date(data.setting.validateRight));
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
				template: '<div class="ab-date-data-field"></div>',
				includeDayFormat: $$(componentIds.includeDayFormat).getValue().split("-")[1],
				currentDateDefault: $$(componentIds.currentToDefault).getValue(),
				default: $$(componentIds.default).getValue() ? $$(componentIds.default).getValue().toString() : null,
				typeDayFormatDelimiters: $$(componentIds.typeDayFormatDelimiters).getValue(),
				includeMonthFormat: $$(componentIds.includeMonthFormat).getValue().split("-")[1],
				typeMonthFormatDelimiters: $$(componentIds.typeMonthFormatDelimiters).getValue(),
				includeYearFormat: $$(componentIds.includeYearFormat).getValue().split("-")[1],
				typeYearFormatDelimiters: $$(componentIds.typeYearFormatDelimiters).getValue(),
				includeDayOrder: $$(componentIds.includeDayOrder).getValue(),
				includeMonthOrder: $$(componentIds.includeMonthOrder).getValue(),
				includeYearOrder: $$(componentIds.includeYearOrder).getValue(),

				validateCondition: $$(componentIds.validateCondition).getValue(),

				validateRangeUnit: $$(componentIds.validateRangeUnit).getValue(),
				validateRangeBefore: $$(componentIds.validateRangeBefore).getValue(),
				validateRangeAfter: $$(componentIds.validateRangeAfter).getValue(),

				validateLeft: $$(componentIds.validateLeft).getValue(),
				validateRight: $$(componentIds.validateRight).getValue()
			}
		};
	};

	dateDataField.customDisplay = function (application, object, fieldData, rowData, data, viewId, itemNode, options) {
		if (data == null) {
			$(itemNode).find('.ab-date-data-field').html('');
			return true;
		}

		var $container = $(itemNode).find('.ab-date-data-field');
		$container.html('');

		if (!validateDateRange(fieldData, data, true))
			$container.parent('.webix_cell').addClass('ab-cell-warn');
		else
			$container.parent('.webix_cell').removeClass('ab-cell-warn');

		//var datadateFormat = "mm/dd/YYYY";

		//if(fieldData.setting.dateformat  && fieldData.setting.dateformat != 'none')
		//{
		//	datadateFormat = fieldData.setting.dateformat;
		//}

		//setdateformat
		var dateformat = "mm/dd/yyyy";
		if ((fieldData.setting.includeDayFormat && fieldData.setting.includeDayFormat != 'none')
			&& (fieldData.setting.includeMonthFormat && fieldData.setting.includeMonthFormat != 'none')
			&& (fieldData.setting.includeYearFormat && fieldData.setting.includeYearFormat != 'none')
			&& (fieldData.setting.typeDayFormatDelimiters && fieldData.setting.typeDayFormatDelimiters != 'none')
			&& (fieldData.setting.typeMonthFormatDelimiters && fieldData.setting.typeMonthFormatDelimiters != 'none')
			&& (fieldData.setting.typeYearFormatDelimiters && fieldData.setting.typeYearFormatDelimiters != 'none')
		) {
			//dateformat = fieldData.setting.includedayFormat +  getDelimiters(fieldData.setting.typedayformatDelimiters)
			// 	+ fieldData.setting.includemonthFormat + getDelimiters(fieldData.setting.typemonthformatDelimiters)
			// 	+ fieldData.setting.includeyearFormat ;

			dateformat = setFormatDateTimeOrder(fieldData.setting.includeDayOrder,
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
		if (!data || data == '') {
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

	// When webix datePicker is invalid in datatable,then datepicker is not show up again.
	// http://webix.com/snippet/5008adcc
	// dateDataField.validate = function(fieldData, value) {
	function validateDateRange(fieldData, value) {
		var dateValue = (value instanceof Date) ? value : new Date(value); 
		var startDate = fieldData.setting.validateLeft ? new Date(fieldData.setting.validateLeft) : null;
		var endDate = fieldData.setting.validateRight ? new Date(fieldData.setting.validateRight) : null;

		if (fieldData.setting && fieldData.setting.validateCondition) {
			switch (fieldData.setting.validateCondition) {
				case 'dateRange':
					var minDate = moment().subtract(fieldData.setting.validateRangeBefore, fieldData.setting.validateRangeUnit).toDate();
					var maxDate = moment().add(fieldData.setting.validateRangeAfter, fieldData.setting.validateRangeUnit).toDate();

					if (minDate < dateValue && dateValue < maxDate)
						return true;
					else
						return false;
				case 'between':
				case 'notBetween':
					if (fieldData.setting.validateCondition == 'between' && startDate < dateValue && dateValue < endDate)
						return true;
					else if (fieldData.setting.validateCondition == 'notBetween' && dateValue < startDate && endDate < dateValue)
						return true;
					else
						return false;
				case '=':
					return dateValue == startDate;
				case '<>':
					return dateValue != startDate;
				case '>':
					return dateValue > startDate;
				case '<':
					return dateValue < startDate;
				case '>=':
					return dateValue >= startDate;
				case '<=':
					return dateValue <= startDate;
			}
		}

		return true;

		// if(orderday == ordermonth){
		//    webix.alert({
		// 		title: "testtitle",
		// 		text: "testtitle",
		// 		ok: "testtitle ok"
		// 	});
		// 	return false;
		// }
	};



	dateDataField.resetState = function () {
		$$(componentIds.includeTime).setValue(false);
		$$(componentIds.includeTime).enable();

		$$(componentIds.currentToDefault).setValue(false);

		$$(componentIds.validateCondition).setValue('none');
		$$(componentIds.validateRange).hide();
		$$(componentIds.validateLeft).hide();
		$$(componentIds.validateRight).hide();
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
