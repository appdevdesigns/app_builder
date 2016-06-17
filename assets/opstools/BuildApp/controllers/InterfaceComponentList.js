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
						},

						initControllers: function () {
							var self = this;

							self.controllers = {};
						},

						initWebixUI: function () {
							var self = this;

							self.data.definition = {
								id: self.componentIds.componentList,
								view: 'list',
								drag: 'source',
								width: 200,
								template: "<i class='fa #icon#' aria-hidden='true'></i> #name#",
								data: [
									{ name: 'Menu', icon: 'fa-th-list' },
									{ name: 'Grid', icon: 'fa-table' },
									{ name: 'Form', icon: 'fa-list-alt' }
								],
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
							};
						},

						webix_ready: function () {
							var self = this;

							$$(self.componentIds.componentList).hide();
						},

						getUIDefinition: function () {
							return this.data.definition;
						},

						show: function () {
							$$(this.componentIds.componentList).show();
						},

						hide: function () {
							$$(this.componentIds.componentList).hide();
						}


					});
				});
		})
	});