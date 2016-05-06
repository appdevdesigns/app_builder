
steal(
	// List your Controller's dependencies here:
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

							webix.ready(function () {
								self.initWebixUI();
							});
						},

						initWebixUI: function () {
							var self = this;

							this.data.definition = {
								id: self.options.modelView,
								cols: [
									{
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
														// Show gear icon
														$(this.getItemNode(id)).find('.ab-model-list-edit').show();
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

															// TODO: Call server to rename
															this.showProgress({ type: 'icon' });
															this.hideProgress();

															// Show success message
															webix.message({
																type: "success",
																text: "Rename to <b>" + state.value + "</b>."
															});

															// Show gear icon
															$(this.getItemNode(editor.id)).find('.ab-model-list-edit').show();
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
												value: 'Add new model',
												click: function () {
													$$(self.webixUiId.addNewPopup).show();
												}
											}
										]
									},
									{ view: "resizer", autoheight: true },
									{
										view: "datatable",
										autoheight: true,
										columns: [
											{ id: "name", header: "Name", width: 100 },
											{ id: "description", header: "Description" },
											{ id: "addNew", header: "+", width: 50 }
										],
										// Mock data
										data: [
											{ name: 'Test 1', description: 'Description 1' },
											{ name: 'Test 2', description: 'Description 2' },
											{ name: 'Test 3', description: 'Description 3' }
										]
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
																// TODO: Call server to delete model data
																$$(self.webixUiId.modelList).showProgress({ type: "icon" });

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

																// self.Model.destroy(selectedModel.id)
																// 	.fail(function (err) {
																// 		$$(self.webixUiId.modelList).hideProgress();

																// 		webix.message({
																// 			type: "error",
																// 			text: "System could not delete <b>{0}</b>.".replace("{0}", selectedModel.name)
																// 		});

																// 		AD.error.log('App Builder : Error delete application data', { error: err });
																// 	})
																// 	.then(function (result) {
																// 		self.data.forEach(function (item, index, list) {
																// 			if (item && item.id === result.id)
																// 				self.data.splice(index, 1);
																// 		});

																// 		self.refreshList();

																// 		$$(self.webixUiId.modelList).hideProgress();

																// 		webix.message({
																// 			type: "success",
																// 			text: "<b>" + selectedModel.name + "</b> is deleted."
																// 		});
																// 	});
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
										{ view: "text", label: "Name", name: "name", required: true, placeholder: "Model name", invalidMessage: "This field can not be empty.", labelWidth: 70 },
										{
											margin: 5, cols: [
												{
													view: "button", value: "Add", type: "form", click: function () {
														if (!$$(self.webixUiId.addNewForm).validate())
															return false;

														var newModelName = $$(self.webixUiId.addNewForm).elements['name'].getValue().trim();

														// TODO : Add new model to server
														var newModel = {
															id: Math.random(),
															name: newModelName
														};
														$$(self.webixUiId.modelList).showProgress({ type: 'icon' });
														$$(self.webixUiId.addNewPopup).hide();

														$$(self.webixUiId.modelList).add(newModel);
														$$(self.webixUiId.modelList).unselectAll();
														$$(self.webixUiId.modelList).select(newModel.id);

														$$(self.webixUiId.modelList).hideProgress();

														// Show success message
														webix.message({
															type: "success",
															text: "<b>" + newModel.name + "</b> is created."
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
							var self = this;

							return self.data.definition;
						},

						setModelList: function (appId) {
							var self = this;

							self.data.appId = appId;

							// TODO : Get model list from server
							self.data.modelList = [
								{ id: 1, name: "Translate" },
								{ id: 2, name: "Post" },
								{ id: 3, name: "Info" }
							];

							self.refreshModelList();
						},

						refreshModelList: function () {
							var self = this;

							if ($$(self.webixUiId.modelList).showProgress)
								$$(self.webixUiId.modelList).showProgress({ type: "icon" });

							$$(self.webixUiId.modelList).parse(self.data.modelList);
							$$(self.webixUiId.modelList).refresh();
							$$(self.webixUiId.modelList).unselectAll();


							if ($$(self.webixUiId.modelList).hideProgress)
								$$(self.webixUiId.modelList).hideProgress();
						},

						resize: function (height) {
							var self = this;

							$$(self.options.modelView).define('height', height - 120);
							$$(self.options.modelView).adjust();
						}


					}); // end AD.Control.extend
				});
		});
	}
);