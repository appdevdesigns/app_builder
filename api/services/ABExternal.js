var uuid = require('node-uuid');
var path = require('path');

var ABObject = require(path.join(__dirname,  "..", "classes",  "ABObject.js"));

// Build a reference of AB defaults for all supported Sails data field types
var FieldManager = require(path.join('..', 'classes', 'ABFieldManager.js'));
var sailsToAppBuilderReference = {};
FieldManager.allFields().forEach((Field) => {
	let field = new Field({ settings: {} }, {});
	field.fieldOrmTypes().forEach((type) => {
		sailsToAppBuilderReference[type] = {
			key: field.key,
			icon: field.icon,
			settings: field.settings,
		};
	});
});

module.exports = {

	/**
	 * Get the list of Sails model
	 * 
	 * @return Array
	 * 		Return an array contains model names
	 */
	getModels: function () {

		return Object.keys(sails.models);

	},



	/**
	 * Imports an existing Sails model for use in an AB application.
	 * An AB object will be created for that model.
	 *
	 * @param integer appID
	 * @param string modelName
	 * @param [{
	 *      name: string,
	 *      label: string
	 * }] columnList
	 * @return Promise
	 *     Resolves with the data of the new imported object
	 **/
	modelToObject: function (appID, modelName, columnList) {

		return new Promise((resolve, reject) => {

			var model = sails.models[modelName.toLowerCase()];

			if (!model || !model.definition)
				return reject(new Error('unrecognized model: ' + modelName));

			var application;
			var objectExternal;
			var languages = [];
			var columns = [];
			var associations = [];
			var modelURL = '';

			async.series([
				// Make sure model has an 'id' primary key field
				(next) => {
					if (!model.attributes.id) {
						next(new Error('Model ' + modelName + ' does not have an "id" column'));
					}
					else next();
				},

				// Find server side controller & blueprints URL
				(next) => {
					var lcModelName = modelName.toLowerCase();
					var controllerInfo = _.find(sails.controllers, (c) => {
						// 1st try: look for `model` config in the controllers
						if (c._config && c._config.model == lcModelName)
							return true;
						else
							return false;
					});
					if (!controllerInfo) {
						// 2nd try: look for matching controller-model name
						controllerInfo = _.find(sails.controllers, (c) => {
							if (!c.identity) return false;
							var nameParts = c.identity.split('/');
							var finalName = nameParts[nameParts.length - 1];
							if (finalName == lcModelName)
								return true;
							else
								return false;
						});
					}

					modelURL = controllerInfo && controllerInfo.identity || '';
					next();
				},

				// Find app in database
				(next) => {
					ABApplication.find({ id: appID })
						.exec(function (err, list) {
							if (err) {
								next(err);
							}
							else if (!list || !list[0]) {
								next(new Error('application not found: ' + appID));
							}
							else {
								application = list[0];
								next();
							}
						});
				},

				// Find site languages
				(next) => {
					SiteMultilingualLanguage.find()
						.exec((err, list) => {
							if (err) next(err);
							else if (!list || !list[0]) {
								languages = ['en'];
								next();
							}
							else {
								list.forEach((lang) => {
									languages.push(lang.language_code);
								});
								next();
							}
						});
				},

				// Prepare object
				(next) => {
					var objectData = {
						id: uuid(),
						name: modelName,
						tableName: model.tableName,
						labelFormat: "",
						isExternal: 1,
						urlPath: modelURL,
						translations: [],
						fields: []
					};

					// Add label translations
					languages.forEach((langCode) => {
						objectData.translations.push({
							language_code: langCode,
							label: modelName
						});
					});

					// get ABObject
					objectExternal = new ABObject(objectData, application.toABClass());

					next();
				},

				// Prepare object fields
				(next) => {
					for (var colName in model.attributes) {
						var col = model.attributes[colName];

						// In Sails models, there is a `definition` object and
						// an `attributes` object. The `definition` uses the
						// real column names and has additional properties.
						var realName = col.columnName || colName;
						var def = model.definition[realName];

						// Skip these columns
						var ignore = ['id', 'createdAt', 'updatedAt'];
						if (ignore.indexOf(colName) >= 0) {
							continue;
						}

						// Skip foreign keys.
						// They will be handled as associations later.
						if (!def || col.model || col.collection || def.foreignKey) {
							continue;
						}

						// Skip if column name is not match in list
						var allowCol = columnList.filter(function (c) { return c.name == realName })[0];
						if (allowCol == null) {
							continue;
						}

						// Check if the column's type is supported
						if (!sailsToAppBuilderReference[col.type]) {
							return next(new Error(`${modelName} contains a column "${colName}" that is of an unsupported type: ${col.type}`));
						}

						var defaultValue = col.default;
						if (typeof col.default == 'function') {
							defaultValue = col.default();
						}

						// Clone the reference defaults for this type
						var colData = _.cloneDeep(sailsToAppBuilderReference[col.type]);
						// Populate with imported values
						colData.id = uuid.v4();
						colData.columnName = colName;
						colData.settings.default = defaultValue;
						colData.settings.imported = true;

						// Label translations
						colData.translations = [];
						languages.forEach((langCode) => {
							colData.translations.push({
								language_code: langCode,
								label: colName
							});
						});

						console.log('Adding column:', colData);

						objectExternal.fieldNew(colData);
					}
					next();
				},

				// Create column associations in database
				function (next) {

					// TODO
					return next();

					/*
						model.associations == [
							{
								alias: 'assoc name 1',
								type: 'collection',
								collection: 'model name',
								via: 'column name'
							},
							{
								alias: 'assoc name 2',
								type: 'model',
								model: 'model name'
							}
						]
					*/

					async.forEach(model.associations, function (assoc, assocDone) {

						var targetLinkName, targetRelation, targetModelName;

						if (assoc.type == 'model') {
							targetRelation = 'one';
							targetModelName = assoc.model;
						} else {
							targetRelation = 'many';
							targetModelName = assoc.collection;
						}

						var targetModel = sails.models[targetModelName];
						var sourceRelation = 'one';
						if (Array.isArray(targetModel.associations)) {
							targetModel.associations.forEach((targetModelAssoc) => {
								if (targetModelAssoc.collection == modelName.toLowerCase()) {
									sourceRelation = 'many';
									targetLinkName = targetModelAssoc.alias;
								}
								else if (targetModelAssoc.model == modelName.toLowerCase()) {
									targetLinkName = targetModelAssoc.alias;
								}
							});
						}

						// Look for target object within application
						var targetObject;
						for (var i = 0; i < application.json.objects.length; i++) {
							if (application.json.objects[i].name == targetModelName) {
								targetObject = application.json.objects[i];
								break;
							}
						};

						// Skip if the target object has not been imported into
						// this application yet.
						if (!targetObject) return assocDone();

						//// Create the new connection columns:
						// Clone the reference defaults
						var sourceColData = _.cloneDeep(sailsToAppBuilderReference.connectObject);
						var targetColData = _.cloneDeep(sailsToAppBuilderReference.connectObject);

						// Populate with imported values:
						sourceColData.id = uuid.v4();
						targetColData.id = uuid.v4();

						// Source column
						sourceColData.columnName = assoc.alias;
						sourceColData.settings.isImported = true;
						sourceColData.settings.linkType = sourceRelation;
						sourceColData.settings.linkViaType = targetRelation;
						sourceColData.settings.linkObject = targetObject.id;
						sourceColData.settings.linkColumn = targetColData.id;
						sourceColData.translations = [];
						languages.forEach((langCode) => {
							sourceColData.translations.push({
								language_code: langCode,
								label: assoc.alias
							});
						});

						// Target column
						targetColData.columnName = targetLinkName;
						targetColData.settings.isImported = true;
						targetColData.settings.linkType = targetRelation;
						targetColData.settings.linkViaType = sourceRelation;
						targetColData.settings.linkObject = objectData.id;
						targetColData.settings.linkColumn = sourceColData.id;
						targetColData.translations = [];
						languages.forEach((langCode) => {
							targetColData.translations.push({
								language_code: langCode,
								label: targetLinkName
							});
						});

						// Add columns to the object being created
						objectData.fields.push(sourceColData);
						targetObject.fields.push(targetColData);

						// ( `targetObject` is already a reference to the
						//   existing object in `application.json.objects` )

						return assocDone();

					}, (err) => {
						if (err) next(err);
						else next();
					});
				},

				// Save to database
				(next) => {
					application.json.objects.push(objectExternal.toObj());

					ABApplication.update(
						{ id: appID },
						{ json: application.json }
					).exec((err, updated) => {
						if (err) {
							console.log('ERROR: ', err);
							next(err);
						}
						else if (!updated || !updated[0]) {
							console.log('ERROR: app not updated');
							next(new Error('Application not updated'));
						}
						else {
							next();
						}
					});
				},

			], function (err) {
				if (err) reject(err);
				else resolve(objectExternal.toObj());
			});

		});

	},


	findModelAttributes: function (modelName) {

		var model = sails.models[modelName.toLowerCase()];

		if (!modelName || !model) {
			throw Error('unrecognized model: ' + modelName);
		}

		var columns = model.attributes;

		var transAssoc = model.associations.filter(function (assoc) { return assoc.alias == 'translations' && assoc.type == 'collection'; })[0];
		if (transAssoc) {
			var transModelName = transAssoc.collection.toLowerCase(),
				transModel = sails.models[transModelName];

			for (var colName in transModel.definition) {
				if (colName == 'language_code') continue;
				var col = transModel.definition[colName];
				if (col.type == 'string' || col.type == 'text') {
					columns[colName] = {
						type: col.type
					};
				}
			}
		}

		// Check if column types are supported by AppBuilder
		// var validTypes = ABColumn.getValidTypes();
		for (var colName in columns) {
			if (typeof columns[colName] == 'string') {
				// Sometimes the column definition is a simple string instead
				// of an object. Change it to object format.
				columns[colName] = {
					type: columns[colName]
				};
			}

			var type = String(columns[colName].type).toLowerCase();
			if (sailsToAppBuilderReference[type]) {
				columns[colName].supported = true;
			} else {
				columns[colName].supported = false;
			}
		}

		return columns;
	}


};