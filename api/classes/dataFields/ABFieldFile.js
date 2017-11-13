/*
 * ABFieldFile
 *
 * An ABFieldFile defines a string field type.
 *
 */
var path = require('path');
var ABField = require(path.join(__dirname, "ABField.js"));
var _ = require('lodash');
var async = require('async');



function L(key, altText) {
	return altText;  // AD.lang.label.getLabel(key) || altText;
}


var ABFieldFileDefaults = {
	key: 'file', // unique key to reference this specific DataField
	icon: 'font',   // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'		

	// menuName: what gets displayed in the Editor drop list
	menuName: L('ab.dataField.file.menuName', '*File Attachment'),

	// description: what gets displayed in the Editor description.
	description: L('ab.dataField.file.description', '*Attach a file to this object.')
}


var defaultValues = {
	'removeExistingData': 0,
	'fileSize': 0,
	'fileType': ""
}


class ABFieldFile extends ABField {

	constructor(values, object) {
		super(values, object, ABFieldFileDefaults);

    	// we're responsible for setting up our specific settings:
    	for (var dv in defaultValues) {
    		this.settings[dv] = values.settings[dv] || defaultValues[dv];
    	}


    	// text to Int:
    	this.settings.fileSize = parseInt(this.settings.fileSize);
    	this.settings.removeExistingData = parseInt(this.settings.removeExistingData);
	}


  	// return the default values for this DataField
  	static defaults() {
		return ABFieldFileDefaults;
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
	// 	return ABFieldFileComponent.component(App);
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


	/**
	 * @method requestParam
	 * return the entry in the given input that relates to this field.
	 * @param {obj} allParameters  a key=>value hash of the inputs to parse.
	 * @return {obj} or undefined
	 */
	// requestParam(allParameters) {

	// 	var myParameter = super.requestParam(allParameters);

	// 	// do your special convert data here.
	// 	// myParameter[this.columnName] = parseInt(myParameter[this.columnName]);

	// 	return myParameter;
	// }



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

			async.series([
			
				(next) => {
					// make sure there is a 'filename' json field 
					// included:
					knex.schema.hasColumn(tableName, 'filename')
					.then((exists) => {
						// create one if it doesn't exist:
						if (!exists) {
							knex.schema.table(tableName, (t) => {
								t.string('filename');
							})
							.then(() => {
								next();
							})
							.catch(next);
						} 
						else next();
					})
					.catch(next);
				},
				
				// create/alter the actual column
				(next) => {
					knex.schema.hasColumn(tableName, this.columnName)
					.then((exists) => {
						knex.schema.table(tableName, (t) => {
							t.string(this.columnName).nullable();
						})
						.then(() => {
							next();
						})
						.catch(next);
					})
					.catch(next);
				}
				
			], (err) => {
				if (err) reject(err);
				else resolve();
			});

			// 	// check to make sure we don't already have this column:
			// 	knex.schema.hasColumn(tableName, this.columnName)
			// 	.then((exists) => {

			// 		return knex.schema.table(tableName, (t)=>{
			// 				t.string(this.columnName).nullable();
			// 				if (exists) {
			// 					t.alter();
			// 				}
			// 			})
			// 			.then(() => { resolve(); })
			// 			.catch(reject);
			// 	})

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

		// if not already setup:
		if (!obj['filename']) {

			obj.filename = {
				type:'string'
			}

		}

		// // make sure our column is described in the 
		// if (!obj.filename.properties[this.columnName]) {
		// 	obj.filename.properties[this.columnName] = { type:'string', maxLength: 5000 }
		// }

		// if our field is not already defined:
		if (!obj[this.columnName]) {

			// techincally we are only storing the uuid as a string.
			obj[this.columnName] = { type:'string' }
			
		}
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

				// if we are a multilingual field, make sure the .filename data is
				// an object and not a string.
				//// NOTE: a properly formatted json data in the .translations 
				//// field should already be parsed as it is returned from 
				//// objection.js query().
					
				sails.log.verbose('fileName.postGet(): ---> ('+ data.fileName +'):');
				
				resolve();
			}
		)
	}

}

module.exports = ABFieldFile;
