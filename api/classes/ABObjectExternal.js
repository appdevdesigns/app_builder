var path = require('path');
var _ = require('lodash');

var ABObject = require(path.join(__dirname, 'ABObject'));

var Model = require('objection').Model;

var __ModelPool = __ModelPool || {};  // reuse any previously created Model connections
										// to minimize .knex bindings (and connection pools!)

module.exports = class ABObjectExternal extends ABObject {


	dbTableName(prefixSchema = false) {

		if (prefixSchema) {

			// pull database name
			var schemaName = this.dbSchemaName();

			return "#schema#.#table#"
				.replace("#schema#", schemaName)
				.replace("#table#", this.tableName);
		}
		else {
			return this.tableName;
		}
	}


	/**
	 * migrateCreateTable
	 * verify that a table for this object exists.
	 * @param {Knex} knex the knex sql library manager for manipulating the DB.
	 * @return {Promise}
	 */
	migrateCreate(knex) {
		sails.log.verbose('ABObjectExternal.migrateCreate()');

		return new Promise(
			(resolve, reject) => {

				sails.log.silly('.... aborted create new external table');
				resolve();

			}
		)
	}

	/**
	 * migrateDropTable
	 * remove the table for this object if it exists.
	 * @param {Knex} knex the knex sql library manager for manipulating the DB.
	 * @return {Promise}
	 */
	migrateDrop(knex) {
		sails.log.verbose('ABObjectExternal.migrateDrop()');

		return new Promise(
			(resolve, reject) => {

				sails.log.silly('.... aborted drop of external table');
				resolve();

			}
		);
	}


	///
	/// DB Model Services
	///

	/**
	 * @method model
	 * return an objection.js model for working with the data in this Object.
	 * @return {Objection.Model} 
	 */
	model() {

		var tableName = this.dbTableName(true);


		if (!__ModelPool[tableName]) {

			var knex = ABMigration.connection(this.connName || undefined);

			// Compile our jsonSchema from our DataFields
			// jsonSchema is only used by Objection.js to validate data before
			// performing an insert/update.
			// This does not DEFINE the DB Table.
			var jsonSchema = {
				type: 'object',
				required: [],
				properties: {

					created_at: { type: ['null', 'string'], pattern: AppBuilder.rules.SQLDateTimeRegExp },
					updated_at: { type: ['null', 'string'], pattern: AppBuilder.rules.SQLDateTimeRegExp },
					properties: { type: ['null', 'object'] }

				}
			}
			var currObject = this;
			var allFields = this.fields();
			allFields.forEach(function (f) {
				f.jsonSchemaProperties(jsonSchema.properties);
			})


			class MyModel extends Model {

				// Table name is the only required property.
				static get tableName() {
					return tableName;
				}

				static get idColumn() {
					return currObject.PK();
				}

				static get jsonSchema() {
					return jsonSchema
				}

				// Move relation setup to below
				// static get relationMappings () {
				// }

			}

			__ModelPool[tableName] = MyModel;

			// NOTE : there is relation setup here because prevent circular loop when get linked object.
			// have to define object models to __ModelPool[tableName] first
			MyModel.relationMappings = function () {
				// Compile our relations from our DataFields
				var relationMappings = {};

				// Add a translation relation of the external table
				if (currObject.transColumnName) {

					var transJsonSchema = {
						language_code: { type: 'string' }
					};

					// Populate fields of the trans table
					var multilingualFields = currObject.fields(f => f.settings.supportMultilingual == 1);
					multilingualFields.forEach(f => {
						f.jsonSchemaProperties(transJsonSchema);
					});

					class TransModel extends Model {

						// Table name is the only required property.
						static get tableName() {
							return "#table#_trans".replace("#table#", tableName);
						}

						static get jsonSchema() {
							return {
								type: 'object',
								properties: transJsonSchema
							};
						}

					};

					relationMappings['translations'] = {
						relation: Model.HasManyRelation,
						modelClass: TransModel,
						join: {
							from: '{targetTable}.{primaryField}'
								.replace('{targetTable}', tableName)
								.replace('{primaryField}', currObject.PK()),
							to: '{sourceTable}.{field}'
								.replace('{sourceTable}', TransModel.tableName)
								.replace('{field}', currObject.transColumnName)
						}
					};

				}

				var connectFields = currObject.connectFields();

				// linkObject: '', // ABObject.id
				// linkType: 'one', // one, many
				// linkViaType: 'many' // one, many

				connectFields.forEach((f) => {
					// find linked object name
					var linkObject = currObject.application.objects((obj) => { return obj.id == f.settings.linkObject; })[0];
					if (linkObject == null) return;

					var linkField = f.fieldLink();
					if (linkField == null) return;

					var linkModel = linkObject.model();
					var relationName = f.relationName();

					// 1:1
					if (f.settings.linkType == 'one' && f.settings.linkViaType == 'one') {

						var sourceTable,
							targetTable,
							targetPkName,
							relation,
							columnName;

						if (f.settings.isSource == true) {
							sourceTable = tableName;
							targetTable = linkObject.dbTableName(true);
							targetPkName = linkObject.PK();
							relation = Model.BelongsToOneRelation;
							columnName = f.columnName;
						}
						else {
							sourceTable = linkObject.dbTableName(true);
							targetTable = tableName;
							targetPkName = currObject.PK();
							relation = Model.HasOneRelation;
							columnName = linkField.columnName;
						}

						relationMappings[relationName] = {
							relation: relation,
							modelClass: linkModel,
							join: {
								from: '{targetTable}.{primaryField}'
									.replace('{targetTable}', targetTable)
									.replace('{primaryField}', targetPkName),

								to: '{sourceTable}.{field}'
									.replace('{sourceTable}', sourceTable)
									.replace('{field}', columnName)
							}
						};
					}
					// M:N
					else if (f.settings.linkType == 'many' && f.settings.linkViaType == 'many') {
						// get join table name
						var joinTablename = f.joinTableName(true),
							joinColumnNames = f.joinColumnNames(),
							sourceTableName,
							sourcePkName,
							targetTableName,
							targetPkName;

						if (f.settings.isSource == true) {
							sourceTableName = f.object.dbTableName(true);
							sourcePkName = f.object.PK();
							targetTableName = linkObject.dbTableName(true);
							targetPkName = linkObject.PK();
						}
						else {
							sourceTableName = linkObject.dbTableName(true);
							sourcePkName = linkObject.PK();
							targetTableName = f.object.dbTableName(true);
							targetPkName = f.object.PK();
						}

						relationMappings[relationName] = {
							relation: Model.ManyToManyRelation,
							modelClass: linkModel,
							join: {
								from: '{sourceTable}.{primaryField}'
									.replace('{sourceTable}', sourceTableName)
									.replace('{primaryField}', sourcePkName),

								through: {
									from: '{joinTable}.{sourceColName}'
										.replace('{joinTable}', joinTablename)
										.replace('{sourceColName}', joinColumnNames.sourceColumnName),


									to: '{joinTable}.{targetColName}'
										.replace('{joinTable}', joinTablename)
										.replace('{targetColName}', joinColumnNames.targetColumnName)
								},

								to: '{targetTable}.{primaryField}'
									.replace('{targetTable}', targetTableName)
									.replace('{primaryField}', targetPkName)
							}

						};
					}
					// 1:M
					else if (f.settings.linkType == 'one' && f.settings.linkViaType == 'many') {
						relationMappings[relationName] = {
							relation: Model.BelongsToOneRelation,
							modelClass: linkModel,
							join: {
								from: '{sourceTable}.{field}'
									.replace('{sourceTable}', tableName)
									.replace('{field}', f.columnName),

								to: '{targetTable}.{primaryField}'
									.replace('{targetTable}', linkObject.dbTableName(true))
									.replace('{primaryField}', linkObject.PK())
							}
						};
					}
					// M:1
					else if (f.settings.linkType == 'many' && f.settings.linkViaType == 'one') {
						relationMappings[relationName] = {
							relation: Model.HasManyRelation,
							modelClass: linkModel,
							join: {
								from: '{sourceTable}.{primaryField}'
									.replace('{sourceTable}', tableName)
									.replace('{primaryField}', currObject.PK()),

								to: '{targetTable}.{field}'
									.replace('{targetTable}', linkObject.dbTableName(true))
									.replace('{field}', linkField.columnName)
							}
						};
					}
				});

				return relationMappings
			};

			// bind knex connection to object model
			// NOTE : when model is bound, then relation setup will be executed
			__ModelPool[tableName] = __ModelPool[tableName].bindKnex(knex);

		}

		return __ModelPool[tableName];
	}



	/**
	 * @method modelRefresh
	 * when the definition of a model changes, we need to clear our cached
	 * model definitions.
	 * NOTE: called from our ABField.migrateXXX methods.
	 */
	modelRefresh() {

		// WORKAROUND: It can't use .modelRefresh of ABObject because __ModelPool stores separately. How to use global variable ?? 

		var tableName = this.dbTableName(true);

		delete __ModelPool[tableName];

		ABMigration.refreshObject(this);

	}



}