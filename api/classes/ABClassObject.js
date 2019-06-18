
var path = require('path');
var _ = require('lodash');

var ABObjectBase = require(path.join(__dirname,  "..", "..", "assets", "opstools", "AppBuilder", "classes",  "ABObjectBase.js"));
var ABFieldManager = require(path.join(__dirname, 'ABFieldManager'));

var Model = require('objection').Model;


var __ObjectPool = {};
var __ModelPool = {};	// reuse any previously created Model connections
						// to minimize .knex bindings (and connection pools!)

class ABClassObject extends ABObjectBase {

	constructor(attributes) {
		super(attributes || {});

/*
{
	id: uuid(),
	connName: 'string', // Sails DB connection name: 'appdev_default', 'legacy_hris', etc. Default is 'appBuilder'.
	name: 'name',
	labelFormat: 'xxxxx',
	isImported: 1/0,
	isExternal: 1/0,
	tableName:'string',  // NOTE: store table name of import object to ignore async
	transColumnName: 'string', // NOTE: store column name of translations table
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

        // Get filter and sort conditions of current view to be default settings
		if (attributes.objectWorkspaceViews) {

			let currViewId = attributes.objectWorkspaceViews.currentViewID;

			let currView = attributes.objectWorkspaceViews.list.filter(v => v.id == currViewId)[0];
			if (currView) {

				this.objectWorkspace.filterConditions = currView.filterConditions || [];
				this.objectWorkspace.sortFields = currView.sortFields || [];

			}
		}

		ABObjectCache.cache(this);

	}

	///
	/// Instance Methods
	///

	///
	/// Fields
	///

	/**
	 * @method fieldNew()
	 *
	 * return an instance of a new (unsaved) ABField that is tied to a given
	 * ABObject.
	 *
	 * NOTE: this new field is not included in our this.fields until a .save()
	 * is performed on the field.
	 *
	 * @param {obj} values  the initial values for this field.  
	 *						{ key:'{string}'} is required 
	 * @param {ABObject} object  the parent object this field belongs to.
	 * @return {ABField}
	 */
	fieldNew ( values, object ) {
		// NOTE: ABFieldManager returns the proper ABFieldXXXX instance.
		return ABFieldManager.newField( values, object );
	}



	///
	/// Migration Services
	///

	dbSchemaName() {

		return sails.config.connections["appBuilder"].database;
		// return sails.config.connections[this.connName || "appBuilder"].database;

	}

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
		sails.log.verbose('ABClassObject.migrateCreate()');

		var tableName = this.dbTableName();
		sails.log.verbose('.... dbTableName:'+ tableName);

		return new Promise(
			(resolve, reject) => {

				knex.schema.hasTable(tableName).then((exists) => {
					
					// if it doesn't exist, then create it and any known fields:
					if (!exists) {
						sails.log.verbose('... creating!!!');
						return knex.schema.createTable(tableName, (t) => {

							// Use .uuid to be primary key instead
							// t.increments('id').primary();
							t.string('uuid').primary();
							// NOTE: MySQL version 5 does not support default with a function
							// .defaultTo(knex.raw('uuid()')));

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
		sails.log.verbose('ABClassObject.migrateDrop()');

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

	modelName() {

		// return this.id.
		// 	replace(/[^a-zA-Z0-9]/g, ""); // remove special characters to allow model name to be class name

		// let appName = this.application.name,
		// 	tableName = this.dbTableName(true);

		// return '#appName##tableName#'
		// 		.replace('#appName#', appName)
		// 		.replace('#tableName#', tableName)
		// 		.replace(/[^a-zA-Z0-9]/g, ""); // remove special characters to allow model name to be class name

		return this.tableName.replace(/[^a-zA-Z0-9]/g, ""); // remove special characters to allow model name to be class name

	}

	/**
	 * @method model
	 * return an objection.js model for working with the data in this Object.
	 * @return {Objection.Model} 
	 */
	model() {

		var modelName = this.modelName(),
			tableName = this.dbTableName(true);

		if (!__ModelPool[modelName]) {

			var knex = ABMigration.connection(this.isImported ? this.connName : undefined);

			// Compile our jsonSchema from our DataFields
			// jsonSchema is only used by Objection.js to validate data before
			// performing an insert/update.
			// This does not DEFINE the DB Table.
			var jsonSchema = {
				type: 'object',
				required: [],
				properties: this.modelDefaultFields()
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

				static get idColumn() {
					return currObject.PK();
				}

				static get jsonSchema () {
    				return jsonSchema
    			}

				// Move relation setup to below
				// static get relationMappings () {
				// }

			}

			// rename class name
			// NOTE: prevent cache same table in difference apps
			Object.defineProperty(MyModel, 'name', { value: modelName });

			__ModelPool[modelName] = MyModel;

			// NOTE : there is relation setup here because prevent circular loop when get linked object.
			// have to define object models to __ModelPool[tableName] first
			__ModelPool[modelName].relationMappings = () => {

				return this.modelRelation();

			};

			// bind knex connection to object model
			// NOTE : when model is bound, then relation setup will be executed
			__ModelPool[modelName] = __ModelPool[modelName].bindKnex(knex);

		}

		return __ModelPool[modelName];
	}


	modelRelation() {

		var tableName = this.dbTableName(true);

		// Compile our relations from our DataFields
		var relationMappings = {};

		var connectFields = this.connectFields();

		// linkObject: '', // ABObject.id
		// linkType: 'one', // one, many
		// linkViaType: 'many' // one, many

		connectFields.forEach((f) => {
			// find linked object name
			// var linkObject = this.application.objects((obj) => { return obj.id == f.settings.linkObject; })[0];
			let linkObject = ABObjectCache.get(f.settings.linkObject);
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
					targetPkName = this.PK();
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

				sourceTableName = f.object.dbTableName(true);
				sourcePkName = f.object.PK();
				targetTableName = linkObject.dbTableName(true);
				targetPkName = linkObject.PK();

				// if (f.settings.isSource == true) {
				// 	sourceTableName = f.object.dbTableName(true);
				// 	sourcePkName = f.object.PK();
				// 	targetTableName = linkObject.dbTableName(true);
				// 	targetPkName = linkObject.PK();
				// }
				// else {
				// 	sourceTableName = linkObject.dbTableName(true);
				// 	sourcePkName = linkObject.PK();
				// 	targetTableName = f.object.dbTableName(true);
				// 	targetPkName = f.object.PK();
				// }

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
							.replace('{primaryField}', this.PK()),

						to: '{targetTable}.{field}'
							.replace('{targetTable}', linkObject.dbTableName(true))
							.replace('{field}', linkField.columnName)
					}
				};
			}
		});

		return relationMappings
	}


	modelDefaultFields() {

		return {

			uuid: { type: 'string' },
			created_at:{ type:['null', 'string'], pattern: AppBuilder.rules.SQLDateTimeRegExp },
			updated_at:{ type:['null', 'string'], pattern: AppBuilder.rules.SQLDateTimeRegExp },
			properties:{ type:['null', 'object'] }

		};

	}


	/**
	 * @method modelRefresh
	 * when the definition of a model changes, we need to clear our cached
	 * model definitions.
	 * NOTE: called from our ABField.migrateXXX methods.
	 */
	modelRefresh() {

		var modelName = this.modelName();
		delete __ModelPool[modelName];

		ABMigration.refreshObject(this);

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

        return new Promise((resolve, reject)=>{

			var query = this.model().query();

			if (options) {
				this.populateFindConditions(query, options, userData)
			}

sails.log.debug('ABClassObject.queryFind - SQL:', query.toString() );

            resolve(query);
        })
        
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
		options.populate = false;
		delete options.sort;
        delete options.offset;
        delete options.limit;

		// // added tableName to id because of non unique field error
		// return this.queryFind(options, userData)
        // .then((query)=>{
        //     // TODO:: we need to figure out how to return the count not the full data
        //     return query.length;
        // });
		
		var query = this.model().query();

		if (options) {
			this.populateFindConditions(query, options, userData)
		}

		var pkField = '{tableName}.{pkName}'
					.replace("{tableName}", tableName)
					.replace("{pkName}", this.PK());

		query = query
				.eager('')
				.clearSelect()
				.countDistinct('{field} as count'.replace("{field}", pkField))
				.whereNotNull(pkField).first();

sails.log.debug('ABClassObject.queryCount - SQL:', query.toString() );

		return query;
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
					// if ( (Array.isArray(p[a]) && p[a].length) || !Array.isArray(p[a])) 
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
						// if ( (Array.isArray(p[a]) && p[a].length) || !Array.isArray(p[a])) 
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
	 *                              populate: {Boolean}
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

	        sails.log.info('ABClassObject.populateFindConditions(): .where condition:', JSON.stringify(where, null, 4));



	        // @function parseCondition
	        // recursive fn() to step through each of our provided conditions and
	        // translate them into query.XXXX() operations.
	        // @param {obj} condition  a QueryBuilder compatible condition object
	        // @param {ObjectionJS Query} Query the query object to perform the operations.
	        var parseCondition = (condition, Query) => {


				// 'have_no_relation' condition will be applied later
				if (condition.rule == 'have_no_relation')
					return;

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
	                (condition.rules || []).forEach((r)=>{

	                    Query[nextCombineKey]( function() { 

	                        // NOTE: pass 'this' as the Query object
	                        // so we can perform embedded queries:
							// parseCondition(r, this);
							
							// 'this' is changed type QueryBuilder to QueryBuilderBase
							parseCondition(r, this);  // Query
	                    });
	                    
	                })
	                
	                return;
				}

				// Convert field id to column name
				if (AppBuilder.rules.isUuid(condition.key)) {

					var field = this.fields(f => f.id == condition.key)[0];
					if (field) {

						// convert field's id to column name
						condition.key = '{prefix}.`{columnName}`'
							.replace('{prefix}', field.dbPrefix())
							.replace('{columnName}', field.columnName);


						// if we are searching a multilingual field it is stored in translations so we need to search JSON
						if (field.isMultilingual) {

							// TODO: move to ABOBjectExternal.js
							if (field.object.isExternal || field.object.isImported) {

								let transTable = field.object.dbTransTableName();

								let prefix = "";
								if (field.alias) {
									prefix = '{alias}_Trans'.replace('{alias}', field.alias);
								}
								else {
									prefix = '{databaseName}.{tableName}'
												.replace('{databaseName}', field.object.dbSchemaName())
												.replace('{tableName}', transTable);
								}

								condition.key = '{prefix}.{columnName}'
												.replace('{prefix}', prefix)
												.replace('{columnName}', field.columnName);

								let languageWhere = '`{prefix}`.`language_code` = "{languageCode}"'
												.replace('{prefix}', prefix)
												.replace('{languageCode}', userData.languageCode);

								Query.whereRaw(languageWhere);

							}
							else {
								condition.key = ('JSON_UNQUOTE(JSON_EXTRACT(JSON_EXTRACT({prefix}.`translations`, SUBSTRING(JSON_UNQUOTE(JSON_SEARCH({prefix}.`translations`, "one", "{languageCode}")), 1, 4)), \'$."{columnName}"\'))')
												.replace(/{prefix}/g, field.dbPrefix())
												.replace(/{languageCode}/g, userData.languageCode)
												.replace(/{columnName}/g, field.columnName);
							}
						}

						// if this is from a LIST, then make sure our value is the .ID
						else if (field.key == "list" && field.settings && field.settings.options && field.settings.options.filter) {

							// NOTE: Should get 'id' or 'text' from client ??
							var inputID = field.settings.options.filter(option => (option.id == condition.value || option.text == condition.value))[0];
							if (inputID)
								condition.value = inputID.id;
						}

					}
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

	                    // if we wanted an IN clause, but there were no values sent, then we 
	                    // want to make sure this condition doesn't return anything
	                    if (Array.isArray(condition.value) && condition.value.length > 0) {
	                    	value = '(' + condition.value.map(function(v){ return quoteMe(v)}).join(', ') + ')';
	                    } else {

	                    	// send a false by resetting the whereRaw to a fixed value.
	                    	// any future attempts to replace this will be ignored.
	                    	whereRaw = ' 1=0 ';
	                    }
	                    break;

	                case "not_in":
	                    operator = "NOT IN";

	                    // if we wanted a NOT IN clause, but there were no values sent, then we
	                    // want to make sure this condition returns everything (not filtered)
	                    if (Array.isArray(condition.value) && condition.value.length > 0) {
	                    	value = '(' + condition.value.map(function(v){ return quoteMe(v)}).join(', ') + ')';
	                    } else {

	                    	// send a TRUE value so nothing gets filtered
	                    	whereRaw = ' 1=1 '
	                    }
	                    break;

	            }


	            // normal field name:
				var columnName =  condition.key;

				// validate input
				if (columnName == null || operator == null) return;

	            // // if we are searching a multilingual field it is stored in translations so we need to search JSON
	            // if (field && field.settings.supportMultilingual == 1) {
				// 	fieldName = ('JSON_UNQUOTE(JSON_EXTRACT(JSON_EXTRACT({tableName}.translations, SUBSTRING(JSON_UNQUOTE(JSON_SEARCH({tableName}.translations, "one", "{languageCode}")), 1, 4)), \'$."{columnName}"\'))')
				// 					.replace(/{tableName}/g, field.object.dbTableName(true))
				// 					.replace(/{languageCode}/g, userData.languageCode)
				// 					.replace(/{columnName}/g, field.columnName);
	            // } 

	            // // if this is from a LIST, then make sure our value is the .ID
	            // if (field && field.key == "list" && field.settings && field.settings.options && field.settings.options.filter) {
	            //     // NOTE: Should get 'id' or 'text' from client ??
	            //     var inputID = field.settings.options.filter(option => (option.id == value || option.text == value))[0];
	            //     if (inputID)
	            //         value = inputID.id;
	            // }


	            // update our where statement:
				if (columnName && operator) {

					// make sure to ` ` columnName (if it isn't our special '1' condition )
					// see Policy:ABModelConvertSameAsUserConditions  for when that is applied
					if (columnName != '1' && columnName.indexOf("`") == -1) {

						// if columnName is  a  table.field  then be sure to `` each one individually
						var parts = columnName.split('.');
						for (var p=0; p < parts.length; p++) {
							parts[p] = "`"+parts[p]+"`";
						}
						columnName = parts.join('.');
					}

					whereRaw = whereRaw
						.replace('{fieldName}', columnName)
						.replace('{operator}', operator)
						.replace('{input}', ((value != null) ?  value  : ''));


					// Now we add in our where
					Query.whereRaw(whereRaw);
				}
			};

			parseCondition(where, query);


			// Special Case:  'have_no_relation'
			// 1:1 - Get rows that no relation with 
			var noRelationRules = (where.rules || []).filter(r => r.rule == 'have_no_relation');
			noRelationRules.forEach(r => {
				// var relation_name = AppBuilder.rules.toFieldRelationFormat(field.columnName);

				// var objectLink = field.objectLink();
				// if (!objectLink) return;

				// Query
				// 	.leftJoinRelation(relation_name)
				// 	.whereRaw('{relation_name}.{primary_name} IS NULL'
				// 		.replace('{relation_name}', relation_name)
				// 		.replace('{primary_name}', objectLink.PK()));

				// {
				//	key: "COLUMN_NAME", // no need to include object name
				//	rule: "have_no_relation",
				//	value: "LINK_OBJECT_PK_NAME"
				// }

				var field = this.fields(f => f.id == r.key)[0];

				var relation_name = AppBuilder.rules.toFieldRelationFormat(field.columnName);

				var objectLink = field.datasourceLink;
				if (!objectLink) return;

				r.value = objectLink.PK();

				query
					.leftJoinRelation(relation_name)
					.whereRaw('{relation_name}.{primary_name} IS NULL'
						.replace('{relation_name}', relation_name)
						.replace('{primary_name}', r.value));
				
			});

	    }

	    // Apply Sorts
	    if (!_.isEmpty(sort)) {
	        sort.forEach((o) => {

				var orderField = this.fields(f => f.id == o.key)[0];
				if (!orderField) return;

	            // if we are ordering by a multilingual field it is stored in translations so we need to search JSON but this is different from filters
	            // because we are going to sort by the users language not the builder's so the view will be sorted differntly depending on which languageCode
				// you are using but the intent of the sort is maintained
				var sortClause = '';
	            if (orderField.settings.supportMultilingual == 1) {

					// TODO: move to ABOBjectExternal.js
					if (orderField.object.isExternal || field.object.isImported) {

						let prefix = "";
						if (orderField.alias) {
							prefix = '{alias}'.replace('{alias}', orderField.alias);
						}
						else {
							prefix = '{databaseName}.{tableName}'
										.replace('{databaseName}', orderField.object.dbSchemaName())
										.replace('{tableName}', orderField.object.dbTransTableName());
						}

						sortClause = "`{prefix}.translations`"
									.replace('{prefix}', prefix);
					}
					else {
						sortClause = ('JSON_UNQUOTE(JSON_EXTRACT(JSON_EXTRACT({prefix}.`translations`, SUBSTRING(JSON_UNQUOTE(JSON_SEARCH({prefix}.`translations`, "one", "{languageCode}")), 1, 4)), \'$."{columnName}"\'))')
										.replace(/{prefix}/g, orderField.dbPrefix())
										.replace('{languageCode}', userData.languageCode)
										.replace('{columnName}', orderField.columnName);
					}
				} 
				// If we are just sorting a field it is much simpler
				else { 
					sortClause = "{prefix}.`{columnName}`"
									.replace('{prefix}', orderField.dbPrefix())
									.replace('{columnName}', orderField.columnName);
	            }
	            query.orderByRaw(sortClause + " " + o.dir);
	        })
		}
		

		// TODO : move to ABObjectExternal.js
		// Special case
		var multilingualFields = this.fields(f => f.isMultilingual && (f.object.isExternal || f.object.isImported));
		multilingualFields.forEach(f => {

			let whereRules = (where.rules || []);
			let sortRules = (sort || []);

			if (whereRules.filter(r => r.key == f.id)[0] || 
				(sortRules.filter && sortRules.filter(o => o.key == f.id)[0])) {

				let transTable = f.object.dbTransTableName();

				let prefix = "";
				let prefixTran = "";
				let tableTran = "";
				if (f.alias) {
					prefix = "{alias}".replace("{alias}", f.alias);
					prefixTran = "{alias}_Trans".replace("{alias}", f.alias);
					tableTran = "{tableName} AS {alias}"
									.replace("{tableName}", f.object.dbTransTableName(true))
									.replace("{alias}", prefixTran);
				}
				else {
					prefix = "{databaseName}.{tableName}"
								.replace('{databaseName}', f.object.dbSchemaName())
								.replace('{tableName}', f.object.dbTableName());
					prefixTran = "{databaseName}.{tableName}"
								.replace('{databaseName}', f.object.dbSchemaName())
								.replace('{tableName}', transTable);
					tableTran = f.object.dbTransTableName(true);
				}


				let	baseClause = '{prefix}.{columnName}'
								.replace('{prefix}', prefix)
								.replace('{columnName}', f.object.PK()),
					connectedClause = '{prefix}.{columnName}'
								.replace('{prefix}', prefixTran)
								.replace('{columnName}', f.object.transColumnName);
	
				if (!(query._statements || []).filter(s => s.table == transTable).length) // prevent join duplicate
					query.innerJoin(tableTran, baseClause, '=', connectedClause);
			}

		});


	    // apply any offset/limit if provided.
	    if (offset) {
	        query.offset(offset);
	    }
	    if (limit) {
	        query.limit(limit);
	    }

	    // query relation data
		if (query.eager) {

			var relationNames = [],
				excludeIds = [];
			
			if (options.populate) {

				this.connectFields()
					.filter((f) => {
						return ((options.populate === true) || (options.populate.indexOf(f.columnName) > -1)) &&
								f.fieldLink() != null;
					})
					.forEach(f => {

						let relationName = f.relationName();

						// Exclude .id column by adding (unselectId) function name to .eager()
						if (f.datasourceLink &&
							f.datasourceLink.PK() === 'uuid') {
							relationName += '(unselectId)';
						}

						relationNames.push(relationName);

						// Get translation data of External object
						if (f.datasourceLink &&
							f.datasourceLink.transColumnName &&
							(f.datasourceLink.isExternal || f.datasourceLink.isImported))
							relationNames.push(f.relationName()+ '.[translations]');

					});
			}


			// TODO: Move to ABObjectExternal
			if ((this.isExternal || this.isImported) && this.transColumnName) {
				relationNames.push('translations');
			}

			if (relationNames.length > 0)

				query.eager(`[${relationNames.join(', ')}]`, {

					// if the linked object's PK is uuid, then exclude .id
					unselectId: (builder) => {
						builder.omit(['id']);
					}

				});

			// Exclude .id column
			if (this.PK() === 'uuid')
				query.omit(this.model(), ['id']);

		}

		// sails.log.debug('SQL:', query.toString() );
	}

}

module.exports = ABClassObject;