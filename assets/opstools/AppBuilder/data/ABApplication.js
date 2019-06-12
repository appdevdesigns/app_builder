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

		objectGet: function(appId, objectId) {

			return OP.Comm.Service.get({
				url: `/app_builder/application/${appId}/object/${objectId}`
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
			}, function (err, result) {
				if (err)
					reject(err);
				else
					resolve(result);
			});

		},

		objectOther: function (appId) {

			return OP.Comm.Service.get({
				url: `/app_builder/application/${appId}/otherobjects`
			});

		},

		objectImport: function (appId, objectId) {

			return OP.Comm.Service.put({
				url: `/app_builder/application/${appId}/importObject/${objectId}`
			});

		},

		objectExclude: function (appId, objectId) {

			return OP.Comm.Service.put({
				url: `/app_builder/application/${appId}/excludeObject/${objectId}`
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

			return new Promise(
				(resolve, reject) => {

					OP.Comm.Service.put({
						url: '/app_builder/application/' + appId + '/page',
						data: {
							resolveUrl: resolveUrl,
							data: page
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
		 * @method pageDestroy
		 * 
		 * @param {guid} appId
		 * @param {string} resolveUrl
		 * @return {Promise}
		 */
		pageDestroy: function (appId, resolveUrl) {

			return new Promise(
				(resolve, reject) => {

					OP.Comm.Service.delete({
						url: '/app_builder/application/' + appId + '/page',
						data: {
							resolveUrl: resolveUrl
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


		// ** Queries

		/**
		 * @method querySave
		 * 
		 * @param {object} query
		 * @return {Promise}
		 */
		querySave: function (query) {

			return new Promise(
				(resolve, reject) => {

					if (query.id) {

						OP.Comm.Service.put({
							url: '/app_builder/abquery' + query.id,
							data: {
								data: query
							}
						}, function (err, result) {
							if (err)
								reject(err);
							else
								resolve(result);
						});	
					}
					else {

						OP.Comm.Service.post({
							url: '/app_builder/abquery',
							data: {
								data: query
							}
						}, function (err, result) {
							if (err)
								reject(err);
							else
								resolve(result);
						});	
					}

				}

			);
		},

		/**
		 * @method queryDestroy
		 * 
		 * @param {guid} queryId
		 * @return {Promise}
		 */
		queryDestroy: function (queryId) {

			return new Promise(
				(resolve, reject) => {

					OP.Comm.Service.delete({
						url: '/app_builder/abquery/' + queryId
					}, function (err, result) {
						if (err)
							reject(err);
						else
							resolve(result);
					});

				}

			);

		},

		queryImport: function(appId, queryId) {

			return OP.Comm.Service.post({
				url: `/app_builder/abapplication/${appId}/queries/${queryId}`
			});

		},

		queryExclude: function(appId, queryId) {

			return OP.Comm.Service.delete({
				url: `/app_builder/abapplication/${appId}/queries/${queryId}`
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

