const ABIndexCore = require("../core/ABIndexCore");

module.exports = class ABIndex extends ABIndexCore {
   constructor(attributes, object) {
      super(attributes, object);
   }

   /**
    * @method exportIDs()
    * export any relevant .ids for the necessary operation of this ABIndex.
    * @param {array} ids
    *         the array of relevant ids to store our .ids into.
    */
   exportIDs(ids) {
      // make sure we don't get into an infinite loop:
      if (ids.indexOf(this.id) > -1) return;

      ids.push(this.id);

      // include my fields:
      (this.fields || []).forEach((f) => {
         if (f.exportIDs) f.exportIDs(ids);
      });
   }

   /*
   isExist(knex) {
      return new Promise((resolve, reject) => {
         let indexName = this.indexName;
         let tableName = this.object.dbTableName();

         knex.schema
            .raw(
               `SHOW INDEXES FROM ${tableName} WHERE \`Key_name\` = '${indexName}';`
            )
            .catch(reject)
            .then((data) => {
               let exists = (data[0] || []).length > 0;

               resolve(exists);
            });
      });
   }
   */

   ///
   /// DB Migrations
   ///

   /**
    * migrateCheckIsCorrect()
    * verify the current definition of the table matches what our
    * definition expectes it to be.
    * @param {Knex} knex
    *        the Knex connection that represents our {ABObject}
    * @return {Promise}
    *         resolves with a {bool} isCorrect?
    */
   migrateCheckIsCorrect(knex) {
      let indexName = this.indexName;
      let tableName = this.object.dbTableName();
      let columnNames = this.fields.map((f) => f.columnName);

      let hashColumns = {
         /* columnName : {bool} true if there */
      };
      // {hash} hashColumns
      // should contain an entry for each expected column in our definition.

      // set each column has to false, and let the returned data set to true.
      columnNames.forEach((c) => {
         hashColumns[c] = false;
      });

      return knex.schema
         .raw(`SHOW INDEXES FROM ${tableName}`)
         .then((data) => {
            let isCorrect = columnNames.length == 0;
            // {bool} isCorrect
            // the final result of whether or not this table has a correct
            // implementation of this ABIndex definition.
            // the only case we might assume we are "correct" if there is
            // no data returned, is if our definition currently has no
            // columns assigned.  So we start off = columnNames.length == 0;

            let rows = data[0];
            if (rows) {
               let existingColumns = [];
               // {array} existingColumns
               // an array of column names that exist as a part of the current
               // definition.  This will help us catch columns that have been
               // removed from our ABIndex configuration.

               // foreach INDEX definition
               rows.forEach((row) => {
                  // if this entry represents THIS index, track this column
                  if (row["Key_name"] == indexName) {
                     var col = row["Column_name"];
                     existingColumns.push(col);
                     hashColumns[col] = true;
                  }
               });

               isCorrect = true;
               // start by assuming true and look for examples where it
               // isn't

               // verify all the expected columns existed in the data
               // none of our hashColumns values can be false;
               Object.keys(hashColumns).map((k) => {
                  isCorrect = isCorrect && hashColumns[k];
               });

               // make sure there is no additional column in the data:
               // each of the columns returned need to exist in our columnNames
               existingColumns.forEach((col) => {
                  isCorrect = isCorrect && columnNames.indexOf(col) > -1;
               });
            }

            return isCorrect;
         })
         .catch((err) => {
            sails.log.error(
               `ABIndex.migrateCheckExists(): Table[${tableName}] Column[${columnNames.join(
                  ", "
               )}] Index[${indexName}] `,
               err
            );
            // throw err;
         });
   }

   migrateCreate(knex) {
      if (this.fields == null || !this.fields.length) return Promise.resolve();

      let indexName = this.indexName;
      let tableName = this.object.dbTableName();
      let columnNames = this.fields.map((f) => f.columnName);

      return (
         Promise.resolve()
            // Clear Index
            // .then(() => this.migrateDrop(knex))
            .then(() => this.migrateCheckIsCorrect(knex))
            .then((isCorrect) => {
               if (isCorrect) return;

               return knex.schema.alterTable(tableName, (table) => {
                  // Create new Unique to table
                  if (this.unique) {
                     // ALTER TABLE {tableName} ADD UNIQUE {indexName} ({columnNames})
                     // table.unique(columnNames, this.uniqueName);

                     sails.log(
                        `::: INDEX.UNIQUE Table[${tableName}] Column[${columnNames.join(
                           ", "
                        )}] Index[${indexName}] `
                     );
                     // Create Unique & Index
                     return knex.schema
                        .raw(
                           `ALTER TABLE ${tableName} ADD UNIQUE INDEX ${indexName}(${knex.client
                              .formatter()
                              .columnize(columnNames)})`
                        )
                        .catch((err) => {
                           sails.log.error(
                              `ABIndex.migrateCreate() Unique: Table[${tableName}] Column[${columnNames.join(
                                 ", "
                              )}] Index[${indexName}] `,
                              err
                           );
                           // throw err;
                        });
                  }
                  // Create new Index
                  else {
                     sails.log(
                        `::: INDEX Table[${tableName}] Column[${columnNames.join(
                           ", "
                        )}] Index[${indexName}] `
                     );
                     // ALTER TABLE {tableName} ADD INDEX {indexName} ({columnNames})
                     return table.index(columnNames, indexName).catch((err) => {
                        sails.log.error(
                           `ABIndex.migrateCreate(): INDEX : Table[${tableName}] Column[${columnNames.join(
                              ", "
                           )}] Index[${indexName}] `,
                           err
                        );
                        // throw err;
                     });
                  }
               });
            })
      );
   }

   migrateDrop(knex) {
      if (this.fields == null || !this.fields.length) return Promise.resolve();

      let indexName = this.indexName;
      let tableName = this.object.dbTableName();
      // let columnNames = this.fields.map((f) => f.columnName);

      return new Promise((resolve, reject) => {
         knex.schema
            .raw(`ALTER TABLE ${tableName} DROP INDEX \`${indexName}\``)
            .then(() => resolve())
            .catch((err) => {
               // Not exists
               if (err.code == "ER_CANT_DROP_FIELD_OR_KEY") return resolve();

               reject(err);
            });
      });

      // return new Promise((resolve, reject) => {
      //    knex.schema
      //       .table(tableName, (table) => {
      //          // Drop Unique
      //          if (this.unique) {
      //             table.dropUnique(columnNames, this.uniqueName);
      //          }

      //          // Drop Index
      //          table.dropIndex(columnNames, indexName);
      //       })
      //       .catch((err) => {
      //          console.error(err);
      //          resolve();
      //       })
      //       .then(() => resolve());
      // });
   }
};
