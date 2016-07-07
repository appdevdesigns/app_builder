steal(function () {
	System.import('can').then(function () {
		steal.import('can/model/model',
			'can/util/object/object').then(function () {

				// Base model to handle reading / writing to local storage
				can.Model('ab.Model.Cached', {
					setup: function () {
						var self = this;

						can.Model.setup.apply(self, arguments);

						self.savedIds = []; // [tempId, id, ..., idn]
						self.deletedIds = [] // [id, ..., idn]

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

										list.attr(json, true); // Update cached instances

										can.trigger(self, 'refreshData', { result: json });
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
								tempId = null;

							if (AD.comm.isServerReady()) { // Call service to add new item
								create(obj)
									.fail(function (err) { q.reject(err); })
									.then(function (result) { q.resolve(result); });
							}
							else { // Store to local repository
								var localObj = $.extend({}, obj);
								tempId = 'temp' + webix.uid();
								localObj.id = tempId;
								this.storeSaveId(tempId);

								q.resolve(localObj);
							}


							return q;
						};
					},
					makeUpdate: function (update) {
						return function (id, obj) {
							var q = new can.Deferred(),
								saveObj = {},
								fieldList = Object.keys(this.describe()).concat(['id', 'translations']);

							fieldList.forEach(function (key) {
								if (typeof obj[key] != 'undefined' && obj[key] != null)
									saveObj[key] = obj[key];
							});

							if (AD.comm.isServerReady()) { // Call service to update item
								update(id, saveObj)
									.fail(function (err) { q.reject(err); })
									.then(function (result) {
										q.resolve(result);
									});
							}
							else { // System is syncing
								this.findOne({ id: id }).then(function (result) {
									result.updated(saveObj); // Update in local repository

									q.resolve(saveObj);
								});
								this.storeSaveId(id);
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
											var index = $.inArray(id, self.savedIds);
											if (index > -1)
												self.savedIds.splice(index, 1);
										}
										else {
											if ($.inArray(id, self.deletedIds) < 0)
												self.deletedIds.push(id); // Store in deleted id list
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
						if ($.inArray(id, this.savedIds) < 0)
							this.savedIds.push(id);
					},

					isTempId: function (id) {
						return typeof id === 'string' && id.startsWith('temp');
					},

					saveInList: function () {
						var self = this,
							q = $.Deferred(),
							saveEvents = [];

						self.savedIds.forEach(function (id) {
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

										var index = $.inArray(id, self.savedIds);
										if (index > -1)
											self.savedIds.splice(index, 1);

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
							deleteEvents = [];

						self.deletedIds.forEach(function (id) {
							deleteEvents.push(function (next) {
								self.destroy(id).then(function (result) {
									var index = $.inArray(id, self.deletedIds);
									if (index > -1)
										self.deletedIds.splice(index, 1);

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
						destroyed: function (attrs) {
							// Save the model to local storage
							delete this.constructor._cached[this[this.constructor.id]];
							this.constructor.cacheItems([]);
							// Update our model
							can.Model.prototype.destroyed.apply(this, arguments);
						}
					});
				return can.Model.Cached;
			});
	});
});