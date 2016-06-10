
steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/models/ABObject.js',
	'opstools/BuildApp/controllers/webix_custom_components/EditList.js',
	function () {
        System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control').then(function () {

					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.ObjectList', {

						init: function (element, options) {
							var self = this;
							options = AD.defaults({
								selectedObjectEvent: 'AB_Object.Selected',
								updatedObjectEvent: 'AB_Object.Updated'
							}, options);
							this.options = options;

							// Call parent init
							this._super(element, options);

                            this.Model = AD.Model.get('opstools.BuildApp.ABObject');
							this.data = {};

							this.webixUiId = {
								objectList: 'ab-object-list',
								objectListMenuPopup: 'ab-object-list-menu-popup',
								objectListMenu: 'ab-object-list-menu',
								addNewPopup: 'ab-object-add-new-popup',
								addNewForm: 'ab-object-add-new-form'
							};

							this.rules = {};
							this.rules.preventDuplicateName = function (value) {
								// Check duplicate
								var duplicateObject = jQuery.grep(self.data.objectList, function (m, index) {
									return m.name.toLowerCase().trim() == value.toLowerCase();
								});

								if (duplicateObject && duplicateObject.length > 0) {
									return false;
								}
								else {
									return true;
								}
							};

							this.initMultilingualLabels();
							this.initControllers();

							webix.ready(function () {
								self.initWebixUI();
							});
						},

						initMultilingualLabels: function () {
							var self = this;
							self.labels = {};
							self.labels.common = {};
							self.labels.object = {};

							self.labels.common.ok = AD.lang.label.getLabel('ab.common.ok') || "Ok";
							self.labels.common.delete = AD.lang.label.getLabel('ab.common.delete') || "Delete";
							self.labels.common.yes = AD.lang.label.getLabel('ab.common.yes') || "Yes";
							self.labels.common.no = AD.lang.label.getLabel('ab.common.no') || "No";
							self.labels.common.add = AD.lang.label.getLabel('ab.common.add') || "Add";
							self.labels.common.cancel = AD.lang.label.getLabel('ab.common.cancel') || "Cancel";
							self.labels.common.formName = AD.lang.label.getLabel('ab.common.form.name') || "Name";
							self.labels.common.rename = AD.lang.label.getLabel('ab.common.rename') || "Rename";
							self.labels.common.renameErrorMessage = AD.lang.label.getLabel('ab.common.rename.error') || "System could not rename <b>{0}</b>.";
							self.labels.common.renameSuccessMessage = AD.lang.label.getLabel('ab.common.rename.success') || "Rename to <b>{0}</b>.";
							self.labels.common.deleteErrorMessage = AD.lang.label.getLabel('ab.common.delete.error') || "System could not delete <b>{0}</b>.";
							self.labels.common.deleteSuccessMessage = AD.lang.label.getLabel('ab.common.delete.success') || "<b>{0}</b> is deleted.";
							self.labels.common.createErrorMessage = AD.lang.label.getLabel('ab.common.create.error') || "System could not create <b>{0}</b>.";
							self.labels.common.createSuccessMessage = AD.lang.label.getLabel('ab.common.create.success') || "<b>{0}</b> is created.";

							// Delete
							self.labels.object.confirmDeleteTitle = AD.lang.label.getLabel('ab.object.delete.title') || "Delete object";
							self.labels.object.confirmDeleteMessage = AD.lang.label.getLabel('ab.object.delete.message') || "Do you want to delete <b>{0}</b>?";

							self.labels.object.invalidName = AD.lang.label.getLabel('ab.object.invalidName') || "This name is invalid";
							self.labels.object.duplicateName = AD.lang.label.getLabel('ab.object.duplicateName') || "<b>{0}</b> is duplicate";
							self.labels.object.addNew = AD.lang.label.getLabel('ab.object.addNew') || 'Add new object';
							self.labels.object.menu = AD.lang.label.getLabel('ab.object.menu') || "Object Menu";

							// Form
							self.labels.object.placeholderName = AD.lang.label.getLabel('ab.object.form.placeholderName') || "Object name";
						},

						initControllers: function () {
							this.controllers = {};

							var EditList = AD.Control.get('opstools.BuildApp.EditList');

							this.controllers.EditList = new EditList();
						},

						initWebixUI: function () {
							var self = this;

							self.data.definition = {
								rows: [
									{
										view: "editlist",
										id: self.webixUiId.objectList,
										width: 250,
										select: true,
										editaction: 'custom',
										editable: true,
										editor: "text",
										editValue: "label",
										template: "<div class='ab-object-list-item'>" +
										"#label#" +
										"<div class='ab-object-list-edit'>" +
										"{common.iconGear}" +
										"</div>" +
										"</div>",
										type: {
											iconGear: "<span class='webix_icon fa-cog'></span>"
										},
										ready: function () {
											webix.extend(this, webix.ProgressBar);
										},
										on: {
											onAfterSelect: function (id) {
												// Fire select object event
												self.element.trigger(self.options.selectedObjectEvent, id);

												// Show gear icon
												$(this.getItemNode(id)).find('.ab-object-list-edit').show();
											},
											onAfterDelete: function (id) {
												// Fire unselect event 
												self.element.trigger(self.options.selectedObjectEvent, null);
											},
											onBeforeEditStop: function (state, editor) {
												// Validation - check duplicate
												if (!self.rules.preventDuplicateName(state.value) && state.value != state.old) {
													webix.alert({
														title: self.labels.object.invalidName,
														ok: self.labels.common.ok,
														text: self.labels.object.duplicateName.replace("{0}", state.value)
													})

													return false;
												}
											},
											onAfterEditStop: function (state, editor, ignoreUpdate) {
												if (state.value != state.old) {
													var _this = this;

													this.showProgress({ type: 'icon' });

													var selectedObject = self.data.objectList.filter(function (item, index, list) { return item.id == editor.id; })[0];
													selectedObject.attr('label', state.value);

													// Call server to rename
													selectedObject.save()
														.fail(function () {
															_this.hideProgress();

															webix.message({
																type: "error",
																text: self.labels.common.renameErrorMessage.replace("{0}", state.old)
															});

															AD.error.log('Object List : Error rename object data', { error: err });
														})
														.then(function () {
															_this.hideProgress();

															// Show success message
															webix.message({
																type: "success",
																text: self.labels.common.renameSuccessMessage.replace('{0}', state.value)
															});

															// Show gear icon
															$(_this.getItemNode(editor.id)).find('.ab-object-list-edit').show();

															self.element.trigger(self.options.updatedObjectEvent, { objectList: self.data.objectList });
														});
												}
											}
										},
										onClick: {
											"ab-object-list-edit": function (e, id, trg) {
												// Show menu
												$$(self.webixUiId.objectListMenuPopup).show(trg);

												return false;
											}
										}
									},
									{
										view: 'button',
										value: self.labels.object.addNew,
										click: function () {
											$$(self.webixUiId.addNewPopup).define('selectNewObject', true);
											$$(self.webixUiId.addNewPopup).show();
										}
									}
								]
							};

							// Edit object menu
							webix.ui({
								view: "popup",
								id: self.webixUiId.objectListMenuPopup,
								head: self.labels.object.menu,
								width: 130,
								body: {
									id: self.webixUiId.objectListMenu,
									view: "list",
									data: [
										{ command: self.labels.common.rename, icon: "fa-pencil-square-o" },
										{ command: self.labels.common.delete, icon: "fa-trash" }
									],
									datatype: "json",

									template: "<i class='fa #icon#' aria-hidden='true'></i> #command#",
									autoheight: true,
									select: false,
									on: {
										'onItemClick': function (timestamp, e, trg) {
											var selectedObject = $$(self.webixUiId.objectList).getSelectedItem();

											switch (trg.textContent.trim()) {
												case self.labels.common.rename:
													// Show textbox to rename
													$$(self.webixUiId.objectList).edit(selectedObject.id);

													break;
												case self.labels.common.delete:
													webix.confirm({
														title: self.labels.object.confirmDeleteTitle,
														ok: self.labels.common.yes,
														cancel: self.labels.common.no,
														text: self.labels.object.confirmDeleteMessage.replace('{0}', selectedObject.label),
														callback: function (result) {
															if (result) {

																$$(self.webixUiId.objectList).showProgress({ type: "icon" });

																// Call server to delete object data
																self.Model.destroy(selectedObject.id)
																	.fail(function (err) {
																		$$(self.webixUiId.objectList).hideProgress();

																		webix.message({
																			type: "error",
																			text: self.labels.common.deleteErrorMessage.replace("{0}", selectedObject.label)
																		});

																		AD.error.log('Object List : Error delete object data', { error: err });
																	})
																	.then(function (result) {
																		self.data.objectList.forEach(function (item, index, list) {
																			if (item && item.id === selectedObject.id)
																				self.data.objectList.splice(index, 1);
																		});

																		$$(self.webixUiId.objectList).remove(selectedObject.id);

																		self.element.trigger(self.options.updatedObjectEvent, { objectList: self.data.objectList });

																		webix.message({
																			type: "success",
																			text: self.labels.common.deleteSuccessMessage.replace('{0}', selectedObject.label)
																		});

																		$$(self.webixUiId.objectList).hideProgress();

																	});
															}

														}
													});

													break;
											}

											$$(self.webixUiId.objectListMenuPopup).hide();
										}
									}
								}
							}).hide(); // end webix.ui

							// Add new object popup
							webix.ui({
								view: "window",
								id: self.webixUiId.addNewPopup,
								width: 300,
								position: "center",
								modal: true,
								head: self.labels.object.addNew,
								selectNewObject: true,
								on: {
									"onBeforeShow": function () {
										$$(self.webixUiId.addNewForm).clearValidation();
										$$(self.webixUiId.addNewForm).clear();
									}
								},
								body: {
									view: "form",
									id: self.webixUiId.addNewForm,
									width: 300,
									elements: [
										{ view: "text", label: self.labels.common.formName, name: "name", required: true, placeholder: self.labels.object.placeholderName, labelWidth: 70 },
										{
											margin: 5, cols: [
												{
													view: "button", value: self.labels.common.add, type: "form", click: function () {
														if (!$$(self.webixUiId.addNewForm).validate())
															return false;

														var newObjectName = $$(self.webixUiId.addNewForm).elements['name'].getValue().trim();

														$$(self.webixUiId.objectList).showProgress({ type: 'icon' });

														var newObject = {
															name: newObjectName,
															label: newObjectName,
															application: self.data.appId
														};

														// Add new object to server
														self.Model.create(newObject).fail(function () {
															$$(self.webixUiId.objectList).hideProgress();

															webix.message({
																type: "error",
																text: self.labels.common.createErrorMessage.replace("{0}", newModel.label)
															});

															AD.error.log('Object : Error create object data', { error: err });

														}).then(function (result) {
															$$(self.webixUiId.addNewPopup).hide();

															if (result.translate) result.translate();

															self.data.objectList.push(result);

															$$(self.webixUiId.objectList).add(result);

															if ($$(self.webixUiId.addNewPopup).config.selectNewObject) {
																$$(self.webixUiId.objectList).unselectAll();
																$$(self.webixUiId.objectList).select(result.id);
															}

															self.element.trigger(self.options.updatedObjectEvent, { objectList: self.data.objectList });

															$$(self.webixUiId.objectList).hideProgress();

															// Show success message
															webix.message({
																type: "success",
																text: self.labels.common.createSuccessMessage.replace('{0}', newObject.label)
															});
														});

													}
												},
												{ view: "button", value: self.labels.common.cancel, click: function () { $$(self.webixUiId.addNewPopup).hide(); } }
											]
										}
									],
									rules: {
										name: self.rules.preventDuplicateName
									}

								}
							}).hide();
						},

						getUIDefinition: function () {
							return this.data.definition;
						},

						setAppId: function (appId) {
							var self = this;

							self.data.appId = appId;

							if ($$(self.webixUiId.objectList).showProgress)
								$$(self.webixUiId.objectList).showProgress({ type: "icon" });

							// Get object list from server
							self.Model.findAll({ application: appId })
								.fail(function (err) {
									$$(self.webixUiId.objectList).hideProgress();
									webix.message({
										type: "error",
										text: err
									});
									AD.error.log('Object list : Error loading object list data', { error: err });
								})
								.then(function (data) {
									// Popupate translate properties to object
									data.forEach(function (d) {
										if (d.translate) d.translate();
									});

									self.data.objectList = data;

									self.refreshObjectList();

									self.element.trigger(self.options.updatedObjectEvent, { objectList: self.data.objectList });
								});
						},

						refreshObjectList: function () {
							var self = this;

							if ($$(self.webixUiId.objectList).showProgress)
								$$(self.webixUiId.objectList).showProgress({ type: "icon" });

							$$(self.webixUiId.objectList).clearAll();
							$$(self.webixUiId.objectList).parse(self.data.objectList.attr());
							$$(self.webixUiId.objectList).refresh();
							$$(self.webixUiId.objectList).unselectAll();


							if ($$(self.webixUiId.objectList).hideProgress)
								$$(self.webixUiId.objectList).hideProgress();
						},

						resetState: function () {
							var self = this;

							$$(self.webixUiId.objectList).unselectAll();
							$$(self.webixUiId.objectList).clearAll();
							$$(self.webixUiId.objectList).refresh();
						}

					}); // end AD.Control.extend
				});
		});
	}
);