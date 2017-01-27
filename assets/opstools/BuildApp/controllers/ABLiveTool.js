
steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/utils/DataHelper.js',
	'opstools/BuildApp/controllers/utils/ModelCreator.js',

	function (dataHelper, modelCreator) {
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

							self.debounceResize = false;
							self.resizeValues = { height: 0, width: 0 };

							self.initDOM();
							self.initModels();

							self.getData().then(function () {

								self.initEvents();

								// Store the root page
								self.rootPage = self.data.application.pages.filter(function (page) {
									return page.id == self.options.page
								})[0];

								self.renderPageContainer();

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
										.then(function (result) {
											self.data.application = result;

											next();
										}, next);
								},
								// Get objects data
								function (next) {
									self.data.application.getObjects()
										.then(function (result) {
											result.forEach(function (page) {
												if (page.translate) page.translate();
											});

											self.data.application.objects = result;

											next();
										}, next);
								},
								// Get pages data
								function (next) {
									// self.data.application.getPages({
									// 	or: [
									// 		{ id: self.options.page },
									// 		{ parent: self.options.page }
									// 	]
									// }).then(function (result) {
									self.data.application.getAllApplicationPages()
										.then(function (result) {
											result.forEach(function (page) {
												if (page.translate) page.translate();

												page.attr('domID', self.unique('ab_live_page', self.options.app, page.id));
											});

											// self.data.application.pages = result;

											next();
										}, next);
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
								if (data.app == self.options.app
									&& (data.page == self.options.page || data.parent == self.options.page)) {

									// Get the new page data
									self.data.application.getPage(data.page)
										.then(function (newPage) {
											if (newPage.translate) newPage.translate();

											newPage.attr('domID', self.unique('ab_live_page', self.options.app, newPage.id));

											var exists = false;

											self.data.application.pages.forEach(function (page, index) {
												// Update exists page
												if (page.id == data.page) {
													// #Hack! Fix the ModelUpdate() syncing
													self.data.application.pages.attr(index, newPage.attr());
													exists = true;
												}
											});

											// Add new page to list
											if (!exists) self.data.application.pages.push(newPage);

											// Render the new page
											self.renderPage(newPage);

											// Set root page
											if (data.page == self.options.page) {
												self.rootPage = newPage;

												// Refresh components of root page
												if (self.activePage && data.page == self.activePage.id)
													self.showPage(newPage);
											}
										});
								}
							});


							AD.comm.hub.subscribe('ab.interface.update', function (msg, data) {

								var page = self.data.application.pages.filter(function (p) { return p.id == data.page });

								if ((data.app == self.options.app) && (page.length > 0)) {

									// Get the new page data
									self.data.application.getPage(data.page)
										.then(function (updatePage) {
											if (updatePage.translate) updatePage.translate();

											updatePage.attr('domID', self.unique('ab_live_page', self.options.app, updatePage.id));

											// Update page in list
											self.data.application.pages.forEach(function (page, index) {
												if (page.id == updatePage.id)
													// #Hack! Fix the ModelUpdate() syncing
													self.data.application.pages.attr(index, updatePage.attr());
											});

											// rebuild our display
											self.renderPage(updatePage);

											// Update the active page
											if (self.activePage.id == updatePage.id)
												self.activePage = updatePage;

											// Refresh components
											self.showPage(self.activePage);

										});
								}
							});


							AD.comm.hub.subscribe('ab.interface.remove', function (msg, data) {

								if (data.app == self.options.app) {

									// If the deleted page is showing, then switch to previous page.
									if (self.activePage && self.activePage.id == data.page && self.previousPage)
										self.showPage(self.previousPage);

									self.data.application.pages.slice(0).forEach(function (page, index) {
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

										// Remove from self.data.application.pages
										self.data.application.pages.splice(index, 1);
									});

									// Re-render menu and link components
									self.activePage.components.forEach(function (item) {
										switch (item.component) {
											case 'menu':
												if (item.setting &&
													item.setting.pageIds &&
													item.setting.pageIds.filter(function(pId) { return pId == data.page; }).length > 0) {
														delete self.activePage.comInstances[item.id];

														self.activePage.renderComponent(self.data.application, item).done(function (isNew) {
															self.bindComponentEvents(self.activePage.comInstances[item.id], item);
														});
												}
												break;
											case 'link':
												if (item.setting &&
													item.setting.linkTo &&
													item.setting.linkTo == data.page) {
														delete self.activePage.comInstances[item.id];

														self.activePage.renderComponent(self.data.application, item).done(function (isNew) {
															self.bindComponentEvents(self.activePage.comInstances[item.id], item);
														});
												}
												break;
										}
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
								pages = self.data.application.pages;

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
							if (pages.sort) {
								pages.sort(function (a, b) {
									if (a.parent)
										return 1;
									else if (b.parent)
										return -1;
									else
										return a.weight - b.weight;
								});
							}

							// Render pages
							pages.forEach(function (page) {
								if (page.id == self.rootPage.id || (page.parent && page.parent.id == self.rootPage.id))
									self.renderPage(page);
							});

						},

						renderPage: function (page) {
							var self = this;

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
											template: page.getItemTemplate()
										}
									};

									if ($$(page.domID)) {
										// Destroy old popup
										if ($$(page.domID).config.view == 'window') {
											$$(page.domID).destructor();
										}
										// Change page type (Page -> Popup)
										else if ($$(self.containerDomID)) {
											$$(self.containerDomID).removeView(page.domID);
										}
									}

									// Create popup
									webix.ui(popupTemplate).hide();

									break;
								case 'tab':
									// don't render tabs.  The component will do that.

									// refresh tab view when update
									var parentPage = self.data.application.pages.filter(function (p) { return p.id == page.parent.id })[0];
									if (parentPage == null) break;

									parentPage.components.forEach(function (com) {
										if (parentPage.comInstances == null ||
											parentPage.comInstances[com.id] == null ||
											com.component !== 'tab' ||
											com.setting.tabs == null ||
											com.setting.tabs.filter(function (t) { return t.uuid == page.name; }).length < 1)
											return;

										var tabViewId = self.unique('ab_live_item', parentPage.id, com.id);
										if ($$(tabViewId) == null) return;

										// Get index of selected tab view
										var selectedIndex = $$(tabViewId).getTabbar().optionIndex($$(tabViewId).getValue());

										// force a refresh on component
										parentPage.comInstances[com.id] = null;

										// Rerender the tab component
										parentPage.renderComponent(self.data.application, com)
											.done(function () {
												var selectedTabView = $$(tabViewId).getTabbar().config.options[selectedIndex];

												if ($$(tabViewId).getValue() == selectedTabView.id)
													self.bindComponentEventsInTab(com);

												// Switch to selected tab
												$$(tabViewId).setValue(selectedTabView.id);
											});
									});
									break;
								case 'page':
								default:
									var pageTemplate = {
										view: "template",
										id: page.domID,
										template: page.getItemTemplate(),
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
							if (self.activePage && $$(self.activePage.domID) && $$(self.activePage.domID).hide)
								$$(self.activePage.domID).hide();

							$$(page.domID).show();
							self.previousPage = self.activePage;
							self.activePage = page;

							// Question: should we do a resize() after all the components are rendered?
							// var numDone = 0;

							self.activePage.components.forEach(function (item) {

								self.activePage.renderComponent(self.data.application, item).done(function (isNew) {
									self.bindComponentEvents(page.comInstances[item.id], item);
									self.bindComponentEventsInTab(item);
									// numDone++;
									// if (numDone >= self.activePage.components.length) {
									//	// Now resize after all components are rendered
									// 	self.resize();
									// }
								});

							});

							self.resize();
						},

						bindComponentEvents: function (comInstance, itemInfo) {
							var self = this;

							// Listen component events
							$(comInstance).off('renderComplete');
							$(comInstance).on('renderComplete', function (event, data) {
								$$(self.rootPage.domID).adjust();

								if ($$(itemInfo.domID))
									$$(itemInfo.domID).adjust();
							});

							$(comInstance).off('changePage');
							$(comInstance).on('changePage', function (event, data) {
								// Redirect to another page
								if (data.previousPage)
									self.showPage(self.previousPage);
								else if (self.activePage.id != data.pageId && data.pageId) {

									var redirectPage = self.data.application.pages.filter(function (p) { return p.id == data.pageId; });

									if (redirectPage && redirectPage.length > 0)
										self.showPage(redirectPage[0]);
								}
							});

							if (itemInfo.component === 'tab') {

								// make sure an embedded tab's component gets bound now.
								self.bindComponentEventsInTab(itemInfo);

								// when the tab changes, be sure to rebind it's current
								// components:
								$(comInstance).off('changeTab');
								$(comInstance).on('changeTab', function (event, data) {
									self.bindComponentEventsInTab(itemInfo);
								});
							}
						},

						bindComponentEventsInTab: function (item) {
							var self = this;

							// Bind events of components in tab
							if (item.component == 'tab' && item.setting && item.setting.tabs) {
								item.setting.tabs.forEach(function (tab) {
									var tabPage = self.data.application.pages.filter(function (p) { return p.name == tab.uuid; })[0];

									if (tabPage == null || tabPage.components == null || tabPage.comInstances == null) return;

									tabPage.components.forEach(function (itemInTab) {
										self.bindComponentEvents(tabPage.comInstances[itemInTab.id], itemInTab);
									});

								});
							}
						},

						resize: function (height) {
							var _this = this;

							// NOTE: resize() calls from the OpsPortal OPView element 
							// .resize({ height:value });
							if (height) height = height.height || height;
							if (!$$(this.containerDomID) || !$(this.element).is(":visible")) return;

							var width = this.element.width();
							if (!width) {
								this.element.parents().each(function (index, elm) {
									if ($(elm).width() > width)
										width = $(elm).width();
								});
							}

							// QUESTION: where does self.height come from?  is this a webix setting?
							if (height == null) height = self.height;

							// track the last set of height/width values:
							this.resizeValues.height = height;
							this.resizeValues.width = width;
							// console.log('ABLiveTool.resize()');

							// this debounce method seems to cut down our resize()
							// operations to 1/3
							if (!this.debounceResize) {

								_this.debounceResize = true;

								setTimeout(function () {
									// console.log('ABLiveTool.debouncedResize()');
									if (_this.resizeValues.width > 0)
										$$(_this.containerDomID).define('width', width);

									if (_this.resizeValues.height > 0)
										$$(_this.containerDomID).define('height', height);

									$$(_this.containerDomID).resize();
									// $$(_this.activePage.domID).adjust(); // should be part of activePage.resize()


									/// REFACTOR NOTES:
									// here is an example where we are not keeping strict boundries about which
									// object is supposed to know and do what.
									//
									// here we have a UI Object (ABLiveTool), that is trying to update the display
									// of a current Page (a View).
									//
									// This UI Object knows all the details about how a Page (View) should display
									// itself:  which .domID  it is attached to, that it needs to .adjust() itself, 
									// and most importantly, that a page consists of components, and how it must
									// step through each component and .resize() each one of them.
									//
									// The problem is, now that we have a TabComponent that also has Pages(Views) as
									// components, this code must also be reduplicated there.  That is a bad design
									// pattern.
									// 
									// Instead, our Page object should be responsible for itself.  It knows that it is
									// comprised of components, and that when a Page.resize() is requested, the Page
									// should be calling it's components to .resize() themselves.
									//
									// A UI Object like this, should only know that it is displaying a Page object.
									// We can call: 
									// 		Page.show(divID);
									// 		Page.resize();
									// 		Page.remove();  
									//
									// And that's all a UI object should be allowed to know. 
									//
									// This UI Object can also know about it's outer Container, and do the resizing
									// of that object.  But to display and update a Page, we should only be limited
									// to the above interface.
									//
									// If this were the case, the TabComponent would also be able to reuse those same
									// methods on the Pages that it is managing.
									//

									// I went ahead and refactored ABPage to have a .resize()
									// it is not exactly the right solution, but it is close
									// see notes on ABPage.js .resize()
									_this.activePage.resize();
									////  OLD Logic:
									//
									// // Resize components
									// if (_this.activePage && _this.activePage.comInstances) {
									// 	for (var key in _this.activePage.comInstances) {
									// 		if (_this.activePage.comInstances[key].resize)
									// 			_this.activePage.comInstances[key].resize(width, height);
									// 	}
									// }

									_this.debounceResize = false;

								}, 5);

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