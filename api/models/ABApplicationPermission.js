/**
 * ABApplicationPermission.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var async = require('async'),
	_ = require('lodash');

module.exports = {

	tableName: 'appbuilder_application_permission',

	connection: 'appdev_default',


	attributes: {
		permission: {
			model: 'PermissionRole'
		},

		application: {
			model: 'ABApplication',
			via: 'permissions'
		},
		
		isApplicationRole: {
			type: 'boolean',
			required: false
		}
	}

};