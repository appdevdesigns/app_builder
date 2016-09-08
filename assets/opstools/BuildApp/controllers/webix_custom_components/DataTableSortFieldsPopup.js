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
								name: 'sort_popup',
								$init: function (config) {
									//functions executed on component initialization
								},
								defaults: {
									width: 500,
									body: {
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
											var sort_popup = this,
												sort_form = sort_popup.getChildViews()[0];

											if (sort_form.getChildViews().length < 2) {
												sort_form.getTopParentView().addNewSort();
												sort_popup.callChangeEvent();
											}
										}
									}
								},
								addNewSort: function (fieldId) {
									// Prevent duplicate fields
									var sort_popup = this,
										sort_form = sort_popup.getChildViews()[0],
										isExists = false;

									if (fieldId) {
										sort_form.getChildViews().forEach(function (v, index) {
											if (index >= sort_form.getChildViews().length - 1)
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

									var viewIndex = sort_form.getChildViews().length - 1;
									var fieldList = sort_popup.getFieldList(true);
									sort_form.addView({
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

														sort_popup.refreshFieldList();
														sort_popup.sort();

														this.getTopParentView().callChangeEvent();
													}
												}
											},
											{
												view: "segmented", width: 200, options: [{ id: '', value: self.labels.sort_fields.selectField }],
												on: {
													onChange: function (newv, oldv) { // 'asc' or 'desc' values
														sort_popup.sort();
													}
												}
											},
											{
												view: "button", value: "X", width: 30, click: function () {
													sort_form.removeView(this.getParentView());
													sort_popup.refreshFieldList(true);
													sort_popup.sort();

													this.getTopParentView().callChangeEvent();
												}
											}
										]
									}, viewIndex);

									// Select field
									if (fieldId) {
										var fieldsCombo = sort_form.getChildViews()[viewIndex].getChildViews()[0];
										fieldsCombo.setValue(fieldId);
										this.getTopParentView().callChangeEvent();
									}
								},

								registerDataTable: function (dataTable) {
									var sort_popup = this,
										sort_form = this.getChildViews()[0];

									self.dataTable = dataTable;

									// Reset form
									sort_form.clear();
									sort_form.clearValidation();

									var cViews = [];
									var childViews = sort_form.getChildViews();
									for (var i = 0; i < childViews.length; i++) {
										if (i < childViews.length - 1)
											cViews.push(childViews[i]);
									}

									cViews.forEach(function (v) {
										sort_form.removeView(v);
									});
								},
								setFieldList: function (fieldList) {
									// We can remove it when we can get all column from webix datatable (include hidden fields)
									self.data.fieldList = fieldList;

									this.refreshFieldList();
								},
								getFieldList: function (excludeSelected) {
									var sort_popup = this,
										sort_form = this.getChildViews()[0],
										fieldList = [];

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
										var childViews = sort_form.getChildViews();
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
									var sort_popup = this,
										sort_form = sort_popup.getChildViews()[0],
										fieldList = sort_popup.getFieldList(false),
										selectedFields = [],
										removeChildViews = [];

									var childViews = sort_form.getChildViews();
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
											sort_form.removeView(cView);
										});
									}

									// Field list should not duplicate field items
									childViews = sort_form.getChildViews();
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
									var sort_popup = this,
										sort_form = sort_popup.getChildViews()[0],
										columnOrders = [];

									sort_form.getChildViews().forEach(function (cView, index) {
										if (sort_form.getChildViews().length - 1 <= index) // Ignore 'Add a sort' button
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
									var sort_popup = this,
										sort_form = sort_popup.getChildViews()[0],
										conditionNumber = 0;

									sort_form.getChildViews().forEach(function (v, index) {
										if (index >= sort_form.getChildViews().length - 1)
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