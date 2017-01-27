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
        type: 'string',
        fieldName: 'list',
        setting: {
            icon: 'th-list',
            filter_type: 'list',
            editor: 'richselect',
            options: [],
        }
    }    
};