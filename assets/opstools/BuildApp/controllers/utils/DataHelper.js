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
					list.forEach(function (r) {
						normalizeDataTasks.push(function (callback) {
							// Translate
							if (r.translate) r.translate();

							var Tasks = [];

							linkFields.forEach(function (linkCol) {
								if (r[linkCol.name] && !r[linkCol.name].dataLabel) {
									Tasks.push(function (ok) {
										var linkObj = application.objects.filter(function (obj) { return obj.id == linkCol.setting.linkObject; })[0],
											linkedLabels = [];

										// Get linked object model
										var linkObjModel = modelCreator.getModel(application, linkObj.name);

										async.series([
											// Find labels of linked fields
											function (next) {
												var connectIds = [];

												if (r[linkCol.name].forEach) {
													r[linkCol.name].forEach(function (val) {
														if (!val.dataLabel)
															connectIds.push({ id: val.id || val });
													});
												}
												else if (!r[linkCol.name].dataLabel) {
													connectIds.push({ id: r[linkCol.name].id || r[linkCol.name] });
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

														if (r[linkCol.name].forEach) {
															// FIX : CANjs attr to set nested value
															if (r.attr)
																r.attr(linkCol.name + '.' + index, linkVal.attr());
															else
																r[linkCol.name + '.' + index] = linkVal.attr();
														}
														else {
															if (r.attr)
																r.attr(linkCol.name, linkVal.attr());
															else
																r[linkCol.name] = linkVal.attr();
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
								if (r[dateCol.name])
									r.attr(dateCol.name, new Date(r[dateCol.name]));
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