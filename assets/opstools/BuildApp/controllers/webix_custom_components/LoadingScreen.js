steal(
	// List your Controller's dependencies here:
	function () {
		System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control').then(function () {

					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.LoadingScreen', {
						init: function (element, options) {
							var self = this;

							self.options = AD.defaults({
							}, options);

							// Call parent init
							self._super(element, options);

							self.initWebixControls();
						},

						initWebixControls: function () {

							webix.protoUI({
								name: "ab_loading_screen",
								$init: function (config) {
									webix.extend(this, webix.ProgressBar);
									webix.extend(this, webix.OverlayBox);
								},
								defaults: {
									modal: true,
									fullscreen: true,
									css: 'ab-loading-screen'
								},

								setPercentage: function (percentage) {
									this.showProgress({
										type: 'bottom',
										position: percentage || 0.001
									});
								},

								setMessage: function (message) {
									this.showOverlay(message || '');
								},

								start: function () {
									this.setPercentage();
									this.setMessage();

									this.show();
								},

								stop: function () {
									this.hideProgress();
									this.hideOverlay();
									this.hide();
								}
							}, webix.ui.popup);

						}

					});
				});
		});
	}
);