steal(function () {
	var componentIds = {
		editView: 'ab-new-select-list',
		headerName: 'ab-new-select-header',
		labelName: 'ab-new-select-label',
		listOptions: 'ab-new-select-option',
		newOption: 'ab-new-select-new',
	};

	// General settings
	var listDataField = {
		name: 'list',
		type: 'string', // http://sailsjs.org/documentation/concepts/models-and-orm/attributes#?attribute-options
		icon: 'th-list',
		menuName: 'Select list'
	};

	var removedOptionIds = [];

	// Edit definition
	listDataField.editDefinition = {
		id: componentIds.editView,
		rows: [
			{
				view: "label",
				label: "<span class='webix_icon fa-{0}'></span>{1}".replace('{0}', listDataField.icon).replace('{1}', listDataField.menuName)
			},
			{
				view: "text",
				id: componentIds.headerName,
				label: "Name",
				placeholder: "Name",
				labelWidth: 50,
				css: 'ab-new-field-name', // Highlight this when open
				on: {
					onChange: function (newValue, oldValue) {
						if (oldValue == $$(componentIds.labelName).getValue())
							$$(componentIds.labelName).setValue(newValue);
					}
				}
			},
			{
				view: "text",
				id: componentIds.labelName,
				label: 'Label',
				placeholder: 'Header name',
				labelWidth: 50,
				css: 'ab-new-label-name'
			},
			{
				view: "template",
				template: "Single select allows you to select a single predefined options below from a dropdown.",
				autoheight: true,
				borderless: true
			},
			{ view: "label", label: "<b>{0}</b>".replace('{0}', "Options") },
			{
				view: "editlist",
				id: componentIds.listOptions,
				template: "<div style='position: relative;'>#label#<i class='ab-new-field-remove fa fa-remove' style='position: absolute; top: 7px; right: 7px;'></i></div>",
				autoheight: true,
				drag: true,
				editable: true,
				editor: "text",
				editValue: "label",
				onClick: {
					"ab-new-field-remove": function (e, id, trg) {
						// Store removed id to array
						if (!id.startsWith('temp_'))
							removedOptionIds.push(id);

						$$(componentIds.listOptions).remove(id);
					}
				}
			},
			{
				view: "button",
				value: "Add new option",
				click: function () {
					var temp_id = 'temp_' + webix.uid();
					var itemId = $$(componentIds.listOptions).add({ id: temp_id, dataId: temp_id, label: '' }, $$(componentIds.listOptions).count());
					$$(componentIds.listOptions).edit(itemId);
				}
			}
		]
	};

	// Populate settings (when Edit field)
	listDataField.populateSettings = function (data) {
		$$(componentIds.headerName).setValue(data.name.replace(/_/g, ' '));
		$$(componentIds.labelName).setValue(data.label);

		var options = [];
		data.setting.options.forEach(function (opt) {
			options.push({
				dataId: opt.dataId,
				id: opt.id,
				label: opt.label
			});
		});
		$$(componentIds.listOptions).parse(options);
		$$(componentIds.listOptions).refresh();
	};

	// For save field
	listDataField.getSettings = function () {
		var fieldInfo = {
			options: [],
			setting: {
				filter_options: []
			}
		};

		$$(componentIds.listOptions).editStop(); // Close edit mode

		$$(componentIds.listOptions).data.each(function (opt) {
			var optId = typeof opt.dataId == 'string' && opt.dataId.startsWith('temp') ? null : opt.dataId;

			fieldInfo.options.push({ dataId: optId, id: opt.label.replace(/ /g, '_'), value: opt.label });

			fieldInfo.setting.filter_options.push(opt.label);
		});

		// Filter value is not empty
		fieldInfo.setting.filter_options = $.grep(fieldInfo.setting.filter_options, function (name) { return name && name.length > 0; });
		fieldInfo.options = $.grep(fieldInfo.options, function (opt) { return opt && opt.value && opt.value.length > 0; });

		if (fieldInfo.options.length < 1) {
			webix.alert({
				title: self.labels.add_fields.requireListOptionTitle,
				ok: self.labels.common.ok,
				text: self.labels.add_fields.requireListOptionDescription
			})

			return null;
		}

		fieldInfo.name = $$(componentIds.headerName).getValue();
		fieldInfo.label = $$(componentIds.labelName).getValue();
		fieldInfo.fieldName = listDataField.name;
		fieldInfo.type = 'string';
		fieldInfo.setting.icon = listDataField.icon;
		fieldInfo.setting.filter_type = 'list';
		fieldInfo.setting.editor = 'richselect';

		return fieldInfo;
	};

	// Reset state
	listDataField.resetState = function () {
		$$(componentIds.headerName).setValue('');
		$$(componentIds.headerName).enable();
		$$(componentIds.labelName).setValue('');

		$$(componentIds.listOptions).editCancel();
		$$(componentIds.listOptions).unselectAll();
		$$(componentIds.listOptions).clearAll();

		removedOptionIds = [];
	};

	return listDataField;

});