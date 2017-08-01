
var path = require('path');

var ABObjectBase = require(path.join(__dirname,  "..", "..", "assets", "opstools", "AppBuilder", "classes",  "ABObjectBase.js"));
var ABFieldManager = require(path.join(__dirname, 'ABFieldManager'));
var Model = require('objection').Model;


var __ModelPool = {};  // reuse any previously created Model connections
					   // to minimize .knex bindings (and connection pools!)


function toDC( data ) {
	return new webix.DataCollection({
		data: data,

		// on: {
		// 	onAfterDelete: function(id) {

		// 	}
		// }
	});
}

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABObject extends ABObjectBase {

    constructor(attributes, application) {
    	super(attributes, application);
/*
{
	id: uuid(),
	name: 'name',
	labelFormat: 'xxxxx',
	isImported: 1/0,
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
	fieldNew ( values ) {
		// NOTE: ABFieldManager.newField() returns the proper ABFieldXXXX instance.
		return ABFieldManager.newField( values, this );
	}





	///
	/// Migration Services
	///

	dbTableName() {
		if (!this.isImported) {
			return AppBuilder.rules.toObjectNameFormat(this.application.dbApplicationName(), this.name);
		}
		else {
			var modelName = this.name.toLowerCase();
			if (!sails.models[modelName]) {
				throw new Error(`Imported object model not found: ${modelName}`);
			}
			else {
				return sails.models[modelName].waterline.schema[modelName].tableName;
			}
		}
	}


	/**
	 * migrateCreateTable
	 * verify that a table for this object exists.
	 * @param {Knex} knex the knex sql library manager for manipulating the DB.
	 * @return {Promise}
	 */
	migrateCreate(knex) {
		sails.log.verbose('ABObject.migrateCreate()');

		var tableName = this.dbTableName();
		sails.log.verbose('.... dbTableName:'+ tableName);

		return new Promise(
			(resolve, reject) => {

				knex.schema.hasTable(tableName).then((exists) => {
					
					// if it doesn't exist, then create it and any known fields:
					if (!exists) {
						sails.log.verbose('... creating!!!');
						return knex.schema.createTable(tableName, (t) => {
							t.increments('id').primary();
							t.timestamps();
							t.engine('InnoDB');
							t.charset('utf8');
							t.collate('utf8_unicode_ci');

							var fieldUpdates = [];
							this.fields().forEach((f)=>{

								fieldUpdates.push(f.migrateCreate(knex));

							})
							
							// Adding a new field to store various item properties in JSON (ex: height)
							fieldUpdates.push(t.text("properties"));

							Promise.all(fieldUpdates)
							.then(resolve, reject);

						})

					} else {
						sails.log.verbose('... already there.');
						resolve();
					}
				});

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
		sails.log.verbose('ABObject.migrateDrop()');

		var tableName = this.dbTableName();
		sails.log.verbose('.... dbTableName:'+ tableName);

		return new Promise(
			(resolve, reject) => {
				sails.log.silly('.... .migrateDropTable()  before knex:');

				//BEFORE we just go drop the table, let's give each of our
				// fields the chance to perform any clean up actions related
				// to their columns being removed from the system.
				//   Image Fields, Attachment Fields, Connection Fields, etc... 


// QUESTION: When removing ConnectionFields:  If other objects connect to this object, we
// need to decide how to handle that:
// - auto remove those fields from other objects?
// - perform the corrections here, or alert the USER in the UI and expect them to 
//   make the changes manually? 


				var fieldDrops = [];
				this.fields().forEach((f)=>{
					fieldDrops.push(f.migrateDrop(knex));
				})

				Promise.all(fieldDrops)
				.then(function(){

					knex.schema.dropTableIfExists(tableName)
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

		if (!__ModelPool[tableName]) {
			
			var knex = ABMigration.connection();

			// Compile our jsonSchema from our DataFields
			var jsonSchema = {
				type: 'object',
				required: [],
				properties: {

					created_at:{ type:['null', 'string'], pattern: AppBuilder.rules.SQLDateTimeRegExp },
					updated_at:{ type:['null', 'string'], pattern: AppBuilder.rules.SQLDateTimeRegExp },
					properties:{ type:['null', 'object'] }

				}
			}
			var currObject = this;
			var allFields = this.fields();
			allFields.forEach((f)=>{
				f.jsonSchemaProperties(jsonSchema.properties);
			})


			class MyModel extends Model {

				// Table name is the only required property.
				static get tableName() {
					return tableName;
				}

				static get jsonSchema () {
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

				var linkedFields = currObject.linkFields();

				// linkObject: '', // ABObject.id
				// linkType: 'one', // one, many
				// linkViaType: 'many' // one, many

				linkedFields.forEach((f) => {
					// find linked object name
					var linkObject = currObject.application.objects((obj) => { return obj.id == f.settings.linkObject; })[0];
					if (linkObject == null) return;

					var linkModel = linkObject.model();
					var relationName = AppBuilder.rules.toFieldRelationFormat(f.columnName);

					// 1:1
					if (f.settings.linkType == 'one' && f.settings.linkViaType == 'one') {

						var sourceTable,
							targetTable,
							relation;

						if (f.settings.isSource == true) {
							sourceTable = tableName;
							targetTable = linkObject.dbTableName();
							relation = Model.BelongsToOneRelation;
						}
						else {
							sourceTable = linkObject.dbTableName();
							targetTable = tableName;
							relation = Model.HasOneRelation;
						}

						relationMappings[relationName] = {
							relation: relation,
							modelClass: linkModel,
							join: {
								from: '{targetTable}.id'
									.replace('{targetTable}', targetTable),

								to: '{sourceTable}.{field}'
									.replace('{sourceTable}', sourceTable)
									.replace('{field}', f.columnName)
							}
						};
					}
					// M:N
					else if (f.settings.linkType == 'many' && f.settings.linkViaType == 'many') {
						// get join table name
						var joinTablename = f.joinTableName(),
							sourceObjectName,
							sourceTableName,
							targetObjectName,
							targetTableName;

						if (f.settings.isSource == true) {
							sourceObjectName = f.object.name;
							sourceTableName = f.object.dbTableName();
							targetObjectName = linkObject.name;
							targetTableName = linkObject.dbTableName();
						}
						else {
							sourceObjectName = linkObject.name;
							sourceTableName = linkObject.dbTableName();
							targetObjectName = f.object.name;
							targetTableName = f.object.dbTableName();
						}

						relationMappings[relationName] = {
							relation: Model.ManyToManyRelation,
							modelClass: linkModel,
							join: {
								from: '{sourceTable}.id'.replace('{sourceTable}', sourceTableName),

								through: {
									from: '{joinTable}.{sourceColName}'
										.replace('{joinTable}', joinTablename)
										.replace('{sourceColName}', sourceObjectName),


									to: '{joinTable}.{targetColName}'
										.replace('{joinTable}', joinTablename)
										.replace('{targetColName}', targetObjectName)
								},

								to: '{targetTable}.id'.replace('{targetTable}', targetTableName)
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

								to: '{targetTable}.id'
									.replace('{targetTable}', linkObject.dbTableName())
							}
						};
					}
					// M:1
					else if (f.settings.linkType == 'many' && f.settings.linkViaType == 'one') {
						relationMappings[relationName] = {
							relation: Model.HasManyRelation,
							modelClass: linkModel,
							join: {
								from: '{sourceTable}.id'
									.replace('{sourceTable}', tableName),

								to: '{targetTable}.{field}'
									.replace('{targetTable}', linkObject.dbTableName())
									.replace('{field}', f.columnName)
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

		var tableName = this.dbTableName();
		delete __ModelPool[tableName];
	}


	/**
	 * @method requestParams
	 * Parse through the given parameters and return a subset of data that
	 * relates to the fields in this object.
	 * @param {obj} allParameters  a key=>value hash of the inputs to parse.
	 * @return {obj} 
	 */
	requestParams(allParameters) {
		var usefulParameters = {};
		this.fields().forEach((f) => {
			var p = f.requestParam(allParameters);
			if (p) {
				for (var a in p) {
					usefulParameters[a] = p[a];
				}
			}
		})

		return usefulParameters;
	}


	requestRelationParams(allParameters) {
		var usefulParameters = {};
		this.linkFields().forEach((f) => {

			if (f.requestRelationParam) {
				var p = f.requestRelationParam(allParameters);
				if (p) {
					for (var a in p) {
						usefulParameters[a] = p[a];
					}
				}
			}

		});

		return usefulParameters;
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



	/**
	 * @method postGet
	 * Allow our DataFields another pass at the data before returning it to the
	 * client.  Our DataFields can do any post conditioning of their data 
	 * before it is sent back.
	 * @param {array} data  array of table rows returned from our table.
	 * @return {Objection.Model} 
	 */
	postGet( data ) {
		return new Promise(
			(resolve, reject) => {

				var allActions = [];

				data.forEach((d)=>{
					this.fields().forEach((f) => {
						allActions.push(f.postGet(d));  // update data in place.
					})
				})

				Promise.all(allActions)
				.then(resolve)
				.catch(reject);

			}
		)
	}

}
