steal(function () {
	return {
		renderSelectivity: function (node, cssClass, readOnly) {
			var self = this;

			if (!(node instanceof jQuery)) node = $(node);

			// Initial multi-combo
			node.find('.' + cssClass).selectivity('destroy');
			node.find('.' + cssClass).selectivity({
				allowClear: true,
				multiple: true,
				removeOnly: true,
				readOnly: readOnly || false,
				showDropdown: false,
				showSearchInputInDropdown: false,
				placeholder: AD.lang.label.getLabel('ab.object.noConnectedData') || "No data selected"
			}).on('change', function (ev) {
				// Trigger event
				$(self).trigger('change', {
					event: ev,
					itemNode: $(this)
				});
			});
		},

		setData: function (node, data) {
			if (!(node instanceof jQuery)) node = $(node);

			if (node.selectivity) {
				node.selectivity('data', data.filter(function (d) { return d.id && d.text; }));
			}
		},

		getData: function (node) {
			if (!(node instanceof jQuery)) node = $(node);

			if (node.selectivity)
				return node.selectivity('data');
			else
				return null;
		}

	};
});