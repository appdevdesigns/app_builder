
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
								modelDatatable: 'ab-model-datatable'
							};

							this.initWebixUI();

						},

						initWebixUI: function () {
							var self = this;

							self.data.definition = {
								rows: [
									{
										view: 'toolbar',
										cols: [
											{ view: "button", label: "Hide fields", icon: "columns", type: "icon", width: 120 },
											{ view: 'button', label: "Add filters", icon: "filter", type: "icon", width: 120 },
											{ view: 'button', label: 'Apply sort', icon: "sort", type: "icon", width: 120 },
											{ view: 'button', label: 'Add new column', icon: "plus", type: "icon", width: 150 }
										]
									},
									{
										view: "datatable",
										id: self.webixUiId.modelDatatable,
										autoheight: true,
										ready: function () {
											webix.extend(this, webix.ProgressBar);
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

							if (self.data.modelId) {
								async.parallel([
									function () {
										// TODO : Get columns from server
										var columns = [
											{ id: "name", header: "Name", width: 100 },
											{ id: "description", header: "Description" }
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