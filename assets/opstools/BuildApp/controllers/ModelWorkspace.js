
steal(
	// List your Controller's dependencies here:
	function () {
        System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control').then(function () {

					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.ModelWorkspace', {

						init: function (element, options) {
							var self = this;
							options = AD.defaults({
							}, options);
							this.options = options;

							// Call parent init
							this._super(element, options);

							this.data = {};

							this.webixUiId = {
								modelToolbar: 'ab-model-toolbar',
								modelDatatable: 'ab-model-datatable',
								addFieldsPopup: 'add-fields-popup'
							};

							this.initWebixUI();

						},

						initWebixUI: function () {
							var self = this;

							webix.ui({
								id: self.webixUiId.addFieldsPopup,
								view: "add_fields_popup",
							});

							self.data.definition = {
								rows: [
									{
										view: 'toolbar',
										id: self.webixUiId.modelToolbar,
										cols: [
											{ view: "button", label: "Hide fields", icon: "columns", type: "icon", width: 120 },
											{ view: 'button', label: "Add filters", icon: "filter", type: "icon", width: 120 },
											{ view: 'button', label: 'Apply sort', icon: "sort", type: "icon", width: 120 },
											{ view: 'button', label: 'Add new column', icon: "plus", type: "icon", width: 150, popup: 'add-fields-popup' }
										]
									},
									{
										view: "datatable",
										id: self.webixUiId.modelDatatable,
										autoheight: true,
										resizeColumn: true,
										resizeRow: true,
										editable: true,
										editaction: "custom",
										select: "cell",
										ready: function () {
											webix.extend(this, webix.ProgressBar);
										},
										on: {
											onAfterSelect: function (data, prevent) {
												this.editCell(data.row, data.column);
											}
										}
									}
								]
							};
						},

						getUIDefinition: function () {
							return this.data.definition;
						},

						setModelId: function (id) {
							var self = this;

							self.data.modelId = id;

							if ($$(self.webixUiId.modelDatatable).showProgress)
								$$(self.webixUiId.modelDatatable).showProgress({ type: 'icon' });

							// Clear columns & data
							$$(self.webixUiId.modelDatatable).define('columns', []);
							$$(self.webixUiId.modelDatatable).clearAll();
							$$(self.webixUiId.modelDatatable).refreshColumns();
							$$(self.webixUiId.modelDatatable).refresh();

							// Register table to add new fields popup
							$$(self.webixUiId.addFieldsPopup).registerDataTable($$(self.webixUiId.modelDatatable));

							if (self.data.modelId) {
								async.parallel([
									function () {
										// TODO : Get columns from server
										var columns = [
											{ id: "name", header: "<span class='webix_icon fa-font'></span> Name", editor: "text", width: 100 },
											{ id: "description", header: "<span class='webix_icon fa-align-right'></span> Description", editor: "popup", width: 150 }
										];

										$$(self.webixUiId.modelDatatable).define('columns', columns);
									},
									function () {
										// TODO : Get data from server
										var data = [
											{ name: 'Test 1', description: 'Description 1' },
											{ name: 'Test 2', description: 'Description 2' },
											{ name: 'Test 3', description: 'Description 3' }
										];

										$$(self.webixUiId.modelDatatable).parse(data);
									}
								], function () {
									$$(self.webixUiId.modelDatatable).refreshColumns();
									$$(self.webixUiId.modelDatatable).refresh();

									if ($$(self.webixUiId.modelDatatable).hideProgress)
										$$(self.webixUiId.modelDatatable).hideProgress();

								});
							}
							else {
								$$(self.webixUiId.modelDatatable).refreshColumns();
								$$(self.webixUiId.modelDatatable).refresh();

								if ($$(self.webixUiId.modelDatatable).hideProgress)
									$$(self.webixUiId.modelDatatable).hideProgress();
							}


						}

					});

				});
		});

	});