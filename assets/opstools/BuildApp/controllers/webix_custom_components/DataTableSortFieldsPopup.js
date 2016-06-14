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

							this.initMultilingualLabels();
							this.initWebixControls();
						},

						initMultilingualLabels: function () {
							var self = this;
							self.labels = {};
							self.labels.common = {};
							self.labels.sort_fields = {};

							self.labels.sort_fields.addNewSort = AD.lang.label.getLabel('ab.sort_fields.addNewSort') || "Add new sort";
							self.labels.sort_fields.selectField = AD.lang.label.getLabel('ab.sort_fields.selectField') || "Please select field";

							self.labels.sort_fields.textAsc = AD.lang.label.getLabel('ab.sort_fields.textAsc') || "A -> Z";
							self.labels.sort_fields.textDesc = AD.lang.label.getLabel('ab.sort_fields.textDesc') || "Z -> A";
							self.labels.sort_fields.dateAsc = AD.lang.label.getLabel('ab.sort_fields.dateAsc') || "Before -> After";
							self.labels.sort_fields.dateDesc = AD.lang.label.getLabel('ab.sort_fields.dateDesc') || "After -> Before";
							self.labels.sort_fields.numberAsc = AD.lang.label.getLabel('ab.sort_fields.numberAsc') || "1 -> 9";
							self.labels.sort_fields.numberDesc = AD.lang.label.getLabel('ab.sort_fields.numberDesc') || "9 -> 1";
							self.labels.sort_fields.booleanAsc = AD.lang.label.getLabel('ab.sort_fields.booleanAsc') || "Checked -> Unchecked";
							self.labels.sort_fields.booleanDesc = AD.lang.label.getLabel('ab.sort_fields.booleanDesc') || "Unchecked -> Checked";
							
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
											view: "button", value: self.labels.sort_fields.addNewSort, click: function () {
												this.getTopParentView().addNewSort();
												this.getTopParentView().callChangeEvent();
											}
										}]
									},
									on: {
										onShow: function () {
											if ($$(self.componentIds.sortForm).getChildViews().length < 2) {
												$$(self.componentIds.sortForm).getTopParentView().addNewSort();
												this.getTopParentView().callChangeEvent();
											}
										}
									}
								},
								addNewSort: function (fieldId) {
									// Prevent duplicate fields
									var isExists = false;
									if (fieldId) {
										$$(self.componentIds.sortForm).getChildViews().forEach(function (v, index) {
											if (index >= $$(self.componentIds.sortForm).getChildViews().length - 1)
												return;

											if (fieldId == v.getChildViews()[0].getValue()) {
												isExists = true;
												return;
											}
										});

										// If field exists, it will not add new sort
										if (isExists)
											return;
									}

									var viewIndex = $$(self.componentIds.sortForm).getChildViews().length - 1;
									var fieldList = $$(self.componentIds.sortPopup).getFieldList(true);
									$$(self.componentIds.sortForm).addView({
										id: 'sort' + webix.uid(),
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

														if (!columnConfig)
															return;

														switch (columnConfig.filter_type) {
															case "text":
															case "list":
															case "multiselect":
																options = [
																	{ id: 'asc', value: self.labels.sort_fields.textAsc },
																	{ id: 'desc', value: self.labels.sort_fields.textDesc }];
																break;
															case "date":
																options = [
																	{ id: 'asc', value: self.labels.sort_fields.dateAsc },
																	{ id: 'desc', value: self.labels.sort_fields.dateDesc }];
																break;
															case "number":
																options = [
																	{ id: 'asc', value: self.labels.sort_fields.numberAsc },
																	{ id: 'desc', value: self.labels.sort_fields.numberDesc }];
																break;
															case "boolean":
																options = [
																	{ id: 'asc', value: self.labels.sort_fields.booleanAsc },
																	{ id: 'desc', value: self.labels.sort_fields.booleanDesc }];
																break;
														}

														sortInput.define('options', options);
														sortInput.refresh();

														$$(self.componentIds.sortPopup).refreshFieldList();
														$$(self.componentIds.sortPopup).sort();

														this.getTopParentView().callChangeEvent();
													}
												}
											},
											{
												view: "segmented", width: 200, options: [{ id: '', value: self.labels.sort_fields.selectField }],
												on: {
													onChange: function (newv, oldv) { // 'asc' or 'desc' values
														$$(self.componentIds.sortPopup).sort();
													}
												}
											},
											{
												view: "button", value: "X", width: 30, click: function () {
													$$(self.componentIds.sortForm).removeView(this.getParentView());
													$$(self.componentIds.sortPopup).refreshFieldList(true);
													$$(self.componentIds.sortPopup).sort();

													this.getTopParentView().callChangeEvent();
												}
											}
										]
									}, viewIndex);

									// Select field
									if (fieldId) {
										var fieldsCombo = $$(self.componentIds.sortForm).getChildViews()[viewIndex].getChildViews()[0];
										fieldsCombo.setValue(fieldId);
										this.getTopParentView().callChangeEvent();
									}
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

								refreshFieldList: function (ignoreRemoveViews) {
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
									if (!ignoreRemoveViews) {
										removeChildViews.forEach(function (cView, index) {
											$$(self.componentIds.sortForm).removeView(cView);
										});
									}

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

										if (columnId) {
											var columnConfig = self.dataTable.getColumnConfig(columnId);

											if (columnConfig) {
												columnOrders.push({
													name: columnConfig.id,
													order: order
												});
											}
										}
									});

									self.dataTable.sort(function (a, b) {
										var result = false;

										for (var i = 0; i < columnOrders.length; i++) {
											var column = columnOrders[i],
												aValue = a[column.name],
												bValue = b[column.name];

											if ($.isArray(aValue)) {
												aValue = $.map(aValue, function (item) { return item.text }).join(' ');
											}

											if ($.isArray(bValue)) {
												bValue = $.map(bValue, function (item) { return item.text }).join(' ');
											}

											if (aValue != bValue) {
												if (column.order == 'asc') {
													result = aValue > bValue ? 1 : -1;
												}
												else {
													result = aValue < bValue ? 1 : -1;
												}
												break;
											}
										}

										return result;
									});
								},

								callChangeEvent: function () {
									var conditionNumber = 0;
									$$(self.componentIds.sortForm).getChildViews().forEach(function (v, index) {
										if (index >= $$(self.componentIds.sortForm).getChildViews().length - 1)
											return;

										if (v.getChildViews()[0].getValue())
											conditionNumber++;
									});

									this.getTopParentView().callEvent('onChange', [conditionNumber]);
								}

							}, webix.ui.popup);
						}



					});
				})
		});
	}
);