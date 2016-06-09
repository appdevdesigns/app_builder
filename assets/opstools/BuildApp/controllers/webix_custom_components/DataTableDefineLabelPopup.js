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

							this.initWebixControls();
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
												label: "<b>{0}</b>".replace("{0}", "Label format")
											},
											{
												view: "textarea",
												id: self.componentIds.labelFormat,
												height: 100,
												on: {
													onBeforeRender: function (data) {
														console.log('onBeforeRender: ', data);
													}
												}
											},
											{
												view: "label",
												label: "Select field item to generate format."
											},
											{
												view: "label",
												label: "<b>{0}</b>".replace("{0}", "Fields")
											},
											{
												view: 'list',
												id: self.componentIds.fieldsList,
												width: 500,
												autoheight: true,
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
														view: "button", id: self.componentIds.saveButton, label: "Save", type: "form", width: 120, click: function () {
															var labelFormat = $$(self.componentIds.labelFormat).getValue();
															$$(self.componentIds.fieldsList).data.each(function (d) {
																labelFormat = labelFormat.replace('{' + d.label + '}', '{' + d.id + '}');
															});

															if (self.saveLabelEvent)
																self.saveLabelEvent(labelFormat);
														}
													},
													{
														view: "button", value: "Cancel", width: 100, click: function () {
															this.getTopParentView().hide();
														}
													}
												]
											}
										]
									},
									on: {
										onShow: function () {
											$$(self.componentIds.labelFormat).setValue('');

											if (!self.loadLabelEvent) return;

											$$(self.componentIds.labelFormat).disable();
											$$(self.componentIds.fieldsList).disable();
											$$(self.componentIds.saveButton).disable();

											self.loadLabelEvent()
												.fail(function (err) {
													webix.message({
														type: "error",
														text: 'System could not load label format data'
													});
												})
												.then(function (labelFormat) {
													$$(self.componentIds.labelFormat).enable();
													$$(self.componentIds.fieldsList).enable();
													$$(self.componentIds.saveButton).enable();

													if (!labelFormat) return;

													if ($$(self.componentIds.fieldsList).data && $$(self.componentIds.fieldsList).data.count() > 0) {
														$$(self.componentIds.fieldsList).data.each(function (d) {
															labelFormat = labelFormat.replace('{' + d.id + '}', '{' + d.label + '}');
														});
													}

													$$(self.componentIds.labelFormat).setValue(labelFormat);
												});

										}
									}
								},

								registerDataTable: function (dataTable) {
									self.dataTable = dataTable;
								},

								registerLoadLabelEvent: function (loadLabelEvent) {
									self.loadLabelEvent = loadLabelEvent;
								},

								registerSaveLabelEvent: function (saveLabelEvent) {
									self.saveLabelEvent = saveLabelEvent;
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