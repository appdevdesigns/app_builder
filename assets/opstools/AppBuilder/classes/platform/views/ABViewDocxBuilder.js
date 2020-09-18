const ABViewDocxBuilderCore = require("../../core/views/ABViewDocxBuilderCore");

const ABFieldConnect = require("../dataFields/ABFieldConnect");
const ABFieldImage = require("../dataFields/ABFieldImage");
const ABObjectQuery = require("../ABObjectQuery");

const ABViewDocxBuilderPropertyComponentDefaults = ABViewDocxBuilderCore.defaultValues();

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

function letUserDownload(blob, filename) {
   let url = window.URL.createObjectURL(blob);

   let a = document.createElement("a");
   a.href = url;
   a.download = filename;
   document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
   a.click();
   a.remove(); //afterwards we remove the element again

   window.URL.revokeObjectURL(url);
}

module.exports = class ABViewDocxBuilder extends ABViewDocxBuilderCore {
   constructor(values, application, parent, defaultValues) {
      super(values, application, parent, defaultValues);
   }

   //
   //	Editor Related
   //

   /**
    * @method editorComponent
    * return the Editor for this UI component.
    * the editor should display either a "block" view or "preview" of
    * the current layout of the view.
    * @param {string} mode what mode are we in ['block', 'preview']
    * @return {Component}
    */
   editorComponent(App, mode) {
      var idBase = "ABViewDocxBuilderEditorComponent";

      var DocxBuilderComponent = this.component(App, idBase);

      return DocxBuilderComponent;
   }

   //
   // Property Editor
   //
   static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {
      var commonUI = super.propertyEditorDefaultElements(
         App,
         ids,
         _logic,
         ObjectDefaults
      );

      _logic.validateType = (item) => {
         // verify file type
         var acceptableTypes = ["docx"];
         var type = item.type.toLowerCase();
         if (acceptableTypes.indexOf(type) == -1) {
            //// TODO: multilingual
            webix.message(
               "Only [" + acceptableTypes.join(", ") + "] files are supported"
            );
            return false;
         } else {
            // set upload url to uploader
            let currView = _logic.currentEditObject();
            let uploadUrl = currView.uploadUrl();

            $$(ids.docxFile).define("upload", uploadUrl);
            $$(ids.docxFile).refresh();

            return true;
         }
      };

      _logic.uploadedFile = (fileInfo) => {
         if (!fileInfo || !fileInfo.data) return;

         let currView = _logic.currentEditObject();
         currView.settings.filename = fileInfo.data.uuid;
         currView.settings.filelabel = fileInfo.name;

         $$(ids.filelabel).setValue(currView.settings.filelabel);
         $$(ids.docxDownload).show();
      };

      _logic.downloadFile = () => {
         let currView = _logic.currentEditObject();
         let url = currView.downloadUrl();

         fetch(url)
            .then((response) => response.blob())
            .then((blob) => {
               letUserDownload(blob, currView.settings.filelabel);
            });
      };

      // Populate language options
      OP.Comm.Service.get({
         url: "/appdev-core/sitemultilinguallanguage"
      }).then((languages) => {
         let langOptions = (languages || []).map((lang) => {
            return {
               id: lang.language_code,
               value: lang.language_label
            };
         });

         $$(ids.language).define("options", langOptions);
         $$(ids.language).refresh();
      });

      // in addition to the common .label  values, we
      // ask for:
      return commonUI.concat([
         {
            view: "fieldset",
            label: L("ab.component.label.dataSource", "*Data:"),
            labelWidth: App.config.labelWidthLarge,
            body: {
               type: "clean",
               padding: 10,
               rows: [
                  {
                     name: "datacollection",
                     // view: 'richselect',
                     view: "multicombo",
                     label: L(
                        "ab.components.docxBuilder.dataSource",
                        "*Data Source"
                     ),
                     labelWidth: App.config.labelWidthLarge
                  }
               ]
            }
         },

         {
            view: "fieldset",
            label: L(
               "ab.component.docxBuilder.templateFile",
               "*Template file:"
            ),
            labelWidth: App.config.labelWidthLarge,
            body: {
               type: "clean",
               padding: 10,
               rows: [
                  {
                     cols: [
                        {
                           view: "label",
                           label: L(
                              "ab.component.docxBuilder.title",
                              "*DOCX file:"
                           ),
                           css: "ab-text-bold",
                           width: App.config.labelWidthXLarge
                        },
                        {
                           view: "uploader",
                           value: "*Upload",
                           name: "docxFile",
                           apiOnly: true,
                           inputName: "file",
                           multiple: false,
                           on: {
                              onBeforeFileAdd: (item) => {
                                 return _logic.validateType(item);
                              },

                              onFileUpload: (file, response) => {
                                 _logic.uploadedFile(file);
                              },

                              onFileUploadError: (file, response) => {}
                           }
                        }
                     ]
                  },
                  {
                     name: "filelabel",
                     view: "text",
                     label: L(
                        "ab.components.docxBuilder.filename",
                        "*Filename"
                     ),
                     labelWidth: App.config.labelWidthLarge
                  },
                  {
                     name: "docxDownload",
                     view: "button",
                     type: "icon",
                     css: "webix_primary",
                     icon: "fa fa-file-word-o",
                     label: "Download Template File",
                     click: () => {
                        _logic.downloadFile();
                     }
                  }
               ]
            }
         },

         {
            view: "fieldset",
            label: L("ab.component.docxBuilder.language", "*Language:"),
            labelWidth: App.config.labelWidthLarge,
            body: {
               type: "clean",
               padding: 10,
               rows: [
                  {
                     name: "language",
                     view: "richselect",
                     label: L(
                        "ab.components.docxBuilder.language",
                        "*Language"
                     ),
                     labelWidth: App.config.labelWidthLarge
                  }
               ]
            }
         },

         {
            view: "fieldset",
            label: L(
               "ab.component.label.customizeDisplay",
               "*Customize Display:"
            ),
            labelWidth: App.config.labelWidthLarge,
            body: {
               type: "clean",
               padding: 10,
               rows: [
                  {
                     name: "buttonlabel",
                     view: "text",
                     label: L("ab.components.docxBuilder.text", "*Label"),
                     labelWidth: App.config.labelWidthXLarge
                  },

                  {
                     view: "counter",
                     name: "width",
                     label: L("ab.components.docxBuilder.width", "*Width:"),
                     labelWidth: App.config.labelWidthXLarge
                  },
                  {
                     view: "richselect",
                     name: "toolbarBackground",
                     label: L(
                        "ab.component.page.toolbarBackground",
                        "*Page background:"
                     ),
                     labelWidth: App.config.labelWidthXLarge,
                     options: [
                        {
                           id: "ab-background-default",
                           value: L(
                              "ab.component.page.toolbarBackgroundDefault",
                              "*White (default)"
                           )
                        },
                        {
                           id: "webix_dark",
                           value: L(
                              "ab.component.page.toolbarBackgroundDark",
                              "*Dark"
                           )
                        },
                        {
                           id: "ab-background-lightgray",
                           value: L(
                              "ab.component.page.toolbarBackgroundDark",
                              "*Gray"
                           )
                        }
                     ]
                  },

                  {
                     view: "richselect",
                     name: "buttonPosition",
                     label: L(
                        "ab.component.page.buttonPosition",
                        "*Button Position:"
                     ),
                     labelWidth: App.config.labelWidthXLarge,
                     options: [
                        {
                           id: "left",
                           value: L(
                              "ab.component.page.buttonPositionLeft",
                              "*Left (default)"
                           )
                        },
                        {
                           id: "center",
                           value: L(
                              "ab.component.page.buttonPositionCenter",
                              "*Centered"
                           )
                        },
                        {
                           id: "right",
                           value: L(
                              "ab.component.page.buttonPositionRight",
                              "*Right"
                           )
                        }
                     ]
                  }
               ]
            }
         }
      ]);
   }

   static propertyEditorPopulate(App, ids, view) {
      super.propertyEditorPopulate(App, ids, view);

      let $DcSelector = $$(ids.datacollection);

      let selectedDvId = view.settings.dataviewID
         ? view.settings.dataviewID
         : null;

      $$(ids.toolbarBackground).setValue(
         view.settings.toolbarBackground ||
            ABViewDocxBuilderPropertyComponentDefaults.toolbarBackground
      );
      $$(ids.buttonPosition).setValue(
         view.settings.buttonPosition ||
            ABViewDocxBuilderPropertyComponentDefaults.buttonPosition
      );

      // Pull data views to options
      let dcOptions = view.application.datacollections().map((dc) => {
         return {
            id: dc.id,
            value: dc.label
         };
      });

      $DcSelector.define("options", dcOptions);
      $DcSelector.define("value", selectedDvId);
      $DcSelector.refresh();

      $$(ids.language).setValue(
         view.settings.language ||
            ABViewDocxBuilderPropertyComponentDefaults.language
      );

      $$(ids.filelabel).setValue(view.settings.filelabel);
      $$(ids.buttonlabel).setValue(view.settings.buttonlabel);
      $$(ids.width).setValue(view.settings.width);

      if (view.settings.filename) {
         $$(ids.docxDownload).show();
      } else {
         $$(ids.docxDownload).hide();
      }
   }

   static propertyEditorValues(ids, view) {
      super.propertyEditorValues(ids, view);

      view.settings.buttonlabel = $$(ids.buttonlabel).getValue();
      view.settings.dataviewID = $$(ids.datacollection).getValue();
      view.settings.width = $$(ids.width).getValue();
      view.settings.filelabel = $$(ids.filelabel).getValue();
      view.settings.language = $$(ids.language).getValue();
      view.settings.toolbarBackground = $$(ids.toolbarBackground).getValue();
      view.settings.buttonPosition = $$(ids.buttonPosition).getValue();
   }

   /**
    * @function component()
    * return a UI component based upon this view.
    * @param {obj} App
    * @return {obj} UI component
    */
   component(App) {
      let baseCom = super.component(App);

      var idBase = "ABViewDocxBuilder_" + this.id;
      var ids = {
         button: App.unique(idBase + "_button"),
         noFile: App.unique(idBase + "_noFile")
      };

      var autowidth = false;
      var buttonWidth =
         this.settings.width ||
         ABViewDocxBuilderPropertyComponentDefaults.width;
      if (buttonWidth == 0) {
         autowidth = true;
      }

      var leftSpacer = {
         type: "spacer",
         width: 1
      };
      var rightSpacer = {
         type: "spacer",
         width: 1
      };
      var buttonPos =
         this.settings.buttonPosition ||
         ABViewDocxBuilderPropertyComponentDefaults.buttonPosition;
      if (buttonPos == "left") {
         rightSpacer = {
            type: "spacer"
         };
      } else if (buttonPos == "center") {
         leftSpacer = {
            type: "spacer"
         };
         rightSpacer = {
            type: "spacer"
         };
      } else if (buttonPos == "right") {
         leftSpacer = {
            type: "spacer"
         };
      }

      var _ui = {
         view: "toolbar",
         css:
            this.settings.toolbarBackground ||
            ABViewDocxBuilderPropertyComponentDefaults.toolbarBackground,
         cols: [
            leftSpacer,
            {
               id: ids.button,
               view: "button",
               css: "webix_primary",
               type: "icon",
               icon: "fa fa-file-word-o",
               label:
                  this.settings.buttonlabel ||
                  ABViewDocxBuilderPropertyComponentDefaults.buttonlabel,
               width:
                  this.settings.width ||
                  ABViewDocxBuilderPropertyComponentDefaults.width,
               autowidth: autowidth,
               click: () => {
                  _logic.renderFile();
               }
            },
            {
               id: ids.noFile,
               view: "label",
               label: "No template file"
            },
            {
               type: "spacer"
            },
            rightSpacer
         ]
      };

      // make sure each of our child views get .init() called
      var _init = (options) => {
         let DownloadButton = $$(ids.button);
         let NoFileLabel = $$(ids.noFile);

         if (this.settings.filename) {
            DownloadButton.show();
            NoFileLabel.hide();
         } else {
            DownloadButton.hide();
            NoFileLabel.show();
         }
      };

      let _logic = {
         busy: () => {
            let DownloadButton = $$(ids.button);
            if (!DownloadButton) return;

            DownloadButton.disable();

            DownloadButton.define("icon", "fa fa-refresh fa-spin");
            DownloadButton.refresh();
         },

         ready: () => {
            let DownloadButton = $$(ids.button);
            if (!DownloadButton) return;

            DownloadButton.enable();

            DownloadButton.define("icon", "fa fa-file-word-o");
            DownloadButton.refresh();
         },

         onShow: (viewId) => {
            let tasks = [];

            this.datacollections.forEach((dc) => {
               if (dc && dc.dataStatus == dc.dataStatusFlag.notInitial) {
                  // load data when a widget is showing
                  tasks.push(dc.loadData());
               }
            });

            // Show loading cursor
            if (tasks.length > 0) _logic.busy();

            Promise.all(tasks)
               .catch((err) => console.error(err))
               .then(() => {
                  // Hide loading cursor
                  _logic.ready();
               });
         },

         renderFile: () => {
            _logic.busy();

            let reportValues = {};
            let images = {};
            let summaries = {}; // { varName: sum number, ..., varName2: number2 }

            Promise.resolve()
               // Get current cursor
               .then(() => {
                  let datacollections = this.datacollections;
                  let isDcLabelAdded = datacollections.length > 1;

                  datacollections.forEach((dc) => {
                     if (dc == null) return;

                     let obj = dc.datasource;
                     if (obj == null) return;

                     let dcValues = [];
                     let dataList = [];

                     let dcCursor = dc.getCursor();

                     // merge cursor to support dc and tree cursor in the report
                     if (dcCursor) {
                        let treeCursor = dc.getCursor(true);
                        dataList.push(_.merge({}, dcCursor, treeCursor));
                     } else dataList = _.cloneDeep(dc.getData());

                     // update property names to column labels to match format names in docx file
                     let mlFields = obj.multilingualFields();

                     let setReportValues = (
                        baseData,
                        targetData,
                        field,
                        fieldLabels = []
                     ) => {
                        let val = null;

                        targetData.id = baseData.id;
                        targetData[`${field.columnName}_ORIGIN`] =
                           baseData[field.columnName]; // Keep origin value for compare value with custom index

                        // Translate multilinguage fields
                        if (mlFields.length) {
                           let transFields = (mlFields || []).filter(
                              (fieldName) => baseData[fieldName] != null
                           );
                           this.application.translate(
                              baseData,
                              baseData,
                              transFields,
                              this.languageCode
                           );
                        }

                        // Pull value
                        if (field instanceof ABFieldConnect) {
                           // If field is connected field, then
                           // {
                           //		fieldName: {Object} or [Array]
                           // }
                           val = baseData[field.columnName];

                           if (val && val.forEach) {
                              val.forEach((v) => {
                                 if (v == null) return;

                                 // format relation data
                                 if (field.datasourceLink) {
                                    field.datasourceLink
                                       .fields((f) => f.key != "connectObject")
                                       .forEach((f) => {
                                          v[`${f.columnName}_ORIGIN`] =
                                             v[f.columnName];

                                          v[f.columnName] = f.format(v, {
                                             languageCode: this.languageCode
                                          });
                                       });
                                 }

                                 // Keep ABObject to relation data
                                 if (v && typeof v == "object")
                                    v._object = field.datasourceLink;
                              });
                           }
                           // TODO
                           // data[label + '_label'] = field.format(baseData);
                        } else {
                           val = field.format(baseData, {
                              languageCode: this.languageCode
                           });
                        }

                        // Set value to report with every languages of label
                        fieldLabels.forEach((label) => {
                           if (val) {
                              targetData[label] = val;
                           } else if (!targetData[label]) {
                              targetData[label] = "";
                           }
                        });

                        // normalize child items
                        if (baseData.data && baseData.data.length) {
                           targetData.data = targetData.data || [];
                           (baseData.data || []).forEach((childItem, index) => {
                              // add new data item
                              if (targetData.data[index] == null)
                                 targetData.data[index] = {};

                              setReportValues(
                                 childItem,
                                 targetData.data[index],
                                 field,
                                 fieldLabels
                              );
                           });
                        }
                     };

                     dataList.forEach((data) => {
                        let resultData = {};

                        // Keep id of ABObject into .scope of DOCX templater
                        resultData._object = obj;

                        // For support label of columns every languages
                        obj.fields().forEach((f) => {
                           let fieldLabels = [];

                           // Query Objects
                           if (obj instanceof ABObjectQuery) {
                              if (typeof f.object.translations == "string")
                                 f.object.translations = JSON.parse(
                                    f.object.translations
                                 );

                              if (typeof f.translations == "string")
                                 f.translations = JSON.parse(f.translations);

                              (f.object.translations || []).forEach(
                                 (objTran) => {
                                    let fieldTran = (
                                       f.translations || []
                                    ).filter(
                                       (fieldTran) =>
                                          fieldTran.language_code ==
                                          objTran.language_code
                                    )[0];

                                    if (!fieldTran) return;

                                    let objectLabel = objTran.label;
                                    let fieldLabel = fieldTran.label;

                                    // Replace alias with label of object
                                    fieldLabels.push(
                                       `${objectLabel}.${fieldLabel}`
                                    );
                                 }
                              );
                           }
                           // Normal Objects
                           else {
                              if (typeof f.translations == "string")
                                 f.translations = JSON.parse(f.translations);

                              f.translations.forEach((tran) => {
                                 fieldLabels.push(tran.label);
                              });
                           }

                           setReportValues(data, resultData, f, fieldLabels);
                        });

                        dcValues.push(resultData);
                     });

                     // If data sources have more than 1, then add label of data source
                     let datacollectionData =
                        dcValues.length > 1 ? dcValues : dcValues[0];
                     if (isDcLabelAdded) {
                        (dc.translations || []).forEach((tran) => {
                           reportValues[tran.label] = datacollectionData;
                        });
                     } else reportValues = datacollectionData;
                  });

                  return Promise.resolve();
               })
               // Download images
               .then(() => {
                  console.log("DOCX data: ", reportValues);

                  let tasks = [];

                  let addDownloadTask = (fieldImage, data = []) => {
                     data.forEach((d) => {
                        let imageVal = fieldImage.format(d);
                        if (imageVal && !images[imageVal]) {
                           tasks.push(
                              new Promise((ok, bad) => {
                                 let imgUrl = `/opsportal/image/${this.application.name}/${imageVal}`;

                                 JSZipUtils.getBinaryContent(imgUrl, function(
                                    error,
                                    content
                                 ) {
                                    if (error) return bad(error);
                                    else {
                                       // store binary of image
                                       images[imageVal] = content;

                                       ok();
                                    }
                                 });
                              })
                           );
                        }

                        // download images of child items
                        addDownloadTask(fieldImage, d.data || []);
                     });
                  };

                  this.datacollections.forEach((dc) => {
                     if (!dc) return;

                     let obj = dc.datasource;
                     if (!obj) return;

                     let currCursor = dc.getCursor();
                     if (currCursor) {
                        // Current cursor
                        let treeCursor = dc.getCursor(true);
                        currCursor = [_.merge({}, currCursor, treeCursor)];
                     } // List of data
                     else currCursor = dc.getData();

                     obj.fields((f) => f instanceof ABFieldImage).forEach(
                        (f) => {
                           addDownloadTask(f, currCursor);
                        }
                     );
                  });

                  return Promise.all(tasks);
               })
               .then(() => {
                  // Download the template file
                  return new Promise((next, err) => {
                     let url = this.downloadUrl();

                     JSZipUtils.getBinaryContent(url, (error, content) => {
                        if (error) return err(error);

                        next(content);
                     });
                  });
               })
               .then((content) => {
                  // Generate Docx file
                  return new Promise((next, err) => {
                     let zip = new JSZip(content);
                     let doc = new Docxtemplater();

                     let imageModule = new ImageModule({
                        centered: false,
                        getImage: (tagValue, tagName) => {
                           // NOTE: .getImage of version 3.0.2 does not support async
                           //			we can buy newer version to support it
                           //			https://docxtemplater.com/modules/image/

                           return images[tagValue] || "";
                        },
                        getSize: (imgBuffer, tagValue, tagName) => {
                           let defaultVal = [300, 160];

                           let dc = this.datacollection;
                           if (!dc) return defaultVal;

                           let obj = dc.datasource;
                           if (!obj) return defaultVal;

                           // This is a query object
                           if (tagName.indexOf(".") > -1) {
                              let tagNames = tagName.split(".");

                              obj = obj.objects(
                                 (o) => o.label == tagNames[0]
                              )[0]; // Label of object
                              if (!obj) return defaultVal;

                              tagName = tagNames[1]; // Field name
                           }

                           let imageField = obj.fields(
                              (f) => f.columnName == tagName
                           )[0];
                           if (!imageField || !imageField.settings)
                              return defaultVal;

                           if (
                              imageField.settings.useWidth &&
                              imageField.settings.imageWidth
                           )
                              defaultVal[0] = imageField.settings.imageWidth;

                           if (
                              imageField.settings.useHeight &&
                              imageField.settings.imageHeight
                           )
                              defaultVal[1] = imageField.settings.imageHeight;

                           return defaultVal;
                        }
                        // getSize: function (imgBuffer, tagValue, tagName) {
                        // 	if (imgBuffer) {
                        // 		var maxWidth = 300;
                        // 		var maxHeight = 160;

                        // 		// Find aspect ratio image dimensions
                        // 		try {
                        // 			var image = sizeOf(imgBuffer);
                        // 			var ratio = Math.min(maxWidth / image.width, maxHeight / image.height);

                        // 			return [image.width * ratio, image.height * ratio];
                        // 		}
                        // 		// if invalid image, then should return 0, 0 sizes
                        // 		catch (err) {
                        // 			return [0, 0];
                        // 		}

                        // 	}
                        // 	else {
                        // 		return [0, 0];
                        // 	}
                        // }
                     });

                     try {
                        doc.attachModule(imageModule)
                           .loadZip(zip)
                           .setData(reportValues)
                           .setOptions({
                              parser: function(tag) {
                                 return {
                                    get: function(scope, context) {
                                       // NOTE: AppBuilder custom filter : no return empty items
                                       if (tag.indexOf("data|") == 0) {
                                          let prop = (
                                             tag.split("|")[1] || ""
                                          ).trim();

                                          return (scope["data"] || []).filter(
                                             function(item) {
                                                return item[prop]
                                                   ? true
                                                   : false;
                                             }
                                          );
                                       }
                                       // Mark number to add to a variable
                                       else if (tag.indexOf("|$sum?") > -1) {
                                          let prop = tag.split("|$sum?")[0];
                                          let varName = tag.split("|$sum?")[1];

                                          let number = scope[prop];
                                          if (typeof number == "string") {
                                             number = number.replace(
                                                /[^\d.]/g, // return only number and dot
                                                ""
                                             );
                                          }

                                          if (summaries[varName] == null)
                                             summaries[varName] = 0.0;

                                          summaries[varName] += parseFloat(
                                             number
                                          );

                                          return scope[prop];
                                       }
                                       // Show sum value ^
                                       else if (tag.indexOf("$sum?") == 0) {
                                          let varName = tag.replace(
                                             "$sum?",
                                             ""
                                          );

                                          return summaries[varName] || 0;
                                       }
                                       // // Sum number of .data (Grouped query)
                                       // else if (tag.indexOf("$sum|") == 0) {
                                       //    let prop = (
                                       //       tag.split("|")[1] || ""
                                       //    ).trim();

                                       //    let sum = 0;
                                       //    (scope["data"] || []).forEach(
                                       //       (childItem) => {
                                       //          if (!childItem[prop]) return;

                                       //          let number = childItem[prop];
                                       //          if (typeof number == "string") {
                                       //             number = number.replace(
                                       //                /[^\d.]/g, // return only number and dot
                                       //                ""
                                       //             );
                                       //          }

                                       //          try {
                                       //             sum += parseFloat(
                                       //                number || 0
                                       //             );
                                       //          } catch (e) {}
                                       //       }
                                       //    );

                                       //    // Print number with commas
                                       //    if (sum) {
                                       //       sum = sum
                                       //          .toString()
                                       //          .replace(
                                       //             /\B(?=(\d{3})+(?!\d))/g,
                                       //             ","
                                       //          );
                                       //    }

                                       //    return sum;
                                       // }
                                       // NOTE: AppBuilder custom filter of another data source
                                       else if (tag.indexOf("$") == 0) {
                                          let props = tag
                                             .replace("$", "")
                                             .split("|");
                                          let propSource = props[0].trim();
                                          let propFilter = props[1].trim(); // column name of ABFieldConnect

                                          if (!propSource || !propFilter)
                                             return "";

                                          // Pull Index field of connect field
                                          let indexColName;
                                          let obj = scope._object;
                                          if (obj) {
                                             let connectedField = obj.fields(
                                                (f) =>
                                                   f.columnName == propFilter
                                             )[0];
                                             if (connectedField) {
                                                let indexField =
                                                   connectedField.indexField;
                                                indexColName = indexField
                                                   ? indexField.columnName
                                                   : null;
                                             }
                                          }

                                          let sourceVals =
                                             reportValues[propSource];
                                          if (
                                             sourceVals &&
                                             !Array.isArray(sourceVals)
                                          )
                                             sourceVals = [sourceVals];

                                          let getVal = (data) => {
                                             return (
                                                data[
                                                   `${indexColName}_ORIGIN`
                                                ] || // Pull origin data to compare by custom index
                                                data[indexColName] ||
                                                data.id ||
                                                data
                                             );
                                          };

                                          return (sourceVals || []).filter(
                                             function(item) {
                                                // Pull data of parent to compare
                                                let comparer =
                                                   scope[propFilter];

                                                if (Array.isArray(comparer))
                                                   return (
                                                      comparer.filter(
                                                         (c) =>
                                                            getVal(c) ==
                                                            getVal(item)
                                                      ).length > 0
                                                   );
                                                else {
                                                   return (
                                                      getVal(item) ==
                                                      getVal(comparer)
                                                   );
                                                }
                                             }
                                          );
                                       }
                                       // ์NOTE : Custom filter
                                       else if (tag.indexOf("?") > -1) {
                                          let result = scope;
                                          let prop = tag.split("?")[0];
                                          let condition = tag.split("?")[1];
                                          if (prop && condition) {
                                             let data = scope[prop];
                                             if (data) {
                                                if (!Array.isArray(data))
                                                   data = [data];

                                                return data.filter((d) =>
                                                   eval(
                                                      condition.replace(
                                                         /\./g,
                                                         "d."
                                                      )
                                                   )
                                                );
                                             }
                                          }
                                          return result;
                                       } else if (tag === ".") {
                                          return scope;
                                       } else {
                                          return scope[tag];
                                       }
                                    }
                                 };
                              }
                           })
                           .render(); // render the document
                     } catch (error) {
                        return err(error);
                     }

                     var docxFile = doc.getZip().generate({
                        type: "blob",
                        mimeType:
                           "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                     }); //Output the document using Data-URI

                     next(docxFile);
                  });
               })
               .then((blobFile) => {
                  // Let user download the output file
                  return new Promise((next, err) => {
                     letUserDownload(blobFile, this.settings.filelabel);

                     next();
                  });
               })
               // Final step
               .then(() => {
                  _logic.ready();
               });
         }
      };

      return {
         ui: _ui,
         init: _init,
         logic: _logic,
         onShow: _logic.onShow
      };
   }
};
