var ABFieldImageCore = require("../../core/dataFields/ABFieldImageCore");
var ABFieldComponent = require("./ABFieldComponent");

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

/**
 * ABFieldImageComponent
 *
 * Defines the UI Component for this Data Field.  The ui component is responsible
 * for displaying the properties editor, populating existing data, retrieving
 * property values, etc.
 *
 * @param {obj} App  the current Component Application instance for the current UI.
 * @return {obj} the Component object.
 */
var ABFieldImageComponent = new ABFieldComponent({
   fieldDefaults: ABFieldImageCore.defaults(),

   elements: (App, field) => {
      var ids = {
         imageWidth: "",
         imageHeight: "",
         defaultImageUrl: ""
      };
      ids = field.idsUnique(ids, App);

      return [
         {
            cols: [
               {
                  view: "checkbox",
                  name: "useWidth",
                  labelRight: L("ab.dataField.image.width", "*Width"),
                  width: 80,
                  labelWidth: 0,
                  value: 1,
                  click: function() {
                     if (this.getValue()) $$(ids.imageWidth).enable();
                     else $$(ids.imageWidth).disable();
                  }
               },
               {
                  view: "text",
                  name: "imageWidth",
                  id: ids.imageWidth
               }
            ]
         },
         {
            cols: [
               {
                  view: "checkbox",
                  name: "useHeight",
                  // id:componentIds.useHeight,
                  labelRight: L("ab.dataField.image.height", "*Height"),
                  width: 80,
                  labelWidth: 0,
                  value: 1,
                  click: function() {
                     if (this.getValue()) $$(ids.imageHeight).enable();
                     else $$(ids.imageHeight).disable();
                  }
               },
               {
                  view: "text",
                  name: "imageHeight",
                  id: ids.imageHeight
               }
            ]
         },
         {
            cols: [
               {
                  view: "checkbox",
                  name: "useDefaultImage",
                  labelRight: L(
                     "ab.dataField.image.defaultImage",
                     "*Default image"
                  ),
                  width: 200,
                  labelWidth: 0,
                  value: 0,
                  click: function() {
                     if (this.getValue()) $$(ids.defaultImageUrl).enable();
                     else $$(ids.defaultImageUrl).disable();
                  }
               },

               {
                  view: "uploader",
                  id: ids.defaultImageUrl,
                  template:
                     '<div class="default-image-holder">' +
                     '<div class="image-data-field-icon">' +
                     '<i class="fa fa-picture-o fa-2x"></i>' +
                     "<div>Drag and drop or click here</div>" +
                     "</div>" +
                     '<div class="image-data-field-image" style="display:none;">' +
                     '<a style="" class="ab-delete-photo" href="javascript:void(0);"><i class="fa fa-times delete-image" style="display:none;"></i></a>' +
                     "</div>" +
                     "</div>",
                  apiOnly: true,
                  inputName: "image",
                  multiple: false,
                  disabled: true,
                  name: "defaultImageUrl",
                  height: 150,
                  width: 100,
                  on: {
                     // when a file is added to the uploader
                     onBeforeFileAdd: function(item) {
                        // verify file type
                        var acceptableTypes = [
                           "jpg",
                           "jpeg",
                           "bmp",
                           "png",
                           "gif"
                        ];
                        var type = item.type.toLowerCase();
                        if (acceptableTypes.indexOf(type) == -1) {
                           //// TODO: multilingual
                           webix.message(
                              "Only [" +
                                 acceptableTypes.join(", ") +
                                 "] images are supported"
                           );
                           return false;
                        }
                     },

                     // if an error was returned
                     onFileUploadError: function(item, response) {
                        OP.Error.log("Error loading image", response);
                     }
                  }
               }
            ]
         }
      ];
   },

   // defaultValues: the keys must match a .name of your elements to set it's default value.
   defaultValues: ABFieldImageCore.defaultValues(),

   // rules: basic form validation rules for webix form entry.
   // the keys must match a .name of your .elements for it to apply
   rules: {
      // 'textDefault':webix.rules.isNotEmpty,
      // 'supportMultilingual':webix.rules.isNotEmpty
   },

   // include additional behavior on default component operations here:
   // The base routines will be processed first, then these.  Any results
   // from the base routine, will be passed on to these:
   // 	@param {obj} ids  the list of ids used to generate the UI.  your
   //					  provided .elements will have matching .name keys
   //					  to access them here.
   //  @param {obj} values the current set of values provided for this instance
   // 					  of ABField:
   //					  {
   //						id:'',			// if already .saved()
   // 						label:'',
   // 						columnName:'',
   //						settings:{
   //							showIcon:'',
   //
   //							your element key=>values here
   //						}
   //					  }
   //
   // 		.clear(ids)  : reset the display to an empty state
   // 		.isValid(ids, isValid): perform validation on the current editor values
   // 		.populate(ids, ABField) : populate the form with your current settings
   // 		.show(ids)   : display the form in the editor
   // 		.values(ids, values) : return the current values from the form
   logic: {
      clear: (ids) => {
         $$(ids.useWidth).setValue(0);
         $$(ids.useHeight).setValue(0);
         $$(ids.useDefaultImage).setValue(0);

         $$(ids.imageWidth).setValue("");
         $$(ids.imageHeight).setValue("");
         $$(ids.defaultImageUrl).setValue("");
      },
      objectLoad: (object) => {
         ABFieldImageComponent.currentObject = object;
      },
      populate: (ids, field) => {
         var uploader = $$(ids.defaultImageUrl);
         var value = field.settings.defaultImageUrl;
         var isUseDefaultImage = field.settings.useDefaultImage;

         if (field.settings.useDefaultImage) {
            uploader.enable();
         }

         if (value && isUseDefaultImage) {
            //Show default image
            uploader.attachEvent("onAfterRender", function(file, response) {
               var parentContainer = uploader.$view.querySelector(
                  ".default-image-holder"
               );
               parentContainer.querySelector(
                  ".image-data-field-icon"
               ).style.display = "none";

               var image = parentContainer.querySelector(
                  ".image-data-field-image"
               );
               image.style.display = "";
               image.style.backgroundImage =
                  "url('/opsportal/image/" +
                  ABFieldImageComponent.currentObject.application.name +
                  "/" +
                  value +
                  "')";
               image.setAttribute("image-uuid", value);

               parentContainer.querySelector(".delete-image").style.display =
                  "table-cell";
            });

            uploader.$view.addEventListener("click", (e) => {
               if (e.target.className.indexOf("delete-image") > -1) {
                  var parentContainer = uploader.$view.querySelector(
                     ".default-image-holder"
                  );
                  parentContainer.querySelector(
                     ".image-data-field-icon"
                  ).style.display = "";

                  var image = parentContainer.querySelector(
                     ".image-data-field-image"
                  );
                  image.style.display = "none";
                  image.style.backgroundImage = "";
                  image.setAttribute("image-uuid", "");

                  parentContainer.querySelector(".delete-image").style.display =
                     "none";
               }
            });
         }
      },
      show: (ids) => {
         var actionKey =
            "opstool.AB_" +
            ABFieldImageComponent.currentObject.application.name.replace(
               "_",
               ""
            ) +
            ".view";
         var url =
            "/" +
            [
               "opsportal",
               "image",
               ABFieldImageComponent.currentObject.application.name,
               actionKey,
               "1"
            ].join("/");

         var uploader = $$(ids.defaultImageUrl);
         uploader.config.upload = url;
         uploader.attachEvent("onFileUpload", function(file, response) {
            $$(ids.defaultImageUrl).setValue(response.data.uuid);

            var parentContainer = uploader.$view.querySelector(
               ".default-image-holder"
            );
            parentContainer.querySelector(
               ".image-data-field-icon"
            ).style.display = "none";

            var image = parentContainer.querySelector(
               ".image-data-field-image"
            );
            image.style.display = "";
            image.style.backgroundImage =
               "url('/opsportal/image/" +
               ABFieldImageComponent.currentObject.application.name +
               "/" +
               response.data.uuid +
               "')";
            image.setAttribute("image-uuid", response.data.uuid);

            parentContainer.querySelector(".delete-image").style.display =
               "table-cell";
         });
         uploader.attachEvent("onAfterRender", function(file, response) {
            var parentContainer = uploader.$view.querySelector(
               ".default-image-holder"
            );
            parentContainer.querySelector(
               ".image-data-field-icon"
            ).style.display = "";

            var image = parentContainer.querySelector(
               ".image-data-field-image"
            );
            image.style.display = "none";
            image.style.backgroundImage = "";
            image.setAttribute("image-uuid", "");

            parentContainer.querySelector(".delete-image").style.display =
               "none";
         });
         uploader.addDropZone(uploader.$view);
         uploader.render();
      }
   },

   // perform any additional setup actions here.
   // @param {obj} ids  the hash of id values for all the current form elements.
   //					 it should have your elements + the default Header elements:
   //						.label, .columnName, .fieldDescription, .showIcon
   init: function(ids) {
      // want to hide the description? :
      // $$(ids.fieldDescription).hide();
   }
});

module.exports = class ABFieldImage extends ABFieldImageCore {
   constructor(values, object) {
      super(values, object);
   }

   /*
    * @function propertiesComponent
    *
    * return a UI Component that contains the property definitions for this Field.
    *
    * @param {App} App the UI App instance passed around the Components.
    * @param {stirng} idBase
    * @return {Component}
    */
   static propertiesComponent(App, idBase) {
      return ABFieldImageComponent.component(App, idBase);
   }

   ///
   /// Instance Methods
   ///
   /**
    * @function destroy
    * On a destroy operation, ask if the user wants to keep the related images.
    */
   destroy() {
      return new Promise((resolve, reject) => {
         // verify we have been .save()d before:
         if (this.id) {
            // Ask the user what to do about the existing images:
            OP.Dialog.Confirm({
               title: L("ab.dataField.image.keepImages", "*Keep Images?"),
               message: L(
                  "ab.dataField.image.keepImagesDescription",
                  "*Do you want to keep the images referenced by #label#?"
               ).replace("#label#", this.label),
               callback: (result) => {
                  // update this setting so the server can respond correctly in
                  // ABFieldImage.migrateDrop()
                  this.settings.removeExistingData = result ? 0 : 1;
                  this.save()
                     .then(() => {
                        // TODO: a reminder that you still got alot on the server to do!
                        OP.Dialog.Alert({
                           title: "!! TODO !!",
                           text:
                              "Tell a Developer to actually pay attention to this!"
                        });
                        // now the default .destroy()
                        super
                           .destroy()
                           .then(resolve)
                           .catch(reject);
                     })
                     .catch(reject);
               }
            });
         } else {
            resolve(); // nothing to do really
         }
      });
   }

   ///
   /// Working with Actual Object Values:
   ///

   idCustomContainer(obj, formId) {
      // if formId is passed the field is in a form view not a grid and
      // we won't have the obj and each time this
      // field is in a form it will conflict with the last one rendered
      if (formId) {
         return "#columnName#-#id#-image"
            .replace("#id#", formId)
            .replace("#columnName#", this.columnName.replace(/ /g, "_"));
      } else {
         return "#columnName#-#id#-image"
            .replace("#id#", obj.id)
            .replace("#columnName#", this.columnName.replace(/ /g, "_"));
      }
   }

   // return the grid column header definition for this instance of ABFieldImage
   columnHeader(options) {
      options = options || {};

      var config = super.columnHeader(options);
      var field = this;

      config.editor = false; // 'text';  // '[edit_type]'   for your unique situation
      // config.sort   = 'string' // '[sort_type]'   for your unique situation

      var containerHeight = "100%";
      var imageHeight = "100%";
      var width = "100%";
      var imageSrcHeight = "100%";
      if (field.settings.useWidth) {
         config.width = field.settings.imageWidth || 100;
         var heightVal =
            field.settings.useHeight && field.settings.imageHeight
               ? field.settings.imageHeight + 20
               : 80;
         containerHeight = heightVal + "px";
         width = (field.settings.imageWidth || 100) + "px";
         imageHeight =
            field.settings.useHeight && field.settings.imageHeight
               ? field.settings.imageHeight
               : 80;
         imageHeight = imageHeight + "px";
         imageSrcHeight =
            field.settings.useHeight && field.settings.imageHeight
               ? field.settings.imageHeight
               : 60;
         imageSrcHeight = imageSrcHeight + "px";
      }
      if (field.settings.useHeight) {
         containerHeight = parseInt(field.settings.imageHeight) + 20;
         containerHeight = containerHeight + "px";
         imageHeight = parseInt(field.settings.imageHeight);
         imageHeight = imageHeight + "px";
         imageSrcHeight = parseInt(field.settings.imageHeight);
         imageSrcHeight = imageSrcHeight + "px";
      }

      var editable = options.editable;

      // populate our default template:
      // debugger;
      config.template = (obj) => {
         if (obj.$group) return obj[this.columnName];

         var widthStyle = "width: #width#; height: #height#"
            .replace("#width#", width)
            .replace("#height#", containerHeight);

         var imageStyle = "width: #width#; height: #height#"
            .replace("#width#", width)
            .replace("#height#", imageHeight);

         var imgDiv = [
            '<div class="ab-image-data-field" style="#useWidth#">'.replace(
               "#useWidth#",
               widthStyle
            ),
            '<div class="webix_view ab-image-holder" style="#useWidth#">'.replace(
               "#useWidth#",
               imageStyle
            ),
            '<div class="webix_template">',
            this.imageTemplate(obj, {
               editable: editable,
               height: imageSrcHeight,
               width: width
            }),
            "</div>",
            "</div>",
            "</div>"
         ].join("");

         return imgDiv;
      };

      return config;
   }

   /*
    * @function customDisplay
    * perform any custom display modifications for this field.
    * @param {object} row is the {name=>value} hash of the current row of data.
    * @param {App} App the shared ui App object useful more making globally
    *					unique id references.
    * @param {HtmlDOM} node  the HTML Dom object for this field's display.
    * @param {object} options - {
    * 		editable {Bool}   where or not this field is currently editable
    * 		formId {string}   the id of the presenting form if any
    * }
    */
   customDisplay(row, App, node, options) {
      // sanity check.
      if (!node) {
         return;
      }

      options = options || {};

      var idBase = App.unique(this.idCustomContainer(row, options.formId));

      // safety check:
      // webix seems to crash if you specify a .container that doesn't exists:
      // Note: when the template is first created, we don't have App.unique()
      var parentContainer = node.querySelector(".ab-image-holder");
      if (parentContainer) {
         parentContainer.innerHTML = "";
         // parentContainer.id = idBase;	// change it to the unique one.

         var imgHeight = 0;
         if (this.settings.useHeight) {
            imgHeight = parseInt(this.settings.imageHeight) || imgHeight;
         }

         var imgWidth = 0;
         if (this.settings.useWidth) {
            imgWidth = parseInt(this.settings.imageWidth) || imgWidth;
         }

         if (options.height) imgHeight = options.height;

         if (options.width) imgWidth = options.width;
         //// TODO: actually pay attention to the height and width when
         //// displaying the images.

         // use a webix component for displaying the content.
         // do this so I can use the progress spinner
         var webixContainer = webix.ui({
            view: "template",
            css: "ab-image-holder",
            // id: ids.container,
            container: parentContainer,

            template: this.imageTemplate(row, {
               editable: options.editable,
               height: imgHeight ? imgHeight + "px" : 0,
               width: imgWidth ? imgWidth + "px" : 0
            }),

            borderless: true,
            height: imgHeight,
            width: imgWidth
         });
         webix.extend(webixContainer, webix.ProgressBar);

         ////
         //// Prepare the Uploader
         ////

         if (!options.editable) {
            var domNode = parentContainer.querySelector(".delete-image");
            if (domNode) domNode.style.display = "none";

            return;
         }

         // The Server Side action key format for this Application:
         var actionKey =
            "opstool.AB_" +
            this.object.application.name.replace("_", "") +
            ".view";
         var url =
            "/" +
            [
               "opsportal",
               "image",
               this.object.application.name,
               actionKey,
               "1"
            ].join("/");

         var uploader = webix.ui({
            view: "uploader",
            // id:ids.uploader,
            apiOnly: true,
            upload: url,
            inputName: "image",
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
                  node.classList.remove("webix_invalid");
                  node.classList.remove("webix_invalid_cell");

                  // verify file type
                  var acceptableTypes = ["jpg", "jpeg", "bmp", "png", "gif"];
                  var type = item.type.toLowerCase();
                  if (acceptableTypes.indexOf(type) == -1) {
                     //// TODO: multilingual
                     webix.message(
                        "Only [" +
                           acceptableTypes.join(", ") +
                           "] images are supported"
                     );
                     return false;
                  }

                  // start progress indicator
                  webixContainer.showProgress({
                     type: "icon",
                     delay: 2000
                  });
               },

               // when upload is complete:
               onFileUpload: (item, response) => {
                  webixContainer.hideProgress();
                  this.showImage(response.data.uuid, node);

                  // TODO: delete previous image from our OPsPortal service?

                  var values = {};
                  values[this.columnName] = response.data.uuid;

                  // update just this value on our current object.model
                  if (row.id) {
                     this.object
                        .model()
                        .update(row.id, values)
                        .then(() => {
                           // update the client side data object as well so other data changes won't cause this save to be reverted
                           if (
                              $$(node) &&
                              $$(node).getItem &&
                              $$(node).getItem(row.id)
                           ) {
                              $$(node).updateItem(row.id, values);
                           } else {
                              // if you scroll the table the connection to the datatable is lost so we need to find it again
                              var dataTable = document.querySelector(
                                 ".webix_dtable"
                              );
                              if (
                                 $$(dataTable) &&
                                 $$(dataTable).getItem(row.id)
                              )
                                 $$(dataTable).updateItem(row.id, values);
                           }
                        })
                        .catch((err) => {
                           node.classList.add("webix_invalid");
                           node.classList.add("webix_invalid_cell");

                           OP.Error.log("Error updating our entry.", {
                              error: err,
                              row: row,
                              values: values
                           });
                           console.error(err);
                        });
                  }

                  // update value in the form component
                  this.setValue($$(node), values);
               },

               // if an error was returned
               onFileUploadError: function(item, response) {
                  OP.Error.log("Error loading image", response);
                  webixContainer.hideProgress();
               }
            }
         });
         uploader.addDropZone(webixContainer.$view);

         // store upload id into html element (it will be used in .customEdit)
         node.dataset["uploaderId"] = uploader.config.id;

         // if we are working in a datagrid we need to add a click event to
         // check if the user is clicking on the delete button
         if (node.className == "webix_cell") {
            node.addEventListener("click", (e) => {
               if (e.target.className.indexOf("delete-image") > -1) {
                  this.deleteImage = true;
               }
            });
         }
      }
   }

   /*
    * @function customEdit
    *
    * @param {object} row is the {name=>value} hash of the current row of data.
    * @param {App} App the shared ui App object useful more making globally
    *					unique id references.
    * @param {HtmlDOM} node  the HTML Dom object for this field's display.
    */
   customEdit(row, App, node, id, evt) {
      if (
         (evt && evt.target.className.indexOf("delete-image") > -1) ||
         this.deleteImage
      ) {
         delete this.deleteImage;
         if (!row.removeDefaultImage) {
            row.removeDefaultImage = [];
         }
         row.removeDefaultImage[this.columnName] = true;

         // Ask the user if they really want to delete the photo
         OP.Dialog.Confirm({
            title: "",
            message: L(
               "ab.dataField.image.removeImageDescription",
               "*Are you sure you want to remove this photo?"
            ),
            callback: (result) => {
               var confirmDelete = result ? 1 : 0;
               if (confirmDelete) {
                  // update just this value on our current object.model
                  var values = {};
                  values[this.columnName] = ""; // removing the reference to the image here

                  this.object
                     .model()
                     .update(row.id, values)
                     .then(() => {
                        // update the client side data object as well so other data changes won't cause this save to be reverted
                        if ($$(node) && $$(node).updateItem)
                           $$(node).updateItem(row.id, values);
                     })
                     .catch((err) => {
                        node.classList.add("webix_invalid");
                        node.classList.add("webix_invalid_cell");

                        OP.Error.log("Error updating our entry.", {
                           error: err,
                           row: row,
                           values: values
                        });
                        console.error(err);
                     });

                  // update value in the form component
                  this.setValue($$(node), values);
               }
            }
         });
      } else {
         var uploaderId = node.dataset["uploaderId"],
            uploader = $$(uploaderId);

         if (uploader && uploader.fileDialog)
            uploader.fileDialog({ rowid: row.id });
      }

      return false;
   }

   /*
    * @funciton formComponent
    * returns a drag and droppable component that is used on the UI
    * interface builder to place form components related to this ABField.
    *
    * an ABField defines which form component is used to edit it's contents.
    * However, what is returned here, needs to be able to create an instance of
    * the component that will be stored with the ABViewForm.
    */
   formComponent() {
      return super.formComponent("fieldcustom");
   }

   detailComponent() {
      var detailComponentSetting = super.detailComponent();

      detailComponentSetting.common = () => {
         return {
            key: "detailimage"
         };
      };

      return detailComponentSetting;
   }

   imageTemplate(obj, options) {
      options = options || {};
      options.height = options.height || "100%";
      options.width = options.width || "100%";

      // deault view is icon:
      var iconDisplay = "";
      var imageDisplay = "display:none";
      var imageURL = "";

      var value = "";
      var isRemoveDefaultImage = false;
      if (obj[this.columnName]) {
         value = obj[this.columnName];
      }
      if (obj.removeDefaultImage) {
         if (obj.removeDefaultImage[this.columnName]) {
            isRemoveDefaultImage = obj.removeDefaultImage[this.columnName];
         }
      }

      if (value) {
         iconDisplay = "display:none";
         imageDisplay = "";
         imageURL =
            "background-image:url('/opsportal/image/" +
            this.object.application.name +
            "/" +
            value +
            "');";
      } else {
         if (this.settings.useDefaultImage && !isRemoveDefaultImage) {
            iconDisplay = "display:none";
            imageDisplay = "";
            imageURL =
               "background-image:url('/opsportal/image/" +
               this.object.application.name +
               "/" +
               this.settings.defaultImageUrl +
               "');";
         }
      }

      var html = [
         `<div class="image-data-field-icon" style="${iconDisplay}"><i class="fa fa-picture-o fa-2x"></i>#drag#</div>` +
            `<div class="image-data-field-image" style="${imageDisplay} width:${options.width}; height:${options.height}; ${imageURL}">#remove#</div>`
      ].join("");

      html = html.replace(
         "#drag#",
         options.editable ? "<div>Drag and drop or click here</div>" : ""
      );
      html = html.replace(
         "#remove#",
         options.editable
            ? '<a style="' +
                 imageDisplay +
                 '" class="ab-delete-photo" href="javascript:void(0);"><i class="fa fa-times delete-image"></i></a>'
            : ""
      );

      return html;
   }

   showImage(uuid, node) {
      var parentContainer = node.querySelector(".ab-image-holder");
      if (parentContainer) {
         parentContainer.querySelector(".image-data-field-icon").style.display =
            "none";
         var image = parentContainer.querySelector(".image-data-field-image");
         image.style.display = "";
         image.style.backgroundImage =
            "url('/opsportal/image/" +
            this.object.application.name +
            "/" +
            uuid +
            "')";
         image.setAttribute("image-uuid", uuid);
      }
   }

   getValue(item, rowData) {
      var image = item.$view.querySelector(".image-data-field-image");
      return image.getAttribute("image-uuid");
   }

   setValue(item, rowData) {
      if (!item) return;

      var domNode = item.$view;
      if (!domNode) return;

      var val = null;
      if (rowData) {
         val = this.dataValue(rowData);

         // if (val == null) {
         // 	// assume they just sent us a single value
         // 	val = rowData;
         // }
      }

      var imageIcon = domNode.querySelector(".image-data-field-icon");
      if (imageIcon) imageIcon.style.display = val ? "none" : "";

      var image = domNode.querySelector(".image-data-field-image");
      if (image) {
         var imageDeleteIcon = image.querySelector(".ab-delete-photo");
         if (imageDeleteIcon)
            imageDeleteIcon.style.display = val ? "block" : "none";

         image.style.display = val ? "block" : "none";

         if (val) {
            image.style.backgroundImage =
               "url('/opsportal/image/" +
               this.object.application.name +
               "/" +
               val +
               "')";
            image.setAttribute("image-uuid", val);
         } else {
            image.removeAttribute("image-uuid");
         }
      }
   }

   /**
    * @method toBase64
    *
    * @param {Object} rowData
    *
    * @return {Promise} - {
    * 		data: string,
    * 		width: number,
    * 		height: number
    * }
    */
   toBase64(rowData) {
      var promise = new Promise((resolve, reject) => {
         if (!rowData[this.columnName]) return resolve(null);

         var img = new Image();
         img.crossOrigin = "Anonymous";
         img.onerror = function(err) {
            reject(err);
         };
         img.onload = function() {
            var canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            var dataURL = canvas.toDataURL();
            var imageData = {
               data: dataURL,
               width: img.width,
               height: img.height
            };
            resolve(imageData);
         };

         img.src = "/opsportal/image/{application}/{image}"
            .replace("{application}", this.object.application.name)
            .replace("{image}", rowData[this.columnName]);
      });
      return promise;
   }
};
