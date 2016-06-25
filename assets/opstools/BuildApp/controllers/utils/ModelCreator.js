steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/utils/LocalBucket.js',

	'opstools/BuildApp/models/ABObject.js',

	function () {
        System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control',
				'appdev/model/model').then(function () {
					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.ModelCreator', {

						init: function (element, options) {
							this.data = {};

							this.Model = {
								ABObject: AD.Model.get('opstools.BuildApp.ABObject')
							};

							this.options = AD.defaults({
								updateUnsyncCountEvent: 'AB_Object.LocalCount',
							}, options);

							this.initControllers();
						},

						initControllers: function () {
							var self = this;
							self.controllers = {};

							var LocalBucket = AD.Control.get('opstools.BuildApp.LocalBucket');

							self.controllers.LocalBucket = new LocalBucket(self.element, { updateUnsyncCountEvent: self.options.updateUnsyncCountEvent });
						},

						setAppId: function (appId) {
							this.data.appId = appId;

							this.localBucket = this.controllers.LocalBucket.getBucket(this.data.appId);
						},

						setAppName: function (appName) {
							this.data.appName = appName;
						},

						enableLocalStorage: function (objectName) {
							this.localBucket.enable(objectName);
						},

						disableLocalStorage: function (objectName) {
							this.localBucket.disable(objectName);
						},

						isLocalStorage: function (objectName) {
							return this.localBucket.isEnable(objectName);
						},

						getBaseModel: function (objectName, describe, multilingualFields) {
							if (!objectName || !describe || !multilingualFields) return;

							var formatAppName = this.data.appName.replace('_', '').toLowerCase(),
								formatObjectName = objectName.replace('_', '').toLowerCase(),
								modelName = "opstools.BuildApp.#appName#_#objectName#".replace("#appName#", formatAppName).replace("#objectName#", formatObjectName);

							// /AB_applicationname/AB_applicationname_objectname
							var modelDefinition = {
								findAll: 'GET /AB_#appName#/AB_#appName#_#objectName#',
								findOne: 'GET /AB_#appName#/AB_#appName#_#objectName#/{id}',
								create: 'POST /AB_#appName#/AB_#appName#_#objectName#',
								update: 'PUT /AB_#appName#/AB_#appName#_#objectName#/{id}',
								destroy: 'DELETE /AB_#appName#/AB_#appName#_#objectName#/{id}',
								describe: function () { return describe; },
								multilingualFields: multilingualFields,
								fieldId: 'id',
								// fieldLabel: 'label'
							};

							for (var key in modelDefinition) {
								if (typeof modelDefinition[key] == 'string')
									modelDefinition[key] = modelDefinition[key].replace(/#appName#/g, formatAppName).replace(/#objectName#/g, formatObjectName);
							}

							AD.Model.Base.extend(modelName, modelDefinition, {});

							return AD.Model.Base.get(modelName);
						},

						getModel: function (objectName) {
							if (!objectName) return;

							var self = this,
								q = $.Deferred(),
								formatAppName = self.data.appName.replace('_', '').toLowerCase(),
								formatObjectName = objectName.replace('_', '').toLowerCase(),
								modelName = "opstools.BuildApp.#appName#_#objectName#".replace("#appName#", formatAppName).replace("#objectName#", formatObjectName),
								model = AD.Model.get(modelName);

							if (model) {
								q.resolve(model);
							}
							else {
								self.updateModel(objectName)
									.fail(function (err) { q.reject(err); })
									.then(function () {
										q.resolve(AD.Model.get(modelName));
									});
							}

							return q;
						},

						updateModel(objectName) {
							if (!objectName) return;

							var self = this,
								q = $.Deferred(),
								formatAppName = self.data.appName.replace('_', '').toLowerCase(),
								formatObjectName = objectName.replace('_', '').toLowerCase(),
								modelName = "opstools.BuildApp.#appName#_#objectName#".replace("#appName#", formatAppName).replace("#objectName#", formatObjectName);

							// Get object definition
							self.Model.ABObject.findAll({ application: self.data.appId, name: objectName })
								.fail(function (err) {
									q.reject(err);
								})
								.then(function (objectData) {
									if (objectData.length < 1) {
										q.reject();
										return;
									}
									objectData = objectData[0];

									// Set Describe
									var describe = {};
									objectData.columns.forEach(function (c) {
										describe[c.name] = c.type;
									});

									// Set multilingual fields
									var multilingualFields = objectData.columns.filter(function (c) { return c.supportMultilingual; });
									multilingualFields = $.map(multilingualFields.attr(), function (f) { return f.name; });

									// Get base model
									var base = self.getBaseModel(objectName, describe, multilingualFields);

									// Init object model
									AD.Model.extend(modelName, {
										findAll: function (cond) {
											if (!self.localBucket.isEnable(objectName))
												return base.findAll(cond);

											var q = $.Deferred();

											var localResults = self.localBucket.get(objectName),
												localDestroyIds = self.localBucket.getDestroyIds(objectName);

											base.findAll(cond)
												.fail(function (err) {
													q.resolve(localResults);
												})
												.then(function (r) {
													var dataList = r.attr();

													// Sync update
													dataList.forEach(function (d, index) {
														var exists = $.grep(localResults, function (localData) { return localData.id == d.id; });

														if (exists && exists.length > 0) {
															dataList[index] = exists[0];
														}
													});

													// Sync create
													localResults.forEach(function (localData) {
														var exists = $.grep(dataList, function (d) { return localData.id == d.id; });

														if (!exists || exists.length < 1) {
															dataList.push(localData);
														}
													});

													// Sync delete
													dataList = $.grep(dataList, function (d) { return $.inArray(d.id, localDestroyIds) < 0; });

													q.resolve(dataList);
												});

											return q;
										},
										findOne: function (cond) {
											if (!self.localBucket.isEnable(objectName))
												return base.findOne(cond);

											var q = $.Deferred();

											var result = self.localBucket.get(objectName, cond.id);
											if (result && result.length > 0) {
												q.resolve(result[0]);
											}
											else {
												base.findOne(cond)
													.fail(function (err) {
														q.reject(err);
													})
													.then(function (r) {
														q.resolve(r);
													});
											}

											return q;
										},
										create: function (obj) {
											Object.keys(obj).forEach(function (key) {
												if (typeof obj[key] == 'undefined' || obj[key] == null)
													delete obj[key];
											});

											if (!self.localBucket.isEnable(objectName) || this.forceToDB)
												return base.create(obj);

											var q = $.Deferred();

											self.localBucket.save(objectName, obj);
											q.resolve(obj);

											return q;
										},
										update: function (id, obj) {
											Object.keys(obj).forEach(function (key) {
												if (typeof obj[key] == 'undefined' || obj[key] == null)
													delete obj[key];
											});

											if (!self.localBucket.isEnable(objectName) || this.forceToDB)
												return base.update(id, obj);

											var q = $.Deferred();

											self.localBucket.save(objectName, obj);
											q.resolve(obj);

											return q;
										},
										destroy: function (id) {
											if (!self.localBucket.isEnable(objectName) || this.forceToDB)
												return base.destroy(id);

											var q = $.Deferred();

											self.localBucket.saveDestroy(objectName, id);
											q.resolve({ id: id });

											return q;
										},



										enforceUpdateToDB: function () { // For sync data to real database
											this.forceToDB = true;
										},
										cancelEnforceUpdateToDB: function () {
											this.forceToDB = false;
										},
									}, {});

									q.resolve(AD.Model.get(modelName));
								});

							return q;
						}

					});
				})
		})
	});
