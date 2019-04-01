/**
 * ABObject.js
 *
 * @description :: Holds the informate for a defined Object in the AppBuilder
 */
const uuidv4 = require('uuid/v4');

module.exports = {

    tableName: 'appbuilder_object',

    // connection: 'appdev_default',
    migrate: "alter",

    primaryKey: 'id',
    dontUseObjectIds: true,

    attributes: {

        uuid : {
            type: "string",
            // isUUID: true,       // Sails v1.x ?
            unique: true
        },

        json : 'json', 
        

        name: {
            type: 'string',
            required: true,
            unique: true,
            maxLength: 255
        }

    },

    /**
     * beforeCreate
     * make sure entry has a valid uuid set.
     */
    beforeCreate: function (values, cb) {
        if (!values.uuid) {
            if (values.json && values.json.id) {
                values.uuid = values.json.id;
            } else {
                values.uuid = uuidv4();
            }
        }

        cb();
    }


};

