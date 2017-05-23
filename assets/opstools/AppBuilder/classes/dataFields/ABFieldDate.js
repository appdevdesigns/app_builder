/*
 * ABFieldDate
 *
 * An ABFieldDate defines a date/datetime field type.
 *
 */

import ABField from "./ABField"
import ABFieldComponent from "./ABFieldComponent"


function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}



var ABFieldDateDefaults = {
	key: 'date', // unique key to reference this specific DataField

	icon: 'calendar',   // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'

	// menuName: what gets displayed in the Editor drop list
	menuName: L('ab.dataField.date.menuName', '*Date'),

	// description: what gets displayed in the Editor description.
	description: L('ab.dataField.date.description', '*Pick one from a calendar.')
}

var defaultValues = {
	includeTime: 0,
	defaultCurrentDate: 0,
	defaultDate: "",
	dayFormat: "DD",
	dayOrder: 1,
	dayDelimiter: "slash",
	monthFormat: "MM",
	monthOrder: 2,
	monthDelimiter: "slash",
	yearFormat: "YYYY",
	yearOrder: 3,
	yearDelimiter: "slash",

	validateCondition: "none",
	validateRangeUnit: "days",
	validateRangeBefore: 0,
	validateRangeAfter: 0,
	validateStartDate: null,
	validateEndDate: null
}

var ids = {
	default: 'ab-date-default',
	currentToDefault: 'ab-date-current-to-default',

	dateDisplay: 'ab-date-display',

	dayOrder: 'ab-date-day-order',
	monthOrder: 'ab-date-month-order',
	yearOrder: 'ab-date-year-order',
	dayFormat: 'ab-date-day-format',
	monthFormat: 'ab-date-month-format',
	yearFormat: 'ab-date-year-format',
	dayDelimiter: 'ab-date-day-delimiter',
	monthDelimiter: 'ab-date-month-delimiter',
	yearDelimiter: 'ab-date-year-delimiter',

	// validation
	validateCondition: 'ab-date-validate-condition',
	validateRange: 'ab-date-validate-range',
	validateRangeUnit: 'ab-date-validate-range-unit',
	validateRangeBefore: 'ab-date-validate-range-before',
	validateRangeAfter: 'ab-date-validate-range-after',
	validateRangeBeforeLabel: 'ab-date-validate-before-label',
	validateRangeAfterLabel: 'ab-date-validate-after-label',

	validateLeft: 'ab-date-validate-left',
	validateRight: 'ab-date-validate-right'
};

var delimiterList = [
	{ id: 'comma', value: "Comma", sign: "," },
	{ id: 'slash', value: "Slash", sign: "/" },
	{ id: 'space', value: "Space", sign: " " },
	{ id: 'dash', value: "Dash", sign: "-" }
];


/** Private methods **/
function getDelimiterSign(text) {
	var delimiterItem = delimiterList.filter(function (item) {
		return item.id == text;
	})[0];

	return delimiterItem ? delimiterItem.sign : null;
}

function getDateFormat(setting) {
	var momentFormat = "";

	for (var i = 1; i <= 3; i++) {
		if (setting.dayOrder == i) {
			momentFormat += setting.dayFormat;
			momentFormat += (i != 3) ? setting.dayDelimiter : '';
		}
		if (setting.monthOrder == i) {
			momentFormat += setting.monthFormat;
			momentFormat += (i != 3) ? setting.monthDelimiter : '';
		}
		if (setting.yearOrder == i) {
			momentFormat += setting.yearFormat;
			momentFormat += (i != 3) ? setting.yearDelimiter : '';
		}
	}

	return moment(new Date()).format(momentFormat);
}

function refreshDateDisplay() {
	var dateFormat = getDateFormat({
		dayOrder: $$(ids.dayOrder).getValue(),
		monthOrder: $$(ids.monthOrder).getValue(),
		yearOrder: $$(ids.yearOrder).getValue(),
		dayFormat: $$(ids.dayFormat).getValue(),
		monthFormat: $$(ids.monthFormat).getValue(),
		yearFormat: $$(ids.yearFormat).getValue(),
		dayDelimiter: getDelimiterSign($$(ids.dayDelimiter).getValue()),
		monthDelimiter: getDelimiterSign($$(ids.monthDelimiter).getValue()),
		yearDelimiter: getDelimiterSign($$(ids.yearDelimiter).getValue()),
	});

	$$(ids.dateDisplay).setValue(dateFormat);
}


/**
 * ABFieldDateComponent
 *
 * Defines the UI Component for this Data Field.  The ui component is responsible
 * for displaying the properties editor, populating existing data, retrieving
 * property values, etc.
 */
var ABFieldDateComponent = new ABFieldComponent({
	fieldDefaults: ABFieldDateDefaults,

	elements: (App, field) => {
		ids = field.idsUnique(ids, App);

		return [
			{
				view: "checkbox",
				name: "includeTime",
				labelRight: "Include time",
				labelWidth: 0,
				on: {
					onChange: function (newVal, oldVal) {
						// Re-render default date picker
						webix.ui({
							view: 'datepicker',
							label: "Default",
							id: ids.default,
							timepicker: newVal ? true : false,
							disabled: $$(ids.currentToDefault).getValue() == true
						}, $$(ids.default));
					}
				}
			},
			{
				view: 'checkbox',
				id: ids.currentToDefault,
				name: "defaultCurrentDate",
				labelRight: 'Set current date to default value',
				labelWidth: 0,
				on: {
					onChange: function (newVal, oldVal) {
						if (newVal) {
							$$(ids.default).disable();
						}
						else {
							$$(ids.default).enable();
						}
					}
				}
			},
			{
				view: 'datepicker',
				id: ids.default,
				label: "Default",
				name: 'defaultDate',
				timepicker: false
			},
			{
				cols: [
					{
						view: 'label',
						label: 'Display',
						css: 'ab-text-bold'
					},
					{
						view: 'label',
						id: ids.dateDisplay,
						label: ''
					}
				]
			},

			// Display date format
			{
				view: "accordion",
				multi: false,
				collapsed: true,
				rows: [
					// Day format
					{
						header: "Day",
						body: {
							rows: [
								{
									view: "richselect",
									name: "dayFormat",
									id: ids.dayFormat,
									label: "Format",
									labelWidth: 100,
									value: 'D',
									options: [
										{ id: 'D', value: "1 2 ... 30 31" },
										{ id: 'Do', value: "1st 2nd ... 30th 31st" },
										{ id: 'DD', value: "01 02 ... 30 31" },
										{ id: 'dd', value: "Su Mo ... Fr Sa" },
										{ id: 'ddd', value: "Sun Mon ... Fri Sat" },
										{ id: 'dddd', value: "Sunday Monday ... Friday Saturday" },
									],
									on: {
										'onChange': function (newValue, oldValue) {
											refreshDateDisplay();
										}
									}
								},
								{
									view: "richselect",
									name: "dayOrder",
									id: ids.dayOrder,
									label: "Places",
									labelWidth: 100,
									value: '1',
									options: [
										{ id: 1, value: "1" },
										{ id: 2, value: "2" },
										{ id: 3, value: "3" }
									],
									on: {
										'onChange': function (newValue, oldValue) {
											refreshDateDisplay();
										}
									}
								},
								{
									view: "radio",
									name: "dayDelimiter",
									id: ids.dayDelimiter,
									label: "Delimiter",
									labelWidth: 100,
									vertical: true,
									options: delimiterList,
									value: 'slash',
									on: {
										'onChange': function (newValue, oldValue) {
											refreshDateDisplay();
										}
									}
								}
							]
						}
					},

					// Month format
					{
						header: "Month",
						body: {
							rows: [
								{
									view: "richselect",
									name: "monthFormat",
									id: ids.monthFormat,
									label: "Format",
									labelWidth: 100,
									value: 'MM',
									options: [
										{ id: 'M', value: "1 2 ... 11 12" },
										{ id: 'Mo', value: "1st 2nd ... 11th 12th" },
										{ id: 'MM', value: "01 02 ... 11 12" },
										{ id: 'MMM', value: "Jan Feb ... Nov Dec" },
										{ id: 'MMMM', value: "January February ... November December" }
									],
									on: {
										'onChange': function (newValue, oldValue) {
											refreshDateDisplay();
										}
									}
								},
								{
									view: "richselect",
									name: "monthOrder",
									id: ids.monthOrder,
									label: "Places",
									labelWidth: 100,
									value: '2',
									options: [
										{ id: 1, value: "1" },
										{ id: 2, value: "2" },
										{ id: 3, value: "3" },
									],
									on: {
										'onChange': function (newValue, oldValue) {
											refreshDateDisplay();
										}
									}
								},
								{
									view: "radio",
									name: "monthDelimiter",
									id: ids.monthDelimiter,
									label: "Delimiter",
									labelWidth: 100,
									vertical: true,
									options: delimiterList,
									value: 'slash',
									on: {
										'onChange': function (newValue, oldValue) {
											refreshDateDisplay();
										}
									}
								}
							]
						}
					},

					// Year format
					{
						header: "Year",
						body: {
							rows: [
								{
									view: "richselect",
									name: "yearFormat",
									id: ids.yearFormat,
									label: "Format",
									labelWidth: 100,
									value: 'YYYY',
									options: [
										{ id: 'YY', value: "70 71 ... 29 30" },
										{ id: 'YYYY', value: "1970 1971 ... 2029 2030" },

									],
									on: {
										'onChange': function (newValue, oldValue) {
											refreshDateDisplay();
										}
									}
								},
								{
									view: "richselect",
									name: "yearOrder",
									id: ids.yearOrder,
									label: "Places",
									labelWidth: 100,
									value: '3',
									options: [
										{ id: 1, value: "1" },
										{ id: 2, value: "2" },
										{ id: 3, value: "3" },
									],
									on: {
										'onChange': function (newValue, oldValue) {
											refreshDateDisplay();
										}
									}
								},
								{
									view: "radio",
									name: "yearDelimiter",
									id: ids.yearDelimiter,
									label: "Delimiter",
									labelWidth: 100,
									vertical: true,
									options: delimiterList,
									value: 'slash',
									on: {
										'onChange': function (newValue, oldValue) {
											refreshDateDisplay();
										}
									}
								}
							]
						}
					}

				]
			},

			// Validator
			{
				view: 'label',
				label: "Validation criteria",
				css: 'ab-text-bold'
			},
			{
				id: ids.validateCondition,
				view: "select",
				name: "validateCondition",
				label: "Condition",
				labelWidth: 100,
				value: 'none',
				options: [
					{ id: 'none', value: '[None]' },
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
								$$(ids.validateRange).hide();
								$$(ids.validateLeft).hide();
								$$(ids.validateRight).hide();
								break;
							case 'dateRange':
								$$(ids.validateRange).show();
								$$(ids.validateLeft).hide();
								$$(ids.validateRight).hide();
								break;
							case 'between':
							case 'notBetween':
								$$(ids.validateRange).hide();
								$$(ids.validateLeft).define('label', 'Start Date');
								$$(ids.validateLeft).refresh();
								$$(ids.validateLeft).show();
								$$(ids.validateRight).show();
								break;
							case '=':
							case '<>':
							case '>':
							case '<':
							case '>=':
							case '<=':
								$$(ids.validateRange).hide();
								$$(ids.validateLeft).define('label', 'Date');
								$$(ids.validateLeft).refresh();
								$$(ids.validateLeft).show();
								$$(ids.validateRight).hide();
								break;
						}
					}
				}
			},
			{
				id: ids.validateRange,
				hidden: true,
				rows: [
					{
						id: ids.validateRangeUnit,
						view: "select",
						name: "validateRangeUnit",
						label: 'Unit',
						labelWidth: 100,
						options: [
							{ id: 'days', value: 'Days' },
							{ id: 'months', value: 'Months' },
							{ id: 'years', value: 'Years' }
						],
						on: {
							onChange: function (newVal) {
								$$(ids.validateRangeBeforeLabel).refresh();
								$$(ids.validateRangeAfterLabel).refresh();
							}
						}
					},
					{
						cols: [
							{
								id: ids.validateRangeBeforeLabel,
								view: 'template',
								align: 'left',
								width: 140,
								borderless: true,
								template: function () {
									var beforeLabel = 'Before #number# #unit#'
										.replace('#number#', $$(ids.validateRangeBefore).getValue())
										.replace('#unit#', $$(ids.validateRangeUnit).getValue());

									return beforeLabel;
								}
							},
							{
								view: 'label',
								label: '',
								align: 'center',
								width: 1
							},
							{
								id: ids.validateRangeAfterLabel,
								view: 'template',
								align: 'right',
								borderless: true,
								template: function () {
									var afterLabel = 'After #number# #unit#'
										.replace('#number#', $$(ids.validateRangeAfter).getValue())
										.replace('#unit#', $$(ids.validateRangeUnit).getValue());

									return afterLabel;
								}
							}
						]
					},
					{
						cols: [
							{
								id: ids.validateRangeBefore,
								view: 'slider',
								name: "validateRangeBefore",
								on: {
									onChange: function (newVal, oldValue) {
										$$(ids.validateRangeBeforeLabel).refresh();
									}
								}
							},
							{
								id: ids.validateRangeAfter,
								view: 'slider',
								name: "validateRangeAfter",
								on: {
									onChange: function (newVal, oldValue) {
										$$(ids.validateRangeAfterLabel).refresh();
									}
								}
							}
						]
					}
				]
			},
			{
				id: ids.validateLeft,
				name: "validateStartDate",
				view: 'datepicker',
				label: 'Start Date',
				labelWidth: 100,
				hidden: true
			},
			{
				id: ids.validateRight,
				name: "validateEndDate",
				view: 'datepicker',
				label: 'End Date',
				labelWidth: 100,
				hidden: true
			}


		]
	},

	// defaultValues: the keys must match a .name of your elements to set it's default value.
	defaultValues: defaultValues,

	// rules: basic form validation rules for webix form entry.
	// the keys must match a .name of your .elements for it to apply
	rules: {},

	// include additional behavior on default component operations here:
	// The base routines will be processed first, then these.  Any results
	// from the base routine, will be passed on to these:
	logic: {

		isValid: function (ids, isValid) {

		}

		// populate: function (ids, values) {
		// 	if (values.settings.validation) {
		// 		$$(ids.validateMinimum).enable();
		// 		$$(ids.validateMaximum).enable();
		// 	} else {
		// 		$$(ids.validateMinimum).disable();
		// 		$$(ids.validateMaximum).disable();
		// 	}
		// }

	},

	// perform any additional setup actions here.
	// @param {obj} ids  the hash of id values for all the current form elements.
	//					 it should have your elements + the default Header elements:
	//						.label, .columnName, .fieldDescription, .showIcon
	init: function (ids) {
		refreshDateDisplay();
	}


});


class ABFieldDate extends ABField {
	constructor(values, object) {
		super(values, object, ABFieldDateDefaults);

		// we're responsible for setting up our specific settings:
		for (var dv in defaultValues) {
			this.settings[dv] = values.settings[dv] || defaultValues[dv];
		}

		// text to Int:
		this.settings.includeTime = parseInt(this.settings.includeTime);
		this.settings.defaultCurrentDate = parseInt(this.settings.defaultCurrentDate);
		this.settings.dayOrder = parseInt(this.settings.dayOrder);
		this.settings.monthOrder = parseInt(this.settings.monthOrder);
		this.settings.yearOrder = parseInt(this.settings.yearOrder);


	}

	// return the default values for this DataField
	static defaults() {
		return ABFieldDateDefaults;
	}

	/*
	* @function propertiesComponent
	*
	* return a UI Component that contains the property definitions for this Field.
	*
	* @param {App} App the UI App instance passed around the Components.
	* @return {Component}
	*/
	static propertiesComponent(App) {
		return ABFieldDateComponent.component(App);
	}

	///
	/// Instance Methods
	///


	isValid() {

		var errors = super.isValid();

		// errors = OP.Form.validationError({
		// 	name:'columnName',
		// 	message:L('ab.validation.object.name.unique', 'Field columnName must be unique (#name# already used in this Application)').replace('#name#', this.name),
		// }, errors);

		return errors;
	}


	/**
	 * @method toObj()
	 *
	 * properly compile the current state of this ABApplication instance
	 * into the values needed for saving to the DB.
	 *
	 * Most of the instance data is stored in .json field, so be sure to
	 * update that from all the current values of our child fields.
	 *
	 * @return {json}
	 */
	// toObj () {

	// 	var obj = super.toObj();

	// 	// obj.settings = this.settings;  // <--  super.toObj()

	// 	return obj;
	// }




	///
	/// Working with Actual Object Values:
	///

	// return the grid column header definition for this instance of ABFieldDate
	columnHeader(isObjectWorkspace) {
		var config = super.columnHeader(isObjectWorkspace);

		config.editor = 'text';
		config.sort = 'string'

		return config;
	}

}


export default ABFieldDate;