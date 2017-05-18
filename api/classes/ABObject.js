
var path = require('path');

var ABFieldManager = require(path.join(__dirname, 'ABFieldManager'));


function toDC( data ) {
	return new webix.DataCollection({
		data: data,

		// on: {
		// 	onAfterDelete: function(id) {

		// 	}
		// }
	});
}

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABObject {

    constructor(attributes, application) {
/*
{
	id: uuid(),
	name: 'name',
	labelFormat: 'xxxxx',
	isImported: 1/0,
	urlPath:'string',
	importFromObject: 'string', // JSON Schema style reference:  '#[ABApplication.id]/objects/[ABObject.id]'
								// to get other object:  ABApplication.objectFromRef(obj.importFromObject);
	translations:[
		{}
	],
	fields:[
		{ABDataField}
	]
}
*/

    	// ABApplication Attributes
    	this.id    = attributes.id;
    	this.name  = attributes.name || "";
    	this.labelFormat = attributes.labelFormat || "";
    	this.isImported  = attributes.isImported  || 0;
    	this.urlPath	 = attributes.urlPath     || "";
    	this.importFromObject = attributes.importFromObject || "";
    	this.translations = attributes.translations;

    	this.objectWorkspace = attributes.objectWorkspace || {
    		hiddenFields:[], 	// array of [ids] to add hidden:true to
    	};


    	// multilingual fields: label, description
// OP.Multilingual.translate(this, this, ['label']);


	  	// import all our ABObjects
	  	var newFields = [];
	  	(attributes.fields || []).forEach((field) => {
	  		newFields.push( this.fieldNew(field) );
	  	})
	  	this._fields = newFields;


	  	// link me to my parent ABApplication
	  	this.application = application;
  	}



  	///
  	/// Static Methods
  	///
  	/// Available to the Class level object.  These methods are not dependent
  	/// on the instance values of the Application.
  	///



//// TODO: Refactor isValid() to ignore op and not error if duplicateName is own .id

	isValid() {

		var errors = null;


		// label/name must be unique:
		var isNameUnique = (this.application.objects((o) => { return o.name.toLowerCase() == this.name.toLowerCase(); }).length == 0);
		if (!isNameUnique) {
			errors = OP.Form.validationError({
					name:'name',
					message:L('ab.validation.object.name.unique', 'Object name must be unique (#name# already used in this Application)').replace('#name#', this.name),
				}, errors);
		}


			// Check the common validations:
// TODO:
// if (!inputValidator.validate(values.label)) {
// 	_logic.buttonSaveEnable();
// 	return false;
// }


		return errors;
	}



	///
	/// Instance Methods
	///


	/// ABApplication data methods


	/**
	 * @method destroy()
	 *
	 * destroy the current instance of ABApplication
	 *
	 * also remove it from our _AllApplications
	 *
	 * @return {Promise}
	 */
	destroy () {
		if (this.id) {
console.error('TODO: ABObject.destroy()');
			// return this.Model.destroy(this.id)
			// 	.then(()=>{
			// 		_AllApplications.remove(this.id);
			// 	});
		}
	}


	/**
	 * @method save()
	 *
	 * persist this instance of ABObject with it's parent ABApplication
	 *
	 *
	 * @return {Promise}
	 *						.resolve( {this} )
	 */
	save () {

		return new Promise(
			(resolve, reject) => {

				// if this is our initial save()
				if (!this.id) {

					this.id = OP.Util.uuid();	// setup default .id
					this.label = this.label || this.name;
					this.urlPath = this.urlPath || this.application.name + '/' + this.name;
				}

				this.application.objectSave(this)
				.then(() => {
					resolve(this);
				})
				.catch(function(err){
					reject(err);
				})
			}
		)
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
	toObj () {

		OP.Multilingual.unTranslate(this, this, ["label"]);

		// // for each Object: compile to json
		var currFields = [];
		this._fields.forEach((obj) => {
			currFields.push(obj.toObj())
		})


		return {
			id: 			this.id,
			name: 			this.name,
    		labelFormat: 	this.labelFormat,
    		isImported:  	this.isImported,
    		urlPath: 		this.urlPath,
    		importFromObject: this.importFromObject,
    		objectWorkspace:  this.objectWorkspace,
    		translations: 	this.translations,
    		fields: 	 	currFields
		}
	}






	///
	/// Fields
	///




	/**
	 * @method fields()
	 *
	 * return an array of all the ABFields for this ABObject.
	 *
	 * @return {array}
	 */
	fields (filter) {

		filter = filter || function() {return true; };

		return this._fields.filter(filter);
	}



	/**
	 * @method fieldNew()
	 *
	 * return an instance of a new (unsaved) ABField that is tied to this
	 * ABObject.
	 *
	 * NOTE: this new field is not included in our this.fields until a .save()
	 * is performed on the field.
	 *
	 * @return {ABField}
	 */
	fieldNew ( values ) {
		// NOTE: ABFieldManager.newField() returns the proper ABFieldXXXX instance.
		return ABFieldManager.newField( values, this );
	}



	/**
	 * @method fieldRemove()
	 *
	 * remove the given ABField from our ._fields array and persist the current
	 * values.
	 *
	 * @param {ABField} field The instance of the field to remove.
	 * @return {Promise}
	 */
	fieldRemove( field ) {
		this._fields = this.fields(function(o){ return o.id != field.id });

		return this.save();
	}



	/**
	 * @method fieldSave()
	 *
	 * save the given ABField in our ._fields array and persist the current
	 * values.
	 *
	 * @param {ABField} field The instance of the field to save.
	 * @return {Promise}
	 */
	fieldSave( field ) {
		var isIncluded = (this.fields(function(o){ return o.id == field.id }).length > 0);
		if (!isIncluded) {
			this._fields.push(field);
		}

		return this.save();
	}






	///
	/// Migration Services
	///

	dbTableName() {
		return AppBuilder.rules.toObjectNameFormat(this.application.dbApplicationName(), this.name);
	}


	/**
	 * migrateCreateTable
	 * verify that a table for this object exists.
	 * @param {Knex} knex the knex sql library manager for manipulating the DB.
	 * @return {Promise}
	 */
	migrateCreateTable(knex) {

		var tableName = this.dbTableName();
console.log('.... dbTableName:'+ tableName);
		return new Promise(
			(resolve, reject) => {

				knex.schema.hasTable(tableName).then((exists) => {
					
					// if it doesn't exist, then create it and any known fields:
					if (!exists) {
console.log('... creating!!!');
						return knex.schema.createTable(tableName, (t) => {
							t.increments('id').primary();
							t.timestamps();
							t.engine('InnoDB');
							t.charset('utf8');
							t.collate('utf8_unicode_ci');

							var fieldUpdates = [];
							this.fields().forEach((f)=>{

								fieldUpdates.push(f.migrateCreate(knex));

							})

							Promise.all(fieldUpdates)
							.then(resolve, reject);

						})
						// .then(function(){
						// 	resolve();
						// })
						// .catch(reject);

					} else {
console.log('... already there.');
						resolve();
					}
				});

			}
		)
	}


}
