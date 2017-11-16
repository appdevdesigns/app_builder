/*
 * ABFieldFile
 *
 * An ABFieldFile defines a string field type.
 *
 */
var path = require('path');
var ABField = require(path.join(__dirname, "ABField.js"));
var _ = require('lodash');
var async = require('async');



function L(key, altText) {
	return altText;  // AD.lang.label.getLabel(key) || altText;
}


var ABFieldFileDefaults = {
	key: 'file', // unique key to reference this specific DataField
	icon: 'font',   // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'		

	// menuName: what gets displayed in the Editor drop list
	menuName: L('ab.dataField.file.menuName', '*File Attachment'),

	// description: what gets displayed in the Editor description.
	description: L('ab.dataField.file.description', '*Attach a file to this object.')
}


var defaultValues = {
	'removeExistingData': 0,
	'fileSize': 0,
	'fileType': ""
}


class ABFieldFile extends ABField {

	constructor(values, object) {
		super(values, object, ABFieldFileDefaults);

		// we're responsible for setting up our specific settings:
		for (var dv in defaultValues) {
			this.settings[dv] = values.settings[dv] || defaultValues[dv];
		}


		// text to Int:
		this.settings.fileSize = parseInt(this.settings.fileSize);
		this.settings.removeExistingData = parseInt(this.settings.removeExistingData);
	}


	// return the default values for this DataField
	static defaults() {
		return ABFieldFileDefaults;
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
	// 	return ABFieldFileComponent.component(App);
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


	/**
	 * @method requestParam
	 * return the entry in the given input that relates to this field.
	 * @param {obj} allParameters  a key=>value hash of the inputs to parse.
	 * @return {obj} or undefined
	 */
	// requestParam(allParameters) {

	// 	var myParameter = super.requestParam(allParameters);

	// 	// do your special convert data here.
	// 	// myParameter[this.columnName] = parseInt(myParameter[this.columnName]);

	// 	return myParameter;
	// }



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


	/**
	 * @function migrateCreate
	 * perform the necessary sql actions to ADD this column to the DB table.
	 * @param {knex} knex the Knex connection.
	 */
	migrateCreate(knex) {
		return new Promise(
			(resolve, reject) => {

				var tableName = this.object.dbTableName();

				// check to make sure we don't already have this column:
				knex.schema.hasColumn(tableName, this.columnName)
					.then((exists) => {

						// create one if it doesn't exist:
						if (!exists) {

							return knex.schema.table(tableName, (t) => {
								t.json(this.columnName).nullable();
							})
								.then(resolve, reject);

						} else {

							// if the column already exists, nothing to do:
							resolve();
						}
					})
			}
		)

	}


	/**
	 * @function migrateDrop
	 * perform the necessary sql actions to drop this column from the DB table.
	 * @param {knex} knex the Knex connection.
	 */
	migrateDrop(knex) {
		return new Promise(
			(resolve, reject) => {

				sails.log.error('!!! TODO: pay attention to the .removeExistingData setting !!!');
				super.migrateDrop(knex)
					.then(resolve)
					.catch(reject);

			}
		)
	}



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

			// techincally we are only storing the uuid as a string.
			obj[this.columnName] = {
				anyOf: [
					{ "type": "object" },
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

}

module.exports = ABFieldFile;
