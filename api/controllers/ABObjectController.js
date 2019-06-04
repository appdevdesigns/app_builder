/**
 * ABObjectController
 *
 * @description :: Server-side logic for managing Abapplications
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var uuid = require('uuid/v4');

var __ObjectPool = {};

module.exports = {

	_config: {
		model: "abobject", // all lowercase model name
		actions: false,
		shortcuts: false,
		rest: false
	},

	/**
	* PUT /app_builder/object?appID=[appId]
	* 
	* Add a new object
	*/
	objectSave: function (req, res) {

		let appID = req.query.appID;
		let object = req.body.object;

		Promise.resolve()

			// Get table name of this object
			.then(() => {

				return new Promise((next, error) => {

					// If table name is set, then skip this step
					if (object.tableName || !appID)
						return next();

					ABApplication.findOne({ id: appID })
						.fail(errMessage => {
							error(errMessage);
							res.AD.error("Could not found application");
						})
						.then(app => {

							if (!app)
							{
								res.AD.error("Could not found application");
								return error(errMessage);
							}

							let application = app.toABClass();

							// Set table name here
							object.tableName = AppBuilder.rules.toObjectNameFormat(application.dbApplicationName(), object.name);

							next();

						});

				});

			})

			// Find object by id
			.then(() => {

				return new Promise((next, error) => {

					ABObject.findOne({ id: object.id })
						.populate('applications')
						.fail(errMessage => {

							error(errMessage);
							res.AD.error(true);

						})
						.then(result => {

							next(result);

						});

				});

			})

			.then(objectData => {

				return new Promise((next, error) => {

					// Update
					if (objectData) {

						objectData.json = object;

						// Import this object to application
						// TODO: check duplicate
						if (appID)
							objectData.applications.push(appID);

						objectData.save()
							.fail(error)
							.then(() => {
								next(objectData);
							});

					}
					// Insert
					else {

						let id = object.id || uuid();
						object.id = id;

						let newApp = {
							id: id,
							json: object,
							applications: []
						};

						// Import this object to application
						if (appID)
							newApp.applications.push(appID);

						ABObject.create(newApp)
							.fail(error)
							.then(result => {
								next(result);
							});

					}

				});

			})

			// Update cache
			.then(objectData => {

				return new Promise((next, error) => {

					// Cache in .constructor of ABClassObject
					objectData.toABClass();

					// this.objectCache(objClass);

					next();
	
				});

			})

			// Finally
			.then(() => {

				return new Promise((next, error) => {

					res.AD.success(true);
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

		ABObject.destroy({ id: objectID })
			.fail(res.AD.error)
			.then(() => {

				// remove cache
				this.objectRemove(objectID);

				res.AD.success(true);
			});

	},


	/** Cache **/

	/**
	 * @function objectCache
	 * 
	 * @param {ABClassObject} object 
	 */
	objectCache: function(object) {

		if (object == null)
			return;

		__ObjectPool[object.id] = object;

	},

	/**
	 * @function objectGet
	 * 
	 * @param {uuid} id 
	 * 
	 * @return {ABClassObject}
	 */
	objectGet: function(id) {

		return __ObjectPool[id] || null;

	},

	/**
	 * @function objectRemove
	 * 
	 * @param {uuid} id 
	 */
	objectRemove: function(id) {

		if (id == null)
			return;

		delete __ObjectPool[id];

	}

}