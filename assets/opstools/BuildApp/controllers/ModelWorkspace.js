
steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/webix_custom_components/ActiveList.js',
	'opstools/BuildApp/controllers/webix_custom_components/DataTableEditor.js',
	'opstools/BuildApp/controllers/webix_custom_components/DataTableVisibleFieldsPopup.js',
	'opstools/BuildApp/controllers/webix_custom_components/DataTableFilterPopup.js',
	'opstools/BuildApp/controllers/webix_custom_components/DataTableSortFieldsPopup.js',
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

								editHeaderPopup: 'ab-edit-header-popup',
								renameHeaderPopup: 'ab-rename-header-popup',
								addConnectObjectDataPopup: 'ab-connect-object-data-popup',
								connectObjectDataList: 'ab-connect-object-data-list',
								newFieldName: 'ab-new-name-header',

								visibleFieldsPopup: 'ab-visible-fields-popup',
								filterFieldsPopup: 'ab-filter-popup',
								sortFieldsPopup: 'ab-sort-popup',
								addFieldsPopup: 'ab-add-fields-popup'
							};

							this.initControllers();
							this.initWebixUI();

						},

						initControllers: function () {
							this.controllers = {};

							var DataTableEditor = AD.Control.get('opstools.BuildApp.DataTableEditor'),
								VisibleFieldsPopup = AD.Control.get('opstools.BuildApp.DataTableVisibleFieldsPopup'),
								FilterPopup = AD.Control.get('opstools.BuildApp.DataTableFilterPopup'),
								SortPopup = AD.Control.get('opstools.BuildApp.DataTableSortFieldsPopup'),
								AddFieldPopup = AD.Control.get('opstools.BuildApp.DataTableAddFieldPopup');

							this.controllers.DataTableEditor = new DataTableEditor();
							this.controllers.VisibleFieldsPopup = new VisibleFieldsPopup();
							this.controllers.FilterPopup = new FilterPopup();
							this.controllers.SortPopup = new SortPopup();
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
								id: self.webixUiId.addFieldsPopup,
								view: "add_fields_popup",
							}).hide();

							// Rename header popup
							webix.ui({
								id: self.webixUiId.renameHeaderPopup,
								view: "window",
								position: "center",
								modal: true,
								head: 'Rename',
								body: {
									rows: [
										{ view: 'text', id: self.webixUiId.newFieldName, label: 'New name' },
										{
											cols: [
												{
													view: "button", label: "Save", type: "form", click: function () {
														var newName = $$(self.webixUiId.newFieldName).getValue().trim();
														if (newName.length > 0) {
															$$(self.webixUiId.modelDatatable).showProgress({ type: "icon" });

															var selectedModel = self.data.columns.filter(function (item, index, list) { return item.id == self.data.selectedFieldId; })[0];

															// selectedModel.attr('name', newName);
															selectedModel.attr('label', newName);

															// Rename column
															selectedModel.save()
																.fail(function (err) {
																	$$(self.webixUiId.modelDatatable).hideProgress();

																	webix.message({
																		type: "error",
																		text: "System could not rename <b>{0}</b>.".replace('{0}', selectedModel.name)
																	});

																	AD.error.log('Column : Error rename column', { error: err });
																})
																.then(function (data) {
																	self.bindColumns();

																	if (data.translate) data.translate();

																	webix.message({
																		type: "success",
																		text: "Rename to <b>" + data.label + "</b>."
																	});

																	self.refreshPopupData();

																	$$(self.webixUiId.modelDatatable).hideProgress();

																	$$(self.webixUiId.renameHeaderPopup).hide();
																});
														}
													}
												},
												{
													view: "button", value: "Cancel", click: function () {
														$$(self.webixUiId.renameHeaderPopup).hide();
													}
												}
											]
										}
									]
								},
								on: {
									onShow: function () {
										$$(self.webixUiId.newFieldName).setValue('');
									}
								}
							}).hide();

							// Edit header popup
							webix.ui({
								id: self.webixUiId.editHeaderPopup,
								view: 'popup',
								width: 180,
								body: {
									view: 'list',
									data: [
										{ command: "Hide field", icon: "fa-columns" },
										{ command: "Filter field", icon: "fa-filter" },
										{ command: "Sort field", icon: "fa-sort" },
										{ command: "Rename field", icon: "fa-pencil-square-o" },
										{ command: "Delete field", icon: "fa-trash" }
									],
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
												case 'Hide field':
													$$(self.webixUiId.modelDatatable).hideColumn(selectedField.id);
													$$(self.webixUiId.editHeaderPopup).hide();
													break;
												case 'Filter field':
													break;
												case 'Sort field':
													break;
												case 'Rename field':
													// Show old name in head popup
													$$(self.webixUiId.renameHeaderPopup).getHead().setHTML("Rename <b>{0}</b> column".replace('{0}', selectedFieldName));
													$$(self.webixUiId.renameHeaderPopup).show();

													$$(self.webixUiId.editHeaderPopup).hide();
													break;
												case 'Delete field':
													// Validate
													if (columns.length < 2) {
														webix.alert({
															title: "Could not delete",
															ok: "Ok",
															text: "Object should have at least one field."
														});
														$$(self.webixUiId.editHeaderPopup).hide();
														return;
													}

													// TODO : Get from translation
													var deleteConfirmTitle = "Delete data field",
														deleteConfirmMessage = "Do you want to delete <b>{0}</b>?".replace('{0}', selectedFieldName),
														yes = "Yes",
														no = "No";

													webix.confirm({
														title: deleteConfirmTitle,
														ok: yes,
														cancel: no,
														text: deleteConfirmMessage,
														callback: function (result) {
															if (result) {
																$$(self.webixUiId.modelDatatable).showProgress({ type: "icon" });

																// Call server to delete field data
																self.Model.destroy(selectedField.dataId)
																	.fail(function (err) {
																		$$(self.webixUiId.modelDatatable).hideProgress();

																		webix.message({
																			type: "error",
																			text: "System could not delete <b>{0}</b>.".replace('{0}', selectedFieldName)
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
																			text: "<b>" + selectedFieldName + "</b> is deleted."
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
								head: "Select any connect data",
								position: "center",
								autowidth: true,
								autoheight: true,
								body: {
									rows: [
										{
											id: self.webixUiId.connectObjectDataList,
											view: 'list',
											width: 600,
											height: 400,
											select: true,
											multiselect: true,
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
											value: "Close",
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
											{ view: "button", label: "Hide fields", icon: "columns", type: "icon", width: 120, popup: self.webixUiId.visibleFieldsPopup },
											{ view: 'button', label: "Add filters", icon: "filter", type: "icon", width: 120, popup: self.webixUiId.filterFieldsPopup },
											{ view: 'button', label: 'Apply sort', icon: "sort", type: "icon", width: 120, popup: self.webixUiId.sortFieldsPopup },
											{ view: 'button', label: 'Permission', icon: "lock", type: "icon", width: 120 },
											{ view: 'button', label: 'Add new column', icon: "plus", type: "icon", width: 150, popup: self.webixUiId.addFieldsPopup }
										]
									},
									{
										view: "datatable",
										id: self.webixUiId.modelDatatable,
										autoheight: true,
										resizeColumn: true,
										resizeRow: true,
										editable: true,
										editaction: "custom",
										select: "cell",
										type: {
											autoheight: true
										},
										ready: function () {
											webix.extend(this, webix.ProgressBar);
										},
										on: {
											onAfterRender: function (data) {
												// Initial multi-combo
												$('.connect-data-values').selectivity({
													allowClear: true,
													multiple: true,
													removeOnly: true,
													showDropdown: false,
													showSearchInputInDropdown: false,
													placeholder: 'No data selected'
												});

												// Popuplate multi-combo
												var linkCols = $.grep(self.data.columns, function (c) {
													return c.type === 'link';
												});

												linkCols.forEach(function (c) {
													data.each(function (d) {
														if (d[c.name]) {
															var connectFieldNode = $($$(self.webixUiId.modelDatatable).getItemNode({ row: d.id, column: c.name }));
															connectFieldNode.find('.connect-data-values').selectivity('data', d[c.name]);
														}
													})
												});
											},
											onHeaderClick: function (id, e, trg) {
												var columnConfig = $$(self.webixUiId.modelDatatable).getColumnConfig(id.column);
												self.data.selectedFieldId = columnConfig.dataId;

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
														$$(self.webixUiId.connectObjectDataList).showProgress();

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
													text: "System could not get fields data."
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
									$$(self.webixUiId.addFieldsPopup).registerDataTable($$(self.webixUiId.modelDatatable));

									// Bind columns data
									self.refreshPopupData();

									// Register add new column callback
									$$(self.webixUiId.addFieldsPopup).registerAddNewFieldEvent(function (columnInfo) {

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

										if (columnInfo.setting.value)
											newColumn.default = columnInfo.setting.value;

										self.Model.create(newColumn)
											.fail(function (err) {
												$$(self.webixUiId.modelDatatable).hideProgress();

												webix.message({
													type: "error",
													text: "System could not add <b>{0}</b>.".replace('{0}', columnInfo.name)
												});

												AD.error.log('Add Column : Error add new field data', { error: err });
											})
											.then(function (data) {
												if (data.translate) data.translate();

												self.data.columns.push(data);

												// Add new column
												var columns = $$(self.webixUiId.modelDatatable).config.columns;

												var addColumnHeader = $.extend(columnInfo.setting, {
													id: data.name,
													dataId: data.id,
													header: self.getHeader(columnInfo)
												});
												columns.push(addColumnHeader);
												$$(self.webixUiId.modelDatatable).refreshColumns(columns);

												self.refreshPopupData();

												$$(self.webixUiId.modelDatatable).hideProgress();

												webix.message({ type: "success", text: "<b>{0}</b> is added.".replace("{0}", columnInfo.name) });
											});

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
								return $.extend(col.setting, {
									id: col.name,
									dataId: col.id,
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

								label += ' (Connect to <b>{0}</b>)'.replace('{0}', connectObj[0].label);
							}

							return "<div class='ab-model-data-header'><span class='webix_icon fa-{0}'></span>{1}<i class='ab-model-data-header-edit fa fa-angle-down'></i></div>"
								.replace('{0}', col.setting.icon)
								.replace('{1}', label);
						},

						setObjectList: function (objectList) {
							var self = this;

							self.data.objectList = objectList;
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
							}

							$$(self.webixUiId.visibleFieldsPopup).bindFieldList();
							$$(self.webixUiId.filterFieldsPopup).refreshFieldList();
							$$(self.webixUiId.sortFieldsPopup).refreshFieldList();
						},

						resetState: function () {
							var self = this;

							$$(self.webixUiId.modelToolbar).hide();
							$$(self.webixUiId.modelDatatable).clearValidation();
							$$(self.webixUiId.modelDatatable).clearSelection();
							$$(self.webixUiId.modelDatatable).clearAll();
							$$(self.webixUiId.modelDatatable).refresh();
							$$(self.webixUiId.modelDatatable).refreshColumns([], true);

							self.refreshPopupData();
						}

					});

				});
		});

	});