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

										// Listen change data event to update data label
										dataCollections[objectId].AD.__list.bind('change', function (ev, attr, how, newVal, oldVal) {
											console.log('DC.change: ', objInfo.attr('name'), attr, how, newVal, oldVal);

											if ((attr.match(/\./g) || []).length > 2 // Ignore 0.attrName.1.linkedAttrName
												|| oldVal === newVal) return;

											var rowIndex = -1,
												attrName = attr;

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
											else if (attrName == '_dataLabel' || attrName == 'updatedAt' || attrName == 'translations') return;

											console.log('DC after updateConnectData: ', objInfo.attr('name'), attr, how, newVal, oldVal);
											self.updateConnectData(application, linkCols, rowData, attrName, how, newVal, oldVal);

											if (oldVal == null && newVal == null) return;

											var hasUpdateLink = linkCols.filter(function (col) { return col.name == attrName; }).length > 0,
												hasUpdateDate = dateCols.filter(function (col) { return col.name == attrName; }).length > 0;

											if (how == 'add' || hasUpdateLink || hasUpdateDate) {
												console.log('DC after normalize: ', objInfo.attr('name'), attr, how, newVal, oldVal);
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
			},

			updateConnectData: function (application, linkCols, rowData, attrName, how, newVal, oldVal) {
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
								if (!newVal[0] || !newVal[0][col.name] ||
									(newVal[0][col.name].id && newVal[0][col.name].id != linkRow.id) ||
									(newVal[0][col.name].filter && newVal[0][col.name].filter(function (c) { return c.id == linkRow.id; }).length < 1))
									return;

								// Add link data to link via
								if (linkVia.setting.linkType == 'model') {
									linkRow.attr(linkVia.name, newVal[0] ? newVal[0] : newVal);
								}
								else if (linkVia.setting.linkType == 'collection') {
									var exists = linkViaVal.filter(function (val) {
										return val.id == (newVal[0] ? newVal[0].id : newVal.id);
									});

									if (!exists[0]) {
										var childVal = linkViaVal.attr();
										childVal.push(newVal[0] ? newVal[0] : newVal);
										linkRow.attr(linkVia.name, childVal);
									}
								}
								break;


							case 'set':
								if (col.name != attrName || isSame(newVal, oldVal)) return;

								// 1:1
								if (col.setting.linkType == 'model' && linkVia.setting.linkType == 'model') {
									// TODO
								}
								// M:1
								else if (col.setting.linkType == 'collection' && linkVia.setting.linkType == 'model') {
									// Remove parent data (when child is not in list)
									if (linkViaVal && rowData.id == (linkViaVal.id || linkViaVal)
										&& newVal.filter(function (v) { return v.id == (linkViaVal.id || linkViaVal); }).length < 1) {
										linkRow.attr(linkVia.name, null);
									}
									// Add parent data to child
									else if (linkViaVal && rowData.id != (linkViaVal.id || linkViaVal)
										&& newVal.filter(function (v) { return v.id == (linkViaVal.id || linkViaVal); }).length > 0) {
										linkRow.attr(linkVia.name, linkViaVal.id || linkViaVal);
									}
								}
								// 1:M
								else if (col.setting.linkType == 'model' && linkVia.setting.linkType == 'collection') {
									if (oldVal && linkRow.id == oldVal.id) {
										var removeChildData = linkViaVal.attr().filter(function (v) { return v.id != rowData.id; });
										linkRow.attr(linkVia.name, removeChildData);
									}
									else if (newVal && linkRow.id == (newVal.id || newVal)) {
										var exists = linkViaVal.filter(function (val) { return val.id == rowData.id || val == rowData.id; });

										if (!exists[0]) {
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
										return val.id != (oldVal[0] ? oldVal[0].id : oldVal.id);
									});

									if (linkViaVal.length != removedData.length)
										linkRow.attr(linkVia.name, removedData);
								}
								else if (linkViaVal.id == (oldVal[0] ? oldVal[0].id : oldVal.id)) {
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