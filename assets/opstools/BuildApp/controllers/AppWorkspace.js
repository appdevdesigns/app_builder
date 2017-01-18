steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/ObjectPage.js',
	'opstools/BuildApp/controllers/InterfacePage.js',

	'opstools/BuildApp/controllers/webix_custom_components/LoadingScreen.js',

	'opstools/BuildApp/controllers/data_fields/dataFieldsManager.js',

	function () {
		System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control').then(function () {

					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.AppWorkspace', {


						init: function (element, options) {
							var self = this;

							self.options = AD.defaults({
								backToAppPageEvent: 'AB_Application.GoToAppPage',
								synchronizeEvent: 'AB_Application.Synchronize',

								updatedObjectEvent: 'AB_Object.Updated'
							}, options);

							// Call parent init
							this._super(element, options);

							this.data = {};

							this.webixUiId = {
								appNameLabel: 'ab-name-label',

								appWorkspaceView: 'ab-workspace-view',
								appWorkspaceToolbar: 'ab-workspace-toolbar',
								appWorkspaceMenu: 'ab-workspace-tabbar',
								appWorkspace: 'ab-workspace',

								synchronizeButton: 'ab-sync-button',

								objectView: 'ab-app-object-view',
								interfaceView: 'ab-app-interface-view'
							};

							this.initMultilingualLabels();

							this.initControllers();
							this.initEvents();

							this.getUIDefinitions();

							webix.ready(function () {
								self.initWebixUI();

								self.controllers.ObjectPage.webix_ready();
								self.controllers.InterfacePage.webix_ready();
							});
						},

						initMultilingualLabels: function () {
							var self = this;
							self.labels = {};
							self.labels.common = {};
							self.labels.application = {};
							self.labels.object = {};
							self.labels.interface = {};

							self.labels.common.close = AD.lang.label.getLabel('ab.common.close') || "Close";
							self.labels.common.processing = AD.lang.label.getLabel('ab.common.processing') || "Processing...";

							self.labels.application.synchronize = AD.lang.label.getLabel('ab.application.synchronize') || "Synchronize";
							self.labels.application.backToApplication = AD.lang.label.getLabel('ab.application.backToApplication') || "Back to Applications page";

							self.labels.object.title = AD.lang.label.getLabel('ab.object.title') || "Objects";

							self.labels.interface.title = AD.lang.label.getLabel('ab.interface.title') || "Interface";
						},

						initControllers: function () {
							var self = this;
							self.controllers = {};

							var ObjectPage = AD.Control.get('opstools.BuildApp.ObjectPage'),
								InterfacePage = AD.Control.get('opstools.BuildApp.InterfacePage');

							self.controllers.ObjectPage = new ObjectPage(self.element, { 'objectView': self.webixUiId.objectView });
							self.controllers.InterfacePage = new InterfacePage(self.element, { 'interfaceView': self.webixUiId.interfaceView });
						},

						initEvents: function () {
							var self = this;

							self.controllers.ObjectPage.element.on(self.options.updatedObjectEvent, function (event, data) {
								self.controllers.InterfacePage.refresh();
							});
						},

						getUIDefinitions: function () {
							var self = this;
							self.UIDefinitions = {};

							self.UIDefinitions.objectPage = self.controllers.ObjectPage.getUIDefinition();
							self.UIDefinitions.interfacePage = self.controllers.InterfacePage.getUIDefinition();
						},

						initWebixUI: function () {
							var self = this;

							// Tab menu
							webix.ui({
								id: self.webixUiId.appWorkspaceView,
								container: self.element[0],
								autoheight: true,
								autowidth: true,
								rows: [
									{
										view: "toolbar",
										id: self.webixUiId.appWorkspaceToolbar,
										autowidth: true,
										cols: [
											{
												view: "button", value: self.labels.application.backToApplication, width: 250, align: "right", click: function () {
													self.element.trigger(self.options.backToAppPageEvent, {});
												}
											},
											{
												id: self.webixUiId.synchronizeButton,
												view: "button",
												type: "iconButton",
												icon: "refresh",
												label: self.labels.application.synchronize,
												width: 250,
												//autowidth: true,
												align: "right",
												click: function () {
													self.element.trigger(self.options.synchronizeEvent, {
														appID: AD.classes.AppBuilder.currApp.id
													});
												}
											},
											{ fillspace: true },
											{ view: "label", id: self.webixUiId.appNameLabel, width: 400, align: "right" }
										]
									},
									{ height: 10 },
									{
										view: "tabbar", id: self.webixUiId.appWorkspaceMenu, value: self.webixUiId.objectView, multiview: true,
										options: [
											{ id: self.webixUiId.objectView, value: self.labels.object.title, width: 120 },
											{ id: self.webixUiId.interfaceView, value: self.labels.interface.title, width: 120 }
										],
										on: {
											onChange: function (newv, oldv) {
												if (newv != oldv)
													self.refresh();

												if (newv == self.webixUiId.objectView)
													$$(self.webixUiId.synchronizeButton).show();
												else
													$$(self.webixUiId.synchronizeButton).hide();
											}
										}
									},
									{
										id: self.webixUiId.appWorkspace,
										cells: [
											self.UIDefinitions.objectPage,
											self.UIDefinitions.interfacePage
										]
									}
								]
							});

						},

						refresh: function () {
							var self = this;

							$$(self.webixUiId.appNameLabel).define('label', AD.classes.AppBuilder.currApp.attr('label'));
							$$(self.webixUiId.appNameLabel).refresh();

							switch ($$(self.webixUiId.appWorkspaceMenu).getValue()) {
								case self.webixUiId.objectView:
									self.controllers.ObjectPage.refresh();
									break;
								case self.webixUiId.interfaceView:
									self.controllers.InterfacePage.refresh();
									break;
							}
						},

						syncObjectsData: function () {
							return this.controllers.ObjectPage.syncData();
						},

						resize: function (height) {
							var self = this;

							var appWorkspaceDom = $(self.element[0]);

							if (appWorkspaceDom) {
								var width = appWorkspaceDom.parent().css('width');
								if (width) {
									width = parseInt(width.replace('px', ''));
								}
								appWorkspaceDom.width(width);

								var computedHeight = height - 300;
								var minHeight = parseInt(appWorkspaceDom.css('min-height').replace('px', ''));
								var workspaceHeight = minHeight < computedHeight ? computedHeight : minHeight;

								appWorkspaceDom.height(workspaceHeight);

								if (self.webixUiId) {
									if (self.webixUiId.appWorkspaceView) {
										$$(self.webixUiId.appWorkspaceView).define('height', height);
										$$(self.webixUiId.appWorkspaceView).adjust();
									}

									if (self.webixUiId.appWorkspace) {
										$$(self.webixUiId.appWorkspace).define('height', height - 100);
										$$(self.webixUiId.appWorkspace).adjust();
									}
								}

							}

							self.controllers.ObjectPage.resize(height);
							self.controllers.InterfacePage.resize(height);
						}

					});

				});
		});

	});