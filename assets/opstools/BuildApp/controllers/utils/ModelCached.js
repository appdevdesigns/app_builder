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
					cacheClear: function () {
						window.localStorage.removeItem(this.cachedKey());
						this._cached = {};

						// Raise event
						if (this.actionEvent) {
							this.actionEvent({
								action: 'count',
								count: 0
							});
						}
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

						// Raise event
						if (this.actionEvent) {
							this.actionEvent({
								action: 'count',
								count: Object.keys(data).length
							});
						}
					},
					removeCachedItems: function (itemIds) {
						var data = this._cached;

						if (!(itemIds instanceof Array))
							itemIds = [itemIds];

						itemIds.forEach(function (itemId) {
							delete data[itemId];
						});

						if (!data || Object.keys(data).length < 1)
							window.localStorage.removeItem(this.cachedKey());
						else
							window.localStorage.setItem(this.cachedKey(), JSON.stringify(data));

						// Raise event
						if (this.actionEvent) {
							this.actionEvent({
								action: 'count',
								count: Object.keys(data).length
							});
						}
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
					count: function () {
						if (!this._cached) return 0;

						return Object.keys(this._cached).length;
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
					cacheFindAll: function (findAllFn, params, ignoreCache) {
						var def = new can.Deferred(),
							self = this,
							cachedData = this.findAllCached(params),
							cachedDataModel = this.models(cachedData || []);

						findAllFn.then(can.proxy(function (data) {

							can.each(data, function (d, index) {
								if (d.translate) d.translate();

								// Merge cached and actual data
								cachedDataModel.forEach(function (cachedItem) {
									if (d[self.fieldId] == cachedItem[self.fieldId]) {
										var propNames = can.Map.keys(cachedItem);

										d = self.model(d.attr()); // Convert Map to Cached object

										propNames.forEach(function (prop) {
											if (prop !== "id" && prop !== "createdAt" && prop != "updatedAt")
												d.attr(prop, cachedItem[prop]); // Update value
										});

										data[index] = d;
									}
								});
							});

							// else { // Add
							// 	data.push(cachedItem);
							// }

							// if (!ignoreCache)
							// 	self.cacheItems(json);

							def.resolve(data);
						}, this), function (err) {
							if (cachedData) // 404 not found - new object data
								def.resolve(cachedDataModel);
							else
								def.reject(err);
						});

						return def;
					},
					makeFindAllPopulate: function (findAllPopulate) {
						return function (params, fields, ignoreCache) {
							return this.cacheFindAll(findAllPopulate(params, fields), params, ignoreCache);
						};
					},
					makeFindAll: function (findAll) {
						return function (params, ignoreCache) {
							return this.cacheFindAll(findAll(params), params, ignoreCache);
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
										var localObj = self.saveLocalItem(obj); // Cache data

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
							var isUpdateNew = Object.keys(obj).filter(function (k) {
								if (typeof obj[k] !== 'undefined' && obj[k] !== null) {
									var newFields = self.getNewFields().filter(function (f) { return k == f.name; });
									return newFields && newFields.length > 0;
								}
								else {
									return false;
								}
							});
							if (isUpdateNew && isUpdateNew.length > 0)
								hasNewField = true;

							var saveObj2 = $.extend({}, saveObj); // Copy for save to local

							async.waterfall([
								function (next) {
									update(id, saveObj)
										.fail(function (err) {
											if (err === null || err.message.indexOf('ER_NO_SUCH_TABLE') > -1) { // 404 Not found - new object case 
												self.saveLocalItem(saveObj2, id)
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
										self.saveLocalItem(saveObj, id)
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
								self = this,
								removedObj;

							async.series([
								function (next) {
									destroy(id) // Call service to destroy
										.fail(next)
										.then(function (result) {
											removedObj = result;
											next();
										});
								},
								function (next) {
									self.findOne({ id: id }, true) // Find in local
										.fail(function (err) { next(err); })
										.then(function (result) {
											if (result)
												result.destroyed(); // Destroy in local repository

											if (removedObj)
												q.resolve(removedObj);
											else
												q.resolve(result);

											next();
										});
								}
							]);

							return q;
						};
					},

					saveLocalItem: function (attr, id) {
						var self = this,
							q = AD.sal.Deferred();

						if (id) { // Update cache item
							self.findOne({ id: id })
								.fail(function (err) { q.reject(err); })
								.then(function (result) {
									result.updated(attr, true); // Update in local repository

									q.resolve(attr);
								});
						}
						else { // Create cache item
							var cachedObj = $.extend({}, attr);
							tempId = 'temp' + webix.uid();
							cachedObj.id = tempId;

							self.cacheItems([cachedObj]); // Cache new

							q.resolve(cachedObj);
						}

						return q;
					},

					isTempId: function (id) {
						return typeof id === 'string' && id.startsWith('temp');
					},



					// Cache new fields
					cacheNewFieldKey: function () {
						return this.cachedKey() + '_new_fields';
					},

					cacheNewField: function (newField) {
						if (newField) {
							var cacheFields = this.getNewFields(),
								result;

							newField.name = newField.name.replace(/ /g, '_');

							if (!newField.id) { // Add
								newField.id = 'temp' + webix.uid();
								cacheFields.push(newField);

								result = newField;
							}
							else { // Update
								cacheFields.forEach(function (f, index) {
									if (f.id == newField.id) {
										for (var key in newField) {
											cacheFields[index][key] = newField[key];
										}

										result = cacheFields[index];
									}
								});
							}

							window.localStorage.setItem(this.cacheNewFieldKey(), JSON.stringify(cacheFields));

							return result;
						}
						else {
							return null;
						}
					},

					getNewFields: function () {
						return JSON.parse(window.localStorage.getItem(this.cacheNewFieldKey())) || [];
					},

					deleteCachedField: function (fieldId) {
						var cacheFields = this.getNewFields();

						cacheFields.forEach(function (f, index) {
							if (f.id == fieldId)
								cacheFields.splice(index, 1)
						});

						if (cacheFields && cacheFields.length > 0)
							window.localStorage.setItem(this.cacheNewFieldKey(), JSON.stringify(cacheFields));
						else
							this.clearCacheFields();
					},

					clearCacheFields: function () {
						window.localStorage.removeItem(this.cacheNewFieldKey());
					},


					// Sync to database
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
					},

					registerActionEvent: function (actionEvent) {
						this.actionEvent = actionEvent;
					}

				}, {
						updated: function (attrs, forceCache) {
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
							if (existsCached && existsCached.length > 0 || forceCache === true)
								instance.constructor.cacheItems([instance.attr()]);

							// Update our model
							can.Model.prototype.updated.apply(instance, arguments);
						},
						created: function (attrs) {
							// if (attrs.translate) attrs.translate();

							// // Save the model to local storage
							// this.constructor.cacheItems([attrs]);

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
						isUnsync: function () {
							var unsyncItems = this.constructor.findAllCached({ id: this.id });

							if (unsyncItems && unsyncItems.length > 0)
								return true;
							else
								return false;

						}
					});

				return can.Model.Cached;
			});
	});
});