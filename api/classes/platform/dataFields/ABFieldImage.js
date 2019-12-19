/*
 * ABFieldImage
 *
 * An ABFieldImage defines a Image field type.
 *
 */
const path = require('path');
const ABFieldImageCore = require(path.join(__dirname, "..", "..", "core", "dataFields", "ABFieldImageCore.js"));

module.exports = class ABFieldImage extends ABFieldImageCore {

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
	 * @function migrateCreate
	 * perform the necessary sql actions to ADD this column to the DB table.
	 * @param {knex} knex the Knex connection.
	 */
	migrateCreate (knex) {
		return new Promise(
			(resolve, reject) => {

				var tableName = this.object.dbTableName();

				// check to make sure we don't already have this column:
				knex.schema.hasColumn(tableName, this.columnName)
				.then((exists) => {

					// create one if it doesn't exist:
					if (!exists) {

						return knex.schema.table(tableName, (t)=>{

								// field is required (not null)
								if (this.settings.required) {
									t.string(this.columnName).notNullable();
								}
								else {
									t.string(this.columnName).nullable();
								}

							})
							.then(resolve, reject);

					} else {

						// if the column already exists, nothing to do:
						resolve();
					}
				})

			}
		)

	}





	/**
	 * @function migrateDrop
	 * perform the necessary sql actions to drop this column from the DB table.
	 * @param {knex} knex the Knex connection.
	 */
	migrateDrop (knex) {
		return new Promise(
			(resolve, reject) => {
				
sails.log.error('!!! TODO: pay attention to the .removeExistingData setting !!!');
super.migrateDrop(knex)
.then(resolve)
.catch(reject);

// TODO: 
// implement the ability to remove the existing images referenced by this now-to-be-removed
// column from our shared OPImageUploader repository.
// this is a rough Pseudo Code of what should happen:

				// if (this.settings.removeExistingData) {

				// 	var model = this.object.model();
				// 	model.findAll()
				// 	.then(function(entries){

				// 		var allActions = [];
				// 		entries.forEach((e)=>{
				// 			allActions.push(OPImageUploader.remove( e[this.columnName] ) );
				// 		})

				// 		Promise.all(allActions)
				// 		.then(function(){
				// 			super.migrateDrop()
				// 			.then(resolve)
				// 			.catch(reject);

				// 		})
				// 	})

				// } else {

				// 		super.migrateDrop()
				// 		.then(resolve)
				// 		.catch(reject);

				// }

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
		// take a look here:  http://json-schema.org/example1.html

		// if our field is not already defined:
		if (!obj[this.columnName]) {

			// techincally we are only storing the uuid as a string.
			obj[this.columnName] = { type: ["null", "string"] }
			
		}
		
	}



};