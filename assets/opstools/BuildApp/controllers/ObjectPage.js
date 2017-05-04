
steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/utils/ModelCreator.js',

	'opstools/BuildApp/controllers/ObjectList.js',
	'opstools/BuildApp/controllers/ObjectWorkspace.js',

	'opstools/BuildApp/models/ABList.js',

	function (modelCreator) {
		System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control').then(function () {

					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.ObjectPage', {


						init: function (element, options) {
							var self = this;
							options = AD.defaults({
								reloadPageEvent: 'AB_Page.Reload',

								selectedObjectEvent: 'AB_Object.Selected',
								createdObjectEvent: 'AB_Object.Created',
								updatedObjectEvent: 'AB_Object.Updated',
								deletedObjectEvent: 'AB_Object.Deleted',

								addNewRowEvent: 'AB_Object.AddNewRow'
							}, options);
							this.options = options;

							// Call parent init
							this._super(element, options);

							this.Model = {
								ABList: AD.Model.get('opstools.BuildApp.ABList')
							};

							this.data = {};

							this.initControllers();
							this.initWebixUI();
							this.initEvents();
						},

						initControllers: function () {
							var self = this;
							self.controllers = {};

							var ObjectList = AD.Control.get('opstools.BuildApp.ObjectList'),
								ObjectWorkspace = AD.Control.get('opstools.BuildApp.ObjectWorkspace');

							self.controllers.ObjectList = new ObjectList(self.element, {
								selectedObjectEvent: self.options.selectedObjectEvent,
								updatedObjectEvent: self.options.updatedObjectEvent,
								deletedObjectEvent: self.options.deletedObjectEvent
							});
							self.controllers.ObjectWorkspace = new ObjectWorkspace(self.element);
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
								var currObj = AD.classes.AppBuilder.currApp.objects.filter(function (obj) { return obj.id == id });
								if (currObj && currObj.length > 0)
									AD.classes.AppBuilder.currApp.currObj = currObj[0];

								self.controllers.ObjectWorkspace.showTable();
							});

							self.controllers.ObjectList.on(self.options.deletedObjectEvent, function (event, data) {
								if (AD.classes.AppBuilder.currApp.currObj.id == data.object.id)
									AD.classes.AppBuilder.currApp.currObj = null;

								// Clear cache
								self.controllers.ObjectWorkspace.deleteObject(data.object);

								self.controllers.ObjectWorkspace.showTable();
							});

							self.controllers.ObjectWorkspace.on(self.options.addNewRowEvent, function (event, data) {
								self.controllers.ObjectWorkspace.addNewRow(data.newRow);
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

						refresh: function () {
							var self = this;

							self.controllers.ObjectWorkspace.resetState();

							self.controllers.ObjectList.resetState();
							self.controllers.ObjectList.refreshObjectList();
							self.controllers.ObjectList.refreshUnsyncNumber();

							if (AD.classes.AppBuilder.currApp.currObj)
								self.controllers.ObjectList.selectObjectItem(AD.classes.AppBuilder.currApp.currObj.id);
						},


						syncData: function () {
							var q = $.Deferred(),
								self = this;

							if (!AD.classes.AppBuilder.currApp || !AD.classes.AppBuilder.currApp.objects || AD.classes.AppBuilder.currApp.objects.length < 1) {
								q.resolve();
								return q;
							}

							var syncDataTasks = [];

							AD.classes.AppBuilder.currApp.objects.forEach(function (object) {
								syncDataTasks.push(function (next) {
									var objectModel = modelCreator.getModel(AD.classes.AppBuilder.currApp, object.name);

									// Set columns is synced
									objectModel.Cached.columns.forEach(function (col) {
										col.isSynced = true;
									});

									objectModel.Cached.syncDataToServer()
										.fail(next)
										.then(function () {
											next();
										});

								});
							});

							async.parallel(syncDataTasks, function (err) {
								if (err)
									q.reject(err);
								else
									q.resolve();
							});

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