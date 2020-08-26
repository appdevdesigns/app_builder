const ABFieldCombineCore = require("../../core/dataFields/ABFieldCombineCore");

const MAX_VALUE_LENGTH = 535;
const DELIMITERS = {
   plus: "+",
   dash: "-",
   period: ".",
   space: " "
};

module.exports = class ABFieldCombine extends ABFieldCombineCore {
   constructor(values, object) {
      super(values, object);
   }

   ///
   /// DB Migrations
   ///

   /**
    * @function migrateCreate
    * perform the necessary sql actions to ADD this column to the DB table.
    * @param {knex} knex the Knex connection.
    * @return {Promise}
    */
   migrateCreate(knex) {
      let tableName = this.object.dbTableName();

      let combinedFieldIds = (this.settings.combinedFields || "").split(",");
      let columnNames = [];
      (combinedFieldIds || []).forEach((fId) => {
         let field = this.object.fields((f) => f.id == fId)[0];
         if (!field) return;

         columnNames.push(field.columnName);
      });

      let sqlUpdateCommand = `SET @new_value = CONCAT(${columnNames
         .map((colName) => `COALESCE(NEW.\`${colName}\`, '')`)
         .join(`, '${DELIMITERS[this.settings.delimiter]}', `)}),
         NEW.\`${
            this.columnName
         }\` = IF(@new_value = "" OR @new_value IS NULL, NULL, @new_value);`;

      return (
         Promise.resolve()
            .then(
               () =>
                  new Promise((next, bad) => {
                     // if this column doesn't already exist (you never know)
                     knex.schema
                        .hasColumn(tableName, this.columnName)
                        .then((exists) => {
                           return knex.schema
                              .table(tableName, (t) => {
                                 if (exists) return next();

                                 // Create a new column here.
                                 t.specificType(
                                    this.columnName,
                                    `VARCHAR(${MAX_VALUE_LENGTH}) NULL`
                                 );
                              })
                              .then(() => {
                                 next();
                              })
                              .catch(bad);
                        });
                  })
            )
            // Create TRIGGER when INSERT
            .then(
               () =>
                  new Promise((next, bad) => {
                     if (!columnNames || !columnNames.length) return next();

                     knex
                        .raw(
                           `CREATE TRIGGER \`${this.createTriggerName}\`
                           BEFORE INSERT ON \`${tableName}\` FOR EACH ROW
                           ${sqlUpdateCommand}`
                        )
                        .then(() => {
                           next();
                        })
                        .catch((error) => {
                           if (error.code == "ER_TRG_ALREADY_EXISTS") {
                              next();
                           } else {
                              bad(error);
                           }
                        });
                  })
            )
            // Create TRIGGER when UPDATE
            .then(
               () =>
                  new Promise((next, bad) => {
                     if (!columnNames || !columnNames.length) return next();

                     knex
                        .raw(
                           `CREATE TRIGGER \`${this.updateTriggerName}\`
                           BEFORE UPDATE ON \`${tableName}\` FOR EACH ROW
                           ${sqlUpdateCommand}`
                        )
                        .then(() => {
                           next();
                        })
                        .catch((error) => {
                           if (error.code == "ER_TRG_ALREADY_EXISTS") {
                              next();
                           } else {
                              bad(error);
                           }
                        });
                  })
            )
            // Update this index value to old records
            .then(
               () =>
                  new Promise((next, bad) => {
                     knex
                        .raw(
                           `UPDATE ${tableName} SET \`${this.columnName}\` = \`${this.columnName}\`
                           WHERE \`${this.columnName}\` IS NULL;`
                        )
                        .then(() => {
                           next();
                        })
                        .catch((error) => {
                           if (error.code == "ER_DUP_ENTRY") next();
                           else bad(error);
                        });
                  })
            )
      );
   }

   /**
    * @function migrateUpdate
    * perform the necessary sql actions to MODIFY this column to the DB table.
    * @param {knex} knex the Knex connection.
    */
   migrateUpdate(knex) {
      // This field type does not update
      return Promise.resolve();
   }

   /**
    * @function migrateDrop
    * perform the necessary sql actions to drop this column from the DB table.
    * @param {knex} knex the Knex connection.
    */
   migrateDrop(knex) {
      // validate this index is being FK
      let linkFields = this.object.fields(
         (f) =>
            f.key == "connectObject" &&
            f.settings &&
            (f.settings.indexField == this.id ||
               f.settings.indexField2 == this.id)
      );
      if (linkFields && linkFields.length) {
         let errMessage = `Could not delete this field because it is index of ${linkFields
            .map((f) => f.label)
            .join(", ")}`;
         return Promise.reject(new Error(errMessage));
      }

      return Promise.resolve()
         .then(
            () =>
               new Promise((next, bad) => {
                  knex
                     .raw(`DROP TRIGGER IF EXISTS ${this.createTriggerName}`)
                     .then(() => {
                        next();
                     })
                     .catch(bad);
               })
         )
         .then(
            () =>
               new Promise((next, bad) => {
                  knex
                     .raw(`DROP TRIGGER IF EXISTS ${this.updateTriggerName}`)
                     .then(() => {
                        next();
                     })
                     .catch(bad);
               })
         )
         .then(() => super.migrateDrop(knex));
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
         // Set json schema type to validate
         // obj[this.columnName] = { type:'string' }
         obj[this.columnName] = { type: "null" };
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

      // Remove every values
      if (myParameter && myParameter[this.columnName] != null)
         delete myParameter[this.columnName];

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

   get safeTableName() {
      return (this.object.dbTableName() || "")
         .replace(/ /g, "")
         .substring(0, 15);
   }

   get safeColumnName() {
      return (this.columnName || "").replace(/ /g, "").substring(0, 15);
   }

   get createTriggerName() {
      return `${this.safeTableName}_${this.safeColumnName}_create`;
   }

   get updateTriggerName() {
      return `${this.safeTableName}_${this.safeColumnName}_update`;
   }
};

