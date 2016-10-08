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

						getPages: function () {
							return AD.Model.get('opstools.BuildApp.ABPage').findAll({ application: this.id });
						}
					}
				);
			});
		});
	});