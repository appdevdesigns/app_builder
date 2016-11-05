steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/utils/ModelCreator.js',
	'opstools/BuildApp/controllers/data_fields/dataFieldsManager.js',
	function (modelCreator, dataFieldsManager) {
		return {
			normalizeData: function (application, columns, data, ignoreTranslate) {
				var self = this,
					q = new AD.sal.Deferred(),
					normalizeDataTasks = [],
					list;

				if (!data) {
					q.resolve();
					return q;
				}
				else if (data instanceof webix.DataCollection) {
					list = data.AD.__list;  // Get Can.Map
				}
				else if (!data.forEach) {
					list = [data]; // Convert to array
				}
				else {
					list = data; // It is Can.Map
				}

				var linkColumns = columns.filter(function (col) { return col.setting.linkObject }) || [], // Get link columns
					dateColumns = columns.filter(function (col) { return col.setting.editor === 'date' || col.setting.editor === 'datetime'; }) || [];// Get date & datetime columns

				if (list.forEach) {
					list.forEach(function (row) {
						normalizeDataTasks.push(function (callback) {
							// Translate
							if (!ignoreTranslate && row.translate) row.translate();

							var linkTasks = [];

							linkColumns.forEach(function (linkCol) {
								if (typeof row[linkCol.name] == 'undefined' || row[linkCol.name] == null) {
									if (linkCol.setting.linkType === 'collection')
										row.attr(linkCol.name, []);
									else
										row.attr(linkCol.name, '');

									return;
								}

								linkTasks.push(function (ok) {
									var linkObj = application.objects.filter(function (obj) { return obj.id == linkCol.setting.linkObject; })[0],
										linkedData = [];

									// Get linked object model
									var linkObjModel = modelCreator.getModel(application, linkObj.name);

									async.series([
										// Find labels of linked fields
										function (next) {
											var connectIds = [];

											if (row[linkCol.name].forEach) {
												row[linkCol.name].forEach(function (val) {
													if (typeof val._dataLabel == 'undefined' || val._dataLabel == null)
														connectIds.push({ id: val.id || val });
												});
											}
											else if (typeof row[linkCol.name]._dataLabel == 'undefined' || row[linkCol.name]._dataLabel == null) {
												connectIds.push({ id: row[linkCol.name].id || row[linkCol.name] });
											}

											if (!connectIds || connectIds.length < 1) return next();

											linkObjModel.findAll({ or: connectIds })
												.fail(next)
												.then(function (result) {
													result.forEach(function (linkVal) {
														if (linkVal.translate) linkVal.translate();

														linkVal.attr('_dataLabel', linkObj.getDataLabel(linkVal.attr()));
													});

													linkedData = result;
													next();
												});
										},
										// Set label to linked fields
										function (next) {
											if (!linkedData || linkedData.length < 1) return next();

											if (row[linkCol.name].forEach) {
												row[linkCol.name].forEach(function (val, index) {
													if (typeof val._dataLabel == 'undefined' || val._dataLabel == null) {
														var linkVal = linkedData.filter(function (link) { return link.id == val.id });
														if (!linkVal[0]) return;

														// FIX : CANjs attr to set nested value
														if (row.attr)
															row.attr(linkCol.name + '.' + index, linkVal[0].attr());
														else
															row[linkCol.name + '.' + index] = linkVal[0].attr();
													}
												});
											}
											else if (typeof row[linkCol.name]._dataLabel == 'undefined' || row[linkCol.name]._dataLabel == null) {
												var linkVal = linkedData.filter(function (link) { return link.id == row[linkCol.name].id });
												if (!linkVal[0]) return next();

												if (row.attr)
													row.attr(linkCol.name, linkVal[0].attr());
												else
													row[linkCol.name] = linkVal[0].attr();
											}

											next();
										}
									], ok);
								});
							});

							async.parallel(linkTasks, callback);
						});

						// Convert string to Date object
						if (dateColumns && dateColumns.length > 0) {
							dateColumns.forEach(function (dateCol) {
								if (row[dateCol.name] && !(row[dateCol.name] instanceof Date))
									row.attr(dateCol.name, new Date(row[dateCol.name]));
							});
						}

						// Set height of row ($height)
						columns.forEach(function (col) {
							var rowHeight = dataFieldsManager.getRowHeight(col, row[col.name]);
							if (rowHeight && (!row.$height || row.$height < rowHeight))
								row.attr('$height', rowHeight);
						});

					});
				}

				async.parallel(normalizeDataTasks, function (err) {
					if (err) {
						q.reject(err);
					}
					else {
						q.resolve(data);
					}
				});

				return q;
			}


		};
	}
);