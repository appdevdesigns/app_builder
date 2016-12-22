
steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/utils/DataCollectionHelper.js',
	'opstools/BuildApp/controllers/utils/DataHelper.js',
	'opstools/BuildApp/controllers/utils/ModelCreator.js',
	'opstools/BuildApp/controllers/page_components/componentManager.js',

	function (dataCollectionHelper, dataHelper, modelCreator, componentManager) {
		System.import('appdev').then(function () {
			System.import('opstools/BuildApp').then(function () {
				steal.import('appdev/ad',
					'appdev/control/control',
					'opstools/BuildApp/models/ABApplication'
				).then(function () {

					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.ABLiveTool', {

						init: function (element, options) {
							var self = this;

							options = AD.defaults({
								app: -1,
								page: -1
							}, options);
							self.options = options;

							// Call parent init
							self._super(element, options);

							// Validate
							if (options.app == null || options.app < 0) {
								self.invalidApp();
								return;
							}

							if (options.page == null || options.page < 0) {
								self.invalidPage();
								return;
							}

							self.containerDomID = self.unique('ab_live_tool', self.options.app, self.options.page);

							self.initModels();
							self.getData().then(function () {

								// Store the root page
								self.rootPage = self.data.pages.filter(function (page) { return page.id == self.options.page })[0];

								self.initDOM();

								self.renderPageContainer();

								self.initEvents();

								webix.ready(function () {
									self.showPage();
								});
							});
						},

						invalidApp: function () {
							AD.error.log('Application id is invalid.');
						},

						invalidPage: function () {
							AD.error.log('Page id is invalid.');
						},

						initDOM: function () {
							console.log('... creating ABLiveTool <div> ');
							this.element.html('<div id="#domID#"></div>'.replace('#domID#', this.containerDomID));
						},

						initModels: function () {
							this.Models = {};
							this.Models.ABApplication = AD.Model.get('opstools.BuildApp.ABApplication');
						},

						getData: function () {
							var self = this,
								q = $.Deferred();

							self.data = {};
							async.series([
								// Get application data
								function (next) {
									self.Models.ABApplication.findOne({ id: self.options.app })
										.fail(next)
										.then(function (result) {
											self.data.application = result;

											next();
										});
								},
								// Get objects data
								function (next) {
									self.data.application.getObjects()
										.fail(next)
										.then(function (result) {
											result.forEach(function (page) {
												if (page.translate) page.translate();
											});

											self.data.application.objects = result;

											next();
										});
								},
								// Get pages data
								function (next) {
									self.data.application.getPages({
										or: [
											{ id: self.options.page },
											{ parent: self.options.page }
										]
									})
										.fail(next)
										.then(function (result) {
											result.forEach(function (page) {
												if (page.translate) page.translate();

												page.attr('domID', self.unique('ab_live_page', self.options.app, page.id));
											});

											self.data.pages = result;

											next();
										});
								}
							], function (err) {
								if (err) q.reject(err);
								else q.resolve();
							});

							return q;
						},

						initEvents: function () {
							var self = this;

							AD.comm.hub.subscribe('ab.interface.add', function (msg, data) {
								if (data.app == self.options.app && data.parent == self.options.page) {

									// Get the new page data
									self.data.application.getPage(data.page)
										.then(function (newPage) {
											if (newPage.translate) newPage.translate();

											newPage.attr('domID', self.unique('ab_live_page', self.options.app, newPage.id));

											self.data.pages.push(newPage);

											// Render the new page
											self.renderPage(newPage.attr());
										});
								}
							});


							AD.comm.hub.subscribe('ab.interface.update', function (msg, data) {

								var page = self.data.pages.filter(function (p) { return p.id == data.page });

								if ((data.app == self.options.app) && (page.length > 0)) {

									// Get the new page data
									self.data.application.getPage(data.page)
										.then(function (updatePage) {
											if (updatePage.translate) updatePage.translate();

											updatePage.attr('domID', self.unique('ab_live_page', self.options.app, updatePage.id));

											// Update page in list
											self.data.pages.forEach(function (page, index) {
												if (page.id == updatePage.id)
													self.data.pages.attr(index, updatePage.attr());
											});

											// rebuild our display
											self.renderPage(updatePage.attr());

											// Update the active page
											if (self.activePage.id == updatePage.id)
												self.activePage = updatePage.attr();

											// Refresh components
											self.showPage(self.activePage);

										});
								}
							});


							AD.comm.hub.subscribe('ab.interface.remove', function (msg, data) {

								if ((data.app == self.options.app) && (self.data.pages.filter(function (p) { return p.id == data.page }).length > 0)) {

									// If the deleted page is showing, then switch to previous page.
									if (self.activePage && self.activePage.id == data.page && self.previousPage)
										self.showPage(self.previousPage);

									self.data.pages.slice(0).forEach(function (page, index) {
										if (data.page != page.id) return;

										// Remove sub-page
										if ($$(page.domID)) {
											// View type
											if ($$(self.containerDomID).getChildViews().filter(function (view) { return view.config.id == page.domID }).length > 0) {
												$$(self.containerDomID).removeView(page.domID);
											}
											// Popup type
											else {
												$$(page.domID).destructor();
											}
										}

										// Remove from self.data.pages
										self.data.pages.splice(index, 1);

										// TODO: Update menu and link components
									});


								}
							});

							AD.comm.hub.subscribe('opsportal.tool.show', function (message, data) {
								self.resize(self.height);
							});

							AD.comm.hub.subscribe('opsportal.resize', function (message, data) {
								self.height = data.height;
								self.resize(data.height);
							});

						},

						renderPageContainer: function () {
							var self = this,
								pages = self.data.pages.attr();

							// Clear UI content
							if ($$(self.rootPage.domID))
								webix.ui({}, $$(self.rootPage.domID));

							// Create sub pages
							webix.ui({
								view: "multiview",
								container: self.containerDomID,
								css: "ab-main-container ab-generated-page",
								id: self.containerDomID,
								cells: [{}],
								on: {
									onViewChange: function (prevId, nextId) {
										self.resize();
									}
								}
							});

							// Sort pages
							pages.sort(function (a, b) {
								if (a.parent)
									return 1;
								else if (b.parent)
									return -1;
								else
									return a.weight - b.weight;
							});

							// Render pages
							pages.forEach(function (page) {
								self.renderPage(page);
							});

						},

						renderPage: function (page) {
							var self = this,
								comTemplate = '';

							page.components.sort(function (a, b) { return a.weight - b.weight });
							page.components.forEach(function (item) {
								item.domID = self.unique('ab_live_item', page.id, item.id);

								comTemplate += '<div id="#domID#"></div>'.replace('#domID#', item.domID);
								comTemplate += '<div style="height: 30px;"></div>'; // Gap between components
							});

							switch (page.type) {
								case 'modal':
									var popupTemplate = {
										view: "window",
										id: page.domID,
										modal: true,
										position: "center",
										resize: true,
										width: 700,
										height: 450,
										css: 'ab-main-container',
										head: {
											view: "toolbar",
											cols: [
												{ view: "label", label: page.label },
												{
													view: "button", label: "Close", width: 100, align: "right",
													click: function () {
														if (self.previousPage.type === 'modal')
															self.showPage();
														else
															self.showPage(self.previousPage);
													}
												}
											]
										},
										body: {
											scroll: true,
											template: comTemplate
										}
									};

									if ($$(page.domID)) {
										// Rebuild
										if ($$(page.domID).config.view == 'window') {
											webix.ui(popupTemplate, $$(page.domID));
										}
										// Change page type (Page -> Popup)
										else if ($$(self.containerDomID)) {
											$$(self.containerDomID).removeView(page.domID);

											webix.ui(popupTemplate).hide();
										}
									}
									// Create popup
									else {
										webix.ui(popupTemplate).hide();
									}

									break;
								case 'tab':
									// TODO : tab view
									break;
								case 'page':
								default:
									var pageTemplate = {
										view: "template",
										id: page.domID,
										template: comTemplate,
										minWidth: 700,
										autoheight: true,
										scroll: true
									};

									if ($$(page.domID)) {
										// Change page type (Popup -> Page)
										if ($$(page.domID).config.view == 'window') {
											$$(page.domID).destructor();

											$$(self.containerDomID).addView(pageTemplate);
										}
										// Rebuild
										else {
											webix.ui(pageTemplate, $$(page.domID));
										}
									}
									// Add to multi-view
									else if ($$(self.containerDomID))
										$$(self.containerDomID).addView(pageTemplate);
							}
						},

						/**
						* @param ABPage page
						*      Optional page. Default is to show
						*      the root page.
						*/
						showPage: function (page) {
							var self = this;

							page = page || self.rootPage;

							// Hide page popup
							if (self.activePage && $$(self.activePage.domID).hide)
								$$(self.activePage.domID).hide();

							$$(page.domID).show();
							self.previousPage = self.activePage;
							self.activePage = page;

							self.activePage.components.forEach(function (item) {
								self.renderComponent(self.activePage, item);
							});

							self.resize();
						},

						renderComponent: function (page, item) {
							var self = this,
								q = $.Deferred(),
								componentInstance = componentManager.getComponent(item.component),
								view = componentInstance.getView(),
								viewId = self.unique('ab_live_item', page.id, item.id),
								setting = item.setting,
								dataCollection,
								linkedDataCollection;

							if (!page.comInstances) page.comInstances = {};

							if (page.comInstances[item.id]) {
								if (page.comInstances[item.id].onDisplay)
									page.comInstances[item.id].onDisplay();

								return;
							}

							// Create component instance
							page.comInstances[item.id] = new componentInstance(
								self.data.application, // Current application
								viewId, // the view id
								item.id // the component data id
							);

							// Listen component events
							$(page.comInstances[item.id]).on('renderComplete', function (event, data) {
								$$(self.rootPage.domID).adjust();
								$$(viewId).adjust();
							});

							$(page.comInstances[item.id]).on('changePage', function (event, data) {
								// Redirect to another page
								if (data.previousPage)
									self.showPage(self.previousPage);
								else if (self.activePage.id != data.pageId && data.pageId) {

									var redirectPage = self.data.pages.filter(function (p) { return p.id == data.pageId; });

									if (redirectPage && redirectPage.length > 0)
										self.showPage(redirectPage[0]);
								}
							});

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
											dataCollectionHelper.getDataCollection(self.data.application, setting.object)
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
											dataCollectionHelper.getDataCollection(self.data.application, setting.linkedTo)
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
										page.comInstances[item.id].render(item.setting, editable, showAll, dataCollection, linkedDataCollection)
											.fail(next)
											.then(function () {
												next();
											});

									},
									// Update state on load
									function (next) {
										if (page.comInstances[item.id].onDisplay)
											page.comInstances[item.id].onDisplay();

										next();
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

						resize: function (height) {
							if (!$$(this.rootPage.domID) || !$(this.element).is(":visible")) return;

							var width = this.element.width();
							if (!width) {
								this.element.parents().each(function (index, elm) {
									if ($(elm).width() > width)
										width = $(elm).width();
								});
							}

							if (height == null) height = self.height;

							if (width > 0)
								$$(this.rootPage.domID).define('width', width);

							if (height > 0)
								$$(this.rootPage.domID).define('height', height);

							$$(this.rootPage.domID).adjust();
							$$(this.activePage.domID).adjust();

							// Resize components
							if (this.activePage && this.activePage.comInstances) {
								for (var key in this.activePage.comInstances) {
									if (this.activePage.comInstances[key].resize)
										this.activePage.comInstances[key].resize(width, height);
								}
							}
						},

						unique: function () {
							var args = Array.prototype.slice.call(arguments); // Convert to Array
							return args.join('_');
						}

					}); // end AD.Control.extend
				}); // end steal.import
			});

		}); // end System.import
	}
); // end steal