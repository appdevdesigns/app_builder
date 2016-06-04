
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
								selectedInterfacePageEvent: 'AB_Interface_Page.Selected',
								updatedObjectEvent: 'AB_Interface.Updated'
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

							self.controllers.InterfaceList = new InterfaceList(self.element, { selectedInterfacePageEvent: self.options.selectedObjectEvent, updatedObjectEvent: self.options.selectedInterfacePageEvent });
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

						},

						getUIDefinition: function () {
							return this.data.definition;
						},

						open: function () {
							var self = this;

							self.controllers.InterfaceList.open();
						}

					});

				});
		});

	});