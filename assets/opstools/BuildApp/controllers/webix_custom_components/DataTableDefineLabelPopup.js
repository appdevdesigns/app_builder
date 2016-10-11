steal(
	// List your Controller's dependencies here:
	function () {
		System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control').then(function () {

					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.DataTableDefineLabelPopup', {
						init: function (element, options) {
							var self = this;
							options = AD.defaults({
							}, options);
							this.options = options;

							// Call parent init
							this._super(element, options);

							this.data = {};

							this.componentIds = {
								defineLabelPopup: 'ab-define-label-popup',

								labelFormat: 'ab-define-label-format',
								fieldsList: 'ab-define-label-field-list',

								saveButton: 'ab-define-label-save-button'
							};

							this.initMultilingualLabels();
							this.initWebixControls();
						},

						initMultilingualLabels: function () {
							var self = this;
							self.labels = {};
							self.labels.common = {};
							self.labels.define_label = {};

							self.labels.common.save = AD.lang.label.getLabel('ab.common.save') || "Save";
							self.labels.common.cancel = AD.lang.label.getLabel('ab.common.cancel') || "Cancel";

							self.labels.define_label.labelFormat = AD.lang.label.getLabel('ab.define_label.labelFormat') || "Label format";
							self.labels.define_label.selectFieldToGenerate = AD.lang.label.getLabel('ab.define_label.selectFieldToGenerate') || "Select field item to generate format.";
							self.labels.define_label.labelFields = AD.lang.label.getLabel('ab.define_label.labelFields') || "Fields";

							self.labels.define_label.loadError = AD.lang.label.getLabel('ab.define_label.loadError') || "System could not load label format data";
						},

						initWebixControls: function () {
							var self = this;

							webix.protoUI({
								id: self.componentIds.defineLabelPopup,
								name: 'define_label_popup',
								$init: function (config) {
									//functions executed on component initialization
								},
								defaults: {
									modal: true,
									width: 500,
									body: {
										rows: [
											{
												view: "label",
												label: "<b>{0}</b>".replace("{0}", self.labels.define_label.labelFormat)
											},
											{
												view: "textarea",
												id: self.componentIds.labelFormat,
												height: 100
											},
											{
												view: "label",
												label: self.labels.define_label.selectFieldToGenerate
											},
											{
												view: "label",
												label: "<b>{0}</b>".replace("{0}", self.labels.define_label.labelFields)
											},
											{
												view: 'list',
												id: self.componentIds.fieldsList,
												width: 500,
												maxHeight: 180,
												select: false,
												template: '#label#',
												on: {
													onItemClick: function (id, e, node) {
														var selectedItem = $$(self.componentIds.fieldsList).getItem(id);

														var labelFormat = $$(self.componentIds.labelFormat).getValue();
														labelFormat += '{{0}}'.replace('{0}', selectedItem.label);

														$$(self.componentIds.labelFormat).setValue(labelFormat);
													}
												}
											},
											{
												height: 10
											},
											{
												cols: [
													{
														view: "button", id: self.componentIds.saveButton, label: self.labels.common.save, type: "form", width: 120, click: function () {
															var base = this,
																labelFormat = $$(self.componentIds.labelFormat).getValue();

															$$(self.componentIds.fieldsList).data.each(function (d) {
																labelFormat = labelFormat.replace(new RegExp('{' + d.label + '}', 'g'), '{' + d.id + '}');
															});

															AD.classes.AppBuilder.currApp.currObj.attr('labelFormat', labelFormat);
															AD.classes.AppBuilder.currApp.currObj.save()
																.fail(function (err) {
																	// TODO : Error message
																})
																.then(function () {
																	base.getTopParentView().hide();
																});

														}
													},
													{
														view: "button", value: self.labels.common.cancel, width: 100, click: function () {
															this.getTopParentView().hide();
														}
													}
												]
											}
										]
									},
									on: {
										onShow: function () {
											var labelFormat = AD.classes.AppBuilder.currApp.currObj.labelFormat;

											$$(self.componentIds.labelFormat).setValue('');

											$$(self.componentIds.labelFormat).enable();
											$$(self.componentIds.fieldsList).enable();
											$$(self.componentIds.saveButton).enable();

											if (labelFormat) {
												if ($$(self.componentIds.fieldsList).data && $$(self.componentIds.fieldsList).data.count() > 0) {
													$$(self.componentIds.fieldsList).data.each(function (d) {
														labelFormat = labelFormat.replace('{' + d.id + '}', '{' + d.label + '}');
													});
												}
											}
											else { // Default label format
												if (self.data.fieldList && self.data.fieldList.length > 0)
													labelFormat = '{' + self.data.fieldList[0].label + '}';
											}

											$$(self.componentIds.labelFormat).setValue(labelFormat || '');

										}
									}
								},

								registerDataTable: function (dataTable) {
									self.dataTable = dataTable;
								},

								setFieldList: function (fieldList) {
									// We can remove it when we can get all column from webix datatable (include hidden fields)
									self.data.fieldList = fieldList;

									this.bindFieldList();
								},

								bindFieldList: function () {
									$$(self.componentIds.fieldsList).clearAll();
									$$(self.componentIds.fieldsList).parse(this.getFieldList());
								},

								getFieldList: function () {
									var fieldList = [];

									// Get all columns include hidden columns
									if (self.data.fieldList) {
										self.data.fieldList.forEach(function (f) {
											fieldList.push({
												id: f.name,
												label: f.label
											});
										});
									}

									return fieldList;
								},

							}, webix.ui.popup);
						}


					});
				})
		});
	}
);