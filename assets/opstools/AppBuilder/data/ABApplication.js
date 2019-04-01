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


		objectFindAll: function () {
			return new Promise(
				(resolve, reject) => {

					OP.Comm.Service.get({
						url: '/app_builder/objects'
					}, function (err, result) {
						if (err)
							reject(err);
						else
							resolve(result);
					});
				}

			);
		},

		queriesFindAll: ()=>{
			return Promise.resolve([]);
		},

		datacollectionsFindAll:()=>{
			return Promise.resolve([]);
		},

		objectCreate: function (object) {

			return new Promise(
				(resolve, reject) => {
					OP.Comm.Service.post({
						url: '/app_builder/objects',
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

		objectSave: function (appId, object) {

			return new Promise(
				(resolve, reject) => {

					OP.Comm.Service.put({
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

					OP.Comm.Service.delete({
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
		 * @param {guid} appId
		 * @param {object} data
		 * @return {Promise}
		 */
		querySave: function (appId, query) {

			return new Promise(
				(resolve, reject) => {

					OP.Comm.Service.put({
						url: '/app_builder/application/' + appId + '/query',
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

			);
		},

		/**
		 * @method queryDestroy
		 * 
		 * @param {guid} appId
		 * @param {guid} queryId
		 * @return {Promise}
		 */
		queryDestroy: function (appId, queryId) {

			return new Promise(
				(resolve, reject) => {

					OP.Comm.Service.delete({
						url: '/app_builder/application/' + appId + '/query/' + queryId
					}, function (err, result) {
						if (err)
							reject(err);
						else
							resolve(result);
					});

				}

			);

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

