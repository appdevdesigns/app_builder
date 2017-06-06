/**
 * Generate data type for AppBuilder apps.
 */

var AD = require('ad-utils');

module.exports = {

    getFieldString: function(column) {
        var dfd = AD.sal.Deferred();

        var colString = column.name + ':' + column.type;

        dfd.resolve(colString);

        return dfd;
    },

    defaults: {
        type: 'json',
        fieldName: 'user',
        setting: {
            icon: 'user-o',
            template: '<div class="user-data-values"></div>',
            multiSelect: 0
        }
    }
};