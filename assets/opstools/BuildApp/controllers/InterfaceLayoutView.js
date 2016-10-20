steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/utils/DataCollectionHelper.js',

	'opstools/BuildApp/controllers/webix_custom_components/ActiveList.js',
	function (dataCollectionHelper) {
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

						initEvents: function () {
							var self = this,
								event_aggregator = $(self);

							for (var key in self.data.components) {
								var comInstance = self.data.components[key];
								if (comInstance.registerEventAggregator)
									comInstance.registerEventAggregator(event_aggregator);
							}

							event_aggregator.on('save', function (sender, data) {
								if (!AD.classes.AppBuilder.currApp.currPage) return;

								switch (data.component_name) {
									case 'Form':
										var objectGridDatas = AD.classes.AppBuilder.currApp.currPage.components.filter(function (c) {
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
								if (!AD.classes.AppBuilder.currApp.currPage) return;

								switch (data.component_name) {
									case 'Form':
										var objectGridDatas = AD.classes.AppBuilder.currApp.currPage.components.filter(function (c) {
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
													if (!self.data.editedComponentId || !AD.classes.AppBuilder.currApp.currPage) return;

													var editedComponent = $.grep(AD.classes.AppBuilder.currApp.currPage.components.attr(), function (c) { return c.id == self.data.editedComponentId; })[0],
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

															// self.generateComponentsInList()
															// 	.always(function () {
															// 		self.element.trigger(self.options.savedComponentEvent, {});

															// 		$$(editViewId).hideProgress();
															// 	});
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
												sort: {
													by: "#weight#",
													dir: "asc",
													as: "int"
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
																	component = self.data.components[item.component];

																self.data.editedComponentId = item_id;


																if ($$(item.component + '-edit-view')) {
																	if (!item.setting) item.setting = {};

																	// Pass current page
																	if (component.setPage)
																		component.setPage(self.data.page);

																	component.populateSettings(item, dataCollectionHelper.getDataCollection.bind(dataCollectionHelper));

																	$$(self.componentIds.layoutToolbarHeader).define('label', item.component + ' View');
																	$$(self.componentIds.layoutToolbarHeader).refresh();

																	$$(self.componentIds.saveComponentInfo).show();
																	$$(self.componentIds.cancelComponentInfo).show();

																	$$(item.component + '-edit-view').show();
																}

																self.element.trigger(self.options.editComponentEvent, { item: item });
															}
														}
													}
												},
												template: function (obj, common) {
													var templateHtml = '<div class="ab-component-in-page">' +
														'<div class="ab-component-item-name">' +
														'<div><i class="fa #icon#"" aria-hidden="true"></i> #component#</div>' +
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

													// Icon
													var comObj = self.data.components[obj.component];
													if (comObj && comObj.info)
														templateHtml = templateHtml.replace(/#icon#/g, comObj.info.icon);

													// Generate Edit button
													var editButtonView = common['editButton'] ? common['editButton'].apply(this, arguments) : "";
													templateHtml = templateHtml.replace('{common.editButton()}', editButtonView);

													// // Set component view
													// var componentView = common[obj.component] ? common[obj.component].apply(this, arguments) : "";
													// templateHtml = templateHtml.replace(/#view#/g, componentView);

													return templateHtml;
												},
												externalData: function (data, id) {
													if (id) {
														$$(self.componentIds.componentList).showProgress({ type: 'icon' });

														AD.classes.AppBuilder.currApp.currPage.createComponent({
															component: data.name,
															weight: $$(self.componentIds.componentList).count(),
															setting: {}
														})
															.fail(function (err) {
																$$(self.componentIds.componentList).hideProgress();

																webix.message({
																	type: "error",
																	text: self.labels.common.createErrorMessage.replace("{0}", data.name)
																});

																AD.error.log('Add Component : Error add component', { error: err });
															})
															.then(function (result) {
																$$(self.componentIds.componentList).data.changeId(id, result.id);

																if (!AD.classes.AppBuilder.currApp.currPage) return;

																var existsCom = $.grep(AD.classes.AppBuilder.currApp.currPage.components.attr(), function (c) { c.id == result.id });
																if (existsCom && existsCom.length > 0) {
																	AD.classes.AppBuilder.currApp.currPage.components.forEach(function (c) {
																		if (c.id == result.attr('id'))
																			c = result;
																	});
																}
																else {
																	AD.classes.AppBuilder.currApp.currPage.components.push(result);
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
													onAfterRender: function () {
														self.generateComponentsInList();
													},
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
																	com = AD.classes.AppBuilder.currApp.currPage.components.filter(function (c) { return c.id == comId });

																if (com && com.length > 0) {
																	com[0].attr('weight', index);

																	componentIndexes.push({
																		id: com[0].id,
																		index: com[0].weight
																	});

																}
															}

															// Call sort components api
															AD.classes.AppBuilder.currApp.currPage.sortComponents(componentIndexes, function (err, result) {
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
															text: self.labels.interface.component.confirmDeleteMessage.replace('{0}', deletedComponent.component),
															callback: function (result) {
																if (result) {

																	$$(self.componentIds.componentList).showProgress({ type: "icon" });

																	var deletedCom = AD.classes.AppBuilder.currApp.currPage.components.filter(function (c) { return c.id == id; });

																	if (!deletedCom || deletedCom.length < 1) {
																		$$(self.componentIds.componentList).hideProgress();
																		return;
																	}

																	// Call server to delete object data
																	deletedCom[0].destroy()
																		.fail(function (err) {
																			$$(self.componentIds.componentList).hideProgress();

																			webix.message({
																				type: "error",
																				text: self.labels.common.deleteErrorMessage.replace("{0}", deletedComponent.component)
																			});

																			AD.error.log('Component : Error delete component', { error: err });
																		})
																		.then(function (result) {
																			$$(self.componentIds.componentList).remove(id);

																			webix.message({
																				type: "success",
																				text: self.labels.common.deleteSuccessMessage.replace('{0}', deletedComponent.component)
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

						showComponents: function () {
							var self = this;

							self.resetState();

							if (!AD.classes.AppBuilder.currApp.currPage) return;

							$$(self.componentIds.componentList).showProgress({ type: 'icon' });
							$$(self.componentIds.layoutToolbar).show();

							AD.classes.AppBuilder.currApp.currPage.getComponents()
								.fail(function (err) {
									$$(self.componentIds.componentList).hideProgress();

									webix.message({
										type: "error",
										text: self.labels.interface.component.getErrorMessage
									});

									AD.error.log('Get components in page : Error get components', { error: err });
								})
								.then(function (result) {
									AD.classes.AppBuilder.currApp.currPage.attr('components', result);
									var componentList = AD.op.WebixDataCollection(AD.classes.AppBuilder.currApp.currPage.components);

									$$(self.componentIds.componentList).data.sync(componentList);

									self.initEvents();

									$$(self.componentIds.componentList).hideProgress();
								});
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

							if (!AD.classes.AppBuilder.currApp.currPage) {
								q.resolve();
								return q;
							}

							// Generate component in list
							AD.classes.AppBuilder.currApp.currPage.components.forEach(function (c) {
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
								setting = com.attr('setting'),
								dataCollection, linkedDataCollection;

							if (view && component.render && setting) {
								var setting = setting.attr ? setting.attr() : setting,
									editable = false;
								setting.page = self.data.page;

								view = $.extend(true, {}, view);
								view.id = self.getComponentId(com.attr('id'));
								view.container = view.id;
								view.autowidth = true;

								$('#' + view.id).html('');

								webix.ui(view);

								async.series([
									// Get data collection
									function (next) {
										if (setting.object) {
											dataCollectionHelper.getDataCollection(AD.classes.AppBuilder.currApp, setting.object)
												.fail(next)
												.then(function (result) {
													dataCollection = result;
													next();
												});
										}
										else
											next();
									},
									// Get data collection of connected data
									function (next) {
										if (setting.linkedTo) {
											dataCollectionHelper.getDataCollection(AD.classes.AppBuilder.currApp, setting.linkedTo)
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
										component.render(view.id, com.id, setting, editable, false, dataCollection, linkedDataCollection)
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
							else {
								q.resolve();
							}

							return q;
						},

						refreshMenuComponent: function (pageId) {
							if (!AD.classes.AppBuilder.currApp.currPage) return;

							var self = this,
								updateMenus = AD.classes.AppBuilder.currApp.currPage.components.filter(function (c) {
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