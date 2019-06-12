/**
 * ABQueryController
 *
 * @description :: Server-side logic for managing Abapplications
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

	_config: {
		model: "abquery", // all lowercase model name
		actions: false,
		shortcuts: false,
		rest: true
	},

	// /**
	//  * PUT /app_builder/application/:appID/importQuery/:queryId
	//  * 
	//  * Import a query into application
	//  */
	// importQuery: function (req, res) {

	// 	let appID = req.param('appID'),
	// 		objID = req.param('objID');


	// 	Promise.resolve()
	// 		// find relation of application and object
	// 		.then(() => {

	// 			return new Promise((next, err) => {

	// 				ABApplicationABObject.findOne({
	// 					application: appID,
	// 					object: objID
	// 				})
	// 					.fail(err)
	// 					.then(result => {

	// 						next(result);

	// 					});

	// 			});

	// 		})
	// 		.then(exists => {

	// 			return new Promise((next, err) => {

	// 				if (exists)
	// 					return next();

	// 				ABApplicationABObject.create({
	// 					application: appID,
	// 					object: objID
	// 				})
	// 					.fail(err)
	// 					.then(() => {

	// 						next();

	// 					});

	// 			});

	// 		})
	// 		// get object list of application
	// 		.then(() => {

	// 			return new Promise((next, err) => {

	// 				ABApplication.findOne({ id: appID })
	// 					.populate("objects")
	// 					.fail(err)
	// 					.then(app => {

	// 						if (app)
	// 							next(app.objects);
	// 						else
	// 							next([]);

	// 					});

	// 			});

	// 		})
	// 		// return valid object json
	// 		.then(objectList => {

	// 			return new Promise((next, err) => {

	// 				ABObject.findOne({ id: objID })
	// 					.fail(err)
	// 					.then(obj => {

	// 						if (obj) {
	// 							res.AD.success(obj.toValidJsonFormat(objectList).json);
	// 							next();
	// 						}
	// 						else {
	// 							err("System could not this object");
	// 						}

	// 					});

	// 			});

	// 		});

	// },
	// /**
	//  * PUT /app_builder/application/:appID/excludeQuery/:queryId
	//  * 
	//  * Exclude a query from application
	//  */
	// excludeQuery: function (req, res) {

	// 	var appID = req.param('appID');
	// 	var queryID = req.param('id');

	// 	jsonDataDestroy(appID, 'queries', queryID, req, res)

	// },

}