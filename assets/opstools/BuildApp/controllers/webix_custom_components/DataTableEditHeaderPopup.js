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

		var menuItems = {
			// Normally all items are available
			'default': [
				{ command: labels.hideField, icon: "fa-columns" },
				{ command: labels.filterField, icon: "fa-filter" },
				{ command: labels.sortField, icon: "fa-sort" },
				{ command: labels.editField, icon: "fa-pencil-square-o" },
				{ command: labels.deleteField, icon: "fa-trash" }
			],
			// But for imported objects, edit & delete are disabled
			'imported': [
				{ command: labels.hideField, icon: "fa-columns" },
				{ command: labels.filterField, icon: "fa-filter" },
				{ command: labels.sortField, icon: "fa-sort" },
				//{ command: labels.editField, icon: "fa-pencil-square-o" },
			]
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
					data: menuItems['default'],
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

				if (eventIds['onHeaderClick'] == null && dataTable) {
					eventIds['onHeaderClick'] = dataTable.attachEvent('onHeaderClick', function (id, e, trg) {
						// Ignore system columns
						if (id.column == 'appbuilder_approval_status' || id.column == 'appbuilder_trash')
							return;

						var columnConfig = dataTable.getColumnConfig(id.column);

						data.headerId = columnConfig.dataId;

						base.show(trg);
					});
				}
			},

			registerHeaderClick: function (headerClickHandler) {
				data.headerClickHandler = headerClickHandler;
			},

			/**
			 * Select the menu items from one of the defined groups.
			 * @param {string} [groupName]
			 *		'default' or 'imported'
			 */
			setMenuGroup: function (groupName) {
				groupName = groupName || 'default';
				$$(componentIds.editHeaderItems).clearAll();
				$$(componentIds.editHeaderItems).parse(menuItems[groupName]);
			}

		}, webix.ui.popup);


	}
);