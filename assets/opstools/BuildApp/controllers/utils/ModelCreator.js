steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/models/ABObject.js',

	'opstools/BuildApp/controllers/utils/ModelCached.js',

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
							}, options);

							this.Model = {
								ABObject: AD.Model.get('opstools.BuildApp.ABObject')
							};
						},

						setApp: function (app) {
							this.data.appId = app.id;
							this.data.appName = app.name;
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
									var cachedKey = '#appName#_#objectName#_cache'.replace('#appName#', formatAppName).replace('#objectName#', formatObjectName);
									self.initModelCached(modelResult, cachedKey);

									q.resolve(modelResult);
								});

							return q;
						},

						initModelCached: function (model, cachedKey) {
							model.Cached = ab.Model.Cached(
								{
									cachedKey: function () {
										return cachedKey
									},
									fieldId: 'id',
									describe: model.describe,
									multilingualFields: model.multilingualFields,
									findAll: function (params) {
										var q = $.Deferred();

										model.findAll(params)
											.fail(function (err) { q.reject(err); })
											.then(function (result) { q.resolve(result); });

										return q;
									},
									findOne: function (params) {
										var q = $.Deferred();

										model.findOne(params)
											.fail(function (err) { q.reject(err); })
											.then(function (result) { q.resolve(result); });

										return q;
									},
									create: function (obj) { return model.create(obj); },
									update: function (id, saveObj) { return model.update(id, saveObj); },
									destroy: function (id) { return model.destroy(id); }
									// create: function (obj) { return model.create.call(model.Cached, obj); },
									// update: function (id, saveObj) { return model.update.call(model.Cached, id, saveObj); },
									// destroy: function (id) { return model.destroy.call(model.Cached, id); }

								}, {});
						}

					});
				})
		})
	});
