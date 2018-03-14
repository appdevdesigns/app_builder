module.exports = {

	/**
	 * findModels
	 *
	 * GET app_builder/external/application/:appID
	 */
	findModels: function (req, res) {

		var modelNames = ABExternal.getModels();

		res.AD.success(modelNames);

	},



	/**
	 * findModelAttributes
	 *
	 * GET app_builder/external/model/:name/attributes
	 */
	findModelAttributes: function (req, res) {

		var modelName = req.param('name');

		try {

			var modelAttrs = ABExternal.findModelAttributes(modelName);

			res.AD.success(modelAttrs);

		}
		catch (err) {
			res.AD.error(err, 500);
		}

	},



	/**
	 * importModel
	 *
	 * POST app_builder/external/application/:appID/model/:name
	 */
	importModel: function (req, res) {

		var appID = req.param('appID'),
			modelName = req.param('name'),
			columnList = req.body.columns || [];

		ABExternal.modelToObject(appID, modelName, columnList)
			.then(function (objectData) {

				res.AD.success(objectData);

			})
			.catch(function (err) {

				ADCore.error.log('ABExternal.modelToObject() failed:', { error: err, modelName: modelName });
				res.AD.error(err, 500);

			});

	},

};