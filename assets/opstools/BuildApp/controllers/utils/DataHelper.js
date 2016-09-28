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

						setApp: function (app) {
							this.data.app = app;

							this.controllers.ModelCreator.setApp(app);
						},

						setObjectList: function (objectList) {
							this.data.objectList = objectList;
						},

						normalizeData: function (data, linkFields, dateFields) {
							var q = new AD.sal.Deferred();

							if (!data) {
								q.resolve();
								return q;
							}

							var self = this,
								result = data instanceof webix.DataCollection ? data.AD.__list : data,
								normalizeDataTasks = [];

							if (result.forEach) {
								result.forEach(function (r) {
									normalizeDataTasks.push(function (callback) {
										// Translate
										if (r.translate) r.translate();

										var Tasks = [];

										linkFields.forEach(function (linkCol) {
											var colName = linkCol.id;

											if (r[colName]) {
												Tasks.push(function (ok) {
													var linkObj = self.data.objectList.filter(function (obj) { return obj.id == (linkCol.linkObject.id || linkCol.linkObject) })[0],
														linkObjModel;

													async.series([
														// Get linked object model
														function (next) {
															self.controllers.ModelCreator.getModel(linkObj.name)
																.fail(next)
																.then(function (result) {
																	linkObjModel = result;
																	next();
																});
														},
														// Set label to linked fields
														function (next) {
															var connectIds = [];

															if (r[colName].forEach) {
																r[colName].forEach(function (val) {
																	if (!val.dataLabel)
																		connectIds.push({ id: val.id || val });
																});
															}
															else {
																if (!r[colName].dataLabel)
																	connectIds.push({ id: r[colName].id || r[colName] });
															}

															if (connectIds && connectIds.length > 0) {
																linkObjModel.findAll({ or: connectIds })
																	.fail(next)
																	.then(function (result) {
																		if (result) {
																			result.forEach(function (linkVal, index) {
																				if (linkVal.translate) linkVal.translate();

																				// Set data label
																				linkVal.attr('dataLabel', linkObj.getDataLabel(linkVal.attr()));

																				if (r[colName].forEach) {
																					// FIX : CANjs attr to set nested value
																					r.attr(colName + '.' + index, linkVal.attr());
																				}
																				else {
																					r.attr(colName, linkVal.attr());
																				}
																			});
																		}

																		next();
																	});
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