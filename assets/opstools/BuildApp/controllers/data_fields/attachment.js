steal(function () {

	var componentIds = {
		editView: 'ab-new-attachment',
		useMaxFileSize: 'useMaxFileSize',
		maxFileSize: 'maxFileSize'
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
							if (this.getValue())
								$$(componentIds.maxFileSize).enable()
							else
								$$(componentIds.maxFileSize).disable();
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
			}
		]
	};

	// Populate settings (when Edit field)
	attachmentDataField.populateSettings = function (application, data) {
		if (!data) return;

		if (!data.setting) return;

    $$(componentIds.useMaxFileSize).setValue(data.setting.useMaxFileSize);
    $$(componentIds.maxFileSize).setValue(data.setting.maxFileSize);
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
      maxFileSize: $$(componentIds.maxFileSize).getValue()
    }

    if ($$(componentIds.useMaxFileSize).getValue()) {
      setting.maxFileSize = $$(componentIds.maxFileSize).getValue();
      setting.css = 'ab-column-no-padding';
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
			$container.find('.attachment-data-field-attachment').attr('href', '');
			$container.find('.attachment-data-field-attachment').hide();
			$container.find('.attachment-data-field-icon').show();
		}
		$container.showAttachment = function(uuid) {
			$container.find('.attachment-data-field-attachment').attr('href', '/opsportal/file/' + application.name + '/' + uuid);
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
					var acceptableTypes = ['pdf', 'xlsx'];
					var type = item.type.toLowerCase();
					if (acceptableTypes.indexOf(type) == -1) {
						webix.message("Only [" + acceptableTypes.join(", ") + "] file types are supported");
						return false;
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
