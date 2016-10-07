steal(function () {
	var componentIds = {
		editView: 'ab-new-attachment',
		headerName: 'ab-new-attachment-header',
		labelName: 'ab-new-attachment-label'
	};

	// General settings
	var attachmentDataField = {
		name: 'attachment',
		type: 'file', // http://sailsjs.org/documentation/concepts/models-and-orm/attributes#?attribute-options
		icon: 'file',
		menuName: 'Attachment'
	};

	// Edit definition
	attachmentDataField.editDefinition = {
		id: componentIds.editView,
		rows: [
			{
				view: "label",
				label: "<span class='webix_icon fa-{0}'></span>{1}".replace('{0}', attachmentDataField.icon).replace('{1}', attachmentDataField.menuName)
			},
			{ view: "label", label: "Under construction..." }
		]
	};

	// Populate settings (when Edit field)
	attachmentDataField.populateSettings = function (data) {
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