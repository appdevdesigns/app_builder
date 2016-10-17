steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/utils/ModelCreator.js',
	'opstools/BuildApp/controllers/utils/DataHelper.js',

	'OpsPortal/classes/OpsWebixDataCollection.js',

	function (modelCreator, dataHelper) {
		var dataCollections = {};

		return {
			getDataCollection: function (applcation, objectId) {
				var self = this,
					q = $.Deferred();

				if (!objectId) {
					q.reject("Object id is required.");
					return;
				}

				if (!dataCollections[objectId]) {
					// Get object info
					var objInfo = applcation.objects.filter(function () { return obj.id == objectId });

					if (!objInfo || objInfo.length < 1) {
						q.reject(err);
						return q;
					}

					objInfo = objInfo[0];

					async.waterfall([
						// Get object model
						function (next) {
							modelCreator.getModel(application, objInfo.attr('name'))
								.fail(function (err) { next(err); })
								.then(function (objectModel) {
									next(null, objectModel);
								});
						},
						// Find data
						function (objModel, next) {
							// Get link columns
							var linkCols = objInfo.columns.filter(function (col) { return col.linkObject != null }),
								linkColObjs = linkCols.map(function (col) {
									return {
										name: col.name,
										linkObject: col.linkObject
									};
								});

							// Get date & datetime columns
							var dateCols = objInfo.columns.filter(function (col) { return col.setting.editor === 'date' || col.setting.editor === 'datetime'; });

							objModel.findAll({})
								.fail(next)
								.then(function (data) {

									// Populate labels & Convert string to Date object
									dataHelper.normalizeData(applcation, data, linkColObjs, dateCols)
										.then(function (result) {
											if (!dataCollections[objectId])
												dataCollections[objectId] = AD.op.WebixDataCollection(result);

											next(null, dataCollections[objectId], linkColObjs, dateCols);
										});
								});
						},
						// Listen change data event to update data label
						function (dataCollection, linkColObjs, dateCols, next) {
							linkColObjs.forEach(function (linkCol) {
								dataCollection.AD.__list.bind('change', function (ev, attr, how, newVal, oldVal) {
									var attName = attr.indexOf('.') > -1 ? attr.split('.')[1] : attr, // 0.attrName
										hasUpdateLink = linkColObjs.filter(function (col) { return col.name == attName; }).length > 0;

									if (hasUpdateLink && newVal) {
										// Update connected data
										dataHelper.normalizeData(applcation, ev.target, linkColObjs, dateCols)
											.then(function (result) { });
									}
								});
							});

							next();
						}
					], function (err) {
						if (err) {
							q.reject(err);
							return;
						}

						q.resolve(dataCollections[objectId]);
					});
				}
				else {
					q.resolve(dataCollections[objectId]);
				}

				return q;
			}
		};

	}
);