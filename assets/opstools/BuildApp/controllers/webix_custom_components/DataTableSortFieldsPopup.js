steal(
	// List your Controller's dependencies here:
	function () {
		var componentIds = {
			sortForm: 'ab-sort-form'
		},
			labels = {
				sort_fields: {
					addNewSort: AD.lang.label.getLabel('ab.addNewSort') || "Add new sort",
					selectField: AD.lang.label.getLabel('ab.selectField') || "Please select field",

					textAsc: AD.lang.label.getLabel('ab.textAsc') || "A -> Z",
					textDesc: AD.lang.label.getLabel('ab.textDesc') || "Z -> A",
					dateAsc: AD.lang.label.getLabel('ab.dateAsc') || "Before -> After",
					dateDesc: AD.lang.label.getLabel('ab.dateDesc') || "After -> Before",
					numberAsc: AD.lang.label.getLabel('ab.numberAsc') || "1 -> 9",
					numberDesc: AD.lang.label.getLabel('ab.numberDesc') || "9 -> 1",
					booleanAsc: AD.lang.label.getLabel('ab.booleanAsc') || "Checked -> Unchecked",
					booleanDesc: AD.lang.label.getLabel('ab.booleanDesc') || "Unchecked -> Checked"
				}
			};

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
						view: "button", value: labels.sort_fields.addNewSort, click: function () {
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

			dataTable_setter: function (dataTable) {
				var sort_popup = this;

				if (sort_popup.dataTable && sort_popup.dataTable.config.id == dataTable.config.id) return;

				sort_popup.dataTable = dataTable;

				// Reset form
				var sort_form = this.getChildViews()[0];
				sort_form.clear();
				sort_form.clearValidation();

				// Clear children views
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

			columns_setter: function (fieldList) {
				var sort_popup = this;

				// We can remove it when we can get all column from webix datatable (include hidden fields)
				sort_popup.fieldList = fieldList;

				sort_popup.refreshFieldList();
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
									var columnConfig = sort_popup.dataTable.getColumnConfig(columnId),
										sortInput = this.getParentView().getChildViews()[1],
										options = null;

									if (!columnConfig)
										return;

									switch (columnConfig.filter_type) {
										case "text":
										case "list":
										case "multiselect":
											options = [
												{ id: 'asc', value: labels.sort_fields.textAsc },
												{ id: 'desc', value: labels.sort_fields.textDesc }];
											break;
										case "date":
											options = [
												{ id: 'asc', value: labels.sort_fields.dateAsc },
												{ id: 'desc', value: labels.sort_fields.dateDesc }];
											break;
										case "number":
											options = [
												{ id: 'asc', value: labels.sort_fields.numberAsc },
												{ id: 'desc', value: labels.sort_fields.numberDesc }];
											break;
										case "boolean":
											options = [
												{ id: 'asc', value: labels.sort_fields.booleanAsc },
												{ id: 'desc', value: labels.sort_fields.booleanDesc }];
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
							view: "segmented", width: 200, options: [{ id: '', value: labels.sort_fields.selectField }],
							on: {
								onChange: function (newv, oldv) { // 'asc' or 'desc' values
									sort_popup.sort();
								}
							}
						},
						{
							view: "button", icon: "trash", type: "icon", width: 30, click: function () {
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

			getFieldList: function (excludeSelected) {
				var sort_popup = this,
					sort_form = this.getChildViews()[0],
					fieldList = [];

				if (!sort_popup.dataTable)
					return fieldList;

				// Get all columns include hidden fields
				if (sort_popup.fieldList) {
					sort_popup.fieldList.forEach(function (f) {
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
						var columnConfig = sort_popup.dataTable.getColumnConfig(columnId);

						if (columnConfig) {
							columnOrders.push({
								name: columnConfig.id,
								order: order
							});
						}
					}
				});

				sort_popup.dataTable.sort(function (a, b) {
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

				this.getTopParentView().callEvent('onChange', [sort_popup.dataTable.config.id, conditionNumber]);
			}

		}, webix.ui.popup);

		// Create instance of popup
		if ($$('ab-sort-popup') == null) {
			webix.ui({
				id: 'ab-sort-popup',
				view: 'sort_popup'
			}).hide();
		}

	}
);