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
								APP_SELECTED: 'AB_Application.Selected'
							}, options);
							this.options = options;

							// Call parent init
							this._super(element, options);


							this.dataSource = this.options.dataSource; // AD.models.Projects;

							this.Model = AD.Model.get('opstools.BuildApp.ABApplication');
							this.data = [];

							this.initMultilingualLabels();

							webix.ready(function () {
								self.initWebixUI();
								self.loadData();
							});
						},

						initMultilingualLabels: function () {
							var self = this;
							self.labels = {};

							self.labels.common = {};
							self.labels.common.edit = AD.lang.label.getLabel('ab.common.edit') || "Edit";
							self.labels.common.save = AD.lang.label.getLabel('ab.common.save') || "Save";
							self.labels.common.delete = AD.lang.label.getLabel('ab.common.delete') || "Delete";
							self.labels.common.import = AD.lang.label.getLabel('ab.common.import') || "Import";
							self.labels.common.export = AD.lang.label.getLabel('ab.common.export') || "Export";
							self.labels.common.cancel = AD.lang.label.getLabel('ab.common.cancel') || "Cancel";
							self.labels.common.yes = AD.lang.label.getLabel('ab.common.yes') || "Yes";
							self.labels.common.no = AD.lang.label.getLabel('ab.common.no') || "No";
							self.labels.common.createErrorMessage = AD.lang.label.getLabel('ab.common.create.error') || "System could not create <b>{0}</b>.";
							self.labels.common.createSuccessMessage = AD.lang.label.getLabel('ab.common.create.success') || "<b>{0}</b> is created.";
							self.labels.common.updateErrorMessage = AD.lang.label.getLabel('ab.common.update.error') || "System could not update <b>{0}</b>.";
							self.labels.common.updateSucessMessage = AD.lang.label.getLabel('ab.common.update.success') || "<b>{0}</b> is updated.";
							self.labels.common.deleteErrorMessage = AD.lang.label.getLabel('ab.common.delete.error') || "System could not delete <b>{0}</b>.";
							self.labels.common.deleteSuccessMessage = AD.lang.label.getLabel('ab.common.delete.success') || "<b>{0}</b> is deleted.";
							self.labels.common.formName = AD.lang.label.getLabel('ab.common.form.name') || "Name";
							self.labels.common.formDescription = AD.lang.label.getLabel('ab.common.form.description') || "Description";

							self.labels.application = {};
							self.labels.application.title = AD.lang.label.getLabel('ab.application.application') || "Application";
							self.labels.application.createNew = AD.lang.label.getLabel('ab.application.createNew') || "Add new application";
							self.labels.application.menu = AD.lang.label.getLabel('ab.application.menu') || "Application Menu";
							self.labels.application.noApplication = AD.lang.label.getLabel('ab.application.noApplication') || "There is no application data";

							// Delete
							self.labels.application.confirmDeleteTitle = AD.lang.label.getLabel('ab.application.delete.title') || "Delete application";
							self.labels.application.confirmDeleteMessage = AD.lang.label.getLabel('ab.application.delete.message') || "Do you want to delete <b>{0}</b>?";

							// Form
							self.labels.application.formHeader = AD.lang.label.getLabel('ab.application.form.header') || "Application Info";
							self.labels.application.placeholderName = AD.lang.label.getLabel('ab.application.form.placeholderName') || "Application name";
							self.labels.application.placeholderDescription = AD.lang.label.getLabel('ab.application.form.placeholderDescription') || "Application description";
						},

						initWebixUI: function () {
							var self = this;
							var csrf = '';
                            $.ajax('/csrfToken')
								.done(function (data, status, xhr) {
									csrf = data._csrf;
								});
							webix.attachEvent('onBeforeAjax', function (mode, url, params, x, headers) {
								headers['X-CSRF-Token'] = headers['X-CSRF-Token'] || csrf;
							});

							self.webixUiId = {
								appView: "ab-app-view",
								appListRow: 'ab-app-list-row',
								appListToolbar: 'ab-app-list-toolbar',
								appList: 'ab-app-list',
								appListMenu: 'ab-app-list-menu',
								appListFormView: 'ab-app-list-form-view',
								appListForm: 'ab-app-list-form',
								appListLoading: 'ab-app-list-loading',

								appFormPermissionList: 'ab-app-form-permission',
								appFormCreateRoleButton: 'ab-app-form-create-role'
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
											{ view: "label", label: self.labels.application.title, fillspace: true },
											{
												view: "button", value: self.labels.application.createNew, width: 200,
												click: function () {
													self.resetState();
													self.populateForm();
												}
											},
											{
												view: "uploader",
												value: self.labels.common.import,
												width: 200,
												upload: '/app_builder/appJSON',
												multiple: false,
												autosend: true,
												on: {
													onAfterFileAdd: function () {
														this.disable();
                                                        $$(self.webixUiId.appList).showProgress({ type: "icon" });
											            /*
											            this.send(function() {
											                console.log('after send');
											            });
											            */
													},
													onFileUpload: function (item, response) {
														self.loadData(); // refresh app list
														this.enable();
                                                        $$(self.webixUiId.appList).hideProgress();
													},
													onFileUploadError: function () {
														this.enable();
                                                        $$(self.webixUiId.appList).hideProgress();
													}
												}
											}
										]
									},
									{
										id: self.webixUiId.appList,
										view: "list",
										minHeight: 227,
										autowidth: true,
										css: 'ab-app-select-list',
										template: function (obj, common) {
											var template = "<div class='ab-app-list-item'>" +
												"<div class='ab-app-list-info'>" +
												"<div class='ab-app-list-name'>#label#</div>" +
												"<div class='ab-app-list-description'>#description#</div>" +
												"</div>" +
												"<div class='ab-app-list-edit'>" +
												"{common.iconGear}" +
												"</div>" +
												"</div>";

											return template
												.replace('#label#', obj.label || '')
												.replace('#description#', obj.description || '')
												.replace('{common.iconGear}', common.iconGear);
										},
										type: {
											height: 100, // Defines item height
											iconGear: "<span class='webix_icon fa-cog'></span>"
										},
										select: false,
										onClick: {
											"ab-app-list-item": function (e, id, trg) {
												if ($$(self.webixUiId.appList).showProgress)
													$$(self.webixUiId.appList).showProgress({ icon: 'cursor' });

												this.select(id);

												var selectedApp = self.data.filter(function (app) { return app.id == id })

												if (selectedApp && selectedApp.length > 0) {
													async.parallel([
														// Get objects of the current application
														function (next) {
															selectedApp[0].getObjects()
																.fail(next)
																.then(function (objects) {
																	objects.forEach(function (obj) {
																		if (obj.translate) obj.translate();
																	});

																	selectedApp[0].attr('objects', objects);

																	next();
																});
														},
														// Get pages of the current application
														function (next) {
															selectedApp[0].getPages()
																.fail(next)
																.then(function (pages) {
																	pages.forEach(function (p) {
																		if (p.translate) p.translate();
																	});

																	selectedApp[0].attr('pages', pages);

																	next();
																});
														}
													], function (err) {
														if ($$(self.webixUiId.appList).hideProgress)
															$$(self.webixUiId.appList).hideProgress();

														if (err) return;

														// Trigger select app event
														self.element.trigger(self.options.APP_SELECTED, selectedApp[0]);
													});
												}

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
								head: self.labels.application.menu,
								width: 100,
								body: {
									view: "list",
									data: [
										{ command: self.labels.common.edit, icon: "fa-pencil-square-o" },
										{ command: self.labels.common.delete, icon: "fa-trash" },
										{ command: self.labels.common.export, icon: "fa-download" }
									],
									datatype: "json",

									template: "<i class='fa #icon#' aria-hidden='true'></i> #command#",
									autoheight: true,
									select: false,
									on: {
										'onItemClick': function (timestamp, e, trg) {
											var selectedApp = $$(self.webixUiId.appList).getSelectedItem();

											switch (trg.textContent.trim()) {
												case self.labels.common.edit:
													self.populateForm(selectedApp.id);
													break;
												case self.labels.common.delete:
													webix.confirm({
														title: self.labels.application.confirmDeleteTitle,
														ok: self.labels.common.yes,
														cancel: self.labels.common.no,
														text: self.labels.application.confirmDeleteMessage.replace('{0}', selectedApp.label),
														callback: function (result) {
															if (!result) return;

															// Delete application data
															$$(self.webixUiId.appList).showProgress({ type: "icon" });

															var app = self.data.filter(function (a) { return a.id == selectedApp.id; })
															if (!app || app.length < 1) return;

															app[0].destroy()
																.fail(function (err) {
																	$$(self.webixUiId.appList).hideProgress();

																	webix.message({
																		type: "error",
																		text: self.labels.common.deleteErrorMessage.replace("{0}", selectedApp.label)
																	});

																	AD.error.log('App Builder : Error delete application data', { error: err });
																})
																.then(function (result) {
																	$$(self.webixUiId.appList).hideProgress();

																	webix.message({
																		type: "success",
																		text: self.labels.common.deleteSuccessMessage.replace('{0}', selectedApp.label)
																	});
																});

															self.resetState();
														}
													});

													break;
												case self.labels.common.export:
													// Download the JSON file to disk
													window.location.assign('/app_builder/appJSON/' + selectedApp.id + '?download=1');
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
										cols: [{ view: "label", label: self.labels.application.formHeader, fillspace: true }]
									},
									{
										view: "form",
										id: self.webixUiId.appListForm,
										autoheight: true,
										margin: 0,
										elements: [
											{ type: "section", template: '<span class="webix_icon fa-edit" style="max-width:32px;"></span>Information', margin: 0 },
											{
												name: "label",
												view: "text",
												label: self.labels.common.formName,
												required: true,
												placeholder: self.labels.application.placeholderName,
												labelWidth: 100,
												on: {
													onChange: function (newValue, oldValue) {
														var editRole = $$(self.webixUiId.appFormPermissionList).find(function (d) { return d.name === oldValue + ' Application Role'; });

														editRole.forEach(function (r) {
															var editItem = $$(self.webixUiId.appFormPermissionList).getItem(r.id);
															editItem.name = newValue + ' Application Role';

															$$(self.webixUiId.appFormPermissionList).updateItem(editItem.id, editItem);
														});
													}
												}
											},
											{ name: "description", view: "textarea", label: self.labels.common.formDescription, placeholder: self.labels.application.placeholderDescription, labelWidth: 100, height: 100 },
											{ type: "section", template: '<span class="webix_icon fa-lock" style="max-width:32px;"></span>Permission' },
											{
												view: "toolbar",
												cols: [
													{
														template: "Assign one or more roles to set permissions for user to view this app",
														type: 'header',
														borderless: true
													},
													{
														view: "toggle",
														id: self.webixUiId.appFormCreateRoleButton,
														type: "iconButton",
														width: 300,
														align: "right",
														offIcon: "square-o",
														onIcon: "check-square-o",
														label: "Create a new role to view this app",
														on: {
															onItemClick: function (id, e) {
																if (this.getValue()) {// Add new app role
																	var newRoleName = $$(self.webixUiId.appListForm).elements["label"].getValue() + ' Application Role';
																	$$(self.webixUiId.appFormPermissionList).add({
																		id: 'newRole',
																		name: newRoleName,
																		isApplicationRole: true
																	}, 0);

																	// Select new role
																	var selectedIds = $$(self.webixUiId.appFormPermissionList).getSelectedId(true);
																	selectedIds.push('newRole');
																	$$(self.webixUiId.appFormPermissionList).select(selectedIds);
																}
																else { // Remove app role
																	var appRoles = $$(self.webixUiId.appFormPermissionList).find(function (perm) { return perm.isApplicationRole; });
																	appRoles.forEach(function (r) {
																		$$(self.webixUiId.appFormPermissionList).remove(r.id);
																	});
																}
															}
														}
													}
												]
											},
											{
												name: "permissions",
												id: self.webixUiId.appFormPermissionList,
												view: "list",
												height: 130,
												autowidth: true,
												borderless: true,
												margin: 0,
												css: "ab-app-form-permission",
												scroll: "y",
												template: "#name#",
												on: {
													onItemClick: function (id, e, node) {
														if (this.getItem(id).isApplicationRole) {
															return;
														}

														if (this.isSelected(id)) {
															this.unselect(id);
														}
														else {
															var selectedIds = this.getSelectedId();

															if (typeof selectedIds === 'string' || !isNaN(selectedIds)) {
																if (selectedIds)
																	selectedIds = [selectedIds];
																else
																	selectedIds = [];
															}

															selectedIds.push(id);

															this.select(selectedIds);
														}
													}
												}
											},
											{ height: 5 },
											{
												margin: 5, cols: [
													{ fillspace: true },
													{
														view: "button", label: self.labels.common.save, type: "form", width: 100, click: function () {
															if (!$$(self.webixUiId.appListForm).validate())
																return false;

															$$(self.webixUiId.appListForm).showProgress({ type: 'icon' });

															var selectedId = $$(self.webixUiId.appList).getSelectedId();
															var updateApp = self.data.filter(function (d) { return d.id == selectedId })[0];

															if (updateApp) { // Update
																async.waterfall([
																	function (next) {
																		self.savePermissions(updateApp)
																			.fail(function (err) { next(err); })
																			.then(function (result) { next(null, result); });
																	},
																	function (app_role, next) {
																		// Update application data
																		updateApp.attr('label', $$(self.webixUiId.appListForm).elements['label'].getValue());
																		updateApp.attr('description', $$(self.webixUiId.appListForm).elements['description'].getValue());

																		if (app_role && app_role.id)
																			updateApp.attr('role', app_role.id);
																		else
																			updateApp.attr('role', null);

																		updateApp.save()
																			.fail(function (err) { next(err); })
																			.then(function (result) {
																				var existApp = self.data.filter(function (item, index, list) {
																					return item.id === result.id;
																				})[0];

																				if (result.translate) result.translate();

																				existApp.attr('name', result.name);
																				existApp.attr('label', result.label);
																				existApp.attr('description', result.description);

																				next(null, result.id);
																			});
																	}
																], function (err) {
																	$$(self.webixUiId.appListForm).hideProgress();

																	if (err) {
																		webix.message({
																			type: "error",
																			text: self.labels.common.updateErrorMessage.replace('{0}', updateApp.attr('label'))
																		});

																		AD.error.log('App Builder : Error update application data', { error: err });

																		return;
																	}

																	$$(self.webixUiId.appListRow).show();

																	webix.message({
																		type: "success",
																		text: self.labels.common.updateSucessMessage.replace('{0}', updateApp.attr('label'))
																	});

																});
															} else { // Create
																var newApp = {
																	name: $$(self.webixUiId.appListForm).elements['label'].getValue(),
																	label: $$(self.webixUiId.appListForm).elements['label'].getValue(),
																	description: $$(self.webixUiId.appListForm).elements['description'].getValue()
																};

																async.waterfall([
																	function (cb) {
																		// Create application data
																		self.Model.create(newApp)
																			.fail(function (err) { cb(err); })
																			.then(function (result) {
																				if (result.translate) result.translate();

																				self.data.push(result);

																				cb(null, result);
																			});
																	},
																	function (createdApp, cb) {
																		self.savePermissions(createdApp)
																			.fail(function (err) { cb(err); })
																			.then(function () { cb(); });
																	}
																], function (err) {
																	$$(self.webixUiId.appListForm).hideProgress();

																	if (err) {
																		webix.message({
																			type: "error",
																			text: self.labels.common.createErrorMessage.replace('{0}', newApp.label)
																		});

																		AD.error.log('App Builder : Error create application data', { error: err });

																		return;
																	}

																	$$(self.webixUiId.appListRow).show();

																	if ($$(self.webixUiId.appList).hideOverlay)
																		$$(self.webixUiId.appList).hideOverlay();

																	webix.message({
																		type: "success",
																		text: self.labels.common.createSuccessMessage.replace('{0}', newApp.label)
																	});

																});
															}
														}
													},
													{
														view: "button", value: self.labels.common.cancel, width: 100, click: function () {
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
							webix.extend($$(self.webixUiId.appFormPermissionList), webix.ProgressBar);
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
									// Popupate translate properties to object
									data.forEach(function (d) {
										if (d.translate) d.translate();

										if (!d.description) d.attr('description', '');
									});

									self.data = data;

									self.refreshList();
								});

						},

						savePermissions: function (app) {
							var q = $.Deferred(),
								self = this,
								saveRoleTasks = [],
								appRole;

							// Create new role for application
							if ($$(self.webixUiId.appFormCreateRoleButton).getValue()) {
								saveRoleTasks.push(function (cb) {
									app.createPermission()
										.fail(function (err) {
											cb(err);
										})
										.then(function (result) {
											appRole = result;

											cb();
										});
								});
							}
							else {
								// Delete application roles
								saveRoleTasks.push(function (cb) {
									app.deletePermission()
										.fail(function (err) { cb(err); })
										.then(function () { cb(); });
								});
							}

							var permItems = $$(self.webixUiId.appFormPermissionList).getSelectedItem(true);
							permItems = $.grep(permItems, function (item) { return item.id !== 'newRole'; }); // Remove new role item

							saveRoleTasks.push(function (cb) {
								// Assign application role to list
								if ($$(self.webixUiId.appFormCreateRoleButton).getValue() && appRole) {
									var appRoleItem = $.grep(permItems, function (item) { return item.id == appRole.id; });
									if (!appRoleItem || appRoleItem.length < 1) {
										permItems.push({
											id: appRole.id,
											isApplicationRole: true
										});
									}
								}

								// Assign Role Permissions
								app.assignPermissions(permItems)
									.fail(function (err) { cb(err); })
									.then(function () { cb(); });
							});

							// Final task
							saveRoleTasks.push(function (cb) {
								// Update store app data
								var applicationData = self.data.filter(function (d) { return d.id == app.id; });
								applicationData.forEach(function (app) {
									app.attr('permissions', $.map(permItems, function (item) {
										return {
											application: app.id,
											permission: item.id,
											isApplicationRole: item.isApplicationRole
										}
									}));
								});

								q.resolve(appRole);
								cb();
							})

							async.series(saveRoleTasks);

							return q;
						},

						resetState: function () {
							var self = this;

							$$(self.webixUiId.appList).unselectAll();
							$$(self.webixUiId.appListForm).clear();
							$$(self.webixUiId.appListForm).clearValidation();
							$$(self.webixUiId.appFormPermissionList).clearValidation();
							$$(self.webixUiId.appFormPermissionList).clearAll();
							$$(self.webixUiId.appFormCreateRoleButton).setValue(0);
						},

						refreshList: function () {
							var self = this,
								appList = AD.op.WebixDataCollection(self.data);

							$$(self.webixUiId.appList).clearAll();
							$$(self.webixUiId.appList).data.unsync();
							$$(self.webixUiId.appList).data.sync(appList);

							if (!$$(self.webixUiId.appList).count()) //if no data is available
								$$(self.webixUiId.appList).showOverlay(self.labels.application.noApplication);
							else
								$$(self.webixUiId.appList).hideOverlay();

							$$(self.webixUiId.appList).refresh();

							$$(self.webixUiId.appList).hideProgress();
						},

						populateForm: function (appId) {
							var self = this,
								selectedApp;

							$$(self.webixUiId.appListFormView).show();

							// Populate data to form
							if (appId) {
								var selectedApp = self.data.filter(function (app) { return app.id == appId; });

								if (selectedApp && selectedApp.length > 0) {
									selectedApp = selectedApp[0];
									selectedApp.each(function (item, attr) {
										if ($$(self.webixUiId.appListForm).elements[attr])
											$$(self.webixUiId.appListForm).elements[attr].setValue(selectedApp.attr(attr));
									});
								}
								else {
									selectedApp = null;
								}
							}

							// Get user's roles
							$$(self.webixUiId.appFormPermissionList).showProgress({ type: 'icon' });
							async.waterfall([
								function (next) {
									AD.comm.service.get({ url: '/app_builder/user/roles' })
										.fail(function (err) { next(err); })
										.done(function (roles) {
											next(null, roles);
										});
								},
								function (available_roles, next) {
									if (selectedApp && selectedApp.id) {
										selectedApp.getPermissions()
											.fail(function (err) { next(err); })
											.done(function (selected_role_ids) {
												next(null, available_roles, selected_role_ids);
											});
									}
									else {
										next(null, available_roles, []);
									}

								},
								function (available_roles, selected_role_ids, next) {
									// Sort permission list
									if (selectedApp && selectedApp.role && selectedApp.role.id) {
										available_roles.forEach(function (r) {
											var perm = [];

											if (r.id == selectedApp.role.id)
												r.isApplicationRole = true;
										});
									}
									available_roles.sort(function (a, b) {
										return (a.isApplicationRole === b.isApplicationRole) ? 0 : a.isApplicationRole ? -1 : 1;
									});

									$$(self.webixUiId.appFormPermissionList).clearAll();
									$$(self.webixUiId.appFormPermissionList).parse(available_roles);

									if (selected_role_ids && selected_role_ids.length > 0) {
										// Select permissions
										$$(self.webixUiId.appFormPermissionList).select(selected_role_ids);

										// Select create role application button
										var markCreateButton = available_roles.filter(function (r) { return r.isApplicationRole; }).length > 0 ? 1 : 0;
										$$(self.webixUiId.appFormCreateRoleButton).setValue(markCreateButton);
									}

									$$(self.webixUiId.appFormPermissionList).hideProgress();
									next();
								}
							], function (err) {
								if (err) {
									webix.message(err.message);
									$$(self.webixUiId.appFormPermissionList).hideProgress();
									return;
								}

							});

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

								var computedHeight = height - 140;
								if (appListDom.css('min-height') < computedHeight)
									appListDom.height(computedHeight);
								else
									appListDom.height(appListDom.css('min-height'));

								if (self.webixUiId) {
									$$(self.webixUiId.appList).define('height', height - 140);
									$$(self.webixUiId.appList).adjust();

									$$(self.webixUiId.appView).adjust();
								}
							}
						}


					});

				});
		});

	});