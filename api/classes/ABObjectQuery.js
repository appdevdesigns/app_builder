
var path = require('path');

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

		// import all our ABObjects 
	  	this.importObjects(attributes.objects || []);
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

		result.objects = this.exportObjects();  //objects;
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
	/// Objects
	///



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
	 * @method objectBase
	 * return the object in our object list that is considered the 'base' object.
	 * (ie the 1st one added).
	 * @return {ABObject}
	 */
	objectBase() {
		return this.objects((o)=>{ return o.linkInfo.type.toLowerCase() == 'base'})[0];
	}

	/**
	 * @method importObjects
	 * instantiate a set of objects from the given attributes.
	 * Our attributes contain a set of ABObject URLs that should already be created in our Application.
	 * @param {array} settings The different field urls for each field
	 *					{ }
	 */
	importObjects(settings) {
		var newObjects = [];
	  	settings.forEach((obj) => {

	  		// Convert our saved settings:
	  		// {
	  		// 	   objectURL: 'xxxx',
	  		//     linkInfo: {} 
	  		// }
	  		// into an ABObject with .linkInfo added

	  		var object = this.application.urlResolve(obj.objectURL);
	  		object.linkInfo = obj.linkInfo;

	  		newObjects.push( object );
	  	})
	  	this._objects = newObjects;
	}


	/**
	 * @method exportObjects
	 * save our list of objects into our format for persisting on the server
	 * @param {array} settings 
	 */
	exportObjects() {

		var objects = [];
		this._objects.forEach((obj)=>{
			var setting = {
				objectURL: obj.urlPointer(),
				linkInfo: obj.linkInfo
			}
			objects.push(setting);
		})
		return objects;
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
	 * @return {QueryBuilder}
	 */
	queryFind() {

		var query = ABMigration.connection().queryBuilder();

		// step through objects to add in tables:
		var baseObject = this.objects((o)=>{ return });
		objects.forEach((o)=>{

		})

		return query;
		
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
