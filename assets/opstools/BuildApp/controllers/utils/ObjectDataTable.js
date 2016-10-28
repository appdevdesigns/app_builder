steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/data_fields/dataFieldsManager.js',

	'opstools/BuildApp/controllers/utils/DataHelper.js',
	function (dataFieldsManager, dataHelper) {
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
							self.events = {};

							self.initMultilingualLabels();
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

						registerDataTable: function (application, object, dataTable) {
							var self = this;
							self.application = application;
							self.object = object;
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
								var dataTable = this;
								dataTable.eachRow(function (rowId) {
									dataTable.eachColumn(function (columnId) {
										var col = dataTable.getColumnConfig(columnId);
										if (!col) return;

										var itemNode = dataTable.getItemNode({ row: rowId, column: columnId });
										if (!itemNode) return;

										dataFieldsManager.customDisplay(
											col.fieldName,
											self.application,
											self.object,
											columnId,
											rowId,
											dataTable.getItem(rowId)[columnId],
											itemNode,
											{
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

						setReadOnly: function (readOnly) {
							this.data.readOnly = readOnly;
						},

						registerItemClick: function (itemClick) {
							this.events.itemClick = itemClick;
						},

						registerDeleteRowHandler: function (deleteRow) {
							this.events.deleteRow = deleteRow;
						},

						bindColumns: function (application, columns, resetColumns, addTrashColumn) {
							var self = this;

							if (resetColumns)
								self.dataTable.clearAll();

							var headers = $.map(columns.attr ? columns.attr() : columns, function (col, i) {

								col.setting.width = self.calculateColumnWidth(application, col);

								if (col.setting.format && webix.i18n[col.setting.format])
									col.setting.format = webix.i18n[col.setting.format];

								var mapCol = $.extend(col.setting, {
									id: col.name,
									dataId: col.id,
									label: col.label,
									header: self.getHeader(application, col, self.data.readOnly),
									weight: col.weight,
									fieldName: col.fieldName
								});

								if (mapCol.filter_type === 'boolean' && self.data.readOnly) { // Checkbox - read only mode
									mapCol.template = function (obj, common, value) {
										if (value)
											return "<div class='webix_icon fa-check-square-o'></div>";
										else
											return "<div class='webix_icon fa-square-o'></div>";
									};
								}

								// richselect
								var options = [];
								if (col.setting.options && col.setting.options.length > 0) {
									col.setting.options.forEach(function (opt) {
										options.push({
											id: opt.id,
											value: opt.label
										});
									});
								}
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

						getHeader: function (application, col, readOnly) {
							var self = this,
								label = col.label || '';

							// Show connect object name in header
							if (col.setting.editor === 'selectivity') {
								// Find label of connect object
								var connectObj = application.objects.filter(function (o) {
									return o.id == col.setting.linkObject;
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

						calculateColumnWidth: function (application, column) {
							if (column.width > 0) return column.width;

							var self = this,
								charWidth = 7,
								charLength = column.label ? column.label.length : 0,
								width = (charLength * charWidth) + 80;

							if (column.setting.linkObject) {// Connect to... label
								var object = application.objects.filter(function (o) {
									return o.id === column.setting.linkObject;
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

						populateData: function (application, object, data) {
							var self = this,
								q = $.Deferred();

							if (!data) {
								q.resolve();
								return q;
							}

							// Get link columns
							var linkCols = object.columns.filter(function (col) { return col.setting.linkObject });

							// Get date & datetime columns
							var dateCols = object.columns.filter(function (col) { return col.setting.editor === 'date' || col.setting.editor === 'datetime'; });

							// Populate labels & Convert string to Date object
							dataHelper.normalizeData(application, data, linkCols, dateCols)
								.fail(q.reject)
								.then(function (result) {
									self.dataTable.clearAll();

									// Get Map.List in DataCollection
									var list = result;
									if (result instanceof webix.DataCollection)
										list = result.AD.__list;

									// Update row height
									list.forEach(function (r) {
										var rowHeight = r.attr ? r.attr('$height') : r.$height;

										linkCols.forEach(function (linkCol) {
											if (r[linkCol.name]) {
												var calHeight = self.getRowHeight(r[linkCol.name].length || 0);
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
										self.dataTable.data.unsync();
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