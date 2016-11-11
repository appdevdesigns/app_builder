
steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/utils/ModelCreator.js',

	'opstools/BuildApp/controllers/webix_custom_components/EditList.js',
	function (modelCreator) {
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
								createdObjectEvent: 'AB_Object.Created',
								deletedObjectEvent: 'AB_Object.Deleted',

								countCachedItemEvent: 'AB_Cached.Count'
							}, options);
							this.options = options;

							// Call parent init
							this._super(element, options);

							this.data = {};

							this.webixUiId = {
								objectList: 'ab-object-list',
								objectListMenuPopup: 'ab-object-list-menu-popup',
								objectListMenu: 'ab-object-list-menu',
								addNewPopup: 'ab-object-add-new-popup',
								addNewForm: 'ab-object-add-new-form'
							};

							this.rules = {};
							this.rules.preventDuplicateName = function (value, id) {
								// Check duplicate
								var duplicateObject = AD.classes.AppBuilder.currApp.objects.filter(function (obj) {
									return obj.id != id &&
										(obj.name.toLowerCase().trim() == value.toLowerCase().trim() ||
											obj.label.toLowerCase().trim() == value.toLowerCase().trim());
								});

								if (duplicateObject && duplicateObject.length > 0) {
									return false;
								}
								else {
									return true;
								}
							};

							this.initMultilingualLabels();
							this.initEvents();

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

						initEvents: function () {
							var self = this;

							$(modelCreator).on(self.options.countCachedItemEvent, function (event, data) {
								self.refreshUnsyncNumber(data.objectName);
							});
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
										"{common.unsyncNumber}" +
										"{common.iconGear}" +
										"</div>",
										type: {
											unsyncNumber: "<span class='ab-object-unsync'><span class='ab-object-unsync-number'></span> unsync</span>",
											iconGear: "<div class='ab-object-list-edit'><span class='webix_icon fa-cog'></span></div>"
										},
										on: {
											onAfterRender: function () {
												webix.once(function () {
													$$(self.webixUiId.objectList).data.each(function (d) {
														$($$(self.webixUiId.objectList).getItemNode(d.id)).find('.ab-object-unsync-number').html(99);
													});
												});

												// Show gear icon
												if (this.getSelectedId(true).length > 0) {
													$(this.getItemNode(this.getSelectedId(false))).find('.ab-object-list-edit').show();
													self.refreshUnsyncNumber();
												}
											},
											onAfterSelect: function (id) {
												// Fire select object event
												self.element.trigger(self.options.selectedObjectEvent, id);

												// Refresh unsync number
												self.refreshUnsyncNumber();

												// Show gear icon
												$(this.getItemNode(id)).find('.ab-object-list-edit').show();
											},
											onAfterDelete: function (id) {
												// Fire unselect event 
												self.element.trigger(self.options.selectedObjectEvent, null);
											},
											onBeforeEditStop: function (state, editor) {
												// Validation - check duplicate
												if (!self.rules.preventDuplicateName(state.value, editor.id) && state.value != state.old) {
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

													var selectedObject = AD.classes.AppBuilder.currApp.objects.filter(function (item, index, list) { return item.id == editor.id; })[0];
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

															if (selectedObject.translate) selectedObject.translate();

															// Show success message
															webix.message({
																type: "success",
																text: self.labels.common.renameSuccessMessage.replace('{0}', state.value)
															});

															// Show gear icon
															$(_this.getItemNode(editor.id)).find('.ab-object-list-edit').show();
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
										onItemClick: function (timestamp, e, trg) {
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
															if (!result) return;

															$$(self.webixUiId.objectList).showProgress({ type: "icon" });

															var delObj = AD.classes.AppBuilder.currApp.objects.filter(function (obj) { return obj.id == selectedObject.id });
															if (delObj && delObj.length < 1) return;

															// Call server to delete object data
															delObj[0].destroy()
																.fail(function (err) {
																	$$(self.webixUiId.objectList).hideProgress();

																	webix.message({
																		type: "error",
																		text: self.labels.common.deleteErrorMessage.replace("{0}", delObj.label)
																	});

																	AD.error.log('Object List : Error delete object data', { error: err });
																})
																.then(function (result) {
																	if (delObj)
																		self.element.trigger(self.options.deletedObjectEvent, { object: selectedObject });

																	webix.message({
																		type: "success",
																		text: self.labels.common.deleteSuccessMessage.replace('{0}', selectedObject.label)
																	});

																	$$(self.webixUiId.objectList).hideProgress();

																});
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
															label: newObjectName
														};

														// Add new object to server
														AD.classes.AppBuilder.currApp.createObject(newObject).fail(function (err) {
															$$(self.webixUiId.objectList).hideProgress();

															AD.error.log('Object : Error create object data', { error: err });

														}).then(function (result) {
															$$(self.webixUiId.addNewPopup).hide();

															if ($$(self.webixUiId.addNewPopup).config.selectNewObject) {
																$$(self.webixUiId.objectList).unselectAll();
																$$(self.webixUiId.objectList).select(result.id);
															}

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

						webix_ready: function () {
							webix.extend($$(this.webixUiId.objectList), webix.ProgressBar);
						},

						getUIDefinition: function () {
							return this.data.definition;
						},

						selectObjectItem: function (objId) {
							$$(this.webixUiId.objectList).select(objId);
						},

						refreshObjectList: function () {
							var objectList = AD.op.WebixDataCollection(AD.classes.AppBuilder.currApp.objects);

							$$(this.webixUiId.objectList).showProgress({ type: "icon" });

							$$(this.webixUiId.objectList).clearAll();
							$$(this.webixUiId.objectList).data.unsync();
							$$(this.webixUiId.objectList).data.sync(objectList);
							$$(this.webixUiId.objectList).refresh();
							$$(this.webixUiId.objectList).unselectAll();

							this.refreshUnsyncNumber();

							$$(this.webixUiId.objectList).hideProgress();
						},

						refreshUnsyncNumber: function (objectName) {
							var self = this,
								objects = [];

							objects = $$(self.webixUiId.objectList).data.find(function (d) {
								return objectName ? d.name == objectName : true;
							}, false, true);

							objects.forEach(function (obj) {
								var objectModel = modelCreator.getModel(AD.classes.AppBuilder.currApp, obj.name),
									unsyncNumber = objectModel.Cached.count(),
									htmlItem = $($$(self.webixUiId.objectList).getItemNode(obj.id));

								if (unsyncNumber > 0) {
									htmlItem.find('.ab-object-unsync-number').html(unsyncNumber);
									htmlItem.find('.ab-object-unsync').show();
								}
								else {
									htmlItem.find('.ab-object-unsync').hide();
								}
							});
						},

						resetState: function () {
							$$(this.webixUiId.objectList).unselectAll();
							$$(this.webixUiId.objectList).clearAll();
							$$(this.webixUiId.objectList).refresh();
						}

					}); // end AD.Control.extend
				});
		});
	}
);