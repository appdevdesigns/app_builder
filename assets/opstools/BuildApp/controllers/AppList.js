
steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/views/AppList/AppList.ejs',
	function () {
        System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control').then(function () {

					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.AppList', {


						init: function (element, options) {
							var self = this;
							options = AD.defaults({
								templateDOM: '/opstools/BuildApp/views/AppList/AppList.ejs',
							}, options);
							this.options = options;

							// Call parent init
							this._super(element, options);


							this.dataSource = this.options.dataSource; // AD.models.Projects;

							this.initDOM();

							webix.ready(function () {
								self.initWebixUI();
								self.loadData();
							});
						},

						initDOM: function () {
							this.element.html(can.view(this.options.templateDOM, {}));
						},

						initWebixUI: function () {
							var self = this;
							self.webixUiId = {
								appView: "ab-app-view",
								appListRow: 'ab-app-list-row',
								appListToolbar: 'ab-app-list-toolbar',
								appList: 'ab-app-list',
								appListMenu: 'ab-app-list-menu',
								appListForm: 'ab-app-list-form',
								appListLoading: 'ab-app-list-loading'
							};

							// Application list
							var appListControl = {
								id: self.webixUiId.appListRow,
								rows: [
									{
										view: "toolbar",
										id: self.webixUiId.appListToolbar,
										cols: [
											{ view: "label", label: "Applications", fillspace: true },
											{
												view: "button", value: "Add new application", width: 200,
												click: function () {
													self.resetState();
													$$(self.webixUiId.appListForm).show();
												}
											}]
									},
									{
										id: self.webixUiId.appList,
										view: "list",
										autoheight: true,
										template: "<div style='position: relative;' class='ab-app-item'>" +
										"<div style='width: 95%; display: inline-block;'>" +
										"<div class='ab-app-list-name'>#name#</div>" +
										"<div class='ab-app-list-description'>#description#</div>" +
										"</div>" +
										"<div style='position: absolute; top: 10px; right: 10px;' class='ab-edit-app'>" +
										"{common.iconGear}" +
										"</div>" +
										"</div>",
										type: {
											height: 100, // Defines item height
											iconGear: "<span class='webix_icon fa-cog'></span>"
										},
										select: false,
										ready: function () {
											webix.extend(this, webix.OverlayBox);

											if (!this.count()) { //if no data is available
												this.showOverlay("There is no application data");
											}
										},
										onClick: {
											"ab-app-item": function (e, id, trg) {

												return false; //here it blocks default behavior
											},
											"ab-edit-app": function (e, id, trg) {
												$$(self.webixUiId.appListMenu).show(trg);
												this.select(id);

												return false; //here it blocks default behavior
											}
										}
									}
								]
							};

							// Application menu
							webix.ui({
								view: "popup",
								id: self.webixUiId.appListMenu,
								head: "Application Menu",
								width: 100,
								body: {
									view: "list",
									data: [
										{ command: "Edit" },
										{ command: "Delete" }
									],
									datatype: "json",

									template: "#command#",
									autoheight: true,
									select: false,
									on: {
										'onItemClick': function (timestamp, e, trg) {
											switch (trg.textContent) {
												case 'Edit':
													var selectedApp = $$(self.webixUiId.appList).getSelectedItem();

													// Popuplate data to form
													for (var key in selectedApp) {
														if ($$(self.webixUiId.appListForm).elements[key])
															$$(self.webixUiId.appListForm).elements[key].setValue(selectedApp[key]);
													}

													$$(self.webixUiId.appListForm).show();
													break;
												case 'Delete':
													var selectedAppId = $$(self.webixUiId.appList).getSelectedId()
													// $$(self.webixUiId.appList).showProgress({ type: "icon" });
													webix.message("Delete row: " + selectedAppId);
													self.resetState();
													break;
											}

											$$(self.webixUiId.appListMenu).hide();
										}
									}
								}
							}).hide();

							// Application form
							var appFormControl = {
								view: "form",
								id: self.webixUiId.appListForm,
								scroll: false,
								elements: [
									{ view: "text", label: "Name", id: "name", name: "name", placeholder: "Application name", labelWidth: 100 },
									{ view: "textarea", label: "Description", id: "description", name: "description", placeholder: "Application description", labelWidth: 100, height: 150 },
									{
										margin: 5, cols: [
											{
												view: "button", value: "Cancel", click: function () {
													self.resetState();
													$$(self.webixUiId.appListRow).show();
												}
											},
											{
												view: "button", value: "Save", type: "form", click: function () {
													$$(self.webixUiId.appListForm).save();
												}
											}
										]
									}
								]
							}

							// Application multi-views
							webix.ui({
								container: self.element.find('.ab-app-list')[0],
								id: self.webixUiId.appView,
								autoheight: true,
								cells: [
									appListControl,
									appFormControl
								]
							});

							// Define loading cursor
							webix.extend($$(self.webixUiId.appList), webix.ProgressBar);
						},

						loadData: function () {
							var self = this;

							// MOCK : application data
							$$(self.webixUiId.appList).showProgress({ type: "icon" });
							$$(self.webixUiId.appList).parse([
								{ id: 1, name: "Sample 1", description: 'This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description This is sample 1 description' },
								{ id: 2, name: "Sample 2", description: 'This is sample 2 description' }
							]);

						},

						resetState: function () {
							var self = this;

							$$(self.webixUiId.appList).unselectAll();
							$$(self.webixUiId.appListForm).clear();
						},

						resize: function (height) {
							var self = this;

							var appListDom = $(self.element.find('.ab-app-list')[0]);

							if (appListDom) {
								var width = appListDom.parent().css('width');
								if (width) {
									width = parseInt(width.replace('px', ''));
								}
								appListDom.width(width - 410);

								var computedHeight = height - 140;
								if (appListDom.css('min-height') < computedHeight)
									appListDom.height(computedHeight);
								else
									appListDom.height(appListDom.css('min-height'));

								if (self.webixUiId && self.webixUiId.appView)
									$$(self.webixUiId.appView).adjust();
							}
						}


					});

				});
		});

	});