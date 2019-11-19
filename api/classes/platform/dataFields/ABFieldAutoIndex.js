/*
 * ABFieldAutoIndex
 *
 * An ABFieldAutoIndex defines a string field type.
 *
 */
const path = require('path');
const ABFieldAutoIndexCore = require(path.join(__dirname, "..", "..", "core", "dataFields", "ABFieldAutoIndexCore.js"));

module.exports = class ABFieldAutoIndex extends ABFieldAutoIndexCore {

	constructor(values, object) {
		super(values, object);
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

			var tableName = this.object.dbTableName();

			// if this column doesn't already exist (you never know)
			knex.schema.hasColumn(tableName, this.columnName)
				.then((exists) => {

					return knex.schema.table(tableName, (t) => {

						// Create a new column here.
						if (!exists)
							t.specificType(this.columnName, "INT UNSIGNED NULL AUTO_INCREMENT UNIQUE");

						// var currCol = t.integer(this.columnName)
						// 				.nullable();

						// if (exists) 
						// 	currCol.alter();
						// else
						// 	currCol.unique();

					})
						.then(() => {
							resolve();
						})
						.catch(reject);
				})

		});
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
	 * @function migrateUpdate
	 * perform the necessary sql actions to MODIFY this column to the DB table.
	 * @param {knex} knex the Knex connection.
	 */
	migrateUpdate (knex) {
		
		return this.migrateCreate(knex);

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

			// Set json schema type to validate
			// obj[this.columnName] = { type:'string' }
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

		// // To prevent return empty string ''
		// if (myParameter &&
		// 	!myParameter[this.columnName])
		// 	delete myParameter[this.columnName];

		// Remove every values, then we will use AUTO_INCREMENT of MySQL
		if (myParameter &&
			myParameter[this.columnName] != null)
			delete myParameter[this.columnName];

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