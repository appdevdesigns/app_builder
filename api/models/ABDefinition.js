/**
 * ABDefinition.js
 *
 * @description :: ABDefinition is a generic object definition store.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var uuid = require('uuid/v4'),
	path = require('path');

// var ABClassObject = require(path.join('..', 'classes', 'ABClassObject'));

module.exports = {

	tableName: 'appbuilder_definition',

	// connection: 'appdev_default',

	attributes: {

		id: { type: 'string', primaryKey: true },

		// initial creation label, just for us to help lookup data.
		name: { type:'string' },

		// type of definition:
		//  "object", "field", "process", "task", "application", "view", etc...
		type: { type:'string', required: true},

		// the json description of this definition
		json: 'json',

		

		// applications: {
		// 	collection: 'ABApplication',
		// 	via: 'objects',
		// 	through: 'abapplicationabobject'
		// },

		// queries: {
		// 	collection: 'ABQuery',
		// 	via: 'objects'
		// },

		// _Klass: function () {
		// 	return ABObject;
		// },

		// toABClass: function () {

		// 	// return new ABClassObject(this);
		// 	var obj;

		// 	switch(this.type) {
		// 		case "object":
		// 		default:
		// 			obj = new ABClassObject(this);
		// 			break;
		// 	}

		// 	return obj;
		// },




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
		// newRecord.toABClass();

		cb();
	},

	afterUpdate: function (updatedRecord, cb) {

		// Cache in .constructor of ABClassObject
		// updatedRecord.toABClass();

		cb();
	},

	beforeDestroy: function (criteria, cb) {

		cb();

	},

	afterDestroy: function (record, cb) {

		// remove cache
		// ABObjectCache.remove(record.id);

		cb();
	},

};