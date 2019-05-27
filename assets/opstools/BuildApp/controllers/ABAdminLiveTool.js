steal(
	// List your Controller's dependencies here:

	function () {
		System.import('appdev').then(function () {
			System.import('opstools/BuildApp').then(function (AB) {
				steal.import('appdev/ad',
					'appdev/control/control'
				).then(function () {

					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.ABAdminLiveTool', {

						init: function (element, options) {
							var self = this;

							options = AD.defaults({
								app: -1,
							}, options);
							self.options = options;

							// Call parent init
							self._super(element, options);

							// Validate
							if (options.app == null || options.app < 0) {
								AD.error.log('Application id is invalid.');
								return;
							}

							self.containerDomID = self.getAppDomID();

							self.debounceResize = false;
							self.resizeValues = { height: 0, width: 0 };

							self.App = new OP.Component(null, self.containerDomID).App;

							// get workspace UI
							self.WorkspaceUI = new AB.ABWorkUI(self.App, {
								IsBackHidden: true
							});

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
								self.__events.toolShow = AD.comm.hub.subscribe('opsportal.tool.show', function(message, data) {

									self.menuChange(data.area, data.tool);

								});

							if (self.__events.resize == null)
								self.__events.resize = AD.comm.hub.subscribe('opsportal.resize', function (message, data) {
									self.height = data.height;
									self.debounceResize = false; // if we do not set this the resize is never set
									self.resize(data.height);
								});

						},

						initDOM: function () {
							console.log('... creating ABAdminLiveTool <div> ');

							var css = "background-color: #fff !important; font-size: 30px; line-height: 80px; padding-top: 160px; text-align: center; width: 100%;";

							this.element.html(
								'<div id="#domID#">'.replace(/#domID#/g, this.containerDomID) +
								'<div style="' + css + '" class="ab-loading"><i class="fa fa-refresh fa-spin fa-3x fa-fw"></i><br/>Loading&#8230;' +
								'</div></div>');
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

							self.initEvents();

							webix.ready(function () {

								// init
								self.WorkspaceUI.init();

								self.showPage();

								self.resize(self.height || 600);
							});

						},

						menuChange: function(areaKey, toolKey) {

							var self = this;

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

									var areaMenuItem = document.body.querySelector('[class="op-container"][area="'+self.options.areaKey+'"]');
									if (areaMenuItem) {
										areaMenuItem.insertAdjacentHTML(
											'beforeend',
											'<span class="icon '+self.options.areaKey+'_appLoading"><i class="fa fa-refresh fa-spin"></i></span>');
									}

									next();

								},
								// Get application data
								function (next) {
									ABApplication.getApplicationById(self.options.app)
										.then(function (result) {
											self.data.application = result;

											next();
										}, next);
								},

								function (next) {

									self.initPage();

									next();
								},

								// Hide loading spinners
								function (next) {

									// we will remove the loading spinners on the menu now
									var opsMenuItem = document.body.querySelectorAll('#op-list-menu > .op-container .'+self.options.areaKey+'_appLoading');
									if (opsMenuItem.length) {
										opsMenuItem.forEach((x) => {
											x.remove();
										})
									}

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

							// Create a sub pages container
							if ($$(self.containerDomID)) {
								$$(self.containerDomID).destructor();
							}

							// Clear div html
							document.getElementById(self.containerDomID).innerHTML = "";

							webix.ui({
								view: "layout",
								container: self.containerDomID,
								css: "ab-main-container ab-generated-page",
								id: self.containerDomID,
								rows: [
									// application workspace UI
									self.WorkspaceUI.ui
								]
							});

							self.initEvents();
						},

						/**
						* @param ABPage page
						*      Optional page. Default is to show
						*      the root page.
						*/
						showPage: function () {
							var self = this;

							// Load Application
							if (self.data.application)
								self.App.actions.transitionWorkspace( self.data.application );

						},


						initEvents() {
							var self = this;
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

									_this.debounceResize = false;

								}, 5);

							}

						},


						getAppDomID: function () {
							return this.unique('ab_admin_live_page', this.options.app);
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