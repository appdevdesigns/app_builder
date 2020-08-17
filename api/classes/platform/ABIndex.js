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

      let result;

      // Create new Unique Index
      if (this.unique) {
         result = knex.schema.raw(
            `ALTER TABLE ${tableName} ADD UNIQUE INDEX ${indexName}(${knex.client
               .formatter()
               .columnize(columnNames)})`
         );
      }
      // Create new Index
      else {
         result = knex.schema.table(tableName, (table) => {
            table.index(columnNames, indexName);
         });
      }

      return result;
   }

   migrateDrop(knex) {
      if (this.fields == null || !this.fields.length) return Promise.resolve();

      let indexName = this.indexName;
      let tableName = this.object.dbTableName();
      let columnNames = this.fields.map((f) => f.columnName);

      return new Promise((resolve, reject) => {
         knex.schema
            .table(tableName, (table) => {
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
