steal(
	'js/webix-extras/ckeditor.js',

	function () {
	var componentIds = {
		editView: 'ab-new-richText',
		editorId: 'ckeditor-richtext',
		supportMultilingual: 'ab-new-richText-support-multilingual',
	};

	// General settings
	var richTextDataField = {
		name: 'richText',
		type: 'text', // http://sailsjs.org/documentation/concepts/models-and-orm/attributes#?attribute-options
		icon: 'align-right',
		menuName: AD.lang.label.getLabel('ab.dataField.richText.menuName') || 'Rich Text',
		includeHeader: true,
		description: AD.lang.label.getLabel('ab.dataField.richText.description') || 'A long text field that utilizes a WYSIWYG editor toolbar.'
	};

	// Edit definition
	richTextDataField.editDefinition = {
		id: componentIds.editView,
		rows: [
			{
				view: "checkbox",
				id: componentIds.supportMultilingual,
				labelRight: AD.lang.label.getLabel('ab.dataField.richText.supportMultilingual') || 'Support multilingual',
				labelWidth: 0,
				value: true
			}
		]
	};

	// Populate settings (when Edit field)
	richTextDataField.populateSettings = function (application, data) {
		if (!data.setting) return;

		$$(componentIds.supportMultilingual).setValue(data.setting.supportMultilingual);
	};

	// For save field
	richTextDataField.getSettings = function () {
		return {
			fieldName: richTextDataField.name,
			type: richTextDataField.type,
			setting: {
				editorId: componentIds.editorId,
				icon: richTextDataField.icon,
				editor: 'richtext', // http://docs.webix.com/desktop__editing.html
				filter_type: 'text', // DataTableFilterPopup - filter type
				supportMultilingual: $$(componentIds.supportMultilingual).getValue()
			}
		};
	};

	// Reset state
	richTextDataField.resetState = function () {
		$$(componentIds.supportMultilingual).setValue(1);
	}

	// richTextDataField.getRowHeight = function (fieldData, data) {
	// 	return 150;
	// };

	return richTextDataField;
});
