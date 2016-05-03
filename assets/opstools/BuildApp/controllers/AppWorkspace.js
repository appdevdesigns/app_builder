
steal(
	// List your Controller's dependencies here:
	function () {
        System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control').then(function () {

					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.AppWorkspace', {


						init: function (element, options) {
							var self = this;
							options = AD.defaults({
							}, options);
							this.options = options;

							// Call parent init
							this._super(element, options);


							this.dataSource = this.options.dataSource; // AD.models.Projects;
							this.data = {};

							self.initWebixUI();
						},

						initWebixUI: function () {
							var self = this;

							self.webixUiId = {
								appWorkspace: 'ab-workspace',
								menuTabbar: 'ab-workspace-tabbar',
								modelView: 'ab-app-model-view',
								interfaceView: 'ab-app-interface-view'
							};

							// Tab menu
							webix.ui({
								id: self.webixUiId.appWorkspace,
								container: self.element[0],
								autoheight: true,
								autowidth: true,
								rows: [
									{
										view: "tabbar", id: self.webixUiId.menutabbar, value: self.webixUiId.modelView, multiview: true, options: [
											{ id: self.webixUiId.modelView, value: 'Model', width: 120, disabled: true },
											{ id: self.webixUiId.interfaceView, value: 'Interface', width: 120 }
										]
									},
									{
										cells: [
											{
												// Model view
												id: self.webixUiId.modelView,
												cols: [
													{
														view: "list",
														width: 250,
														select: true,
														borderless: true,
														editable: true,
														editaction: "click",
														data: [
															{ id: 1, value: "Translate", submenu: ["English", "French", "German"] },
															{ id: 2, value: "Post" },
															{ id: 3, value: "Info" }
														]
													},
													{ view: "resizer" },
													{
														view: "datatable"
													}
												]
											},
											{
												// Interface view
												id: self.webixUiId.interfaceView,
												template: "Under construction..."
											}
										]
									}
								]
							});
						},

						setApplicationId: function (appId) {
							this.data.appId = appId;
						},

						resize: function (height) {
							var self = this;

							var appWorkspaceDom = $(self.element);

							if (appWorkspaceDom) {
								var width = appWorkspaceDom.parent().css('width');
								if (width) {
									width = parseInt(width.replace('px', ''));
								}
								appWorkspaceDom.width(width - 410);

								var computedHeight = height - 40;
								if (appWorkspaceDom.css('min-height') < computedHeight)
									appWorkspaceDom.height(computedHeight);
								else
									appWorkspaceDom.height(appWorkspaceDom.css('min-height'));

								if (self.webixUiId && self.webixUiId.appWorkspace)
									$$(self.webixUiId.appWorkspace).adjust();
							}
						}

					});

				});
		});

	});