steal(
	// List your Controller's dependencies here:
	function () {
        System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control').then(function () {

					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.Components.New', {

						init: function (element, options) {
							var self = this;

							self.data = {};
							self.info = {
								name: 'ComponentName',
								icon: 'fa-icon'
							};

							self.getView = function () {
								return null;
							};

							self.getEditView = function () {
								return null;
							};

							self.getPropertyView = function () {
								return null;
							};

							self.render = function (viewId, settings) {
							};

							self.getSettings = function () {
								return null;
							};

							self.populateSettings = function (settings) {
							};

							self.editStop = function () {
							};

						},

						getInstance: function () {
							return this;
						}

					});

				});
		});
	}
);