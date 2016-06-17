steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/models/ABPageComponent.js',
	'opstools/BuildApp/controllers/InterfaceLayoutView.js',
	'opstools/BuildApp/controllers/InterfaceComponentList.js',
	function () {
        System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control').then(function () {

					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.InterfaceLayoutView', {

						init: function (element, options) {
							var self = this;

							// Call parent init
							self._super(element, options);
							self.Model = AD.Model.get('opstools.BuildApp.ABPageComponent');
							self.data = {};

							self.componentIds = {
								layoutPage: 'ab-interface-layout-page'
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

							self.labels.common.yes = AD.lang.label.getLabel('ab.common.yes') || "Yes";
							self.labels.common.no = AD.lang.label.getLabel('ab.common.no') || "No";
							self.labels.common.deleteErrorMessage = AD.lang.label.getLabel('ab.common.delete.error') || "System could not delete <b>{0}</b>.";
							self.labels.common.deleteSuccessMessage = AD.lang.label.getLabel('ab.common.delete.success') || "<b>{0}</b> is deleted.";

							self.labels.interface.component.confirmDeleteTitle = AD.lang.label.getLabel('ab.interface.component.confirmDeleteTitle') || "Delete component";
							self.labels.interface.component.confirmDeleteMessage = AD.lang.label.getLabel('ab.interface.component.confirmDeleteMessage') || "Do you want to delete <b>{0}</b>?";
						},

						initControllers: function () {
							var self = this;
							self.controllers = {};
						},

						initWebixUI: function () {
							var self = this;

							self.data.definition = {
								view: 'list',
								id: self.componentIds.layoutPage,
								drag: 'target',
								template: "<div class='ab-component-in-page'>" +
								"<i class='fa #icon#' aria-hidden='true'></i> #name#" +
								"<i class='fa fa-times ab-component-remove'></i>" +
								"</div>",
								externalData: function (data, id) {
									if (id) {
										$$(self.componentIds.layoutPage).showProgress({ type: 'icon' });

										var addNewComponent = self.Model.newInstance();
										addNewComponent.attr('page', self.data.pageId);
										addNewComponent.attr('component', data.name);
										addNewComponent.attr('weight', $$(self.componentIds.layoutPage).count());

										addNewComponent.save()
											.fail(function (err) {
												$$(self.componentIds.layoutPage).hideProgress();

											})
											.then(function (result) {
												var component = $$(self.componentIds.layoutPage).getItem(id);
												component.id = result.attr('id');

												$$(self.componentIds.layoutPage).updateItem(id, component);

												$$(self.componentIds.layoutPage).hideProgress();
											});

									}

									return data;
								},
								on: {
									onBeforeDrop: function (context, ev) {
										for (var i = 0; i < context.source.length; i++) {
											context.from.copy(context.source[i], context.start, this, webix.uid());
										}

										self.hideDropAreaZone();

										return false;
									}
								},
								onClick: {
									"ab-component-remove": function (e, id, trg) {
										var deletedComponent = $$(self.componentIds.layoutPage).getItem(id);

										if (!deletedComponent) return false;

										webix.confirm({
											title: self.labels.interface.component.confirmDeleteTitle,
											ok: self.labels.common.yes,
											cancel: self.labels.common.no,
											text: self.labels.interface.component.confirmDeleteMessage.replace('{0}', deletedComponent.name),
											callback: function (result) {
												if (result) {

													$$(self.componentIds.layoutPage).showProgress({ type: "icon" });

													// Call server to delete object data
													self.Model.destroy(id)
														.fail(function (err) {
															$$(self.componentIds.layoutPage).hideProgress();

															webix.message({
																type: "error",
																text: self.labels.common.deleteErrorMessage.replace("{0}", deletedComponent.name)
															});

															AD.error.log('Component : Error delete component', { error: err });
														})
														.then(function (result) {
															$$(self.componentIds.layoutPage).remove(id);

															webix.message({
																type: "success",
																text: self.labels.common.deleteSuccessMessage.replace('{0}', deletedComponent.name)
															});

															$$(self.componentIds.layoutPage).hideProgress();

														});
												}

											}
										});

										return false;
									}
								}
							};
						},

						webix_ready: function () {
							var self = this;

							webix.extend($$(self.componentIds.layoutPage), webix.ProgressBar);
						},

						getUIDefinition: function () {
							return this.data.definition;
						},

						setPageId: function (id) {
							var self = this;

							self.data.pageId = id;

							$$(self.componentIds.layoutPage).clearAll();
							$$(self.componentIds.layoutPage).showProgress({ type: 'icon' });

							self.Model.findAll({ page: id })
								.fail(function (err) {
									$$(self.componentIds.layoutPage).hideProgress();

								})
								.then(function (result) {
									var definedComponents = $.map(result.attr(), function (r) {
										return {
											id: r.id,
											name: r.component,
											weight: r.weight,
											setting: r.setting
										};
									});

									definedComponents.forEach(function (c) {
										// TODO : find component icon
										c.icon = '';
									});

									definedComponents.sort(function (a, b) { return a.weight - b.weight });

									$$(self.componentIds.layoutPage).parse(definedComponents);

									$$(self.componentIds.layoutPage).hideProgress();
								});
						},

						startDragComponent: function () {
							var self = this;

							self.showDropAreaZone();

							if (self.data.dropAreaTimeout)
								window.clearTimeout(self.data.dropAreaTimeout);

							self.data.dropAreaTimeout = setTimeout(function () {
								self.hideDropAreaZone();
							}, 3000)
						},

						showDropAreaZone: function () {
							webix.html.addCss($$(this.componentIds.layoutPage).getNode(), "ab-component-drop-area");
						},

						hideDropAreaZone: function () {
							webix.html.removeCss($$(this.componentIds.layoutPage).getNode(), "ab-component-drop-area");
						},

						resetState: function () {
							var self = this;

							$$(self.componentIds.layoutPage).clearValidation();
							$$(self.componentIds.layoutPage).clearAll();
						}

					});
				});
		})
	});