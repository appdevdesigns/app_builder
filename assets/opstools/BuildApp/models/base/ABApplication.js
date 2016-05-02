steal(function() {
	System.import('appdev').then(function() {
		steal.import('appdev/model/model').then(function() {

			// Namespacing conventions:
			// AD.Model.Base.extend("[application].[Model]" , { static }, {instance} );  --> Object
			AD.Model.Base.extend("opstools.BuildApp.ABApplication", {
				findAll: 'GET /app_builder/abapplication',
				findOne: 'GET /app_builder/abapplication/{id}',
				create: 'POST /app_builder/abapplication',
				update: 'PUT /app_builder/abapplication/{id}',
				destroy: 'DELETE /app_builder/abapplication/{id}',
				describe: function() { return { 'name':'string', 'description':'text' };  },
				// associations:['field1', 'field2', ..., 'fieldN'],
				// multilingualFields:[ 'field', 'field2' ],
				// validations: {
				//     "role_label" : [ 'notEmpty' ],
				//     "role_description" : [ 'notEmpty' ]
				// },
				fieldId: 'id',
				fieldLabel: 'name'
			}, {
				// model: function() {
				//     return AD.Model.get('opstools.BuildApp.ABApplication'); //AD.models.opstools.BuildApp.ABApplication;
				// },
				// getID: function() {
				//     return this.attr(this.model().fieldId) || 'unknown id field';
				// },
				// getLabel: function() {
				//     return this.attr(this.model().fieldLabel) || 'unknown label field';
				// }
			});
		});
	});
});