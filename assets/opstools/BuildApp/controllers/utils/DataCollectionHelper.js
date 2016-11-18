steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/utils/ModelCreator.js',
	'opstools/BuildApp/controllers/utils/DataHelper.js',

	'OpsPortal/classes/OpsWebixDataCollection.js',

	function (modelCreator, dataHelper) {
		var dataCollections = {};

		return {
			getDataCollection: function (application, objectId) {
				var self = this,
					q = $.Deferred();

				if (!objectId) {
					q.reject("Object id is required.");
					return q;
				}

				if (dataCollections[objectId] == null) {
					// Get object info
					var objInfo = application.objects.filter(function (obj) { return obj.id == objectId });

					if (!objInfo || objInfo.length < 1) {
						q.reject('System could not found this object.');
						return q;
					}
					objInfo = objInfo[0];

					// Get object model
					var objectModel = modelCreator.getModel(application, objInfo.attr('name')),
						objectData;

					async.series([
						// Find data
						function (next) {
							objectModel.findAll({})
								.fail(next)
								.then(function (data) {
									objectData = data;
									next();
								});
						},
						// Populate labels & Convert string to Date object
						function (next) {
							if (objectData == null) return next();

							var linkCols = objInfo.columns.filter(function (col) { return col.setting.linkObject }) || [], // Get link columns
								dateCols = objInfo.columns.filter(function (col) { return col.setting.editor === 'date' || col.setting.editor === 'datetime'; }) || []; // Get date & datetime columns

							dataHelper.normalizeData(application, objInfo.attr('id'), objInfo.columns, objectData)
								.fail(next)
								.then(function (result) {
									if (!dataCollections[objectId]) {
										dataCollections[objectId] = AD.op.WebixDataCollection(result);

										// Listen change data event to update data label
										dataCollections[objectId].AD.__list.bind('change', function (ev, attr, how, newVal, oldVal) {
											console.log('DC.change: ', objInfo.attr('name'), attr, how, newVal, oldVal);
											var rowIndex = -1,
												attrName = attr;

											// Remove link data
											if (how === 'remove') {
												linkCols.forEach(function (col) {
													var linkDC = dataCollections[col.setting.linkObject],
														linkObjInfo = application.objects.filter(function (obj) { return obj.id == col.setting.linkObject; });
													if (linkDC == null || linkObjInfo == null) return;

													linkObjInfo = linkObjInfo[0];

													// Get link column name
													var updateLinkCol = linkObjInfo.columns.filter(function (c) { return c.id == col.setting.linkVia; });
													if (!updateLinkCol || !updateLinkCol[0]) return;

													updateLinkCol = updateLinkCol[0];

													linkDC.AD.__list.forEach(function (linkRow) {
														// Remove link data
														var linkVal = linkRow.attr(updateLinkCol.name);
														if (linkVal instanceof can.List) {
															var removedData = linkVal.filter(function (val) {
																return val.id != (oldVal[0] ? oldVal[0].id : oldVal.id);
															});

															if (linkVal.length != removedData.length)
																linkRow.attr(updateLinkCol.name, removedData);
														}
													});
												});
												return;
											}

											if ((attr.match(/\./g) || []).length > 2 // Ignore 0.attrName.1.linkedAttrName
												|| (oldVal == null && newVal == null)
												|| oldVal === newVal) return;

											if (attr.indexOf('.') > -1) {  // 0.attrName
												rowIndex = attr.split('.')[0];
												attrName = attr.split('.')[1];
											}

											var rowData = rowIndex > -1 ? this[rowIndex] : this; // Get data

											// Convert $height to number
											if (attrName == '$height' && newVal) {
												if (typeof newVal !== 'number') {
													var rowHeight = parseInt(newVal);
													rowData.attr('$height', rowHeight);
												}
												return;
											}
											else if (attrName == 'updatedAt' || attrName == 'translations') return;

											var hasUpdateLink = linkCols.filter(function (col) { return col.name == attrName; }).length > 0,
												hasUpdateDate = dateCols.filter(function (col) { return col.name == attrName; }).length > 0;

											if (how == 'add' || hasUpdateLink || hasUpdateDate) {
												console.log('DC.normalize: ', objInfo.attr('name'), attr, how);
												// Update connected data
												dataHelper.normalizeData(application, objInfo.attr('id'), objInfo.columns, rowData, true).then(function (result) { });
											}
										});
									}

									next();
								});
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