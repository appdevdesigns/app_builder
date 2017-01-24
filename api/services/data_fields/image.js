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
        fieldName: 'image',
        setting: {
            icon: 'file-image-o',
            template: '<div class="ab-image-data-field"></div>',
            filter_type: 'text',
            /*
            useWidth: '1',
            imageWidth: '100',
            useHeight: '1',
            imageHeight: '100',
            width: '100',
            */
            css: 'ab-column-no-padding'
        }
    }
};