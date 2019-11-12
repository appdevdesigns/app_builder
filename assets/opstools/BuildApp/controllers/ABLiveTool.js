steal(
	// List your Controller's dependencies here:

	function () {
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
								page: -1,
								areaKey: "",
								toolKey: -1
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

							self.__events = {};

							if (self.__events.areaShow == null)
								self.__events.areaShow = AD.comm.hub.subscribe('opsportal.area.show', function (message, data) {

									self.menuChange(data.area);

								});

							if (self.__events.toolShow == null)
								self.__events.toolShow = AD.comm.hub.subscribe('opsportal.tool.show', function (message, data) {

									self.menuChange(data.area, data.tool);

								});

							if (self.__events.resize == null)
								self.__events.resize = AD.comm.hub.subscribe('opsportal.resize', function (message, data) {
									self.height = data.height;
									self.debounceResize = false; // if we do not set this the resize is never set
									self.resize(data.height);
								});

							// Check this is active
							self.menuChange();

							// FIX: If there is only menu item, then click the first item to default
							var menuList = document.getElementsByClassName('op-list')[0];
							if (menuList) {
								var menuItems = menuList.getElementsByClassName('op-container');
								if (menuItems.length === 1) {
									menuItems[0].click();
								}
							}

						},

						initDOM: function () {
							// console.log('... creating ABLiveTool <div> ');

							var css = "background-color: #fff !important; font-size: 30px; line-height: 80px; padding-top: 160px; text-align: center; width: 100%;";

							this.element.html(
								'<div id="#domID#">'.replace(/#domID#/g, this.containerDomID) +
								'<div style="' + css + '" class="ab-loading"><i class="fa fa-refresh fa-spin fa-3x fa-fw"></i><br/>Loading&#8230;' +
								'</div></div>');

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

							// Wait until the tool's area has been shown
							if (!self.activated) return;

							self.renderPageContainer();

							self.initEvents(self.rootPage);

							webix.ready(function () {

								self.showPage();

								self.resize(self.height || 600);
							});

						},

						menuChange: function (areaKey, toolKey) {

							var self = this;

							// Get current area key
							if (areaKey == null) {

								let currAreaElem = document.querySelector('#op-list-menu > .op-container.active');
								if (!currAreaElem) return;

								areaKey = currAreaElem.getAttribute("area");

							}

							// Get current tool key
							if (toolKey == null) {

								// get active tool element
								let currToolElem = document.querySelector('#op-masthead-sublinks [area="{area}"] .active'.replace("{area}", areaKey));
								if (!currToolElem) return;

								toolKey = currToolElem.getAttribute("op-tool-id");

							}

							// Check it is our page 
							if (self.options.areaKey == areaKey &&
								self.options.toolKey == toolKey) {

								if (!self.activated) {
									self.activated = true;

									self.getData();
								}
								else {
									self.showPage();
								}

							}

						},

						getData: function () {
							var self = this,
								q = $.Deferred();

							self.data = {};
							async.series([
								// Show loading spinners
								function (next) {

									var areaMenuItem = document.body.querySelector('[class="op-container"][area="' + self.options.areaKey + '"]');
									if (areaMenuItem) {
										areaMenuItem.insertAdjacentHTML(
											'beforeend',
											'<span class="icon ' + self.options.areaKey + '_appLoading"><i class="fa fa-refresh fa-spin"></i></span>');
									}

									next();

								},
								// Get application data
								function (next) {
									ABApplication.livepage(self.options.app, self.options.page)
										.catch(console.error)
										.then(function (result) {
											self.data.application = result;

											// Store the root page
											if (self.rootPage == null)
												self.rootPage = self.data.application.pages(p => p.id == self.options.page)[0];

											next();
										}, next);
								},

								// Bind objects and queries from data views
								function (next) {

									if (!self.data.application) return next();

									let storeObject = (datasource) => {
										if (self.data.application.objects(o => o.id == datasource.id).length < 1) {
											self.data.application._objects.push(datasource);
										}
									};

									self.data.application.datacollections().forEach(dc => {

										if (!dc) return;

										dc.init();

										let datasource = dc.datasource;
										if (!datasource) return;

										// Queries
										if (dc.settings &&
											dc.settings.isQuery &&
											self.data.application.queries(q => q.id == datasource.id).length < 1) {

											self.data.application._queries.push(datasource);

											datasource.objects().forEach(obj => {
												storeObject(obj);
											});

										}
										// Objects
										else {
											storeObject(datasource);
										}

									});

									next();

								},

								function (next) {

									if (self.rootPage == null)
										return next();

									self.initPage();

									// let areaKey = 'ab-' + self.data.application.name.trim();
									// areaKey = areaKey.toLowerCase().replace(/[^a-z0-9]/gi, '');

									// // If there is a ops-area, it should trigger that ops-area to render page
									// // Because 'opsportal.tool.show' and 'opsportal.area.show' are not trigger
									// var opsMenus = document.body.querySelectorAll('#op-list-menu > .op-container');
									// if (opsMenus.length == 1) {
									// 	opsMenus[0].click();
									// }
									// // If this area is showing
									// else {
									// 	// TODO: How to get current area ?
									// 	var currPanel = document.body.querySelector('#op-masthead-sublinks > ul:not([style*="display:none"]):not([style*="display: none"])');
									// 	if (currPanel) {
									// 		var currArea = currPanel.getAttribute('area');
									// 		if (currArea == areaKey) {
									// 			callback(null, { area: areaKey });
									// 		}
									// 	}
									// }

									next();

								},

								// Hide loading spinners
								function (next) {

									// we will remove the loading spinners on the menu now
									var opsMenuItem = document.body.querySelectorAll('#op-list-menu > .op-container .' + self.options.areaKey + '_appLoading');
									(opsMenuItem || []).forEach((x) => {
										x.remove();
									});

									next();
								}

							], function (err) {
								if (err) q.reject(err);
								else q.resolve();
							});

							return q;
						},

						renderPageContainer: function () {
							var self = this;

							if (self.rootPage == null) return;


							// Clear UI content
							var rootDomId = self.getPageDomID(self.rootPage.id);

							// var parentContainer = self.element.parent()[0];
							// parentContainer.style.width = "900px";
							// parentContainer.style.margin = "0 auto";

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

							if (parseInt(page.settings.pageWidth) > 0 && parseInt(page.settings.fixedPageWidth) == 1) {
								var parentContainer = self.element.parent()[0];
								parentContainer.style.width = parseInt(page.settings.pageWidth) + "px";
								parentContainer.style.margin = "0 auto";
								parentContainer.classList.add(page.settings.pageBackground);
							}

							switch (page.settings.type) {
								case 'popup':
									var popupTemplate = {
										view: "window",
										id: pageDomId,
										modal: true,
										position: "center",
										resize: true,
										width: parseInt(page.settings.popupWidth) || 700,
										height: (parseInt(page.settings.popupHeight) + 44) || 450,
										css: 'ab-main-container',
										head: {
											view: "toolbar",
											css: "webix_dark",
											cols: [
												{
													view: "label",
													label: page.label,
													css: "modal_title",
													align: "center"
												},
												{
													view: "button",
													label: "Close",
													autowidth: true,
													align: "center",
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

									// console.log(ui);
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
							var self = this;

							// if pageId is not passed we will clear the peviousPageId so it won't load, this fixes a bug with the popup pages
							if (pageId == null) {
								self.previousPageId = null;
							}

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
								// console.log("loading page");

								if (self.pageComponents[pageId] && self.pageComponents[pageId].onShow) {
									// console.log("canceling load");
									clearInterval(loadPage);
									for (const element of document.getElementById(self.containerDomID).getElementsByClassName("ab-loading")) {
										element.style.display = "none";
									}
									self.pageComponents[pageId].onShow();
								}

							}, 60);

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

							let needToReloadPage = () => {

								// clear the cache of events
								self.changePageEventIds = {};

								// remove stored root page
								// it will re-render when this page will be triggered
								delete self.rootPage;

								self.activated = false;

								self.initDOM();
							};

							if (!self.updatePageEventId && page.isRoot()) {

								/**
								 * @event ab.interface.update
								 * This event is triggered when the root page is updated
								 * 
								 * @param data.rootPage {uuid} - id of the root page
								 */
								self.updatePageEventId = AD.comm.hub.subscribe('ab.interface.update', function (msg, data) {

									if (page.id == data.rootPageId) {
										needToReloadPage();
									}

								});
							}

							if (!self.updateDataviewEventId && page.isRoot()) {

								/**
								 * @event ab.dataview.update
								 * This event is triggered when the dataview is updated
								 * 
								 * @param data.dataviewId {uuid} - id of the data view
								 */
								self.updateDataviewEventId = AD.comm.hub.subscribe('ab.dataview.update', function (msg, data) {

									let updatedDC = self.data.application.datacollections(dc => dc.id == data.dataviewId)[0];
									if (updatedDC) {
										needToReloadPage();
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

						showUpdatingPopup: function () {

							let popup = document.createElement("div");
							let message = document.createTextNode("UI is updating...");

							popup.appendChild(message);

							let containerDOM = document.getElementById(this.containerDomID);
							document.body.insertBefore(popup, containerDOM);

						},

						hideUpdatingPopup: function () {

							// document.remo

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