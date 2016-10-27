steal(
	// List your Controller's dependencies here:
	function () {
		var data = {},
			componentIds = {
				defineLabelPopup: 'ab-define-label-popup',

				labelFormat: 'ab-define-label-format',
				fieldsList: 'ab-define-label-field-list',

				saveButton: 'ab-define-label-save-button'
			},
			labels = {
				common: {
					save: AD.lang.label.getLabel('ab.common.save') || "Save",
					cancel: AD.lang.label.getLabel('ab.common.cancel') || "Cancel"
				},
				define_label: {
					labelFormat: AD.lang.label.getLabel('ab.define_label.labelFormat') || "Label format",
					selectFieldToGenerate: AD.lang.label.getLabel('ab.define_label.selectFieldToGenerate') || "Select field item to generate format.",
					labelFields: AD.lang.label.getLabel('ab.define_label.labelFields') || "Fields",

					loadError: AD.lang.label.getLabel('ab.define_label.loadError') || "System could not load label format data"
				}
			};

		webix.protoUI({
			id: componentIds.defineLabelPopup,
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
							label: "<b>{0}</b>".replace("{0}", labels.define_label.labelFormat)
						},
						{
							view: "textarea",
							id: componentIds.labelFormat,
							height: 100
						},
						{
							view: "label",
							label: labels.define_label.selectFieldToGenerate
						},
						{
							view: "label",
							label: "<b>{0}</b>".replace("{0}", labels.define_label.labelFields)
						},
						{
							view: 'list',
							id: componentIds.fieldsList,
							width: 500,
							maxHeight: 180,
							select: false,
							template: '#label#',
							on: {
								onItemClick: function (id, e, node) {
									var selectedItem = $$(componentIds.fieldsList).getItem(id);

									var labelFormat = $$(componentIds.labelFormat).getValue();
									labelFormat += '{{0}}'.replace('{0}', selectedItem.label);

									$$(componentIds.labelFormat).setValue(labelFormat);
								}
							}
						},
						{
							height: 10
						},
						{
							cols: [
								{
									view: "button", id: componentIds.saveButton, label: labels.common.save, type: "form", width: 120, click: function () {
										var base = this,
											labelFormat = $$(componentIds.labelFormat).getValue();

										if (!$$(componentIds.fieldsList).showProgress)
											webix.extend($$(componentIds.fieldsList), webix.ProgressBar);

										$$(componentIds.fieldsList).showProgress({ type: 'icon' });

										$$(componentIds.fieldsList).data.each(function (d) {
											labelFormat = labelFormat.replace(new RegExp('{' + d.label + '}', 'g'), '{' + d.id + '}');
										});

										AD.classes.AppBuilder.currApp.currObj.attr('labelFormat', labelFormat);
										AD.classes.AppBuilder.currApp.currObj.save()
											.fail(function (err) {
												$$(componentIds.fieldsList).hideProgress();
												// TODO : Error message
											})
											.then(function () {
												$$(componentIds.fieldsList).hideProgress();

												base.getTopParentView().hide();
											});

									}
								},
								{
									view: "button", value: labels.common.cancel, width: 100, click: function () {
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

						$$(componentIds.labelFormat).setValue('');

						$$(componentIds.labelFormat).enable();
						$$(componentIds.fieldsList).enable();
						$$(componentIds.saveButton).enable();

						if (labelFormat) {
							if ($$(componentIds.fieldsList).data && $$(componentIds.fieldsList).data.count() > 0) {
								$$(componentIds.fieldsList).data.each(function (d) {
									labelFormat = labelFormat.replace('{' + d.id + '}', '{' + d.label + '}');
								});
							}
						}
						else { // Default label format
							if (data.fieldList && data.fieldList.length > 0)
								labelFormat = '{' + data.fieldList[0].label + '}';
						}

						$$(componentIds.labelFormat).setValue(labelFormat || '');

					}
				}
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

		}, webix.ui.popup);

	}
);