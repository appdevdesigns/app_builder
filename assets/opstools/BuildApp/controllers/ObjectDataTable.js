steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/utils/ModelCreator.js',
	function () {
        System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control').then(function () {

					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.ObjectDataTable', {

						init: function (element, options) {
							var self = this;

							self.data = {};
							self.data.objectList = [];

							self.initMultilingualLabels();
							self.initControllers();
						},

						initMultilingualLabels: function () {
							var self = this;
							self.labels = {};

							// Connected data
							self.labels.connectToObjectName = AD.lang.label.getLabel('ab.object.connectToObjectName') || " (Connect to <b>{0}</b>)";
							self.labels.noConnectedData = AD.lang.label.getLabel('ab.object.noConnectedData') || "No data selected";
						},

						initControllers: function () {
							var self = this;
							self.controllers = {};

							var ModelCreator = AD.Control.get('opstools.BuildApp.ModelCreator');

							self.controllers.ModelCreator = new ModelCreator();
						},

						registerDataTable: function (dataTable) {
							var self = this;
							self.dataTable = dataTable;

							self.dataTable.attachEvent('onAfterRender', function (data) {
								// Initial multi-combo
								$('.connect-data-values').selectivity('destroy');
								$('.connect-data-values').selectivity({
									allowClear: true,
									multiple: true,
									removeOnly: true,
									showDropdown: false,
									showSearchInputInDropdown: false,
									placeholder: self.labels.noConnectedData
								}).on('change', function (ev) {
									if (self.changeSelectivityItem) {
										var columnIndex = $(this).parents('.webix_column').attr('column'),
											columnId = self.dataTable.columnId(columnIndex),
											rowIndex = $(this).parent('.webix_cell').index(),
											rowId = self.dataTable.getIdByIndex(rowIndex),
											item = self.dataTable.getItem(rowId),
											itemData = item[columnId];

										self.changeSelectivityItem(ev, {
											columnIndex: columnIndex,
											columnId: columnId,
											rowIndex: rowIndex,
											rowId: rowId,
											item: item,
											itemData: itemData
										});
									}
								});


								data.each(function (d) {
									var maxConnectedDataNum = {};

									if (d.connectedData) {
										for (var columnName in d.connectedData) {
											var connectFieldNode = $(self.dataTable.getItemNode({ row: d.id, column: columnName }));
											connectFieldNode.find('.connect-data-values').selectivity('data', d.connectedData[columnName]);

											if (maxConnectedDataNum.dataNum < d.connectedData[columnName].length || !maxConnectedDataNum.dataNum) {
												maxConnectedDataNum.dataId = d.id;
												maxConnectedDataNum.colName = columnName;
												maxConnectedDataNum.dataNum = d.connectedData[columnName].length;
											}
										}
									}

									// Call to calculate row height
									if (maxConnectedDataNum.dataId)
										self.calculateRowHeight(maxConnectedDataNum.dataId, maxConnectedDataNum.colName, maxConnectedDataNum.dataNum);
								});
							});
						},

						setAppId: function (appId) {
							this.controllers.ModelCreator.setAppId(appId);
						},

						setAppName: function (appName) {
							this.controllers.ModelCreator.setAppName(appName);
						},

						setObjectList: function (objectList) {
							this.data.objectList = objectList;
						},

						registerChangeSelectivityItem: function (changeSelectivityItem) {
							this.changeSelectivityItem = changeSelectivityItem;
						},

						bindColumns: function (columns, resetColumns, addTrashColumn) {
							var self = this;

							var headers = $.map(columns.attr ? columns.attr() : columns, function (col, i) {

								col.setting.width = self.calculateColumnWidth(col);

								if (col.setting.format)
									col.setting.format = webix.i18n[col.setting.format];

								var options = [];
								if (col.setting.options && col.setting.options.length > 0) {
									col.setting.options.forEach(function (opt) {
										options.push({
											id: opt.id,
											value: opt.label
										});
									});
								}

								var mapCol = $.extend(col.setting, {
									id: col.name,
									dataId: col.id,
									label: col.label,
									header: self.getHeader(col),
									weight: col.weight,
									linkToObject: col.linkToObject
								});

								if (options && options.length > 0)
									mapCol.options = options;

								return mapCol;
							});

							headers.sort(function (a, b) { return a.weight - b.weight; });

							if (addTrashColumn) {
								headers.push({
									id: "appbuilder_trash",
									header: "",
									width: 40,
									template: "<span class='trash'>{common.trashIcon()}</span>",
									css: { 'text-align': 'center' }
								});
							}

							self.dataTable.refreshColumns(headers, resetColumns || false);
						},

						getHeader: function (col) {
							var self = this,
								label = col.label;

							// Show connect object name in header
							if (col.setting.editor === 'selectivity') {
								// Find label of connect object
								var connectObj = self.data.objectList.filter(function (o) {
									return o.id == col.linkToObject;
								});

								if (connectObj && connectObj.length > 0)
									label += self.labels.connectToObjectName.replace('{0}', connectObj[0].label);
							}

							return "<div class='ab-object-data-header'><span class='webix_icon fa-{0}'></span>{1}<i class='ab-object-data-header-edit fa fa-angle-down'></i></div>"
								.replace('{0}', col.setting.icon)
								.replace('{1}', label);
						},

						calculateColumnWidth: function (col) {
							var self = this,
								charWidth = 7,
								width = (col.label.length * charWidth) + 80;

							if (col.linkToObject) {// Connect to... label
								var object = self.data.objectList.filter(function (o) {
									return o.id === col.linkToObject;
								});

								if (object && object.length > 0)
									width += object[0].label.length * charWidth + 55;
							}

							return width;
						},

						calculateRowHeight: function (row, column, dataNumber) {
							var self = this,
								rowHeight = 35;
							// maxItemWidth = 100, // Max item width
							// columnInfo = $$(self.webixUiId.objectDatatable).getColumnConfig(column),
							// curSpace = columnInfo.width * rowHeight,
							// expectedSpace = (dataNumber * rowHeight * maxItemWidth),
							// calHeight = 0;

							var calHeight = dataNumber * rowHeight;

							// if (expectedSpace > curSpace) {
							// 	while (expectedSpace > (calHeight * columnInfo.width)) {
							// 		calHeight += rowHeight;
							// 	}
							// }
							// else {
							// 	calHeight = rowHeight;
							// }

							if (self.dataTable.getItem(row).$height != calHeight)
								self.dataTable.setRowHeight(row, calHeight);
						},

						populateDataToDataTable: function (result) {
							var self = this,
								q = $.Deferred();

							result.forEach(function (r) {
								if (r.translate)
									r.translate();
							});

							// Get connected columns
							var linkCols = $.grep(self.dataTable.config.columns, function (c) {
								return c.linkToObject;
							});

							var prepareConnectedDataEvents = [];

							linkCols.forEach(function (c) {
								prepareConnectedDataEvents.push(function (callback) {
									var getConnectedDataEvents = [];

									// Get connected object name
									var connectedObj = self.data.objectList.filter(function (obj) { return obj.id == c.linkToObject; })[0];

									// Get connected object model
									self.controllers.ModelCreator.getModel(connectedObj.name)
										.then(function (objectModel) {

											can.each(result, function (r) {
												getConnectedDataEvents.push(function (cb) {
													var connectedDataIds = r[c.id];

													r.removeAttr('connectedData');

													if (!connectedDataIds || connectedDataIds.length < 1) {
														cb();
														return true;
													}

													if (!self.dataTable.isColumnVisible(c.id)) {
														cb();
														return true;
													}

													connectedDataIds = $.map(connectedDataIds, function (d) { return { id: d.id || d }; });

													objectModel.Cached.findAll({ or: connectedDataIds }, false, true)
														.then(function (connectedResult) {
															connectedResult.forEach(function (d) {
																if (d.translate) d.translate();

																d.attr('labelFormat', connectedObj.getDataLabel(d));
															});

															if (connectedResult && connectedResult.length > 0) {
																r.attr('connectedData', {}, true);

																var connectedDataValue = $.map(connectedResult.attr(), function (d) {
																	return {
																		id: d.id,
																		text: d.labelFormat
																	}
																});

																r.connectedData.attr(c.id, connectedDataValue);
															}


															cb();
														});
												});
											});

											async.parallel(getConnectedDataEvents, callback);
										});

								});
							});

							async.parallel(prepareConnectedDataEvents,
								function (err, results) {
									self.dataTable.clearAll();
									self.dataTable.parse(result.attr ? result.attr() : []);

									q.resolve();
								}
							);

							return q;
						}

					});
				});
		});
	}
);