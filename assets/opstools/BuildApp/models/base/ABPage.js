steal(function() {
	System.import('appdev').then(function() {
		steal.import('appdev/model/model').then(function() {

			// Namespacing conventions:
			// AD.Model.Base.extend("[application].[Model]" , { static }, {instance} );  --> Object
			AD.Model.Base.extend("opstools.BuildApp.ABPage", {
				findAll: 'GET /app_builder/abpage',
				findOne: 'GET /app_builder/abpage/{id}',
				create: 'POST /app_builder/abpage',
				update: 'PUT /app_builder/abpage/{id}',
				destroy: 'DELETE /app_builder/abpage/{id}',
				describe: function() { return { 'name':'string', 'parent':'integer' };  },
				// associations:['field1', 'field2', ..., 'fieldN'],
				multilingualFields:['label'], 
				// validations: {
				//     "role_label" : [ 'notEmpty' ],
				//     "role_description" : [ 'notEmpty' ]
				// },
				fieldId: 'id',
				fieldLabel: 'label'
			}, {
				// model: function() {
				//     return AD.Model.get('opstools.BuildApp.ABPage'); //AD.models.opstools.BuildApp.ABPage;
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