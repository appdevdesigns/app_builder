steal(
	'opstools/BuildApp/models/base/ABObject.js',
	function () {
		System.import('appdev').then(function () {
			steal.import('appdev/model/model').then(function () {

				// Namespacing conventions:
				// AD.Model.extend('[application].[Model]', {static}, {instance} );  --> Object
				AD.Model.extend('opstools.BuildApp.ABObject', {
					useSockets: true,
					/*
						findAll: 'GET /app_builder/abobject',
						findOne: 'GET /app_builder/abobject/{id}',
						create:  'POST /app_builder/abobject',
						update:  'PUT /app_builder/abobject/{id}',
						destroy: 'DELETE /app_builder/abobject/{id}',
						describe: function() {},   // returns an object describing the Model definition
						fieldId: 'id',             // which field is the ID
						fieldLabel:'label'      // which field is considered the Label
					*/
					sortColumns: function (id, data, cb) {
						return AD.comm.service.put({
							url: '/app_builder/object/sortColumns/' + id,
							data: {
								columns: data
							}
						}, cb);
					}

				}, {
						/*
							// Already Defined:
							model: function() {},   // returns the Model Class for an instance
							getID: function() {},   // returns the unique ID of this row,
							getLabel: function() {} // returns the defined label value
						*/
						getDataLabel: function (data) {
							if (!this.columns || this.columns.length < 1) return '';

							var labelFormat = this.labelFormat || '{' + this.columns[0].name + '}';

							for (var c in data) {
								labelFormat = labelFormat.replace(new RegExp('{' + c + '}', 'g'), data[c]);
							}

							return labelFormat;
						}
					});
			});
		});
	});