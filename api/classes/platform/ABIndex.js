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

      return new Promise((resolve, reject) => {
         knex.schema
            .table(tableName, function(table) {
               // Create new Index
               table.index(columnNames, indexName);
            })
            .catch(reject)
            .then(() => resolve());
      });
   }

   migrateDrop(knex) {
      if (this.fields == null || !this.fields.length) return Promise.resolve();

      let indexName = this.indexName;
      let tableName = this.object.dbTableName();
      let columnNames = this.fields.map((f) => f.columnName);

      return new Promise((resolve, reject) => {
         knex.schema
            .table(tableName, function(table) {
               // Drop Index
               table.dropIndex(columnNames, indexName);
            })
            .catch(reject)
            .then(() => resolve());
      });
   }
};
