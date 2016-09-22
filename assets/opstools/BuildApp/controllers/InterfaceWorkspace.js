steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/page_components/Menu.js',
	'opstools/BuildApp/controllers/page_components/Grid.js',
	'opstools/BuildApp/controllers/page_components/Form.js',
	'opstools/BuildApp/controllers/page_components/View.js',

	'opstools/BuildApp/controllers/InterfaceLayoutView.js',
	'opstools/BuildApp/controllers/InterfaceComponentList.js',
	function () {
        System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control').then(function () {

					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.InterfaceWorkspace', {

						init: function (element, options) {
							var self = this;

							self.options = AD.defaults({
								selectedPageEvent: 'AB_Page.Selected',
								updatedPageEvent: 'AB_Page.Updated',
								startDragEvent: 'AB_Page.StartDragComponent',
								editComponentEvent: 'AB_Page.EditComponent',
								savedComponentEvent: 'AB_Page.SavedComponent',
								cancelComponentEvent: 'AB_Page.CancelComponent'
							}, options);

							// Call parent init
							self._super(element, options);
							self.Model = {};
							self.data = {};

							self.componentIds = {
								interfaceWorkspace: 'ab-interface-workspace'
							};

							self.initMultilingualLabels();
							self.initControllers();
							self.initWebixUI();
							self.initEvents();
							self.initComponents();
						},

						initMultilingualLabels: function () {
							var self = this;
							self.labels = {};
							self.labels.common = {};
							self.labels.interface = {};
						},

						initControllers: function () {
							var self = this;
							self.controllers = {};

							var Menu = AD.Control.get('opstools.BuildApp.Components.Menu'),
								Grid = AD.Control.get('opstools.BuildApp.Components.Grid'),
								Form = AD.Control.get('opstools.BuildApp.Components.Form'),
								View = AD.Control.get('opstools.BuildApp.Components.View'),

								LayoutView = AD.Control.get('opstools.BuildApp.InterfaceLayoutView'),
								ComponentList = AD.Control.get('opstools.BuildApp.InterfaceComponentList');


							self.controllers.Menu = new Menu(self.element, {});
							self.controllers.Grid = new Grid(self.element, {});
							self.controllers.Form = new Form(self.element, {});
							self.controllers.View = new View(self.element, {});


							self.controllers.LayoutView = new LayoutView(self.element, {
								editComponentEvent: self.options.editComponentEvent,
								savedComponentEvent: self.options.savedComponentEvent,
								cancelComponentEvent: self.options.cancelComponentEvent
							});

							self.controllers.ComponentList = new ComponentList(self.element, {
								startDragEvent: self.options.startDragEvent
							});

						},

						initWebixUI: function () {
							var self = this,
								layoutViewUI = self.controllers.LayoutView.getUIDefinition(),
								componentListUI = self.controllers.ComponentList.getUIDefinition();

							self.data.definition = {
								id: self.componentIds.interfaceWorkspace,
								cols: [
									layoutViewUI,
									componentListUI
								]
							};
						},

						initEvents: function () {
							var self = this;

							self.controllers.LayoutView.on(self.options.editComponentEvent, function (event, obj) {
								self.controllers.ComponentList.openComponentPropertyView(obj.item);
							});

							self.controllers.LayoutView.on(self.options.savedComponentEvent, function (event) {
								self.controllers.ComponentList.closeComponentPropertyView();
							});

							self.controllers.LayoutView.on(self.options.cancelComponentEvent, function (event) {
								self.controllers.ComponentList.closeComponentPropertyView();
							});

							self.controllers.ComponentList.on(self.options.startDragEvent, function (event) {
								self.controllers.LayoutView.startDragComponent();
							});
						},

						initComponents: function () {
							var self = this;
							self.components = {};

							self.components.Menu = self.controllers.Menu.getInstance();
							self.components.Grid = self.controllers.Grid.getInstance();
							self.components.Form = self.controllers.Form.getInstance();
							self.components.View = self.controllers.View.getInstance();

							self.controllers.LayoutView.setComponents(self.components);
							self.controllers.ComponentList.setComponents(self.components);
						},

						webix_ready: function () {
							var self = this;

							self.controllers.LayoutView.webix_ready();
							self.controllers.ComponentList.webix_ready();
						},

						getUIDefinition: function () {
							return this.data.definition;
						},

						setApp: function (app) {
							var self = this;

							self.data.app = app;
							self.controllers.LayoutView.setApp(app);
							self.controllers.Grid.setApp(app);
							self.controllers.Form.setApp(app);
							self.controllers.View.setApp(app);
						},

						setPage: function (page) {
							var self = this;

							self.controllers.LayoutView.resetState();
							self.controllers.ComponentList.resetState();

							// Reset page components 
							self.controllers.Grid.resetState();

							if (page) {
								self.data.page = page;

								self.controllers.LayoutView.setPage(page);
								self.controllers.ComponentList.show();
							}
							else {
								self.controllers.ComponentList.hide();
							}
						},

						setObjectList: function (objectList) {
							var self = this;

							self.controllers.LayoutView.setObjectList(objectList);

							self.controllers.Form.setObjectList(objectList);
							self.controllers.View.setObjectList(objectList);
						},

						refreshMenuComponent: function (pageId) {
							this.controllers.LayoutView.refreshMenuComponent(pageId);
						},

						resize: function (height) {
							this.controllers.Form.resize(height);
							this.controllers.View.resize(height);
						}


					});
				});
		});
	}
)