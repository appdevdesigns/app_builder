/*
 * ABFieldList
 *
 * An ABFieldList defines a select list field type.
 *
 */

import ABFieldSelectivity from "./ABFieldSelectivity"
import ABFieldComponent from "./ABFieldComponent"


function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var ABFieldListDefaults = {
	key: 'list', // unique key to reference this specific DataField

	icon: 'th-list',   // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'

	// menuName: what gets displayed in the Editor drop list
	menuName: L('ab.dataField.list.menuName', '*Select list'),

	// description: what gets displayed in the Editor description.
	description: L('ab.dataField.list.description', '*Select list allows you to select predefined options below from a dropdown.')
};

var defaultValues = {
	isMultiple: 0,
	options: [],
	singleDefault: 'none',
	multipleDefault: []
};

var ids = {
	multiSelectOption: 'ab-list-multiple-option',
	singleDefault: 'ab-list-single-default',
	multipleDefault: 'ab-list-multiple-default',
	options: 'ab-list-option'
};


function updateDefaultList() {
	var optList = $$(ids.options).find({}).map(function (opt) {
		return {
			id: opt.id,
			value: opt.value
		}
	});

	// Multiple default selector
	if (ABFieldListComponent.currentField) {
		var domNode = $$(ids.multipleDefault).$view.querySelector('.list-data-values');
		ABFieldListComponent.currentField.selectivityRender(domNode, {
			multiple: true,
			placeholder: '[Select]',
			items: optList.map(function (opt) {
				return {
					id: opt.id,
					text: opt.value
				}
			})
		});
	}

	// Single default selector
	optList.unshift({
		id: 'none',
		value: '[No Default]'
	});
	$$(ids.singleDefault).define('options', optList);
	$$(ids.singleDefault).setValue('none');
}

/**
 * ABFieldListComponent
 *
 * Defines the UI Component for this Data Field.  The ui component is responsible
 * for displaying the properties editor, populating existing data, retrieving
 * property values, etc.
 */
var ABFieldListComponent = new ABFieldComponent({
	fieldDefaults: ABFieldListDefaults,

	elements: (App, field) => {
		ids = field.idsUnique(ids, App);

		return [
			{
				view: "checkbox",
				name: "isMultiple",
				id: ids.multiSelectOption,
				labelRight: L('ab.dataField.list.multiSelectOption', 'Multiselect'),
				labelWidth: 0,
				value: false,
				on: {
					onChange: (newV, oldV) => {
						if (newV == true) {
							$$(ids.singleDefault).hide();
							$$(ids.multipleDefault).show();
						}
						else {
							$$(ids.singleDefault).show();
							$$(ids.multipleDefault).hide();
						}

						updateDefaultList();
					}
				}
			},
			{ view: "label", label: "<b>Options</b>" },
			{
				id: ids.options,
				name: 'options',
				view: App.custom.editlist.view,
				template: "<div style='position: relative;'>#value#<i class='ab-new-field-remove fa fa-remove' style='position: absolute; top: 7px; right: 7px;'></i></div>",
				autoheight: true,
				drag: true,
				editable: true,
				editor: "text",
				editValue: "value",
				onClick: {
					"ab-new-field-remove": function (e, itemId, trg) {
						// Remove option item
						$$(ids.options).remove(itemId);
					}
				},
				on: {
					onAfterAdd: () => {
						updateDefaultList();
					},
					onAfterEditStop: () => {
						updateDefaultList();
					},
					onAfterDelete: () => {
						updateDefaultList();
					}
				}
			},
			{
				view: "button",
				value: "Add new option",
				click: function () {
					var itemId = webix.uid();
					$$(ids.options).add({ id: itemId, value: '' }, $$(ids.options).count());
					$$(ids.options).edit(itemId);
				}
			},
			{
				id: ids.singleDefault,
				name: "singleDefault",
				view: 'richselect',
				label: 'Default',
				options: [{
					id: 'none',
					value: '[No Default]'
				}],
				value: 'none'
			},
			{
				id: ids.multipleDefault,
				name: 'multipleDefault',
				view: 'template',
				label: 'Default',
				height: 50,
				borderless: true,
				hidden: true,
				template:
				'<label style="width: 80px;text-align: left;line-height:32px;" class="webix_inp_label">Default</label>' +
				'<div class="list-data-values"></div>'
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

		// isValid: function (ids, isValid) {

		// }

		populate: (ids, field) => {

			// set options to webix list
			var opts = field.settings.options.map(function (opt) {
				return {
					id: opt.id,
					value: opt.text
				}
			});
			$$(ids.options).parse(opts);
			$$(ids.options).refresh();

			// update single/multiple default selector
			ABFieldListComponent.currentField = field;
			updateDefaultList(ids);

		},

		values: (ids, values) => {

			// Get options list from UI, then set them to settings
			values.settings.options = $$(ids.options).find({}).map(function (opt) {
				return {
					id: opt.id,
					text: opt.value
				}
			});

			// Set multiple default value
			if (values.settings.isMultiple == true) {
				var domNode = $$(ids.multipleDefault).$view.querySelector('.list-data-values');
				values.settings.multipleDefault = [];
				// values.settings.multipleDefault = domNode.selectivity.getData() || [];
			}

			return values;
		}

	}

});

class ABFieldList extends ABFieldSelectivity {
	constructor(values, object) {

		super(values, object, ABFieldListDefaults);

		// we're responsible for setting up our specific settings:
		for (var dv in defaultValues) {
			this.settings[dv] = values.settings[dv] || defaultValues[dv];
		}

	}

	// return the default values for this DataField
	static defaults() {
		return ABFieldListDefaults;
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
		return ABFieldListComponent.component(App);
	}

	///
	/// Instance Methods
	///


	isValid() {

		var validator = super.isValid();

		// validator.addError('columnName', L('ab.validation.object.name.unique', 'Field columnName must be unique (#name# already used in this Application)').replace('#name#', this.name) );

		return validator;
	}


	/**
	 * @method fromValues()
	 *
	 * initialze this object with the given set of values.
	 * @param {obj} values
	 */
	fromValues(values) {

		super.fromValues(values);

		// translate options list
		if (this.settings.options && this.settings.options.length > 0) {
			this.settings.options.forEach(function (opt) {
				OP.Multilingual.translate(opt, opt, ["text"]);
			});
		}

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
	toObj() {

		var obj = super.toObj();

		// Un-translate options list
		obj.settings.options.forEach(function (opt) {
			OP.Multilingual.unTranslate(opt, opt, ["text"]);
		});

		return obj;
	}




	///
	/// Working with Actual Object Values:
	///

	// return the grid column header definition for this instance of ABFieldList
	columnHeader(isObjectWorkspace) {
		var config = super.columnHeader(isObjectWorkspace);

		// Multiple select list
		if (this.settings.isMultiple == true) {
			config.template = '<div class="list-data-values"></div>';
		}
		// Single select list
		else {
			config.editor = 'richselect';
			config.options = this.settings.options.map(function (opt) {
				return {
					id: opt.id,
					value: opt.text
				};
			});
		}

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
	customDisplay(row, App, node) {
		// sanity check.
		if (!node) { return }

		if (this.settings.isMultiple == true) {
			var domNode = node.querySelector('.list-data-values');

			// get selected values
			var selectedData = [];
			if (row[this.columnName] != null) {
				selectedData = row[this.columnName];
			}

			// Render selectivity
			this.selectivityRender(domNode, {
				multiple: true,
				items: this.settings.options,
				data: selectedData
			});

			// Listen event when selectivity value updates
			domNode.addEventListener('change', (e) => {

				// update just this value on our current object.model
				var values = {};
				values[this.columnName] = this.selectivityGet(domNode);

				// pass null because it could not put empty array in REST api
				if (values[this.columnName].length == 0)
					values[this.columnName] = null;

				this.object.model().update(row.id, values)
					.then(() => {

					})
					.catch((err) => {

						node.classList.add('webix_invalid');
						node.classList.add('webix_invalid_cell');

						OP.Error.log('Error updating our entry.', { error: err, row: row, values: values });
						console.error(err);
					});

			}, false);

		}

	}



	/**
	 * @method defaultValue
	 * insert a key=>value pair that represent the default value
	 * for this field.
	 * @param {obj} values a key=>value hash of the current values.
	 */
	defaultValue(values) {
		// Multiple select list
		if (this.settings.isMultiple == true) {
			values[this.columnName] = this.settings.multipleDefault || [];
		}
		// Single select list
		else if (this.settings.singleDefault && this.settings.singleDefault != 'none') {
			values[this.columnName] = this.settings.singleDefault;
		}
	}




	/**
	 * @method isValidData
	 * Parse through the given data and return an error if this field's
	 * data seems invalid.
	 * @param {obj} data  a key=>value hash of the inputs to parse.
	 * @param {OPValidator} validator  provided Validator fn
	 * @return {array} 
	 */
	isValidData(data, validator) {


	}

}


export default ABFieldList;