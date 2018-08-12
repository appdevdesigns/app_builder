
var path = require('path');
var _ = require('lodash');

var ABObject = require(path.join(__dirname, 'ABObject'));

var Model = require('objection').Model;

// list of all the condition filtering policies we want our defined 
// filters to pass through:
var PolicyList = [
	require(path.join(__dirname, '..', 'policies', 'ABModelConvertSameAsUserConditions')),
	require(path.join(__dirname, '..', 'policies', 'ABModelConvertQueryConditions')),
	require(path.join(__dirname, '..', 'policies', 'ABModelConvertQueryFieldConditions'))
]

module.exports = class ABObjectQuery extends ABObject {

	constructor(attributes, application) {
		super(attributes, application);

		/*
		{
			id: uuid(),
			name: 'name',
			labelFormat: 'xxxxx',
			isImported: 1/0,
			tableName:'string',  // NOTE: store table name of import object to ignore async
			urlPath:'string',
			importFromObject: 'string', // JSON Schema style reference:  '#[ABApplication.id]/objects/[ABObject.id]'
										// to get other object:  ABApplication.objectFromRef(obj.importFromObject);
			translations:[
				{}
			],
			fields:[
				{ABDataField}
			]
		}
		*/

		// import all our Joins 
		this.importJoins(attributes.joins || []);
		this.importFields(attributes.fields || []); // import after joins are imported
		// this.where = attributes.where || {}; // .workspaceFilterConditions

	}



	///
	/// Static Methods
	///
	/// Available to the Class level object.  These methods are not dependent
	/// on the instance values of the Application.
	///





	///
	/// Instance Methods
	///

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
	toObj() {

		var result = super.toObj();

		/// include our additional objects and where settings:

		result.joins = this.exportJoins();  //objects;
		// result.where = this.where; // .workspaceFilterConditions

		return result;

	}


	///
	/// Fields
	///


	/**
	 * @method fieldNew()
	 *
	 * return an instance of a new (unsaved) ABField that is tied to this
	 * ABObject.
	 *
	 * NOTE: this new field is not included in our this.fields until a .save()
	 * is performed on the field.
	 *
	 * @return {ABField}
	 */
	// fieldNew ( values ) {
	// 	// NOTE: ABFieldManager.newField() returns the proper ABFieldXXXX instance.
	// 	return ABFieldManager.newField( values, this );
	// }



	/**
	 * @method importFields
	 * instantiate a set of fields from the given attributes.
	 * Our attributes are a set of field URLs That should already be created in their respective
	 * ABObjects.
	 * @param {array} fieldSettings The different field urls for each field
	 *					{ }
	 */
	importFields(fieldSettings) {
		var newFields = [];
		fieldSettings.forEach(fieldInfo => {

			var field = this.application.urlResolve(fieldInfo.fieldURL);

			// should be a field of base/join objects
			if (this.canFilterField(field) &&
				// check duplicate
				newFields.filter(f => f.urlPointer() == fieldInfo.fieldURL).length < 1) {

				newFields.push(field);
			}
		})
		this._fields = newFields;
	}



	///
	/// Joins & Objects
	///



	/**
	 * @method joins()
	 *
	 * return an array of all the ABObjects for this Query.
	 *
	 * @return {array}
	 */
	joins(filter) {

		filter = filter || function () { return true; };

		return (this._joins || []).filter(filter);
	}


	/**
	 * @method objects()
	 *
	 * return an array of all the ABObjects for this Query.
	 *
	 * @return {array}
	 */
	objects(filter) {

		filter = filter || function () { return true; };

		return (this._objects || []).filter(filter);
	}


	/**
	 * @method importJoins
	 * instantiate a set of joins from the given attributes.
	 * Our joins contain a set of ABObject URLs that should already be created in our Application.
	 * @param {array} settings The different field urls for each field
	 *					{ }
	 */
	importJoins(settings) {
		var newJoins = [];
		var newObjects = [];
		function storeSingle(object) {
			if (!object) return;

			var inThere = newObjects.filter((o) => { return o.id == object.id }).length > 0;
			if (!inThere) {
				newObjects.push(object);
			}
		}
		settings.forEach((join) => {

			// Convert our saved settings:
			// 		{
			// 			objectURL:"#/...",
			// 			fieldID:'adf3we666r77ewsfe',
			// 			type:[left, right, inner, outer]  // these should match the names of the knex methods
			// 					=> innerJoin, leftJoin, leftOuterJoin, rightJoin, rightOuterJoin, fullOuterJoin
			// 		}

			// track our base object
			var object = this.application.urlResolve(join.objectURL);
			if (!object) return;

			storeSingle(object);

			// track our linked object
			var linkField = object.fields((f) => { return f.id == join.fieldID; })[0];
			if (linkField) {
				var linkObject = linkField.datasourceLink;
				storeSingle(linkObject);
			}


			newJoins.push(join);
		})
		this._joins = newJoins;
		this._objects = newObjects;
	}


	/**
	 * @method exportObjects
	 * save our list of objects into our format for persisting on the server
	 * @param {array} settings 
	 */
	exportJoins() {

		var joins = [];
		this._joins.forEach((join) => {
			joins.push(join);
		})
		return joins;
	}





	/**
	 * @method canFilterObject
	 * evaluate the provided object to see if it can directly be filtered by this
	 * query.
	 * @param {ABObject} object
	 * @return {bool} 
	 */
	canFilterObject(object) {

		if (!object) return false;

		// I can filter this object if it is one of the objects in my joins
		return this.objects((o) => { return o.id == object.id; }).length > 0;

	}

	/**
	 * @method canFilterField
	 * evaluate the provided field to see if it can be filtered by this
	 * query.
	 * @param {ABObject} object
	 * @return {bool} 
	 */
	canFilterField(field) {

		if (!field) return false;

		// I can filter a field if it's object OR the object it links to can be filtered:
		var object = field.object;
		var linkedObject = field.datasourceLink;

		return this.canFilterObject(object) || this.canFilterObject(linkedObject);
	}




	///
	/// Migration Services
	///

	// dbTableName() {
	// 	if (this.isImported) {
	// 		// NOTE: store table name of import object to ignore async
	// 		return this.tableName;
	// 	}
	// 	else {
	// 		return AppBuilder.rules.toObjectNameFormat(this.application.dbApplicationName(), this.name);
	// 		// var modelName = this.name.toLowerCase();
	// 		// if (!sails.models[modelName]) {
	// 		// 	throw new Error(`Imported object model not found: ${modelName}`);
	// 		// }
	// 		// else {
	// 		// 	return sails.models[modelName].waterline.schema[modelName].tableName;
	// 		// }
	// 	}
	// }


	/**
	 * migrateCreateTable
	 * verify that a table for this object exists.
	 * @param {Knex} knex the knex sql library manager for manipulating the DB.
	 * @return {Promise}
	 */
	migrateCreate(knex) {
		sails.log.verbose('ABObjectQuery.migrateCreate()');
		sails.log.debug('ABObjectQuery.migrateCreate() called, but no migrations allowed.')

		// just continue gracefully:
		return new Promise(
			(resolve, reject) => {
				resolve();
			}
		);
	}





	/**
	 * migrateDropTable
	 * remove the table for this object if it exists.
	 * @param {Knex} knex the knex sql library manager for manipulating the DB.
	 * @return {Promise}
	 */
	migrateDrop(knex) {
		sails.log.verbose('ABObject.migrateDrop()');
		sails.log.debug('ABObjectQuery.migrateDrop() called, but no migrations allowed.')

		// just continue gracefully:
		return new Promise(
			(resolve, reject) => {
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

		// var tableName = this.dbTableName();

		// if (!__ModelPool[tableName]) {

		// 	var knex = ABMigration.connection();

		// 	// Compile our jsonSchema from our DataFields
		// 	var jsonSchema = {
		// 		type: 'object',
		// 		required: [],
		// 		properties: {

		// 			created_at:{ type:['null', 'string'], pattern: AppBuilder.rules.SQLDateTimeRegExp },
		// 			updated_at:{ type:['null', 'string'], pattern: AppBuilder.rules.SQLDateTimeRegExp },
		// 			properties:{ type:['null', 'object'] }

		// 		}
		// 	}
		// 	var currObject = this;
		// 	var allFields = this.fields();
		// 	allFields.forEach(function(f) {
		// 		f.jsonSchemaProperties(jsonSchema.properties);
		// 	})


		// 	class MyModel extends Model {

		// 		// Table name is the only required property.
		// 		static get tableName() {
		// 			return tableName;
		// 		}

		// 		static get jsonSchema () {
		//   				return jsonSchema
		//   			}

		// 		// Move relation setup to below
		// 		// static get relationMappings () {
		// 		// }

		// 	}

		// 	__ModelPool[tableName] = MyModel;

		// 	// NOTE : there is relation setup here because prevent circular loop when get linked object.
		// 	// have to define object models to __ModelPool[tableName] first
		// 	MyModel.relationMappings = function () {
		// 		// Compile our relations from our DataFields
		// 		var relationMappings = {};

		// 		var connectFields = currObject.connectFields();

		// 		// linkObject: '', // ABObject.id
		// 		// linkType: 'one', // one, many
		// 		// linkViaType: 'many' // one, many

		// 		connectFields.forEach((f) => {
		// 			// find linked object name
		// 			var linkObject = currObject.application.objects((obj) => { return obj.id == f.settings.linkObject; })[0];
		// 			if (linkObject == null) return;

		// 			var linkField = f.fieldLink();
		// 			if (linkField == null) return;

		// 			var linkModel = linkObject.model();
		// 			var relationName = f.relationName();

		// 			// 1:1
		// 			if (f.settings.linkType == 'one' && f.settings.linkViaType == 'one') {

		// 				var sourceTable,
		// 					targetTable,
		// 					relation,
		// 					columnName;

		// 				if (f.settings.isSource == true) {
		// 					sourceTable = tableName;
		// 					targetTable = linkObject.dbTableName();
		// 					relation = Model.BelongsToOneRelation;
		// 					columnName = f.columnName;
		// 				}
		// 				else {
		// 					sourceTable = linkObject.dbTableName();
		// 					targetTable = tableName;
		// 					relation = Model.HasOneRelation;
		// 					columnName = linkField.columnName;
		// 				}

		// 				relationMappings[relationName] = {
		// 					relation: relation,
		// 					modelClass: linkModel,
		// 					join: {
		// 						from: '{targetTable}.id'
		// 							.replace('{targetTable}', targetTable),

		// 						to: '{sourceTable}.{field}'
		// 							.replace('{sourceTable}', sourceTable)
		// 							.replace('{field}', columnName)
		// 					}
		// 				};
		// 			}
		// 			// M:N
		// 			else if (f.settings.linkType == 'many' && f.settings.linkViaType == 'many') {
		// 				// get join table name
		// 				var joinTablename = f.joinTableName(),
		// 					sourceObjectName,
		// 					sourceTableName,
		// 					targetObjectName,
		// 					targetTableName;

		// 				if (f.settings.isSource == true) {
		// 					sourceObjectName = f.object.name;
		// 					sourceTableName = f.object.dbTableName();
		// 					targetObjectName = linkObject.name;
		// 					targetTableName = linkObject.dbTableName();
		// 				}
		// 				else {
		// 					sourceObjectName = linkObject.name;
		// 					sourceTableName = linkObject.dbTableName();
		// 					targetObjectName = f.object.name;
		// 					targetTableName = f.object.dbTableName();
		// 				}

		// 				relationMappings[relationName] = {
		// 					relation: Model.ManyToManyRelation,
		// 					modelClass: linkModel,
		// 					join: {
		// 						from: '{sourceTable}.id'.replace('{sourceTable}', sourceTableName),

		// 						through: {
		// 							from: '{joinTable}.{sourceColName}'
		// 								.replace('{joinTable}', joinTablename)
		// 								.replace('{sourceColName}', sourceObjectName),


		// 							to: '{joinTable}.{targetColName}'
		// 								.replace('{joinTable}', joinTablename)
		// 								.replace('{targetColName}', targetObjectName)
		// 						},

		// 						to: '{targetTable}.id'.replace('{targetTable}', targetTableName)
		// 					}

		// 				};
		// 			}
		// 			// 1:M
		// 			else if (f.settings.linkType == 'one' && f.settings.linkViaType == 'many') {
		// 				relationMappings[relationName] = {
		// 					relation: Model.BelongsToOneRelation,
		// 					modelClass: linkModel,
		// 					join: {
		// 						from: '{sourceTable}.{field}'
		// 							.replace('{sourceTable}', tableName)
		// 							.replace('{field}', f.columnName),

		// 						to: '{targetTable}.id'
		// 							.replace('{targetTable}', linkObject.dbTableName())
		// 					}
		// 				};
		// 			}
		// 			// M:1
		// 			else if (f.settings.linkType == 'many' && f.settings.linkViaType == 'one') {
		// 				relationMappings[relationName] = {
		// 					relation: Model.HasManyRelation,
		// 					modelClass: linkModel,
		// 					join: {
		// 						from: '{sourceTable}.id'
		// 							.replace('{sourceTable}', tableName),

		// 						to: '{targetTable}.{field}'
		// 							.replace('{targetTable}', linkObject.dbTableName())
		// 							.replace('{field}', linkField.columnName)
		// 					}
		// 				};
		// 			}
		// 		});

		// 		return relationMappings
		// 	};

		// 	// bind knex connection to object model
		// 	// NOTE : when model is bound, then relation setup will be executed
		// 	__ModelPool[tableName] = __ModelPool[tableName].bindKnex(knex);

		// }

		// return __ModelPool[tableName];

		return Model;
	}



	/**
	 * @method queryFind
	 * return a a knex QueryBuilder ready to perform a select() statment.
	 * NOTE: ObjectQuery overrides this to return queries already joined with 
	 * multiple tables.
	 * @param {obj} options  
	 *		A set of optional conditions to add to the find():
	 * @param {obj} userData 
	 * 		The current user's data (which can be used in our conditions.)
	 * @return {QueryBuilder}
	 */
	queryFind(options, userData) {

		return new Promise((resolve, reject) => {

			var query = ABMigration.connection().queryBuilder();

			var registeredBase = false;  // have we marked the base object/table?


			//// Now compile our joins:

			function makeLink(link, joinTable, A, op, B) {
				console.log('link.type:' + link.type);

				// try to correct some type mistakes:
				var type = link.type.toLowerCase();
				var convertHash = {
					'left': 'leftJoin',
					'leftjoin': 'leftJoin',
					'leftouterjoin': 'leftOuterJoin',
					'right': 'rightJoin',
					'rightjoin': 'rightJoin',
					'rightouterjoin': 'rightOuterJoin',
					'innerjoin': 'innerJoin',
					'fullouterjoin': 'fullOuterJoin'
				}
				if (convertHash[type]) {
					type = convertHash[type];
				}
				query[type](joinTable, function () {
					this.on(A, op, B);
				});
			}


			this.joins().forEach((link) => {

				var baseObject = this.application.urlResolve(link.objectURL);


				// mark the 1st object as our initial .from() 
				if (!registeredBase) {
					query.from(baseObject.dbTableName());
					registeredBase = true;
				}

				// no link column
				if (!link.fieldID) return;

				var connectionField = baseObject.fields((f) => { return f.id == link.fieldID; })[0];
				if (!connectionField) return; // no link so skip this turn.


				var connectedObject = connectionField.datasourceLink;
				var joinTable = connectedObject.dbTableName();

				var fieldLinkType = connectionField.linkType();
				switch (fieldLinkType) {

					case 'one':

						if (connectionField.settings.isSource || // 1:1 - this column is source
							connectionField.linkViaType() == 'many') { // 1:M 
							// the base object can have 1 connected object
							// the base object has the remote obj's .id in our field
							// baseObject JOIN  connectedObject ON baseObject.columnName = connectedObject.id


							// columnName comes from the baseObject
							var columnName = connectionField.columnName;
							var baseClause = baseObject.dbTableName() + '.' + columnName;
							var connectedClause = joinTable + '.' + connectedObject.PK();
							makeLink(link, joinTable, baseClause, '=', connectedClause);

						} else {
							// the base object can have 1 connected object
							// the base object's .id is in the connected Objects' colum 
							// baseObject JOIN  connectedObject ON baseObject.id = connectedObject.columnName

							// columnName comes from the baseObject
							var connectedField = connectionField.fieldLink();
							if (!connectedField) return;  // this is a problem!


							var columnName = connectedField.columnName;
							var baseClause = baseObject.dbTableName() + '.' + baseObject.PK();
							var connectedClause = joinTable + '.' + columnName;
							makeLink(link, joinTable, baseClause, '=', connectedClause);

						}
						break;

					case 'many':

						if (connectionField.linkViaType() == 'one') {
							// the base object can have many connectedObjects
							// the connected object can only have one base object
							// the base object's .id is stored in connected objects column
							// baseObject JOIN connectedObject ON baseObject.id == connectedObject.columnName

							// columnName comes from the baseObject
							var connectedField = connectionField.fieldLink();
							if (!connectedField) return;  // this is a problem!


							var columnName = connectedField.columnName;
							var baseClause = baseObject.dbTableName() + '.' + baseObject.PK();
							var connectedClause = joinTable + '.' + columnName;
							makeLink(link, joinTable, baseClause, '=', connectedClause);

						} else {

							// M:N connection
							// the base object can have Many connectedObjects
							// the connected object can have Many baseObjects
							// There is going to be a join table connecting the two:
							// the base object's .id is stored in connected objects column
							// baseObject JOIN joinTable ON baseObject.id == joinTable.[baseColumnName]
							// 		JOIN connectedObject ON joinTable.[connectedObjectName] == connectedObject.id

							//// Make Base Connection
							// get joinTable
							joinTable = connectionField.joinTableName();

							// get baseObjectColumn in joinTable
							var baseObjectColumn = baseObject.name; // AppBuilder.rules.toJunctionTableFK(baseObject.name, connectionField.columnName);

							var baseClause = baseObject.dbTableName() + '.' + baseObject.PK();
							var joinClause = joinTable + '.' + baseObjectColumn;

							// make JOIN
							makeLink(link, joinTable, baseClause, '=', joinClause);


							//// Now connect connectedObject
							// get connectedObjectColumn in joinTable
							var connectedField = connectionField.fieldLink();
							var connectedObjectColumn = connectedObject.name; // AppBuilder.rules.toJunctionTableFK(connectedObject.name, connectedField.columnName);

							var connectedClause = connectedObject.dbTableName() + '.' + connectedObject.PK();
							joinClause = joinTable + '.' + connectedObjectColumn;

							// make JOIN
							makeLink(link, connectedObject.dbTableName(), connectedClause, '=', joinClause);

						}
						break;

				}


			})



			//// Add in our fields:
			if (!options.ignoreIncludeColumns) { // get count of rows does not need to include columns

				var selects = [];
				var columns = [];

				// SELECT id of the base object
				var objectBase = this.objects()[0];
				if (objectBase)
					selects.push("{tableName}.{columnName} as id"
						.replace(/{tableName}/g, objectBase.dbTableName())
						.replace(/{columnName}/g, objectBase.PK()));

				// { 
				//	objectName: {
				//		object: {ABObject},
				// 		transColumns: ['string']
				//	}
				//}
				var externalTrans = {}; 

				this.fields().forEach((f) => {

					if (!f)
						return;

					var obj = f.object;

					// Connect fields
					if (f.key == 'connectObject') {

						var connectColFormat = ("(SELECT CONCAT(" +
							"'[',GROUP_CONCAT(JSON_OBJECT('id', `{linkTableName}`.`{columnName}`)),']')" +
							" FROM `{linkTableName}` WHERE `{linkTableName}`.`{linkColumnName}` = `{baseTableName}`.`{baseColumnName}`)" +
							" as `{objectName}.{displayName}`") // add object's name to alias
							.replace(/{baseTableName}/g, obj.dbTableName())
							.replace(/{baseColumnName}/g, obj.PK())
							.replace(/{objectName}/g, obj.name)
							.replace(/{displayName}/g, f.relationName());


						var field = '';
						var objLink = f.datasourceLink;
						var fieldLink = f.fieldLink();

						// 1:M
						if (f.settings.linkType == 'one' && f.settings.linkViaType == 'many') {

							field = ("IF(`{tableName}`.`{columnName}` IS NOT NULL, " +
								"JSON_OBJECT('id', `{tableName}`.`{columnName}`)," +
								"NULL)" +
								" as '{objectName}.{displayName}'")
								.replace(/{tableName}/g, obj.dbTableName())
								.replace(/{columnName}/g, f.columnName)
								.replace(/{objectName}/g, obj.name)
								.replace(/{displayName}/g, f.relationName());

						}

						// M:1
						else if (f.settings.linkType == 'many' && f.settings.linkViaType == 'one') {

							field = connectColFormat
								.replace(/{linkTableName}/g, objLink.dbTableName())
								.replace(/{linkColumnName}/g, fieldLink.columnName)
								.replace(/{columnName}/g, objLink.PK());


							// check need join table ??
							if (this.canFilterObject(objLink) == false) {

								let baseClause = obj.dbTableName() + '.' + obj.PK();
								let linkTable = objLink.dbTableName();
								let connectedClause = linkTable + '.' + fieldLink.columnName;
								makeLink({ type: 'left' }, linkTable, baseClause, '=', connectedClause);
							}
						}

						// 1:1
						else if (f.settings.linkType == 'one' && f.settings.linkViaType == 'one') {

							if (f.settings.isSource) {
								field = ("IF(`{tableName}`.`{columnName}` IS NOT NULL, " +
									"JSON_OBJECT('id', `{tableName}`.`{columnName}`)," +
									"NULL)" +
									" as '{objectName}.{displayName}'")
									.replace(/{tableName}/g, obj.dbTableName())
									.replace(/{columnName}/g, f.columnName)
									.replace(/{objectName}/g, obj.name)
									.replace(/{displayName}/g, f.relationName());
							}
							else {
								field = connectColFormat
									.replace(/{linkTableName}/g, objLink.dbTableName())
									.replace(/{linkColumnName}/g, fieldLink.columnName)
									.replace(/{columnName}/g, objLink.PK());


								// check need join table ??
								if (this.canFilterObject(objLink) == false) {

									let baseClause = obj.dbTableName() + '.' + obj.PK();
									let linkTable = objLink.dbTableName();
									let connectedClause = linkTable + '.' + fieldLink.columnName;
									makeLink({ type: 'left' }, linkTable, baseClause, '=', connectedClause);
								}
							}
						}

						// M:N
						else if (f.settings.linkType == 'many' && f.settings.linkViaType == 'many') {

							let joinTableName = f.joinTableName();

							field = connectColFormat
								.replace(/{linkTableName}/g, joinTableName)
								.replace(/{linkColumnName}/g, obj.name)
								.replace(/{columnName}/g, objLink.name);


							// check need join table ??
							if (this.canFilterObject(objLink) == false) {

								let baseClause = obj.dbTableName() + '.' + obj.PK();
								let connectedClause = joinTableName + '.' + obj.name;
								makeLink({ type: 'left' }, joinTableName, baseClause, '=', connectedClause);
							}

						}


						if (field)
							selects.push(ABMigration.connection().raw(field));

					}
					// Normal fields
					else {

						var columnName = f.columnName;

						if (f.isMultilingual) {
							if (obj.isExternal) {

								if (externalTrans[obj.name] == null) {
									externalTrans[obj.name] = {
										object: obj,
										transColumns: []
									};
								}

								// store trans column of external object
								// create query command below..
								externalTrans[obj.name].transColumns.push(columnName);

								return;
							}
							else {
								columnName = 'translations';
							}
						}

						var field = ("{tableName}.{columnName}" +
							" as {objectName}.{displayName}") // add object's name to alias
							.replace(/{tableName}/g, obj.dbTableName())
							.replace(/{columnName}/g, columnName)
							.replace(/{objectName}/g, obj.name)
							.replace(/{displayName}/g, columnName);

						columns.push(field);

					}

				});

				// SPECIAL CASE: Query translation of the external object
				Object.keys(externalTrans).forEach(objName => {

					var transInfo = externalTrans[objName],
						obj = transInfo.object;

					// JSON_OBJECT('language_code', `language_code`, ..., )
					var queryCommand = "";

					// pull `language_code` column too
					transInfo.transColumns.push('language_code');

					transInfo.transColumns.forEach((transCol, index) => {

						if (index > 0)
							queryCommand += ',';

						queryCommand += ("'{colName}', `{colName}`".replace(/{colName}/g, transCol));

					});

					var transField = ("(SELECT CONCAT('[', " +
									"	GROUP_CONCAT(JSON_OBJECT(" + queryCommand + "))" +
									", ']')" +
									" FROM `{linkTableName}`" +
									" WHERE `{linkTableName}`.`{linkColumnName}` = `{baseTableName}`.`{baseColumnName}`)" +
									" as `{objectName}.{displayName}`") // add object's name to alias
									.replace(/{linkTableName}/g, obj.dbTransTableName())
									.replace(/{linkColumnName}/g, obj.transColumnName)
									.replace(/{baseTableName}/g, obj.dbTableName())
									.replace(/{baseColumnName}/g, obj.PK())
									.replace(/{objectName}/g, obj.name)
									.replace(/{displayName}/g, "translations");

					selects.push(ABMigration.connection().raw(transField));

				});


				query.column(columns);
				query.select(selects);
				query.distinct();

			}


			// update our condition to include the one we are defined with:
			// 
			if (this.workspaceFilterConditions && this.workspaceFilterConditions.glue) {
				if (options.where && options.where.glue) {

					// in the case where we have a condition and a condition was passed in
					// combine our conditions
					// queryCondition AND givenConditions:
					// var oWhere = _.clone(options.where);

					// var newWhere = {
					// 	glue: 'and',
					// 	rules: [
					// 		this.where,
					// 		oWhere
					// 	]
					// }

					// options.where = newWhere;

					options.where.rules = options.where.rules || [];

					(this.workspaceFilterConditions.rules || []).forEach(r => {
						// START HERE MAY 29
						options.where.rules.push(_.clone(r));
					});

				} else {

					// if we had a condition and no condition was passed in, 
					// just use ours:
					options.where = _.cloneDeep(this.workspaceFilterConditions);
				}
			}

			if (options.columnNames && options.columnNames.length) {
				query.clearSelect().column(options.columnNames);
			}
			
			if (options) {
				
				// run the options.where through our existing policy filters
				// get array of policies to run through
				var processPolicy = (indx, cb) => {
					
					if (indx >= PolicyList.length) {
						cb();
					} else {

						// load the policy
						var policy = PolicyList[indx];
					
						// run the policy on my data
						// policy(req, res, cb)
						// 	req.options._where
						//  req.user.data
						var myReq = {
							options:{
								_where:options.where
							},
							user:{
								data:userData
							},
							param: (id) => {
								if (id == "appID") {
									return this.application.id;
								} else if (id == "objID") {
									return this.id;
								}
							}
						}

						policy(myReq, {}, (err)=>{
							
							if (err) {
								cb(err);
							} else {
								// try the next one
								processPolicy(indx+1, cb);
							}
						})
					}
				}
				
				// run each One
				processPolicy(0, (err)=>{
					
					// now that I'm through with updating our Conditions
					
					if (err) {
						reject(err);
					} else {
						
						// when finished populate our Find Conditions
						this.populateFindConditions(query, options, userData);
						
						// after all that, resolve our promise with the query results
						resolve(query); // query.then(resolve);
					}
				})
				
			}
			
			
			// edit property names of .translation
			// {objectName}.{columnName}
			if (!options.ignoreEditTranslations) {

				query.on('query-response', function (rows, obj, builder) {

					(rows || []).forEach((r) => {

						// each rows
						Object.keys(r).forEach((rKey) => {

							// objectName.translations
							if (rKey.endsWith('.translations')) {

								r.translations = r.translations || [];

								var objectName = rKey.replace('.translations', '');

								var translations = [];
								if (typeof r[rKey] == 'string')
									translations = JSON.parse(r[rKey]);

								// each elements of trans
								(translations || []).forEach((tran) => {

									var newTran = {
										language_code: tran.language_code
									};

									// include objectName into property - objectName.propertyName
									Object.keys(tran).forEach(tranKey => {

										if (tranKey == 'language_code') return;

										var newTranKey = "{objectName}.{propertyName}"
											.replace("{objectName}", objectName)
											.replace("{propertyName}", tranKey);

										// add new property name
										newTran[newTranKey] = tran[tranKey]

									});


									r.translations.push(newTran);

								});


								// remove old translations
								delete rows[rKey];

							}

						});

					});

				});

			} // if ignoreEditTranslations
			
			// return query;
		
		})

	}


	/**
	 * @method queryCount
	 * return an Objection.js QueryBuilder that is already setup for this object.
	 * This query is setup to add our count parameter to our returns.
	 * @param {obj} options  
	 *		A set of optional conditions to add to the find():
	 * @param {obj} userData 
	 * 		The current user's data (which can be used in our conditions.)
	 * @param {string} tableName 
	 * 		[optional] the table name to use for the count
	 * @return {QueryBuilder}
	 */
	queryCount(options, userData, tableName) {

		// if (_.isUndefined(tableName)) {
		// 	var firstLink = this.joins()[0];
		// 	var baseObject = this.application.urlResolve(firstLink.objectURL);
		// 	tableName = baseObject.dbTableName();
		// }

		// options = options || {};

		// we don't include relative data on counts:
		// and get rid of any .sort, .offset, .limit
		// options.includeRelativeData = false;
		delete options.sort;
		delete options.offset;
		delete options.limit;

		// not include columns
		// to prevent 'ER_MIX_OF_GROUP_FUNC_AND_FIELDS' error
		// options.ignoreIncludeColumns = true;

		// not update translations key names
		options.ignoreEditTranslations = true;

		// added tableName to id because of non unique field error
		return this.queryFind(options, userData)
				.then((query)=>{
					// TODO:: we need to figure out how to return the count not the full data
					return query.length;
				});

	}




	/**
	 * @method isValidData
	 * Parse through the given data and return an array of any invalid
	 * value errors.
	 * @param {obj} allParameters  a key=>value hash of the inputs to parse.
	 * @return {array} 
	 */
	//// TODO: create OP.Validation.validator() and use super.isValidData() instead.
	isValidData(allParameters) {
		var errors = [];
		this.fields().forEach((f) => {
			var p = f.isValidData(allParameters);
			if (p.length > 0) {
				errors = errors.concat(p);
			}
		})

		return errors;
	}


}