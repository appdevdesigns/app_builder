steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/models/ABObject.js',
	'opstools/BuildApp/models/ABColumn.js',

	'opstools/BuildApp/controllers/webix_custom_components/DragForm.js',
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
							self.events = {};
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
							// var DragForm = AD.Control.get('opstools.BuildApp.DragForm');
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

								propertyView: self.info.name + '-property-view',
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
									padding: 10,
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
												case self.componentIds.selectObject:
												case self.componentIds.isSaveVisible:
												case self.componentIds.isCancelVisible:
													var settings = self.getSettings();
													self.populateSettings(settings, true);
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

							self.getEvent = function (viewId) {
								if (!self.events[viewId]) self.events[viewId] = {};

								return self.events[viewId];
							};

							self.render = function (viewId, settings, editable, defaultShowAll) {
								var data = self.getData(viewId);

								data.columns = null;

								settings.visibleFieldIds = settings.visibleFieldIds || [];

								$$(viewId).clear();
								$$(viewId).clearValidation();

								// Clear views - redraw
								webix.ui([], $$(viewId));

								if (!settings.object) return;

								webix.extend($$(viewId), webix.ProgressBar);
								$$(viewId).showProgress({ type: "icon" });

								// Get object list
								data.objectId = settings.object;
								self.Model.ABColumn.findAll({ object: settings.object })
									.fail(function (err) { $$(viewId).hideProgress(); }) // TODO message
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

											$$(viewId).addView(element);
										});

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
												disabled: true,
												click: function () {
													$$(self.componentIds.saveButton).disable();

													var formView = this.getTopParentView();
													$$(formView).showProgress({ type: "icon" });

													var data = self.getData(viewId),
														modelData;

													async.series([
														function (next) {
															self.getModelData(data.objectId, data.modelDataId)
																.fail(function (err) { next(err) })
																.then(function (result) {
																	modelData = result;
																	next();
																})
														},
														function (next) {
															var editValues = $$(formView).getValues(),
																keys = Object.keys(editValues);

															keys.forEach(function (k) {
																modelData.attr(k, editValues[k]);
															});

															modelData.save()
																.fail(function (err) { next(err); })
																.then(function (result) {
																	next();
																});
														},
														function (next) {
															$$(formView).setValues({});
															$$(formView).hideProgress();

															var events = self.getEvent(viewId);
															if (events.save)
																events.save(data.modelDataId);

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
													$$(self.componentIds.saveButton).disable();
													$$(this.getTopParentView()).setValues({});

													var data = self.getData(viewId),
														events = self.getEvent(viewId);

													data.modelDataId = null;

													if (events.cancel)
														events.cancel();
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
									});
							};

							self.populateData = function (viewId, objectId, dataId) {
								var data = self.getData(viewId);

								if (data.objectId != objectId) return; // Validate object

								$$(viewId).showProgress({ type: "icon" });

								data.modelDataId = dataId;

								self.getModelData(objectId, dataId)
									.fail(function (err) {
										// TODO : Error message
									})
									.then(function (result) {
										$$(viewId).setValues(result.attr());

										$$(viewId).hideProgress();
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
									object: propertyValues[self.componentIds.selectObject],
									visibleFieldIds: visibleFieldIds,
									saveVisible: propertyValues[self.componentIds.isSaveVisible],
									cancelVisible: propertyValues[self.componentIds.isCancelVisible]
								};

								return settings;
							};

							self.populateSettings = function (settings, defaultShowAll) {
								// Render form component
								self.render(self.componentIds.editForm, settings, true, defaultShowAll);

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
										var item = $$(self.componentIds.propertyView).getItem(self.componentIds.selectObject);
										item.options = $.map(data.objects, function (o) {
											return {
												id: o.id,
												value: o.label
											};
										});

										// Set property values
										var propValues = {};
										propValues[self.componentIds.selectObject] = settings.object;
										propValues[self.componentIds.isSaveVisible] = settings.saveVisible || 'hide';
										propValues[self.componentIds.isCancelVisible] = settings.cancelVisible || 'hide';
										$$(self.componentIds.propertyView).setValues(propValues);

										$$(self.componentIds.propertyView).refresh();
									});
							};

							self.getModelData = function (objectId, dataId) {
								var q = $.Deferred(),
									object, objectModel;

								async.series([
									function (next) {
										self.Model.ABObject.findOne({ id: objectId })
											.fail(function (err) { next(err); })
											.then(function (result) {
												object = result;
												next();
											})
									},
									function (next) {
										self.controllers.ModelCreator.getModel(object.name)
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

												// Populate data to form
												if (result.translate) result.translate();

												next();
												q.resolve(result);
											});
									}
								]);

								return q;
							};

							self.registerSaveEvent = function (viewId, saveEvent) {
								var events = self.getEvent(viewId);

								if (saveEvent)
									events.save = saveEvent;
							};

							self.registerCancelEvent = function (viewId, cancelEvent) {
								var events = self.getEvent(viewId);

								if (cancelEvent)
									events.cancel = cancelEvent;
							};

							self.editStop = function () {
							};

						},

						getInstance: function () {
							return this;
						},

						setObjectList: function (objectList) {
							this.data.objectList = objectList;
						}

					});

				});
		});
	}
);