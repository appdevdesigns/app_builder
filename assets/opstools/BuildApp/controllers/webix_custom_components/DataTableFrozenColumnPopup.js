steal(
	// List your Controller's dependencies here:
	function () {
		System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control').then(function () {

					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.DataTableFrozenColumnPopup', {
						init: function (element, options) {
							var self = this;
							options = AD.defaults({
							}, options);
							this.options = options;

							// Call parent init
							this._super(element, options);

							this.data = {};

							this.componentIds = {
								frozenPopup: 'ab-frozen-popup',
								fieldsList: 'ab-frozen-field-list'
							};

							this.initWebixControls();
						},

						initWebixControls: function () {
							var self = this;

							webix.protoUI({
								id: self.componentIds.frozenPopup,
								name: 'frozen_popup',
								$init: function (config) {
									//functions executed on component initialization
								},
								defaults: {
									width: 500,
									body: {
										rows: [
											{
												view: 'list',
												id: self.componentIds.fieldsList,
												width: 250,
												autoheight: true,
												select: false,
												template: '<span style="min-width: 18px; display: inline-block;"><i class="fa fa-circle-o ab-frozen-field-icon"></i>&nbsp;</span> #label#',
												on: {
													onItemClick: function (id, e, node) {
														self.dataTable.define('leftSplit', self.dataTable.getColumnIndex(id) + 1);
														self.dataTable.refreshColumns();

														$$(self.componentIds.frozenPopup).refreshShowIcons();
														$$(self.componentIds.frozenPopup).callChangeEvent();
													}
												}
											},
											{
												view: 'button', value: 'Clear all', click: function () {
													self.dataTable.define('leftSplit', 0);
													self.dataTable.refreshColumns();

													$$(self.componentIds.frozenPopup).refreshShowIcons();
													$$(self.componentIds.frozenPopup).callChangeEvent();
												}
											}
										]
									},
									on: {
										onShow: function () {
											$$(self.componentIds.frozenPopup).refreshShowIcons();
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

								refreshShowIcons: function () {
									$('.ab-frozen-field-icon').hide();

									if (self.dataTable) {
										for (var i = 0; i < self.dataTable.config.leftSplit; i++) {
											var c = self.dataTable.config.columns[i];
											$($$(self.componentIds.fieldsList).getItemNode(c.id)).find('.ab-frozen-field-icon').show();
										}
									}
								},

								callChangeEvent: function () {
									$$(self.componentIds.frozenPopup).callEvent('onChange', [self.dataTable.config.leftSplit]);
								}
							}, webix.ui.popup);
						}


					});
				})
		});
	}
);