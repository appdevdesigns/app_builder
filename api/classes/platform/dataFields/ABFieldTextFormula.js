/*
 * ABFieldTextFormula
 *
 * An ABFieldTextFormula defines a string field type.
 *
 */
const path = require('path');
const ABFieldTextFormulaCore = require(path.join(__dirname, "..", "..", "core", "dataFields", "ABFieldTextFormulaCore.js"));

module.exports = class ABFieldTextFormula extends ABFieldTextFormulaCore {

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
	 * @return {Promise}
	 */
	migrateCreate(knex) {
		return new Promise((resolve, reject) => {

			resolve();
			// var tableName = this.object.dbTableName();

			// // if this column doesn't already exist (you never know)
			// knex.schema.hasColumn(tableName, this.columnName)
			// 	.then((exists) => {

			// 		return knex.schema.table(tableName, (t) => {

			// 			// Create a new column here.
			// 			// t.string(this.columnName);

			// 		})
			// 			.then(() => {
			// 				resolve();
			// 			})
			// 			.catch(reject);
			// 	})

		});
	}

	/**
	 * @function migrateUpdate
	 * perform the necessary sql actions to MODIFY this column to the DB table.
	 * @param {knex} knex the Knex connection.
	 */
	migrateUpdate (knex) {
		
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





	/**
	 * @method requestParam
	 * return the entry in the given input that relates to this field.
	 * @param {obj} allParameters  a key=>value hash of the inputs to parse.
	 * @return {obj} or undefined
	 */
	requestParam(allParameters) {

		var myParameter = super.requestParam(allParameters);

		// do your special convert data here.
		// myParameter[this.columnName] = parseInt(myParameter[this.columnName]);

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


};