
steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/ModelList.js',
	'opstools/BuildApp/controllers/ModelWorkspace.js',
	function () {
        System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control').then(function () {

					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.ModelPage', {


						init: function (element, options) {
							var self = this;
							options = AD.defaults({
								selectedModelEvent: 'AB_Model.Selected'
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

							var ModelList = AD.Control.get('opstools.BuildApp.ModelList');
							var ModelWorkspace = AD.Control.get('opstools.BuildApp.ModelWorkspace');

							self.controllers.ModelList = new ModelList(self.element, { selectedModelEvent: self.options.selectedModelEvent });
							self.controllers.ModelWorkspace = new ModelWorkspace(self.element);
						},

						initWebixUI: function () {
							var self = this;

							var modelListUI = self.controllers.ModelList.getUIDefinition();
							var modelWorkspaceUI = self.controllers.ModelWorkspace.getUIDefinition();

							self.data.definition = {
								id: self.options.modelView,
								cols: [
									modelListUI,
									{ view: "resizer", autoheight: true },
									modelWorkspaceUI
								]
							};

						},

						initEvents: function () {
							var self = this;

							self.controllers.ModelList.on(self.options.selectedModelEvent, function (event, id) {
								self.controllers.ModelWorkspace.setModelId(id);
							});
						},

						getUIDefinition: function () {
							return this.data.definition;
						},

						setAppId: function (appId) {
							var self = this;

							self.controllers.ModelList.setAppId(appId);
						},

						resize: function (height) {
							var self = this;

							$$(self.options.modelView).define('height', height - 120);
							$$(self.options.modelView).adjust();
						}


					});

				});
		});

	});