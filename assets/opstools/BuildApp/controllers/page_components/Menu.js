steal(
	// List your Controller's dependencies here:
	function () {
        System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control').then(function () {

					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.Components.Menu', {

						init: function (element, options) {
							var self = this;

							self.data = {};
							self.info = {
								name: 'Menu',
								icon: 'fa-th-list'
							};

							self.componentIds = {
								displayMenu: 'ab-menu-display-mode',
								editMenu: 'ab-menu-edit-mode',
								menuOrientation: 'ab-menu-orientation'
							};

							self.getView = function () {
								return {
									id: self.componentIds.displayMenu,
									view: "menu",
									autoheight: true,
									minWidth: 500,
									layout: "x",
									data: [
										{ id: 1, value: "Translate", submenu: ["English", "French", "German"] },
										{ id: 2, value: "Post" },
										{ id: 3, value: "Info" }
									],
									type: {
										subsign: true,
									}
								};
							};

							self.getEditView = function () {
								var editView = {
									id: self.info.name + '-edit-view',
									padding: 10,
									rows: []
								};

								var menu = self.getView();
								menu.id = self.componentIds.editMenu;
								editView.rows.push(menu);

								return editView;
							};

							self.getPropertyView = function () {
								return {
									id: self.info.name + '-property-view',
									rows: [
										{
											id: self.componentIds.menuOrientation,
											view: "select",
											label: "Orientation",
											labelPosition: "top",
											value: 'x',
											options: [
												{ id: 'x', value: "Horizontal" },
												{ id: 'y', value: "Vertical" }
											],
											on: {
												onChange: function (newv, oldv) {
													if (newv != oldv) {
														$$(self.componentIds.editMenu).define('layout', newv);
														$$(self.componentIds.editMenu).render();
													}
												}
											}
										}
									]
								};
							};

							self.getSettings = function () {
								return {
									orientation: $$(self.componentIds.menuOrientation).getValue()
								}
							};

							self.populateSettings = function (settings) {
								$$(self.componentIds.menuOrientation).setValue(settings.orientation);
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