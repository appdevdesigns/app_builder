steal(
	// List your Controller's dependencies here:
	function () {
		System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control').then(function () {

					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.DynamicDataTable', {


						init: function (element, options) {
							var self = this;
							options = AD.defaults({
							}, options);
							this.options = options;

							// Call parent init
							this._super(element, options);

							this.additionalClassName = 'dynamic-datatable-view';

							this.initWebixControls();
						},

						initWebixControls: function () {
							var self = this;

							webix.protoUI({
								name: "dynamicdatatable",

								prependView: function (view) {
									var generatedView = webix.ui(view);
									generatedView.define('width', this.config.width + 2);

									if (!this.additionViews) this.additionViews = [];
									this.additionViews.push(generatedView);

									webix.html.addCss(generatedView.getNode(), self.additionalClassName);

									$(this.getNode().parentNode).prepend(generatedView.$view);

									generatedView.resize();
								},

								appendView: function (view) {
									var generatedView = webix.ui(view);
									generatedView.define('width', this.config.width + 2);

									if (!this.additionViews) this.additionViews = [];
									this.additionViews.push(generatedView);

									webix.html.addCss(generatedView.getNode(), self.additionalClassName);

									$(this.getNode().parentNode).append(generatedView.$view);

									generatedView.resize();
								},

								clearAdditionalView: function () {
									this.additionViews.forEach(function (view) {
										view.destructor();
									});
								}

							}, webix.ui.datatable);

						}
					});
				});
		});
	}
);