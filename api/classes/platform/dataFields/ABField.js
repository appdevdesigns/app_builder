/*
 * ABField
 *
 * An ABField defines a single unique Field/Column in a ABObject.
 *
 */
var _ = require("lodash");
var path = require("path");

var ABFieldCore = require(path.join(
   __dirname,
   "..",
   "..",
   "core",
   "dataFields",
   "ABFieldCore.js"
));

function L(key, altText) {
   return altText; // AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABField extends ABFieldCore {
   constructor(values, object, fieldDefaults) {
      super(values, object, fieldDefaults);

      /*
  		{
  			id:'uuid',					// uuid value for this obj
  			key:'fieldKey',				// unique key for this Field
  			icon:'font',				// fa-[icon] reference for an icon for this Field Type
  			label:'',					// pulled from translation
			columnName:'column_name',	// a valid mysql table.column name
			isImported: 1/0,			// flag to mark is import from other object			
			settings: {					// unique settings for the type of field
				showIcon:true/false,	// only useful in Object Workspace DataTable
				isImported: 1/0,		// flag to mark is import from other object
				required: 1/0,			// field allows does not allow NULL or it does allow NULL 
				width: {int}			// width of display column

				// specific for dataField
			},
			translations:[]
  		}
		  */
   }

   ///
   /// DB Migrations
   ///

   dbPrefix() {
      var result;

      // add alias to be prefix
      if (this.alias) {
         result = "`{alias}`".replace("{alias}", this.alias);
      }
      // add database and table names to be prefix
      else {
         result = "`{databaseName}`.`{tableName}`"
            .replace("{databaseName}", this.object.dbSchemaName())
            .replace("{tableName}", this.object.dbTableName());
      }

      return result;
   }

   /**
    * @method exportIDs()
    * export any relevant .ids for the necessary operation of this application.
    * @param {array} ids
    *        the array of ids to store our relevant .ids into
    */
   exportIDs(ids) {
      ids.push(this.id);
   }

   /**
    * @function migrateCreate
    * perform the necessary sql actions to ADD this column to the DB table.
    * @param {knex} knex the Knex connection.
    */
   migrateCreate(knex) {
      sails.log.error(
         "!!! Field [" +
            this.fieldKey() +
            "] has not implemented migrateCreate()!!! "
      );
   }

   /**
    * @function migrateUpdate
    * perform the necessary sql actions to MODIFY this column to the DB table.
    * @param {knex} knex the Knex connection.
    */
   migrateUpdate(knex) {
      sails.log.error(
         "!!! Field [" +
            this.fieldKey() +
            "] has not implemented migrateUpdate()!!! "
      );

      return new Promise((resolve, reject) => {
         // skip to MODIFY exists column
         resolve();
      });
   }

   /**
    * @function migrateDrop
    * perform the necessary sql actions to drop this column from the DB table.
    * @param {knex} knex the Knex connection.
    */
   migrateDrop(knex) {
      sails.log.info("" + this.fieldKey() + ".migrateDrop() ");

      // if column name is empty, then .hasColumn function always returns true
      if (
         this.columnName == "" ||
         // if field is imported, then it will not remove column in table
         this.object.isImported ||
         this.object.isExternal ||
         this.isImported
      )
         return Promise.resolve();

      let tableName = this.object.dbTableName();

      return (
         Promise.resolve()

            // if the table exists:
            .then(() => {
               return new Promise((next, err) => {
                  knex.schema.hasTable(tableName).then((exists) => {
                     next(exists);
                  });
               });
            })

            // check column exists
            .then((isTableExists) => {
               if (!isTableExists) return Promise.resolve();

               return new Promise((next, err) => {
                  // get the .table editor and drop the column
                  knex.schema
                     .table(tableName, (t) => {
                        knex.schema
                           .hasColumn(tableName, this.columnName)
                           .then((exists) => {
                              next(exists);
                           })
                           .catch(err);
                     })
                     .catch(err);
               });
            })

            // drop foreign key of the column (if exists)
            .then(
               (isColumnExists) =>
                  new Promise((next, err) => {
                     if (!isColumnExists) return next();

                     knex.schema
                        .table(tableName, (t) => {
                           t.dropForeign(this.columnName);
                        })
                        .then(() => next(isColumnExists))
                        .catch((error) => next(isColumnExists));
                  })
            )

            // drop the column
            .then(
               (isColumnExists) =>
                  new Promise((next, err) => {
                     if (!isColumnExists) return next();

                     knex.schema
                        .table(tableName, (t) => {
                           t.dropColumn(this.columnName);
                        })
                        .then(next)
                        .catch((error) => {
                           if (
                              error.code == "ER_CANT_DROP_FIELD_OR_KEY" ||
                              error.code == "ER_DROP_INDEX_FK"
                           ) {
                              next();
                           } else {
                              err(error);
                           }
                        });
                  })
            )

            // Update queries who include the removed column
            .then(() => {
               return new Promise((next, err) => {
                  let tasks = [];

                  let queries = ABObjectCache.list(
                     (obj) =>
                        obj && obj.canFilterField && obj.canFilterField(this)
                  );
                  (queries || []).forEach((q) => {
                     // Remove the field from query
                     q._fields = q.fields((f) => {
                        return f && f.field && f.field.id != this.id;
                     });

                     // Update MySql view of the query
                     tasks.push(ABMigration.createQuery(q));
                  });

                  Promise.all(tasks)
                     // .catch(err)
                     .catch(() => next()) // ignore error of queries
                     .then(() => next());
               });
            })
      );
   }

   ///
   /// DB Model Services
   ///

   /**
    * @method jsonSchemaProperties
    * register your current field's properties here:
    */
   jsonSchemaProperties(obj) {
      sails.log.error(
         "!!! Field [" +
            this.fieldKey() +
            "] has not implemented jsonSchemaProperties()!!! "
      );
   }

   /**
    * @method requestParam
    * return the entry in the given input that relates to this field.
    * @param {obj} allParameters  a key=>value hash of the inputs to parse.
    * @return {obj} or undefined
    */
   requestParam(allParameters) {
      var myParameter;

      if (!_.isUndefined(allParameters[this.columnName])) {
         myParameter = {};
         myParameter[this.columnName] = allParameters[this.columnName];
      }

      return myParameter;
   }

   requestRelationParam(allParameters) {
      var myParameter;

      if (
         !_.isUndefined(allParameters[this.columnName]) &&
         this.key == "connectObject"
      ) {
         myParameter = {};
         myParameter[this.columnName] = allParameters[this.columnName];
      }

      return myParameter;
   }

   /**
    * @method isValidData
    * Parse through the given parameters and return an error if this field's
    * data seems invalid.
    * @param {obj} allParameters  a key=>value hash of the inputs to parse.
    * @return {array}
    */
   isValidData(allParameters) {
      var errors = [];
      sails.log.error(
         "!!! Field [" +
            this.fieldKey() +
            "] has not implemented .isValidData()!!!"
      );
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
         resolve();
      });
   }
};
