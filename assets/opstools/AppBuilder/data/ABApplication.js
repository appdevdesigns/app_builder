//
// REFACTORING:
//
// Our goal here is to create a Model object that will interact with Sails' blueprints and 
// return native Webix DataCollections.
//
// We also want to listen for updates on Sails Sockets and notify the DataCollections.
//
// Until we have the refactoring in place, we will reuse the AD.Model.extent() objects,
// and convert the results to DataCollections.
//



// Namespacing conventions:
// OP.Model.extend('[application].[Model]', {static}, {instance} );  --> Object
OP.Model.extend('opstools.BuildApp.ABApplication',
	{
		useSockets: true,
		restURL: '/app_builder/abapplication',

		// ** Objects

		objectSave: function (appId, object) {

			return new Promise(
				(resolve, reject) => {

					AD.comm.service.put({
						url: '/app_builder/application/' + appId + '/object',
						data: {
							object: object
						}
					}, function (err, result) {
						if (err)
							reject(err);
						else
							resolve(result);
					});
				}

			);
		},

		objectDestroy: function (appId, objectId) {

			return new Promise(
				(resolve, reject) => {

					AD.comm.service.delete({
						url: '/app_builder/application/' + appId + '/object/' + objectId
					}, function (err, result) {
						if (err)
							reject(err);
						else
							resolve(result);
					});

				}

			);

		},


		// ** Pages

		pageSave: function (appId, page) {

			return new Promise(
				(resolve, reject) => {

					AD.comm.service.put({
						url: '/app_builder/application/' + appId + '/page',
						data: {
							page: page
						}
					}, function (err, result) {
						if (err)
							reject(err);
						else
							resolve(result);
					});
				}

			);
		},

		pageDestroy: function (appId, pageId) {

			return new Promise(
				(resolve, reject) => {

					AD.comm.service.delete({
						url: '/app_builder/application/' + appId + '/page/' + pageId
					}, function (err, result) {
						if (err)
							reject(err);
						else
							resolve(result);
					});

				}

			);

		},



	},
	{
		// instance Methods

	}
);

