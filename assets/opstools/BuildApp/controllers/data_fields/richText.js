steal(
	// 'js/webix-extras/ckeditor.js',
	'js/webix-extras/tinymce.js',

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
				template:'<div class="ab-richtext-data-field"></div>',
				supportMultilingual: $$(componentIds.supportMultilingual).getValue()
			}
		};
	};

	// Reset state
	richTextDataField.resetState = function () {
		$$(componentIds.supportMultilingual).setValue(1);
	}

	richTextDataField.customDisplay = function (application, object, fieldData, rowData, data, viewId, itemNode, options) {
		var richtextTemplateContainer = $(itemNode).find('.richtext-container');
		if(!richtextTemplateContainer.length){
			// Do not render this display if we are just displaying the
			// field value as a label
			return false;
		}

		var keyField = this.keyField( application, object, fieldData, rowData ? rowData.id : null);

		// var key = fieldData.fieldName+"-"+rowData.id;

		// console.log('customDisplay!! rowData: ', rowData);
		// console.log('customDisplay!! fieldData: ', fieldData);
		// console.log('customDisplay!! itemNode: ', itemNode);

		if(data == undefined || data == null){
			data = '';
		}

		// console.log('customDisplay!! data: ', data);
		// console.log('customDisplay!! object: ', object);
		// console.log('customDisplay!! viewId: ', viewId);
		// console.log('customDisplay!! options: ', options);
		console.log('customDisplay!! itemNode:', itemNode);


		var $container = $(itemNode).find('.ab-richtext-data-field');
		$container.html('');
		$container.attr('id', keyField);


		var keyContainer = this.keyContainer(itemNode); // keyField+'-container';

		// $container.attr('id', keyField);

		webix.ready(function(){
			webix.ui({
				container: $container[0],
				id: keyContainer,
				css: 'richtext_editor',
				view: 'tinymce-editor',
				height: 250,
				value: data,
			});
		});

		return true;

		// if($(itemNode).find('textarea')){
		//
		// 	// webix.ui({
		// 	// 	view: 'ckeditor',
		// 	// 	id: 'editor',
		// 	// 	minHeight: 200,
		// 	// 	value: data,
		// 	// });
		//
		// 	// webix.ui({
		// 	// 	view: 'tinymce-editor',
		// 	// 	id: 'ckeditor-richtext',
		// 	// 	minHeight: 200,
		// 	// 	value: data,
		// 	// });
		//
		// 	// console.log('componentIds.editorId: ', componentIds.editorId);
		// 	// $$('ckeditor-richtext').setValue(data);
		//
		// 	return false;
		// }else{
		// 	return false;
		// }

		// return true;

	};

	richTextDataField.keyContainer = function (itemNode) {
		var $container = this.getContainer(itemNode);
		return [ $container.attr('id'), 'container' ].join('-');
	}
	richTextDataField.getContainer = function (itemNode) {
		var $container = $(itemNode).data('richtext-container');

		if (!$container) $container = $(itemNode).find('.ab-richtext-data-field');

		return $container;
	}
	richTextDataField.keyField = function (application, object, fieldData, rowId) {
		return [ application.name, object.name, fieldData.name, rowId, AD.util.uuid()].join('-');
	}

	// richTextDataField.setValue = function (fieldData, itemNode, data) {
	// 	console.log('setValue!!!!!!: ', data);
	// 	console.log('itemNode: ', itemNode);
	// 	return '';
	// };

	richTextDataField.getValue = function (application, object, fieldData, itemNode) {
		// console.log('object: ', object);
		// console.log('fieldData: ', fieldData);
		// console.log('itemNode: ', itemNode);
		// console.log('$$(componentIds.editorId): ', $$(componentIds.editorId));
		// console.log('TEXT AREA ID:', $(itemNode).find('textarea').attr('id'))
		// let textareaID = $(itemNode).find('textarea').attr('id');
		var keyContainer = this.keyContainer(itemNode);
		var value = $$(keyContainer).getValue();
		if(value == undefined || value == null){
			value = '';
		}
		return value;
	};

	// richTextDataField.getRowHeight = function (fieldData, data) {
	// 	return 150;
	// };

	return richTextDataField;
});
