steal(function() {
	System.import('appdev').then(function() {
		steal.import('appdev/model/model').then(function() {

			// Namespacing conventions:
			// AD.Model.Base.extend("[application].[Model]" , { static }, {instance} );  --> Object
			AD.Model.Base.extend("opstools.BuildApp.ABColumn", {
				findAll: 'GET /app_builder/abcolumn',
				findOne: 'GET /app_builder/abcolumn/{id}',
				create: 'POST /app_builder/abcolumn',
				update: 'PUT /app_builder/abcolumn/{id}',
				destroy: 'DELETE /app_builder/abcolumn/{id}',
				describe: function() { return { 'name':'string', 'label':'string', 'type':'string', 'required':'boolean', 'unique':'boolean' };  },
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
				//     return AD.Model.get('opstools.BuildApp.ABColumn'); //AD.models.opstools.BuildApp.ABColumn;
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