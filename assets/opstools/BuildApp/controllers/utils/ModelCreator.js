steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/utils/ModelCached.js',
	function () {

		function defineBaseModel(application, objectName, describe, multilingualFields, associations, urlPath) {
			if (!objectName || !describe || !multilingualFields) throw new Error('Invalid parameters');

			var formatAppName = application.name.replace(/_/g, ''),
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
			if (urlPath) {
				// Some models may have non-standard REST URL paths
				modelDefinition.findAll ='GET /' + urlPath;
				modelDefinition.findOne = 'GET /' + urlPath + '/{id}';
				modelDefinition.create = 'POST /' + urlPath;
				modelDefinition.update = 'PUT /' + urlPath + '/{id}';
				modelDefinition.destroy = 'DELETE /' + urlPath + '/{id}';
			}

			for (var key in modelDefinition) {
				if (typeof modelDefinition[key] == 'string')
					modelDefinition[key] = modelDefinition[key].replace(/#appName#/g, formatAppName).replace(/#objectName#/g, formatObjectName);
			}

			AD.Model.Base.extend(modelName, modelDefinition, {});

			return AD.Model.Base.get(modelName);
		};

		return {
			getModel: function (application, objectName) {
				if (!objectName) {
					console.log('The object name is required.');
					return null;
				}

				var formatAppName = application.name.replace(/_/g, ''),
					formatObjectName = objectName.replace(/_/g, ''),
					modelName = "opstools.AB_#appName#.AB_#appName#_#objectName#".replace(/#appName#/g, formatAppName).replace(/#objectName#/g, formatObjectName),
					model = AD.Model.get(modelName);

				if (model && model.Cached) {
					return model;
				}
				else {
					this.updateModel(application, objectName);

					return AD.Model.get(modelName);
				}
			},

			updateModel: function (application, objectName) {
				if (!objectName) {
					console.error('The object name is required.');
					return null;
				}

				var self = this,
					formatAppName = application.name.replace(/_/g, ''),
					formatObjectName = objectName.replace(/_/g, ''),
					modelName = "opstools.AB_#appName#.AB_#appName#_#objectName#".replace(/#appName#/g, formatAppName).replace(/#objectName#/, formatObjectName);

				// Get object definition
				var objectData = application.objects.filter(function (obj) { return obj.name == objectName; });

				if (!objectData || objectData.length < 1) {
					AD.error.log('System could not found this object.', {
						objectName:objectName,
						application:application,
						modelName:modelName
					});
					return null;
				}

				objectData = objectData[0];
				
				var urlPath = objectData.urlPath || null;

				// Set Describe
				var describe = {};
				objectData.columns.forEach(function (col) {
					describe[col.name] = col.type;
				});

				// Set multilingual fields
				var multilingualFields = objectData.columns.filter(function (col) { return col.setting && (col.setting.supportMultilingual == 1 || col.setting.supportMultilingual == true); });
				multilingualFields = $.map(multilingualFields.attr(), function (f) { return f.name; });

				// Set associations
				var associations = {};
				var linkFields = objectData.columns.filter(function (col) { return col.setting && col.setting.linkObject; });
				linkFields.forEach(function (linkCol) {
					var linkObject = application.objects.filter(function (obj) { return obj.id == linkCol.setting.linkObject });

					if (!linkObject || linkObject.length < 1) return null;

					linkObject = linkObject[0];

					// opstools.BuildApp.#appName#_#objectName#
					// opstools.#appName#.#appName#_#objectName#
					associations[linkCol.name] = "opstools.AB_#appName#.AB_#appName#_#objectName#".replace(/#appName#/g, formatAppName).replace(/#objectName#/g, linkObject.name);
				});

				// Define base model
				try {
					defineBaseModel(application, objectName, describe, multilingualFields, associations, urlPath);
				}
				catch (err) {
					console.error(err);
					return null;
				}

				// Init object model
				AD.Model.extend(modelName, {
					useSockets: true
				}, {});

				var modelResult = AD.Model.get(modelName);

				// Setup cached model
				var cachedKey = '#appName#_#objectName#_cache'.replace(/#appName#/g, formatAppName).replace(/#objectName#/g, formatObjectName);
				self.initModelCached(objectName, modelResult, cachedKey, objectData.columns.attr());

				return modelResult;
			},

			initModelCached: function (objectName, model, cachedKey, columns) {
				var self = this;

				// Initial cache object
				model.Cached = ab.Model.Cached(
					{
						cachedKey: function () {
							return cachedKey
						},
						fieldId: 'id',
						columns: columns,
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
					}, {});

				// Initial cache event
				model.Cached.registerActionEvent(function (data) {
					switch (data.action) {
						case 'count':
							$(self).trigger('AB_Cached.Count', { objectName: objectName, count: data.count });
							break;
					}
				});
			}
		};

	}
);