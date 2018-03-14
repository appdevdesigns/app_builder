/*
 * ABFieldBoolean
 *
 * An ABFieldBoolean defines a Date field type.
 *
 */
var path = require('path');
var ABField = require(path.join(__dirname, "ABField.js"));

function L(key, altText) {
	return altText;  // AD.lang.label.getLabel(key) || altText;
}

var ABFieldBooleanDefaults = {
	key: 'boolean', // unique key to reference this specific DataField

	icon: 'check-square-o',   // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'

	// menuName: what gets displayed in the Editor drop list
	menuName: L('ab.dataField.boolean.menuName', '*Checkbox'),

	// description: what gets displayed in the Editor description.
	description: L('ab.dataField.boolean.description', '*A single checkbox that can be checked or unchecked.'),
	
	// what types of Sails ORM attributes can be imported into this data type?
	// http://sailsjs.org/documentation/concepts/models-and-orm/attributes#?attribute-options
	compatibleOrmTypes: ['boolean', 'binary'],
};

var defaultValues = {
	default: 0
};

class ABFieldBoolean extends ABField {

	constructor(values, object) {
		super(values, object, ABFieldBooleanDefaults);

		// we're responsible for setting up our specific settings:
		for (var dv in defaultValues) {
			this.settings[dv] = values.settings[dv] || defaultValues[dv];
		}

		if (this.settings.default != null)
			this.settings.default = parseInt(this.settings.default);
	}


	// return the default values for this DataField
	static defaults() {
		return ABFieldBooleanDefaults;
	}


	/*
	 * @function propertiesComponent
	 *
	 * return a UI Component that contains the property definitions for this Field.
	 *
	 * @param {App} App the UI App instance passed around the Components.
	 * @return {Component}
	 */
	// static propertiesComponent(App) {
	// 	return ABFieldBooleanComponent.component(App);
	// }



	///
	/// Instance Methods
	///


	isValid() {

		var errors = super.isValid();

		// errors = OP.Form.validationError({
		// 	name:'columnName',
		// 	message:L('ab.validation.object.name.unique', 'Field columnName must be unique (#name# already used in this Application)').replace('#name#', this.name),
		// }, errors);

		return errors;
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
	/// DB Migrations
	///


	/**
	 * @function migrateCreate
	 * perform the necessary sql actions to ADD this column to the DB table.
	 * @param {knex} knex the Knex connection.
	 */
	migrateCreate(knex) {
		return new Promise(
			(resolve, reject) => {

				var tableName = this.object.dbTableName();

				// if this column doesn't already exist (you never know)
				knex.schema.hasColumn(tableName, this.columnName)
					.then((exists) => {

						return knex.schema.table(tableName, (t) => {

							var newCol = t.boolean(this.columnName);

							// Set default value to column
							if (this.settings['default'] != null) {
								newCol.defaultTo(this.settings['default']);
							}

							// alter column when exist:
							if (exists) {
								newCol.alter();
							}
						})
							.then(() => { resolve(); })
							.catch(reject);

					});

			}
		);
	}


	/**
	 * @function migrateDrop
	 * perform the necessary sql actions to drop this column from the DB table.
	 * @param {knex} knex the Knex connection.
	 */
	// NOTE: ABField.migrateDrop() is pretty good for most cases.
	// migrateDrop (knex) {
	// 	return new Promise(
	// 		(resolve, reject) => {
	// 			// do your special drop operations here.
	// 		}
	// 	)
	// }


	/**
	 * @method jsonSchemaProperties
	 * register your current field's properties here:
	 */
	jsonSchemaProperties(obj) {
		// take a look here:  http://json-schema.org/example1.html

		// if our field is not already defined:
		if (!obj[this.columnName]) {
			obj[this.columnName] = {
				anyOf: [
					{ "type": "boolean" },
					{ "type": "null" },
					{
						// allow empty string because it could not put empty array in REST api
						"type": "string",
						"maxLength": 0
					}
				]
			};

		}

	}


	/**
	 * @method requestParam
	 * return the entry in the given input that relates to this field.
	 * @param {obj} allParameters  a key=>value hash of the inputs to parse.
	 * @return {obj} or undefined
	 */
	requestParam(allParameters) {

		var myParameter = super.requestParam(allParameters);
		if (myParameter) {

			if (!_.isUndefined(myParameter[this.columnName])) {

				myParameter[this.columnName] = (myParameter[this.columnName] == 1);

			}
		}

		return myParameter;
	}


	/**
	 * @method isValidParams
	 * Parse through the given parameters and return an error if this field's
	 * data seems invalid.
	 * @param {obj} allParameters  a key=>value hash of the inputs to parse.
	 * @return {array}
	 */
	isValidData(allParameters) {
		var errors = [];

		return errors;
	}

}



module.exports = ABFieldBoolean;