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
								startDragEvent: 'AB_Page.StartDragComponent'
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

							var LayoutView = AD.Control.get('opstools.BuildApp.InterfaceLayoutView');
							var ComponentList = AD.Control.get('opstools.BuildApp.InterfaceComponentList');

							self.controllers.LayoutView = new LayoutView(self.element, {});
							self.controllers.ComponentList = new ComponentList(self.element, { startDragEvent: self.options.startDragEvent });

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

							self.controllers.ComponentList.on(self.options.startDragEvent, function () {
								self.controllers.LayoutView.startDragComponent();
							});
						},

						webix_ready: function () {
							var self = this;

							self.controllers.LayoutView.webix_ready();
							self.controllers.ComponentList.webix_ready();
						},

						getUIDefinition: function () {
							return this.data.definition;
						},

						setPageId: function (id) {
							var self = this;

							if (id) {
								self.data.pageId = id;

								self.controllers.LayoutView.setPageId(id);
								self.controllers.ComponentList.show();
							}
							else {
								self.controllers.LayoutView.resetState();
								self.controllers.ComponentList.hide();
							}
						}


					});
				});
		});
	}
)