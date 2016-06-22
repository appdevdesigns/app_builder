steal(
	// List your Controller's dependencies here:
	function () {
        System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control',
				'appdev/model/model').then(function () {
					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.LocalBucket', {

						init: function (element, options) {
							var self = this;
							self.data = {};

							self.bucket = function (appId) {
								var instance = this;
								instance.appId = appId;
								instance.saveContainer = "app_#appId#_save".replace('#appId#', instance.appId);
								instance.destroyContainer = "app_#appId#_destroy".replace('#appId#', instance.appId);

								return {

									// Update container
									// Data format
									// {
									// 	"objectName": [
									// 		{ id: id, data: data }
									// 		{ id: id2, data: data2 }
									// 	]
									// }
									getAll: function () {
										var dataStore = webix.storage.local.get(instance.saveContainer);

										if (!dataStore) dataStore = {};

										return dataStore;
									},

									get: function (objectName, id) {
										var dataStore = webix.storage.local.get(instance.saveContainer);

										if (!dataStore) dataStore = {};
										if (!dataStore[objectName]) dataStore[objectName] = [];

										var result = dataStore[objectName];

										if (id) {
											result = $.grep(dataStore[objectName], function (c) {
												return c.id == id;
											});
										}

										return result && result.length > 0 ? result : [];
									},

									getCount: function () {
										var dataStore = webix.storage.local.get(instance.saveContainer),
											count = 0;

										if (!dataStore) dataStore = {};

										for (var key in dataStore) {
											count += dataStore[key].length;
										}

										return count;
									},

									save: function (objectName, data) {
										var dataStore = webix.storage.local.get(instance.saveContainer);

										if (!dataStore) dataStore = {};
										if (!dataStore[objectName]) dataStore[objectName] = [];

										if (!data.id)
											data.id = webix.uid();

										if (data.data) {
											data = $.extend(data.data, data);
											delete data.data
										}

										var existsData = $.grep(dataStore[objectName], function (d) {
											return d.id == data.id;
										});

										if (existsData && existsData.length > 0) { // Update
											dataStore[objectName].forEach(function (d) {
												if (d.id == data.id)
													d.data = data;
											});
										}
										else { // Create
											dataStore[objectName].push({
												id: data.id,
												data: data
											});
										}

										webix.storage.local.put(instance.saveContainer, dataStore);
									},


									// Destroy container
									// Data format
									// {
									// 	"objectName": [id, id2, ..., idN]
									// }
									getDestroyIds: function (objectName) {
										var dataStore = webix.storage.local.get(instance.destroyContainer);

										if (!dataStore) dataStore = {};
										if (!dataStore[objectName]) dataStore[objectName] = [];

										return dataStore[objectName];
									},

									destroy: function (objectName, id) {
										var dataStore = webix.storage.local.get(instance.destroyContainer);

										if (!dataStore) dataStore = {};
										if (!dataStore[objectName]) dataStore[objectName] = [];

										if ($.inArray(id, dataStore[objectName]) < 0)
											dataStore[objectName].push(id);

										webix.storage.local.put(instance.destroyContainer, dataStore);
									},

									getDestroyCount: function () {
										var dataStore = webix.storage.local.get(instance.destroyContainer),
											count = 0;

										if (!dataStore) dataStore = {};

										for (var key in dataStore) {
											count += dataStore[key].length;
										}

										return count;
									},



									clear: function () {
										webix.storage.local.remove(instance.saveContainer);
										webix.storage.local.remove(instance.destroyContainer);
									}
								};
							};

						},

						getBucket: function (appId) {
							return this.bucket(appId);
						}

					});
				})
		})
	});
