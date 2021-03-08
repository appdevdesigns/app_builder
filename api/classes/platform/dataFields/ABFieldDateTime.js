/*
 * ABFieldDateTime
 *
 * An ABFieldDateTime defines a Date & Time field type.
 *
 */
const path = require("path");
const moment = require("moment");

const ABFieldDateTimeCore = require(path.join(
   __dirname,
   "..",
   "..",
   "core",
   "dataFields",
   "ABFieldDateTimeCore.js"
));

module.exports = class ABFieldDateTime extends ABFieldDateTimeCore {
   constructor(values, object) {
      super(values, object);
   }

   ///
   /// Instance Methods
   ///

   isValid() {
      var errors = super.isValid();

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

                  // Need to use date time type to support timezone
                  currCol = t.dateTime(this.columnName);

                  // field is required (not null)
                  if (this.settings.required && this.settings.default) {
                     currCol.notNullable();
                  } else {
                     currCol.nullable();
                  }

                  // set default value
                  let defaultValue = this.getDefaultValue();
                  if (defaultValue) {
                     currCol.defaultTo(defaultValue);
                  } else {
                     currCol.defaultTo(null);
                  }

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
         //// NOTE: json-schema does not define 'date' or 'datetime' types.
         //// to validate these, we define type:'string' and checked against
         //// format:'date-time'
         // if null is allowed:
         obj[this.columnName] = {
            anyOf: [
               {
                  type: "string",
                  pattern: AppBuilder.rules.SQLDateTimeRegExp
               },
               { type: "null" },
               {
                  // allow empty string because it could not put empty array in REST api
                  type: "string",
                  maxLength: 0
               }
            ]
         };
         // else
         // obj[this.columnName] = { type:'string', format:'date-time' }
      }
   }

   /**
    * @method requestParam
    * return the entry in the given input that relates to this field.
    * @param {obj} allParameters  a key=>value hash of the inputs to parse.
    * @return {obj} or undefined
    */
   requestParam(allParameters) {
      let myParameter = super.requestParam(allParameters);
      if (!myParameter || !myParameter[this.columnName]) return;

      // Set current date
      if (myParameter[this.columnName] == "ab-current-date") {
         myParameter[this.columnName] = new Date();
      }

      // not a valid date.
      if (myParameter[this.columnName] == "") {
         //// TODO:
         // for now, just don't return the date.  But in the future decide what to do based upon our
         // settings:
         // if required -> return a default value? return null?
         if (this.settings.required) {
            let defaultValue = this.getDefaultValue();
            if (defaultValue) myParameter[this.columnName] = defaultValue;
            else delete myParameter[this.columnName];
         }
         // if !required -> just don't return a value like now?
         else {
            myParameter[this.columnName] = null;
         }
      }
      // convert to SQL date format
      else if (moment(myParameter[this.columnName]).isValid()) {
         myParameter[this.columnName] = AppBuilder.rules.toSQLDateTime(
            myParameter[this.columnName]
         );
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

   toSQLFormat(data) {
      // check null
      if (!data) return data;

      return AppBuilder.rules.toSQLDateTime(data);
   }

   getDefaultValue() {
      if (!this.settings.defaultDateValue && !this.settings.defaultTimeValue)
         return null;

      let result = moment().utc();

      // Date
      if (this.settings.defaultDateValue) {
         let defaultDate = moment(this.settings.defaultDateValue);
         if (defaultDate && defaultDate.isValid()) {
            defaultDate = defaultDate.utc(); // Convert to UTC

            // Set year, month, date
            result.year(defaultDate.year());
            result.month(defaultDate.month());
            result.date(defaultDate.date());
         }
      }

      // Time
      if (this.settings.defaultTimeValue) {
         let defaultTime = moment(this.settings.defaultTimeValue);
         if (defaultTime && defaultTime.isValid()) {
            defaultTime = defaultTime.utc(); // Convert to UTC

            // Set hour, minutes
            result.hour(defaultTime.hour());
            result.minute(defaultTime.minute());
         }
      }

      return AppBuilder.rules.toSQLDateTime(result);
   }
};
