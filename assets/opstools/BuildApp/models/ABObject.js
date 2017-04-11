steal(
	'opstools/BuildApp/controllers/utils/ModelCreator.js',

	'opstools/BuildApp/models/base/ABObject.js',

	'opstools/BuildApp/models/ABColumn.js',
	'opstools/BuildApp/models/ABApprovalStatus.js',
	function (modelCreator) {
		System.import('appdev').then(function () {
			steal.import('appdev/model/model').then(function () {
				var ABColumn = AD.Model.get('opstools.BuildApp.ABColumn');
				var ABApprovalStatus = AD.Model.get('opstools.BuildApp.ABApprovalStatus');

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

								if (defaultCol)
									labelFormat = '{' + defaultCol.name + '}';
								else
									labelFormat = '';
							}

							for (var c in data) {
								var label = data[c];

								if (typeof label === 'object') label = '';

								labelFormat = labelFormat.replace(new RegExp('{' + c + '}', 'g'), label);
							}

							return labelFormat;
						},

						getColumns: function () {
							return ABColumn.findAll({ object: this.id });
						},

						getColumn: function (colId) {
							return ABColumn.findOne({ object: this.id, id: colId });
						},

						createColumn: function (type, col) {
							var self = this,
								q = $.Deferred(),
								columnId,
								column;

							col.object = self.id;

							async.series([
								function (next) {
									ABColumn.createColumn(type, col)
										.fail(next)
										.done(function (result) {
											columnId = result.id;
											next();
										});

								},
								function (next) {
									self.getColumn(columnId)
										.fail(next)
										.done(function (result) {
											if (result.translate) result.translate();

											// Update list
											if (self.columns.filter(function (col) { return (col.id || col) == result.id; }).length > 0)
												self.columns.forEach(function (col, index) {
													if ((col.id || col) == result.id)
														self.columns.attr(index, result);
												});
											// Insert
											else
												self.columns.push(result);

											column = result;

											next();
										});

								},
								// Update column info to model
								function (next) {
									var objectModel = modelCreator.getModel(AD.classes.AppBuilder.currApp, self.name);

									objectModel.Cached.columns.push(column);

									// Add new describe to object model
									objectModel.describe()[column.name] = column.type;

									// Add multilingual field to object model
									if (column.setting.supportMultilingual)
										objectModel.multilingualFields.push(column.name);

									next();
								}
							], function (err) {
								if (err) q.reject(err);
								else q.resolve(column);
							});

							return q;
						},

						createLink: function (name, targetObjectID, sourceRelation, targetRelation) {
							var self = this,
								q = AD.sal.Deferred();

							async.waterfall([
								function (next) {
									ABColumn.createLink({
										name: name,
										sourceObjectID: self.id,
										targetObjectID: targetObjectID,
										sourceRelation: ((sourceRelation == 'collection' || sourceRelation == 'many') ? 'many' : 'one'),
										targetRelation: ((targetRelation == 'collection' || targetRelation == 'many') ? 'many' : 'one')
									})
										.fail(next)
										.done(function (cols) {
											var sourceCol = cols.filter(function (col) { return col.object == self.id })[0];

											next(null, sourceCol);
										});
								},
								function (sourceColumn, next) {
									self.getColumn(sourceColumn.id)
										.fail(next)
										.done(function (result) {
											if (result.translate) result.translate();

											self.columns.push(result);
											column = result;

											next();
										});
								}
							], function (err) {
								if (err) q.reject(err);
								else q.resolve(column);
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
						},

						getApprovalItems: function () {
							return ABApprovalStatus.findAll({ object: this.id });
						},

						getApprovalItem: function (rowId) {
							var getUrl = '/app_builder/abapprovalstatus?object=#objectId#&rowId=#rowId#'
								.replace('#objectId#', this.id)
								.replace('#rowId#', rowId);

							return AD.comm.service.get({
								url: getUrl
							});
						}

					});
			});
		});
	});