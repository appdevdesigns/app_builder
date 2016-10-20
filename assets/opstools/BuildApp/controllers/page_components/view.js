steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/controllers/utils/SelectivityHelper.js',

	'opstools/BuildApp/models/ABObject.js',
	'opstools/BuildApp/models/ABColumn.js',
	function (selectivityHelper) {
		System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control').then(function () {

					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.Components.View', {

						init: function (element, options) {
							var self = this;

							self.data = {};
							self.info = {
								name: 'View',
								icon: 'fa-file-text-o'
							};

							// Model
							self.Model = {
								ABObject: AD.Model.get('opstools.BuildApp.ABObject'),
								ABColumn: AD.Model.get('opstools.BuildApp.ABColumn'),
								ObjectModels: {}
							};

							self.componentIds = {
								editViewLayout: self.info.name + '-edit-view',
								editView: 'ab-component-edit-view',

								title: 'ab-component-title',
								description: 'ab-component-description',

								propertyView: self.info.name + '-property-view',
								editTitle: 'ab-component-view-edit-title',
								editDescription: 'ab-component-view-edit-description',
								selectObject: 'ab-component-view-select-object'
							};

							self.view = {
								view: "layout",
								autoheight: true,
								rows: []
							};

							self.getView = function () {
								return self.view;
							};

							self.getEditView = function () {
								var view = $.extend(true, {}, self.getView());
								view.id = self.componentIds.editView;

								var editViewLayout = {
									id: self.componentIds.editViewLayout,
									view: 'layout',
									padding: 10,
									css: 'ab-scroll-y',
									rows: [
										view
									]
								};

								return editViewLayout;
							};

							self.getPropertyView = function () {
								return {
									view: "property",
									id: self.componentIds.propertyView,
									elements: [
										{ label: "Header", type: "label" },
										{
											id: self.componentIds.editTitle,
											name: 'title',
											type: 'text',
											label: 'Title'
										},
										{
											id: self.componentIds.editDescription,
											name: 'description',
											type: 'text',
											label: 'Description'
										},
										{ label: "Data source", type: "label" },
										{
											id: self.componentIds.selectObject,
											name: 'object',
											type: 'richselect',
											label: 'Object',
											template: function (data, dataValue) {
												var selectedData = $.grep(data.options, function (opt) { return opt.id == dataValue; });
												if (selectedData && selectedData.length > 0)
													return selectedData[0].value;
												else
													return "[Select]";
											}
										}
									],
									on: {
										onAfterEditStop: function (state, editor, ignoreUpdate) {
											if (ignoreUpdate || state.old == state.value) return false;

											var viewId = self.componentIds.editViewLayout,
												data = self.getData(viewId),
												propertyValues = $$(self.componentIds.propertyView).getValues();

											switch (editor.id) {
												case self.componentIds.editTitle:
													$$(self.componentIds.title).setValue(propertyValues[self.componentIds.editTitle]);
													break;
												case self.componentIds.editDescription:
													$$(self.componentIds.description).setValue(propertyValues[self.componentIds.editDescription]);
													break;
												case self.componentIds.selectObject:
													var setting = self.getSettings();
													self.populateSettings({ setting: setting }, data.getDataCollection, true);
													break;
											}
										}
									}
								};
							};

							self.setApp = function (app) {
								self.data.app = app;
							};

							self.getData = function (viewId) {
								if (!self.data[viewId]) self.data[viewId] = {};

								return self.data[viewId];
							};

							self.render = function (viewId, comId, settings, editable, showAll, dataCollection) {
								var data = self.getData(viewId),
									q = $.Deferred(),
									fields = [],
									header = { rows: [] };

								data.columns = null;
								data.id = comId;
								data.isRendered = true;

								data.dataCollection = dataCollection;
								if (data.dataCollection) {
									data.dataCollection.attachEvent('onAfterCursorChange', function (id) {
										self.updateData(viewId);
									});
									data.dataCollection.attachEvent('onDataUpdate', function (id, newData) {
										if (data.currDataId == id)
											self.updateData(viewId, newData);

										return true;
									});
								}

								settings.visibleFieldIds = settings.visibleFieldIds || [];

								// Clear rows
								var childViews = $$(viewId).getChildViews().slice();
								childViews.forEach(function (child) {
									$$(viewId).removeView(child.config.id);
								});

								if (!settings.object) {
									if (editable) {
										$$(viewId).addView({
											view: 'label',
											label: 'Please select an object'
										});
									}

									q.resolve();
									return q;
								}

								webix.extend($$(viewId), webix.ProgressBar);
								$$(viewId).showProgress({ type: "icon" });

								// Get object list
								data.objectId = settings.object;


								self.Model.ABColumn.findAll({ object: settings.object })
									.fail(function (err) {
										// TODO message
										$$(viewId).hideProgress();
										next(err);
									})
									.then(function (result) {
										result.forEach(function (d) {
											if (d.translate) d.translate();
										});

										data.columns = result;
										data.columns.forEach(function (c) {
											var isVisible = settings.visibleFieldIds.indexOf(c.id.toString()) > -1 || showAll;

											if (!editable && !isVisible) return; // Hidden

											var displayDataView = null;

											if (c.setting.editor === 'selectivity') {
												displayDataView = {
													view: 'template',
													dataId: c.id,
													borderless: true,
													template: '<div class="ab-component-view-selectivity"></div>'
												};
											}
											else if (c.setting.editor === 'date' || c.setting.editor === 'datetime') {
												displayDataView = {
													view: 'label',
													dataId: c.id,
													label: '[data]'
												};
											}
											else {
												displayDataView = {
													view: 'label',
													dataId: c.id,
													label: '[data]'
												};
											}

											var field = {
												view: 'layout',
												editor: c.setting.editor,
												fieldName: c.name,
												cols: [
													{
														view: 'label',
														css: 'bold',
														width: 120,
														label: c.label
													},
													displayDataView
												]
											};

											if (editable) { // Show/Hide options
												field = {
													css: 'ab-component-view-edit-field',
													cols: [
														{
															dataId: c.id, // Column id
															view: 'segmented',
															margin: 10,
															maxWidth: 120,
															inputWidth: 100,
															inputHeight: 35,
															value: isVisible ? "show" : "hide",
															options: [
																{ id: "show", value: "Show" },
																{ id: "hide", value: "Hide" },
															]
														},
														field
													]
												};
											}

											$$(viewId).addView(field);
										});

										// Title
										if (editable) {
											header.rows.push({
												id: self.componentIds.title,
												view: 'text',
												placeholder: 'Title',
												css: 'ab-component-header',
												value: settings.title || '',
												on: {
													onChange: function (newv, oldv) {
														if (newv != oldv) {
															var propValues = $$(self.componentIds.propertyView).getValues();
															propValues[self.componentIds.editTitle] = newv;
															$$(self.componentIds.propertyView).setValues(propValues);
														}
													}
												}
											});
										}
										else if (settings.title) {
											header.rows.push({
												view: 'label',
												css: 'ab-component-header',
												label: settings.title || ''
											});
										}

										// Description
										if (editable) {
											header.rows.push({
												id: self.componentIds.description,
												view: 'textarea',
												placeholder: 'Description',
												css: 'ab-component-description',
												value: settings.description || '',
												inputHeight: 60,
												height: 70,
												on: {
													onChange: function (newv, oldv) {
														if (newv != oldv) {
															var propValues = $$(self.componentIds.propertyView).getValues();
															propValues[self.componentIds.editDescription] = newv;
															$$(self.componentIds.propertyView).setValues(propValues);
														}
													}
												}

											});
										}
										else if (settings.description) {
											header.rows.push({
												view: 'label',
												css: 'ab-component-description',
												label: settings.description || ''
											});
										}

										$$(viewId).addView(header, 0);

										// Populate data to fields
										self.updateData(viewId);

										$$(viewId).hideProgress();

										self.callEvent('renderComplete', viewId);

										q.resolve();
									});

								return q;
							};

							self.getSettings = function () {
								var propertyValues = $$(self.componentIds.propertyView).getValues(),
									visibleFieldIds = [];

								// Find visibleFieldIds
								$$(self.componentIds.editViewLayout).getChildViews().forEach(function (child) {
									if (child.config.css === 'ab-component-view-edit-field') { // Get fields
										if (child.getChildViews()[0].getValue() === 'show') { // Get visible field
											var columnId = child.getChildViews()[0].config.dataId;
											visibleFieldIds.push(columnId);
										}
									}
								});

								var settings = {
									title: propertyValues[self.componentIds.editTitle],
									description: propertyValues[self.componentIds.editDescription] || '',
									object: propertyValues[self.componentIds.selectObject] || '',
									visibleFieldIds: visibleFieldIds
								};

								return settings;
							};

							self.populateSettings = function (item, getDataCollectionFn, showAll) {
								var viewId = self.componentIds.editViewLayout,
									data = self.getData(viewId);

								data.getDataCollection = getDataCollectionFn;

								async.waterfall([
									// Get data collection
									function (next) {
										if (item.setting.object) {
											data.getDataCollection(item.setting.object).then(function (dataCollection) {
												next(null, dataCollection);
											});
										}
										else {
											next(null, null);
										}
									},
									// Render form component
									function (dataCollection, next) {
										self.render(self.componentIds.editViewLayout, item.id, item.setting, true, showAll, dataCollection).fail(next).then(function () {
											next(null);
										});
									}
								]);


								// Get object list
								data.objects = null;
								self.Model.ABObject.findAll({ application: self.data.app.id })
									.fail(function (err) { callback(err); })
									.then(function (result) {
										result.forEach(function (o) {
											if (o.translate)
												o.translate();
										});

										data.objects = result;

										// Properties

										// Data source - Object
										var objSource = $$(self.componentIds.propertyView).getItem(self.componentIds.selectObject);
										objSource.options = $.map(data.objects, function (o) {
											return {
												id: o.id,
												value: o.label
											};
										});

										// Set property values
										var propValues = {};
										propValues[self.componentIds.editTitle] = item.setting.title || '';
										propValues[self.componentIds.editDescription] = item.setting.description || '';
										propValues[self.componentIds.selectObject] = item.setting.object;

										$$(self.componentIds.propertyView).setValues(propValues);
										$$(self.componentIds.propertyView).refresh();
									});
							};

							self.registerEventAggregator = function (event_aggregator) {
								self.event_aggregator = event_aggregator;
							};

							self.callEvent = function (eventName, viewId, eventData) {
								if (self.event_aggregator) {
									var data = self.getData(viewId);
									eventData = eventData || {};
									eventData.component_name = self.info.name;
									eventData.viewId = viewId;
									eventData.returnPage = data.returnPage;

									self.event_aggregator.trigger(eventName, eventData);
								}
							};

							self.isRendered = function (viewId) {
								return self.getData(viewId).isRendered === true;
							};

							self.updateData = function (viewId, newData) {
								var data = self.getData(viewId),
									currModel = newData ? newData : data.dataCollection.AD.currModel();

								if (currModel) {
									currModel = currModel.attr ? currModel.attr() : currModel;

									data.currDataId = currModel.id;

									$$(viewId).getChildViews().forEach(function (child) {
										var displayField = child.getChildViews()[1],
											labelValue = currModel ? currModel[child.config.fieldName] : '';

										if (child.config.editor === 'selectivity') {
											selectivityHelper.renderSelectivity($$(viewId), 'ab-component-view-selectivity', true);

											var selectivityItem = $(child.$view).find('.ab-component-view-selectivity');
											if (labelValue) {
												selectivityHelper.setData(selectivityItem, labelValue.map(function (d) {
													return {
														id: d.id,
														text: d.dataLabel
													};
												}));
											}
											else {
												selectivityHelper.setData(selectivityItem, []);
											}
										}
										else if (child.config.editor === 'date' || child.config.editor === 'datetime') {
											if (labelValue) {
												var dateValue = (labelValue instanceof Date) ? labelValue : new Date(labelValue),
													dateFormat = webix.i18n.dateFormatStr(dateValue);
												displayField.setValue(dateFormat);
											}
											else {
												displayField.setValue(labelValue);
											}
										}
										else if (child.config.editor) {
											if (labelValue)
												displayField.setValue(labelValue);
											else
												displayField.setValue('');
										}
									});
								}
							};

							self.editStop = function () {
								$$(self.componentIds.propertyView).editStop();
							};

						},

						getInstance: function () {
							return this;
						},

						setObjectList: function (objectList) {
							this.data.objectList = objectList;
						},

						resize: function (height) {
							$$(this.componentIds.editViewLayout).define('height', height - 150);
							$$(this.componentIds.editViewLayout).resize();
						}

					});

				});
		});
	}
);