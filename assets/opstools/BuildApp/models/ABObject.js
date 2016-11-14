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
									defaultCol;

								if (textCols.length < 1) {
									defaultCol = this.columns.filter(function (col) { return Object.keys(data).indexOf(col.name) > -1; })[0];
								}
								else {
									defaultCol = textCols[0];
								}

								labelFormat = '{' + defaultCol.name + '}';
							}

							for (var c in data) {
								var label = data[c];

								if (typeof label === 'object') label = '';

								labelFormat = labelFormat.replace(new RegExp('{' + c + '}', 'g'), label);
							}

							return labelFormat;
						},

						getColumns: function () {
							return AD.Model.get('opstools.BuildApp.ABColumn').findAll({ object: this.id });
						},

						getColumn: function (colId) {
							return AD.Model.get('opstools.BuildApp.ABColumn').findOne({ object: this.id, id: colId });
						},

						createColumn: function (col) {
							var self = this,
								q = $.Deferred();

							col.object = self.id;

							AD.Model.get('opstools.BuildApp.ABColumn').create(col)
								.fail(q.reject)
								.then(function (result) {
									if (result.translate) result.translate();

									self.columns.push(result);

									q.resolve(result);
								});

							return q;
						},

						sortColumns: function (cols) {
							var q = AD.sal.Deferred();

							AD.comm.service.put({
								url: '/app_builder/object/sortColumns/' + this.id,
								data: {
									columns: cols
								}
							}, function (err, result) {
								if (err)
									q.reject(err);
								else
									q.resolve(result);
							});

							return q;
						}

					});
			});
		});
	});