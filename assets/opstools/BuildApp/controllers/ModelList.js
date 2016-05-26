
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
					AD.Control.extend('opstools.BuildApp.ModelList', {

						init: function (element, options) {
							var self = this;
							options = AD.defaults({
								selectedModelEvent: 'AB_Model.Selected',
								updatedModelEvent: 'AB_Model.Updated'
							}, options);
							this.options = options;

							// Call parent init
							this._super(element, options);

                            this.Model = AD.Model.get('opstools.BuildApp.ABObject');
							this.data = {};

							this.webixUiId = {
								modelList: 'ab-model-list',
								modelListMenu: 'ab-model-list-menu',
								addNewPopup: 'ab-model-add-new-popup',
								addNewForm: 'ab-model-add-new-form'
							};

							this.rules = {};
							this.rules.preventDuplicateName = function (value) {
								// Check duplicate
								var duplicateModel = jQuery.grep(self.data.modelList, function (m, index) {
									return m.name.toLowerCase().trim() == value.toLowerCase();
								});

								if (duplicateModel && duplicateModel.length > 0) {
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
										id: self.webixUiId.modelList,
										width: 250,
										select: true,
										editaction: 'custom',
										editable: true,
										editor: "text",
										editValue: "label",
										template: "<div class='ab-model-list-item'>" +
										"#label#" +
										"<div class='ab-model-list-edit'>" +
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
												// Fire select model event
												self.element.trigger(self.options.selectedModelEvent, id);

												// Show gear icon
												$(this.getItemNode(id)).find('.ab-model-list-edit').show();
											},
											onAfterDelete: function (id) {
												// Fire unselect event 
												self.element.trigger(self.options.selectedModelEvent, null);
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

													var selectedModel = self.data.modelList.filter(function (item, index, list) { return item.id == editor.id; })[0];
													selectedModel.attr('label', state.value);

													// Call server to rename
													selectedModel.save()
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
															$(_this.getItemNode(editor.id)).find('.ab-model-list-edit').show();

															self.element.trigger(self.options.updatedModelEvent, { objectList: self.data.modelList.attr() });
														});
												}
											}
										},
										onClick: {
											"ab-model-list-edit": function (e, id, trg) {
												// Show menu
												$$(self.webixUiId.modelListMenu).show(trg);

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

							// Model menu
							webix.ui({
								view: "popup",
								id: self.webixUiId.modelListMenu,
								head: self.labels.object.menu,
								width: 130,
								body: {
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
											var selectedModel = $$(self.webixUiId.modelList).getSelectedItem();

											switch (trg.textContent.trim()) {
												case self.labels.common.rename:
													// Show textbox to rename
													$$(self.webixUiId.modelList).edit(selectedModel.id);

													break;
												case self.labels.common.delete:
													webix.confirm({
														title: self.labels.object.confirmDeleteTitle,
														ok: self.labels.common.yes,
														cancel: self.labels.common.no,
														text: self.labels.object.confirmDeleteMessage.replace('{0}', selectedModel.name),
														callback: function (result) {
															if (result) {

																$$(self.webixUiId.modelList).showProgress({ type: "icon" });

																// Call server to delete model data
																self.Model.destroy(selectedModel.id)
																	.fail(function (err) {
																		$$(self.webixUiId.modelList).hideProgress();

																		webix.message({
																			type: "error",
																			text: self.labels.common.deleteErrorMessage.replace("{0}", selectedModel.name)
																		});

																		AD.error.log('Object List : Error delete object data', { error: err });
																	})
																	.then(function (result) {
																		self.data.modelList.forEach(function (item, index, list) {
																			if (item && item.id === selectedModel.id)
																				self.data.modelList.splice(index, 1);
																		});

																		$$(self.webixUiId.modelList).remove(selectedModel.id);

																		self.element.trigger(self.options.updatedModelEvent, { objectList: self.data.modelList.attr() });

																		webix.message({
																			type: "success",
																			text: self.labels.common.deleteSuccessMessage.replace('{0}', selectedModel.name)
																		});

																		$$(self.webixUiId.modelList).hideProgress();

																	});
															}

														}
													});

													break;
											}

											$$(self.webixUiId.modelListMenu).hide();
										}
									}
								}
							}).hide(); // end webix.ui

							// Add new model popup
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

														var newModelName = $$(self.webixUiId.addNewForm).elements['name'].getValue().trim();

														$$(self.webixUiId.modelList).showProgress({ type: 'icon' });

														var newModel = {
															name: newModelName,
															label: newModelName,
															application: self.data.appId
														};

														// Add new object to server
														self.Model.create(newModel).fail(function () {
															$$(self.webixUiId.modelList).hideProgress();

															webix.message({
																type: "error",
																text: self.labels.common.createErrorMessage.replace("{0}", newModel.name)
															});

															AD.error.log('Object : Error create object data', { error: err });

														}).then(function (result) {
															$$(self.webixUiId.addNewPopup).hide();

															if (result.translate) result.translate();

															self.data.modelList.push(result);

															$$(self.webixUiId.modelList).add(result);

															if ($$(self.webixUiId.addNewPopup).config.selectNewObject) {
																$$(self.webixUiId.modelList).unselectAll();
																$$(self.webixUiId.modelList).select(result.id);
															}

															self.element.trigger(self.options.updatedModelEvent, { objectList: self.data.modelList.attr() });

															$$(self.webixUiId.modelList).hideProgress();

															// Show success message
															webix.message({
																type: "success",
																text: self.labels.common.createSuccessMessage.replace('{0}', newModel.name)
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

							if ($$(self.webixUiId.modelList).showProgress)
								$$(self.webixUiId.modelList).showProgress({ type: "icon" });

							// Get model list from server
							self.Model.findAll({ application: appId })
								.fail(function (err) {
									$$(self.webixUiId.modelList).hideProgress();
									webix.message({
										type: "error",
										text: err
									});
									AD.error.log('Model list : Error loading model list data', { error: err });
								})
								.then(function (data) {
									// Popupate translate properties to object
									data.forEach(function (d) {
										if (d.translate) d.translate();
									});

									self.data.modelList = data;

									self.refreshModelList();

									self.element.trigger(self.options.updatedModelEvent, { objectList: self.data.modelList.attr() });
								});
						},

						refreshModelList: function () {
							var self = this;

							if ($$(self.webixUiId.modelList).showProgress)
								$$(self.webixUiId.modelList).showProgress({ type: "icon" });

							$$(self.webixUiId.modelList).clearAll();
							$$(self.webixUiId.modelList).parse(self.data.modelList.attr());
							$$(self.webixUiId.modelList).refresh();
							$$(self.webixUiId.modelList).unselectAll();


							if ($$(self.webixUiId.modelList).hideProgress)
								$$(self.webixUiId.modelList).hideProgress();
						},

						resetState: function () {
							var self = this;

							$$(self.webixUiId.modelList).unselectAll();
							$$(self.webixUiId.modelList).clearAll();
							$$(self.webixUiId.modelList).refresh();
						}

					}); // end AD.Control.extend
				});
		});
	}
);