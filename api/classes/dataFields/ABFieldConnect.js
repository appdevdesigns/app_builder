/*
 * ABFieldConnect
 *
 * An ABFieldConnect defines a connect to other object field type.
 *
 */

var path = require('path');
var ABField = require(path.join(__dirname, "ABField.js"));
var async = require('async');

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

				// find linked object
				var application = this.object.application;
				var linkedTableName = application._objects.filter((obj) => { return obj.id == this.settings.linkObject; })[0].dbTableName();

				// 1:M - create a column in target table and references to id of linked table
				// 1:1 - create a column in table, references to id of linked table and set to be unique
				if (this.settings.linkType == 'one' &&
					(this.settings.linkViaType == 'many' || this.settings.linkViaType == 'one')) {

					async.waterfall([
						// check column already exist
						(next) => {
							knex.schema.hasColumn(tableName, this.columnName)
								.then((exists) => {
									next(null, exists);
								})
								.catch(next);
						},
						// create a column
						(exists, next) => {
							if (exists) return next();

							knex.schema.table(tableName, (t) => {

								var linkedColName = '#linked_object#.id'.replace('#linked_object#', linkedTableName);

								t.integer(this.columnName).unsigned().nullable();

								t.foreign(this.columnName).references(linkedColName);

								// 1:1
								if (this.settings.linkViaType == 'one') {
									t.unique(this.columnName);
								}

							})
								.then(() => { next(); })
								.catch(next);
						}
					],
						(err) => {
							if (err) reject(err);
							else resolve();
						});

				}

				// M:1 - create a column in linked table and references to id of target table
				else if (this.settings.linkType == 'many' && this.settings.linkViaType == 'one') {

					async.waterfall([
						// check column already exist
						(next) => {
							knex.schema.hasColumn(linkedTableName, this.columnName)
								.then((exists) => {
									next(null, exists);
								})
								.catch(next);
						},
						// create a column
						(exists, next) => {
							if (exists) return next();

							knex.schema.table(linkedTableName, (t) => {

								var linkedColName = '#linked_object#.id'.replace('#linked_object#', tableName);

								t.integer(this.columnName).unsigned().nullable();

								t.foreign(this.columnName).references(linkedColName);

							})
								.then(() => { next(); })
								.catch(next);
						}
					],
						(err) => {
							if (err) reject(err);
							else resolve();
						});

				}

				// M:N - create a new table and references to id of target table and linked table
				else if (this.settings.linkType == 'many' && this.settings.linkViaType == 'many') {

				}

			}
		);
	}



	/**
	 * @function migrateDrop
	 * perform the necessary sql actions to drop this column from the DB table.
	 * @param {knex} knex the Knex connection.
	 */
	migrateDrop(knex) {
		return new Promise(
			(resolve, reject) => {
				var tableName = this.object.dbTableName();

				// drop foreign key
				knex.schema.table(tableName, (t) => {
					t.dropForeign(this.columnName)
						.dropIndex(this.columnName)
						.dropUnique(this.columnName);
				})
					//	always pass, becuase ignore not found index errors.
					.then(() => {
						// drop column
						super.migrateDrop(knex)
							.then(() => resolve(), reject);
					})
					.catch(() => {
						// drop column
						super.migrateDrop(knex)
							.then(() => resolve(), reject);
					});
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

			obj[this.columnName] = {
				"anyOf": [
					{
						type: "integer"
					},
					{
						// allow empty string because it could not put empty array in REST api
						type: "string",
						maxLength: 0
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
		var myParameter;

		myParameter = super.requestParam(allParameters);
		if (myParameter) {

			if (!_.isUndefined(myParameter[this.columnName])) {

				myParameter[this.columnName] = parseInt(myParameter[this.columnName]);

			}

		}

		return myParameter;
	}


}

module.exports = ABFieldConnect;