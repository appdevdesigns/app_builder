/*
 * ABFieldAutoIndex
 *
 * An ABFieldAutoIndex defines a string field type.
 *
 */
var path = require('path');
var ABField = require(path.join(__dirname, "ABField.js"));
var _ = require('lodash');
var async = require('async');



function L(key, altText) {
	return altText;  // AD.lang.label.getLabel(key) || altText;
}


var ABFieldAutoIndexDefaults = {
	key: 'AutoIndex', // unique key to reference this specific DataField
	icon: 'key',   // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'		

	// menuName: what gets displayed in the Editor drop list
	menuName: L('ab.dataField.AutoIndex.menuName', '*Menu name'),

	// description: what gets displayed in the Editor description.
	description: L('ab.dataField.AutoIndex.description', '*Description')
}



class ABFieldAutoIndex extends ABField {

	constructor(values, object) {
		super(values, object, ABFieldAutoIndexDefaults);

    	/*
    	{
			settings: {
			}
    	}
    	*/

		// this.settings = values.settings || {};

		// we're responsible for setting up our specific settings:

		// // text to Int:
		// this.settings.supportMultilingual = parseInt(this.settings.supportMultilingual);
		this.settings.currentIndex = parseInt(this.settings.currentIndex);
		this.settings.displayLength = parseInt(this.settings.displayLength);

	}


  	// return the default values for this DataField
  	static defaults() {
		return ABFieldAutoIndexDefaults;
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
	// 	return ABFieldAutoIndexComponent.component(App);
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
						var currCol = t.string(this.columnName);
						currCol.defaultTo(null);
						currCol.unique();

						if (exists) 
							currCol.alter();

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
			obj[this.columnName] = { type:'string' }

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


}



module.exports = ABFieldAutoIndex;
