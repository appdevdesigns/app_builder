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
					},
					cachedKey: function () {
						return 'cached' + this._shortName;
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
					removeCachedItems: function (itemIds) {
						var data = this._cached;

						if (!(itemIds instanceof Array))
							itemIds = [itemIds];

						itemIds.forEach(function (itemId) {
							delete data[itemId];
						});

						window.localStorage.setItem(this.cachedKey(), JSON.stringify(data));
					},
					cacheNewFields: function (newFieldNames) {
						if (newFieldNames && newFieldNames.length > 0)
							window.localStorage.setItem(this.cacheNewFieldKey(), JSON.stringify(newFieldNames));
						else
							window.localStorage.removeItem(this.cacheNewFieldKey());
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

						if (!params) params = {};

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
								cachedData = this.findAllCached(params),
								list = this.models(cachedData || []);

							findAll(params).then(can.proxy(function (data) {
								can.each(data, function (d) {
									if (d.translate) d.translate();
								});

								// if (!ignoreCache)
								// 	self.cacheItems(json);

								// Merge cached and actual data
								can.each(list, function (cachedItem) {
									var existsItem = data.filter(function (item) { return item[self.fieldId] == cachedItem[self.fieldId]; });

									if (existsItem && existsItem.length > 0) {
										existsItem = existsItem[0];

										var propNames = can.Map.keys(cachedItem);

										propNames.forEach(function (prop) {
											if (prop !== "id" && prop !== "createdAt" && prop != "updatedAt")
												existsItem.attr(prop, cachedItem[prop]); // Update value
										});
									}
									else { // Add
										data.push(cachedItem);
									}
								});

								def.resolve(data);
							}, this), function (err) {
								if (cachedData) // 404 not found - new object data
									def.resolve(list);
								else
									def.reject(err);
							});

							return def;
						};
					},
					makeFindOne: function (findOne) {
						return function (params, onlyLocal, ignoreCache) {
							var def = new can.Deferred();

							// grab instance from cached data
							var cachedData = this._cached[params[this.id]];
							// or try to load it
							cachedData = cachedData || this.findAllCached(params)[0];
							// Create our model instance
							var cachedInstance = (cachedData ? this.model(cachedData._data ? cachedData._data : cachedData) : null);

							if (!onlyLocal) {
								findOne(params).then(can.proxy(function (data) {
									if (data.translate) data.translate();

									// Create our model instance
									var instance = this.model(data);

									// if (!ignoreCache) // Save the data to local storage
									// 	instance.created(data);

									if (cachedInstance && instance) { // If we had existing local storage data...

										var propNames = can.Map.keys(cachedInstance);
										propNames.forEach(function (prop) {
											if (prop !== "id" && prop !== "createdAt" && prop != "updatedAt")
												instance.attr(prop, cachedInstance[prop]); // Update value
										});
									}

									// Resolve the deferred with our instance
									def.resolve(instance);
								}, this), function (err) {
									if (cachedInstance) // 404 not found - new object data
										def.resolve(cachedInstance);
									else
										def.reject(err);
								});
							}
							else {
								if (cachedInstance) { // If we had existing local storage data...
									def.resolve(cachedInstance);
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
								createObj = $.extend({}, obj);

							create(createObj)
								.fail(function (err) {
									if (err === null || err.message.indexOf('ER_NO_SUCH_TABLE') > -1) { // 404 Not found - new object case 
										var localObj = self.createLocalItem(obj); // Cache data

										q.resolve(localObj);
									}
									else {
										q.reject(err);
									}
								})
								.then(function (result) { q.resolve(result); });

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

							// Check has update to new column
							var isUpdateNew = Object.keys(obj).filter(function (k) { return self.getNewFieldNames().indexOf(k) != -1; });
							if (isUpdateNew && isUpdateNew.length > 0)
								hasNewField = true;

							var saveObj2 = $.extend({}, saveObj); // Copy for save to local

							async.waterfall([
								function (next) {
									update(id, saveObj)
										.fail(function (err) {
											if (err === null || err.message.indexOf('ER_NO_SUCH_TABLE') > -1) { // 404 Not found - new object case 
												self.updateLocalItem(id, saveObj2)
													.fail(function (err) { next(err); })
													.then(function (result) {
														next(null, result);
													});
											}
											else {
												next(err);
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

											next(null, result);
										});
								},
								function (updatedResult, next) {
									if (hasNewField) { // Save to local repository - new column is created
										self.updateLocalItem(id, saveObj)
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
										q.resolve(updatedResult);
										next();
									}
								}
							]);

							return q;
						}
					},

					makeDestroy: function (destroy) {
						return function (id) {
							var q = new can.Deferred(),
								self = this;

							async.series([
								function (next) {
									destroy(id) // Call service to destroy
										.fail(function (err) { next(err); })
										.then(function (result) { next(); });
								},
								function (next) {
									self.findOne({ id: id }, true) // Find in local
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

					createLocalItem: function (obj) {
						var self = this,
							cachedObj = $.extend({}, obj);
						tempId = 'temp' + webix.uid();
						cachedObj.id = tempId;

						self.cacheItems([cachedObj]); // Cache new

						return cachedObj;
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

						return q;
					},

					isTempId: function (id) {
						return typeof id === 'string' && id.startsWith('temp');
					},

					syncDataToServer: function () {
						var self = this,
							q = $.Deferred(),
							saveEvents = [],
							cachedItems = self.findAllCached();

						if (cachedItems && cachedItems.length > 0) cachedItems = self.models(cachedItems);

						cachedItems.forEach(function (item) {
							saveEvents.push(function (next) {
								if (!item) { // This data was deleted
									return next();
								}

								var itemId = item.id;
								if (self.isTempId(itemId))
									item.removeAttr('id');

								item.save().then(function (saveResult) {
									self.removeCachedItems(itemId);

									next();
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
							var existsCached = this.constructor.findAllCached({ id: instance.attr('id') });
							if (existsCached && existsCached.length > 0)
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
							var unsyncItems = this.constructor.findAllCached({ id: this.constructor.id });

							if (unsyncItems.indexOf(this.attr('id')) > -1)
								return true;
							else
								return false;

						}
					});

				return can.Model.Cached;
			});
	});
});