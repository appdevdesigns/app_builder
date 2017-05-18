/*
 * ABFieldImage
 *
 * An ABFieldImage defines a Image field type.
 *
 */
var path = require('path');
var ABField = require(path.join(__dirname, "ABField.js"));

function L(key, altText) {
	return altText;  // AD.lang.label.getLabel(key) || altText;
}


var ABFieldImageDefaults = {
	key : 'image', // unique key to reference this specific DataField
	icon : 'file-image-o',   // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'		
	
	// menuName: what gets displayed in the Editor drop list
	menuName : L('ab.dataField.image.menuName', '*Image Attachment'),
	
	// description: what gets displayed in the Editor description.
	description: L('ab.dataField.image.description', '*Attach an image to this object.')
}


var defaultValues = {
	'useWidth':0,
	'imageWidth':'',
	'useHeight': 0,
	'imageHeight': '',
	'removeExistingData': 0
}


class ABFieldImage extends ABField {

    constructor(values, object) {
    	super(values, object, ABFieldImageDefaults);

    	/*
    	{
			settings: {
				'useWidth':0,
				'imageWidth':'',
				'useHeight': 0,
				'imageHeight': ''
			}
    	}
    	*/

    	// we're responsible for setting up our specific settings:
    	for (var dv in defaultValues) {
    		this.settings[dv] = values.settings[dv] || defaultValues[dv];
    	}


    	// text to Int:
    	this.settings.useWidth = parseInt(this.settings.useWidth);
    	this.settings.useHeight = parseInt(this.settings.useHeight);
    	this.settings.removeExistingData = parseInt(this.settings.removeExistingData);
  	}


  	// return the default values for this DataField
  	static defaults() {
  		return ABFieldImageDefaults;
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
								t.string(this.columnName).nullable();
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
	migrateDrop () {
		return new Promise(
			(resolve, reject) => {

super.migrateDrop()
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



}


module.exports = ABFieldImage;
