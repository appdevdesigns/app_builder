steal(
	// List your Controller's dependencies here:
	function () {
		var data = {},
			dataTable,
			componentIds = {
				editHeaderItems: 'ab-edit-header-items'
			},
			eventIds = {}, // { eventName: eventId }
			labels = {
				hideField: AD.lang.label.getLabel('ab.object.hideField') || "Hide field",
				filterField: AD.lang.label.getLabel('ab.object.filterField') || "Filter field",
				sortField: AD.lang.label.getLabel('ab.object.sortField') || "Sort field",
				editField: AD.lang.label.getLabel('ab.object.editField') || "Edit field",
				deleteField: AD.lang.label.getLabel('ab.object.deleteField') || "Delete field"
			};

		webix.protoUI({
			name: 'edit_header_popup',
			defaults: {
				width: 180,
				body: {
					id: componentIds.editHeaderItems,
					view: 'list',
					datatype: "json",
					autoheight: true,
					select: false,
					template: "<i class='fa #icon#' aria-hidden='true'></i> #command#",
					data: [
						{ command: labels.hideField, icon: "fa-columns" },
						{ command: labels.filterField, icon: "fa-filter" },
						{ command: labels.sortField, icon: "fa-sort" },
						{ command: labels.editField, icon: "fa-pencil-square-o" },
						{ command: labels.deleteField, icon: "fa-trash" }
					],
					on: {
						'onItemClick': function (timestamp, e, trg) {
							var columns = webix.toArray(dataTable.config.columns),
								headerField = $.grep(columns, function (c) {
									return c.dataId == data.headerId;
								})[0];

							if (data.headerClickHandler)
								data.headerClickHandler(trg.textContent.trim(), headerField);
						}
					}
				}
			},

			registerDataTable: function (dt) {
				var base = this;

				dataTable = dt;
				if (dataTable) {
					// Unsubscribe old event
					if (eventIds['onHeaderClick']) {
						dataTable.detachEvent(eventIds['onHeaderClick']);
						delete eventIds['onHeaderClick'];
					}

					eventIds['onHeaderClick'] = dataTable.attachEvent('onHeaderClick', function (id, e, trg) {
						if (id.column == 'appbuilder_trash') return; // Ignore trash column

						var columnConfig = dataTable.getColumnConfig(id.column);

						data.headerId = columnConfig.dataId;

						base.show(trg);
					});
				}
			},

			registerHeaderClick: function (headerClickHandler) {
				data.headerClickHandler = headerClickHandler;
			}
		}, webix.ui.popup);


	}
);