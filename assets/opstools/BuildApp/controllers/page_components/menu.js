steal(
	// List your Controller's dependencies here:
	function () {
		var componentIds = {
			editView: 'ab-menu-edit-view',
			editMenu: 'ab-menu-edit-mode',
			propertyView: 'ab-menu-property-view',
			pageTree: 'ab-menu-page-tree'
		};

		//Constructor
		var menuComponent = function (application, viewId, componentId) {
			var data = {};

			this.viewId = viewId;
			this.editViewId = componentIds.editMenu;

			// Instance functions
			this.render = function (setting) {
				var q = $.Deferred(),
					self = this;

				var view = $.extend(true, {}, menuComponent.getView());
				view.id = self.viewId;
				view.layout = 'x';
				if (setting.layout)
					view.layout = setting.layout;

				view.click = function (id, ev) {
					$(self).trigger('changePage', {
						pageId: id
					})
				};

				webix.ui(view, $$(self.viewId));
				webix.extend($$(self.viewId), webix.ProgressBar);

				$$(self.viewId).clearAll();
				$$(self.viewId).showProgress({ type: 'icon' });

				if (setting.pageIds && setting.pageIds.length > 0) {
					// Convert array to object
					var pageIds = $.map(setting.pageIds, function (id) {
						return { id: id };
					});

					// Get selected pages
					application.getPages({ or: pageIds })
						.fail(q.reject)
						.then(function (pages) {

							pages.forEach(function (p) {
								if (p.translate) p.translate();
							});

							// Convert object format (same arrange)
							var pageMenu = [];
							pageIds.forEach(function (page) {
								
								// NOTE: if a page was just deleted, an existing menu might 
								// still be trying to reference it.  Verify it still exists
								// before trying to add it:
								var foundPage = pages.filter(function (p) { return p.id == page.id })[0];
								if (foundPage && foundPage.label) {
									pageMenu.push({
										id: page.id,
										value: foundPage.label
									});
								} else {
									console.warn('AppBuilder:Menu: tried to reference a Page['+page.id+'] that was not found.');
								}
							});

							// Show page menu
							$$(self.viewId).parse(pageMenu, 'json');

							$(self).trigger('renderComplete', {});

							$$(self.viewId).hideProgress();

							data.isRendered = true;

							q.resolve();
						});
				}
				else {
					$(self).trigger('renderComplete', {});

					$$(self.viewId).hideProgress();

					data.isRendered = true;
					q.resolve();
				}

				return q;
			};

			this.getSettings = function () {
				var values = $$(componentIds.propertyView).getValues(),
					selectedPages = $$(componentIds.editMenu).find(function () { return true; }),
					selectedPageIds = $.map(selectedPages || [], function (page) {
						return page.id;
					});

				return {
					layout: values.orientation,
					pageIds: selectedPageIds // [ABPage.id]
				};
			};

			this.populateSettings = function (setting) {
				// Menu
				this.render(setting);

				// Page list
				$$(componentIds.pageTree).clearAll();
				var pageItems = [];
				if (application.currPage) {
					webix.extend($$(componentIds.pageTree), webix.ProgressBar);

					$$(componentIds.pageTree).showProgress({ type: 'icon' });

					var parentId = application.currPage.parent ? application.currPage.parent.attr('id') : application.currPage.attr('id');
					application.getPages({ or: [{ id: parentId }, { parent: parentId }] }) // Get children
						.fail(function (err) {
							$$(componentIds.pageTree).hideProgress();
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

							$$(componentIds.pageTree).parse(pageItems);
							$$(componentIds.pageTree).openAll();

							// Set checked items
							if (setting && setting.pageIds) {
								setting.pageIds.forEach(function (pageId) {
									$$(componentIds.pageTree).checkItem(pageId);
								});
							}

							$$(componentIds.pageTree).hideProgress();
						});
				}

				// Properties
				if (!$$(componentIds.propertyView)) return;

				$$(componentIds.propertyView).setValues({
					orientation: setting.layout || 'x'
				});
				$$(componentIds.propertyView).refresh();
			};

			this.isRendered = function () {
				return data.isRendered === true;
			};

		};

		// Static functions
		menuComponent.getInfo = function () {
			return {
				name: 'menu',
				icon: 'fa-th-list',
				propertyView: componentIds.propertyView
			};
		};

		menuComponent.getView = function () {
			return {
				view: "menu",
				autoheight: true,
				minWidth: 500,
				datatype: "json"
			};
		};

		menuComponent.getEditView = function () {
			var menu = $.extend(true, {}, menuComponent.getView());
			menu.id = componentIds.editMenu;

			return {
				id: componentIds.editView,
				padding: 10,
				rows: [
					menu,
					{
						view: 'label',
						label: 'Page list'
					},
					{
						id: componentIds.pageTree,
						view: 'tree',
						template: "<div class='ab-page-list-item'>" +
						"{common.icon()} {common.checkbox()} {common.folder()} #label#" +
						"</div>",
						on: {
							onItemCheck: function () {
								$$(componentIds.editMenu).clearAll();

								$$(componentIds.pageTree).getChecked().forEach(function (pageId) {
									var item = $$(componentIds.pageTree).getItem(pageId);

									$$(componentIds.editMenu).add({
										id: pageId,
										value: item.label
									}, $$(componentIds.editMenu).count());
								});
							}
						}
					}
				]
			};
		};

		menuComponent.getPropertyView = function (componentManager) {
			var self = this;

			return {
				view: "property",
				id: componentIds.propertyView,
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
								var setting = componentManager.editInstance.getSettings();
								componentManager.editInstance.render(setting);
								break;
						}
					}
				}
			};
		};

		return menuComponent;

	}
);