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

		// NOTE: .findOne calls /app_builder/application?id={appId}
		get: function(appID, pageID){
			return OP.Comm.Socket.get({
				url: `/app_builder/application/${appID}?pageID=${pageID}`
			});
		},

		// Get id and label of Applications
		info: function() {
			return OP.Comm.Socket.get({
				url: `/app_builder/application/info`
			});
		},

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
			return OP.Comm.Socket.get({ url: `/app_builder/${appId}/role` });
		},

		createPermission(appId) {
			return OP.Comm.Service.post({ url: `/app_builder/${appId}/role` });
		},

		deletePermission(appId) {
			return OP.Comm.Service.delete({ url: `/app_builder/${appId}/role` });
		},




		// ** Objects

		objectLoad: function (appId) {

			return OP.Comm.Socket.get({
				url: `/app_builder/application/${appId}/object`
			});
		},

		objectFind: function (cond) {

			return OP.Comm.Socket.get({
				url: `/app_builder/object`,
				data: {
					query: cond
				}
			});

		},

		// Get id and label of objects
		objectInfo: function (cond) {

			return OP.Comm.Socket.get({
				url: `/app_builder/object/info`,
				data: {
					query: cond
				}
			});

		},

		objectGet: function(objectId) {

			return OP.Comm.Socket.get({
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



		// ** Views

		/**
		 * @method viewSave
		 * 
		 * @param {guid} appId
		 * @param {string} resolveUrl
		 * @param {object} data
		 * @param {Boolean} includeSubViews [optional]
		 * 
		 * @return {Promise}
		 */
		viewSave: function (appId, resolveUrl, data, includeSubViews = false) {

			// remove sub-pages properties
			delete data['pages'];

			// remove sub-views properties
			if (!includeSubViews)
				delete data['views'];

			return OP.Comm.Service.put({
				url: '/app_builder/application/' + appId + '/view',
				data: {
					resolveUrl: resolveUrl,
					data: data
				}
			});

		},

		/**
		 * @method viewDestroy
		 * 
		 * @param {guid} appId
		 * @param {string} resolveUrl
		 * @return {Promise}
		 */
		viewDestroy: function (appId, resolveUrl) {

			return OP.Comm.Service.delete({
				url: '/app_builder/application/' + appId + '/view',
				data: {
					resolveUrl: resolveUrl
				}
			});

		},

		/**
		 * @method viewReorder
		 * 
		 * @param {guid} appId
		 * @param {string} resolveUrl
		 * @param {array} subviews
		 * @return {Promise}
		 */
		viewReorder: function (appId, resolveUrl, subviews) {

			return OP.Comm.Service.put({
				url: '/app_builder/application/' + appId + '/viewReorder',
				data: {
					resolveUrl: resolveUrl,
					data: subviews
				}
			});

		},


		// ** Queries

		queryLoad: function (appId) {

			return OP.Comm.Socket.get({
				url: `/app_builder/application/${appId}/query`
			});
		},

		queryGet: function(queryId) {

			return OP.Comm.Service.get({
				url: `/app_builder/query/${queryId}`
			});

		},

		queryFind: function (cond) {

			return OP.Comm.Socket.get({
				url: `/app_builder/query`,
				data: {
					query: cond
				}
			});

		},

		// Get id and label of queries
		queryInfo: function (cond) {

			return OP.Comm.Socket.get({
				url: `/app_builder/query/info`,
				data: {
					query: cond
				}
			});

		},

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

		// ** Data collections

		datacollectionLoad: function (appId) {

			return OP.Comm.Socket.get({
				url: `/app_builder/application/${appId}/dataview`
			});
		},

		datacollectionFind: function (cond) {

			return OP.Comm.Socket.get({
				url: `/app_builder/dataview`,
				data: {
					query: cond
				}
			});

		},

		datacollectionGet: function(dataviewId) {

			return OP.Comm.Socket.get({
				url: `/app_builder/dataview/${dataviewId}`
			});

		},

		// Get id and label of data views
		datacollectionInfo: function (cond) {

			return OP.Comm.Socket.get({
				url: `/app_builder/dataview/info`,
				data: {
					query: cond
				}
			});

		},

		datacollectionSave: function (appId, dataview) {

			return OP.Comm.Service.put({
				url: `/app_builder/dataview?appID=${appId}`,
				data: {
					dataview: dataview
				}
			});
		},

		datacollectionDestroy: function (dataviewId) {

			return OP.Comm.Service.delete({
				url: `/app_builder/dataview/${dataviewId}`
			});

		},

		datacollectionImport: function (appId, dataviewId) {

			return OP.Comm.Service.put({
				url: `/app_builder/application/${appId}/dataview/${dataviewId}`
			});

		},

		datacollectionExclude: function (appId, dataviewId) {

			return OP.Comm.Service.delete({
				url: `/app_builder/application/${appId}/dataview/${dataviewId}`
			});

		},

		// ** Live Display

		livepage: function(appID, pageID){
			return OP.Comm.Socket.get({
				url: `/app_builder/application/${appID}/livepage/${pageID}`
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

