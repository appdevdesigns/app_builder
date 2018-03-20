var uuid = require('node-uuid');
var path = require('path');

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

module.exports = {

	/**
	 * @method getTableList
	 * Get the list of table name
	 * 
	 * @return Promise -
	 * 			return {Array} [
	 * 				tableName {string}, ..., tableNameN {string}
	 * 			]
	 */
	getTableList: (appID) => {

		var allTableNames = [],
			existsTableNames = [];

		return Promise.resolve()
			.then(function () {

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
						.andWhere('TABLE_SCHEMA', '=', sails.config.connections.appBuilder.database)
						.andWhere('TABLE_NAME', 'NOT LIKE', 'AB_%')
						.andWhere('TABLE_NAME', 'NOT LIKE', '%_trans')
						.catch(reject)
						.then(function (result) {

							allTableNames = result.map(r => r.TABLE_NAME);

							resolve();

						});
				});
			})
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
			.then(function () {

				// Get only not exists table names
				return new Promise((resolve, reject) => {

					resolve(allTableNames.filter(name => {
						return existsTableNames.indexOf(name) < 0;
					}));

				});

			});


	},

	/**
	 * @method getColumns
	 * Get the column info list of a table
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
	 * 								fieldKey: {string} - ABField's key name [Optional],
	 * 
	 * 								multilingual: {boolean} [Optional]
	 * 							}
	 * 			}
	 */
	getColumns: (tableName) => {

		var knex = ABMigration.connection();
		var transTableName = getTransTableName(tableName);
		var columns = [];

		return Promise.resolve()
			// Get columns of the table
			.then(function () {

				return new Promise((resolve, reject) => {

					knex(tableName).columnInfo()
						.catch(reject)
						.then(function (result) {

							columns = result;

							Object.keys(columns).forEach(name => {

								// remove reserved column
								if (ABFieldBase.reservedNames.indexOf(name) > -1) {
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
	 *      name: string,
	 *      label: string,
	 * 		fieldKey: string,
	 * 		isHidden: bool
	 * }] columnList
	 * @return Promise
	 *     Resolves with the data of the new imported object
	 **/
	tableToObject: function (appID, tableName, columnList) {

		var knex = ABMigration.connection(),
			application,
			languages = [],
			transColumnName = '',
			columns = {},
			objectData = {};

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

			// Prepare object
			.then(function () {

				return new Promise((resolve, reject) => {

					objectData = {
						id: uuid(),
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

					ABExternal.getColumns(tableName)
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

					Object.keys(columns).forEach(colName => {

						var col = columns[colName];

						if (!col.supported ||
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

						// let colData = _.cloneDeep(mysqlTypeToABFields[inputCol.fieldKey]);
						// // Populate with imported values
						// colData.id = uuid.v4();
						// colData.columnName = colName;
						// colData.settings.isImported = true;
						// colData.settings.showIcon = 1;

						// Flag support multilingual 
						if (col.multilingual)
							colData.settings.supportMultilingual = 1;

						// Add a hidden field
						if (inputCol && JSON.parse(inputCol.isHidden || false)) {
							objectData.objectWorkspace.hiddenFields.push(colData.columnName);

						}

						// Label of the column
						let colLabel = inputCol ? inputCol.label : colName;

						// Label translations
						colData.translations = [];
						languages.forEach((langCode) => {
							colData.translations.push({
								language_code: langCode,
								label: colLabel
							});
						});

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
							resolve(objectData);
						}
					});

				});

			});

	}

};