steal(
'opstools/BuildApp/models/base/ABList.js',
function() {
    System.import('appdev').then(function() {
		steal.import('appdev/model/model').then(function() {

			// Namespacing conventions:
			// AD.Model.extend('[application].[Model]', {static}, {instance} );  --> Object
			AD.Model.extend('opstools.BuildApp.ABList', {
				// useSockets: true,
				/*
					findAll: 'GET /app_builder/ablist',
					findOne: 'GET /app_builder/ablist/{id}',
					create:  'POST /app_builder/ablist',
					update:  'PUT /app_builder/ablist/{id}',
					destroy: 'DELETE /app_builder/ablist/{id}',
					describe: function() {},   // returns an object describing the Model definition
					fieldId: 'id',             // which field is the ID
					fieldLabel:'key'      // which field is considered the Label
				*/
				getKey: function (app_name, obj_name, col_name) {
					return '{0}.{1}.{2}'
							.replace('{0}', app_name)
							.replace('{1}', obj_name)
							.replace('{2}', col_name);
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