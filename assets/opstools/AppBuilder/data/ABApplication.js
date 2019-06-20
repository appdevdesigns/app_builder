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
		// restURL: '/app_builder/abapplication',
		restURL: '/app_builder/application',

		updateInfo: function (appId, data) {
			return OP.Comm.Service.put({
				url: `/app_builder/application/${appId}/info`,
				data: data
			});
		},

		// ** Permissions

		assignPermissions(appId, permItems) {
			return OP.Comm.Service.put({
				url: `/app_builder/${appId}/role/assign`,
				data: {
					roles: permItems
				}
			});
		},

		getPermissions(appId) {
			return OP.Comm.Service.get({ url: `/app_builder/${appId}/role` });
		},

		createPermission(appId) {
			return OP.Comm.Service.post({ url: `/app_builder/${appId}/role` });
		},

		deletePermission(appId) {
			return OP.Comm.Service.delete({ url: `/app_builder/${appId}/role` });
		},




		// ** Objects

		objectFind: function (cond) {

			return OP.Comm.Service.get({
				url: `/app_builder/object`,
				data: {
					query: cond
				}
			});

		},

		objectGet: function(objectId) {

			return OP.Comm.Service.get({
				url: `/app_builder/object/${objectId}`
			});

		},

		objectSave: function (appId, object) {

			return OP.Comm.Service.put({
				url: `/app_builder/object?appID=${appId}`,
				data: {
					object: object
				}
			});
		},

		objectDestroy: function (objectId) {

			return OP.Comm.Service.delete({
				url: `/app_builder/object/${objectId}`
			});

		},

		objectImport: function (appId, objectId) {

			return OP.Comm.Service.put({
				url: `/app_builder/application/${appId}/object/${objectId}`
			});

		},

		objectExclude: function (appId, objectId) {

			return OP.Comm.Service.delete({
				url: `/app_builder/application/${appId}/object/${objectId}`
			});

		},



		// ** Pages

		/**
		 * @method pageSave
		 * 
		 * @param {guid} appId
		 * @param {string} resolveUrl
		 * @param {object} data
		 * @return {Promise}
		 */
		pageSave: function (appId, resolveUrl, page) {

			// remove sub-pages properties
			delete page['pages'];

			return OP.Comm.Service.put({
				url: '/app_builder/application/' + appId + '/page',
				data: {
					resolveUrl: resolveUrl,
					data: page
				}
			});

		},

		/**
		 * @method pageDestroy
		 * 
		 * @param {guid} appId
		 * @param {string} resolveUrl
		 * @return {Promise}
		 */
		pageDestroy: function (appId, resolveUrl) {

			return OP.Comm.Service.delete({
				url: '/app_builder/application/' + appId + '/page',
				data: {
					resolveUrl: resolveUrl
				}
			});

		},


		// ** Queries

		/**
		 * @method querySave
		 * 
		 * @param {uuid} appId
		 * @param {object} query
		 * @return {Promise}
		 */
		querySave: function (appId, query) {

			return OP.Comm.Service.put({
				url: `/app_builder/query?appID=${appId}`,
				data: {
					query: query
				}
			});

		},

		/**
		 * @method queryDestroy
		 * 
		 * @param {guid} queryId
		 * @return {Promise}
		 */
		queryDestroy: function (queryId) {

			return OP.Comm.Service.delete({
				url: `/app_builder/query/${queryId}`
			});

		},

		queryImport: function(appId, queryId) {

			return OP.Comm.Service.put({
				url: `/app_builder/application/${appId}/query/${queryId}`
			});

		},

		queryExclude: function(appId, queryId) {

			return OP.Comm.Service.delete({
				url: `/app_builder/application/${appId}/query/${queryId}`
			});

		},


		// ** Mobile Apps

		/**
		 * @method mobileAppSave
		 * 
		 * @param {guid} appId
		 * @param {object} app
		 * @return {Promise}
		 */
		mobileAppSave: function (appId, app) {

			return new Promise(
				(resolve, reject) => {

					OP.Comm.Service.put({
						url: '/app_builder/application/' + appId + '/mobileApp',
						data: {
							data: app
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

		/**
		 * @method mobileAppDestroy
		 * 
		 * @param {guid} appId
		 * @param {guid} mobileAppID
		 * @return {Promise}
		 */
		mobileAppDestroy: function (appId, mobileAppID) {

			return new Promise(
				(resolve, reject) => {

					OP.Comm.Service.delete({
						url: '/app_builder/application/' + appId + '/mobileApp/' + mobileAppID
					}, function (err, result) {
						if (err)
							reject(err);
						else
							resolve(result);
					});

				}

			);

		}


	},
	{
		// instance Methods

	}
);

