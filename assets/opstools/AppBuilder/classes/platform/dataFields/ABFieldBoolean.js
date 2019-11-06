var ABFieldBooleanCore = require('../../core/dataFields/ABFieldBooleanCore');
var ABFieldComponent = require('./ABFieldComponent');


function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

/**
 * ABFieldBooleanComponent
 *
 * Defines the UI Component for this Data Field.  The ui component is responsible
 * for displaying the properties editor, populating existing data, retrieving
 * property values, etc.
 */
var ABFieldBooleanComponent = new ABFieldComponent({
	fieldDefaults: ABFieldBooleanCore.defaults(),

	elements: (App, field) => {
		// ids = field.idsUnique(ids, App);

		return [
			{
				name: "default",
				view: "checkbox",
				label: L("ab.common.default", "*Default"),
				labelPosition: "left",
				labelWidth: 70,
				labelRight: L("ab.dataField.boolean.uncheck", "*Uncheck"),
				css: "webix_table_checkbox",
				on: {
					onChange: function (newVal, oldVal) {

						let checkLabel = L("ab.dataField.boolean.check", "*Check");
						let uncheckLabel = L("ab.dataField.boolean.uncheck", "*Uncheck");

						this.define('labelRight', newVal ? checkLabel : uncheckLabel);
						this.refresh();
					}
				}
			}
		];
	},

	// defaultValues: the keys must match a .name of your elements to set it's default value.
	defaultValues: ABFieldBooleanCore.defaultValues(),

	// rules: basic form validation rules for webix form entry.
	// the keys must match a .name of your .elements for it to apply
	rules: {},

	// include additional behavior on default component operations here:
	// The base routines will be processed first, then these.  Any results
	// from the base routine, will be passed on to these:
	logic: {

		// isValid: function (ids, isValid) {

		// }

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
	}

});

module.exports = class ABFieldBoolean extends ABFieldBooleanCore {

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
		return ABFieldBooleanComponent.component(App, idBase);
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

	// return the grid column header definition for this instance of ABFieldBoolean
	columnHeader(options) {

		options = options || {};

		var config = super.columnHeader(options);

		config.editor = 'template';
		config.css = 'center';
		config.template = (row, common, value, config) => {

			// Group header
			if (row.$group)
				return row[this.columnName];

			// editable
			if (options.editable) {
				return '<div class="ab-boolean-display">' + common.checkbox(row, common, value, config) + '</div>';
			}

			// readonly
			else {
				if (value)
					return "<div class='webix_icon fa fa-check-square-o'></div>";
				else
					return "<div class='webix_icon fa fa-square-o'></div>";
			}

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

		return super.formComponent('checkbox');
	}


	detailComponent() {

		var detailComponentSetting = super.detailComponent();

		detailComponentSetting.common = () => {
			return {
				key: 'detailcheckbox'
			}
		};

		return detailComponentSetting;
	}

};