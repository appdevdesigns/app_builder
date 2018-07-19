
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


	/**
	 * codePushKeys
	 * return the codePushKeys setting data.
	 * should look like:
	 * {
     *    ios:'ios.key.here',
     *    android:'android.key.here'
     * }
	 * @return {string}
	 */
	codePushKeys() {
		return this.settings.codePushKeys;
	}


	/**
	 * emailInviteTrigger
	 * Provide the EmailNotification trigger used for this MobileApp's 
	 * invitation email.
	 * @return {string}
	 */
	emailInviteTrigger() {
		return 'appbuilder.mobileinvite.'+this.id;
	}


	/**
	 * deepLinkConfig
	 * Provide the default deeplink configuration data for a given platform:
	 *   'ios' : provides the entry data into the .well-known/apple-app-site-association file
	 *   'android' : provides the entry data into the .well-known/assetlinks.json
	 * @return {obj}
	 */
	deepLinkConfig(platform) {
		return this.settings.platforms[platform].deeplink;
	}


	/**
	 * pathAPK
	 * return the path to the specific APK file to download. 
	 * if version is provided, then we will attempt to dl that version of the APK.
	 * if no version is provided, then the 'current' pointer will be used.
	 * @return {string}  path to the file.
	 */
	pathAPK(version) {
		version = version || 'current';  // default to 'current'

		if (version == 'current') {
			version = this.settings.platforms.android.apk.current;
		}

		// if not a valid version reference, return NULL
		if (!this.settings.platforms.android.apk[version]) {
			return null;
		}

		// else return the path/to/the/file
		var fileName = this.settings.platforms.android.apk[version];

		// [sails]/data/app_builder/[mobileID]/filename
		return path.join(sails.config.appPath, sails.config.appbuilder.pathFiles, this.id, fileName);
	}


	/**
	 * urlAPK
	 * return the url to use to access this MobileApp's current APK file.
	 * @return {string}  url to the file.
	 */
	urlAPK() {		
		return sails.config.appbuilder.baseURL+'/app_builder/mobile/::mobileID::/apk'.replace('::mobileID::', this.id);
	}

}