steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/models/ABObject.js',
	'opstools/BuildApp/models/ABColumn.js',

	'opstools/BuildApp/controllers/webix_custom_components/ConnectedDataPopup.js',

	'opstools/BuildApp/controllers/utils/ModelCreator.js',
	'opstools/BuildApp/controllers/utils/SelectivityHelper.js',

	function () {
		System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control').then(function () {

					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.Components.Form', {

						init: function (element, options) {
							var self = this;

							self.data = {};
							self.info = {
								name: 'Form',
								icon: 'fa-list-alt'
							};

							// Model
							self.Model = {
								ABObject: AD.Model.get('opstools.BuildApp.ABObject'),
								ABColumn: AD.Model.get('opstools.BuildApp.ABColumn'),
								ObjectModels: {}
							};

							// Controllers
							var ModelCreator = AD.Control.get('opstools.BuildApp.ModelCreator'),
								ConnectedDataPopup = AD.Control.get('opstools.BuildApp.ConnectedDataPopup'),
								SelectivityHelper = AD.Control.get('opstools.BuildApp.SelectivityHelper');

							self.controllers = {
								ModelCreator: new ModelCreator(),
								ConnectedDataPopup: new ConnectedDataPopup(),
								SelectivityHelper: new SelectivityHelper()
							};

							self.componentIds = {
								editView: self.info.name + '-edit-view',
								editForm: 'ab-form-edit-mode',

								title: self.info.name + '-title',
								description: self.info.name + '-description',

								propertyView: self.info.name + '-property-view',
								editTitle: self.info.name + '-edit-title',
								editDescription: self.info.name + '-edit-description',
								selectObject: self.info.name + '-select-object',
								isSaveVisible: self.info.name + '-save-visible',
								isCancelVisible: self.info.name + '-cancel-visible',

								addConnectObjectDataPopup: 'ab-' + self.info.name + '-connected-data-popup',

								saveButton: self.info.name + '-save-button',
								cancelButton: self.info.name + '-cancel-button'
							};

							webix.ui({
								id: self.componentIds.addConnectObjectDataPopup,
								view: "connected_data_popup",
							});

							self.view = {
								view: "form",
								autoheight: true,
								elements: [],
								drag: true
							};

							self.getView = function () {
								return self.view;
							};

							self.getEditView = function () {
								var form = $.extend(true, {}, self.getView());
								form.id = self.componentIds.editForm;

								var editView = {
									id: self.componentIds.editView,
									view: 'layout',
									padding: 10,
									css: 'ab-scroll-y',
									rows: [
										form
									]
								};

								return editView;
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
										},
										{ label: "Actions", type: "label" },
										{
											id: self.componentIds.isSaveVisible,
											name: 'save',
											type: 'richselect',
											label: 'Save',
											options: [
												{ id: 'show', value: "Yes" },
												{ id: 'hide', value: "No" },
											]
										},
										{
											id: self.componentIds.isCancelVisible,
											name: 'cancel',
											type: 'richselect',
											label: 'Cancel',
											options: [
												{ id: 'show', value: "Yes" },
												{ id: 'hide', value: "No" },
											]
										}
									],
									on: {
										onAfterEditStop: function (state, editor, ignoreUpdate) {
											if (ignoreUpdate || state.old == state.value) return false;

											var propertyValues = $$(self.componentIds.propertyView).getValues();

											switch (editor.id) {
												case self.componentIds.editTitle:
													$$(self.componentIds.title).setValue(propertyValues[self.componentIds.editTitle]);
													break;
												case self.componentIds.editDescription:
													$$(self.componentIds.description).setValue(propertyValues[self.componentIds.editDescription]);
													break;
												case self.componentIds.selectObject:
												case self.componentIds.isSaveVisible:
												case self.componentIds.isCancelVisible:
													var setting = self.getSettings();
													self.populateSettings({ setting: setting }, true);
													break;
											}
										}
									}
								};
							};

							self.setApp = function (app) {
								self.data.app = app;

								self.controllers.ModelCreator.setApp(app);

								$$(self.componentIds.addConnectObjectDataPopup).setApp(app);
							};

							self.getData = function (viewId) {
								if (!self.data[viewId]) self.data[viewId] = {};

								return self.data[viewId];
							};

							self.render = function (viewId, comId, settings, editable, defaultShowAll) {
								var data = self.getData(viewId),
									q = $.Deferred(),
									elementViews = [],
									header = { rows: [] };

								data.columns = null;
								data.id = comId;

								settings.visibleFieldIds = settings.visibleFieldIds || [];

								$$(viewId).clear();
								$$(viewId).clearValidation();

								if (!settings.object) return;

								webix.extend($$(viewId), webix.ProgressBar);
								$$(viewId).showProgress({ type: "icon" });

								// Get object list
								data.objectId = settings.object;

								async.waterfall([
									function (next) {
										if (editable) {
											self.getObjectModel(data.objectId)
												.fail(function (err) { next(err) })
												.then(function (objectModel) {
													next(null, objectModel);
												});
										} else {
											next(null, null);
										}
									},
									function (objectModel, next) {
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
													var isVisible = settings.visibleFieldIds.indexOf(c.id.toString()) > -1 || defaultShowAll;

													if (!editable && !isVisible) return; // Hidden

													var element = {
														name: c.name, // Field name
														labelWidth: 100,
														minWidth: 500
													};
													element.label = c.label;

													if (!c.setting.editor) { // Checkbox
														element.view = 'checkbox';
													}
													else if (c.setting.editor === 'selectivity') {
														element.minHeight = 45;
														element.borderless = true;
														element.template = "<label style='width: #width#px; display: inline-block; float: left; line-height: 32px;'>#label#</label>" +
															"<div class='ab-form-connect-data' data-object='#object#' data-multiple='#multiple#'></div>";

														element.template = element.template
															.replace('#width#', element.labelWidth - 3)
															.replace('#label#', element.label)
															.replace('#object#', c.linkToObject)
															.replace('#multiple#', c.isMultipleRecords);
													}
													else if (c.setting.editor === 'popup') {
														element.view = 'textarea';
													}
													else if (c.setting.editor === 'number') {
														element.view = 'counter';
													}
													else if (c.setting.editor === 'date') {
														element.view = 'datepicker';
														element.timepicker = false;
													}
													else if (c.setting.editor === 'datetime') {
														element.view = 'datepicker';
														element.timepicker = true;
													}
													else if (c.setting.editor === 'richselect') {
														element.view = 'richselect';
														// TODO : Get list from database
														element.options = $.map(c.setting.filter_options, function (opt, index) {
															return {
																id: index,
																value: opt
															}
														});
													}
													else {
														element.view = c.setting.editor;
													}

													if (editable) { // Show/Hide options
														element = {
															css: 'ab-form-component-item',
															cols: [
																{
																	name: c.id, // Column id
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
																element
															]
														};
													}

													// $$(viewId).addView(element);
													elementViews.push(element);
												});

												// Redraw
												webix.ui(elementViews, $$(viewId));

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

												// Save/Cancel buttons
												var actionButtons = {
													cols: [{}]
												};

												if (settings.saveVisible === 'show') {
													actionButtons.cols.push({
														id: self.componentIds.saveButton,
														view: "button",
														type: "form",
														value: "Save",
														width: 90,
														inputWidth: 80,
														click: function () {
															if ($$(self.componentIds.saveButton))
																$$(self.componentIds.saveButton).disable();

															var formView = this.getFormView();
															$$(formView).showProgress({ type: "icon" });

															var data = self.getData(viewId),
																modelData;

															async.series([
																function (next) {
																	if (data.modelDataId) { // Update
																		self.getModelData(data.objectId, data.modelDataId)
																			.fail(function (err) { next(err) })
																			.then(function (result) {
																				modelData = result;
																				next();
																			});
																	}
																	else { // Create
																		self.getObjectModel(data.objectId)
																			.fail(function (err) { next(err) })
																			.then(function (objectModel) {
																				modelData = objectModel.newInstance();
																				next();
																			});
																	}
																},
																function (next) {
																	var editValues = $$(formView).getValues(),
																		keys = Object.keys(editValues);

																	keys.forEach(function (k) {
																		if (typeof editValues[k] !== 'undefined' && editValues[k] !== null) {
																			var colInfo = data.columns.filter(function (col) { return col.name === k; })[0];

																			if (colInfo) {
																				switch (colInfo.type) {
																					case "boolean":
																						modelData.attr(k, editValues[k] === 1 ? true : false);
																						break;
																					default:
																						modelData.attr(k, editValues[k]);
																						break;
																				}
																			}
																			else {
																				modelData.attr(k, editValues[k]);
																			}
																		}
																		else
																			modelData.removeAttr(k);
																		// modelData.attr(k, null);
																	});

																	modelData.save()
																		.fail(function (err) { next(err); })
																		.then(function (result) {
																			next();
																		});
																},
																function (next) {
																	$$(formView).hideProgress();
																	if ($$(formView).save)
																		$$(formView).save();

																	self.callEvent('save', viewId, {
																		modelDataId: data.modelDataId,
																		returnPage: data.returnPage,
																		id: data.id
																	});

																	if ($$(self.componentIds.saveButton))
																		$$(self.componentIds.saveButton).enable();

																	data.modelDataId = null;
																	data.returnPage = null;

																	next();
																}
															]);
														}
													});
												}

												if (settings.cancelVisible === 'show') {
													actionButtons.cols.push({
														id: self.componentIds.cancelButton,
														view: "button",
														value: "Cancel",
														width: 90,
														inputWidth: 80,
														click: function () {
															var data = self.getData(viewId);
															data.modelDataId = null;

															self.callEvent('cancel', viewId, {
																returnPage: data.returnPage,
																id: data.id
															});
														}
													});
												}

												$$(viewId).addView(actionButtons);

												$$(viewId).refresh();

												self.controllers.SelectivityHelper.renderSelectivity($$(viewId), 'ab-form-connect-data');

												$('.ab-form-connect-data').click(function () { // TODO: add viewId filter to selector
													var item = $(this),
														objectId = item.data('object'),
														multiple = item.data('multiple');

													data.updatingItem = item;

													var object = data.objectList.filter(function (obj) { return obj.id == objectId; });

													if (object && object.length > 0) {
														var selectedIds = $.map(self.controllers.SelectivityHelper.getData(item), function (d) { return d.id; });

														$$(self.componentIds.addConnectObjectDataPopup).registerSelectChangeEvent(function (selectedItems) {
															if (data.updatingItem)
																self.controllers.SelectivityHelper.setData(data.updatingItem, selectedItems);
														});

														$$(self.componentIds.addConnectObjectDataPopup).registerCloseEvent(function (selectedItems) {
															if (data.updatingItem)
																self.controllers.SelectivityHelper.setData(data.updatingItem, selectedItems);

															data.updatingItem = null;
														});

														$$(self.componentIds.addConnectObjectDataPopup).open(object[0], selectedIds, multiple);
													}
												});

												$$(viewId).hideProgress();

												self.callEvent('renderComplete', viewId);

												next();
											});
									}
								], function (err) {
									if (err)
										q.reject();
									else
										q.resolve();
								});

								return q;
							};

							self.populateData = function (viewId, objectId, dataId, returnPage) {
								var data = self.getData(viewId);

								if (data.objectId != objectId) return; // Validate object

								$$(viewId).showProgress({ type: "icon" });

								data.modelDataId = dataId;
								data.returnPage = returnPage;

								self.getModelData(objectId, dataId)
									.fail(function (err) {
										// TODO : Error message
									})
									.then(function (result) {
										$$(viewId).setValues(result.attr());

										$$(viewId).hideProgress();
										if ($$(self.componentIds.saveButton))
											$$(self.componentIds.saveButton).enable();
									});
							};

							self.getSettings = function () {
								var propertyValues = $$(self.componentIds.propertyView).getValues(),
									visibleFieldIds = [];

								var formValues = $$(self.componentIds.editForm).getValues();
								for (var key in formValues) {
									if (formValues[key] === 'show') {
										visibleFieldIds.push(key);
									}
								}

								var settings = {
									title: propertyValues[self.componentIds.editTitle],
									description: propertyValues[self.componentIds.editDescription] || '',
									object: propertyValues[self.componentIds.selectObject] || '',
									visibleFieldIds: visibleFieldIds,
									saveVisible: propertyValues[self.componentIds.isSaveVisible],
									cancelVisible: propertyValues[self.componentIds.isCancelVisible]
								};

								return settings;
							};

							self.populateSettings = function (item, defaultShowAll) {
								// Render form component
								self.render(self.componentIds.editForm, item.id, item.setting, true, defaultShowAll);

								var viewId = self.componentIds.editDataTable,
									data = self.getData(viewId);

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
										propValues[self.componentIds.isSaveVisible] = item.setting.saveVisible || 'hide';
										propValues[self.componentIds.isCancelVisible] = item.setting.cancelVisible || 'hide';
										$$(self.componentIds.propertyView).setValues(propValues);

										$$(self.componentIds.propertyView).refresh();
									});
							};

							self.getObjectModel = function (objectId) {
								var q = $.Deferred();

								async.waterfall([
									function (next) {
										self.Model.ABObject.findOne({ id: objectId })
											.fail(function (err) { next(err); })
											.then(function (object) {
												next(null, object);
											})
									},
									function (object, next) {
										self.controllers.ModelCreator.getModel(object.name)
											.fail(function (err) { next(err); })
											.then(function (objectModel) {
												q.resolve(objectModel);
												next(null);
											});
									}
								], function (err) {
									if (err) {
										q.reject(err);
									}
								});

								return q;
							};

							self.getModelData = function (objectId, dataId) {
								var q = $.Deferred(),
									objectModel;

								async.series([
									function (next) {
										self.getObjectModel(objectId)
											.fail(function (err) { next(err); })
											.then(function (result) {
												objectModel = result;
												next();
											});
									},
									function (next) {
										objectModel.findOne({ id: dataId })
											.fail(function (err) {
												next(err);
												q.reject(err);
											})
											.then(function (result) {
												if (!result) {
													next();
													q.reject();
													return;
												}

												// Convert string to Date
												var dateFields = [];
												for (var key in objectModel.describe()) {
													var value = objectModel.describe()[key];
													if (value === 'date' || value === 'datetime') {
														var dateVal = result.attr(key);
														if (dateVal)
															result.attr(key, new Date(dateVal));
													}
												}

												// Populate data to form
												if (result.translate) result.translate();

												next();
												q.resolve(result);
											});
									}
								]);

								return q;
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
							$$(this.componentIds.editView).define('height', height - 150);
							$$(this.componentIds.editView).resize();
						}

					});

				});
		});
	}
);