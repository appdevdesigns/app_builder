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

	'opstools/BuildApp/controllers/webix_custom_components/DataTableEditHeaderPopup.js',
	'opstools/BuildApp/controllers/webix_custom_components/ConnectedDataPopup.js',

	'opstools/BuildApp/controllers/utils/ModelCached.js',
	'opstools/BuildApp/controllers/utils/ModelCreator.js',
	'opstools/BuildApp/controllers/utils/ObjectDataTable.js',
	'opstools/BuildApp/controllers/utils/SelectivityHelper.js',

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

							self.options = AD.defaults({
								changedSelectivityEvent: 'AB_Selectivity.Changed'
							}, options);

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

								addNewRowButton: 'ab-add-new-row-button',

								editHeaderPopup: 'ab-edit-header-popup',

								addConnectObjectDataPopup: 'ab-connect-object-data-popup',

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
							this.initEvents();

						},

						initMultilingualLabels: function () {
							var self = this;
							self.labels = {};
							self.labels.common = {};
							self.labels.application = {};
							self.labels.object = {};
							self.labels.object.toolbar = {};

							self.labels.common.newName = AD.lang.label.getLabel('ab.common.newName') || 'New name';
							self.labels.common.yes = AD.lang.label.getLabel('ab.common.yes') || "Yes";
							self.labels.common.no = AD.lang.label.getLabel('ab.common.no') || "No";
							self.labels.common.save = AD.lang.label.getLabel('ab.common.save') || "Save";
							self.labels.common.ok = AD.lang.label.getLabel('ab.common.ok') || "Ok";
							self.labels.common.cancel = AD.lang.label.getLabel('ab.common.cancel') || "Cancel";
							self.labels.common.rename = AD.lang.label.getLabel('ab.common.rename') || "Rename";
							self.labels.common.renameErrorMessage = AD.lang.label.getLabel('ab.common.rename.error') || "System could not rename <b>{0}</b>.";
							self.labels.common.renameSuccessMessage = AD.lang.label.getLabel('ab.common.rename.success') || "Rename to <b>{0}</b>.";
							self.labels.common.createErrorMessage = AD.lang.label.getLabel('ab.common.create.error') || "System could not create <b>{0}</b>.";
							self.labels.common.createSuccessMessage = AD.lang.label.getLabel('ab.common.create.success') || "<b>{0}</b> is created.";
							self.labels.common.deleteErrorMessage = AD.lang.label.getLabel('ab.common.delete.error') || "System could not delete <b>{0}</b>.";
							self.labels.common.deleteSuccessMessage = AD.lang.label.getLabel('ab.common.delete.success') || "<b>{0}</b> is deleted.";

							self.labels.application.unsyncDataMessage = AD.lang.label.getLabel('ab.application.unsyncDataMessage') || "There are {0} out of sync data";
							self.labels.application.dataOfflineMessage = AD.lang.label.getLabel('ab.application.dataOfflineMessage') || "This data is offline.";

							self.labels.object.hideField = AD.lang.label.getLabel('ab.object.hideField') || "Hide field";
							self.labels.object.filterField = AD.lang.label.getLabel('ab.object.filterField') || "Filter field";
							self.labels.object.sortField = AD.lang.label.getLabel('ab.object.sortField') || "Sort field";
							self.labels.object.editField = AD.lang.label.getLabel('ab.object.editField') || "Edit field";
							self.labels.object.deleteField = AD.lang.label.getLabel('ab.object.deleteField') || "Delete field";

							self.labels.object.addNewRow = AD.lang.label.getLabel('ab.object.addNewRow') || "Add new row";

							self.labels.object.couldNotDeleteField = AD.lang.label.getLabel('ab.object.couldNotDeleteField') || "Could not delete";
							self.labels.object.atLeastOneField = AD.lang.label.getLabel('ab.object.atLeastOneField') || "Object should have at least one field.";

							self.labels.object.couldNotReorderField = AD.lang.label.getLabel('ab.object.couldNotReorderField') || "Could not reorder columns";
							self.labels.object.couldNotReorderFieldDetail = AD.lang.label.getLabel('ab.object.couldNotReorderFieldDetail') || "There are hidden columns.";

							// Delete
							self.labels.object.confirmDeleteTitle = AD.lang.label.getLabel('ab.object.delete.title') || "Delete data field";
							self.labels.object.confirmDeleteMessage = AD.lang.label.getLabel('ab.object.delete.message') || "Do you want to delete <b>{0}</b>?";

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
							var self = this;

							self.controllers = {};

							var DataTableEditor = AD.Control.get('opstools.BuildApp.DataTableEditor'),
								VisibleFieldsPopup = AD.Control.get('opstools.BuildApp.DataTableVisibleFieldsPopup'),
								FilterPopup = AD.Control.get('opstools.BuildApp.DataTableFilterPopup'),
								SortPopup = AD.Control.get('opstools.BuildApp.DataTableSortFieldsPopup'),
								FrozenPopup = AD.Control.get('opstools.BuildApp.DataTableFrozenColumnPopup'),
								DefineLabelPopup = AD.Control.get('opstools.BuildApp.DataTableDefineLabelPopup'),
								AddFieldPopup = AD.Control.get('opstools.BuildApp.DataTableAddFieldPopup'),

								EditHeaderPopup = AD.Control.get('opstools.BuildApp.DataTableEditHeaderPopup'),
								ConnectedDataPopup = AD.Control.get('opstools.BuildApp.ConnectedDataPopup'),

								ModelCreator = AD.Control.get('opstools.BuildApp.ModelCreator'),
								ObjectDataTable = AD.Control.get('opstools.BuildApp.ObjectDataTable'),
								SelectivityHelper = AD.Control.get('opstools.BuildApp.SelectivityHelper');

							self.controllers = {
								DataTableEditor: new DataTableEditor(),
								VisibleFieldsPopup: new VisibleFieldsPopup(),
								FilterPopup: new FilterPopup(),
								SortPopup: new SortPopup(),
								FrozenPopup: new FrozenPopup(),
								DefineLabelPopup: new DefineLabelPopup(),
								AddFieldPopup: new AddFieldPopup(),
								EditHeaderPopup: new EditHeaderPopup(),
								ConnectedDataPopup: new ConnectedDataPopup(),

								ModelCreator: new ModelCreator(),
								ObjectDataTable: new ObjectDataTable(self.element, { changedSelectivityEvent: self.options.changedSelectivityEvent }),
								SelectivityHelper: new SelectivityHelper()
							};
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

							webix.ui({
								id: self.webixUiId.editHeaderPopup,
								view: "edit_header_popup",
							});

							webix.ui({
								id: self.webixUiId.addConnectObjectDataPopup,
								view: "connected_data_popup",
							});

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
										prerender: false,
										editable: true,
										editaction: "custom",
										select: "cell",
										dragColumn: true,
										on: {
											onBeforeSelect: function (data, preserve) {
												var columnConfig = $$(self.webixUiId.objectDatatable).getColumnConfig(data.column);

												if (!columnConfig.editor && columnConfig.filter_type === 'boolean') { // Ignore edit 'Checkbox' field
													return false;
												}
												else if (columnConfig.editor === 'selectivity') {
													// Get column data
													var columnData = self.data.columns.filter(function (f) {
														return f.name === data.column;
													});

													if (!columnData || columnData.length < 1)
														return false;

													columnData = columnData[0];

													self.data.selectedCell = { row: data.row, column: data.column };

													// Show connect data windows popup
													var curSelectivity = self.getCurSelectivityNode(self.data.selectedCell),
														selectedData = self.controllers.SelectivityHelper.getData(curSelectivity),
														selectedIds = $.map(selectedData, function (d) { return d.id; });

													// Get columns of connected object
													var object = self.data.objectList.filter(function (o) {
														return o.id == (columnData.linkObject.id || columnData.linkObject);
													});

													if (!object || object.length < 1)
														return false;

													$$(self.webixUiId.addConnectObjectDataPopup).open(object[0], data.row, selectedIds, columnData.linkType, columnData.linkVia.name, columnData.linkVia.linkType);

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
											onCheck: function (row, col, val) { // Update checkbox data
												var item = $$(self.webixUiId.objectDatatable).getItem(row);

												self.updateRowData({ value: (val > 0 ? true : false) }, { row: row, column: col }, false)
													.fail(function (err) {
														// Rollback
														item[col] = !val;
														$$(self.webixUiId.objectDatatable).updateItem(row, item);
														$$(self.webixUiId.objectDatatable).refresh(row);

														$$(self.webixUiId.objectDatatable).hideProgress();
													})
													.then(function (result) {
														$$(self.webixUiId.objectDatatable).hideProgress();
													});
											},
											onAfterEditStop: function (state, editor, ignoreUpdate) {
												var item = $$(self.webixUiId.objectDatatable).getItem(editor.row);

												self.updateRowData(state, editor, ignoreUpdate)
													.fail(function (err) { // Cached
														item[editor.column] = state.old;
														$$(self.webixUiId.objectDatatable).updateItem(editor.row, item);
														$$(self.webixUiId.objectDatatable).refresh(editor.row);

														// TODO : Message

														$$(self.webixUiId.objectDatatable).hideProgress();
													})
													.then(function (result) {
														item[editor.column] = state.value;

														if (result.constructor.name === 'Cached' && result.isUnsync())
															item.isUnsync = true;

														$$(self.webixUiId.objectDatatable).updateItem(editor.row, item);

														// TODO : Message

														$$(self.webixUiId.objectDatatable).hideProgress();
													});
											},
											onColumnResize: function (id, newWidth, oldWidth, user_action) {
												var columnConfig = $$(self.webixUiId.objectDatatable).getColumnConfig(id);
												if (columnConfig.editor === 'selectivity') {
													// For calculate/refresh row height
													$$(self.webixUiId.objectDatatable).render();
												}
											},
											onBeforeColumnDrop: function (sourceId, targetId, event) {
												if (targetId === 'appbuilder_trash') // Remove column
													return false;

												if ($$(self.webixUiId.visibleButton).config.badge > 0) {
													webix.alert({
														title: self.labels.object.couldNotReorderField,
														ok: self.labels.common.ok,
														text: self.labels.object.couldNotReorderFieldDetail
													});

													return false;
												}
											},
											onAfterColumnDrop: function (sourceId, targetId, event) {
												self.reorderColumns();
											},
											onAfterColumnShow: function (id) {
												$$(self.webixUiId.visibleFieldsPopup).showField(id);
											},
											onAfterColumnHide: function (id) {
												$$(self.webixUiId.visibleFieldsPopup).hideField(id);
											}
										}
									},
									{
										cols: [
											{
												autowidth: true
											},
											{
												view: "button",
												id: self.webixUiId.addNewRowButton,
												value: self.labels.object.addNewRow,
												width: 150,
												align: 'right',
												click: function () {
													$$(self.webixUiId.objectDatatable).showProgress({ type: 'icon' });

													var newModel = self.Model.ObjectModel.Cached.newInstance();

													newModel.save()
														.fail(function (err) {
															// TODO message

															$$(self.webixUiId.objectDatatable).hideProgress();
														})
														.then(function (result) {
															if (result.translate) result.translate();

															$$(self.webixUiId.objectDatatable).data.add(result.attr(), $$(self.webixUiId.objectDatatable).data.count());

															$$(self.webixUiId.objectDatatable).hideProgress();
														})
												}
											}
										]
									}
								]
							};
						},

						initEvents: function () {
						},

						webix_ready: function () {
							var self = this;

							webix.extend($$(self.webixUiId.objectDatatable), webix.ProgressBar);

							self.controllers.ObjectDataTable.registerDataTable($$(self.webixUiId.objectDatatable));
							self.controllers.ObjectDataTable.registerChangeSelectivityItem(function (ev, data) {
								// Remove selected items
								if (ev.removed) {
									// Delete removed value - Array
									if (data.itemData.forEach) {
										data.itemData.forEach(function (item, index) {
											var id = item.id ? item.id : item;
											if (id == ev.removed.id)
												data.itemData.splice(index, 1);
										});

										if (data.itemData.length < 1) {
											data.itemData = '';
											data.item[data.columnId] = [];
										}
									}
									// Delete removed value - Object
									else if (data.itemData.id == ev.removed.id) {
										data.itemData = '';
										data.item[data.columnId] = [];
									}

									$$(self.webixUiId.objectDatatable).updateItem(data.rowId, data.item);

									// Call server to remove value
									self.updateRowData({ value: data.itemData }, { column: data.columnId, row: data.rowId }, false)
										.then(function (result) {
											$$(self.webixUiId.objectDatatable).hideProgress();

											$$(self.webixUiId.objectDatatable).render({ column: data.columnId });
										});

								}
							});

							// Register delete event handler
							self.controllers.ObjectDataTable.registerDeleteRowHandler(function (deletedId) {
								$$(self.webixUiId.objectDatatable).showProgress({ type: 'icon' });

								self.Model.ObjectModel.Cached.destroy(deletedId.row)
									.fail(function (err) {
										// TODO message
										$$(self.webixUiId.objectDatatable).hideProgress();
									})
									.then(function (result) {
										$$(self.webixUiId.objectDatatable).remove(result.id ? result.id : result);

										// TODO message

										$$(self.webixUiId.objectDatatable).hideProgress();
									});
							});

							// DataTable header
							$$(self.webixUiId.editHeaderPopup).registerHeaderClick(function (clickedItem, headerField) {
								switch (clickedItem) {
									case self.labels.object.hideField:
										$$(self.webixUiId.visibleFieldsPopup).hideField(headerField.id);
										$$(self.webixUiId.editHeaderPopup).hide();
										break;
									case self.labels.object.filterField:
										$$(self.webixUiId.filterFieldsPopup).addNewFilter(headerField.id);
										$$(self.webixUiId.editHeaderPopup).hide();
										$$(self.webixUiId.filterFieldsPopup).show($$(self.webixUiId.filterButton).getNode());
										break;
									case self.labels.object.sortField:
										$$(self.webixUiId.sortFieldsPopup).addNewSort(headerField.id);
										$$(self.webixUiId.editHeaderPopup).hide();
										$$(self.webixUiId.sortFieldsPopup).show($$(self.webixUiId.sortButton).getNode());
										break;
									case self.labels.object.editField:
										var itemNode = $$(self.webixUiId.objectDatatable).getHeaderNode(headerField.id);
										$$(self.webixUiId.editHeaderPopup).hide();

										var selectedColumn = $.grep(self.data.columns.attr(), function (c) { return c.id == headerField.dataId; })[0];

										if (selectedColumn) {
											$$(self.webixUiId.addFieldsPopup).show(itemNode);
											$$(self.webixUiId.addFieldsPopup).editMode(selectedColumn);
										}
										else {
											// Get cached field
											self.controllers.ModelCreator.getModel(self.data.object.attr('name'))
												.then(function (objectModel) {
													var newFields = objectModel.Cached.getNewFields().filter(function (c) { return c.id == headerField.dataId });

													if (newFields && newFields.length > 0) {
														$$(self.webixUiId.addFieldsPopup).show(itemNode);
														$$(self.webixUiId.addFieldsPopup).editMode(newFields[0]);
													}
												});
										}
										break;
									case self.labels.object.deleteField:
										// Validate
										if (self.data.columns.length < 2 && typeof headerField.dataId !== 'string') {
											webix.alert({
												title: self.labels.object.couldNotDeleteField,
												ok: self.labels.common.ok,
												text: self.labels.object.atLeastOneField
											});
											$$(self.webixUiId.editHeaderPopup).hide();
											return;
										}

										async.waterfall([
											function (next) {
												var selectedColumn = $.grep(self.data.columns.attr(), function (c) { return c.id == headerField.dataId; })[0];

												if (!selectedColumn || selectedColumn.length < 1) {
													// Get cached field
													self.controllers.ModelCreator.getModel(self.data.object.attr('name'))
														.then(function (objectModel) {
															var newFields = objectModel.Cached.getNewFields().filter(function (c) { return c.id == headerField.dataId });

															if (newFields && newFields.length > 0) {
																selectedColumn = newFields[0];
																next(null, selectedColumn);
															}

														});
												}
												else {
													next(null, selectedColumn);
												}
											},
											function (selectedColumn, next) {
												webix.confirm({
													title: self.labels.object.confirmDeleteTitle,
													ok: self.labels.common.yes,
													cancel: self.labels.common.no,
													text: self.labels.object.confirmDeleteMessage.replace('{0}', selectedColumn.label),
													callback: function (result) {
														if (result) {
															$$(self.webixUiId.objectDatatable).showProgress({ type: "icon" });

															var objectName = self.data.object.attr('name');

															async.parallel([
																// Remove describe & multi-fields of object model
																function (ok) {
																	self.controllers.ModelCreator.getModel(objectName)
																		.fail(function (err) { ok(err); })
																		.then(function (objectModel) {
																			delete objectModel.describe()[headerField.id];

																			if (objectModel.multilingualFields) // Remove field
																				objectModel.multilingualFields = objectModel.multilingualFields.filter(function (f) { return f != headerField.id; });

																			// Delete cache
																			objectModel.Cached.deleteCachedField(headerField.dataId);

																			ok();
																		});
																},
																// Remove describe & multi-fields of link object model
																function (ok) {
																	if (selectedColumn.linkObject && selectedColumn.linkVia) {
																		var linkObject = self.data.objectList.filter(function (obj) {
																			var linkObjId = selectedColumn.linkObject.id || selectedColumn.linkObject;
																			return obj.id == linkObjId;
																		})[0];

																		self.controllers.ModelCreator.getModel(linkObject.name)
																			.fail(function (err) { ok(err); })
																			.then(function (objectModel) {
																				delete objectModel.describe()[selectedColumn.linkVia];

																				if (objectModel.multilingualFields) // Remove link field
																					objectModel.multilingualFields = objectModel.multilingualFields.filter(function (f) { return f != selectedColumn.linkVia; });

																				// Delete cache
																				objectModel.Cached.deleteCachedField(selectedColumn.linkVia);

																				ok();
																			});
																	}
																	else {
																		ok();
																	}
																},
																// Call server to delete field data
																function (ok) {
																	if (typeof headerField.dataId === 'string' && headerField.dataId.startsWith('temp')) {
																		ok();
																	}
																	else {
																		self.Model.ABColumn.destroy(headerField.dataId)
																			.fail(function (err) { ok(err); })
																			.then(function (data) { ok(); });
																	}
																},
																// Call server to delete link field data
																function (ok) {
																	if (selectedColumn.linkObject && selectedColumn.linkVia && typeof selectedColumn.linkVia !== 'string') {
																		self.Model.ABColumn.destroy(selectedColumn.linkVia.id)
																			.fail(function (err) { ok(err); })
																			.then(function (data) { ok(); });
																	}
																	else {
																		ok();
																	}
																}
															], function (err) {
																if (err) {
																	$$(self.webixUiId.objectDatatable).hideProgress();

																	webix.message({
																		type: "error",
																		text: self.labels.common.deleteErrorMessage.replace('{0}', selectedColumn.label)
																	});

																	AD.error.log('Column list : Error delete column', { error: err });
																	next(err);
																	return;
																}

																// Remove column
																self.data.columns.forEach(function (c, index) {
																	if (c.name == headerField.id) {
																		self.data.columns.splice(index, 1);
																		return false;
																	}
																});

																self.bindColumns(false, true);

																self.reorderColumns();

																$$(self.webixUiId.editHeaderPopup).hide();

																webix.message({
																	type: "success",
																	text: self.labels.common.deleteSuccessMessage.replace('{0}', selectedColumn.label)
																});

																// Clear selected field
																headerField = null;

																self.refreshPopupData();

																$$(self.webixUiId.objectDatatable).hideProgress();

																next();
															});
														}

													}
												});
											}
										]);

										break;
								}
							});

							// Connect data popup
							$$(self.webixUiId.addConnectObjectDataPopup).registerSelectChangeEvent(function (selectedItems) {
								self.controllers.SelectivityHelper.setData(self.getCurSelectivityNode(), selectedItems);
							});
							$$(self.webixUiId.addConnectObjectDataPopup).registerCloseEvent(function (selectedItems) {
								$$(self.webixUiId.objectDatatable).showProgress({ type: 'icon' });

								var selectedIds = [];

								if (selectedItems && selectedItems.length > 0)
									selectedIds = $.map(selectedItems, function (item) { return { id: item.id }; });

								self.updateRowData(
									{ value: selectedIds }, // state
									{ // editor
										row: self.data.selectedCell.row,
										column: self.data.selectedCell.column
									},
									false)
									.then(function (result) {
										// Update row
										var rowData = $$(self.webixUiId.objectDatatable).getItem(self.data.selectedCell.row);

										rowData[self.data.selectedCell.column] = selectedItems.map(function (item) {
											return {
												id: item.id,
												dataLabel: item.text
											}
										}) || [];

										$$(self.webixUiId.objectDatatable).updateItem(self.data.selectedCell.row, rowData);

										// Remove duplicate selected item when the link column supports one value
										var colData = self.data.columns.filter(function (col) { return col.name == self.data.selectedCell.column; })[0];
										if (selectedIds && colData.setting.linkViaType === 'model') {
											$$(self.webixUiId.objectDatatable).eachRow(function (row) {
												if (row != self.data.selectedCell.row) {
													var otherRow = $$(self.webixUiId.objectDatatable).getItem(row);
													if (otherRow[self.data.selectedCell.column]) {
														// Filter difference values
														otherRow[self.data.selectedCell.column] = otherRow[self.data.selectedCell.column].filter(function (i) {
															return selectedIds.filter(function (sId) { return i.id == sId.id; }).length < 1;
														});

														$$(self.webixUiId.objectDatatable).updateItem(row, otherRow);
													}
												}
											});
										}

										// Resize row height
										self.controllers.ObjectDataTable.calculateRowHeight(self.data.selectedCell.row, self.data.selectedCell.column, selectedIds.length);

										$$(self.webixUiId.objectDatatable).hideProgress();

										self.data.selectedCell = null
									});

								self.controllers.SelectivityHelper.setData(self.getCurSelectivityNode(), selectedItems);
							});
						},

						getUIDefinition: function () {
							return this.data.definition;
						},

						setApp: function (app) {
							this.data.app = app;
						},

						setObjectId: function (id) {
							var self = this;

							self.data.objectId = id;

							$$(self.webixUiId.objectDatatable).show();
							$$(self.webixUiId.objectDatatable).showProgress({ type: 'icon' });

							self.resetState();

							// Set values to object datatable utils
							self.controllers.ObjectDataTable.setApp(self.data.app);

							// Set values to model creator
							self.controllers.ModelCreator.setApp(self.data.app);

							// Set values to connect object popup
							$$(self.webixUiId.addConnectObjectDataPopup).setApp(self.data.app);

							$$(self.webixUiId.addFieldsPopup).setApp(self.data.app);
							$$(self.webixUiId.addFieldsPopup).setObjectList(self.data.objectList);
							$$(self.webixUiId.addFieldsPopup).setCurrObjectId(self.data.objectId);

							if (self.data.objectId) {
								var curObject = self.data.objectList.filter(function (o) { return o.id == self.data.objectId; });
								self.data.object = curObject[0];

								async.series([
									// Get columns data from server
									function (next) {
										$$(self.webixUiId.objectDatatable).clearAll();

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
												var listColIds = $.map(self.data.columns.filter(function (col) { return col.setting.editor === 'richselect'; }), function (c) {
													return c.id;
												});

												if (listColIds && listColIds.length > 0) {
													var getListEvents = [];

													listColIds.forEach(function (cId) {
														getListEvents.push(function (cb) {
															var column = self.data.columns.filter(function (col) { return col.id == cId; })[0];

															self.Model.ABList.findAll({ column: cId })
																.fail(function (err) { cb(err); })
																.then(function (listResult) {

																	listResult.forEach(function (listItem) {
																		if (listItem.translate) listItem.translate();
																	});

																	var sortedList = listResult.attr().sort(function (a, b) { return a.weight - b.weight; });
																	column.setting.attr('options', $.map(sortedList, function (list) {
																		return {
																			dataId: list.id,
																			id: list.value,
																			label: list.label
																		}
																	}));

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
									// Bind columns to DataTable
									function (next) {
										self.bindColumns(true, true)
											.fail(function (err) { next(err); })
											.then(function () { next(); });
									},
									// Get object model
									function (next) {
										if (!self.data.object) {
											next();
											return;
										}

										self.controllers.ModelCreator.getModel(self.data.object.attr('name'))
											.fail(function (err) { next(err); })
											.then(function (objectModel) {
												self.Model.ObjectModel = objectModel;

												next();
											});
									},
									// Get data from server
									function (next) {
										// Find the link columns
										var linkCols = self.data.columns.filter(function (col) { return col.linkObject != null }),
											linkColNames = $.map(linkCols, function (col) { return col.name; });

										self.Model.ObjectModel.store = {}; // Clear CanJS local repository
										self.Model.ObjectModel.Cached.findAll({})
											.fail(function (err) { next(err); })
											.then(function (data) {
												self.controllers.ObjectDataTable.populateData(data).then(function () {
													next();
												});
											});
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
									$$(self.webixUiId.editHeaderPopup).registerDataTable($$(self.webixUiId.objectDatatable));

									// Listen popup events
									self.attachPopupEvents();

									// Bind columns data
									self.refreshPopupData();

									// Show 'Add new row' button
									$$(self.webixUiId.addNewRowButton).show();

									// Register add new column callback
									$$(self.webixUiId.addFieldsPopup).registerSaveFieldEvent(function (columnInfo) {

										$$(self.webixUiId.objectDatatable).showProgress({ type: 'icon' });

										var newColumn = {
											object: self.data.objectId,
											name: columnInfo.name,
											label: columnInfo.label,
											fieldName: columnInfo.fieldName,
											type: columnInfo.type,
											setting: columnInfo.setting,
											weight: columnInfo.weight
										};

										if (columnInfo.supportMultilingual != null)
											newColumn.supportMultilingual = columnInfo.supportMultilingual ? true : false;

										if (columnInfo.default)
											newColumn.default = columnInfo.default;
										else
											delete newColumn.default;

										// Link column
										if (columnInfo.linkTypeTo && columnInfo.linkTypeFrom && columnInfo.linkObject) {
											newColumn.linkType = columnInfo.linkTypeTo;
											newColumn.linkObject = columnInfo.linkObject;
											newColumn.linkDefault = true;
											newColumn.setting.linkViaType = columnInfo.linkTypeFrom;
										}

										// Get deferred when save complete
										var refreshDeferred = self.refreshColumnsDeferred(columnInfo),
											objectName = self.data.object.attr('name');

										if (columnInfo.id && !columnInfo.id.toString().startsWith('temp')) { // Update
											var updateColumn = $.grep(self.data.columns, function (col) { return col.id == columnInfo.id; })[0];

											for (var key in newColumn) {
												updateColumn.attr(key, newColumn[key]);
											}

											updateColumn.setting.attr('linkViaType', columnInfo.linkTypeFrom);

											async.series([
												// Update the column
												function (next) {
													updateColumn.save()
														.fail(function (err) { next(err); })
														.then(function (result) {
															updateColumn = result;
															next();
														});
												},
												// Update the link column
												function (next) {
													if (updateColumn.linkVia) {
														self.Model.ABColumn.findOne({ id: updateColumn.linkVia.id })
															.fail(next)
															.then(function (result) {
																result.attr('linkType', columnInfo.linkTypeFrom);
																result.setting.attr('linkViaType', columnInfo.linkTypeTo);

																result.save().fail(next).then(function () {
																	next();
																});
															});
													}
													else {
														next();
													}
												}
											], function (err) {
												if (err) {
													refreshDeferred.reject(err);
													return;
												}

												refreshDeferred.resolve(updateColumn);
											});
										}
										else { // Cache new field
											async.waterfall([
												function (ok) {
													if (columnInfo.id)
														newColumn.id = columnInfo.id;
													self.cacheNewField(objectName, newColumn)
														.fail(ok)
														.then(function (firstColumn) { ok(null, firstColumn) });
												},
												function (firstColumn, ok) {
													if (firstColumn.linkType && firstColumn.linkObject && firstColumn.linkDefault) {
														// Find object
														var linkObj = self.data.objectList.filter(function (obj) { return obj.id == firstColumn.linkObject; })[0];

														// Create linked column
														var secondColumn = {
															object: firstColumn.linkObject,
															name: self.data.object.label,
															label: self.data.object.label,
															type: firstColumn.type,
															setting: $.extend(true, {}, firstColumn.setting),
															linkType: columnInfo.linkTypeFrom,
															linkObject: self.data.object.id,
															linkVia: firstColumn.id,
															linkDefault: false
														};

														if (firstColumn.linkVia)
															secondColumn.id = firstColumn.linkVia;
														secondColumn.setting.linkViaType = columnInfo.linkTypeTo;

														// Cache
														self.cacheNewField(linkObj.name, secondColumn)
															.fail(ok)
															.then(function (result) {
																// Set linkVia to first column
																firstColumn.linkVia = result.id;

																// Update firstColumn cache
																self.cacheNewField(objectName, firstColumn)
																	.fail(ok)
																	.then(function () { ok(); });
															});
													}
													else {
														ok();
													}
												}
											], function (err) {
												if (err) {
													refreshDeferred.reject(err);
													return;
												}
												refreshDeferred.resolve(newColumn);
											});
										}

										return refreshDeferred;
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

										$$(self.webixUiId.objectDatatable).showProgress({ type: 'icon' });

										var currentObject = self.data.objectList.filter(function (o) {
											return o.id == self.data.objectId;
										})[0];

										currentObject.attr('labelFormat', labelFormat);

										currentObject.save()
											.fail(function (err) {
												$$(self.webixUiId.objectDatatable).hideProgress();
											})
											.then(function () {
												$$(self.webixUiId.defineLabelPopup).hide();

												$$(self.webixUiId.objectDatatable).hideProgress();
											});
									});

									$$(self.webixUiId.addFieldsPopup).registerCreateNewObjectEvent(function () {
										$$('ab-object-add-new-popup').define('selectNewObject', false);
										$$('ab-object-add-new-popup').show(); // Mark : show add new object popup in ObjectList page
									});

									$$(self.webixUiId.objectDatatable).hideProgress();

								});
							}
							else {
								$$(self.webixUiId.objectDatatable).hideProgress();
								$$(self.webixUiId.objectDatatable).hide();
							}

						},

						cacheNewField: function (objectName, newColumn) {
							var q = AD.sal.Deferred(),
								self = this;

							self.controllers.ModelCreator.getModel(objectName)
								.fail(function (err) { q.reject(err); })
								.then(function (objectModel) {
									// Cache new field
									var cacheCol = objectModel.Cached.cacheNewField(newColumn);

									// Add new describe to object model
									objectModel.describe()[cacheCol.name] = cacheCol.type;

									// Add multilingual field to object model
									if (cacheCol.supportMultilingual)
										objectModel.multilingualFields.push(cacheCol.name);

									q.resolve(cacheCol);
								});

							return q;
						},

						setObjectList: function (objectList) {
							var self = this;

							self.data.objectList = objectList;

							self.controllers.ObjectDataTable.setObjectList(objectList);

							var enableConnectObjects = self.data.objectList.filter(function (o) {
								return o.id != self.data.objectId;
							});
							$$(self.webixUiId.addFieldsPopup).setObjectList(enableConnectObjects);
						},

						deleteObject: function (obj) {
							var self = this;

							self.controllers.ModelCreator.getModel(obj.attr('name'))
								.fail(function (err) {
									// TODO : Error message
								})
								.then(function (objectModel) {
									if (objectModel && objectModel.Cached) {
										// Clear columns info cache
										objectModel.Cached.clearCacheFields();

										// Clear cache data
										objectModel.Cached.cacheClear();
									}
								});
						},

						updateRowData: function (state, editor, ignoreUpdate) {
							var self = this,
								q = $.Deferred();

							$$(self.webixUiId.objectDatatable).unselectAll();

							if (state.value === state.old || ignoreUpdate) {
								q.reject();
								return q;
							}

							$$(self.webixUiId.objectDatatable).showProgress({ type: 'icon' });

							var item = $$(self.webixUiId.objectDatatable).getItem(editor.row);

							var updateModel = {};
							updateModel[editor.column] = state.value;

							self.Model.ObjectModel.Cached.findOne({ id: item.id })
								.fail(function (err) {
									q.reject(err);
								})
								.then(function (result) {
									result.attr(editor.column, state.value, true);

									result.save()
										.fail(function (err) {
											q.reject(err);
										})
										.then(function (result) {
											if (result.translate) result.translate();

											q.resolve(result);
										});
								});

							return q;
						},

						bindColumns: function (resetColumns, addTrashColumn) {
							var self = this,
								q = $.Deferred();

							if (!self.data.object) {
								q.resolve();
								return;
							}

							var objectName = self.data.object.attr('name');

							self.controllers.ModelCreator.getModel(objectName)
								.fail(function (err) { q.reject(err); })
								.then(function (objectModel) {
									var columns = self.data.columns.attr().slice(), // Copy
										newFields = objectModel.Cached.getNewFields();

									newFields.forEach(function (f) {
										f.isNew = true;

										// Add new describe to object model
										objectModel.describe()[f.name] = f.type;

										// Add multilingual field to object model
										if (f.supportMultilingual)
											objectModel.multilingualFields.push(f.name);

										if (f.setting.editor === 'richselect') {
											f.setting.options = $.map(f.setting.filter_options, function (opt) {
												return {
													dataId: 'temp' + webix.uid(),
													id: opt.replace(/ /g, '_'),
													label: opt
												};
											});
										}
									});

									// Merge exists columns with cache fields
									columns = columns.concat(newFields);

									self.controllers.ObjectDataTable.bindColumns(columns, resetColumns, addTrashColumn);

									q.resolve();
								});

							return q;
						},

						refreshColumnsDeferred: function (columnInfo) {
							var self = this,
								q = $.Deferred();

							q.fail(function (err) {
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
										// Find key of option list
										function (cb) {
											if (columnInfo.options && columnInfo.options.length > 0) {
												self.Model.ABObject.findOne({ id: self.data.objectId })
													.fail(function (err) { cb(err); })
													.then(function (obj) {
														list_key = self.Model.ABList.getKey(obj.application.name, obj.name, data.name);

														cb();
													});
											}
											else {
												cb();
											}
										},
										// Delete options list data
										function (cb) {
											if (columnInfo.removedOptionIds && columnInfo.removedOptionIds.length > 0) {
												var deleteListEvents = [];

												columnInfo.removedOptionIds.forEach(function (id) {
													deleteListEvents.push(function (next) {
														self.Model.ABList.destroy(id)
															.fail(function (err) { next(err); })
															.then(function () { next(); });
													});
												});

												AD.util.async.parallel(deleteListEvents, function (err) {
													if (err) {
														cb(err);
													}
													else {
														delete columnInfo.removedOptionIds;
														cb();
													}
												});
											}
											else {
												cb();
											}
										},
										// Popuplate options list data
										function (cb) {
											if (columnInfo.options && columnInfo.options.length > 0) {
												var createListEvents = [];

												columnInfo.options.forEach(function (opt, index) {
													createListEvents.push(function (next) {

														if (opt.dataId && typeof opt.dataId !== 'string') { // Update
															self.Model.ABList.findOne({ id: opt.dataId })
																.fail(function (err) { next(err) })
																.then(function (li) {
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
														}
														else {
															if (columnInfo.options && columnInfo.options.length > 0) {
																list_options = $.map(columnInfo.options, function (opt) {
																	return {
																		id: opt.dataId,
																		value: opt.id,
																		label: opt.value
																	};
																});
															}

															next();
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
										columnInfo.isNew = (columnInfo.id === null || typeof columnInfo.id === 'undefined' || (typeof columnInfo.id === 'string' && columnInfo.id.startsWith('temp')));

										var addColumnHeader = $.extend(columnInfo.setting, {
											id: data.name,
											dataId: data.id,
											header: self.controllers.ObjectDataTable.getHeader(columnInfo)
										});

										if (list_options && list_options.length > 0) {
											list_options.sort(function (a, b) { return a.weight - b.weight; });

											if (data.setting.attr)
												data.setting.attr('options', list_options);
											else
												data.setting.options = list_options;

											addColumnHeader.options = $.map(list_options, function (opt) {
												return {
													dataId: opt.id,
													id: opt.value,
													value: opt.label
												};
											});
										}

										addColumnHeader.width = self.controllers.ObjectDataTable.calculateColumnWidth(data);

										// Update objectList.columns data
										var object = self.data.objectList.filter(function (o) { return o.id == self.data.objectId; });
										if (object && object.length > 0) {
											var existsColumnData = $.grep(object[0].columns, function (c) { return c.id == data.id; });
											if (existsColumnData && existsColumnData.length > 0) { // Update
												for (var i = 0; i < object[0].columns.length; i++) {
													if (object[0].columns[i].dataId == data.id) {
														object[0].columns[i] = data;
													}
												}
											} else { // Add 
												object[0].columns.push(data);
											}
										}

										// Update columns data
										var existsColumnData = $.grep(self.data.columns, function (c) { return c.id == data.id; });
										if (existsColumnData && existsColumnData.length > 0) { // Update
											for (var i = 0; i < self.data.columns.length; i++) {
												if (self.data.columns[i].id == data.id) {
													self.data.columns[i] = data;
												}
											}
										} else { // Add 
											self.data.columns.push(data);
										}

										// Update columns UI
										var columns = $$(self.webixUiId.objectDatatable).config.columns;
										var existsColumn = $.grep(columns, function (c) { return c.dataId == data.id; });
										if (existsColumn && existsColumn.length > 0) { // Update
											for (var i = 0; i < columns.length; i++) {
												if (columns[i].dataId == data.id) {
													columns[i] = addColumnHeader;
												}
											}
										} else { // Add 
											var index = columns.length > 0 ? columns.length - 1 : 0; // Before trash column
											columns.splice(index, 0, addColumnHeader);
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

							return q;
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
								var columns = self.data.columns.attr ? self.data.columns.attr() : self.data.columns;
								columns.sort(function (a, b) { return a.weight - b.weight; });

								$$(self.webixUiId.visibleFieldsPopup).setFieldList(columns);
								$$(self.webixUiId.filterFieldsPopup).setFieldList(columns);
								$$(self.webixUiId.sortFieldsPopup).setFieldList(columns);
								$$(self.webixUiId.frozenColumnsPopup).setFieldList(columns);
								$$(self.webixUiId.defineLabelPopup).setFieldList(columns);
							}

							$$(self.webixUiId.visibleFieldsPopup).bindFieldList();
							$$(self.webixUiId.filterFieldsPopup).refreshFieldList();
							$$(self.webixUiId.sortFieldsPopup).refreshFieldList();
							$$(self.webixUiId.frozenColumnsPopup).bindFieldList();
							$$(self.webixUiId.defineLabelPopup).bindFieldList();
						},

						attachPopupEvents: function () {
							var self = this;

							$$(self.webixUiId.visibleFieldsPopup).attachEvent('onChange', function (num) {
								$$(self.webixUiId.visibleButton).define('badge', num);
								$$(self.webixUiId.visibleButton).refresh();
							});
							$$(self.webixUiId.filterFieldsPopup).attachEvent('onChange', function (num) {
								$$(self.webixUiId.filterButton).define('badge', num);
								$$(self.webixUiId.filterButton).refresh();
							});
							$$(self.webixUiId.sortFieldsPopup).attachEvent('onChange', function (num) {
								$$(self.webixUiId.sortButton).define('badge', num);
								$$(self.webixUiId.sortButton).refresh();
							});
							$$(self.webixUiId.frozenColumnsPopup).attachEvent('onChange', function (num) {
								$$(self.webixUiId.frozenButton).define('badge', num);
								$$(self.webixUiId.frozenButton).refresh();
							});
						},

						reorderColumns: function () {
							var self = this,
								columns = [], // [{ columnId: , index: }, ..., {}]
								cachedFields = [];

							$$(self.webixUiId.objectDatatable).showProgress({ type: 'icon' });

							async.series([
								// Find cached columns
								function (callback) {
									self.controllers.ModelCreator.getModel(self.data.object.attr('name'))
										.fail(callback)
										.then(function (result) {
											cachedFields = result.Cached.getNewFields();

											callback();
										});
								},
								// Set columns data to list
								function (callback) {
									$$(self.webixUiId.objectDatatable).eachColumn(function (columnName) {
										var col = self.data.columns.filter(function (c) { return c.name == columnName }),
											colIndex = $$(self.webixUiId.objectDatatable).getColumnIndex(columnName);

										// Add columns to list
										if (col && col.length > 0) {
											col[0].attr('weight', colIndex);

											if (typeof col[0].id !== 'string') {
												columns.push({
													columnId: col[0].id,
													index: colIndex
												});
											}
										}

										// Add cached columns to list
										var cachedCol = cachedFields.filter(function (col) { return col.name == columnName; });
										if (cachedCol && cachedCol.length > 0)
											cachedCol[0].weight = colIndex;
									}, true);

									callback();
								},
								// Update columns data
								function (callback) {
									async.parallel([
										// Update cached columns
										function (next) {
											if (cachedFields && cachedFields.length > 0) {
												var updateCachedColTasks = [];

												cachedFields.forEach(function (col) {
													updateCachedColTasks.push(function (ok) {
														self.cacheNewField(self.data.object.attr('name'), col)
															.fail(ok).then(function () { ok(); });
													});
												});

												async.parallel(updateCachedColTasks, next);
											}
											else {
												next();
											}
										},
										// Update data to server
										function (next) {
											if (columns && columns.length > 0) {
												self.Model.ABObject.sortColumns(self.data.objectId, columns, function (err, result) {
													if (err) {
														next(err);
														return;
													}

													self.refreshPopupData();

													next();
												});
											}
											else {
												next();
											}
										}
									], callback);
								}
							], function (err) {
								$$(self.webixUiId.objectDatatable).hideProgress();
							});
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
							$$(self.webixUiId.objectDatatable).refreshColumns([], true);
							$$(self.webixUiId.objectDatatable).clearAll();
							$$(self.webixUiId.objectDatatable).refresh();
							// $$(self.webixUiId.objectDatatable).hide();

							$$(self.webixUiId.addNewRowButton).hide();

							self.refreshPopupData();
						},

						resize: function (height) {
							var self = this;

							if ($$(self.webixUiId.objectDatatable)) {
								$$(self.webixUiId.objectDatatable).define("height", height - 185);
								$$(self.webixUiId.objectDatatable).resize();
							}
						}

					});

				});
		});

	});