
// import OP from "OP"
import ABFieldManager from "./ABFieldManager"
import ABModel from "./ABModel"


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

export default class ABObject {

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

		if (typeof(attributes.objectWorkspace) != "undefined") {
			if (typeof(attributes.objectWorkspace.sortFields) == "undefined") attributes.objectWorkspace.sortFields = [];
			if (typeof(attributes.objectWorkspace.frozenColumnID) == "undefined") attributes.objectWorkspace.frozenColumnID = "";
			if (typeof(attributes.objectWorkspace.hiddenFields) == "undefined") attributes.objectWorkspace.hiddenFields = [];
		}

    	this.objectWorkspace = attributes.objectWorkspace || {
			sortFields:[], // array of columns with their sort configurations
			frozenColumnID:"", // id of column you want to stop freezing
    		hiddenFields:[], // array of [ids] to add hidden:true to
    	};

    	// multilingual fields: label, description
    	OP.Multilingual.translate(this, this, ['label']);


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

		var validator = OP.Validation.validator();


		// label/name must be unique:
		var isNameUnique = (this.application.objects((o) => { return o.name.toLowerCase() == this.name.toLowerCase(); }).length == 0);
		if (!isNameUnique) {
			validator.addError('name', L('ab.validation.object.name.unique', 'Object name must be unique (#name# already used in this Application)').replace('#name#', this.name) );
// errors = OP.Form.validationError({
// 		name:'name',
// 		message:L('ab.validation.object.name.unique', 'Object name must be unique (#name# already used in this Application)').replace('#name#', this.name),
// 	}, errors);
		}


			// Check the common validations:
// TODO:
// if (!inputValidator.validate(values.label)) {
// 	_logic.buttonSaveEnable();
// 	return false;
// }

		return validator;
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
		return new Promise(
			(resolve, reject) => {

				// OK, some of our Fields have special follow up actions that need to be
				// considered when they no longer exist, so before we simply drop this
				// object/table, drop each of our fields and give them a chance to clean up
				// what needs cleaning up.

				// ==> More work, but safer.
				var fieldDrops = [];
				this.fields().forEach((f)=>{
					fieldDrops.push(f.destroy());
				})

				Promise.all(fieldDrops)
				.then(()=>{

					// now drop our table
					// NOTE: our .migrateXXX() routines expect the object to currently exist
					// in the DB before we perform the DB operations.  So we need to
					// .migrateDrop()  before we actually .objectDestroy() this.
					this.migrateDrop()
					.then(()=>{

						// finally remove us from the application storage
						return this.application.objectDestroy(this);

					})
					.then(resolve)
					.catch(reject);

				})
				.catch(reject);

			}
		);
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

				var isAdd = false;

				// if this is our initial save()
				if (!this.id) {

					this.id = OP.Util.uuid();	// setup default .id
					this.label = this.label || this.name;
					this.urlPath = this.urlPath || this.application.name + '/' + this.name;
					isAdd = true;
				}

				this.application.objectSave(this)
				.then(() => {

					if (isAdd) {

						// on a Create: trigger a migrateCreate object
						this.migrateCreate()
						.then(()=>{
							resolve(this);
						}, reject);

					} else {
						resolve(this);
					}

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
	/// DB Migrations
	///

	migrateCreate() {
		var url = '/app_builder/migrate/application/#appID#/object/#objID#'
			.replace('#appID#', this.application.id)
			.replace('#objID#', this.id);

		return OP.Comm.Service.post({
			url: url
		})
	}


	migrateDrop() {
		var url = '/app_builder/migrate/application/#appID#/object/#objID#'
			.replace('#appID#', this.application.id)
			.replace('#objID#', this.id);

		return OP.Comm.Service['delete']({
			url: url
		})
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
		// NOTE: ABFieldManager returns the proper ABFieldXXXX instance.
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


	multilingualFields() {
		var fields = [];

		var found = this.fields(function(f){ return f.isMultilingual(); });
		found.forEach((f)=>{
			fields.push(f.columnName);
		})

		return fields;
	}


	///
	///	Object Workspace Settings
	///
	get workspaceSortFields() {
		return this.objectWorkspace.sortFields;
	}

	set workspaceSortFields( fields ) {
		this.objectWorkspace.sortFields = fields;
	}

	get workspaceFrozenColumnID() {
		return this.objectWorkspace.frozenColumnID;
	}

	set workspaceFrozenColumnID( id ) {
		this.objectWorkspace.frozenColumnID = id;
	}

	get workspaceHiddenFields() {
		return this.objectWorkspace.hiddenFields;
	}

	set workspaceHiddenFields( fields ) {
		this.objectWorkspace.hiddenFields = fields;
	}





	///
	/// Working with Client Components:
	///


	// return the column headers for this object
	// @param {bool} isObjectWorkspace  return the settings saved for the object workspace
	columnHeaders (isObjectWorkspace) {

		var headers = [];
		var idLookup = {};

		// get the header for each of our fields:
		this._fields.forEach(function(f){
			var header = f.columnHeader(isObjectWorkspace);
			headers.push(header);
			idLookup[header.id] = f.id;	// name => id
		})


		// update our headers with any settings applied in the Object Workspace
		if (isObjectWorkspace) {

			// set column width to adjust:true by default;
			headers.forEach((h) => { h.adjust = true; });

			// hide any hiddenfields
			if (this.workspaceHiddenFields.length > 0) {
				this.workspaceHiddenFields.forEach((hfID)=>{
					headers.forEach((h)=> {
						if (idLookup[h.id] == hfID){
							h.hidden = true;
						}
					})
				});
			}
		}

		return headers;
	}



	/**
	 * @method isValidData
	 * Parse through the given data and return an array of any invalid
	 * value errors.
	 * @param {obj} data a key=>value hash of the inputs to parse.
	 * @return {array} 
	 */
	isValidData(data) {
		var validator = OP.Validation.validator();
		this.fields().forEach((f) => {
			var p = f.isValidData(data, validator);
		})

		return validator;
	}


	///
	/// Working with data from server
	///

	/**
	 * @method model
	 * return a Model object that will allow you to interact with the data for
	 * this ABObject.
	 */
	model() {
		return new ABModel(this);
	}


}
