steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/utils/DataHelper.js',
	'opstools/BuildApp/controllers/utils/ModelCreator.js',

	function (dataHelper, modelCreator) {
		System.import('appdev').then(function () {
			System.import('opstools/BuildApp').then(function () {
				steal.import('appdev/ad',
					'appdev/control/control'
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
								AD.error.log('Application id is invalid.');
								return;
							}

							if (options.page == null || options.page < 0) {
								AD.error.log('Page id is invalid.');
								return;
							}

							self.containerDomID = self.unique('ab_live_tool', self.options.app, self.options.page);

							self.debounceResize = false;
							self.resizeValues = { height: 0, width: 0 };

							self.App = new OP.Component(null, self.containerDomID).App;

							// Store page/sub page .components()
							// These values will be defined in .renderPage()
							self.pageComponents = {}; // { pageId: component }

							// Has this app been selected by the user yet?
							self.activated = false;

							self.initDOM();
							self.initModels();

							self.getData();

							AD.comm.hub.subscribe('opsportal.resize', function (message, data) {
								self.height = data.height;
								self.resize(data.height);
							});

							console.log("live view initialized");


						},

						initDOM: function () {
							console.log('... creating ABLiveTool <div> ');

							this.element.html('<div style="background-color: #fff !important" id="#domID#"><div class="ab-loading">Loading&#8230;</div></div>'.replace(/#domID#/g, this.containerDomID));

							// this.element.html(
							// 	('<div id="#domID#"></div>' +
							// 		'<i id="#domID#-reload-button" class="fa fa-refresh ab-reload-page-button" aria-hidden="true"></i>')
							// 		.replace(/#domID#/g, this.containerDomID));
						},

						initModels: function () {
							this.Models = {};
							this.Models.ABApplication = OP.Model.get('opstools.BuildApp.ABApplication');
						},

						initPage: function () {
							var self = this;

							self.renderPageContainer();

							self.initEvents(self.rootPage);

						},

						getData: function () {
							var self = this,
								q = $.Deferred();

							self.data = {};
							async.series([
								// Get application data
								function (next) {
									ABApplication.getApplicationById(self.options.app)
										.then(function (result) {
											self.data.application = result;

											next();
										}, next);
								},

								function (next) {

									// Wait until the tool's area has been shown
									var areaKey = 'ab-' + self.data.application.name.trim();
									areaKey = areaKey.toLowerCase().replace(/'/g, '').replace(/_/g, '-');

									var callback = function (message, data) {
										if (!self.activated && data.area.toLowerCase() == areaKey) {
											self.activated = true;

											self.startPage();

										}
									};

									if (self.subID1 == null)
										self.subID1 = AD.comm.hub.subscribe('opsportal.tool.show', callback);

									if (self.subID2 == null)
										self.subID2 = AD.comm.hub.subscribe('opsportal.area.show', callback);

									// If there is a ops-area, it should trigger that ops-area to render page
									// Because 'opsportal.tool.show' and 'opsportal.area.show' are not trigger
									var opsMenus = document.body.querySelectorAll('#op-list-menu > .op-container');
									if (opsMenus.length == 1) {
										opsMenus[0].click();
									}
									// If this area is showing
									else {
										var currPanel = document.body.querySelector('#op-masthead-sublinks > ul:not([style*="display:none"]):not([style*="display: none"])');

										if (currPanel.getAttribute('area') == areaKey) {
											callback(null, { area: areaKey });
										}
									}

									next();

								}

							], function (err) {
								if (err) q.reject(err);
								else q.resolve();
							});

							return q;
						},

						startPage: function () {

							var self = this;

							// Wait until the tool's area has been shown
							if (!self.activated) return;

							// Store the root page
							if (self.rootPage == null)
								self.rootPage = self.data.application.urlResolve(self.options.page);

							self.initPage();

							webix.ready(function () {
								console.log("showing page");
								self.showPage();

								self.resize(self.height || 500);
							});

						},

						renderPageContainer: function () {
							var self = this;

							if (self.rootPage == null) return;


							// Clear UI content
							var rootDomId = self.getPageDomID(self.rootPage.id);
							if ($$(rootDomId))
								webix.ui({}, $$(rootDomId));


							// Create a sub pages container
							if ($$(self.containerDomID)) {
								$$(self.containerDomID).destructor();
							}
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


							// Render the root page
							self.renderPage(self.rootPage);
						},

						renderPage: function (page) {
							var self = this,
								pageDomId = this.getPageDomID(page.id);

							var component = page.component(self.App);
							var ui = component.ui;

							// Keep the page component
							self.pageComponents[page.id] = component;

							// Define page id to be batch id of webix.multiview
							ui.batch = page.id;

							switch (page.settings.type) {
								case 'popup':
									var popupTemplate = {
										view: "window",
										id: pageDomId,
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

														var popup = this.getTopParentView();
														popup.hide();

													}
												}
											]
										},
										body: {
											view: "scrollview",
											scroll: true,
											body: ui
										}
									};

									if ($$(pageDomId)) {
										// Destroy old popup
										if ($$(pageDomId).config.view == 'window') {
											$$(pageDomId).destructor();
										}
										// Change page type (Page -> Popup)
										else if ($$(self.containerDomID)) {
											$$(self.containerDomID).removeView(pageDomId);
										}
									}

									// Create popup
									webix.ui(popupTemplate).hide();

									break;
								case 'page':
								default:
									if ($$(pageDomId)) {
										// Change page type (Popup -> Page)
										if ($$(pageDomId).config.view == 'window') {
											$$(pageDomId).destructor();

											$$(self.containerDomID).addView(ui);
										}
										// Rebuild
										else {
											webix.ui(ui, $$(pageDomId));
										}
									}
									// Add to multi-view
									else if ($$(self.containerDomID))
										$$(self.containerDomID).addView(ui);

									break;
							}

							// handle events
							self.initEvents(page);

							// Render children pages
							if (page.pages) {
								(page.pages() || []).forEach(function (subpage) {
									self.renderPage(subpage);
								});
							}

							// Initial UI components
							setTimeout(function () {

								component.init();

							}, 50);

						},

						/**
						* @param ABPage page
						*      Optional page. Default is to show
						*      the root page.
						*/
						showPage: function (pageId) {
							console.log("showPage");
							var self = this;

							pageId = pageId ||
								(self.previousPageId == self.activePageId ? null : self.previousPageId) ||
								(self.rootPage ? self.rootPage.id : null);

							if (pageId == null) return;

							// Hide page popup
							var activePageDomId = self.getPageDomID(self.activePageId);
							if ($$(activePageDomId) && $$(activePageDomId).hide)
								$$(activePageDomId).hide();

							self.previousPageId = self.activePageId;
							self.activePageId = pageId;

							// Show page popup
							var pageDomId = self.getPageDomID(pageId);
							if ($$(pageDomId))
								$$(pageDomId).show();

							// Question: should we do a resize() after all the components are rendered?

							// Change page by batch id
							var childViews = $$(self.containerDomID).getChildViews(),
								batchExist = childViews.filter(function (v) { return v.config.batch == pageId; })[0];
							if (batchExist)
								$$(self.containerDomID).showBatch(pageId);


							// Trigger .onShow to the component
							var loadPage = setInterval(function () {
								console.log("loading page");

								if (self.pageComponents[pageId] && self.pageComponents[pageId].onShow) {
									console.log("canceling load");
									clearInterval(loadPage);
									for (const element of document.getElementById(self.containerDomID).getElementsByClassName("ab-loading")) {
										element.style.display = "none";
									}
									self.pageComponents[pageId].onShow();
								}

							}, 10);

						},


						initEvents(page) {
							var self = this;

							if (page == null) return;

							// { pageId: eventId, ..., pageIdn: eventIdn }
							self.changePageEventIds = self.changePageEventIds || {};

							if (!self.changePageEventIds[page.id]) {
								self.changePageEventIds[page.id] = page.on('changePage', function (pageId) {

									self.showPage(pageId);

								});
							}


							if (!self.updatePageEventId && page.isRoot()) {

								/**
								 * @event ab.interface.update
								 * This event is triggered when the root page is updated
								 * 
								 * @param data.rootPage {uuid} - id of the root page
								 */
								self.updatePageEventId = AD.comm.hub.subscribe('ab.interface.update', function (msg, data) {

									if (page.id == data.rootPage.id) {

										// clear the cache of events
										self.changePageEventIds = {};

										// update the root page instance
										self.rootPage = data.rootPage;

										self.activated = false;

									}

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
							if (height == null && self.height == null) return;
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
									// _this.activePage.resize();
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

						removePage: function (pageId) {

							var pageCom = this.pageComponents[pageId];
							var pageElemId = pageCom.ui.id;

							// swtich the page before it will be removed
							if (this.activePageId == pageId) {
								this.showPage(this.rootPage.id);
							}

							// remove from .multiview
							$$(this.containerDomID).removeView(pageElemId);

							// destroy view's modal
							if ($$(pageElemId))
								$$(pageElemId).destructor();

						},

						getPageDomID: function (pageId) {
							return this.unique('ab_live_page', this.options.app, pageId);
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