

import ABApplication from "./ABApplication"
import ABObjectBase from "./ABObjectBase"


function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

export default class ABMobileApp  {

    constructor(attributes, application) {
    	// super(attributes, application);
/*
{
	id: uuid(),
	name: 'name',
	labelFormat: 'xxxxx',
	isImported: 1/0,
	isExternal: 1/0,
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
		this.id = attributes.id;
		this.settings = attributes.settings;

		this.translations = attributes.translations;


    	// multilingual fields: label, description
    	OP.Multilingual.translate(this, this, ['label']);

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


	/// ABApplication data methods


	/**
	 * @method destroy()
	 *
	 * destroy the current instance of ABObject
	 *
	 * also remove it from our parent application
	 *
	 * @return {Promise}
	 */
	destroy () {
		// remove us from the application storage
		return this.application.mobileAppDestroy(this);
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

		return this.application.objectSave(this)
		.then(() => {

			resolve(this);

		})
		.catch(function(err){
			reject(err);
		})
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

		return {
			id:this.id,
			settings:this.settings,
			translations: this.translations 
		};
	}


}
