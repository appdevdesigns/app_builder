steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/models/ABObject.js',
	'opstools/BuildApp/models/ABColumn.js',

	'opstools/BuildApp/controllers/webix_custom_components/ActiveList.js',

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
								ABObject: AD.Model.get('opstools.BuildApp.ABObject'),
								ABColumn: AD.Model.get('opstools.BuildApp.ABColumn'),
								ABPage: AD.Model.get('opstools.BuildApp.ABPage'),
								ObjectModels: {}
							};

							// Controllers
							var ActiveList = AD.Control.get('opstools.BuildApp.ActiveList'),
								ModelCreator = AD.Control.get('opstools.BuildApp.ModelCreator')

							self.controllers = {
								ModelCreator: new ModelCreator(),
								ObjectDataTables: {}
							};

							self.componentIds = {
								editView: self.info.name + '-edit-view',
								editDataTable: 'ab-datatable-edit-mode',

								columnList: 'ab-datatable-columns-list',

								propertyView: self.info.name + '-property-view'
							};

							self.view = {
								view: "datatable",
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
											template: "<div class='ab-page-grid-column-item'>" +
											"<div class='column-checkbox'>{common.markCheckbox()}</div>" +
											"<div class='column-name'>#label#</div>" +
											"</div>",
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
										// { label: "Add new row", type: "checkbox" }  // TODO
									],
									on: {
										onAfterEditStop: function (state, editor, ignoreUpdate) {
											if (ignoreUpdate || state.old == state.value) return false;

											var viewId = self.componentIds.editDataTable,
												data = self.getData(viewId),
												propertyValues = $$(self.componentIds.propertyView).getValues();

											switch (editor.id) {
												case 'object':
													var settings = self.getSettings();
													settings.columns = data.visibleColumns;

													self.populateSettings(settings, true);
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

							self.render = function (viewId, settings) {
								var q = $.Deferred(),
									data = self.getData(viewId),
									dataTableController = self.getDataTableController(viewId);

								webix.extend($$(viewId), webix.ProgressBar);
								$$(viewId).clearAll();
								$$(viewId).showProgress({ type: 'icon' });

								if (settings.columns)
									data.visibleColumns = $.map(settings.columns, function (cId) { return cId.toString(); });

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

									$$(viewId).attachEvent('onAfterRender', function (data) {
										self.callEvent('renderComplete', viewId);
									});

									self.getDataTableController(viewId).registerItemClick(function (id, e, node) {
										if (e.target.className.indexOf('fa-pencil') > -1) {
											self.callEvent('edit', viewId, { selected_data: id });
										}
									});

									q.resolve();
								});

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

								return q;
							};

							self.getSettings = function () {
								var propertyValues = $$(self.componentIds.propertyView).getValues(),
									columns = $.map($$(self.componentIds.editDataTable).config.columns, function (c) { return [c.dataId]; }),
									editForm = propertyValues.editForm && propertyValues.editForm.split('|') || null,
									editPageId = editForm && editForm[0] || null,
									editFormId = editForm && editForm[1] || null;

								var settings = {
									object: propertyValues.object,
									editPage: editPageId,
									editForm: editFormId,
									columns: columns.filter(function (c) { return c; }),
									removable: propertyValues.removable
								};

								return settings;
							}

							self.populateSettings = function (settings, selectAll) {
								webix.extend($$(self.componentIds.columnList), webix.ProgressBar);

								$$(self.componentIds.columnList).showProgress({ type: 'icon' });

								var viewId = self.componentIds.editDataTable,
									data = self.getData(viewId);

								// Render dataTable component
								self.render(viewId, settings).then(function () {
									// Columns list
									self.bindColumnList(viewId, settings.object);
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

											self.Model.ABPage.findAll({ or: [{ id: parentId }, { parent: parentId }] }) // Get children
												.fail(function (err) { next(err); })
												.then(function (pages) {
													var formComponents = [];

													pages.forEach(function (p) {
														if (p.translate)
															p.translate();

														// Filter form components
														var forms = p.components.filter(function (c) {
															return c.component === "Form" && c.setting && settings && c.setting.object === settings.object;
														});

														if (forms && forms.length > 0) {
															formComponents = formComponents.concat($.map(forms, function (f) {
																return [{
																	id: p.id + '|' + f.id,
																	value: p.label + ' - ' + f.component
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
											if (settings.editPage && settings.editForm)
												editForm = settings.editPage + '|' + settings.editForm;

											$$(self.componentIds.propertyView).setValues({
												object: settings.object,
												editForm: editForm,
												removable: settings.removable || 'disable'
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

							self.bindColumnList = function (viewId, selectAll) {
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

						populateData: function (viewId, objectId) {
							var self = this,
								q = $.Deferred();

							if (!self.Model.ObjectModels[objectId]) {
								q.resolve();
								return q;
							}

							if ($$(viewId).showProgress)
								$$(viewId).showProgress({ type: 'icon' });

							self.Model.ObjectModels[objectId].Cached.unbind('refreshData');
							self.Model.ObjectModels[objectId].Cached.bind('refreshData', function (ev, data) {
								if (this == self.Model.ObjectModels[objectId].Cached)
									self.getDataTableController(viewId).populateDataToDataTable(data.result);
							});

							self.Model.ObjectModels[objectId].Cached.findAll({})
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