/**
 * ABDataviewController
 *
 * @description :: Server-side logic for managing Abapplications
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var path = require('path');

var ABGraphDataview = require(path.join('..', 'graphModels', 'ABDataview'));
var ABGraphQuery = require(path.join('..', 'graphModels', 'ABQuery'));


/**
 * @method pullQueryDatasource
 * 
 * @param {ABDataview} dataview
 * @return {Promise}
 */
function pullQueryDatasource(dataview) {

	return new Promise((resolve, reject) => {

		if (dataview == null)
			return resolve(null);


		let isQuery = JSON.parse(dataview.settings.isQuery);
		if (isQuery &&
			(!dataview.query || !dataview.query[0])) {

			let queryID = dataview.settings.datasourceID;

			// Data source is query
			ABGraphQuery.findOne(queryID, {
				relations: ['objects']
			})
				.catch(reject)
				.then(q => {

					if (q)
						dataview.query = [q];

					resolve(dataview);

				});

		}
		else {

			// Data source is object
			return resolve(dataview);
		}

	});

}

function pullDataview(dataviewID) {

	return Promise.resolve()

		// Get data view
		.then(() => ABGraphDataview.findOne(dataviewID, {
			relations: ['object']
		}))

		// When data source is query, then pull objects of query
		.then(dataview => pullQueryDatasource(dataview));

}

module.exports = {

	/**
	 * GET /app_builder/application/:appID/dataview
	 * 
	 * Get data views of application
	 */
	dataviewApplication: function (req, res) {

		let appID = req.param('appID');

		this.pullDataviewOfApplication(appID)
			.catch(res.AD.error)
			.then(dataviews => {
				res.AD.success(dataviews || []);
			});

	},

	pullDataviewOfApplication(appID) {

		return new Promise((resolve, reject) => {

			ABGraphDataview.findWithRelation('applications', appID, {
				relations: ['object']
			})
				.catch(reject)
				.then(dataviews => {
	
					let tasks = [];
	
					// pull Query data source
					(dataviews || []).forEach(dv => {
						tasks.push(pullQueryDatasource(dv));
					});
	
					Promise.all(tasks)
						.catch(reject)
						.then(() => {
	
							resolve(dataviews || []);
	
						});
	
				});

		});

	},


	/**
	 * GET /app_builder/dataview
	 * 
	 * Find data views
	 */
	dataviewFind: function (req, res) {

		let cond = req.query;

		ABGraphDataview.find({
			relations: ['object'],
			where: cond
		})
			.catch(error => {
				res.AD.error(error);
			})
			.then(dataviews => {

				let tasks = [];

				// pull Query data source
				(dataviews || []).forEach(dv => {
					tasks.push(pullQueryDatasource(dv));
				});

				Promise.all(tasks)
					.catch(res.AD.error)
					.then(() => {

						res.AD.success(dataviews || []);

					});

			});

	},

	/**
	* GET /app_builder/dataview/:dataviewId
	* 
	* Get a data view
	*/
	dataviewFindOne: function (req, res) {

		let dataviewId = req.param('dataviewId');

		pullDataview(dataviewId)
			.catch(res.AD.error)
			.then(dataview => {

				res.AD.success(dataview);

			});

	},


	/**
	* GET /app_builder/dataview/info
	* 
	*/
	dataviewInfo: function (req, res) {

		let cond = req.query;

		ABGraphDataview.find({
			select: ['id', 'translations'],
			where: cond
		})
			.catch(res.AD.error)
			.then(dataviews => {

				res.AD.success(dataviews || []);

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

			// Remove relations from data source
			.then(dView => {

				return new Promise((next, error) => {

					let isQuery = JSON.parse(dView.settings.isQuery || false),
						relationName = isQuery ? 'query' : 'object';

					dView.unrelate(relationName)
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

					let isQuery = JSON.parse(dView.settings.isQuery || false),
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

					pullDataview(dView.id)
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

					ABGraphDataview.findOne(dataviewID, {
						relations: ['applications']
					})
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
							next();
						});

				});

			})

			// Return a dataview to result
			.then(() => {

				return new Promise((next, err) => {

					pullDataview(dataviewID)
						.catch(errMessage => {

							err(errMessage);
							res.AD.error(true);

						})
						.then(result => {

							res.AD.success(result);
							next();

						});

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
			.catch(res.AD.error)
			.then(() => {

				res.AD.success(true);

			});

	}

}