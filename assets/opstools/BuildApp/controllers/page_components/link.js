steal(
	// List your Controller's dependencies here:
	function () {
		var componentIds = {
			editLink: 'ab-link-edit-view',
			propertyView: 'ab-link-property-view'
		};

		//Constructor
		var linkComponent = function (application, viewId, componentId) {
			var data = {};

			this.viewId = viewId;
			this.editViewId = componentIds.editLink;

			// Instance functions
			this.render = function (setting) {
				var q = $.Deferred(),
					self = this;

				var view = $.extend(true, {}, linkComponent.getView());
				view.id = self.viewId;
				view.data = {
					title: setting.title || ''
				};
				view.onClick = {
					'ab-component-link': function (e, id, trg) {
						// TODO : check external url
						if (setting.linkTo) {
							$(self).trigger('changePage', {
								pageId: setting.linkTo
							});
						}
					}
				};

				webix.ui(view, $$(self.viewId));

				$(self).trigger('renderComplete', {});

				data.isRendered = true;

				q.resolve();

				return q;
			};

			this.getSettings = function () {
				var values = $$(componentIds.propertyView).getValues();

				return {
					title: values.title,
					linkTo: values.linkTo // ABPage.id
				};
			};

			this.populateSettings = function (setting) {
				// Render link
				this.render(setting);

				// Properties
				if (!$$(componentIds.propertyView)) return;

				if (application.currPage) {
					var parentId = application.currPage.parent ? application.currPage.parent.attr('id') : application.currPage.attr('id');

					// Get pages
					application.getPages({ or: [{ id: parentId }, { parent: parentId }] }) // Get children
						.fail(function (err) { })
						.then(function (pages) {
							pages.forEach(function (p) {
								if (p.translate)
									p.translate();
							});

							// Populate pages data to list
							var linkToList = $$(componentIds.propertyView).getItem('linkTo');
							linkToList.options = $.map(pages, function (p) {
								return {
									id: p.id,
									value: p.label
								};
							});
							linkToList.options.splice(0, 0, {
								id: null,
								value: '[Page]'
							});

							$$(componentIds.propertyView).setValues({
								title: setting.title || '',
								linkTo: setting.linkTo
							});

							$$(componentIds.propertyView).refresh();
						});
				}
				else {
					$$(componentIds.propertyView).setValues({
						title: setting.title || '',
						linkTo: setting.linkTo
					});

					$$(componentIds.propertyView).refresh();
				}
			};

			this.isRendered = function () {
				return data.isRendered === true;
			};

		};

		// Static functions
		linkComponent.getInfo = function () {
			return {
				name: 'link',
				icon: 'fa-external-link-square',
				propertyView: componentIds.propertyView
			};
		};

		linkComponent.getView = function () {
			return {
				view: "template",
				borderless: true,
				autoheight: true,
				template: "<a class='ab-component-link'>#title#</a>"
			};
		};

		linkComponent.getEditView = function () {
			var link = $.extend(true, {}, linkComponent.getView());
			link.id = componentIds.editLink;

			return link;
		};

		linkComponent.getPropertyView = function (componentManager) {
			var self = this;

			return {
				view: "property",
				id: componentIds.propertyView,
				nameWidth: 70,
				elements: [
					{ label: "Appearance", type: "label" },
					{
						id: 'title',
						name: 'title',
						type: "text",
						label: "Title"
					},
					{
						id: 'linkTo',
						name: 'linkTo',
						type: "combo",
						label: "Go to",
						template: function (data, dataValue) {
							var selectedData = $.grep(data.options, function (opt) { return opt.id == dataValue; });
							if (selectedData && selectedData.length > 0)
								return selectedData[0].value;
							else
								return "[Page]";
						}
					}
				],
				on: {
					onAfterEditStop: function (state, editor, ignoreUpdate) {
						if (state.old === state.value) return true;

						switch (editor.id) {
							case 'title':
							case 'linkTo':
								var setting = componentManager.editInstance.getSettings();
								componentManager.editInstance.render(setting);
								break;
						}
					}
				}
			};
		};

		return linkComponent;

	}
);