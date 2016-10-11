steal(
	// List your Controller's dependencies here:

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

							var ModelCreator = AD.Control.get('opstools.BuildApp.ModelCreator');
							self.controllers = {
								ModelCreator: new ModelCreator()
							};

							self.data = {};
							self.events = {};

							self.initMultilingualLabels();
							self.initWebixControls();
						},

						initMultilingualLabels: function () {
							var self = this;
							self.labels = {};

							self.labels.common = {};
							self.labels.common.ok = AD.lang.label.getLabel('ab.common.ok') || "Ok";
							self.labels.common.search = AD.lang.label.getLabel('ab.common.search') || "Search";
							self.labels.common.close = AD.lang.label.getLabel('ab.common.close') || "Close";

							// Connected data
							self.labels.object = {};
							self.labels.object.selectConnectedData = AD.lang.label.getLabel('ab.object.selectConnectedData') || "Select data to connect";
							self.labels.object.cannotConnectedDataTitle = AD.lang.label.getLabel('ab.object.cannotConnectedDataTitle') || "System could not link to this data";
							self.labels.object.cannotConnectedDataDescription = AD.lang.label.getLabel('ab.object.cannotConnectedDataDescription') || "This data is unsynchronized. You can click Synchronize button to sync data.";
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
														if (isNaN(id)) {
															webix.alert({
																title: self.labels.object.cannotConnectedDataTitle,
																text: self.labels.object.cannotConnectedDataDescription,
																ok: self.labels.common.ok
															});

															return false;
														}

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

												return [{ id: id, text: connectData }];
											});

											if (!selectedItems || selectedItems.length < 1)
												selectedItems = [];

											self.events.close(selectedItems);

											dataList.unselectAll();
											dataList.clearAll();
										}
									}
								},

								open: function (object, rowId, selectedIds, linkType, linkViaColName, linkViaType) {
									var dataList = this.getTopParentView().getChildViews()[1].getChildViews()[1];

									if (dataList.hideOverlay) dataList.hideOverlay();

									self.data.selectedIds = selectedIds;

									this.getTopParentView().show();
									webix.extend(dataList, webix.ProgressBar);
									dataList.showProgress({ type: 'icon' });
									dataList.define('multiselect', linkType === 'collection');
									dataList.define('template', function (item, common) {
										var templateText = "<div class='ab-connect-data'>";

										if (object.labelFormat || object.columns.length > 0) {
											if (object.labelFormat)
												templateText += object.labelFormat;
											else { // Get default column
												var defaultColName = object.columns.filter(function (col) {
													return col.type === 'string' || col.type === 'text';
												});
												templateText += '#' + (defaultColName[0] ? defaultColName[0].name : object.columns[0].name) + '#';
											}
										}

										templateText += isNaN(item.id) ? " (Unsynchronized)" : "";
										templateText += "</div>";
										templateText = templateText.replace(/[{]/g, '#').replace(/[}]/g, '#'); // Replace label format

										for (var key in item) {
											templateText = templateText.replace(new RegExp('#' + key + '#', 'g'), item[key]);
										}

										templateText = templateText.replace(/#(.+?)#/g, '');

										return templateText;
									});
									dataList.refresh();

									self.controllers.ModelCreator.getModel(object.name)
										.fail(function (err) { next(err); })
										.then(function (objectModel) {
											var cond = {};

											// // Filter selected data
											// if (linkViaType === 'model' && linkViaColName) {
											// 	cond[linkViaColName] = { '!': null };

											// 	// Get own selected data
											// 	if (selectedIds && selectedIds.length > 0) {

											// 		var origCond = cond;
											// 		cond = { or: [] };
											// 		cond.or.push(origCond);

											// 		cond.or.push({
											// 			id: selectedIds
											// 		})
											// 	}
											// }


											// objectModel.store = {};

											// Load the connect data
											// objectModel.findAll({ where:cond})
											objectModel.Cached.findAll(cond)
												.fail(function (err) { next(err); })
												.then(function (data) {
													// Filter selected data
													if (linkViaType === 'model') {
														data = data.filter(function (d) {
															return !d[linkViaColName] || d[linkViaColName].id == rowId || selectedIds.indexOf(d.id) > -1;
														});
													}

													data.forEach(function (d) {
														if (d.translate) d.translate();
													});

													if (data && data.length > 0)
														dataList.parse(data.attr());
													else {
														webix.extend(dataList, webix.OverlayBox);
														dataList.showOverlay("No #objectName# available.".replace('#objectName#', object.name));
													}

													dataList.hideProgress();
												});

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