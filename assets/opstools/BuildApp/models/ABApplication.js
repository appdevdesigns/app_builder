steal(
'opstools/BuildApp/models/base/ABApplication.js',
function() {
    System.import('appdev').then(function() {
		steal.import('appdev/model/model').then(function() {

			// Namespacing conventions:
			// AD.Model.extend('[application].[Model]', {static}, {instance} );  --> Object
			AD.Model.extend('opstools.BuildApp.ABApplication', {
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