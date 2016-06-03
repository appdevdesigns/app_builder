
steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/ObjectList.js',
	'opstools/BuildApp/controllers/ObjectWorkspace.js',
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
								updatedObjectEvent: 'AB_Object.Updated'
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

							var ObjectList = AD.Control.get('opstools.BuildApp.ObjectList');
							var ObjectWorkspace = AD.Control.get('opstools.BuildApp.ObjectWorkspace');

							self.controllers.ObjectList = new ObjectList(self.element, { selectedObjectEvent: self.options.selectedObjectEvent, updatedObjectEvent: self.options.updatedObjectEvent });
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
								self.controllers.ObjectWorkspace.setObjectId(id);
							});

							self.controllers.ObjectList.on(self.options.updatedObjectEvent, function (event, data) {
								self.controllers.ObjectWorkspace.setObjectList(data.objectList);
							});
						},

						getUIDefinition: function () {
							return this.data.definition;
						},

						setAppId: function (appId) {
							var self = this;

							self.controllers.ObjectWorkspace.resetState();
							self.controllers.ObjectList.resetState();
							self.controllers.ObjectList.setAppId(appId);
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