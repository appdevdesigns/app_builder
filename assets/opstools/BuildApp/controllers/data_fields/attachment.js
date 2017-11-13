steal(function () {
	var componentIds = {
		editView: 'ab-new-attachment'
	};

	// General settings
	var attachmentDataField = {
		name: 'attachment',
		type: 'file', // http://sailsjs.org/documentation/concepts/models-and-orm/attributes#?attribute-options
		icon: 'file',
		menuName: 'Attachment',
		includeHeader: true,
		description: ''
	};

	// Edit definition
	attachmentDataField.editDefinition = {
		id: componentIds.editView,
		rows: [
			{ view: "label", label: "Under construction..." }
		]
	};

	// Populate settings (when Edit field)
	attachmentDataField.populateSettings = function (application, data) {
		if (!data) return;

		// TODO:
	};

	// For save field
	attachmentDataField.getSettings = function () {
		// TODO:
		// fieldName = base.getFieldName(self.componentIds.attachmentView);
		// fieldLabel = base.getFieldLabel(self.componentIds.attachmentView);
		// fieldSettings.icon = self.componentIds.attachmentIcon;

		return null;
	};

	// Reset state
	attachmentDataField.resetState = function () {
		// TODO:
	};

	return attachmentDataField;

});