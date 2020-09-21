/*
 * ABFieldConnect
 *
 * An ABFieldConnect defines a connect to other object field type.
 *
 */

const path = require("path");
const async = require("async");
const _ = require("lodash");

const ABFieldConnectCore = require(path.join(
   __dirname,
   "..",
   "..",
   "core",
   "dataFields",
   "ABFieldConnectCore.js"
));

/**
 * @method getJunctionInfo
 * @param {string} objectName
 * @param {string} linkObjectName
 *
 * @return {Object} {
 * 		tableName {string},
 * 		sourceColumnName {string},
 * 		targetColumnName {string}
 * }
 */
function getJuntionInfo(objectName, linkObjectName) {
   var sourceModel = _.filter(
      sails.models,
      (m) => m.tableName == objectName
   )[0];
   var targetModel = _.filter(
      sails.models,
      (m) => m.tableName == linkObjectName
   )[0];
   var juntionModel = _.filter(sails.models, (m) => {
      return (
         m.meta.junctionTable && // true / false
         // definition: {
         //	id: {
         //		primaryKey: true,
         // 	 	unique: true,
         // 	 	autoIncrement: true,
         // 	 	type: 'integer'
         //	},
         //  permissionaction_roles: {
         //		type: 'integer',
         // 	 	foreignKey: true,
         // 	 	references: 'permissionaction',
         // 	 	on: 'id',
         // 	 	via: 'permissionrole_actions'
         //	},
         //  permissionrole_actions: {
         //		type: 'integer',
         // 	 	foreignKey: true,
         // 	 	references: 'permissionrole',
         // 	 	on: 'id',
         // 	 	via: 'permissionaction_roles'
         //	} }
         _.filter(m.definition, (def) => {
            return (
               def.foreignKey == true &&
               (def.references == sourceModel.identity ||
                  def.references == targetModel.identity)
            );
         }).length >= 2
      );
   })[0];

   // Get columns info
   var sourceColumnName = _.filter(
         juntionModel.definition,
         (def) =>
            def.foreignKey == true && def.references == sourceModel.identity
      )[0].via,
      targetColumnName = _.filter(
         juntionModel.definition,
         (def) =>
            def.foreignKey == true && def.references == targetModel.identity
      )[0].via;

   return {
      tableName: juntionModel.tableName,
      sourceColumnName: sourceColumnName,
      targetColumnName: targetColumnName
   };
}

function getConstraintName(tableName, columnName) {
   return (
      AppBuilder.rules.toJunctionTableFK(tableName, columnName) || ""
   ).replace(/[^a-zA-Z0-9\_]/g, "");
}

module.exports = class ABFieldConnect extends ABFieldConnectCore {
   constructor(values, object) {
      super(values, object);
   }

   ///
   /// Instance Methods
   ///

   isValid() {
      var errors = super.isValid();

      // errors = OP.Form.validationError({
      // 	name:'columnName',
      // 	message:L('ab.validation.object.name.unique', 'Field columnName must be unique (#name# already used in this Application)').replace('#name#', this.name),
      // }, errors);

      return errors;
   }

   get datasourceLink() {
      if (!ABObjectCache) return null;

      // var application = this.object.application,
      // 	linkObject = application.objects((obj) => { return obj.id == this.settings.linkObject; })[0];
      let linkObject = ABObjectCache.get(this.settings.linkObject);

      return linkObject;
   }

   /**
    * @method exportIDs()
    * export any relevant .ids for the necessary operation of this application.
    * @param {array} ids
    *        the array of ids to store our relevant .ids into
    */
   exportIDs(ids) {
      super.exportIDs(ids);

      // include datasource with this:
      // Q?: so, when exporting ids ... do we ensure we gather all connected fields?
      var connObj = this.datasourceLink;
      if (connObj) {
         connObj.exportIDs(ids);
      }
   }

   ///
   /// DB Migrations
   ///

   /**
    * @function migrateCreate
    * perform the necessary sql actions to ADD this column to the DB table.
    * @param {knex} knex the Knex connection for this field's object
    */
   migrateCreate(knex) {
      return new Promise((resolve, reject) => {
         //
         // Prepare Initial link values.
         //

         let tableName = this.object.dbTableName(true);
         // {string} tableName
         // The sql table name this field belongs in.

         // find linked object
         let linkObject = this.datasourceLink;
         // {ABObject} linkObject
         // the ABObject this field connects to.

         if (!linkObject) {
            // can't continue if we can't figure out our linkObject.
            // This is a mis-configuration issue and we need to bail.

            var errorMissingLinkObject = new Error(
               `ABFieldConnect.migrateCreate(): could not resolve .datasourceLink for Object[${
                  this.object.label
               }][${this.object.id}].Field[${this.label}][${
                  this.id
               }] : settings[${JSON.stringify(this.settings, null, 4)}]`
            );
            return reject(errorMissingLinkObject);
         }

         let linkKnex = ABMigration.connection(linkObject.connName);
         // {Knex} linkKnex
         // the Knex connection that handles the interactions for the linkObject.

         let linkTableName = linkObject.dbTableName(true);
         // {string} linkTableName
         // The sql table name for out linkObject.

         let linkField = this.fieldLink;
         // {ABField} linkField
         // the corresponding ABFieldConnect in our linkObject that represents
         // this link.

         if (!linkField) {
            // !!! This is an internal Error that is our fault:
            var missingFieldLink = new Error(
               `MigrateCreate():Unable to find linked field for object[${
                  this.object.label
               }]->field[${this.label}][${this.id}] : settings[${JSON.stringify(
                  this.settings,
                  null,
                  4
               )}]`
            );
            missingFieldLink.field = this.toObj();
            reject(missingFieldLink);
            return;
         }

         // TODO : should check duplicate column
         let linkColumnName = linkField.columnName;
         // {string} linkColumnName
         // the corresponding sql table column name of our linked field.

         // pull FK
         let linkFK = linkObject.PK();
         // {string} linkFK
         // this is the column name of the ForeignKey in our linkObject.
         // by default we assume it is the Primary Key (.PK()) of the linkObject.

         let indexField = this.indexField;
         // {string} indexField
         // the ABField.id of which field in the linkObject is the column we are
         // actually using for our foreign key.
         // indexField can be "" or null if it is the default .PK()

         if (indexField) {
            linkFK = indexField.columnName;
         }

         let indexType = "";
         // {string} indexType
         // the sql type (varchar(xx), int(xx), etc... ) of the field our
         // foreign key is linked to.
         // When making a field to hold the foreignKey value, it must match the
         // linked object FK exactly.

         let indexType2 = "";
         // {string} indexType2
         // same as indexType, however in the case of M:N connections, we create
         // a join table and need to create 2 columns for each table. This is
         // the sql type for the 2nd column.

         //
         // Now Figure out our linkType
         //

         let linkType = `${this.settings.linkType}:${this.settings.linkViaType}`;
         // {string} case
         // a string representation of what kind of link we are creating:
         // ["one:one", "one:many", "many:one", "many:many"]

         switch (linkType) {
            case "one:one":
               // in a 1:1 link, each row in this object can link to only 1
               // row in the linkObject.
               // the.settings.isSource == true  indicates that this field's
               // object is the one to hold the other object's FK:
               if (!this.settings.isSource) {
                  // we don't have to do anything if we are ! source
                  return resolve();
               }

               // Before we create the column (and create a constraint)
               // make sure the linked field is indexed.
               this.migrateVerifyLinkedIndex(this)
                  .then(() => {
                     // now we need to create the column based on this field.
                     return this.migrateCreateColumnForField(this);
                  })
                  .then(() => {
                     // On a 1:1 link, these columns need to be unique values:
                     return this.migrateSetUniqueColumnForField(this);
                  })
                  .then(resolve)
                  .catch(reject);
               break;

            case "one:many":
               // in a 1:M link, this table, will contain the FK of the linked
               // table.

               // Before we create the column (and create a constraint)
               // make sure the linked field is indexed.
               this.migrateVerifyLinkedIndex(this)
                  .then(() => {
                     // now we need to create the column based on this field.
                     return this.migrateCreateColumnForField(this);
                  })
                  .then(resolve)
                  .catch(reject);
               break;

            case "many:one":
               // in a M:1 link, the linkField's table will contain the FK of
               // my table.

               // Before we create the column (and create a constraint)
               // make sure the linked field is indexed.
               this.migrateVerifyLinkedIndex(linkField)
                  .then(() => {
                     // now we need to create the column based on this field.
                     return this.migrateCreateColumnForField(linkField);
                  })
                  .then(resolve)
                  .catch(reject);
               break;

            case "many:many":
               break;
         }
         // 1:1
      });
   }

   /*
    * migrateVerifyLinkedIndex()
    * given a ABField definition, verify it's linked Field has an index
    * created on it.
    * Linked fields are required to have some form of index before we
    * create a constraint based upon them.
    * @param {ABFieldConnect} field
    *        the ABFieldConnect that represents the field the constraint
    *        is ON.
    * @return {Promise}
    */
   migrateVerifyLinkedIndex(field) {
      // find linked object
      let linkObject = field.datasourceLink;
      // {ABObject} linkObject
      // the ABObject this field connects to.

      let linkTableName = linkObject.dbTableName(true);
      // {string} linkTableName
      // The sql table name for our linkObject.

      let linkKnex = ABMigration.connection(linkObject.connName);
      // {Knex} linkKnex
      // the Knex connection that handles the interactions for the linkObject.

      let linkField = this.fieldLink;
      // {ABField} linkField
      // the corresponding ABFieldConnect in our linkObject that represents
      // this link.

      let columnType;
      let indexType;
      return new Promise((resolve, reject) => {
         Promise.resolve()
            .then(() => {
               return linkKnex.schema
                  .raw(
                     `SHOW COLUMNS FROM ${linkField.object.tableName} LIKE '${linkField.columnName}';`
                  )
                  .then((data) => {
                     let rows = data[0];
                     if (rows[0]) {
                        columnType = rows[0].Type;
                        indexType = rows[0].Key;
                     }
                  });
            })
            .then(() => {
               // skip this if index exists
               if (indexType) return;

               // Don't mess with External Objects
               if (
                  !linkObject.isExternal &&
                  field.object.connName == linkObject.connName
               ) {
                  sails.log(`MigrateCreate(): object[${field.object.label}]->field[${field.label}][${field.id}] : is linked to a field that has NOT been INDEXed.

Attempting to INDEX ${linkTableName}.${linkField.columnName} now ...`);
                  return linkKnex.schema.alterTable(linkTableName, (t) => {
                     t.index([linkField.columnName]);
                  });
               } else {
                  sails.log
                     .error(`MigrateCreate(): object[${field.object.label}]->field[${field.label}][${field.id}] : is linked to a field that has NOT been INDEXed.

That field seems to be either external[${linkObject.isExternal}] or not in the same connName[${field.object.connName}/${linkObject.connName}]

Skipping!!!

`);
               }
            })
            .then(resolve)
            .catch(reject);
      });
   }

   /*
    * migrateCreateColumnForField()
    * given a ABField definition, create the table.column for this field.
    * @param {ABFieldConnect} field
    *        the ABFieldConnect that represents the table.column to create
    * @return {Promise}
    */
   migrateCreateColumnForField(field) {
      let knex = ABMigration.connection(field.object.connName);
      // {Knex} knex
      // the Knex sql object represented by this field's object.

      let tableName = field.object.dbTableName(true);
      // {string} tableName
      // the sql tablename of the table this field is in

      let columnName = field.columnName;
      // {string} columnName
      // the sql column name of the column we are creating

      let indexField = field.indexField;
      // {string} indexField
      // the ABField.id of which field in the linkObject is the column we are
      // actually using for our foreign key.
      // indexField can be "" or null if it is the default .PK()

      let linkObject = field.datasourceLink;
      // {ABObject} linkObject
      // the ABObject this field connects to.

      let linkTableName = linkObject.dbTableName(true);
      // {string} linkTableName
      // The sql table name for our linkObject.

      let linkFK = linkObject.PK();
      // {string} linkFK
      // this is the column name of the ForeignKey in our linkObject.
      // by default we assume it is the Primary Key (.PK()) of the linkObject.

      if (indexField) {
         // but if an indexField is given, linkFK points to that column
         linkFK = indexField.columnName;
      }

      return Promise.resolve()
         .then(() => {
            // STEP 1: check to see if table.column already exists
            return knex.schema.hasColumn(tableName, columnName);
         })
         .then((exists) => {
            if (exists) return;
            // if the column already exists, we can stop here.

            // else we continue to create it:
            // STEP 2: decifer the expected columnType
            return this.getIndexColumnType(knex, indexField).then(
               (indexType) => {
                  // STEP 3: create the column:
                  return knex.schema.table(tableName, (t) => {
                     var linkCol = this.setNewColumnSchema(
                        t,
                        columnName,
                        indexType,
                        linkFK
                     );

                     // NOTE: federated table does not support reference column
                     if (
                        !linkObject.isExternal &&
                        field.object.connName == linkObject.connName
                     ) {
                        linkCol
                           .references(linkFK)
                           .inTable(linkTableName)
                           .onDelete("SET NULL")
                           .withKeyName(
                              getConstraintName(field.object.name, columnName)
                           );
                     } else {
                        sails.log.error(
                           `[1:1] object[${field.object.label}]->Field[${field.label}][${field.id}] skipping reference column creation: !linkObject.isExternal[${linkObject.isExternal}] && this.connName[${field.object.connName}] == linkObject.connName[${linkObject.connName}]`
                        );
                     }
                  });
               }
            );
         });
   }

   /*
    * migrateSetUniqueColumnForField()
    * given a ABField definition, set a unique constraint on that column.
    * @param {ABFieldConnect} field
    *        the ABFieldConnect that represents the table.column to set the
    *        constraint on.
    * @return {Promise}
    */
   migrateSetUniqueColumnForField(field) {
      let knex = ABMigration.connection(field.object.connName);
      // {Knex} knex
      // the Knex sql object represented by this field's object.

      let tableName = field.object.dbTableName(true);
      // {string} tableName
      // the sql tablename of the table this field is in

      let columnName = field.columnName;
      // {string} columnName
      // the sql column name of the column we are creating

      return knex.schema.table(tableName, (t) => {
         // Set unique name to prevent ER_TOO_LONG_IDENT error
         let uniqueName = `${field.object
            .dbTableName(false)
            .substring(0, 28)}_${columnName.substring(0, 28)}_UNIQUE`;
         t.unique(columnName, uniqueName);
      });
   }

   /*
    * migrateAddConstraint()
    * establish a ON DELETE constraint between two ABFieldConnect entries
    * @param {obj} fields
    *        And object that contains two ABFieldConnect entries
    *        fields.from : {ABFieldConnect}
    *                      the table.column the constraint is being assigned
    *                      to.
    *        fields.to   : {ABFieldConnect}
    *                      the remote table.column that triggers the constraint
    * @return {Promise}
    */
   migrateAddConstraint(fields) {
      var field = fields.from;
      var linkField = fields.to;

      let knex = ABMigration.connection(field.object.connName);
      // {Knex} knex
      // the Knex sql object represented by this field's object.

      let tableName = field.object.dbTableName(true);
      // {string} tableName
      // the sql tablename of the table this field is in

      let columnName = field.columnName;
      // {string} columnName
      // the sql column name of the column we are creating

      ///// LEFT OFF HERE:
   }

   migrateCreateOld(knex) {
      return new Promise((resolve, reject) => {
         let tableName = this.object.dbTableName(true);

         // find linked object
         let linkObject = this.datasourceLink;
         if (!linkObject) {
            sails.log.error(
               `ABFieldConnect.migrateCreate(): could not resolve .datasourceLink for Object[${
                  this.object.name
               }][${this.object.id}].Field[${this.label}][${
                  this.id
               }] : settings[${JSON.stringify(this.settings, null, 4)}]`
            );
         }
         let linkKnex = ABMigration.connection(linkObject.connName);

         let linkTableName = linkObject.dbTableName(true);
         let linkField = this.fieldLink;
         if (!linkField) {
            // !!! This is an internal Error that is our fault:
            var missingFieldLink = new Error(
               `MigrateCreate():Unable to find linked field for object[${
                  this.object.label
               }]->field[${this.label}][${this.id}] : settings[${JSON.stringify(
                  this.settings,
                  null,
                  4
               )}]`
            );
            missingFieldLink.field = this.toObj();
            reject(missingFieldLink);
            return;
         }
         // TODO : should check duplicate column
         let linkColumnName = this.fieldLink.columnName;

         // pull FK
         let linkFK = linkObject.PK();
         let indexField = this.indexField;
         if (indexField) {
            linkFK = indexField.columnName;
         }
         let indexType = "";
         let indexType2 = "";

         // 1:M - create a column in the table and references to id of the link table
         if (
            this.settings.linkType == "one" &&
            this.settings.linkViaType == "many"
         ) {
            async.waterfall(
               [
                  // check column already exist
                  (next) => {
                     knex.schema
                        .hasColumn(tableName, this.columnName)
                        .then((exists) => {
                           next(null, exists);
                        })
                        .catch(next);
                  },
                  // get MySQL column type of index field
                  (exists, next) => {
                     if (exists || !indexField) return next(null, exists);

                     this.getIndexColumnType(
                        knex,
                        indexField.object.tableName,
                        indexField.columnName
                     )
                        .then((result) => {
                           indexType = result;
                           next(null, exists);
                        })
                        .catch(next);
                  },
                  // create a column
                  (exists, next) => {
                     if (exists) return next();

                     knex.schema
                        .table(tableName, (t) => {
                           let linkCol = this.setNewColumnSchema(
                              t,
                              this.columnName,
                              indexType,
                              linkFK
                           );

                           // NOTE: federated table does not support reference column
                           if (
                              !linkObject.isExternal &&
                              this.connName == linkObject.connName
                           ) {
                              linkCol
                                 .references(linkFK)
                                 .inTable(linkTableName)
                                 .onDelete("SET NULL")
                                 .withKeyName(
                                    getConstraintName(
                                       this.object.name,
                                       this.columnName
                                    )
                                 );
                           } else {
                              console.error(
                                 `[1:M] object[${this.object.label}]->Field[${this.label}][${this.id}] skipping reference column creation: !linkObject.isExternal[${linkObject.isExternal}] && this.connName[${this.connName}] == linkObject.connName[${linkObject.connName}]`
                              );
                           }
                        })
                        .then(() => {
                           next();
                        })
                        .catch(next);
                  }
               ],
               (err) => {
                  if (err) reject(err);
                  else resolve();
               }
            );
         }

         // 1:1 - create a column in the table, references to id of the link table and set to be unique
         if (
            this.settings.linkType == "one" &&
            this.settings.linkViaType == "one" &&
            this.settings.isSource
         ) {
            async.waterfall(
               [
                  // check column already exist
                  (next) => {
                     knex.schema
                        .hasColumn(tableName, this.columnName)
                        .then((exists) => {
                           next(null, exists);
                        })
                        .catch(next);
                  },
                  // get MySQL column type of index field
                  (exists, next) => {
                     if (exists || !indexField) return next(null, exists);

                     this.getIndexColumnType(
                        knex,
                        indexField.object.tableName,
                        indexField.columnName
                     )
                        .then((result) => {
                           indexType = result;
                           next(null, exists);
                        })
                        .catch(next);
                  },
                  // create a column
                  (exists, next) => {
                     if (exists) return next();

                     knex.schema
                        .table(tableName, (t) => {
                           let linkCol = this.setNewColumnSchema(
                              t,
                              this.columnName,
                              indexType,
                              linkFK
                           );

                           // NOTE: federated table does not support reference column
                           if (
                              !linkObject.isExternal &&
                              this.connName == linkObject.connName
                           ) {
                              linkCol
                                 .references(linkFK)
                                 .inTable(linkTableName)
                                 .onDelete("SET NULL")
                                 .withKeyName(
                                    getConstraintName(
                                       this.object.name,
                                       this.columnName
                                    )
                                 );
                           } else {
                              console.error(
                                 `[1:1] object[${this.object.label}]->Field[${this.label}][${this.id}] skipping reference column creation: !linkObject.isExternal[${linkObject.isExternal}] && this.connName[${this.connName}] == linkObject.connName[${linkObject.connName}]`
                              );
                           }

                           // Set unique name to prevent ER_TOO_LONG_IDENT error
                           let uniqueName = `${this.object
                              .dbTableName(false)
                              .substring(0, 28)}_${this.columnName.substring(
                              0,
                              28
                           )}_UNIQUE`;
                           t.unique(this.columnName, uniqueName);
                        })
                        .then(() => {
                           next();
                        })
                        // .catch(next);
                        .catch((err) => {
                           if (err.code != "ER_DUP_FIELDNAME") {
                              console.error("[1:1]", err);
                           }
                           next(err);
                        });
                  }
               ],
               (err) => {
                  if (err) reject(err);
                  else resolve();
               }
            );
         }

         // M:1 - create a column in the link table and references to id of the target table
         else if (
            this.settings.linkType == "many" &&
            this.settings.linkViaType == "one"
         ) {
            async.waterfall(
               [
                  // check column already exist
                  (next) => {
                     // linkColumnName might be undefined.
                     // if so, then skip this process.
                     if (!linkColumnName) {
                        console.error(
                           "ABFieldConnect:migrateCreate(): could not resolve linkColumnName. This is unexpected.",
                           this.toObj()
                        );
                        next(null, true);
                        return;
                     }

                     linkKnex.schema
                        .hasColumn(linkTableName, linkColumnName)
                        .then((exists) => {
                           next(null, exists);
                        })
                        .catch(next);
                  },
                  // get MySQL column type of index field
                  (exists, next) => {
                     if (exists || !indexField) return next(null, exists);

                     this.getIndexColumnType(
                        knex,
                        indexField.object.tableName,
                        indexField.columnName
                     )
                        .then((result) => {
                           indexType = result;
                           next(null, exists);
                        })
                        .catch(next);
                  },
                  // create a column
                  (exists, next) => {
                     if (exists) return next();

                     linkKnex.schema
                        .table(linkTableName, (t) => {
                           let linkCol = this.setNewColumnSchema(
                              t,
                              linkColumnName,
                              indexType,
                              linkFK
                           );

                           // NOTE: federated table does not support reference column
                           if (
                              !this.object.isExternal &&
                              this.connName == linkObject.connName
                           ) {
                              linkCol
                                 .references(linkFK)
                                 .inTable(tableName)
                                 .onDelete("SET NULL")
                                 .withKeyName(
                                    getConstraintName(
                                       linkObject.name,
                                       linkColumnName
                                    )
                                 );
                           } else {
                              console.error(
                                 `[M:1] object[${this.object.label}]->Field[${this.label}][${this.id}] skipping linkCol creation: !isExternal[${this.object.isExternal}]  && connName[${this.connName}] == linkObj.connName[${linkObject.connName}]`
                              );
                           }
                        })
                        .then(() => {
                           next();
                        })
                        // .catch(next);
                        .catch((err) => {
                           if (err.code != "ER_DUP_FIELDNAME") {
                              console.error("[M:1]", err);
                           }
                           next(err);
                        });
                  }
               ],
               (err) => {
                  if (err) {
                     if (err.code == "ER_DUP_FIELDNAME") resolve();
                     else reject(err);
                  } else {
                     resolve();
                  }
               }
            );
         }

         // M:N - create a new table and references to id of target table and linked table
         else if (
            this.settings.linkType == "many" &&
            this.settings.linkViaType == "many"
         ) {
            var joinTableName = this.joinTableName(),
               getFkName = AppBuilder.rules.toJunctionTableFK;
            // [add] replaced this with a global rule, so we can reuse it in other
            // 		 places.
            /* 
						(objectName, columnName) => {

							var fkName = objectName + '_' + columnName;

							if (fkName.length > 64)
								fkName = fkName.substring(0, 64);

							return fkName;
						};
						*/

            var sourceKnex = this.settings.isSource ? knex : linkKnex;

            sourceKnex.schema.hasTable(joinTableName).then((exists) => {
               if (exists) {
                  resolve();
                  return;
               }

               // if it doesn't exist, then create it and any known fields:
               return Promise.resolve()
                  .then(
                     () =>
                        new Promise((next, bad) => {
                           if (!indexField) return next();

                           this.getIndexColumnType(
                              knex,
                              indexField.object.tableName,
                              indexField.columnName
                           )
                              .catch(bad)
                              .then((result) => {
                                 indexType = result;
                                 next();
                              });
                        })
                  )
                  .then(
                     () =>
                        new Promise((next, bad) => {
                           let indexField2 = this.indexField2;
                           if (!indexField2) return next();

                           this.getIndexColumnType(
                              knex,
                              indexField2.object.tableName,
                              indexField2.columnName
                           )
                              .catch(bad)
                              .then((result) => {
                                 indexType2 = result;
                                 next();
                              });
                        })
                  )
                  .then(() =>
                     sourceKnex.schema.createTable(joinTableName, (t) => {
                        t.increments("id").primary();
                        t.timestamps();
                        t.engine("InnoDB");
                        t.charset("utf8");
                        t.collate("utf8_unicode_ci");

                        var sourceFkName = getFkName(
                           this.object.name,
                           this.columnName
                        );
                        var targetFkName = getFkName(
                           linkObject.name,
                           linkColumnName
                        );

                        // create columns
                        let linkCol;
                        let linkCol2;

                        // custom index
                        let linkFK2 = this.datasourceLink.PK();
                        let indexField2 = this.indexField2;
                        if (indexField2) {
                           linkFK2 = indexField2.columnName;
                        }

                        linkCol = this.setNewColumnSchema(
                           t,
                           this.object.name,
                           indexType,
                           linkFK
                        );

                        linkCol2 = this.setNewColumnSchema(
                           t,
                           linkObject.name,
                           indexType2,
                           linkFK2
                        );

                        // NOTE: federated table does not support reference column
                        if (
                           !this.object.isExternal &&
                           !linkObject.isExternal &&
                           this.connName == linkObject.connName
                        ) {
                           linkCol
                              .references(linkFK)
                              .inTable(tableName)
                              .withKeyName(sourceFkName)
                              .onDelete("SET NULL");

                           linkCol2
                              .references(linkFK2)
                              .inTable(linkTableName)
                              .withKeyName(targetFkName)
                              .onDelete("SET NULL");
                        } else {
                           console.error(
                              `[M:N] object[${this.object.label}]->Field[${this.label}][${this.id}] skipping linkCol creation: !this.object.isExternal[${this.object.isExternal}] && !linkObject.isExternal[${linkObject.isExternal}] && connName[${this.connName}] == linkObj.connName[${linkObject.connName}]`
                           );
                        }

                        // // create columns
                        // t.integer(this.object.name).unsigned().nullable()
                        // 	.references(this.object.PK())
                        // 	.inTable(tableName)
                        // 	.withKeyName(sourceFkName)
                        // 	.onDelete('SET NULL');

                        // t.integer(linkObject.name).unsigned().nullable()
                        // 	.references(linkObject.PK())
                        // 	.inTable(linkTableName)
                        // 	.withKeyName(targetFkName)
                        // 	.onDelete('SET NULL');
                     })
                  )
                  .then(() => {
                     resolve();
                  })
                  .catch((err) => {
                     var ignoreCodes = [
                        "ER_DUP_FIELDNAME",
                        "ER_TABLE_EXISTS_ERROR"
                     ];
                     if (ignoreCodes.indexOf(err.code) == -1) {
                        console.error("[M:N]", err);
                     }

                     // If the table exists, skip the error
                     if (err.code == "ER_TABLE_EXISTS_ERROR") resolve();
                     else reject(err);
                  });
            });
         } else {
            resolve();
         }
      });
   }

   /**
    * @function migrateDrop
    * perform the necessary sql actions to drop this column from the DB table.
    * @param {knex} knex the Knex connection.
    */
   migrateDrop(knex) {
      return new Promise((resolve, reject) => {
         // if field is imported, then it will not remove column in table
         if (this.object.isImported || this.isImported) return resolve();

         var tableName = this.object.dbTableName(true);

         // M:N
         if (
            this.settings.linkType == "many" &&
            this.settings.linkViaType == "many"
         ) {
            // If the linked object is removed, it can not find join table name.
            // The join table should be removed already.
            if (!this.datasourceLink) return resolve();

            // drop join table
            var joinTableName = this.joinTableName();

            // get source knex of the join table
            var sourceKnex = knex;
            if (!this.settings.isSource) {
               sourceKnex = ABMigration.connection(
                  this.datasourceLink.connName
               );
            }

            sourceKnex.schema.dropTableIfExists(joinTableName).then(() => {
               super.migrateDrop(knex).then(() => resolve(), reject);
            });
         }
         // M:1,  1:M,  1:1
         else {
            let tasks = [];

            // Drop Unique
            tasks.push(
               knex.schema.table(tableName, (t) => {
                  t.dropUnique(this.columnName);
               })
            );

            // Drop Index
            tasks.push(
               knex.schema.table(tableName, (t) => {
                  t.dropIndex(this.columnName);
               })
            );

            // Drop Foreign key
            tasks.push(
               knex.schema.table(tableName, (t) => {
                  t.dropForeign(
                     this.columnName,
                     getConstraintName(this.object.name, this.columnName)
                  );
               })
            );

            Promise.all(tasks)
               .then(() => {
                  // Drop column
                  super.migrateDrop(knex).then(() => resolve(), reject);
               })
               //	always pass, becuase ignore not found index errors.
               .catch((err) => {
                  // Drop column
                  super.migrateDrop(knex).then(() => resolve(), reject);
               });
         }
      });
   }

   ///
   /// DB Model Services
   ///

   /**
    * @method jsonSchemaProperties
    * register your current field's properties here:
    */
   jsonSchemaProperties(obj) {
      // take a look here:  http://json-schema.org/example1.html

      // if our field is not already defined:
      if (!obj[this.columnName]) {
         obj[this.columnName] = {
            anyOf: [
               { type: "array" },
               { type: "number" },
               { type: "null" },
               {
                  // allow empty string because it could not put empty array in REST api
                  type: "string"
                  // "maxLength": 0
               }
            ]
         };
      }
   }

   /**
    * @method requestParam
    * return the entry in the given input that relates to this field.
    * @param {obj} allParameters  a key=>value hash of the inputs to parse.
    * @return {obj} or undefined
    */
   requestParam(allParameters) {
      var myParameter = super.requestParam(allParameters);

      // pull id of relation value when 1:M and 1:1
      // to prevent REQUIRED column on insert data
      if (
         (this.settings.linkType == "one" &&
            this.settings.linkViaType == "many") || // 1:M
         (this.settings.linkType == "one" &&
            this.settings.linkViaType == "one" &&
            this.settings.isSource)
      ) {
         // 1:1 own table has the connected column

         myParameter = this.requestRelationParam(allParameters);
      }
      // remove relation column value
      // We need to update it in .requestRelationParam
      else if (myParameter) {
         delete myParameter[this.columnName];
      }

      return myParameter;
   }

   requestRelationParam(allParameters) {
      var myParameter = super.requestRelationParam(allParameters);
      if (myParameter) {
         if (myParameter[this.columnName]) {
            // let PK;

            // if value is array, then get id of array
            if (myParameter[this.columnName].forEach) {
               let result = [];

               myParameter[this.columnName].forEach((d) => {
                  let val = this.getRelationValue(d, { forUpdate: true });

                  // if (PK == "id") {
                  //    val = parseInt(d[PK] || d.id || d);

                  //    // validate INT value
                  //    if (val && !isNaN(val)) result.push(val);
                  // }
                  // // uuid
                  // else {
                  result.push(val);
                  // }
               });

               myParameter[this.columnName] = result;
            }
            // if value is a object
            else {
               myParameter[this.columnName] = this.getRelationValue(
                  myParameter[this.columnName],
                  { forUpdate: true }
               );

               // if (PK == "id") {
               //    myParameter[this.columnName] = parseInt(
               //       myParameter[this.columnName]
               //    );

               //    // validate INT value
               //    if (isNaN(myParameter[this.columnName]))
               //       myParameter[this.columnName] = null;
               // }
            }
         } else {
            // myParameter[this.columnName] = [];
            myParameter[this.columnName] = null;
         }
      }

      return myParameter;
   }

   /**
    * @method isValidParams
    * Parse through the given parameters and return an error if this field's
    * data seems invalid.
    * @param {obj} allParameters  a key=>value hash of the inputs to parse.
    * @return {array}
    */
   isValidData(allParameters) {
      var errors = [];

      return errors;
   }

   // relationName() {

   // 	var relationName = AppBuilder.rules.toFieldRelationFormat(this.columnName);

   // 	return relationName;
   // }

   joinTableName(prefixSchema = false) {
      var linkObject = this.datasourceLink;
      var tableName = "";

      if (this.object.isExternal && linkObject.isExternal) {
         var juntionModel = getJuntionInfo(
            this.object.tableName,
            this.datasourceLink.tableName
         );

         tableName = juntionModel.tableName;
      } else {
         var sourceObjectName, targetObjectName, columnName;

         if (this.settings.isSource == true) {
            sourceObjectName = this.object.name;
            targetObjectName = linkObject.name;
            columnName = this.columnName;
         } else {
            sourceObjectName = linkObject.name;
            targetObjectName = this.object.name;
            // NOTE: it is possible for this.fieldLink to return undefined
            if (this.fieldLink) {
               columnName = this.fieldLink.columnName;
            }
         }

         // if columnName is not set, we can't proceed:
         if (!columnName) {
            var tryThisField = linkObject.fields(
               (f) => f.id == this.settings.linkColumn
            )[0];
            if (tryThisField) {
               columnName = tryThisField.columnName;
            } else {
               // yeah, well this shouldn't be happening, and is only
               // happening due to the current Role & Scope transition,
               // so we will take this all out once we have those
               // merged into ABDefinitions
               columnName = "roles"; // linkObject.name;
            }
         }
         // return join table name
         tableName = AppBuilder.rules.toJunctionTableNameFormat(
            // this.object.application.name, // application name
            "JOINMN",
            sourceObjectName, // table name
            targetObjectName, // linked table name
            columnName
         ); // column name
      }

      if (prefixSchema) {
         // pull database name
         var schemaName = "";
         if (this.settings.isSource == true)
            schemaName = this.object.dbSchemaName();
         else schemaName = linkObject.dbSchemaName();

         return "#schema#.#table#"
            .replace("#schema#", schemaName)
            .replace("#table#", tableName);
      } else {
         return tableName;
      }
   }

   /**
    * @method joinColumnNames
    *
    * @return {Object} - {
    * 		sourceColName {string},
    * 		targetColName {string}
    * }
    */
   joinColumnNames() {
      var sourceColumnName = "",
         targetColumnName = "";

      var objectLink = this.datasourceLink;

      if (this.object.isExternal && objectLink.isExternal) {
         var juntionModel = getJuntionInfo(
            this.object.tableName,
            this.datasourceLink.tableName
         );

         sourceColumnName = juntionModel.sourceColumnName;
         targetColumnName = juntionModel.targetColumnName;
      } else {
         sourceColumnName = this.object.name;
         targetColumnName = this.datasourceLink.name;

         // if (this.settings.isSource == true) {
         // 	sourceColumnName = this.object.name;
         // 	targetColumnName = this.datasourceLink.name;
         // }
         // else {
         // 	sourceColumnName = this.datasourceLink.name;
         // 	targetColumnName = this.object.name;
         // }
      }

      return {
         sourceColumnName: sourceColumnName,
         targetColumnName: targetColumnName
      };
   }

   getIndexColumnType(knex, indexField) {
      if (!indexField) return Promise.resolve();

      return new Promise((resolve, reject) => {
         knex.schema
            .raw(
               `SHOW COLUMNS FROM ${indexField.object.tableName} LIKE '${indexField.columnName}';`
            )
            .then((data) => {
               let indexType;
               let rows = data[0];
               if (rows[0]) {
                  indexType = rows[0].Type;
               }

               resolve(indexType);
            });
      });
   }

   getIndexColumnTypeOld(knex, tableName, columnName) {
      return new Promise((resolve, reject) => {
         knex.schema
            .raw(`SHOW COLUMNS FROM ${tableName} LIKE '${columnName}';`)
            .then((data) => {
               let indexType;
               let rows = data[0];
               if (rows[0]) {
                  indexType = rows[0].Type;
               }

               resolve(indexType);
            });
      });
   }

   setNewColumnSchema(t, columnName, columnType, linkFKname) {
      let result;

      // custom index - create column to match FK type
      if (columnType)
         result = t.specificType(columnName, columnType).nullable();
      // id
      else if (linkFKname == "id")
         result = t
            .integer(columnName)
            .unsigned()
            .nullable();
      // uuid
      else result = t.string(columnName).nullable();

      return result;
   }
};
