/*
 * ABFieldNumber
 *
 * An ABFieldNumber defines a Number field type.
 *
 */
var _ = require('lodash');
var path = require('path');
var ABField = require(path.join(__dirname, "ABField.js"));

function L(key, altText) {
	return altText;  // AD.lang.label.getLabel(key) || altText;
}



var ABFieldNumberDefaults = {
	key: 'number', // unique key to reference this specific DataField
	icon: 'hashtag',   // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'		

	// menuName: what gets displayed in the Editor drop list
	menuName: L('ab.dataField.number.menuName', '*Number'),

	// description: what gets displayed in the Editor description.
	description: L('ab.dataField.number.description', '*A Float or Integer Value'),

	// what types of Sails ORM attributes can be imported into this data type?
	// http://sailsjs.org/documentation/concepts/models-and-orm/attributes#?attribute-options
	compatibleOrmTypes: ['integer', 'float'],


	// what types of MySql column types can be imported into this data type?
	// https://www.techonthenet.com/mysql/datatypes.php
	compatibleMysqlTypes: ['tinyint', 'smallint', 'mediumint', 'int', 'integer', 'bigint', 'decimal', 'dec', 'numeric', 'fixed', 'float', 'real']

}



var formatList = [
	{ id: 'none', value: L('ab.common.none', "*None") },
	{ id: 'dollar', value: L('ab.dataField.number.format.dollar', "$"), sign: "$", position: "prefix" },
	{ id: 'pound', value: L('ab.dataField.number.format.pound', "£"), sign: "£", position: "prefix" },
	{ id: 'euroBefore', value: L('ab.dataField.number.format.euroBefore', "€ (before)"), sign: "€", position: "prefix" },
	{ id: 'euroAfter', value: L('ab.dataField.number.format.euroAfter', "€ (after)"), sign: "€", position: "postfix" },
	{ id: 'percent', value: L('ab.dataField.number.format.percent', "%"), sign: "%", position: "postfix" },
];

var defaultValues = {
	// 'allowRequired': 0,
	'default': '',
	'typeFormat': 'none',
	'typeDecimals': 'none',
	'typeDecimalPlaces': 'none',
	'typeRounding': 'none',
	'typeThousands': 'none',
	'validation': 0,
	'validateMinimum': '',
	'validateMaximum': ''
}


class ABFieldNumber extends ABField {

	constructor(values, object) {
		super(values, object, ABFieldNumberDefaults);

    	/*
    	{
			settings: {
				'allowRequired':0,
				'default':null,
				'typeFormat': 'none',
				'typeDecimals': 'none',
				'typeDecimalPlaces': 'none',
				'typeRounding' : 'none',
				'typeThousands': 'none',
				'validation':0,
				'validateMinimum':null,
				'validateMaximum':null
			}
    	}
    	*/

		// we're responsible for setting up our specific settings:
		for (var dv in defaultValues) {
			this.settings[dv] = values.settings[dv] || defaultValues[dv];
		}


		// text to Int:
		// this.settings.allowRequired = parseInt(this.settings.allowRequired);
		this.settings.validation = parseInt(this.settings.validation);

	}


	// return the default values for this DataField
	static defaults() {
		return ABFieldNumberDefaults;
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
				var defaultTo = parseInt(this.settings.default) || 0;


				// if this column doesn't already exist (you never know)
				knex.schema.hasColumn(tableName, this.columnName)
					.then((exists) => {

						return knex.schema.table(tableName, (t) => {

							var currCol;

							// if this is an integer:
							if (this.settings.typeDecimals == 'none') {

								currCol = t.integer(this.columnName);

							} else {

								var scale = parseInt(this.settings.typeDecimalPlaces);
								var precision = scale + 8;

								currCol = t.decimal(this.columnName, precision, scale);

							}

							// field is required (not null)
							if (this.settings.required) {
								currCol.notNullable();
							}
							else {
								currCol.nullable();
							}

							// set default value
							currCol.defaultTo(defaultTo);
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
							.catch(reject);
					})

			}
		)

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


			// if this is an integer:
			if (this.settings.typeDecimals == 'none') {

				obj[this.columnName] = {
					anyOf: [
						{ "type": "integer" },
						{ "type": "null" },
						{
							// allow empty string because it could not put empty array in REST api
							"type": "string",
							"maxLength": 0
						}
					]
				};

			} else {

				obj[this.columnName] = {
					anyOf: [
						{ "type": "number" },
						{ "type": "null" },
						{
							// allow empty string because it could not put empty array in REST api
							"type": "string",
							"maxLength": 0
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
				if (this.settings.typeDecimals == 'none') {

					myParameter[this.columnName] = parseInt(myParameter[this.columnName]);

				} else {
					var places = parseInt(this.settings.typeDecimalPlaces) || 2;
					myParameter[this.columnName] = parseFloat(parseFloat(myParameter[this.columnName]).toFixed(places));
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
			if ((value || value == 0) && // not be null, undefined or empty string
				(_.isNaN(value) || !_.isNumber(value))) {

				errors.push({
					name: this.columnName,
					message: 'Number Required',
					value: value
				})

			}
		}

		return errors;
	}

}



module.exports = ABFieldNumber;
