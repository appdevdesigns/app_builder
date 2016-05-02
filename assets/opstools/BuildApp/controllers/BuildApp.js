
steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/BuildApp.css',
	'opstools/BuildApp/views/BuildApp/BuildApp.ejs',
	'opstools/BuildApp/controllers/AppList.js',
	function () {
		System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control',
				'OpsPortal/classes/OpsTool',
				'site/labels/opstool-BuildApp').then(function () {

					// Namespacing conventions:
					// AD.Control.OpsTool.extend('[ToolName]', [{ static },] {instance} );
					AD.Control.OpsTool.extend('BuildApp', {

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

							this.initDOM();
							this.initControllers();
						},



						initDOM: function () {

							this.element.html(can.view(this.options.templateDOM, {}));

						},


						initControllers: function () {

                            this.controllers = {};  // hold my controller references here.

                            var AppList = AD.Control.get('opstools.BuildApp.AppList');
                            this.controllers.AppList = new AppList(this.element);

						},

						resize: function (data) {

							this._super(data);

							this.controllers.AppList.resize(data.height);
						}

					});

				});
		});

	});