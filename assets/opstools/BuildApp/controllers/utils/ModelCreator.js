steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/utils/LocalBucket.js',
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
						},

						setAppName: function (appName) {
							this.data.appName = appName.replace('_', '').toLowerCase();
						},

						setObjectName: function (objectName) {
							this.data.objectName = objectName.replace('_', '').toLowerCase();
						},

						setDescribe: function (describe) {
							this.data.describe = describe;
						},

						setMultilingualFields: function (multilingualFields) {
							this.data.multilingualFields = multilingualFields;
						},


						enableLocalStorage: function () {
							this.localBucket.enable(this.data.objectName);
						},

						disableLocalStorage: function () {
							this.localBucket.disable(this.data.objectName);
						},


						getModel() {
							var self = this,
								modelName = "opstools.BuildApp.#appName#_#objectName#".replace("#appName#", self.data.appName).replace("#objectName#", self.data.objectName),
								model = AD.Model.get(modelName);

							if (model) {
								return model;
							}
							else {
								self.localBucket = self.controllers.LocalBucket.getBucket(self.data.appId);

								// /AB_applicationname/AB_applicationname_objectname
								var modelDefinition = {
									findAll: 'GET /AB_#appName#/AB_#appName#_#objectName#',
									findOne: 'GET /AB_#appName#/AB_#appName#_#objectName#/{id}',
									create: 'POST /AB_#appName#/AB_#appName#_#objectName#',
									update: 'PUT /AB_#appName#/AB_#appName#_#objectName#/{id}',
									destroy: 'DELETE /AB_#appName#/AB_#appName#_#objectName#/{id}',
									describe: function () { return self.data.describe; },
									multilingualFields: self.data.multilingualFields,
									fieldId: 'id',
									// fieldLabel: 'label'
								};

								for (var key in modelDefinition) {
									if (typeof modelDefinition[key] == 'string')
										modelDefinition[key] = modelDefinition[key].replace(/#appName#/g, self.data.appName).replace(/#objectName#/g, self.data.objectName);
								}

								AD.Model.Base.extend(modelName, modelDefinition, {});
								var base = AD.Model.Base.get(modelName);

								AD.Model.extend(modelName, {
									findAll: function (cond) {
										if (!self.localBucket.isEnable(self.data.objectName))
											return base.findAll(cond);

										var q = $.Deferred();

										var localResults = $.map(self.localBucket.get(self.data.objectName), function (r) { return r.data; }),
											localDestroyIds = self.localBucket.getDestroyIds(self.data.objectName);

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
										if (!self.localBucket.isEnable(self.data.objectName))
											return base.findOne(cond);

										var q = $.Deferred();

										var result = self.localBucket.get(self.data.objectName, cond.id);
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
										if (!self.localBucket.isEnable(self.data.objectName))
											return base.create(obj);

										var q = $.Deferred();

										self.localBucket.save(self.data.objectName, obj);
										q.resolve(obj);

										return q;
									},
									update: function (id, obj) {
										if (!self.localBucket.isEnable(self.data.objectName))
											return base.update(id, obj);

										var q = $.Deferred();

										self.localBucket.save(self.data.objectName, obj);
										q.resolve(obj);

										return q;
									},
									destroy: function (id) {
										if (!self.localBucket.isEnable(self.data.objectName))
											return base.destroy(id);

										var q = $.Deferred();

										self.localBucket.destroy(self.data.objectName, id);
										q.resolve({ id: id });

										return q;
									}
								}, {});

								return AD.Model.get(modelName);
							}
						}
					});
				})
		})
	});
