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
						setWidth: function (width) {
							var q = AD.sal.Deferred();

							AD.comm.service.put({
								url: '/app_builder/column/' + this.id + '/width',
								data: {
									width: width
								}
							}, function (err, result) {
								if (err)
									q.reject(err);
								else
									q.resolve(result);
							});

							return q;
						},
						getList: function () {
							return AD.Model.get('opstools.BuildApp.ABList').findAll({ column: this.id });
						}
					}
				);
			});
		});
	});