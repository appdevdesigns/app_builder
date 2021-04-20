const uuid = require("node-uuid");
const path = require("path");
const _ = require("lodash");

const ABObjectExternal = require(path.join(
   __dirname,
   "..",
   "classes",
   "platform",
   "ABObjectExternal.js"
));
const ABFieldCore = require(path.join(
   __dirname,
   "..",
   "classes",
   "core",
   "dataFields",
   "ABFieldCore.js"
));

const FieldManager = require(path.join(
   __dirname,
   "..",
   "classes",
   "core",
   "ABFieldManager.js"
));

// Build a reference of AB defaults for all supported Sails data field types
var mysqlTypeToABFields = {};
FieldManager.allFields().forEach((Field) => {
   let field = new Field({ settings: {} }, {});
   field.fieldMysqlTypes().forEach((type) => {
      mysqlTypeToABFields[type] = {
         key: field.key,
         icon: field.icon,
         settings: field.settings
      };
   });
});

function isSupportType(type) {
   return mysqlTypeToABFields[type] != null;
}

function getTransTableName(tableName) {
   // NOTE: legacy_hris - there are table names {table}_data, {table}_trans
   // ex. hris_ren_data, hris_ren_trans
   tableName = tableName.replace("_data", "");

   return tableName + "_trans";
}

/**
 * @method getPrimaryKey
 *
 * @param {*} knex
 * @param {*} tableName
 *
 * @return {Promise}
 */
function getPrimaryKey(knex, tableName, connName = "appBuilder") {
   return new Promise((resolve, reject) => {
      // SELECT `column_name`
      // FROM information_schema.key_column_usage
      // WHERE `CONSTRAINT_NAME` = 'PRIMARY'
      // AND `TABLE_SCHEMA` = '[DATABASE NAME]'
      // AND `TABLE_NAME` = '[TABLE NAME]';
      knex
         .select("column_name")
         .from("information_schema.key_column_usage")
         .where("CONSTRAINT_NAME", "=", "PRIMARY")
         .andWhere(
            "TABLE_SCHEMA",
            "=",
            sails.config.connections[connName].database
         )
         .andWhere("TABLE_NAME", "=", tableName)
         .catch(reject)
         .then(function(result) {
            var pkColName = "";

            if (result[0]) pkColName = result[0].column_name;

            resolve(pkColName);
         });
   });
}

/**
 * @method getModelName
 *
 * @param {string} tableName
 *
 * @return {string} Model name
 */
function getModelName(tableName) {
   var result = "";

   Object.keys(sails.models).forEach((modelName) => {
      var m = sails.models[modelName];

      if (m.tableName == tableName) result = modelName;
   });

   return result;
}

/**
 * @method getAssociations
 * @description Get associations of sails.model from table name
 *
 * @param {string} tableName
 *
 * @return {object[]}
 * @example <caption> Example return </caption>
 * [
 * 		{
 * 			alias: 'ATTRIBUTE_NAME',
 * 			type: 'model',
 * 			model: 'MODEL_NAME'
 * 		},
 * 		{
 * 			alias: 'ATTRIBUTE_NAME',
 * 			type: 'collection',
 * 			collection: 'MODEL_NAME',
 * 			via: 'ATTRIBUTE_NAME'
 * 		}
 * 		...
 * ]
 */
function getAssociations(tableName) {
   var model = _.filter(
      sails.models,
      (m, model_name) => m.tableName == tableName
   )[0];
   if (model) {
      return model.associations;
   } else {
      return [];
   }
}

module.exports = {
   /**
    * @method getConnectionList
    * @description Get the list of DB connection name from sails.config.connections
    *
    * @return {String[]}
    */
   getConnectionList: () => {
      var connectionNames = [];

      Object.keys(sails.config.connections).forEach((connName) => {
         var conn = sails.config.connections[connName];

         if (
            conn.host &&
            conn.port &&
            conn.user &&
            conn.password &&
            conn.database
         )
            connectionNames.push(connName);
      });

      return connectionNames;
   },

   /**
    * @method getTableList
    * @description Get the list of table name
    *
    * @param {guid} appID - The id of ABApplication
    * @param {string} connName - The name of database connection
    *
    * @return {Promise}
    * @example
    * 			return {Array} [
    * 				tableName {string}, ..., tableNameN {string}
    * 			]
    */
   getTableList: (appID, connName = "appBuilder") => {
      var allTableNames = [],
         existsTableNames = [];

      return (
         Promise.resolve()
            .then(function() {
               // Get database name
               return new Promise((resolve, reject) => {
                  var connection = sails.config.connections[connName];
                  if (connection && connection.database)
                     resolve(connection.database);
                  else reject(`Could not find DB connection: '${connName}'`);
               });
            })
            .then(function(databaseName) {
               // Get tables in AppBuilder DB
               return new Promise((resolve, reject) => {
                  var knex = ABMigration.connection(connName);

                  // SELECT `TABLE_NAME`
                  // FROM information_schema.tables
                  // WHERE `TABLE_TYPE` = 'BASE TABLE'
                  // AND `TABLE_SCHEMA` = [CURRENT DB]
                  // AND `TABLE_NAME`   NOT LIKE 'AB_%'
                  // AND `TABLE_NAME`   NOT LIKE '%_trans';
                  knex
                     .select("TABLE_NAME")
                     .from("information_schema.tables")
                     .where("TABLE_TYPE", "=", "BASE TABLE")
                     .andWhere("TABLE_SCHEMA", "=", databaseName)
                     .andWhere("TABLE_NAME", "NOT LIKE", "AB_%")
                     .andWhere("TABLE_NAME", "NOT LIKE", "%_trans")
                     .catch(reject)
                     .then(function(result) {
                        // Johnny: make sure result actually is returning something:
                        if (result && result.map) {
                           allTableNames = result.map((r) => {
                              return {
                                 name: r.TABLE_NAME,
                                 connection: connName
                              };
                           });
                        }

                        resolve();
                     });
               });
            })
            .then(function() {
               return new Promise((resolve, reject) => {
                  var application = ABSystemObject.getApplication();
                  application.objects().forEach((obj) => {
                     existsTableNames.push(obj.dbTableName());
                  });

                  resolve();
                  /*
                  ABGraphApplication.findOne(appID)
                     .then((application) => {
                        if (!application) return resolve();


                        let app = application.toABClass();
                        app.objects().forEach((obj) => {
                           existsTableNames.push(obj.dbTableName());
                        });

                        resolve();
                     }
                  });
                  */
               });
            })
            // Get only not exists table names
            .then(function() {
               return new Promise((resolve, reject) => {
                  resolve(
                     allTableNames.filter((t) => {
                        return existsTableNames.indexOf(t.name) < 0;
                     })
                  );
               });
            })
            // Filter tables are not junction
            .then(function(tableNames) {
               return new Promise((resolve, reject) => {
                  resolve(
                     tableNames.filter((t) => {
                        return _.filter(
                           sails.models,
                           (m) =>
                              m.tableName == t.name &&
                              (!m.meta || !m.meta.junctionTable)
                        ).length;
                     })
                  );
               });
            })
      );
   },

   /**
    * @method getColumns
    * @description Get the column info list of a table
    *
    * @param {string} tableName
    * @param {string} [connName]
    *		Optional name of the connection where the table is from.
    *		By default the table is assumed to be from the 'appBuilder'
    *		connection.
    *
    * @return {Promise}
    * @example
    * 			return {
    * 				columnName: {
    * 								defaultValue: {null|string|integer},
    *								type: {string},
    * 								maxLength: {integer},
    * 								nullable: {boolean},
    *
    * 								supported: {boolean}, // flag support to convert to ABField
    * 								fieldKey: {string}, - ABField's key name [Optional],
    *
    * 								multilingual: {boolean}, [Optional]
    * 							}
    * 			}
    */
   getColumns: (tableName, connName = "appBuilder") => {
      var knex = ABMigration.connection(connName);
      var transTableName = getTransTableName(tableName);
      var columns = [];

      return (
         Promise.resolve()

            // Get the primary key info
            .then(function() {
               return getPrimaryKey(knex, tableName, connName);
            })

            // Get columns of the table
            .then(function(pkColName) {
               return new Promise((resolve, reject) => {
                  knex(tableName)
                     .columnInfo()
                     .catch(reject)
                     .then(function(result) {
                        columns = result;

                        Object.keys(columns).forEach((name) => {
                           // remove reserved column
                           if (
                              ABFieldCore.reservedNames.indexOf(name) > -1 ||
                              pkColName == name
                           ) {
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

            //
            .then(function() {
               return new Promise((resolve, reject) => {
                  var associations = getAssociations(tableName);
                  associations.forEach((asso) => {
                     // Ignore the 'translations' association to connect fields
                     if (asso.alias == "translations") return;

                     var col = columns[asso.alias];
                     if (col) {
                        col.fieldKey = "connectObject";
                     } else {
                        columns[asso.alias] = {
                           fieldKey: "connectObject",

                           defaultValue: null,
                           type: null,
                           maxLength: null,
                           nullable: true,

                           supported: true
                        };
                     }
                  });

                  resolve();
               });
            })

            // Check exists the trans table
            .then(function() {
               return new Promise((resolve, reject) => {
                  knex.schema
                     .hasTable(transTableName)
                     .catch(reject)
                     .then(function(exists) {
                        resolve(exists);
                     });
               });
            })

            // Get columns of the trans table
            .then(function(existsTrans) {
               return new Promise((resolve, reject) => {
                  // no trans table
                  if (!existsTrans) {
                     resolve();
                     return;
                  }

                  var reservedNames = ABFieldCore.reservedNames.concat([
                     "language_code"
                  ]);

                  knex(transTableName)
                     .columnInfo()
                     .catch(reject)
                     .then(function(transCols) {
                        Object.keys(transCols).forEach((name) => {
                           var col = transCols[name];

                           // remove reserved column
                           if (reservedNames.indexOf(name) > -1) {
                              delete transCols[name];
                              return;
                           }

                           // ignore the foreign key
                           if (col.type == "int") return;

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
            .then(function() {
               return new Promise((resolve, reject) => {
                  resolve(columns);
               });
            })
      );
   },

   /**
    * Imports an existing MySql table for use in an AB application.
    * An AB object will be created for that model.
    *
    * @param {integer}	appID
    * @param {string}	tableName
    * @param {object[]} columnList
    * @param {string} columnList[].name
    * @param {string} columnList[].label
    * @param {string} columnList[].fieldKey
    * @param {boolean} columnList[].isHidden
    * @param {string}	[connName]
    * @return {Promise}	Resolves with the data of the new imported object
    **/
   tableToObject: function(
      appID,
      tableName,
      columnList,
      connName = "appBuilder"
   ) {
      ////
      //// LEFT OFF HERE:
      //// Refactor out ABApplication
      ////
      let knexAppBuilder = ABMigration.connection("appBuilder"),
         knexTable = ABMigration.connection(connName),
         application,
         languages = [],
         transColumnName = "",
         pkColName = "",
         columns = {},
         objectData = {};

      let labelField = (colData, label) => {
         // Label translations
         colData.translations = [];
         languages.forEach((langCode) => {
            colData.translations.push({
               language_code: langCode,
               label: label
            });
         });
      };

      application = ABSystemObject.getApplication();

      return (
         Promise.resolve()

            // Find app in database
            // .then(function() {
            //    return new Promise((resolve, reject) => {
            //       ABGraphApplication.findOne(appID)
            //          .then((app) => {
            //             if (!app) {
            //                reject(new Error("application not found: " + appID));
            //             } else {
            //                application = app;
            //                resolve();
            //             }
            //          })
            //          .catch(reject);
            //    });
            // })

            // Find site languages
            .then(function() {
               return new Promise((resolve, reject) => {
                  SiteMultilingualLanguage.find().exec((err, list) => {
                     if (err) reject(err);
                     else if (!list || !list[0]) {
                        languages = ["en"];
                        resolve();
                     } else {
                        list.forEach((lang) => {
                           languages.push(lang.language_code);
                        });
                        resolve();
                     }
                  });
               });
            })

            // Pull trans's relation name
            .then(function() {
               return new Promise((resolve, reject) => {
                  var transTableName = getTransTableName(tableName);

                  Promise.resolve()
                     .catch(reject)
                     .then(function() {
                        return new Promise((next, err) => {
                           knexTable.schema
                              .hasTable(transTableName)
                              .catch(err)
                              .then(function(exists) {
                                 next(exists);
                              });
                        });
                     })
                     .then(function(exists) {
                        return new Promise((next, err) => {
                           if (!exists) return next();

                           knexTable(transTableName)
                              .columnInfo()
                              .catch(err)
                              .then(function(transCols) {
                                 Object.keys(transCols).forEach((colName) => {
                                    var col = transCols[colName];

                                    if (colName != "id" && col.type == "int")
                                       transColumnName = colName;
                                 });

                                 next();
                              });
                        });
                     })
                     .then(resolve);
               });
            })

            // Get the primary key info
            .then(function() {
               return new Promise((resolve, reject) => {
                  getPrimaryKey(knexTable, tableName, connName)
                     .catch(reject)
                     .then((colName) => {
                        pkColName = colName;

                        resolve();
                     });
               });
            })

            // Prepare object
            .then(function() {
               return new Promise((resolve, reject) => {
                  objectData = {
                     // id: uuid(),
                     connName: connName,
                     name: tableName,
                     tableName: tableName,
                     transColumnName: transColumnName,
                     labelFormat: "",
                     isExternal: 1,
                     createdInAppID: appID,
                     translations: [],
                     objectWorkspace: {
                        hiddenFields: []
                     },
                     fields: []
                  };

                  if (pkColName) objectData.primaryColumnName = pkColName;

                  // Add label translations
                  let tableLabel = tableName.replace(/_/g, " ");
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
            .then(function() {
               return new Promise((resolve, reject) => {
                  ABExternal.getColumns(tableName, connName)
                     .catch(reject)
                     .then((data) => {
                        columns = data;
                        resolve();
                     });
               });
            })

            // Prepare object fields
            .then(function() {
               return new Promise((resolve, reject) => {
                  var modelName = getModelName(tableName);
                  let associations = getAssociations(tableName);

                  Object.keys(columns).forEach((colName) => {
                     var col = columns[colName];

                     if (
                        !col.supported ||
                        pkColName == colName ||
                        ABFieldCore.reservedNames.indexOf(colName) > -1
                     )
                        return;

                     let inputCol = columnList.filter(
                        (enterCol) => enterCol.name == colName
                     )[0];

                     // Clone the reference defaults for this type
                     let colData = FieldManager.newField(
                        {
                           key: inputCol.fieldKey,
                           // id: uuid.v4(),
                           columnName: colName,
                           settings: {
                              isImported: true,
                              showIcon: 1
                           }
                        },
                        objectData
                     ).toObj();

                     // Flag support multilingual
                     if (col.multilingual)
                        colData.settings.supportMultilingual = 1;

                     if (!col.nullable) colData.settings.required = 1;

                     // Define default value
                     if (col.defaultValue)
                        colData.settings.default = col.defaultValue;

                     // Add a hidden field
                     if (inputCol && JSON.parse(inputCol.isHidden || false)) {
                        objectData.objectWorkspace.hiddenFields.push(
                           colData.columnName
                        );
                     }

                     // Label of the column
                     let colLabel = inputCol ? inputCol.label : colName;
                     labelField(colData, colLabel);

                     // Define Connect column settings
                     if (inputCol.fieldKey == "connectObject") {
                        let associateInfo = associations.filter(
                           (asso) => asso.alias == colName
                        )[0];
                        if (associateInfo) {
                           // Pull table name of link
                           let targetModel = "",
                              targetAssociate,
                              targetColId = uuid.v4(),
                              targetColName = "",
                              targetType = ""; // model, many

                           if (associateInfo.type == "model") {
                              targetModel = sails.models[associateInfo.model];
                              targetAssociate = targetModel.associations.filter(
                                 (asso) => {
                                    return (
                                       asso.collection == modelName &&
                                       asso.via == colName
                                    );
                                 }
                              )[0];
                              if (targetAssociate) {
                                 targetColName = targetAssociate.alias;
                                 targetType = targetAssociate.type;
                              }
                           } else {
                              targetModel =
                                 sails.models[associateInfo.collection];
                              targetColName = associateInfo.via;

                              // Pull type of associate
                              targetAssociate = targetModel.associations.filter(
                                 (asso) => asso.alias == targetColName
                              )[0];
                              if (targetAssociate) {
                                 targetType = targetAssociate.type;
                              }
                           }

                           // Get id of ABObject and ABColumn
                           let targetObj = (
                              application.json.objects || []
                           ).filter(
                              (o) => o.tableName == targetModel.tableName
                           )[0];
                           if (!targetObj) return;

                           // prevent duplicate
                           if (
                              (targetObj.fields || []).filter(
                                 (f) => f.columnName == targetColName
                              )[0]
                           )
                              return;

                           colData.settings.linkObject = targetObj.id; // ABObject.id
                           colData.settings.linkType =
                              associateInfo.type == "model" ? "one" : "many";
                           colData.settings.linkViaType =
                              targetType == "model" ? "one" : "many"; // one, many

                           colData.settings.linkColumn = targetColId; // ABColumn.id
                           colData.settings.isSource = 1;

                           // Add target connect field to the target object
                           let targetColData = FieldManager.newField(
                              {
                                 key: "connectObject",

                                 id: targetColId,
                                 columnName: targetColName,
                                 settings: {
                                    isImported: true,
                                    showIcon: 1,
                                    linkObject: objectData.id,
                                    linkType:
                                       targetType == "model" ? "one" : "many",
                                    linkViaType:
                                       associateInfo.type == "model"
                                          ? "one"
                                          : "many",
                                    linkColumn: colData.id,
                                    isSource: 0
                                 }
                              },
                              targetObj
                           ).toObj();

                           labelField(
                              targetColData,
                              (targetColName || "").replace(/_/g, " ")
                           );

                           targetObj.fields.push(targetColData);

                           // Refresh the target model
                           let targetObjClass = new ABObjectExternal(
                              targetObj,
                              application
                           );
                           targetObjClass.modelRefresh();
                        }
                     }

                     objectData.fields.push(colData);
                  });

                  resolve();
               });
            })
            /*
            // Create federated table
            .then(function() {
               debugger;
               return new Promise((resolve, reject) => {
                  let externalObject = new ABObjectExternal(
                     objectData,
                     application
                  );

                  externalObject
                     .migrateCreate(knexAppBuilder, {
                        connection: connName,
                        table: tableName,
                        primary: pkColName
                     })
                     .then(resolve)
                     .catch(reject);
               });
            })
*/
            // Create column associations in database
            .then(function() {
               return new Promise((resolve, reject) => {
                  // TODO
                  resolve();
               });
            })

            // Save to database
            .then(function() {
               return new Promise((resolve, reject) => {
                  // Here we have a built out objectData structure that mimics
                  // our previous design. Now we parse this structure to create
                  // live ABObject:

                  // Create our Base Object
                  var newObject = new ABObjectExternal(objectData, application);

                  // create each field,
                  var allFields = [];
                  var allFieldSaves = [];
                  (objectData.fields || []).forEach((f) => {
                     var newField = newObject.fieldNew(f);
                     allFields.push(newField);
                     allFieldSaves.push(newField.save());
                  });
                  Promise.all(allFieldSaves)
                     .then(() => {
                        // insert fields into object and save()
                        newObject._fields = allFields;
                        return newObject.save();
                     })
                     .then(() => {
                        // We need to make sure all the definitions get back
                        // to the client.
                        var definitions = [];
                        definitions.push(newObject.toDefinition().toObj());
                        allFields.forEach((f) => {
                           definitions.push(f.toDefinition().toObj());
                        });

                        resolve(definitions);
                     })
                     .catch(reject);

                  // ABApplication.update(
                  //    { id: appID },
                  //    { json: application.json }
                  // ).exec((err, updated) => {
                  //    if (err) {
                  //       console.log("ERROR: ", err);
                  //       reject(err);
                  //    } else if (!updated || !updated[0]) {
                  //       console.log("ERROR: app not updated");
                  //       reject(new Error("Application not updated"));
                  //    } else {
                  //       resolve(application.json.objects);
                  //    }
                  // });
               });
            })

         // .then(
         //    () =>
         //       new Promise((resolve, reject) => {
         //          ABGraphObject.upsert(objectData.id, objectData)
         //             .catch(reject)
         //             .then(() => {
         //                resolve();
         //             });
         //       })
         // )

         // // Relate
         // .then(
         //    () =>
         //       new Promise((resolve, reject) => {
         //          if (!application || !objectData) return resolve();

         //          application
         //             .relate("objects", objectData.id)
         //             .catch(reject)
         //             .then(() => {
         //                resolve(objectData);
         //             });
         //       })
         // )
      );
   }
};
