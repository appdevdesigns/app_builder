steal(
	'opstools/BuildApp/controllers/page_components/menu.js',
	'opstools/BuildApp/controllers/page_components/grid.js',
	'opstools/BuildApp/controllers/page_components/form.js',
	'opstools/BuildApp/controllers/page_components/view.js',
	'opstools/BuildApp/controllers/page_components/link.js',
	function (dataCollectionHelper) {
		var componentManager = function () { };

		// convert the provided objects into a [components]
		var components = $.map(arguments, function (component, index) {
			// Override getEditView function to pass the componentManager parameter. 
			if (component.getEditView)
				component.getEditView = component.getEditView.bind(component.getEditView, componentManager);

			// Override getPropertyView function to pass the componentManager parameter. 
			if (component.getPropertyView)
				component.getPropertyView = component.getPropertyView.bind(component.getPropertyView, componentManager);

			return [component];
		});

		componentManager.getAllComponents = function () {
			return components;
		};

		/**
		 getComponent()
		 *
		 * return the Component object by it's name.
		 *
		 * @param {string} name  The unique key to lookup the Component
		 * @return {Component} or null.
		 */
		componentManager.getComponent = function (name) {
			if (!name) return null;

			var component = components.filter(function (comp) {
				return comp.getInfo && comp.getInfo().name.trim().toLowerCase() == name.trim().toLowerCase();
			});

			if (component && component.length > 0) {
				return component[0];
			}
			else
				return null;
		};

		componentManager.setEditInstance = function (editInstance) {
			if (editInstance.editViewId) {
				// Clone component instance
				var copyInstance = $.extend(true, {}, editInstance);

				// Change view id
				copyInstance.viewId = editInstance.editViewId;

				componentManager.editInstance = copyInstance;
			}
			else {
				componentManager.editInstance = editInstance;
			}
		};

		componentManager.editStop = function () {
			components.forEach(function (comp) {
				if (comp.editStop)
					comp.editStop();
				else {
					var compInfo = comp.getInfo();
					if (compInfo.propertyView && $$(compInfo.propertyView) && $$(compInfo.propertyView).editStop) {
						$$(compInfo.propertyView).editStop();
					}
				}
			});
		};

		componentManager.resize = function (height) {
			components.forEach(function (comp) {
				if (comp.resize)
					comp.resize(height);
			});
		};

		return componentManager;
	}
);