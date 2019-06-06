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
	* GET /app_builder/application/:appID/object/:objectId
	* 
	* Get a object
	*/
	objectFindone: function (req, res) {

		let appID = req.param('appID');
		let objectId = req.param('objectId');

		Promise.resolve()
			.then(() => {

				return new Promise((next, err) => {

					ABApplication.findOne(appID)
						.populate("objects")
						.fail(error => {
							err(error);
							res.AD.error(`System cound not found this application: ${appID}`);
						})
						.then(app => {

							app = app.toValidJsonFormat();

							next(app.json.objects);

						});

				});

			})
			.then(objects => {

				return new Promise((next, err) => {

					ABObject.findOne({ id: objectId })
					.fail(error => {
						err(error);
						res.AD.error(error);
					})
					.then(object => {

						let result = object.toValidJsonFormat(objects).json;

						res.AD.success(result);
						next();

					});

				});

			});

	},

	/**
	 * GET /app_builder/application/:appID/otherobjects
	 * 
	 */
	objectOther: function (req, res) {

		let appID = req.param('appID');

		let queryString = [
			"SELECT `#objTable#`.`json` ",
			"FROM `#objTable#` ",
			"WHERE `#objTable#`.`id` NOT IN ( ",
			"	SELECT `object` FROM `#joinTable#` ",
			"	WHERE `#joinTable#`.`application` = #appID# ",
			")"
		].join('')
			.replace(/#objTable#/g, ABObject.tableName)
			.replace(/#joinTable#/g, ABApplicationABObject.tableName)
			.replace(/#appID#/g, appID);

		ABObject.query(queryString, [],

			(err, objects) => {

				if (err) {
					console.error(err);
					return res.AD.error("Could not get other objects");
				}

				let result = (objects || [])
					.map(obj => {
						return JSON.parse(obj.json);
					});

				res.AD.success(result);

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

							if (!app) {
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

	/**
	* PUT /app_builder/application/:appID/importObject/:objID
	* 
	* Import object to application
	*/
	importObject: function (req, res) {

		let appID = req.param('appID'),
			objID = req.param('objID');


		Promise.resolve()
			// find relation of application and object
			.then(() => {

				return new Promise((next, err) => {

					ABApplicationABObject.findOne({
						application: appID,
						object: objID
					})
						.fail(err)
						.then(result => {

							next(result);

						});

				});

			})
			.then(exists => {

				return new Promise((next, err) => {

					if (exists)
						return next();

					ABApplicationABObject.create({
						application: appID,
						object: objID
					})
						.fail(err)
						.then(() => {

							next();

						});

				});

			})
			// get object list of application
			.then(() => {

				return new Promise((next, err) => {

					ABApplication.findOne({ id: appID })
						.populate("objects")
						.fail(err)
						.then(app => {

							if (app)
								next(app.objects);
							else
								next([]);

						});

				});

			})
			// return valid object json
			.then(objectList => {

				return new Promise((next, err) => {

					ABObject.findOne({ id: objID })
						.fail(err)
						.then(obj => {

							if (obj) {
								res.AD.success(obj.toValidJsonFormat(objectList).json);
								next();
							}
							else {
								err("System could not this object");
							}

						});

				});

			});

	},

	/**
	* PUT /app_builder/application/:appID/excludeObject/:objID
	* 
	* Exclude object from application
	*/
	excludeObject: function (req, res) {

		let appID = req.param('appID'),
			objID = req.param('objID');

		ABApplicationABObject.destroy({
			application: appID,
			object: objID
		})
			.fail(err => {

				res.AD.error(err);

			})
			.then(() => {

				res.AD.success(true);

			});

	},



	/** Cache **/

	/**
	 * @function objectCache
	 * 
	 * @param {ABClassObject} object 
	 */
	objectCache: function (object) {

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
	objectGet: function (id) {

		return __ObjectPool[id] || null;

	},

	/**
	 * @function objectRemove
	 * 
	 * @param {uuid} id 
	 */
	objectRemove: function (id) {

		if (id == null)
			return;

		delete __ObjectPool[id];

	}

}