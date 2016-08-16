steal(
	// List your Controller's dependencies here:
	function () {
		System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control').then(function () {

					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.DataTableEditHeaderPopup', {
						init: function (element, options) {
							var self = this;
							options = AD.defaults({
							}, options);
							this.options = options;

							// Call parent init
							this._super(element, options);

							this.data = {};

							this.componentIds = {
								editHeaderItems: 'ab-edit-header-items'
							};

							this.initMultilingualLabels();
							this.initWebixControls();
						},

						initMultilingualLabels: function () {
							var self = this;
							self.labels = {};

							self.labels.hideField = AD.lang.label.getLabel('ab.object.hideField') || "Hide field";
							self.labels.filterField = AD.lang.label.getLabel('ab.object.filterField') || "Filter field";
							self.labels.sortField = AD.lang.label.getLabel('ab.object.sortField') || "Sort field";
							self.labels.editField = AD.lang.label.getLabel('ab.object.editField') || "Edit field";
							self.labels.deleteField = AD.lang.label.getLabel('ab.object.deleteField') || "Delete field";
						},

						initWebixControls: function () {
							var self = this;

							webix.protoUI({
								name: 'edit_header_popup',
								defaults: {
									width: 180,
									body: {
										id: self.componentIds.editHeaderItems,
										view: 'list',
										datatype: "json",
										autoheight: true,
										select: false,
										template: "<i class='fa #icon#' aria-hidden='true'></i> #command#",
										data: [
											{ command: self.labels.hideField, icon: "fa-columns" },
											{ command: self.labels.filterField, icon: "fa-filter" },
											{ command: self.labels.sortField, icon: "fa-sort" },
											{ command: self.labels.editField, icon: "fa-pencil-square-o" },
											{ command: self.labels.deleteField, icon: "fa-trash" }
										],
										on: {
											'onItemClick': function (timestamp, e, trg) {
												var columns = webix.toArray(self.dataTable.config.columns),
													headerField = $.grep(columns, function (c) {
														return c.dataId == self.data.headerId;
													})[0];

												if (self.data.headerClickHandler)
													self.data.headerClickHandler(trg.textContent.trim(), headerField);
											}
										}
									}
								},

								registerDataTable: function (dataTable) {
									var base = this;

									self.dataTable = dataTable;
									if (self.dataTable) {
										self.dataTable.attachEvent('onHeaderClick', function (id, e, trg) {
											var columnConfig = self.dataTable.getColumnConfig(id.column);
											self.setHeaderId(columnConfig.dataId);

											base.show(trg);
										});
									}
								},

								registerHeaderClick: function(headerClickHandler) {
									self.data.headerClickHandler = headerClickHandler;
								}
							}, webix.ui.popup);
						},

						setHeaderId: function(headerId) {
							this.data.headerId = headerId;
						}

					});
				});
		});
	}
);