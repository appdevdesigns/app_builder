steal(
	// List your Controller's dependencies here:
	function () {
        System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control').then(function () {

					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.InterfaceComponentList', {

						init: function (element, options) {
							var self = this;

							self.options = AD.defaults({
								startDragEvent: 'AB_Page.StartDragComponent'
							}, options);

							// Call parent init
							self._super(element, options);
							self.Model = {};
							self.data = {};

							self.componentIds = {
								componentListPanel: 'ab-components-panel',
								componentToolbar: 'ab-components-toolbar',
								componentToolbarHeader: 'ab-components-toolbar-header',
								componentSpace: 'ab-component-space',
								componentList: 'ab-components-list'
							};

							self.initMultilingualLabels();
							self.initControllers();
							self.initWebixUI();
						},

						initMultilingualLabels: function () {
							var self = this;
							self.labels = {};
							self.labels.common = {};
							self.labels.interface = {};
							self.labels.interface.component = {};

							self.labels.interface.component.headerList = AD.lang.label.getLabel('ab.interface.component.headerList') || "Components";
						},

						initControllers: function () {
							var self = this;

							self.controllers = {};
						},

						initWebixUI: function () {
							var self = this;

							self.data.definition = {
								id: self.componentIds.componentListPanel,
								rows: [
									{
										view: 'toolbar',
										id: self.componentIds.componentToolbar,
										cols: [{
											view: 'label',
											id: self.componentIds.componentToolbarHeader,
											label: self.labels.interface.component.headerList
										}]
									},
									{
										id: self.componentIds.componentSpace,
										width: 200,
										cells: [
											{
												id: self.componentIds.componentList,
												view: 'list',
												drag: 'source',
												template: "<i class='fa #icon#' aria-hidden='true'></i> #name#",
												on: {
													onBeforeDrag: function (context, ev) {
														self.element.trigger(self.options.startDragEvent, {});

														var dragItem = $$(self.componentIds.componentList).getItem(context.source);

														context.html = "<div class='ab-component-item-drag'>"
															+ "<i class='fa {0}'></i> ".replace("{0}", dragItem.icon)
															+ dragItem.name
															+ "</div>";
													}
												}
											}
										]
									}
								]
							};
						},

						setComponents: function (components) {
							var self = this;

							self.data.componentItems = $.map(components, function (c) {
								return {
									name: c.info.name,
									icon: c.info.icon
								};
							});

							var componentSpaceDefinition = $.grep(self.data.definition.rows, function (r) { return r.id == self.componentIds.componentSpace; });
							componentSpaceDefinition = componentSpaceDefinition && componentSpaceDefinition.length > 0 ? componentSpaceDefinition[0] : null;

							for (var key in components) {
								var propertyView = components[key].getPropertyView();

								if (propertyView)
									componentSpaceDefinition.cells.push(propertyView);
							}
						},

						webix_ready: function () {
							var self = this;

							$$(self.componentIds.componentList).clearAll();
							$$(self.componentIds.componentList).parse(self.data.componentItems);

							self.hide();
						},

						getUIDefinition: function () {
							return this.data.definition;
						},

						openComponentPropertyView: function (item) {
							var self = this;

							if (item && $$(item.name + '-property-view')) {
								$$(self.componentIds.componentToolbarHeader).define('label', item.name + ' Properties');
								$$(self.componentIds.componentToolbarHeader).refresh();

								$$(item.name + '-property-view').show();
							}
						},

						closeComponentPropertyView: function () {
							var self = this;

							$$(self.componentIds.componentToolbarHeader).define('label', self.labels.interface.component.headerList);
							$$(self.componentIds.componentToolbarHeader).refresh();

							$$(self.componentIds.componentList).show();
						},

						resetState: function () {
							var self = this;

							$$(self.componentIds.componentToolbarHeader).define('label', self.labels.interface.component.headerList);
							$$(self.componentIds.componentToolbarHeader).refresh();

							$$(self.componentIds.componentList).show();
						},

						show: function () {
							$$(this.componentIds.componentListPanel).show();
						},

						hide: function () {
							$$(this.componentIds.componentListPanel).hide();
						}


					});
				});
		})
	});