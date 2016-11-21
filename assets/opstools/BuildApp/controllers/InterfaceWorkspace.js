steal(
	// List your Controller's dependencies here:
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

							var LayoutView = AD.Control.get('opstools.BuildApp.InterfaceLayoutView'),
								ComponentList = AD.Control.get('opstools.BuildApp.InterfaceComponentList');

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
							this.controllers.LayoutView.initComponents();
							this.controllers.ComponentList.initComponents();
						},

						webix_ready: function () {
							var self = this;

							self.controllers.LayoutView.webix_ready();
							self.controllers.ComponentList.webix_ready();
						},

						getUIDefinition: function () {
							return this.data.definition;
						},

						showPage: function () {
							this.resetState();
							this.controllers.LayoutView.showComponents();

							if (AD.classes.AppBuilder.currApp.currPage) {
								this.controllers.ComponentList.show();
							}
							else {
								this.controllers.ComponentList.hide();
							}
						},

						refreshMenuComponent: function (pageId) {
							this.controllers.LayoutView.refreshMenuComponent(pageId);
						},

						resetState: function () {
							this.controllers.LayoutView.resetState();
							this.controllers.ComponentList.resetState();
						},

						resize: function (height) {
							this.controllers.LayoutView.resize(height);
						}


					});
				});
		});
	}
)