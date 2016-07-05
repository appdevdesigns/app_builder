steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/utils/ModelCached.js',
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
						},

						setAppId: function (appId) {
							this.data.appId = appId;
						},

						setAppName: function (appName) {
							this.data.appName = appName;
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

									// Init object model
									AD.Model.extend(modelName, {}, {});
									var modelResult = AD.Model.get(modelName);

									// Setup cached model
									modelResult.Cached = ab.Model.Cached(
										{
											cachedKey: function () {
												return '#appName#_#objectName#_cache'.replace('#appName#', formatAppName).replace('#objectName#', formatObjectName)
											},
											fieldId: 'id',
											describe: modelResult.describe,
											multilingualFields: modelResult.multilingualFields,
											findAll: function (params) {
												var q = $.Deferred();

												modelResult.findAll(params)
													.fail(function (err) { q.reject(err); })
													.then(function (result) { q.resolve(result); });

												return q;
											},
											findOne: function (params) {
												var q = $.Deferred();

												modelResult.findOne(params)
													.fail(function (err) { q.reject(err); })
													.then(function (result) { q.resolve(result); });

												return q;
											},
											create: function (obj) { return modelResult.create.call(modelResult.Cached, obj); },
											update: function (id, saveObj) { return modelResult.update.call(modelResult.Cached, id, saveObj); },
											destroy: function (id) { return modelResult.destroy.call(modelResult.Cached, id); }

										}, {});

									q.resolve(modelResult);
								});

							return q;
						}

					});
				})
		})
	});
