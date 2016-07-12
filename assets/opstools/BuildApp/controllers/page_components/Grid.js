steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/models/ABObject.js',
	'opstools/BuildApp/models/ABColumn.js',

	'opstools/BuildApp/controllers/webix_custom_components/ActiveList.js',

	'opstools/BuildApp/controllers/utils/ModelCreator.js',

	'opstools/BuildApp/controllers/ObjectDataTable.js',
	function () {
        System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control').then(function () {

					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.Components.Grid', {

						init: function (element, options) {
							var self = this;

							self.data = {};
							self.data.visibleColumns = []; // [columnId1, ..., columnIdn]
							self.info = {
								name: 'Grid',
								icon: 'fa-table'
							};

							// Model
							self.Model = {
								ABObject: AD.Model.get('opstools.BuildApp.ABObject'),
								ABColumn: AD.Model.get('opstools.BuildApp.ABColumn')
							};

							// Controllers
							var ActiveList = AD.Control.get('opstools.BuildApp.ActiveList'),
								ModelCreator = AD.Control.get('opstools.BuildApp.ModelCreator'),
								ObjectDataTable = AD.Control.get('opstools.BuildApp.ObjectDataTable');

							self.controllers = {
								ModelCreator: new ModelCreator,
								ObjectDataTable: new ObjectDataTable()
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
								var dataTable = $.extend(true, {}, self.getView());
								dataTable.id = self.componentIds.editDataTable;

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
															var item_id = this.config.$masterId;

															if (this.getValue()) // Check
																self.data.visibleColumns.push(item_id);
															else // Uncheck
															{
																var index = self.data.visibleColumns.indexOf(item_id);
																if (index > -1)
																	self.data.visibleColumns.splice(index, 1);
															}

															self.renderDataTable();
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
										// { label: "Editable", type: "checkbox" }, // TODO
										{
											id: 'removable',
											name: 'removable',
											type: 'richselect',
											label: 'Removable',
											options: [
												{ id: 'enable', value: "True" },
												{ id: 'disable', value: "False" },
											]
										},
										// { label: "Add new row", type: "checkbox" }  // TODO
									],
									on: {
										onAfterEditStop: function (state, editor, ignoreUpdate) {
											if (ignoreUpdate || state.old == state.value) return false;

											var propertyValues = $$(self.componentIds.propertyView).getValues();

											switch (editor.id) {
												case 'object':
													var settings = self.getSettings();
													settings.columns = self.data.visibleColumns;

													self.populateSettings(settings, true);
													break;
												case 'removable':
													self.renderDataTable(propertyValues.removable);
													break;
											}
										}
									}
								};
							};

							self.setApp = function (app) {
								self.data.app = app;

								// Set app info to model creator
								self.controllers.ModelCreator.setApp(app);

								// Set app info to object data table util
								self.controllers.ObjectDataTable.setApp(app);
							};

							self.render = function (viewId, settings, selectAll) {
								var q = $.Deferred();

								webix.extend($$(viewId), webix.ProgressBar);
								$$(viewId).clearAll();
								$$(viewId).showProgress({ type: 'icon' });

								AD.util.async.parallel([
									function (callback) {
										// Get object list
										self.Model.ABObject.findAll({ application: self.data.app.id })
											.fail(function (err) { callback(err); })
											.then(function (result) {
												result.forEach(function (o) {
													if (o.translate)
														o.translate();
												});

												self.data.objects = result;

												self.controllers.ObjectDataTable.setObjectList(self.data.objects);

												// Set object data model
												var object = $.grep(self.data.objects.attr(), function (obj) { return obj.id == settings.object; })[0];
												if (object) {
													self.controllers.ModelCreator.getModel(object.name)
														.fail(function (err) { callback(err); })
														.then(function (objectModel) {
															self.Model.ObjectModel = objectModel;

															callback();
														});
												}
												else { callback(); }
											});
									},
									function (callback) {
										if (!settings.object) {
											callback();
											return;
										}

										// Get object list
										self.Model.ABColumn.findAll({ object: settings.object })
											.fail(function (err) { callback(err); })
											.then(function (data) {
												data.forEach(function (d) {
													if (d.translate) d.translate();
												});

												self.data.columns = data;

												callback();
											});
									}
								], function (err, results) {
									if (err) {
										q.reject(err);
										return;
									}

									self.renderDataTable(settings.removable);
									$$(viewId).hideProgress();

									q.resolve();
								});

								self.controllers.ObjectDataTable.registerDataTable($$(viewId));
								self.controllers.ObjectDataTable.bindColumns([], true, settings.removable);
								self.controllers.ObjectDataTable.registerDeleteRowHandler(function (deletedId) {
									$$(viewId).showProgress({ type: 'icon' });

									self.Model.ObjectModel.destroy(deletedId.row)
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
									columns = $.map($$(self.componentIds.editDataTable).config.columns, function (c) { return [c.dataId]; });

								var settings = {
									object: propertyValues.object,
									columns: columns.filter(function (c) { return c; }),
									removable: propertyValues.removable
								};

								return settings;
							}

							self.populateSettings = function (settings, selectAll) {
								webix.extend($$(self.componentIds.columnList), webix.ProgressBar);

								$$(self.componentIds.columnList).showProgress({ type: 'icon' });

								if (settings.columns)
									self.data.visibleColumns = $.map(settings.columns, function (cId) { return cId.toString(); });

								// Render dataTable component
								self.render(self.componentIds.editDataTable, settings, selectAll).then(function () {
									// Columns list
									self.bindColumnList(settings.object);
									$$(self.componentIds.columnList).hideProgress();

									// Properties

									// Data source - Object
									var item = $$(self.componentIds.propertyView).getItem('object');
									item.options = $.map(self.data.objects, function (o) {
										return {
											id: o.id,
											value: o.label
										};
									});

									// Data table - Removable
									$$(self.componentIds.propertyView).setValues({
										object: settings.object,
										removable: settings.removable || 'disable'
									});

									$$(self.componentIds.propertyView).refresh();

								});
							};

							self.renderDataTable = function (includeTrash) {
								if (!self.data.columns) return;

								var propertyValues = $$(self.componentIds.propertyView).getValues();

								if (typeof includeTrash === 'undefined' || includeTrash === null) {
									includeTrash = propertyValues.removable;
								};

								includeTrash = includeTrash === 'enable'; // Convert to boolean

								var columns = self.data.columns.filter(function (c) {
									return self.data.visibleColumns.filter(function (v) { return v == c.id }).length > 0;
								});

								if (columns.length < 1) columns = self.data.columns // Show all

								self.controllers.ObjectDataTable.bindColumns(columns, true, includeTrash);
								self.populateData();
							};

							self.bindColumnList = function (selectAll) {
								$$(self.componentIds.columnList).clearAll();

								if (!self.data.columns) return;

								var data = self.data.columns.attr().slice(0); // Clone array

								// First time to select this object
								var visibleColumns = self.data.visibleColumns.slice(0);
								if (selectAll && $.grep(data, function (d) { return visibleColumns.indexOf(d.id.toString()) > -1; }).length < 1) {
									visibleColumns = visibleColumns.concat($.map(data, function (d) { return d.id.toString(); }));
								}

								// Initial checkbox
								data.forEach(function (d) {
									d.markCheckbox = visibleColumns.filter(function (c) { return c == d.id; }).length > 0;
								});

								$$(self.componentIds.columnList).parse(data);
							};

							self.editStop = function () {
								$$(self.componentIds.propertyView).editStop();
							};
						},

						populateData: function () {
							var self = this,
								q = $.Deferred();

							if (!self.Model.ObjectModel) {
								q.resolve();
								return q;
							}

							if ($$(self.componentIds.editDataTable).showProgress)
								$$(self.componentIds.editDataTable).showProgress({ type: 'icon' });

							self.Model.ObjectModel.findAll({})
								.fail(function (err) {
									q.reject(err);

									if ($$(self.componentIds.editDataTable).hideProgress)
										$$(self.componentIds.editDataTable).hideProgress();
								})
								.then(function (result) {
									self.controllers.ObjectDataTable.populateDataToDataTable(result).then(function () {
										q.resolve();

										if ($$(self.componentIds.editDataTable).hideProgress)
											$$(self.componentIds.editDataTable).hideProgress();
									});
								});

							return q;
						},

						getInstance: function () {
							return this;
						}


					});

				});
		});
	}
);