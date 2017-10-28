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
	description: L('ab.dataField.connectObject.description', '*Connect two data objects together'),

	isSortable: false,
	isFilterable: false,
	useAsLabel: false

};

var defaultValues = {
	linkObject: '', // ABObject.id
	linkType: 'one', // one, many
	linkViaType: 'many', // one, many
	linkColumn: '', // ABField.id
	isSource: null // bit
};

var ids = {
	linkObject: 'ab-new-connectObject-list-item',
	objectCreateNew: 'ab-new-connectObject-create-new',

	fieldLink: 'ab-add-field-link-from',
	fieldLink2: 'ab-add-field-link-from-2',
	linkType: 'ab-add-field-link-type-to',
	linkViaType: 'ab-add-field-link-type-from',
	fieldLinkVia: 'ab-add-field-link-to',
	fieldLinkVia2: 'ab-add-field-link-to-2',

	link1: 'ab-link1-field-options',
	link2: 'ab-link2-field-options',

	connectDataPopup: 'ab-connect-object-data-popup'
};

function populateSelect(populate, callback) {
	var options = [];
	ABFieldConnectComponent.CurrentApplication.objects().forEach((o) => {
		options.push({ id: o.id, value: o.label });
	});

	// sort by object's label  A -> Z
	options.sort((a, b) => {
		if (a.value < b.value) return -1;
		if (a.value > b.value) return 1;
		return 0;
	});

	$$(ids.linkObject).define("options", options);
	$$(ids.linkObject).refresh();
	if (populate != null && populate == true) {
		$$(ids.linkObject).setValue(options[options.length - 1].id);
		$$(ids.linkObject).refresh();
		var selectedObj = $$(ids.linkObject).getList().getItem(options[options.length - 1].id);
		if (selectedObj) {
			var selectedObjLabel = selectedObj.value;
			$$(ids.fieldLinkVia).setValue("<b>" + selectedObjLabel + "</b> entry.");
			$$(ids.fieldLinkVia2).setValue("Each <b>" + selectedObjLabel + "</b> entry connects with ");
			$$(ids.link1).show();
			$$(ids.link2).show();
		}
		callback();
	}
}

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
				view: "richselect",
				label: L('ab.dataField.connectObject.connectToObject', "*Connected to:"),
				id: ids.linkObject,
				disallowEdit: true,
				name: 'linkObject',
				labelWidth: App.config.labelWidthLarge,
				placeholder: L('ab.dataField.connectObject.connectToObjectPlaceholder', "*select object"),
				// select: true,
				// height: 140,
				// template: "<div class='ab-new-connectObject-list-item'>#label#</div>",
				on: {
					onChange: function (newV, oldV) {
						if (!newV) {
							$$(ids.link1).hide();
							$$(ids.link2).hide();
						}
						if (newV == oldV || newV == "") return;
						var selectedObj = this.getList().getItem(newV);
						if (selectedObj) {
							var selectedObjLabel = selectedObj.value;
							$$(ids.fieldLinkVia).setValue("<b>" + selectedObjLabel + "</b> entry.");
							$$(ids.fieldLinkVia2).setValue("Each <b>" + selectedObjLabel + "</b> entry connects with ");
							$$(ids.link1).show();
							$$(ids.link2).show();
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
					if (App.actions.addNewObject) {
						async.series([
							function (callback) {
								App.actions.addNewObject(false, callback); // pass false because after it is created we do not want it to select it in the object list
							},
							function (callback) {
								populateSelect(true, callback); // pass true because we want it to select the last item in the list that was just created								
							}
						], function (err) {
							// console.log('all functions complete')
						})
					} else {
						// alert("that didn't work");
					}
				}
			},
			{
				view: 'layout',
				id: ids.link1,
				hidden: true,
				cols: [
					{
						id: ids.fieldLink,
						view: 'label',
						width: 300
					},
					{
						id: ids.linkType,
						disallowEdit: true,
						name: "linkType",
						view: "richselect",
						value: defaultValues.linkType,
						width: 95,
						options: [
							{ id: "many", value: L('ab.dataField.connectObject.hasMany', "*many") },
							{ id: "one", value: L('ab.dataField.connectObject.belongTo', "*one") }
						],
						on: {
							onChange: function (newV, oldV) {
								if (newV == "many") {
									$$(ids.fieldLinkVia).define("label", $$(ids.fieldLinkVia).getValue().replace("entry", "entries"));
								} else {
									$$(ids.fieldLinkVia).define("label", $$(ids.fieldLinkVia).getValue().replace("entries", "entry"));
								}
								$$(ids.fieldLinkVia).refresh();
							}
						}
					},
					{
						id: ids.fieldLinkVia,
						view: 'label',
						label: '[Select object] entry.',
						width: 200
					},
				]
			},
			{
				view: 'layout',
				id: ids.link2,
				hidden: true,
				cols: [
					{
						id: ids.fieldLinkVia2,
						view: 'label',
						label: 'Each [Select object] entry connects with ',
						width: 300
					},
					{
						id: ids.linkViaType,
						name: "linkViaType",
						disallowEdit: true,
						view: "richselect",
						value: defaultValues.linkViaType,
						width: 95,
						options: [
							{ id: "many", value: L('ab.dataField.connectObject.hasMany', "*many") },
							{ id: "one", value: L('ab.dataField.connectObject.belongTo', "*one") }
						],
						on: {
							onChange: function (newV, oldV) {
								if (newV == "many") {
									$$(ids.fieldLink2).define("label", $$(ids.fieldLink2).getValue().replace("entry", "entries"));
								} else {
									$$(ids.fieldLink2).define("label", $$(ids.fieldLink2).getValue().replace("entries", "entry"));
								}
								$$(ids.fieldLink2).refresh();
							}
						}
					},
					{
						id: ids.fieldLink2,
						view: 'label',
						width: 200
					},
				]
			},
			{ 
				name: 'linkColumn',
				view: 'text',
				hidden: true
			},
			{ 
				name: 'isSource',
				view: 'text',
				hidden: true
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
			// $$(ids.linkObject).unselectAll();
			$$(ids.linkObject).setValue(defaultValues.linkObject);
		},

		isValid: (ids, isValid) => {

			// validate require select linked object 
			var selectedObjId = $$(ids.linkObject).getValue();
			if (!selectedObjId) {
				webix.html.addCss($$(ids.linkObject).$view, "webix_invalid");
				isValid = false;
			}
			else {
				webix.html.removeCss($$(ids.linkObject).$view, "webix_invalid");
			}

			return isValid;
		},

		show: (pass_ids) => {
			// add objects to list 
			// $$(pass_ids.linkObject).clearAll();
			// $$(pass_ids.linkObject).parse(ABFieldConnectComponent.CurrentApplication.objects());
			populateSelect(false);

			// show current object name
			$$(ids.fieldLink).setValue("Each <b>" + ABFieldConnectComponent.CurrentObject.label + "</b> entry connects with ");
			$$(ids.fieldLink2).setValue("<b>" + ABFieldConnectComponent.CurrentObject.label + "</b> entries.");
		},

		populate: (ids, values) => {

		},

		values: (ids, values) => {

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

		// text to Int:
		this.settings.isSource = parseInt(this.settings.isSource || 0);

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
	columnHeader(isObjectWorkspace, width) {
		var config = super.columnHeader(isObjectWorkspace);

		if (typeof width != "undefined") {
			config.template = '<div style="margin-left: '+width+'px" class="connect-data-values"></div>';			
		} else {
			config.template = '<div class="connect-data-values"></div>';
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
	customDisplay(row, App, node, editable) {
		// sanity check.
		if (!node) { return }

		var domNode = node.querySelector('.connect-data-values');

		var multiselect = (this.settings.linkType == 'many');

		// get selected values
		var selectedData = this.pullRelationValues(row);

		var readOnly = false;
		if (editable != null && editable == false) {
			readOnly = true;
		}

		// Render selectivity
		this.selectivityRender(domNode, {
			multiple: multiselect,
			data: selectedData,
			readOnly: readOnly,
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

		// Listen event when selectivity value updates
		if (domNode && row.id && node) {
			domNode.addEventListener('change', (e) => {

				// update just this value on our current object.model
				var values = {};
				values[this.columnName] = this.selectivityGet(domNode);

				// check data does not be changed
				if (Object.is(values[this.columnName], row[this.columnName])) return;

				// pass null because it could not put empty array in REST api
				if (values[this.columnName].length == 0)
					values[this.columnName] = '';

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
		if (this.settings.linkType == "many") {
			var domNode = node.querySelector('.connect-data-values');

			if (domNode.selectivity != null) {
				// Open selectivity
				domNode.selectivity.open();
				return false;
			}
			return false;
		}
		return false;
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

		// NOTE: what is being returned here needs to mimic an ABView CLASS.
		// primarily the .common() and .newInstance() methods.
		var formComponentSetting = super.formComponent();

		// .common() is used to create the display in the list
		formComponentSetting.common = () => {
			return {
				key: 'fieldcustom'
			}
		};

		return formComponentSetting;
	}

	detailComponent() {

		var detailComponentSetting = super.detailComponent();

		detailComponentSetting.common = () => {
			return {
				key: 'detailselectivity'
			}
		};

		return detailComponentSetting;
	}


	relationName() {
		return String(this.columnName).replace(/[^a-z0-9]/gi, '') + '__relation';
	}


	/**
	 * @method getOptions
	 * show options list in selectivity 
	 * 
	 * @return {Promise}
	 */
	getOptions() {
		return new Promise(
			(resolve, reject) => {

				// check if linked object value is not define, should return a empty array
				if (!this.settings.linkObject) return resolve([]);

				// if options was cached
				// if (this._options != null) return resolve(this._options);


				var linkedCol = this.fieldLink;

				// System could not found the linked object - It may be deleted ?
				if (linkedCol == null) return reject();

				// Get linked object model
				var linkedModel = linkedObj.model();

				var where = [];

				// M:1 - get data that's only empty relation value
				if (this.settings.linkType == 'many' && this.settings.linkViaType == 'one') {
					where.push({
						fieldName: linkedCol.columnName,
						operator: 'is null'
					});
				}
				// 1:1
				else if (this.settings.linkType == 'one' && this.settings.linkViaType == 'one') {
					// 1:1 - get data is not match link id that we have
					if (this.settings.isSource == true) {
						where.push({
							fieldName: linkedCol.columnName,
							operator: 'have no relation'
						});
					}
					// 1:1 - get data that's only empty relation value by query null value from link table
					else {
						where.push({
							fieldName: linkedCol.columnName,
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


	get datasourceLink() {
		return this.object.application.objects((obj) => obj.id == this.settings.linkObject)[0];
	}


	get fieldLink() {
		var objectLink = this. datasourceLink;
		if (!objectLink) return null

		return objectLink.fields((f) => f.id == this.settings.linkColumn)[0];
	}


	/**
	 * @method pullRelationValues
	 * 
	 * 
	 * @param {*} row 
	 * 
	 * @return {array}
	 */
	pullRelationValues(row) {

		var selectedData = [];

		// Get linked object
		var linkedObject = this.object.application.objects((obj) => obj.id == this.settings.linkObject)[0];

		var relationName = this.relationName();
		if (row[relationName]) {

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

		return selectedData;
	}


	getValue(application, object, fieldData, itemNode, rowData, item) {
		var domNode = itemNode.querySelector('.connect-data-values');
		var values = this.selectivityGet(domNode);
		return values;
	}

	setValue(item, value) {
		// get selectivity dom
		var domSelectivity = item.$view.querySelector('.connect-data-values');
		// set value to selectivity
		this.selectivitySet(domSelectivity, value, this.App);
	}



};

export default ABFieldConnect;