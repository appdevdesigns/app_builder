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
    type: 'string',
    fieldName: 'attachment',
    setting: {
      icon: 'file',
      template: '<div class="ab-attachment-data-field"></div>',
      css: 'ab-column-no-padding'
    }
  }

};
