steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/utils/ModelCreator.js',
	function () {
		System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control').then(function () {
					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.DataHelper', {

						init: function (element, options) {
							this.data = {};

							this.options = AD.defaults({
							}, options);

							this._super(element, options);

							this.initControllers();
						},

						initControllers: function () {
							this.controllers = {};

							var ModelCreator = AD.Control.get('opstools.BuildApp.ModelCreator');

							this.controllers.ModelCreator = new ModelCreator();
						},

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
													var linkObj = application.objects.filter(function (obj) { return obj.id == (linkCol.linkObject.id || linkCol.linkObject) })[0],
														linkObjModel,
														linkedLabels = [];

													async.series([
														// Get linked object model
														function (next) {
															self.controllers.ModelCreator.getModel(application, linkObj.name)
																.fail(next)
																.then(function (result) {
																	linkObjModel = result;
																	next();
																});
														},
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
														},
														// Convert string to Date object
														function (next) {
															if (dateFields && dateFields.length > 0) {
																dateFields.forEach(function (dateCol) {
																	if (r[dateCol.id])
																		r.attr(dateCol.id, new Date(r[dateCol.id]));
																});
															}

															next();
														}
													], ok);
												});
											}
										});

										async.parallel(Tasks, callback);
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


					});
				})
		})
	}
);