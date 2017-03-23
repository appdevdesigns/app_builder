steal(function () {
	var componentIds = {
		editView: 'ab-new-boolean',
		default: 'ab-new-boolean-default',
	};

	// General settings
	var boolDataField = {
		name: 'boolean',
		type: 'boolean', // http://sailsjs.org/documentation/concepts/models-and-orm/attributes#?attribute-options
		icon: 'check-square-o',
		menuName: AD.lang.label.getLabel('ab.dataField.boolean.menuName') || 'Checkbox',
		includeHeader: true,
		description: AD.lang.label.getLabel('ab.dataField.boolean.description') || 'A single checkbox that can be checked or unchecked.'
	};

	// Edit definition
	boolDataField.editDefinition = {
		id: componentIds.editView,
		rows: [
			{
				id: componentIds.default,
				view: "checkbox",
				label: "Default",
				labelPosition: "left",
				labelWidth: 70,
				labelRight: 'Uncheck',
				css: "webix_table_checkbox",
				on: {
					onChange: function (newVal, oldVal) {
						this.define('labelRight', newVal ? 'Check' : 'Uncheck');
						this.refresh();
					}
				}
			}
		]
	};

	// Populate settings (when Edit field)
	boolDataField.populateSettings = function (application, data) {
		if (data.setting && data.setting.default != null) {
			$$(componentIds.default).setValue(data.setting.default);
			$$(componentIds.default).refresh();
		}
	};

	// For save field
	boolDataField.getSettings = function () {
		return {
			fieldName: boolDataField.name,
			type: boolDataField.type,
			setting: {
				icon: boolDataField.icon,
				filter_type: 'boolean',
				css: 'center',
				template: '<div class="ab-boolean-display">{common.checkbox()}</div>',
				default: $$(componentIds.default).getValue() ? true : false
			}
		};
	};

	boolDataField.customDisplay = function (application, object, fieldData, rowData, data, viewId, itemNode, options) {
		if (options.readOnly) {
			var checkboxHtml;

			if (data)
				checkboxHtml = "<div class='webix_icon fa-check-square-o'></div>";
			else
				checkboxHtml = "<div class='webix_icon fa-square-o'></div>";

			$(itemNode).find('.ab-boolean-display').html(checkboxHtml);

			return true;
		}
		else {
			return false;
		}
	};

	boolDataField.customEdit = function (application, object, fieldData, dataId, itemNode) {
		return false;
	};

	// Reset state
	boolDataField.resetState = function () {
		$$(componentIds.default).setValue(false);
	};

	return boolDataField;
});