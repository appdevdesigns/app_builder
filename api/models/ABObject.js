/**
 * ABObject.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var uuid = require('uuid/v4'),
	path = require('path');

var ABClassObject = require(path.join('..', 'classes', 'ABClassObject'));

module.exports = {

	tableName: 'appbuilder_object',

	// connection: 'appdev_default',

	attributes: {

		id: { type: 'string', primaryKey: true },

		json: 'json',

		applications: {
			collection: 'ABApplication',
			via: 'objects',
			through: 'abapplicationabobject'
		},

		queries: {
			collection: 'ABQuery',
			via: 'objects'
		},

		_Klass: function () {
			return ABObject;
		},

		toABClass: function () {

			return new ABClassObject(this);

		},

		toValidJsonFormat: function (objects) {

			// remove connected fields that does not link to objects in application
			this.json.fields = this.json.fields.filter(f => {

				if (f.key == 'connectObject' &&
					f.settings &&
					!objects.filter(o => o.id == f.settings.linkObject).length) {
					return false;
				}
				else {
					return true;
				}

			});

			return this;

		}


	},


	beforeValidate: function (values, cb) {

		cb();
	},


	beforeCreate: function (values, cb) {

		if (!values.id)
			values.id = uuid();

		cb();
	},


	beforeUpdate: function (values, cb) {

		cb();
	},


	afterCreate: function (newRecord, cb) {

		// Cache in .constructor of ABClassObject
		newRecord.toABClass();

		cb();
	},

	afterUpdate: function (updatedRecord, cb) {

		// Cache in .constructor of ABClassObject
		updatedRecord.toABClass();

		cb();
	},

	beforeDestroy: function (criteria, cb) {

		cb();

	},

	afterDestroy: function (record, cb) {

		// remove cache
		ABClassObject.objectRemove(record.id);

		cb();
	},

};