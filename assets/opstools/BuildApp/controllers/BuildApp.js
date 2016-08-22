steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/BuildApp.css',
	'opstools/BuildApp/views/BuildApp/BuildApp.ejs',
	'opstools/BuildApp/controllers/AppList.js',
	'opstools/BuildApp/controllers/AppWorkspace.js',
	function () {
		System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control',
				'OpsPortal/classes/OpsTool',
				'site/labels/app_builder').then(function () {

					// Namespacing conventions:
					// AD.Control.OpsTool.extend('[ToolName]', [{ static },] {instance} );
					AD.Control.OpsTool.extend('BuildApp', {
						CONST: {
							APP_SELECTED: 'AB_Application.Selected',
							GO_TO_APP_PAGE: 'AB_Application.GoToAppPage',
							SYNCHRONIZE: 'AB_Application.Synchronize'
						},

						init: function (element, options) {
							var self = this;
							options = AD.defaults({
								templateDOM: '/opstools/BuildApp/views/BuildApp/BuildApp.ejs',
								resize_notification: 'BuildApp.resize',
								tool: null   // the parent opsPortal Tool() object
							}, options);
							self.options = options;

							// Call parent init
							self._super(element, options);

							self.data = {};

							self.webixUiId = {
								loadingScreen: 'ab-loading-screen'
							};

							self.initDOM();
							self.initControllers();
							self.initWebixUI();
							self.initEvents();

							self.translate();
						},



						initDOM: function () {

							this.element.html(can.view(this.options.templateDOM, {}));

							this.element.find(".ab-app-list").show();
							this.element.find(".ab-app-workspace").hide();
						},


						initControllers: function () {

							this.controllers = {};  // hold my controller references here.

							var AppList = AD.Control.get('opstools.BuildApp.AppList'),
								AppWorkspace = AD.Control.get('opstools.BuildApp.AppWorkspace');

							this.controllers.AppList = new AppList(this.element.find(".ab-app-list"), { selectedAppEvent: this.CONST.APP_SELECTED });
							this.controllers.AppWorkspace = new AppWorkspace(this.element.find(".ab-app-workspace"), { backToAppPageEvent: this.CONST.GO_TO_APP_PAGE });
						},

						initWebixUI: function () {
							webix.ui({
								id: this.webixUiId.loadingScreen,
								view: "ab_loading_screen"
							});
						},

						initEvents: function () {
							var self = this;

							io.socket.on('server-reload', function (data) {
								self.updateSyncStatus(data);
							});

							self.controllers.AppList.element.on(self.CONST.APP_SELECTED, function (event, app) {
								self.element.find(".ab-app-list").hide();

								self.controllers.AppWorkspace.setApplication(app);

								self.element.find(".ab-app-workspace").show();
								self.controllers.AppWorkspace.resize(self.data.height);
							});

							self.controllers.AppWorkspace.element.on(self.CONST.GO_TO_APP_PAGE, function (event) {
								self.element.find(".ab-app-workspace").hide();
								self.element.find(".ab-app-list").show();
								self.controllers.AppList.resetState();
								self.controllers.AppList.resize(self.data.height);
							});

							self.controllers.AppWorkspace.element.on(self.CONST.SYNCHRONIZE, function (event, data) {
								$$(self.webixUiId.loadingScreen).start();
								$$(self.webixUiId.loadingScreen).setMessage("Requesting...");

								// setTimeout(function () {
								// 	$$(self.webixUiId.loadingScreen).setPercentage(0.5);
								// 	$$(self.webixUiId.loadingScreen).setMessage("One ...");
								// }, 4000);

								// setTimeout(function () {
								// 	$$(self.webixUiId.loadingScreen).setPercentage(1);
								// 	$$(self.webixUiId.loadingScreen).setMessage("Two ...");
								// }, 7000);

								// setTimeout(function () {
								// 	$$(self.webixUiId.loadingScreen).stop();
								// }, 10000);

								// Create overlay with loading icon
								// var $overlay = $('<div style="background: black; opacity: 0.4; position: absolute; left: 0; top: 0; bottom: 0; right: 0; z-index: 5000; padding-top: 20%; text-align: center; vertical-align: middle"><i class="fa fa-refresh fa-spin fa-3x fa-inverse"></i></div>');
								// $('body').append($overlay);

								// $$('ab-sync-button').define('icon', 'refresh fa-spin fa fa-inverse');
								// $$('ab-sync-button').define('label', 'Restructuring objects...');
								// $$('ab-sync-button').refresh();
								$$('ab-sync-button').disable();

								// Generate Sails models and reload ORM
								AD.comm.service.post({
									url: '/app_builder/fullReload/' + data.appID
								})
									.always(function () {
										$$(self.webixUiId.loadingScreen).stop(); // TODO
										$$('ab-sync-button').enable();

										// $overlay.remove();
										// delete $overlay;

										// $$('ab-sync-button').define('icon', 'refresh');
										// $$('ab-sync-button').define('label', 'Synchronize');
										// $$('ab-sync-button').refresh();
										// $$('ab-sync-button').enable();
									})
									.fail(function (err) {
										console.log(err);
										webix.message(err);

										$$('ab-sync-button').enable();
									});
							});
						},

						updateSyncStatus: function (data) {
							var self = this;

							if (data.reloading) {
								switch (data.action) {
									case 'start':
										var message = '';
										switch (data.step) {
											case 'findApplication':
												message = 'Preparing Application info...';
												break;
											case 'prepareFolder':
												message = 'Preparing Application folders...';
												break;
											case 'reloadControllers':
												message = 'Reloading Controllers...';
												break;
											case 'reloadORM':
												message = 'Reloading Databases...';
												break;
											case 'reloadBlueprints':
												message = 'Reloading Blueprints...';
												break;
										}
										$$(self.webixUiId.loadingScreen).setMessage(message);
										break;
									case 'done':
										if (!self.data.curLoadProgress) self.data.curLoadProgress = 0;
										switch (data.step) {
											case 'findApplication':
												self.data.curLoadProgress += 0.4;
												break;
											case 'prepareFolder':
												self.data.curLoadProgress += 0.2;
												break;
											case 'reloadControllers':
												self.data.curLoadProgress += 0.1;
												break;
											case 'reloadORM':
												self.data.curLoadProgress += 0.2;
												break;
											case 'reloadBlueprints':
												self.data.curLoadProgress += 0.1;
												break;
										}
										$$(self.webixUiId.loadingScreen).setPercentage(self.data.curLoadProgress);
										break;
								}
							}
							else { // Reloaded - Reset values
								$$(self.webixUiId.loadingScreen).setMessage('');
								self.data.curLoadProgress = 0;
							}
						},

						resize: function (data) {
							this._super(data);
							this.data.height = data.height;

							$('.ab-main-container').height(data.height);

							this.controllers.AppList.resize(data.height);
							this.controllers.AppWorkspace.resize(data.height);
						}

					});

				});
		});

	});