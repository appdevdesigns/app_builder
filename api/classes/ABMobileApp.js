
var path = require('path');
var _ = require('lodash');



module.exports = class ABMobileApp {

	constructor(attributes, application) {

		/*
		{
			id: uuid(),
			name: 'name',
			labelFormat: 'xxxxx',
			isImported: 1/0,
			tableName:'string',  // NOTE: store table name of import object to ignore async
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
		this.settings = attributes.settings || {};
		this.translations = attributes.translations || [];
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
	toObj() {

		// var result = super.toObj();
		var result ={
			id: this.id,
			settings: this.settings,
			translations: this.translations
		};

		/// include our additional objects and where settings:

		return result;
	}




	///
	///
	///

	emailInviteTrigger() {
		return 'appbuilder.mobileinvite.'+this.id;
	}


	deepLinkConfig(platform) {
		return this.settings.platforms[platform].deeplink;
	}

}