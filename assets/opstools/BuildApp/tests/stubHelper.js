steal(function () {
	var data = {}, // { objectName: [data], ..., objectNameN: [dataN] };
		models = {}; // { objectName: [can.Model], ..., objectNameN: [can.ModelN] };

	function getFixtureData(objectName, cond) {
		var q = $.Deferred(),
			dataResult = null;

		async.series([
			// Get data
			function (next) {
				if (!data[objectName]) {
					$.ajax({
						url: '/opstools/BuildApp/tests/fixtures/' + objectName + '.json',
						type: 'GET',
						dataType: "json"
					})
						.fail(next)
						.then(function (result) {
							data[objectName] = result;

							next();
						});
				}
				else {
					next();
				}
			},
			// Filter data
			function (next) {
				if (cond) {
					dataResult = data[objectName].filter(function (item) {
						var result = true;

						for (key in cond) {
							if (result && item.hasOwnProperty(key) && (item.attr(key) == cond[key] || item.attr(key).id == cond[key])) {
								result = true;
							}
							else {
								result = false;
							}
						}

						return result;
					});
				}
				else {
					dataResult = data[objectName];
				}

				next();
			}
		], function (err) {
			if (err) {
				q.reject(err);
			}
			else {
				q.resolve(dataResult);
			}
		});

		return q;
	}

	function saveData(objectName, obj) {
		var q = $.Deferred();

		async.series([
			// Get data
			function (next) {
				if (!data[objectName]) {
					getFixtureData(objectName, null)
						.fail(next)
						.then(function (data) { next(); });
				}
				else {
					next();
				}
			},
			// Add new data to local repository
			function (next) {
				if (obj.id) { // Update
					data[objectName].forEach(function (element, index) {
						if (element.attr('id') == obj.id)
							data[objectName].attr(index, obj);
					});
				}
				else { // Insert
					data[objectName].push(obj);
				}

				next();
			}
		], function (err) {
			if (err) {
				q.reject(err);
			}
			else {
				q.resolve();
			}
		});

		return q;
	};

	function removeData(objectName, id) {
		var q = $.Deferred();

		async.series([
			// Get data
			function (next) {
				if (!data[objectName]) {
					getFixtureData(objectName, null)
						.fail(next)
						.then(function (data) { next(); });
				}
				else {
					next();
				}
			},
			// Remove data
			function (next) {
				var index = null;

				data[objectName].forEach(function (item, i) {
					if (item.id == id)
						index = i;
				});

				if (index)
					data[objectName].splice(index, 1);

				next();
			}
		], function (err) {
			if (err) {
				q.reject(err);
			}
			else {
				q.resolve();
			}
		});

		return q;
	};

	return {

		getMockModel: function (objectName) {
			if (models[objectName] == null) {

				var instanceProps = {
					getID: function () { return this.id; }
				};

				if (objectName == 'ABObject')
					instanceProps.getDataLabel = function (item) { return 'TODO: getDataLabel'; };

				var mockModel = can.Model(
					objectName,
					{
						findAll: function (cond) {
							var self = this,
								q = $.Deferred();

							if (self._mockData == null) {
								// Get mock data
								getFixtureData(objectName)
									.then(function (result) {
console.log('DC fixture:', objectName, result);
										self._mockData = self.models(result);
										q.resolve(self._mockData);
									});
							}
							else {
								// TODO : filter condition
								q.resolve(self._mockData);
							}

							return q;
						},
						findOne: function (cond) {
							var self = this,
								q = $.Deferred();

							// TODO : filter condition
							q.resolve(self._mockData[0]);

							return q;
						},
						create: function () {
							var q = $.Deferred();
							q.resolve();
							return q;
						},
						update: function () {
							var q = $.Deferred();
							q.resolve();
							return q;
						},
						destroy: function (def) {
							var q = $.Deferred();
							q.resolve();
							return q;
						}
					},
					instanceProps);

				models[objectName] = mockModel;
			}

			return models[objectName];
		},

		convertToStub: function (model, objectName) {
			sinon.stub(model, 'findAll', function (cond) {
				var q = $.Deferred();

				getFixtureData(objectName, cond)
					.fail(q.reject)
					.then(function (result) {
						q.resolve(model.models(result));
					});

				return q;
			});

			sinon.stub(model, 'findOne', function (cond) {
				var q = $.Deferred();

				getFixtureData(objectName, cond).fail(q.reject)
					.then(function (result) {
						if (result && result.length > 0)
							q.resolve(model.model(result[0]));
						else
							q.resolve(null);
					});

				return q;
			});
			sinon.stub(model, 'create', function (obj) { return saveData(objectName, obj); });
			sinon.stub(model, 'update', function (id, obj) {
				obj.id = id;
				return saveData(objectName, obj);
			});
			sinon.stub(model, 'destroy', function (id) { return removeData(objectName, id); });
		},

		restore: function (model) {
			if (model.findAll.restore)
				model.findAll.restore();

			if (model.findOne.restore)
				model.findOne.restore();

			if (model.create.restore)
				model.create.restore();

			if (model.update.restore)
				model.update.restore();

			if (model.destroy.restore)
				model.destroy.restore();

			if (model.getDataLabel && model.getDataLabel.restore)
				model.getDataLabel.restore();
		},

		clearLocalData: function (objectName) {
			delete data[objectName];
		}
	};

});