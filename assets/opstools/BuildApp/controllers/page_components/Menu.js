steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/models/ABPage.js',
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
							self.events = {};
							self.info = {
								name: 'Menu',
								icon: 'fa-th-list'
							};

							self.Model = AD.Model.get('opstools.BuildApp.ABPage');

							self.componentIds = {
								editView: self.info.name + '-edit-view',
								editMenu: 'ab-menu-edit-mode',

								propertyView: self.info.name + '-property-view',

								pageTree: 'ab-menu-page-tree'
							};

							self.view = {
								view: "menu",
								autoheight: true,
								minWidth: 500,
								datatype: "json"
							};

							self.getView = function () {
								return self.view;
							};

							self.getEditView = function () {
								var menu = $.extend(true, {}, self.getView());
								menu.id = self.componentIds.editMenu;

								var editView = {
									id: self.componentIds.editView,
									padding: 10,
									rows: [
										menu,
										{
											view: 'label',
											label: 'Page list'
										},
										{
											id: self.componentIds.pageTree,
											view: 'tree',
											template: "<div class='ab-page-list-item'>" +
											"{common.icon()} {common.checkbox()} {common.folder()} #label#" +
											"</div>",
											on: {
												onItemCheck: function () {
													$$(self.componentIds.editMenu).clearAll();

													$$(self.componentIds.pageTree).getChecked().forEach(function (pageId) {
														var item = $$(self.componentIds.pageTree).getItem(pageId);

														$$(self.componentIds.editMenu).add({
															id: pageId,
															value: item.label
														}, $$(self.componentIds.editMenu).count());
													});
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
									id: self.componentIds.propertyView,
									elements: [
										{ label: "Layout", type: "label" },
										{
											id: 'orientation',
											type: "richselect",
											label: "Orientation",
											options: [
												{ id: 'x', value: "Horizontal" },
												{ id: 'y', value: "Vertical" }
											]
										},
									],
									on: {
										onAfterEditStop: function (state, editor, ignoreUpdate) {
											if (state.old === state.value) return true;

											switch (editor.id) {
												case 'orientation':
													self.render(self.componentIds.editMenu, null, self.getSettings());
													break;
											}
										}
									}
								};
							};

							self.setPage = function (page) {
								self.data.page = page;
							};

							self.getData = function (viewId) {
								if (!self.data[viewId]) self.data[viewId] = {};

								return self.data[viewId];
							};

							self.getEvent = function (viewId) {
								if (!self.events[viewId]) self.events[viewId] = {};

								return self.events[viewId];
							};

							self.render = function (viewId, comId, setting) {
								var q = $.Deferred(),
									data = self.getData(viewId);

								if ($$(viewId))
									$$(viewId).clearAll();

								var view = $.extend(true, {}, self.getView());
								view.id = viewId;
								view.layout = setting.layout || 'x';

								data.isRendered = true;

								if (setting.click)
									view.click = setting.click;

								webix.ui(view, $$(viewId));
								webix.extend($$(viewId), webix.ProgressBar);

								$$(viewId).showProgress({ type: 'icon' });

								var events = self.getEvent(viewId);

								if (setting.data && setting.data.length > 0) {
									var pageIds = $.map(setting.data, function (id) {
										return { id: id };
									});

									// Get selected pages
									self.Model.findAll({ or: pageIds })
										.then(function (pages) {

											pages.forEach(function (p) {
												if (p.translate) p.translate();
											});

											// Convert object format (same arrange)
											var pageMenu = [];
											pageIds.forEach(function (page) {
												pageMenu.push({
													id: page.id,
													value: pages.filter(function (p) { return p.id == page.id })[0].label
												});
											});

											// Show page menu
											$$(viewId).parse(pageMenu, 'json');

											if (events.renderComplete)
												events.renderComplete();

											$$(viewId).hideProgress();

											q.resolve();
										});
								}
								else {
									if (events.renderComplete)
										events.renderComplete();

									$$(viewId).hideProgress();

									q.resolve();
								}

								return q;
							};

							self.getSettings = function () {
								var values = $$(self.componentIds.propertyView).getValues(),
									selectedPages = $$(self.componentIds.editMenu).find(function () { return true; }),
									selectedPageIds = $.map(selectedPages || [], function (page) {
										return page.id;
									});

								var setting = {
									layout: values.orientation,
									data: selectedPageIds
								};

								return setting;
							};

							self.populateSettings = function (item) {
								// Menu
								self.render(self.componentIds.editMenu, item.id, item.setting);

								// Page list
								$$(self.componentIds.pageTree).clearAll();
								var pageItems = [];
								if (self.data.page) {
									webix.extend($$(self.componentIds.pageTree), webix.ProgressBar);

									$$(self.componentIds.pageTree).showProgress({ type: 'icon' });

									var parentId = self.data.page.parent ? self.data.page.parent.attr('id') : self.data.page.attr('id');
									self.Model.findAll({ or: [{ id: parentId }, { parent: parentId }] }) // Get children
										.fail(function (err) {
											$$(self.componentIds.pageTree).hideProgress();
										})
										.then(function (pages) {
											pages.forEach(function (p) {
												if (p.translate)
													p.translate();
											});

											pageItems = $.map(pages.attr(), function (p) {
												if (!p.parent) { // Get root page
													var pageItem = {
														id: p.id,
														value: p.name,
														label: p.label
													};

													// Get children pages
													pageItem.data = $.map(pages.attr(), function (subP) {
														if (subP.parent && subP.parent.id == p.id) {
															return {
																id: subP.id,
																value: subP.name,
																label: subP.label
															}
														}
													});

													return pageItem;
												}
											});

											$$(self.componentIds.pageTree).parse(pageItems);
											$$(self.componentIds.pageTree).openAll();

											// Set checked items
											if (item.setting.data) {
												item.setting.data.forEach(function (pageId) {
													$$(self.componentIds.pageTree).checkItem(pageId);
												});
											}

											$$(self.componentIds.pageTree).hideProgress();
										});
								}

								// Properties
								$$(self.componentIds.propertyView).setValues({
									orientation: item.setting.layout || 'x'
								});
								$$(self.componentIds.propertyView).refresh();
							};

							self.registerRenderCompleteEvent = function (viewId, renderCompleteEvent) {
								var events = self.getEvent(viewId);

								if (renderCompleteEvent)
									events.renderComplete = renderCompleteEvent;
							};

							self.isRendered = function (viewId) {
								return self.getData(viewId).isRendered === true;
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