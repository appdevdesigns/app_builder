steal(function() {
	System.import('appdev').then(function() {
		steal.import('appdev/model/model').then(function() {

			// Namespacing conventions:
			// AD.Model.Base.extend("[application].[Model]" , { static }, {instance} );  --> Object
			AD.Model.Base.extend("opstools.BuildApp.ABApprovalStatus", {
				findAll: 'GET /app_builder/abapprovalstatus',
				findOne: 'GET /app_builder/abapprovalstatus/{id}',
				describe: function() { return { 'status':'string' };  },
				// associations:['field1', 'field2', ..., 'fieldN'],
				// multilingualFields:[ 'field', 'field2' ],
				// validations: {
				//     "role_label" : [ 'notEmpty' ],
				//     "role_description" : [ 'notEmpty' ]
				// },
				fieldId: 'id',
				fieldLabel: 'status'
			}, {
				// model: function() {
				//     return AD.Model.get('opstools.BuildApp.ABApprovalStatus'); //AD.models.opstools.BuildApp.ABApprovalStatus;
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