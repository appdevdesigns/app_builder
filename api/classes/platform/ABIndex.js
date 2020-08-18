const ABIndexCore = require("../core/ABIndexCore");

module.exports = class ABIndex extends ABIndexCore {
   constructor(attributes, object) {
      super(attributes, object);
   }

   ///
   /// DB Migrations
   ///

   migrateCreate(knex) {
      if (this.fields == null || !this.fields.length) return Promise.resolve();

      let indexName = this.indexName;
      let tableName = this.object.dbTableName();
      let columnNames = this.fields.map((f) => f.columnName);

      return Promise.resolve()
         .then(() =>
            knex.schema.table(tableName, (table) => {
               // Create new Unique to table
               if (this.unique) {
                  table.unique(columnNames, this.uniqueName);
               }
               // Create new Index
               else {
                  table.index(columnNames, indexName);
               }
            })
         )
         .then(() =>
            // Create new index with Non_unique = 0
            knex.schema.raw(
               `ALTER TABLE ${tableName} ADD UNIQUE INDEX ${indexName}(${knex.client
                  .formatter()
                  .columnize(columnNames)})`
            )
         );
   }

   migrateDrop(knex) {
      if (this.fields == null || !this.fields.length) return Promise.resolve();

      let indexName = this.indexName;
      let tableName = this.object.dbTableName();
      let columnNames = this.fields.map((f) => f.columnName);

      return new Promise((resolve, reject) => {
         knex.schema
            .table(tableName, (table) => {
               // Drop Unique
               if (this.unique) {
                  table.dropUnique(columnNames, this.uniqueName);
               }

               // Drop Index
               table.dropIndex(columnNames, indexName);
            })
            .catch((err) => {
               console.error(err);
               resolve();
            })
            .then(() => resolve());
      });
   }
};
