
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

	static isValid(op, values) {

			var errors = [];

			// during an ADD operation
			if (op == 'add') {

				// label/name must be unique:
				var matchingApps = _AllApplications.data.filter(function (app) { 
					return app.name.trim().toLowerCase() == values.label.trim().replace(/ /g, '_').toLowerCase(); 
				})
				if (matchingApps && matchingApps.length > 0) {
					
					errors.push({
						name:'label',
						mlKey:'duplicateName',
						defaultText: '**Name must be Unique.'
					})
				}

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
	 * persist the current instance of ABApplication to the DB
	 *
	 * Also, keep the values in _AllApplications up to date.
	 * 
	 * @return {Promise} 
	 */
	save () {
console.error('TODO: ABObject.save()')
		// var values = this.toObj();

		// // we already have an .id, so this must be an UPDATE
		// if (values.id) {

		// 	return this.Model.update(values.id, values)
		// 			.then(() => {
		// 				_AllApplications.updateItem(values.id, this);
		// 			});
				
		// } else {

		// 	// must be a CREATE:
		// 	return this.Model.create(values)
		// 			.then((data) => {
		// 				this.id = data.id;
		// 				_AllApplications.add(this, 0);
		// 			});
		// }
	
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


}
