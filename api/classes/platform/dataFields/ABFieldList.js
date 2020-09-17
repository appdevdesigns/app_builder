/*
 * ABFieldList
 *
 * An ABFieldList defines a List field type.
 *
 */
const path = require("path");
const ABFieldListCore = require(path.join(
   __dirname,
   "..",
   "..",
   "core",
   "dataFields",
   "ABFieldListCore.js"
));

module.exports = class ABFieldList extends ABFieldListCore {
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

   ///
   /// DB Migrations
   ///

   /**
    * @function migrateCreate
    * perform the necessary sql actions to ADD this column to the DB table.
    * @param {knex} knex the Knex connection.
    */
   migrateCreate(knex) {
      return new Promise((resolve, reject) => {
         var tableName = this.object.dbTableName();

         // if this column doesn't already exist (you never know)
         knex.schema.hasColumn(tableName, this.columnName).then((exists) => {
            return knex.schema
               .table(tableName, (t) => {
                  var currCol;

                  // multiple select list
                  if (this.settings.isMultiple == true) {
                     // field is required (not null)
                     // if (this.settings.required) {
                     // 	currCol = t.json(this.columnName).notNullable();
                     // }
                     // else {
                     currCol = t.json(this.columnName).nullable();
                     // }

                     // TODO: Set default to multiple select
                     // MySQL - BLOB and TEXT columns cannot have DEFAULT values.
                     // Error Code: 1101. BLOB, TEXT, GEOMETRY or JSON column 'Type' can't have a default value

                     // if (this.settings.multipleDefault && this.settings.multipleDefault.length > 0) {
                     // 	currCol.defaultTo(JSON.stringify(this.settings.multipleDefault));
                     // }
                  }
                  // single select list
                  else {
                     // Changed to string to fix issue where new items could not be added because type of field was ENUM and we do not support field modifications
                     // field is required (not null)
                     if (
                        this.settings.required &&
                        this.settings.default &&
                        this.settings.default != "none"
                     ) {
                        currCol = t.string(this.columnName).notNullable();
                     } else {
                        currCol = t.string(this.columnName).nullable();
                     }

                     if (
                        this.settings.default &&
                        this.settings.default != "none"
                     ) {
                        currCol.defaultTo(this.settings.default);
                     } else {
                        currCol.defaultTo(null);
                     }
                  }

                  // create one if it doesn't exist:
                  if (exists) {
                     currCol.alter();
                  }
               })
               .then(() => {
                  resolve();
               })
               .catch(reject);
         });
      });
   }

   /**
    * @function migrateUpdate
    * perform the necessary sql actions to MODIFY this column to the DB table.
    * @param {knex} knex the Knex connection.
    */
   migrateUpdate(knex) {
      return this.migrateCreate(knex);
   }

   /**
    * @function migrateDrop
    * perform the necessary sql actions to drop this column from the DB table.
    * @param {knex} knex the Knex connection.
    */
   // NOTE: ABField.migrateDrop() is pretty good for most cases.
   // migrateDrop (knex) {
   // 	return new Promise(
   // 		(resolve, reject) => {
   // 			// do your special drop operations here.
   // 		}
   // 	)
   // }

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
         if (this.settings.isMultiple == true) {
            // store array value of selectivity
            obj[this.columnName] = {
               anyOf: [
                  { type: "array" },
                  { type: "null" },
                  {
                     // allow empty string because it could not put empty array in REST api
                     type: "string",
                     maxLength: 0
                  }
               ]
            };
         } else {
            // storing the uuid as a string.
            obj[this.columnName] = {
               type: ["string", "null"]
            };
         }
      }
   }

   /**
    * @method requestParam
    * return the entry in the given input that relates to this field.
    * @param {obj} allParameters  a key=>value hash of the inputs to parse.
    * @return {obj} or undefined
    */
   requestParam(allParameters) {
      var myParameter;

      myParameter = super.requestParam(allParameters);

      // 'none' or '' (empty string) to null
      if (
         myParameter &&
         myParameter[this.columnName] != undefined &&
         (myParameter[this.columnName] == "" ||
            myParameter[this.columnName] == "none")
      ) {
         myParameter[this.columnName] = null;
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
};
