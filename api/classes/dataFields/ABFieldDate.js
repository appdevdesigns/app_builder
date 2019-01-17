/*
 * ABFieldDate
 *
 * An ABFieldDate defines a Date field type.
 *
 */
var path = require('path');
var ABField = require(path.join(__dirname, "ABField.js"));
var moment = require('moment');

function L(key, altText) {
	return altText;  // AD.lang.label.getLabel(key) || altText;
}


var ABFieldDateDefaults = {
	key: 'date', // unique key to reference this specific DataField
	icon: 'calendar',   // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'		

	// menuName: what gets displayed in the Editor drop list
	menuName: L('ab.dataField.date.menuName', '*Date'),

	// description: what gets displayed in the Editor description.
	description: '',
	
	// what types of Sails ORM attributes can be imported into this data type?
	// http://sailsjs.org/documentation/concepts/models-and-orm/attributes#?attribute-options
	compatibleOrmTypes: ['date', 'datetime'],


	// what types of MySql column types can be imported into this data type?
	// https://www.techonthenet.com/mysql/datatypes.php
	compatibleMysqlTypes: ['date', 'datetime']

}

var defaultValues = {
	includeTime: 0,
	defaultCurrentDate: 0,
	default: "",
	dayFormat: "%d",
	dayOrder: 1,
	dayDelimiter: "slash",
	monthFormat: "%m",
	monthOrder: 2,
	monthDelimiter: "slash",
	yearFormat: "%Y",
	yearOrder: 3,
	yearDelimiter: "slash",

	hourFormat: '%h',
	periodFormat: 'none',
	timeDelimiter: 'colon',

	validateCondition: "none",
	validateRangeUnit: "days",
	validateRangeBefore: 0,
	validateRangeAfter: 0,
	validateStartDate: null,
	validateEndDate: null
}


class ABFieldDate extends ABField {

    constructor(values, object) {
		super(values, object, ABFieldDateDefaults);


    	/*
    	{
			settings: {
				textDefault: 'string',
				supportMultilingual: true/false
			}
    	}
    	*/

		// we're responsible for setting up our specific settings:
		for (var dv in defaultValues) {
			this.settings[dv] = values.settings[dv] || defaultValues[dv];
		}

		// text to Int:
		this.settings.includeTime = parseInt(this.settings.includeTime);
		this.settings.defaultCurrentDate = parseInt(this.settings.defaultCurrentDate);
		this.settings.dayOrder = parseInt(this.settings.dayOrder);
		this.settings.monthOrder = parseInt(this.settings.monthOrder);
		this.settings.yearOrder = parseInt(this.settings.yearOrder);


	}


	// return the default values for this DataField
	static defaults() {
		return ABFieldDateDefaults;
	}



	/*
	 * @function propertiesComponent
	 *
	 * return a UI Component that contains the property definitions for this Field.
	 *
	 * @param {App} App the UI App instance passed around the Components.
	 * @return {Component}
	 */
	// static propertiesComponent(App) {
	// 	return ABFieldDateComponent.component(App);
	// }



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


	/**
	 * @method toObj()
	 *
	 * properly compile the current state of this ABApplication instance
	 * into the values needed for saving to the DB.
	 *
	 * Most of the instance data is stored in .json field, so be sure to
	 * update that from all the current values of our child fields.
	 *
	 * @return {json}
	 */
	// toObj () {

	// 	var obj = super.toObj();

	// 	// obj.settings = this.settings;  // <--  super.toObj()

	// 	return obj;
	// }




	///
	/// DB Migrations
	///


	/**
	 * @function migrateCreate
	 * perform the necessary sql actions to ADD this column to the DB table.
	 * @param {knex} knex the Knex connection.
	 */
	migrateCreate(knex) {
		return new Promise(
			(resolve, reject) => {

				var tableName = this.object.dbTableName();

				// if this column doesn't already exist (you never know)
				knex.schema.hasColumn(tableName, this.columnName)
					.then((exists) => {

						return knex.schema.table(tableName, (t) => {

							var currCol;

							// Need to use date time type to support timezone
							currCol = t.dateTime(this.columnName);

							// // create a column that has date/time type
							// if (this.settings.includeTime == true) {

							// 	currCol = t.dateTime(this.columnName);

							// 	// create a column that has date type
							// } else {

							// 	currCol = t.date(this.columnName);
							// }

							// field is required (not null)
							if (this.settings.required) {
								currCol.notNullable();
							}
							else {
								currCol.nullable();
							}

							// set default value
							if (this.settings.default && moment(this.settings.default).isValid()) {
								var defaultDate = AppBuilder.rules.toSQLDateTime(this.settings.default);

								currCol.defaultTo(defaultDate);
							}
							else {
								currCol.defaultTo(null);
							}

							if (exists) {
								currCol.alter();
							}

						})
							.then(() => { resolve(); })
							.catch(reject);

					});

			}
		);
	}



	/**
	 * @function migrateUpdate
	 * perform the necessary sql actions to MODIFY this column to the DB table.
	 * @param {knex} knex the Knex connection.
	 */
	migrateUpdate (knex) {
		
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
						"type": "string",
						"pattern": AppBuilder.rules.SQLDateTimeRegExp 
					},
					{ "type": "null" },
					{
						// allow empty string because it could not put empty array in REST api
						"type": "string",
						"maxLength": 0
					}
				]
			}
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
				if (myParameter[this.columnName] == '') {

					//// TODO: 
					// for now, just don't return the date.  But in the future decide what to do based upon our 
					// settings:
					// if required -> return a default value? return null? 
					// if !required -> just don't return a value like now?
					delete myParameter[this.columnName];

				}
				// convert to SQL date format
				else if (moment(myParameter[this.columnName]).isValid()) {
					if (parseInt(this.settings.timeFormat) == 1) {
						myParameter[this.columnName] = AppBuilder.rules.toSQLDate(myParameter[this.columnName]);
					} else {
						myParameter[this.columnName] = AppBuilder.rules.toSQLDateTime(myParameter[this.columnName]);
					}
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
		if (!data)
			return data;

		if (this.settings.includeTime)
			return AppBuilder.rules.toSQLDateTime(data);
		else
			return AppBuilder.rules.toSQLDate(data);

	}



}



module.exports = ABFieldDate;