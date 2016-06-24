steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/utils/LocalBucket.js',
	'opstools/BuildApp/controllers/utils/ModelCreator.js',

	'opstools/BuildApp/models/ABObject.js',

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

							self.Model = {
								ABObject: AD.Model.get('opstools.BuildApp.ABObject')
							};

							self.options = AD.defaults({
								syncSaveDataEvent: 'AB_Object.SyncSaveData',
								syncDeleteDataEvent: 'AB_Object.SyncDeleteData',
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

							async.series([
								function (callback) {
									var saveDataActions = [],
										objectModelList = [];

									Object.keys(savedDataSource).forEach(function (objName) {
										saveDataActions.push(function (cb) {

											self.getObjectModel(objName).then(function (objectModel) {
												objectModelList.push(objectModel); // Store in array

												objectModel.enforceUpdateToDB(); // Sync data to real database

												// Sync update & add data
												savedDataSource[objName].forEach(function (d) {

													objectModel.findOne({ id: d.id })
														.fail(function (err) { cb(err); })
														.then(function (row) {
															if (typeof row.id == 'string' && row.id.startsWith('temp')) {
																row.removeAttr('id');
															}

															row.save() // Save to DB
																.fail(function (err) { cb(err); })
																.then(function () { cb(); });
														});

												});

											});

										});
									});

									async.series(saveDataActions, function (err) {
										// Cancel enforce update to database
										objectModelList.forEach(function (objectModel) {
											objectModel.cancelEnforceUpdateToDB();
										});

										callback(err);
									});
								},
								function (callback) {
									var deleteDataActions = [],
										objectModelList = [];

									Object.keys(destroyedDataSource).forEach(function (objName) {
										deleteDataActions.push(function (cb) {

											self.getObjectModel(objName).then(function (objectModel) {
												objectModelList.push(objectModel); // Store in array

												objectModel.enforceUpdateToDB(); // Sync data to real database

												// Sync delete data
												destroyedDataSource[objName].forEach(function (id) {
													objectModel.destroy(id)
														.fail(function (err) { cb(err); })
														.then(function () { cb(); });
												});

											});
										});
									});

									async.series(deleteDataActions, function (err) {
										// Cancel enforce update to database
										objectModelList.forEach(function (objectModel) {
											objectModel.cancelEnforceUpdateToDB();
										});

										callback(err);
									});
								},
								function (callback) {
									// Clear local data
									self.localBucket.clear();

									callback();

									// TODO
									q.resolve();
								}
							]);

							return q;
						},

						getObjectModel: function (objName) {
							var self = this,
								q = $.Deferred();

							self.controllers.ModelCreator.setObjectName(objName);
							self.Model.ABObject.findAll({ application: self.data.app.id, name: objName })
								.fail(function (err) {
									q.reject(err);
								})
								.then(function (result) {
									if (result.length < 1) {
										q.reject();
										return;
									}

									result = result[0];

									// Set Describe
									var describe = {};
									result.columns.forEach(function (c) {
										describe[c.name] = c.type;
									});
									self.controllers.ModelCreator.setDescribe(describe);

									// Set multilingual fields
									var multilingualFields = result.columns.filter(function (c) { return c.supportMultilingual; });
									multilingualFields = $.map(multilingualFields.attr(), function (f) { return f.name; });
									self.controllers.ModelCreator.setMultilingualFields(multilingualFields);

									q.resolve(self.controllers.ModelCreator.getModel());
								});

							return q;
						}

					})
				})
		})
	}
);