steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/utils/SelectivityHelper.js',
	'opstools/BuildApp/controllers/utils/DataHelper.js',
	function (selectivityHelper) {
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

							self.events = {};

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

							var DataHelper = AD.Control.get('opstools.BuildApp.DataHelper');

							self.controllers = {
								DataHelper: new DataHelper()
							};
						},

						initEvents: function () {
							var self = this;

							selectivityHelper.onSelectItem(function (data) {
								if (self.events.changeSelectivityItem) {
									var result = {};
									result.columnIndex = data.itemNode.parents('.webix_column').attr('column');
									result.columnId = self.dataTable.columnId(result.columnIndex);
									result.rowIndex = data.itemNode.parent('.webix_cell').index();
									result.rowId = self.dataTable.getIdByIndex(result.rowIndex);
									result.item = self.dataTable.getItem(result.rowId);
									result.itemData = result.item[result.columnId];

									self.events.changeSelectivityItem(data.event, result);
								}
							});

						},

						registerDataTable: function (dataTable) {
							var self = this;
							self.dataTable = dataTable;

							// Trash
							if (!self.dataTable.hasEvent("onItemClick") || self.dataTable.select) { // If dataTable has select, then it has onItemClick by default
								self.dataTable.attachEvent("onItemClick", function (id, e, node) {
									if (e.target.className.indexOf('trash') > -1) {
										webix.confirm({
											title: self.labels.confirmDeleteRowTitle,
											ok: self.labels.common.yes,
											cancel: self.labels.common.no,
											text: self.labels.confirmDeleteRowMessage,
											callback: function (result) {
												if (result) {
													if (self.events.deleteRow)
														self.events.deleteRow(id);
												}

												if (self.dataTable.unselectAll)
													self.dataTable.unselectAll();

												return true;
											}
										});
									}
									else {
										if (self.events.itemClick)
											self.events.itemClick(id, e, node);
									}
								});
							}

							self.dataTable.attachEvent("onAfterRender", function (data) {
								data.each(function (d) {
									var maxConnectedDataNum = {};

									AD.classes.AppBuilder.currApp.currObj.columns.forEach(function (col) {
										var itemNode = self.dataTable.getItemNode({ row: d.id, column: col.name });

										AD.classes.AppBuilder.DataFields.customDisplay(AD.classes.AppBuilder.currApp, col.fieldName, d[col.name], itemNode, {
											readOnly: self.data.readOnly
										});
									});

									// if (d.isUnsync) { // TODO: Highlight unsync data
									// 	self.dataTable.config.columns.forEach(function (col) {
									// 		var rowNode = self.dataTable.getItemNode({ row: d.id, column: col.id });
									// 		rowNode.classList.add('ab-object-unsync-data');
									// 	});
									// }
								});
							});
						},

						setObjectList: function (objectList) {
							this.data.objectList = objectList;
						},

						setReadOnly: function (readOnly) {
							this.data.readOnly = readOnly;
						},

						registerItemClick: function (itemClick) {
							this.events.itemClick = itemClick;
						},

						registerChangeSelectivityItem: function (changeSelectivityItem) {
							this.events.changeSelectivityItem = changeSelectivityItem;
						},

						registerDeleteRowHandler: function (deleteRow) {
							this.events.deleteRow = deleteRow;
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
									header: self.getHeader(col, self.data.readOnly),
									weight: col.weight,
									linkObject: col.linkObject
								});

								if (mapCol.filter_type === 'boolean' && self.data.readOnly) { // Checkbox - read only mode
									mapCol.template = function (obj, common, value) {
										if (value)
											return "<div class='webix_icon fa-check-square-o'></div>";
										else
											return "<div class='webix_icon fa-square-o'></div>";
									};
								}
								else if (col.type === 'integer') {
									mapCol.format = webix.Number.numToStr({
										groupDelimiter: ",",
										groupSize: 3,
										decimalSize: 0
									});
								}
								else if (col.type === 'float') {
									mapCol.format = webix.Number.numToStr({
										groupDelimiter: ",",
										groupSize: 3,
										decimalDelimiter: ".",
										decimalSize: 1
									});
								}
								else if (mapCol.editor === 'date') {
									mapCol.format = webix.i18n.dateFormatStr;
								}
								else if (mapCol.editor === 'datetime') {
									mapCol.format = webix.i18n.fullDateFormatStr;
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

						getHeader: function (col, readOnly) {
							var self = this,
								label = col.label || '';

							// Show connect object name in header
							if (col.setting.editor === 'selectivity') {
								// Find label of connect object
								var connectObj = self.data.objectList.filter(function (o) {
									return col.linkObject && o.id == (col.linkObject.id || col.linkObject);
								});

								if (connectObj && connectObj.length > 0)
									label += self.labels.connectToObjectName.replace('{0}', connectObj[0].label);
							}

							var headerTemplate = '<div class="ab-object-data-header"><span class="webix_icon {0}"></span>{1}{2}</div>'
								.replace('{0}', col.setting.icon ? 'fa-' + col.setting.icon : '')
								.replace('{1}', label)
								.replace('{2}', readOnly ? '' : '<i class="ab-object-data-header-edit fa fa-angle-down"></i>');

							return {
								text: headerTemplate,
								css: col.isNew ? 'ab-object-data-new-header' : ''
							};
						},

						calculateColumnWidth: function (col) {
							if (col.width > 0) return col.width;

							var self = this,
								charWidth = 7,
								charLength = col.label ? col.label.length : 0,
								width = (charLength * charWidth) + 80;

							if (col.linkObject) {// Connect to... label
								var object = self.data.objectList.filter(function (o) {
									return o.id === (col.linkObject.id || col.linkObject);
								});

								if (object && object.length > 0)
									width += object[0].label.length * charWidth + 55;
							}

							return width;
						},

						getRowHeight: function (dataNumber) {
							var rowHeight = 35,
								calHeight = dataNumber * rowHeight;

							return calHeight;
						},

						calculateRowHeight: function (row, dataNumber) {
							var rowHeight = this.getRowHeight(dataNumber);

							if (this.dataTable.getItem(row) && this.dataTable.getItem(row).$height < rowHeight)
								this.dataTable.setRowHeight(row, rowHeight);
						},

						populateData: function (application, data) {
							var self = this,
								q = $.Deferred(),
								result;

							if (!data) {
								q.resolve();
								return q;
							}

							// Get link columns
							var linkCols = self.dataTable.config.columns.filter(function (col) { return col.linkObject != null }),
								linkColObjs = linkCols.map(function (col) {
									return {
										name: col.id,
										linkObject: col.linkObject
									};
								});

							// Get date & datetime columns
							var dateCols = self.dataTable.config.columns.filter(function (col) { return col.editor === 'date' || col.editor === 'datetime'; });

							// Populate labels & Convert string to Date object
							self.controllers.DataHelper.normalizeData(application, data, linkColObjs, dateCols)
								.fail(q.reject)
								.then(function (result) {
									self.dataTable.clearAll();

									result.forEach(function (r) {
										var rowHeight = r.attr ? r.attr('$height') : r.$height;

										linkCols.forEach(function (linkCol) {
											if (r[linkCol.id]) {
												var calHeight = self.getRowHeight(r[linkCol.id].length || 0);
												if (calHeight > rowHeight || !rowHeight)
													rowHeight = calHeight;
											}
										});

										if (r.attr)
											r.attr('$height', rowHeight);
										else
											r.$height = rowHeight;
									});

									// Populate data
									if (result instanceof webix.DataCollection) {
										self.dataTable.data.clearAll();
										self.dataTable.data.sync(result);
									}
									else
										self.dataTable.parse(result.attr());

									q.resolve();
								});

							return q;
						}

					});
				});
		});
	}
);