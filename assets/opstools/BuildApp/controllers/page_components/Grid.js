steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/models/ABObject.js',
	'opstools/BuildApp/models/ABColumn.js',

	'opstools/BuildApp/controllers/webix_custom_components/ActiveList.js',

	'opstools/BuildApp/controllers/ObjectDataTable.js',
	function () {
        System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control').then(function () {

					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.Components.Grid', {

						init: function (element, options) {
							var self = this;

							self.data = {};
							self.data.visibleColumns = []; // [columnId1, ..., columnIdn]
							self.info = {
								name: 'Grid',
								icon: 'fa-table'
							};

							// Model
							self.Model = {
								ABObject: AD.Model.get('opstools.BuildApp.ABObject'),
								ABColumn: AD.Model.get('opstools.BuildApp.ABColumn')
							};

							// Controllers
							var ActiveList = AD.Control.get('opstools.BuildApp.ActiveList'),
								ObjectDataTable = AD.Control.get('opstools.BuildApp.ObjectDataTable');

							self.controllers = {
								ObjectDataTable: new ObjectDataTable()
							};

							self.componentIds = {
								editView: self.info.name + '-edit-view',
								editDataTable: 'ab-datatable-edit-mode',

								columnList: 'ab-datatable-columns-list',

								propertyView: self.info.name + '-property-view'
							};

							self.view = {
								view: "datatable",
								autoheight: true,
								datatype: "json"
							};

							self.getView = function () {
								return self.view;
							};

							self.getEditView = function () {
								var dataTable = $.extend(true, {}, self.getView());
								dataTable.id = self.componentIds.editDataTable;

								var editView = {
									id: self.componentIds.editView,
									padding: 10,
									rows: [
										dataTable,
										{
											view: 'label',
											label: 'Columns list'
										},
										{
											id: self.componentIds.columnList,
											view: 'activelist',
											template: "<div class='ab-page-grid-column-item'>" +
											"<div class='column-checkbox'>{common.markCheckbox()}</div>" +
											"<div class='column-name'>#label#</div>" +
											"</div>",
											activeContent: {
												markCheckbox: {
													view: "checkbox",
													width: 50,
													on: { /*checkbox onChange handler*/
														'onChange': function (newv, oldv) {
															var item_id = this.config.$masterId;

															if (this.getValue()) // Check
																self.data.visibleColumns.push(item_id);
															else // Uncheck
															{
																var index = self.data.visibleColumns.indexOf(item_id);
																if (index > -1)
																	self.data.visibleColumns.splice(index, 1);
															}

															self.renderDataTable();
														}
													}
												}
											}
										}
									]
								};

								return editView;
							};

							self.getPropertyView = function () {
								return {
									view: "property",
									select: false,
									id: self.componentIds.propertyView,
									elements: [
										{ label: "Data source", type: "label" },
										{
											id: 'object',
											name: 'object',
											type: "select",
											label: "Object",
											template: function (data, dataValue) {
												var selectedData = $.grep(data.options, function (opt) { return opt.id == dataValue; });
												if (selectedData && selectedData.length > 0)
													return selectedData[0].value;
												else
													return "[Select]";
											}
										},
										// { label: "Data table", type: "label" },
										// { label: "Editable", type: "checkbox" }, // TODO
										// { label: "Remove column", type: "checkbox" }, // TODO
										// { label: "Add new row", type: "checkbox" }  // TODO
									],
									on: {
										onAfterEditStop: function (state, editor, ignoreUpdate) {
											if (ignoreUpdate || state.old == state.value) return false;

											switch (editor.id) {
												case 'object':
													self.bindColumnList(state.value);
													break;
											}
										}
									}
								};
							};

							self.getSettings = function () {
								var propertyValues = $$(self.componentIds.propertyView).getValues(),
									columns = $.map($$(self.componentIds.editDataTable).config.columns, function (c) {
										return {
											id: c.id,
											dataId: c.dataId,
											label: c.label,
											header: c.header,
											weight: c.weight,
											editor: c.editor,
											filter_type: c.filter_type,
											linkToObject: c.linkToObject
										};
									});

								var settings = {
									object: propertyValues.object,
									columns: columns
								};

								return settings;
							}

							self.populateSettings = function (settings) {
								webix.extend($$(self.componentIds.columnList), webix.ProgressBar);

								// Register dataTable to data table util
								self.controllers.ObjectDataTable.registerDataTable($$(self.componentIds.editDataTable));

								$$(self.componentIds.editDataTable).clearAll();
								self.controllers.ObjectDataTable.bindColumns([], true);
								self.data.visibleColumns = [];
								if (settings.columns) {
									self.data.visibleColumns = $.map(settings.columns, function (c) { return c.dataId; });
								}

								if (settings.appId) {
									// Get object list
									self.Model.ABObject.findAll({ application: settings.appId })
										.fail(function (err) { })
										.then(function (result) {
											result.forEach(function (o) {
												if (o.translate)
													o.translate();
											});

											self.data.objects = result;

											var item = $$(self.componentIds.propertyView).getItem('object');
											item.options = $.map(result.attr(), function (o) {
												return {
													id: o.id,
													value: o.label
												};
											});

											self.bindColumnList(settings.object);
										});
								}

								// Properties
								$$(self.componentIds.propertyView).setValues({
									object: settings.object
								});
								$$(self.componentIds.propertyView).refresh();
							};

							self.renderDataTable = function () {
								var visibleColumns = self.data.columns.filter(function (c) {
									return self.data.visibleColumns.filter(function (v) { return v == c.id }).length > 0;
								});

								self.controllers.ObjectDataTable.bindColumns(visibleColumns, true);
							};

							self.bindColumnList = function (objectId) {
								$$(self.componentIds.columnList).clearAll();

								if (!objectId) return;

								$$(self.componentIds.columnList).showProgress({ type: 'icon' });

								self.Model.ABColumn.findAll({ object: objectId })
									.fail(function (err) {
										$$(self.componentIds.columnList).hideProgress();
									})
									.then(function (data) {
										data.forEach(function (d) {
											if (d.translate) d.translate();
										});

										self.data.columns = data;

										// Initial checkbox
										var data = data.attr();
										data.forEach(function (d) {
											d.markCheckbox = self.data.visibleColumns.filter(function (c) { return c == d.id; }).length > 0;
										});

										$$(self.componentIds.columnList).parse(data);
										$$(self.componentIds.columnList).hideProgress();

										self.renderDataTable();
									});
							};

							self.editStop = function () {
								$$(self.componentIds.propertyView).editStop();
							};
						},

						getInstance: function () {
							return this;
						}


					});

				});
		});
	}
);