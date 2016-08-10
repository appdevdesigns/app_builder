steal(function () {
	System.import('can').then(function () {
		steal.import('can/model/model',
			'can/util/object/object').then(function () {

				// Base model to handle reading / writing to local storage
				can.Model('ab.Model.Cached', {
					setup: function () {
						var self = this;

						can.Model.setup.apply(self, arguments);

						// setup data
						if (typeof window.localStorage !== 'undefined') {
							self._cached = JSON.parse(window.localStorage.getItem(self.cachedKey())) || {};
						} else {
							self._cached = {};
						}

						io.socket.on('server-reload', function (data) {
							if (!data.reloading) { // Server has finished reloading
								async.series([
									function (next) {
										self.cacheNewFields([]);
										next();
									},
									function (next) {
										self.saveInList()
											.fail(function (err) { next(err); })
											.then(function () { next(); });
									},
									function (next) {
										self.destroyInList()
											.fail(function (err) { next(err); })
											.then(function () { next(); });
									}
								]);
							}
						});
					},
					cachedKey: function () {
						return 'cached' + this._shortName;
					},
					cacheSavedKey: function () {
						return this.cachedKey() + '_saved_id';
					},
					cacheDeletedKey: function () {
						return this.cachedKey() + '_deleted_id';
					},
					cacheNewFieldKey: function () {
						return this.cachedKey() + '_new_fields';
					},

					cacheClear: function () {
						window.localStorage.removeItem(this.cachedKey());
						this._cached = {};
					},
					cacheItems: function (items) {
						var data = this._cached,
							id = this.id;
						can.each(items, function (item) {
							var idVal = item[id],
								obj = data[idVal],
								item = item.attr ? item.attr() : item;
							if (obj) {
								can.extend(obj, item);
							} else {
								data[idVal] = item;
							}
						});
						window.localStorage.setItem(this.cachedKey(), JSON.stringify(data));
					},
					cacheSavedIds: function (savedIds) {
						if (savedIds && savedIds.length > 0)
							window.localStorage.setItem(this.cacheSavedKey(), JSON.stringify(savedIds));
						else
							window.localStorage.removeItem(this.cacheSavedKey());
					},
					cacheDeletedIds: function (deletedIds) {
						if (deletedIds && deletedIds.length > 0)
							window.localStorage.setItem(this.cacheDeletedKey(), JSON.stringify(deletedIds));
						else
							window.localStorage.removeItem(this.cacheDeletedKey());
					},
					cacheNewFields: function (newFieldNames) {
						if (newFieldNames && newFieldNames.length > 0)
							window.localStorage.setItem(this.cacheNewFieldKey(), JSON.stringify(newFieldNames));
						else
							window.localStorage.removeItem(this.cacheNewFieldKey());
					},

					getSavedIds: function () {
						return JSON.parse(window.localStorage.getItem(this.cacheSavedKey())) || []; // [tempId, id, ..., idn]
					},
					getDeletedIds: function () {
						return JSON.parse(window.localStorage.getItem(this.cacheDeletedKey())) || []; // [id, ..., idn]
					},
					getNewFieldNames: function () {
						return JSON.parse(window.localStorage.getItem(this.cacheNewFieldKey())) || []; // [New_Field_1, ..., New_Field_n]
					},
					findAllCached: function (params) {
						// remove anything not filtering ....
						//   - sorting, grouping, limit, and offset
						var list = [],
							data = this._cached,
							item;

						for (var id in data) {
							item = data[id];
							if (this.filter(item, params) !== false || Object.keys(params).length < 1) {
								list.push(item);
							}
						}
						// do sorting / grouping
						list = this.pagination(this.sort(list, params), params);
						// take limit and offset ...
						return list;
					},
					pagination: function (items, params) {
						var offset = parseInt(params.offset, 10) || 0,
							limit = parseInt(params.limit, 10) || items.length - offset;
						return items.slice(offset, offset + limit);
					},
					/**
					 * Sorts the object in place
					 *
					 * By default uses an order property in the param
					 * @param {Object} items
					 */
					sort: function (items, params) {
						can.each((params.order || [])
							.slice(0)
							.reverse(), function (name, i) {
								var split = name.split(' ');
								items = items.sort(function (a, b) {
									if (split[1].toUpperCase() !== 'ASC') {
										if (a[split[0]] < b[split[0]]) {
											return 1;
										} else if (a[split[0]] === b[split[0]]) {
											return 0;
										} else {
											return -1;
										}
									} else {
										if (a[split[0]] < b[split[0]]) {
											return -1;
										} else if (a[split[0]] === b[split[0]]) {
											return 0;
										} else {
											return 1;
										}
									}
								});
							});
						return items;
					},
					/**
					 * Called with the item and the current params.
					 * Should return __false__ if the item should be filtered out of the result.
					 *
					 * By default this goes through each param in params and see if it matches the
					 * same property in item (if item has the property defined).
					 * @param {Object} item
					 * @param {Object} params
					 */
					filter: function (item, params) {
						// Apply or condition
						var self = this,
							or = [];
						if (params.or) {
							// Convert or condition to array
							params.or.forEach(function (item) {
								for (var key in item) {
									or.push({ key: key, value: item[key] });
								}
							});
						}

						// Convert params to array
						var paramsArray = [];
						for (var key in params) {
							if (key !== 'or')
								paramsArray.push({ key: key, value: params[key] });
						}
						paramsArray = paramsArray.concat(or);

						// go through each param in params
						var result = false;
						for (var i = 0; i < paramsArray.length; i++) {
							var param = paramsArray[i];
							if (param.value !== undefined && item[param.key] !== undefined && self._compare(param.key, item[param.key], param.value)) {
								result = true;
								break;
							}
						}

						return result;
					},
					compare: {},
					_compare: function (prop, itemData, paramData) {
						itemData = itemData.id ? itemData.id : itemData; // compare to id of object

						return itemData == paramData;
						// return can.Object.same(itemData, paramData, this.compare[prop]);
					},
					makeFindAll: function (findAll) {
						return function (params, ignoreCache) {
							var def = new can.Deferred(),
								self = this,
								data = this.findAllCached(params);

							if (data.length) {
								var list = this.models(data);

								if (AD.comm.isServerReady()) {
									findAll(params).then(can.proxy(function (json) {
										can.each(json, function (d) {
											if (d.translate) d.translate();
										});

										if (!ignoreCache)
											self.cacheItems(json);

										// list.attr(json, true);

										// Update cached instances
										can.each(json, function (newItem) {
											var existsItem = list.filter(function (item) { return item[self.fieldId] == newItem[self.fieldId]; });

											if (existsItem && existsItem.length > 0) {
												existsItem = existsItem[0];

												var propNames = can.Map.keys(newItem);

												propNames.forEach(function (prop) {
													existsItem.attr(prop, newItem[prop]); // Update value
												});
											}
											else { // Add
												list.push(newItem);
											}
										});

										can.trigger(self, 'refreshData', { result: list });
									}, this), function () {
										can.trigger(list, 'error', arguments);
									});
								}

								def.resolve(list);
							} else {
								if (AD.comm.isServerReady()) {
									findAll(params).then(can.proxy(function (data) {
										can.each(data, function (d) {
											if (d.translate) d.translate();
										});

										// Create our model instance
										var list = this.models(data);

										if (!ignoreCache)
											self.cacheItems(data); // Save the data to local storage

										// Resolve the deferred with our instance
										def.resolve(list);
									}, this), function (data) {
										def.reject(data);
									});
								}
								else {
									def.resolve([]);
								}
							}
							return def;
						};
					},
					makeFindOne: function (findOne) {
						return function (params, onlyLocal, ignoreCache) {
							var def = new can.Deferred();

							// grab instance from cached data
							var data = this._cached[params[this.id]];
							// or try to load it
							data = data || this.findAllCached(params)[0];

							// If we had existing local storage data...
							if (data) {
								// Create our model instance
								var instance = this.model(data._data ? data._data : data);

								if (AD.comm.isServerReady() && !onlyLocal) {
									findOne(params).then(function (json) {
										// Update the instance when the ajax response returns
										if (!ignoreCache)
											instance.updated(json);
									}, function (data) {
										can.trigger(instance, 'error', data);
									});
								}

								// Resolve the deferred with our instance
								def.resolve(instance); // Otherwise hand off the deferred to the ajax request
							} else {
								if (AD.comm.isServerReady() && !onlyLocal) {
									findOne(params).then(can.proxy(function (data) {
										if (data.translate) data.translate();
										// Create our model instance
										var instance = this.model(data);

										// Save the data to local storage
										if (!ignoreCache)
											instance.created(data);

										// Resolve the deferred with our instance
										def.resolve(instance);
									}, this), function (data) {
										def.reject(data);
									});
								}
								else {
									def.resolve(null);
								}
							}
							return def;
						};
					},
					makeCreate: function (create) {
						return function (obj) {
							var q = new can.Deferred(),
								self = this,
								tempId = null,
								createObj = $.extend({}, obj);

							if (AD.comm.isServerReady()) { // Call service to add new item
								create(createObj)
									.fail(function (err) {
										if (err === null || err.message.indexOf('ER_NO_SUCH_TABLE') > -1) { // 404 Not found - new object case 
											var localObj = self.createNewLocalItem(obj);

											q.resolve(localObj);
										}
										else {
											q.reject(err);
										}
									})
									.then(function (result) { q.resolve(result); });
							}
							else { // Save to local repository - update to server when sync
								var localObj = self.createNewLocalItem(obj);

								q.resolve(localObj);
							}


							return q;
						};
					},
					makeUpdate: function (update) {
						return function (id, obj) {
							var q = new can.Deferred(),
								self = this,
								saveObj = {},
								fieldList = Object.keys(self.describe()).concat(['id', 'translations']),
								hasNewField = false;

							fieldList.forEach(function (key) {
								if (typeof obj[key] != 'undefined' && obj[key] != null)
									saveObj[key] = obj[key];
							});

							// Check has update to new field
							var isUpdateNew = Object.keys(obj).filter(function (k) { return self.getNewFieldNames().indexOf(k) != -1; });
							if (isUpdateNew && isUpdateNew.length > 0)
								hasNewField = true;

							if (AD.comm.isServerReady()) { // Call service to update item
								var saveObj2 = $.extend({}, saveObj); // Copy for save to local
								update(id, saveObj)
									.fail(function (err) {
										if (err === null || err.message.indexOf('ER_NO_SUCH_TABLE') > -1) { // 404 Not found - new object case 
											self.updateLocalItem(id, saveObj2)
												.fail(function (err) { q.reject(err); })
												.then(function (result) {
													q.resolve(result);
												});
										}
										else {
											q.reject(err);
										}
									})
									.then(function (result) {
										if (!result.translate) {
											for (var key in saveObj) {
												if (key === 'id' || key === 'translations' || key === 'createdAt' || key === 'updatedAt')
													continue;

												result[key] = saveObj[key];
											}
										}

										q.resolve(result);
									});
							}

							if (hasNewField || !AD.comm.isServerReady()) { // Save to local repository - update to server when sync
								self.updateLocalItem(id, saveObj)
									.fail(function (err) { q.reject(err); })
									.then(function (result) {
										q.resolve(result);
									});
							}

							return q;
						}
					},

					makeDestroy: function (destroy) {
						return function (id) {
							var q = new can.Deferred(),
								self = this;

							async.series([
								function (next) {
									if (AD.comm.isServerReady()) {
										destroy(id) // Call service to destroy
											.fail(function (err) {
												q.reject(err);
												next(err);
											})
											.then(function (result) {
												q.resolve(result);
												next();
											});
									}
									else {
										if (self.isTempId(id)) { // Delete in saved ids list
											var savedIds = self.getSavedIds(),
												index = $.inArray(id, savedIds);
											if (index > -1) {
												savedIds.splice(index, 1);
												self.cacheSavedIds(savedIds);
											}
										}
										else {
											var deletedIds = self.getDeletedIds();
											if ($.inArray(id, deletedIds) < 0) {
												deletedIds.push(id); // Store in deleted id list
												self.cacheDeletedIds(deletedIds);
											}
										}

										next();
									}
								},
								function (next) {
									self.findOne({ id: id }, true)
										.fail(function (err) { next(err); })
										.then(function (result) {
											if (result)
												result.destroyed(); // Destroy in local repository

											q.resolve(id);
											next();
										});
								}
							]);

							return q;
						};
					},

					changeId: function (oldId, newId) {
						var data = this._cached;

						if (data.hasOwnProperty(oldId)) {
							if (!data.hasOwnProperty(newId)) {
								data[oldId].id = newId;
								data[newId] = data[oldId];
							}

							delete data[oldId];
						}

						this.cacheItems([]);
					},

					storeSaveId: function (id) {
						var savedIds = this.getSavedIds();
						if ($.inArray(id, savedIds) < 0) {
							savedIds.push(id);
							this.cacheSavedIds(savedIds);
						}
					},

					createNewLocalItem: function (obj) {
						var localObj = $.extend({}, obj);
						tempId = 'temp' + webix.uid();
						localObj.id = tempId;
						this.storeSaveId(tempId);

						return localObj;
					},

					updateLocalItem: function (id, saveObj) {
						var self = this,
							q = AD.sal.Deferred();

						self.findOne({ id: id })
							.fail(function (err) { q.reject(err); })
							.then(function (result) {
								result.updated(saveObj); // Update in local repository

								q.resolve(saveObj);
							});

						self.storeSaveId(id);

						return q;
					},

					isTempId: function (id) {
						return typeof id === 'string' && id.startsWith('temp');
					},

					saveInList: function () {
						var self = this,
							q = $.Deferred(),
							saveEvents = [],
							savedIds = self.getSavedIds();

						savedIds.forEach(function (id) {
							saveEvents.push(function (next) {
								self.findOne({ id: id }, true).then(function (result) {
									if (!result) { // This data was deleted
										next();
										return true;
									}

									if (self.isTempId(result.id))
										result.removeAttr('id');

									result.save().then(function (saveResult) {
										self.changeId(id, saveResult.id);

										self.cacheItems([saveResult]);

										var index = $.inArray(id, savedIds);
										if (index > -1) {
											savedIds.splice(index, 1);
											self.cacheSavedIds(savedIds);
										}

										next();
									});
								});
							});
						});

						async.parallel(saveEvents, function (err) {
							if (err)
								q.reject(err)
							else
								q.resolve();
						});

						return q;
					},

					destroyInList: function () {
						var self = this,
							q = $.Deferred(),
							deleteEvents = [],
							deletedIds = self.getDeletedIds();

						deletedIds.forEach(function (id) {
							deleteEvents.push(function (next) {
								self.destroy(id).then(function (result) {
									var index = $.inArray(id, deletedIds);
									if (index > -1) {
										deletedIds.splice(index, 1);
										self.cacheDeletedIds(deletedIds);
									}

									next();
								});
							});
						});

						async.parallel(deleteEvents, function (err) {
							if (err)
								q.reject(err)
							else
								q.resolve();
						});

						return q;
					}

				}, {
						updated: function (attrs) {
							var instance = this;

							if (instance && attrs) { // Update local instance
								if (attrs.attr) attrs = attrs.attr();

								for (var key in attrs) {
									if (!webix.isUndefined(attrs[key]) && attrs[key] != null)
										instance.attr(key, attrs[key]);
								}
							}

							if (instance.translate) instance.translate();

							// Save the model to local storage
							instance.constructor.cacheItems([instance.attr()]);

							// Update our model
							can.Model.prototype.updated.apply(instance, arguments);
						},
						created: function (attrs) {
							if (attrs.translate) attrs.translate();

							// Save the model to local storage
							this.constructor.cacheItems([attrs]);
							// Update our model
							can.Model.prototype.created.apply(this, arguments);
						},
						destroyed: function () {
							// Save the model to local storage
							delete this.constructor._cached[this[this.constructor.id]];
							this.constructor.cacheItems([]);
							// Update our model
							can.Model.prototype.destroyed.apply(this, arguments);
						},
						checkSync: function () {
							var unsyncIds = this.constructor.getSavedIds();

							if (unsyncIds.indexOf(this.attr('id')) > -1)
								return true;
							else
								return false;

						}
					});
				return can.Model.Cached;
			});
	});
});