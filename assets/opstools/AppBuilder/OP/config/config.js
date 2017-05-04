
/**
 * @class config
 *
 * Manage our configuration settings.
 */

import ConfigBrowser from "./configBrowser"
import ConfigMobile from "./configMobile"


export default {
	config:function(){

		// TODO: decide which config file to return here:
		return ConfigBrowser;
	}
}