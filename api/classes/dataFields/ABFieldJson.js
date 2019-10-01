/*
 * ABFieldJson
 *
 * An ABFieldJson defines a JSON field type.
 *
 */
var path = require('path');
var ABField = require(path.join(__dirname, "ABField.js"));
var _ = require('lodash');



function L(key, altText) {
	return altText;  // AD.lang.label.getLabel(key) || altText;
}


var ABFieldJsonDefaults = {
	key: 'json', // unique key to reference this specific DataField
	icon: 'font',   // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'		

	// menuName: what gets displayed in the Editor drop list
	menuName: L('ab.dataField.json.menuName', '*JSON'),

	// description: what gets displayed in the Editor description.
	description: L('ab.dataField.json.description', '*JSON value'),

	// what types of Sails ORM attributes can be imported into this data type?
	// http://sailsjs.org/documentation/concepts/models-and-orm/attributes#?attribute-options
	compatibleOrmTypes: ['json'],

	// what types of MySql column types can be imported into this data type?
	// https://www.techonthenet.com/mysql/datatypes.php
	compatibleMysqlTypes: ['json']
}



class ABFieldJson extends ABField {

	constructor(values, object) {
		super(values, object, ABFieldJsonDefaults);

	}


	// return the default values for this DataField
	static defaults() {
		return ABFieldJsonDefaults;
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
	// 	return ABFieldJsonComponent.component(App);
	// }



	///
	/// Instance Methods
	///




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
		return new Promise(
			(resolve, reject) => {

				var tableName = this.object.dbTableName();

				// if this column doesn't already exist (you never know)
				knex.schema.hasColumn(tableName, this.columnName)
					.then((exists) => {

						return knex.schema.table(tableName, (t) => {

							var currCol = t.json(this.columnName);
							currCol.nullable();

							if (exists)
								currCol.alter();

						})
							.then(() => { resolve(); })
							.catch(reject);

					});

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



	///
	/// DB Model Services
	///

	/**
	 * @method jsonSchemaProperties
	 * register your current field's properties here:
	 */
	jsonSchemaProperties(obj) {

		// obj[this.columnName] = { type: 'object' }
		obj[this.columnName] = { type: 'string' }

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



module.exports = ABFieldJson;
