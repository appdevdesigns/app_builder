
steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/webix_custom_components/DataTableAddFieldPopup.js',
	'opstools/BuildApp/controllers/webix_custom_components/DataTableEditor.js',
	'opstools/BuildApp/controllers/webix_custom_components/DataTableFilterPopup.js',
	'opstools/BuildApp/controllers/webix_custom_components/DataTableVisibleFieldsPopup.js',
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

							this.data = {};

							this.webixUiId = {
								modelToolbar: 'ab-model-toolbar',
								modelDatatable: 'ab-model-datatable',

								editHeaderPopup: 'ab-edit-header-popup',
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
																// TODO: Call server to delete model data
																$$(self.webixUiId.modelDatatable).showProgress({ type: "icon" });

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
										// TODO : Get columns from server
										var columns = [
											{ id: "name", header: "<div class='ab-model-data-header'><span class='webix_icon fa-{0}'></span>{1}<i class='ab-model-data-header-edit fa fa-angle-down'></i></div>".replace('{0}', 'font').replace('{1}', 'Name'), editor: "text", filter_type: "text", adjust: true },
											{ id: "description", header: "<div class='ab-model-data-header'><span class='webix_icon fa-{0}'></span>{1}<i class='ab-model-data-header-edit fa fa-angle-down'></i></div>".replace('{0}', 'align-right').replace('{1}', 'Description'), editor: "popup", filter_type: "text", adjust: true }
										];

										if (Math.floor((Math.random() * 10) + 1) % 2 === 0)
											columns.push({ id: "optional", header: "<div class='ab-model-data-header'><span class='webix_icon fa-{0}'></span>{1}<i class='ab-model-data-header-edit fa fa-angle-down'></i></div>".replace('{0}', 'align-right').replace('{1}', 'Optional'), editor: "popup", filter_type: "text", adjust: true });

										$$(self.webixUiId.modelDatatable).define('columns', columns);

										next();
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
									$$(self.webixUiId.modelDatatable).refreshColumns();
									$$(self.webixUiId.modelDatatable).refresh();

									// Register table to popups
									$$(self.webixUiId.filterFieldsPopup).registerDataTable($$(self.webixUiId.modelDatatable));
									$$(self.webixUiId.visibleFieldsPopup).registerDataTable($$(self.webixUiId.modelDatatable));
									$$(self.webixUiId.addFieldsPopup).registerDataTable($$(self.webixUiId.modelDatatable));

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


						}

					});

				});
		});

	});