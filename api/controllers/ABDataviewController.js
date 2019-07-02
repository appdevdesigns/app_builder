/**
 * ABDataviewController
 *
 * @description :: Server-side logic for managing Abapplications
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var path = require('path');

var ABGraphDataview = require(path.join('..', 'graphModels', 'ABDataview'));

module.exports = {

	/**
	 * GET /app_builder/application/:appID/dataview
	 * 
	 * Get data views of application
	 */
	dataviewApplication: function(req, res) {

		let appID = req.param('appID');

		ABGraphDataview.findWithRelation('applications', appID, ['object', 'query'])
			.catch(error => {
				res.AD.error(error);
			})
			.then(dataviews => {

				res.AD.success(dataviews || []);

			});

	},


	/**
	 * GET /app_builder/dataview
	 * 
	 * Find data views
	 */
	dataviewFind: function (req, res) {

		let cond = req.query;

		ABGraphDataview.find(cond, ['object', 'query'])
			.catch(error => {
				err(error);
				res.AD.error(error);
			})
			.then(dataviews => {

				res.AD.success(dataviews || []);

			});

	},

	/**
	* GET /app_builder/dataview/:dataviewId
	* 
	* Get a data view
	*/
	dataviewFindOne: function (req, res) {

		let dataviewId = req.param('dataviewId');

		ABGraphDataview.findOne(dataviewId)
			.catch(error => {
				err(error);
				res.AD.error(error);
			})
			.then(dataview => {

				res.AD.success(dataview);

			});

	},


	/**
	* PUT /app_builder/dataview?appID=[appId]
	* 
	* Add a new dataview
	*/
	dataviewSave: function (req, res) {

		let appID = req.query.appID;
		let dataview = req.body.dataview;

		Promise.resolve()

			// Save dataview
			.then(() => {

				return new Promise((next, error) => {

					ABGraphDataview.upsert(dataview.id, dataview)
						.catch(errMessage => {

							error(errMessage);
							res.AD.error(true);

						})
						.then(result => {

							next(result);

						});

				});

			})

			// Set relation to application
			.then(dView => {

				return new Promise((next, error) => {

					if (appID == null)
						return next();

					dView.relate('applications', appID)
						.catch(errMessage => {

							error(errMessage);
							res.AD.error(true);

						})
						.then(() => {

							next(dView);

						});

				});

			})

			// Set relation to data source
			.then(dView => {

				return new Promise((next, error) => {

					let isQuery = JSON.parse(dView.settings.isQuery || false);
						relationName = '',
						datasourceID = '';

					if (isQuery) {
						relationName = 'query';
						datasourceID = dView.settings.datasourceID;
					}
					else {
						relationName = 'object';
						datasourceID = dView.settings.datasourceID;
					}

					dView.relate(relationName, datasourceID)
						.catch(errMessage => {

							error(errMessage);
							res.AD.error(true);

						})
						.then(() => {

							next(dView);

						});

				});

			})

			// Finally
			.then(dView => {

				return new Promise((next, error) => {

					ABGraphDataview.findOne(dView.id, ['object', 'query'])
						.catch(errMessage => {

							error(errMessage);
							res.AD.error(true);

						})
						.then(result => {

							res.AD.success(result);
							next();
		
						});

				})
			});

	},

	/**
	* DELETE /app_builder/dataview/:dataviewId
	* 
	* Delete a dataview
	*/
	dataviewDestroy: function (req, res) {
		let dataviewID = req.param('dataviewId');

		ABGraphDataview.remove(dataviewID)
			.catch(res.AD.error)
			.then(() => {

				res.AD.success(true);
			});

	},

	/**
	* PUT /app_builder/application/:appID/dataview/:dataviewID
	* 
	* Import dataview to application
	*/
	importDataview: function (req, res) {

		let appID = req.param('appID'),
			dataviewID = req.param('dataviewID');

		Promise.resolve()

			// Get an dataview
			.then(() => {

				return new Promise((next, err) => {

					ABGraphDataview.findOne(dataviewID, ['object', 'query'])
						.catch(err)
						.then(dataview => {
							next(dataview);
						});


				});

			})

			// Set relate
			.then(dataview => {

				return new Promise((next, err) => {

					// if exists
					if (dataview.applications.filter(app => app.id == appID)[0])
						return next();

					dataview.relate('applications', appID)
						.catch(err)
						.then(() => {
							next(dataview);
						});

				});

			})

			// Return a dataview to result
			.then(dataview => {

				return new Promise((next, err) => {

					res.AD.success(dataview);
					next();

				});

			});

	},

	/**
	* DELETE /app_builder/application/:appID/dataview/:dataviewID
	* 
	* Exclude dataview from application
	*/
	excludeDataview: function (req, res) {

		let appID = req.param('appID'),
			dataviewID = req.param('dataviewID');

		ABGraphDataview.unrelate(
			ABGraphDataview.relations.applications,
			appID,
			dataviewID
		)
			.catch(err => {

				res.AD.error(err);

			})
			.then(() => {

				res.AD.success(true);

			});

	}

}