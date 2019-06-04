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
			via: 'objects'
		},

		_Klass: function () {
			return ABObject;
		},

		toABClass: function () {

			return new ABClassObject(this);

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