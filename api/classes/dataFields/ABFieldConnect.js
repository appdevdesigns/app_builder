/*
 * ABFieldConnect
 *
 * An ABFieldConnect defines a connect to other object field type.
 *
 */

var path = require('path');
var ABField = require(path.join(__dirname, "ABField.js"));
var async = require('async');
var _ = require('lodash');

var ABClassObject = require(path.join("..", "ABClassObject"));

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
	linkViaType: 'many', // one, many

	// These values are defined at server side
	linkColumn: '', // ABColumn.id
	isSource: null // bit
};


/**
 * @method getJunctionInfo
 * @param {string} objectName 
 * @param {string} linkObjectName 
 * 
 * @return {Object} {
 * 		tableName {string},
 * 		sourceColumnName {string},
 * 		targetColumnName {string}
 * }
 */
function getJuntionInfo(objectName, linkObjectName) {

	var sourceModel = _.filter(sails.models, m => m.tableName == objectName)[0];
	var targetModel = _.filter(sails.models, m => m.tableName == linkObjectName)[0];
	var juntionModel = _.filter(sails.models, m => {
			return m.meta.junctionTable && // true / false

					// definition: { 
					//	id: { 
					//		primaryKey: true,
					// 	 	unique: true,
					// 	 	autoIncrement: true,
					// 	 	type: 'integer'
					//	},
					//  permissionaction_roles: { 
					//		type: 'integer',
					// 	 	foreignKey: true,
					// 	 	references: 'permissionaction',
					// 	 	on: 'id',
					// 	 	via: 'permissionrole_actions'
					//	},
					//  permissionrole_actions: { 
					//		type: 'integer',
					// 	 	foreignKey: true,
					// 	 	references: 'permissionrole',
					// 	 	on: 'id',
					// 	 	via: 'permissionaction_roles'
					//	} }
					_.filter(m.definition, def => {
						return def.foreignKey == true &&
								(def.references == sourceModel.identity || def.references == targetModel.identity);
					}).length >= 2;
		})[0];

	// Get columns info
	var sourceColumnName = _.filter(juntionModel.definition, def => def.foreignKey == true && def.references == sourceModel.identity )[0].via,
		targetColumnName = _.filter(juntionModel.definition, def => def.foreignKey == true && def.references == targetModel.identity )[0].via;

	return {
		tableName: juntionModel.tableName,
		sourceColumnName: sourceColumnName,
		targetColumnName: targetColumnName
	};
}

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

		// // Query the linked object
		// ABObject.findOne(this.settings.linkObject)
		// 	.then(linkObject => {

		// 		if (linkObject) {
		// 			this.datasourceLink = linkObject.toABClass();
		// 		}

		// 	});

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


	get datasourceLink() {
		// var application = this.object.application,
		// 	linkObject = application.objects((obj) => { return obj.id == this.settings.linkObject; })[0];
		let linkObject = ABClassObject.objectGet(this.settings.linkObject);

		return linkObject;
	}

	fieldLink() {
		var linkObject = this.datasourceLink;

		if (!linkObject) return null;

		return linkObject.fields((f) => f.id == this.settings.linkColumn)[0];
	}


	linkType() {
		return this.settings.linkType;
	}


	linkViaType() {
		return this.settings.linkViaType;
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

				var tableName = this.object.dbTableName(true);

				// find linked object
				var linkObject = this.datasourceLink;
				var linkKnex = ABMigration.connection(linkObject.connName);

				var linkTableName = linkObject.dbTableName(true),
					linkPK = linkObject.PK(),
					// TODO : should check duplicate column
					linkColumnName = this.fieldLink().columnName;
					// linkColumnName = this.object.name;

				// 1:M - create a column in the table and references to id of the link table
				if (this.settings.linkType == 'one' && this.settings.linkViaType == 'many') {

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

								let linkCol;

								if (linkPK == 'id')
									linkCol = t.integer(this.columnName).unsigned().nullable();
								else // uuid
									linkCol = t.string(this.columnName).nullable();

								// NOTE: federated table does not support reference column
								if (!linkObject.isExternal && this.connName == linkObject.connName) {
									linkCol.references(linkPK)
										.inTable(linkTableName)
										.onDelete('SET NULL');
								}

								if (exists)
									linkCol.alter();

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

				// 1:1 - create a column in the table, references to id of the link table and set to be unique
				if (this.settings.linkType == 'one' && this.settings.linkViaType == 'one' &&
					this.settings.isSource) {

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
	
									let linkCol;
									if (linkPK == 'id')
										linkCol = t.integer(this.columnName).unsigned().nullable();
									else // uuid
										linkCol = t.string(this.columnName).nullable();

									// NOTE: federated table does not support reference column
									if (!linkObject.isExternal && this.connName == linkObject.connName) {
										linkCol.references(linkPK)
												.inTable(linkTableName)
												.onDelete('SET NULL');
									}

									t.unique(this.columnName);

									if (exists)
										linkCol.alter();
	
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
							linkKnex.schema.hasColumn(linkTableName, linkColumnName)
								.then((exists) => {
									next(null, exists);
								})
								.catch(next);
						},
						// create a column
						(exists, next) => {
							if (exists) return next();

							linkKnex.schema.table(linkTableName, (t) => {

								let linkCol;
								if (this.object.PK() == 'id')
									linkCol = t.integer(linkColumnName).unsigned().nullable();
								else // uuid
									linkCol = t.string(linkColumnName).nullable();

								// NOTE: federated table does not support reference column
								if (!this.object.isExternal && this.connName == linkObject.connName) {
									linkCol.references(this.object.PK())
											.inTable(tableName)
											.onDelete('SET NULL');
								}

								if (exists)
									linkCol.alter();

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
						getFkName = AppBuilder.rules.toJunctionTableFK;  
						// [add] replaced this with a global rule, so we can reuse it in other 
						// 		 places.
						/* 
						(objectName, columnName) => {

							var fkName = objectName + '_' + columnName;

							if (fkName.length > 64)
								fkName = fkName.substring(0, 64);

							return fkName;
						};
						*/

					var sourceKnex =  (this.settings.isSource ? knex : linkKnex);

					sourceKnex.schema.hasTable(joinTableName).then((exists) => {

						// if it doesn't exist, then create it and any known fields:
						if (!exists) {

							return sourceKnex.schema.createTable(joinTableName, (t) => {
								t.increments('id').primary();
								t.timestamps();
								t.engine('InnoDB');
								t.charset('utf8');
								t.collate('utf8_unicode_ci');

								var sourceFkName = getFkName(this.object.name, this.columnName);
								var targetFkName = getFkName(linkObject.name, linkColumnName);

								// create columns
								let linkCol;
								let linkCol2;

								if (this.object.PK() == 'id')
									linkCol = t.integer(this.object.name).unsigned().nullable();
								else // uuid
									linkCol = t.string(this.object.name).nullable();

								if (linkPK == 'id')
									linkCol2 = t.integer(linkObject.name).unsigned().nullable();
								else // uuid
									linkCol2 = t.string(linkObject.name).nullable();

								// NOTE: federated table does not support reference column
								if ((!this.object.isExternal && !linkObject.isExternal) &&
									(this.connName == linkObject.connName)) {

									linkCol.references(this.object.PK())
										.inTable(tableName)
										.withKeyName(sourceFkName)
										.onDelete('SET NULL');

									linkCol2.references(linkPK)
										.inTable(linkTableName)
										.withKeyName(targetFkName)
										.onDelete('SET NULL');
								}

								// // create columns
								// t.integer(this.object.name).unsigned().nullable()
								// 	.references(this.object.PK())
								// 	.inTable(tableName)
								// 	.withKeyName(sourceFkName)
								// 	.onDelete('SET NULL');

								// t.integer(linkObject.name).unsigned().nullable()
								// 	.references(linkObject.PK())
								// 	.inTable(linkTableName)
								// 	.withKeyName(targetFkName)
								// 	.onDelete('SET NULL');
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

				// if field is imported, then it will not remove column in table
				if (this.object.isImported ||
					this.isImported) return resolve();

				var tableName = this.object.dbTableName(true);

				// M:N
				if (this.settings.linkType == 'many' && this.settings.linkViaType == 'many') {

					// If the linked object is removed, it can not find join table name.
					// The join table should be removed already.
					if (!this.datasourceLink)
						return resolve();

					// drop join table
					var joinTableName = this.joinTableName();

					// get source knex of the join table
					var sourceKnex = knex;
					if (!this.settings.isSource) {
						sourceKnex =  ABMigration.connection(this.datasourceLink.connName);
					}

					sourceKnex.schema.dropTableIfExists(joinTableName)
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
				anyOf: [
					{ "type": "array" },
					{ "type": "number" },
					{ "type": "null" },
					{
						// allow empty string because it could not put empty array in REST api
						"type": "string",
						// "maxLength": 0
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

		var myParameter = super.requestParam(allParameters);

		// pull id of relation value when 1:M and 1:1
		// to prevent REQUIRED column on insert data
		if ((this.settings.linkType == 'one' && this.settings.linkViaType == 'many') || // 1:M
			(this.settings.linkType == 'one' && this.settings.linkViaType == 'one' && this.settings.isSource)) { // 1:1 own table has the connected column

			myParameter = this.requestRelationParam(allParameters);
		}
		// remove relation column value
		// We need to update it in .requestRelationParam
		else if (myParameter) {
			delete myParameter[this.columnName];
		}

		return myParameter;
	}


	requestRelationParam(allParameters) {

		var myParameter = super.requestRelationParam(allParameters);
		if (myParameter) {

			if (myParameter[this.columnName]) {

				let PK;
				let datasourceLink = this.datasourceLink;
				if (datasourceLink) {
					PK = datasourceLink.PK();
				}

				// if value is array, then get id of array
				if (myParameter[this.columnName].forEach) {
					let result = [];

					myParameter[this.columnName].forEach(function (d) {

						let val = d[PK] || d.id || d;

						if (PK == 'id') {
							val = parseInt(d[PK] || d.id || d);

							// validate INT value
							if (val && !isNaN(val))
								result.push(val);
						}
						// uuid
						else {
							result.push(val);
						}

					});

					myParameter[this.columnName] = result;
				}
				// if value is a object
				else {

					myParameter[this.columnName] = myParameter[this.columnName][PK] || myParameter[this.columnName].id || myParameter[this.columnName];

					if (PK == 'id') {
						myParameter[this.columnName] = parseInt(myParameter[this.columnName]);

						// validate INT value
						if (isNaN(myParameter[this.columnName]))
							myParameter[this.columnName] = null;
					}

				}


			}
			else {
				// myParameter[this.columnName] = [];
				myParameter[this.columnName] = null;
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

		var relationName = AppBuilder.rules.toFieldRelationFormat(this.columnName);

		return relationName;
	}

	joinTableName(prefixSchema = false) {

		var linkObject = this.datasourceLink;
		var tableName = "";

		if (this.object.isExternal && linkObject.isExternal) {

			var juntionModel = getJuntionInfo(this.object.tableName, this.datasourceLink.tableName);

			tableName = juntionModel.tableName;

		}
		else {

			var sourceObjectName,
				targetObjectName,
				columnName;

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
			tableName = AppBuilder.rules.toJunctionTableNameFormat(
											this.object.application.name, // application name
											sourceObjectName, // table name
											targetObjectName, // linked table name
											columnName); // column name
		}

		if (prefixSchema) {
			
			// pull database name
			var schemaName = "";
			if (this.settings.isSource == true)
				schemaName = this.object.dbSchemaName();
			else
				schemaName = linkObject.dbSchemaName();


			return "#schema#.#table#"
					.replace("#schema#", schemaName)
					.replace("#table#", tableName);
		}
		else {
			return tableName;
		}

	}

	/**
	 * @method joinColumnNames
	 * 
	 * @return {Object} - {
	 * 		sourceColName {string},
	 * 		targetColName {string}
	 * }
	 */
	joinColumnNames() {

		var sourceColumnName = "",
			targetColumnName = "";

		var objectLink = this.datasourceLink;

		if (this.object.isExternal && objectLink.isExternal) {

			var juntionModel = getJuntionInfo(this.object.tableName, this.datasourceLink.tableName);

			sourceColumnName = juntionModel.sourceColumnName;
			targetColumnName = juntionModel.targetColumnName;
		}
		else {

			sourceColumnName = this.object.name;
			targetColumnName = this.datasourceLink.name;

			// if (this.settings.isSource == true) {
			// 	sourceColumnName = this.object.name;
			// 	targetColumnName = this.datasourceLink.name;
			// }
			// else {
			// 	sourceColumnName = this.datasourceLink.name;
			// 	targetColumnName = this.object.name;
			// }
		}

		return {
			sourceColumnName: sourceColumnName,
			targetColumnName: targetColumnName
		};

	}


}

module.exports = ABFieldConnect;
