steal(function () {

	var file_types = [
		{
			"ext": "DOC",
			"mime": "application/msword",
			"description": "Microsoft Word Document"
		},
		{
			"ext": "DOCX",
			"mime": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			"description": "Microsoft Word Open XML Document"
		},
		{
			"ext": "PDF",
			"mime": "application/pdf",
			"description": "PDF Document"
		},
		{
			"ext": "TXT",
			"mime": "text/plain",
			"description": "Plain Text File"
		},
		{
			"ext": "XLS",
			"mime": "application/vnd.ms-excel",
			"description": "Microsoft Excel Document"
		},
		{
			"ext": "XLSX",
			"mime": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			"description": "Microsoft Excel Open XML Document"
		},
		{
			"ext": "CSV",
			"mime": ".csv",
			"description": "Comma Separated Values File"
		},
		{
			"ext": "PPSX",
			"mime": "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
			"description": "PowerPoint Slide Show"
		},
		{
			"ext": "PPT",
			"mime": "application/vnd.ms-powerpoint",
			"description": "PowerPoint Presentation"
		},
		{
			"ext": "PPTX",
			"mime": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
			"description": "PowerPoint Open XML Presentation"
		},
		{
			"ext": "XML",
			"mime": "text/xml",
			"description": "XML File"
		},
		{
			"ext": "JPG",
			"mime": "image/jpeg",
			"description": "JPG Image"
		},
		{
			"ext": "JPEG",
			"mime": "image/jpeg",
			"description": "JPEG Image"
		},
		{
			"ext": "PNG",
			"mime": "image/png",
			"description": "Portable Network Graphic"
		},
		{
			"ext": "BMP",
			"mime": "image/bmp",
			"description": "Bitmap Image File"
		},
		{
			"ext": "GIF",
			"mime": "image/gif",
			"description": "Graphics Interchange Format"
		}
	];

	var slectedFileTypes = [];

	var componentIds = {
		editView: 'ab-new-attachment',
		useMaxFileSize: 'useMaxFileSize',
		maxFileSize: 'maxFileSize',
		anyFileType: 'anyFileType',
		fileTypeField: 'fileTypeField',
		fileTypeFieldVal: 'fileTypeFieldVal'
	};

	// General settings
	var attachmentDataField = {
		name: 'attachment',
		type: 'string', // http://sailsjs.org/documentation/concepts/models-and-orm/attributes#?attribute-options
		icon: 'file',
		menuName: 'Attachment',
		includeHeader: true,
		description: 'Attatch a file to this object.'
	};

	attachmentDataField.getSelectedFileTypes = function () {
		var results = []
		for (var i = 0; i < file_types.length; i++) {
			if($$(file_types[i].ext).getValue() == 1){
				results.push(file_types[i].ext);
			}
		}
		return results;
	}

	attachmentDataField.selectFileType = function (index, value) {
		let foundIndex = selectedFileTypes.indexOf(file_types[index].ext);

		if(foundIndex == -1 && value == 1){
			selectedFileTypes = attachmentDataField.getSelectedFileTypes();
			$$(componentIds.fileTypeFieldVal).setValue(selectedFileTypes.join(','));
		}

		if(foundIndex != -1 && value == 0){
			selectedFileTypes = attachmentDataField.getSelectedFileTypes();
			$$(componentIds.fileTypeFieldVal).setValue(selectedFileTypes.join(','))
		}

	}

	attachmentDataField.registerClickEventForCheckbox = function (obj, i) {
		obj.click = function () {
			attachmentDataField.selectFileType(i, $$(file_types[i].ext).getValue())
		}
	}

	var fileTypeRows = []
	fileTypeRows.push({
		view: 'text',
		id: componentIds.fileTypeFieldVal,
		disabled: true,
		fillspace:true
	})

	for (var i = 0; i < file_types.length; i++) {
		var row = {
			view: "checkbox",
			id: file_types[i].ext,
			value: 0,
			label: file_types[i].ext
		}
		attachmentDataField.registerClickEventForCheckbox(row, i)
		fileTypeRows.push(row);
	}

	// Edit definition
	attachmentDataField.editDefinition = {
		id: componentIds.editView,
		rows: [
			{
				view: "label",
				label: "Attachment Properties"
			},
			{
				cols: [{
						view: "checkbox",
						id: componentIds.useMaxFileSize,
						width: 40,
						value: 1,
						click: function() {
							attachmentDataField.changeFieldsStates()
						}
					},
					{
						view: "label",
						label: "Max Size (MB)",
						width: 120
					},
					{
						view: 'text',
						id: componentIds.maxFileSize,
						fillspace:true
					}
				]
			},
			{
				cols: [
					{
						view: "label",
						label: "Any File Type",
						width: 120
					},
					{
						view: "checkbox",
						id: componentIds.anyFileType,
						value: 1,
						click: function() {
							attachmentDataField.changeFieldsStates()
						}
					}
				]
			},
			{
				view: 'fieldset',
				label: 'Select File Types',
				id: componentIds.fileTypeField,
				body: {
					rows: fileTypeRows
				}
			}
		]
	};

	attachmentDataField.changeFieldsStates = function () {
		if($$(componentIds.anyFileType).getValue()){ $$(componentIds.fileTypeField).hide() }else{ $$(componentIds.fileTypeField).show() }
		if($$(componentIds.useMaxFileSize).getValue()){ $$(componentIds.maxFileSize).enable(); }else{ $$(componentIds.maxFileSize).disable() }

	}

	// Populate settings (when Edit field)
	attachmentDataField.populateSettings = function (application, data) {
		if (!data) return;

		if (!data.setting) return;

    $$(componentIds.useMaxFileSize).setValue(data.setting.useMaxFileSize);
    $$(componentIds.maxFileSize).setValue(data.setting.maxFileSize);
		$$(componentIds.anyFileType).setValue(data.setting.anyFileType);
		$$(componentIds.fileTypeFieldVal).setValue(data.setting.fileTypeFieldVal);

		if(data.setting.fileTypeFieldVal && data.setting.fileTypeFieldVal.length > 0) {
			let fileTypes = [data.setting.fileTypeFieldVal];
			if(data.setting.fileTypeFieldVal.includes(',')){
				fileTypes = data.setting.fileTypeFieldVal.split(',')
			}
			for (var i = 0; i < file_types.length; i++) {
				let id = file_types[i].ext;
				if(fileTypes.indexOf(id) == -1){
					$$(file_types[i].ext).setValue(0)
				}else{
					$$(file_types[i].ext).setValue(1)
				}
			}
		}

		attachmentDataField.changeFieldsStates();
	};

	// For save field
	attachmentDataField.getSettings = function () {
		// TODO:
		// fieldName = base.getFieldName(self.componentIds.attachmentView);
		// fieldLabel = base.getFieldLabel(self.componentIds.attachmentView);
		// fieldSettings.icon = self.componentIds.attachmentIcon;

		var setting = {
      icon: attachmentDataField.icon,

      template: '<div class="ab-attachment-data-field"></div>',
      filter_type: 'text',
      editor: 'attachmentDataField',

      useMaxFileSize: $$(componentIds.useMaxFileSize).getValue(),
      maxFileSize: $$(componentIds.maxFileSize).getValue(),
			anyFileType: $$(componentIds.anyFileType).getValue(),
			fileTypeFieldVal: $$(componentIds.fileTypeFieldVal).getValue()
    }

    if ($$(componentIds.useMaxFileSize).getValue()) {
      setting.maxFileSize = $$(componentIds.maxFileSize).getValue();
      setting.css = 'ab-column-no-padding';
    }

		attachmentDataField.changeFieldsStates()

		// Do Some Field Validation Here:
		// If the settings object contains the VALIDATION_ERROR property then the field will not get saved
		if( !$$(componentIds.anyFileType).getValue() && $$(componentIds.fileTypeFieldVal).getValue() == ''){
			setting.VALIDATION_ERROR = {
				title: 'File Type',
				text: 'Youe must select a minimum of one file type'
			}
		}

    return {
      fieldName: attachmentDataField.name,
      type: attachmentDataField.type,
      setting: setting
    };

	};

	// Reset state
	attachmentDataField.resetState = function () {
		$$(componentIds.useMaxFileSize).setValue(0);
    $$(componentIds.maxFileSize).setValue('');

		$$(componentIds.anyFileType).setValue(1);

		for (var i = 0; i < file_types.length; i++) {
			let id = file_types[i].ext;
			$$(id).setValue(0);
		}
		$$(componentIds.fileTypeFieldVal).setValue('');
		selectedFileTypes = [];

		attachmentDataField.changeFieldsStates()
	};

	attachmentDataField.customDisplay = function(application, object, fieldData, rowData, data, viewId, itemNode, options) {


		var keyField = this.keyField(application, object, fieldData, rowData ? rowData.id : null);

		////
		//// Prepare the Display
		////

		// find the container from our this.getSettings().setting.template
		var $container = $(itemNode).find('.ab-attachment-data-field');

		// if our contents are already generated:
		if ($container.find('.attachment-data-field-attachment').length > 0) {

			// let's not update the contents:
			return true;
		}

		// clear contents
		$container.html('');
		$container.attr('id', keyField);
		// console.log('... container:');
		// console.log($container);

		var keyContainer = this.keyContainer(itemNode); // keyField+'-container';
		var keyUploader = this.keyUploader(itemNode); // keyField+'-uploader';


		// the display of our attachment:
		// .attachment-data-field-icon : for an attachment icon when no data is present
		// .attachment-data-field-attachment: for a download button
		var attachmentDiv = [
			'<div class="attachment-data-field-icon" style="text-align: center;display:none;">',
			'<i style="font-size: 1.5em;" class="fa fa-file"></i>',
			'</div>',
			'<div class="attachment-data-field-attachment" style="text-align: center;display:none">',
			'<a target="_new" href="">',
			'<i style="font-size: 1.5em;" class="fa fa-download"></i>',
			'</a>',
			'</div>'
		].join('\n');


		var maxFileSize = 1;
		if (fieldData.setting.useMaxFileSize) {
			maxFileSize = parseInt(fieldData.setting.maxFileSize);
		}

		// use a webix component for displaying the content.
		// do this so I can use the progress spinner
		var webixContainer = webix.ui({
			view: 'template',
			id: keyContainer,
			container: $container[0],
			template: attachmentDiv,
			borderless: true,
			minWidth: 50,
			minHeight: 70
		});

		webix.extend(webixContainer, webix.ProgressBar);


		$container.showIcon = function() {
			$container.find('.attachment-data-field-attachment').attr('attachment-uuid', '');
			$container.find('.attachment-data-field-attachment').find('a').attr('href', '');
			$container.find('.attachment-data-field-attachment').hide();
			$container.find('.attachment-data-field-icon').show();
		}
		$container.showAttachment = function(uuid) {
			$container.find('.attachment-data-field-attachment').find('a').attr('href', '/opsportal/file/' + application.name + '/' + uuid);
			$container.find('.attachment-data-field-attachment').attr('attachment-uuid', uuid);
			$container.find('.attachment-data-field-icon').hide();
			$container.find('.attachment-data-field-attachment').show();
		}

		// if data is empty, then display the file Icon
		if (!data || data == '') {
			$container.showIcon();
		} else {
			// else display the attachment:
			$container.showAttachment(data);
		}

		$(itemNode).data('attachment-container', $container);

		////
		//// Prepare the Uploader
		////

		// The Server Side action key format for this Application:
		var actionKey = 'opstool.AB_' + application.name.replace('_', '') + '.view';
		var url = '/' + ['opsportal', 'file', application.name, actionKey, '1'].join('/');

		var uploader = webix.ui({
			view: "uploader",
			id: keyUploader,
			apiOnly: true,
			upload: url,
			inputName: 'file',
			multiple: false,

			on: {

				// when a file is added to the uploader
				onBeforeFileAdd: function(item) {

					// verify file type
					// var acceptableTypes = attachmentDataField.getSelectedFileTypes
					if(fieldData.setting.anyFileType == 0){
						var acceptableTypes = fieldData.setting.fileTypeFieldVal
						if(acceptableTypes.includes(',')){
							acceptableTypes = [fieldData.setting.fileTypeFieldVal]
						}
						var type = item.type.toUpperCase();
						if (acceptableTypes.indexOf(type) == -1) {
							var message = "Only [" + acceptableTypes.join(", ") + "] file types are allowed";
							webix.alert(message);
							return false;
						}
					}

					// start progress indicator
					webixContainer.showProgress({
						type: "icon",
						delay: 2000
					});
				},

				// when upload is complete:
				onFileUpload: function(item, response) {

					webixContainer.hideProgress();
					$container.showAttachment(response.data.uuid);

					// TODO: delete previous attachment?

					// update value
					var updatePacket = {
						objectId: object.id,
						columnName: fieldData.name,
						rowId: rowData ? rowData.id : null,
						data: response.data.uuid
					};
					$(attachmentDataField).trigger('update', updatePacket);
				},

				// if an error was returned
				onFileUploadError: function(item, response) {
					AD.error.log('Error loading attachment', response);
					webixContainer.hideProgress();
				}
			}
		});
		uploader.addDropZone(webixContainer.$view);

		return true;

	};


	attachmentDataField.customEdit = function(application, object, fieldData, rowId, itemNode) {
		if (!application || !object || !fieldData) return false;

		var keyUploader = this.keyUploader(itemNode);
		$$(keyUploader).fileDialog({
			rowid: rowId
		});

		return false;
	};

	attachmentDataField.getContainer = function(itemNode) {
		var $container = $(itemNode).data('attachment-container');
		if (!$container) $container = $(itemNode).find('.ab-attachment-data-field');
		return $container;
	}
	attachmentDataField.keyField = function(application, object, fieldData, rowId) {
		return [application.name, object.name, fieldData.name, rowId, AD.util.uuid()].join('-');
	}
	attachmentDataField.keyContainer = function(itemNode) {
		var $container = this.getContainer(itemNode);
		return [$container.attr('id'), 'container'].join('-');
	}
	attachmentDataField.keyUploader = function(itemNode) {
		var $container = this.getContainer(itemNode);
		return [$container.attr('id'), 'uploader'].join('-');
	}

	attachmentDataField.getValue = function(application, object, fieldData, itemNode) {
    var attachment = $(itemNode).find('.attachment-data-field-attachment');

    return attachment.attr('attachment-uuid');
  };
	attachmentDataField.setValue = function(fieldData, itemNode, data) {
    var $container = this.getContainer(itemNode);

    if (!data || data == '') {
      $container.showIcon();
    } else {
      // else display the attachment:
      $container.showAttachment(data);
    }

  };

	return attachmentDataField;

});
