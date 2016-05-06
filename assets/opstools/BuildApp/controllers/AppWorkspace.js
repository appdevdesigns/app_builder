
steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/ModelPage.js',
	function () {
		System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control').then(function () {

					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.AppWorkspace', {


						init: function (element, options) {
							var self = this;
							options = AD.defaults({
								backToAppPageEvent: 'AB_Application.GoToAppPage'
							}, options);
							this.options = options;

							// Call parent init
							this._super(element, options);


							this.dataSource = this.options.dataSource; // AD.models.Projects;
							this.data = {};

							this.webixUiId = {
								appNameLabel: 'ab-name-label',

								appWorkspaceView: 'ab-workspace-view',
								appWorkspaceToolbar: 'ab-workspace-toolbar',
								appWorkspaceMenu: 'ab-workspace-tabbar',
								appWorkspace: 'ab-workspace',

								modelView: 'ab-app-model-view',
								interfaceView: 'ab-app-interface-view'
							};

							this.initControllers();
							this.getUIDefinitions();

							webix.ready(function () {
								self.initWebixUI();
							});
						},

						initControllers: function () {
							var self = this;
							self.controllers = {};

							var ModelPage = AD.Control.get('opstools.BuildApp.ModelPage');

							self.controllers.ModelPage = new ModelPage(self.element, { 'modelView': self.webixUiId.modelView });

						},

						getUIDefinitions: function () {
							var self = this;
							self.UIDefinitions = {};

							self.UIDefinitions.modelList = self.controllers.ModelPage.getUIDefinition();
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
											{ view: "label", id: self.webixUiId.appNameLabel, label: "Application name", width: 400, align: "left" },
											{ fillspace: true },
											{
												view: "button", value: "Back to Applications page", width: 250, align: "right", click: function () {
													self.element.trigger(self.options.backToAppPageEvent, {});
												}
											}
										]
									},
									{ height: 10 },
									{
										view: "tabbar", id: self.webixUiId.appWorkspaceMenu, value: self.webixUiId.modelView, multiview: true, options: [
											{ id: self.webixUiId.modelView, value: 'Model', width: 120 },
											{ id: self.webixUiId.interfaceView, value: 'Interface', width: 120 }
										]
									},
									{
										id: self.webixUiId.appWorkspace,
										cells: [
											self.UIDefinitions.modelList,
											{
												// Interface view
												id: self.webixUiId.interfaceView,
												template: "Under construction..."
											}
										]
									}
								]
							});
						},

						setApplication: function (app) {
							var self = this;

							self.data.app = app;

							$$(self.webixUiId.appNameLabel).define('label', app.name);
							$$(self.webixUiId.appNameLabel).refresh();

							self.controllers.ModelPage.setAppId(app.id);
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

							self.controllers.ModelPage.resize(height);
						}

					});

				});
		});

	});