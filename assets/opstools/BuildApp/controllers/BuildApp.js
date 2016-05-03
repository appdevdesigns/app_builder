
steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/BuildApp.css',
	'opstools/BuildApp/views/BuildApp/BuildApp.ejs',
	'opstools/BuildApp/controllers/AppList.js',
	'opstools/BuildApp/controllers/AppWorkspace.js',
	function () {
		System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control',
				'OpsPortal/classes/OpsTool',
				'site/labels/opstool-BuildApp').then(function () {

					// Namespacing conventions:
					// AD.Control.OpsTool.extend('[ToolName]', [{ static },] {instance} );
					AD.Control.OpsTool.extend('BuildApp', {
						CONST: {
							APP_SELECTED: 'AB_Application.Selected',
						},

						init: function (element, options) {
							var self = this;
							options = AD.defaults({
								templateDOM: '/opstools/BuildApp/views/BuildApp/BuildApp.ejs',
								resize_notification: 'BuildApp.resize',
								tool: null   // the parent opsPortal Tool() object
							}, options);
							this.options = options;

							// Call parent init
							this._super(element, options);

							this.data = {};

							this.initDOM();
							this.initControllers();
							this.initEvents();
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
							this.controllers.AppWorkspace = new AppWorkspace(this.element.find(".ab-app-workspace"));
						},

						initEvents: function () {
							var self = this;

							self.controllers.AppList.element.on(self.CONST.APP_SELECTED, function (event, appId) {
								self.element.find(".ab-app-list").hide();

								self.controllers.AppWorkspace.setApplicationId(appId);
								self.element.find(".ab-app-workspace").show();
								self.controllers.AppWorkspace.resize(self.data.height);
							});
						},

						resize: function (data) {
							this._super(data);
							this.data.height = data.height;

							this.controllers.AppList.resize(data.height);
							this.controllers.AppWorkspace.resize(data.height);
						}

					});

				});
		});

	});