
steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/ObjectList.js',
	'opstools/BuildApp/controllers/ObjectWorkspace.js',

	'opstools/BuildApp/controllers/utils/ModelCreator.js',

	'opstools/BuildApp/models/ABColumn.js',
	'opstools/BuildApp/models/ABList.js',

	function () {
		System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control').then(function () {

					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.ObjectPage', {


						init: function (element, options) {
							var self = this;
							options = AD.defaults({
								selectedObjectEvent: 'AB_Object.Selected',
								createdObjectEvent: 'AB_Object.Created',
								updatedObjectEvent: 'AB_Object.Updated',
								deletedObjectEvent: 'AB_Object.Deleted'
							}, options);
							this.options = options;

							// Call parent init
							this._super(element, options);

							this.Model = {
								ABColumn: AD.Model.get('opstools.BuildApp.ABColumn'),
								ABList: AD.Model.get('opstools.BuildApp.ABList')
							};

							this.data = {};

							this.initControllers();
							this.initWebixUI();
							this.initEvents();
						},

						initControllers: function () {
							var self = this;
							self.controllers = {};

							var ObjectList = AD.Control.get('opstools.BuildApp.ObjectList'),
								ObjectWorkspace = AD.Control.get('opstools.BuildApp.ObjectWorkspace'),
								ModelCreator = AD.Control.get('opstools.BuildApp.ModelCreator');

							self.controllers.ObjectList = new ObjectList(self.element, {
								selectedObjectEvent: self.options.selectedObjectEvent,
								updatedObjectEvent: self.options.updatedObjectEvent,
								deletedObjectEvent: self.options.deletedObjectEvent
							});
							self.controllers.ObjectWorkspace = new ObjectWorkspace(self.element);
							self.controllers.ModelCreator = new ModelCreator(self.element);
						},

						initWebixUI: function () {
							var self = this;

							var objectListUI = self.controllers.ObjectList.getUIDefinition();
							var objectWorkspaceUI = self.controllers.ObjectWorkspace.getUIDefinition();

							self.data.definition = {
								id: self.options.objectView,
								cols: [
									objectListUI,
									{ view: "resizer", autoheight: true },
									objectWorkspaceUI
								]
							};

						},

						initEvents: function () {
							var self = this;

							self.controllers.ObjectList.on(self.options.selectedObjectEvent, function (event, id) {
								self.data.objectId = id;

								self.controllers.ObjectWorkspace.setObjectId(id);
							});

							self.controllers.ObjectList.on(self.options.updatedObjectEvent, function (event, data) {
								self.data.objectList = data.objectList;

								self.controllers.ObjectWorkspace.setObjectList(data.objectList);
							});

							self.controllers.ObjectList.on(self.options.deletedObjectEvent, function (event, data) {
								self.controllers.ObjectWorkspace.deleteObject(data.object);
							});
						},

						getUIDefinition: function () {
							return this.data.definition;
						},

						webix_ready: function () {
							var self = this;

							self.controllers.ObjectList.webix_ready();
							self.controllers.ObjectWorkspace.webix_ready();
						},

						setApp: function (app) {
							var self = this;
							self.data.app = app;

							self.controllers.ObjectWorkspace.resetState();
							self.controllers.ObjectList.resetState();

							self.controllers.ObjectWorkspace.setApp(app);
							self.controllers.ObjectList.setApp(app);

							self.controllers.ModelCreator.setApp(app);
						},

						refresh: function () {
							this.controllers.ObjectList.refreshUnsyncNumber();
							this.controllers.ObjectWorkspace.setObjectId(this.data.objectId);
						},

						syncObjectFields: function () {
							var self = this,
								q = $.Deferred();

							if (self.data.objectList) {
								async.eachSeries(self.data.objectList, function (object, next) {
									async.waterfall([
										function (cb) {
											// Get object model
											self.controllers.ModelCreator.getModel(object.name)
												.fail(function (err) { cb(err); })
												.then(function (objectModel) {
													cb(null, objectModel);
												});
										},
										function (objectModel, cb) {
											// Get cached fields
											var newFields = objectModel.Cached.getNewFields();

											if (!newFields || newFields.length < 1) {
												cb();
											}
											else {
												var saveFieldsTasks = [];

												newFields.forEach(function (field, index) {
													saveFieldsTasks.push(function (callback) {
														var tempId = field.id;
														delete field.id;

														field.weight = object.columns.length + (index + 1);

														async.waterfall([
															// Create object column
															function (ok) {
																self.Model.ABColumn.create(field)
																	.fail(ok)
																	.then(function (result) {
																		objectModel.Cached.deleteCachedField(tempId);

																		ok(null, result);
																	});
															},
															// Create link column
															function (column, ok) {
																if (field.linkObject && field.linkVia) {
																	self.createLinkColumn(field.linkObject, field.linkVia, column.id)
																		.fail(ok)
																		.then(function (linkCol) {
																			// set linkVia
																			column.attr('linkVia', linkCol.id);
																			column.save()
																				.fail(function (err) { ok(err) })
																				.then(function (result) {
																					ok(null, result);
																				});
																		});
																}
																else {
																	ok(null, column);
																}
															},
															// Create list option of select column
															function (column, ok) {
																if (field.setting.editor === 'richselect' && field.setting.filter_options) {
																	var createOptionEvents = [];

																	field.setting.filter_options.forEach(function (opt, index) {
																		createOptionEvents.push(function (createOk) {
																			var list_key = self.Model.ABList.getKey(object.application.name, object.name, column.name);

																			self.Model.ABList.create({
																				key: list_key,
																				weight: index + 1,
																				column: column.id,
																				label: opt,
																				value: opt
																			})
																				.fail(createOk)
																				.then(function () { createOk(); });
																		});
																	});

																	async.parallel(createOptionEvents, ok);
																}
																else {
																	ok();
																}
															}
														], callback);
													});
												});

												async.parallel(saveFieldsTasks, cb);
											}
										}
									], next);
								}, function (err) {
									if (err) {
										q.reject(err);
										return;
									}

									q.resolve();
								});
							}
							else {
								q.resolve();
							}

							return q;
						},

						syncData: function () {
							var q = $.Deferred(),
								self = this;

							if (self.data.objectList) {
								var syncDataTasks = [];

								self.data.objectList.forEach(function (object) {
									syncDataTasks.push(function (next) {

										async.waterfall([
											function (cb) {
												self.controllers.ModelCreator.getModel(object.name)
													.fail(function (err) { cb(err); })
													.then(function (objectModel) {
														cb(null, objectModel);
													});
											},
											function (objectModel, cb) {
												objectModel.Cached.syncDataToServer()
													.fail(function (err) { cb(err); })
													.then(function () {
														cb(null);
														next();
													});
											}
										]);

									});
								});

								async.parallel(syncDataTasks, function (err) {
									if (err) {
										q.reject(err);
										return;
									}

									q.resolve();
								});
							}
							else {
								q.resolve();
							}

							return q;
						},

						createLinkColumn: function (linkObject, linkVia, linkColumnId) {
							var q = $.Deferred(),
								self = this;

							// Find link object
							var linkObj = self.data.objectList.filter(function (obj) { return obj.id == linkObject })[0];

							// Get object model
							self.controllers.ModelCreator.getModel(linkObj.name)
								.fail(function (err) { ok(err); })
								.then(function (objModel) {
									// Get cache
									var cachedFields = objModel.Cached.getNewFields(),
										linkCol = cachedFields.filter(function (f) { return f.id == linkVia; })[0],
										tempId = linkCol.id;

									linkCol.linkVia = linkColumnId;
									linkCol.weight = linkObj.columns.length + Object.keys(cachedFields).indexOf(linkVia) + 1;

									delete linkCol.id;

									// Create
									self.Model.ABColumn.create(linkCol)
										.fail(function (err) { q.reject(err) })
										.then(function (result) {
											objModel.Cached.deleteCachedField(tempId);

											if (result.translate) result.translate();

											q.resolve(result);
										});

								});

							return q;
						},

						resize: function (height) {
							var self = this;

							if ($$(self.options.objectView)) {
								$$(self.options.objectView).define('height', height - 120);
								$$(self.options.objectView).adjust();
							}

							self.controllers.ObjectWorkspace.resize(height);
						}


					});

				});
		});

	});