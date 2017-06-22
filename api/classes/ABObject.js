
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
		return AppBuilder.rules.toObjectNameFormat(this.application.dbApplicationName(), this.name);
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

					created_at:{ type:['null', 'string'], pattern:'^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}$' },
					updated_at:{ type:['null', 'string'], pattern:'^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}$' }

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

				static get relationMappings() {
					// Compile our relations from our DataFields
					var relationMappings = {};

					var linkedFields = allFields.filter((f) => { return f.key == 'connectObject'; });

					// linkObject: '', // ABObject.id
					// linkType: 'one', // one, many
					// linkViaType: 'many' // one, many

					linkedFields.forEach((f) => {
						// find linked object name
						var linkedObject = currObject.application.objects((obj) => { return obj.id == f.settings.linkObject; })[0];
						if (linkedObject == null) return;

						var linkedModel = linkedObject.model();

						// 1:1
						if (f.settings.linkType == 'one' && f.settings.linkViaType == 'one') {
							relationMappings[f.columnName] = {
								relation: Model.HasOneRelation,
								modelClass: linkedModel,
								// TODO
								join: {
									from: '{targetTable}.id'
										.replace('{targetTable}', linkedObject.dbTableName()),

									to: '{sourceTable}.{field}'
										.replace('{sourceTable}', tableName)
										.replace('{field}', f.columnName)
								}
							};
						}
						// M:N
						else if (f.settings.linkType == 'many' && f.settings.linkViaType == 'many') {
							// TODO
							var joinTablename = 'TODO';

							relationMappings[f.columnName] = {
								relation: Model.ManyToManyRelation,
								modelClass: linkedModel,
								join: {
									from: '{sourceTable}.id'.replace('{sourceTable}', tableName),

									through: {
										from: '{joinTable}.{sourceTable}Id'
											.replace('{joinTable}', joinTablename)
											.replace('{sourceTable}', tableName),


										to: '{joinTable}.{targetTable}Id'
											.replace('{joinTable}', joinTablename)
											.replace('{targetTable}', linkedObject.dbTableName())
									},

									to: '{targetTable}.id'.replace('{targetTable}', linkedObject.dbTableName())
								}

							};
						}
						// 1:M
						else if (f.settings.linkType == 'one' && f.settings.linkViaType == 'many') {
							relationMappings[f.columnName] = {
								relation: Model.BelongsToOneRelation,
								modelClass: linkedModel,
								join: {
									from: '{sourceTable}.{field}'
										.replace('{sourceTable}', tableName)
										.replace('{field}', f.columnName),

									to: '{targetTable}.id'
										.replace('{targetTable}', linkedObject.dbTableName())
								}
							};
						}
						// M:1
						else if (f.settings.linkType == 'many' && f.settings.linkViaType == 'one') {
							relationMappings[f.columnName] = {
								relation: Model.HasManyRelation,
								modelClass: linkedModel,
								join: {
									from: '{sourceTable}.id'
										.replace('{sourceTable}', tableName),

									to: '{targetTable}.{field}'
										.replace('{targetTable}', linkedObject.dbTableName())
										.replace('{field}', f.columnName)
								}
							};
						}
					});

					return relationMappings
				}
			}

			__ModelPool[tableName] = MyModel.bindKnex(knex);
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
