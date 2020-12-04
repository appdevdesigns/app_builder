/*
 * ABFieldDate
 *
 * An ABFieldDate defines a Date field type.
 *
 */
const path = require("path");
const moment = require("moment");

const ABFieldDateCore = require(path.join(
   __dirname,
   "..",
   "..",
   "core",
   "dataFields",
   "ABFieldDateCore.js"
));

module.exports = class ABFieldDate extends ABFieldDateCore {
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

                  // Need to use date time type to support timezone
                  currCol = t.date(this.columnName);

                  // field is required (not null)
                  if (this.settings.required && this.settings.default) {
                     currCol.notNullable();
                  } else {
                     currCol.nullable();
                  }

                  // set default value
                  if (
                     this.settings.default &&
                     moment(this.settings.default).isValid()
                  ) {
                     var defaultDate = AppBuilder.rules.toSQLDate(
                        this.settings.default
                     );

                     currCol.defaultTo(defaultDate);
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
         //// NOTE: json-schema does not define 'date' or 'datetime' types.
         //// to validate these, we define type:'string' and checked against
         //// format:'date-time'
         // if null is allowed:
         obj[this.columnName] = {
            anyOf: [
               {
                  type: "string",
                  pattern: AppBuilder.rules.SQLDateRegExp
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
      var myParameter = super.requestParam(allParameters);
      if (myParameter) {
         if (!_.isUndefined(myParameter[this.columnName])) {
            // not a valid date.
            if (myParameter[this.columnName] == "") {
               //// TODO:
               // for now, just don't return the date.  But in the future decide what to do based upon our
               // settings:
               // if required -> return a default value? return null?
               if (this.settings.required) {
                  if (this.settings.defaultDateValue)
                     myParameter[this.columnName] = new Date(
                        this.settings.defaultDateValue
                     );
                  else delete myParameter[this.columnName];
               }
               // if !required -> just don't return a value like now?
               else {
                  myParameter[this.columnName] = null;
               }
            }
            // convert to SQL date format
            else if (moment(myParameter[this.columnName]).isValid()) {
               myParameter[this.columnName] = AppBuilder.rules.toSQLDate(
                  myParameter[this.columnName]
               );
            }
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

   toSQLFormat(data) {
      // check null
      if (!data) return data;

      return AppBuilder.rules.toSQLDate(data);
   }

   dateToString(dateFormat, dateData) {
      return webix.Date.dateToStr(dateFormat)(dateData);
   }
};
