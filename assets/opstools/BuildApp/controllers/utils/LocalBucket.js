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

							self.options = AD.defaults({
								updateUnsyncCountEvent: 'AB_Object.LocalCount',
							}, options);

							self.data = {};

							self.bucket = function (appId) {
								var instance = this;
								instance.appId = appId;
								instance.saveContainer = "app_#appId#_save".replace('#appId#', instance.appId);
								instance.destroyContainer = "app_#appId#_destroy".replace('#appId#', instance.appId);
								instance.enableListContainer = "app_#appId#_enable".replace('#appId#', instance.appId);

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
											data.id = 'temp' + webix.uid();

										if (data.data) {
											data = $.extend(data.data, data);
											delete data.data
										}

										var existsData = $.grep(dataStore[objectName], function (d) {
											return d.id == data.id;
										});

										if (existsData && existsData.length > 0) { // Update
											dataStore[objectName].forEach(function (d, index) {
												if (d.id == data.id)
													dataStore[objectName][index] = data;
											});
										}
										else { // Create
											dataStore[objectName].push(data);
										}

										webix.storage.local.put(instance.saveContainer, dataStore);
										self.element.trigger(self.options.updateUnsyncCountEvent, { count: this.getCount() + this.getDestroyCount() });
									},


									// Destroy container
									// Data format
									// {
									// 	"objectName": [id, id2, ..., idN]
									// }
									getDestroyAll: function () {
										var dataStore = webix.storage.local.get(instance.destroyContainer);

										if (!dataStore) dataStore = {};

										return dataStore;
									},

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

										self.element.trigger(self.options.updateUnsyncCountEvent, { count: this.getCount() + this.getDestroyCount() });
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


									// Enable local storage list
									enable: function (objectName) {
										var dataStore = webix.storage.local.get(instance.enableListContainer);

										if (!dataStore) dataStore = [];

										if ($.inArray(objectName, dataStore) < 0)
											dataStore.push(objectName);

										webix.storage.local.put(instance.enableListContainer, dataStore);
									},

									disable: function (objectName) {
										var dataStore = webix.storage.local.get(instance.enableListContainer);

										if (!dataStore) dataStore = [];

										var index = $.inArray(objectName, dataStore);
										dataStore.splice(index, 0);

										webix.storage.local.put(instance.enableListContainer, dataStore);
									},

									isEnable: function (objectName) {
										var dataStore = webix.storage.local.get(instance.enableListContainer);

										if (!dataStore) dataStore = [];

										return $.inArray(objectName, dataStore) >= 0;
									},


									clear: function () {
										webix.storage.local.remove(instance.saveContainer);
										webix.storage.local.remove(instance.destroyContainer);

										webix.storage.local.remove(instance.enableListContainer);

										self.element.trigger(self.options.updateUnsyncCountEvent, { count: 0 });
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
