/**
 * Generate data type for AppBuilder apps.
 */

var AD = require('ad-utils');

module.exports = {

	getFieldString: function (column) {
		var dfd = AD.sal.Deferred();

		var colString = column.name + ':' + column.type;

		dfd.resolve(colString);

		return dfd;
	},
    
    defaults: {
        type: 'date',
        fieldName: 'date',
        setting: {
            icon: 'calendar',
            editor: 'date',
            filter_type: 'date',
            format: 'dateFormatStr',
        }
    }
};