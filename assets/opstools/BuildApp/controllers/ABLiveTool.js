
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
								// app: -1,
								// page: -1
								app: 2, // FOR TEST: Mock up
								page: 27
							}, options);
							self.options = options;
							self.rootPageDomID = self.unique('ab_live_tool', self.options.app, self.options.page);

							// Call parent init
							self._super(element, options);

							self.initDOM();

							// TODO : GET pages data

							self.initSubPageDOM();

							self.initRootPage();

							self.initEvents();
						},

						initDOM: function () {
							console.log('... creating ABLiveTool <div> ');
							this.element.html('<div id="#domID#"></div>'.replace('#domID#', this.rootPageDomID));
						},

						initSubPageDOM: function () {
							var subPageTemplate = '';

							$('#' + this.rootPageDomID).html('');

							for (var id in this.pages) {
								var page = this.pages[id];
								page.domID = this.unique('ab_live_page', this.options.app, page.id);

								subPageTemplate += '<div id="#domID#"></div>'.replace('#domID#', page.domID);
							}

							$('#' + this.rootPageDomID).html(subPageTemplate);
						},

						initEvents: function () {
							AD.comm.hub.subscribe('ab.interface.update', function (msg, data) {

								if ((data.app == self.options.app)
									&& (data.page == self.options.page)) {
									// TODO : check sub-page id

									// flush the display
									// rebuild our display

								}
							})
						},

						renderPage: function (page) {
							var comTemplate = '';

							page.components.sort(function (a, b) { return a.weight - b.weight });
							page.components.forEach(function (item) {
								item.domID = self.unique('ab_live_item', page.id, item.id);

								comTemplate += '<div id="#domID#"></div>'.replace('#domID#', item.domID);
								comTemplate += '<div style="height: 30px;"></div>';
							});

							switch (page.type) {
								case 'modal':
									var pageData = self.application.pages.filter(function (p) { return p.id == id; });
									if (pageData && pageData[0]) pageData = pageData[0];

									webix.ui({
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
												{ view: "label", label: pageData.label },
												{
													view: "button", label: "Close", width: 100, align: "right",
													click: function () {
														if (self.pages[self.previousPageID].type === 'modal')
															self.showPage();
														else
															self.showPage(self.previousPageID);
													}
												}
											]
										},
										body: {
											scroll: true,
											template: comTemplate
										}
									}).hide();
									break;
								case 'tab':
									// TODO : tab view
									break;
								case 'page':
								default:
									pageTemplates.push({
										view: "template",
										id: page.domID,
										template: comTemplate,
										minWidth: 700,
										autoheight: true,
										scroll: true
									});
									break;
							}
						},

						initRootPage: function () {
							var self = this,
								pageTemplates = [];

							for (var id in self.pages) {
								var page = self.pages[id];
								self.renderPage(page);
							}

							// Clear UI content
							if ($$(self.rootPageDomID))
								webix.ui({}, $$(self.rootPageDomID));

							// Create sub pages
							webix.ui({
								view: "multiview",
								container: self.rootPageDomID,
								css: "ab-main-container ab-generated-page",
								id: self.rootPageDomID,
								cells: pageTemplates,
								on: {
									onViewChange: function (prevId, nextId) {
										self.resize();
									}
								}
							});

						},

						unique: function () {
							return arguments.join('_');
						}

					}); // end AD.Control.extend
				});
			});

		});
	}
);