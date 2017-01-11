/**
 * Generate data type for AppBuilder apps.
 */

var AD = require('ad-utils');

module.exports = {

	getFieldString: function (column) {
		var dfd = AD.sal.Deferred();

		var colString = column.name + ':' + column.type;


		if (column.setting.supportMultilingual == true) {
			colString += ':multilingual';
		}

		if (column.setting.default) {
			// TODO: Default value
		}

		dfd.resolve(colString);

		return dfd;
	},
    
    defaults: {
        type: 'string',
        fieldName: 'string',
        setting: {
            icon: 'font',
            editor: 'text',
            filter_type: 'text',
            supportMultilingual: '0',
        }
    }
};