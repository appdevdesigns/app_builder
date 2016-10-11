steal(
	'opstools/BuildApp/models/base/ABObject.js',

	'opstools/BuildApp/models/ABColumn.js',
	function () {
		System.import('appdev').then(function () {
			steal.import('appdev/model/model').then(function () {

				// Namespacing conventions:
				// AD.Model.extend('[application].[Model]', {static}, {instance} );  --> Object
				AD.Model.extend('opstools.BuildApp.ABObject',
					{
						useSockets: true
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
					},
					{
						getDataLabel: function (data) {
							if (!this.columns || this.columns.length < 1) return '';

							var labelFormat;

							if (this.labelFormat) {
								labelFormat = this.labelFormat;
							} else { // Default label format
								var textCols = this.columns.filter(function (col) { return col.type === 'string' || col.type === 'text' }),
									defaultCol = textCols.length > 0 ? textCols[0] : this.columns[0];

								labelFormat = '{' + defaultCol.name + '}';
							}

							for (var c in data) {
								labelFormat = labelFormat.replace(new RegExp('{' + c + '}', 'g'), data[c]);
							}

							return labelFormat;
						},

						getColumns: function () {
							return AD.Model.get('opstools.BuildApp.ABColumn').findAll({ object: this.id });
						},

						getColumn: function (colId) {
							return AD.Model.get('opstools.BuildApp.ABColumn').findOne({ object: this.id, id: colId });
						},

						sortColumns: function (id, cols) {
							return AD.comm.service.put({
								url: '/app_builder/object/sortColumns/' + this.id,
								data: {
									columns: cols
								}
							});
						}

					});
			});
		});
	});