steal(function () {
	var dataTable;

	var componentIds = {
		exportList: 'ab-export-data-list'
	};

	webix.protoUI({
		name: "export_data_popup",
		$init: function (config) {
		},
		defaults: {
			body: {
				rows: [
					{
						view: 'list',
						id: componentIds.exportList,
						width: 150,
						autoheight: true,
						select: false,
						data: [
							{ id: 'excel', label: 'Export to Excel' },
							{ id: 'csv', label: 'Export to CSV' }
						],
						template: '#label#',
						on: {
							onItemClick: function (id, e, node) {
								var columnsConfig = {};

								dataTable.config.columns.forEach(function (col) {
									if (col.id == 'appbuilder_trash')
										return;

									if (col.template) {
										columnsConfig[col.id] = {
											template: function (obj) { return obj[col.id]; }
										};
									}
									else {
										columnsConfig[col.id] = true;
									}
								});

								switch (id) {
									case 'excel':
										// Set path of xls.core.min.js and xlsx.core.min.js
										webix.cdn = "../js/webix";
										webix.toExcel(dataTable, {
											columns: columnsConfig,
											filterHTML: true
										});
										break;
									case 'csv':
										webix.csv.delimiter.cols = ",";
										webix.toCSV(dataTable, {
											columns: columnsConfig,
											filterHTML: true
										});
										break;
								}
							}
						}
					}
				]
			}
		},

		registerDataTable: function (dt) {
			dataTable = dt;
		}

	}, webix.ui.popup);

});