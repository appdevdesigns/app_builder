steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/models/ABObject.js',
	'opstools/BuildApp/models/ABPage.js',
	'opstools/BuildApp/models/ABPageComponent.js',

	'opstools/BuildApp/controllers/utils/ModelCreator.js',
	'opstools/BuildApp/controllers/utils/DataHelper.js',

	'opstools/BuildApp/controllers/webix_custom_components/ActiveList.js',
	function () {
		System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control').then(function () {

					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.InterfaceLayoutView', {

						init: function (element, options) {
							var self = this;

							self.options = AD.defaults({
								editComponentEvent: 'AB_Page.EditComponent',
								savedComponentEvent: 'AB_Page.SavedComponent',
								cancelComponentEvent: 'AB_Page.CancelComponent'
							}, options);

							// Call parent init
							self._super(element, self.options);
							self.Model = {
								ABObject: AD.Model.get('opstools.BuildApp.ABObject'),
								ABPage: AD.Model.get('opstools.BuildApp.ABPage'),
								ABPageComponent: AD.Model.get('opstools.BuildApp.ABPageComponent')
							};
							self.data = {};

							self.componentIds = {
								layoutToolbar: 'ab-interface-layout-toolbar',
								layoutToolbarHeader: 'ab-interface-layout-toolbar-header',

								saveComponentInfo: 'ab-interface-save-component-info',
								cancelComponentInfo: 'ab-interface-cancel-component-info',

								layoutSpace: 'ab-interface-layout-space',

								componentList: 'ab-interface-componentList'
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
							self.labels.interface.component = {};

							self.labels.common.save = AD.lang.label.getLabel('ab.common.save') || "Save";
							self.labels.common.cancel = AD.lang.label.getLabel('ab.common.cancel') || "Cancel";
							self.labels.common.yes = AD.lang.label.getLabel('ab.common.yes') || "Yes";
							self.labels.common.no = AD.lang.label.getLabel('ab.common.no') || "No";
							self.labels.common.createErrorMessage = AD.lang.label.getLabel('ab.common.create.error') || "System could not create <b>{0}</b>.";
							self.labels.common.createSuccessMessage = AD.lang.label.getLabel('ab.common.create.success') || "<b>{0}</b> is created.";
							self.labels.common.deleteErrorMessage = AD.lang.label.getLabel('ab.common.delete.error') || "System could not delete <b>{0}</b>.";
							self.labels.common.deleteSuccessMessage = AD.lang.label.getLabel('ab.common.delete.success') || "<b>{0}</b> is deleted.";

							self.labels.interface.component.layoutHeader = AD.lang.label.getLabel('ab.interface.component.layoutHeader') || "Page Layout";
							self.labels.interface.component.getErrorMessage = AD.lang.label.getLabel('ab.interface.component.getErrorMessage') || "System could not load components in this page";
							self.labels.interface.component.confirmDeleteTitle = AD.lang.label.getLabel('ab.interface.component.confirmDeleteTitle') || "Delete component";
							self.labels.interface.component.confirmDeleteMessage = AD.lang.label.getLabel('ab.interface.component.confirmDeleteMessage') || "Do you want to delete <b>{0}</b>?";
						},

						initControllers: function () {
							var self = this;

							var ActiveList = AD.Control.get('opstools.BuildApp.ActiveList'),
								ModelCreator = AD.Control.get('opstools.BuildApp.ModelCreator'),
								DataHelper = AD.Control.get('opstools.BuildApp.DataHelper');

							this.controllers = {
								ActiveList: new ActiveList(),
								ModelCreator: new ModelCreator(),
								DataHelper: new DataHelper()
							};
						},

						initEvents: function () {
							var self = this,
								event_aggregator = $(self);

							for (var key in self.data.components) {
								var comInstance = self.data.components[key];
								if (comInstance.registerEventAggregator)
									comInstance.registerEventAggregator(event_aggregator);
							}

							event_aggregator.on('save', function (sender, data) {
								switch (data.component_name) {
									case 'Form':
										var objectGridDatas = self.data.componentsInPage.filter(function (c) {
											return c.component === 'Grid' && c.setting.editForm == data.id;
										});

										objectGridDatas.forEach(function (grid) {
											var gridId = self.getComponentId(grid.id);
											if ($$(gridId)) $$(gridId).unselectAll();
										});

										$$(data.viewId).setValues({});
										break;
								}
							});

							event_aggregator.on('cancel', function (sender, data) {
								switch (data.component_name) {
									case 'Form':
										var objectGridDatas = self.data.componentsInPage.filter(function (c) {
											return c.component === 'Grid' && c.setting.editForm == data.id;
										});

										objectGridDatas.forEach(function (grid) {
											var gridId = self.getComponentId(grid.id);
											if ($$(gridId) && $$(gridId).unselectAll)
												$$(gridId).unselectAll();
										});

										$$(data.viewId).setValues({});
										break;
								}
							});

						},

						initWebixUI: function () {
							var self = this;

							self.data.definition = {
								view: 'layout',
								rows: [
									{
										view: 'toolbar',
										id: self.componentIds.layoutToolbar,
										cols: [
											{
												view: 'label',
												id: self.componentIds.layoutToolbarHeader,
												label: self.labels.interface.component.layoutHeader
											},
											{
												view: 'button',
												id: self.componentIds.saveComponentInfo,
												label: self.labels.common.save,
												width: 100,
												click: function () {
													if (!self.data.editedComponentId) return;

													var editedComponent = $.grep(self.data.componentsInPage, function (c) { return c.id == self.data.editedComponentId; })[0],
														component = self.data.components[editedComponent.attr('component')],
														editViewId = component.getEditView().id;

													$$(editViewId).showProgress({ type: 'icon' });

													component.editStop();

													editedComponent.attr('setting', component.getSettings());

													editedComponent.save()
														.fail(function (err) {
															$$(editViewId).hideProgress();
														})
														.then(function (result) {
															// Update item in list
															var updatedItem = $$(self.componentIds.componentList).getItem(self.data.editedComponentId);
															updatedItem.setting = result.attr('setting');
															$$(self.componentIds.componentList).updateItem(self.data.editedComponentId, updatedItem);

															self.openLayoutViewMode();

															self.generateComponentsInList()
																.always(function () {
																	self.element.trigger(self.options.savedComponentEvent, {});

																	$$(editViewId).hideProgress();
																});
														});
												}
											},
											{
												view: 'button',
												id: self.componentIds.cancelComponentInfo,
												label: self.labels.common.cancel,
												width: 100,
												click: function () {
													self.openLayoutViewMode();

													self.element.trigger(self.options.cancelComponentEvent, {});
												}
											}
										]
									},
									{
										id: self.componentIds.layoutSpace,
										autowidth: true,
										cells: [
											{
												view: 'activelist',
												id: self.componentIds.componentList,
												// drag: 'target',
												drag: true,
												select: false,
												type: {
													height: 'auto'
												},
												activeContent: {
													editButton: {
														view: 'button',
														value: 'Edit',
														width: 50,
														earlyInit: true,
														on: {
															onItemClick: function (id, e) { // Open Component view
																var item_id = $$(self.componentIds.componentList).locate(e),
																	item = $$(self.componentIds.componentList).getItem(item_id),
																	component = self.data.components[item.name];

																self.data.editedComponentId = item_id;


																if ($$(item.name + '-edit-view')) {
																	if (!item.setting) item.setting = {};

																	// Pass current page
																	if (component.setPage)
																		component.setPage(self.data.page);

																	component.populateSettings(item, self.getDataCollection.bind(self));

																	$$(self.componentIds.layoutToolbarHeader).define('label', item.name + ' View');
																	$$(self.componentIds.layoutToolbarHeader).refresh();

																	$$(self.componentIds.saveComponentInfo).show();
																	$$(self.componentIds.cancelComponentInfo).show();

																	$$(item.name + '-edit-view').show();
																}

																self.element.trigger(self.options.editComponentEvent, { item: item });
															}
														}
													}
												},
												template: function (obj, common) {
													var templateHtml = '<div class="ab-component-in-page">' +
														'<div class="ab-component-item-name">' +
														'<div><i class="fa #icon#"" aria-hidden="true"></i> #name#</div>' +
														'<div>{common.editButton()}</div>' +
														'</div>' +
														'<div class="ab-component-item-display">' +
														'<div id="ab-layout-component-#id#"></div>' + //#view#
														'<i class="fa fa-times ab-component-remove"></i>' +
														'</div>' +
														'</div>';

													// Replace values to template
													for (var key in obj) {
														templateHtml = templateHtml.replace(new RegExp('#' + key + '#', 'g'), obj[key]);
													}

													// Generate Edit button
													var editButtonView = common['editButton'] ? common['editButton'].apply(this, arguments) : "";
													templateHtml = templateHtml.replace('{common.editButton()}', editButtonView);

													// // Set component view
													// var componentView = common[obj.name] ? common[obj.name].apply(this, arguments) : "";
													// templateHtml = templateHtml.replace(/#view#/g, componentView);

													return templateHtml;
												},
												externalData: function (data, id) {
													if (id) {
														$$(self.componentIds.componentList).showProgress({ type: 'icon' });

														var addNewComponent = self.Model.ABPageComponent.newInstance();
														addNewComponent.attr('page', self.data.page.attr('id'));
														addNewComponent.attr('component', data.name);
														addNewComponent.attr('weight', $$(self.componentIds.componentList).count());

														addNewComponent.save()
															.fail(function (err) {
																$$(self.componentIds.componentList).hideProgress();

																webix.message({
																	type: "error",
																	text: self.labels.common.createErrorMessage.replace("{0}", data.name)
																});

																AD.error.log('Add Component : Error add component', { error: err });
															})
															.then(function (result) {
																$$(self.componentIds.componentList).data.changeId(id, result.attr('id'));

																var existsCom = $.grep(self.data.componentsInPage, function (c) { c.id == result.attr('id') });
																if (existsCom && existsCom.length > 0) {
																	self.data.componentsInPage.forEach(function (c) {
																		if (c.id == result.attr('id'))
																			c = result;
																	});
																}
																else {
																	self.data.componentsInPage.push(result);
																}

																webix.message({
																	type: "success",
																	text: self.labels.common.createSuccessMessage.replace('{0}', data.name)
																});

																$$(self.componentIds.componentList).hideProgress();
															});

													}

													return data;
												},
												on: {
													onBeforeDrop: function (context, ev) {
														if (context.from.config.id === self.componentIds.componentList) {
															return true;
														}
														else {
															for (var i = 0; i < context.source.length; i++) {
																context.from.copy(context.source[i], context.start, this, webix.uid());
															}

															self.hideDropAreaZone();
														}

														return false;
													},
													onAfterDrop: function (context, ev) {
														if (context.from.config.id === self.componentIds.componentList) {
															$$(self.componentIds.componentList).showProgress({ type: 'icon' });

															var componentIndexes = [];

															// Sort data
															for (var index = 0; index < $$(self.componentIds.componentList).count(); index++) {
																var comId = $$(self.componentIds.componentList).getIdByIndex(index),
																	com = self.data.componentsInPage.filter(function (c) { return c.id == comId });

																if (com && com.length > 0) {
																	com[0].attr('weight', index);

																	componentIndexes.push({
																		id: com[0].id,
																		index: com[0].weight
																	});

																}
															}

															// Call sort components api
															self.Model.ABPage.sortComponents(self.data.page.id, componentIndexes, function (err, result) {
																$$(self.componentIds.componentList).hideProgress();

																if (err) {
																	// TODO : show error message
																	return false;
																}
															});
														}
													}
												},
												onClick: {
													"ab-component-remove": function (e, id, trg) {
														var deletedComponent = $$(self.componentIds.componentList).getItem(id);

														if (!deletedComponent) return false;

														webix.confirm({
															title: self.labels.interface.component.confirmDeleteTitle,
															ok: self.labels.common.yes,
															cancel: self.labels.common.no,
															text: self.labels.interface.component.confirmDeleteMessage.replace('{0}', deletedComponent.name),
															callback: function (result) {
																if (result) {

																	$$(self.componentIds.componentList).showProgress({ type: "icon" });

																	var deletedCom = self.data.componentsInPage.filter(function (c) { return c.id == id; });

																	if (!deletedCom || deletedCom.length < 1) {
																		$$(self.componentIds.componentList).hideProgress();
																		return;
																	}

																	deletedCom = deletedCom[0];

																	// Call server to delete object data
																	// self.Model.ABPageComponent.destroy(id)
																	deletedCom.destroy()
																		.fail(function (err) {
																			$$(self.componentIds.componentList).hideProgress();

																			webix.message({
																				type: "error",
																				text: self.labels.common.deleteErrorMessage.replace("{0}", deletedComponent.name)
																			});

																			AD.error.log('Component : Error delete component', { error: err });
																		})
																		.then(function (result) {
																			self.data.componentsInPage.forEach(function (c, index) {
																				if (c.id == id) {
																					self.data.componentsInPage.removeAttr(index);
																					c.destroyed();
																				}
																			});

																			$$(self.componentIds.componentList).remove(id);

																			webix.message({
																				type: "success",
																				text: self.labels.common.deleteSuccessMessage.replace('{0}', deletedComponent.name)
																			});

																			$$(self.componentIds.componentList).hideProgress();

																		});
																}

															}
														});

														return false;
													}
												}
											} // End component list
										] // End cells
									}
								]
							};
						},

						webix_ready: function () {
							var self = this;

							$$(self.componentIds.layoutToolbar).hide();

							webix.extend($$(self.componentIds.componentList), webix.ProgressBar);

							for (var key in self.data.components) {
								var editView = self.data.components[key].getEditView();
								if (editView) {
									webix.extend($$(editView.id), webix.ProgressBar);
								}
							}
						},

						getUIDefinition: function () {
							return this.data.definition;
						},

						getComponentId: function (id) {
							return 'ab-layout-component-{0}'.replace('{0}', id);
						},

						setApp: function (app) {
							var self = this;

							self.resetState();

							self.data.app = app;

							self.controllers.ModelCreator.setApp(app);
						},

						setPage: function (page) {
							var self = this;

							self.resetState();

							$$(self.componentIds.componentList).showProgress({ type: 'icon' });
							$$(self.componentIds.layoutToolbar).show();

							self.data.page = page;

							self.Model.ABPageComponent.findAll({ page: page.attr('id') })
								.fail(function (err) {
									$$(self.componentIds.componentList).hideProgress();

									webix.message({
										type: "error",
										text: self.labels.interface.component.getErrorMessage
									});

									AD.error.log('Get components in page : Error get components', { error: err });
								})
								.then(function (result) {
									self.data.componentsInPage = result;

									var definedComponents = $.map(result.attr(), function (r) {
										var com = {
											id: r.id,
											name: r.component,
											weight: r.weight,
											setting: r.setting
										};

										return com;
									});

									definedComponents.forEach(function (c) {
										var comObj = self.data.components[c.name];

										if (comObj)
											c.icon = comObj.info.icon;
									});

									definedComponents.sort(function (a, b) { return a.weight - b.weight });

									$$(self.componentIds.componentList).parse(definedComponents);

									self.generateComponentsInList();

									self.initEvents();

									$$(self.componentIds.componentList).hideProgress();
								});
						},

						setObjectList: function (objectList) {
							this.controllers.DataHelper.setObjectList(objectList);
						},

						setComponents: function (components) {
							var self = this;

							self.data.components = components;

							// Get layout space definition
							var layoutSpaceDefinition = $.grep(self.data.definition.rows, function (r) { return r.id == self.componentIds.layoutSpace; });
							layoutSpaceDefinition = (layoutSpaceDefinition && layoutSpaceDefinition.length > 0) ? layoutSpaceDefinition[0] : null;

							for (var key in self.data.components) {
								var editView = self.data.components[key].getEditView();
								if (editView)
									layoutSpaceDefinition.cells.push(editView);
							}
						},

						openLayoutViewMode: function () {
							var self = this;

							self.data.editedComponentId = null;

							$$(self.componentIds.layoutToolbarHeader).define('label', self.labels.interface.component.layoutHeader);
							$$(self.componentIds.layoutToolbarHeader).refresh();

							$$(self.componentIds.saveComponentInfo).hide();
							$$(self.componentIds.cancelComponentInfo).hide();

							$$(self.componentIds.componentList).show();
						},

						generateComponentsInList: function () {
							var self = this,
								q = $.Deferred(),
								renderTasks = [];

							// Generate component in list
							self.data.componentsInPage.forEach(function (c) {
								renderTasks.push(function (next) {
									self.renderComponent(c)
										.always(next);
								});
							});

							async.parallel(renderTasks, function () { q.resolve(); });

							return q;
						},

						renderComponent: function (com) {
							var self = this,
								q = $.Deferred(),
								component = self.data.components[com.attr('component')],
								view = component.getView(),
								settings = com.attr('setting'),
								dataCollection, linkedDataCollection;

							if (view && component.render && settings) {
								var settings = settings.attr(),
									editable = false;
								settings.page = self.data.page;

								view = $.extend(true, {}, view);
								view.id = self.getComponentId(com.attr('id'));
								view.container = view.id;
								view.autowidth = true;

								$('#' + view.id).html('');

								webix.ui(view);

								async.series([
									// Get data collection
									function (next) {
										if (settings.object) {
											self.getDataCollection(settings.object)
												.fail(next)
												.then(function (result) {
													dataCollection = result;
													next();
												});
										}
										else
											next();
									},
									// Get data collection
									function (next) {
										if (settings.linkedTo) {
											self.getDataCollection(settings.linkedTo)
												.fail(next)
												.then(function (result) {
													linkedDataCollection = result;
													next();
												});
										}
										else
											next();
									},
									// Render component
									function (next) {
										component.render(view.id, com.id, settings, editable, false, dataCollection, linkedDataCollection)
											.then(function () {
												next();
											});

									}
								], function (err) {
									if (err)
										q.reject(err);
									else
										q.resolve();
								});

							}

							return q;
						},

						getDataCollection: function (objectId) {
							var self = this,
								q = $.Deferred();

							if (!objectId) {
								q.reject("Object id is required.");
								return;
							}

							if (!self.data.dataCollections) self.data.dataCollections = {};

							if (!self.data.dataCollections[objectId]) {
								async.waterfall([
									// Get object info
									function (next) {
										self.Model.ABObject.findOne({ id: objectId })
											.fail(function (err) { next(err); })
											.then(function (objInfo) {
												next(null, objInfo);
											});
									},
									// Get object model
									function (objInfo, next) {
										self.controllers.ModelCreator.getModel(objInfo.attr('name'))
											.fail(function (err) { next(err); })
											.then(function (objectModel) {
												next(null, objInfo, objectModel);
											});
									},
									// Find data
									function (objInfo, objModel, next) {
										// Get link columns
										var linkCols = objInfo.columns.filter(function (col) { return col.linkObject != null }),
											linkColNames = linkCols.map(function (col) { return col.name; }).attr();

										// Get date & datetime columns
										var dateCols = objInfo.columns.filter(function (col) { return col.setting.editor === 'date' || col.setting.editor === 'datetime'; });

										objModel.findAll({})
											.fail(function (err) { next(err); })
											.then(function (data) {

												// Populate labels & Convert string to Date object
												self.controllers.DataHelper.normalizeData(data, linkCols, dateCols)
													.then(function (result) {
														if (!self.data.dataCollections[objectId])
															self.data.dataCollections[objectId] = AD.op.WebixDataCollection(result);

														next();
													});
											});
									}
								], function (err) {
									if (err) {
										q.reject(err);
										return;
									}

									q.resolve(self.data.dataCollections[objectId]);
								});
							}
							else {
								q.resolve(self.data.dataCollections[objectId]);
							}

							return q;
						},

						refreshMenuComponent: function (pageId) {
							var self = this;

							var updateMenus = self.data.componentsInPage.filter(function (c) {
								return c.component === 'Menu' && c.setting.data && c.setting.data.filter(function (d) { return d == pageId; }).length > 0;
							})

							updateMenus.forEach(function (c) {
								self.renderComponent(c);
							});
						},

						startDragComponent: function () {
							var self = this;

							self.showDropAreaZone();

							if (self.data.dropAreaTimeout)
								window.clearTimeout(self.data.dropAreaTimeout);

							self.data.dropAreaTimeout = setTimeout(function () {
								self.hideDropAreaZone();
							}, 3000)
						},

						showDropAreaZone: function () {
							webix.html.addCss($$(this.componentIds.componentList).getNode(), "ab-component-drop-area");
						},

						hideDropAreaZone: function () {
							webix.html.removeCss($$(this.componentIds.componentList).getNode(), "ab-component-drop-area");
						},

						resetState: function () {
							var self = this;

							self.data.editedComponentId = null;

							$$(self.componentIds.layoutToolbar).hide();

							$$(self.componentIds.saveComponentInfo).hide();
							$$(self.componentIds.cancelComponentInfo).hide();

							$$(self.componentIds.componentList).show();

							$$(self.componentIds.componentList).clearValidation();
							$$(self.componentIds.componentList).clearAll();
						}

					});
				});
		})
	});