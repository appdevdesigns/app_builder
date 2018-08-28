/*
 * ABFieldFormula
 *
 * An ABFieldFormula are used to run calculations on connected (child) records
 * and store the total of that calculation in the parent.
 *
 */

import ABField from "./ABField"
import ABFieldComponent from "./ABFieldComponent"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var ABFieldFormulaDefaults = {
	key: 'formula',		// unique key to reference this specific DataField

	icon: 'circle-o-notch',	// font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'

	// menuName: what gets displayed in the Editor drop list
	menuName: L('ab.dataField.formula.menuName', '*Formula'),

	// description: what gets displayed in the Editor description.
	description: L('ab.dataField.formula.description', '*'),

	isSortable: false,
	isFilterable: false,

};

var defaultValues = {
	field: "",			// id of ABField : NOTE - store our connect field to support when there are multi - linked columns
	objectLink: "",		// id of ABObject
	fieldLink: "",		// id of ABField
	type: "sum"		// "sum", "average", "max", "min", "count"
};

var ids = {
	fieldList: 'ab-field-formula-field-list',
};

/**
 * ABFieldFormulaComponent
 *
 * Defines the UI Component for this Data Field.  The ui component is responsible
 * for displaying the properties editor, populating existing data, retrieving
 * property values, etc.
 */
var ABFieldFormulaComponent = new ABFieldComponent({
	fieldDefaults: ABFieldFormulaDefaults,

	elements: (App, field) => {
		ids = field.idsUnique(ids, App);

		return [
			{
				view: "richselect",
				name: 'type',
				label: L('ab.dataField.formula.type', "*Type"),
				labelWidth: App.config.labelWidthMedium,
				value: "sum",
				options: [
					{ id: "sum", value: "Sum" },
					{ id: "max", value: "Max" },
					{ id: "min", value: "Min" },
					{ id: "average", value: "Average" },
					{ id: "count", value: "Count" }
				]
			},
			{
				view: "richselect",
				name: 'field',
				label: L('ab.dataField.formula.field', "*Field"),
				labelWidth: App.config.labelWidthMedium,
				options: {
					view: "suggest",
					body: {
						id: ids.fieldList,
						view: "list",
						template: field.logic.itemTemplate,
						data: []
					}
				}
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
			ABFieldFormulaComponent.CurrentObject = object;
		},

		getFieldList: () => {

			let options = [];

			var connectFields = ABFieldFormulaComponent.CurrentObject.connectFields();
			connectFields.forEach(f => {

				var objLink = f.datasourceLink;

				objLink.fields().forEach(fLink => {

					// pull 'number' and 'calculate' fields from link objects
					// if (fLink.key == 'number' || fLink.key == 'calculate') {
					if (fLink.key == 'number') { // NOTE: calculate fields does not support in queries
						options.push({
							// UUID:UUID
							id: "#field#:#fieldLink#".replace("#field#", f.id).replace("#fieldLink#", fLink.id),
							field: f,
							fieldLink: fLink
						});
					}

				});

			});

			return options;

		},

		itemTemplate: (opt) => {

			var template = '[#field#] #object# -> <i class="fa fa-#icon#" aria-hidden="true"></i><b>#fieldLink#</b>'
				.replace("#field#", opt.field.label)
				.replace("#object#", opt.fieldLink.object.label)
				.replace("#icon#", opt.fieldLink.icon)
				.replace("#fieldLink#", opt.fieldLink.label);

			return template;

		},

		show: function (pass_ids) {

			var list = this.getFieldList();

			$$(ids.fieldList).clearAll();
			$$(ids.fieldList).parse(list);

		},

		populate: (ids, values) => {

			if (values.settings.field) {

				var selectedId = "#field#:#fieldLink#"
					.replace("#field#", values.settings.field)
					.replace("#fieldLink#", values.settings.fieldLink);

				$$(ids.field).setValue(selectedId || "");

			}
			else {
				$$(ids.field).setValue("");
			}

		},

		values: (ids, values) => {

			var selectedId = $$(ids.field).getValue(); // fieldId:fieldLinkId

			var selectedField = $$(ids.field).getList().data.find({ id: selectedId })[0];
			if (selectedField) {
				values.settings.field = selectedField.field.id;
				values.settings.fieldLink = selectedField.fieldLink.id;
				values.settings.object = selectedField.fieldLink.object.id;
			}

			return values;
		}


		// isValid: function (ids, isValid) {

		// 	$$(ids.component).markInvalid("formula", false);

		// 	var formula = $$(ids.formula).getValue();

		// 	try {
		// 		convertToJs(ABFieldFormulaComponent.CurrentObject, formula, {});

		// 		// correct
		// 		return true;
		// 	}
		// 	catch (err) {

		// 		$$(ids.component).markInvalid("formula", "");

		// 		// incorrect
		// 		return false;
		// 	}

		// }

	},

	// perform any additional setup actions here.
	// @param {obj} ids  the hash of id values for all the current form elements.
	//					 it should have your elements + the default Header elements:
	//						.label, .columnName, .fieldDescription, .showIcon
	init: function (ids) {
	}

});



class ABFieldFormula extends ABField {
	constructor(values, object) {
		super(values, object, ABFieldFormulaDefaults);

		// we're responsible for setting up our specific settings:
		for (var dv in defaultValues) {
			this.settings[dv] = values.settings[dv] || defaultValues[dv];
		}
	}

	// return the default values for this DataField
	static defaults() {
		return ABFieldFormulaDefaults;
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
		return ABFieldFormulaComponent.component(App, idBase);
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

	// return the grid column header definition for this instance of ABFieldFormula
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

		// if data exists, then will not calculate on client side
		if (rowData[this.columnName] != null)
			return rowData[this.columnName];

		var fieldBase = this.fieldBase();
		if (!fieldBase) return 0;

		var fieldLink = this.fieldLink();
		if (!fieldLink) return 0;

		var data = rowData[fieldBase.relationName()] || [];
		if (!Array.isArray(data))
			data = [data];

		var numberList = [];

		// pull number from data
		switch (fieldLink.key) {
			case "calculate":
				data.forEach(d => {
					numberList.push(parseFloat(fieldLink.format(d) || 0));
				});
				break;
			case "number":
				numberList = data.map(d => d[fieldLink.columnName] || 0);
				break;
		}

		var result = 0;

		// calculate
		switch (this.settings.type) {
			case "sum":
				numberList.forEach(num => result += num);
				break;

			case "average":
				if (numberList.length > 0) {
					numberList.forEach(num => result += num); // sum
					result = result / numberList.length;
				}
				break;

			case "max":
				numberList.forEach(num => {
					if (result < num)
						result = num;
				});
				break;
			case "min":
				numberList.forEach(num => {
					if (result > num)
						result = num;
				});
				break;
			case "count":
				result = numberList.length;
				break;
		}

		return result;

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

	fieldBase() {
		return this.object.fields(f => f.id == this.settings.field)[0];
	}

	fieldLink() {
		var obj = this.object.application.objects(obj => obj.id == this.settings.object)[0];
		if (!obj) return null;

		var field = obj.fields(f => f.id == this.settings.fieldLink)[0];
		if (!field) return null;

		return field;
	}


}


export default ABFieldFormula;