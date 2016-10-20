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
			var component = components.filter(function (f) { return f.name == name });

			if (component && component.length > 0)
				return component[0];
			else
				return null;
		}

		return {

		};
	}
);