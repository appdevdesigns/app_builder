
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
							this.initModelCache();
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

								ObjectDataTable = AD.Control.get('opstools.BuildApp.ObjectDataTable'),
								ModelCreator = AD.Control.get('opstools.BuildApp.ModelCreator'),
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

								ObjectDataTable: new ObjectDataTable(self.element, { changedSelectivityEvent: self.options.changedSelectivityEvent }),
								ModelCreator: new ModelCreator(),
								SelectivityHelper: new SelectivityHelper()
							};
						},

						initModelCache: function () {
							var self = this;

							System.import('can').then(function () {
								steal.import('can/model/model', 'can/util/object/object').then(function () {

									self.controllers.ModelCreator.initModelCached(self.Model.ABColumn, 'ab_column_info_cache');
								});
							});
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
														return o.id === columnData.linkToObject;
													});

													if (!object || object.length < 1)
														return false;

													$$(self.webixUiId.addConnectObjectDataPopup).open(object[0], selectedIds, columnData.isMultipleRecords);

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
													.fail(function (err) {
														item[editor.column] = state.old;
														$$(self.webixUiId.objectDatatable).updateItem(editor.row, item);
														$$(self.webixUiId.objectDatatable).refresh(editor.row);

														// TODO : Message

														$$(self.webixUiId.objectDatatable).hideProgress();
													})
													.then(function (result) {
														item[editor.column] = state.value;
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
								if (ev.removed) {
									// Delete removed value
									data.itemData.forEach(function (id, index) {
										if (id == ev.removed.id)
											data.itemData.splice(index, 1);
									});

									// Delete selectivity value
									if (data.item.connectedData && data.item.connectedData[data.columnId].length > 0) {
										data.item.connectedData[data.columnId].forEach(function (obj, index) {
											if (obj.id == ev.removed.id)
												data.item.connectedData[data.columnId].splice(index, 1);
										});
									}

									// Update connected data to cached item
									self.Model.ObjectModel.Cached.findOne({ id: data.rowId }, true)
										.then(function (cacheItem) {
											cacheItem.attr('connectedData', data.item.connectedData);
											cacheItem.updated({ connectedData: data.item.connectedData });
										});


									$$(self.webixUiId.objectDatatable).updateItem(data.rowId, data.item);

									if (!data.itemData || data.itemData.length < 1) data.itemData = '';

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

										$$(self.webixUiId.addFieldsPopup).show(itemNode);
										$$(self.webixUiId.addFieldsPopup).editMode(selectedColumn, selectedColumn.label);
										break;
									case self.labels.object.deleteField:
										// Validate
										if (self.data.columns.length < 2) {
											webix.alert({
												title: self.labels.object.couldNotDeleteField,
												ok: self.labels.common.ok,
												text: self.labels.object.atLeastOneField
											});
											$$(self.webixUiId.editHeaderPopup).hide();
											return;
										}

										var selectedColumn = $.grep(self.data.columns.attr(), function (c) { return c.id == headerField.dataId; })[0];

										webix.confirm({
											title: self.labels.object.confirmDeleteTitle,
											ok: self.labels.common.yes,
											cancel: self.labels.common.no,
											text: self.labels.object.confirmDeleteMessage.replace('{0}', selectedColumn.label),
											callback: function (result) {
												if (result) {
													$$(self.webixUiId.objectDatatable).showProgress({ type: "icon" });

													// Call server to delete field data
													self.Model.ABColumn.Cached.destroy(headerField.dataId)
														.fail(function (err) {
															$$(self.webixUiId.objectDatatable).hideProgress();

															webix.message({
																type: "error",
																text: self.labels.common.deleteErrorMessage.replace('{0}', selectedColumn.label)
															});

															AD.error.log('Column list : Error delete column', { error: err });
														})
														.then(function (data) {
															var objectName = self.data.object.attr('name');

															// Delete cache
															self.controllers.ModelCreator.deleteColumn(objectName, data.name);

															// Remove column
															self.data.columns.forEach(function (c, index) {
																if (c.name == headerField.id) {
																	self.data.columns.splice(index, 1);
																	return false;
																}
															});

															// Remove describe to object model
															self.controllers.ModelCreator.getModel(objectName)
																.fail(function (err) { next(err); })
																.then(function (objectModel) {
																	delete objectModel.describe()[data.name];
																});

															self.controllers.ObjectDataTable.bindColumns(self.data.columns, false, true);

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
														});
												}

											}
										});

										break;
								}
							});

							// Connect data popup
							$$(self.webixUiId.addConnectObjectDataPopup).registerSelectChangeEvent(function (selectedItems) {
								self.controllers.SelectivityHelper.setData(self.getCurSelectivityNode(), selectedItems);
							});
							$$(self.webixUiId.addConnectObjectDataPopup).registerCloseEvent(function (selectedItems) {
								$$(self.webixUiId.objectDatatable).showProgress({ type: 'icon' });

								var selectedIds = '';

								if (selectedItems && selectedItems.length > 0)
									selectedIds = $.map(selectedItems, function (item) { return item.id; });

								self.updateRowData(
									{ value: selectedIds }, // state
									{ // editor
										row: self.data.selectedCell.row,
										column: self.data.selectedCell.column
									},
									false)
									.then(function (result) {
										var rowData = $$(self.webixUiId.objectDatatable).getItem(self.data.selectedCell.row);
										if (!rowData.connectedData) rowData.connectedData = {};

										rowData[self.data.selectedCell.column] = selectedIds;
										rowData.connectedData[self.data.selectedCell.column] = selectedItems;

										$$(self.webixUiId.objectDatatable).updateItem(self.data.selectedCell.row, rowData);

										// Update connected data to cached item
										self.Model.ObjectModel.Cached.findOne({ id: self.data.selectedCell.row }, true)
											.then(function (item) {
												item.attr('connectedData', rowData.connectedData);
												item.updated({ connectedData: rowData.connectedData });
											});

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

							// Set enable connect object list to the add new column popup
							var enableConnectObjects = self.data.objectList.filter(function (o) {
								return o.id != self.data.objectId;
							});
							$$(self.webixUiId.addFieldsPopup).setObjectList(enableConnectObjects);

							if (self.data.objectId) {
								var curObject = self.data.objectList.filter(function (o) { return o.id == self.data.objectId; });
								self.data.object = curObject[0];

								async.series([
									function (next) {
										$$(self.webixUiId.objectDatatable).clearAll();

										// Get columns from server
										self.Model.ABColumn.Cached.findAll({ object: self.data.objectId })
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
															self.Model.ABList.findAll({ column: cId })
																.fail(function (err) { cb(err); })
																.then(function (listResult) {

																	listResult.forEach(function (listItem) {
																		if (listItem.translate) listItem.translate();
																	});

																	var col = self.data.columns.filter(function (col) { return col.id == cId; })[0];

																	col.setting.attr('options', listResult.attr().sort(function (a, b) { return a.weight - b.weight; }));

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
										self.controllers.ObjectDataTable.bindColumns(self.data.columns, true, true);

										next();
									},
									function (next) {
										// Get object model
										self.controllers.ModelCreator.getModel(self.data.object.attr('name'))
											.fail(function (err) { next(err); })
											.then(function (objectModel) {
												self.Model.ObjectModel = objectModel;

												self.Model.ObjectModel.Cached.unbind('refreshData');
												self.Model.ObjectModel.Cached.bind('refreshData', function (ev, data) {
													if (this == self.Model.ObjectModel.Cached)
														self.controllers.ObjectDataTable.populateDataToDataTable(data.result);
												});

												next();
											});
									},
									function (next) {

										// Get data from server
										self.Model.ObjectModel.Cached.findAll({})
											.fail(function (err) { next(err); })
											.then(function (result) {
												self.controllers.ObjectDataTable.populateDataToDataTable(result).then(function () {
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
									$$(self.webixUiId.addFieldsPopup).registerSaveFieldEvent(function (columnInfo, removedListId) {

										$$(self.webixUiId.objectDatatable).showProgress({ type: 'icon' });

										columnInfo.label = columnInfo.name;

										var newColumn = {
											object: self.data.objectId,
											name: columnInfo.name,
											label: columnInfo.label,
											type: columnInfo.type,
											setting: columnInfo.setting,
											weight: columnInfo.weight
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
										var saveDeferred = self.getSaveColumnDeferred(columnInfo, removedListId),
											objectName = self.data.object.attr('name');

										if (columnInfo.id) { // Update
											var updateColumn = $.grep(self.data.columns, function (col) { return col.id == columnInfo.id; })[0];

											for (var key in newColumn) {
												updateColumn.attr(key, newColumn[key]);
											}

											updateColumn.save()
												.fail(function (err) { saveDeferred.reject(err); })
												.then(function (data) { saveDeferred.resolve(data); });
										}
										else { // Add new
											self.Model.ABColumn.Cached.create(newColumn)
												.fail(function (err) { saveDeferred.reject(err); })
												.then(function (data) {
													if (data.translate) data.translate();

													// Cache 
													self.Model.ABColumn.Cached.model(data).created(data);

													async.parallel([
														function (next) {
															// Save new columns name to cache
															self.controllers.ModelCreator.addNewColumn(objectName, data.name)
																.fail(function (err) { next(err); })
																.then(function () { next(); });
														},
														function (next) {
															// Add new describe to object model
															self.controllers.ModelCreator.getModel(objectName)
																.fail(function (err) { next(err); })
																.then(function (objectModel) {
																	objectModel.describe()[data.name] = data.type;
																	next();
																});
														}
													], function (err) {
														if (err)
															saveDeferred.reject(err);
														else
															saveDeferred.resolve(data);
													});

												});
										}

										return saveDeferred;
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

							// Clear columns info cache
							var cachedColumns = self.Model.ABColumn.Cached.findAllCached({ object: obj.attr('id') });
							if (cachedColumns && cachedColumns.length > 0) {
								cachedColumns = self.Model.ABColumn.Cached.models(cachedColumns); // Convert to cache model
								cachedColumns.forEach(function (col) {
									col.destroyed();
								});
							}

							self.controllers.ModelCreator.getModel(obj.attr('name'))
								.fail(function (err) {
									// TODO : Error message
								})
								.then(function (objectModel) {
									if (objectModel && objectModel.Cached)
										objectModel.Cached.cacheClear(); // Clear cache data
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

										var addColumnHeader = $.extend(columnInfo.setting, {
											id: data.name,
											dataId: data.id,
											header: self.controllers.ObjectDataTable.getHeader(columnInfo)
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

										addColumnHeader.width = self.controllers.ObjectDataTable.calculateColumnWidth(data);

										// Update objectList.columns data
										var object = self.data.objectList.filter(function (o) { return o.id === self.data.objectId; });
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

						reorderColumns: function () {
							var self = this;

							$$(self.webixUiId.objectDatatable).showProgress({ type: 'icon' });

							var columnIndexes = [];

							$$(self.webixUiId.objectDatatable).eachColumn(function (columnName) {
								var col = self.data.columns.filter(function (c) { return c.name == columnName });

								if (col && col.length > 0) {
									col[0].attr('weight', $$(self.webixUiId.objectDatatable).getColumnIndex(columnName));

									columnIndexes.push({
										columnId: col[0].id,
										index: col[0].weight
									});

								}
							}, true);

							self.Model.ABObject.sortColumns(self.data.objectId, columnIndexes, function (err, result) {
								if (err) {
									// TODO : show error message
									return;
								}

								self.refreshPopupData();

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
							$$(self.webixUiId.objectDatatable).clearAll();
							$$(self.webixUiId.objectDatatable).refresh();
							$$(self.webixUiId.objectDatatable).refreshColumns([], true);
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