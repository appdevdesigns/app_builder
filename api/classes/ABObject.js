
var path = require('path');
var _ = require('lodash');

var ABObjectBase = require(path.join(__dirname,  "..", "..", "assets", "opstools", "AppBuilder", "classes",  "ABObjectBase.js"));
// var ABFieldManager = require(path.join(__dirname, 'ABFieldManager'));
var Model = require('objection').Model;


var __ModelPool = {};  // reuse any previously created Model connections
					   // to minimize .knex bindings (and connection pools!)



module.exports = class ABObject extends ABObjectBase {

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

		// NOTE: store table name of import object to ignore async
		result.tableName = this.tableName;

		return result;

	}


	///
	/// Fields
	///


	// *
	//  * @method fieldNew()
	//  *
	//  * return an instance of a new (unsaved) ABField that is tied to this
	//  * ABObject.
	//  *
	//  * NOTE: this new field is not included in our this.fields until a .save()
	//  * is performed on the field.
	//  *
	//  * @return {ABField}
	 
	// fieldNew ( values ) {
	// 	// NOTE: ABFieldManager.newField() returns the proper ABFieldXXXX instance.
	// 	return ABFieldManager.newField( values, this );
	// }





	///
	/// Migration Services
	///

	dbTableName() {
		if (this.isImported) {
			// NOTE: store table name of import object to ignore async
			return this.tableName;
		}
		else {
			return AppBuilder.rules.toObjectNameFormat(this.application.dbApplicationName(), this.name);
			// var modelName = this.name.toLowerCase();
			// if (!sails.models[modelName]) {
			// 	throw new Error(`Imported object model not found: ${modelName}`);
			// }
			// else {
			// 	return sails.models[modelName].waterline.schema[modelName].tableName;
			// }
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
				
				if (this.isImported) {
					sails.log.silly('.... aborted drop of imported table');
					reject(new Error('Cannot drop an imported object'));
					return;
				}

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
			// jsonSchema is only used by Objection.js to validate data before
			// performing an insert/update.
			// This does not DEFINE the DB Table.
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
			allFields.forEach(function(f) {
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
							relation,
							columnName;

						if (f.settings.isSource == true) {
							sourceTable = tableName;
							targetTable = linkObject.dbTableName();
							relation = Model.BelongsToOneRelation;
							columnName = f.columnName;
						}
						else {
							sourceTable = linkObject.dbTableName();
							targetTable = tableName;
							relation = Model.HasOneRelation;
							columnName = linkField.columnName;
						}

						relationMappings[relationName] = {
							relation: relation,
							modelClass: linkModel,
							join: {
								from: '{targetTable}.id'
									.replace('{targetTable}', targetTable),

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

		var tableName = this.dbTableName();
		delete __ModelPool[tableName];

		ABMigration.refreshObject(tableName);

	}


	/**
	 * @method queryFind
	 * return an Objection.js QueryBuilder (basically a knex QueryBuilder with 
	 * a few additional methods).
	 * NOTE: ObjectQuery overrides this to return queries already joined with 
	 * multiple tables.
	 * @param {obj} options  
	 *		A set of optional conditions to add to the find():
	 * @param {obj} userData 
	 * 		The current user's data (which can be used in our conditions.)
	 * @return {QueryBuilder}
	 */
	queryFind(options, userData) {

		var query = this.model().query();
		if (options) {
			this.populateFindConditions(query, options, userData)
		}

		return query;
	}


	/**
	 * @method queryCount
	 * return an Objection.js QueryBuilder that is already setup for this object.
	 * NOTE: ObjectQuery overrides this to return queries already joined with 
	 * multiple tables.
	 * @param {obj} options  
	 *		A set of optional conditions to add to the find():
	 * @param {obj} userData 
	 * 		The current user's data (which can be used in our conditions.)
	 * @param {string} tableName 
	 * 		[optional] the table name to use for the count
	 * @return {QueryBuilder}
	 */
	queryCount(options, userData, tableName) {

		if  (_.isUndefined(tableName)) {
			tableName = this.model().tableName;
		}

		// we don't include relative data on counts:
		// and get rid of any .sort, .offset, .limit
		options.includeRelativeData = false;
		delete options.sort;
        delete options.offset;
        delete options.limit;

		// added tableName to id because of non unique field error
		return this.queryFind(options, userData).count('{tableName}.id as count'.replace("{tableName}", tableName));
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
		this.connectFields().forEach((f) => {

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


	/**
	 * @function populateFindConditions
	 * Add find conditions and include relation data to Knex.query
	 * 
	 * @param {Knex.query} query 
	 * @param {Object} options - {
	 *                              where : {Array}
	 *                              sort :  {Array}
	 *                              offset: {Integer}
	 *                              limit:  {Integer}
	 *                              includeRelativeData: {Boolean}
	 *                           }
	 * @param {string} userData - {
	 *                              username: {string},
	 *                              guid: {string},
	 *                              languageCode: {string}, - 'en', 'th'
	 *                              ...
	 *                             }
	 */
	populateFindConditions(query, options, userData) {

	    var where = options.where,
	        sort = options.sort,
	        offset = options.offset,
	        limit = options.limit;

	    // Apply filters
	    if (!_.isEmpty(where)) {


	        sails.log.debug('ABObject.populateFindConditions(): .where condition:', JSON.stringify(where, null, 4));


	        // @function parseCondition
	        // recursive fn() to step through each of our provided conditions and
	        // translate them into query.XXXX() operations.
	        // @param {obj} condition  a QueryBuilder compatible condition object
	        // @param {ObjectionJS Query} Query the query object to perform the operations.
	        var parseCondition = (condition, Query) => {

	            // FIX: some improper inputs:
	            // if they didn't provide a .glue, then default to 'and'
	            // current webix behavior, might not return this 
	            // so if there is a .rules property, then there should be a .glue:
	            if (condition.rules) {
	                condition.glue = condition.glue || 'and';
	            }

	            // if this is a grouping condition, then decide how to group and 
	            // process our sub rules:
	            if (condition.glue) {

	                var nextCombineKey = 'where';
	                if (condition.glue == 'or') {
	                    nextCombineKey = 'orWhere';
	                }
	                condition.rules.forEach((r)=>{

	                    Query[nextCombineKey]( function() { 

	                        // NOTE: pass 'this' as the Query object
	                        // so we can perform embedded queries:
	                        parseCondition(r, this); 
	                    });
	                    
	                })
	                
	                return;
	            }


	            //// Special Case:  'have_no_relation'
	            // 1:1 - Get rows that no relation with 
	            if (condition.rule == 'have_no_relation') {
	                var relation_name = AppBuilder.rules.toFieldRelationFormat(condition.key);

	                Query
	                    .leftJoinRelation(relation_name)
	                    .whereRaw('{relation_name}.id IS NULL'.replace('{relation_name}', relation_name));

	                return;
	            }



	            //// Handle a basic rule:
	            // { 
	            //     key: fieldName,
	            //     rule: 'qb_rule',
	            //     value: ''
	            // }

	            sails.log.verbose('... basic condition:', JSON.stringify(condition, null, 4));

	            // We are going to use the 'raw' queries for knex becuase the '.' 
	            // for JSON searching is misinterpreted as a sql identifier
	            // our basic where statement will be:
	            var whereRaw = '{fieldName} {operator} {input}';


	            // make sure a value is properly Quoted:
	            function quoteMe(value) {
	                return "'"+value+"'"
	            }


	            // convert QB Rule to SQL operation:
	            var conversionHash = {
	                'equals'        : '=',
	                'not_equal'     : '<>',
	                'is_empty'      : '=',
	                'is_not_empty'  : '<>',
	                'greater'       : '>',
	                'greater_or_equal' : '>=',
	                'less'          : '<',
	                'less_or_equal' : '<='
	            }


	            // basic case:  simple conversion
	            var operator = conversionHash[condition.rule];
	            var value = quoteMe(condition.value);



	            // special operation cases:
	            switch (condition.rule) {
	                case "begins_with":
	                    operator = 'LIKE';
	                    value = quoteMe(condition.value + '%');
	                    break;

	                case "not_begins_with":
	                    operator = "NOT LIKE";
	                    value = quoteMe(condition.value + '%');
	                    break;

	                case "contains":
	                    operator = 'LIKE';
	                    value = quoteMe('%' + condition.value + '%');
	                    break;

	                case "not_contains":
	                    operator = "NOT LIKE";
	                    value = quoteMe('%' + condition.value + '%');
	                    break;

	                case "ends_with":
	                    operator = 'LIKE';
	                    value = quoteMe('%' + condition.value);
	                    break;

	                case "not_ends_with":
	                    operator = "NOT LIKE";
	                    value = quoteMe('%' + condition.value);
	                    break;

	                case "between": 
	                    operator = "BETWEEN";
	                    value = condition.value.map(function(v){ return quoteMe(v)}).join(' AND ');
	                    break;

	                case 'not_between':
	                    operator = "NOT BETWEEN";
	                    value = condition.value.map(function(v){ return quoteMe(v)}).join(' AND ');
	                    break;

	                case "is_current_user":
	                    operator = "=";
	                    value = quoteMe(userData.username);
	                    break;

	                case "is_not_current_user":
	                    operator = "<>";
	                    value = quoteMe(userData.username);
	                    break;

	                case 'is_null': 
	                    operator = "IS NULL";
	                    value = '';
	                    break;

	                case 'is_not_null': 
	                    operator = "IS NOT NULL";
	                    value = '';
	                    break;

	                case "in":
	                    operator = "IN";
	                    value = '(' + condition.value.map(function(v){ return quoteMe(v)}).join(', ') + ')';
	                    break;

	                case "not_in":
	                    operator = "NOT IN";
	                    value = '(' + condition.value.map(function(v){ return quoteMe(v)}).join(', ') + ')';
	                    break;

	            }


	            // normal field name:
	            var fieldName = '`' + condition.key + '`';

	            // if we are searching a multilingual field it is stored in translations so we need to search JSON
	            var field = this._fields.filter(field => field.columnName == condition.key)[0];
	            if (field && field.settings.supportMultilingual == 1) {
	                fieldName = 'JSON_UNQUOTE(JSON_EXTRACT(JSON_EXTRACT(translations, SUBSTRING(JSON_UNQUOTE(JSON_SEARCH(translations, "one", "' + userData.languageCode + '")), 1, 4)), \'$."' + condition.key + '"\'))';
	            } 

	            // if this is from a LIST, then make sure our value is the .ID
	            if (field && field.key == "list" && field.settings && field.settings.options && field.settings.options.filter) {
	                // NOTE: Should get 'id' or 'text' from client ??
	                var inputID = field.settings.options.filter(option => (option.id == value || option.text == value))[0];
	                if (inputID)
	                    value = inputID.id;
	            }


	            // update our where statement:
	            whereRaw = whereRaw
	                .replace('{fieldName}', fieldName)
	                .replace('{operator}', operator)
	                .replace('{input}', ((value != null) ?  value  : ''));


	            // Now we add in our where
	            Query.whereRaw(whereRaw);
	        }

	        parseCondition(where, query);

	    }

	    // Apply Sorts
	    if (!_.isEmpty(sort)) {
	        sort.forEach(function (o) {
	            // if we are ordering by a multilingual field it is stored in translations so we need to search JSON but this is different from filters
	            // because we are going to sort by the users language not the builder's so the view will be sorted differntly depending on which languageCode
	            // you are using but the intent of the sort is maintained
	            if (o.isMulti == 1) {
	                var by = 'JSON_UNQUOTE(JSON_EXTRACT(JSON_EXTRACT(translations, SUBSTRING(JSON_UNQUOTE(JSON_SEARCH(translations, "one", "' + userData.languageCode + '")), 1, 4)), \'$."' + o.by + '"\'))';
	            } else { // If we are just sorting a field it is much simpler
	                var by = "`" + o.by + "`";
	            }
	            query.orderByRaw(by + " " + o.dir);
	        })
	    }


	    // apply any offset/limit if provided.
	    if (offset) {
	        query.offset(offset);
	    }
	    if (limit) {
	        query.limit(limit);
	    }

	    // query relation data
	    if (options.includeRelativeData) {
	        if (query.eager) {
	            
	            var relationNames = this.connectFields()
	                .filter((f) => f.fieldLink() != null)
	                .map((f) => f.relationName());

	            if (relationNames.length > 0)
	                query.eager('[#fieldNames#]'.replace('#fieldNames#', relationNames.join(', ')));
	        }

	    }

	    sails.log.debug('SQL:', query.toString() );
	}

}
