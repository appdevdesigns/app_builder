steal(
	// List your Controller's dependencies here:
	function () {
		var data = {},
			dataTable,
			componentIds = {
				frozenPopup: 'ab-frozen-popup',
				fieldsList: 'ab-frozen-field-list'
			},
			labels = {
				frozen_fields: {
					clearAll: AD.lang.label.getLabel('ab.frozen_fields.clearAll') || "Clear all"
				}
			};

		webix.protoUI({
			id: componentIds.frozenPopup,
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
							id: componentIds.fieldsList,
							width: 250,
							autoheight: true,
							select: false,
							template: '<span style="min-width: 18px; display: inline-block;"><i class="fa fa-circle-o ab-frozen-field-icon"></i>&nbsp;</span> #label#',
							on: {
								onItemClick: function (id, e, node) {
									dataTable.define('leftSplit', dataTable.getColumnIndex(id) + 1);
									dataTable.refreshColumns();

									$$(componentIds.frozenPopup).refreshShowIcons();
									$$(componentIds.frozenPopup).callChangeEvent();
								}
							}
						},
						{
							view: 'button', value: labels.frozen_fields.clearAll, click: function () {
								dataTable.define('leftSplit', 0);
								dataTable.refreshColumns();

								$$(componentIds.frozenPopup).refreshShowIcons();
								$$(componentIds.frozenPopup).callChangeEvent();
							}
						}
					]
				},
				on: {
					onShow: function () {
						$$(componentIds.frozenPopup).refreshShowIcons();
					}
				}
			},

			registerDataTable: function (dt) {
				dataTable = dt;
			},

			setFieldList: function (fieldList) {
				// We can remove it when we can get all column from webix datatable (include hidden fields)
				data.fieldList = fieldList;

				this.bindFieldList();
			},

			bindFieldList: function () {
				$$(componentIds.fieldsList).clearAll();
				$$(componentIds.fieldsList).parse(this.getFieldList());
			},

			getFieldList: function () {
				var fieldList = [];

				// Get all columns include hidden columns
				if (data.fieldList) {
					data.fieldList.forEach(function (f) {
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

				if (dataTable) {
					for (var i = 0; i < dataTable.config.leftSplit; i++) {
						var c = dataTable.config.columns[i];
						$($$(componentIds.fieldsList).getItemNode(c.id)).find('.ab-frozen-field-icon').show();
					}
				}
			},

			callChangeEvent: function () {
				$$(componentIds.frozenPopup).callEvent('onChange', [dataTable.config.leftSplit]);
			}
		}, webix.ui.popup);

	}
);
