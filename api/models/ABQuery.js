/**
 * ABQuery.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var uuid = require('uuid/v4');

module.exports = {

	tableName: 'appbuilder_query',

	attributes: {

		id: { type: 'string', primaryKey: true },

		json: 'json',

		applications: {
			collection: 'ABApplication',
			via: 'queries',
		},

		objects: {
			collection: 'ABObject',
			via: 'queries',
		},

		_Klass: function () {
			return ABQuery;
		},

		toABClass: function () {

			// return new ABClassObject(this);

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

		cb();
	},

	afterUpdate: function (updatedRecord, cb) {

		cb();
	},

	beforeDestroy: function (criteria, cb) {

		cb();

	},

	afterDestroy: function (record, cb) {

		cb();
	},

};