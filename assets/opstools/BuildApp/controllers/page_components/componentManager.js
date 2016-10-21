steal(
	'opstools/BuildApp/controllers/page_components/menu.js',
	'opstools/BuildApp/controllers/page_components/grid.js',
	'opstools/BuildApp/controllers/page_components/form.js',
	'opstools/BuildApp/controllers/page_components/view.js',
	function () {
		var self = this;

		// convert the provided objects into a [components]
		var components = $.map(arguments, function (component, index) { return [component]; });

		// Listen 'render' complete event
		components.forEach(function (field) {
			$(field).on('render', function (event, data) {
				$(self).trigger('render', {
					// TODO
				});
			});
		});

		/**
		 * getField()
		 *
		 * return the Component object by it's name.
		 *
		 * @param {string} name  The unique key to lookup the Component
		 * @return {Component} or null.
		 */
		function getComponent(name) {
			var component = components.filter(function (comp) { return comp.getInfo && comp.getInfo().name.trim().toLowerCase() == name.trim().toLowerCase() });

			if (component && component.length > 0)
				return component[0];
			else
				return null;
		}

		return {
			getAllComponents: function () {
				return components;
			},

			getInfo: function (name) {
				var component = getComponent(name);
				if (!component) return null;

				return component.getInfo();
			},

			getView: function (name) {
				var component = getComponent(name);
				if (!component) return null;

				return component.getView();
			},

			getEditView: function (name) {
				var component = getComponent(name);
				if (!component) return null;

				return component.getEditView();
			},

			getPropertyView: function (name, application, page) {
				var component = getComponent(name);
				if (!component) return null;

				return component.getPropertyView(application, page);
			},

			render: function (application, page, name, viewId, componentId, setting, editable, showAll, dataCollection, linkedDataCollection, forceRender) {
				if ($$(viewId).isRendered && !forceRender) return;

				var component = getComponent(name);
				if (!component) return;

				component.render(application, page, viewId, componentId, setting, editable, showAll, dataCollection, linkedDataCollection);

				$$(viewId).isRendered = true;
			},

			getSettings: function (name) {
				var component = getComponent(name);
				if (!component) return null;

				return component.getSettings();
			},

			populateSettings: function (name, application, page, item, getDataCollectionFn, selectAll) {
				var component = getComponent(name);
				if (!component) return;

				component.populateSettings(application, page, item, getDataCollectionFn, selectAll);
			},

			editStop: function (name) {
				var component = getComponent(name);
				if (!component) return;

				if (component.editStop)
					component.editStop();
			},

			resetState: function () {
				var component = getComponent(name);
				if (!component) return;

				if (component.resetState)
					component.resetState();
			},

			resize: function (height) {
				var component = getComponent(name);
				if (!component) return;

				if (component.resize)
					component.resize(height);
			},

			isRendered: function (viewId) {
				return $$(viewId).isRendered === true;
			}

		};
	}
);