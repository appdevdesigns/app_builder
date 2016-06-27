
steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/ObjectPage.js',
	'opstools/BuildApp/controllers/InterfacePage.js',

	'opstools/BuildApp/controllers/utils/LocalBucket.js',
	'opstools/BuildApp/controllers/utils/DataUpdater.js',

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
								backToAppPageEvent: 'AB_Application.GoToAppPage',
								synchronizeEvent: 'AB_Application.Synchronize',

								syncSaveDataEvent: 'AB_Object.SyncSaveData',
								errorSaveDataEvent: 'AB_Object.ErrorSaveData',

								syncDeleteDataEvent: 'AB_Object.SyncDeleteData',
								errorDeleteDataEvent: 'AB_Object.ErrorDeleteData',
							}, options);
							this.options = options;

							// Call parent init
							this._super(element, options);

							this.data = {};
							this.data.completeAddDataCount = 0;
							this.data.completeUpdateDataCount = 0;
							this.data.completeDeleteDataCount = 0;
							this.data.errorAddDataCount = 0;
							this.data.errorUpdateDataCount = 0;
							this.data.errorDeleteDataCount = 0;

							this.webixUiId = {
								appNameLabel: 'ab-name-label',

								appWorkspaceView: 'ab-workspace-view',
								appWorkspaceToolbar: 'ab-workspace-toolbar',
								appWorkspaceMenu: 'ab-workspace-tabbar',
								appWorkspace: 'ab-workspace',

								unsyncDataLabel: 'ab-unsync-data-count',
								unsyncDataPopup: 'ab-unsync-data-popup',
								unsyncDataHeader: 'ab-unsync-data-header',
								unsyncDataPopupClose: 'ab-unsync-data-popup-close',
								unsyncDataPopupProcessing: 'ab-unsync-data-popup-processing',
								unsyncDataList: 'ab-unsync-data-list',

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

							self.labels.application.unsyncDataMessage = AD.lang.label.getLabel('ab.application.unsyncDataMessage') || "There are {0} out of sync data";
							self.labels.application.unsyncDataHeader = AD.lang.label.getLabel('ab.application.unsyncDataHeader') || "Offline data";
							self.labels.application.synchronize = AD.lang.label.getLabel('ab.application.synchronize') || "Synchronize";
							self.labels.application.backToApplication = AD.lang.label.getLabel('ab.application.backToApplication') || "Back to Applications page";

							self.labels.object.title = AD.lang.label.getLabel('ab.object.title') || "Objects";

							self.labels.interface.title = AD.lang.label.getLabel('ab.interface.title') || "Interface";
						},

						initControllers: function () {
							var self = this;
							self.controllers = {};

							var ObjectPage = AD.Control.get('opstools.BuildApp.ObjectPage'),
								InterfacePage = AD.Control.get('opstools.BuildApp.InterfacePage'),
								LocalBucket = AD.Control.get('opstools.BuildApp.LocalBucket'),
								DataUpdater = AD.Control.get('opstools.BuildApp.DataUpdater');

							self.controllers.ObjectPage = new ObjectPage(self.element, { 'objectView': self.webixUiId.objectView });
							self.controllers.InterfacePage = new InterfacePage(self.element, { 'interfaceView': self.webixUiId.interfaceView });
							self.controllers.LocalBucket = new LocalBucket(self.element);
							self.controllers.DataUpdater = new DataUpdater(self.element);

						},

						initEvents: function () {
							var self = this;

							self.controllers.DataUpdater.on(self.options.syncSaveDataEvent, function (event, data) {
								// Remove item in local storage
								self.localBucket.remove(data.objName, data.oldId || data.id);

								var itemId = '#objName#_#type#'.replace('#objName#', data.objName).replace('#type#', data.type);
								var item = $$(self.webixUiId.unsyncDataList).getItem(itemId);

								// Update item status
								if (data.type == 'add') {
									self.data.completeAddDataCount++;

									if (item.status != 'error') {
										if (self.data.completeAddDataCount >= item.count)
											item.status = "done";
										else
											item.status = "in progress";
									}
								}
								else {
									self.data.completeUpdateDataCount++;

									if (item.status != 'error') {
										if (self.data.completeUpdateDataCount >= item.count)
											item.status = "done";
										else
											item.status = "in progress";
									}
								}

								$$(self.webixUiId.unsyncDataList).updateItem(itemId, item);
								$$(self.webixUiId.unsyncDataList).refresh();
							});

							self.controllers.DataUpdater.on(self.options.syncDeleteDataEvent, function (event, data) {
								// Remove item in local storage
								self.localBucket.removeDestroy(data.objName, data.id);

								var itemId = '#objName#_delete'.replace('#objName#', data.objName);
								var item = $$(self.webixUiId.unsyncDataList).getItem(itemId);
								item.status = "in progress";

								// Update item status
								self.data.completeDeleteDataCount++;
								if (item.status != 'error') {
									if (self.data.completeDeleteDataCount >= item.count)
										item.status = "done";
									else
										item.status = "in progress";
								}

								$$(self.webixUiId.unsyncDataList).updateItem(itemId, item);
								$$(self.webixUiId.unsyncDataList).refresh();
							});

							self.controllers.DataUpdater.on(self.options.errorSaveDataEvent, function (event, data) {
								// objName, id, err, type
								if (data.type == 'add') {
									self.data.errorAddDataCount++;
								}
								else {
									self.data.errorUpdateDataCount++;
								}
							});

							self.controllers.DataUpdater.on(self.options.errorDeleteDataEvent, function (event, data) {
								// objName, id, err

								self.data.errorDeleteDataCount++;
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
											{ view: "label", id: self.webixUiId.appNameLabel, width: 400, align: "left" },
											{ fillspace: true },

											// {
											// 	view: 'button',
											// 	value: 'TEST',
											// 	click: function () {
											// 		self.syncLocalDataToDB();
											// 	}
											// },

											{
												id: self.webixUiId.unsyncDataLabel,
												view: "label",
												css: "ab-unsync-data-warning",
												width: 270,
												hidden: true,
												on: {
													onItemClick: function (id, e) {
														$$(self.webixUiId.unsyncDataPopup).show();
													}
												}
											},
											{
												view: "button",
												type: "iconButton",
												icon: "refresh",
												label: self.labels.application.synchronize,
												width: 250,
												//autowidth: true,
												align: "right",
												click: function () {
													self.element.trigger(self.options.synchronizeEvent, {});
												}
											},
											{
												view: "button", value: self.labels.application.backToApplication, width: 250, align: "right", click: function () {
													self.element.trigger(self.options.backToAppPageEvent, {});
												}
											}
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
												if (newv != oldv) {
													if (newv == self.webixUiId.interfaceView) {
														self.controllers.InterfacePage.loadData(self.data.app.id);
													}
												}
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

							webix.ui({
								view: 'window',
								id: self.webixUiId.unsyncDataPopup,
								width: 650,
								height: 450,
								position: "center",
								modal: true,
								hidden: true,
								css: 'ab-unsync-data-popup',
								head: {
									cols: [
										{
											id: self.webixUiId.unsyncDataHeader,
											view: 'label',
											css: 'header',
											label: self.labels.application.unsyncDataHeader
										},
										{
											autowidth: true
										},
										{
											id: self.webixUiId.unsyncDataPopupProcessing,
											view: "label",
											label: self.labels.common.processing,
											width: 80,
											hidden: true
										},
										{
											id: self.webixUiId.unsyncDataPopupClose,
											view: "button",
											type: "icon",
											icon: "remove",
											label: self.labels.common.close,
											width: 80,
											click: function () { $$(self.webixUiId.unsyncDataPopup).hide(); }
										}
									]
								},
								body: {
									view: "unitlist",
									id: self.webixUiId.unsyncDataList,
									select: false,
									width: 650,
									height: 300,
									padding: 40,
									scheme: {
										$sort: {
											by: "objectName",
											dir: 'asc'
										}
									},
									uniteBy: function (obj) {
										return obj.objectName;
									},
									template: '{common.status()} <span style="display: inline-block; width: 50px;">#type#</span> - #count# Rows',
									type: {
										status: function (obj) {
											var result = "";
											switch (obj.status) {
												case "not started":
													result = '<i class="fa fa-square-o ab-unsync-data-status"></i>';
													break;
												case "in progress":
													result = '<i class="fa fa-refresh ab-unsync-data-status ab-unsync-data-in-progress"></i>';
													break;
												case "done":
													result = '<i class="fa fa-check ab-unsync-data-status ab-unsync-data-done"></i>';
													break;
												case "error":
													result = '<i class="fa fa-exclamation ab-unsync-data-status ab-unsync-data-error"></i>';
													break;
											}

											return result;
										}
									}
								},
								on: {
									onShow: function () {
										$$(self.webixUiId.unsyncDataList).clearAll();
										$$(self.webixUiId.unsyncDataList).showProgress({ type: 'icon' });

										var savedData = self.localBucket.getAll(),
											destroyedData = self.localBucket.getDestroyAll(),
											dataList = [];

										for (var objName in savedData) {
											// TODO find object label
											var addNum = 0,
												updateNumber = 0;
											savedData[objName].forEach(function (d) {
												if (typeof d.id == 'string' && d.id.startsWith('temp'))
													addNum++;
												else
													updateNumber++;
											});

											// Add data number
											if (addNum > 0) {
												dataList.push({
													id: '#objName#_add'.replace('#objName#', objName),
													objectName: objName,
													status: "not started",
													type: 'Add',
													count: addNum
												});
											}

											// Update data number
											if (updateNumber > 0) {
												dataList.push({
													id: '#objName#_update'.replace('#objName#', objName),
													objectName: objName,
													status: "not started",
													type: 'Update',
													count: updateNumber
												});
											}
										}

										// Delete data number
										for (var objName in destroyedData) {
											if (destroyedData[objName].length > 0) {
												dataList.push({
													id: '#objName#_delete'.replace('#objName#', objName),
													objectName: objName,
													status: "not started",
													type: 'Delete',
													count: destroyedData[objName].length
												});
											}
										}

										$$(self.webixUiId.unsyncDataList).parse(dataList);

										$$(self.webixUiId.unsyncDataList).hideProgress();
									}
								}
							});

							webix.extend($$(self.webixUiId.unsyncDataList), webix.ProgressBar);
						},

						setApplication: function (app) {
							var self = this;

							self.data.app = app;

							$$(self.webixUiId.appNameLabel).define('label', app.label);
							$$(self.webixUiId.appNameLabel).refresh();

							self.controllers.ObjectPage.setApp(app);

							self.controllers.DataUpdater.setApp(app);

							self.refreshUnsyncLabel();

							// FOR TEST
							// $$(self.webixUiId.appWorkspaceMenu).setValue(self.webixUiId.interfaceView);
						},

						refreshUnsyncLabel: function () {
							var self = this;

							self.localBucket = self.controllers.LocalBucket.getBucket(self.data.app.id);
							var localDataCount = self.localBucket.getCount() + self.localBucket.getDestroyCount();
							if (localDataCount) {
								var label = '<i class="fa fa-exclamation-triangle" aria-hidden="true"></i> ' + self.labels.application.unsyncDataMessage.replace('{0}', localDataCount);
								$$(self.webixUiId.unsyncDataLabel).define('label', label);
								$$(self.webixUiId.unsyncDataLabel).refresh();
								$$(self.webixUiId.unsyncDataLabel).show();
							}
							else {
								$$(self.webixUiId.unsyncDataLabel).hide();
							}
						},

						syncLocalDataToDB: function () {
							var self = this;

							$$(self.webixUiId.unsyncDataPopup).show();
							$$(self.webixUiId.unsyncDataPopupClose).hide();
							$$(self.webixUiId.unsyncDataPopupProcessing).show();

							self.data.completeAddDataCount = 0;
							self.data.completeUpdateDataCount = 0;
							self.data.completeDeleteDataCount = 0;
							self.data.errorAddDataCount = 0;
							self.data.errorUpdateDataCount = 0;
							self.data.errorDeleteDataCount = 0;

							self.controllers.DataUpdater.syncData()
								.fail(function (err) {
									$$(self.webixUiId.unsyncDataPopupProcessing).hide();
									$$(self.webixUiId.unsyncDataPopupClose).show();
								})
								.then(function () {
									self.refreshUnsyncLabel();
									self.refresh();

									$$(self.webixUiId.unsyncDataPopupProcessing).hide();
									$$(self.webixUiId.unsyncDataPopupClose).show();
								});
						},

						refresh: function () {
							this.controllers.ObjectPage.refresh();
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
						}

					});

				});
		});

	});