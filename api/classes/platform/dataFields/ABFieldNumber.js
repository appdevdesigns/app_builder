/*
 * ABFieldNumber
 *
 * An ABFieldNumber defines a Number field type.
 *
 */
const _ = require("lodash");
const path = require("path");
const ABFieldNumberCore = require(path.join(
   __dirname,
   "..",
   "..",
   "core",
   "dataFields",
   "ABFieldNumberCore.js"
));

module.exports = class ABFieldNumber extends ABFieldNumberCore {
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

                  // if this is an integer:
                  if (this.settings.typeDecimals == "none") {
                     currCol = t.integer(this.columnName);
                  } else {
                     var scale = parseInt(this.settings.typeDecimalPlaces);
                     var precision = scale + 8;

                     currCol = t.decimal(this.columnName, precision, scale);
                  }

                  // field is required (not null)
                  if (
                     this.settings.required &&
                     this.settings.default != null &&
                     this.settings.default != ""
                  ) {
                     currCol.notNullable();
                  } else {
                     currCol.nullable();
                  }

                  // set default value
                  if (
                     this.settings.default != null &&
                     this.settings.default != ""
                  ) {
                     let defaultTo = parseInt(this.settings.default) || 0;
                     currCol.defaultTo(defaultTo);
                  }
                  // if (defaultTo != null) {
                  // 	currCol.defaultTo(defaultTo);
                  // }
                  // else {
                  // 	currCol.defaultTo(null);
                  // }

                  // field is unique
                  if (this.settings.unique) {
                     currCol.unique();
                  }
                  // NOTE: Wait for dropUniqueIfExists() https://github.com/tgriesser/knex/issues/2167
                  // else {
                  // 	t.dropUnique(this.columnName);
                  // }

                  if (exists) {
                     currCol.alter();
                  }
               })
               .then(() => {
                  resolve();
               })
               .catch((err) => {
                  // Skip duplicate unique key
                  if (err.code == "ER_DUP_KEYNAME") resolve();
                  else reject(err);
               });
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
         // if this is an integer:
         if (this.settings.typeDecimals == "none") {
            obj[this.columnName] = {
               anyOf: [
                  { type: "integer" },
                  { type: "null" },
                  {
                     // allow empty string because it could not put empty array in REST api
                     type: "string",
                     maxLength: 0
                  }
               ]
            };
         } else {
            obj[this.columnName] = {
               anyOf: [
                  { type: "number" },
                  { type: "null" },
                  {
                     // allow empty string because it could not put empty array in REST api
                     type: "string",
                     maxLength: 0
                  }
               ]
            };
         }

         //// TODO: insert validation values here.
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
      if (myParameter) {
         if (!_.isUndefined(myParameter[this.columnName])) {
            // if this is an integer:
            if (this.settings.typeDecimals == "none") {
               myParameter[this.columnName] = parseInt(
                  myParameter[this.columnName]
               );
            } else {
               var places = parseInt(this.settings.typeDecimalPlaces) || 2;
               myParameter[this.columnName] = parseFloat(
                  parseFloat(myParameter[this.columnName]).toFixed(places)
               );
            }

            if (isNaN(myParameter[this.columnName]))
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

      if (allParameters[this.columnName] != null) {
         var value = allParameters[this.columnName];
         if (
            (value || value == 0) && // not be null, undefined or empty string
            (_.isNaN(value) || !_.isNumber(value))
         ) {
            errors.push({
               name: this.columnName,
               message: "Number Required",
               value: value
            });
         }
      }

      return errors;
   }
};
