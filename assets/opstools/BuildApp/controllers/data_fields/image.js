steal(function() {

  // image
  //
  // A DataField that handles simple text data for an Object.
  //
  // Each DataField already defines:
  //		.headerName	: becomes the created object's field reference.
  //		.labelName  : is what is shown in the UI for this field's data
  //
  //				ex: you create a "Person"  object. Then add a string field: {
  //						headerName: 'name_surname', labelName:'Surname' }
  //
  //				when you work with the data from a model, person.name_surname has
  //				the value.
  //
  //				but the Webix Grid will display .labelName for the column header.
  //
  // image  uniquely defines:
  //		.[field] : [description]


  // General settings
  //
  // To plug-in to the AppBuilder, each DataField must define the following:
  //		.name 	{string}	unique key to reference this specific DataField
  //		.type 	{string}	the fundamental data type for this DataField.
  //							the type should match one of the given sails attribute types:
  //							http://sailsjs.org/documentation/concepts/models-and-orm/attributes#?attribute-options
  //		.icon 	{string}	A font-awesome icon to represent this DataField
  //							the icon is specified without the 'fa-' prefix.
  //							so .icon='user'  is the 'fa-user' icon.
  //		.menuName {string}  The multilingual key for displaying the name of this
  //							DataField to the User.
  //      .includeHeader {bool} allow the AppBuilder to add in the [name] and [label] fields
  //							for you.  (why reinvent the wheel?)
  //
  var imageDataField = {
    name: 'image', // unique key to reference this specific DataField
    type: 'string',
    icon: 'file-image-o', // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'

    // TODO: to support a proper multilingual display,
    //       .menuName & .description  need to be  multilingual Keys
    //       not straight up labels.
    menuName: 'Image Attachment',
    includeHeader: true,
    description: 'Attach an image to this object.'
  };


  /*
   * componentIds:
   *
   * Definitions of the Webix.id for the items in this DataField's Editor
   *
   *	.editView : 	the .id of the editor for this DataField
   *					->  imageDataField.editDefinition.id
   */
  var componentIds = {
    editView: 'ab-new-image',

    useWidth: 'useWidth',
    imageWidth: 'imageWidth',
    useHeight: 'useHeight',
    imageHeight: 'imageHeight'
  };


  /*
   * .editDefinition
   *
   * Define the Webix UI description for the Editor that defines this DataField.
   *
   * This UI is used for both the initial create, as well as the Edit form.
   *
   */
  imageDataField.editDefinition = {
    id: componentIds.editView,
    rows: [{
        cols: [{
            view: "checkbox",
            id: componentIds.useWidth,
            labelRight: "width",
            width: 80,
            labelWidth: 0,
            value: 1,
            click: function() {
              if (this.getValue())
                $$(componentIds.imageWidth).enable()
              else
                $$(componentIds.imageWidth).disable();
            }
          },
          {
            view: 'text',
            id: componentIds.imageWidth
          }
        ]
      },
      {
        cols: [{
            view: "checkbox",
            id: componentIds.useHeight,
            labelRight: "height",
            width: 80,
            labelWidth: 0,
            value: 1,
            click: function() {
              if (this.getValue())
                $$(componentIds.imageHeight).enable()
              else
                $$(componentIds.imageHeight).disable();
            }

          },
          {
            view: 'text',
            id: componentIds.imageHeight
          }
        ]
      }
    ]
  }


  /**
   * @function populateSettings
   *
   * initialize this DataFields Editor with the provided data.
   *
   * @param {ABApplication} application the ABApplication object that defines
   *							this App.  From this we can access any additional
   *							info required for this DataField to work.
   *							ex: attempting to access other objects ..
   *
   * @param {ABColumn} data  the ABColumn info saved for this DataField.
   */
  imageDataField.populateSettings = function(application, data) {
    if (!data.setting) return;

    $$(componentIds.useWidth).setValue(data.setting.useWidth);
    $$(componentIds.imageWidth).setValue(data.setting.imageWidth);
    $$(componentIds.useHeight).setValue(data.setting.useHeight);
    $$(componentIds.imageHeight).setValue(data.setting.imageHeight);

  };


  /**
   * @function getSettings
   *
   * pull the data out of this DataField's Editor, and format it to be
   * saved in an ABColumn instance.
   *
   * Note: fields that are common for ABColumn:
   *		.name 		: the column name for the related Object
   *		.label 		: UI label to display for this field
   *		.fieldName 	: The reference to this DataField
   *		.type 		: the SailsJS data type
   *
   * If your DataField has more info than this, it should be stored in
   *		.setting 	: {json} representation of unique data for this DataField
   *
   *					common setting values:
   *						.icon: the icon for this field entry
   *						.editor: Webix UI editor type for this entry
   *						.filter_type: Webix UI filter type
   *
   * 					Unique image settings:
   *						[field] 	:  [description]
   *
   * @return {json}  data formatted to be saved in ABColumn instance.
   */
  imageDataField.getSettings = function() {

    var setting = {
      icon: imageDataField.icon,

      template: '<div class="ab-image-data-field"></div>',
      filter_type: 'text',
      editor: 'imageDataField',

      useWidth: $$(componentIds.useWidth).getValue(),
      imageWidth: $$(componentIds.imageWidth).getValue(),
      useHeight: $$(componentIds.useHeight).getValue(),
      imageHeight: $$(componentIds.imageHeight).getValue()
    }

    if ($$(componentIds.useWidth).getValue()) {
      setting.width = $$(componentIds.imageWidth).getValue();
      setting.css = 'ab-column-no-padding';
    }

    return {
      fieldName: imageDataField.name,
      type: imageDataField.type,
      setting: setting
    };
  };


  /**
   * @function resetState
   *
   * Find our current Webix UI editor instance, and reset all the entry
   * fields.
   *
   */
  imageDataField.resetState = function() {

    $$(componentIds.useWidth).setValue(0);
    $$(componentIds.imageWidth).setValue('');
    $$(componentIds.useHeight).setValue(0);
    $$(componentIds.imageHeight).setValue('');

  };


  /*
   * @function customDisplay
   *
   * This is an optional method for a Data Field.
   *
   * If this method exists, then the App Builder will call this method to
   * display the Data Field in the appropriate Grid/Form element.
   *
   * @param {obj} application : The current ABApplication instance
   * @param {obj} object  : The ABObject that contains this DataField
   * @param {obj} fieldData : The ABColumn instance that defines this DataField
   * @param {obj} rowData   : the data of the Model instance from which we are
   *						  	getting the data for this DataField
   * @param {} data       : the value of this DataField
   * @param {string} viewId : the webix id ( $$(viewId) ) of the component
   *						  calling this Data Field's .customDisplay()
   * @param {el} itemNode : the DOM element of the Webix Cell that contains
   * 						  the display of this DataField
   * @param {obj} options : provided by the calling UI component (Grid/Form)
   *						  .readOnly  {bool}  should we display as readOnly?
   * @return {bool}       : True if we have a custom display
   *						  False if we don't.  (or just comment this out)
   */
  imageDataField.customDisplay = function(application, object, fieldData, rowData, data, viewId, itemNode, options) {


    var keyField = this.keyField(application, object, fieldData, rowData ? rowData.id : null);

    ////
    //// Prepare the Display
    ////

    // find the container from our this.getSettings().setting.template
    var $container = $(itemNode).find('.ab-image-data-field');

    // if our contents are already generated:
    if ($container.find('.image-data-field-image').length > 0) {

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


    // the display of our image:
    // .image-data-field-icon : for an image icon when no data is present
    // .image-data-field-image: for an actual <img> of the data.
    var imgDiv = [
      '<div class="image-data-field-icon" style="text-align: center;display:none;"><i class="fa fa-file-image-o fa-2x"></i></div>',
      '<div class="image-data-field-image" style="display:none; width:100%; height:100%; background-repeat: no-repeat; background-position: center center; background-size: cover;"></div>'
    ].join('\n');


    var imgHeight = 33;
    if (fieldData.setting.useHeight) {
      imgHeight = parseInt(fieldData.setting.imageHeight);
    }

    var imgWidth = 50;
    if (fieldData.setting.useWidth) {
      imgWidth = parseInt(fieldData.setting.imageWidth);
    }

    // use a webix component for displaying the content.
    // do this so I can use the progress spinner
    var webixContainer = webix.ui({
      view: 'template',
      id: keyContainer,
      container: $container[0],

      template: imgDiv,

      borderless: true,
      height: imgHeight,
      width: imgWidth,
      // onClick:{

      // 	// 'image-data-field-icon': function(ev, id) {
      // 	// 	$$(keyUploader).fileDialog({ rowid : id });
      // 	// },

      // 	// 'image-data-field-image': function(ev, id) {
      // 	// 	$$(keyUploader).fileDialog({ rowid : id });
      // 	// }

      // }
    });
    webix.extend(webixContainer, webix.ProgressBar);


    $container.showIcon = function() {
      $container.find('.image-data-field-image').attr('image-uuid', '');
      $container.find('.image-data-field-image').hide();
      $container.find('.image-data-field-icon').show();
    }
    $container.showImage = function(uuid) {
      $container.find('.image-data-field-image').css('background-image', "url('/opsportal/image/" + application.name + '/' + uuid + "')");
      $container.find('.image-data-field-image').attr('image-uuid', uuid);
      $container.find('.image-data-field-icon').hide();
      $container.find('.image-data-field-image').show();
    }

    // if data is empty, then display the file Icon
    if (!data || data == '') {
      $container.showIcon();
    } else {
      // else display the image:
      $container.showImage(data);
    }

    $(itemNode).data('image-container', $container);

    ////
    //// Prepare the Uploader
    ////

    // The Server Side action key format for this Application:
    var actionKey = 'opstool.AB_' + application.name.replace('_', '') + '.view';
    var url = '/' + ['opsportal', 'image', application.name, actionKey, '1'].join('/');

    var uploader = webix.ui({
      view: "uploader",
      id: keyUploader,
      apiOnly: true,
      upload: url,
      inputName: 'image',
      multiple: false,
      // formData:{
      // 	appKey:application.name,
      // 	permission:actionKey,
      // 	isWebix:true,
      // 	imageParam:'upload'
      // },
      on: {

        // when a file is added to the uploader
        onBeforeFileAdd: function(item) {

          // verify file type
          var acceptableTypes = ['jpg', 'jpeg', 'bmp', 'png', 'gif'];
          var type = item.type.toLowerCase();
          if (acceptableTypes.indexOf(type) == -1) {
            webix.message("Only [" + acceptableTypes.join(", ") + "] images are supported");
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
          $container.showImage(response.data.uuid);

          // TODO: delete previous image?

          // update value
          var updatePacket = {
            objectId: object.id,
            columnName: fieldData.name,
            rowId: rowData ? rowData.id : null,
            data: response.data.uuid
          };
          $(imageDataField).trigger('update', updatePacket);
        },

        // if an error was returned
        onFileUploadError: function(item, response) {
          AD.error.log('Error loading image', response);
          webixContainer.hideProgress();
        }
      }
    });
    uploader.addDropZone(webixContainer.$view);

    return true;

  };


  /*
   * @function customEdit
   *
   * This is an optional method for a Data Field.
   *
   * If this method exists, then the App Builder will call this method when
   * this field is clicked on in a grid/form.
   *
   * @param {obj} application : The current ABApplication instance
   * @param {obj} object  : The ABObject that contains this DataField
   * @param {obj} fieldData : The ABColumn instance that defines this DataField
   * @param {int} rowId   : the .id of the Model instance from which we are
   *						  getting the data for this DataField
   * @param {el} itemNode : the DOM element of the Webix Cell that contains
   * 						  the display of this DataField
   * @return {bool}      : return {false} if you want to prevent the default webix
   *						 grid/form editor.
   */
  imageDataField.customEdit = function(application, object, fieldData, rowId, itemNode) {
    if (!application || !object || !fieldData) return false;

    var keyUploader = this.keyUploader(itemNode);
    $$(keyUploader).fileDialog({
      rowid: rowId
    });

    return false;
  };


  imageDataField.getContainer = function(itemNode) {
    var $container = $(itemNode).data('image-container');

    if (!$container) $container = $(itemNode).find('.ab-image-data-field');

    return $container;
  }
  imageDataField.keyField = function(application, object, fieldData, rowId) {
    return [application.name, object.name, fieldData.name, rowId, AD.util.uuid()].join('-');
  }
  imageDataField.keyContainer = function(itemNode) {
    var $container = this.getContainer(itemNode);
    return [$container.attr('id'), 'container'].join('-');
  }
  imageDataField.keyUploader = function(itemNode) {
    var $container = this.getContainer(itemNode);
    return [$container.attr('id'), 'uploader'].join('-');
  }


  /*
   * @function setValue
   *
   * Form Processing: allow the form to set the current value.
   *
   * @param {obj} fieldData : The ABColumn instance that defines this DataField
   * @param {el} itemNode : the DOM element of the Webix Cell that contains
   * 						  the display of this DataField
   * @param {} data         : the value of this DataField
   */
  imageDataField.setValue = function(fieldData, itemNode, data) {
    var $container = this.getContainer(itemNode);

    if (!data || data == '') {
      $container.showIcon();
    } else {
      // else display the image:
      $container.showImage(data);
    }

  };


  /*
   * @function getValue
   *
   * Form Processing: allow a form to request the current value of your Data Field.
   *
   * @param {obj} application : The current ABApplication instance
   * @param {obj} object  : The ABObject that contains this DataField
   * @param {obj} fieldData : The ABColumn instance that defines this DataField
   * @param {el} itemNode : the DOM element of the Webix Cell that contains
   * 						  the display of this DataField
   */
  imageDataField.getValue = function(application, object, fieldData, itemNode) {
    var image = $(itemNode).find('.image-data-field-image');

    return image.attr('image-uuid');
  };


  /*
   * @function getRowHeight
   *
   * This is an optional method for a Data Field.
   *
   * If this method exists, then the App Builder will call this method to
   * determine what the row height should be for this Data Field in a grid/form.
   *
   * @param {obj} fieldData : The ABColumn instance that defines this DataField
   * @param {} data         : the value of this DataField
   * @return {integer}      : the {integer} value for the height of this field.
   */
  imageDataField.getRowHeight = function(fieldData, data) {

    var height = 36;
    if (fieldData.setting.useHeight) {
      height = parseInt(fieldData.setting.imageHeight);
    }
    return height;
  };


  return imageDataField;
});
