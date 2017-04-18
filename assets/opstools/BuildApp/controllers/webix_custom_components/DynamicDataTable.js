steal(
	// List your Controller's dependencies here:
	function () {
		var additionalClassName = 'dynamic-datatable-view';

		webix.protoUI({
			name: "dynamicdatatable",

			prependView: function (view, ignoreAutoWidth) {
				var generatedView = webix.ui(view);
				if (this.config.width > generatedView.config.width && !ignoreAutoWidth)
					generatedView.define('minWidth', this.config.width + 2);

				if (!this.additionViews) this.additionViews = [];
				this.additionViews.push(generatedView);

				webix.html.addCss(generatedView.getNode(), additionalClassName);

				$(this.getNode().parentNode).prepend(generatedView.$view);

				generatedView.resize();
			},

			appendView: function (view, ignoreAutoWidth) {
				var generatedView = webix.ui(view);
				if (this.config.width > generatedView.config.width && !ignoreAutoWidth)
					generatedView.define('minWidth', this.config.width + 2);

				if (!this.additionViews) this.additionViews = [];
				this.additionViews.push(generatedView);

				webix.html.addCss(generatedView.getNode(), additionalClassName);

				$(this.getNode().parentNode).append(generatedView.$view);

				generatedView.resize();
			},

			clearAdditionalView: function () {
				if (this.additionViews) {
					this.additionViews.forEach(function (view) {
						view.destructor();
					});
				}
			}

		}, webix.ui.datatable);

	}
);