
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
							};

							this.initWebixUI();
						},

						initWebixUI: function () {
							var self = this;

							this.data.definition = {
								id: self.options.modelView,
								cols: [
									{
										view: "list",
										width: 250,
										select: true,
										template: "<div class='ab-model-list-item'>" +
										"#name#" +
										"<div class='ab-model-list-edit'>" +
										"{common.iconGear}" +
										"</div>" +
										"</div>",
										type: {
											iconGear: "<span class='webix_icon fa-cog'></span>"
										},
										on: {
											onAfterSelect: function (id) {
												$(this.getItemNode(id)).find('.ab-model-list-edit').show();
											}
										},
										onClick: {
											"ab-model-list-edit": function (e, id, trg) {
												// Show menu
												// $$(self.webixUiId.appListMenu).show(trg);
												console.log('TEST');

												return false;
											}
										},
										data: [
											{ id: 1, name: "Translate" },
											{ id: 2, name: "Post" },
											{ id: 3, name: "Info" }
										]
									},
									{ view: "resizer", autoheight: true },
									{
										view: "datatable",
										autoheight: true,
										columns: [
											{ id: "name", header: "Name", width: 100 },
											{ id: "description", header: "Description", fillspace: true },
											{ id: "addNew", header: "+", width: 50 }
										],
										// Mock data
										data: [
											{ name: 'Test 1', description: 'Description 1' },
											{ name: 'Test 2', description: 'Description 2' },
											{ name: 'Test 3', description: 'Description 3' }
										]
									}
								]
							};
						},

						getUIDefinition: function () {
							var self = this;

							return self.data.definition;
						},

						resize: function (height) {
							var self = this;

							$$(self.options.modelView).define('height', height - 120);
							$$(self.options.modelView).adjust();
						}

					});

				});
		});

	});