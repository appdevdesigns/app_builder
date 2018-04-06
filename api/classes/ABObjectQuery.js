
var path = require('path');
var _ = require('lodash');

var ABObject = require(path.join(__dirname, 'ABObject'));

var Model = require('objection').Model;


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
	  	this.where = attributes.where || {};

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
	toObj () {

		var result = super.toObj();

		/// include our additional objects and where settings:

		result.joins = this.exportJoins();  //objects;
		result.where  = this.where;

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
	  	fieldSettings.forEach((field) => {
	  		newFields.push( this.application.urlResolve(field.fieldURL) );
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
	joins (filter) {

		filter = filter || function(){ return true; };

		return this._joins.filter(filter);
	}


	/**
	 * @method objects()
	 *
	 * return an array of all the ABObjects for this Query.
	 *
	 * @return {array}
	 */
	objects (filter) {

		filter = filter || function(){ return true; };

		return this._objects.filter(filter);
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
			
			var inThere = newObjects.filter((o)=>{ return o.id == object.id}).length > 0;
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
	  		storeSingle(object);

	  		// track our linked object
	  		var linkField = object.fields((f)=>{ return f.id == join.fieldID; })[0];
	  		var linkObject = linkField.datasourceLink;
	  		storeSingle(linkObject);


	  		newJoins.push( join );
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
		this._joins.forEach((join)=>{
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
		return this.objects((o)=>{ return o.id == object.id; }).length > 0;

	}

	/**
	 * @method canFilterField
	 * evaluate the provided field to see if it can be filtered by this
	 * query.
	 * @param {ABObject} object
	 * @return {bool} 
	 */
	canFilterField(field) {

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
	 * @method modelRefresh
	 * when the definition of a model changes, we need to clear our cached
	 * model definitions.
	 * NOTE: called from our ABField.migrateXXX methods.
	 */
	// modelRefresh() {

	// 	var tableName = this.dbTableName();
	// 	delete __ModelPool[tableName];

	// 	ABMigration.refreshObject(tableName);

	// }




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
	queryFind(options, userData)  {

		var query = ABMigration.connection().queryBuilder();

		var registeredBase = false;  // have we marked the base object/table?


		//// Add in our fields:
		var columns = [];
		this.fields().forEach((f)=>{
			var obj = f.object;
			var field = obj.dbTableName()+'.'+f.columnName;
			columns.push(field);
		})
		query.columns(columns);



		//// Now compile our joins:

		function makeLink(link, joinTable, A, op, B) {
console.log('link.type:'+ link.type);

			// try to correct some type mistakes:
			var type = link.type.toLowerCase();
			var convertHash = {
				'left':				'leftJoin',
				'leftjoin':			'leftJoin',
				'leftouterjoin':	'leftOuterJoin',
				'right':			'rightJoin',
				'rightjoin':		'rightJoin',
				'rightouterjoin':	'rightOuterJoin', 
				'innerjoin':		'innerJoin',
				'fullouterjoin':	'fullOuterJoin'
			}
			if (convertHash[type]) {
				type = convertHash[type];
			}
			query[type](joinTable, function() {
				this.on(A, op, B);
			});
		}


		this.joins().forEach((link)=>{

			var baseObject = this.application.urlResolve(link.objectURL);


			// mark the 1st object as our initial .from() 
			if (!registeredBase) {
				query.from(baseObject.dbTableName());
				registeredBase = true;
			}


			var connectionField = baseObject.fields((f)=>{ return f.id == link.fieldID; })[0];
			if (!connectionField) return; // no link so skip this turn.


			var connectedObject = connectionField.objectLink();
			var joinTable = connectedObject.dbTableName();

			var fieldLinkType = connectionField.linkType();
			switch(fieldLinkType) {

				case 'one':

					if (connectionField.isSource()) {
						// the base object can have 1 connected object
						// the base object has the remote obj's .id in our field
						// baseObject JOIN  connectedObject ON baseObject.columnName = connectedObject.id


						// columnName comes from the baseObject
						var columnName = connectionField.columnName;
						var baseClause = baseObject.dbTableName() + '.' + columnName;
						var connectedClause = joinTable + '.id';
						makeLink( link, joinTable, baseClause, '=', connectedClause );

					} else {
						// the base object can have 1 connected object
						// the base object's .id is in the connected Objects' colum 
						// baseObject JOIN  connectedObject ON baseObject.id = connectedObject.columnName

						// columnName comes from the baseObject
						var connectedField = connectionField.fieldLink();
						if (!connectedField) return;  // this is a problem!


						var columnName = connectedField.columnName;
						var baseClause = baseObject.dbTableName() + '.id';
						var connectedClause = joinTable + '.' + columnName;
						makeLink( link, joinTable, baseClause, '=', connectedClause );

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
						var baseClause = baseObject.dbTableName() + '.id';
						var connectedClause = joinTable + '.' + columnName;
						makeLink( link, joinTable, baseClause, '=', connectedClause );

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

						var baseClause = baseObject.dbTableName()+'.id';
						var joinClause = joinTable + '.' + baseObjectColumn;

						// make JOIN
						makeLink(link, joinTable, baseClause, '=', joinClause);


						//// Now connect connectedObject
						// get connectedObjectColumn in joinTable
						var connectedField = connectionField.fieldLink();
						var connectedObjectColumn = connectedObject.name; // AppBuilder.rules.toJunctionTableFK(connectedObject.name, connectedField.columnName);

						var connectedClause = connectedObject.dbTableName()+'.id';
						joinClause = joinTable +'.' + connectedObjectColumn;

						// make JOIN
						makeLink(link, connectedObject.dbTableName(), connectedClause, '=', joinClause);

					}
					break;

			}


		})



		// update our condition to include the one we are defined with:
		// 
		if (this.where && this.where.glue) {
			if (options.where && options.where.glue) {

				// in the case where we have a condition and a condition was passed in
				// combine our conditions
				// queryCondition AND givenConditions:
				var oWhere = _.clone(options.where);

				var newWhere = {
					glue:'and',
					rules:[
						this.where,
						oWhere
					]
				}

				options.where = newWhere;

			} else {

				// if we had a condition and no condition was passed in, 
				// just use ours:
				options.where = this.where;
			}
		}

		if (options) {
			this.populateFindConditions(query, options, userData);
		}

		return query;
		
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

		if (_.isUndefined(tableName)) {
			var firstLink = this.joins()[0];
			var baseObject = this.application.urlResolve(firstLink.objectURL);
			tableName = baseObject.dbTableName();
		}
		
		// call our parent queryCount() with correct tableName
		return super.queryCount(options, userData, tableName);
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
			if (p.length>0) {
				errors = errors.concat(p);
			}
		})

		return errors;
	}


}