
steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/utils/ModelCreator.js',

	'opstools/BuildApp/controllers/ObjectList.js',
	'opstools/BuildApp/controllers/ObjectWorkspace.js',

	'opstools/BuildApp/models/ABList.js',

	function (modelCreator) {
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
								ObjectWorkspace = AD.Control.get('opstools.BuildApp.ObjectWorkspace');

							self.controllers.ObjectList = new ObjectList(self.element, {
								selectedObjectEvent: self.options.selectedObjectEvent,
								updatedObjectEvent: self.options.updatedObjectEvent,
								deletedObjectEvent: self.options.deletedObjectEvent
							});
							self.controllers.ObjectWorkspace = new ObjectWorkspace(self.element);
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
								var currObj = AD.classes.AppBuilder.currApp.objects.filter(function (obj) { return obj.id == id });
								if (currObj && currObj.length > 0)
									AD.classes.AppBuilder.currApp.currObj = currObj[0];

								self.controllers.ObjectWorkspace.showTable();
							});

							self.controllers.ObjectList.on(self.options.deletedObjectEvent, function (event, data) {
								// Clear cache
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

						refresh: function () {
							var self = this;

							self.controllers.ObjectWorkspace.resetState();

							self.controllers.ObjectList.resetState();
							self.controllers.ObjectList.refreshObjectList();
							self.controllers.ObjectList.refreshUnsyncNumber();

							if (AD.classes.AppBuilder.currApp.currObj)
								self.controllers.ObjectList.selectObjectItem(AD.classes.AppBuilder.currApp.currObj.id);
						},

						syncObjectFields: function () {
							var self = this,
								q = $.Deferred();

							if (AD.classes.AppBuilder.currApp.objects.length < 1) {
								q.resolve();
								return q;
							}

							async.eachSeries(AD.classes.AppBuilder.currApp.objects, function (object, next) {
								// Get object model
								var objectModel = modelCreator.getModel(AD.classes.AppBuilder.currApp, object.name);

								// Get cached fields
								var newFields = objectModel.Cached.getNewFields();

								if (!newFields || newFields.length < 1)
									return next();

								newFields.sort(function (a, b) { return a.weight - b.weight; });

								var saveFieldsTasks = [];

								newFields.forEach(function (field, index) {
									saveFieldsTasks.push(function (callback) {
										var tempId = field.id;
										delete field.id;

										if (typeof field.weight == 'undefined' || field.weight == null)
											field.weight = object.columns.length + index;

										async.waterfall([
											// Create object column
											function (ok) {
												object.createColumn(field)
													.fail(ok)
													.then(function (result) {
														// Delete field cache
														objectModel.Cached.deleteCachedField(tempId);

														ok(null, result);
													});
											},
											// Create link column
											function (column, ok) {
												var isLinkToSelf = (field.setting.linkObject == field.object);
												if (field.setting.linkObject && field.setting.linkVia) {
													self.createLinkColumn(field.setting.linkObject, field.setting.linkVia, column.id)
														.fail(ok)
														.then(function (linkCol) {
															// set linkVia
															column.setting.attr('linkVia', linkCol.id);
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
												if (field.setting.editor === 'richselect' && field.setting.options) {
													var createOptionEvents = [];

													field.setting.options.forEach(function (opt, index) {
														createOptionEvents.push(function (createOk) {
															var list_key = self.Model.ABList.getKey(object.application.name, object.name, column.name);

															self.Model.ABList.create({
																key: list_key,
																weight: index + 1,
																column: column.id,
																label: opt.value,
																value: opt.value
															})
																.fail(createOk)
																.then(function (createdCol) {
																	// set dataId to option
																	opt.dataId = createdCol.id;
																	createOk();
																});
														});
													});

													async.parallel(createOptionEvents, function (err) {
														if (err) return ok(err);

														// Save dataId to options
														column.setting.attr('options', field.setting.options);
														column.save()
															.fail(ok)
															.then(function (result) {
																ok();
															});
													});
												}
												else {
													ok();
												}
											}
										], callback);
									});
								});

								async.parallel(saveFieldsTasks, function (err) {
									// Update object model
									modelCreator.updateModel(AD.classes.AppBuilder.currApp, object.name);

									next(err);
								});
							}, function (err) {
								if (err)
									q.reject(err);
								else
									q.resolve();
							});

							return q;
						},

						syncData: function () {
							var q = $.Deferred(),
								self = this;

							if (!AD.classes.AppBuilder.currApp.objects || AD.classes.AppBuilder.currApp.objects.length < 1) {
								q.resolve();
								return q;
							}

							var syncDataTasks = [];

							AD.classes.AppBuilder.currApp.objects.forEach(function (object) {
								syncDataTasks.push(function (next) {
									var objectModel = modelCreator.getModel(AD.classes.AppBuilder.currApp, object.name);

									objectModel.Cached.syncDataToServer()
										.fail(next)
										.then(function () {
											next();
										});

								});
							});

							async.parallel(syncDataTasks, function (err) {
								if (err)
									q.reject(err);
								else
									q.resolve();
							});

							return q;
						},

						createLinkColumn: function (linkObject, linkVia, linkColumnId) {
							var q = $.Deferred(),
								self = this;

							// Find link object
							var linkObj = AD.classes.AppBuilder.currApp.objects.filter(function (obj) { return obj.id == linkObject })[0];

							// Get object model
							var objModel = modelCreator.getModel(AD.classes.AppBuilder.currApp, linkObj.name);

							// Get cache
							var cachedFields = objModel.Cached.getNewFields(),
								linkCol = cachedFields.filter(function (f) { return f.id == linkVia; })[0],
								tempId = linkCol.id;

							linkCol.setting.linkVia = linkColumnId;
							linkCol.weight = linkObj.columns.length + Object.keys(cachedFields).indexOf(linkVia) + 1;

							delete linkCol.id;

							// Create
							linkObj.createColumn(linkCol)
								.fail(function (err) { q.reject(err) })
								.then(function (result) {
									objModel.Cached.deleteCachedField(tempId);

									if (result.translate) result.translate();

									q.resolve(result);
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