steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/models/ABObject.js',
	'opstools/BuildApp/models/ABColumn.js',

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
								countCachedItemEvent: 'AB_Cached.Count'
							}, options);

							this._super(element, options);

							this.Model = {
								ABObject: AD.Model.get('opstools.BuildApp.ABObject'),
								ABColumn: AD.Model.get('opstools.BuildApp.ABColumn')
							};
						},

						defineBaseModel: function (objectName, describe, multilingualFields, associations) {
							if (!objectName || !describe || !multilingualFields) throw new Error('Invalid parameters');

							var formatAppName = AD.classes.AppBuilder.currApp.name.replace(/_/g, ''),
								formatObjectName = objectName.replace(/_/g, ''),
								modelName = "opstools.AB_#appName#.AB_#appName#_#objectName#".replace(/#appName#/g, formatAppName).replace(/#objectName#/g, formatObjectName);

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
								associations: associations,
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
							var q = $.Deferred();

							if (!objectName) {
								q.reject(new Error('The object name is required.'));
								return q;
							}

							var self = this,
								formatAppName = AD.classes.AppBuilder.currApp.name.replace(/_/g, ''),
								formatObjectName = objectName.replace(/_/g, ''),
								modelName = "opstools.AB_#appName#.AB_#appName#_#objectName#".replace(/#appName#/g, formatAppName).replace(/#objectName#/g, formatObjectName),
								model = AD.Model.get(modelName);

							if (model && model.Cached) {
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

						updateModel: function (objectName) {
							var q = $.Deferred();

							if (!objectName) {
								q.reject(new Error('The object name is required.'));
								return q;
							}

							var self = this,
								formatAppName = AD.classes.AppBuilder.currApp.name.replace(/_/g, ''),
								formatObjectName = objectName.replace(/_/g, ''),
								modelName = "opstools.AB_#appName#.AB_#appName#_#objectName#".replace(/#appName#/g, formatAppName).replace(/#objectName#/, formatObjectName);

							// Get object definition
							self.Model.ABObject.findAll({ application: AD.classes.AppBuilder.currApp.id, name: objectName })
								.fail(function (err) {
									q.reject(err);
								})
								.then(function (objectData) {
									if (objectData.length < 1) {
										q.reject(new Error('System could not found this object name.'));
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

									var associations = {};

									// Set associations
									self.Model.ABColumn.findAll({ object: objectData.id, linkObject: { '!': null } })
										.fail(q.reject)
										.then(function (columns) {
											columns.forEach(function (col) {
												// opstools.BuildApp.#appName#_#objectName#
												// opstools.#appName#.#appName#_#objectName#
												associations[col.name] = "opstools.AB_#appName#.AB_#appName#_#objectName#".replace(/#appName#/g, formatAppName).replace(/#objectName#/g, col.linkObject.name);
											});

											// Define base model
											try {
												self.defineBaseModel(objectName, describe, multilingualFields, associations);
											}
											catch (err) {
												q.reject(err);
												return;
											}

											// Init object model
											AD.Model.extend(modelName, {
												// useSockets: true
											}, {});
											var modelResult = AD.Model.get(modelName);


											// Setup cached model
											var cachedKey = '#appName#_#objectName#_cache'.replace(/#appName#/g, formatAppName).replace(/#objectName#/g, formatObjectName);
											self.initModelCached(objectName, modelResult, cachedKey);

											q.resolve(modelResult);
										});

								});

							return q;
						},

						initModelCached: function (objectName, model, cachedKey) {
							var self = this;

							// Initial cache object
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
									findAllPopulate: function (params, fields) {
										var findAllPopulateFn = model.findAllPopulate.bind(model);

										return model.Cached.makeFindAllPopulate(findAllPopulateFn).call(model.Cached, params, fields);
									},
									create: function (obj) { return model.create(obj); },
									update: function (id, saveObj) { return model.update(id, saveObj); },
									destroy: function (id) { return model.destroy(id); }
									// create: function (obj) { return model.create.call(model.Cached, obj); },
									// update: function (id, saveObj) { return model.update.call(model.Cached, id, saveObj); },
									// destroy: function (id) { return model.destroy.call(model.Cached, id); }

								}, {});

							// Initial cache event
							model.Cached.registerActionEvent(function (data) {
								switch (data.action) {
									case 'count':
										self.element.trigger(self.options.countCachedItemEvent, { objectName: objectName, count: data.count });
										break;
								}
							});
						}

					});
				})
		})
	});
