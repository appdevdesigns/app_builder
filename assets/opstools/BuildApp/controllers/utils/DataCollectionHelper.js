steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/utils/ModelCreator.js',
	'opstools/BuildApp/controllers/utils/DataHelper.js',

	'OpsPortal/classes/OpsWebixDataCollection.js',

	function (modelCreator, dataHelper) {

		var dataCollections = {};

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

				if (dataCollections[objectId] == null || isRefresh) {
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
									if (!dataCollections[objectId] || isRefresh) {
										dataCollections[objectId] = AD.op.WebixDataCollection(result);
										dataCollections[objectId].checkedItems = {}; // { rowId: boolean }
										dataCollections[objectId].updateDataTimeout = {}; // { dataId: timeoutId }

										// Listen change data event
										dataCollections[objectId].attachEvent('onAfterAdd', function (id, index) {
											var rowData = dataCollections[objectId].AD.__list.filter(function (row) { return row.id == id });
											if (!rowData || !rowData[0]) return;

console.log('DC onAfterAdd - objectId:', objectId, ' dataId: ', id, $.extend({}, rowData[0]));
											self.updateConnectData(application, linkCols, rowData, 'add');

											dataHelper.normalizeData(application, objInfo.attr('id'), objInfo.columns, rowData[0], true).then(function (result) { });
										});

										dataCollections[objectId].attachEvent("onDataUpdate", function (id, data) {
											if (dataCollections[objectId].updateDataTimeout[id]) clearTimeout(dataCollections[objectId].updateDataTimeout[id]);
											dataCollections[objectId].updateDataTimeout[id] = setTimeout(function () {
												var rowData = dataCollections[objectId].AD.__list.filter(function (row) { return row.id == id });
												if (!rowData || !rowData[0]) return true;

												var oldData = dataCollections[objectId].getItem(id);

console.log('DC onDataUpdate - objectId:', objectId, ' dataId: ', id, $.extend({}, rowData[0]));
												self.updateConnectData(application, linkCols, rowData[0], 'set');

												dataHelper.normalizeData(application, objInfo.attr('id'), objInfo.columns, rowData[0], true).then(function (result) { });

												delete dataCollections[objectId].updateDataTimeout[id];
											}, 500);

											return true;
										});

										dataCollections[objectId].attachEvent('onBeforeDelete', function (id) {
											var rowData = dataCollections[objectId].getItem(id);
											if (!rowData) return true;

console.log('DC onBeforeDelete - objectId:', objectId, ' dataId: ', id, $.extend({}, rowData));
											self.updateConnectData(application, linkCols, rowData, 'remove');

											return true;
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
			},

			updateConnectData: function (application, linkCols, rowData, how) {
console.log('test updateConnectData: ');
				linkCols.forEach(function (col) {
					var linkDC = dataCollections[col.setting.linkObject],
						linkObjInfo = application.objects.filter(function (obj) { return obj.id == col.setting.linkObject; });
					if (linkDC == null || linkObjInfo == null) return;

					linkObjInfo = linkObjInfo[0];

					// Get link column name
					var linkVia = linkObjInfo.columns.filter(function (c) { return c.id == col.setting.linkVia; });
					if (!linkVia || !linkVia[0]) return;

					linkVia = linkVia[0];

					linkDC.AD.__list.forEach(function (linkRow) {
						var linkViaVal = linkRow.attr(linkVia.name);

						switch (how) {
							case 'add':
								// Check row id of parent
								if (rowData[0] && rowData[0][col.name] &&
									((rowData[0][col.name].id || rowData[0][col.name]) == linkRow.id ||
										(rowData[0][col.name].filter && rowData[0][col.name].filter(function (c) { return (c.id || c) == linkRow.id; }).length > 0))) {

									// Add link data to link via
									if (linkVia.setting.linkType == 'model') {
										linkRow.attr(linkVia.name, rowData[0] ? (rowData[0].id || rowData[0]) : (rowData.id || rowData));
									}
									else if (linkVia.setting.linkType == 'collection') {
										var exists = linkViaVal.filter(function (val) {
											return val.id == (rowData[0] ? (rowData[0].id || rowData[0]) : (rowData.id || rowData));
										});

										if (!exists[0]) {
											var childVal = linkViaVal.attr();
											childVal.push(rowData[0] ? rowData[0] : rowData);
											linkRow.attr(linkVia.name, childVal);
										}
									}
								}
								break;


							case 'set':
								// 1:1
								if (col.setting.linkType == 'model' && linkVia.setting.linkType == 'model') {
									// TODO
								}
								// M:1
								else if (col.setting.linkType == 'collection' && linkVia.setting.linkType == 'model') {
									// Remove parent data (when child is not in list)
									if (linkViaVal && rowData.id == (linkViaVal.id || linkViaVal) && rowData[col.name].filter
										&& rowData[col.name].filter(function (v) { return (v.id || v) == linkRow.id; }).length < 1) {
console.log('test 2 : ', $.extend({}, rowData));
										linkRow.attr(linkVia.name, null);
									}
									// Add parent data to child
									else if ((!linkViaVal || rowData.id != (linkViaVal.id || linkViaVal)) && rowData[col.name].filter
										&& rowData[col.name].filter(function (v) { return (v.id || v) == linkRow.id; }).length > 0) {
console.log('test 3 : ', $.extend({}, rowData));
										linkRow.attr(linkVia.name, rowData.id);
									}
								}
								// 1:M
								else if (col.setting.linkType == 'model' && linkVia.setting.linkType == 'collection') {
									// Remove child data
									if (linkRow[linkVia.name].filter && linkRow.id != (rowData[col.name].id || rowData[col.name])
										&& linkRow[linkVia.name].filter(function (v) { return (v.id || v) == rowData.id; }).length > 0) {
console.log('test 4 : ', $.extend({}, rowData));
										var removeChildData = linkViaVal.attr().filter(function (v) { return (v.id || v) != rowData.id; });
										linkRow.attr(linkVia.name, removeChildData);
									}

									// Add new child data to parent
									if (rowData[col.name] && linkRow.id == (rowData[col.name].id || rowData[col.name])) {
console.log('test 5 : ', $.extend({}, rowData));
										var exists = linkViaVal.filter(function (val) { return (val.id || val) == rowData.id; });

										if (!exists[0]) {
console.log('test 6 : ', $.extend({}, rowData));
											var childVal = linkViaVal.attr();
											childVal.push(rowData.attr ? rowData.attr() : rowData);
											linkRow.attr(linkVia.name, childVal);
										}
									}
								}
								// M:N
								else if (col.setting.linkType == 'collection' && linkVia.setting.linkType == 'collection') {
									// TODO
								}
								break;


							case 'remove':
								// Remove link data
								if (linkViaVal instanceof can.List) {
									var removedData = linkViaVal.filter(function (val) {
										return val.id != (rowData ? rowData.id : rowData.id);
									});

									if (linkViaVal.length != removedData.length)
										linkRow.attr(linkVia.name, removedData);
								}
								else if (linkViaVal && linkViaVal.id == (rowData ? rowData.id : rowData.id)) {
									linkRow.attr(linkVia.name, null);
								}
								break;
						}
					});
				});
			}

		};

	}
);