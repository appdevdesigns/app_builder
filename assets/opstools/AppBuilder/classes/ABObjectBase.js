
// import OP from "OP"
// var ABFieldManager = require( "./ABFieldManager.js")

// import ABModel from "./ABModel"



module.exports =  class ABObjectBase {

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



	///
	/// Instance Methods
	///


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
	// fieldNew ( values ) {
	// 	// NOTE: ABFieldManager returns the proper ABFieldXXXX instance.
	// 	return ABFieldManager.newField( values, this );
	// }



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




	/**
	 * @method defaultValues
	 * Collect a hash of key=>value pairs that represent the default values 
	 * from each of our fields.
	 * @param {obj} data a key=>value hash of the inputs to parse.
	 * @return {array} 
	 */
	defaultValues() {
		var values = {};
		this.fields().forEach((f) => {
			f.defaultValue(values);
		})

		return values;
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


}
