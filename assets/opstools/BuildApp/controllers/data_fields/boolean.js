steal(function () {
	var componentIds = {
		editView: 'ab-new-boolean'
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
		rows: []
	};

	// Populate settings (when Edit field)
	boolDataField.populateSettings = function (application, data) {
	};

	// For save field
	boolDataField.getSettings = function () {
		return {
			fieldName: boolDataField.name,
			type: boolDataField.type,
			setting: {
				icon: boolDataField.icon,
				// editor: 'inline-text', // http://docs.webix.com/desktop__editing.html
				filter_type: 'boolean',
				template: '<div class="ab-boolean-display">{common.checkbox()}</div>'
			}
		};
	};

	boolDataField.customDisplay = function (application, object, fieldData, rowId, data, itemNode, options) {
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
	};

	return boolDataField;
});