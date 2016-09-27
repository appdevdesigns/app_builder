steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/models/ABPage.js',
	'opstools/BuildApp/models/ABObject.js',
	'opstools/BuildApp/models/ABColumn.js',

	'opstools/BuildApp/controllers/webix_custom_components/DynamicDataTable.js',
	'opstools/BuildApp/controllers/webix_custom_components/ActiveList.js',
	'opstools/BuildApp/controllers/webix_custom_components/DataTableFilterPopup.js',
	'opstools/BuildApp/controllers/webix_custom_components/DataTableSortFieldsPopup.js',

	'opstools/BuildApp/controllers/utils/ObjectDataTable.js',
	function () {
		System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control').then(function () {

					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.Components.Grid', {

						init: function (element, options) {
							var self = this;

							self.data = {}; // { viewId: { }, viewId2: { }, ..., viewIdn: { }}
							self.info = {
								name: 'Grid',
								icon: 'fa-table'
							};

							// Model
							self.Model = {
								ABPage: AD.Model.get('opstools.BuildApp.ABPage'),
								ABObject: AD.Model.get('opstools.BuildApp.ABObject'),
								ABColumn: AD.Model.get('opstools.BuildApp.ABColumn')
							};

							// Controllers
							var DynamicDataTable = AD.Control.get('opstools.BuildApp.DynamicDataTable'),
								ActiveList = AD.Control.get('opstools.BuildApp.ActiveList'),
								FilterPopup = AD.Control.get('opstools.BuildApp.DataTableFilterPopup'),
								SortPopup = AD.Control.get('opstools.BuildApp.DataTableSortFieldsPopup');

							self.controllers = {
								DynamicDataTable: new DynamicDataTable(),
								FilterPopup: new FilterPopup(),
								SortPopup: new SortPopup(),
								ObjectDataTables: {}
							};

							self.componentIds = {
								editView: self.info.name + '-edit-view',
								editTitle: self.info.name + '-edit-title',
								editDescription: self.info.name + '-edit-description',
								editDataTable: 'ab-datatable-edit-mode',
								editHeader: 'ab-datatable-edit-header',

								header: 'ab-datatable-header',

								columnList: 'ab-datatable-columns-list',

								propertyView: self.info.name + '-property-view',

								filterFieldsPopup: 'ab-datatable-filter-popup',
								sortFieldsPopup: 'ab-datatable-sort-popup'
							};

							self.view = {
								view: "dynamicdatatable",
								autoheight: true,
								datatype: "json"
							};

							self.getView = function () {
								return self.view;
							};

							self.getEditView = function () {
								var viewId = self.componentIds.editDataTable,
									dataTable = $.extend(true, {}, self.getView());

								dataTable.id = viewId;
								dataTable.autoheight = false;
								dataTable.height = 180;

								var editView = {
									id: self.componentIds.editView,
									padding: 10,
									rows: [
										dataTable,
										{
											view: 'label',
											label: 'Columns list'
										},
										{
											id: self.componentIds.columnList,
											view: 'activelist',
											template: function (obj, common) {
												return "<div class='ab-page-grid-column-item'>" +
													"<div class='column-checkbox'>" +
													common.markCheckbox(obj, common) +
													"</div>" +
													"<div class='column-name'>" + obj.label + "</div>" +
													"</div>";
											},
											activeContent: {
												markCheckbox: {
													view: "checkbox",
													width: 50,
													on: { /*checkbox onChange handler*/
														'onChange': function (newv, oldv) {
															var item_id = this.config.$masterId,
																data = self.getData(viewId),
																propertyValues = $$(self.componentIds.propertyView).getValues();

															if (this.getValue()) // Check
																data.visibleColumns.push(item_id);
															else // Uncheck
															{
																var index = data.visibleColumns.indexOf(item_id);
																if (index > -1)
																	data.visibleColumns.splice(index, 1);
															}

															self.renderDataTable(viewId, data.dataCollection, {
																viewPage: propertyValues.viewPage,
																viewId: propertyValues.viewId,
																editPage: propertyValues.editPage,
																editForm: propertyValues.editForm
															}, false, propertyValues.linkedField);
														}
													}
												}
											}
										}
									]
								};

								return editView;
							};

							self.getPropertyView = function () {
								return {
									view: "property",
									id: self.componentIds.propertyView,
									elements: [
										{ label: "Header", type: "label" },
										{
											id: 'title',
											name: 'title',
											type: 'text',
											label: 'Title'
										},
										{
											id: 'description',
											name: 'description',
											type: 'text',
											label: 'Description'
										},
										{ label: "Data source", type: "label" },
										{
											id: 'object',
											name: 'object',
											type: 'richselect',
											label: 'Object',
											template: function (data, dataValue) {
												var selectedData = $.grep(data.options, function (opt) { return opt.id == dataValue; });
												if (selectedData && selectedData.length > 0)
													return selectedData[0].value;
												else
													return "[Select]";
											}
										},
										{
											id: 'linkedTo',
											name: 'linkedTo',
											type: 'richselect',
											label: 'Linked to',
											template: function (data, dataValue) {
												var selectedData = $.grep(data.options, function (opt) { return opt.id == dataValue; });
												if (selectedData && selectedData.length > 0)
													return selectedData[0].value;
												else
													return "[none]";
											}
										},
										{
											id: 'linkedField',
											name: 'linkedField',
											type: 'richselect',
											label: 'Linked field',
											template: function (data, dataValue) {
												var selectedData = $.grep(data.options, function (opt) { return opt.id == dataValue; });
												if (selectedData && selectedData.length > 0)
													return selectedData[0].value;
												else
													return "";
											}
										},
										{ label: "Data table", type: "label" },
										{
											id: 'detailView',
											name: 'detailView',
											label: 'Detail view',
											type: 'richselect',
											template: function (data, dataValue) {
												var selectedDetailView = $.grep(data.options, function (opt) { return opt.id == dataValue; });
												if (selectedDetailView && selectedDetailView.length > 0) {
													return selectedDetailView[0].value;
												}
												else {
													return "[none]";
												}
											}
										},
										{
											id: 'editForm',
											name: 'editForm',
											label: "Edit form",
											type: 'richselect',
											template: function (data, dataValue) {
												var selectedEditForm = $.grep(data.options, function (opt) { return opt.id == dataValue; });
												if (selectedEditForm && selectedEditForm.length > 0) {

													return selectedEditForm[0].value;
												}
												else {

													return "[none]";
												}
											}
										},
										{
											id: 'removable',
											name: 'removable',
											type: 'richselect',
											label: 'Removable',
											options: [
												{ id: 'enable', value: "Yes" },
												{ id: 'disable', value: "No" },
											]
										},
										{ label: "Options", type: "label" },
										{
											id: 'filter',
											name: 'filter',
											type: 'richselect',
											label: 'Filter',
											options: [
												{ id: 'enable', value: "Yes" },
												{ id: 'disable', value: "No" },
											]
										},
										{
											id: 'sort',
											name: 'sort',
											type: 'richselect',
											label: 'Sort',
											options: [
												{ id: 'enable', value: "Yes" },
												{ id: 'disable', value: "No" },
											]
										}
									],
									on: {
										onAfterEditStop: function (state, editor, ignoreUpdate) {
											if (ignoreUpdate || state.old == state.value) return false;

											var viewId = self.componentIds.editDataTable,
												data = self.getData(viewId),
												propertyValues = $$(self.componentIds.propertyView).getValues();

											switch (editor.id) {
												case 'title':
													$$(self.componentIds.editTitle).setValue(propertyValues.title);
													break;
												case 'description':
													$$(self.componentIds.editDescription).setValue(propertyValues.description);
													break;
												case 'linkedTo':
													var linkedTo = propertyValues.linkedTo,
														linkedField = $$(self.componentIds.propertyView).getItem('linkedField');

													if (linkedTo != 'none') {
														linkedField.options = data.columns
															.filter(function (col) { return col.linkObject && col.linkObject.id == linkedTo; })
															.map(function (col) {
																return {
																	id: col.id,
																	value: col.label
																}
															}).attr();

														propertyValues['linkedField'] = linkedField.options[0].id; // Default selection
													} else {
														linkedField.options = [];
														linkedField.hidden = true;
														propertyValues['linkedField'] = null;
													}
													$$(self.componentIds.propertyView).setValues(propertyValues);
												case 'object':
												case 'filter':
												case 'sort':
													var setting = self.getSettings();
													setting.columns = data.visibleColumns;

													self.populateSettings({ setting: setting }, data.getDataCollection, true);
													break;
												case 'detailView':
												case 'editForm':
												case 'removable':
													var detailView = propertyValues.detailView && propertyValues.detailView.indexOf('|') > -1 ? propertyValues.detailView.split('|') : null,
														editValue = propertyValues.editForm && propertyValues.editForm.indexOf('|') > -1 ? propertyValues.editForm.split('|') : null;

													self.renderDataTable(viewId, data.dataCollection, {
														viewPage: detailView ? detailView[0] : null,
														viewId: detailView ? detailView[1] : null,
														editPage: editValue ? editValue[0] : null,
														editForm: editValue ? editValue[1] : null
													}, propertyValues.removable, propertyValues.linkedField);
													break;
											}
										}
									}
								};
							};

							self.setApp = function (app) {
								self.app = app;
							};

							self.setPage = function (page) {
								self.data.page = page;
							};

							self.getData = function (viewId) {
								if (!self.data[viewId]) self.data[viewId] = {};

								if (!self.data[viewId].visibleColumns) self.data[viewId].visibleColumns = []; // { viewId: [columnId1, ..., columnIdn], ... }

								return self.data[viewId];
							};

							self.getDataTableController = function (viewId) {
								var dataTableController = self.controllers.ObjectDataTables[viewId];

								if (!dataTableController) {
									var ObjectDataTable = AD.Control.get('opstools.BuildApp.ObjectDataTable');

									self.controllers.ObjectDataTables[viewId] = new ObjectDataTable();
									self.controllers.ObjectDataTables[viewId].setApp(self.app);
									self.controllers.ObjectDataTables[viewId].setReadOnly(true);

									dataTableController = self.controllers.ObjectDataTables[viewId];
								}

								dataTableController.registerDataTable($$(viewId));

								return dataTableController;
							};

							self.render = function (viewId, comDataId, settings, editable, showAll, dataCollection, linkedToDataCollection) {
								var q = $.Deferred(),
									data = self.getData(viewId),
									dataTableController = self.getDataTableController(viewId);

								webix.extend($$(viewId), webix.ProgressBar);
								$$(viewId).clearAll();
								$$(viewId).showProgress({ type: 'icon' });

								data.id = comDataId;
								data.isRendered = true;
								data.dataCollection = dataCollection;

								// Init linked dataCollection events
								if (linkedToDataCollection) {
									data.linkedToDataCollection = linkedToDataCollection;
									data.linkedToDataCollection.attachEvent('onAfterCursorChange', function (id) {
										self.filterLinkedData(viewId, settings.linkedField);
									});
								}

								if (settings.columns)
									data.visibleColumns = $.map(settings.columns, function (cId) { return cId.toString(); });

								var dataTableController = self.getDataTableController(viewId);
								dataTableController.bindColumns([], true, settings.removable);
								dataTableController.registerDeleteRowHandler(function (deletedId) {
									$$(viewId).showProgress({ type: 'icon' });

									// Delete data
									dataCollection.AD.destroyModel(deletedId.row)
										.fail(function (err) {
											AD.error.log('Error destroying entry.', { error: err, id: deletedId.row });

											$$(viewId).hideProgress();
										})
										.then(function (oldData) {
											$$(viewId).hideProgress();
										});
								});

								AD.util.async.parallel([
									function (next) {
										self.objects = null;

										// Get object list
										self.Model.ABObject.findAll({ application: self.app.id })
											.fail(function (err) { next(err); })
											.then(function (result) {
												result.forEach(function (o) {
													if (o.translate)
														o.translate();
												});

												self.objects = result;

												dataTableController.setObjectList(self.objects);

												next();
											});
									},
									function (next) {
										data.columns = null;

										if (!settings.object) {
											next();
											return;
										}

										// Get object list
										self.Model.ABColumn.findAll({ object: settings.object })
											.fail(function (err) { next(err); })
											.then(function (result) {
												result.forEach(function (d) {
													if (d.translate) d.translate();
												});

												data.columns = result;

												next();
											});
									}
								], function (err, results) {
									if (err) {
										q.reject(err);
										return;
									}

									self.renderDataTable(viewId, dataCollection, {
										viewPage: settings.viewPage,
										viewId: settings.viewId,
										editPage: settings.editPage,
										editForm: settings.editForm
									}, settings.removable, settings.linkedField);

									$$(viewId).hideProgress();

									var header = {
										view: 'layout',
										autoheight: true,
										rows: []
									};

									if (editable) {
										header.id = self.componentIds.editHeader;

										$$(self.componentIds.editView).removeView(self.componentIds.editHeader);

										// Title
										header.rows.push({
											id: self.componentIds.editTitle,
											view: 'text',
											placeholder: 'Title',
											css: 'ab-component-header',
											value: settings.title || '',
											on: {
												onChange: function (newv, oldv) {
													if (newv != oldv) {
														var propValues = $$(self.componentIds.propertyView).getValues();
														propValues.title = newv;
														$$(self.componentIds.propertyView).setValues(propValues);
													}
												}
											}
										});

										// Description
										header.rows.push({
											id: self.componentIds.editDescription,
											view: 'textarea',
											placeholder: 'Description',
											css: 'ab-component-description',
											value: settings.description || '',
											inputHeight: 60,
											height: 60,
											on: {
												onChange: function (newv, oldv) {
													if (newv != oldv) {
														var propValues = $$(self.componentIds.propertyView).getValues();
														propValues.description = newv;
														$$(self.componentIds.propertyView).setValues(propValues);
													}
												}
											}
										});

									}
									else { // Label
										header.id = self.componentIds.header;

										if (settings.title) {
											header.rows.push({
												view: 'label',
												css: 'ab-component-header',
												label: settings.title || ''
											});
										}

										if (settings.description) {
											header.rows.push({
												view: 'label',
												css: 'ab-component-description',
												label: settings.description || ''
											});
										}
									}

									var action_buttons = [];

									if (settings.filter === 'enable') {
										action_buttons.push({ view: 'button', id: viewId + '-filter-button', label: 'Add filters', popup: viewId + '-filter-popup', icon: "filter", type: "icon", width: 120, badge: 0 });
									}

									if (settings.sort === 'enable') {
										action_buttons.push({ view: 'button', id: viewId + '-sort-button', label: 'Apply sort', popup: viewId + '-sort-popup', icon: "sort", type: "icon", width: 120, badge: 0 });
									}

									if (action_buttons.length > 0) {
										header.rows.push({
											view: 'toolbar',
											autoheight: true,
											autowidth: true,
											cols: action_buttons
										});
									}

									if (editable) {
										if (header.rows.length > 0)
											$$(self.componentIds.editView).addView(header, 0);
									}
									else {
										// $$(viewId).clearAdditionalView();
										if (header.rows.length > 0)
											$$(viewId).prependView(header);
									}

									var columns = [];
									if (data.columns) {
										columns = data.columns.filter(function (c) {
											return data.visibleColumns.filter(function (v) { return v == c.id }).length > 0;
										}).slice(0);
									}

									// Create filter popup
									if (settings.filter === 'enable') {
										webix.ui({
											id: viewId + '-filter-popup',
											view: "filter_popup",
										}).hide();

										$$(viewId + '-filter-popup').registerDataTable($$(viewId));
										$$(viewId + '-filter-popup').setFieldList(columns);
										$$(viewId + '-filter-popup').attachEvent('onChange', function (number) {
											$$(viewId + '-filter-button').define('badge', number);
											$$(viewId + '-filter-button').refresh();
										});
									}

									// Create sort popup
									if (settings.sort === 'enable') {
										webix.ui({
											id: viewId + '-sort-popup',
											view: "sort_popup",
										}).hide();

										$$(viewId + '-sort-popup').registerDataTable($$(viewId));
										$$(viewId + '-sort-popup').setFieldList(columns);
										$$(viewId + '-sort-popup').attachEvent('onChange', function (number) {
											$$(viewId + '-sort-button').define('badge', number);
											$$(viewId + '-sort-button').refresh();
										});
									}

									// Select edit item
									self.getDataTableController(viewId).registerItemClick(function (id, e, node) {
										if (id.column === 'view_detail') {
											self.callEvent('view', viewId, {
												id: data.id,
												selected_data: id
											});

											$$(viewId).define('select', true);
											$$(viewId).select(id);
										}
										else if (id.column === 'edit_form') {
											self.callEvent('edit', viewId, {
												id: data.id,
												selected_data: id
											});

											$$(viewId).define('select', true);
											$$(viewId).select(id);
										}
									});

									$$(viewId).attachEvent('onAfterRender', function (data) {
										self.callEvent('renderComplete', viewId);
									});

									$$(viewId).attachEvent('onAfterSelect', function (data, perserve) {
										dataCollection.setCursor(data.id);
									});

									if (dataCollection) {
										dataCollection.attachEvent("onAfterCursorChange", function (id) {
											var selectedItem = $$(viewId).getSelectedId(false);

											if (!id && $$(viewId).unselectAll)
												$$(viewId).unselectAll();
											else if (selectedItem && selectedItem.id != id && $$(viewId).select)
												$$(viewId).select(id);
										});
									}

									q.resolve();
								});

								return q;
							};

							self.getSettings = function () {
								var propertyValues = $$(self.componentIds.propertyView).getValues(),
									columns = $.map($$(self.componentIds.editDataTable).config.columns, function (c) { return [c.dataId]; }),
									detailView = propertyValues.detailView && propertyValues.detailView.split('|') || null,
									viewPageId = detailView && detailView[0] || null,
									viewId = detailView && detailView[1] || null,
									editForm = propertyValues.editForm && propertyValues.editForm.split('|') || null,
									editPageId = editForm && editForm[0] || null,
									editFormId = editForm && editForm[1] || null;

								var settings = {
									title: propertyValues.title || '',
									description: propertyValues.description || '',
									object: propertyValues.object,
									linkedTo: propertyValues.linkedTo != 'none' ? propertyValues.linkedTo : '',
									linkedField: propertyValues.linkedField != 'none' ? propertyValues.linkedField : '',
									viewPage: viewPageId,
									viewId: viewId,
									editPage: editPageId,
									editForm: editFormId,
									columns: columns.filter(function (c) { return c; }),
									removable: propertyValues.removable,
									filter: propertyValues.filter,
									sort: propertyValues.sort
								};

								return settings;
							}

							self.populateSettings = function (item, getDataCollectionFn, selectAll) {
								webix.extend($$(self.componentIds.columnList), webix.ProgressBar);

								$$(self.componentIds.columnList).showProgress({ type: 'icon' });

								var viewId = self.componentIds.editDataTable,
									data = self.getData(viewId),
									dataCollection,
									linkedToDataCollection;

								data.getDataCollection = getDataCollectionFn;

								async.series([
									// Get data collection
									function (next) {
										if (item.setting.object) {
											data.getDataCollection(item.setting.object).then(function (result) {
												dataCollection = result;
												next();
											});
										}
										else {
											next();
										}
									},
									// Get linked data colllection
									function (next) {
										if (item.setting.linkedTo) {
											data.getDataCollection(item.setting.linkedTo).then(function (result) {
												linkedToDataCollection = result;
												next();
											});
										}
										else {
											next();
										}
									},
									// Render dataTable component
									function (next) {
										self.render(viewId, item.id, item.setting, true, false, dataCollection, linkedToDataCollection).then(function () {
											// Columns list
											self.bindColumnList(viewId, item.setting.object, selectAll);
											$$(self.componentIds.columnList).hideProgress();

											next();
										});
									},
									// Properties
									// Data source - Object
									function (next) {
										if (!self.objects) {
											next();
											return;
										}

										// Data source - Object
										var objectList = $$(self.componentIds.propertyView).getItem('object');
										objectList.options = $.map(self.objects, function (o) {
											return {
												id: o.id,
												value: o.label
											};
										});

										// Data source - Linked to
										var linkedObjIds = data.columns.filter(function (col) { return col.linkObject != null; }).map(function (col) { return col.linkObject.id || col.linkObject }),
											linkedObjs = self.objects.filter(function (obj) { return linkedObjIds.indexOf(obj.id) > -1; }),
											linkedToItem = $$(self.componentIds.propertyView).getItem('linkedTo');
										linkedToItem.options = $.map(linkedObjs, function (o) {
											return {
												id: o.id,
												value: o.label
											};
										});
										linkedToItem.options.splice(0, 0, {
											id: 'none',
											value: '[none]'
										});

										// Data source - Linked field
										var linkedFieldItem = $$(self.componentIds.propertyView).getItem('linkedField');
										if (item.setting.linkedTo) {
											linkedFieldItem.options = data.columns
												.filter(function (col) { return col.linkObject && col.linkObject.id == item.setting.linkedTo; })
												.map(function (col) {
													return {
														id: col.id,
														value: col.label
													};
												}).attr();
										}
										else {
											linkedFieldItem.options = [];
										}

										next();
									},
									// Data table - Detail view & Edit form
									function (next) {
										var parentId = self.data.page.parent ? self.data.page.parent.attr('id') : self.data.page.attr('id');

										self.Model.ABPage.store = {}; // Clear local repository
										self.Model.ABPage.findAll({ or: [{ id: parentId }, { parent: parentId }] })
											.fail(function (err) { next(err); })
											.then(function (pages) {
												var viewComponents = [],
													formComponents = [];

												pages.forEach(function (p) {
													// Details view components
													var detailsViews = p.components.filter(function (c) {
														return c.component === "View" && c.setting && item.setting && c.setting.object === item.setting.object;
													});

													if (detailsViews && detailsViews.length > 0) {
														viewComponents = viewComponents.concat($.map(detailsViews, function (v) {
															return [{
																id: p.id + '|' + v.id,
																value: p.name + ' - ' + v.component
															}];
														}));
													}

													// Filter form components
													var forms = p.components.filter(function (c) {
														return c.component === "Form" && c.setting && item.setting && c.setting.object === item.setting.object;
													});

													if (forms && forms.length > 0) {
														formComponents = formComponents.concat($.map(forms, function (f) {
															return [{
																id: p.id + '|' + f.id,
																value: p.name + ' - ' + f.component
															}];
														}));
													}
												});

												var detailViewItem = $$(self.componentIds.propertyView).getItem('detailView');
												detailViewItem.options = viewComponents;
												detailViewItem.options.splice(0, 0, {
													id: null,
													pageId: null,
													value: '[none]'
												});

												var editFormItem = $$(self.componentIds.propertyView).getItem('editForm');
												editFormItem.options = formComponents;
												editFormItem.options.splice(0, 0, {
													id: null,
													pageId: null,
													value: '[none]'
												});

												next();
											});
									},
									// Set property values
									function (next) {
										var detailView, editForm;

										if (item.setting.viewPage && item.setting.viewId)
											detailView = item.setting.viewPage + '|' + item.setting.viewId;

										if (item.setting.editPage && item.setting.editForm)
											editForm = item.setting.editPage + '|' + item.setting.editForm;

										$$(self.componentIds.propertyView).setValues({
											title: item.setting.title || '',
											description: item.setting.description || '',
											object: item.setting.object,
											linkedTo: item.setting.linkedTo,
											linkedField: item.setting.linkedField,
											detailView: detailView,
											editForm: editForm,
											removable: item.setting.removable || 'disable',
											filter: item.setting.filter || 'disable',
											sort: item.setting.sort || 'disable'
										});

										$$(self.componentIds.propertyView).refresh();
									}

								]);
							};

							self.renderDataTable = function (viewId, dataCollection, extraColumns, isTrashVisible, linkedField) {
								var data = self.getData(viewId);

								if (!data.columns) return;

								var propertyValues = $$(self.componentIds.propertyView).getValues();

								var columns = data.columns.filter(function (c) {
									return data.visibleColumns.filter(function (v) { return v == c.id }).length > 0;
								}).slice(0);
								if (columns.length < 1) columns = data.columns.slice(0); // Show all

								// View column
								if (extraColumns.viewPage && extraColumns.viewId) {
									columns.push({
										width: 60,
										weight: _getMaxWeight(columns) + 1,
										setting: {
											id: "view_detail",
											header: "",
											label: "",
											template: "<span class='go-to-view-detail'>View</span>",
											css: 'ab-object-view-column'
										}
									});
								}

								// Edit column
								if (extraColumns.editPage && extraColumns.editForm) {
									columns.push({
										width: 45,
										weight: _getMaxWeight(columns) + 1,
										setting: {
											id: "edit_form",
											header: "",
											label: "",
											template: "<span class='go-to-edit-form'>{common.editIcon()}</span>",
											css: { 'text-align': 'center' }
										}
									});
								}


								if (typeof isTrashVisible === 'undefined' || isTrashVisible === null)
									isTrashVisible = propertyValues.removable;

								isTrashVisible = isTrashVisible === 'enable'; // Convert to boolean

								self.getDataTableController(viewId).bindColumns(columns, true, isTrashVisible);
								self.populateData(viewId, dataCollection).
									then(function () {
										if (linkedField)
											self.filterLinkedData(viewId, linkedField);
									});
							};

							self.bindColumnList = function (viewId, objectId, selectAll) {
								var data = self.getData(viewId);

								$$(self.componentIds.columnList).clearAll();

								if (!data.columns) return;

								var columns = data.columns.attr().slice(0); // Clone array

								// First time to select this object
								var visibleColumns = data.visibleColumns.slice(0);
								if (selectAll && $.grep(columns, function (d) { return visibleColumns.indexOf(d.id.toString()) > -1; }).length < 1) {
									visibleColumns = visibleColumns.concat($.map(columns, function (d) { return d.id.toString(); }));
								}

								// Initial checkbox
								columns.forEach(function (d) {
									d.markCheckbox = visibleColumns.filter(function (c) { return c == d.id; }).length > 0;
								});

								$$(self.componentIds.columnList).parse(columns);
							};

							self.filterLinkedData = function (viewId, linkedField) {
								var data = self.getData(viewId);

								if (!data.columns) return;

								var field = data.columns.filter(function (col) { return col.id == linkedField; })[0];

								if (data.linkedToDataCollection && field) {
									var currModel = data.linkedToDataCollection.AD.currModel();

									if (currModel) {
										$$(viewId).filter(function (item) {
											var itemValues = item[field.name];

											if (!itemValues) {
												return false;
											}
											else if (itemValues && !itemValues.filter) {
												itemValues = [itemValues]; // Convert to array
											}

											return itemValues.filter(function (f) { return f.id == currModel.id; }).length > 0;
										});
									}
								}
							};

							self.registerEventAggregator = function (event_aggregator) {
								self.event_aggregator = event_aggregator;
							};

							self.callEvent = function (eventName, viewId, data) {
								if (self.event_aggregator) {
									data = data || {};
									data.component_name = self.info.name;
									data.viewId = viewId;

									self.event_aggregator.trigger(eventName, data);
								}
							};

							self.isRendered = function (viewId) {
								return self.getData(viewId).isRendered === true;
							};

							self.editStop = function () {
								$$(self.componentIds.propertyView).editStop();
							};

							function _getMaxWeight(columns) {
								if (!columns) return 0;

								var weightList = columns.map(function (col) { return col.weight; });
								return Math.max.apply(null, weightList);
							}
						},

						populateData: function (viewId, dataCollection) {
							var self = this,
								q = $.Deferred();

							if ($$(viewId).showProgress)
								$$(viewId).showProgress({ type: 'icon' });

							self.getDataTableController(viewId).populateData(dataCollection).then(function () {
								q.resolve();

								if ($$(viewId).hideProgress)
									$$(viewId).hideProgress();
							});

							return q;
						},

						resetState: function () {
							this.data = {};
							this.Model.ObjectModels = {};
							this.controllers.ObjectDataTables = {};
						},

						getInstance: function () {
							return this;
						}


					});

				});
		});
	}
);