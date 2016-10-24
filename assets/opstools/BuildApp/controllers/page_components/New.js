steal(
	// List your Controller's dependencies here:
	function () {
		var componentIds = {
			editView: 'ab-NEW-edit-view'
		};

		//Constructor
		var newComponent = function (application, viewId, componentId) {
			var events = {},
				data = {};

			// Set viewId to public
			this.viewId = viewId;
			this.editViewId = componentIds.editView;

			// Instance functions
			this.render = function (setting, editable, showAll, dataCollection) {
				var q = $.Deferred();
				q.resolve();
				return q;
			};

			this.getSettings = function () {
				return {};
			};

			this.populateSettings = function (setting, showAll) {
			};

			this.isRendered = function () {
				return data.isRendered === true;
			};

			this.onRender = function (renderFn) {
				events.render = renderFn;
			}

		};

		// Static functions
		newComponent.getInfo = function () {
			return {
				name: 'new', // name must be lower case characters
				icon: 'fa-th-NEW'
			};
		};

		newComponent.getView = function () {
			return {};
		};

		newComponent.getEditView = function () {
			return {};
		};

		newComponent.getPropertyView = function (componentManager) {
			return {};
		};

		newComponent.editStop = function () {
		};

		return newComponent;

	}
);