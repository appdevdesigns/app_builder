steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/utils/ModelCreator.js',
	function (modelCreator) {
		return {
			normalizeData: function (application, data, linkFields, dateFields) {
				var q = new AD.sal.Deferred(),
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

				var self = this,
					normalizeDataTasks = [];

				if (list.forEach) {
					list.forEach(function (row) {
						normalizeDataTasks.push(function (callback) {
							// Translate
							if (row.translate) row.translate();

							var Tasks = [];

							linkFields.forEach(function (linkCol) {
								if (row[linkCol.name] && (typeof row[linkCol.name].dataLabel == 'undefined' || row[linkCol.name].dataLabel == null)) {
									Tasks.push(function (ok) {
										var linkObj = application.objects.filter(function (obj) { return obj.id == linkCol.setting.linkObject; })[0],
											linkedLabels = [];

										// Get linked object model
										var linkObjModel = modelCreator.getModel(application, linkObj.name);

										async.series([
											// Find labels of linked fields
											function (next) {
												var connectIds = [];

												if (row[linkCol.name].forEach) {
													row[linkCol.name].forEach(function (val) {
														if (typeof val.dataLabel == 'undefined' || val.dataLabel == null)
															connectIds.push({ id: val.id || val });
													});
												}
												else if (typeof row[linkCol.name].dataLabel == 'undefined' || row[linkCol.name].dataLabel == null) {
													connectIds.push({ id: row[linkCol.name].id || row[linkCol.name] });
												}

												if (connectIds && connectIds.length > 0) {
													linkObjModel.findAll({ or: connectIds })
														.fail(next)
														.then(function (result) {
															linkedLabels = result;
															next();
														});
												}
												else {
													next();
												}
											},
											// Set label to linked fields
											function (next) {
												if (linkedLabels) {
													linkedLabels.forEach(function (linkVal, index) {
														if (linkVal.translate) linkVal.translate();

														// Set data label
														linkVal.attr('dataLabel', linkObj.getDataLabel(linkVal.attr()));

														if (row[linkCol.name].forEach) {
															// FIX : CANjs attr to set nested value
															if (row.attr)
																row.attr(linkCol.name + '.' + index, linkVal.attr());
															else
																row[linkCol.name + '.' + index] = linkVal.attr();
														}
														else {
															if (row.attr)
																row.attr(linkCol.name, linkVal.attr());
															else
																row[linkCol.name] = linkVal.attr();
														}

													});

													next();
												}
												else {
													next();
												}
											}
										], ok);
									});
								}
							});

							async.parallel(Tasks, callback);
						});


						// Convert string to Date object
						if (dateFields && dateFields.length > 0) {
							dateFields.forEach(function (dateCol) {
								if (row[dateCol.name] && !(row[dateCol.name] instanceof Date))
									row.attr(dateCol.name, new Date(row[dateCol.name]));
							});
						}

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