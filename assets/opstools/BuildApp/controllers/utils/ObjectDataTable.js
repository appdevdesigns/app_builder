steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/utils/ModelCreator.js',
	'opstools/BuildApp/controllers/utils/SelectivityHelper.js',
	function () {
		System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control').then(function () {

					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.ObjectDataTable', {

						init: function (element, options) {
							var self = this;

							// Call parent init
							this._super(element, options);

							self.data = {};
							self.data.objectList = [];

							self.initMultilingualLabels();
							self.initControllers();
							self.initEvents();
						},

						initMultilingualLabels: function () {
							var self = this;
							self.labels = {};
							self.labels.common = {};

							self.labels.common.yes = AD.lang.label.getLabel('ab.common.yes') || "Yes";
							self.labels.common.no = AD.lang.label.getLabel('ab.common.no') || "No";

							// Connected data
							self.labels.connectToObjectName = AD.lang.label.getLabel('ab.object.connectToObjectName') || " (Connect to <b>{0}</b>)";

							// Delete row
							self.labels.confirmDeleteRowTitle = AD.lang.label.getLabel('ab.object.deleteRow.title') || "Delete data";
							self.labels.confirmDeleteRowMessage = AD.lang.label.getLabel('ab.object.deleteRow.message') || "Do you want to delete this row?";

						},

						initControllers: function () {
							var self = this;
							self.controllers = {};

							var ModelCreator = AD.Control.get('opstools.BuildApp.ModelCreator'),
								SelectivityHelper = AD.Control.get('opstools.BuildApp.SelectivityHelper');

							self.controllers = {
								ModelCreator: new ModelCreator(),
								SelectivityHelper: new SelectivityHelper(self.element, { changedSelectivityEvent: self.options.changedSelectivityEvent })
							};
						},

						initEvents: function () {
							var self = this;

							self.controllers.SelectivityHelper.on(self.options.changedSelectivityEvent, function (event, data) {
								if (self.changeSelectivityItem) {
									var result = {};
									result.columnIndex = data.itemNode.parents('.webix_column').attr('column');
									result.columnId = self.dataTable.columnId(result.columnIndex);
									result.rowIndex = data.itemNode.parent('.webix_cell').index();
									result.rowId = self.dataTable.getIdByIndex(result.rowIndex);
									result.item = self.dataTable.getItem(result.rowId);
									result.itemData = result.item[result.columnId];

									self.changeSelectivityItem(data.event, result);
								}
							});

						},

						registerDataTable: function (dataTable) {
							var self = this;
							self.dataTable = dataTable;

							// Trash
							self.dataTable.attachEvent("onItemClick", function (id, e, node) {
								if (e.target.className.indexOf('trash') > 0) {
									webix.confirm({
										title: self.labels.confirmDeleteRowTitle,
										ok: self.labels.common.yes,
										cancel: self.labels.common.no,
										text: self.labels.confirmDeleteRowMessage,
										callback: function (result) {
											if (result) {
												if (self.deleteRow)
													self.deleteRow(id);
											}

											if (self.dataTable.unselectAll)
												self.dataTable.unselectAll();

											return true;
										}
									});
								}
							});

							self.dataTable.attachEvent('onAfterRender', function (data) {
								// Render selectivity node
								self.controllers.SelectivityHelper.renderSelectivity('connect-data-values', self.data.readOnly);

								data.each(function (d) {
									var maxConnectedDataNum = {};

									if (d.connectedData) {
										for (var columnName in d.connectedData) {
											if ($.grep(self.dataTable.config.columns, function (c) { return c.id == columnName }).length < 1) break;

											var connectFieldNode = $(self.dataTable.getItemNode({ row: d.id, column: columnName })).find('.connect-data-values');
											// Set selectivity data
											self.controllers.SelectivityHelper.setData(connectFieldNode, d.connectedData[columnName]);

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

							self.dataTable.refresh();
						},

						setApp: function (app) {
							this.controllers.ModelCreator.setApp(app);
						},

						setObjectList: function (objectList) {
							this.data.objectList = objectList;
						},

						setReadOnly: function (readOnly) {
							this.data.readOnly = readOnly;
						},

						registerChangeSelectivityItem: function (changeSelectivityItem) {
							this.changeSelectivityItem = changeSelectivityItem;
						},

						registerDeleteRowHandler: function (deleteRow) {
							this.deleteRow = deleteRow;
						},

						bindColumns: function (columns, resetColumns, addTrashColumn) {
							var self = this;

							if (resetColumns)
								self.dataTable.clearAll();

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

								// checkbox
								if (mapCol.filter_type === 'checkbox' && self.data.readOnly) {
									mapCol.disable = true; // TODO : Checkbox read only
								}

								// richselect
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