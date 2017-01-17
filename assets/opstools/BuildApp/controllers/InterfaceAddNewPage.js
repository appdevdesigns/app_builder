steal(
	// List your Controller's dependencies here:

	'opstools/BuildApp/controllers/page_templates/BlankPage.js',
	'opstools/BuildApp/controllers/page_templates/QuickPage.js',

	function (blankPage, quickPage) {
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
									selectTab: 'ab-interface-add-new-tab',
									saveButton: 'ab-interface-save-button'
								};

								this.data = {};

								this.initMultilingualLabels();
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

							initWebixUI: function () {
								var self = this;

								// Get UI definitions
								var tabContents = [
									quickPage.getUIDefinition(),
									blankPage.getUIDefinition()
								];

								// Initial popup
								webix.ui({
									view: "window",
									id: self.componentId.addNewPopup,
									width: 650,
									position: "center",
									modal: true,
									head: self.labels.interface.addNewPage,
									css: 'ab-main-container',
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
														id: self.componentId.saveButton,
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
								quickPage.webix_ready();
								blankPage.webix_ready();
							},

							show: function () {
								var self = this;

								$$(self.componentId.addNewPopup).show();

								self.changeTab($$(self.componentId.selectTab).getValue());
							},

							changeTab: function (newv, oldv) {
								if (newv != oldv) {
									switch (newv) {
										case 'QuickPage':
											quickPage.show(AD.classes.AppBuilder.currApp, AD.classes.AppBuilder.currApp.currPage);
											break;
										case 'BlankPage':
											blankPage.show(AD.classes.AppBuilder.currApp, AD.classes.AppBuilder.currApp.currPage);
											break;
									}
								}
							},

							addNewPage: function () {
								var self = this;

								$$(self.componentId.saveButton).disable();

								switch ($$(self.componentId.selectTab).getValue()) {
									case 'QuickPage':
										quickPage.save(AD.classes.AppBuilder.currApp)
											.fail(function (err) {
												// TODO : Error message 
												$$(self.componentId.saveButton).enable();
											})
											.done(function (newPages) {
												if (newPages.forEach) {
													newPages.forEach(function (nPage) {
														self.callAddNewPageEvent(nPage);
													});
												}
												else {
													self.callAddNewPageEvent(newPages);
												}

												$$(self.componentId.saveButton).enable();
												$$(self.componentId.addNewPopup).hide();
											});
										break;
									case 'BlankPage':
										blankPage.save(AD.classes.AppBuilder.currApp)
											.fail(function (err) {
												// TODO : Error message 
												$$(self.componentId.saveButton).enable();
											})
											.done(function (newPage) {
												self.callAddNewPageEvent(newPage);

												$$(self.componentId.saveButton).enable();
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