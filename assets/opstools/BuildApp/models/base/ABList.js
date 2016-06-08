steal(function() {
	System.import('appdev').then(function() {
		steal.import('appdev/model/model').then(function() {

			// Namespacing conventions:
			// AD.Model.Base.extend("[application].[Model]" , { static }, {instance} );  --> Object
			AD.Model.Base.extend("opstools.BuildApp.ABList", {
				findAll: 'GET /app_builder/ablist',
				findOne: 'GET /app_builder/ablist/{id}',
				create: 'POST /app_builder/ablist',
				update: 'PUT /app_builder/ablist/{id}',
				destroy: 'DELETE /app_builder/ablist/{id}',
				describe: function() { return { 'key':'string', 'value':'string' };  },
				// associations:['field1', 'field2', ..., 'fieldN'],
				multilingualFields:['label', 'weight'],
				// validations: {
				//     "role_label" : [ 'notEmpty' ],
				//     "role_description" : [ 'notEmpty' ]
				// },
				fieldId: 'id',
				fieldLabel: 'label'
			}, {
				// model: function() {
				//     return AD.Model.get('opstools.BuildApp.ABList'); //AD.models.opstools.BuildApp.ABList;
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