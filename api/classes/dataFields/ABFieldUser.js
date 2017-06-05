/*
 * ABFieldUser
 *
 * An ABFieldUser defines a user field type.
 *
 */
var path = require('path');
var ABField = require(path.join(__dirname, "ABField.js"));
var _ = require('lodash');



function L(key, altText) {
	return altText;  // AD.lang.label.getLabel(key) || altText;
}


var ABFieldUserDefaults = {
	key : 'user', // unique key to reference this specific DataField
	icon : 'user-o',   // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'

	// menuName: what gets displayed in the Editor drop list
	menuName : L('ab.dataField.user.menuName', '*User'),

	// description: what gets displayed in the Editor description.
	description: L('ab.dataField.user.description', '*Add user/s to a record.')
}

var defaultValues = {
	'editable':0,
	'multiSelect':0,
	'defaultCurrentUser':0
}

class ABFieldUser extends ABField {

    constructor(values, object) {
    	super(values, object, ABFieldUserDefaults);

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

    	// text to Int:
    	this.settings.editable = parseInt(this.settings.editable);
		this.settings.multiSelect = parseInt(this.settings.multiSelect);
		this.settings.defaultCurrentUser = parseInt(this.settings.defaultCurrentUser);
  	}


  	// return the default values for this DataField
  	static defaults() {
  		return ABFieldUserDefaults;
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
  	// 	return ABFieldUserComponent.component(App);
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
	migrateCreate (knex) {
		return new Promise(
			(resolve, reject) => {

				var tableName = this.object.dbTableName();

				knex.schema.hasColumn(tableName, this.columnName)
				.then((exists) => {

					if (!exists) {
						knex.schema.table(tableName, (t) => {
							if (this.settings.defaultCurrentUser) {
								// t.string(this.columnName).defaultTo();
								t.string(this.columnName).nullable();
							} else {
								t.string(this.columnName).nullable();
							}
						})
						.then(resolve, reject);

					} else {
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

		// we're not multilingual, so just tack this one on:
		if (!obj[this.columnName]) {
			obj[this.columnName] = { type:'json' }
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



	/**
	 * @method postGet
	 * Perform any final conditioning of data returned from our DB table before
	 * it is returned to the client.
	 * @param {obj} data  a json object representing the current table row
	 */
	postGet( data ) {
		return new Promise(
			(resolve, reject) => {
				//Not doing anything here...yet
				resolve();
			}
		)
	}

}



module.exports = ABFieldUser;
