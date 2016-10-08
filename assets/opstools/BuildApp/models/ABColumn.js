steal(
	'opstools/BuildApp/models/base/ABColumn.js',

	'opstools/BuildApp/models/ABList.js',
	function () {
		System.import('appdev').then(function () {
			steal.import('appdev/model/model').then(function () {

				// Namespacing conventions:
				// AD.Model.extend('[application].[Model]', {static}, {instance} );  --> Object
				AD.Model.extend('opstools.BuildApp.ABColumn',
					{
						useSockets: true
						/*
							findAll: 'GET /app_builder/abcolumn',
							findOne: 'GET /app_builder/abcolumn/{id}',
							create:  'POST /app_builder/abcolumn',
							update:  'PUT /app_builder/abcolumn/{id}',
							destroy: 'DELETE /app_builder/abcolumn/{id}',
							describe: function() {},   // returns an object describing the Model definition
							fieldId: 'id',             // which field is the ID
							fieldLabel:'label'      // which field is considered the Label
						*/
					},
					{
						getList: function () {
							return AD.Model.get('opstools.BuildApp.ABList').findAll({ column: this.id });
						}
					}
				);
			});
		});
	});