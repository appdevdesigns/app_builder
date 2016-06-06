
steal(
	// List your Controller's dependencies here:
	function () {
        System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control').then(function () {

					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.InterfaceList', {

						init: function (element, options) {
							var self = this;
							self.data = {};

							this.webixUiId = {
								interfaceTree: 'ab-interface-tree',

								pageListMenuPopup: 'ab-page-menu-popup',
								pageListMenu: 'ab-page-menu',

								addNewPopup: 'ab-interface-add-new-popup',
								addNewForm: 'ab-interface-add-new-form',
								addNewParentList: 'ab-interface-add-new-parent-list'
							};

							this.rules = {};
							this.rules.preventDuplicateName = function (value) {
								// TODO: Check duplicate
								var duplicatePageName = jQuery.grep(self.data.pageList, function (m, index) {
									return m.name.toLowerCase().trim() == value.toLowerCase();
								});

								if (duplicatePageName && duplicatePageName.length > 0) {
									return false;
								}
								else {
									return true;
								}
							};

							self.initMultilingualLabels();

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
							self.labels.common.createErrorMessage = AD.lang.label.getLabel('ab.common.create.error') || "System could not create <b>{0}</b>.";
							self.labels.common.createSuccessMessage = AD.lang.label.getLabel('ab.common.create.success') || "<b>{0}</b> is created.";

							self.labels.interface.addNewPage = AD.lang.label.getLabel('ab.interface.addNewPage') || 'Add new page';
							self.labels.interface.placeholderPageName = AD.lang.label.getLabel('ab.interface.placeholderPageName') || 'Page name';
						},

						initWebixUI: function () {
							var self = this;

							self.data.definition = {
								rows: [
									{
										id: self.webixUiId.interfaceTree,
										view: 'tree',
										width: 250,
										select: true,
										drag: true,
										template: "<div class='ab-page-list-item'>" +
										"{common.icon()} {common.folder()} #label#" +
										"<div class='ab-page-list-edit'>" +
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
												// Fire select page event
												// self.element.trigger(self.options.selectedPageEvent, id);

												// Show gear icon
												$(this.getItemNode(id)).find('.ab-page-list-edit').show();
											}
										},
										onClick: {
											"ab-page-list-edit": function (e, id, trg) {
												console.log('self.webixUiId.pageListMenuPopup');
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
										// 'onItemClick': function (timestamp, e, trg) {
										// 	var selectedObject = $$(self.webixUiId.objectList).getSelectedItem();

										// 	switch (trg.textContent.trim()) {
										// 		case self.labels.common.rename:
										// 			// Show textbox to rename
										// 			$$(self.webixUiId.objectList).edit(selectedObject.id);

										// 			break;
										// 		case self.labels.common.delete:
										// 			webix.confirm({
										// 				title: self.labels.object.confirmDeleteTitle,
										// 				ok: self.labels.common.yes,
										// 				cancel: self.labels.common.no,
										// 				text: self.labels.object.confirmDeleteMessage.replace('{0}', selectedObject.name),
										// 				callback: function (result) {
										// 					if (result) {

										// 						$$(self.webixUiId.objectList).showProgress({ type: "icon" });

										// 						// Call server to delete object data
										// 						self.Object.destroy(selectedObject.id)
										// 							.fail(function (err) {
										// 								$$(self.webixUiId.objectList).hideProgress();

										// 								webix.message({
										// 									type: "error",
										// 									text: self.labels.common.deleteErrorMessage.replace("{0}", selectedObject.name)
										// 								});

										// 								AD.error.log('Object List : Error delete object data', { error: err });
										// 							})
										// 							.then(function (result) {
										// 								self.data.objectList.forEach(function (item, index, list) {
										// 									if (item && item.id === selectedObject.id)
										// 										self.data.objectList.splice(index, 1);
										// 								});

										// 								$$(self.webixUiId.objectList).remove(selectedObject.id);

										// 								self.element.trigger(self.options.updatedObjectEvent, { objectList: self.data.objectList.attr() });

										// 								webix.message({
										// 									type: "success",
										// 									text: self.labels.common.deleteSuccessMessage.replace('{0}', selectedObject.name)
										// 								});

										// 								$$(self.webixUiId.objectList).hideProgress();

										// 							});
										// 					}

										// 				}
										// 			});

										// 			break;
										// 	}

										// 	$$(self.webixUiId.objectListMenuPopup).hide();
										// }
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
											var val = d.value;

											if (d.$level > 1)
												val = '- '.repeat(d.$level - 1) + val; // Include - to sub page

											options.push({ id: d.id, value: val });
										});

										$$(self.webixUiId.addNewParentList).define('options', options);

										// Default select parent page
										if ($$(self.webixUiId.interfaceTree).getSelectedId())
											$$(self.webixUiId.addNewParentList).setValue($$(self.webixUiId.interfaceTree).getSelectedId());
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

														if ($$(self.webixUiId.interfaceTree).showProgress)
															$$(self.webixUiId.interfaceTree).showProgress({ type: 'icon' });

														var newPage = {
															name: newPageName,
															label: newPageName,
															parentPageId: parentPageId
														};

														// // TODO: Add new page to server
														// self.Model.create(newPage).fail(function () {
														// 	$$(self.webixUiId.interfaceTree).hideProgress();

														// 	webix.message({
														// 		type: "error",
														// 		text: self.labels.common.createErrorMessage.replace("{0}", newPage.name)
														// 	});

														// 	AD.error.log('Page : Error create page data', { error: err });

														// }).then(function (result) {
														$$(self.webixUiId.addNewPopup).hide();

														// if (result.translate) result.translate();

														var resultId = webix.uid(); // TODO: result.id

														$$(self.webixUiId.interfaceTree).add({
															id: resultId,
															value: newPage.label // TODO
														}, -1, newPage.parentPageId || null);

														if (newPage.parentPageId)
															$$(self.webixUiId.interfaceTree).open(newPage.parentPageId, true);

														$$(self.webixUiId.interfaceTree).unselectAll();
														$$(self.webixUiId.interfaceTree).select(resultId);

														if ($$(self.webixUiId.interfaceTree).hideProgress)
															$$(self.webixUiId.interfaceTree).hideProgress();

														// // Show success message
														webix.message({
															type: "success",
															text: self.labels.common.createSuccessMessage.replace('{0}', newPage.name)
														});
														// });

													}
												},
												{ view: "button", value: self.labels.common.cancel, click: function () { $$(self.webixUiId.addNewPopup).hide(); } }
											]
										}
									],
									// rules: {
									// 	name: self.rules.preventDuplicateName
									// }

								}
							}).hide();
						},

						getUIDefinition: function () {
							return this.data.definition;
						},

						open: function () {
							var self = this;

							if ($$(self.webixUiId.interfaceTree).showProgress)
								$$(self.webixUiId.interfaceTree).showProgress({ type: 'icon' });

							// TODO: load page data
							$$(self.webixUiId.interfaceTree).parse([
								{
									id: "1", open: true, value: "Page One", label: "Page One", data: [
										{ id: "11", value: "Part 1.1", label: "Part 1.1" },
										{ id: "12", value: "Part 1.2", label: "Part 1.2" },
										{ id: "13", value: "Part 1.3", label: "Part 1.3" }
									]
								},
								{
									id: "2", value: "Page Two", label: "Page Two", data: [
										{ id: "21", value: "Part 2.1", label: "Part 2.1" },
										{ id: "22", value: "Part 2.2", label: "Part 2.2" }
									]
								}
							]);

							if ($$(self.webixUiId.interfaceTree).hideProgress)
								$$(self.webixUiId.interfaceTree).hideProgress();
						}


					});
				});
		});
	}
);