steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/utils/LocalBucket.js',
	'opstools/BuildApp/controllers/utils/ModelCreator.js',
	function () {
        System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control',
				'appdev/model/model').then(function () {
					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.DataUpdater', {

						init: function (element, options) {
							var self = this;

							self.data = {};

							self.options = AD.defaults({
								syncSaveDataEvent: 'AB_Object.SyncSaveData',
								syncDeleteDataEvent: 'AB_Object.SyncDeleteData',
								errorSaveDataEvent: 'AB_Object.ErrorSaveData',
								errorDeleteDataEvent: 'AB_Object.ErrorDeleteData',
							}, options);

							self.initControllers();
						},

						initControllers: function () {
							var self = this;
							self.controllers = {};

							var LocalBucket = AD.Control.get('opstools.BuildApp.LocalBucket'),
								ModelCreator = AD.Control.get('opstools.BuildApp.ModelCreator');

							self.controllers.LocalBucket = new LocalBucket(self.element);
							self.controllers.ModelCreator = new ModelCreator(self.element);
						},

						setApp: function (app) {
							var self = this;

							self.data.app = app;

							self.localBucket = self.controllers.LocalBucket.getBucket(app.id);
							self.controllers.ModelCreator.setAppId(app.id);
							self.controllers.ModelCreator.setAppName(app.name);
						},

						syncData: function () {
							var self = this,
								q = $.Deferred();

							var savedDataSource = self.localBucket.getAll();
							var destroyedDataSource = self.localBucket.getDestroyAll();

							var saveDataActions = [],
								deleteDataActions = [],
								objectModelList = [];

							async.series([
								function (callback) {
									var prepareSaveDataActions = [];

									if (savedDataSource.length < 1) callback();

									Object.keys(savedDataSource).forEach(function (objName) {

										prepareSaveDataActions.push(function (next) {

											self.controllers.ModelCreator.updateModel(objName).then(function () {
												self.controllers.ModelCreator.getModel(objName).then(function (objectModel) {
													if ($.inArray(objectModel, objectModelList) < 0) {
														objectModel.enforceUpdateToDB(); // Sync data to real database

														objectModelList.push(objectModel); // Store in array
													}

													// Sync update & add data
													savedDataSource[objName].forEach(function (d) {

														saveDataActions.push(function (cb) {

															objectModel.findOne({ id: d.id })
																.fail(function (err) { cb(err); })
																.then(function (row) {
																	var oldId = null,
																		type = '';

																	if (typeof row.id == 'string' && row.id.startsWith('temp')) {
																		oldId = row.attr('id');
																		type = 'add';

																		row.removeAttr('id');
																	}
																	else {
																		type = 'update';
																	}

																	row.save() // Save to DB
																		.fail(function (err) {
																			self.element.trigger(self.options.errorSaveDataEvent, { id: oldId, err: err, objName: objName, type: type });

																			cb();
																		})
																		.then(function (result) {
																			self.element.trigger(self.options.syncSaveDataEvent, { id: result.id, oldId: oldId, objName: objName, type: type });

																			if (oldId) // Change destroy row id
																				self.localBucket.changeDestroyId(objName, oldId, result.id);

																			cb();
																		});
																});

														});

													});

													next();
												});
											});

										});
									});

									async.series(prepareSaveDataActions, callback);
								},

								function (callback) {
									if (saveDataActions.length < 1) callback();

									saveDataActions.push(function (next) {
										// Cancel enforce update to database
										objectModelList.forEach(function (objectModel) {
											objectModel.cancelEnforceUpdateToDB();
										});

										objectModelList = [];

										next();
									});

									// Clear state after sync create/save data
									async.series(saveDataActions, callback);
								},

								function (callback) {
									var prepareDeleteDataActions = [];

									if (destroyedDataSource.length < 1) callback();

									Object.keys(destroyedDataSource).forEach(function (objName) {

										prepareDeleteDataActions.push(function (next) {

											self.controllers.ModelCreator.updateModel(objName).then(function () {

												self.controllers.ModelCreator.getModel(objName).then(function (objectModel) {
													if ($.inArray(objectModel, objectModelList) < 0) {
														objectModelList.push(objectModel); // Store in array

														objectModel.enforceUpdateToDB(); // Sync data to real database
													}

													// Sync delete data
													destroyedDataSource[objName].forEach(function (d) {

														deleteDataActions.push(function (cb) {

															destroyedDataSource[objName].forEach(function (id) {
																if (typeof id == 'string' && id.startsWith('temp')) {
																	// Delete data from local storage
																	self.element.trigger(self.options.syncDeleteDataEvent, { id: id, objName: objName });
																}
																else {
																	objectModel.destroy(id) // Delete data to DB
																		.fail(function (err) {
																			self.element.trigger(self.options.errorDeleteDataEvent, { id: id, err: err, objName: objName });

																			cb();
																		})
																		.then(function (result) {
																			self.element.trigger(self.options.syncDeleteDataEvent, { id: result.id, objName: objName });

																			cb();
																		});
																}
															});

														});
													});

													next();
												});

											});
										});

									});

									async.series(prepareDeleteDataActions, callback);
								},

								function (callback) {
									if (deleteDataActions.length < 1) callback();

									deleteDataActions.push(function (next) {
										// Cancel enforce update to database
										objectModelList.forEach(function (objectModel) {
											objectModel.cancelEnforceUpdateToDB();
										});

										next(err);
									});

									// Clear state after sync delete data
									async.series(deleteDataActions, callback);
								},

								function (callback) {
									callback();

									q.resolve();
								}
							]);

							return q;
						}


					})
				})
		})
	}
);