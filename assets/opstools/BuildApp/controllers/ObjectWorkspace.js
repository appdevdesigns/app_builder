
steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/webix_custom_components/ActiveList.js',
	'opstools/BuildApp/controllers/webix_custom_components/DataTableEditor.js',
	'opstools/BuildApp/controllers/webix_custom_components/DataTableVisibleFieldsPopup.js',
	'opstools/BuildApp/controllers/webix_custom_components/DataTableFilterPopup.js',
	'opstools/BuildApp/controllers/webix_custom_components/DataTableSortFieldsPopup.js',
	'opstools/BuildApp/controllers/webix_custom_components/DataTableFrozenColumnPopup.js',
	'opstools/BuildApp/controllers/webix_custom_components/DataTableDefineLabelPopup.js',
	'opstools/BuildApp/controllers/webix_custom_components/DataTableAddFieldPopup.js',
	'opstools/BuildApp/models/ABObject.js',
	'opstools/BuildApp/models/ABColumn.js',
	'opstools/BuildApp/models/ABList.js',
	function () {
        System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control').then(function () {

					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.ObjectWorkspace', {

						init: function (element, options) {
							var self = this;
							options = AD.defaults({
							}, options);
							this.options = options;

							// Call parent init
							this._super(element, options);

							this.Model = {
								ABObject: AD.Model.get('opstools.BuildApp.ABObject'),
								ABColumn: AD.Model.get('opstools.BuildApp.ABColumn'),
								ABList: AD.Model.get('opstools.BuildApp.ABList')
							};
							this.data = {};

							this.webixUiId = {
								objectToolbar: 'ab-object-toolbar',
								objectDatatable: 'ab-object-datatable',

								visibleButton: 'ab-visible-fields-toolbar',
								filterButton: 'ab-filter-fields-toolbar',
								sortButton: 'ab-sort-fields-toolbar',
								frozenButton: 'ab-frozen-columns-toolbar',
								defineLabelButton: 'ab-define-label-toolbar',

								editHeaderPopup: 'ab-edit-header-popup',
								editHeaderItems: 'ab-edit-header-items',

								addConnectObjectDataPopup: 'ab-connect-object-data-popup',
								connectObjectSearch: 'ab-connect-object-search',
								connectObjectDataList: 'ab-connect-object-data-list',

								visibleFieldsPopup: 'ab-visible-fields-popup',
								filterFieldsPopup: 'ab-filter-popup',
								sortFieldsPopup: 'ab-sort-popup',
								frozenColumnsPopup: 'ab-frozen-popup',
								defineLabelPopup: 'ab-define-label-popup',
								addFieldsPopup: 'ab-add-fields-popup'
							};

							this.initMultilingualLabels();
							this.initControllers();
							this.initWebixUI();

						},

						initMultilingualLabels: function () {
							var self = this;
							self.labels = {};
							self.labels.common = {};
							self.labels.object = {};
							self.labels.object.toolbar = {};

							self.labels.common.newName = AD.lang.label.getLabel('ab.common.newName') || 'New name';
							self.labels.common.yes = AD.lang.label.getLabel('ab.common.yes') || "Yes";
							self.labels.common.no = AD.lang.label.getLabel('ab.common.no') || "No";
							self.labels.common.save = AD.lang.label.getLabel('ab.common.save') || "Save";
							self.labels.common.search = AD.lang.label.getLabel('ab.common.search') || "Search";
							self.labels.common.close = AD.lang.label.getLabel('ab.common.close') || "Close";
							self.labels.common.ok = AD.lang.label.getLabel('ab.common.ok') || "Ok";
							self.labels.common.cancel = AD.lang.label.getLabel('ab.common.cancel') || "Cancel";
							self.labels.common.rename = AD.lang.label.getLabel('ab.common.rename') || "Rename";
							self.labels.common.renameErrorMessage = AD.lang.label.getLabel('ab.common.rename.error') || "System could not rename <b>{0}</b>.";
							self.labels.common.renameSuccessMessage = AD.lang.label.getLabel('ab.common.rename.success') || "Rename to <b>{0}</b>.";
							self.labels.common.createErrorMessage = AD.lang.label.getLabel('ab.common.create.error') || "System could not create <b>{0}</b>.";
							self.labels.common.createSuccessMessage = AD.lang.label.getLabel('ab.common.create.success') || "<b>{0}</b> is created.";
							self.labels.common.deleteErrorMessage = AD.lang.label.getLabel('ab.common.delete.error') || "System could not delete <b>{0}</b>.";
							self.labels.common.deleteSuccessMessage = AD.lang.label.getLabel('ab.common.delete.success') || "<b>{0}</b> is deleted.";

							self.labels.object.hideField = AD.lang.label.getLabel('ab.object.hideField') || "Hide field";
							self.labels.object.filterField = AD.lang.label.getLabel('ab.object.filterField') || "Filter field";
							self.labels.object.sortField = AD.lang.label.getLabel('ab.object.sortField') || "Sort field";
							self.labels.object.editField = AD.lang.label.getLabel('ab.object.editField') || "Edit field";
							self.labels.object.deleteField = AD.lang.label.getLabel('ab.object.deleteField') || "Delete field";

							self.labels.object.couldNotDeleteField = AD.lang.label.getLabel('ab.object.couldNotDeleteField') || "Could not delete";
							self.labels.object.atLeastOneField = AD.lang.label.getLabel('ab.object.atLeastOneField') || "Object should have at least one field.";

							// Delete
							self.labels.object.confirmDeleteTitle = AD.lang.label.getLabel('ab.object.delete.title') || "Delete data field";
							self.labels.object.confirmDeleteMessage = AD.lang.label.getLabel('ab.object.delete.message') || "Do you want to delete <b>{0}</b>?";

							// Connected data
							self.labels.object.selectConnectedData = AD.lang.label.getLabel('ab.object.selectConnectedData') || "Select data to connect";
							self.labels.object.noConnectedData = AD.lang.label.getLabel('ab.object.noConnectedData') || "No data selected";
							self.labels.object.connectToObjectName = AD.lang.label.getLabel('ab.object.connectToObjectName') || " (Connect to <b>{0}</b>)";

							// Toolbar
							self.labels.object.toolbar.hideFields = AD.lang.label.getLabel('ab.object.toolbar.hideFields') || "Hide fields";
							self.labels.object.toolbar.filterFields = AD.lang.label.getLabel('ab.object.toolbar.filterFields') || "Add filters";
							self.labels.object.toolbar.sortFields = AD.lang.label.getLabel('ab.object.toolbar.sortFields') || "Apply sort";
							self.labels.object.toolbar.frozenColumns = AD.lang.label.getLabel('ab.object.toolbar.frozenColumns') || "Frozen columns";
							self.labels.object.toolbar.defineLabel = AD.lang.label.getLabel('ab.object.toolbar.defineLabel') || "Define label";
							self.labels.object.toolbar.permission = AD.lang.label.getLabel('ab.object.toolbar.permission') || "Permission";
							self.labels.object.toolbar.addFields = AD.lang.label.getLabel('ab.object.toolbar.addFields') || "Add new column";
						},

						initControllers: function () {
							this.controllers = {};

							var DataTableEditor = AD.Control.get('opstools.BuildApp.DataTableEditor'),
								VisibleFieldsPopup = AD.Control.get('opstools.BuildApp.DataTableVisibleFieldsPopup'),
								FilterPopup = AD.Control.get('opstools.BuildApp.DataTableFilterPopup'),
								SortPopup = AD.Control.get('opstools.BuildApp.DataTableSortFieldsPopup'),
								FrozenPopup = AD.Control.get('opstools.BuildApp.DataTableFrozenColumnPopup'),
								DefineLabelPopup = AD.Control.get('opstools.BuildApp.DataTableDefineLabelPopup'),
								AddFieldPopup = AD.Control.get('opstools.BuildApp.DataTableAddFieldPopup');

							this.controllers.DataTableEditor = new DataTableEditor();
							this.controllers.VisibleFieldsPopup = new VisibleFieldsPopup();
							this.controllers.FilterPopup = new FilterPopup();
							this.controllers.SortPopup = new SortPopup();
							this.controllers.FrozenPopup = new FrozenPopup();
							this.controllers.DefineLabelPopup = new DefineLabelPopup();
							this.controllers.AddFieldPopup = new AddFieldPopup();
						},

						initWebixUI: function () {
							var self = this;

							webix.ui({
								id: self.webixUiId.visibleFieldsPopup,
								view: "visible_fields_popup"
							});

							webix.ui({
								id: self.webixUiId.filterFieldsPopup,
								view: "filter_popup",
							}).hide();

							webix.ui({
								id: self.webixUiId.sortFieldsPopup,
								view: "sort_popup",
							}).hide();

							webix.ui({
								id: self.webixUiId.frozenColumnsPopup,
								view: "frozen_popup",
							}).hide();

							webix.ui({
								id: self.webixUiId.defineLabelPopup,
								view: "define_label_popup",
							}).hide();

							webix.ui({
								id: self.webixUiId.addFieldsPopup,
								view: "add_fields_popup",
							}).hide();

							// Edit header popup
							webix.ui({
								id: self.webixUiId.editHeaderPopup,
								view: 'popup',
								width: 180,
								body: {
									id: self.webixUiId.editHeaderItems,
									view: 'list',
									datatype: "json",
									template: "<i class='fa #icon#' aria-hidden='true'></i> #command#",
									autoheight: true,
									select: false,
									on: {
										'onItemClick': function (timestamp, e, trg) {
											var columns = webix.toArray($$(self.webixUiId.objectDatatable).config.columns),
												selectedField = $.grep(columns, function (c) {
													return c.dataId == self.data.selectedFieldId;
												})[0];

											switch (trg.textContent.trim()) {
												case self.labels.object.hideField:
													$$(self.webixUiId.objectDatatable).hideColumn(selectedField.id);
													$$(self.webixUiId.editHeaderPopup).hide();
													break;
												case self.labels.object.filterField:
													$$(self.webixUiId.filterFieldsPopup).addNewFilter(selectedField.id);
													$$(self.webixUiId.editHeaderPopup).hide();
													$$(self.webixUiId.filterFieldsPopup).show($$(self.webixUiId.filterButton).getNode());
													break;
												case self.labels.object.sortField:
													$$(self.webixUiId.sortFieldsPopup).addNewSort(selectedField.id);
													$$(self.webixUiId.editHeaderPopup).hide();
													$$(self.webixUiId.sortFieldsPopup).show($$(self.webixUiId.sortButton).getNode());
													break;
												case self.labels.object.editField:
													var itemNode = $$(self.webixUiId.objectDatatable).getHeaderNode(selectedField.id);
													$$(self.webixUiId.editHeaderPopup).hide();

													var selectedColumn = $.grep(self.data.columns.attr(), function (c) { return c.id == self.data.selectedFieldId; })[0];

													$$(self.webixUiId.addFieldsPopup).show(itemNode);
													$$(self.webixUiId.addFieldsPopup).editMode(selectedColumn, selectedField.label);
													break;
												case self.labels.object.deleteField:
													// Validate
													if (columns.length < 2) {
														webix.alert({
															title: self.labels.object.couldNotDeleteField,
															ok: self.labels.common.ok,
															text: self.labels.object.atLeastOneField
														});
														$$(self.webixUiId.editHeaderPopup).hide();
														return;
													}

													webix.confirm({
														title: self.labels.object.confirmDeleteTitle,
														ok: self.labels.common.yes,
														cancel: self.labels.common.no,
														text: self.labels.object.confirmDeleteMessage.replace('{0}', selectedField.label),
														callback: function (result) {
															if (result) {
																$$(self.webixUiId.objectDatatable).showProgress({ type: "icon" });

																// Call server to delete field data
																self.Model.ABColumn.destroy(selectedField.dataId)
																	.fail(function (err) {
																		$$(self.webixUiId.objectDatatable).hideProgress();

																		webix.message({
																			type: "error",
																			text: self.labels.common.deleteErrorMessage.replace('{0}', selectedField.label)
																		});

																		AD.error.log('Column list : Error delete column', { error: err });
																	})
																	.then(function (data) {
																		// Remove column
																		self.data.columns.forEach(function (c, index) {
																			if (c.name == selectedField.id) {
																				self.data.columns.splice(index, 1);
																				return false;
																			}
																		});

																		columns.removeAt(columns.find(selectedField));
																		$$(self.webixUiId.objectDatatable).refreshColumns(columns, true);

																		$$(self.webixUiId.editHeaderPopup).hide();

																		webix.message({
																			type: "success",
																			text: self.labels.common.deleteSuccessMessage.replace('{0}', selectedField.label)
																		});

																		// Clear selected field
																		self.data.selectedFieldId = null;

																		self.refreshPopupData();

																		$$(self.webixUiId.objectDatatable).hideProgress();
																	});
															}

														}
													});

													break;
											}
										}
									}
								}
							}).hide();

							// Select connected object data popup
							webix.ui({
								id: self.webixUiId.addConnectObjectDataPopup,
								view: 'window',
								modal: true,
								head: self.labels.object.selectConnectedData,
								position: "center",
								autowidth: true,
								autoheight: true,
								body: {
									rows: [
										{
											view: 'toolbar',
											cols: [{
												view: 'search',
												id: self.webixUiId.connectObjectSearch,
												label: self.labels.common.search,
												keyPressTimeout: 140,
												on: {
													onTimedKeyPress: function () {
														var searchText = $$(self.webixUiId.connectObjectSearch).getValue();

														$$(self.webixUiId.connectObjectDataList).filter(function (obj) {
															var result = false;

															for (var key in obj) {
																if (key != 'id')
																	result = obj[key].indexOf(searchText) > -1 || result;
															}

															return result;
														});
													}
												}
											}]
										},
										{
											id: self.webixUiId.connectObjectDataList,
											view: 'list',
											width: 600,
											height: 400,
											type: {
												height: 40, // Defines item height
											},
											ready: function () {
												webix.extend(this, webix.ProgressBar);
											},
											on: {
												onAfterLoad: function () {
													var curSelectivity = self.getCurSelectivityNode(),
														selectedData = curSelectivity.selectivity('data'),
														selectedIds = $.map(selectedData, function (d) { return d.id; });

													if (selectedIds && selectedIds.length > 0)
														$$(self.webixUiId.connectObjectDataList).select(selectedIds);
													else
														$$(self.webixUiId.connectObjectDataList).unselectAll();
												},
												onItemClick: function (id, e, node) {
													if ($$(self.webixUiId.connectObjectDataList).isSelected(id)) {
														$$(self.webixUiId.connectObjectDataList).unselect(id);
													}
													else {
														// Single select mode
														if (!$$(self.webixUiId.connectObjectDataList).config.multiselect)
															$$(self.webixUiId.connectObjectDataList).unselectAll();

														var selectedIds = $$(self.webixUiId.connectObjectDataList).getSelectedId();

														if (typeof selectedIds === 'string') {
															if (selectedIds)
																selectedIds = [selectedIds];
															else
																selectedIds = [];
														}

														selectedIds.push(id);

														$$(self.webixUiId.connectObjectDataList).select(selectedIds);
													}

												},
												onSelectChange: function () {
													var curSelectivity = self.getCurSelectivityNode(),
														selectedIds = $$(self.webixUiId.connectObjectDataList).getSelectedId(true),
														selectedItems = [];

													selectedIds.forEach(function (id) {
														var htmlNode = $$(self.webixUiId.connectObjectDataList).getItemNode(id);
														if (!htmlNode) return;

														var connectData = $(htmlNode).find('.ab-connect-data')[0].innerText;

														selectedItems.push({ id: id, text: connectData });
													});

													curSelectivity.selectivity('data', selectedItems);
												}
											}
										},
										{
											view: "button",
											value: self.labels.common.close,
											align: "right",
											width: 150,
											click: function () {
												$$(self.webixUiId.addConnectObjectDataPopup).hide();
											}
										}
									]
								},
								on: {
									onHide: function () {
										if ($$(self.webixUiId.objectDatatable).showProgress)
											$$(self.webixUiId.objectDatatable).showProgress({ type: "icon" });

										// TODO : Call Save change values to server

										var selectedIds = $$(self.webixUiId.connectObjectDataList).getSelectedId(true);

										var rowData = $$(self.webixUiId.objectDatatable).getItem(self.data.selectedCell.row);
										rowData[self.data.selectedCell.column] = $.map(selectedIds, function (id) {
											var htmlNode = $$(self.webixUiId.connectObjectDataList).getItemNode(id);
											if (!htmlNode) return;

											var connectData = $(htmlNode).find('.ab-connect-data')[0].innerText;

											return { id: id, text: connectData };
										});
										$$(self.webixUiId.objectDatatable).updateItem(self.data.selectedCell.row, rowData);

										// Resize row height
										self.calculateRowHeight(self.data.selectedCell.row, self.data.selectedCell.column, selectedIds.length);

										if ($$(self.webixUiId.objectDatatable).hideProgress)
											$$(self.webixUiId.objectDatatable).hideProgress();

										self.data.selectedCell = null
										$$(self.webixUiId.connectObjectDataList).unselectAll();
										$$(self.webixUiId.connectObjectDataList).clearAll();
									}
								}
							}).hide();

							self.data.definition = {
								rows: [
									{
										view: 'toolbar',
										id: self.webixUiId.objectToolbar,
										hidden: true,
										cols: [
											{ view: "button", label: self.labels.object.toolbar.hideFields, popup: self.webixUiId.visibleFieldsPopup, id: self.webixUiId.visibleButton, icon: "columns", type: "icon", width: 120, badge: 0 },
											{ view: 'button', label: self.labels.object.toolbar.filterFields, popup: self.webixUiId.filterFieldsPopup, id: self.webixUiId.filterButton, icon: "filter", type: "icon", width: 120, badge: 0 },
											{ view: 'button', label: self.labels.object.toolbar.sortFields, popup: self.webixUiId.sortFieldsPopup, id: self.webixUiId.sortButton, icon: "sort", type: "icon", width: 120, badge: 0 },
											{ view: 'button', label: self.labels.object.toolbar.frozenColumns, popup: self.webixUiId.frozenColumnsPopup, id: self.webixUiId.frozenButton, icon: "table", type: "icon", width: 150, badge: 0 },
											{ view: 'button', label: self.labels.object.toolbar.defineLabel, popup: self.webixUiId.defineLabelPopup, id: self.webixUiId.defineLabelButton, icon: "newspaper-o", type: "icon", width: 130 },
											{ view: 'button', label: self.labels.object.toolbar.permission, icon: "lock", type: "icon", width: 120 },
											{ view: 'button', label: self.labels.object.toolbar.addFields, popup: self.webixUiId.addFieldsPopup, icon: "plus", type: "icon", width: 150 }
										]
									},
									{
										view: "datatable",
										id: self.webixUiId.objectDatatable,
										resizeColumn: true,
										resizeRow: true,
										editable: true,
										editaction: "custom",
										select: "cell",
										dragColumn: true,
										ready: function () {
											webix.extend(this, webix.ProgressBar);
										},
										on: {
											onAfterRender: function (data) {
												// Initial multi-combo
												$('.connect-data-values').selectivity('destroy');
												$('.connect-data-values').selectivity({
													allowClear: true,
													multiple: true,
													removeOnly: true,
													showDropdown: false,
													showSearchInputInDropdown: false,
													placeholder: self.labels.object.noConnectedData
												}).on('change', function (ev) {
													if (ev.removed) {
														var columnIndex = $(this).parents('.webix_column').attr('column'),
															columnId = $$(self.webixUiId.objectDatatable).columnId(columnIndex),
															rowIndex = $(this).parent('.webix_cell').index(),
															rowId = $$(self.webixUiId.objectDatatable).getIdByIndex(rowIndex),
															item = $$(self.webixUiId.objectDatatable).getItem(rowId),
															itemData = item[columnId];

														// Delete removed value
														itemData.forEach(function (d, index) {
															if (d.id == ev.removed.id)
																itemData.splice(index, 1);
														});

														$$(self.webixUiId.objectDatatable).updateItem(rowId, itemData);

														// TODO : Call server to remove value
														$$(self.webixUiId.objectDatatable).render({ column: columnId });
													}
												});

												// Popuplate multi-combo
												var linkCols = $.grep(self.data.columns, function (c) {
													return c.type === 'link';
												});

												var maxDataCell = [];

												linkCols.forEach(function (c) {
													data.each(function (d) {
														var connectedData = d[c.name];
														if (connectedData && connectedData.length > 0) {

															if ($$(self.webixUiId.objectDatatable).isColumnVisible(c.name)) {
																var connectFieldNode = $($$(self.webixUiId.objectDatatable).getItemNode({ row: d.id, column: c.name }));
																connectFieldNode.find('.connect-data-values').selectivity('data', connectedData);

																var cell = $.grep(maxDataCell, function (cell) { return cell.dataId == d.id; });
																if (cell && cell.length > 0) {

																	if (cell[0].dataNum < connectedData.length) {
																		// Replace cell to calculate row height
																		maxDataCell.forEach(function (cellObj) {
																			if (cellObj.dataId == d.id) {
																				cellObj.colName = c.name;
																				cellObj.dataNum = connectedData.length;
																			}
																		})
																	}
																}
																else {
																	// Add cell to calculate row height
																	maxDataCell.push({
																		dataId: d.id,
																		colName: c.name,
																		dataNum: connectedData.length
																	})
																}
															}
														}
													});
												});

												// Call to calculate row height
												maxDataCell.forEach(function (cell) {
													self.calculateRowHeight(cell.dataId, cell.colName, cell.dataNum);
												});
											},
											onHeaderClick: function (id, e, trg) {
												var columnConfig = $$(self.webixUiId.objectDatatable).getColumnConfig(id.column);
												self.data.selectedFieldId = columnConfig.dataId;

												var data = [
													{ command: self.labels.object.hideField, icon: "fa-columns" },
													{ command: self.labels.object.filterField, icon: "fa-filter" },
													{ command: self.labels.object.sortField, icon: "fa-sort" },
													{ command: self.labels.object.editField, icon: "fa-pencil-square-o" },
													{ command: self.labels.object.deleteField, icon: "fa-trash" }
												];

												$$(self.webixUiId.editHeaderItems).clearAll();
												$$(self.webixUiId.editHeaderItems).parse(data);
												$$(self.webixUiId.editHeaderItems).refresh();

												$$(self.webixUiId.editHeaderPopup).show(trg);
											},
											onBeforeSelect: function (data, preserve) {
												var columnConfig = $$(self.webixUiId.objectDatatable).getColumnConfig(data.column);

												if (columnConfig.editor === 'selectivity') {
													// Get column data
													var columnData = self.data.columns.filter(function (f) {
														return f.name === data.column;
													});

													if (!columnData || columnData.length < 1)
														return false;

													columnData = columnData[0];

													// Show connect data windows popup
													$$(self.webixUiId.addConnectObjectDataPopup).show();

													if ($$(self.webixUiId.connectObjectDataList).showProgress)
														$$(self.webixUiId.connectObjectDataList).showProgress({ type: 'icon' });

													$$(self.webixUiId.connectObjectDataList).define('multiselect', columnData.isMultipleRecords);

													self.data.selectedCell = { row: data.row, column: data.column };

													var linkToObject = columnData.linkToObject,
														columns = null;

													// Get columns of connected object
													var object = self.data.objectList.filter(function (o) {
														return o.id === linkToObject;
													});

													if (!object || object.length < 1)
														return false;

													async.series([
														function (next) {
															self.Model.ABColumn.findAll({ object: object[0].id })
																.then(function (data) {

																	data.forEach(function (d) {
																		if (d.translate) d.translate();
																	});

																	columns = data;

																	next();

																});
														},
														function (next) {
															// Generate template to display
															var template = "<div class='ab-connect-data'>";
															template += object[0].labelFormat || '#' + object[0].columns[0].name + '#';
															template += "</div>";
															template = template.replace(/[{]/g, '#').replace(/[}]/g, '#');

															$$(self.webixUiId.connectObjectDataList).define('template', template);
															$$(self.webixUiId.connectObjectDataList).refresh();

															// TODO: Load the connect data

															var mockData = self.getMockData(object[0].columns);

															$$(self.webixUiId.connectObjectDataList).parse(mockData);
														}
													], function () {
														if ($$(self.webixUiId.connectObjectDataList).hideProgress)
															$$(self.webixUiId.connectObjectDataList).hideProgress();
													});

													return false;
												}
												else {
													return true;
												}
											},
											onAfterSelect: function (data, prevent) {
												var columnConfig = $$(self.webixUiId.objectDatatable).getColumnConfig(data.column);
												if (columnConfig.editor === 'selectivity')
													return false;

												this.editCell(data.row, data.column);
											},
											onColumnResize: function (id, newWidth, oldWidth, user_action) {
												var columnConfig = $$(self.webixUiId.objectDatatable).getColumnConfig(id);
												if (columnConfig.editor === 'selectivity') {
													// For calculate/refresh row height
													$$(self.webixUiId.objectDatatable).render();
												}
											},
											onAfterColumnDrop: function (sourceId, targetId, event) {
												// TODO
												console.log('sourceId: ', sourceId);
												console.log('targetId: ', targetId);
												console.log('event: ', event);
											},
											onAfterColumnShow: function (id) {
												$$(self.webixUiId.visibleFieldsPopup).showField(id);
											},
											onAfterColumnHide: function (id) {
												$$(self.webixUiId.visibleFieldsPopup).hideField(id);
											}
										}
									}
								]
							};
						},

						getUIDefinition: function () {
							return this.data.definition;
						},

						setObjectId: function (id) {
							var self = this;

							self.data.objectId = id;

							if ($$(self.webixUiId.objectDatatable).showProgress)
								$$(self.webixUiId.objectDatatable).showProgress({ type: 'icon' });

							self.resetState();

							// Set enable connect object list to the add new column popup
							var enableConnectObjects = self.data.objectList.filter(function (o) {
								return o.id != self.data.objectId;
							});
							$$(self.webixUiId.addFieldsPopup).setObjectList(enableConnectObjects);

							if (self.data.objectId) {
								async.series([
									function (next) {
										// Get columns from server
										self.Model.ABColumn.findAll({ object: self.data.objectId })
											.fail(function (err) {
												$$(self.webixUiId.objectDatatable).hideProgress();

												webix.message({
													type: "error",
													text: err
												});

												AD.error.log('Column List : Error get fields data', { error: err });

												next(err);
											})
											.then(function (data) {

												data.forEach(function (d) {
													if (d.translate) d.translate();
												});

												self.data.columns = data;

												// Find option list
												var listCols = $.grep(self.data.columns, function (col) { return col.setting.editor === 'richselect'; });

												if (listCols && listCols.length > 0) {
													var getListEvents = [];

													listCols.forEach(function (c) {
														getListEvents.push(function (cb) {
															self.Model.ABList.findAll({ column: c.id })
																.fail(function (err) { cb(err); })
																.then(function (listResult) {

																	listResult.forEach(function (listItem) {
																		if (listItem.translate) listItem.translate();
																	});

																	c.setting.attr('options', listResult.attr().sort(function (a, b) { return a.weight - b.weight; }));

																	cb();
																});
														});
													});

													AD.util.async.parallel(getListEvents, next);
												}
												else {
													next();
												}
											});
									},
									function (next) {
										self.bindColumns(true);

										next();
									},
									function (next) {
										// TODO : Get data from server
										var data = self.getMockData(self.data.columns);

										$$(self.webixUiId.objectDatatable).parse(data);

										next();
									}
								], function () {
									$$(self.webixUiId.objectToolbar).show();
									$$(self.webixUiId.objectDatatable).show();
									$$(self.webixUiId.objectDatatable).refresh();

									// Register table to popups
									$$(self.webixUiId.visibleFieldsPopup).registerDataTable($$(self.webixUiId.objectDatatable));
									$$(self.webixUiId.filterFieldsPopup).registerDataTable($$(self.webixUiId.objectDatatable));
									$$(self.webixUiId.sortFieldsPopup).registerDataTable($$(self.webixUiId.objectDatatable));
									$$(self.webixUiId.frozenColumnsPopup).registerDataTable($$(self.webixUiId.objectDatatable));
									$$(self.webixUiId.defineLabelPopup).registerDataTable($$(self.webixUiId.objectDatatable));
									$$(self.webixUiId.addFieldsPopup).registerDataTable($$(self.webixUiId.objectDatatable));

									// Listen popup events
									self.attachPopupEvents();

									// Bind columns data
									self.refreshPopupData();

									// Register add new column callback
									$$(self.webixUiId.addFieldsPopup).registerSaveFieldEvent(function (columnInfo, removedListId) {

										if ($$(self.webixUiId.objectDatatable).showProgress)
											$$(self.webixUiId.objectDatatable).showProgress({ type: 'icon' });

										columnInfo.label = columnInfo.name;

										var newColumn = {
											object: self.data.objectId,
											name: columnInfo.name,
											label: columnInfo.label,
											type: columnInfo.type,
											setting: columnInfo.setting
										};

										if (columnInfo.linkToObject != null)
											newColumn.linkToObject = columnInfo.linkToObject;

										if (columnInfo.isMultipleRecords != null)
											newColumn.isMultipleRecords = columnInfo.isMultipleRecords ? true : false;

										if (columnInfo.supportMultilingual != null)
											newColumn.supportMultilingual = columnInfo.supportMultilingual ? true : false;

										if (columnInfo.setting.value)
											newColumn.default = columnInfo.setting.value;

										// Get deferred when save complete
										var saveDeferred = self.getSaveColumnDeferred(columnInfo, removedListId);

										if (columnInfo.id) { // Update
											var updateColumn = $.grep(self.data.columns, function (col) { return col.id == columnInfo.id; })[0];

											for (var key in newColumn) {
												updateColumn.attr(key, newColumn[key]);
											}

											updateColumn.save()
												.fail(function (err) {
													saveDeferred.reject(err);
												})
												.then(function (data) {
													if (data.translate) data.translate();

													saveDeferred.resolve(data);
												});
										}
										else { // Add new
											self.Model.ABColumn.create(newColumn)
												.fail(function (err) {
													saveDeferred.reject(err);
												})
												.then(function (data) {
													if (data.translate) data.translate();

													saveDeferred.resolve(data);
												});
										}
									});

									// Register load label format
									$$(self.webixUiId.defineLabelPopup).registerLoadLabelEvent(function () {
										var q = $.Deferred();

										self.Model.ABObject.findOne({ id: self.data.objectId })
											.fail(function (err) { q.reject(err); })
											.then(function (objResult) { q.resolve(objResult.labelFormat); });

										return q;
									});

									// Register save label format
									$$(self.webixUiId.defineLabelPopup).registerSaveLabelEvent(function (labelFormat) {
										if ($$(self.webixUiId.objectDatatable).showProgress)
											$$(self.webixUiId.objectDatatable).showProgress({ type: 'icon' });

										self.Model.ABObject.update(self.data.objectId,
											{
												labelFormat: labelFormat
											})
											.fail(function (err) {
												if ($$(self.webixUiId.objectDatatable).hideProgress)
													$$(self.webixUiId.objectDatatable).hideProgress();
											})
											.then(function () {
												$$(self.webixUiId.defineLabelPopup).hide();

												if ($$(self.webixUiId.objectDatatable).hideProgress)
													$$(self.webixUiId.objectDatatable).hideProgress();
											});
									});

									$$(self.webixUiId.addFieldsPopup).registerCreateNewObjectEvent(function () {
										$$('ab-object-add-new-popup').define('selectNewObject', false);
										$$('ab-object-add-new-popup').show(); // Mark : show add new object popup in ObjectList page
									});

									if ($$(self.webixUiId.objectDatatable).hideProgress)
										$$(self.webixUiId.objectDatatable).hideProgress();

								});
							}
							else {
								if ($$(self.webixUiId.objectDatatable).hideProgress)
									$$(self.webixUiId.objectDatatable).hideProgress();

								$$(self.webixUiId.objectDatatable).hide();
							}

						},

						bindColumns: function (resetColumns) {
							var self = this;

							var columns = $.map(self.data.columns.attr(), function (col, i) {

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
								});

								if (options && options.length > 0)
									mapCol.options = options;

								return mapCol;
							});

							$$(self.webixUiId.objectDatatable).refreshColumns(columns, resetColumns || false);
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

								label += self.labels.object.connectToObjectName.replace('{0}', connectObj[0].label);
							}

							return "<div class='ab-object-data-header'><span class='webix_icon fa-{0}'></span>{1}<i class='ab-object-data-header-edit fa fa-angle-down'></i></div>"
								.replace('{0}', col.setting.icon)
								.replace('{1}', label);
						},

						setObjectList: function (objectList) {
							var self = this;

							self.data.objectList = objectList;

							var enableConnectObjects = self.data.objectList.filter(function (o) {
								return o.id != self.data.objectId;
							});
							$$(self.webixUiId.addFieldsPopup).setObjectList(enableConnectObjects);
						},

						getSaveColumnDeferred: function (columnInfo, removedListIds) {
							var self = this,
								saveDeferred = $.Deferred();

							saveDeferred
								.fail(function (err) {
									$$(self.webixUiId.objectDatatable).hideProgress();

									webix.message({
										type: "error",
										text: self.labels.common.createErrorMessage.replace('{0}', columnInfo.name)
									});

									AD.error.log('Add Column : Error add new field data', { error: err });
								})
								.then(function (data) {
									if (data.translate) data.translate();

									var list_key = null,
										list_options = [];

									AD.util.async.series([
										function (cb) {
											// Find key of option list
											if (columnInfo.options && columnInfo.options.length > 0) {
												self.Model.ABObject.findOne({ id: self.data.objectId })
													.fail(function (err) { cb(err); })
													.then(function (obj) {
														list_key = '{0}.{1}.{2}'
															.replace('{0}', obj.application.name)
															.replace('{1}', obj.name)
															.replace('{2}', data.name);

														cb();
													});
											}
											else {
												cb();
											}
										},
										function (cb) {
											// Delete options list data
											if (removedListIds && removedListIds.length > 0) {
												var deleteListEvents = [];

												removedListIds.forEach(function (id) {
													deleteListEvents.push(function (next) {
														self.Model.ABList.destroy(id)
															.fail(function (err) { next(err); })
															.then(function () { next(); });
													});
												});

												AD.util.async.parallel(deleteListEvents, cb);
											}
											else {
												cb();
											}
										},
										function (cb) {
											// Popuplate options list data
											if (columnInfo.options && columnInfo.options.length > 0) {
												var createListEvents = [];

												columnInfo.options.forEach(function (opt, index) {
													createListEvents.push(function (next) {

														if (opt.id) { // Update
															self.Model.ABList.findOne({ id: opt.id })
																.fail(function (err) { next(err) })
																.then(function (li) {
																	li.attr('key', list_key);
																	li.attr('weight', index + 1);
																	li.attr('column', data.id);
																	li.attr('label', opt.value);

																	li.save()
																		.fail(function (saveErr) { next(saveErr); })
																		.then(function (result) {
																			if (result.translate) result.translate();

																			list_options.push(result);

																			next();
																		});
																});
														} else {// Add new
															self.Model.ABList.create({
																key: list_key,
																weight: index + 1,
																column: data.id,
																label: opt.value,
																value: opt.value
															}).fail(function (err) {
																next(err);
															}).then(function (result) {
																if (result.translate) result.translate();

																list_options.push(result);

																next();
															});
														}

													});
												});

												AD.util.async.parallel(createListEvents, cb);
											}
											else {
												cb();
											}
										}
									], function () {

										var columns = $$(self.webixUiId.objectDatatable).config.columns;

										var addColumnHeader = $.extend(columnInfo.setting, {
											id: data.name,
											dataId: data.id,
											header: self.getHeader(columnInfo)
										});

										if (list_options && list_options.length > 0) {
											list_options.sort(function (a, b) { return a.weight - b.weight; });

											data.setting.attr('options', list_options);

											addColumnHeader.options = $.map(list_options, function (opt) {
												return {
													id: opt.id,
													value: opt.label
												};
											});
										}

										addColumnHeader.width = self.calculateColumnWidth(data);

										// Update columns data
										var existsColumnData = $.grep(self.data.columns, function (c) { c.id == data.id; });
										if (existsColumnData && existsColumnData.length > 0) { // Update
											for (var i = 0; i < self.data.columns.length; i++) {
												if (self.data.columns[i].dataId == data.id) {
													self.data.columns[i] = data;
												}
											}
										} else { // Add 
											self.data.columns.push(data);
										}

										// Update columns UI
										var existsColumn = $.grep(columns, function (c) { return c.dataId == data.id; });
										if (existsColumn && existsColumn.length > 0) { // Update
											for (var i = 0; i < columns.length; i++) {
												if (columns[i].dataId == data.id) {
													columns[i] = addColumnHeader;
												}
											}
										} else { // Add 
											columns.push(addColumnHeader);
										}

										$$(self.webixUiId.objectDatatable).refreshColumns(columns);

										self.refreshPopupData();

										$$(self.webixUiId.objectDatatable).hideProgress();

										webix.message({
											type: "success",
											text: self.labels.common.createSuccessMessage.replace("{0}", columnInfo.name)
										});
									});
								});

							return saveDeferred;
						},

						getCurSelectivityNode: function (selectedCell) {
							var self = this;

							if (selectedCell || self.data.selectedCell) {
								var rowNode = $($$(self.webixUiId.objectDatatable).getItemNode(selectedCell || self.data.selectedCell));
								return rowNode.find('.connect-data-values');
							}
							else {
								return $('');
							}
						},

						refreshPopupData: function () {
							var self = this;

							if (self.data.columns) {
								$$(self.webixUiId.visibleFieldsPopup).setFieldList(self.data.columns.attr());
								$$(self.webixUiId.filterFieldsPopup).setFieldList(self.data.columns.attr());
								$$(self.webixUiId.sortFieldsPopup).setFieldList(self.data.columns.attr());
								$$(self.webixUiId.frozenColumnsPopup).setFieldList(self.data.columns.attr());
								$$(self.webixUiId.defineLabelPopup).setFieldList(self.data.columns.attr());
							}

							$$(self.webixUiId.visibleFieldsPopup).bindFieldList();
							$$(self.webixUiId.filterFieldsPopup).refreshFieldList();
							$$(self.webixUiId.sortFieldsPopup).refreshFieldList();
							$$(self.webixUiId.frozenColumnsPopup).bindFieldList();
							$$(self.webixUiId.defineLabelPopup).bindFieldList();
						},

						attachPopupEvents: function () {
							var self = this;

							$$(self.webixUiId.visibleFieldsPopup).attachEvent('onChange', function (number) {
								$$(self.webixUiId.visibleButton).define('badge', number);
								$$(self.webixUiId.visibleButton).refresh();
							});
							$$(self.webixUiId.filterFieldsPopup).attachEvent('onChange', function (number) {
								$$(self.webixUiId.filterButton).define('badge', number);
								$$(self.webixUiId.filterButton).refresh();
							});
							$$(self.webixUiId.sortFieldsPopup).attachEvent('onChange', function (number) {
								$$(self.webixUiId.sortButton).define('badge', number);
								$$(self.webixUiId.sortButton).refresh();
							});
							$$(self.webixUiId.frozenColumnsPopup).attachEvent('onChange', function (number) {
								$$(self.webixUiId.frozenButton).define('badge', number);
								$$(self.webixUiId.frozenButton).refresh();
							});
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

							if ($$(self.webixUiId.objectDatatable).getItem(row).$height != calHeight)
								$$(self.webixUiId.objectDatatable).setRowHeight(row, calHeight);
						},

						resetState: function () {
							var self = this;

							// Reset indicator
							$$(self.webixUiId.visibleButton).define('badge', 0);
							$$(self.webixUiId.filterButton).define('badge', 0);
							$$(self.webixUiId.sortButton).define('badge', 0);
							$$(self.webixUiId.frozenButton).define('badge', 0);
							$$(self.webixUiId.visibleButton).refresh();
							$$(self.webixUiId.filterButton).refresh();
							$$(self.webixUiId.sortButton).refresh();
							$$(self.webixUiId.frozenButton).refresh();

							$$(self.webixUiId.objectToolbar).hide();
							$$(self.webixUiId.objectDatatable).define('leftSplit', 0);
							$$(self.webixUiId.objectDatatable).clearValidation();
							$$(self.webixUiId.objectDatatable).clearSelection();
							$$(self.webixUiId.objectDatatable).clearAll();
							$$(self.webixUiId.objectDatatable).refresh();
							$$(self.webixUiId.objectDatatable).refreshColumns([], true);

							self.refreshPopupData();
						},

						resize: function (height) {
							var self = this;

							if ($$(self.webixUiId.objectDatatable)) {
								$$(self.webixUiId.objectDatatable).define("height", height - 150);
								$$(self.webixUiId.objectDatatable).resize();
							}
						},

						// Mock data
						getMockData: function (columns) {
							var self = this,
								data = [];

							for (var i = 0; i < 4; i++) {
								var mockData = {
									id: i + 1
								};

								columns.forEach(function (c) {
									switch (c.setting.filter_type) {
										case 'multiselect':
											var linkedObj = self.data.objectList.filter(function (o) { return o.id == c.linkToObject; })[0];

											if (linkedObj) {
												var linkedData = [];

												var itemNums = 1;
												if (c.isMultipleRecords) itemNums = 2;

												for (var j = 0; j < itemNums; j++) {
													var linkedModel = {
														id: j + 1
													};

													linkedObj.columns.forEach(function (linkedCol) {
														switch (linkedCol.setting.filter_type) {
															case 'text':
																linkedModel[linkedCol.name] = 'lorem ipsum ' + (j + 1);
																break;
															case 'number':
																linkedModel[linkedCol.name] = j + 100;
																break;
															case 'date':
																linkedModel[linkedCol.name] = new Date();
																break;
															case 'boolean':
																linkedModel[linkedCol.name] = j % 2;
																break;
														}
													});

													// Get label
													var label = linkedObj.getDataLabel(linkedModel);

													linkedData.push({
														id: j + 1,
														text: label
													});
												}

												mockData[c.name] = linkedData;
											}
											break;
										case 'text':
											mockData[c.name] = 'lorem ipsum ' + (i + 1)
											break;
										case 'number':
											mockData[c.name] = i + 100;
											break;
										case 'date':
											mockData[c.name] = new Date();
											break;
										case 'boolean':
											mockData[c.name] = i % 2;
											break;
									}
								});

								data.push(mockData);
							}

							return data;
						}

					});

				});
		});

	});