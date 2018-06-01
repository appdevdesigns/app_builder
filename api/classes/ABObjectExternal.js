var path = require('path');
var _ = require('lodash');

var ABObject = require(path.join(__dirname, 'ABObject'));

var Model = require('objection').Model;

var __ModelPool = __ModelPool || {};  // reuse any previously created Model connections
// to minimize .knex bindings (and connection pools!)

module.exports = class ABObjectExternal extends ABObject {


	dbTransTableName() {
		return "#table#_trans".replace("#table#", this.dbTableName());
	}


	/**
	 * migrateCreateTable
	 * verify that a table for this object exists.
	 * @param {Knex} knex the knex sql library manager for manipulating the DB.
	 * @param {Object} options table connection info - 
	 * 						{
	 * 							connection: "",
	 * 							table: "",
	 * 							primary: "Primary column name"
	 * 						}
	 * 					
	 * @return {Promise}
	 */
	migrateCreate(knex, options) {
		sails.log.verbose('ABObjectExternal.migrateCreate()');

		if (options == null)
			return Promise.reject("ABObjectExternal needs target options to create a federated table");

		var tableName = this.dbTableName();
		sails.log.verbose('.... dbTableName:' + tableName);

		var knexTarget = ABMigration.connection(options.connection);
		var targetTransTableName = options.table.replace("_data", "") + '_trans';

		return Promise.resolve()

			// Get column info
			.then(() => {

				return new Promise((resolve, reject) => {

					knexTarget(options.table).columnInfo()
						.then(resolve)
						.catch(reject);

				});

			})
			// Create federated table
			.then((columns) => {

				return new Promise((resolve, reject) => {

					knex.schema.hasTable(tableName).then((exists) => {

						// if it doesn't exist, then create it and any known fields:
						if (!exists) {
							sails.log.verbose('... creating federated table !!!');
							return knex.schema.createTable(tableName, (t) => {

								var conn = sails.config.connections[options.connection];

								t.charset('utf8');
								t.collate('utf8_unicode_ci')
								t.engine(
									"FEDERATED CONNECTION='mysql://{user}:{pass}@{host}/{database}/{table}';"
										.replace('{user}', conn.user)
										.replace('{pass}', conn.password)
										.replace('{host}', conn.host)
										.replace('{database}', conn.database)
										.replace('{table}', options.table)
								);

								// create columns
								Object.keys(columns || {}).forEach(colName => {

									var colInfo = columns[colName];

									if (!colInfo.type) return;

									var fnName = colInfo.type;
									switch (fnName) {
										case 'int':
											fnName = 'integer';
											break;
										case 'blob':
											fnName = 'binary';
											break;
									}

									// set PK to auto increment
									if (options.primary == colName &&
										fnName == 'integer')
										fnName = 'increments';

									// create new column
									var newCol = t[fnName](colName);

									if (colInfo.defaultValue)
										newCol.defaultTo(colInfo.defaultValue);

									if (colInfo.nullable)
										newCol.nullable();
									else
										newCol.notNullable();

								});

								if (options.primary)
									t.primary(options.primary);

								resolve();

							})

						} else {
							sails.log.verbose('... already there.');
							resolve();
						}
					});
				});

			})


			// Check translation table exists
			.then(() => {

				return new Promise((resolve, reject) => {

					knexTarget.schema.hasTable(targetTransTableName)
						.then(resolve)
						.catch(reject);

				});

			})

			// Get column info of translation table
			.then((transExists) => {

				return new Promise((resolve, reject) => {

					// if not exists
					if (!transExists)
						return resolve();

					knexTarget(targetTransTableName).columnInfo()
						.then(resolve)
						.catch(reject);

				});

			})

			// Create translation table
			.then((columns) => {

				return new Promise((resolve, reject) => {

					// if not exists
					if (!columns)
						return resolve();

					knex.schema.hasTable(this.dbTransTableName()).then((exists) => {

						// if it doesn't exist, then create it and any known fields:
						if (exists) {
							sails.log.verbose('... this translation table already there.');
							return resolve();
						}

						sails.log.verbose('... creating federated translation table !!!');
						return knex.schema.createTable(this.dbTransTableName(), (t) => {

							var conn = sails.config.connections[options.connection];

							t.charset('utf8');
							t.collate('utf8_unicode_ci')
							t.engine(
								"FEDERATED CONNECTION='mysql://{user}:{pass}@{host}/{database}/{table}';"
									.replace('{user}', conn.user)
									.replace('{pass}', conn.password)
									.replace('{host}', conn.host)
									.replace('{database}', conn.database)
									.replace('{table}', targetTransTableName)
							);

							// create columns
							Object.keys(columns || {}).forEach(colName => {

								var colInfo = columns[colName];

								if (!colInfo.type) return;

								var fnName = colInfo.type;
								switch (fnName) {
									case 'int':
										fnName = 'integer';
										break;
								}

								// create new column
								var newCol = t[fnName](colName);

								if (colInfo.defaultValue)
									newCol.defaultTo(colInfo.defaultValue);

								if (colInfo.nullable)
									newCol.nullable();
								else
									newCol.notNullable();

							});

							resolve();

						})

					});


				});

			});

	}



	/**
	 * migrateDropTable
	 * remove the table for this object if it exists.
	 * @param {Knex} knex the knex sql library manager for manipulating the DB.
	 * @return {Promise}
	 */
	migrateDrop(knex) {
		sails.log.verbose('ABObject.migrateDrop()');

		var tableName = this.dbTableName();
		sails.log.verbose('.... dbTableName:' + tableName);

		return new Promise(
			(resolve, reject) => {
				sails.log.silly('.... .migrateDropTable()  before knex:');

				var fieldDrops = [];
				this.fields().forEach((f) => {
					fieldDrops.push(f.migrateDrop(knex));
				})

				Promise.all(fieldDrops)
					.then(() => {

						Promise.all([
							knex.schema.dropTableIfExists(tableName),
							knex.schema.dropTableIfExists(this.dbTransTableName())
						])
							.then(resolve)
							.catch(reject);

					})
					.catch(reject);



			}
		)
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

		var tableName = this.dbTableName();
		var tableTransName = this.dbTransTableName();


		if (!__ModelPool[tableName]) {

			var knex = ABMigration.connection();

			// Compile our jsonSchema from our DataFields
			// jsonSchema is only used by Objection.js to validate data before
			// performing an insert/update.
			// This does not DEFINE the DB Table.
			var jsonSchema = {
				type: 'object',
				required: [],
				properties: {}
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
							return tableTransName;
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
							targetTable = linkObject.dbTableName();
							targetPkName = linkObject.PK();
							relation = Model.BelongsToOneRelation;
							columnName = f.columnName;
						}
						else {
							sourceTable = linkObject.dbTableName();
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
						var joinTablename = f.joinTableName(),
							joinColumnNames = f.joinColumnNames(),
							sourceTableName,
							sourcePkName,
							targetTableName,
							targetPkName;

						if (f.settings.isSource == true) {
							sourceTableName = f.object.dbTableName();
							sourcePkName = f.object.PK();
							targetTableName = linkObject.dbTableName();
							targetPkName = linkObject.PK();
						}
						else {
							sourceTableName = linkObject.dbTableName();
							sourcePkName = linkObject.PK();
							targetTableName = f.object.dbTableName();
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
									.replace('{targetTable}', linkObject.dbTableName())
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
									.replace('{targetTable}', linkObject.dbTableName())
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

		var tableName = this.dbTableName();

		delete __ModelPool[tableName];

		ABMigration.refreshObject(this);

	}



}