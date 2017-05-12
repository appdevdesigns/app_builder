steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/utils/JsObjectHelper.js',

	'opstools/BuildApp/BuildApp.css',
	'opstools/BuildApp/views/BuildApp/BuildApp.ejs',
	'opstools/BuildApp/controllers/AppList.js',
	'opstools/BuildApp/controllers/AppWorkspace.js',
    'countly-sdk-web/lib/countly.min',
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

							webix.codebase = "/js/webix-extras/";

							// Show message when user clicks back button
							window.onbeforeunload = function () { return "Changes you made may not be saved."; };

							AD.classes.AppBuilder = AD.classes.AppBuilder || {};

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
								loadingScreen: 'ab-loading-screen',
								syncButton: 'ab-sync-button'
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
								if (!data.reloading) { // Reload is done
									self.updateSyncStatus({
										action: 'start',
										step: 'syncObjectData'
									});

									Countly.end_event({
									   key: 'synchronize',
									   count: 1,
									   segmentation: data
									});

									// Sync object data
									self.controllers.AppWorkspace.syncObjectsData()
										.fail(function (err) {
											console.error(err);
											$$(self.webixUiId.loadingScreen).showErrorScreen(
												AD.lang.label.getLabel('ab.sync.syncObjectDataError') || 'There is a error when is syncing object data',
												AD.lang.label.getLabel('ab.sync.Reload') || 'Reload',
												function () {
													$$(self.webixUiId.loadingScreen).start();

													self.controllers.AppWorkspace.syncObjectsData();
												});
										})
										.then(function () {
											self.updateSyncStatus({
												action: 'done',
												step: 'syncObjectData'
											});

											// Reloaded - Reset values
											$$(self.webixUiId.loadingScreen).showFinishScreen(
												AD.lang.label.getLabel('ab.sync.synchronized') || "Synchronized",
												AD.lang.label.getLabel('ab.common.ok') || "OK");
											self.data.curLoadProgress = 0;

											$$(self.webixUiId.syncButton).enable();

											// Refresh
											self.controllers.AppWorkspace.refresh();
										});
								}
								else {
									self.updateSyncStatus(data);
								}

							});

							self.controllers.AppList.element.on(self.CONST.APP_SELECTED, function (event, app) {
								self.element.find(".ab-app-list").hide();

								if (AD.classes.AppBuilder.currApp)
									AD.classes.AppBuilder.currApp.unbind('change');
								AD.classes.AppBuilder.currApp = app;

								self.controllers.AppWorkspace.refresh();

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
								$$(self.webixUiId.syncButton).disable();

								self.callReload(data);
							});
						},

						callReload: function (data) {
							var self = this;

							self.updateSyncStatus({
								action: 'start',
								step: 'request'
							});

							Countly.start_event('synchronize');

							AD.comm.service.post({
								url: '/app_builder/fullReload/' + data.appID
							})
								.always(function () {
								});

							// FIX:  sometimes we loose the socket connection and don't get the
							// update from the server about the status of the reload.
							// Here we manually add it a check to see if the server is done
							// and close out the Sync Interface:
							var _checking = false;
							function checkIt(delay) {

								_checking = true;

								// check every {delay} seconds.
								setTimeout(function(){

									// if our loading process hasn't completed yet:
									if (self.data.curLoadProgress < 1) {
										console.log('....  Sync still not done!');
										// manually request an update:
										AD.comm.service.get({url:'/app_builder/reloadStatus'})
										.fail(function(err){
											checkIt(10000);
										})
										.then(function(data){

											if (data && data.state == 'done') {

												// mimic the final done call:
												self.data.curLoadProgress = 0.9;
												self.updateSyncStatus({action:'done', step:'reloadBlueprints'});

												// remove this subscription.
												AD.comm.socket.unsubscribe(subID);
											} else {

												// leave things alone and check again in 10s
												checkIt(10000);
											}
										})

									} else {
										console.log('... Sync Done!');
										// remove this subscription.
										AD.comm.socket.unsubscribe(subID);

										// This may be redundant, or even unused
										// see initEvents()
                                        Countly.end_event({
                                            key: 'synchronize',
                                            count: 1,
                                            segmentation: { appID: data.appID }
                                        });
									}
								}, delay);

							}

							// now kick things off once we get the server-reload  message:
							var subID = AD.comm.socket.subscribe('server-reload', function(data) {
								if (!_checking) { console.log('... starting checkIt!'); checkIt(30000); }
							});


						},

						updateSyncStatus: function (data) {
							var self = this;

							switch (data.action) {
								case 'start': // Update loading message
									var message = '';
									switch (data.step) {
										case 'request':
											message = AD.lang.label.getLabel('ab.sync.status.request') || 'Requesting...';
											break;
										case 'findApplication':
											message = AD.lang.label.getLabel('ab.sync.status.prepareAppInfo') || 'Preparing Application info...';
											break;
										case 'prepareFolder':
											message = AD.lang.label.getLabel('ab.sync.status.prepareAppFolders') || 'Preparing Application folders...';
											break;
										case 'reloadControllers':
											message = AD.lang.label.getLabel('ab.sync.status.reloadControllers') || 'Reloading Controllers...';
											break;
										case 'reloadORM':
											message = AD.lang.label.getLabel('ab.sync.status.reloadDatabases') || 'Reloading Databases...';
											break;
										case 'reloadBlueprints':
											message = AD.lang.label.getLabel('ab.sync.status.reloadBlueprints') || 'Reloading Blueprints...';
											break;
										case 'syncObjectData':
											message = AD.lang.label.getLabel('ab.sync.status.syncObjData') || 'Syncing objects data...';
											break;
									}
									$$(self.webixUiId.loadingScreen).setMessage(message);
									break;
								case 'done': // Update progress bar
									if (!self.data.curLoadProgress) self.data.curLoadProgress = 0;
									switch (data.step) {
										case 'findApplication':
											self.data.curLoadProgress += 0.2;
											break;
										case 'prepareFolder':
											self.data.curLoadProgress += 0.2;
											break;
										case 'reloadControllers':
											self.data.curLoadProgress += 0.2;
											break;
										case 'reloadORM':
											self.data.curLoadProgress += 0.2;
											break;
										case 'reloadBlueprints':
											self.data.curLoadProgress += 0.1;
											break;
										case 'syncObjectData':
											self.data.curLoadProgress += 0.1;
											break;
									}
									$$(self.webixUiId.loadingScreen).setPercentage(self.data.curLoadProgress);
									break;
								case 'fail':
									console.error(data.options.error);
									var errorMessage = [
										(AD.lang.label.getLabel('ab.sync.syncError') || 'There are errors')+":",
										'',
										data.options.error
									].join('\n')

									Countly.end_event({
									   key: 'synchronize',
									   segmentation: {
									       'error': data.options.error
									   }
									});

									// Show retry screen
									$$(self.webixUiId.loadingScreen).showErrorScreen(
										errorMessage,
										AD.lang.label.getLabel('ab.sync.Reload') || 'Reload',
										function () {
											$$(self.webixUiId.loadingScreen).start();

											self.callReload(data.options.requestData);
										});
									$$(self.webixUiId.syncButton).enable();

									break;
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
