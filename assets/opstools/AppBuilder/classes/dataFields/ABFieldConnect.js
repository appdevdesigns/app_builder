/*
 * ABFieldConnect
 *
 * An ABFieldConnect defines a connect to other object field type.
 *
 */

import ABField from "./ABField"
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
	description: ''
};

var defaultValues = {
	linkObject: '', // ABObject.id
	linkType: 'one', // one, many
	linkViaType: 'many' // one, many
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
				name: 'objectList',
				select: true,
				height: 140,
				template: "<div class='ab-new-connectObject-list-item'>#label#</div>",
				on: {
					onAfterSelect: function () {
						var selectedObjLabel = this.getSelectedItem(false).label;
						$$(ids.fieldLinkVia).setValue(selectedObjLabel);
						$$(ids.fieldLinkVia2).setValue(selectedObjLabel);
					}
				}
			},
			{
				view: 'button',
				id: ids.objectCreateNew,
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
						name: 'fieldLink',
						view: 'label',
						width: 110
					},
					{
						id: ids.linkType,
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
						name: 'fieldLink2',
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


		isValid: function (ids, isValid) {

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

		show: (ids) => {
			// add objects to list 
			$$(ids.objectList).clearAll();
			$$(ids.objectList).parse(ABFieldConnectComponent.CurrentApplication.objects());

			// show current object name
			$$(ids.fieldLink).setValue(ABFieldConnectComponent.CurrentObject.label);
			$$(ids.fieldLink2).setValue(ABFieldConnectComponent.CurrentObject.label);
		},

		populate: (ids, values) => {
			// select linked object in list
			if (values.settings.linkObject)
				$$(ids.objectList).select(values.settings.linkObject);
		},

		values: (ids, values) => {

			// get select linked object id
			values.settings.linkObject = $$(ids.objectList).getSelectedId();

			return values;
		}

	}

});

class ABFieldConnect extends ABField {
	constructor(values, object) {
		super(values, object, ABFieldConnectDefaults);

		// we're responsible for setting up our specific settings:
		for (var dv in defaultValues) {
			this.settings[dv] = values.settings[dv] || defaultValues[dv];
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

		config.template = '<div class="connect-data-values"></div>';

		return config;
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

};

export default ABFieldConnect;