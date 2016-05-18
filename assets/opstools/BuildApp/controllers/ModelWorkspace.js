
steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/webix_custom_components/DataTableAddFieldPopup.js',
	'opstools/BuildApp/controllers/webix_custom_components/DataTableEditor.js',
	'opstools/BuildApp/controllers/webix_custom_components/DataTableFilterPopup.js',
	'opstools/BuildApp/controllers/webix_custom_components/DataTableVisibleFieldsPopup.js',
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
								newFieldName: 'ab-new-name-header',

								visibleFieldsPopup: 'ab-visible-fields-popup',
								filterFieldsPopup: 'ab-filter-popup',
								addFieldsPopup: 'ab-add-fields-popup'
							};

							this.initControllers();
							this.initWebixUI();

						},

						initControllers: function () {
							this.controllers = {};

							var AddFieldPopup = AD.Control.get('opstools.BuildApp.DataTableAddFieldPopup'),
								DataTableEditor = AD.Control.get('opstools.BuildApp.DataTableEditor'),
								FilterPopup = AD.Control.get('opstools.BuildApp.DataTableFilterPopup'),
								VisibleFieldsPopup = AD.Control.get('opstools.BuildApp.DataTableVisibleFieldsPopup');

							this.controllers.AddFieldPopup = new AddFieldPopup();
							this.controllers.DataTableEditor = new DataTableEditor();
							this.controllers.FilterPopup = new FilterPopup();
							this.controllers.VisibleFieldsPopup = new VisibleFieldsPopup();
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
								id: self.webixUiId.addFieldsPopup,
								view: "add_fields_popup",
							}).hide();

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
															selectedModel.attr('name', newName);
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

																	webix.message({
																		type: "success",
																		text: "Rename to <b>" + newName + "</b>."
																	});

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

							webix.ui({
								id: self.webixUiId.editHeaderPopup,
								view: 'popup',
								width: 180,
								body: {
									view: 'list',
									data: [
										{ command: "Hide field", icon: "fa-columns" },
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
												selectedField = {};

											columns.each(function (c) {
												if (c.id == self.data.selectedFieldId)
													selectedField = c;
											});

											var selectedFieldName = $(selectedField.header[0].text).text().trim();

											switch (trg.textContent.trim()) {
												case 'Hide field':
													$$(self.webixUiId.modelDatatable).hideColumn(self.data.selectedFieldId);
													$$(self.webixUiId.editHeaderPopup).hide();
													break;
												case 'Rename field':
													// TODO : Show old name in head popup
													// $$(self.webixUiId.renameHeaderPopup).define('head', "Rename <b>{0}</b> column".replace('{0}', ''));
													$$(self.webixUiId.renameHeaderPopup).config.head = "Rename <b>{0}</b> column".replace('{0}', '');
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
																self.Model.destroy(selectedField.id)
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
																		columns.removeAt(columns.find(selectedField));
																		$$(self.webixUiId.modelDatatable).refreshColumns();

																		$$(self.webixUiId.editHeaderPopup).hide();

																		webix.message({
																			type: "success",
																			text: "<b>" + selectedFieldName + "</b> is deleted."
																		});

																		// Clear selected field
																		self.data.selectedFieldId = null;

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

							self.data.definition = {
								rows: [
									{
										view: 'toolbar',
										id: self.webixUiId.modelToolbar,
										cols: [
											{ view: "button", label: "Hide fields", icon: "columns", type: "icon", width: 120, popup: self.webixUiId.visibleFieldsPopup },
											{ view: 'button', label: "Add filters", icon: "filter", type: "icon", width: 120, popup: self.webixUiId.filterFieldsPopup },
											{ view: 'button', label: 'Apply sort', icon: "sort", type: "icon", width: 120 },
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
										ready: function () {
											webix.extend(this, webix.ProgressBar);
										},
										on: {
											onHeaderClick(id, e, trg) {
												self.data.selectedFieldId = id.column;

												$$(self.webixUiId.editHeaderPopup).show(trg);
											},
											onAfterSelect: function (data, prevent) {
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

							// Clear columns & data
							$$(self.webixUiId.modelDatatable).clearAll();
							$$(self.webixUiId.modelDatatable).refresh();
							$$(self.webixUiId.modelDatatable).define('columns', []);
							$$(self.webixUiId.modelDatatable).refreshColumns();

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
												self.data.columns = data;

												self.bindColumns();

												next();

											});
									},
									function (next) {
										// TODO : Get data from server
										var data = [
											{ name: 'Test 1', description: 'Description 1', optional: 'Option 1' },
											{ name: 'Test 2', description: 'Description 2', optional: 'Option 2' },
											{ name: 'Test 3', description: 'Description 3', optional: 'Option 3' }
										];

										$$(self.webixUiId.modelDatatable).parse(data);

										next();
									}
								], function () {
									$$(self.webixUiId.modelDatatable).refresh();

									// Register table to popups
									$$(self.webixUiId.filterFieldsPopup).registerDataTable($$(self.webixUiId.modelDatatable));
									$$(self.webixUiId.visibleFieldsPopup).registerDataTable($$(self.webixUiId.modelDatatable));
									$$(self.webixUiId.addFieldsPopup).registerDataTable($$(self.webixUiId.modelDatatable));

									// Register add new column callback
									$$(self.webixUiId.addFieldsPopup).registerAddNewFieldEvent(function (columnInfo) {

										if ($$(self.webixUiId.modelDatatable).showProgress)
											$$(self.webixUiId.modelDatatable).showProgress({ type: 'icon' });

										var newColumn = {
											object: self.data.modelId,
											name: columnInfo.name,
											label: columnInfo.name,
											type: columnInfo.type,
											setting: columnInfo.setting
										};

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
												// Add new column
												var columns = webix.toArray($$(self.webixUiId.modelDatatable).config.columns);
												var addColumnHeader = $.extend(columnInfo.setting, {
													id: data.id,
													header: self.getHeader(columnInfo.setting.icon, columnInfo.name)
												});

												columns.insertAt(addColumnHeader, $$(self.webixUiId.modelDatatable).config.columns.length);
												$$(self.webixUiId.modelDatatable).refreshColumns();

												$$(self.webixUiId.modelDatatable).hideProgress();

												webix.message({ type: "success", text: "<b>{0}</b> is added.".replace("{0}", columnInfo.name) });
											});


									});

									if ($$(self.webixUiId.modelDatatable).hideProgress)
										$$(self.webixUiId.modelDatatable).hideProgress();

								});
							}
							else {
								$$(self.webixUiId.modelDatatable).refreshColumns();
								$$(self.webixUiId.modelDatatable).refresh();

								if ($$(self.webixUiId.modelDatatable).hideProgress)
									$$(self.webixUiId.modelDatatable).hideProgress();
							}

						},

						bindColumns: function () {
							var self = this;

							var columns = $.map(self.data.columns.attr(), function (col, i) {
								return $.extend(col.setting, {
									id: col.id,
									header: self.getHeader(col.setting.icon, col.name)
								});
							});

							$$(self.webixUiId.modelDatatable).define('columns', columns);

							$$(self.webixUiId.modelDatatable).refreshColumns();
						},

						getHeader: function (icon, name) {
							return "<div class='ab-model-data-header'><span class='webix_icon fa-{0}'></span>{1}<i class='ab-model-data-header-edit fa fa-angle-down'></i></div>"
								.replace('{0}', icon)
								.replace('{1}', name);
						}

					});

				});
		});

	});