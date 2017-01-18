steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/InterfaceList.js',
	'opstools/BuildApp/controllers/InterfaceWorkspace.js',
	function () {
        System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control').then(function () {

					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.InterfacePage', {

						init: function (element, options) {
							var self = this;
							options = AD.defaults({
								selectedPageEvent: 'AB_Page.Selected',
								addedPageEvent: 'AB_Page.Added',
								renamePageEvent: 'AB_Page.Rename',
								updatedPageEvent: 'AB_Page.Updated',
								deletedPageEvent: 'AB_Page.Deleted'
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

							var InterfaceList = AD.Control.get('opstools.BuildApp.InterfaceList');
							var InterfaceWorkspace = AD.Control.get('opstools.BuildApp.InterfaceWorkspace');

							self.controllers.InterfaceList = new InterfaceList(self.element, { selectedPageEvent: self.options.selectedPageEvent, updatedPageEvent: self.options.updatedPageEvent, deletedPageEvent: self.options.deletedPageEvent });
							self.controllers.InterfaceWorkspace = new InterfaceWorkspace(self.element, { updatedPageEvent: self.options.updatedPageEvent });
						},

						initWebixUI: function () {
							var self = this;

							var interfaceListUI = self.controllers.InterfaceList.getUIDefinition();
							var interfaceWorkspaceUI = self.controllers.InterfaceWorkspace.getUIDefinition();

							self.data.definition = {
								id: self.options.interfaceView,
								cols: [
									interfaceListUI,
									{ view: "resizer", autoheight: true },
									interfaceWorkspaceUI
								]
							};
						},

						initEvents: function () {
							var self = this;

							// Switch page
							self.controllers.InterfaceList.on(self.options.selectedPageEvent, function (event, data) {
								AD.classes.AppBuilder.currApp.currPage = data.selectedPage;

								self.controllers.InterfaceWorkspace.showPage();
							});

							// Add new page
							self.controllers.InterfaceList.on(self.options.addedPageEvent, function (event, data) {
								// Fire added event to the live page
								AD.comm.hub.publish('ab.interface.add', {
									app: AD.classes.AppBuilder.currApp.id, // ABApplication.id
									parent: data.parentId, // Parent page id (ABPage.id)
									page: data.page.id || data.page // ABPage.id
								});

							});

							// Rename page
							self.controllers.InterfaceList.on(self.options.renamePageEvent, function (event, data) {
								self.controllers.InterfaceWorkspace.refreshMenuComponent(data.page.id || data.page);


							});

							// Delete page
							self.controllers.InterfaceList.on(self.options.deletedPageEvent, function (event, data) {
								var pageId = data.page.id || data.page; // ABPage.id

								if (pageId == AD.classes.AppBuilder.currApp.currPage.id)
									AD.classes.AppBuilder.currApp.currPage = null;

								self.controllers.InterfaceWorkspace.showPage();

								// Fire deleted event to the live page
								AD.comm.hub.publish('ab.interface.remove', {
									app: AD.classes.AppBuilder.currApp.id, // ABApplication.id
									page: pageId
								});
							});

							// Update components
							self.controllers.InterfaceWorkspace.on(self.options.updatedPageEvent, function (event, data) {

								// Fire deleted event to the live page
								AD.comm.hub.publish('ab.interface.update', {
									app: AD.classes.AppBuilder.currApp.id, // ABApplication.id
									page: data.page.id || data.page // ABPage.id
								});

							});
						},

						getUIDefinition: function () {
							return this.data.definition;
						},

						webix_ready: function () {
							var self = this;

							self.controllers.InterfaceList.webix_ready();
							self.controllers.InterfaceWorkspace.webix_ready();
						},

						refresh: function () {
							this.controllers.InterfaceList.loadPages();
							this.controllers.InterfaceWorkspace.resetState();
						},

						resize: function (height) {
							this.controllers.InterfaceList.resize(height);
							this.controllers.InterfaceWorkspace.resize(height);
						}

					});

				});
		});

	});