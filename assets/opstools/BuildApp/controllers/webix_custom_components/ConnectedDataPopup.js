steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/models/ABColumn.js',
	function () {
		System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control').then(function () {

					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.ConnectedDataPopup', {
						init: function (element, options) {
							var self = this;

							self.options = AD.defaults({
							}, options);

							// Call parent init
							self._super(element, options);

							self.Model = {
								ABColumn: AD.Model.get('opstools.BuildApp.ABColumn')
							};

							self.controllers = {
								ModelCreator: new AD.Control.get('opstools.BuildApp.ModelCreator')()
							}

							self.data = {};
							self.events = {};
							self.componentIds = {
								connectObjectDataList: 'ab-connect-object-data-list'
							};

							self.initMultilingualLabels();
							self.initWebixControls();
						},

						initMultilingualLabels: function () {
							var self = this;
							self.labels = {};

							self.labels.common = {};
							self.labels.common.search = AD.lang.label.getLabel('ab.common.search') || "Search";
							self.labels.common.close = AD.lang.label.getLabel('ab.common.close') || "Close";

							// Connected data
							self.labels.object = {};
							self.labels.object.selectConnectedData = AD.lang.label.getLabel('ab.object.selectConnectedData') || "Select data to connect";
						},

						initWebixControls: function () {
							var self = this;

							// Select connected object data popup
							webix.protoUI({
								name: 'connected_data_popup',
								$init: function (config) {
								},
								defaults: {
									modal: true,
									head: self.labels.object.selectConnectedData,
									position: "center",
									autowidth: true,
									autoheight: true,
									body: {
										rows: [
											{
												view: 'toolbar',
												cols: [{
													view: 'search',
													label: self.labels.common.search,
													keyPressTimeout: 140,
													on: {
														onTimedKeyPress: function () {
															var searchText = this.getValue(),
																dataList = this.getTopParentView().getChildViews()[1].getChildViews()[1];

															dataList.filter(function (obj) {
																var result = false;

																for (var key in obj) {
																	if (key != 'id' && obj[key])
																		result = obj[key].indexOf(searchText) > -1 || result;
																}

																return result;
															});
														}
													}
												}]
											},
											{
												view: 'list',
												width: 600,
												height: 400,
												type: {
													height: 40, // Defines item height
												},
												on: {
													onAfterLoad: function () {
														if (self.data.selectedIds && self.data.selectedIds.length > 0)
															this.select(self.data.selectedIds);
														else
															this.unselectAll();
													},
													onItemClick: function (id, e, node) {
														if (this.isSelected(id)) {
															this.unselect(id);
														}
														else {
															// Single select mode
															if (!this.config.multiselect)
																this.unselectAll();

															var selectedIds = this.getSelectedId();

															if (typeof selectedIds === 'string' || !isNaN(selectedIds)) {
																if (selectedIds)
																	selectedIds = [selectedIds];
																else
																	selectedIds = [];
															}

															selectedIds.push(id);

															this.select(selectedIds);
														}

													},
													onSelectChange: function () {
														var dataList = this,
															selectedIds = this.getSelectedId(true),
															selectedItems = [];

														selectedIds.forEach(function (id) {
															var htmlNode = dataList.getItemNode(id);
															if (!htmlNode) return;

															var connectData = $(htmlNode).find('.ab-connect-data')[0].innerText;

															selectedItems.push({ id: id, text: connectData });
														});

														if (self.events.selectChange)
															self.events.selectChange(selectedItems);
													}
												}
											},
											{
												view: "button",
												value: self.labels.common.close,
												align: "right",
												width: 150,
												click: function () {
													this.getTopParentView().hide();
												}
											}
										]
									},
									on: {
										onHide: function () {
											if (!self.events.close) return true;

											var dataList = this.getTopParentView().getChildViews()[1].getChildViews()[1];

											var selectedItems = $.map(dataList.getSelectedId(true), function (id) {
												var htmlNode = dataList.getItemNode(id);
												if (!htmlNode) return;

												var connectData = $(htmlNode).find('.ab-connect-data')[0].innerText;

												return [{ id: parseInt(id), text: connectData }];
											});

											if (!selectedItems || selectedItems.length < 1)
												selectedItems = [];

											self.events.close(selectedItems);

											dataList.unselectAll();
											dataList.clearAll();
										}
									}
								},

								setApp: function (app) {
									self.controllers.ModelCreator.setApp(app);
								},

								open: function (object, selectedIds, isMultipleRecords) {
									self.data.selectedIds = selectedIds;

									var dataList = this.getTopParentView().getChildViews()[1].getChildViews()[1];

									this.getTopParentView().show();
									webix.extend(dataList, webix.ProgressBar);
									dataList.showProgress({ type: 'icon' });
									dataList.define('multiselect', isMultipleRecords);

									AD.util.async.series([
										function (next) {
											self.Model.ABColumn.Cached.findAll({ object: object.id })
												.then(function (data) {

													data.forEach(function (d) {
														if (d.translate) d.translate();
													});

													columns = data;

													next();

												});
										},
										function (next) {
											// Generate template to display
											var template = "<div class='ab-connect-data'>";
											if (object.labelFormat || object.columns.length > 0)
												template += object.labelFormat || '#' + object.columns.name + '#';
											template += "</div>";
											template = template.replace(/[{]/g, '#').replace(/[}]/g, '#');

											dataList.define('template', template);
											dataList.refresh();

											self.controllers.ModelCreator.getModel(object.name)
												.fail(function (err) { next(err); })
												.then(function (objectModel) {

													objectModel.Cached.unbind('refreshData');
													objectModel.Cached.bind('refreshData', function (ev, data) {
														if (this == objectModel.Cached) {
															dataList.clearAll();
															dataList.parse(data.result.attr());
														}
													});

													// Load the connect data
													objectModel.Cached.findAll({})
														.fail(function (err) { next(err); })
														.then(function (data) {
															data.forEach(function (d) {
																if (d.translate) d.translate();
															})

															dataList.parse(data.attr());

															next();
														});

												});

										}
									], function () {
										dataList.hideProgress();
									});
								},

								registerSelectChangeEvent: function (selectChange) {
									self.events.selectChange = selectChange;
								},

								registerCloseEvent: function (close) {
									self.events.close = close;
								}
							}, webix.ui.window);
						}

					});
				});
		});
	}
);