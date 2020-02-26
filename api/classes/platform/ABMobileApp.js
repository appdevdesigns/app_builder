
const path = require('path');

const ABMobileAppCore = require("../core/ABMobileAppCore");


module.exports = class ABMobileApp extends ABMobileAppCore {

	constructor(attributes, application) {

		super(attributes, application);

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
     * @param {string} version  [optional] which version of the codePushKeys do we want.
     *							Valid options:
     *							'P' : Production [default] 
     *							'S' : Staging
     *							'D' : Development
	 * @return {string}
	 */
	codePushKeys(version) {
		if (!version) {
			version = 'P';  // production
		}
		switch(version) {
			case 'D': version = 'develop'; break;
			case 'N': version = 'nsapp'; break;
			case 'S': version = 'staging'; break;
			case 'P': 
			default:  version = 'production'; break;
		}
		return this.settings.codePushKeys[version];
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
