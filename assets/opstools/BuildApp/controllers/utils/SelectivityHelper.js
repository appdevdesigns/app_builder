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
				placeholder: AD.lang.label.getLabel('ab.object.noConnectedData') || ""
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
				var copied = data.slice();
				copied = copied.filter(function (d) { return d.id; });
				copied = $.map(copied, function (d) {
					if (!d.text) d.text = '[ID: #id#]'.replace('#id#', d.id);
					return d;
				});
				node.selectivity('data', copied);
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