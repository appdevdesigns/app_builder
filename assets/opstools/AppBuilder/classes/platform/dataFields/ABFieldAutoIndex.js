var ABFieldAutoIndexCore = require('../../core/dataFields/ABFieldAutoIndexCore');
var ABFieldComponent = require('./ABFieldComponent');


function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var ids = {
	prefixText: 'prefixText',
	delimiterText: 'delimiterText',
	displayLength: 'diisplayLength',
	previewText: 'previewText',
	// currentIndex: 'currentIndex',
}


/**
 * 
 * Private methods 
 * 
 */

function previewChange() {

	var prefixText = $$(ids.prefixText);
	var displayLength = $$(ids.displayLength);
	var delimiterText = $$(ids.delimiterText);
	var previewText = $$(ids.previewText);
	var previewResult = ABFieldAutoIndexCore.setValueToIndex(prefixText.getValue(), delimiterText.getValue(), displayLength.getValue(), 0);
	if (previewText) {
		previewText.setValue(previewResult);
	}
}


/**
 * ABFieldAutoIndexComponent
 *
 * Defines the UI Component for this Data Field.  The ui component is responsible
 * for displaying the properties editor, populating existing data, retrieving
 * property values, etc.
 *
 * @param {obj} App  the current Component Application instance for the current UI.
 * @return {obj} the Component object.
 */
var ABFieldAutoIndexComponent = new ABFieldComponent({

	fieldDefaults: ABFieldAutoIndexCore.defaults(),

	elements: (App, field) => {

		ids = field.idsUnique(ids, App);

		return [
			{
				id: ids.prefixText,
				view: "text",
				name: 'prefix',
				labelWidth: App.config.labelWidthLarge,
				label: L('ab.dataField.prefixText', '*Prefix'),
				placeholder: L('ab.dataField.prefixTextPlaceholder', '*US'),
				on: {
					onChange: (newVal, oldVal) => {
						previewChange();
					}
				}

			},
			{
				id: ids.delimiterText,
				view: "richselect",
				name: 'delimiter',
				labelWidth: App.config.labelWidthLarge,
				label: L('ab.dataField.delimiter', '*Delimiter'),
				value: "dash",
				options: ABFieldAutoIndexCore.delimiterList(),
				on: {
					onChange: (newVal, oldVal) => {
						previewChange();
					}
				}
			},
			{
				id: ids.displayLength,
				view: "counter",
				name: 'displayLength',
				labelWidth: App.config.labelWidthLarge,
				label: L('ab.dataField.displayLength', '*Length'),
				step: 1,
				value: 4,
				min: 1,
				max: 10,
				on: {
					onChange: (newVal, oldVal) => {
						previewChange();
					}
				}
			},
			{
				id: ids.previewText,
				view: "text",
				name: 'previewText',
				labelWidth: App.config.labelWidthLarge,
				label: L('ab.dataField.previewText', '*Preview'),
				disabled: true,
			},
			// {
			// 	id: ids.currentIndex,
			// 	view: "text",
			// 	name: 'currentIndex',
			// 	value: 0,
			// 	hidden: true
			// }
			// {
			// 	view: "checkbox",
			// 	name:'supportMultilingual',
			// 	labelRight: L('ab.dataField.string.supportMultilingual', '*Support multilingual'),
			// 	labelWidth: App.config.labelWidthCheckbox,
			// 	value: true
			// }
		]
	},

	// defaultValues: the keys must match a .name of your elements to set it's default value.
	defaultValues: ABFieldAutoIndexCore.defaultValues(),

	// rules: basic form validation rules for webix form entry.
	// the keys must match a .name of your .elements for it to apply
	rules: {
		// 'textDefault':webix.rules.isNotEmpty,
		// 'supportMultilingual':webix.rules.isNotEmpty
	},

	// include additional behavior on default component operations here:
	// The base routines will be processed first, then these.  Any results
	// from the base routine, will be passed on to these: 
	// 	@param {obj} ids  the list of ids used to generate the UI.  your 
	//					  provided .elements will have matching .name keys
	//					  to access them here.
	//  @param {obj} values the current set of values provided for this instance
	// 					  of ABField:
	//					  {
	//						id:'',			// if already .saved()
	// 						label:'',
	// 						columnName:'',
	//						settings:{
	//							showIcon:'',
	//
	//							your element key=>values here	
	//						}
	//					  }
	//
	// 		.clear(ids)  : reset the display to an empty state
	// 		.isValid(ids, isValid): perform validation on the current editor values
	// 		.populate(ids, values) : populate the form with your current settings
	// 		.show(ids)   : display the form in the editor
	// 		.values(ids, values) : return the current values from the form
	logic: {
		populate: (ids, values) => {
			// var currentObject = ABFieldAutoIndexComponent.currentObject;
			previewChange();

		}
	},

	// perform any additional setup actions here.
	// @param {obj} ids  the hash of id values for all the current form elements.
	//					 it should have your elements + the default Header elements:
	//						.label, .columnName, .fieldDescription, .showIcon
	init: function (ids) {
		// want to hide the description? :
		// $$(ids.fieldDescription).hide();
	}

});

module.exports = class ABFieldAutoIndex extends ABFieldAutoIndexCore {

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
		return ABFieldAutoIndexComponent.component(App, idBase);
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

	// return the grid column header definition for this instance of ABFieldAutoIndex
	columnHeader(options) {
		var config = super.columnHeader(options);

		config.editor = null; // read only
		config.css = 'textCell';
		config.template = (rowData) => {
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

		return super.formComponent('fieldreadonly');
	}


	detailComponent() {

		let detailComponentSetting = super.detailComponent();

		detailComponentSetting.common = () => {
			return {
				key: 'detailtext'
			}
		};

		return detailComponentSetting;
	}

}