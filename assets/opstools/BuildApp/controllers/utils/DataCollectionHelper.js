steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/utils/ModelCreator.js',
	'opstools/BuildApp/controllers/utils/DataHelper.js',

	'OpsPortal/classes/OpsWebixDataCollection.js',

	function (modelCreator, dataHelper) {

		var dataCollections = {},
			normalizedObjectIds = [];

		function isSame(newVal, oldVal) {
			return oldVal == newVal ||
				(newVal && oldVal == newVal.id) ||
				(oldVal && oldVal.id == newVal) ||
				(oldVal && newVal && oldVal.id && newVal.id && oldVal.id == newVal.id);
		}

		return {
			modelCreator: modelCreator,
			dataHelper: dataHelper,

			getDataCollection: function (application, objectId, isRefresh) {
				var self = this,
					q = $.Deferred();

				if (!objectId) {
					q.reject("Object id is required.");
					return q;
				}

				// Get object info
				var objInfo = application.objects.filter(function (obj) { return obj.id == objectId });

				if (!objInfo || objInfo.length < 1) {
					q.reject('System could not found this object.');
					return q;
				}

				if (normalizedObjectIds.indexOf(objectId) < 0 || isRefresh) {

					if (normalizedObjectIds.indexOf(objectId) < 0)
						normalizedObjectIds.push(objectId);

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
									if (dataCollections[objectId] == null || isRefresh) {
										dataCollections[objectId] = AD.op.WebixDataCollection(result);
										dataCollections[objectId].checkedItems = []; // [rowId1, rowId2, ..., rowIdn]
										dataCollections[objectId].updateDataTimeout = {}; // { dataId: timeoutId }

										dataCollections[objectId].attachEvent('onAfterCursorChange', function (id) {

											// TEMPORARY FEATURE :
											if (dataCollections[objectId].hasCurrentUserFilter == true) {
												setTimeout(function () {
													dataCollections[objectId].updateCursorToCurrentUser();
												}, 10);
											}
										});

										// Listen change data event
										dataCollections[objectId].attachEvent('onAfterAdd', function (id, index) {
											var rowData = dataCollections[objectId].AD.__list.filter(function (row) { return row.id == id });
											if (!rowData || !rowData[0]) return;

											dataHelper.normalizeData(application, objInfo.attr('id'), objInfo.columns, rowData[0], true).then(function (result) { });
										});

										dataCollections[objectId].attachEvent("onDataUpdate", function (id, data) {
											if (dataCollections[objectId].updateDataTimeout[id]) clearTimeout(dataCollections[objectId].updateDataTimeout[id]);
											dataCollections[objectId].updateDataTimeout[id] = setTimeout(function () {
												var rowData = dataCollections[objectId].AD.__list.filter(function (row) { return row.id == id });
												if (!rowData || !rowData[0]) return true;

												var oldData = dataCollections[objectId].getItem(id);

												dataHelper.normalizeData(application, objInfo.attr('id'), objInfo.columns, rowData[0], true).then(function (result) { });

												delete dataCollections[objectId].updateDataTimeout[id];
											}, 500);

											return true;
										});

										// Delete checked item when a record is deleted
										dataCollections[objectId].attachEvent('onAfterDelete', function (id) {
											dataCollections[objectId].uncheckItem(id);
										});

										dataCollections[objectId].checkItem = function (rowId) {
											if (dataCollections[objectId].checkedItems.filter(function (item) { return item == rowId }).length < 1) {
												dataCollections[objectId].checkedItems.push(rowId);
												dataCollections[objectId].callEvent('onCheckItemsChange');
											}
										};

										dataCollections[objectId].uncheckItem = function (rowId) {
											dataCollections[objectId].checkedItems.forEach(function (item, index) {
												if (item == rowId) {
													dataCollections[objectId].checkedItems.splice(index, 1);
													dataCollections[objectId].callEvent('onCheckItemsChange');
													return;
												}
											});
										};

										dataCollections[objectId].getCheckedItems = function () {
											return dataCollections[objectId].checkedItems;
										};

										dataCollections[objectId].updateCursorToCurrentUser = function () {
											var deferred = $.Deferred();

											if (dataCollections[objectId].hasCurrentUserFilter != true) {
												deferred.resolve();
												return deferred;
											}

											async.series([
												// Get default user name
												function (next) {
													if (dataCollections[objectId].currUsername == null) {
														AD.comm.service.get({
															url: '/site/user/data'
														})
															.fail(next)
															.done(function (data) {
																dataCollections[objectId].currUsername = data.user.username;

																next();
															});
													}
													else {
														next();
													}
												},
												// Set cursor to row that has a value as current user
												function (next) {
													var userCol = objInfo.columns.filter(function (col) { return col.fieldName == 'user'; })[0];

													if (userCol) {
														var selectRow = dataCollections[objectId].find(function (row) {
															if (row[userCol.name].filter) {
																return row[userCol.name].filter(function (data) {
																	return data.id == dataCollections[objectId].currUsername;
																}).length > 0;
															}
															else if (row[userCol.name] && row[userCol.name].id) {
																return row[userCol.name].id == dataCollections[objectId].currUsername;
															}
															else {
																return false;
															}
														})[0];

														if (selectRow != null)
															dataCollections[objectId].setCursor(selectRow.id);

														next();
													}
													else {
														next();
													}
												}
											], function (err) {
												if (err)
													deferred.reject(err);
												else
													deferred.resolve();
											});

											return deferred;
										};
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
					if (dataCollections[objectId] == null) {
						// Wait until data collection is complete
						function returnDC() {
							setTimeout(function () {
								if (dataCollections[objectId])
									q.resolve(dataCollections[objectId]);
								else
									returnDC();
							}, 500);
						}

						returnDC();
					}
					else {
						q.resolve(dataCollections[objectId]);
					}
				}

				return q;
			}

		};

	}
);