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
												var columnConfig = $$(self.webixUiId.objectDatatable).getColumnConfig(data.column);
												if (dataFieldsManager.hasCustomEdit(columnConfig.fieldName))
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
											onBeforeEditStop: function (state, editor) {
												var column = AD.classes.AppBuilder.currApp.currObj.columns.filter(function (col) { return col.name == editor.column; });

												if (!column || column.length < 1) return true;
												column = column[0];

												return dataFieldsManager.validate(column, state.value);
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

															// if (result.constructor.name === 'Cached' && result.isUnsync())
															// 	item.isUnsync = true;

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
															console.error(err);
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
													if (otherRow[result.columnName]) {
														// Filter difference values
														otherRow[result.columnName] = otherRow[result.columnName].filter(function (i) {
															if (typeof result.data == 'undefined' || result.data == null) return false;

															if (result.data.filter)
																return result.data.filter(function (itemId) { return i.id == itemId; }).length < 1;
															else
																return i.id != result.data;
														});

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
											var objectModel = modelCreator.getModel(AD.classes.AppBuilder.currApp, AD.classes.AppBuilder.currApp.currObj.attr('name')),
												newFields = objectModel.Cached.getNewFields().filter(function (c) { return c.id == headerField.dataId });

											if (newFields && newFields.length > 0) {
												$$(self.webixUiId.addFieldsPopup).show(itemNode);
												$$(self.webixUiId.addFieldsPopup).editMode(newFields[0]);
											}
										}
										break;
									case self.labels.object.deleteField:
										// Validate
										if (self.data.columns.length < 2 && !headerField.dataId.toString().startsWith('temp')) {
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
													var objectModel = modelCreator.getModel(AD.classes.AppBuilder.currApp, AD.classes.AppBuilder.currApp.currObj.attr('name')),
														newFields = objectModel.Cached.getNewFields().filter(function (c) { return c.id == headerField.dataId });

													if (newFields && newFields.length > 0) {
														selectedColumn = newFields[0];
														next(null, selectedColumn);
													}
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
														if (!result) return;

														$$(self.webixUiId.objectDatatable).showProgress({ type: "icon" });

														var objectName = AD.classes.AppBuilder.currApp.currObj.attr('name');

														async.parallel([
															// Remove describe & multi-fields of object model
															function (ok) {
																var objectModel = modelCreator.getModel(AD.classes.AppBuilder.currApp, objectName);
																delete objectModel.describe()[headerField.id];

																if (objectModel.multilingualFields) // Remove field
																	objectModel.multilingualFields = objectModel.multilingualFields.filter(function (f) { return f != headerField.id; });

																// Delete cache
																objectModel.Cached.deleteCachedField(headerField.dataId);

																ok();
															},
															// Remove describe & multi-fields of link object model
															function (ok) {
																if (selectedColumn.setting.linkObject && selectedColumn.setting.linkVia) {
																	var linkObject = AD.classes.AppBuilder.currApp.objects.filter(function (obj) {
																		return obj.id == selectedColumn.setting.linkObject;
																	})[0];

																	var objectModel = modelCreator.getModel(AD.classes.AppBuilder.currApp, linkObject.name);
																	delete objectModel.describe()[selectedColumn.setting.linkVia];

																	if (objectModel.multilingualFields) // Remove link field
																		objectModel.multilingualFields = objectModel.multilingualFields.filter(function (f) { return f != selectedColumn.setting.linkVia; });

																	// Delete cache
																	objectModel.Cached.deleteCachedField(selectedColumn.setting.linkVia);

																	ok();
																}
																else {
																	ok();
																}
															},
															// Call server to delete field data
															function (ok) {
																if (headerField.dataId.toString().startsWith('temp')) {
																	ok();
																}
																else {
																	self.Model.ABColumn.destroy(headerField.dataId)
																		.fail(ok)
																		.then(function (data) { ok(); });
																}
															},
															// Call server to delete link field data
															function (ok) {
																if (selectedColumn.setting.linkObject && selectedColumn.setting.linkVia && !selectedColumn.setting.linkVia.toString().startsWith('temp')) {
																	self.Model.ABColumn.destroy(selectedColumn.setting.linkVia)
																		.fail(ok)
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
								objectData;

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

											data.forEach(function (d) { if (d.translate) d.translate(); });

											self.data.columns = data;
											AD.classes.AppBuilder.currApp.currObj.attr('columns', data);

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
								// Register DataTable
								function (next) {
									self.controllers.ObjectDataTable.registerDataTable(
										AD.classes.AppBuilder.currApp,
										AD.classes.AppBuilder.currApp.currObj,
										self.data.columns,
										$$(self.webixUiId.objectDatatable));

									next();
								},
								// Bind columns to DataTable
								function (next) {
									self.bindColumns(true, true);
									next();
								},
								// Get object model
								function (next) {
									if (!AD.classes.AppBuilder.currApp.currObj)
										return next();

									self.Model.ObjectModel = modelCreator.getModel(AD.classes.AppBuilder.currApp, AD.classes.AppBuilder.currApp.currObj.attr('name'));
									next();
								},
								// Get data from server
								function (next) {
									self.Model.ObjectModel.store = {}; // Clear CanJS local repository
									self.Model.ObjectModel.Cached.findAll({})
										.fail(next)
										.then(function (data) {
											objectData = data;
											next();
										});
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
								$$(self.webixUiId.filterFieldsPopup).registerDataTable($$(self.webixUiId.objectDatatable));
								$$(self.webixUiId.sortFieldsPopup).registerDataTable($$(self.webixUiId.objectDatatable));
								$$(self.webixUiId.frozenColumnsPopup).registerDataTable($$(self.webixUiId.objectDatatable));
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

									columnInfo.object = AD.classes.AppBuilder.currApp.currObj.id;

									// Get deferred when save complete
									var q = $.Deferred(),
										objectName = AD.classes.AppBuilder.currApp.currObj.attr('name');

									if (columnInfo.id && !columnInfo.id.toString().startsWith('temp')) { // Update
										var updateColumn = $.grep(self.data.columns, function (col) { return col.id == columnInfo.id; })[0];

										for (var key in columnInfo) {
											if (key != 'id')
												updateColumn.attr(key, columnInfo[key]);
										}

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
												if (!updateColumn.setting.linkVia) {
													next()
												}
												else {
													AD.classes.AppBuilder.currApp.currObj.getColumn(updateColumn.setting.linkVia)
														.fail(next)
														.then(function (result) {
															result.setting.attr('linkType', columnInfo.setting.linkViaType);
															result.setting.attr('linkViaType', columnInfo.setting.linkType);

															result.save().fail(next).then(function () {
																next();
															});
														});
												}
											},
											// Create list option of select column
											function (next) {
												if (columnInfo.setting.editor === 'richselect' && columnInfo.setting.options) {
													var createOptionEvents = [];

													columnInfo.setting.options.forEach(function (opt, index) {
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
																	// set dataId to option
																	opt.dataId = createdCol.id;
																	createOk();
																});
														});
													});

													async.parallel(createOptionEvents, function (err) {
														if (err) return next(err);

														// Save dataId to options
														updateColumn.setting.attr('options', columnInfo.setting.options);
														updateColumn.save()
															.fail(next)
															.then(function () {
																next();
															});
													});
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
										], function (err) {
											if (err) {
												q.reject(err);
												return;
											}

											self.refreshColumns(updateColumn)
												.fail(q.reject)
												.then(function () { q.resolve(); });
										});
									}
									else { // Cache new field
										var firstColumn = self.cacheNewField(objectName, columnInfo);
										var isSelfLink = firstColumn.setting.linkObject && (firstColumn.setting.linkObject == columnInfo.object);

										if (firstColumn.setting.linkType && firstColumn.setting.linkObject) {
											// Find object
											var linkObj = AD.classes.AppBuilder.currApp.objects.filter(function (obj) { return obj.id == firstColumn.setting.linkObject; })[0];

											// Create linked column
											var secondColumn = {
												object: firstColumn.setting.linkObject,
												name: AD.classes.AppBuilder.currApp.currObj.label,
												label: AD.classes.AppBuilder.currApp.currObj.label,
												fieldName: firstColumn.fieldName,
												type: firstColumn.type,
												setting: $.extend(true, {}, firstColumn.setting)
											};

											secondColumn.setting.linkType = columnInfo.setting.linkViaType;
											secondColumn.setting.linkObject = AD.classes.AppBuilder.currApp.currObj.id;
											secondColumn.setting.linkVia = firstColumn.id;
											secondColumn.setting.linkViaType = columnInfo.setting.linkType;
											secondColumn.setting.linkDefault = false;

											if (firstColumn.setting.linkVia)
												secondColumn.id = firstColumn.setting.linkVia;

											// Cache link column
											var cacheResult = self.cacheNewField(linkObj.name, secondColumn);

											// Set linkVia to first column
											firstColumn.setting.linkVia = cacheResult.id;

											// Update firstColumn cache
											self.cacheNewField(objectName, firstColumn);

											self.refreshColumns(columnInfo)
												.fail(q.reject)
												.then(function () { q.resolve(); });
										}
										else {
											self.refreshColumns(columnInfo)
												.fail(q.reject)
												.then(function () { q.resolve(); });
										}
									}

									return q;
								});

								$$(self.webixUiId.addFieldsPopup).registerCreateNewObjectEvent(function () {
									$$('ab-object-add-new-popup').define('selectNewObject', false);
									$$('ab-object-add-new-popup').show();
								});

								$$(self.webixUiId.objectDatatable).hideProgress();
							});

						},

						cacheNewField: function (objectName, newColumn) {
							var self = this,
								objectModel = modelCreator.getModel(AD.classes.AppBuilder.currApp, objectName);

							// Cache new field
							var cacheCol = objectModel.Cached.cacheNewField(newColumn);

							// Add new describe to object model
							objectModel.describe()[cacheCol.name] = cacheCol.type;

							// Add multilingual field to object model
							if (cacheCol.supportMultilingual)
								objectModel.multilingualFields.push(cacheCol.name);

							return cacheCol;
						},

						deleteObject: function (obj) {
							var self = this,
								objectModel = modelCreator.getModel(AD.classes.AppBuilder.currApp, obj.name);

							if (objectModel && objectModel.Cached) {
								// Clear columns info cache
								objectModel.Cached.clearCacheFields();

								// Clear cache data
								objectModel.Cached.cacheClear();
							}
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

							var item = $$(self.webixUiId.objectDatatable).getItem(editor.row);

							self.Model.ObjectModel.Cached.findOne({ id: item.id })
								.fail(q.reject)
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

									// Update data
									result.save()
										.fail(q.reject)
										.then(function (result) {
											dataHelper.normalizeData(
												AD.classes.AppBuilder.currApp,
												AD.classes.AppBuilder.currApp.currObj.id,
												self.data.columns,
												result)
												.fail(q.reject)
												.then(q.resolve);
										});
								});

							return q;
						},

						bindColumns: function (resetColumns, addTrashColumn) {
							if (!AD.classes.AppBuilder.currApp.currObj)
								return;

							var self = this,
								objectName = AD.classes.AppBuilder.currApp.currObj.attr('name'),
								objectModel = modelCreator.getModel(AD.classes.AppBuilder.currApp, objectName);

							var columns = self.data.columns.attr().slice(), // Copy
								newFields = objectModel.Cached.getNewFields();

							newFields.forEach(function (f) {
								f.isNewColumn = true;

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

							self.controllers.ObjectDataTable.bindColumns(AD.classes.AppBuilder.currApp, columns, resetColumns, addTrashColumn);
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

												if (opt.dataId && !opt.dataId.toString().startsWith('temp')) { // Update
													self.Model.ABList.findOne({ id: opt.dataId })
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
							], function (err) {
								if (err) {
									q.reject(err);
									return;
								}

								columnInfo.isNewColumn = (columnInfo.id === null || typeof columnInfo.id === 'undefined' || columnInfo.id.toString().startsWith('temp'));

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
											dataId: opt.id,
											id: opt.value,
											value: opt.label
										};
									});
								}

								if (columnInfo.setting.width)
									addColumnHeader.width = columnInfo.setting.width;
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

								$$(self.webixUiId.objectDatatable).refreshColumns(columns);

								self.refreshPopupData();

								$$(self.webixUiId.objectDatatable).hideProgress();

								webix.message({
									type: "success",
									text: self.labels.common.saveSuccessMessage.replace("{0}", columnInfo.name)
								});

								q.resolve();
							});


							return q;
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

							// Find cached columns
							var objectModel = modelCreator.getModel(AD.classes.AppBuilder.currApp, AD.classes.AppBuilder.currApp.currObj.attr('name')),
								cachedFields = objectModel.Cached.getNewFields();

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
													self.cacheNewField(AD.classes.AppBuilder.currApp.currObj.attr('name'), col);
												});

												next();
											}
											else {
												next();
											}
										},
										// Update data to server
										function (next) {
											if (columns && columns.length > 0) {
												AD.classes.AppBuilder.currApp.currObj.sortColumns(columns)
													.fail(next)
													.then(function (result) {
														self.refreshPopupData();

														next();
													})
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