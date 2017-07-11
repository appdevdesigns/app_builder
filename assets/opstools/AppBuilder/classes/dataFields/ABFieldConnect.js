/*
 * ABFieldConnect
 *
 * An ABFieldConnect defines a connect to other object field type.
 *
 */

import ABField from "./ABField"
import ABFieldSelectivity from "./ABFieldSelectivity"
import ABFieldComponent from "./ABFieldComponent"


function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var ABFieldConnectDefaults = {
	key: 'connectObject', // unique key to reference this specific DataField

	icon: 'external-link',   // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'

	// menuName: what gets displayed in the Editor drop list
	menuName: L('ab.dataField.connectObject.menuName', '*Connect to another record'),

	// description: what gets displayed in the Editor description.
	description: '',
	isSortable: (field) => {
		return false;
	},
	isFilterable: (field) => {
		return false;
	},
	useAsLabel: (field) => {
		return false;
	}
};

var defaultValues = {
	linkObject: '', // ABObject.id
	linkType: 'one', // one, many
	linkViaType: 'many', // one, many
	linkColumn: '', // ABObject.id
	isSource: 1 // bit - NOTE : for 1:1 relation case, flag column is in which object
};

var ids = {
	objectList: 'ab-new-connectObject-list-item',
	objectCreateNew: 'ab-new-connectObject-create-new',

	fieldLink: 'ab-add-field-link-from',
	fieldLink2: 'ab-add-field-link-from-2',
	linkType: 'ab-add-field-link-type-to',
	linkViaType: 'ab-add-field-link-type-from',
	fieldLinkVia: 'ab-add-field-link-to',
	fieldLinkVia2: 'ab-add-field-link-to-2',

	connectDataPopup: 'ab-connect-object-data-popup'
};

/**
 * ABFieldConnectComponent
 *
 * Defines the UI Component for this Data Field.  The ui component is responsible
 * for displaying the properties editor, populating existing data, retrieving
 * property values, etc.
 */
var ABFieldConnectComponent = new ABFieldComponent({
	fieldDefaults: ABFieldConnectDefaults,

	elements: (App, field) => {
		ids = field.idsUnique(ids, App);

		return [
			{
				view: "label",
				label: L('ab.dataField.connectObject.connectToObject', "*Connect to Object")
			},
			{
				view: "list",
				id: ids.objectList,
				disallowEdit: true,
				name: 'objectList',
				select: true,
				height: 140,
				template: "<div class='ab-new-connectObject-list-item'>#label#</div>",
				on: {
					onAfterSelect: function () {
						var selectedObj = this.getSelectedItem(false);
						if (selectedObj) {
							var selectedObjLabel = selectedObj.label;
							$$(ids.fieldLinkVia).setValue(selectedObjLabel);
							$$(ids.fieldLinkVia2).setValue(selectedObjLabel);
						}
					}
				}
			},
			{
				view: 'button',
				id: ids.objectCreateNew,
				disallowEdit: true,
				value: L('ab.dataField.connectObject.connectToNewObject', '*Connect to new Object'),
				click: function () {
					if (this.getTopParentView().createNewObjectEvent)
						this.getTopParentView().createNewObjectEvent();
				}
			},
			{
				view: 'layout',
				cols: [
					{
						id: ids.fieldLink,
						view: 'label',
						width: 110
					},
					{
						id: ids.linkType,
						disallowEdit: true,
						name: "linkType",
						view: "segmented",
						width: 165,
						inputWidth: 160,
						options: [
							{ id: "many", value: L('ab.dataField.connectObject.hasMany', "*Has many") },
							{ id: "one", value: L('ab.dataField.connectObject.belongTo', "*Belong to") }
						]
					},
					{
						id: ids.fieldLinkVia,
						view: 'label',
						label: '[Select object]',
						width: 110
					},
				]
			},
			{
				view: 'layout',
				cols: [
					{
						id: ids.fieldLinkVia2,
						view: 'label',
						label: '[Select object]',
						width: 110
					},
					{
						id: ids.linkViaType,
						name: "linkViaType",
						disallowEdit: true,
						view: "segmented",
						width: 165,
						inputWidth: 160,
						options: [
							{ id: "many", value: L('ab.dataField.connectObject.hasMany', "*Has many") },
							{ id: "one", value: L('ab.dataField.connectObject.belongTo', "*Belong to") }
						]
					},
					{
						id: ids.fieldLink2,
						view: 'label',
						width: 110
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

		applicationLoad: (application) => {
			ABFieldConnectComponent.CurrentApplication = application;
		},

		objectLoad: (object) => {
			ABFieldConnectComponent.CurrentObject = object;
		},


		clear: (ids) => {
			$$(ids.objectList).unselectAll();
			$$(ids.linkType).setValue(defaultValues.linkType);
			$$(ids.linkViaType).setValue(defaultValues.linkViaType);
		},

		isValid: (ids, isValid) => {

			// validate require select linked object 
			var selectedObjId = $$(ids.objectList).getSelectedId();
			if (!selectedObjId) {
				webix.html.addCss($$(ids.objectList).$view, "webix_invalid");
				isValid = false;
			}
			else {
				webix.html.removeCss($$(ids.objectList).$view, "webix_invalid");
			}

			return isValid;
		},

		show: (pass_ids) => {
			// add objects to list 
			$$(pass_ids.objectList).clearAll();
			$$(pass_ids.objectList).parse(ABFieldConnectComponent.CurrentApplication.objects());

			// show current object name
			$$(ids.fieldLink).setValue(ABFieldConnectComponent.CurrentObject.label);
			$$(ids.fieldLink2).setValue(ABFieldConnectComponent.CurrentObject.label);
		},

		populate: (ids, values) => {
			// select linked object in list
			if (values.settings.linkObject) {
				$$(ids.objectList).select(values.settings.linkObject);
				$$(ids.objectList).refresh();
			}
		},

		values: (ids, values) => {

			// get select linked object id
			values.settings.linkObject = $$(ids.objectList).getSelectedId();

			// for 1:1 relation case, flag column is in this object
			values.settings.isSource = 1;

			return values;
		}

	}

});

class ABFieldConnect extends ABFieldSelectivity {
	constructor(values, object) {
		super(values, object, ABFieldConnectDefaults);

		// we're responsible for setting up our specific settings:
		for (var dv in defaultValues) {
			this.settings[dv] = (values.settings[dv] != null ? values.settings[dv] : defaultValues[dv]);
		}

	}

	// return the default values for this DataField
	static defaults() {
		return ABFieldConnectDefaults;
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
		return ABFieldConnectComponent.component(App);
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

	// return the grid column header definition for this instance of ABFieldConnect
	columnHeader(isObjectWorkspace) {
		var config = super.columnHeader(isObjectWorkspace);

		// render selectivity when link type is many
		if (this.settings.linkType == 'many' ||
			// render selectivity with single value when 1:1 relation
			(this.settings.linkType == 'one' && this.settings.linkViaType == 'one')) {

			config.template = '<div class="connect-data-values"></div>';
		}
		// Single select list
		else {
			var dcOptions = new webix.DataCollection();

			config.editor = 'richselect';
			config.collection = dcOptions;

			dcOptions.clearAll();
			this.getOptions().then((options) => {
				dcOptions.parse(options.map((opt) => {
					return {
						id: opt.id,
						value: opt.text
					}
				}));
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

		// render selectivity when link type is many
		if (this.settings.linkType == 'many' ||
			// render selectivity with single value when 1:1 relation
			(this.settings.linkType == 'one' && this.settings.linkViaType == 'one')) {

			// Get linked object
			var linkedObject = this.object.application.objects((obj) => obj.id == this.settings.linkObject)[0];

			var domNode = node.querySelector('.connect-data-values');

			var multiselect = (this.settings.linkType == 'many');

			// get selected values
			var selectedData = [];
			var relationName = this.relationName();
			if (row[relationName] != null) {

				// if this select value is array
				if (row[relationName].map) {

					selectedData = row[relationName].map(function (d) {
						// display label in format
						d.text = d.text || linkedObject.displayData(d);

						return d;
					});

				}
				else {
					selectedData = row[relationName];
					selectedData.text = (selectedData.text || linkedObject.displayData(selectedData));
				}
			}

			// Render selectivity
			this.selectivityRender(domNode, {
				multiple: multiselect,
				data: selectedData,
				ajax: {
					url: 'It will call url in .getOptions function', // require
					minimumInputLength: 0,
					quietMillis: 0,
					fetch: (url, init, queryOptions) => {
						return this.getOptions().then(function (data) {
							return {
								results: data
							};
						});
					}
				}
			}, App, row);
			// Set value to selectivity
			this.selectivitySet(domNode, row[relationName], App, row);

			// Listen event when selectivity value updates
			domNode.addEventListener('change', (e) => {

				// update just this value on our current object.model
				var values = {};
				values[this.columnName] = this.selectivityGet(domNode);

				// check data does not be changed
				if (Object.is(values[this.columnName], row[this.columnName])) return;

				// pass null because it could not put empty array in REST api
				if (values[this.columnName].length == 0)
					values[this.columnName] = null;

				this.object.model().update(row.id, values)
					.then(() => {
						// update values of relation to display in grid
						values[this.relationName()] = values[this.columnName];

						// update new value to item of DataTable .updateItem
						if ($$(node) && $$(node).updateItem)
							$$(node).updateItem(row.id, values);
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


	/*
	 * @function customEdit
	 * 
	 * @param {object} row is the {name=>value} hash of the current row of data.
	 * @param {App} App the shared ui App object useful more making globally
	 *					unique id references.
	 * @param {HtmlDOM} node  the HTML Dom object for this field's display.
	 */
	customEdit(row, App, node) {

		// render selectivity when link type is many
		if (this.settings.linkType == 'many' ||
			// render selectivity with single value when 1:1 relation
			(this.settings.linkType == 'one' && this.settings.linkViaType == 'one')) {
			return false;
		}
		else {
			return true;
		}

	}


	/**
	 * @method defaultValue
	 * insert a key=>value pair that represent the default value
	 * for this field.
	 * @param {obj} values a key=>value hash of the current values.
	 */
	defaultValue(values) {
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


	relationName() {
		return String(this.columnName).replace(/[^a-z0-9]/gi, '') + '__relation';
	}

	getOptions() {
		return new Promise(
			(resolve, reject) => {

				// check if linked object value is not define, should return a empty array
				if (!this.settings.linkObject) return resolve([]);

				// if options was cached
				// if (this._options != null) return resolve(this._options);


				var linkedObj = this.object.application.objects((obj) => obj.id == this.settings.linkObject)[0];

				// System could not found the linked object - It may be deleted ?
				if (linkedObj == null) return reject();

				// Get linked object model
				var linkedModel = linkedObj.model();

				var where = [];

				// M:1 - get data that's only empty relation value
				if (this.settings.linkType == 'many' && this.settings.linkViaType == 'one') {
					where.push({
						fieldName: this.columnName,
						operator: 'is null'
					});
				}
				// 1:1
				else if (this.settings.linkType == 'one' && this.settings.linkViaType == 'one') {
					// 1:1 - get data is not match link id that we have
					if (this.settings.isSource == true) {
						where.push({
							fieldName: this.columnName,
							operator: 'have no relation'
						});
					}
					// 1:1 - get data that's only empty relation value by query null value from link table
					else {
						where.push({
							fieldName: this.columnName,
							operator: 'is null'
						});
					}
				}

				// Pull linked object data
				linkedModel.findAll({
					where: {
						where: where
					}
				}).then((result) => {

					// cache linked object data
					this._options = result.data
						.map((d) => {
							return {
								id: d.id,
								text: linkedObj.displayData(d)
							};
						});

					resolve(this._options);

				}, reject);


			}
		);
	}


};

export default ABFieldConnect;