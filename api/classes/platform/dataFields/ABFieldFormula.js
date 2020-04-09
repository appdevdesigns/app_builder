/*
 * ABFieldBoolean
 *
 * An ABFieldBoolean defines a Date field type.
 *
 */
const path = require('path');
const ABFieldFormulaCore = require(path.join(__dirname, "..", "..", "core", "dataFields", "ABFieldFormulaCore.js"));

module.exports = class ABFieldFormula extends ABFieldFormulaCore {

	constructor(values, object) {
		super(values, object);
	}

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

				resolve();

			}
		);
	}


	/**
	 * @function migrateUpdate
	 * perform the necessary sql actions to MODIFY this column to the DB table.
	 * @param {knex} knex the Knex connection.
	 */
	migrateUpdate(knex) {

		return this.migrateCreate(knex);

	}


	/**
	 * @function migrateDrop
	 * perform the necessary sql actions to drop this column from the DB table.
	 * @param {knex} knex the Knex connection.
	 */
	migrateDrop(knex) {

		return new Promise(
			(resolve, reject) => {

				resolve();

			}
		);

	}

	/**
	 * @method requestParam
	 * return the entry in the given input that relates to this field.
	 * @param {obj} allParameters  a key=>value hash of the inputs to parse.
	 * @return {obj} or undefined
	 */
	requestParam(allParameters) {

		let myParameter = super.requestParam(allParameters);
		if (myParameter) {
			delete myParameter[this.columnName];
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

			obj[this.columnName] = { "type": "null" };

		}
	}


};