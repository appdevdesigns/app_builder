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

							self.componentIds = {
								loadingMessage: 'ab-loading-screen-message',
								buttonText: 'ab-loading-screen-button-message'
							};

							self.initWebixControls();
						},

						initWebixControls: function () {
							var self = this;

							webix.protoUI({
								name: "ab_loading_screen",
								$init: function (config) {
									webix.extend(this, webix.ProgressBar);
								},
								defaults: {
									modal: true,
									fullscreen: true,
									css: 'ab-loading-screen',
									body: {
										rows: [
											{
												id: self.componentIds.loadingMessage,
												view: 'template',
												css: 'ab-loading-message',
												template: ''
											},
											{
												id: self.componentIds.buttonText,
												view: 'button',
												css: 'ab-loading-button'
											}
										]
									}
								},

								setPercentage: function (percentage) {
									this.showProgress({
										type: 'bottom',
										position: percentage || 0.001
									});
								},

								setMessage: function (message) {
									$$(self.componentIds.loadingMessage).define('template', message || '');
									$$(self.componentIds.loadingMessage).refresh();
								},

								start: function () {
									this.setPercentage();
									this.setMessage();

									$$(self.componentIds.buttonText).hide();
									this.show();
								},

								stop: function () {
									this.hideProgress();

									this.setMessage('');
									this.hide();

									$$(self.componentIds.buttonText).setValue('');
									$$(self.componentIds.buttonText).refresh();
									$$(self.componentIds.buttonText).hide();
								},

								showFinishScreen: function (message, button_text) {
									var _this = this;

									_this.setMessage(message);
									$$(self.componentIds.buttonText).show();
									$$(self.componentIds.buttonText).setValue(button_text);
									$$(self.componentIds.buttonText).define('click', function () { _this.stop(); });
									$$(self.componentIds.buttonText).refresh();
								},

								showErrorScreen: function (message, button_text, retry) {
									this.setMessage(message);
									$$(self.componentIds.buttonText).show();
									$$(self.componentIds.buttonText).setValue(button_text);
									$$(self.componentIds.buttonText).define('click', retry);
									$$(self.componentIds.buttonText).refresh();
								}
							}, webix.ui.popup);

						}

					});
				});
		});
	}
);