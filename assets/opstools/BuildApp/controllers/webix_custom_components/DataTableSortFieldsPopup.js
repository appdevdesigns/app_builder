steal(
	// List your Controller's dependencies here:
	function () {
		System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control').then(function () {

					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.DataTableSortFieldsPopup', {
						init: function (element, options) {
							var self = this;
							options = AD.defaults({
							}, options);
							this.options = options;

							// Call parent init
							this._super(element, options);

							this.componentIds = {
								sortPopup: 'ab-sort-popup',
								sortForm: 'ab-sort-form'
							};

							this.initWebixControls();
						},

						initWebixControls: function () {
							var self = this;

							webix.protoUI({
								id: self.componentIds.sortPopup,
								name: 'sort_popup',
								$init: function (config) {
									//functions executed on component initialization
								},
								defaults: {
									width: 500,
									body: {
										id: self.componentIds.sortForm,
										view: "form",
										autoheight: true,
										elements: [{
											view: "button", value: "Add a sort", click: function () {
												this.getTopParentView().addNewSort();
											}
										}]
									},
									on: {
										onShow: function () {
											if ($$(self.componentIds.sortForm).getChildViews().length < 2)
												$$(self.componentIds.sortForm).getTopParentView().addNewSort();
										}
									}
								},
								addNewSort: function () {
									var viewIndex = $$(self.componentIds.sortForm).getChildViews().length - 1;
									var fieldList = $$(self.componentIds.sortPopup).getFieldList(true);
									$$(self.componentIds.sortForm).addView({
										id: 's' + webix.uid(),
										cols: [
											{
												view: "combo",
												width: 220,
												options: fieldList,
												on: {
													"onChange": function (columnId) {
														var columnConfig = self.dataTable.getColumnConfig(columnId),
															sortInput = this.getParentView().getChildViews()[1],
															options = null;

														switch (columnConfig.filter_type) {
															case "text":
															case "list":
																options = [
																	{ id: 'asc', value: 'A -> Z' },
																	{ id: 'desc', value: 'Z -> A' }];
																break;
															case "date":
																options = [
																	{ id: 'asc', value: 'Before -> After' },
																	{ id: 'desc', value: 'After -> Before' }];
																break;
															case "number":
																options = [
																	{ id: 'asc', value: '1 -> 9' },
																	{ id: 'desc', value: '9 -> 1' }];
																break;
															case "boolean":
																options = [
																	{ id: 'asc', value: 'Checked -> Unchecked' },
																	{ id: 'desc', value: 'Unchecked -> Checked' }];
																break;
														}

														sortInput.define('options', options);
														sortInput.refresh();

														$$(self.componentIds.sortPopup).sort();
													}
												}
											},
											{
												view: "segmented", width: 200, options: [{ id: '', value: 'Please select field' }],
												on: {
													onChange: function (newv, oldv) {
														$$(self.componentIds.sortPopup).sort();
													}
												}
											},
											{
												view: "button", value: "X", width: 30, click: function () {
													$$(self.componentIds.sortForm).removeView(this.getParentView());
													$$(self.componentIds.sortPopup).sort();
												}
											}
										]
									}, viewIndex);
								},
								registerDataTable: function (dataTable) {
									self.dataTable = dataTable;

									// Reset form
									$$(self.componentIds.sortForm).clear();
									$$(self.componentIds.sortForm).clearValidation();

									var cViews = [];
									var childViews = $$(self.componentIds.sortForm).getChildViews();
									for (var i = 0; i < childViews.length; i++) {
										if (i < childViews.length - 1)
											cViews.push(childViews[i]);
									}

									cViews.forEach(function (v) {
										$$(self.componentIds.sortForm).removeView(v);
									});
								},

								getFieldList: function (excludeSelected) {
									var fieldList = [];

									if (!self.dataTable)
										return fieldList;

									// Get field header list
									self.dataTable.eachColumn(function (columnId) {
										var columnConfig = self.dataTable.getColumnConfig(columnId);
										if (columnConfig.header && columnConfig.header.length > 0 && columnConfig.header[0].text) {
											fieldList.push({
												id: columnId,
												value: $(columnConfig.header[0].text).text().trim()
											});
										}
									});

									// Remove selected field
									if (excludeSelected) {
										var cViews = $$(self.componentIds.sortForm).getChildViews();
										for (var i = 0; i < cViews.length - 1; i++) {
											var selectedValue = cViews[i].getChildViews()[0].getValue();
											if (selectedValue) {
												var removeItem = $.grep(fieldList, function (f) {
													return f.id == selectedValue;
												});
												fieldList.splice(removeItem, 1);
											}
										}
									}

									return fieldList;
								},

								sort: function () {
									var columnOrders = [];

									var cViews = $$(self.componentIds.sortForm).getChildViews();
									for (var i = 0; i < cViews.length - 1; i++) {
										var columnId = cViews[i].getChildViews()[0].getValue();
										var order = cViews[i].getChildViews()[1].getValue();

										var columnConfig = self.dataTable.getColumnConfig(columnId);
										columnOrders.push({
											name: columnConfig.id,
											order: order
										});
									}

									self.dataTable.sort(function (a, b) {
										var result = false;

										for (var i = 0; i < columnOrders.length; i++) {
											var column = columnOrders[i];
											
											if (a[column.name] != b[column.name]) {
												if (column.order == 'asc') {
													result = a[column.name] > b[column.name] ? 1 : -1;
												}
												else {
													result = a[column.name] < b[column.name] ? 1 : -1;
												}
												break;
											}
										}

										return result;
									});
								}
							}, webix.ui.popup);
						}



					});
				})
		});
	}
);