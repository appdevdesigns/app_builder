/**
 * Generate data type for AppBuilder apps.
 */

var AD = require('ad-utils');

module.exports = {

	getFieldString: function (column) {
		var dfd = AD.sal.Deferred();

		var colString = column.name + ':' + column.type;

		if (column.setting.default) {
			// TODO: Default value
		}

		dfd.resolve(colString);

		return dfd;
	},
    
    defaults: {
        type: 'integer',
        fieldName: 'number',
        setting: {
            icon: 'slack',
            editor: 'number',
            filter_type: 'number',
            format: 'numberFormat',
        }
    }
};