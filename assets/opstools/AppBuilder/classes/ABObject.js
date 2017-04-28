
import OP from "../OP/OP"

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


    	// multilingual fields: label, description
    	OP.Multilingual.translate(this, this, ['label']);

	  	
	  	// import all our ABObjects
	  	// var newFields = [];
	  	// (attributes.json.objects || []).forEach((obj) => {
	  	// 	newObjects.push( new ABObject(obj) );
	  	// })
	  	// this.fields = newFields;


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
		// var currObjects = [];
		// this.objects.forEach((obj) => {
		// 	currObjects.push(obj.toObj())
		// })
		// this.json.objects = currObjects;

		return {
			id: 			this.id,
			name: 			this.name,
    		labelFormat: 	this.labelFormat,
    		isImported:  	this.isImported,
    		urlPath: 		this.urlPath,
    		importFromObject: this.importFromObject,
    		translations: 	this.translations,
    		fields: 	 	[] 
		}
	}






	///
	/// Fields
	///




	/**
	 * @method fields()
	 *
	 * return a DataCollection of all the ABFields for this ABObject.
	 *
	 * @return {Promise} 	
	 */
	fields () {
		return new Promise( 
			(resolve, reject) => {


				resolve(toDC(this.feilds));

			}
		);
	}



	fieldNew ( values ) {
		// NOTE: ABFieldManager returns the proper ABFieldXXXX instance.
		return ABFieldManager.newField( values, this );
	}


}
