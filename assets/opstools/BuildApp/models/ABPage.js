steal(
	'opstools/BuildApp/models/base/ABPage.js',
	function () {
		System.import('appdev').then(function () {
			steal.import('appdev/model/model').then(function () {

				// Namespacing conventions:
				// AD.Model.extend('[application].[Model]', {static}, {instance} );  --> Object
				AD.Model.extend('opstools.BuildApp.ABPage', {
					// useSockets: true
					/*
						findAll: 'GET /app_builder/abpage',
						findOne: 'GET /app_builder/abpage/{id}',
						create:  'POST /app_builder/abpage',
						update:  'PUT /app_builder/abpage/{id}',
						destroy: 'DELETE /app_builder/abpage/{id}',
						describe: function() {},   // returns an object describing the Model definition
						fieldId: 'id',             // which field is the ID
						fieldLabel:'title'      // which field is considered the Label
					*/
					sortComponents: function (id, data, cb) {
						return AD.comm.service.put({
							url: '/app_builder/page/sortComponents/' + id,
							data: {
								components: data
							}
						}, cb);
					}
				}, {
						/*
							// Already Defined:
							model: function() {},   // returns the Model Class for an instance
							getID: function() {},   // returns the unique ID of this row
							getLabel: function() {} // returns the defined label value
						*/
					});
			});
		});
	});