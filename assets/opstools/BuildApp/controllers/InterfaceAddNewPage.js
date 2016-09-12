steal(
	// List your Controller's dependencies here:

	'opstools/BuildApp/controllers/page_templates/QuickPage.js',
	'opstools/BuildApp/controllers/page_templates/BlankPage.js',

	function () {
		System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control').then(function () {

					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.InterfaceAddNewPage',
						{
							init: function (element, options) {

								this.options = AD.defaults({
									createdPageEvent: 'AB_Page.Created'
								}, options);

								this.componentId = {
									addNewPopup: 'ab-interface-add-new-popup',
									selectTab: 'ab-interface-add-new-tab'
								};

								this.data = {};

								this.initMultilingualLabels();
								this.initControllers();
								this.initWebixUI();
							},

							initMultilingualLabels: function () {
								var self = this;
								self.labels = {};

								self.labels.common = {};
								self.labels.common.add = AD.lang.label.getLabel('ab.common.add') || "Add";
								self.labels.common.cancel = AD.lang.label.getLabel('ab.common.cancel') || "Cancel";

								self.labels.interface = {};
								self.labels.interface.addNewPage = AD.lang.label.getLabel('ab.interface.addNewPage') || 'Add a new page';
							},

							initControllers: function () {
								var QuickPage = AD.Control.get('opstools.BuildApp.Templates.QuickPage'),
									BlankPage = AD.Control.get('opstools.BuildApp.Templates.BlankPage');

								this.controllers = {
									QuickPage: new QuickPage(this.element),
									BlankPage: new BlankPage(this.element, { data: this.options.data })
								};
							},

							initWebixUI: function () {
								var self = this;

								// Get UI definitions
								var tabContents = [
									self.controllers.QuickPage.getUIDefinition(),
									self.controllers.BlankPage.getUIDefinition()
								];

								// Initial popup
								webix.ui({
									view: "window",
									id: self.componentId.addNewPopup,
									width: 650,
									position: "center",
									modal: true,
									head: self.labels.interface.addNewPage,
									body: {
										rows: [
											{
												id: self.componentId.selectTab,
												view: "tabbar",
												multiview: true,
												options: [
													{ id: 'QuickPage', value: 'Quick Page' },
													{ id: 'BlankPage', value: 'Blank Page' }
												],
												on: {
													onChange: self.changeTab.bind(self)
												}
											},
											{
												cells: tabContents
											},
											{
												margin: 5,
												cols: [
													{
														view: "button",
														value: self.labels.common.add,
														type: "form",
														click: self.addNewPage.bind(self)
													},
													{
														view: "button",
														value: self.labels.common.cancel,
														click: function () { $$(self.componentId.addNewPopup).hide(); }
													}
												]
											}
										]
									}
								}).hide();
							},

							webix_ready: function () {
								this.controllers.QuickPage.webix_ready();
								this.controllers.BlankPage.webix_ready();
							},

							show: function () {
								var self = this;

								$$(self.componentId.addNewPopup).show();
							},

							changeTab: function (newv, oldv) {
								if (newv != oldv) {
									switch (newv) {
										case 'QuickPage':
											// TODO
											break;
										case 'BlankPage':
											this.controllers.BlankPage.show();
											break;
									}
								}
							},

							addNewPage: function () {
								var self = this;

								switch ($$(self.componentId.selectTab).getValue()) {
									case 'QuickPage':
										// TODO
										break;
									case 'BlankPage':
										self.controllers.BlankPage.save()
											.then(function (newPage) {
												self.callAddNewPageEvent(newPage);

												$$(self.componentId.addNewPopup).hide();
											});
										break;
								}
							},

							callAddNewPageEvent: function (newPage) {
								this.element.trigger(this.options.createdPageEvent, { newPage: newPage });
							}


						}
					);
				});
		});
	}
);