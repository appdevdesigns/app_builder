/*
 * ABFieldString
 *
 * An ABFieldString defines a string field type.
 *
 */
var path = require('path');
var ABField = require(path.join(__dirname, "ABField.js"));
var _ = require('lodash');
var async = require('async');



function L(key, altText) {
	return altText;  // AD.lang.label.getLabel(key) || altText;
}


var ABFieldStringDefaults = {
	key : 'string', // unique key to reference this specific DataField
	icon : 'font',   // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'		
	
	// menuName: what gets displayed in the Editor drop list
	menuName : L('ab.dataField.string.menuName', '*Single line text'),
	
	// description: what gets displayed in the Editor description.
	description: L('ab.dataField.string.description', '*short string value'),
	
	// what types of Sails ORM attributes can be imported into this data type?
	// http://sailsjs.org/documentation/concepts/models-and-orm/attributes#?attribute-options
	compatibleOrmTypes: ['string'],

	// what types of MySql column types can be imported into this data type?
	// https://www.techonthenet.com/mysql/datatypes.php
	compatibleMysqlTypes: ['char', 'varchar', 'tinytext']
}



class ABFieldString extends ABField {

    constructor(values, object) {
    	super(values, object, ABFieldStringDefaults);

    	/*
    	{
			settings: {
				textDefault: 'string',
				supportMultilingual: 1/0
			}
    	}
    	*/
    	
    	this.settings = values.settings || {};

    	// we're responsible for setting up our specific settings:
    	this.settings.textDefault = this.settings.textDefault || '';
    	this.settings.supportMultilingual = this.settings.supportMultilingual+"" || "1";

    	// text to Int:
    	this.settings.supportMultilingual = parseInt(this.settings.supportMultilingual);

  	}


  	// return the default values for this DataField
  	static defaults() {
  		return ABFieldStringDefaults;
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
  	// 	return ABFieldStringComponent.component(App);
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
	 * @return {Promise}
	 */
	migrateCreate (knex) {
		return new Promise((resolve, reject) => {
				
			var tableName = this.object.dbTableName();
			
			async.series([
				
				// if this is a multilingual field, then manage a json 
				// translation store:
				(next) => {
					if (this.settings.supportMultilingual) {
						// make sure there is a 'translations' json field 
						// included:
						knex.schema.hasColumn(tableName, 'translations')
						.then((exists) => {
							// create one if it doesn't exist:
							if (!exists) {
								knex.schema.table(tableName, (t)=>{
									t.json('translations');
								})
								.then(() => {
									next();
								})
								.catch(next);
							} 
							else next();
						})
						.catch(next);
					}
					else next();
				},
				
				// create the actual column
				(next) => {

					// [fix]: don't create a column for a multilingual field
					if (!this.settings.supportMultilingual) {

						knex.schema.hasColumn(tableName, this.columnName)
						.then((exists) => {
							knex.schema.table(tableName, (t) => {
								var currCol = t.string(this.columnName);

								// default value
								if (this.settings.textDefault)
									currCol.defaultTo(this.settings.textDefault);
								else
									currCol.defaultTo(null);

								// not nullable/nullable
								if (this.settings.required) 
									currCol.notNullable();
								else
									currCol.nullable();


								if (exists)
									currCol.alter();


							})
							.then(() => {
								next();
							})
							.catch(next);
						})
						.catch(next);

					} else {

						// just continue.
						next();
					}
				}
				
			], (err) => {
				if (err) reject(err);
				else resolve();
			});
			
		});
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

		if (this.settings.supportMultilingual) {

			// make sure our translations  column is setup:

			// if not already setup:
			if (!obj['translations']) {

				obj.translations = {
					type:'array',
					items:{
						type:'object',
						properties:{
							language_code:{
								type:'string'
							}
						}
					}
				}

			}

			// make sure our column is described in the 
			if (!obj.translations.items.properties[this.columnName]) {
				obj.translations.items.properties[this.columnName] = { type:'string' }
			}

		} else {

			// we're not multilingual, so just tack this one on:
			if (!obj[this.columnName]) {
				obj[this.columnName] = { type:'string' }
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

		// if we are a multilingual field, make sure the .translations data is
		// returned:
		if (this.settings.supportMultilingual) {

			if (allParameters.translations) {
				myParameter = {};
				myParameter.translations = allParameters.translations
			}
			
		} else {
			myParameter = super.requestParam(allParameters);
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


	/*
	 * @property isMultilingual
	 * does this field represent multilingual data?
	 * @return {bool}
	 */
	get isMultilingual() {
		return this.settings.supportMultilingual == 1;
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

				// if we are a multilingual field, make sure the .translations data is
				// an object and not a string.
				//// NOTE: a properly formatted json data in the .translations 
				//// field should already be parsed as it is returned from 
				//// objection.js query().
				if (this.settings.supportMultilingual) {
					
					sails.log.verbose('ABFieldString.postGet(): ---> _.isString('+ data.translations +'):');	
					if (_.isString(data.translations)) {

						sails.log.verbose('ABFieldString.postGet(): ---> JSON.parse()');
						data.translations = JSON.parse(data.translations);
					}
				}

				resolve();
			}
		)
	}

}



module.exports = ABFieldString;
