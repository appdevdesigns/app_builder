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

							this.data = {};

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

														$$(self.componentIds.sortPopup).refreshFieldList();
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
													$$(self.componentIds.sortPopup).refreshFieldList();
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
								setFieldList: function (fieldList) {
									// We can remove it when we can get all column from webix datatable (include hidden fields)
									self.data.fieldList = fieldList;

									this.refreshFieldList();
								},
								getFieldList: function (excludeSelected) {
									var fieldList = [];

									if (!self.dataTable)
										return fieldList;

									// Get all columns include hidden fields
									if (self.data.fieldList) {
										self.data.fieldList.forEach(function (f) {
											if (f.setting.filter_type) {
												fieldList.push({
													id: f.name,
													value: f.label
												});
											}
										});
									}

									// Remove selected field
									if (excludeSelected) {
										var childViews = $$(self.componentIds.sortForm).getChildViews();
										if (childViews.length > 1) { // Ignore 'Add new sort' button
											childViews.forEach(function (cView, index) {
												if (childViews.length - 1 <= index)
													return false;

												var selectedValue = cView.getChildViews()[0].getValue();
												if (selectedValue) {
													var removeIndex = null;
													var removeItem = $.grep(fieldList, function (f, index) {
														if (f.id == selectedValue) {
															removeIndex = index;
															return true;
														}
														else {
															return false;
														}
													});
													fieldList.splice(removeIndex, 1);
												}
											});
										}
									}

									return fieldList;
								},

								refreshFieldList: function () {
									var fieldList = this.getFieldList(false),
										selectedFields = [],
										removeChildViews = [];

									var childViews = $$(self.componentIds.sortForm).getChildViews();
									if (childViews.length > 1) { // Ignore 'Add new sort' button
										childViews.forEach(function (cView, index) {
											if (childViews.length - 1 <= index)
												return false;

											var fieldId = cView.getChildViews()[0].getValue(),
												fieldObj = $.grep(fieldList, function (f) { return f.id == fieldId });

											if (fieldObj.length > 0) {
												// Add selected field to list
												selectedFields.push(fieldObj[0]);
											}
											else {
												// Add condition to remove
												removeChildViews.push(cView);
											}
										});
									}

									// Remove filter conditions when column is deleted
									removeChildViews.forEach(function (cView, index) {
										$$(self.componentIds.sortForm).removeView(cView);
									});

									// Field list should not duplicate field items
									childViews = $$(self.componentIds.sortForm).getChildViews();
									if (childViews.length > 1) { // Ignore 'Add new sort' button
										childViews.forEach(function (cView, index) {
											if (childViews.length - 1 <= index)
												return false;

											var fieldId = cView.getChildViews()[0].getValue(),
												fieldObj = $.grep(fieldList, function (f) { return f.id == fieldId });

											var selectedFieldsExcludeCurField = $(selectedFields).not(fieldObj);

											var enableFields = $(fieldList).not(selectedFieldsExcludeCurField).get();

											// Update field list
											cView.getChildViews()[0].define('options', enableFields);
											cView.getChildViews()[0].refresh();
										});
									}
								},

								sort: function () {
									var columnOrders = [];

									$$(self.componentIds.sortForm).getChildViews().forEach(function (cView, index) {
										if ($$(self.componentIds.sortForm).getChildViews().length - 1 <= index) // Ignore 'Add a sort' button
											return;

										var columnId = cView.getChildViews()[0].getValue();
										var order = cView.getChildViews()[1].getValue();

										var columnConfig = self.dataTable.getColumnConfig(columnId);
										columnOrders.push({
											name: columnConfig.id,
											order: order
										});
									});

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