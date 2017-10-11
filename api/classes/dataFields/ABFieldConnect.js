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
	description: '',
	
	// what types of Sails ORM attributes can be imported into this data type?
	// http://sailsjs.org/documentation/concepts/models-and-orm/attributes#?attribute-options
	compatibleOrmTypes: ['connectObject'],
}

var defaultValues = {
	linkObject: '', // ABObject.id
	linkType: 'one', // one, many
	linkViaType: 'many', // one, many

	// These values are defined at server side
	linkColumn: '', // ABColumn.id
	isSource: null // bit
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

		// text to Int:
		this.settings.isSource = parseInt(this.settings.isSource || 0);

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


	objectLink() {
		var application = this.object.application,
			linkObject = application.objects((obj) => { return obj.id == this.settings.linkObject; })[0];

		return linkObject;
	}

	fieldLink() {
		var linkObject = this.objectLink();

		if (!linkObject) return null;

		return linkObject.fields((f) => f.id == this.settings.linkColumn)[0];
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

				var tableName = this.object.dbTableName();

				// find linked object
				var application = this.object.application,
					linkObject = this.objectLink(),
					linkTableName = linkObject.dbTableName(),
					// TODO : should check duplicate column
					linkColumnName = this.object.name;


				// 1:M - create a column in the table and references to id of the link table
				// 1:1 - create a column in the table, references to id of the link table and set to be unique
				if ((this.settings.linkType == 'one') &&
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

								t.integer(this.columnName).unsigned().nullable()
									.references('id').inTable(linkTableName).onDelete('cascade');

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

				// M:1 - create a column in the link table and references to id of the target table
				else if (this.settings.linkType == 'many' && this.settings.linkViaType == 'one') {

					async.waterfall([
						// check column already exist
						(next) => {
							knex.schema.hasColumn(linkTableName, linkColumnName)
								.then((exists) => {
									next(null, exists);
								})
								.catch(next);
						},
						// create a column
						(exists, next) => {
							if (exists) return next();

							knex.schema.table(linkTableName, (t) => {

								t.integer(linkColumnName).unsigned().nullable()
									.references('id').inTable(tableName).onDelete('cascade');
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

					var joinTableName = this.joinTableName(),
						getFkName = (objectName, columnName) => {

							var fkName = objectName + '_' + columnName;

							if (fkName.length > 64)
								fkName = fkName.substring(0, 64);

							return fkName;
						};

					knex.schema.hasTable(joinTableName).then((exists) => {

						// if it doesn't exist, then create it and any known fields:
						if (!exists) {

							return knex.schema.createTable(joinTableName, (t) => {
								t.increments('id').primary();
								t.timestamps();
								t.engine('InnoDB');
								t.charset('utf8');
								t.collate('utf8_unicode_ci');

								var sourceFkName = getFkName(this.object.name, this.columnName);
								var targetFkName = getFkName(linkObject.name, linkColumnName);

								// create columns
								t.integer(this.object.name).unsigned().nullable()
									.references('id').inTable(tableName).withKeyName(sourceFkName).onDelete('cascade');

								t.integer(linkObject.name).unsigned().nullable()
									.references('id').inTable(linkTableName).withKeyName(targetFkName).onDelete('cascade');
							})
								.then(() => { resolve(); })
								.catch(reject);

						} else {
							resolve();
						}
					});

				}
				else {
					resolve();
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

				// M:N
				if (this.settings.linkType == 'many' && this.settings.linkViaType == 'many') {
					// drop join table
					var joinTableName = this.joinTableName();

					knex.schema.dropTableIfExists(joinTableName)
						.then(() => {

							super.migrateDrop(knex)
								.then(() => resolve(), reject);
						});
				}
				// M:1,  1:M,  1:1
				else {
					// drop foreign key
					knex.schema.table(tableName, (t) => {
						t.dropForeign(this.columnName)
							.dropIndex(this.columnName)
							.dropUnique(this.columnName);
					})
						.then(() => {
							// drop column
							super.migrateDrop(knex)
								.then(() => resolve(), reject);
						})
						//	always pass, becuase ignore not found index errors.
						.catch((err) => {
							// drop column
							super.migrateDrop(knex)
								.then(() => resolve(), reject);
						});
				}


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
				type: ["null", "number", "array"]
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

		// remove relation column value
		// We need to update it separately
		if (myParameter != null)
			delete myParameter[this.columnName];

		return myParameter;
	}


	requestRelationParam(allParameters) {
		var myParameter;

		myParameter = super.requestRelationParam(allParameters);

		if (myParameter) {

			if (myParameter[this.columnName]) {

				// if value is array, then get id of array
				if (myParameter[this.columnName].map) {
					myParameter[this.columnName] = myParameter[this.columnName].map(function (d) {
						return parseInt(d.id || d);
					});
				}
				// if value is a object
				else {
					myParameter[this.columnName] = parseInt(myParameter[this.columnName].id || myParameter[this.columnName]);
				}


			}
			else {
				myParameter[this.columnName] = [];
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


	relationName() {
		return AppBuilder.rules.toFieldRelationFormat(this.columnName);
	}

	joinTableName() {
		var sourceObjectName,
			targetObjectName,
			columnName;

		var linkObject = this.object.application.objects((obj) => { return obj.id == this.settings.linkObject; })[0];

		if (this.settings.isSource == true) {
			sourceObjectName = this.object.name;
			targetObjectName = linkObject.name;
			columnName = this.columnName;
		}
		else {
			sourceObjectName = linkObject.name;
			targetObjectName = this.object.name;
			columnName = this.fieldLink().columnName;
		}

		// return join table name
		return AppBuilder.rules.toJunctionTableNameFormat(
			this.object.application.name, // application name
			sourceObjectName, // table name
			targetObjectName, // linked table name
			columnName); // column name
	}

}

module.exports = ABFieldConnect;