steal(
'opstools/BuildApp/models/base/ABApprovalStatus.js',
function() {
    System.import('appdev').then(function() {
		steal.import('appdev/model/model').then(function() {

			// Namespacing conventions:
			// AD.Model.extend('[application].[Model]', {static}, {instance} );  --> Object
			AD.Model.extend('opstools.BuildApp.ABApprovalStatus', {
				/*
					findAll: 'GET /app_builder/abapprovalstatus',
					findOne: 'GET /app_builder/abapprovalstatus/{id}',
					describe: function() {},   // returns an object describing the Model definition
					fieldId: 'id',             // which field is the ID
					fieldLabel:'status'      // which field is considered the Label
				*/
			}, {
				/*
					// Already Defined:
					model: function() {},   // returns the Model Class for an instance
					getID: function() {},   // returns the unique ID of this instance
					getLabel: function() {} // returns the defined label value
				*/
			});
		});
	});
});