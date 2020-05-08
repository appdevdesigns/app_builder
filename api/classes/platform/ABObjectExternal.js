var path = require("path");
var _ = require("lodash");

var ABObject = require(path.join(__dirname, "ABObject"));

var Model = require("objection").Model;

function getColumnFn(colType) {
   var result = colType;

   switch (colType) {
      case "bit":
      case "int":
      case "integer":
      case "tinyint":
         result = "integer";
         break;
      case "bigint":
      case "decimal":
      case "dec":
      case "float":
      case "double":
      case "double_precision":
         result = "bigInteger";
         break;
      case "blob":
      case "tinyblob":
      case "mediumblob":
      case "longblob":
         result = "binary";
         break;
      case "char":
      case "tinytext":
      case "varchar":
         result = "string";
         break;
      case "mediumtext":
      case "longtext":
         result = "text";
         break;
   }

   return result;
}

// to minimize .knex bindings (and connection pools!)

module.exports = class ABObjectExternal extends ABObject {
   constructor(attributes, application) {
      super(attributes, application);
   }

   dbTransTableName(prefixSchema = false) {
      return "#table#_trans".replace("#table#", this.dbTableName(prefixSchema));
   }

   /**
    * migrateCreateTable
    * verify that a table for this object exists.
    * @param {Knex} knex the knex sql library manager for manipulating the DB.
    * @param {Object} options table connection info -
    * 						{
    * 							connection: "",
    * 							table: "",
    * 							primary: "Primary column name"
    * 						}
    *
    * @return {Promise}
    */
   migrateCreate(knex, options) {
      sails.log.verbose("ABObjectExternal.migrateCreate()");
      // We no longer create Federated Tables.
      // Now we simply accept connections to outside Tables and work with them.
      return Promise.resolve();
      /*
      if (options == null)
         return Promise.reject(
            "ABObjectExternal needs target options to create a federated table"
         );

      var tableName = this.dbTableName();
      sails.log.verbose(".... dbTableName:" + tableName);

      var knexTarget = ABMigration.connection(options.connection);
      var targetTransTableName = options.table.replace("_data", "") + "_trans";

      return (
         Promise.resolve()

            // Get column info
            .then(() => {
               return new Promise((resolve, reject) => {
                  knexTarget(options.table)
                     .columnInfo()
                     .then(resolve)
                     .catch(reject);
               });
            })
            // Create federated table
            .then((columns) => {
               return new Promise((resolve, reject) => {
                  knex.schema.hasTable(tableName).then((exists) => {
                     // if it doesn't exist, then create it and any known fields:
                     if (!exists) {
                        sails.log.verbose("... creating federated table !!!");
                        return knex.schema.createTable(tableName, (t) => {
                           var conn =
                              sails.config.connections[options.connection];

                           t.charset("utf8");
                           t.collate("utf8_unicode_ci");
                           t.engine(
                              "FEDERATED CONNECTION='mysql://{user}:{pass}@{host}/{database}/{table}';"
                                 .replace("{user}", conn.user)
                                 .replace("{pass}", conn.password)
                                 .replace("{host}", conn.host)
                                 .replace("{database}", conn.database)
                                 .replace("{table}", options.table)
                           );

                           // create columns
                           Object.keys(columns || {}).forEach((colName) => {
                              var colInfo = columns[colName];

                              if (!colInfo.type) return;

                              var fnName = getColumnFn(colInfo.type);

                              // set PK to auto increment
                              if (
                                 options.primary == colName &&
                                 fnName == "integer"
                              )
                                 fnName = "increments";

                              // create new column
                              var newCol;
                              if (fnName == "string" && colInfo.maxLength)
                                 newCol = t[fnName](colName, colInfo.maxLength);
                              else newCol = t[fnName](colName);

                              // TODO : Why it does not support test_legacy_hris ??
                              // if (colInfo.defaultValue != null) {
                              // 	if (colInfo.defaultValue == "CURRENT_TIMESTAMP")
                              // 		newCol = newCol.defaultTo(knex.fn.now());
                              // 	else
                              // 		newCol = newCol.defaultTo(colInfo.defaultValue.toString());
                              // }

                              if (colInfo.nullable) newCol = newCol.nullable();
                              else newCol = newCol.notNullable();
                           });

                           if (options.primary) t.primary(options.primary);

                           resolve();
                        });
                     } else {
                        sails.log.verbose("... already there.");
                        resolve();
                     }
                  });
               });
            })

            // Check translation table exists
            .then(() => {
               return new Promise((resolve, reject) => {
                  knexTarget.schema
                     .hasTable(targetTransTableName)
                     .then(resolve)
                     .catch(reject);
               });
            })

            // Get column info of translation table
            .then((transExists) => {
               return new Promise((resolve, reject) => {
                  // if not exists
                  if (!transExists) return resolve();

                  knexTarget(targetTransTableName)
                     .columnInfo()
                     .then(resolve)
                     .catch(reject);
               });
            })

            // Create translation table
            .then((columns) => {
               return new Promise((resolve, reject) => {
                  // if not exists
                  if (!columns) return resolve();

                  knex.schema
                     .hasTable(this.dbTransTableName())
                     .then((exists) => {
                        // if it doesn't exist, then create it and any known fields:
                        if (exists) {
                           sails.log.verbose(
                              "... this translation table already there."
                           );
                           return resolve();
                        }

                        sails.log.verbose(
                           "... creating federated translation table !!!"
                        );
                        return knex.schema.createTable(
                           this.dbTransTableName(),
                           (t) => {
                              var conn =
                                 sails.config.connections[options.connection];

                              t.charset("utf8");
                              t.collate("utf8_unicode_ci");
                              t.engine(
                                 "FEDERATED CONNECTION='mysql://{user}:{pass}@{host}/{database}/{table}';"
                                    .replace("{user}", conn.user)
                                    .replace("{pass}", conn.password)
                                    .replace("{host}", conn.host)
                                    .replace("{database}", conn.database)
                                    .replace("{table}", targetTransTableName)
                              );

                              // create columns
                              Object.keys(columns || {}).forEach((colName) => {
                                 var colInfo = columns[colName];

                                 if (!colInfo.type) return;

                                 var fnName = getColumnFn(colInfo.type);

                                 // create new column
                                 var newCol = t[fnName](colName);

                                 // TODO : Why it does not support test_legacy_hris ??
                                 // if (colInfo.defaultValue != null)
                                 // 	newCol = newCol.defaultTo(colInfo.defaultValue.toString());

                                 if (colInfo.nullable)
                                    newCol = newCol.nullable();
                                 else newCol = newCol.notNullable();
                              });

                              resolve();
                           }
                        );
                     });
               });
            })
      );
*/
   }

   /**
    * migrateDropTable
    * remove the table for this object if it exists.
    * @param {Knex} knex the knex sql library manager for manipulating the DB.
    * @return {Promise}
    */
   migrateDrop(knex) {
      sails.log.verbose("ABObject.migrateDrop()");

      // We no longer manage Federated Tables, so we don't drop our
      // connected table.
      return Promise.resolve();

      /*
      var tableName = this.dbTableName();
      sails.log.verbose(".... dbTableName:" + tableName);

      return new Promise((resolve, reject) => {
         sails.log.silly(".... .migrateDropTable()  before knex:");

         var fieldDrops = [];
         this.fields().forEach((f) => {
            fieldDrops.push(f.migrateDrop(knex));
         });

         Promise.all(fieldDrops)
            .then(() => {
               Promise.all([
                  knex.schema.dropTableIfExists(tableName),
                  knex.schema.dropTableIfExists(this.dbTransTableName())
               ])
                  .then(resolve)
                  .catch(reject);
            })
            .catch(reject);
      });
      */
   }

   ///
   /// DB Model Services
   ///

   modelRelation() {
      var relationMappings = super.modelRelation();
      var tableTransName = this.dbTransTableName(true);

      // Add a translation relation of the external table
      if (this.transColumnName) {
         var transJsonSchema = {
            language_code: { type: "string" }
         };

         // Populate fields of the trans table
         var multilingualFields = this.fields(
            (f) => f.settings.supportMultilingual == 1
         );
         multilingualFields.forEach((f) => {
            f.jsonSchemaProperties(transJsonSchema);
         });

         class TransModel extends Model {
            // Table name is the only required property.
            static get tableName() {
               return tableTransName;
            }

            static get jsonSchema() {
               return {
                  type: "object",
                  properties: transJsonSchema
               };
            }
         }

         relationMappings["translations"] = {
            relation: Model.HasManyRelation,
            modelClass: TransModel,
            join: {
               from: "{targetTable}.{primaryField}"
                  .replace("{targetTable}", this.dbTableName(true))
                  .replace("{primaryField}", this.PK()),
               to: "{sourceTable}.{field}"
                  .replace("{sourceTable}", TransModel.tableName)
                  .replace("{field}", this.transColumnName)
            }
         };
      }

      return relationMappings;
   }

   /**
    * @method requestParams
    * Parse through the given parameters and return a subset of data that
    * relates to the fields in this object.
    * @param {obj} allParameters  a key=>value hash of the inputs to parse.
    * @return {obj}
    */
   requestParams(allParameters) {
      var usefulParameters = super.requestParams(allParameters);

      // WORKAROUND : HRIS tables does not support non null columns
      Object.keys(usefulParameters).forEach((columnName) => {
         if (
            usefulParameters[columnName] == null ||
            (Array.isArray(usefulParameters[columnName]) &&
               !usefulParameters[columnName].length)
         ) {
            delete usefulParameters[columnName];
         }
      });

      return usefulParameters;
   }

   requestRelationParams(allParameters) {
      var usefulParameters = super.requestRelationParams(allParameters);

      // WORKAROUND : HRIS tables does not support non null columns
      Object.keys(usefulParameters).forEach((columnName) => {
         if (
            usefulParameters[columnName] == null ||
            (Array.isArray(usefulParameters[columnName]) &&
               !usefulParameters[columnName].length)
         ) {
            delete usefulParameters[columnName];
         }
      });

      return usefulParameters;
   }
};
