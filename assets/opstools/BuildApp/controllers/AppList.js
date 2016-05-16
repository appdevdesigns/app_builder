
steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/models/ABApplication.js',
	function () {
        System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control').then(function () {

					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.AppList', {


						init: function (element, options) {
							var self = this;
							options = AD.defaults({
								selectedAppEvent: 'AB_Application.Selected'
							}, options);
							this.options = options;

							// Call parent init
							this._super(element, options);


							this.dataSource = this.options.dataSource; // AD.models.Projects;

                            this.Model = AD.Model.get('opstools.BuildApp.ABApplication');
							this.data = [];

							webix.ready(function () {
								self.initWebixUI();
								self.loadData();
							});
						},

						initWebixUI: function () {
							var self = this;
							self.webixUiId = {
								appView: "ab-app-view",
								appListRow: 'ab-app-list-row',
								appListToolbar: 'ab-app-list-toolbar',
								appList: 'ab-app-list',
								appListMenu: 'ab-app-list-menu',
								appListFormView: 'ab-app-list-form-view',
								appListForm: 'ab-app-list-form',
								appListLoading: 'ab-app-list-loading'
							};

							// Application list
							var appListControl = {
								id: self.webixUiId.appListRow,
								autoheight: true,
								autowidth: true,
								rows: [
									{
										view: "toolbar",
										id: self.webixUiId.appListToolbar,
										cols: [
											{ view: "label", label: "Applications", fillspace: true },
											{
												view: "button", value: "Add new application", width: 200,
												click: function () {
													self.resetState();
													$$(self.webixUiId.appListFormView).show();
												}
											}]
									},
									{
										id: self.webixUiId.appList,
										view: "list",
										minHeight: 227,
										autowidth: true,
										template: "<div class='ab-app-list-item'>" +
										"<div class='ab-app-list-info'>" +
										"<div class='ab-app-list-name'>#name#</div>" +
										"<div class='ab-app-list-description'>#description#</div>" +
										"</div>" +
										"<div class='ab-app-list-edit'>" +
										"{common.iconGear}" +
										"</div>" +
										"</div>",
										type: {
											height: 100, // Defines item height
											iconGear: "<span class='webix_icon fa-cog'></span>"
										},
										select: false,
										onClick: {
											"ab-app-list-item": function (e, id, trg) {
												this.select(id);
												var selectedApp = $$(self.webixUiId.appList).getSelectedItem();

												// Trigger select app event
												self.element.trigger(self.options.selectedAppEvent, selectedApp);

												return false; //here it blocks default behavior
											},
											"ab-app-list-edit": function (e, id, trg) {
												// Show menu
												$$(self.webixUiId.appListMenu).show(trg);
												this.select(id);

												return false; //here it blocks default behavior
											}
										}
									}
								]
							};

							// Application menu
							webix.ui({
								view: "popup",
								id: self.webixUiId.appListMenu,
								head: "Application Menu",
								width: 100,
								body: {
									view: "list",
									data: [
										{ command: "Edit", icon: "fa-pencil-square-o" },
										{ command: "Delete", icon: "fa-trash" }
									],
									datatype: "json",

									template: "<i class='fa #icon#' aria-hidden='true'></i> #command#",
									autoheight: true,
									select: false,
									on: {
										'onItemClick': function (timestamp, e, trg) {
											var selectedApp = $$(self.webixUiId.appList).getSelectedItem();

											switch (trg.textContent.trim()) {
												case 'Edit':
													$$(self.webixUiId.appListFormView).show();

													// Popuplate data to form
													for (var key in selectedApp) {
														if ($$(self.webixUiId.appListForm).elements[key])
															$$(self.webixUiId.appListForm).elements[key].setValue(selectedApp[key]);
													}
													break;
												case 'Delete':
													// TODO : Get from translation
													var deleteConfirmTitle = "Delete application",
														deleteConfirmMessage = "Do you want to delete <b>{0}</b>?".replace('{0}', selectedApp.name),
														yes = "Yes",
														no = "No";

													webix.confirm({
														title: deleteConfirmTitle,
														ok: yes,
														cancel: no,
														text: deleteConfirmMessage,
														callback: function (result) {
															if (result) {
																// Delete application data
																$$(self.webixUiId.appList).showProgress({ type: "icon" });
																self.Model.destroy(selectedApp.id)
																	.fail(function (err) {
																		$$(self.webixUiId.appList).hideProgress();

																		webix.message({
																			type: "error",
																			text: "System could not delete <b>{0}</b>.".replace("{0}", selectedApp.name)
																		});

																		AD.error.log('App Builder : Error delete application data', { error: err });
																	})
																	.then(function (result) {
																		self.data.forEach(function (item, index, list) {
																			if (item && item.id === result.id)
																				self.data.splice(index, 1);
																		});

																		self.refreshList();

																		$$(self.webixUiId.appList).hideProgress();

																		webix.message({
																			type: "success",
																			text: "<b>" + selectedApp.name + "</b> is deleted."
																		});
																	});
															}

															self.resetState();
														}
													});

													break;
											}

											$$(self.webixUiId.appListMenu).hide();
										}
									}
								}
							}).hide();

							// Application form
							var appFormControl = {
								id: self.webixUiId.appListFormView,
								scroll: true,
								rows: [
									{
										view: "toolbar",
										cols: [{ view: "label", label: "Application Info", fillspace: true }]
									},
									{
										view: "form",
										id: self.webixUiId.appListForm,
										elements: [
											{ view: "text", label: "Name", name: "name", required: true, placeholder: "Application name", labelWidth: 100 },
											{ view: "textarea", label: "Description", name: "description", placeholder: "Application description", labelWidth: 100, height: 150 },
											{
												margin: 5, cols: [
													{ fillspace: true },
													{
														view: "button", label: "Save", type: "form", width: 100, click: function () {
															if (!$$(self.webixUiId.appListForm).validate())
																return false;

															var selectedId = $$(self.webixUiId.appList).getSelectedId();

															var updateData = {
																name: $$(self.webixUiId.appListForm).elements['name'].getValue(),
																label: $$(self.webixUiId.appListForm).elements['name'].getValue(),
																description: $$(self.webixUiId.appListForm).elements['description'].getValue()
															};

															$$(self.webixUiId.appListForm).showProgress({ type: 'icon' });
															if (selectedId) { // Update application data
																self.Model.update(selectedId, updateData)
																	.fail(function (err) {
																		$$(self.webixUiId.appListForm).hideProgress();

																		webix.message({
																			type: "error",
																			text: "System could not update <b>" + result.name + "</b>." // TODO : translation
																		});

																		AD.error.log('App Builder : Error update application data', { error: err });

																	})
																	.then(function (result) {
																		var existApp = self.data.filter(function (item, index, list) {
																			return item.id === result.id;
																		})[0];

																		for (var key in result) {
																			existApp.attr(key, result[key]);
																		}
																		self.refreshList();

																		$$(self.webixUiId.appListForm).hideProgress();
																		$$(self.webixUiId.appListRow).show();

																		webix.message({
																			type: "success",
																			text: "<b>" + result.name + "</b> is updated." // TODO : translation
																		});

																	});
															} else { // Create application data
																self.Model.create(updateData)
																	.fail(function (err) {
																		$$(self.webixUiId.appListForm).hideProgress();

																		webix.message({
																			type: "error",
																			text: "System could not create <b>" + result.name + "</b>." // TODO : translation
																		});

																		AD.error.log('App Builder : Error create application data', { error: err });
																	})
																	.then(function (result) {
																		self.data.push(result);
																		self.refreshList();

																		$$(self.webixUiId.appListForm).hideProgress();
																		$$(self.webixUiId.appListRow).show();

																		webix.message({
																			type: "success",
																			text: "<b>" + result.name + "</b> is created." // TODO : translation
																		});

																	});
															}
														}
													},
													{
														view: "button", value: "Cancel", width: 100, click: function () {
															self.resetState();
															$$(self.webixUiId.appListRow).show();
														}
													}

												]
											}
										]
									}
								]
							};

							// Application multi-views
							webix.ui({
								container: self.element[0],
								id: self.webixUiId.appView,
								autoheight: true,
								cells: [
									appListControl,
									appFormControl
								]
							});

							// Define loading cursor & overlay
							webix.extend($$(self.webixUiId.appList), webix.ProgressBar);
							webix.extend($$(self.webixUiId.appList), webix.OverlayBox);
							webix.extend($$(self.webixUiId.appListForm), webix.ProgressBar);
						},

						loadData: function () {
							var self = this;

							// Get applications data from the server
							$$(self.webixUiId.appList).showProgress({ type: "icon" });
							self.Model.findAll()
								.fail(function (err) {
									$$(self.webixUiId.appList).hideProgress();
									webix.message({
										type: "error",
										text: err
									});
									AD.error.log('App Builder : Error loading application data', { error: err });
								})
								.then(function (data) {
									self.data = data;

									self.refreshList();
								});

						},

						resetState: function () {
							var self = this;

							$$(self.webixUiId.appList).unselectAll();
							$$(self.webixUiId.appListForm).clear();
							$$(self.webixUiId.appListForm).clearValidation();
						},

						refreshList: function () {
							var self = this;

							$$(self.webixUiId.appList).clearAll();
							$$(self.webixUiId.appList).parse(self.data.attr());

							if (!$$(self.webixUiId.appList).count()) //if no data is available
								$$(self.webixUiId.appList).showOverlay("There is no application data"); // TODO: translate
							else
								$$(self.webixUiId.appList).hideOverlay();

							$$(self.webixUiId.appList).refresh();
						},

						resize: function (height) {
							var self = this;

							var appListDom = $(self.element);

							if (appListDom) {
								var width = appListDom.parent().css('width');
								if (width) {
									width = parseInt(width.replace('px', ''));
								}
								appListDom.width(width - 410);

								$$(self.webixUiId.appList).define('height', height - 140);
								$$(self.webixUiId.appList).adjust();

								var computedHeight = height - 140;
								if (appListDom.css('min-height') < computedHeight)
									appListDom.height(computedHeight);
								else
									appListDom.height(appListDom.css('min-height'));

								if (self.webixUiId && self.webixUiId.appView)
									$$(self.webixUiId.appView).adjust();
							}
						}


					});

				});
		});

	});