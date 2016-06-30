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
								// useSockets: true,
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
									.then(function (modelResult) {
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

									var staticProps = {
										findAll: function (params) { return base.findAll(params); },
										findOne: function (params) { return base.findOne(params); },
										describe: base.describe,
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
									};

									var protoProps = {};

									// Init object model
									AD.Model.extend(modelName, staticProps, protoProps);

									var modelResult = AD.Model.get(modelName);

									// Setup cached model
									var cachedStaticProps = $.extend(staticProps, {
										cachedKey: function () {
											return 'cached' + modelName;
										}
									})
									modelResult.Cached = can.Model.Cached(cachedStaticProps, protoProps);

									q.resolve(modelResult);
								});

							return q;
						}

					});
				})
		})
	});
