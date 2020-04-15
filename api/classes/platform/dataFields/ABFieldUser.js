/*
 * ABFieldUser
 *
 * An ABFieldUser defines a user field type.
 *
 */
const path = require("path");
const ABFieldUserCore = require(path.join(
   __dirname,
   "..",
   "..",
   "core",
   "dataFields",
   "ABFieldUserCore.js"
));

module.exports = class ABFieldUser extends ABFieldUserCore {
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
            // create one if it doesn't exist:
            if (!exists) {
               return knex.schema
                  .table(tableName, (t) => {
                     var newCol = t.json(this.columnName).nullable();

                     // // field is required (not null)
                     // if (this.settings.required) {
                     // 	var newCol = t.json(this.columnName).notNullable();
                     // }
                     // else {
                     // 	var newCol = t.json(this.columnName).nullable();
                     // }
                  })
                  .then(() => {
                     resolve();
                  })
                  .catch(reject);
            } else {
               // there is already a column for this, so move along.
               resolve();
            }
         });
      });
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

   /**
    * @method postGet
    * Perform any final conditioning of data returned from our DB table before
    * it is returned to the client.
    * @param {obj} data  a json object representing the current table row
    */
   postGet(data) {
      return new Promise((resolve, reject) => {
         //Not doing anything here...yet
         resolve();
      });
   }
};
