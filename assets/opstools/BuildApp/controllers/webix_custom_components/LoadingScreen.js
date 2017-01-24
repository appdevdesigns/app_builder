steal(
	// List your Controller's dependencies here:
	function () {
		var componentIds = {
			loadingMessage: 'ab-loading-screen-message',
			buttonText: 'ab-loading-screen-button-message',
			cancelButton: 'ab-loading-screen-cancel-button'
		};

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
							id: componentIds.loadingMessage,
							view: 'template',
							css: 'ab-loading-message',
							template: ''
						},
						{
							id: componentIds.buttonText,
							view: 'button',
							css: 'ab-loading-button'
						},
						{
							id: componentIds.cancelButton,
							view: "template",
							borderless: true,
							autoheight: true,
							hidden: true,
							css: 'ab-loading-cancel-button',
							template: "<a class='ab-loading-cancel-item'>#CancelText#</a>".replace('#CancelText#', 'Cancel'),
							onClick: {
								'ab-loading-cancel-item': function () {
									this.getTopParentView().hide();
								}
							}
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
				$$(componentIds.loadingMessage).define('template', message || '');
				$$(componentIds.loadingMessage).refresh();
			},

			start: function () {
				this.setPercentage();
				this.setMessage();

				$$(componentIds.buttonText).hide();
				$$(componentIds.cancelButton).hide();
				this.show();
			},

			stop: function () {
				this.hideProgress();

				this.setMessage('');
				this.hide();

				$$(componentIds.buttonText).setValue('');
				$$(componentIds.buttonText).refresh();
				$$(componentIds.buttonText).hide();

				$$(componentIds.cancelButton).hide();
			},

			showFinishScreen: function (message, button_text) {
				var _this = this;

				_this.setMessage(message);
				$$(componentIds.buttonText).show();
				$$(componentIds.buttonText).setValue(button_text);
				$$(componentIds.buttonText).define('click', function () { _this.stop(); });
				$$(componentIds.buttonText).refresh();

				$$(componentIds.cancelButton).hide();
			},

			showErrorScreen: function (message, button_text, retry) {
				this.setMessage(message);
				$$(componentIds.buttonText).show();
				$$(componentIds.buttonText).setValue(button_text);
				$$(componentIds.buttonText).define('click', retry);
				$$(componentIds.buttonText).refresh();

				$$(componentIds.cancelButton).show();
			}
		}, webix.ui.popup);

	}
);