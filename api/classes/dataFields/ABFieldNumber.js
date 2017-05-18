/*
 * ABFieldNumber
 *
 * An ABFieldNumber defines a Number field type.
 *
 */
var path = require('path');
var ABField = require(path.join(__dirname, "ABField.js"));

function L(key, altText) {
	return altText;  // AD.lang.label.getLabel(key) || altText;
}



var ABFieldNumberDefaults = {
	key : 'number', // unique key to reference this specific DataField
	icon : 'slack',   // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'		
	
	// menuName: what gets displayed in the Editor drop list
	menuName : L('ab.dataField.number.menuName', '*Number'),
	
	// description: what gets displayed in the Editor description.
	description: L('ab.dataField.number.description', '*A Float or Integer Value')
}



var formatList = [
	{ id: 'none', value: L('ab.dataField.number.none', "*None") },
	{ id: 'dollar', value: L('ab.dataField.number.format.dollar', "$"), sign: "$", position: "prefix" },
	{ id: 'pound', value: L('ab.dataField.number.format.pound', "£"), sign: "£", position: "prefix" },
	{ id: 'euroBefore', value: L('ab.dataField.number.format.euroBefore', "€ (before)"), sign: "€", position: "prefix" },
	{ id: 'euroAfter', value: L('ab.dataField.number.format.euroAfter', "€ (after)"), sign: "€", position: "postfix" },
	{ id: 'percent', value: L('ab.dataField.number.format.percent', "%"), sign: "%", position: "postfix" },
];

var defaultValues = {
	'allowRequired':0,
	'numberDefault':'',
	'typeFormat': 'none',
	'typeDecimals': 'none',
	'typeDecimalPlaces': 'none',
	'typeRounding' : 'none',
	'typeThousands': 'none',
	'validation':0,
	'validateMinimum':'',
	'validateMaximum':''
}


class ABFieldNumber extends ABField {

    constructor(values, object) {
    	super(values, object, ABFieldNumberDefaults);

    	/*
    	{
			settings: {
				'allowRequired':0,
				'numberDefault':null,
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
    	this.settings.allowRequired = parseInt(this.settings.allowRequired);
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
	migrateCreate (knex) {
		return new Promise(
			(resolve, reject) => {

				var tableName = this.object.dbTableName();
				var defaultTo = parseInt(this.settings.numberDefault);


				// if this column doesn't already exist (you never know)
				knex.schema.hasColumn(tableName, this.columnName)
				.then((exists) => {

					// create one if it doesn't exist:
					if (!exists) {

						return knex.schema.table(tableName, (t)=>{

								// if this is an integer:
								if (this.settings.typeDecimals == 'none') {

									// not null
									if (this.settings.allowRequired) {
										t.integer(this.columnName).defaultTo(defaultTo).notNullable();
									} else {
										t.integer(this.columnName).defaultTo(defaultTo);
									}
									
								} else {

									var places = parseInt(this.settings.typeDecimalPlaces);
									if (this.settings.allowRequired) {
										t.decimal(this.columnName, places).defaultTo(defaultTo).notNullable();
									} else {
										t.decimal(this.columnName, places).defaultTo(defaultTo);
									}

								}
							})
							.then(()=>{
								resolve();
							})
							.catch(reject);

					} else {

						// there is already a column for this, so move along.
						resolve();
					}
				})

			}
		)

	}

}



module.exports =  ABFieldNumber;
