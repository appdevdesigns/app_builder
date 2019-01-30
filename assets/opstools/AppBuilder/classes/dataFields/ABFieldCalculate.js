/*
 * ABFieldCalculate
 *
 * An ABFieldCalculate defines a calculate field type.
 *
 */

import ABField from "./ABField"
import ABFieldComponent from "./ABFieldComponent"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

/**
 * @method convertToJs
 * 
 * @param {ABOBject} object 
 * @param {string} formula 
 * @param {object} rowData 
 * @param {integer} place
 */
function convertToJs(object, formula, rowData, place) {

	if (!formula) return "";

	// replace with current date
	formula = formula.replace(/\(CURRENT\)/g, "(new Date())");

	object.fields().forEach(f => {

		var colName = f.columnName;
		if (colName.indexOf('.') > -1) // QUERY: get only column name
			colName = colName.split('.')[1];

		// if template does not contain, then should skip
		if (formula.indexOf('{' + colName + '}') < 0)
			return;

		// number fields
		if (f.key == 'number') {
			let numberVal = "(#numberVal#)".replace("#numberVal#", rowData[f.columnName] || 0); // (number) - NOTE : (-5) to support negative number
			formula = formula.replace(new RegExp('{' + colName + '}', 'g'), numberVal);
		}
		// calculate and formula fields
		else if (f.key == 'calculate' || f.key == "formula") {
			let calVal = "(#calVal#)".replace("#calVal#", f.format(rowData) || 0);
			formula = formula.replace(new RegExp('{' + colName + '}', 'g'), calVal);
		}
		// date fields
		else if (f.key == 'date') {
			let dateVal = '"#dataVal#"'.replace("#dataVal#", rowData[f.columnName] ? rowData[f.columnName] : ""); // "date"
			formula = formula.replace(new RegExp('{' + colName + '}', 'g'), dateVal);
		}

	});

	// decimal places - toFixed()
	// FIX: floating number calculation 
	// https://randomascii.wordpress.com/2012/02/25/comparing-floating-point-numbers-2012-edition/
	return eval(formula).toFixed(place || 0);
}

function AGE(dateString) {

	// validate
	if (!dateString) return 0
	var dataDate = new Date(dateString);
	if (!dataDate) return 0

	var today = new Date();
	var oneYear = 31536000000; // (24 * 60 * 60 * 1000) * 365;
	var diffYears = (today - dataDate) / oneYear;

	if (diffYears < 1)
		return Math.round(diffYears * 10) / 10; // float 2 digits
	else
		return Math.floor(diffYears); // no float digit

	// var today = new Date();
	// var age = today.getFullYear() - dataDate.getFullYear();
	// if (age < 1) {
	// 	var m = today.getMonth() - dataDate.getMonth();

	// 	age = parseFloat("0." + m);

	// 	// if (m < 0 || (m === 0 && today.getDate() < dataDate.getDate())) {
	// 	// 	age--;
	// 	// }
	// }
	// return age;
}

function YEAR(dateString) {

	// validate
	if (!dateString) return 0
	var dataDate = new Date(dateString);
	if (!dataDate) return 0

	return dataDate.getFullYear();
}

function MONTH(dateString) {

	// validate
	if (!dateString) return 0
	var dataDate = new Date(dateString);
	if (!dataDate) return 0

	return dataDate.getMonth();
}

function DATE(dateString) {

	// validate
	if (!dateString) return 0
	var dataDate = new Date(dateString);
	if (!dataDate) return 0

	return dataDate.getDate();
}

var ABFieldCalculateDefaults = {
	key: 'calculate',	// unique key to reference this specific DataField

	icon: 'calculator',	// font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'

	// menuName: what gets displayed in the Editor drop list
	menuName: L('ab.dataField.calculate.menuName', '*Calculate'),

	// description: what gets displayed in the Editor description.
	description: L('ab.dataField.calculate.description', '*'),

	isSortable: false,
	isFilterable: false,  // this field does not support filter on server side

};

var delimiterList = [
	{ id: 'none', value: L('ab.dataField.number.none', "*None") },
	{ id: 'comma', value: L('ab.dataField.number.comma', "*Comma"), sign: ',' },
	{ id: 'period', value: L('ab.dataField.number.period', "*Period"), sign: '.' },
	{ id: 'space', value: L('ab.dataField.number.space', "*Space"), sign: ' ' }
];

var defaultValues = {
	formula: "",
	decimalSign: "none", // "none", "comma", "period", "space"
	decimalPlaces: "none", // "none", 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
};

var ids = {

	formula: 'ab-field-calculate-field-formula',

	fieldPopup: 'ab-field-calculate-field-popup',
	fieldList: 'ab-field-calculate-field-list',

	numberOperatorPopup: 'ab-field-calculate-number-popup',

	dateOperatorPopup: 'ab-field-calculate-date-popup',
	dateFieldList: 'ab-field-calculate-date-list',

	decimalPlaces: 'ab-field-calculate-decimal-places'

};

/**
 * ABFieldCalculateComponent
 *
 * Defines the UI Component for this Data Field.  The ui component is responsible
 * for displaying the properties editor, populating existing data, retrieving
 * property values, etc.
 */
var ABFieldCalculateComponent = new ABFieldComponent({
	fieldDefaults: ABFieldCalculateDefaults,

	elements: (App, field) => {
		ids = field.idsUnique(ids, App);

		// field popup
		webix.ui({
			id: ids.fieldPopup,
			view: 'popup',
			hidden: true,
			width: 200,
			body: {
				id: ids.fieldList,
				view: 'list',
				data: [],
				template: field.logic.itemTemplate,
				on: {
					onItemClick: function (id, e, node) {

						var component = this.getItem(id),
							message = '{' + component.columnName + '}';

						field.logic.insertEquation(message);

						$$(ids.fieldPopup).hide();
					}
				}
			},
			on: {
				onBeforeShow: function () {

					// refresh field list
					$$(ids.fieldList).clearAll();
					$$(ids.fieldList).parse(field.logic.getNumberFields());

				}
			}

		});

		webix.ui({
			id: ids.numberOperatorPopup,
			view: 'popup',
			hidden: true,
			width: 200,
			body: {
				view: 'list',
				template: field.logic.itemTemplate,
				data: [
					{ label: L("ab.dataField.calculate.add", "+ Adds"), symbol: '+' },
					{ label: L("ab.dataField.calculate.subtract", "- Subtracts"), symbol: '-' },
					{ label: L("ab.dataField.calculate.multiple", "* Multiples"), symbol: '*' },
					{ label: L("ab.dataField.calculate.divide", "/ Divides"), symbol: '/' },
					{ label: L("ab.dataField.calculate.openBracket", "( Open Bracket"), symbol: '(' },
					{ label: L("ab.dataField.calculate.closedBracket", ") Closed Bracket"), symbol: ')' }
				],
				on: {
					onItemClick: function (id, e, node) {

						var component = this.getItem(id);

						field.logic.insertEquation(component.symbol);

						$$(ids.numberOperatorPopup).hide();
					}
				}
			}
		});

		webix.ui({
			id: ids.dateOperatorPopup,
			view: 'popup',
			hidden: true,
			width: 280,
			data: [],
			body: {
				id: ids.dateFieldList,
				view: 'list',
				template: field.logic.itemTemplate,
				data: [],
				on: {
					onItemClick: function (id, e, node) {

						var component = this.getItem(id);

						field.logic.insertEquation(component.function);

						$$(ids.dateOperatorPopup).hide();
					}
				}
			},
			on: {
				onBeforeShow: function () {

					// refresh field list
					$$(ids.dateFieldList).clearAll();
					$$(ids.dateFieldList).parse(field.logic.getDateFields());

				}
			}
		})

		return [
			{
				id: ids.formula,
				name: "formula",
				view: "textarea",
				label: L("ab.dataField.calculate.equation", "*Equation"),
				labelPosition: "top",
				height: 150
			},
			{
				rows: [
					{
						cols: [
							{
								view: 'button',
								type: "icon",
								icon: "fa fa-hashtag",
								label: L("ab.dataField.calculate.numberFields", "*Number Fields"),
								width: 185,
								click: function () {
									// show popup
									$$(ids.fieldPopup).show(this.$view);
								}
							},
							{
								view: 'button',
								type: "icon",
								icon: "fa fa-calendar",
								label: L("ab.dataField.calculate.dateFields", "*Date Fields"),
								click: function () {
									// show popup
									$$(ids.dateOperatorPopup).show(this.$view);
								}
							}
						]
					},


					{
						cols: [
							{
								view: 'button',
								type: "icon",
								icon: "fa fa-hashtag",
								label: L("ab.dataField.calculate.numberFn", "*Number Operators"),
								width: 185,
								click: function () {
									// show popup
									$$(ids.numberOperatorPopup).show(this.$view);
								}
							},
							{}
						]
					},

					{
						view: "richselect",
						name: 'decimalSign',
						label: L('ab.dataField.calculate.decimalSign', "*Decimals"),
						value: "none",
						labelWidth: App.config.labelWidthXLarge,
						options: delimiterList,
						on: {
							'onChange': function (newValue, oldValue) {
								if (newValue == 'none') {
									$$(ids.decimalPlaces).disable();
								}
								else {
									$$(ids.decimalPlaces).enable();
								}
							}
						}
					},

					{
						view: "richselect",
						id: ids.decimalPlaces,
						name: 'decimalPlaces',
						label: L('ab.dataField.calculate.decimalPlaces', "*Places"),
						value: 'none',
						labelWidth: App.config.labelWidthXLarge,
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
			}
		];
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

		objectLoad: (object) => {
			ABFieldCalculateComponent.CurrentObject = object;
		},

		getNumberFields: () => {
			if (ABFieldCalculateComponent.CurrentObject)
				return ABFieldCalculateComponent.CurrentObject.fields(f => f.key == "number" || f.key == "calculate" || f.key == "formula");
			else
				return [];
		},

		getDateFields: () => {
			if (ABFieldCalculateComponent.CurrentObject) {

				var options = [];

				/** CURRENT DATE */
				options.push({
					label: "Year of [Current date]",
					function: "YEAR(CURRENT)"
				});

				options.push({
					label: "Month of [Current date]",
					function: "MONTH(CURRENT)"
				});

				options.push({
					label: "Date of [Current date]",
					function: "DATE(CURRENT)"
				});

				/** DATE FIELDS */
				ABFieldCalculateComponent.CurrentObject.fields(f => f.key == "date").forEach(f => {

					options.push({
						label: "Calculate age from [" + f.label + "]",
						function: "AGE({#column#})".replace("#column#", f.columnName)
					});

					options.push({
						label: "Year of [" + f.label + "]",
						function: "YEAR({#column#})".replace("#column#", f.columnName)
					});

					options.push({
						label: "Month of [" + f.label + "]",
						function: "MONTH({#column#})".replace("#column#", f.columnName)
					});

					options.push({
						label: "Date of [" + f.label + "]",
						function: "DATE({#column#})".replace("#column#", f.columnName)
					});

				});

				return options;
			}
			else
				return [];
		},

		itemTemplate: (item) => {

			var template = "";

			if (item.icon) {
				template += ('<i class="fa fa-{icon}" aria-hidden="true"></i> '.replace("{icon}", item.icon));
			}

			if (item.label) {
				template += item.label;
			}

			return template;

		},

		insertEquation: (message) => {

			var formula = $$(ids.formula).getValue();

			$$(ids.formula).setValue(formula + message);

		},

		isValid: function (ids, isValid) {

			$$(ids.component).markInvalid("formula", false);

			var formula = $$(ids.formula).getValue();

			try {
				convertToJs(ABFieldCalculateComponent.CurrentObject, formula, {});

				// correct
				return true;
			}
			catch (err) {

				$$(ids.component).markInvalid("formula", "");

				// incorrect
				return false;
			}

		}

		// populate: function (base_ids, values) {
		// }

	},

	// perform any additional setup actions here.
	// @param {obj} ids  the hash of id values for all the current form elements.
	//					 it should have your elements + the default Header elements:
	//						.label, .columnName, .fieldDescription, .showIcon
	init: function (ids) {
	}

});



class ABFieldCalculate extends ABField {
	constructor(values, object) {
		super(values, object, ABFieldCalculateDefaults);

		// we're responsible for setting up our specific settings:
		for (var dv in defaultValues) {
			this.settings[dv] = values.settings[dv] || defaultValues[dv];
		}
	}

	// return the default values for this DataField
	static defaults() {
		return ABFieldCalculateDefaults;
	}

	/*
	* @function propertiesComponent
	*
	* return a UI Component that contains the property definitions for this Field.
	*
	* @param {App} App the UI App instance passed around the Components.
	* @param {stirng} idBase
	* @return {Component}
	*/
	static propertiesComponent(App, idBase) {
		return ABFieldCalculateComponent.component(App, idBase);
	}

	///
	/// Instance Methods
	///


	isValid() {

		var validator = super.isValid();

		// validator.addError('columnName', L('ab.validation.object.name.unique', 'Field columnName must be unique (#name# already used in this Application)').replace('#name#', this.name) );

		return validator;
	}


	///
	/// Working with Actual Object Values:
	///

	// return the grid column header definition for this instance of ABFieldCalculate
	columnHeader(isObjectWorkspace) {
		var config = super.columnHeader(isObjectWorkspace);

		config.editor = null; // read only
		config.css = 'textCell';
		config.template = (rowData) => {
			return this.format(rowData);
		};

		return config;
	}


	/**
	 * @method defaultValue
	 * insert a key=>value pair that represent the default value
	 * for this field.
	 * @param {obj} values a key=>value hash of the current values.
	 */
	defaultValue(values) {

		// this field is read only
		delete values[this.columnName];

	}

	format(rowData) {

		let place = 0;
		if (this.settings.decimalSign != "none") {
			place = this.settings.decimalPlaces;
		}

		try {
			return convertToJs(this.object, this.settings.formula, rowData, place);
		}
		catch (err) {
			return "";
		}

	}


	/*
	* @funciton formComponent
	* returns a drag and droppable component that is used on the UI
	* interface builder to place form components related to this ABField.
	* 
	* an ABField defines which form component is used to edit it's contents.
	* However, what is returned here, needs to be able to create an instance of
	* the component that will be stored with the ABViewForm.
	*/
	formComponent() {

		// not support in the form widget
		return null;
	}


	detailComponent() {

		var detailComponentSetting = super.detailComponent();

		detailComponentSetting.common = () => {
			return {
				key: 'detailtext'
			}
		};

		return detailComponentSetting;
	}


}


export default ABFieldCalculate;