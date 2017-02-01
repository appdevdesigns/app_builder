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
        type: 'integer',
        fieldName: 'equation',
        setting: {
            icon: 'calculator',
            editor: 'text',
            filter_type: 'text',
            equationType : '',
            equation : ''
        }
    }

};