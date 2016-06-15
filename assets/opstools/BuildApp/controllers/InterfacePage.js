
steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/InterfaceList.js',
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
								updatedPageEvent: 'AB_Page.Updated'
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

							self.controllers.InterfaceList = new InterfaceList(self.element, { selectedPageEvent: self.options.selectedPageEvent, updatedPageEvent: self.options.updatedPageEvent });
						},

						initWebixUI: function () {
							var self = this;

							var interfaceListUI = self.controllers.InterfaceList.getUIDefinition();

							self.data.definition = {
								id: self.options.interfaceView,
								cols: [
									interfaceListUI,
									{ view: "resizer", autoheight: true },
									{} //TODO
								]
							};
						},

						initEvents: function () {
							var self = this;

							self.controllers.InterfaceList.on(self.options.selectedPageEvent, function (event, id) {
								console.log('selected page: ', id);
							});
						},

						getUIDefinition: function () {
							return this.data.definition;
						},

						webix_ready: function () {
							var self = this;

							self.controllers.InterfaceList.webix_ready();
						},

						loadData: function (appId) {
							var self = this;

							self.controllers.InterfaceList.loadPages(appId);
						}

					});

				});
		});

	});