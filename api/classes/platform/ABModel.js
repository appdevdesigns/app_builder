const ABModelCore = require("../core/ABModelCore");
const Model = require("objection").Model;

const _ = require("lodash");
const uuid = require("uuid/v4");

var __ModelPool = {}; // reuse any previously created Model connections
// to minimize .knex bindings (and connection pools!)

var conditionFields = ["sort", "offset", "limit", "populate"];
// the list of fields on a provided .findAll(cond) param that we should
// consider when parsing the object.

module.exports = class ABModel extends ABModelCore {
   /**
    * @method create
    * performs an update operation
    * @param {obj} values
    *    A hash of the new values for this entry.
    * @param {Knex.Transaction?} trx - [optional]
    *
    * @return {Promise} resolved with the result of the find()
    */
   create(values, trx = null) {
      values = this.object.requestParams(values);

      if (values[this.object.PK()] == null) {
         values[this.object.PK()] = uuid();
      }

      let validationErrors = this.object.isValidData(values);
      if (validationErrors.length > 0) {
         return Promise.reject(validationErrors);
      }

      return new Promise((resolve, reject) => {
         // get a Knex Query Object
         let query = this.modelKnex().query();

         // Used by knex.transaction, the transacting method may be chained to any query and
         // passed the object you wish to join the query as part of the transaction for.
         if (trx) query = query.transacting(trx);

         var PK = this.object.PK();

         // update our value
         query
            .insert(values)
            .catch(reject)
            .then((returnVals) => {
               // make sure we get a fully updated value for
               // the return value
               this.findAll({
                  where: {
                     glue: "and",
                     rules: [
                        {
                           key: PK,
                           rule: "equals",
                           value: returnVals[PK]
                        }
                     ]
                  },
                  offset: 0,
                  limit: 1,
                  populate: true
               })
                  .then((rows) => {
                     // this returns an [] so pull 1st value:
                     resolve(rows[0]);
                  })
                  .catch(reject);
            });
      });
   }

   /**
    * @method findAll
    * performs a data find with the provided condition.
    * @param {obj} cond
    *		A set of optional conditions to add to the find():
    * @param {obj} conditionDefaults
    *		A hash of default condition values.
    *		conditionDefaults.languageCode {string} the default language of
    *			the multilingual data to return.
    *		conditionDefaults.username {string} the username of the user
    *			we should reference on any user based condition
    * @return {Promise} resolved with the result of the find()
    */
   findAll(cond, conditionDefaults) {
      // make sure cond is defined, and in the EXPANDED format:
      //	cond.where : {obj}
      //		 queryBuilder condition format. This must ALREADY be reduced to
      //		 the actual conditions.  No placeholders at this point.
      //	cond.sort : {array}
      //		 an array of { key:{field.id}, dir:["ASC", "DESC"] } sort
      //		 definitions
      //  cond.offset: {int}
      //		 the offset into the data set to start returning data.
      //  cond.limit: {int}
      //		 the # of entries to return in this query
      //	cond.populate: {bool}
      //		 should we populate the connected fields of the entries
      //		 returned?
      cond = cond || {};
      var defaultCond = {
         // where: cond,
         sort: [], // No Sorts
         offset: 0, // no offset
         limit: 0, // no limit
         populate: false // don't populate the data
      };
      if (!cond.where) {
         // if we don't seem to have an EXPANDED format, see if we can
         // figure it out:

         conditionFields.forEach((f) => {
            if (!_.isUndefined(cond[f])) {
               defaultCond[f] = cond[f];
               delete cond[f];
            }
         });

         // store the rest as our .where cond
         defaultCond.where = cond;

         cond = defaultCond;
      } else {
         // make sure cond has our defaults set:
         conditionFields.forEach((f) => {
            if (_.isUndefined(cond[f])) {
               cond[f] = defaultCond[f];
            }
         });
      }

      // conditionDefaults is optional.  Some system tasks wont provide this.
      // but we need to provide some defaults to the queryConditions() to
      // process
      conditionDefaults = conditionDefaults || {};
      conditionDefaults.languageCode =
         conditionDefaults.languageCode ||
         sails.config.appdev["lang.default"] ||
         "en";
      conditionDefaults.username = conditionDefaults.username || "_system_";

      return new Promise((resolve, reject) => {
         // get a Knex Query Object
         let query = this.modelKnex().query();

         // compile the conditions into the Knex Query
         this.queryConditions(query, cond.where, conditionDefaults);

         // add sort into into Query
         if (cond.sort) {
            this.querySort(query, cond.sort, conditionDefaults);
         }

         // update the offset & limit
         if (cond.offset) {
            query.offset(cond.offset);
         }
         if (cond.limit) {
            query.limit(cond.limit);
         }

         // populate the data?
         this.queryPopulate(query, cond.populate);

         // perform the operation
         query
            .then((data) => {
               // normalize our Data before returning
               this.normalizeData(data);
               resolve(data);
            })
            .catch(reject);
      });
   }

   /**
    * @method update
    * performs an update operation
    * @param {string} id
    *		the primary key for this update operation.
    * @param {obj} values
    *		A hash of the new values for this entry.
    * @param {Knex.Transaction?} trx - [optional]
    *
    * @return {Promise} resolved with the result of the find()
    */
   update(id, values, trx = null) {
      return new Promise((resolve, reject) => {
         // get a Knex Query Object
         let query = this.modelKnex().query();

         // Used by knex.transaction, the transacting method may be chained to any query and
         // passed the object you wish to join the query as part of the transaction for.
         if (trx) query = query.transacting(trx);

         var PK = this.object.PK();

         // update our value
         query
            .patch(values)
            .where(PK, id)
            .catch(reject)
            .then((returnVals) => {
               // make sure we get a fully updated value for
               // the return value
               this.findAll({
                  where: {
                     glue: "and",
                     rules: [
                        {
                           key: PK,
                           rule: "equals",
                           value: id
                        }
                     ]
                  },
                  offset: 0,
                  limit: 1,
                  populate: true
               })
                  .then((rows) => {
                     // this returns an [] so pull 1st value:
                     resolve(rows[0]);
                  })
                  .catch(reject);
            });
      });
   }

   /**
    * @method relate()
    * connect an object to another object via it's defined relation.
    *
    * this operation is ADDITIVE. It only appends additional relations.
    *
    * @param {string} id
    *       the uuid of this object that is relating to these values
    * @param {string} field
    *       a reference to the object.fields() that we are connecting to
    *       can be either .uuid or .columnName
    * @param {array} values
    *       one or more values to create a connection to.
    *       these can be either .uuid values, or full {obj} values.
    * @param {Knex.Transaction?} trx - [optional]
    *
    * @return {Promise}
    */
   relate(id, fieldRef, value, trx = null) {
      function errorReturn(message) {
         var error = new Error(message);
         return Promise.reject(error);
      }
      if (typeof id == undefined)
         return errorReturn("ABModel.relate(): missing id");
      if (typeof fieldRef == undefined)
         return errorReturn("ABModel.relate(): missing fieldRef");
      if (typeof value == undefined)
         return errorReturn("ABModel.relate(): missing value");

      var abField = this.object.fields(
         (f) => f.id == fieldRef || f.columnName == fieldRef
      )[0];
      if (!abField)
         return errorReturn(
            "ABModel.relate(): unknown field reference[" + fieldRef + "]"
         );

      var dl = abField.datasourceLink;
      if (!dl)
         return errorReturn(
            `ABModel.relate(): provided field[${fieldRef}] could not resolve its object`
         );

      let indexField = abField.indexField;

      // M:N case
      if (
         abField.settings.linkType == "many" &&
         abField.settings.linkViaType == "many" &&
         (indexField == null || indexField.object.id != dl.id)
      ) {
         indexField = abField.indexField2;
      }

      var fieldPK = indexField ? indexField.columnName : dl.PK();

      // which is correct?
      // var relationName = abField.relationName();
      let relationName = AppBuilder.rules.toFieldRelationFormat(
         abField.columnName
      );

      // now parse the provided value param and create an array of
      // primaryKey entries for our abField:
      var useableValues = [];
      if (!Array.isArray(value)) value = [value];
      value.forEach((v) => {
         if (typeof v == "object") {
            var val = v[fieldPK];
            if (val) {
               useableValues.push(val);
            }
            // Q: is !val an error, or a possible null that can't
            // Q: should I kill things here and report an error?
         } else {
            useableValues.push(v);
         }
      });

      return new Promise((resolve, reject) => {
         this.modelKnex()
            .query()
            .findById(id)
            .then((objInstance) => {
               let relateQuery = objInstance
                  .$relatedQuery(relationName)
                  .alias(
                     "#column#_#relation#"
                        .replace("#column#", abField.columnName)
                        .replace("#relation#", relationName)
                  ) // FIX: SQL syntax error because alias name includes special characters
                  .relate(useableValues);

               // Used by knex.transaction, the transacting method may be chained to any query and
               // passed the object you wish to join the query as part of the transaction for.
               if (trx) relateQuery = relateQuery.transacting(trx);

               return relateQuery;
            })
            .then(resolve)
            .catch(reject);
      });
      // let objInstance = this.modelKnex()
      //    .query()
      //    .findById(id);
      // return objInstance.$relatedQuery(relationName).relate(useableValues);

      // let query = this.modelKnex().query();
      // return query
      //    .relatedQuery(relationName)
      //    .for(id)
      //    .relate(useableValues);
   }

   modelDefaultFields() {
      return {
         uuid: { type: "string" },
         created_at: {
            type: ["null", "string"],
            pattern: AppBuilder.rules.SQLDateTimeRegExp
         },
         updated_at: {
            type: ["null", "string"],
            pattern: AppBuilder.rules.SQLDateTimeRegExp
         },
         properties: { type: ["null", "object"] }
      };
   }

   /**
    * @method modelKnex()
    * return a Knex Model definition for interacting with the DB.
    * @return {KnexModel}
    */
   modelKnex() {
      var modelName = this.modelKnexReference(),
         tableName = this.object.dbTableName(true);

      if (!__ModelPool[modelName]) {
         var connectionName = this.object.isExternal
            ? this.object.connName
            : undefined;
         var knex = ABMigration.connection(connectionName);

         // Compile our jsonSchema from our DataFields
         // jsonSchema is only used by Objection.js to validate data before
         // performing an insert/update.
         // This does not DEFINE the DB Table.
         var jsonSchema = {
            type: "object",
            required: [],
            properties: this.modelDefaultFields()
         };
         var currObject = this.object;
         var allFields = this.object.fields();
         allFields.forEach(function(f) {
            f.jsonSchemaProperties(jsonSchema.properties);
         });

         class MyModel extends Model {
            // Table name is the only required property.
            static get tableName() {
               return tableName;
            }

            static get idColumn() {
               return currObject.PK();
            }

            static get jsonSchema() {
               return jsonSchema;
            }

            // Move relation setup to below
            // static get relationMappings () {
            // }
         }

         // rename class name
         // NOTE: prevent cache same table in difference apps
         Object.defineProperty(MyModel, "name", { value: modelName });

         __ModelPool[modelName] = MyModel;

         // NOTE : there is relation setup here because prevent circular loop when get linked object.
         // have to define object models to __ModelPool[tableName] first
         __ModelPool[modelName].relationMappings = () => {
            return this.modelKnexRelation();
         };

         // bind knex connection to object model
         // NOTE : when model is bound, then relation setup will be executed
         __ModelPool[modelName] = __ModelPool[modelName].bindKnex(knex);
      }

      return __ModelPool[modelName];
   }

   modelKnexReference() {
      // remove special characters
      return this.object.id.replace(/[^a-zA-Z]/g, "");
   }

   modelKnexRelation() {
      var tableName = this.object.dbTableName(true);

      // Compile our relations from our DataFields
      var relationMappings = {};

      var connectFields = this.object.connectFields();

      // linkObject: '', // ABObject.id
      // linkType: 'one', // one, many
      // linkViaType: 'many' // one, many

      connectFields.forEach((f) => {
         // find linked object name
         // var linkObject = this.object.application.objects((obj) => { return obj.id == f.settings.linkObject; })[0];
         let linkObject = ABObjectCache.get(f.settings.linkObject);
         if (linkObject == null) return;

         var linkField = f.fieldLink;
         if (linkField == null) return;

         var linkModel = linkObject.modelAPI().modelKnex();
         var relationName = f.relationName();

         // 1:1
         if (f.settings.linkType == "one" && f.settings.linkViaType == "one") {
            var sourceTable, targetTable, targetPkName, relation, columnName;

            if (f.settings.isSource == true) {
               sourceTable = tableName;
               targetTable = linkObject.dbTableName(true);
               targetPkName = linkObject.PK();
               relation = Model.BelongsToOneRelation;
               columnName = f.columnName;
            } else {
               sourceTable = linkObject.dbTableName(true);
               targetTable = tableName;
               targetPkName = this.object.PK();
               relation = Model.HasOneRelation;
               columnName = linkField.columnName;
            }

            relationMappings[relationName] = {
               relation: relation,
               modelClass: linkModel,
               join: {
                  // "{targetTable}.{primaryField}"
                  from: `${targetTable}.${targetPkName}`,

                  // "{sourceTable}.{field}"
                  to: `${sourceTable}.${columnName}`
               }
            };
         }
         // M:N
         else if (
            f.settings.linkType == "many" &&
            f.settings.linkViaType == "many"
         ) {
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
                  // "{sourceTable}.{primaryField}"
                  from: `${sourceTableName}.${sourcePkName}`,

                  through: {
                     // "{joinTable}.{sourceColName}"
                     from: `${joinTablename}.${joinColumnNames.sourceColumnName}`,

                     // "{joinTable}.{targetColName}"
                     to: `${joinTablename}.${joinColumnNames.targetColumnName}`
                  },

                  // "{targetTable}.{primaryField}"
                  to: `${targetTableName}.${targetPkName}`
               }
            };
         }
         // 1:M
         else if (
            f.settings.linkType == "one" &&
            f.settings.linkViaType == "many"
         ) {
            relationMappings[relationName] = {
               relation: Model.BelongsToOneRelation,
               modelClass: linkModel,
               join: {
                  // "{sourceTable}.{field}"
                  from: `${tableName}.${f.columnName}`,

                  // "{targetTable}.{primaryField}"
                  to: `${linkObject.dbTableName(true)}.${linkObject.PK()}`
               }
            };
         }
         // M:1
         else if (
            f.settings.linkType == "many" &&
            f.settings.linkViaType == "one"
         ) {
            relationMappings[relationName] = {
               relation: Model.HasManyRelation,
               modelClass: linkModel,
               join: {
                  // "{sourceTable}.{primaryField}"
                  from: `${tableName}.${this.object.PK()}`,

                  // "{targetTable}.{field}"
                  to: `${linkObject.dbTableName(true)}.${linkField.columnName}`
               }
            };
         }
      });

      return relationMappings;
   }

   queryConditions(query, where, userData) {
      // Apply filters
      if (!_.isEmpty(where)) {
         sails.log.info(
            "ABModel.queryConditions(): .where condition:",
            JSON.stringify(where, null, 4)
         );

         // @function parseCondition
         // recursive fn() to step through each of our provided conditions and
         // translate them into query.XXXX() operations.
         // @param {obj} condition  a QueryBuilder compatible condition object
         // @param {ObjectionJS Query} Query the query object to perform the operations.
         var parseCondition = (condition, Query) => {
            // 'have_no_relation' condition will be applied later
            if (condition.rule == "have_no_relation") return;

            // FIX: some improper inputs:
            // if they didn't provide a .glue, then default to 'and'
            // current webix behavior, might not return this
            // so if there is a .rules property, then there should be a .glue:
            if (condition.rules) {
               condition.glue = condition.glue || "and";
            }

            // if this is a grouping condition, then decide how to group and
            // process our sub rules:
            if (condition.glue) {
               var nextCombineKey = "where";
               if (condition.glue == "or") {
                  nextCombineKey = "orWhere";
               }
               (condition.rules || []).forEach((r) => {
                  if (r && r.rules) {
                     parseCondition(r, Query);
                  } else {
                     Query[nextCombineKey](function() {
                        // NOTE: pass 'this' as the Query object
                        // so we can perform embedded queries:
                        // parseCondition(r, this);

                        // 'this' is changed type QueryBuilder to QueryBuilderBase
                        parseCondition(r, this); // Query
                     });
                  }
               });

               return;
            }

            // Convert field id to column name
            if (AppBuilder.rules.isUuid(condition.key)) {
               var field = this.object.fields((f) => {
                  return (
                     f.id == condition.key &&
                     (!condition.alias || f.alias == condition.alias)
                  );
               })[0];
               if (field) {
                  // convert field's id to column name
                  condition.key = "{prefix}.`{columnName}`"
                     .replace("{prefix}", field.dbPrefix())
                     .replace("{columnName}", field.columnName);

                  // if we are searching a multilingual field it is stored in translations so we need to search JSON
                  if (field.isMultilingual) {
                     // TODO: move to ABOBjectExternal.js
                     if (
                        !this.object.viewName && // NOTE: check if this object is a query, then it includes .translations already
                        (field.object.isExternal || field.object.isImported)
                     ) {
                        let transTable = field.object.dbTransTableName();

                        let prefix = "";
                        if (field.alias) {
                           prefix = "{alias}_Trans".replace(
                              "{alias}",
                              field.alias
                           );
                        } else {
                           prefix = "{databaseName}.{tableName}"
                              .replace(
                                 "{databaseName}",
                                 field.object.dbSchemaName()
                              )
                              .replace("{tableName}", transTable);
                        }

                        // update our condition key with the new prefix + columnName
                        condition.key = "{prefix}.{columnName}"
                           .replace("{prefix}", prefix)
                           .replace("{columnName}", field.columnName);

                        let languageWhere = '`{prefix}`.`language_code` = "{languageCode}"'
                           .replace("{prefix}", prefix)
                           .replace("{languageCode}", userData.languageCode);

                        Query.whereRaw(languageWhere);
                     } else {
                        let transCol;
                        // If it is a query
                        if (this.object.viewName)
                           transCol = "`{prefix}.translations`";
                        else transCol = "{prefix}.translations";

                        transCol = transCol.replace(
                           "{prefix}",
                           field.dbPrefix().replace(/`/g, "")
                        );

                        condition.key = ABMigration.connection().raw(
                           'JSON_UNQUOTE(JSON_EXTRACT(JSON_EXTRACT({transCol}, SUBSTRING(JSON_UNQUOTE(JSON_SEARCH({transCol}, "one", "{languageCode}")), 1, 4)), \'$."{columnName}"\'))'
                              .replace(/{transCol}/g, transCol)
                              .replace(/{languageCode}/g, userData.languageCode)
                              .replace(/{columnName}/g, field.columnName)
                        );
                     }
                  }

                  // if this is from a LIST, then make sure our value is the .ID
                  else if (
                     field.key == "list" &&
                     field.settings &&
                     field.settings.options &&
                     field.settings.options.filter
                  ) {
                     // NOTE: Should get 'id' or 'text' from client ??
                     var desiredOption = field.settings.options.filter(
                        (option) =>
                           option.id == condition.value ||
                           option.text == condition.value
                     )[0];
                     if (desiredOption) condition.value = desiredOption.id;
                  }

                  // DATE (not DATETIME)
                  else if (
                     field.key == "date" &&
                     condition.rule != "last_days" &&
                     condition.rule != "next_days"
                  ) {
                     condition.key = `DATE(${condition.key})`;
                     condition.value = `DATE("${condition.value}")`;
                  }
               }
            }

            // sails.log.verbose('... basic condition:', JSON.stringify(condition, null, 4));

            // We are going to use the 'raw' queries for knex becuase the '.'
            // for JSON searching is misinterpreted as a sql identifier
            // our basic where statement will be:
            var whereRaw = "{fieldName} {operator} {input}";

            // make sure a value is properly Quoted:
            function quoteMe(value) {
               return "'" + value + "'";
            }

            // remove fields from rules
            var fieldTypes = [
               "number_",
               "string_",
               "date_",
               "boolean_",
               "user_",
               "list_",
               "connectObject_"
            ];

            // convert QB Rule to SQL operation:
            var conversionHash = {
               equals: "=",
               not_equal: "<>",
               is_empty: "=",
               is_not_empty: "<>",
               greater: ">",
               greater_or_equal: ">=",
               less: "<",
               less_or_equal: "<=",
               greater_current: ">",
               greater_or_equal_current: ">=",
               less_current: "<",
               less_or_equal_current: "<=",
               last_days: "BETWEEN",
               next_days: "BETWEEN"
            };

            // normal field name:
            var columnName = condition.key;
            if (typeof columnName == "string") {
               // make sure to ` ` columnName (if it isn't our special '1' condition )
               // see Policy:ABModelConvertSameAsUserConditions  for when that is applied
               if (columnName != "1" && columnName.indexOf("`") == -1) {
                  // if columnName is  a  table.field  then be sure to `` each one individually
                  var parts = columnName.split(".");
                  for (var p = 0; p < parts.length; p++) {
                     parts[p] = "`" + parts[p] + "`";
                  }
                  columnName = parts.join(".");
               }

               // ABClassQuery:
               // If this is query who create MySQL view, then column name does not have `
               if (this.object.viewName) {
                  columnName = "`" + columnName.replace(/`/g, "") + "`";
               }
            }

            // remove the field type from the rule
            var rule = condition.rule;
            fieldTypes.forEach((f) => {
               rule = rule.replace(f, "");
            });
            condition.rule = rule;
            // basic case:  simple conversion
            var operator = conversionHash[condition.rule];
            var value = condition.value;

            // If a function, then ignore quote. like DATE('05-05-2020')
            if (!RegExp("^[A-Z]+[(].*[)]$").test(value)) {
               value = quoteMe(value);
            }

            // special operation cases:
            switch (condition.rule) {
               case "begins_with":
                  operator = "LIKE";
                  value = quoteMe(condition.value + "%");
                  break;

               case "not_begins_with":
                  operator = "NOT LIKE";
                  value = quoteMe(condition.value + "%");
                  break;

               case "contains":
                  operator = "LIKE";
                  value = quoteMe("%" + condition.value + "%");
                  break;

               case "not_contains":
                  operator = "NOT LIKE";
                  value = quoteMe("%" + condition.value + "%");
                  break;

               case "ends_with":
                  operator = "LIKE";
                  value = quoteMe("%" + condition.value);
                  break;

               case "not_ends_with":
                  operator = "NOT LIKE";
                  value = quoteMe("%" + condition.value);
                  break;

               case "between":
                  operator = "BETWEEN";
                  value = condition.value
                     .map(function(v) {
                        return quoteMe(v);
                     })
                     .join(" AND ");
                  break;

               case "not_between":
                  operator = "NOT BETWEEN";
                  value = condition.value
                     .map(function(v) {
                        return quoteMe(v);
                     })
                     .join(" AND ");
                  break;

               case "is_current_user":
                  if (userData.username == "_system_") {
                     var systemUserError = new Error(
                        'ABModel.queryConditions(): is_current_user condition being resolved with "_system_" user.'
                     );
                     systemUserError.objectID = this.object.id;
                     systemUserError.code = "ESYSTEMUSERCONDITION";
                     throw systemUserError;
                     return;
                  }
                  operator = "=";
                  value = quoteMe(userData.username);

                  break;

               case "is_not_current_user":
                  if (userData.username == "_system_") {
                     var systemUserError = new Error(
                        'ABModel.queryConditions(): is_not_current_user condition being resolved with "_system_" user.'
                     );
                     systemUserError.objectID = this.object.id;
                     systemUserError.code = "ESYSTEMUSERCONDITION";
                     throw systemUserError;
                     return;
                  }
                  operator = "<>";
                  value = quoteMe(userData.username);
                  break;

               case "contain_current_user":
                  if (userData.username == "_system_") {
                     var systemUserError = new Error(
                        'ABModel.queryConditions(): contain_current_user condition being resolved with "_system_" user.'
                     );
                     systemUserError.objectID = this.object.id;
                     systemUserError.code = "ESYSTEMUSERCONDITION";
                     throw systemUserError;
                     return;
                  }
                  columnName = `JSON_SEARCH(JSON_EXTRACT(${columnName}, '$[*].id'), 'one', '${userData.username}')`;
                  operator = "IS NOT";
                  value = "NULL";
                  break;

               case "not_contain_current_user":
                  if (userData.username == "_system_") {
                     var systemUserError = new Error(
                        'ABModel.queryConditions(): not_contain_current_user condition being resolved with "_system_" user.'
                     );
                     systemUserError.objectID = this.object.id;
                     systemUserError.code = "ESYSTEMUSERCONDITION";
                     throw systemUserError;
                     return;
                  }
                  columnName = `JSON_SEARCH(JSON_EXTRACT(${columnName}, '$[*].id'), 'one', '${userData.username}')`;
                  operator = "IS";
                  value = "NULL";
                  break;

               case "is_null":
                  operator = "IS NULL";
                  value = "";
                  break;

               case "is_not_null":
                  operator = "IS NOT NULL";
                  value = "";
                  break;

               case "in":
                  operator = "IN";

                  // if we wanted an IN clause, but there were no values sent, then we
                  // want to make sure this condition doesn't return anything
                  if (
                     Array.isArray(condition.value) &&
                     condition.value.length > 0
                  ) {
                     value =
                        "(" +
                        condition.value
                           .map(function(v) {
                              return quoteMe(v);
                           })
                           .join(", ") +
                        ")";
                  } else {
                     // send a false by resetting the whereRaw to a fixed value.
                     // any future attempts to replace this will be ignored.
                     whereRaw = " 1=0 ";
                  }
                  break;

               case "not_in":
                  operator = "NOT IN";

                  // if we wanted a NOT IN clause, but there were no values sent, then we
                  // want to make sure this condition returns everything (not filtered)
                  if (
                     Array.isArray(condition.value) &&
                     condition.value.length > 0
                  ) {
                     value =
                        "(" +
                        condition.value
                           .map(function(v) {
                              return quoteMe(v);
                           })
                           .join(", ") +
                        ")";
                  } else {
                     // send a TRUE value so nothing gets filtered
                     whereRaw = " 1=1 ";
                  }
                  break;

               case "greater_current":
               case "greater_or_equal_current":
               case "less_current":
               case "less_or_equal_current":
                  value = "NOW()";
                  break;

               case "last_days":
                  value = `DATE_SUB(NOW(), INTERVAL ${condition.value} DAY) AND NOW()`;
                  break;
               case "next_days":
                  value = `NOW() AND DATE_ADD(NOW(), INTERVAL ${condition.value} DAY)`;
                  break;
            }

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
               whereRaw = whereRaw
                  .replace("{fieldName}", columnName)
                  .replace("{operator}", operator)
                  .replace("{input}", value != null ? value : "");

               // Now we add in our where
               Query.whereRaw(whereRaw);
            }
         };

         parseCondition(where, query);

         // Special Case:  'have_no_relation'
         // 1:1 - Get rows that no relation with
         var noRelationRules = (where.rules || []).filter(
            (r) => r.rule == "have_no_relation"
         );
         noRelationRules.forEach((r) => {
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

            var field = this.object.fields((f) => f.id == r.key)[0];

            var relation_name = AppBuilder.rules.toFieldRelationFormat(
               field.columnName
            );

            var objectLink = field.datasourceLink;
            if (!objectLink) return;

            r.value = objectLink.PK();

            query.leftJoinRelation(relation_name).whereRaw(
               // "{relation_name}.{primary_name} IS NULL"
               `${relation_name}.${r.value} IS NULL`
            );
         });
      }
   } // queryConditions()

   queryPopulate(query, populate) {
      // query relation data
      if (query.eager) {
         var relationNames = [],
            excludeIds = [];

         if (populate) {
            this.object
               .connectFields()
               .filter((f) => {
                  return (
                     (populate === true ||
                        populate.indexOf(f.columnName) > -1) &&
                     f.fieldLink != null
                  );
               })
               .forEach((f) => {
                  let relationName = f.relationName();

                  // Exclude .id column by adding (unselectId) function name to .eager()
                  if (f.datasourceLink && f.datasourceLink.PK() === "uuid") {
                     relationName += "(unselectId)";
                  }

                  relationNames.push(relationName);

                  // Get translation data of External object
                  if (
                     f.datasourceLink &&
                     f.datasourceLink.transColumnName &&
                     (f.datasourceLink.isExternal ||
                        f.datasourceLink.isImported)
                  )
                     relationNames.push(f.relationName() + ".[translations]");
               });
         }

         // TODO: Move to ABObjectExternal
         if (
            !this.object.viewName &&
            (this.object.isExternal || this.object.isImported) &&
            this.object.transColumnName
         ) {
            relationNames.push("translations");
         }

         // if (relationNames.length > 0) console.log(relationNames);
         query.eager(`[${relationNames.join(", ")}]`, {
            // if the linked object's PK is uuid, then exclude .id
            unselectId: (builder) => {
               builder.omit(["id"]);
            }
         });

         // Exclude .id column
         if (this.object.PK() === "uuid") query.omit(this.modelKnex(), ["id"]);
      }
   }

   querySort(query, sort, userData) {
      if (!_.isEmpty(sort)) {
         sort.forEach((o) => {
            var orderField = this.object.fields((f) => f.id == o.key)[0];
            if (!orderField) return;

            // if we are ordering by a multilingual field it is stored in translations so we need to search JSON but this is different from filters
            // because we are going to sort by the users language not the builder's so the view will be sorted differntly depending on which languageCode
            // you are using but the intent of the sort is maintained
            var sortClause = "";
            if (orderField.settings.supportMultilingual == 1) {
               // TODO: move to ABOBjectExternal.js
               if (
                  !this.object.viewName && // NOTE: check if this object is a query, then it includes .translations already
                  (orderField.object.isExternal || orderField.object.isImported)
               ) {
                  let prefix = "";
                  if (orderField.alias) {
                     prefix = orderField.alias;
                  } else {
                     // `{databaseName}.{tableName}`
                     prefix = `${orderField.object.dbSchemaName()}.${orderField.object.dbTransTableName()}`;
                  }

                  sortClause = "`{prefix}.translations`".replace(
                     "{prefix}",
                     prefix
                  );
               } else {
                  sortClause = 'JSON_UNQUOTE(JSON_EXTRACT(JSON_EXTRACT({prefix}.`translations`, SUBSTRING(JSON_UNQUOTE(JSON_SEARCH({prefix}.`translations`, "one", "{languageCode}")), 1, 4)), \'$."{columnName}"\'))'
                     .replace(/{prefix}/g, orderField.dbPrefix())
                     .replace("{languageCode}", userData.languageCode)
                     .replace("{columnName}", orderField.columnName);
               }
            }
            // If we are just sorting a field it is much simpler
            else {
               sortClause = "{prefix}.`{columnName}`"
                  .replace("{prefix}", orderField.dbPrefix())
                  .replace("{columnName}", orderField.columnName);

               // ABClassQuery:
               // If this is query who create MySQL view, then column name does not have `
               if (this.object.viewName) {
                  sortClause = "`" + sortClause.replace(/`/g, "") + "`";
               }
            }
            query.orderByRaw(sortClause + " " + o.dir);
         });
      }
   }
};
