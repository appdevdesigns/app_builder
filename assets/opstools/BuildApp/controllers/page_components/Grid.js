steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/models/ABObject.js',
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
							self.info = {
								name: 'Grid',
								icon: 'fa-table'
							};

							self.Model = AD.Model.get('opstools.BuildApp.ABObject');

							self.componentIds = {
								editDataTable: 'ab-datatable-edit-mode',

								columnList: 'ab-datatable-columns-list'
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
									id: self.info.name + '-edit-view',
									padding: 10,
									rows: [
										dataTable,
										{
											view: 'label',
											label: 'Columns list'
										},
										{
											id: self.componentIds.columnList,
											view: 'list',
											template: "<div class='ab-column-item'>" +
											"{common.checkbox()} #label#" +
											"</div>",
											on: {
												onItemCheck: function () {
													// $$(self.componentIds.editMenu).clearAll();

													// $$(self.componentIds.pageTree).getChecked().forEach(function (pageId) {
													// 	var item = $$(self.componentIds.pageTree).getItem(pageId);

													// 	$$(self.componentIds.editMenu).add({
													// 		id: pageId,
													// 		value: item.label
													// 	}, $$(self.componentIds.editMenu).count());
													// });
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
									id: self.info.name + '-property-view',
									elements: [
										{
											id: 'datasource',
											type: "select",
											label: "Data sources"
										},
									],
									on: {
										onLiveEdit: function (state, editor, ignoreUpdate) {
											console.log(state, editor, ignoreUpdate);
										}
									}
								};
							};

							self.getSettings = function () {
								return null;
							}

							self.populateSettings = function (settings) {
								if (settings.appId) {
									// Get object list
									self.Model.findAll({ application: settings.appId })
										.fail(function (err) { })
										.then(function (result) {
											result.forEach(function (o) {
												if (o.translate)
													o.translate();
											});

											self.data.objects = result;

											var item = $$(self.info.name + '-property-view').getItem('datasource');
											item.options = $.map(result.attr(), function (o) {
												return {
													id: o.id,
													value: o.label
												};
											});
											$$(self.info.name + '-property-view').updateItem('datasource');
										});
								}
							};

							self.editStop = function () {
								$$(self.info.name + '-property-view').editStop();
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