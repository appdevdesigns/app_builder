steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/models/ABPage.js',
	'opstools/BuildApp/controllers/webix_custom_components/EditTree.js',
	function () {
        System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control').then(function () {

					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.InterfaceList', {

						init: function (element, options) {
							var self = this;

							options = AD.defaults({
								selectedPageEvent: 'AB_Page.Selected',
								updatedPageEvent: 'AB_Page.Updated'
							}, options);
							this.options = options;

							this.Model = AD.Model.get('opstools.BuildApp.ABPage');

							self.data = {};

							this.webixUiId = {
								interfaceTree: 'ab-interface-tree',

								pageListMenuPopup: 'ab-page-menu-popup',
								pageListMenu: 'ab-page-menu',

								addNewPopup: 'ab-interface-add-new-popup',
								addNewForm: 'ab-interface-add-new-form',
								addNewParentList: 'ab-interface-add-new-parent-list'
							};

							self.initMultilingualLabels();
							self.initControllers();

							self.initWebixUI();
						},

						initMultilingualLabels: function () {
							var self = this;
							self.labels = {};
							self.labels.common = {};
							self.labels.interface = {};

							self.labels.common.formName = AD.lang.label.getLabel('ab.common.form.name') || "Name";
							self.labels.common.add = AD.lang.label.getLabel('ab.common.add') || "Add";
							self.labels.common.rename = AD.lang.label.getLabel('ab.common.rename') || "Rename";
							self.labels.common.delete = AD.lang.label.getLabel('ab.common.delete') || "Delete";
							self.labels.common.cancel = AD.lang.label.getLabel('ab.common.cancel') || "Cancel";
							self.labels.common.renameErrorMessage = AD.lang.label.getLabel('ab.common.rename.error') || "System could not rename <b>{0}</b>.";
							self.labels.common.renameSuccessMessage = AD.lang.label.getLabel('ab.common.rename.success') || "Rename to <b>{0}</b>.";
							self.labels.common.deleteErrorMessage = AD.lang.label.getLabel('ab.common.delete.error') || "System could not delete <b>{0}</b>.";
							self.labels.common.deleteSuccessMessage = AD.lang.label.getLabel('ab.common.delete.success') || "<b>{0}</b> is deleted.";
							self.labels.common.createErrorMessage = AD.lang.label.getLabel('ab.common.create.error') || "System could not create <b>{0}</b>.";
							self.labels.common.createSuccessMessage = AD.lang.label.getLabel('ab.common.create.success') || "<b>{0}</b> is created.";

							self.labels.interface.addNewPage = AD.lang.label.getLabel('ab.interface.addNewPage') || 'Add new page';
							self.labels.interface.placeholderPageName = AD.lang.label.getLabel('ab.interface.placeholderPageName') || 'Page name';

							self.labels.interface.confirmDeleteTitle = AD.lang.label.getLabel('ab.interface.delete.title') || "Delete page";
							self.labels.interface.confirmDeleteMessage = AD.lang.label.getLabel('ab.interface.delete.message') || "Do you want to delete <b>{0}</b>?";
						},

						initControllers: function () {
							this.controllers = {};

							var EditTree = AD.Control.get('opstools.BuildApp.EditTree');

							this.controllers.EditTree = new EditTree();
						},

						initWebixUI: function () {
							var self = this;

							self.data.definition = {
								rows: [
									{
										id: self.webixUiId.interfaceTree,
										view: 'edittree',
										width: 250,
										select: true,
										editaction: 'custom',
										editable: true,
										editor: "text",
										editValue: "label",
										template: "<div class='ab-page-list-item'>" +
										"{common.icon()} {common.folder()} #label#" +
										"<div class='ab-page-list-edit'>" +
										"{common.iconGear}" +
										"</div>" +
										"</div>",
										type: {
											iconGear: "<span class='webix_icon fa-cog'></span>"
										},
										on: {
											onAfterSelect: function (id) {
												// Fire select page event
												self.element.trigger(self.options.selectedPageEvent, id);

												// Show gear icon
												self.showGear(id);
											},
											onAfterOpen: function () {
												var ids = this.getSelectedId(true);

												// Show gear icon
												ids.forEach(function (id) {
													self.showGear(id);
												});
											},
											onAfterClose: function () {
												var ids = this.getSelectedId(true);

												// Show gear icon
												ids.forEach(function (id) {
													self.showGear(id);
												});
											},
											onAfterEditStop: function (state, editor, ignoreUpdate) {
												if (state.value != state.old) {
													$$(self.webixUiId.interfaceTree).showProgress({ type: 'icon' });

													var selectedPage = self.data.pages.filter(function (item, index, list) { return item.id == editor.id; })[0];
													selectedPage.attr('label', state.value);

													// Call server to rename
													selectedPage.save()
														.fail(function () {
															$$(self.webixUiId.interfaceTree).hideProgress();

															webix.message({
																type: "error",
																text: self.labels.common.renameErrorMessage.replace("{0}", state.old)
															});

															AD.error.log('Page List : Error rename page data', { error: err });
														})
														.then(function () {
															if (selectedPage.translate) selectedPage.translate();

															// Show success message
															webix.message({
																type: "success",
																text: self.labels.common.renameSuccessMessage.replace('{0}', state.value)
															});

															// Show gear icon
															$($$(self.webixUiId.interfaceTree).getItemNode(editor.id)).find('.ab-object-list-edit').show();

															$$(self.webixUiId.interfaceTree).hideProgress();

															self.element.trigger(self.options.updatedPageEvent, { pagesList: self.data.pages });
														});
												}
											}
										},
										onClick: {
											"ab-page-list-edit": function (e, id, trg) {
												// Show menu
												$$(self.webixUiId.pageListMenuPopup).show(trg);

												return false;
											}
										}
									},
									{
										view: 'button',
										value: self.labels.interface.addNewPage,
										click: function () {
											$$(self.webixUiId.addNewPopup).show();
										}
									}
								]
							};

							// Edit page menu popup
							webix.ui({
								view: "popup",
								id: self.webixUiId.pageListMenuPopup,
								width: 130,
								body: {
									id: self.webixUiId.pageListMenu,
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
											var selectedPage = $$(self.webixUiId.interfaceTree).getSelectedItem();

											switch (trg.textContent.trim()) {
												case self.labels.common.rename:
													// Show textbox to rename
													$$(self.webixUiId.interfaceTree).edit(selectedPage.id);

													break;
												case self.labels.common.delete:
													webix.confirm({
														title: self.labels.interface.confirmDeleteTitle,
														ok: self.labels.common.yes,
														cancel: self.labels.common.no,
														text: self.labels.interface.confirmDeleteMessage.replace('{0}', selectedPage.label),
														callback: function (result) {
															if (result) {
																$$(self.webixUiId.interfaceTree).showProgress({ type: "icon" });

																var deletedPages = self.data.pages.filter(function (p) { return p.id == selectedPage.id; });

																// Call server to delete object data
																deletedPages[0].destroy()
																	.fail(function (err) {
																		$$(self.webixUiId.interfaceTree).hideProgress();

																		webix.message({
																			type: "error",
																			text: self.labels.common.deleteErrorMessage.replace("{0}", selectedPage.name)
																		});

																		AD.error.log('Pages List : Error delete page data', { error: err });
																	})
																	.then(function (result) {
																		self.data.pages.forEach(function (item, index, list) {
																			if (item && item.id === result.id)
																				self.data.pages.splice(index, 1);
																		});

																		$$(self.webixUiId.interfaceTree).remove(result.id);
																		$$(self.webixUiId.interfaceTree).unselectAll();

																		self.element.trigger(self.options.updatedPageEvent, { pagesList: self.data.pages });

																		webix.message({
																			type: "success",
																			text: self.labels.common.deleteSuccessMessage.replace('{0}', result.label)
																		});

																		$$(self.webixUiId.interfaceTree).hideProgress();

																	});
															}

														}
													});

													break;
											}

											$$(self.webixUiId.pageListMenuPopup).hide();
										}
									}
								}
							}).hide(); // end Edit page menu popup

							// Add new page popup
							webix.ui({
								view: "window",
								id: self.webixUiId.addNewPopup,
								width: 400,
								position: "center",
								modal: true,
								head: self.labels.interface.addNewPage,
								on: {
									"onBeforeShow": function () {
										$$(self.webixUiId.addNewForm).clearValidation();
										$$(self.webixUiId.addNewForm).clear();

										var options = [{ id: '', value: '[Root page]' }];
										$$(self.webixUiId.interfaceTree).data.each(function (d) {
											if (d.$level == 1) { // Only Root pages
												var val = d.value;
												options.push({ id: d.id, value: val });
											}

											// if (d.$level > 1)
											// 	val = '- '.repeat(d.$level - 1) + val; // Include - to sub page

											// options.push({ id: d.id, value: val });
										});

										$$(self.webixUiId.addNewParentList).define('options', options);

										// Default select parent page
										var selectedPage = $$(self.webixUiId.interfaceTree).getSelectedItem();
										if (selectedPage) {
											var selectValue = selectedPage.id;

											if (selectedPage.$level > 1)
												selectValue = selectedPage.$parent;

											$$(self.webixUiId.addNewParentList).setValue(selectValue);
										}
										else
											$$(self.webixUiId.addNewParentList).setValue('');

										$$(self.webixUiId.addNewParentList).render();
									}
								},
								body: {
									view: "form",
									id: self.webixUiId.addNewForm,
									width: 400,
									elements: [
										{ view: "select", id: self.webixUiId.addNewParentList, label: "Parent page", name: "parent", labelWidth: 110 },
										{ view: "text", label: self.labels.common.formName, name: "name", required: true, placeholder: self.labels.interface.placeholderPageName, labelWidth: 110 },
										{
											margin: 5, cols: [
												{
													view: "button", value: self.labels.common.add, type: "form", click: function () {
														if (!$$(self.webixUiId.addNewForm).validate())
															return false;

														var parentPageId = $$(self.webixUiId.addNewForm).elements['parent'].getValue(),
															newPageName = $$(self.webixUiId.addNewForm).elements['name'].getValue().trim();

														$$(self.webixUiId.interfaceTree).showProgress({ type: 'icon' });

														var newPage = {
															application: self.data.appId,
															name: newPageName,
															label: newPageName
														};

														if (parentPageId)
															newPage.parent = parentPageId;

														// Call create new page to server
														self.Model.create(newPage).fail(function () {
															$$(self.webixUiId.interfaceTree).hideProgress();

															webix.message({
																type: "error",
																text: self.labels.common.createErrorMessage.replace("{0}", newPage.label)
															});

															AD.error.log('Page : Error create page data', { error: err });

														}).then(function (result) {
															$$(self.webixUiId.addNewPopup).hide();

															if (result.translate) result.translate();

															$$(self.webixUiId.interfaceTree).add({
																id: result.id,
																value: result.name,
																label: result.label
															}, -1, result.parent ? result.parent.id : null);

															if (result.parent)
																$$(self.webixUiId.interfaceTree).open(result.parent.id, true);

															$$(self.webixUiId.interfaceTree).unselectAll();
															$$(self.webixUiId.interfaceTree).select(result.id);

															$$(self.webixUiId.interfaceTree).hideProgress();

															// Show success message
															webix.message({
																type: "success",
																text: self.labels.common.createSuccessMessage.replace('{0}', newPage.label)
															});
														});

													}
												},
												{ view: "button", value: self.labels.common.cancel, click: function () { $$(self.webixUiId.addNewPopup).hide(); } }
											]
										}
									]
								}
							}).hide();
						},

						webix_ready: function () {
							var self = this;

							webix.extend($$(self.webixUiId.interfaceTree), webix.ProgressBar);
						},

						getUIDefinition: function () {
							return this.data.definition;
						},

						loadPages: function (appId) {
							var self = this;

							self.data.appId = appId;

							$$(self.webixUiId.interfaceTree).showProgress({ type: 'icon' });

							self.Model.findAll({ application: appId })
								.fail(function (err) {
									$$(self.webixUiId.interfaceTree).hideProgress();

									webix.message({
										type: "error",
										text: err
									});

									AD.error.log('Page list : Error loading page list data', { error: err });
								})
								.then(function (data) {
									if (data && data.length > 0) {
										data.forEach(function (d) {
											if (d.translate)
												d.translate();
										});
									}

									self.data.pages = data;

									// Show data to tree component
									var treeData = $.map(data.attr(), function (d) {
										if (!d.parent) { // Get root page
											var pageItem = {
												id: d.id,
												value: d.name,
												label: d.label
											};

											// Get children pages
											pageItem.data = $.map(data.attr(), function (subD) {
												if (subD.parent && subD.parent.id == d.id) {
													return {
														id: subD.id,
														value: subD.name,
														label: subD.label
													}
												}
											});

											return pageItem;
										}
									});

									$$(self.webixUiId.interfaceTree).parse(treeData);

									$$(self.webixUiId.interfaceTree).hideProgress();
								})
						},

						showGear: function (id) {
							var self = this;

							$($$(self.webixUiId.interfaceTree).getItemNode(id)).find('.ab-page-list-edit').show();
						}


					});
				});
		});
	}
);