steal(function() {
	System.import('appdev').then(function() {
		steal.import('appdev/model/model').then(function() {

			// Namespacing conventions:
			// AD.Model.Base.extend("[application].[Model]" , { static }, {instance} );  --> Object
			AD.Model.Base.extend("opstools.BuildApp.ABPageComponent", {
				findAll: 'GET /app_builder/abpagecomponent',
				findOne: 'GET /app_builder/abpagecomponent/{id}',
				create: 'POST /app_builder/abpagecomponent',
				update: 'PUT /app_builder/abpagecomponent/{id}',
				destroy: 'DELETE /app_builder/abpagecomponent/{id}',
				describe: function() { return { 'page':'ABPage', 'component':'string', 'weight':'integer', 'setting':'json' };  },
				// associations:['field1', 'field2', ..., 'fieldN'],
				multilingualFields:[ 'title', 'description' ],
				// validations: {
				//     "role_label" : [ 'notEmpty' ],
				//     "role_description" : [ 'notEmpty' ]
				// },
				fieldId: 'id',
				fieldLabel: 'title'
			}, {
				// model: function() {
				//     return AD.Model.get('opstools.BuildApp.ABPageComponent'); //AD.models.opstools.BuildApp.ABPageComponent;
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