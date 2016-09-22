steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/models/ABObject.js',
	'opstools/BuildApp/models/ABColumn.js',
	'opstools/BuildApp/models/ABList.js',

	'opstools/BuildApp/controllers/webix_custom_components/ConnectedDataPopup.js',

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
								ABList: AD.Model.get('opstools.BuildApp.ABList'),
								ObjectModels: {}
							};

							// Controllers
							var ConnectedDataPopup = AD.Control.get('opstools.BuildApp.ConnectedDataPopup'),
								SelectivityHelper = AD.Control.get('opstools.BuildApp.SelectivityHelper');

							self.controllers = {
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

								addConnectObjectDataPopup: 'ab-' + self.info.name + '-connected-data-popup'
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

											var viewId = self.componentIds.editForm,
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
												case self.componentIds.isSaveVisible:
												case self.componentIds.isCancelVisible:
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

								$$(self.componentIds.addConnectObjectDataPopup).setApp(app);
							};

							self.getData = function (viewId) {
								if (!self.data[viewId]) self.data[viewId] = {};

								return self.data[viewId];
							};

							self.render = function (viewId, comId, settings, editable, showAll, dataCollection) {
								var data = self.getData(viewId),
									q = $.Deferred(),
									elementViews = [],
									header = { rows: [] };

								data.columns = null;
								data.id = comId;
								data.isRendered = true;
								data.dataCollection = dataCollection;
								if (data.dataCollection) {
									data.dataCollection.attachEvent('onAfterCursorChange', function (id) {
										self.populateSelectivityValues(viewId);
									});
								}

								settings.visibleFieldIds = settings.visibleFieldIds || [];

								$$(viewId).clear();
								$$(viewId).clearValidation();

								if (!settings.object) return;

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
												element.editor = 'selectivity';
												element.minHeight = 45;
												element.borderless = true;
												element.template = "<label style='width: #width#px; display: inline-block; float: left; line-height: 32px;'>#label#</label>" +
													"<div class='ab-form-connect-data' data-object='#object#' data-link-type='#linkType#'></div>";

												element.template = element.template
													.replace('#width#', element.labelWidth - 3)
													.replace('#label#', element.label)
													.replace('#object#', (c.linkObject.id ? c.linkObject.id : c.linkObject))
													.replace('#linkType#', c.linkType);
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
												element.options = $.map(result, function (opt, index) {
													return {
														id: index,
														value: opt
													};
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

										// // Get list from database
										// self.Model.ABList.findAll({ column: c.id })
										// 	.then(function (result) {
										// 		result.forEach(function (r) { if (r.translate) r.translate(); });

										// 		element.options = $.map(result, function (opt, index) {
										// 			return {
										// 				id: r.id,
										// 				value: r.label
										// 			}
										// 		});
										// 	});

										// Redraw
										webix.ui(elementViews, $$(viewId));

										// Bind data
										if (dataCollection)
											$$(viewId).bind(dataCollection);

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

										// Save/Cancel buttons
										var actionButtons = {
											cols: [{}]
										};

										if (settings.saveVisible === 'show') {
											var saveButtonId = viewId + '-form-save-button';

											actionButtons.cols.push({
												id: saveButtonId,
												view: "button",
												type: "form",
												value: "Save",
												width: 90,
												inputWidth: 80,
												click: function () {
													if ($$(saveButtonId))
														$$(saveButtonId).disable();

													$$(viewId).showProgress({ type: "icon" });

													var data = self.getData(viewId),
														modelData = dataCollection.AD.currModel(),
														isAdd;

													if (modelData === null) { // Create
														modelData = new dataCollection.AD.getModelObject()();
														isAdd = true;
													}

													var editValues = $$(viewId).getValues(),
														keys = Object.keys(editValues);

													keys.forEach(function (fieldName) {
														if (typeof editValues[fieldName] !== 'undefined' && editValues[fieldName] !== null) {
															var colInfo = data.columns.filter(function (col) { return col.name === fieldName; })[0];

															if (colInfo) {
																switch (colInfo.type) {
																	case "connectedField":
																		var view = $$(viewId).getChildViews().filter(function (cView) { return cView.config.name === fieldName; })[0],
																			nodeItem = $(view.$view).find('.ab-form-connect-data'),
																			value = self.controllers.SelectivityHelper.getData(nodeItem, []).map(function (item) { return { id: item.id, dataLabel: item.text }; });
																		modelData.attr(fieldName, value);
																		break;
																	case "boolean":
																		modelData.attr(fieldName, editValues[fieldName] === 1 ? true : false);
																		break;
																	default:
																		modelData.attr(fieldName, editValues[fieldName]);
																		break;
																}
															}
															else {
																modelData.attr(fieldName, editValues[fieldName]);
															}
														}
														else
															modelData.removeAttr(fieldName);
														// modelData.attr(k, null);
													});

													modelData.save()
														.then(function (result) {
															$$(viewId).hideProgress();

															if (result.translate) result.translate();

															// Add to data collection
															if (isAdd)
																data.dataCollection.AD.__list.push(result);

															self.callEvent('save', viewId, {
																returnPage: data.returnPage,
																id: data.id
															});

															if ($$(saveButtonId))
																$$(saveButtonId).enable();

															data.dataCollection.setCursor(null);
															data.returnPage = null;

															// Clear form
															$$(viewId).setValues({});
														});
												}
											});
										}

										if (settings.cancelVisible === 'show') {
											var cancelButtonId = viewId + '-form-cancel-button';

											actionButtons.cols.push({
												id: cancelButtonId,
												view: "button",
												value: "Cancel",
												width: 90,
												inputWidth: 80,
												click: function () {
													var data = self.getData(viewId);

													data.dataCollection.setCursor(null);

													self.callEvent('cancel', viewId, {
														returnPage: data.returnPage,
														id: data.id
													});

													data.returnPage = null;

													// Clear form
													$$(viewId).setValues({});
												}
											});
										}

										$$(viewId).addView(actionButtons);

										$$(viewId).refresh();

										self.controllers.SelectivityHelper.renderSelectivity($$(viewId), 'ab-form-connect-data');

										$('.ab-form-connect-data').click(function () { // TODO: add viewId filter to selector
											var item = $(this),
												objectId = item.data('object'),
												linkType = item.data('link-type');

											data.updatingItem = item;

											var object = self.data.objectList.filter(function (obj) { return obj.id == objectId; });

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

												$$(self.componentIds.addConnectObjectDataPopup).open(object[0], selectedIds, linkType);
											}
										});

										$$(viewId).hideProgress();

										self.callEvent('renderComplete', viewId);

										q.resolve();
									});

								return q;
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

							self.populateSettings = function (item, getDataCollectionFn, showAll) {
								var viewId = self.componentIds.editForm,
									data = self.getData(viewId);

								data.getDataCollection = getDataCollectionFn;

								async.waterfall([
									// Get data collection
									function (next) {
										data.getDataCollection(item.setting.object).then(function (dataCollection) {
											next(null, dataCollection);
										});
									},
									// Render form component
									function (dataCollection, next) {
										self.render(self.componentIds.editForm, item.id, item.setting, true, dataCollection, showAll);
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
										propValues[self.componentIds.isSaveVisible] = item.setting.saveVisible || 'hide';
										propValues[self.componentIds.isCancelVisible] = item.setting.cancelVisible || 'hide';
										$$(self.componentIds.propertyView).setValues(propValues);

										$$(self.componentIds.propertyView).refresh();
									});
							};

							self.setReturnPage = function (viewId, pageId) {
								var data = self.getData(viewId);

								data.returnPage = pageId;
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

							self.populateSelectivityValues = function (viewId) {
								var data = self.getData(viewId),
									modelData = data.dataCollection.AD.currModel();

								$$(viewId).getChildViews().forEach(function (cView) {
									// Find selectivity field
									if (cView.config.editor === 'selectivity') {
										var nodeItem = $(cView.$view).find('.ab-form-connect-data');

										if (modelData) {
											selectedValues = modelData[cView.config.name].attr ? modelData[cView.config.name].attr() : modelData[cView.config.name];

											self.controllers.SelectivityHelper.setData(nodeItem, selectedValues.map(function (d) {
												return {
													id: d.id,
													text: d.dataLabel
												};
											}));
										}
										else {
											// Clear selectivity
											self.controllers.SelectivityHelper.setData(nodeItem, []);
										}
									}
								});
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