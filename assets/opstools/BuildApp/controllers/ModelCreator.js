steal(
	// List your Controller's dependencies here:
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

						getModel() {
							var self = this,
								modelName = "opstools.BuildApp.#appName#_#objectName#".replace("#appName#", self.data.appName).replace("#objectName#", self.data.objectName),
								model = AD.Model.get(modelName);

							if (model) {
								return model;
							}
							else {
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
								AD.Model.extend(modelName, {}, {});

								return AD.Model.get(modelName);
							}
						}
					});
				})
		})
	});
