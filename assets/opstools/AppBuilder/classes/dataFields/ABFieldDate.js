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
	description: ''
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

	elements: function (App) {
		return [
			{
				view: "label",
				label: "Pick one from a calendar."
			},
			{
				view: "checkbox",
				name: "includeTime",
				labelRight: "Include time",
				labelWidth: 0,
				on: {
					onChange: function (newVal, oldVal) {
						// TODO : Re-render default date picker
						// webix.ui({
						// 	view: 'datepicker',
						// 	label: "Default",
						// 	id: componentIds.default,
						// 	timepicker: newVal ? true : false,
						// 	disabled: $$(componentIds.currentToDefault).getValue() == true
						// }, $$(componentIds.default));
					}
				}
			},
			{
				view: 'checkbox',
				name: "defaultCurrentDate",
				labelRight: 'Set current date to default value',
				labelWidth: 0,
				on: {
					onChange: function (newVal, oldVal) {
						// if (newVal) {
						// 	$$(componentIds.default).disable();
						// }
						// else {
						// 	$$(componentIds.default).enable();
						// }
					}
				}
			},
			{
				view: 'datepicker',
				label: "Default",
				name: 'defaultDate',
				timepicker: false // TODO
			},
			{
				view: "label",
				label: "Date format options"
			},
			{
				view: "text",
				name: "dateDisplay",
				label: "Date Display",
				labelWidth: "100",
				// id: componentIds.dateDisplay,
				disabled: true,
				//value : showdateDisplay(),
				placeholder: "date-display"
			},
			{
				cols: [
					{
						view: "richselect",
						name: "dayFormat",
						// id: componentIds.includeDayFormat,
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
								// showDateDisplay();
							}
						}

					},
					{
						view: "richselect",
						name: "dayOrder",
						// id: componentIds.includeDayOrder,
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
								// showDateDisplay();
							}
						}
					}
				]

			},
			{
				view: "radio",
				name: "dayDelimiter",
				// id: componentIds.typeDayFormatDelimiters,
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
						// showDateDisplay();
					}
				}
			},
			{
				cols: [
					{
						view: "richselect",
						name: "monthFormat",
						// id: componentIds.includeMonthFormat,
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
								// showDateDisplay();
							}
						}
					},
					{
						view: "richselect",
						name: "monthOrder",
						// id: componentIds.includeMonthOrder,
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
								// showDateDisplay();
							}
						}
					}
				]
			},
			{
				view: "radio",
				name: "monthDelimiter",
				// id: componentIds.typeMonthFormatDelimiters,
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
						// showDateDisplay();
					}
				}
			},
			{
				cols: [
					{
						view: "richselect",
						name: "yearDelimiter",
						// id: componentIds.includeYearFormat,
						label: "Year",
						value: 'includeYear-YYYY',
						options: [
							{ id: 'includeYear-YY', value: "70 71 ... 29 30" },
							{ id: 'includeYear-YYYY', value: "1970 1971 ... 2029 2030" },

						],
						on: {
							'onChange': function (newValue, oldValue) {
								// showDateDisplay();
							}
						}
					},
					{
						view: "richselect",
						name: "yearOrder",
						// id: componentIds.includeYearOrder,
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
								// showDateDisplay();
							}
						}
					}
				]

			},
			{
				view: "radio",
				name: "yearDelimiter",
				// id: componentIds.typeYearFormatDelimiters,
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
						// showDateDisplay();
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
				// id: componentIds.validateCondition,
				view: "select",
				name: "validateCondition",
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
						// switch (newVal) {
						// 	case 'none':
						// 		$$(componentIds.validateRange).hide();
						// 		$$(componentIds.validateLeft).hide();
						// 		$$(componentIds.validateRight).hide();
						// 		break;
						// 	case 'dateRange':
						// 		$$(componentIds.validateRange).show();
						// 		$$(componentIds.validateLeft).hide();
						// 		$$(componentIds.validateRight).hide();
						// 		break;
						// 	case 'between':
						// 	case 'notBetween':
						// 		$$(componentIds.validateRange).hide();
						// 		$$(componentIds.validateLeft).define('label', 'Start Date');
						// 		$$(componentIds.validateLeft).refresh();
						// 		$$(componentIds.validateLeft).show();
						// 		$$(componentIds.validateRight).show();
						// 		break;
						// 	case '=':
						// 	case '<>':
						// 	case '>':
						// 	case '<':
						// 	case '>=':
						// 	case '<=':
						// 		$$(componentIds.validateRange).hide();
						// 		$$(componentIds.validateLeft).define('label', 'Date');
						// 		$$(componentIds.validateLeft).refresh();
						// 		$$(componentIds.validateLeft).show();
						// 		$$(componentIds.validateRight).hide();
						// 		break;
						// }
					}
				}
			},
			{
				// id: componentIds.validateRange,
				rows: [
					{
						// id: componentIds.validateRangeUnit,
						view: "select",
						name: "validateRangeUnit",
						label: 'Unit',
						options: [
							{ id: 'days', value: 'Days' },
							{ id: 'months', value: 'Months' },
							{ id: 'years', value: 'Years' }
						],
						on: {
							onChange: function (newVal) {
								// $$(componentIds.validateRangeBeforeLabel).refresh();
								// $$(componentIds.validateRangeAfterLabel).refresh();
							}
						}
					},
					{
						cols: [
							{
								// id: componentIds.validateRangeBeforeLabel,
								view: 'template',
								align: 'left',
								width: 125,
								borderless: true,
								// template: function () {
								// 	var beforeLabel = 'Before #number# #unit#'
								// 		.replace('#number#', $$(componentIds.validateRangeBefore).getValue())
								// 		.replace('#unit#', $$(componentIds.validateRangeUnit).getValue());

								// 	return beforeLabel;
								// }
							},
							{
								view: 'label',
								label: '[Current date]',
								align: 'center'
							},
							{
								// id: componentIds.validateRangeAfterLabel,
								view: 'template',
								align: 'right',
								borderless: true,
								// template: function () {
								// 	var afterLabel = 'After #number# #unit#'
								// 		.replace('#number#', $$(componentIds.validateRangeAfter).getValue())
								// 		.replace('#unit#', $$(componentIds.validateRangeUnit).getValue());

								// 	return afterLabel;
								// }
							}
						]
					},
					{
						cols: [
							{
								// id: componentIds.validateRangeBefore,
								view: 'slider',
								name: "validateRangeBefore",
								on: {
									onChange: function (newVal, oldValue) {
										// $$(componentIds.validateRangeBeforeLabel).refresh();
									}
								}
							},
							{
								// id: componentIds.validateRangeAfter,
								view: 'slider',
								name: "validateRangeAfter",
								on: {
									onChange: function (newVal, oldValue) {
										// $$(componentIds.validateRangeAfterLabel).refresh();
									}
								}
							}
						]
					}
				]
			},
			{
				// id: componentIds.validateLeft,
				name: "validateStartDate",
				view: 'datepicker',
				label: 'Start Date',
			},
			{
				// id: componentIds.validateRight,
				name: "validateEndDate",
				view: 'datepicker',
				label: 'End Date'
			}

		]
	},

});


class ABFieldDate extends ABField {
	constructor(values, object) {
		super(values, object, ABFieldDateDefaults);

		/*
		{
			settings: {
				textDefault: 'string',
				supportMultilingual: true/false
			}
		}
		*/

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