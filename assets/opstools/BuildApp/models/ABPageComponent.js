steal(
'opstools/BuildApp/models/base/ABPageComponent.js',
function() {
    System.import('appdev').then(function() {
		steal.import('appdev/model/model').then(function() {

			// Namespacing conventions:
			// AD.Model.extend('[application].[Model]', {static}, {instance} );  --> Object
			AD.Model.extend('opstools.BuildApp.ABPageComponent', {
				useSockets: true
				/*
					findAll: 'GET /app_builder/abpagecomponent',
					findOne: 'GET /app_builder/abpagecomponent/{id}',
					create:  'POST /app_builder/abpagecomponent',
					update:  'PUT /app_builder/abpagecomponent/{id}',
					destroy: 'DELETE /app_builder/abpagecomponent/{id}',
					describe: function() {},   // returns an object describing the Model definition
					fieldId: 'id',             // which field is the ID
					fieldLabel:'component'      // which field is considered the Label
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