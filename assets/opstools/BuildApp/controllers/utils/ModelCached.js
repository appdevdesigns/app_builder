steal(function () {
	System.import('can').then(function () {
		steal.import('can/model/model',
			'can/util/object/object').then(function () {

				// Base model to handle reading / writing to local storage
				can.Model('ab.Model.Cached', {
					setup: function () {
						var self = this;

						can.Model.setup.apply(self, arguments);

						this.tempIds = []; // [tempId]

						// setup data
						if (typeof window.localStorage !== 'undefined') {
							self._cached = JSON.parse(window.localStorage.getItem(self.cachedKey())) || {};
						} else {
							self._cached = {};
						}

						io.socket.on('server-reload', function (data) {
							if (!data.reloading) { // Server has finished reloading
								self.createInList();
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
								obj = data[idVal];
							if (obj) {
								can.extend(obj, item.attr());
							} else {
								data[idVal] = item.attr();
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
							if (this.filter(item, params) !== false) {
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
						// go through each param in params
						var param, paramValue;
						for (param in params) {
							paramValue = params[param];
							// in fixtures we ignore null, I don't want to now
							if (paramValue !== undefined && item[param] !== undefined && !this._compare(param, item[param], paramValue)) {
								return false;
							}
						}
					},
					compare: {},
					_compare: function (prop, itemData, paramData) {
						return can.Object.same(itemData, paramData, this.compare[prop]);
					},
					makeFindAll: function (findAll) {
						return function (params, success, error) {
							var def = new can.Deferred(),
								self = this,
								data = this.findAllCached(params);

							def.then(success, error);
							if (data.length) {
								var list = this.models(data);
								findAll(params).then(can.proxy(function (json) {
									can.each(json, function (d) {
										if (d.translate) d.translate();
									});

									this.cacheItems(json);
									list.attr(json, true); // update cached instances

									can.trigger(self, 'refreshData', { result: json });
								}, this), function () {
									can.trigger(list, 'error', arguments);
								});
								def.resolve(list);
							} else {
								findAll(params).then(can.proxy(function (data) {
									can.each(data, function (d) {
										if (d.translate) d.translate();
									});

									// Create our model instance
									var list = this.models(data);
									// Save the data to local storage
									this.cacheItems(data);
									// Resolve the deferred with our instance
									def.resolve(list);
								}, this), function (data) {
									def.reject(data);
								});
							}
							return def;
						};
					},
					makeFindOne: function (findOne) {
						return function (params, success, error, onlyLocal) {
							var def = new can.Deferred();

							// grab instance from cached data
							var data = this._cached[params[this.id]];
							// or try to load it
							data = data || this.findAllCached(params)[0];

							// Bind success and error callbacks to the deferred
							def.then(success, error);
							// If we had existing local storage data...
							if (data) {
								// Create our model instance
								var instance = this.model(data._data ? data._data : data);

								if (AD.comm.isServerReady() && !onlyLocal) {
									findOne(params).then(function (json) {
										// Update the instance when the ajax response returns
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

							if (!AD.comm.isServerReady()) { // Return local item
								var localObj = $.extend({}, obj);
								tempId = 'temp' + webix.uid();
								localObj.id = tempId;
								this.tempIds.push(tempId);

								q.resolve(localObj);

								return q; // Don't call service to add new item
							}

							create(obj)
								.fail(function (err) { q.reject(err); })
								.then(function (result) { q.resolve(result); });

							return q;
						};
					},
					makeUpdate: function (update) {
						return function (id, obj) {
							var q = new can.Deferred(),
								saveObj = {},
								fieldList = Object.keys(this.describe()).concat(['id', 'translations']);

							fieldList.forEach(function (key) {
								if (typeof obj[key] != 'undefined' || obj[key] != null)
									saveObj[key] = obj[key];
							});

							if (!AD.comm.isServerReady()) { // System is syncing
								if (typeof id === 'string' && id.startsWith('temp')) {
									this.findOne({ id: id }).then(function (result) {
										result.updated(saveObj); // Update in local repository

										q.resolve(saveObj);
									});

									return q;  // Don't call service to update new item
								}
								else {
									q.resolve(saveObj);
								}
							}

							update(id, saveObj)
								.fail(function (err) { q.reject(err); })
								.then(function (result) {
									q.resolve(result);
								});

							return q;
						}
					},

					makeDestroy: function (destroy) {
						return function (id) {
							var q = new can.Deferred(),
								self = this;

							async.series([
								function (next) {
									if (typeof id != 'string' || !id.startsWith('temp')) {
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
										next();
									}

									if (!AD.comm.isServerReady())
										next();
								},
								function (next) {
									self.findOne({ id: id }, null, null, true)
										.fail(function (err) { next(err); })
										.then(function (result) {
											result.destroyed(); // Destroy in local repository

											if (typeof id === 'string' && id.startsWith('temp')) {
												var index = $.inArray(id, self.tempIds);
												if (index > -1)
													self.tempIds.splice(index, 1);
											}

											q.resolve(result);
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

					createInList: function () {
						var self = this;

						self.tempIds.forEach(function (tempId) {
							self.findOne({ id: tempId }, null, null, true).then(function (result) {
								result.removeAttr('id');

								result.save().then(function (saveResult) {
									self.changeId(tempId, saveResult.id);

									self.cacheItems([saveResult]);

									var index = $.inArray(tempId, self.tempIds);
									if (index > -1)
										self.tempIds.splice(index, 1);
								});
							});
						})
					}

				}, {
						updated: function (attrs) {
							if (this && attrs) this.attr(attrs);

							if (this.translate) this.translate();

							// Save the model to local storage
							this.constructor.cacheItems([this.attr()]);
							// Update our model
							can.Model.prototype.updated.apply(this, arguments);
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