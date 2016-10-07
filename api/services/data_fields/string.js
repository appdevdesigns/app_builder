/**
 * Generate models and controllers for AppBuilder apps.
 */

var fs = require('fs');
var path = require('path');
var AD = require('ad-utils');
var _ = require('lodash');


module.exports = {

    getFieldString:function(column) {
        var dfd = AD.sal.Deferred();

        var colString = column.name + ':' + column.type;

        if (column.setting.supportMultilingual) {
            colString += ':multilingual';
        }

        // if this field is the Label, then:
        if (!isDefinedLabel && (col.type === 'string' || col.type === 'text')) {
            colString += ':label';
            isDefinedLabel = true;
        }

        dfd.resolve(colString);
        
        return dfd;
    }

};