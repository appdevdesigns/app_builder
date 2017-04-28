steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/data_fields/dataFieldsManager.js',

	'opstools/BuildApp/controllers/utils/ModelCreator.js',
	'opstools/BuildApp/controllers/utils/DataHelper.js',
	'opstools/BuildApp/controllers/utils/ModelCached.js',
	'opstools/BuildApp/controllers/utils/ObjectDataTable.js',

	'opstools/BuildApp/controllers/webix_custom_components/ActiveList.js',
	'opstools/BuildApp/controllers/webix_custom_components/DataTableEditor.js',
	'opstools/BuildApp/controllers/webix_custom_components/DataTableVisibleFieldsPopup.js',
	'opstools/BuildApp/controllers/webix_custom_components/DataTableFilterPopup.js',
	'opstools/BuildApp/controllers/webix_custom_components/DataTableSortFieldsPopup.js',
	'opstools/BuildApp/controllers/webix_custom_components/DataTableFrozenColumnPopup.js',
	'opstools/BuildApp/controllers/webix_custom_components/DataTableDefineLabelPopup.js',
	'opstools/BuildApp/controllers/webix_custom_components/DataTableAddFieldPopup.js',
	'opstools/BuildApp/controllers/webix_custom_components/ExportDataPopup.js',

	'opstools/BuildApp/controllers/webix_custom_components/DataTableEditHeaderPopup.js',

	'opstools/BuildApp/models/ABColumn.js',
	'opstools/BuildApp/models/ABList.js',
	function (dataFieldsManager, modelCreator, dataHelper) {
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
								ABColumn: AD.Model.get('opstools.BuildApp.ABColumn'),
								ABList: AD.Model.get('opstools.BuildApp.ABList')
							};

							this.data = {};
							this.eventIds = {};

							this.webixUiId = {
								objectToolbar: 'ab-object-toolbar',
								objectDatatable: 'ab-object-datatable',

								visibleButton: 'ab-visible-fields-toolbar',
								filterButton: 'ab-filter-fields-toolbar',
								sortButton: 'ab-sort-fields-toolbar',
								frozenButton: 'ab-frozen-columns-toolbar',
								defineLabelButton: 'ab-define-label-toolbar',
								addFieldsButton: 'ab-add-fields-button',
								exportButton: 'ab-add-export-button',

								addNewRowButton: 'ab-add-new-row-button',

								editHeaderPopup: 'ab-edit-header-popup',

								visibleFieldsPopup: 'ab-visible-fields-popup',
								filterFieldsPopup: 'ab-filter-popup',
								sortFieldsPopup: 'ab-sort-popup',
								frozenColumnsPopup: 'ab-frozen-popup',
								defineLabelPopup: 'ab-define-label-popup',
								addFieldsPopup: 'ab-add-fields-popup',
								exportDataPopup: 'ab-export-data-popup'
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
							self.labels.common.saveErrorMessage = AD.lang.label.getLabel('ab.common.save.error') || "System could not save <b>{0}</b>.";
							self.labels.common.saveSuccessMessage = AD.lang.label.getLabel('ab.common.save.success') || "<b>{0}</b> is saved.";
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
							self.labels.object.toolbar.export = AD.lang.label.getLabel('ab.object.toolbar.export') || "Export";
						},

						initControllers: function () {
							var self = this;

							self.controllers = {};

							var ObjectDataTable = AD.Control.get('opstools.BuildApp.ObjectDataTable');

							self.controllers = {
								ObjectDataTable: new ObjectDataTable(self.element, { changedSelectivityEvent: self.options.changedSelectivityEvent })
							};
						},

						initWebixUI: function () {
							var self = this;

							webix.ui({
								id: self.webixUiId.visibleFieldsPopup,
								view: "visible_fields_popup"
							});

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
								id: self.webixUiId.exportDataPopup,
								view: "export_data_popup",
							});

							self.data.definition = {
								rows: [
									{
										view: 'toolbar',
										id: self.webixUiId.objectToolbar,
										hidden: true,
										cols: [
											{ view: "button", label: self.labels.object.toolbar.hideFields, popup: self.webixUiId.visibleFieldsPopup, id: self.webixUiId.visibleButton, icon: "columns", type: "icon", width: 120, badge: 0 },
											{
												view: 'button', label: self.labels.object.toolbar.filterFields, id: self.webixUiId.filterButton, icon: "filter", type: "icon", width: 120, badge: 0,
												click: function () {
													self.refreshPopupData();
													$$(self.webixUiId.filterFieldsPopup).show(this.$view);
												}
											},
											{
												view: 'button', label: self.labels.object.toolbar.sortFields, id: self.webixUiId.sortButton, icon: "sort", type: "icon", width: 120, badge: 0,
												click: function () {
													self.refreshPopupData();
													$$(self.webixUiId.sortFieldsPopup).show(this.$view);
												}
											},
											{ view: 'button', label: self.labels.object.toolbar.frozenColumns, popup: self.webixUiId.frozenColumnsPopup, id: self.webixUiId.frozenButton, icon: "table", type: "icon", width: 150, badge: 0 },
											{ view: 'button', label: self.labels.object.toolbar.defineLabel, popup: self.webixUiId.defineLabelPopup, id: self.webixUiId.defineLabelButton, icon: "newspaper-o", type: "icon", width: 130 },
											{ view: 'button', label: self.labels.object.toolbar.permission, icon: "lock", type: "icon", width: 120 },
											{ view: 'button', id: self.webixUiId.addFieldsButton, label: self.labels.object.toolbar.addFields, popup: self.webixUiId.addFieldsPopup, icon: "plus", type: "icon", width: 150 },
											{ view: 'button', id: self.webixUiId.exportButton, label: self.labels.object.toolbar.export, popup: self.webixUiId.exportDataPopup, icon: "file-o", type: "icon", width: 90 }
										]
									},
									{
										view: "datatable",
										id: self.webixUiId.objectDatatable,
										resizeColumn: true,
										resizeRow: true,
										prerender: false,
										editable: true,
										fixedRowHeight: false,
										editaction: "custom",
										select: "cell",
										dragColumn: true,
										on: {
											onBeforeSelect: function (data, preserve) {

												var itemNode = this.getItemNode({ row: data.row, column: data.column });

												var column = AD.classes.AppBuilder.currApp.currObj.columns.filter(function (col) { return col.name == data.column; });
												if (!column || column.length < 1) {
													console.log('System could not found this column data');
													return false;
												} else
													column = column[0];

												return dataFieldsManager.customEdit(AD.classes.AppBuilder.currApp, AD.classes.AppBuilder.currApp.currObj, column, data.row, itemNode);
											},
											onAfterSelect: function (data, prevent) {
												var columnConfig = $$(self.webixUiId.objectDatatable).getColumnConfig(data.column),
													fieldData = AD.classes.AppBuilder.currApp.currObj.columns.filter(function (col) { return col.name == data.column; });

												if (!fieldData || fieldData.length < 1) {
													console.log('System could not found this column data');
													return false;
												} else
													fieldData = fieldData[0];

												// Custom update data
												if (dataFieldsManager.hasCustomEdit(columnConfig.fieldName, fieldData))
													return false;

												// Normal update data
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
											onBeforeEditStop: function (state, editor) {
												var column = AD.classes.AppBuilder.currApp.currObj.columns.filter(function (col) { return col.name == editor.column; });

												if (!column || column.length < 1) return true;
												column = column[0];

												var passValidate = dataFieldsManager.validate(column, state.value);

												if (!passValidate) {
													$$(self.webixUiId.objectDatatable).editCancel();
												}

												return passValidate;
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
														if (item) {
															item[editor.column] = state.value;

															if (result && result.constructor.name === 'Cached' && result.isUnsync())
																item.isUnsync = true;

															$$(self.webixUiId.objectDatatable).updateItem(editor.row, item);
														}

														// TODO : Message

														$$(self.webixUiId.objectDatatable).hideProgress();
													});
											},
											onColumnResize: function (id, newWidth, oldWidth, user_action) {
												var columnConfig = $$(self.webixUiId.objectDatatable).getColumnConfig(id);
												var column = self.data.columns.filter(function (col) { return col.id == columnConfig.dataId; });
												if (column && column[0])
													column[0].setWidth(newWidth);

												// if (typeof columnConfig.template !== 'undefined' && columnConfig.template !== null) {
												// 	// For calculate/refresh row height
												// 	$$(self.webixUiId.objectDatatable).render();
												// }
											},
											onBeforeColumnDrag: function (sourceId, event) {
												if (sourceId === 'appbuilder_trash') // Remove column
													return false;
												else
													return true;
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
													self.addNewRow({});
												}
											}
										]
									}
								]
							};
						},

						initEvents: function () {
							var self = this;

							$(dataFieldsManager).on('update', function (event, result) {
								if (!AD.classes.AppBuilder.currApp || !AD.classes.AppBuilder.currApp.currObj || result.objectId != AD.classes.AppBuilder.currApp.currObj.id || !result.rowId || !result.columnName) return;

								$$(self.webixUiId.objectDatatable).showProgress({ type: 'icon' });

								self.updateRowData(
									{ value: result.data }, // state
									{ // editor
										row: result.rowId,
										column: result.columnName
									},
									false)
									.then(function () {
										// Update row
										var rowData = $$(self.webixUiId.objectDatatable).getItem(result.rowId);
										rowData[result.columnName] = result.displayData || result.data;
										$$(self.webixUiId.objectDatatable).updateItem(result.rowId, rowData);

										// Connect Data: Remove duplicate selected item when the link column supports one value
										var colData = self.data.columns.filter(function (col) { return col.name == result.columnName; })[0];
										if (result.fieldName == 'connectObject' && result.data && colData.setting.linkViaType === 'model') {
											$$(self.webixUiId.objectDatatable).eachRow(function (row) {
												if (row != result.rowId) {
													var otherRow = $$(self.webixUiId.objectDatatable).getItem(row);
													// Filter difference values
													if (otherRow[result.columnName]) {
														// 1:M
														if (otherRow[result.columnName].filter) {
															otherRow[result.columnName] = otherRow[result.columnName].filter(function (i) {
																if (typeof result.data == 'undefined' || result.data == null) return false;

																if (result.data.filter) {
																	return result.data.filter(function (itemId) { return i.id == itemId; }).length < 1;
																}
																else {
																	return i.id != result.data;
																}
															});
														}
														// 1:1
														else if ((otherRow[result.columnName].id || otherRow[result.columnName]) == result.data) {
															otherRow[result.columnName] = null;
														}

														$$(self.webixUiId.objectDatatable).updateItem(row, otherRow);
													}
												}
											});
										}

										// Resize row height
										var itemNode = $$(self.webixUiId.objectDatatable).getItemNode({ row: result.rowId, column: result.columnName }),
											rowHeight = dataFieldsManager.getRowHeight(colData, rowData[result.columnName]);

										if (rowData && (!rowData.$height || rowData.$height < rowHeight))
											$$(self.webixUiId.objectDatatable).setRowHeight(result.rowId, rowHeight);

										$$(self.webixUiId.objectDatatable).hideProgress();
									});
							});
						},

						webix_ready: function () {
							var self = this;

							webix.extend($$(self.webixUiId.objectDatatable), webix.ProgressBar);

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
										self.refreshPopupData();
										$$(self.webixUiId.filterFieldsPopup).addNewFilter(headerField.id);
										$$(self.webixUiId.editHeaderPopup).hide();
										$$(self.webixUiId.filterFieldsPopup).show($$(self.webixUiId.filterButton).getNode());
										break;
									case self.labels.object.sortField:
										self.refreshPopupData();
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

										async.waterfall([
											function (next) {
												var selectedColumn = self.data.columns.filter(function (c) { return c.id == headerField.dataId; })[0];

												webix.confirm({
													title: self.labels.object.confirmDeleteTitle,
													ok: self.labels.common.yes,
													cancel: self.labels.common.no,
													text: self.labels.object.confirmDeleteMessage.replace('{0}', selectedColumn.label),
													callback: function (result) {
														if (!result) return;

														$$(self.webixUiId.objectDatatable).showProgress({ type: "icon" });

														var objectName = AD.classes.AppBuilder.currApp.currObj.attr('name');

														async.parallel([
															// Remove describe & multi-fields of object model
															function (ok) {
																var objectModel = modelCreator.getModel(AD.classes.AppBuilder.currApp, objectName);

																objectModel.Cached.columns.forEach(function (col, index) {
																	if (col.id == headerField.id)
																		objectModel.Cached.columns.splice(index, 1);
																});

																delete objectModel.describe()[headerField.id];

																if (objectModel.multilingualFields) // Remove field
																	objectModel.multilingualFields = objectModel.multilingualFields.filter(function (f) { return f != headerField.id; });

																ok();
															},
															// Remove describe & multi-fields of link object model
															function (ok) {
																if (selectedColumn.setting.linkObject && selectedColumn.setting.linkVia) {
																	var linkObject = AD.classes.AppBuilder.currApp.objects.filter(function (obj) {
																		return obj.id == selectedColumn.setting.linkObject;
																	})[0];

																	if (linkObject == null) return ok();

																	var objectModel = modelCreator.getModel(AD.classes.AppBuilder.currApp, linkObject.name);

																	objectModel.Cached.columns.forEach(function (col, index) {
																		if (col.id == selectedColumn.setting.linkVia)
																			objectModel.Cached.columns.splice(index, 1);
																	});

																	delete objectModel.describe()[selectedColumn.setting.linkVia];

																	if (objectModel.multilingualFields) // Remove link field
																		objectModel.multilingualFields = objectModel.multilingualFields.filter(function (f) { return f != selectedColumn.setting.linkVia; });

																	ok();
																}
																else {
																	ok();
																}
															},
															// Call server to delete field data
															function (ok) {
																selectedColumn.destroy().fail(ok)
																	.then(function (data) { ok(); });
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

															self.bindColumns(false, false, true);

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
												});
											}
										]);

										break;
								}
							});
						},



						getUIDefinition: function () {
							return this.data.definition;
						},

						showTable: function () {
							var self = this,
								objectData = [];

							$$(self.webixUiId.objectDatatable).show();
							$$(self.webixUiId.objectDatatable).showProgress({ type: 'icon' });

							self.resetState();

							if (!AD.classes.AppBuilder.currApp.currObj) {
								$$(self.webixUiId.objectDatatable).hideProgress();
								$$(self.webixUiId.objectDatatable).hide();
								return;
							}

							async.series([
								// Get columns data from server
								function (next) {
									$$(self.webixUiId.objectDatatable).clearAll();

									// Hide the edit/delete operations for imported models
									if (AD.classes.AppBuilder.currApp.currObj.attr('isImported')) {
										$$(self.webixUiId.addFieldsButton).hide();
										$$(self.webixUiId.editHeaderPopup).setMenuGroup('imported');
									} else {
										$$(self.webixUiId.addFieldsButton).show();
										$$(self.webixUiId.editHeaderPopup).setMenuGroup('default');
									}


									AD.classes.AppBuilder.currApp.currObj.getColumns()
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
											AD.classes.AppBuilder.currApp.currObj.attr('columns', data);

											// Find option list
											var listColIds = self.data.columns
												.filter(function (col) { return col.fieldName === 'list'; })
												.map(function (col) { return col.id; });

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
																		id: list.id,
																		value: list.label
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
								// Register DataTable
								function (next) {
									self.controllers.ObjectDataTable.registerDataTable(
										AD.classes.AppBuilder.currApp,
										AD.classes.AppBuilder.currApp.currObj,
										self.data.columns,
										$$(self.webixUiId.objectDatatable));

									next();
								},
								// Get object model
								function (next) {
									if (!AD.classes.AppBuilder.currApp.currObj)
										return next();

									self.Model.ObjectModel = modelCreator.getModel(AD.classes.AppBuilder.currApp, AD.classes.AppBuilder.currApp.currObj.attr('name'));
									next();
								},
								// Bind columns to DataTable
								function (next) {
									self.bindColumns(true, false, true);
									next();
								},
								// Get data from server
								function (next) {
									self.Model.ObjectModel.store = {}; // Clear CanJS local repository
									self.Model.ObjectModel.Cached.findAll({})
										.then(function (data) {
											objectData = data;
											next();
										}, function (err) { next(); });
								},
								// Normalize data
								function (next) {
									dataHelper.normalizeData(
										AD.classes.AppBuilder.currApp,
										AD.classes.AppBuilder.currApp.currObj.id,
										AD.classes.AppBuilder.currApp.currObj.columns,
										objectData)
										.fail(next)
										.then(function (result) {
											objectData = result;

											next();
										});
								},
								// Define unsync row data
								function (next) {
									objectData.forEach(function (data) {
										if (data.isUnsync)
											data.attr('isUnsync', data.isUnsync());
									});

									next();
								},
								// Populate date to Grid
								function (next) {
									self.controllers.ObjectDataTable.populateData(objectData);

									next();
								}
							], function () {
								$$(self.webixUiId.objectToolbar).show();
								$$(self.webixUiId.objectDatatable).show();
								// $$(self.webixUiId.objectDatatable).refresh();

								// Register table to popups
								$$(self.webixUiId.visibleFieldsPopup).registerDataTable($$(self.webixUiId.objectDatatable));
								$$(self.webixUiId.frozenColumnsPopup).registerDataTable($$(self.webixUiId.objectDatatable));
								$$(self.webixUiId.addFieldsPopup).registerDataTable($$(self.webixUiId.objectDatatable));
								$$(self.webixUiId.editHeaderPopup).registerDataTable($$(self.webixUiId.objectDatatable));
								$$(self.webixUiId.exportDataPopup).registerDataTable($$(self.webixUiId.objectDatatable));

								// Listen popup events
								self.attachPopupEvents();

								// Bind columns data
								self.refreshPopupData();

								// Show 'Add new row' button
								$$(self.webixUiId.addNewRowButton).show();

								// Register add new column callback
								$$(self.webixUiId.addFieldsPopup).registerSaveFieldEvent(function (fieldType, columnInfo) {

									$$(self.webixUiId.objectDatatable).showProgress({ type: 'icon' });

									// Get deferred when save complete
									var q = $.Deferred(),
										updateColumn,
										updateTargetColumn;

									async.series([
										// Update the column
										function (next) {
											if (columnInfo.id) { // Update
												updateColumn = $.grep(self.data.columns, function (col) { return col.id == columnInfo.id; })[0];

												for (var key in columnInfo) {
													if (key != 'id' && key != 'name')
														updateColumn.attr(key, columnInfo[key]);
												}

												updateColumn.save()
													.fail(function (err) { next(err); })
													.then(function (result) {
														updateColumn = result;
														next();
													});
											}
											else { // Create
												if (fieldType === 'connectObject') {
													AD.classes.AppBuilder.currApp.currObj.createLink(
														columnInfo.name,
														columnInfo.setting.linkObject,
														columnInfo.setting.linkType,
														columnInfo.setting.linkViaType)
														.fail(next)
														.done(function (result) {
															var objectModel = modelCreator.getModel(AD.classes.AppBuilder.currApp, AD.classes.AppBuilder.currApp.currObj.name);

															objectModel.Cached.columns.push(result);

															// Add new describe to object model
															objectModel.describe()[result.name] = result.type;

															updateColumn = result;

															next();
														});
												}
												else {
													AD.classes.AppBuilder.currApp.currObj.createColumn(fieldType, columnInfo)
														.fail(next)
														.then(function (result) {
															updateColumn = result;

															next();
														});
												}
											}
										},
										// Create list option of select column
										function (next) {
											if (columnInfo.fieldName === 'list' && columnInfo.setting.options) {
												var createOptionEvents = [];

												columnInfo.setting.options.forEach(function (opt, index) {
													if (isNaN(opt.id)) {
														createOptionEvents.push(function (createOk) {
															var list_key = self.Model.ABList.getKey(
																AD.classes.AppBuilder.currApp.name,
																AD.classes.AppBuilder.currApp.currObj.name,
																columnInfo.name);

															self.Model.ABList.create({
																key: list_key,
																weight: index + 1,
																column: updateColumn.id,
																label: opt.value,
																value: opt.value
															})
																.fail(createOk)
																.then(function (createdCol) {
																	// Update default value
																	if (updateColumn.setting.multiSelect && updateColumn.setting.default && updateColumn.setting.default.indexOf(opt.id) > -1) {
																		var updateDefaultValue = updateColumn.setting.attr('default').replace(opt.id, createdCol.id);
																		updateColumn.setting.attr('default', updateDefaultValue);
																	}
																	else if (!updateColumn.setting.multiSelect && updateColumn.setting.default == opt.id) {
																		updateColumn.setting.attr('default', createdCol.id);
																	}

																	opt.id = createdCol.id;

																	createOk();
																});
														});
													}
												});

												async.parallel(createOptionEvents, next);
											}
											else {
												next();
											}
										},
										// Delete old options list data
										function (next) {
											if (columnInfo.removedOptionIds && columnInfo.removedOptionIds.length > 0) {
												var deleteListEvents = [];

												columnInfo.removedOptionIds.forEach(function (id) {
													deleteListEvents.push(function (cb) {
														self.Model.ABList.destroy(id)
															.fail(cb)
															.then(function () { cb(); });
													});
												});

												AD.util.async.parallel(deleteListEvents, function (err) {
													if (err) {
														next(err);
													}
													else {
														delete columnInfo.removedOptionIds;
														next();
													}
												});
											}
											else {
												next();
											}
										},
										// Update options of list data type
										function (next) {
											if (columnInfo.fieldName === 'list' && columnInfo.setting.options) {

												// Refresh options
												updateColumn.setting.attr('options', columnInfo.setting.options.filter(function (opt) {
													return columnInfo.removedOptionIds == null || columnInfo.removedOptionIds.indexOf(opt.id) < 0;
												}));

												// // Update default ABList id
												// if (updateColumn.setting.default) {
												// 	var defaultOpt = columnInfo.setting.options.filter(function (opt) { return opt.value == updateColumn.setting.default; })[0];
												// 	if (defaultOpt)
												// 		updateColumn.setting.attr('default', defaultOpt.id);
												// }
												// else {
												// 	updateColumn.setting.removeAttr('default');
												// }

												updateColumn.save()
													.fail(next)
													.then(function () {
														next();
													});
											}
											else {
												next();
											}
										}
									], function (err) {
										if (err) {
											q.reject(err);
											return;
										}

										self.refreshColumns(updateColumn)
											.fail(q.reject)
											.then(function () { q.resolve(); });
									});

									return q;
								});

								$$(self.webixUiId.addFieldsPopup).registerCreateNewObjectEvent(function () {
									$$('ab-object-add-new-popup').define('selectNewObject', false);
									$$('ab-object-add-new-popup').show();
								});

								$$(self.webixUiId.objectDatatable).hideProgress();
							});

						},

						deleteObject: function (obj) {
							var self = this,
								objectModel = modelCreator.getModel(AD.classes.AppBuilder.currApp, obj.name);

							if (objectModel && objectModel.Cached) {
								// Clear cache data
								objectModel.Cached.cacheClear();
							}
						},

						addNewRow: function (newRow) {
							var self = this;

							$$(self.webixUiId.objectDatatable).showProgress({ type: 'icon' });

							var newModel = self.Model.ObjectModel.Cached.newInstance();

							Object.keys(newRow).forEach(function (key) {
								newModel.attr(key, newRow[key]);
							});

							// Set default of data
							AD.classes.AppBuilder.currApp.currObj.columns.forEach(function (col) {
								if (newModel[col.name] == null && col.setting.default) {
									var defaultValue = col.setting.default;

									if (col.type == 'date' || col.type == 'datetime') {
										if (col.setting.currentDateDefault == true)
											defaultValue = new Date();
										else if (col.setting.default)
											defaultValue = new Date(col.setting.default);
									}

									newModel.attr(col.name, defaultValue);
								}
							});

							newModel.save()
								.fail(function (err) {
									console.error(err);
									// TODO message

									$$(self.webixUiId.objectDatatable).hideProgress();
								})
								.then(function (result) {
									if (result.translate) result.translate();

									$$(self.webixUiId.objectDatatable).data.add(result.attr(), $$(self.webixUiId.objectDatatable).data.count());

									$$(self.webixUiId.objectDatatable).hideProgress();
								})
						},

						updateRowData: function (state, editor, ignoreUpdate) {
							var self = this,
								q = $.Deferred();

							$$(self.webixUiId.objectDatatable).unselectAll();

							if (state.value === state.old || ignoreUpdate) {
								q.resolve();
								return q;
							}

							$$(self.webixUiId.objectDatatable).showProgress({ type: 'icon' });

							var item = $$(self.webixUiId.objectDatatable).getItem(editor.row),
								rowData;

							async.series([
								function (next) {
									self.Model.ObjectModel.Cached.findOne({ id: item.id })
										.then(function (result) {
											result.attr(editor.column, state.value, true);

											// Fix update translates of model that have connect object values
											// By convert connect objects to id
											result.each(function (val, propName) {
												var linkedCol = self.data.columns.filter(function (col) { return col.fieldName == 'connectObject' && col.name == propName });
												if (!linkedCol || linkedCol.length < 1) return;

												var itemNode = $$(self.webixUiId.objectDatatable).getItemNode({ row: editor.row, column: propName });

												var connectValue = dataFieldsManager.getValue(
													AD.classes.AppBuilder.currApp,
													AD.classes.AppBuilder.currApp.currObj,
													linkedCol[0],
													itemNode
												);

												result.attr(propName, connectValue);
											});

											rowData = result;

											next();
										}, next);
								},
								// Update data
								function (next) {
									rowData.save().then(function (result) {
										rowData = result;

										next();
									}, next);
								},
								// Normalize data
								function (next) {
									dataHelper.normalizeData(
										AD.classes.AppBuilder.currApp,
										AD.classes.AppBuilder.currApp.currObj.id,
										self.data.columns,
										rowData)
										.then(function () {
											next();
										}, next);
								}
							], function (err) {
								if (err) {
									q.reject(err);
								}
								else {
									q.resolve(rowData);
								}
							});

							return q;
						},

						bindColumns: function (resetColumns, showSelectCol, showTrashCol) {
							if (!AD.classes.AppBuilder.currApp.currObj)
								return;

							var self = this,
								objectName = AD.classes.AppBuilder.currApp.currObj.attr('name'),
								objectModel = modelCreator.getModel(AD.classes.AppBuilder.currApp, objectName);

							self.controllers.ObjectDataTable.bindColumns(AD.classes.AppBuilder.currApp, self.data.columns.attr(), resetColumns, {
								isSelectVisible: showSelectCol,
								isTrashVisible: showTrashCol
							});
						},

						refreshColumns: function (columnInfo) {
							var self = this,
								q = $.Deferred();

							if (columnInfo.translate) columnInfo.translate();

							var list_options = [];

							AD.util.async.series([
								// Populate options list data
								function (cb) {
									if (columnInfo.setting.options && columnInfo.setting.options.length > 0) {
										var createListEvents = [];

										columnInfo.setting.options.forEach(function (opt, index) {
											createListEvents.push(function (next) {

												// Update
												if (opt.id && !isNaN(opt.id) && !opt.id.toString().startsWith('temp')) {
													self.Model.ABList.findOne({ id: opt.id })
														.fail(function (err) { next(err) })
														.then(function (li) {
															li.attr('weight', index + 1);
															li.attr('column', columnInfo.id);
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
													if (columnInfo.setting.options && columnInfo.setting.options.length > 0) {
														list_options = $.map(columnInfo.setting.options, function (opt) {
															return {
																id: opt.id,
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
							], function (err) {
								if (err) {
									q.reject(err);
									return;
								}

								var addColumnHeader = $.extend(columnInfo.setting, {
									id: columnInfo.name,
									dataId: columnInfo.id,
									header: self.controllers.ObjectDataTable.getHeader(AD.classes.AppBuilder.currApp, columnInfo),
									fieldName: columnInfo.fieldName
								});

								if (list_options && list_options.length > 0) {
									list_options.sort(function (a, b) { return a.weight - b.weight; });

									if (columnInfo.setting.attr)
										columnInfo.setting.attr('options', list_options);
									else
										columnInfo.setting.options = list_options;

									addColumnHeader.options = $.map(list_options, function (opt) {
										return {
											id: opt.id,
											value: opt.label
										};
									});
								}

								if (columnInfo.setting.width)
									addColumnHeader.width = parseInt(columnInfo.setting.width);
								else
									addColumnHeader.width = self.controllers.ObjectDataTable.calculateColumnWidth(AD.classes.AppBuilder.currApp, columnInfo);

								// Update objectList.columns data
								if (AD.classes.AppBuilder.currApp.currObj) {
									var existsColumnData = $.grep(AD.classes.AppBuilder.currApp.currObj.columns, function (c) { return c.id == columnInfo.id; });
									if (existsColumnData && existsColumnData.length > 0) { // Update
										for (var i = 0; i < AD.classes.AppBuilder.currApp.currObj.columns.length; i++) {
											if (AD.classes.AppBuilder.currApp.currObj.columns[i].dataId == columnInfo.id) {
												AD.classes.AppBuilder.currApp.currObj.columns[i] = columnInfo;
											}
										}
									} else { // Add 
										AD.classes.AppBuilder.currApp.currObj.columns.push(columnInfo);
									}
								}

								// Update columns data
								var existsColumnData = $.grep(self.data.columns, function (c) { return c.id == columnInfo.id; });
								if (existsColumnData && existsColumnData.length > 0) { // Update
									for (var i = 0; i < self.data.columns.length; i++) {
										if (self.data.columns[i].id == columnInfo.id) {
											self.data.columns[i] = columnInfo;
										}
									}
								} else { // Add 
									self.data.columns.push(columnInfo);
								}

								// Update columns UI
								var columns = $$(self.webixUiId.objectDatatable).config.columns;
								var existsColumn = $.grep(columns, function (c) { return c.dataId == columnInfo.id; });
								if (existsColumn && existsColumn.length > 0) { // Update
									for (var i = 0; i < columns.length; i++) {
										if (columns[i].dataId == columnInfo.id) {
											columns[i] = addColumnHeader;
										}
									}
								} else { // Add
									var index = columns.length > 0 ? columns.length - 1 : 0; // Before trash column
									columns.splice(index, 0, addColumnHeader);
								}

								// $$(self.webixUiId.objectDatatable).refreshColumns(columns);

								self.bindColumns(false, false, true);

								self.refreshPopupData();

								$$(self.webixUiId.objectDatatable).hideProgress();

								webix.message({
									type: "success",
									text: self.labels.common.saveSuccessMessage.replace("{0}", columnInfo.label)
								});

								q.resolve();
							});


							return q;
						},

						refreshPopupData: function () {
							var self = this;

							if (self.data.columns) {
								var columns = self.data.columns.attr ? self.data.columns.attr() : self.data.columns;
								columns = columns.sort(function (a, b) { return a.weight - b.weight; });

								$$(self.webixUiId.visibleFieldsPopup).setFieldList(columns);
								$$(self.webixUiId.filterFieldsPopup).define('dataTable', $$(self.webixUiId.objectDatatable));
								$$(self.webixUiId.filterFieldsPopup).define('columns', columns);
								$$(self.webixUiId.sortFieldsPopup).define('dataTable', $$(self.webixUiId.objectDatatable));
								$$(self.webixUiId.sortFieldsPopup).define('columns', columns);
								$$(self.webixUiId.frozenColumnsPopup).setFieldList(columns);
								$$(self.webixUiId.defineLabelPopup).setFieldList(columns);

								if (self.data.columns.length > 0) {
									$$(self.webixUiId.addNewRowButton).enable();
								}
								else {
									$$(self.webixUiId.addNewRowButton).disable();
								}
							}
							else {
								$$(self.webixUiId.addNewRowButton).disable();
							}

							$$(self.webixUiId.visibleFieldsPopup).bindFieldList();
							$$(self.webixUiId.filterFieldsPopup).refreshFieldList();
							$$(self.webixUiId.sortFieldsPopup).refreshFieldList();
							$$(self.webixUiId.frozenColumnsPopup).bindFieldList();
							$$(self.webixUiId.defineLabelPopup).bindFieldList();
						},

						attachPopupEvents: function () {
							var self = this;

							if (self.eventIds['visiblePopupOnChange'] == null) {
								self.eventIds['visiblePopupOnChange'] = $$(self.webixUiId.visibleFieldsPopup).attachEvent('onChange', function (num) {
									$$(self.webixUiId.visibleButton).define('badge', num);
									$$(self.webixUiId.visibleButton).refresh();
								});
							}

							if (self.eventIds['filterPopupOnChange'] == null) {
								self.eventIds['filterPopupOnChange'] = $$(self.webixUiId.filterFieldsPopup).attachEvent('onChange', function (dataTableId, num) {
									if (self.webixUiId.objectDatatable == dataTableId) {
										$$(self.webixUiId.filterButton).define('badge', num);
										$$(self.webixUiId.filterButton).refresh();
									}
								});
							}

							if (self.eventIds['sortPopupOnChange'] == null) {
								self.eventIds['sortPopupOnChange'] = $$(self.webixUiId.sortFieldsPopup).attachEvent('onChange', function (dataTableId, num) {
									if (self.webixUiId.objectDatatable == dataTableId) {
										$$(self.webixUiId.sortButton).define('badge', num);
										$$(self.webixUiId.sortButton).refresh();
									}
								});
							}

							if (self.eventIds['frozenPopupOnChange'] == null) {
								self.eventIds['frozenPopupOnChange'] = $$(self.webixUiId.frozenColumnsPopup).attachEvent('onChange', function (num) {
									$$(self.webixUiId.frozenButton).define('badge', num);
									$$(self.webixUiId.frozenButton).refresh();
								});
							}
						},

						reorderColumns: function () {
							var self = this,
								columns = []; // [{ columnId: , index: }, ..., {}]

							$$(self.webixUiId.objectDatatable).showProgress({ type: 'icon' });

							// Find cached columns
							var objectModel = modelCreator.getModel(AD.classes.AppBuilder.currApp, AD.classes.AppBuilder.currApp.currObj.attr('name'));

							async.series([
								// Set columns data to list
								function (callback) {
									$$(self.webixUiId.objectDatatable).eachColumn(function (columnName) {
										var col = self.data.columns.filter(function (c) { return c.name == columnName }),
											colIndex = $$(self.webixUiId.objectDatatable).getColumnIndex(columnName);

										// Add columns to list
										if (col && col.length > 0) {
											col[0].attr('weight', colIndex);

											if (!col[0].id.toString().startsWith('temp')) {
												columns.push({
													columnId: col[0].id,
													index: colIndex
												});
											}
										}
									}, true);

									callback();
								},
								// Update columns data
								function (callback) {
									if (columns && columns.length > 0) {
										AD.classes.AppBuilder.currApp.currObj.sortColumns(columns)
											.fail(callback)
											.then(function (result) {
												self.refreshPopupData();

												callback();
											})
									}
									else {
										callback();
									}
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