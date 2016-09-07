steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/models/ABPage.js',
	'opstools/BuildApp/models/ABObject.js',
	'opstools/BuildApp/models/ABColumn.js',

	'opstools/BuildApp/controllers/webix_custom_components/DynamicDataTable.js',
	'opstools/BuildApp/controllers/webix_custom_components/ActiveList.js',
	'opstools/BuildApp/controllers/webix_custom_components/DataTableFilterPopup.js',
	'opstools/BuildApp/controllers/webix_custom_components/DataTableSortFieldsPopup.js',

	'opstools/BuildApp/controllers/utils/ModelCreator.js',
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
								ABColumn: AD.Model.get('opstools.BuildApp.ABColumn'),
								ObjectModels: {}
							};

							// Controllers
							var DynamicDataTable = AD.Control.get('opstools.BuildApp.DynamicDataTable'),
								ActiveList = AD.Control.get('opstools.BuildApp.ActiveList'),
								FilterPopup = AD.Control.get('opstools.BuildApp.DataTableFilterPopup'),
								SortPopup = AD.Control.get('opstools.BuildApp.DataTableSortFieldsPopup'),
								ModelCreator = AD.Control.get('opstools.BuildApp.ModelCreator');

							self.controllers = {
								DynamicDataTable: new DynamicDataTable(),
								FilterPopup: new FilterPopup(),
								SortPopup: new SortPopup(),
								ModelCreator: new ModelCreator(),
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

							self.initWebixUI();

							self.getView = function () {
								return self.view;
							};

							self.getEditView = function () {
								var viewId = self.componentIds.editDataTable,
									dataTable = $.extend(true, {}, self.getView());

								dataTable.id = viewId;
								dataTable.autoheight = false;
								dataTable.height = 220;

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

															self.renderDataTable(viewId, propertyValues.object, {
																editPage: propertyValues.editPage,
																editForm: propertyValues.editForm
															});
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
										{ label: "Data table", type: "label" },
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
												case 'object':
												case 'filter':
												case 'sort':
													var setting = self.getSettings();
													setting.columns = data.visibleColumns;

													self.populateSettings({ setting: setting }, true);
													break;
												case 'editForm':
												case 'removable':
													var editValue = propertyValues.editForm && propertyValues.editForm.indexOf('|') > -1 ? propertyValues.editForm.split('|') : null;

													self.renderDataTable(viewId, propertyValues.object, {
														editPage: editValue ? editValue[0] : null,
														editForm: editValue ? editValue[1] : null
													}, propertyValues.removable);
													break;
											}
										}
									}
								};
							};

							self.setApp = function (app) {
								self.app = app;

								// Set app info to model creator
								self.controllers.ModelCreator.setApp(app);
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

							self.render = function (viewId, comId, settings, editable) {
								var q = $.Deferred(),
									data = self.getData(viewId),
									dataTableController = self.getDataTableController(viewId);

								webix.extend($$(viewId), webix.ProgressBar);
								$$(viewId).clearAll();
								$$(viewId).showProgress({ type: 'icon' });

								data.id = comId;

								if (settings.columns)
									data.visibleColumns = $.map(settings.columns, function (cId) { return cId.toString(); });

								var dataTableController = self.getDataTableController(viewId);
								dataTableController.bindColumns([], true, settings.removable);
								dataTableController.registerDeleteRowHandler(function (deletedId) {
									$$(viewId).showProgress({ type: 'icon' });

									self.Model.ObjectModels[settings.object].Cached.destroy(deletedId.row)
										.fail(function (err) {
											// TODO message
											$$(viewId).hideProgress();
										})
										.then(function (data) {
											$$(viewId).remove(data.id);

											// TODO message

											$$(viewId).hideProgress();
										});
								});

								AD.util.async.parallel([
									function (callback) {
										self.objects = null;

										// Get object list
										self.Model.ABObject.findAll({ application: self.app.id })
											.fail(function (err) { callback(err); })
											.then(function (result) {
												result.forEach(function (o) {
													if (o.translate)
														o.translate();
												});

												self.objects = result;

												dataTableController.setObjectList(self.objects);

												// Set object data model
												var object = $.grep(self.objects.attr(), function (obj) { return obj.id == settings.object; })[0];
												if (object) {
													self.controllers.ModelCreator.getModel(object.name)
														.fail(function (err) { callback(err); })
														.then(function (objectModel) {
															self.Model.ObjectModels[settings.object] = objectModel;

															callback();
														});
												}
												else { callback(); }
											});
									},
									function (callback) {
										data.columns = null;

										if (!settings.object) {
											callback();
											return;
										}

										// Get object list
										self.Model.ABColumn.findAll({ object: settings.object })
											.fail(function (err) { callback(err); })
											.then(function (result) {
												result.forEach(function (d) {
													if (d.translate) d.translate();
												});

												data.columns = result;

												callback();
											});
									}
								], function (err, results) {
									if (err) {
										q.reject(err);
										return;
									}

									self.renderDataTable(viewId, settings.object, {
										editPage: settings.editPage,
										editForm: settings.editForm
									}, settings.removable);

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

									if (settings.filter === 'enable')
										action_buttons.push({ view: 'button', label: 'Add filters', popup: self.componentIds.filterFieldsPopup, icon: "filter", type: "icon", width: 120, badge: 0 });

									if (settings.sort === 'enable')
										action_buttons.push({ view: 'button', label: 'Apply sort', popup: self.componentIds.sortFieldsPopup, icon: "sort", type: "icon", width: 120, badge: 0 });

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

									if (settings.filter === 'enable') {
										$$(self.componentIds.filterFieldsPopup).registerDataTable($$(viewId));
										$$(self.componentIds.filterFieldsPopup).setFieldList(columns);
									}

									if (settings.sort === 'enable') {
										$$(self.componentIds.sortFieldsPopup).registerDataTable($$(viewId));
										$$(self.componentIds.sortFieldsPopup).setFieldList(columns);
									}


									self.getDataTableController(viewId).registerItemClick(function (id, e, node) {
										if (e.target.className.indexOf('fa-pencil') > -1) {
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

									q.resolve();
								});

								return q;
							};

							self.getSettings = function () {
								var propertyValues = $$(self.componentIds.propertyView).getValues(),
									columns = $.map($$(self.componentIds.editDataTable).config.columns, function (c) { return [c.dataId]; }),
									editForm = propertyValues.editForm && propertyValues.editForm.split('|') || null,
									editPageId = editForm && editForm[0] || null,
									editFormId = editForm && editForm[1] || null;

								var settings = {
									title: propertyValues.title || '',
									description: propertyValues.description || '',
									object: propertyValues.object,
									editPage: editPageId,
									editForm: editFormId,
									columns: columns.filter(function (c) { return c; }),
									removable: propertyValues.removable,
									filter: propertyValues.filter,
									sort: propertyValues.sort
								};

								return settings;
							}

							self.populateSettings = function (item, selectAll) {
								webix.extend($$(self.componentIds.columnList), webix.ProgressBar);

								$$(self.componentIds.columnList).showProgress({ type: 'icon' });

								var viewId = self.componentIds.editDataTable,
									data = self.getData(viewId);

								// Render dataTable component
								self.render(viewId, item.id, item.setting, true).then(function () {
									// Columns list
									self.bindColumnList(viewId, item.setting.object, selectAll);
									$$(self.componentIds.columnList).hideProgress();

									// Properties
									async.series([
										function (next) {
											// Data source - Object
											var item = $$(self.componentIds.propertyView).getItem('object');
											item.options = $.map(self.objects, function (o) {
												return {
													id: o.id,
													value: o.label
												};
											});

											next();
										},
										function (next) {
											// Data table - Edit form
											var parentId = self.data.page.parent ? self.data.page.parent.attr('id') : self.data.page.attr('id');

											AD.comm.service.get({
												url: '/app_builder/abpage?or[0][id]=' + parentId + '&or[1][parent]=' + parentId
											})
												.fail(function (err) { next(err); })
												.then(function (pages) {
													var formComponents = [];

													pages.forEach(function (p) {
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

													var editFormItem = $$(self.componentIds.propertyView).getItem('editForm');
													editFormItem.options = formComponents;
													editFormItem.options.splice(0, 0, {
														id: null,
														value: '[none]'
													});

													next();
												});
										},
										function (next) {
											// Set property values
											var editForm;
											if (item.setting.editPage && item.setting.editForm)
												editForm = item.setting.editPage + '|' + item.setting.editForm;

											$$(self.componentIds.propertyView).setValues({
												title: item.setting.title || '',
												description: item.setting.description || '',
												object: item.setting.object,
												editForm: editForm,
												removable: item.setting.removable || 'disable',
												filter: item.setting.filter || 'disable',
												sort: item.setting.sort || 'disable'
											});

											$$(self.componentIds.propertyView).refresh();
										}
									]);

								});
							};

							self.renderDataTable = function (viewId, objectId, editValue, isTrashVisible) {
								var data = self.getData(viewId);

								if (!data.columns) return;

								var propertyValues = $$(self.componentIds.propertyView).getValues();

								var columns = data.columns.filter(function (c) {
									return data.visibleColumns.filter(function (v) { return v == c.id }).length > 0;
								}).slice(0);
								if (columns.length < 1) columns = data.columns.slice(0); // Show all


								if (editValue.editPage && editValue.editForm) {
									columns.push({
										width: 45,
										setting: {
											id: "appbuilder_go_to_edit_form",
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
								self.populateData(viewId, objectId);
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

							self.editStop = function () {
								$$(self.componentIds.propertyView).editStop();
							};
						},

						initWebixUI: function () {
							webix.ui({
								id: this.componentIds.filterFieldsPopup,
								view: "filter_popup",
							}).hide();

							webix.ui({
								id: this.componentIds.sortFieldsPopup,
								view: "sort_popup",
							}).hide();
						},

						populateData: function (viewId, objectId) {
							var self = this,
								q = $.Deferred();

							if (!self.Model.ObjectModels[objectId]) {
								q.resolve();
								return q;
							}

							if ($$(viewId).showProgress)
								$$(viewId).showProgress({ type: 'icon' });

							self.Model.ObjectModels[objectId].findAll({})
								.fail(function (err) {
									q.reject(err);

									if ($$(viewId).hideProgress)
										$$(viewId).hideProgress();
								})
								.then(function (result) {
									self.getDataTableController(viewId).populateDataToDataTable(result).then(function () {
										q.resolve();

										if ($$(viewId).hideProgress)
											$$(viewId).hideProgress();
									});
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