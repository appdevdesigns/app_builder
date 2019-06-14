/**
 * ABObjectController
 *
 * @description :: Server-side logic for managing Abapplications
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var path = require('path');
var uuid = require('uuid/v4');

var ABApplicationGraph = require(path.join('..', 'graphModels', 'ABApplication'));
var ABObjectGraph = require(path.join('..', 'graphModels', 'ABObject'));

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

		ABObjectGraph.findOne(objectId)
					.catch(error => {
						err(error);
						res.AD.error(error);
					})
					.then(object => {

						let result = object.json;

						res.AD.success(result);
						next();

					});;

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
		let application;

		Promise.resolve()

			// Set table name of this object
			.then(() => {

				return new Promise((next, error) => {

					// If table name is set, then skip this step
					if (object.tableName || !appID)
						return next();

						ABApplicationGraph.findOne(appID)
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

					ABObjectGraph.upsert(object.id, object)
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

					obj.relate(ABObjectGraph.relations.applications, application)
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

		ABObjectGraph.remove(objectID)
			.catch(res.AD.error)
			.then(() => {

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

	}

}