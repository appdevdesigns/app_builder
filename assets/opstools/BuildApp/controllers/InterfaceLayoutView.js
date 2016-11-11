steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/utils/DataCollectionHelper.js',

	'opstools/BuildApp/controllers/page_components/componentManager.js',

	'opstools/BuildApp/controllers/webix_custom_components/ActiveList.js',
	function (dataCollectionHelper, componentManager) {
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
							self.data = {
								components: {} // { componentId: compInstance, ..., componentIdN: compInstanceN }
							};

							self.componentIds = {
								layoutToolbar: 'ab-interface-layout-toolbar',
								layoutToolbarHeader: 'ab-interface-layout-toolbar-header',

								pageType: 'ab-interface-page-type',

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
							// TODO : Listen component events

							// var self = this,
							// 	event_aggregator = $(self);

							// for (var key in self.data.components) {
							// 	var comInstance = self.data.components[key];
							// 	if (comInstance.registerEventAggregator)
							// 		comInstance.registerEventAggregator(event_aggregator);
							// }

							// event_aggregator.on('save', function (sender, data) {
							// 	if (!AD.classes.AppBuilder.currApp.currPage) return;

							// 	switch (data.component_name) {
							// 		case 'Form':
							// 			var objectGridDatas = AD.classes.AppBuilder.currApp.currPage.components.filter(function (c) {
							// 				return c.component === 'Grid' && c.setting.editForm == data.id;
							// 			});

							// 			objectGridDatas.forEach(function (grid) {
							// 				var gridId = self.getComponentId(grid.id);
							// 				if ($$(gridId)) $$(gridId).unselectAll();
							// 			});

							// 			$$(data.viewId).setValues({});
							// 			break;
							// 	}
							// });

							// event_aggregator.on('cancel', function (sender, data) {
							// 	if (!AD.classes.AppBuilder.currApp.currPage) return;

							// 	switch (data.component_name) {
							// 		case 'Form':
							// 			var objectGridDatas = AD.classes.AppBuilder.currApp.currPage.components.filter(function (c) {
							// 				return c.component === 'Grid' && c.setting.editForm == data.id;
							// 			});

							// 			objectGridDatas.forEach(function (grid) {
							// 				var gridId = self.getComponentId(grid.id);
							// 				if ($$(gridId) && $$(gridId).unselectAll)
							// 					$$(gridId).unselectAll();
							// 			});

							// 			$$(data.viewId).setValues({});
							// 			break;
							// 	}
							// });

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
												view: "segmented",
												id: self.componentIds.pageType,
												width: 200,
												inputWidth: 200,
												options: [
													{ id: "page", value: "Page" },
													{ id: "modal", value: "Popup" }
												],
												on: {
													onChange: function (newValue, oldValue) {
														if (newValue == oldValue) return;

														// Call server to change page type
														AD.classes.AppBuilder.currApp.currPage.changeType(newValue)
															.fail(function (err) { console.error(err) })
															.then(function () { });
													}
												}
											},

											{
												view: 'button',
												id: self.componentIds.saveComponentInfo,
												label: self.labels.common.save,
												width: 100,
												click: function () {
													if (!self.data.editedComponentId || !AD.classes.AppBuilder.currApp.currPage) return;

													var editedComponent = AD.classes.AppBuilder.currApp.currPage.components.filter(function (c) { return c.id == self.data.editedComponentId; })[0],
														componentName = editedComponent.attr('component'),
														componentInstance = componentManager.getComponent(componentName),
														editViewId = componentInstance.getEditView().id;

													if ($$(editViewId).showProgress)
														$$(editViewId).showProgress({ type: 'icon' });

													componentManager.editStop();

													editedComponent.attr('setting', componentManager.editInstance.getSettings());

													var savedComponent;
													async.series([
														function (next) {
															editedComponent.save()
																.fail(next)
																.then(function (result) {
																	if (result.translate) result.translate();

																	var updatedItem = $$(self.componentIds.componentList).getItem(self.data.editedComponentId);
																	updatedItem.setting = result.attr('setting');
																	$$(self.componentIds.componentList).updateItem(self.data.editedComponentId, updatedItem);

																	savedComponent = result;

																	next();
																});
														},
														function (next) {
															if (componentManager.editInstance.afterSaveSetting) {
																componentManager.editInstance.afterSaveSetting(AD.classes.AppBuilder.currApp.currPage, savedComponent)
																	.fail(next)
																	.then(function () { next() });
															}
															else {
																next();
															}
														}
													], function (err) {
														if ($$(editViewId).hideProgress)
															$$(editViewId).hideProgress();

														if (err) {
															console.error(err);
															return;
														}

														self.openLayoutViewMode();

														self.element.trigger(self.options.savedComponentEvent, {
															page: AD.classes.AppBuilder.currApp.currPage,
															component: savedComponent
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
																	item = $$(self.componentIds.componentList).getItem(item_id);

																self.data.editedComponentId = item_id;

																if ($$('ab-' + item.component + '-edit-view')) {
																	if (!item.setting) item.setting = {};

																	componentManager.setEditInstance(self.data.components[item_id]);
																	componentManager.editInstance.populateSettings(item.setting);

																	$$(self.componentIds.layoutToolbarHeader).define('label', item.component.capitalize() + ' View');
																	$$(self.componentIds.layoutToolbarHeader).refresh();

																	$$(self.componentIds.pageType).hide();
																	$$(self.componentIds.saveComponentInfo).show();
																	$$(self.componentIds.cancelComponentInfo).show();

																	$$('ab-' + item.component + '-edit-view').show();
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
														'<div id="#viewId#"></div>' +
														'<i class="fa fa-times ab-component-remove"></i>' +
														'</div>' +
														'</div>';

													// Replace values to template
													for (var key in obj) {
														if (key === 'component')
															templateHtml = templateHtml.replace(/#component#/g, obj['component'].capitalize());
														else
															templateHtml = templateHtml.replace(new RegExp('#' + key + '#', 'g'), obj[key]);
													}

													// Icon
													var component = componentManager.getComponent(obj.component);
													if (component && component.getInfo)
														templateHtml = templateHtml.replace(/#icon#/g, component.getInfo().icon);

													// Generate Edit button
													var editButtonView = common['editButton'] ? common['editButton'].apply(this, arguments) : "";
													templateHtml = templateHtml.replace('{common.editButton()}', editButtonView);

													// ViewId
													templateHtml = templateHtml.replace(/#viewId#/g, self.getComponentId(obj.id));

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
																$$(self.componentIds.componentList).updateItem(result.id, result);

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

																self.generateComponentsInList();

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
																	componentIndexes.push({
																		id: com[0].id,
																		index: index
																	});

																}
															}

															// Call sort components api
															AD.classes.AppBuilder.currApp.currPage.sortComponents(componentIndexes, function (err, result) {
																$$(self.componentIds.componentList).hideProgress();

																if (err) {
																	// TODO : show error message
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
															text: self.labels.interface.component.confirmDeleteMessage.replace('{0}', deletedComponent.component.capitalize()),
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

							componentManager.getAllComponents().forEach(function (component) {
								if (component.getEditView)
									webix.extend($$(component.getEditView().id), webix.ProgressBar);
							});
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

							$$(self.componentIds.componentList).clearAll();
							$$(self.componentIds.componentList).showProgress({ type: 'icon' });
							$$(self.componentIds.layoutToolbar).show();

							// Set page type
							self.showPageTypeSelector();

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

									var components = result.attr();
									components.sort(function (a, b) { return a.weight - b.weight });
									$$(self.componentIds.componentList).parse(components);

									self.initEvents();

									$$(self.componentIds.componentList).hideProgress();
								});
						},

						initComponents: function () {
							var self = this;

							// Get layout space definition
							var layoutSpaceDefinition = $.grep(self.data.definition.rows, function (r) { return r.id == self.componentIds.layoutSpace; });
							layoutSpaceDefinition = (layoutSpaceDefinition && layoutSpaceDefinition.length > 0) ? layoutSpaceDefinition[0] : null;

							componentManager.getAllComponents().forEach(function (component) {
								if (component.getEditView)
									layoutSpaceDefinition.cells.push(component.getEditView());
							});
						},

						openLayoutViewMode: function () {
							var self = this;

							self.data.editedComponentId = null;

							$$(self.componentIds.layoutToolbarHeader).define('label', self.labels.interface.component.layoutHeader);
							$$(self.componentIds.layoutToolbarHeader).refresh();

							$$(self.componentIds.saveComponentInfo).hide();
							$$(self.componentIds.cancelComponentInfo).hide();
							self.showPageTypeSelector();

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
							$$(self.componentIds.componentList).find({}).forEach(function (item) {
								renderTasks.push(function (next) {
									var comp = AD.classes.AppBuilder.currApp.currPage.components.filter(function (c) { return c.id == item.id; });
									if (!comp || comp.length < 1) return next();
									self.renderComponent(comp[0])
										.fail(next)
										.then(function () { next(); });
								});
							});

							async.parallel(renderTasks, function (err) {
								if (err) q.reject(err);
								else q.resolve();
							});

							return q;
						},

						renderComponent: function (com) {
							var self = this,
								q = $.Deferred(),
								componentInstance = componentManager.getComponent(com.attr('component')),
								view = componentInstance.getView(),
								viewId = self.getComponentId(com.attr('id')),
								setting = com.attr('setting'),
								dataCollection, linkedDataCollection;

							// Create component instance
							self.data.components[com.attr('id')] = new componentInstance(
								AD.classes.AppBuilder.currApp, // Current application
								viewId, // the view id
								com.id // the component data id
							);

							if (view && setting) {
								var setting = setting.attr ? setting.attr() : setting,
									editable = false,
									showAll = false;

								view = $.extend(true, {}, view);
								view.id = viewId;
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
										self.data.components[com.attr('id')].render(com.attr('setting'), editable, showAll, dataCollection, linkedDataCollection)
											.fail(next)
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

						showPageTypeSelector: function () {
							var self = this,
								pageType = AD.classes.AppBuilder.currApp.currPage.type ? AD.classes.AppBuilder.currApp.currPage.type : 'page';

							if (AD.classes.AppBuilder.currApp.currPage.parent && (pageType == 'page' || pageType == 'modal')) {
								$$(self.componentIds.pageType).show();
								$$(self.componentIds.pageType).define('value', pageType); // Use define() instead of setValues to ignore update data to server
								$$(self.componentIds.pageType).refresh();
							}
							else {
								$$(self.componentIds.pageType).hide();
							}
						},

						resetState: function () {
							var self = this;

							self.data.components = {};
							self.data.editedComponentId = null;

							$$(self.componentIds.layoutToolbar).hide();

							$$(self.componentIds.saveComponentInfo).hide();
							$$(self.componentIds.cancelComponentInfo).hide();

							$$(self.componentIds.componentList).show();

							$$(self.componentIds.componentList).clearValidation();
							$$(self.componentIds.componentList).clearAll();

							// Reset page components 
							// this.controllers.Grid.resetState();
						},

						resize: function (height) {
							componentManager.resize(height);
						}


					});
				});
		})
	});