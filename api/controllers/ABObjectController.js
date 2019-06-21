/**
 * ABObjectController
 *
 * @description :: Server-side logic for managing Abapplications
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var path = require('path');

var ABGraphApplication = require(path.join('..', 'graphModels', 'ABApplication'));
var ABGraphObject = require(path.join('..', 'graphModels', 'ABObject'));

module.exports = {

	_config: {
		model: "abobject", // all lowercase model name
		actions: false,
		shortcuts: false,
		rest: false
	},


	/**
	 * GET /app_builder/application/:appID/objects
	 * 
	 * Get objects of application
	 */
	objectApplication: function(req, res) {

		let appID = req.param('appID');

		ABGraphObject.findWithRelation('applications', appID)
			.catch(error => {
				res.AD.error(error);
			})
			.then(objects => {

				res.AD.success(objects || []);

			});

	},


	/**
	 * GET /app_builder/object
	 * 
	 * Find objects
	 */
	objectFind: function (req, res) {

		let cond = req.query;

		ABGraphObject.find(cond)
			.catch(error => {
				err(error);
				res.AD.error(error);
			})
			.then(objects => {

				res.AD.success(objects || []);

			});

	},

	/**
	* GET /app_builder/object/:objectId
	* 
	* Get a object
	*/
	objectFindOne: function (req, res) {

		let objectId = req.param('objectId');

		ABGraphObject.findOne(objectId)
			.catch(error => {
				err(error);
				res.AD.error(error);
			})
			.then(object => {

				res.AD.success(object);

			});

	},


	/**
	* PUT /app_builder/object?appID=[appId]
	* 
	* Add a new object
	*/
	objectSave: function (req, res) {

		let appID = req.query.appID;
		let object = req.body.object;
		let application;

		Promise.resolve()

			// Set table name of this object
			.then(() => {

				return new Promise((next, error) => {

					// If table name is set, then skip this step
					if (object.tableName || !appID)
						return next();

					ABGraphApplication.findOne(appID)
						.catch(errMessage => {
							error(errMessage);
							res.AD.error("Could not found application");
						})
						.then(app => {

							if (!app) {
								res.AD.error("Could not found application");
								return error(errMessage);
							}

							application = app;

							let appClass = app.toABClass();

							// Set table name here
							object.tableName = AppBuilder.rules.toObjectNameFormat(appClass.dbApplicationName(), object.name);

							next();

						});

				});

			})

			// Save object
			.then(() => {

				return new Promise((next, error) => {

					ABGraphObject.upsert(object.id, object)
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
			.then(obj => {

				return new Promise((next, error) => {

					if (application == null)
						return next();

					obj.relate(ABGraphObject.relations.applications, application.id)
						.catch(errMessage => {

							error(errMessage);
							res.AD.error(true);

						})
						.then(() => {

							next(obj);

						});

				});

			})

			// Finally
			.then(obj => {

				return new Promise((next, error) => {

					res.AD.success(obj);
					next();

				})
			});

	},

	/**
	* DELETE /app_builder/object/:objectId
	* 
	* Delete a object
	*/
	objectDestroy: function (req, res) {
		let objectID = req.param('objectId');

		ABGraphObject.remove(objectID)
			.catch(res.AD.error)
			.then(() => {

				res.AD.success(true);
			});

	},

	/**
	* PUT /app_builder/application/:appID/object/:objID
	* 
	* Import object to application
	*/
	importObject: function (req, res) {

		let appID = req.param('appID'),
			objID = req.param('objID');

		let application,
			object;

		Promise.resolve()

			// Get an application
			.then(() => {

				return new Promise((next, err) => {

					ABGraphApplication.findOne(appID, ['objects'])
						.catch(err)
						.then(app => {

							application = app;

							next();
						});

				});

			})

			// Get an object
			.then(() => {

				return new Promise((next, err) => {

					ABGraphObject.findOne(objID)
						.catch(err)
						.then(obj => {

							object = obj;

							next();
						});


				});

			})

			// Set relate
			.then(() => {

				return new Promise((next, err) => {

					// if exists
					if (application.objects.filter(obj => obj.id == objID)[0])
						return next();

					application.relate('objects', object.id)
						.catch(err)
						.then(() => {
							next();
						});

				});

			})

			// Return a object to result
			.then(() => {

				return new Promise((next, err) => {

					res.AD.success(object);
					next();

				});

			});

	},

	/**
	* DELETE /app_builder/application/:appID/object/:objID
	* 
	* Exclude object from application
	*/
	excludeObject: function (req, res) {

		let appID = req.param('appID'),
			objID = req.param('objID');

		ABGraphObject.unrelate(
			ABGraphObject.relations.applications,
			appID,
			objID
		)
			.catch(err => {

				res.AD.error(err);

			})
			.then(() => {

				res.AD.success(true);

			});

	}

}