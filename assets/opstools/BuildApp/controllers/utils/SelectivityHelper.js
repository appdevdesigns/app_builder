steal(function () {
	var events = {};

	return {
		renderSelectivity: function (parentView, cssClass, readOnly) {
			var self = this;

			// Initial multi-combo
			$(parentView.$view).find('.' + cssClass).selectivity('destroy');
			$(parentView.$view).find('.' + cssClass).selectivity({
				allowClear: true,
				multiple: true,
				removeOnly: true,
				readOnly: readOnly || false,
				showDropdown: false,
				showSearchInputInDropdown: false,
				placeholder: AD.lang.label.getLabel('ab.object.noConnectedData') || "No data selected"
			}).on('change', function (ev) {
				// Trigger event
				if (events.selectItem)
					events.selectItem({
						event: ev,
						itemNode: $(this)
					});
			});
		},

		setData: function (node, data) {
			if (node.selectivity) {
				node.selectivity('data', data.filter(function (d) { return d.id && d.text; }));
			}
		},

		getData: function (node) {
			if (node.selectivity)
				return node.selectivity('data');
			else
				return null;
		},

		onSelectItem: function (selectItemEvent) {
			events.selectItem = selectItemEvent;
		}
	};
});