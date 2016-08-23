
steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/ObjectList.js',
	'opstools/BuildApp/controllers/ObjectWorkspace.js',

	'opstools/BuildApp/controllers/utils/ModelCreator.js',

	function () {
		System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control').then(function () {

					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.ObjectPage', {


						init: function (element, options) {
							var self = this;
							options = AD.defaults({
								selectedObjectEvent: 'AB_Object.Selected',
								createdObjectEvent: 'AB_Object.Created',
								updatedObjectEvent: 'AB_Object.Updated',
								deletedObjectEvent: 'AB_Object.Deleted'
							}, options);
							this.options = options;

							// Call parent init
							this._super(element, options);

							this.data = {};

							this.initControllers();
							this.initWebixUI();
							this.initEvents();
						},

						initControllers: function () {
							var self = this;
							self.controllers = {};

							var ObjectList = AD.Control.get('opstools.BuildApp.ObjectList'),
								ObjectWorkspace = AD.Control.get('opstools.BuildApp.ObjectWorkspace'),
								ModelCreator = AD.Control.get('opstools.BuildApp.ModelCreator');

							self.controllers.ObjectList = new ObjectList(self.element, {
								selectedObjectEvent: self.options.selectedObjectEvent,
								updatedObjectEvent: self.options.updatedObjectEvent,
								deletedObjectEvent: self.options.deletedObjectEvent
							});
							self.controllers.ObjectWorkspace = new ObjectWorkspace(self.element);
							self.controllers.ModelCreator = new ModelCreator();
						},

						initWebixUI: function () {
							var self = this;

							var objectListUI = self.controllers.ObjectList.getUIDefinition();
							var objectWorkspaceUI = self.controllers.ObjectWorkspace.getUIDefinition();

							self.data.definition = {
								id: self.options.objectView,
								cols: [
									objectListUI,
									{ view: "resizer", autoheight: true },
									objectWorkspaceUI
								]
							};

						},

						initEvents: function () {
							var self = this;

							self.controllers.ObjectList.on(self.options.selectedObjectEvent, function (event, id) {
								self.data.objectId = id;

								self.controllers.ObjectWorkspace.setObjectId(id);
							});

							self.controllers.ObjectList.on(self.options.updatedObjectEvent, function (event, data) {
								self.data.objectList = data.objectList;

								self.controllers.ObjectWorkspace.setObjectList(data.objectList);
							});

							self.controllers.ObjectList.on(self.options.deletedObjectEvent, function (event, data) {
								self.controllers.ObjectWorkspace.deleteObject(data.object);
							});
						},

						getUIDefinition: function () {
							return this.data.definition;
						},

						webix_ready: function () {
							var self = this;

							self.controllers.ObjectList.webix_ready();
							self.controllers.ObjectWorkspace.webix_ready();
						},

						setApp: function (app) {
							var self = this;
							self.data.app = app;

							self.controllers.ObjectWorkspace.resetState();
							self.controllers.ObjectList.resetState();

							self.controllers.ObjectWorkspace.setApp(app);
							self.controllers.ObjectList.setApp(app);

							self.controllers.ModelCreator.setApp(app);
						},

						refresh: function () {
							this.controllers.ObjectWorkspace.setObjectId(this.data.objectId);
						},

						syncData: function () {
							var q = $.Deferred(),
								self = this;

							if (self.data.objectList) {
								var syncDataTasks = [];

								self.data.objectList.forEach(function (object) {
									syncDataTasks.push(function (next) {

										async.waterfall([
											function (cb) {
												self.controllers.ModelCreator.getModel(object.name)
													.fail(function (err) { cb(err); })
													.then(function (objectModel) {
														cb(null, objectModel);
													});
											},
											function (objectModel, cb) {
												objectModel.Cached.syncDataToServer()
													.fail(function (err) { cb(err); })
													.then(function () {
														cb(null);
														next();
													});
											}
										]);

									});
								});

								async.parallel(syncDataTasks, function (err) {
									if (err) {
										q.reject(err);
										return;
									}

									q.resolve();
								});
							}
							else {
								q.resolve();
							}

							return q;
						},

						resize: function (height) {
							var self = this;

							if ($$(self.options.objectView)) {
								$$(self.options.objectView).define('height', height - 120);
								$$(self.options.objectView).adjust();
							}

							self.controllers.ObjectWorkspace.resize(height);
						}


					});

				});
		});

	});