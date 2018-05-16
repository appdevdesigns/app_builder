var uuid = require('node-uuid');
var path = require('path');
var _ = require('lodash');

var ABObject = require(path.join(__dirname, "..", "classes", "ABObject.js"));
var ABFieldBase = require(path.join(__dirname, "..", "..", "assets", "opstools", "AppBuilder", "classes", "dataFields", "ABFieldBase.js"));

// Build a reference of AB defaults for all supported Sails data field types
var FieldManager = require(path.join('..', 'classes', 'ABFieldManager.js'));
var mysqlTypeToABFields = {};
FieldManager.allFields().forEach((Field) => {
	let field = new Field({ settings: {} }, {});
	field.fieldMysqlTypes().forEach((type) => {
		mysqlTypeToABFields[type] = {
			key: field.key,
			icon: field.icon,
			settings: field.settings,
		};
	});
});


function isSupportType(type) {
	return mysqlTypeToABFields[type] != null;
}

function getTransTableName(tableName) {
	return tableName + '_trans';
}

/**
 * @method getPrimaryKey
 *
 * @param {*} knex 
 * @param {*} tableName
 * 
 * @return {Promise}
 */
function getPrimaryKey(knex, tableName, connName='appBuilder') {

	return new Promise((resolve, reject) => {

		// SELECT `column_name`
		// FROM information_schema.key_column_usage
		// WHERE `CONSTRAINT_NAME` = 'PRIMARY'
		// AND `TABLE_SCHEMA` = '[DATABASE NAME]'
		// AND `TABLE_NAME` = '[TABLE NAME]';
		knex.select('column_name')
		.from('information_schema.key_column_usage')
		.where('CONSTRAINT_NAME', '=', 'PRIMARY')
		.andWhere('TABLE_SCHEMA', '=', sails.config.connections[connName].database)
		.andWhere('TABLE_NAME', '=', tableName)
			.catch(reject)
			.then(function (result) {

				var pkColName = "";

				if (result[0])
					pkColName = result[0].column_name;

				resolve(pkColName);

			});

	});

}

/**
 * @method getAssociations
 * Get associations of sails.model from table name
 * 
 * @param {string} tableName
 * 
 * @return {array} [ 
 * 		{ 
 * 			alias: 'ATTRIBUTE_NAME',
 * 			type: 'model',
 * 			model: 'MODEL_NAME'
 * 		},
 * 		{ 
 * 			alias: 'ATTRIBUTE_NAME', 
 * 			type: 'collection',
 * 			collection: 'MODEL_NAME',
 * 			via: 'ATTRIBUTE_NAME'
 * 		}
 * 		...
 * ]
 */
function getAssociations(tableName) {

	var model = _.filter(sails.models, (m, model_name) => m.tableName == tableName)[0];
	if (model) {
		return model.associations;
	}
	else {
		return [];
	}

}

module.exports = {


	/**
	 * @method getConnectionList
	 * Get the list of DB connection name from sails.config.connections
	 * 
	 * @return {Array} - [string, string2, ..., stringN]
	 */
	getConnectionList: () => {

		var connectionNames = [];

		Object.keys(sails.config.connections).forEach(connKey => {

			var conn = sails.config.connections[connKey];

			if (conn.host &&
				conn.port && 
				conn.user &&
				conn.password &&
				conn.database)
				connectionNames.push(conn.database);

		});

		return connectionNames;

	},


	/**
	 * @method getTableList
	 * Get the list of table name
	 * 
	 * @param {guid} - The id of ABApplication
	 * @param {string} - The name of database connection
	 * 
	 * @return Promise -
	 * 			return {Array} [
	 * 				tableName {string}, ..., tableNameN {string}
	 * 			]
	 */
	getTableList: (appID, connectionName) => {

		var allTableNames = [],
			existsTableNames = [];

		return Promise.resolve()
			.then(function() {

				// Get database name
				return new Promise((resolve, reject) => {

					var connection = sails.config.connections[connectionName];
					if (connection && connection.database)
						resolve(connection.database);
					else 
						reject("Could not found this DB connection");

				});

			})
			.then(function (databaseName) {
				// Get tables in AppBuilder DB
				return new Promise((resolve, reject) => {

					var knex = ABMigration.connection();

					// SELECT `TABLE_NAME` 
					// FROM information_schema.tables 
					// WHERE `TABLE_TYPE` = 'BASE TABLE' 
					// AND `TABLE_SCHEMA` = [CURRENT DB]
					// AND `TABLE_NAME`   NOT LIKE 'AB_%'
					// AND `TABLE_NAME`   NOT LIKE '%_trans';
					knex.select('TABLE_NAME')
						.from('information_schema.tables')
						.where('TABLE_TYPE', '=', 'BASE TABLE')
						.andWhere('TABLE_SCHEMA', '=', databaseName)
						.andWhere('TABLE_NAME', 'NOT LIKE', 'AB_%')
						.andWhere('TABLE_NAME', 'NOT LIKE', '%_trans')
						.catch(reject)
						.then(function (result) {

							allTableNames = result.map((r) => { 
								return { name: r.TABLE_NAME, connection: connectionName };
							});

							resolve();

						});
				});
			})
			// .then(function () {
			// 	// Get tables in HRIS DB
			// 	return new Promise((resolve, reject) => {

			// 		var knex = ABMigration.connection('legacy_hris');

			// 		// SELECT `TABLE_NAME` 
			// 		// FROM information_schema.tables 
			// 		// WHERE `TABLE_TYPE` = 'BASE TABLE' 
			// 		// AND `TABLE_SCHEMA` = [CURRENT DB]
			// 		// AND `TABLE_NAME`   NOT LIKE 'AB_%'
			// 		// AND `TABLE_NAME`   NOT LIKE '%_trans';
			// 		knex.select('TABLE_NAME')
			// 			.from('information_schema.tables')
			// 			.where('TABLE_TYPE', '=', 'BASE TABLE')
			// 			.andWhere('TABLE_SCHEMA', '=', sails.config.connections.legacy_hris.database)
			// 			.andWhere('TABLE_NAME', 'NOT LIKE', 'AB_%')
			// 			.andWhere('TABLE_NAME', 'NOT LIKE', '%_trans')
			// 			.catch(reject)
			// 			.then(function (result) {
			// 				result.forEach((r) => {
			// 					allTableNames.push({ name: r.TABLE_NAME, connection: 'legacy_hris'});
			// 				});

			// 				resolve();
			// 			});
			// 	});
			// })
			.then(function () {

				return new Promise((resolve, reject) => {

					ABApplication.find({ id: appID })
						.exec(function (err, list) {
							if (err) reject(err);
							else if (!list || !list[0]) {
								reject(new Error('Application not found: ' + appID));
							}
							else {
								let application = list[0].toABClass();

								application.objects().forEach(obj => {

									existsTableNames.push(obj.dbTableName());

								});

								resolve();
							}
						});
				});

			})
			// Get only not exists table names
			.then(function () {

				return new Promise((resolve, reject) => {

					resolve(allTableNames.filter(t => {
						return existsTableNames.indexOf(t.name) < 0;
					}));

				});

			})
			// Filter tables are not junction
			.then(function (tableNames) {

				return new Promise((resolve, reject) => {
					
					resolve(tableNames.filter(t => {
						return _.filter(sails.models, m => m.tableName == t.name && (!m.meta || !m.meta.junctionTable)).length;
					}));

				});

			});


	},

	/**
	 * @method getColumns
	 * Get the column info list of a table
	 * 
	 * @param {string} tableName
	 * @param {string} [connName]
	 *		Optional name of the connection where the table is from.
	 *		By default the table is assumed to be from the 'appBuilder' 
	 *		connection.
	 *
	 * @return Promise -
	 * 			return {
	 * 				columnName: {
	 * 								defaultValue: {null|string|integer},
	 *								type: {string},
	 * 								maxLength: {integer},
	 * 								nullable: {boolean},
	 * 
	 * 								supported: {boolean}, // flag support to convert to ABField
	 * 								fieldKey: {string}, - ABField's key name [Optional],
	 * 
	 * 								multilingual: {boolean}, [Optional]
	 * 							}
	 * 			}
	 */
	getColumns: (tableName, connName) => {

		var knex = ABMigration.connection(connName);
		var transTableName = getTransTableName(tableName);
		var columns = [];

		return Promise.resolve()

			// Get the primary key info
			.then(function () {

				return getPrimaryKey(knex, tableName, connName);

			})

			// Get columns of the table
			.then(function (pkColName) {

				return new Promise((resolve, reject) => {

					knex(tableName).columnInfo()
						.catch(reject)
						.then(function (result) {

							columns = result;

							Object.keys(columns).forEach(name => {

								// remove reserved column
								if (ABFieldBase.reservedNames.indexOf(name) > -1 || 
									pkColName == name) {
									delete columns[name];
									return;
								}

								var col = columns[name];
								col.supported = isSupportType(col.type);

								if (col.supported) {
									col.fieldKey = mysqlTypeToABFields[col.type].key;
								}

							});


							resolve();

						});

				});

			})

			//
			.then(function () {

				return new Promise((resolve, reject) => {

					var associations = getAssociations(tableName);
					associations.forEach(asso => {

						// Ignore the 'translations' association to connect fields
						if (asso.alias == 'translations')
							return;

						var col = columns[asso.alias];
						if (col) {
							col.fieldKey = "connectObject";
						}
						else {
							columns[asso.alias] = {
								fieldKey: "connectObject",

								defaultValue: null,
								type: null,
								maxLength: null,
								nullable: true,

								supported: true
							};
						}

					});

					resolve();

				});

			})

			// Check exists the trans table
			.then(function () {

				return new Promise((resolve, reject) => {

					knex.schema.hasTable(transTableName)
						.catch(reject)
						.then(function (exists) {

							resolve(exists);
						});
				});

			})

			// Get columns of the trans table
			.then(function (existsTrans) {

				return new Promise((resolve, reject) => {

					// no trans table
					if (!existsTrans) {
						resolve();
						return;
					}

					var reservedNames = ABFieldBase.reservedNames.concat([
						'language_code'
					]);

					knex(transTableName).columnInfo()
						.catch(reject)
						.then(function (transCols) {

							Object.keys(transCols).forEach(name => {

								var col = transCols[name];

								// remove reserved column
								if (reservedNames.indexOf(name) > -1) {
									delete transCols[name];
									return;
								}

								// ignore the foreign key
								if (col.type == 'int')
									return;

								// flag to be a multilingual field
								col.multilingual = true;

								col.supported = isSupportType(col.type);
								if (col.supported)
									col.fieldKey = mysqlTypeToABFields[col.type].key;

								// add a trans column
								columns[name] = col;


							});

							resolve();

						});



				});

			})

			// Finally - return column infos
			.then(function () {

				return new Promise((resolve, reject) => {
					resolve(columns);
				});

			});

	},

	/**
	 * Imports an existing MySql table for use in an AB application.
	 * An AB object will be created for that model.
	 *
	 * @param integer	appID
	 * @param string	tableName
	 * @param [{
	 *		 name: string,
	 *		 label: string,
	 * 		fieldKey: string,
	 * 		isHidden: bool
	 * }] columnList
	 * @param string	[connName]
	 * @return Promise
	 *		Resolves with the data of the new imported object
	 **/
	tableToObject: function (appID, tableName, columnList, connName) {

		let knex = ABMigration.connection(connName),
			application,
			languages = [],
			transColumnName = '',
			pkColName = '',
			columns = {},
			objectData = {};


		let labelField = (colData, label) => {

			// Label translations
			colData.translations = [];
			languages.forEach((langCode) => {
				colData.translations.push({
					language_code: langCode,
					label: label
				});
			});
		};

		return Promise.resolve()

			// Find app in database
			.then(function () {

				return new Promise((resolve, reject) => {

					ABApplication.find({ id: appID })
						.exec(function (err, list) {
							if (err) {
								reject(err);
							}
							else if (!list || !list[0]) {
								reject(new Error('application not found: ' + appID));
							}
							else {
								application = list[0];
								resolve();
							}
						});

				});
			})

			// Find site languages
			.then(function () {

				return new Promise((resolve, reject) => {

					SiteMultilingualLanguage.find()
						.exec((err, list) => {
							if (err) reject(err);
							else if (!list || !list[0]) {
								languages = ['en'];
								resolve();
							}
							else {
								list.forEach((lang) => {
									languages.push(lang.language_code);
								});
								resolve();
							}
						});

				});

			})

			// Pull trans's relation name
			.then(function () {

				return new Promise((resolve, reject) => {

					var transTableName = getTransTableName(tableName);

					Promise.resolve()
						.catch(reject)
						.then(function () {

							return new Promise((next, err) => {

								knex.schema.hasTable(transTableName)
									.catch(err)
									.then(function (exists) {
										next(exists);
									});

							});

						})
						.then(function (exists) {

							return new Promise((next, err) => {
								if (!exists) return next();

								knex(transTableName).columnInfo()
									.catch(err)
									.then(function (transCols) {

										Object.keys(transCols).forEach(colName => {
											var col = transCols[colName];

											if (colName != 'id' && col.type == 'int')
												transColumnName = colName;
										});

										next();
									});

							});

						})
						.then(resolve);

				});

			})

			// Get the primary key info
			.then(function () {
				
				return new Promise((resolve, reject) => {

					getPrimaryKey(knex, tableName, connName)
						.catch(reject)
						.then(colName => {

							pkColName = colName;

							resolve();

						});

				});
				
			})

			// Prepare object
			.then(function () {

				return new Promise((resolve, reject) => {

					objectData = {
						id: uuid(),
						connName: connName,
						name: tableName,
						tableName: tableName,
						transColumnName: transColumnName,
						labelFormat: "",
						isExternal: 1,
						translations: [],
						objectWorkspace: {
							hiddenFields: []
						},
						fields: []
					};

					if (pkColName)
						objectData.primaryColumnName = pkColName;

					// Add label translations
					let tableLabel = tableName.replace(/_/g, ' ');
					languages.forEach((langCode) => {
						objectData.translations.push({
							language_code: langCode,
							label: tableLabel
						});
					});

					resolve();

				});

			})

			// Pull column infos
			.then(function () {

				return new Promise((resolve, reject) => {

					ABExternal.getColumns(tableName, connName)
						.catch(reject)
						.then(data => {

							columns = data;
							resolve();
						});

				});

			})

			// Prepare object fields
			.then(function () {

				return new Promise((resolve, reject) => {

					let associations = getAssociations(tableName);

					Object.keys(columns).forEach(colName => {

						var col = columns[colName];

						if (!col.supported ||
							pkColName == colName ||
							ABFieldBase.reservedNames.indexOf(colName) > -1) return;

						let inputCol = columnList.filter(enterCol => enterCol.name == colName)[0];

						// Clone the reference defaults for this type
						let colData = FieldManager.newField({
							key: inputCol.fieldKey,

							id: uuid.v4(),
							columnName: colName,
							settings: {
								isImported: true,
								showIcon: 1
							}
						}, objectData).toObj();

						// Flag support multilingual 
						if (col.multilingual)
							colData.settings.supportMultilingual = 1;

						// Add a hidden field
						if (inputCol && JSON.parse(inputCol.isHidden || false)) {
							objectData.objectWorkspace.hiddenFields.push(colData.columnName);
						}

						// Label of the column
						let colLabel = inputCol ? inputCol.label : colName;
						labelField(colData, colLabel);
						

						// Define Connect column settings
						if (inputCol.fieldKey == 'connectObject') {

							let associateInfo = associations.filter(asso => asso.alias == colName)[0];
							if (associateInfo) {

								// Pull table name of link
								let targetModel = "",
									targetAssociate,
									targetColId = uuid.v4(),
									targetColName = "",
									targetType = ""; // model, many

								if (associateInfo.type == 'model') {
									targetModel = sails.models[associateInfo.model];

									targetAssociate = targetModel.associations.filter(asso => asso.via == colName)[0];
									if (targetAssociate) {
										targetColName = targetAssociate.alias;
										targetType = targetAssociate.type;
									}
								}
								else {
									targetModel = sails.models[associateInfo.collection];
									targetColName = associateInfo.via;

									// Pull type of associate
									targetAssociate = targetModel.associations.filter(asso => asso.alias == targetColName)[0];
									if (targetAssociate) {
										targetType = targetAssociate.type;
									}
								}


								// Get id of ABObject and ABColumn
								let targetObj = (application.json.objects || []).filter(o => o.tableName == targetModel.tableName)[0];
								if (!targetObj)
									return;

								colData.settings.linkObject = targetObj.id; // ABObject.id
								colData.settings.linkType = (associateInfo.type == 'model' ? 'one' : 'many');
								colData.settings.linkViaType = (targetType == 'model' ? 'one' : 'many'); // one, many

								colData.settings.linkColumn = targetColId; // ABColumn.id
								colData.settings.isSource = 1;


								// Add target connect field to the target object
								let targetColData = FieldManager.newField({
									key: 'connectObject',

									id: targetColId,
									columnName: targetColName,
									settings: {
										isImported: true,
										showIcon: 1,
										linkObject: objectData.id,
										linkType: (targetType == 'model' ? 'one' : 'many'),
										linkViaType: (associateInfo.type == 'model' ? 'one' : 'many'),
										linkColumn: colData.id,
										isSource: 0
									}
								}, targetObj).toObj();

								labelField(targetColData, (targetColName || '').replace(/_/g, ' '));

								targetObj.fields.push(targetColData);

								// Refresh the target model
								let targetObjClass = new ABObject(targetObj, application.toABClass());
								targetObjClass.modelRefresh();

							}
						}

						objectData.fields.push(colData);

					});

					resolve();

				});

			})

			// Create column associations in database
			.then(function () {

				return new Promise((resolve, reject) => {
					// TODO
					resolve();
				});

			})

			// Save to database
			.then(function () {

				return new Promise((resolve, reject) => {

					application.json.objects = application.json.objects || [];
					application.json.objects.push(objectData);

					ABApplication.update(
						{ id: appID },
						{ json: application.json }
					).exec((err, updated) => {
						if (err) {
							console.log('ERROR: ', err);
							reject(err);
						}
						else if (!updated || !updated[0]) {
							console.log('ERROR: app not updated');
							reject(new Error('Application not updated'));
						}
						else {
							resolve(application.json.objects);
						}
					});

				});

			});

	}

};

