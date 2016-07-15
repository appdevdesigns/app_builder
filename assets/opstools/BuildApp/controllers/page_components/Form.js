steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/models/ABObject.js',
	'opstools/BuildApp/models/ABColumn.js',

	'opstools/BuildApp/controllers/webix_custom_components/DragForm.js',
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
								ABColumn: AD.Model.get('opstools.BuildApp.ABColumn')
							};

							// Controllers
							// var DragForm = AD.Control.get('opstools.BuildApp.DragForm');
							var ConnectedDataPopup = AD.Control.get('opstools.BuildApp.ConnectedDataPopup'),
								SelectivityHelper = AD.Control.get('opstools.BuildApp.SelectivityHelper');

							self.controllers = {
								// DragForm: new DragForm()
								ConnectedDataPopup: new ConnectedDataPopup(),
								SelectivityHelper: new SelectivityHelper()
							};

							self.componentIds = {
								editView: self.info.name + '-edit-view',
								editForm: 'ab-form-edit-mode',

								propertyView: self.info.name + '-property-view',
								selectObject: self.info.name + '-select-object',

								addConnectObjectDataPopup: 'ab-' + self.info.name + '-connected-data-popup'
							};

							webix.ui({
								id: self.componentIds.addConnectObjectDataPopup,
								view: "connected_data_popup",
							});

							$$(self.componentIds.addConnectObjectDataPopup).registerSelectChangeEvent(function (selectedItems) {
								if (self.data.updatingItem)
									self.controllers.SelectivityHelper.setData(self.data.updatingItem, selectedItems);
							});

							$$(self.componentIds.addConnectObjectDataPopup).registerCloseEvent(function (selectedItems) {
								if (self.data.updatingItem)
									self.controllers.SelectivityHelper.setData(self.data.updatingItem, selectedItems);

								self.data.updatingItem = null;
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
										}
									],
									on: {
										onAfterEditStop: function (state, editor, ignoreUpdate) {
											if (ignoreUpdate || state.old == state.value) return false;

											var propertyValues = $$(self.componentIds.propertyView).getValues();

											switch (editor.id) {
												case self.componentIds.selectObject:
													var settings = self.getSettings();

													self.populateSettings(settings);
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

							self.render = function (viewId, settings, editable) {
								self.data.columns = null;

								$$(viewId).clear();
								$$(viewId).clearValidation();

								// Clear views - redraw
								webix.ui([], $$(viewId));

								if (!settings.object) return;

								webix.extend($$(viewId), webix.ProgressBar);
								$$(viewId).showProgress({ type: "icon" });

								// Get object list
								self.Model.ABColumn.findAll({ object: settings.object })
									.fail(function (err) { $$(viewId).hideProgress(); }) // TODO message
									.then(function (data) {
										data.forEach(function (d) {
											if (d.translate) d.translate();
										});

										self.data.columns = data;

										// Set default visible field ids
										if (editable && self.data.columns.filter(function (c) { return settings.visibleFieldIds.indexOf(c.id.toString()) > -1 }).length < 1)
											settings.visibleFieldIds = $.map(self.data.columns.attr(), function (c) {
												return [c.id.toString()];
											});

										self.data.columns.forEach(function (c) {
											var isVisible = settings.visibleFieldIds.indexOf(c.id.toString()) > -1;

											if (!editable && !isVisible) return; // Hidden

											var element = {
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

										$$(viewId).refresh();

										self.controllers.SelectivityHelper.renderSelectivity('ab-form-connect-data');

										$('.ab-form-connect-data').click(function () {
											var item = $(this),
												objectId = item.data('object'),
												multiple = item.data('multiple');

											self.data.updatingItem = item;

											var object = self.data.objectList.filter(function (obj) { return obj.id == objectId; });

											if (object && object.length > 0) {
												var selectedIds = $.map(self.controllers.SelectivityHelper.getData(item), function (d) { return d.id; });

												$$(self.componentIds.addConnectObjectDataPopup).open(object[0], selectedIds, multiple);
											}
										});

										$$(viewId).hideProgress();
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
									visibleFieldIds: visibleFieldIds
								};

								return settings;
							};

							self.populateSettings = function (settings) {
								if (!settings.visibleFieldIds) settings.visibleFieldIds = [];

								// Render form component
								self.render(self.componentIds.editForm, settings, true);

								// Get object list
								self.data.objects = null;
								self.Model.ABObject.findAll({ application: self.data.app.id })
									.fail(function (err) { callback(err); })
									.then(function (result) {
										result.forEach(function (o) {
											if (o.translate)
												o.translate();
										});

										self.data.objects = result;

										// Properties

										// Data source - Object
										var item = $$(self.componentIds.propertyView).getItem(self.componentIds.selectObject);
										item.options = $.map(self.data.objects, function (o) {
											return {
												id: o.id,
												value: o.label
											};
										});

										// Set property values
										var propValues = {};
										propValues[self.componentIds.selectObject] = settings.object;
										$$(self.componentIds.propertyView).setValues(propValues);

										$$(self.componentIds.propertyView).refresh();
									});
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