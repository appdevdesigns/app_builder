/*
 * ABFieldConnect
 *
 * An ABFieldConnect defines a connect to other object field type.
 *
 */

var path = require('path');
var ABField = require(path.join(__dirname, "ABField.js"));

function L(key, altText) {
	return altText;  // AD.lang.label.getLabel(key) || altText;
}


var ABFieldConnectDefaults = {
	key: 'connectObject', // unique key to reference this specific DataField
	icon: 'external-link',   // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'		

	// menuName: what gets displayed in the Editor drop list
	menuName: L('ab.dataField.connectObject.menuName', '*Connect to another record'),

	// description: what gets displayed in the Editor description.
	description: ''
}

var defaultValues = {
	linkObject: '', // ABObject.id
	linkType: 'one', // one, many
	linkViaType: 'many' // one, many
};

class ABFieldConnect extends ABField {

    constructor(values, object) {
		super(values, object, ABFieldConnectDefaults);


    	/*
    	{
			settings: {
				textDefault: 'string',
				supportMultilingual: true/false
			}
    	}
    	*/

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
	// static propertiesComponent(App) {
	// 	return ABFieldConnectComponent.component(App);
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

						// create one if it doesn't exist:
						if (!exists) {

							// find linked object
							var application = this.object.application;
							var linkedObject = application._objects.filter((obj) => { return obj.id == this.settings.linkObject; })[0];

							return knex.schema.table(tableName, (t) => {

								t.integer(this.columnName).unsigned();

								// create a reference to id column of linked table
								var linkedColName = '#linked_object#.id'.replace('#linked_object#', linkedObject.dbTableName());

								t.foreign(this.columnName).references(linkedColName);

							})
								.then(() => {
									resolve();
								})
								.catch(reject);

						} else {

							// there is already a column for this, so move along.
							resolve();
						}
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



	///
	/// DB Model Services
	///

	/**
	 * @method jsonSchemaProperties
	 * register your current field's properties here:
	 */
	jsonSchemaProperties(obj) {
		// take a look here:  http://json-schema.org/example1.html

		// if our field is not already defined:
		if (!obj[this.columnName]) {

			obj[this.columnName] = { type: 'integer' }

		}

	}


	/**
	 * @method requestParam
	 * return the entry in the given input that relates to this field.
	 * @param {obj} allParameters  a key=>value hash of the inputs to parse.
	 * @return {obj} or undefined
	 */
	requestParam(allParameters) {
		var myParameter;

		myParameter = super.requestParam(allParameters);

		return myParameter;
	}


}

module.exports = ABFieldConnect;