var ABFieldFormulaCore = require('../../core/dataFields/ABFieldFormulaCore');
var ABFieldComponent = require('./ABFieldComponent');


function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

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
	fieldDefaults: ABFieldFormulaCore.defaults(),

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
					{ id: "sum", value: L('ab.dataField.formula.type.sum', '*Sum') },
					{ id: "max", value: L('ab.dataField.formula.type.max', '*Max') },
					{ id: "min", value: L('ab.dataField.formula.type.min', '*Min') },
					{ id: "average", value: L('ab.dataField.formula.type.average', '*Average') },
					{ id: "count", value: L('ab.dataField.formula.type.count', '*Count') }
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
	defaultValues: ABFieldFormulaCore.defaultValues(),

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
					if (fLink.key == 'number' || fLink.key == 'calculate') {
						// if (fLink.key == 'number') { // NOTE: calculate fields does not support in queries
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

module.exports = class ABFieldFormula extends ABField {

	constructor(values, object) {
		super(values, object);
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
	columnHeader(options) {
		var config = super.columnHeader(options);

		config.editor = null; // read only
		config.css = 'textCell';
		config.template = (rowData) => {

			if (rowData.$group)
				return rowData[this.columnName];

			return this.format(rowData);
		};

		return config;
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

};