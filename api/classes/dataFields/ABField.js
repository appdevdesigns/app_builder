/*
 * ABField
 *
 * An ABField defines a single unique Field/Column in a ABObject.
 *
 */
var _ = require('lodash');
var path = require('path');

var ABFieldBase = require(path.join(__dirname, "..", "..", "..", "assets", "opstools", "AppBuilder", "classes", "dataFields", "ABFieldBase.js"));

function L(key, altText) {
	return altText;  // AD.lang.label.getLabel(key) || altText;
}

module.exports =  class ABField extends ABFieldBase {

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

				// specific for dataField
			},
			translations:[]
  		}
  		*/

  	}



	///
	/// DB Migrations
	///


	/**
	 * @function migrateCreate
	 * perform the necessary sql actions to ADD this column to the DB table.
	 * @param {knex} knex the Knex connection.
	 */
	migrateCreate (knex) {
		sails.log.error('!!! Field ['+this.fieldKey()+'] has not implemented migrateCreate()!!! ');
	}


	/**
	 * @function migrateDrop
	 * perform the necessary sql actions to drop this column from the DB table.
	 * @param {knex} knex the Knex connection.
	 */
	migrateDrop (knex) {

		sails.log.info(''+this.fieldKey()+'.migrateDrop() ');
		return new Promise(
			(resolve, reject) => {

				// if column name is empty, then .hasColumn function always returns true
				if (this.columnName == '') return resolve();

				// if field is imported, then it will not remove column in table
				if (this.object.isImported || this.object.isExternal)
					return resolve();

				var tableName = this.object.dbTableName();

				// if the table exists:
				knex.schema.hasTable(tableName)
				.then((exists) => {
					if (exists) {
						
						// if this column exists
						knex.schema.hasColumn(tableName, this.columnName)
						.then((exists) => {

							if (exists) {

								// get the .table editor and drop the column
								knex.schema.table(tableName, (t)=>{
									t.dropColumn(this.columnName);
								})
								.then(resolve)
								.catch(reject);

							} else {

								// nothing to do then.
								resolve();
							}

						})
						.catch(reject);


					} else {
						resolve();
					}
				});

				

			}
		)
	}





	///
	/// DB Model Services
	///

	/**
	 * @method jsonSchemaProperties
	 * register your current field's properties here:
	 */
	jsonSchemaProperties(obj) {
		sails.log.error('!!! Field ['+this.fieldKey()+'] has not implemented jsonSchemaProperties()!!! ');
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
			myParameter[this.columnName] = allParameters[this.columnName]
		}

		return myParameter;
	}



	requestRelationParam(allParameters) {
		var myParameter;

		if (!_.isUndefined(allParameters[this.columnName]) && this.key == 'connectObject') {
			myParameter = {};
			myParameter[this.columnName] = allParameters[this.columnName]
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
		sails.log.error('!!! Field ['+this.fieldKey()+'] has not implemented .isValidData()!!!');
		return errors;
	}



	/**
	 * @method postGet
	 * Perform any final conditioning of data returned from our DB table before
	 * it is returned to the client.
	 * @param {obj} data  a json object representing the current table row
	 */
	postGet( data ) {
		return new Promise(
			(resolve, reject) => {
				resolve();
			}
		)
	}



}
