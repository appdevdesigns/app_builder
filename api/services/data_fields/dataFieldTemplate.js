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
    
    /*
     * .defaults
     * these values should correspond to a default set of values
     * for an ABColumn entry, when created on the server API.
     *
     * .fieldName   {string}    unique key to reference this specific DataField
     *                          generally the same as this file name (without '.js' ).
     * .type:       {string}    the fundamental data type for this DataField.
     *                          the type should match one of the given sails attribute types:
     *                          http://sailsjs.org/documentation/concepts/models-and-orm/attributes#?attribute-options
     * .setting     {json}      the unique settings for this data field
     *      .icon   {string}    A font-awesome icon to represent this DataField
     *                          the icon is specified without the 'fa-' prefix.
     *                          so .icon='user'  is the 'fa-user' icon.
     *      .editor {string}    The webix editor to use for this field in a grid.
     *                          if this is a unique editor, then put a unique value here:
     *                          like the same .fieldName above.
     *      .filter_type {string} if this data field is useable in a filter, tell what type of 
     *                          filter here:  'text', 
     *
     *      .xxxxx  {???}       Any unique settings specific to your data filed.
     *                          make sure these values correspond to what would be returned from the
     *                          client side dataField.js  .getSettings() method.
     */
    defaults: {
        fieldName: 'equation',
        type: 'string',
        setting: {
            icon: 'calculator',
            editor: 'text',
            filter_type: 'text',

            // specific fields here:

        }
    }

};