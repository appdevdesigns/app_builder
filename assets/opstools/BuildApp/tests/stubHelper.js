var abStubHelper = (function ($) {
	var data = {}; // { objectName: [data], ..., objectNameN: [datan] };

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
							data[objectName] = new can.List(result);

							next();
						});
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

					next();
				}
				else {
					dataResult = data[objectName];

					next();
				}
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
	};

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

	function removeData(id) {
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
					if (item.attr('id') == id)
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
		convertToStub: function (model, objectName) {
			sinon.stub(model, 'findAll', function (cond) { return getFixtureData(objectName, cond); });
			sinon.stub(model, 'findOne', function (cond) { return getFixtureData(objectName, cond)[0] || null; });
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
		},

		clearLocalData: function (objectName) {
			delete data[objectName];
		}
	};

})(jQuery);