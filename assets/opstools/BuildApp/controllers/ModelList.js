
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
								selectedModelEvent: 'AB_Model.Selected'
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

							this.initControllers();

							webix.ready(function () {
								self.initWebixUI();
							});
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
										editValue: "name",
										template: "<div class='ab-model-list-item'>" +
										"#name#" +
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
														title: "This name is invalid",
														ok: "Ok",
														text: "<b>" + state.value + "</b> is duplicate"
													})

													return false;
												}
											},
											onAfterEditStop: function (state, editor, ignoreUpdate) {
												if (state.value != state.old) {
													var _this = this;

													this.showProgress({ type: 'icon' });

													var selectedModel = self.data.modelList.filter(function (item, index, list) { return item.id == editor.id; })[0];
													selectedModel.attr('name', state.value);
													selectedModel.attr('label', state.value);

													// Call server to rename
													selectedModel.save()
														.fail(function () {
															_this.hideProgress();

															webix.message({
																type: "error",
																text: "System could not rename <b>{0}</b>.".replace("{0}", state.old)
															});

															AD.error.log('Object List : Error rename object data', { error: err });
														})
														.then(function () {
															_this.hideProgress();

															// Show success message
															webix.message({
																type: "success",
																text: "Rename to <b>" + state.value + "</b>."
															});

															// Show gear icon
															$(_this.getItemNode(editor.id)).find('.ab-model-list-edit').show();
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
										value: 'Add new object',
										click: function () {
											$$(self.webixUiId.addNewPopup).show();
										}
									}
								]
							};

							// Model menu
							webix.ui({
								view: "popup",
								id: self.webixUiId.modelListMenu,
								head: "Model Menu",
								width: 130,
								body: {
									view: "list",
									data: [
										{ command: "Rename", icon: "fa-pencil-square-o" },
										{ command: "Delete", icon: "fa-trash" }
									],
									datatype: "json",

									template: "<i class='fa #icon#' aria-hidden='true'></i> #command#",
									autoheight: true,
									select: false,
									on: {
										'onItemClick': function (timestamp, e, trg) {
											var selectedModel = $$(self.webixUiId.modelList).getSelectedItem();

											switch (trg.textContent.trim()) {
												case 'Rename':
													// Show textbox to rename
													$$(self.webixUiId.modelList).edit(selectedModel.id);

													break;
												case 'Delete':
													// TODO : Get from translation
													var deleteConfirmTitle = "Delete model",
														deleteConfirmMessage = "Do you want to delete <b>{0}</b>?".replace('{0}', selectedModel.name),
														yes = "Yes",
														no = "No";

													webix.confirm({
														title: deleteConfirmTitle,
														ok: yes,
														cancel: no,
														text: deleteConfirmMessage,
														callback: function (result) {
															if (result) {

																$$(self.webixUiId.modelList).showProgress({ type: "icon" });

																// Call server to delete model data
																self.Model.destroy(selectedModel.id)
																	.fail(function (err) {
																		$$(self.webixUiId.modelList).hideProgress();

																		webix.message({
																			type: "error",
																			text: "System could not delete <b>{0}</b>.".replace("{0}", selectedModel.name)
																		});

																		AD.error.log('Object List : Error delete object data', { error: err });
																	})
																	.then(function (result) {
																		self.data.modelList.forEach(function (item, index, list) {
																			if (item && item.id === selectedModel.id)
																				self.data.modelList.splice(index, 1);
																		});

																		$$(self.webixUiId.modelList).remove(selectedModel.id);

																		webix.message({
																			type: "success",
																			text: "<b>" + selectedModel.name + "</b> is deleted."
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
								head: "Add new model",
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
										{ view: "text", label: "Name", name: "name", required: true, placeholder: "Model name", labelWidth: 70 },
										{
											margin: 5, cols: [
												{
													view: "button", value: "Add", type: "form", click: function () {
														if (!$$(self.webixUiId.addNewForm).validate())
															return false;

														var newModelName = $$(self.webixUiId.addNewForm).elements['name'].getValue().trim();

														$$(self.webixUiId.modelList).showProgress({ type: 'icon' });

														var newModel = {
															name: newModelName,
															label: newModelName,
															application: self.data.appId
														};

														// Add new model to server
														self.Model.create(newModel).fail(function () {
															$$(self.webixUiId.modelList).hideProgress();

															webix.message({
																type: "error",
																text: "System could not create <b>{0}</b>.".replace("{0}", newModel.name)
															});

															AD.error.log('Object : Error create object data', { error: err });

														}).then(function (result) {
															$$(self.webixUiId.addNewPopup).hide();

															$$(self.webixUiId.modelList).add(result);
															$$(self.webixUiId.modelList).unselectAll();
															$$(self.webixUiId.modelList).select(result.id);

															$$(self.webixUiId.modelList).hideProgress();

															// Show success message
															webix.message({
																type: "success",
																text: "<b>" + newModel.name + "</b> is created."
															});
														});

													}
												},
												{ view: "button", value: "Cancel", click: function () { $$(self.webixUiId.addNewPopup).hide(); } }
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
									self.data.modelList = data;

									self.refreshModelList();
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
						}

					}); // end AD.Control.extend
				});
		});
	}
);