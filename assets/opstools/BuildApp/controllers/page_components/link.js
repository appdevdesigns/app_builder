steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/utils/InputValidator.js',

	function (inputValidator) {
		var componentIds = {
			editLink: 'ab-link-edit-view',
			propertyView: 'ab-link-property-view'
		};

		//Constructor
		var linkComponent = function (application, rootPageId, viewId, componentId) {
			var data = {};

			this.viewId = viewId;
			this.editViewId = componentIds.editLink;

			// Instance functions
			this.render = function (setting, editable, showAll, dataCollection, linkedToDataCollection, currComponent) {
				var q = $.Deferred(),
					self = this;

				var view = $.extend(true, {}, linkComponent.getView());
				view.id = self.viewId;
				view.data = {
					title: currComponent.title || setting.title || ''
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

				data.isRendered = true;

				q.resolve();

				setTimeout(function () {
					$(self).trigger('renderComplete', {});
				}, 100);

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

				var editItem = application.currPage.components.filter(function (c) { return c.id == componentId; })[0];

				// Render link
				this.render(setting, null, null, null, null, editItem);

				// Properties
				if (!$$(componentIds.propertyView)) return;

				if (application.currPage) {

					// 19 Jan 2017
					// Make sure pages don't get lost on embedded Tab pages:
						// var parentId = application.currPage.parent ? application.currPage.parent.attr('id') : application.currPage.attr('id');
						// application.getPages({ or: [{ id: parentId }, { parent: parentId }] }) // Get children
					application.getApplicationPages(application.currPage)
						.fail(function (err) { })
						.then(function (pages) {
							pages.forEach(function (p) {
								if (p.translate)
									p.translate();
							});

							// Disallow select tabs to Link component & Filter the current page
							pages = pages.filter(function (p) { return p.type != 'tab' && p.id != AD.classes.AppBuilder.currApp.currPage.id; });

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
								title: editItem.title || setting.title || '',
								linkTo: setting.linkTo
							});

							$$(componentIds.propertyView).refresh();
						});
				}
				else {
					$$(componentIds.propertyView).setValues({
						title: editItem.title || setting.title || '',
						linkTo: setting.linkTo
					});

					$$(componentIds.propertyView).refresh();
				}
			};

			this.isRendered = function () {
				return data.isRendered === true;
			};

			this.resize = function (width, height) {
				$$(this.viewId).adjust();
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
					onBeforeEditStop: function (state, editor) {
						if (editor.id == 'title' && state.value.length > 0) {
							return inputValidator.validateFormat(state.value);
						}
						else {
							return true;
						}
					},
					onAfterEditStop: function (state, editor, ignoreUpdate) {
						if (state.old === state.value) return true;

						switch (editor.id) {
							case 'title':
							case 'linkTo':
								var setting = componentManager.editInstance.getSettings();
								var editItem = application.currPage.components.filter(function (c) { return c.id == componentId; })[0];
								componentManager.editInstance.render(setting, null, null, null, null, editItem);
								break;
						}
					}
				}
			};
		};

		return linkComponent;

	}
);