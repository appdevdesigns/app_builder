
steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/webix_custom_components/ActiveList.js',
	'opstools/BuildApp/controllers/webix_custom_components/DataTableEditor.js',
	'opstools/BuildApp/controllers/webix_custom_components/DataTableVisibleFieldsPopup.js',
	'opstools/BuildApp/controllers/webix_custom_components/DataTableFilterPopup.js',
	'opstools/BuildApp/controllers/webix_custom_components/DataTableSortFieldsPopup.js',
	'opstools/BuildApp/controllers/webix_custom_components/DataTableFrozenColumnPopup.js',
	'opstools/BuildApp/controllers/webix_custom_components/DataTableAddFieldPopup.js',
	'opstools/BuildApp/models/ABColumn.js',
	function () {
        System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control').then(function () {

					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.ModelWorkspace', {

						init: function (element, options) {
							var self = this;
							options = AD.defaults({
							}, options);
							this.options = options;

							// Call parent init
							this._super(element, options);

                            this.Model = AD.Model.get('opstools.BuildApp.ABColumn');
							this.data = {};

							this.webixUiId = {
								modelToolbar: 'ab-model-toolbar',
								modelDatatable: 'ab-model-datatable',

								filterButton: 'ab-filter-fields-toolbar',
								sortButton: 'ab-sort-fields-toolbar',
								frozenButton: 'ab-frozen-columns-toolbar',

								editHeaderPopup: 'ab-edit-header-popup',
								editHeaderItems: 'ab-edit-header-items',

								addConnectObjectDataPopup: 'ab-connect-object-data-popup',
								connectObjectSearch: 'ab-connect-object-search',
								connectObjectDataList: 'ab-connect-object-data-list',

								visibleFieldsPopup: 'ab-visible-fields-popup',
								filterFieldsPopup: 'ab-filter-popup',
								sortFieldsPopup: 'ab-sort-popup',
								frozenColumnsPopup: 'ab-frozen-popup',
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
								AddFieldPopup = AD.Control.get('opstools.BuildApp.DataTableAddFieldPopup');

							this.controllers.DataTableEditor = new DataTableEditor();
							this.controllers.VisibleFieldsPopup = new VisibleFieldsPopup();
							this.controllers.FilterPopup = new FilterPopup();
							this.controllers.SortPopup = new SortPopup();
							this.controllers.FrozenPopup = new FrozenPopup();
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
											var columns = webix.toArray($$(self.webixUiId.modelDatatable).config.columns),
												selectedField = $.grep(columns, function (c) {
													return c.dataId == self.data.selectedFieldId;
												})[0],
												selectedFieldName = $(selectedField.header[0].text).text().trim();

											switch (trg.textContent.trim()) {
												case self.labels.object.hideField:
													$$(self.webixUiId.modelDatatable).hideColumn(selectedField.id);
													$$(self.webixUiId.editHeaderPopup).hide();
													break;
												case self.labels.object.filterField:
													$$(self.webixUiId.filterFieldsPopup).addNewFilter(selectedField.id);
													$$(self.webixUiId.editHeaderPopup).hide();
													$$(self.webixUiId.filterFieldsPopup).show($$(self.webixUiId.filterButton).getNode());
													break;
												case self.labels.object.sortField:
													// $$(self.webixUiId.sortFieldsPopup).addSort(selectedField.id);
													$$(self.webixUiId.editHeaderPopup).hide();
													$$(self.webixUiId.sortFieldsPopup).show($$(self.webixUiId.sortButton).getNode());
													break;
												case self.labels.object.editField:
													var itemNode = $$(self.webixUiId.modelDatatable).getHeaderNode(selectedField.id);
													$$(self.webixUiId.editHeaderPopup).hide();

													var selectedColumn = $.grep(self.data.columns.attr(), function (c) { return c.id == self.data.selectedFieldId; })[0];

													$$(self.webixUiId.addFieldsPopup).show(itemNode);
													$$(self.webixUiId.addFieldsPopup).editMode(selectedColumn, selectedFieldName);
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
														text: self.labels.object.confirmDeleteMessage.replace('{0}', selectedFieldName),
														callback: function (result) {
															if (result) {
																$$(self.webixUiId.modelDatatable).showProgress({ type: "icon" });

																// Call server to delete field data
																self.Model.destroy(selectedField.dataId)
																	.fail(function (err) {
																		$$(self.webixUiId.modelDatatable).hideProgress();

																		webix.message({
																			type: "error",
																			text: self.labels.common.deleteErrorMessage.replace('{0}', selectedFieldName)
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
																		$$(self.webixUiId.modelDatatable).refreshColumns(columns, true);

																		$$(self.webixUiId.editHeaderPopup).hide();

																		webix.message({
																			type: "success",
																			text: self.labels.common.deleteSuccessMessage.replace('{0}', selectedFieldName)
																		});

																		// Clear selected field
																		self.data.selectedFieldId = null;

																		self.refreshPopupData();

																		$$(self.webixUiId.modelDatatable).hideProgress();
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
												height: 80, // Defines item height
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
										if ($$(self.webixUiId.modelDatatable).showProgress)
											$$(self.webixUiId.modelDatatable).showProgress({ type: "icon" });

										// TODO : Call Save change values to server

										var selectedIds = $$(self.webixUiId.connectObjectDataList).getSelectedId(true);

										var rowData = $$(self.webixUiId.modelDatatable).getItem(self.data.selectedCell.row);
										rowData[self.data.selectedCell.column] = $.map(selectedIds, function (id) {
											var htmlNode = $$(self.webixUiId.connectObjectDataList).getItemNode(id);
											var connectData = $(htmlNode).find('.ab-connect-data')[0].innerText;

											return { id: id, text: connectData };
										});
										$$(self.webixUiId.modelDatatable).updateItem(self.data.selectedCell.row, rowData);

										// Resize row height
										self.calculateRowHeight(self.data.selectedCell.row, self.data.selectedCell.column, selectedIds.length);

										if ($$(self.webixUiId.modelDatatable).hideProgress)
											$$(self.webixUiId.modelDatatable).hideProgress();

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
										id: self.webixUiId.modelToolbar,
										hidden: true,
										cols: [
											{ view: "button", label: self.labels.object.toolbar.hideFields, icon: "columns", type: "icon", width: 120, popup: self.webixUiId.visibleFieldsPopup },
											{ view: 'button', label: self.labels.object.toolbar.filterFields, icon: "filter", type: "icon", width: 120, popup: self.webixUiId.filterFieldsPopup, id: self.webixUiId.filterButton },
											{ view: 'button', label: self.labels.object.toolbar.sortFields, icon: "sort", type: "icon", width: 120, popup: self.webixUiId.sortFieldsPopup, id: self.webixUiId.sortButton },
											{ view: 'button', label: self.labels.object.toolbar.frozenColumns, icon: "table", type: "icon", width: 150, popup: self.webixUiId.frozenColumnsPopup, id: self.webixUiId.frozenButton },
											{ view: 'button', label: self.labels.object.toolbar.permission, icon: "lock", type: "icon", width: 120 },
											{ view: 'button', label: self.labels.object.toolbar.addFields, icon: "plus", type: "icon", width: 150, popup: self.webixUiId.addFieldsPopup }
										]
									},
									{
										view: "datatable",
										id: self.webixUiId.modelDatatable,
										resizeColumn: true,
										resizeRow: true,
										editable: true,
										editaction: "custom",
										select: "cell",
										ready: function () {
											webix.extend(this, webix.ProgressBar);
										},
										on: {
											onAfterRender: function (data) {
												console.log(data);
												// Initial multi-combo
												console.log('selectivity initial');
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
														console.log('remove: ', ev.removed);

														var columnIndex = $(this).parents('.webix_column').attr('column'),
															columnId = $$(self.webixUiId.modelDatatable).columnId(columnIndex),
															rowIndex = $(this).parent('.webix_cell').index(),
															rowId = $$(self.webixUiId.modelDatatable).getIdByIndex(rowIndex),
															item = $$(self.webixUiId.modelDatatable).getItem(rowId),
															itemData = item[columnId];

														// Delete removed value
														itemData.forEach(function (d, index) {
															if (d.id == ev.removed.id)
																itemData.splice(index, 1);
														});

														$$(self.webixUiId.modelDatatable).updateItem(rowId, itemData);

														// TODO : Call server to remove value
														$$(self.webixUiId.modelDatatable).render({ column: columnId });
													}
												});

												// Popuplate multi-combo
												var linkCols = $.grep(self.data.columns, function (c) {
													return c.type === 'link';
												});

												linkCols.forEach(function (c) {
													data.each(function (d) {
														var connectedData = d[c.name];
														if (connectedData && connectedData.length > 0) {
															var connectFieldNode = $($$(self.webixUiId.modelDatatable).getItemNode({ row: d.id, column: c.name }));
															connectFieldNode.find('.connect-data-values').selectivity('data', connectedData);

															self.calculateRowHeight(d.id, c.name, connectedData.length);
														}
													})
												});
											},
											onHeaderClick: function (id, e, trg) {
												var columnConfig = $$(self.webixUiId.modelDatatable).getColumnConfig(id.column);
												self.data.selectedFieldId = columnConfig.dataId;

												var data = [
													{ command: self.labels.object.hideField, icon: "fa-columns" },
													{ command: self.labels.object.filterField, icon: "fa-filter" },
													{ command: self.labels.object.sortField, icon: "fa-sort" },
													{ command: self.labels.object.editField, icon: "fa-pencil-square-o" },
													{ command: self.labels.object.deleteField, icon: "fa-trash" }
												];

												// When user choose multi-select (selectivity) item, then remove 'Sort' item
												if (columnConfig.editor === 'selectivity') {
													data = $.grep(data, function (d) { return d.command !== self.labels.object.sortField; });
												}

												$$(self.webixUiId.editHeaderItems).clearAll();
												$$(self.webixUiId.editHeaderItems).parse(data);
												$$(self.webixUiId.editHeaderItems).refresh();

												$$(self.webixUiId.editHeaderPopup).show(trg);
											},
											onBeforeSelect: function (data, preserve) {
												var columnConfig = $$(self.webixUiId.modelDatatable).getColumnConfig(data.column);

												if (columnConfig.editor === 'selectivity') {
													// Get column data
													var columnData = self.data.columns.filter(function (f) {
														return f.name === data.column;
													});

													if (!columnData || columnData.length < 1)
														return false;

													columnData = columnData[0];

													// Show windows popup
													$$(self.webixUiId.addConnectObjectDataPopup).show();

													if ($$(self.webixUiId.connectObjectDataList).showProgress)
														$$(self.webixUiId.connectObjectDataList).showProgress({ type: 'icon' });

													$$(self.webixUiId.connectObjectDataList).define('multiselect', columnData.isMultipleRecords);

													self.data.selectedCell = { row: data.row, column: data.column };

													var linkToObject = columnData.linkToObject,
														columns = null;

													async.series([
														function (next) {
															// Get columns of connected object
															var object = $.grep(self.data.objectList, function (o) {
																return o.name === linkToObject;
															});

															if (!object || object.length < 1)
																return false;

															self.Model.findAll({ object: object[0].id })
																.then(function (data) {

																	data.forEach(function (d) {
																		if (d.translate) d.translate();
																	});

																	columns = data;

																	next();

																});
														}, function (next) {
															// Generate template to display
															var template = '<div>{0}{1}</div>',
																header = '<div>',
																info = '<div class="ab-connect-data">';

															columns.attr().forEach(function (c) {
																header += '<span class="ab-connect-data-info"><b>{0}:</b></span>&nbsp;'.replace('{0}', c.label);
																info += '<span class="ab-connect-data-info">#{0}#</span>&nbsp;'.replace('{0}', c.name);
															});

															header += '</div>';
															info += '</div>';
															template = template.replace('{0}', header).replace('{1}', info);

															$$(self.webixUiId.connectObjectDataList).define('template', template);
															$$(self.webixUiId.connectObjectDataList).refresh();

															// TODO: Load the connect data
															// Mock: connect data
															var mockData = [];
															for (var i = 0; i < 4; i++) {
																mockData[i] = {};

																columns.forEach(function (c) {
																	mockData[i].id = 'Mock' + i;
																	mockData[i][c.name] = c.label + ' ' + (i + 1);
																});
															}

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
												var columnConfig = $$(self.webixUiId.modelDatatable).getColumnConfig(data.column);
												if (columnConfig.editor === 'selectivity')
													return false;

												this.editCell(data.row, data.column);
											},
											onColumnResize: function (id, newWidth, oldWidth, user_action) {
												var columnConfig = $$(self.webixUiId.modelDatatable).getColumnConfig(id);
												if (columnConfig.editor === 'selectivity') {
													// For calculate/refresh row height
													$$(self.webixUiId.modelDatatable).render();
												}
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

						setModelId: function (id) {
							var self = this;

							self.data.modelId = id;

							if ($$(self.webixUiId.modelDatatable).showProgress)
								$$(self.webixUiId.modelDatatable).showProgress({ type: 'icon' });

							self.resetState();

							// Set enable connect object list to the add new column popup
							var enableConnectObjects = $.grep(self.data.objectList, function (o) {
								return o.id != self.data.modelId;
							});
							$$(self.webixUiId.addFieldsPopup).setObjectList(enableConnectObjects);

							if (self.data.modelId) {
								async.series([
									function (next) {
										// Get columns from server
										self.Model.findAll({ object: self.data.modelId })
											.fail(function (err) {
												$$(self.webixUiId.modelDatatable).hideProgress();

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

												self.bindColumns(true);

												next();

											});
									},
									function (next) {
										// TODO : Get data from server
										var data = [
											{ name: 'Test 1', description: 'Description 1', optional: 'Option 1', number: 70, Link: [{ id: 'Mock1', text: 'Test Description' }, { id: 'Mock2', text: 'Test2 Description2' }] },
											{ name: 'Test 2', description: 'Description 2', optional: 'Option 2', number: 50, Link: [{ id: 'Mock3', text: 'Test3 Description3' }] },
											{ name: 'Test 3', description: 'Description 3', optional: 'Option 3', number: 90 },
											{ name: 'Test 3', description: 'Description 1', optional: 'Option 2', number: 20 }
										];

										// for (var i = 0; i < 20; i++) {
										// 	data.push({
										// 		name: 'Test ' + i, description: 'Description ' + i, optional: 'Option ' + i, number: i,
										// 	});
										// }

										$$(self.webixUiId.modelDatatable).parse(data);

										next();
									}
								], function () {
									$$(self.webixUiId.modelToolbar).show();
									$$(self.webixUiId.modelDatatable).show();
									$$(self.webixUiId.modelDatatable).refresh();

									// Register table to popups
									$$(self.webixUiId.visibleFieldsPopup).registerDataTable($$(self.webixUiId.modelDatatable));
									$$(self.webixUiId.filterFieldsPopup).registerDataTable($$(self.webixUiId.modelDatatable));
									$$(self.webixUiId.sortFieldsPopup).registerDataTable($$(self.webixUiId.modelDatatable));
									$$(self.webixUiId.frozenColumnsPopup).registerDataTable($$(self.webixUiId.modelDatatable));
									$$(self.webixUiId.addFieldsPopup).registerDataTable($$(self.webixUiId.modelDatatable));

									// Bind columns data
									self.refreshPopupData();

									// Register add new column callback
									$$(self.webixUiId.addFieldsPopup).registerSaveFieldEvent(function (columnInfo) {

										if ($$(self.webixUiId.modelDatatable).showProgress)
											$$(self.webixUiId.modelDatatable).showProgress({ type: 'icon' });

										columnInfo.label = columnInfo.name;

										var newColumn = {
											object: self.data.modelId,
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

										var saveDeferred = $.Deferred();
										saveDeferred
											.fail(function (err) {
												$$(self.webixUiId.modelDatatable).hideProgress();

												webix.message({
													type: "error",
													text: self.labels.common.createErrorMessage.replace('{0}', columnInfo.name)
												});

												AD.error.log('Add Column : Error add new field data', { error: err });
											})
											.then(function (data) {
												if (data.translate) data.translate();

												self.data.columns.push(data);

												var columns = $$(self.webixUiId.modelDatatable).config.columns;

												var addColumnHeader = $.extend(columnInfo.setting, {
													id: data.name,
													dataId: data.id,
													header: self.getHeader(columnInfo)
												});

												addColumnHeader.width = self.calculateColumnWidth(data);

												var existsColumn = $.grep(columns, function (c) { return c.dataId == data.id; });
												if (existsColumn && existsColumn.length > 0) { // Update
													for (var i = 0; i < columns.length; i++) {
														if (columns[i].dataId == data.id)
															columns[i] = addColumnHeader;
													}
												} else { // Add 
													columns.push(addColumnHeader);
												}

												$$(self.webixUiId.modelDatatable).refreshColumns(columns);

												self.refreshPopupData();

												$$(self.webixUiId.modelDatatable).hideProgress();

												webix.message({
													type: "success",
													text: self.labels.common.createSuccessMessage.replace("{0}", columnInfo.name)
												});
											});

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
											self.Model.create(newColumn)
												.fail(function (err) {
													saveDeferred.reject(err);
												})
												.then(function (data) {
													if (data.translate) data.translate();

													saveDeferred.resolve(data);
												});
										}

									});

									$$(self.webixUiId.addFieldsPopup).registerCreateNewObjectEvent(function () {
										$$('ab-model-add-new-popup').define('selectNewObject', false);
										$$('ab-model-add-new-popup').show(); // Mark : show add new object popup in ObjectList page
									});

									if ($$(self.webixUiId.modelDatatable).hideProgress)
										$$(self.webixUiId.modelDatatable).hideProgress();

								});
							}
							else {
								if ($$(self.webixUiId.modelDatatable).hideProgress)
									$$(self.webixUiId.modelDatatable).hideProgress();

								$$(self.webixUiId.modelDatatable).hide();
							}

						},

						bindColumns: function (resetColumns) {
							var self = this;

							var columns = $.map(self.data.columns.attr(), function (col, i) {

								col.setting.width = self.calculateColumnWidth(col);

								if (col.setting.format)
									col.setting.format = webix.i18n[col.setting.format];

								return $.extend(col.setting, {
									id: col.name,
									dataId: col.id,
									label: col.label,
									header: self.getHeader(col)
								});
							});

							$$(self.webixUiId.modelDatatable).refreshColumns(columns, resetColumns || false);
						},

						getHeader: function (col) {
							var self = this,
								label = col.label;

							// Show connect object name in header
							if (col.setting.editor === 'selectivity') {
								// Find label of connect object
								var connectObj = $.grep(self.data.objectList, function (o) {
									return o.name == col.linkToObject;
								});

								label += self.labels.object.connectToObjectName.replace('{0}', connectObj[0].label);
							}

							return "<div class='ab-model-data-header'><span class='webix_icon fa-{0}'></span>{1}<i class='ab-model-data-header-edit fa fa-angle-down'></i></div>"
								.replace('{0}', col.setting.icon)
								.replace('{1}', label);
						},

						setObjectList: function (objectList) {
							var self = this;

							self.data.objectList = objectList;
							$$(self.webixUiId.addFieldsPopup).setObjectList(objectList);
						},

						getCurSelectivityNode: function (selectedCell) {
							var self = this;

							if (selectedCell || self.data.selectedCell) {
								var rowNode = $($$(self.webixUiId.modelDatatable).getItemNode(selectedCell || self.data.selectedCell));
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
							}

							$$(self.webixUiId.visibleFieldsPopup).bindFieldList();
							$$(self.webixUiId.filterFieldsPopup).refreshFieldList();
							$$(self.webixUiId.sortFieldsPopup).refreshFieldList();
							$$(self.webixUiId.frozenColumnsPopup).bindFieldList();
						},
						calculateColumnWidth: function (col) {
							var charWidth = 7,
								width = (col.label.length * charWidth) + 80;

							if (col.linkToObject) // Connect to... label
								width += col.linkToObject.length * charWidth + 55;

							return width;
						},
						calculateRowHeight: function (row, column, dataNumber) {
							var self = this,
								rowHeight = 35;
							// maxItemWidth = 100, // Max item width
							// columnInfo = $$(self.webixUiId.modelDatatable).getColumnConfig(column),
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

							$$(self.webixUiId.modelDatatable).setRowHeight(row, calHeight);
						},

						resetState: function () {
							var self = this;

							$$(self.webixUiId.modelToolbar).hide();
							$$(self.webixUiId.modelDatatable).define('leftSplit', 0);
							$$(self.webixUiId.modelDatatable).clearValidation();
							$$(self.webixUiId.modelDatatable).clearSelection();
							$$(self.webixUiId.modelDatatable).clearAll();
							$$(self.webixUiId.modelDatatable).refresh();
							$$(self.webixUiId.modelDatatable).refreshColumns([], true);

							self.refreshPopupData();
						},

						resize: function (height) {
							var self = this;

							if ($$(self.webixUiId.modelDatatable)) {
								$$(self.webixUiId.modelDatatable).define("height", height - 150);
								$$(self.webixUiId.modelDatatable).resize();
							}
						}

					});

				});
		});

	});