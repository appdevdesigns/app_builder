steal(
	'opstools/BuildApp/models/base/ABApplication.js',

	'opstools/BuildApp/models/ABObject.js',
	'opstools/BuildApp/models/ABPage.js',
	function () {
		System.import('appdev').then(function () {
			steal.import('appdev/model/model').then(function () {

				// Namespacing conventions:
				// AD.Model.extend('[application].[Model]', {static}, {instance} );  --> Object
				AD.Model.extend('opstools.BuildApp.ABApplication',
					{
						useSockets: true
						/*
							findAll: 'GET /app_builder/abapplication',
							findOne: 'GET /app_builder/abapplication/{id}',
							create:  'POST /app_builder/abapplication',
							update:  'PUT /app_builder/abapplication/{id}',
							destroy: 'DELETE /app_builder/abapplication/{id}',
							describe: function() {},   // returns an object describing the Model definition
							fieldId: 'id',             // which field is the ID
							fieldLabel:'name'      // which field is considered the Label
						*/
					},
					{
						getObjects: function () {
							return AD.Model.get('opstools.BuildApp.ABObject').findAll({ application: this.id });
						},

						getObject: function (objId) {
							return AD.Model.get('opstools.BuildApp.ABObject').findOne({ application: this.id, id: objId });
						},

						getPages: function () {
							return AD.Model.get('opstools.BuildApp.ABPage').findAll({ application: this.id });
						},

						getPage: function (pageId) {
							return AD.Model.get('opstools.BuildApp.ABPage').findOne({ application: this.id, id: pageId });
						},

						getPermissions: function () {
							return AD.comm.service.get({ url: '/app_builder/' + this.id + '/role' });
						},

						createPermission: function () {
							return AD.comm.service.post({ url: '/app_builder/' + this.id + '/role' });
						},

						deletePermission: function () {
							return AD.comm.service.delete({ url: '/app_builder/' + this.id + '/role' });
						},

						// id: appId,
						// isApplicationRole: true
						assignPermissions: function (permItems) {
							return AD.comm.service.put({
								url: '/app_builder/' + this.id + '/role/assign',
								data: {
									roles: permItems
								}
							})
						}



					}
				);
			});
		});
	});