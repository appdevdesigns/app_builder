steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/page_components/componentManager.js',
	function (componentManager) {
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
										width: 220,
										cells: [
											{
												id: self.componentIds.componentList,
												view: 'list',
												drag: 'source',
												template: function (obj, common) {
													return "<i class='fa #icon#' aria-hidden='true'></i> #name#"
														.replace(/#icon#/g, obj.icon)
														.replace(/#name#/g, obj.name.capitalize());
												},
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

						initComponents: function () {
							var self = this;
							self.data.componentItems = [];

							var componentSpaceDefinition = $.grep(self.data.definition.rows, function (r) { return r.id == self.componentIds.componentSpace; });
							componentSpaceDefinition = componentSpaceDefinition && componentSpaceDefinition.length > 0 ? componentSpaceDefinition[0] : null;

							componentManager.getAllComponents().forEach(function (component) {
								if (component.getInfo) {
									var info = component.getInfo();
									self.data.componentItems.push({
										name: info.name,
										icon: info.icon
									});
								}

								if (component.getPropertyView) {
									var propertyView = component.getPropertyView();

									// Set auto scroll bar to the property view
									if (propertyView.scroll == null)
										propertyView.scroll = 'y';

									componentSpaceDefinition.cells.push(propertyView);
								}
							});
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

							if (item && $$('ab-' + item.component + '-property-view')) {
								$$(self.componentIds.componentToolbarHeader).define('label', item.component.capitalize() + ' Properties');
								$$(self.componentIds.componentToolbarHeader).refresh();

								$$('ab-' + item.component + '-property-view').show();
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