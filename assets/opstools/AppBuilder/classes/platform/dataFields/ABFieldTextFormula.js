var ABFieldTextFormulaCore = require('../../core/dataFields/ABFieldTextFormulaCore');
var ABFieldComponent = require('./ABFieldComponent');


function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

/**
 * ABFieldTextFormulaComponent
 *
 * Defines the UI Component for this Data Field.  The ui component is responsible
 * for displaying the properties editor, populating existing data, retrieving
 * property values, etc.
 *
 * @param {obj} App  the current Component Application instance for the current UI.
 * @return {obj} the Component object.
 */
var ABFieldTextFormulaComponent = new ABFieldComponent({

	fieldDefaults: ABFieldTextFormulaCore.defaults(),

	elements: (App, field) => {

		// NOTE: you might not need to define your own ids, but if you do, do it like this:
		var ids = {
			textFormula: 'formulaTextArea',
			formulaSuggest: 'formulaSuggest',
		}
		ids = field.idsUnique(ids, App);

		return [
			{
				id: ids.textFormula,
				view: "textarea",
				label: L("ab.dataField.textformula.formula", "*Text Formula"),
				name: "textFormula",
				editor: "text",
				labelWidth: App.config.labelWidthLarge,
				placeholder: L('ab.dataField.textformula.placeholder', '*{Firstname} {Lastname}'),
				on: {
					onFocus: (current_view, prev_view) => {
						$$(ids.formulaSuggest).show();
					},
					onBlur: (prev_view) => {
						$$(ids.formulaSuggest).hide();
					}
				}
			},
			{
				view: "layout",
				cols: [
					{},
					{
						id: ids.formulaSuggest,
						name: "formulaSuggest",
						view: "dataview",
						xCount: 1,
						yCount: 2.8,
						hidden: true,
						select: true,
						type: {
							height: 30,
							width: 246,
						},
						template: "#value#",
						on: {
							onItemClick: (id, event, node) => {
								var item = $$(ids.formulaSuggest).getItem(id);
								var inputSuggestString = item.type == "field" ? "{" + item.value + "}" : item.value;
								$$(ids.textFormula).setValue($$(ids.textFormula).getValue() + inputSuggestString);
								$$(ids.formulaSuggest).unselect();
							}
						}
					}
				]
			}
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
	defaultValues: ABFieldTextFormulaCore.defaultValues(),

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
		clear: (ids) => {
			$$(ids.textFormula).setValue('');
		},
		objectLoad: (object) => {
			ABFieldTextFormulaComponent.currentObject = object;
		},
		show: (ids) => {
			var currentObject = ABFieldTextFormulaComponent.currentObject;

			var formulaSuggest = $$(ids.formulaSuggest);
			var formulaData = ABFieldTextFormulaCore.getBuildInFunction();

			currentObject.fields().forEach(field => {
				if (field.key != "formula" && field.key != "TextFormula" && field.key != "connectObject") {
					formulaData.unshift({ id: field.id, value: field.columnName, type: "field" });
				}
			});

			formulaSuggest.clearAll();
			formulaSuggest.parse(formulaData);
		},
		populate: (ids, values) => {
			var currentObject = ABFieldTextFormulaComponent.currentObject;
			var formulaSuggest = $$(ids.formulaSuggest);
			var formulaData = ABFieldTextFormulaCore.getBuildInFunction();

			currentObject.fields().forEach(field => {
				if (field.key != "formula" && field.key != "TextFormula" && field.key != "connectObject") {
					formulaData.unshift({ id: field.id, value: field.columnName, type: "field" });
				}
			});

			formulaSuggest.clearAll();
			formulaSuggest.parse(formulaData);
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

module.exports = class ABFieldTextFormula extends ABFieldTextFormulaCore {

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
		return ABFieldTextFormulaComponent.component(App, idBase);
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

	// return the grid column header definition for this instance of ABFieldTextFormula
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
	* @function customDisplay
	* perform any custom display modifications for this field.  
	* @param {object} row is the {name=>value} hash of the current row of data.
	* @param {App} App the shared ui App object useful more making globally
	*					unique id references.
	* @param {HtmlDOM} node  the HTML Dom object for this field's display.
	*/
	customDisplay(row, App, node, options) {

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