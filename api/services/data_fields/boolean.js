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
        type: 'boolean',
        fieldName: 'boolean',
        setting: {
            icon: 'check-square-o',
            filter_type: 'boolean',
            template: '{common.checkbox()}',
        }
	}

};