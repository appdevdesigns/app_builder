steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/InterfaceAddNewPage.js',

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
								createdPageEvent: 'AB_Page.Created',
								updatedPageEvent: 'AB_Page.Updated',
								deletedPageEvent: 'AB_Page.Deleted'
							}, options);
							this.options = options;

							self.data = {};

							this.webixUiId = {
								interfaceTree: 'ab-interface-tree',

								pageListMenuPopup: 'ab-page-menu-popup',
								pageListMenu: 'ab-page-menu'
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

							self.labels.common.rename = AD.lang.label.getLabel('ab.common.rename') || "Rename";
							self.labels.common.delete = AD.lang.label.getLabel('ab.common.delete') || "Delete";
							self.labels.common.renameErrorMessage = AD.lang.label.getLabel('ab.common.rename.error') || "System could not rename <b>{0}</b>.";
							self.labels.common.renameSuccessMessage = AD.lang.label.getLabel('ab.common.rename.success') || "Rename to <b>{0}</b>.";
							self.labels.common.deleteErrorMessage = AD.lang.label.getLabel('ab.common.delete.error') || "System could not delete <b>{0}</b>.";
							self.labels.common.deleteSuccessMessage = AD.lang.label.getLabel('ab.common.delete.success') || "<b>{0}</b> is deleted.";
							self.labels.common.createSuccessMessage = AD.lang.label.getLabel('ab.common.create.success') || "<b>{0}</b> is created.";
							self.labels.common.createErrorMessage = AD.lang.label.getLabel('ab.common.create.error') || "System could not create <b>{0}</b>.";

							self.labels.interface.addNewPage = AD.lang.label.getLabel('ab.interface.addNewPage') || 'Add new page';

							self.labels.interface.confirmDeleteTitle = AD.lang.label.getLabel('ab.interface.delete.title') || "Delete page";
							self.labels.interface.confirmDeleteMessage = AD.lang.label.getLabel('ab.interface.delete.message') || "Do you want to delete <b>{0}</b>?";
						},

						initControllers: function () {
							this.controllers = {};

							var AddNewPage = AD.Control.get('opstools.BuildApp.InterfaceAddNewPage');

							this.controllers.AddNewPage = new AddNewPage(this.element, { data: this.data });
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
										template: function (item, common) {
											var template = "<div class='ab-page-list-item'>" +
												"{common.icon()} <span class='webix_icon #typeIcon#'></span> #label#" +
												"<div class='ab-page-list-edit'>" +
												"{common.iconGear}" +
												"</div>" +
												"</div>";

											switch (item.type) {
												case 'modal':
													template = template.replace('#typeIcon#', 'fa-list-alt');
													break;
												case 'tab':
													template = template.replace('#typeIcon#', 'fa-folder-o');
													break;
												case 'page':
												default:
													template = template.replace('#typeIcon#', 'fa-file-o');
													break;
											}

											return template
												.replace('#label#', item.label)
												.replace('{common.icon()}', common.icon(item))
												.replace('{common.iconGear}', common.iconGear);
										},
										type: {
											iconGear: "<span class='webix_icon fa-cog'></span>"
										},
										on: {
											onAfterRender: function () {
												// Show gear icon
												if (this.getSelectedId(true).length > 0)
													self.showGear(this.getSelectedId(false));
											},
											onAfterSelect: function (id) {
												// Show gear icon
												self.showGear(id);

												var selectedPage = AD.classes.AppBuilder.currApp.pages.filter(function (p) { return p.id == id; });
												if (selectedPage && selectedPage.length > 0) {
													self.element.trigger(self.options.selectedPageEvent, { selectedPage: selectedPage[0] });
												}
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

													var selectedPage = AD.classes.AppBuilder.currApp.pages.filter(function (item, index, list) { return item.id == editor.id; });

													if (!selectedPage || selectedPage.length < 1) {
														console.error('Could not found the page');
														return;
													}

													selectedPage = selectedPage[0];
													selectedPage.attr('label', state.value);

													// Call server to rename
													selectedPage.save()
														.fail(function () {
															$$(self.webixUiId.interfaceTree).hideProgress();

															// Show gear icon
															self.showGear(result.id);

															webix.message({
																type: "error",
																text: self.labels.common.renameErrorMessage.replace("{0}", state.old)
															});

															AD.error.log('Page List : Error rename page data', { error: err });
														})
														.then(function (result) {
															if (selectedPage.translate) selectedPage.translate();

															// Show success message
															webix.message({
																type: "success",
																text: self.labels.common.renameSuccessMessage.replace('{0}', state.value)
															});

															// Show gear icon
															$($$(self.webixUiId.interfaceTree).getItemNode(editor.id)).find('.ab-object-list-edit').show();

															$$(self.webixUiId.interfaceTree).hideProgress();

															// Show gear icon
															self.showGear(result.id);

															self.element.trigger(self.options.updatedPageEvent, { updatedPageId: result.id });
														});
												}
											},
											onAfterDelete: function (id) {
												// Fire unselect page event
												self.element.trigger(self.options.deletedPageEvent, {});
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
											self.controllers.AddNewPage.show();
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

																var deletedPages = AD.classes.AppBuilder.currApp.pages.filter(function (p) { return p.id == selectedPage.id; });
																if (!deletedPages || deletedPages.length < 1) {
																	console.error('Could not found the page.');
																	return;
																}

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
																		$$(self.webixUiId.interfaceTree).unselectAll();

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

						},

						webix_ready: function () {
							var self = this;

							webix.extend($$(self.webixUiId.interfaceTree), webix.ProgressBar);

							self.controllers.AddNewPage.webix_ready();
						},

						getUIDefinition: function () {
							return this.data.definition;
						},

						loadPages: function () {
							var self = this;

							$$(self.webixUiId.interfaceTree).clearAll();
							$$(self.webixUiId.interfaceTree).showProgress({ type: 'icon' });

							AD.classes.AppBuilder.currApp.unbind('change');
							AD.classes.AppBuilder.currApp.bind('change', function (ev, attr, how, newVals, oldVals) {
								if (attr.indexOf('pages') !== 0 || (attr.indexOf('label') === -1 && attr.indexOf('type') === -1 && (attr.match(/\./g) || []).length > 1)) return;

								console.log('InterfaceList: change ', ev, attr, how, newVals, oldVals);

								switch (how) {
									case 'add':
										if (newVals.forEach) {
											newVals.forEach(function (newPage) {
												if (newPage)
													self.addPage(newPage, true);
											});
										}
										break;
									case 'set':
										if (ev.target && $$(self.webixUiId.interfaceTree).exists(ev.target.id)) { // Update label or page type
											$$(self.webixUiId.interfaceTree).updateItem(ev.target.id, ev.target.attr());

											// Show gear
											if ($$(self.webixUiId.interfaceTree).getSelectedId(true).length > 0)
												self.showGear($$(self.webixUiId.interfaceTree).getSelectedId(false));
										}
										// TODO: weight -> reorder
										break;
									case 'remove':
										if (oldVals.forEach) {
											oldVals.forEach(function (deletedPage) {
												if (deletedPage && $$(self.webixUiId.interfaceTree).exists(deletedPage.id))
													$$(self.webixUiId.interfaceTree).remove(deletedPage.id);
											});
											self.element.trigger(self.options.updatedPageEvent, {});
										}
										break;
								}
							});

							var pages = AD.classes.AppBuilder.currApp.pages.attr();
							var map = {}, page, treeData = [];

							// Convert array to tree data
							for (var i = 0; i < pages.length; i += 1) {
								page = pages[i];
								page.data = [];
								map[page.id] = i; // use map to look-up the parents
								if (page.parent) {
									var parentId = page.parent.id ? page.parent.id : page.parent;
									pages[map[parentId]].data.push(page);
								} else {
									treeData.push(page);
								}
							}

							$$(self.webixUiId.interfaceTree).parse(treeData);
							$$(self.webixUiId.interfaceTree).hideProgress();
						},

						showGear: function (id) {
							var self = this;

							$($$(self.webixUiId.interfaceTree).getItemNode(id)).find('.ab-page-list-edit').show();
						},

						addPage: function (page, noSelect) {
							var self = this;

							$$(self.webixUiId.interfaceTree).add({
								id: page.id,
								value: page.name,
								label: page.label,
								type: page.type
								// weight: page.weight
							}, -1, page.parent ? page.parent.id : null);

							if (page.parent)
								$$(self.webixUiId.interfaceTree).open(page.parent.id, true);

							if (!noSelect) {
								$$(self.webixUiId.interfaceTree).unselectAll();
								$$(self.webixUiId.interfaceTree).select(page.id);
							}

							// Show success message
							webix.message({
								type: "success",
								text: self.labels.common.createSuccessMessage.replace('{0}', page.label)
							});
						},

						resize: function (height) {
							var self = this,
								selectedPages = $$(self.webixUiId.interfaceTree).getSelectedId(true);

							if (selectedPages && selectedPages.length > 0)
								self.showGear(selectedPages[0]);
						}


					});
				});
		});
	}
);