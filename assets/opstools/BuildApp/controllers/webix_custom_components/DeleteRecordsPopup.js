steal(
	'opstools/BuildApp/controllers/utils/SelectivityHelper.js',
	function (selectivityHelper) {
		webix.protoUI({
			name: "delete_records_popup",
			$init: function (config) {
				webix.extend(this, webix.ProgressBar);
			},
			defaults: {
				modal: true,
				body: {
					rows: [
						{
							view: "label",
							label: "Do you want to delete these records?",
							width: 300,
						},
						{
							view: "template",
							height: 80,
							borderless: true,
							template: "<div class='ab-main-container ab-delete-records-checked-items'></div>"
						},
						{ height: 10 },
						{
							cols: [
								{
									view: "button", label: "Delete", type: "form", width: 120,
									click: function () {
										var delete_records_popup = this.getTopParentView();

										if (!delete_records_popup.dataCollection) {
											// TODO : Message
											return;
										}

										// Show loading cursor
										delete_records_popup.showProgress({ type: "icon" });

										var deleteTasks = [];

										delete_records_popup.dataCollection.AB.getCheckedItems().forEach(function (rowId) {
											var modelData = delete_records_popup.dataCollection.AD.getModel(rowId);

											deleteTasks.push(function (next) {
												modelData.destroy().then(function () {
													next();
												}, next);
											});
										});

										async.parallel(deleteTasks, function (err) {
											// Hide loading cursor
											delete_records_popup.hideProgress({ type: "icon" });

											if (err) {
												// TODO : Error message
											}
											else {
												delete_records_popup.hide();
											}
										});
									}
								},
								{
									view: "button", value: "Cancel", width: 100, click: function () {
										this.getTopParentView().hide();
									}
								}
							]
						}
					]
				},
				on: {
					onShow: function () {
						var delete_records_popup = this,
							delete_records_items = delete_records_popup.getChildViews()[0].getChildViews()[1];

						// Initial selectivity
						selectivityHelper.renderSelectivity(delete_records_items.$view, 'ab-delete-records-checked-items', true);

						// Show checked items in selectivity
						var checkedItems = [];
						delete_records_popup.dataCollection.AB.getCheckedItems().forEach(function (rowId) {
							var rowData = delete_records_popup.dataTable.getItem(rowId);

							checkedItems.push({
								id: rowId,
								text: delete_records_popup.objectModel.getDataLabel(rowData)
							});
						});
						selectivityHelper.setData($(delete_records_items.$view).find('.ab-delete-records-checked-items'), checkedItems);
					}
				}
			},
			objectModel_setter: function (objectModel) {
				this.objectModel = objectModel;
			},
			dataTable_setter: function (dataTable) {
				this.dataTable = dataTable;
			},
			dataCollection_setter: function (dataCollection) {
				this.dataCollection = dataCollection;
			},
			columns_setter: function (columns) {
				this.columns = columns;
			}

		}, webix.ui.popup);

		// Create instance of popup
		if ($$('ab-delete-records-popup') == null) {
			webix.ui({
				id: 'ab-delete-records-popup',
				view: "delete_records_popup",
			});
		}


	}
);