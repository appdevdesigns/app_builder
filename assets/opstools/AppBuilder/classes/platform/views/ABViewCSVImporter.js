const ABViewCSVImporterCore = require("../../core/views/ABViewCSVImporterCore");

const CSVImporter = require("../CSVImporter");
const ABRecordRule = require("../../rules/ABViewRuleListFormRecordRules");

const ABViewCSVImporterPropertyComponentDefaults = ABViewCSVImporterCore.defaultValues();

var FilterComplex = require("../FilterComplex");

let PopupRecordRule = null;

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABViewCSVImporter extends ABViewCSVImporterCore {
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
      let idBase = "ABViewCsvImporterEditorComponent";
      let component = this.component(App, idBase);

      return component;
   }

   //
   // Property Editor
   //

   static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {
      let commonUI = super.propertyEditorDefaultElements(
         App,
         ids,
         _logic,
         ObjectDefaults
      );

      let idBase = "ABViewCSVImporter";

      PopupRecordRule = new ABRecordRule();
      PopupRecordRule.component(App, idBase + "_recordrule"); // prepare the UI component.

      // _logic functions

      _logic.selectSource = (dcId, oldDcId) => {
         let currView = _logic.currentEditObject();

         this.propertyUpdateRules(ids, currView);

         // refresh UI
         currView.emit("properties.updated", currView);

         // save
         currView.settings.dataviewID = dcId;
         currView.save();
      };

      _logic.recordRuleShow = () => {
         let currView = _logic.currentEditObject();

         PopupRecordRule.formLoad(currView);
         PopupRecordRule.fromSettings(currView.settings.recordRules);
         PopupRecordRule.show();

         // Workaround
         PopupRecordRule.qbFixAfterShow();
      };

      _logic.recordRuleSave = (settings) => {
         let currView = _logic.currentEditObject();
         currView.settings.recordRules = settings;

         // trigger a save()
         this.propertyEditorSave(ids, currView);

         // update badge number of rules
         this.populateBadgeNumber(ids, currView);
      };

      PopupRecordRule.init({
         onSave: _logic.recordRuleSave
      });

      return commonUI.concat([
         {
            view: "fieldset",
            label: L("ab.component.label.dataSource", "*Data:"),
            labelWidth: App.config.labelWidthLarge,
            body: {
               name: "datacollection",
               view: "richselect",
               label: L("ab.components.form.dataSource", "*Data Source"),
               labelWidth: App.config.labelWidthLarge,
               skipAutoSave: true,
               on: {
                  onChange: _logic.selectSource
               }
            }
         },
         {
            view: "fieldset",
            label: L("ab.components.form.rules", "*Rules:"),
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
                              "ab.components.form.recordRules",
                              "*Record Rules:"
                           ),
                           width: App.config.labelWidthLarge
                        },
                        {
                           view: "button",
                           name: "buttonRecordRules",
                           css: "webix_primary",
                           label: L("ab.components.form.settings", "*Settings"),
                           icon: "fa fa-gear",
                           type: "icon",
                           badge: 0,
                           click: function() {
                              _logic.recordRuleShow();
                           }
                        }
                     ]
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
                     name: "buttonLabel",
                     view: "text",
                     label: L("ab.components.csvImporter.label", "*Label"),
                     labelWidth: App.config.labelWidthXLarge
                  },
                  {
                     view: "counter",
                     name: "width",
                     label: L("ab.components.csvImporter.width", "*Width:"),
                     labelWidth: App.config.labelWidthXLarge
                  }
               ]
            }
         }
      ]);
   }

   static propertyEditorPopulate(App, ids, view) {
      super.propertyEditorPopulate(App, ids, view);

      // Pull data views to options
      let dcOptions = view.application.datacollections().map((dc) => {
         return {
            id: dc.id,
            value: dc.label
         };
      });

      let $DcSelector = $$(ids.datacollection);
      $DcSelector.define("options", dcOptions);
      $DcSelector.define("value", view.settings.dataviewID || null);
      $DcSelector.refresh();

      $$(ids.buttonLabel).setValue(view.settings.buttonLabel);
      $$(ids.width).setValue(view.settings.width);

      this.propertyUpdateRules(ids, view);
      this.populateBadgeNumber(ids, view);

      // when a change is made in the properties the popups need to reflect the change
      this.updateEventIds = this.updateEventIds || {}; // { viewId: boolean, ..., viewIdn: boolean }
      if (!this.updateEventIds[view.id]) {
         this.updateEventIds[view.id] = true;

         view.addListener("properties.updated", () => {
            this.populateBadgeNumber(ids, view);
         });
      }
   }

   static propertyEditorValues(ids, view) {
      super.propertyEditorValues(ids, view);

      view.settings.dataviewID = $$(ids.datacollection).getValue();
      view.settings.buttonLabel = $$(ids.buttonLabel).getValue();
      view.settings.width = $$(ids.width).getValue();
   }

   static propertyUpdateRules(ids, view) {
      if (!view) return;

      // Populate values to rules
      let selectedDv = view.datacollection;
      if (selectedDv) {
         PopupRecordRule.objectLoad(selectedDv.datasource);
      }

      // PopupDisplayRule.formLoad(view);
      PopupRecordRule.formLoad(view);
   }

   static populateBadgeNumber(ids, view) {
      if (!view) return;

      if (view.settings.recordRules) {
         $$(ids.buttonRecordRules).define(
            "badge",
            view.settings.recordRules.length || null
         );
         $$(ids.buttonRecordRules).refresh();
      } else {
         $$(ids.buttonRecordRules).define("badge", null);
         $$(ids.buttonRecordRules).refresh();
      }
   }

   /**
    * @method component()
    * return a UI component based upon this view.
    * @param {obj} App
    * @return {obj} UI component
    */
   component(App, idBase) {
      idBase = idBase || "ABCSVImporter_" + this.id;
      let ids = {
         button: App.unique(idBase + "_button"),
         popup: App.unique(idBase + "_popup"),

         form: App.unique(idBase + "_form"),
         uploader: App.unique(idBase + "_uploader"),
         uploadFileList: App.unique(idBase + "_uploadList"),
         separatedBy: App.unique(idBase + "_separatedBy"),
         headerOnFirstLine: App.unique(idBase + "_headerOnFirstLine"),
         columnList: App.unique(idBase + "_columnList"),

         search: App.unique(idBase + "_search"),
         datatable: App.unique(idBase + "_datatable"),

         statusMessage: App.unique(idBase + "_statusMessage"),
         progressBar: App.unique(idBase + "_progressBar"),

         importButton: App.unique(idBase + "_importButton"),
         rules: App.unique(idBase + "_datatable_rules")
      };

      let csvImporter = new CSVImporter(App);
      let _dataRows = null;
      let _currentObject = null;
      let _csvFileInfo = null;

      let labels = {
         common: App.labels,
         component: {
            importCsvHeader: L(
               "ab.object.form.csv.importCsvHeader",
               "*Import CSV"
            ),
            selectCsvFile: L(
               "ab.object.form.csv.selectCsvFile",
               "*Choose a CSV file"
            ),

            fileTypeErrorTitle: L(
               "ab.object.form.csv.fileTypeErrorTitle",
               "*This file extension is disallow"
            ),
            fileTypeError: L(
               "ab.object.form.csv.fileTypeError",
               "*Please only upload CSV file"
            ),

            separatedBy: L("ab.object.form.csv.separatedBy", "*Separated by"),
            headerFirstLine: L(
               "ab.object.form.csv.headerFirstLine",
               "*Header on first line"
            ),

            import: L("ab.object.form.csv.import") || "*Import"
         }
      };

      let _ui = {
         cols: [
            {
               view: "button",
               css: "webix_primary",
               type: "icon",
               icon: "fa fa-upload",
               label:
                  this.settings.buttonLabel ||
                  ABViewCSVImporterPropertyComponentDefaults.buttonLabel,
               width:
                  this.settings.width ||
                  ABViewCSVImporterPropertyComponentDefaults.width,
               click: () => {
                  _logic.showPopup();
               }
            }
         ]
      };

      let _uiConfig = {
         view: "form",
         type: "clean",
         id: ids.form,
         borderless: true,
         minWidth: 400,
         gravity: 1,
         elements: [
            {
               rows: [
                  {
                     id: ids.uploader,
                     view: "uploader",
                     name: "csvFile",
                     css: "webix_primary",
                     value: labels.component.selectCsvFile,
                     accept: "text/csv",
                     multiple: false,
                     autosend: false,
                     link: ids.uploadFileList,
                     on: {
                        onBeforeFileAdd: (fileInfo) => {
                           _csvFileInfo = fileInfo;
                           return _logic.loadCsvFile();
                        }
                     }
                  },
                  {
                     id: ids.uploadFileList,
                     name: "uploadedFile",
                     view: "list",
                     type: "uploader",
                     autoheight: true,
                     borderless: true,
                     onClick: {
                        webix_remove_upload: (e, id, trg) => {
                           _logic.removeCsvFile(id);
                        }
                     }
                  },
                  {
                     padding: 10,
                     rows: [
                        {
                           id: ids.separatedBy,
                           view: "richselect",
                           name: "separatedBy",
                           label: labels.component.separatedBy,
                           labelWidth: 140,
                           options: csvImporter.getSeparateItems(),
                           value: ",",
                           on: {
                              onChange: () => {
                                 _logic.loadCsvFile();
                              }
                           }
                        },
                        {
                           id: ids.headerOnFirstLine,
                           view: "checkbox",
                           name: "headerOnFirstLine",
                           label: labels.component.headerFirstLine,
                           labelWidth: 140,
                           disabled: true,
                           value: true,
                           on: {
                              onChange: (newVal, oldVal) => {
                                 _logic.populateColumnList();
                              }
                           }
                        }
                     ]
                  },
                  {
                     type: "space",
                     rows: [
                        {
                           view: "scrollview",
                           minHeight: 300,
                           body: {
                              padding: 10,
                              id: ids.columnList,
                              rows: []
                           }
                        }
                     ]
                  }
               ]
            }
         ]
      };

      var validationError = false;

      let _uiRecordsView = {
         gravity: 2,
         rows: [
            {
               view: "toolbar",
               css: "bg_gray",
               cols: [
                  { width: 5 },
                  {
                     id: ids.search,
                     view: "search",
                     value: "",
                     label: "",
                     placeholder: "Search records...",
                     keyPressTimeout: 200,
                     on: {
                        onTimedKeyPress: () => {
                           let text = $$(ids.search).getValue();
                           _logic.search(text);
                        }
                     }
                  },
                  { width: 2 }
               ]
            },
            {
               id: ids.datatable,
               view: "datatable",
               tooltip: true,
               resizeColumn: true,
               editable: true,
               editaction: "dblclick",
               css: "ab-csv-importer",
               borderless: false,
               tooltip: function(obj) {
                  var tooltip = obj._errorMsg
                     ? obj._errorMsg
                     : "No validation errors";
                  return tooltip;
               },
               minWidth: 650,
               columns: [],
               on: {
                  onValidationError: function(id, obj, details) {
                     console.log(`item ${id} invalid`);
                     var errors = "";
                     Object.keys(details).forEach((key) => {
                        this.$view.complexValidations[key].forEach((err) => {
                           errors += err.invalidMessage + "</br>";
                        });
                     });
                     $$(ids.datatable).blockEvent();
                     $$(ids.datatable).updateItem(id, {
                        _status: "invalid",
                        _errorMsg: errors
                     });
                     $$(ids.datatable).unblockEvent();
                     validationError = true;
                  },
                  onValidationSuccess: function(id, obj, details) {
                     console.log(`item ${id} valid`);
                     $$(ids.datatable).blockEvent();
                     $$(ids.datatable).updateItem(id, {
                        _status: "valid",
                        _errorMsg: ""
                     });
                     $$(ids.datatable).unblockEvent();
                     validationError = false;
                  },
                  onCheck: function() {
                     var selected = $$(ids.datatable).find({ _included: true });
                     $$(ids.importButton).setValue(
                        labels.component.import +
                           " " +
                           selected.length +
                           " Records"
                     );
                     if (selected.length > 1000) {
                        // we only allow 1000 record imports
                        webix.alert({
                           title: "Too many records",
                           ok: "Okay",
                           text:
                              "Due to browser limitations we only allow imports of 1,000 records. Please upload a new CSV or deselect records to import."
                        });
                        $$(ids.importButton).disable();
                     } else {
                        $$(ids.importButton).enable();
                     }
                  }
               }
            },
            {
               id: ids.progressBar,
               height: 6
            },
            {
               view: "button",
               name: "import",
               id: ids.importButton,
               value: labels.component.import,
               css: "webix_primary",
               disabled: true,
               click: () => {
                  _logic.import();
               }
            }
         ]
      };

      let _init = (options) => {
         // Populate values to rules
         _currentObject = null;
         let selectedDv = this.datacollection;
         if (selectedDv) {
            _currentObject = selectedDv.datasource;
         }

         webix.ui({
            id: ids.popup,
            view: "window",
            hidden: true,
            position: "center",
            modal: true,
            resize: true,
            head: {
               view: "toolbar",
               css: "webix_dark",
               cols: [
                  {},
                  {
                     view: "label",
                     label: L("ab.components.csvImporter", "*CSV Importer"),
                     autowidth: true
                  },
                  {},
                  {
                     view: "button",
                     width: 35,
                     css: "webix_transparent",
                     type: "icon",
                     icon: "nomargin fa fa-times",
                     click: () => {
                        _logic.hide();
                     }
                  }
               ]
            },
            body: {
               type: "form",
               rows: [
                  {
                     type: "line",
                     cols: [
                        _uiConfig,
                        { width: 20 },
                        _uiRecordsView,
                        { width: 1 }
                     ]
                  },
                  {
                     id: ids.statusMessage,
                     view: "label",
                     align: "right",
                     hidden: true
                  },
                  {
                     hidden: true,
                     margin: 5,
                     cols: [
                        { fillspace: true },
                        {
                           view: "button",
                           name: "cancel",
                           value: labels.common.cancel,
                           css: "ab-cancel-button",
                           autowidth: true,
                           click: () => {
                              _logic.hide();
                           }
                        }
                        /*,
                        {
                           view: "button",
                           name: "import",
                           id: ids.importButton,
                           value: labels.component.import,
                           css: "webix_primary",
                           disabled: true,
                           autowidth: true,
                           type: "form",
                           click: () => {
                              _logic.import();
                           }
                        }*/
                     ]
                  }
               ]
            }
         });

         if ($$(ids.form)) webix.extend($$(ids.form), webix.ProgressBar);
         if ($$(ids.progressBar))
            webix.extend($$(ids.progressBar), webix.ProgressBar);
      };

      let _logic = (this._logic = {
         showPopup: () => {
            let $popup = $$(ids.popup);
            if ($popup) $popup.show();

            _logic.formClear();

            // open file dialog to upload
            $$(ids.uploader).fileDialog();
         },

         hide: () => {
            let $popup = $$(ids.popup);
            if ($popup) $popup.hide();
         },

         formClear: () => {
            _dataRows = null;
            _csvFileInfo = null;

            $$(ids.form).clearValidation();
            $$(ids.form).clear();
            $$(ids.separatedBy).setValue(",");

            webix.ui([], $$(ids.columnList));

            $$(ids.headerOnFirstLine).disable();
            $$(ids.importButton).disable();

            $$(ids.search).setValue("");
            $$(ids.uploadFileList).clearAll();
            $$(ids.datatable).clearAll();

            $$(ids.statusMessage).setValue("");
            $$(ids.statusMessage).hide();
         },

         search: (searchText) => {
            let $datatable = $$(ids.datatable);
            if (!$datatable) return;

            searchText = (searchText || "").toLowerCase();

            let matchFields = _logic.getMatchFields();

            $datatable.filter((row) => {
               let exists = false;

               (matchFields || []).forEach((f) => {
                  if (exists) return;

                  exists =
                     (row[`${f.columnIndex}`] || "")
                        .toString()
                        .toLowerCase()
                        .indexOf(searchText) > -1;
               });

               return exists;
            });
         },

         statusTemplate: (item) => {
            let template = "";

            if (!item) return template;

            switch (item._status) {
               case "in-progress":
                  template = "<span class='fa fa-refresh'></span>";
                  break;
               case "invalid":
                  template = "<span class='fa fa-exclamation-triangle'></span>";
                  break;
               case "valid":
                  template = "<span class='fa fa-check'></span>";
                  break;
               case "done":
                  template = "<span class='fa fa-check'></span>";
                  break;
               case "fail":
                  template = "<span class='fa fa-remove'></span>";
                  break;
            }

            return template;
         },

         loadCsvFile: () => {
            if (!_csvFileInfo) return false;

            if (!csvImporter.validateFile(_csvFileInfo)) {
               webix.alert({
                  title: labels.component.fileTypeErrorTitle,
                  text: labels.component.fileTypeError,
                  ok: labels.common.ok
               });

               return false;
            }

            // show loading cursor
            if ($$(ids.form).showProgress)
               $$(ids.form).showProgress({ type: "icon" });

            // read CSV file
            let separatedBy = $$(ids.separatedBy).getValue();
            csvImporter.getDataRows(_csvFileInfo, separatedBy).then((data) => {
               _dataRows = data;

               $$(ids.headerOnFirstLine).enable();
               $$(ids.importButton).enable();
               let length = _dataRows.length;
               if ($$(ids.headerOnFirstLine).getValue()) {
                  length = _dataRows.length - 1;
               }
               $$(ids.importButton).setValue(
                  labels.component.import + " " + length + " Records"
               );

               _logic.populateColumnList();

               if ($$(ids.form).hideProgress) $$(ids.form).hideProgress();
            });

            return true;
         },

         removeCsvFile: (fileId) => {
            $$(ids.uploadFileList).remove(fileId);
            _logic.formClear();
            return true;
         },

         populateColumnList: () => {
            // clear list
            webix.ui([], $$(ids.columnList));

            if (_dataRows == null) return;

            // check first line of CSV
            let firstLine = _dataRows[0];
            if (firstLine == null) return;

            let csvColumnList = [];
            let fieldList = [];
            if (_currentObject) {
               fieldList =
                  _currentObject.fields((f) => {
                     // filter editable fields
                     let formComp = f.formComponent();
                     if (!formComp) return true;

                     let formConfig = formComp.common();
                     if (!formConfig) return true;

                     return formConfig.key != "fieldreadonly";
                  }) || [];
            }
            // check first line be header columns
            if ($$(ids.headerOnFirstLine).getValue()) {
               csvColumnList = firstLine.map(function(colName, index) {
                  return {
                     id: index + 1, // webix .options list disallow value 0
                     value: colName,
                     key: csvImporter.getGuessDataType(_dataRows, index)
                  };
               });
            } else {
               for (let i = 0; i < firstLine.length; i++) {
                  csvColumnList.push({
                     id: i + 1, // webix .options list disallow value 0
                     value: "Column " + (i + 1),
                     key: csvImporter.getGuessDataType(_dataRows, i)
                  });
               }
            }

            // Add unselect item
            csvColumnList.unshift({
               id: "none",
               value: "[None]"
            });

            // populate columns to UI
            let uiColumns = [];
            let selectedCsvCols = [];
            fieldList.forEach((f) => {
               let selectVal = "none";

               // match up by data type
               let matchCol = csvColumnList.filter(
                  (c) => c.key == f.key && selectedCsvCols.indexOf(c.id) < 0
               )[0];
               if (matchCol) {
                  selectVal = matchCol.id;

                  // cache
                  selectedCsvCols.push(selectVal);
               }

               let columnOptUI = {
                  view: "richselect",
                  gravity: 2,
                  options: csvColumnList,
                  fieldId: f.id,
                  abName: "columnIndex",
                  value: selectVal,
                  on: {
                     onChange: function() {
                        _logic.toggleLinkFields(this);
                        _logic.loadDataToGrid();
                     }
                  }
               };

               // Add date format options
               if (f.key == "date") {
                  let dateSeparatorOptions = ["/", "-", ".", ",", " "];
                  let dayFormatOptions = [
                     { value: "1 to 31", id: "D" },
                     { value: "01 to 31", id: "DD" }
                  ];
                  let monthFormatOptions = [
                     { value: "1 to 12", id: "M" },
                     { value: "01 to 12", id: "MM" }
                  ];
                  let yearFormatOptions = [
                     { value: "00 to 99", id: "YY" },
                     { value: "2000 to 2099", id: "YYYY" }
                  ];
                  let dateOrderOptions = [
                     {
                        value: L("ab.component.label.dateOrderDMY", "D-M-Y"),
                        id: 1
                     },
                     {
                        value: L("ab.component.label.dateOrderMDY", "M-D-Y"),
                        id: 2
                     },
                     {
                        value: L("ab.component.label.dateOrderYMD", "Y-M-D"),
                        id: 3
                     },
                     {
                        value: L("ab.component.label.dateOrderYMD", "Y-D-M"),
                        id: 4
                     }
                  ];

                  columnOptUI = {
                     gravity: 2,
                     rows: [
                        columnOptUI,
                        {
                           view: "richselect",
                           label: L(
                              "ab.component.label.separator",
                              "Separator"
                           ),
                           labelWidth: 100,
                           on: {
                              onChange: function() {
                                 _logic.loadDataToGrid();
                              }
                           },
                           name: "separator",
                           abName: "columnDateFormat",
                           options: dateSeparatorOptions,
                           value: "/"
                        },
                        {
                           view: "richselect",
                           label: L("ab.component.label.dayFormat", "Day"),
                           labelWidth: 100,
                           on: {
                              onChange: function() {
                                 _logic.loadDataToGrid();
                              }
                           },
                           name: "day",
                           abName: "columnDateFormat",
                           options: dayFormatOptions,
                           value: "D"
                        },
                        {
                           view: "richselect",
                           label: L("ab.component.label.monthFormat", "Month"),
                           labelWidth: 100,
                           on: {
                              onChange: function() {
                                 _logic.loadDataToGrid();
                              }
                           },
                           name: "month",
                           abName: "columnDateFormat",
                           options: monthFormatOptions,
                           value: "M"
                        },
                        {
                           view: "richselect",
                           label: L("ab.component.label.yearFormat", "Year"),
                           labelWidth: 100,
                           on: {
                              onChange: function() {
                                 _logic.loadDataToGrid();
                              }
                           },
                           name: "year",
                           abName: "columnDateFormat",
                           options: yearFormatOptions,
                           value: "YY"
                        },
                        {
                           view: "richselect",
                           label: L("ab.component.label.dateOrder", "Order"),
                           labelWidth: 100,
                           on: {
                              onChange: function() {
                                 _logic.loadDataToGrid();
                              }
                           },
                           name: "order",
                           abName: "columnDateFormat",
                           options: dateOrderOptions,
                           value: 1
                        }
                     ]
                  };
               }

               // Add connected field options
               if (f.key == "connectObject") {
                  let linkFieldOptions = [];

                  if (f.datasourceLink) {
                     linkFieldOptions = f.datasourceLink
                        .fields((fld) => fld.key != "connectObject")
                        .map((fld) => {
                           return {
                              id: fld.id,
                              value: fld.label
                           };
                        });
                  }

                  columnOptUI = {
                     gravity: 2,
                     rows: [
                        columnOptUI,
                        {
                           view: "richselect",
                           label: "=",
                           labelWidth: 20,
                           abName: "columnLinkData",
                           hidden: true,
                           options: linkFieldOptions,
                           value: linkFieldOptions[0]
                              ? linkFieldOptions[0].id
                              : null
                        }
                     ]
                  };
               }

               uiColumns.push({
                  view: "layout",
                  borderless: true,
                  cols: [
                     {
                        view: "template",
                        gravity: 1,
                        borderless: true,
                        css: { "padding-top": 10 },
                        template: '<span class="fa fa-{icon}"></span> {label}'
                           .replace("{icon}", f.icon)
                           .replace("{label}", f.label)
                     },
                     columnOptUI
                  ]
               });
            });
            webix.ui(uiColumns, $$(ids.columnList));

            _logic.loadDataToGrid();
         },

         toggleLinkFields($columnOption) {
            if (!$columnOption) return;

            let $optionPanel = $columnOption.getParentView();
            let $linkFieldOption = $optionPanel.queryView(
               { abName: "columnLinkData" },
               "all"
            )[0];
            if (!$linkFieldOption) return;

            if ($columnOption.getValue() == "none") {
               $linkFieldOption.hide();
            } else {
               $linkFieldOption.show();
            }
         },

         loadDataToGrid() {
            let $datatable = $$(ids.datatable);
            if (!$datatable) return;

            $datatable.clearAll();

            // show loading cursor
            if ($datatable.showProgress)
               $datatable.showProgress({ type: "icon" });

            /** Prepare Columns */
            let matchFields = _logic.getMatchFields();

            let columns = [];

            // add "status" column
            columns.push({
               id: "_status",
               header: "",
               template: _logic.statusTemplate,
               width: 30
            });

            // add "checkbox" column
            columns.push({
               id: "_included",
               header: { content: "masterCheckbox" },
               template: "{common.checkbox()}",
               width: 30
            });

            var fieldValidations = [];
            var rulePops = [];
            // populate columns
            (matchFields || []).forEach((f) => {
               var validationRules = f.field.settings.validationRules;
               // parse the rules because they were stored as a string
               // check if rules are still a string...if so lets parse them
               if (validationRules && typeof validationRules === "string") {
                  validationRules = JSON.parse(validationRules);
               }

               if (validationRules && validationRules.length) {
                  var validationUI = [];
                  // there could be more than one so lets loop through and build the UI
                  validationRules.forEach((rule) => {
                     var Filter = new FilterComplex(
                        App,
                        f.field.id + "_" + webix.uid()
                     );
                     // add the new ui to an array so we can add them all at the same time
                     validationUI.push(Filter.ui);
                     // store the filter's info so we can assign values and settings after the ui is rendered
                     fieldValidations.push({
                        filter: Filter,
                        view: Filter.ids.querybuilder,
                        columnName: f.field.id,
                        validationRules: rule.rules,
                        invalidMessage: rule.invalidMessage,
                        columnIndex: f.columnIndex
                     });
                  });
                  // create a unique view id for popup
                  var popUpId =
                     ids.rules + "_" + f.field.id + "_" + webix.uid();
                  // store the popup ids so we can remove the later
                  rulePops.push(popUpId);
                  // add the popup to the UI but don't show it
                  webix.ui({
                     view: "popup",
                     css: "ab-rules-popup",
                     id: popUpId,
                     body: {
                        rows: validationUI
                     }
                  });
               }

               var editor = "text";
               switch (f.field.key) {
                  case "number":
                     editor = "number";
                     break;
                  default:
                  // code block
               }
               columns.push({
                  id: f.columnIndex,
                  header: f.field.label,
                  editor: editor,
                  minWidth: 150,
                  fillspace: true
               });
            });

            if (fieldValidations.length) {
               // we need to store the rules for use later so lets build a container array
               var complexValidations = [];
               fieldValidations.forEach((f) => {
                  // init each ui to have the properties (app and fields) of the object we are editing
                  f.filter.applicationLoad(App);
                  f.filter.fieldsLoad(_currentObject.fields());
                  // now we can set the value because the fields are properly initialized
                  f.filter.setValue(f.validationRules);
                  // if there are validation rules present we need to store them in a lookup hash
                  // so multiple rules can be stored on a single field
                  if (!Array.isArray(complexValidations[f.columnName]))
                     complexValidations[f.columnName] = [];

                  // now we can push the rules into the hash
                  complexValidations[f.columnName].push({
                     filters: $$(f.view).getFilterHelper(),
                     values: $$(ids.datatable).getSelectedItem(),
                     invalidMessage: f.invalidMessage,
                     columnIndex: f.columnIndex
                  });
               });
               var rules = {};
               var dataTable = $$(ids.datatable);
               // store the rules in a data param to be used later
               dataTable.$view.complexValidations = complexValidations;
               // use the lookup to build the validation rules
               Object.keys(complexValidations).forEach(function(key) {
                  rules[key] = function(value, data) {
                     // default valid is true
                     var isValid = true;
                     dataTable.$view.complexValidations[key].forEach(
                        (filter) => {
                           let rowValue = {};
                           // use helper funtion to check if valid
                           // map the column names to the index numbers of data
                           // reformat data to display
                           (matchFields || []).forEach((f) => {
                              let record = data[f.columnIndex];
                              if (
                                 f.field.key == "date" &&
                                 record.includes("Invalid date")
                              ) {
                                 isValid = false;
                              }
                              rowValue[f.field.id] = record;
                           });
                           var ruleValid = filter.filters(rowValue);
                           // if invalid we need to tell the field
                           if (ruleValid == false) {
                              isValid = false;
                              // webix.message({
                              //    type: "error",
                              //    text: invalidMessage
                              // });
                           }
                        }
                     );
                     return isValid;
                  };
               });
               // define validation rules
               dataTable.define("rules", rules);
               // store the array of view ids on the webix object so we can get it later
               dataTable.config.rulePops = rulePops;
               dataTable.refresh();
            } else {
               var dataTable = $$(ids.datatable);
               // check if the previous datatable had rule popups and remove them
               if (dataTable.config.rulePops) {
                  dataTable.config.rulePops.forEach((popup) => {
                     if ($$(popup)) $$(popup).destructor();
                  });
               }
               // remove any validation rules from the previous table
               dataTable.define("rules", {});
               dataTable.refresh();
            }

            /** Prepare Data */
            let parsedData = [];
            function escapeHtml(text) {
               var map = {
                  "&": "&amp;",
                  "<": "&lt;",
                  ">": "&gt;",
                  '"': "&quot;",
                  "'": "&#039;"
               };

               return text.replace(/[&<>"']/g, function(m) {
                  return map[m];
               });
            }

            (_dataRows || []).forEach((row, index) => {
               let rowValue = {
                  id: index + 1
               };

               // reformat data to display
               (matchFields || []).forEach((f) => {
                  let data = row[f.columnIndex - 1];

                  if (f.field.key == "date") {
                     let dateFormat = moment(data, f.format).format(
                        "YYYY-MM-DD"
                     );
                     if (dateFormat == "Invalid date") {
                        dateFormat = dateFormat + " - " + data;
                     }
                     rowValue[f.columnIndex] = dateFormat;
                  } else {
                     rowValue[f.columnIndex] = escapeHtml(data); // array to object
                  }
               });

               // insert "true" value of checkbox
               rowValue["_included"] = true;

               parsedData.push(rowValue);
            });

            // skip the first line
            let isSkipFirstLine = $$(ids.headerOnFirstLine).getValue();
            if (isSkipFirstLine && parsedData.length > 1) {
               parsedData = parsedData.slice(1);
            }

            $$(ids.importButton).setValue(
               labels.component.import + " " + parsedData.length + " Records"
            );

            $datatable.refreshColumns(columns);

            $datatable.parse(parsedData);

            if (parsedData.length > 1000) {
               // we only allow 1000 record imports
               webix.alert({
                  title: "Too many records",
                  ok: "Okay",
                  text:
                     "Due to browser limitations we only allow imports of 1,000 records. Please upload a new CSV or deselect records to import."
               });
               $$(ids.importButton).disable();
            } else {
               $$(ids.importButton).enable();
            }

            // hide loading cursor
            if ($datatable.hideProgress) $datatable.hideProgress();
         },

         refreshRemainingTimeText(startUpdateTime, total, index) {
            // Calculate remaining time
            let spentTime = new Date() - startUpdateTime; // milliseconds that has passed since last completed record since start

            let averageRenderTime = spentTime / index; // average milliseconds per single render at this point

            let remainTime = averageRenderTime * (total - index);

            let result = "";

            // Convert milliseconds to a readable string
            let days = (remainTime / 86400000).toFixed(0);
            let hours = (remainTime / 3600000).toFixed(0);
            let minutes = (remainTime / 60000).toFixed(0);
            let seconds = (remainTime / 1000).toFixed(0);

            if (seconds < 1) result = "";
            else if (seconds < 60)
               result = `Approximately ${seconds} second${
                  seconds > 1 ? "s" : ""
               }`;
            else if (minutes == 1)
               result = `Approximately 1 minute ${seconds - 60} seconds`;
            else if (minutes < 60) result = `Approximately ${minutes} minutes`;
            else if (hours < 24)
               result = `Approximately ${hours} hour${hours > 1 ? "s" : ""}`;
            else result = `Approximately ${days} day${days > 1 ? "s" : ""}`;

            if (result) {
               result = `${result} remaining`;
               // $$(ids.statusMessage).show();
               $$(ids.importButton).setValue(result);
            } else {
               var selected = $$(ids.datatable).find({ _included: true });
               $$(ids.importButton).setValue(
                  labels.component.import + " " + selected.length + " Records"
               );
            }
         },

         /**
          * @method getMatchFields
          *
          * @return {Object} - [
          *                      {
          *                         columnIndex: {number},
          *                         field: {ABField},
          *                         searchField: {ABField} [optional]
          *                      },
          *                      ...
          *                    ]
          */
         getMatchFields: () => {
            let result = [];

            // get richselect components
            let $selectorViews = $$(ids.columnList)
               .queryView({ abName: "columnIndex" }, "all")
               .filter((selector) => selector.getValue() != "none");

            ($selectorViews || []).forEach(($selector) => {
               if (!_currentObject) return;

               // webix .options list disallow value 0
               let colIndex = $selector.getValue();

               let field = _currentObject.fields(
                  (f) => f.id == $selector.config.fieldId
               )[0];
               if (!field) return;

               let fieldData = {
                  columnIndex: colIndex,
                  field: field
               };

               if (field.key == "date") {
                  let $optionPanel = $selector.getParentView();
                  let $dateFormatSelectors = $optionPanel.queryView(
                     { abName: "columnDateFormat" },
                     "all"
                  );

                  // define the column to compare data to search .id
                  if ($dateFormatSelectors) {
                     $dateFormatSelectors.forEach((selector) => {
                        fieldData[selector.config.name] = selector.getValue();
                     });

                     // convert all dates into mysql date format YYYY-DD-MM
                     var format;
                     switch (fieldData.order) {
                        case "1":
                           format =
                              fieldData.day +
                              fieldData.separator +
                              fieldData.month +
                              fieldData.separator +
                              fieldData.year;
                           break;
                        case "2":
                           format =
                              fieldData.month +
                              fieldData.separator +
                              fieldData.day +
                              fieldData.separator +
                              fieldData.year;
                           break;
                        case "3":
                           format =
                              fieldData.year +
                              fieldData.separator +
                              fieldData.month +
                              fieldData.separator +
                              fieldData.day;
                           break;
                        case "4":
                           format =
                              fieldData.year +
                              fieldData.separator +
                              fieldData.day +
                              fieldData.separator +
                              fieldData.month;
                     }
                     fieldData.format = format;
                  }
               }

               if (field.key == "connectObject") {
                  let $optionPanel = $selector.getParentView();
                  let $linkDataSelector = $optionPanel.queryView(
                     { abName: "columnLinkData" },
                     "all"
                  )[0];

                  // define the column to compare data to search .id
                  if ($linkDataSelector) {
                     let searchField = field.datasourceLink.fields(
                        (f) => f.id == $linkDataSelector.getValue()
                     )[0];
                     fieldData.searchField = searchField;
                  }
               }

               result.push(fieldData);
            });

            return result;
         },

         /**
          * @method import
          *
          * @return {Promise}
          */
         import: () => {
            // get ABDatacollection
            let dv = this.datacollection;
            if (dv == null) return Promise.resolve();

            // get ABObject
            let obj = dv.datasource;
            if (obj == null) return Promise.resolve();

            // get ABModel
            let model = dv.model;
            if (model == null) return Promise.resolve();

            $$(ids.importButton).disable();

            // Show loading cursor
            $$(ids.form).showProgress({ type: "icon" });
            $$(ids.progressBar).showProgress({
               type: "top",
               position: 0.0001
            });

            // get richselect components
            let matchFields = _logic.getMatchFields();

            // Get object's model
            let objModel = _currentObject.model();

            let selectedRows = $$(ids.datatable).find({ _included: true });

            let _currProgress = 0;
            let increaseProgressing = () => {
               _currProgress += 1;
               $$(ids.progressBar).showProgress({
                  type: "bottom",
                  position: _currProgress / selectedRows.length
               });
            };

            let itemFailed = (itemId, errMessage) => {
               let $datatable = $$(ids.datatable);
               if ($datatable) {
                  // set "fail" status
                  $datatable.addRowCss(itemId, "row-fail");
                  $datatable.blockEvent();
                  $datatable.updateItem(itemId, {
                     _status: "fail",
                     _errorMsg: errMessage
                  });
                  $datatable.unblockEvent();
               }
               increaseProgressing();

               console.error(errMessage);
            };

            let itemInvalid = (itemId, errors = []) => {
               let $datatable = $$(ids.datatable);
               if ($datatable) {
                  // combine all error messages to display in tooltip
                  let errorMsg = [];
                  // mark which column are invalid
                  errors.forEach((err) => {
                     if (!err || !err.name) return;
                     let fieldInfo = matchFields.filter(
                        (f) => f.field && f.field.columnName == err.name
                     )[0];
                     errorMsg.push(err.name + ": " + err.message);
                     // we also need to define an error message
                     // webix.message({
                     //    type: "error",
                     //    text: err.name + ": " + err.message
                     // });
                  });
                  // set "fail" status
                  $$(ids.datatable).blockEvent();
                  $$(ids.datatable).updateItem(itemId, {
                     _status: "invalid",
                     _errorMsg: errorMsg.join("</br>")
                  });
                  $$(ids.datatable).unblockEvent();
                  $datatable.addRowCss(itemId, "webix_invalid");
               }
               // increaseProgressing();
            };

            let itemPass = (itemId) => {
               let $datatable = $$(ids.datatable);
               if ($datatable) {
                  // set "done" status
                  console.log(`item ${itemId} pass`);
                  $datatable.removeRowCss(itemId, "row-fail");
                  $datatable.addRowCss(itemId, "row-pass");
                  $datatable.blockEvent();
                  $datatable.updateItem(itemId, {
                     _status: "done",
                     _errorMsg: ""
                  });
                  $datatable.unblockEvent();
               }
               increaseProgressing();
            };

            let itemValid = (itemId) => {
               let $datatable = $$(ids.datatable);
               if ($datatable) {
                  // mark all columns valid (just in case they were invalid before)
                  // matchFields.forEach((f) => {
                  //    $datatable.removeCellCss(
                  //       itemId,
                  //       f.columnIndex,
                  //       "webix_invalid_cell"
                  //    );
                  // });
                  // highlight the row
                  $datatable.removeRowCss(itemId, "webix_invalid");
                  $datatable.blockEvent();
                  $datatable.updateItem(itemId, {
                     _status: "",
                     _errorMsg: ""
                  });
                  $datatable.unblockEvent();
                  // $datatable.addRowCss(itemId, "row-pass");
               }
            };

            let uiCleanUp = () => {
               // To Do anyUI updates
               console.log("ui clean up now");
               $$(ids.importButton).enable();

               // Hide loading cursor
               $$(ids.form).hideProgress();
               $$(ids.progressBar).hideProgress();
               $$(ids.statusMessage).setValue("");
               $$(ids.statusMessage).hide();

               var selected = $$(ids.datatable).find({ _included: true });
               $$(ids.importButton).setValue(
                  labels.component.import + " " + selected.length + " Records"
               );

               // _logic.hide();

               if (_logic.callbacks && _logic.callbacks.onDone)
                  _logic.callbacks.onDone();
            };

            // Set parent's data collection cursor
            let dcLink = dv.datacollectionLink;
            let objectLink;
            let linkConnectFields = [];
            let linkValueId;
            if (dcLink && dcLink.getCursor()) {
               objectLink = dcLink.datasource;

               linkConnectFields = _currentObject.fields(
                  (f) =>
                     f.key == "connectObject" &&
                     f.settings.linkObject == objectLink.id
               );

               linkValueId = dcLink.getCursor().id;
            }

            let allValid = true;
            let validRows = [];
            // Pre Check Validations of whole CSV import
            // update row to green if valid
            // update row to red if !valid
            (selectedRows || []).forEach((data, index) => {
               let newRowData = {};

               // Set parent's data collection cursor
               if (objectLink && linkConnectFields.length && linkValueId) {
                  linkConnectFields.forEach((f) => {
                     let linkColName = f.indexField
                        ? f.indexField.columnName
                        : objectLink.PK();
                     newRowData[f.columnName] = {};
                     newRowData[f.columnName][linkColName] = linkValueId;
                  });
               }

               matchFields.forEach((f) => {
                  if (!f.field || !f.field || !f.field.key) return;

                  switch (f.field.key) {
                     // case "connectObject":
                     //    // skip
                     //    break;
                     case "number":
                        if (typeof data[f.columnIndex] != "number") {
                           newRowData[f.field.columnName] = (
                              data[f.columnIndex] || ""
                           ).replace(/[^0-9.]/gi, "");
                        } else {
                           newRowData[f.field.columnName] = data[f.columnIndex];
                        }
                        break;
                     default:
                        newRowData[f.field.columnName] = data[f.columnIndex];
                        break;
                  }
               });

               let isValid = false;
               let errorMsg = "";

               // first check legacy and server side validation
               let validator = _currentObject.isValidData(newRowData);
               isValid = validator.pass();
               errorMsg = validator.errors;

               if (isValid) {
                  // now check complex field validation rules
                  isValid = $$(ids.datatable).validate(data.id);
               } else {
                  allValid = false;
                  itemInvalid(data.id, errorMsg);
               }
               if (isValid) {
                  itemValid(data.id);
                  validRows.push({ id: data.id, data: newRowData });
               } else {
                  allValid = false;
               }
               // $$(ids.datatable).unblockEvent();
            });

            if (!allValid) {
               // To Do anyUI updates
               // $$(ids.importButton).enable();
               //
               // // Hide loading cursor
               // $$(ids.form).hideProgress();
               // $$(ids.progressBar).hideProgress();
               // $$(ids.statusMessage).setValue("");
               // $$(ids.statusMessage).hide();
               //
               // // _logic.hide();
               //
               // if (_logic.callbacks && _logic.callbacks.onDone)
               //    _logic.callbacks.onDone();
               uiCleanUp();

               webix.alert({
                  title: "Invalid Data",
                  ok: "Okay",
                  text:
                     "One or more items failed validation. Doubleclick record to correct or uncheck record to exclude from import."
               });

               return Promise.resolve();
            }

            // if pass, then continue to process each row
            // ?? : can we process in Parallel?
            // ?? : implement hash Lookups for connected Fields
            var hashLookups = {};
            // {obj}  /*  { connectField.id : { 'searchWord' : "uuid"}}
            // use this hash to reduce the # of lookups needed to fill in our
            // connected entries

            let connectedFields = matchFields.filter(
               (f) =>
                  f &&
                  f.field &&
                  f.field.key == "connectObject" &&
                  f.searchField
            );

            let startUpdateTime;
            var numDone = 0;
            return Promise.resolve()
               .then(() => {
                  // forEach connectedFields in csv

                  var allLookups = [];

                  (connectedFields || []).forEach((f) => {
                     let connectField = f.field;
                     let searchField = f.searchField;
                     // let searchWord = newRowData[f.columnIndex];

                     let connectObject = connectField.datasourceLink;
                     if (!connectObject) return;

                     let connectModel = connectObject.model();
                     if (!connectModel) return;

                     let linkIdKey = connectField.indexField
                        ? connectField.indexField.columnName
                        : connectField.object.PK();

                     // prepare default hash entry:
                     hashLookups[connectField.id] = {};

                     // load all values of connectedField entries

                     allLookups.push(
                        connectModel
                           .findAll({
                              where: {},
                              populate: false
                           })
                           .catch((errMessage) => {
                              console.error(errMessage);
                           })
                           .then((list) => {
                              if (list.data) {
                                 list = list.data;
                              }
                              (list || []).forEach((row) => {
                                 // store in hash[field.id] = { 'searchKey' : "uuid" }

                                 hashLookups[connectField.id][
                                    row[searchField.columnName]
                                 ] = row[linkIdKey];
                              });
                           })
                     );
                  });

                  return Promise.all(allLookups);
               })
               .then(() => {
                  // forEach validRow
                  validRows.forEach((data) => {
                     let newRowData = data.data;

                     // update the datagrid row to in-progress
                     $$(ids.datatable).blockEvent();
                     $$(ids.datatable).updateItem(data.id, {
                        _status: "in-progress",
                        _errorMsg: ""
                     });
                     $$(ids.datatable).unblockEvent();

                     // forEach ConnectedField
                     (connectedFields || []).forEach((f) => {
                        // find newRowData[field.columnName] = { field.PK : hash[field.id][searchWord] }
                        let connectField = f.field;
                        let linkIdKey = connectField.indexField
                           ? connectField.indexField.columnName
                           : connectField.object.PK();
                        var uuid =
                           hashLookups[connectField.id][
                              newRowData[connectField.columnName]
                           ];

                        if (!uuid) {
                           itemInvalid(data.id, [
                              { name: connectField.columnName }
                           ]);
                           allValid = false;
                        }

                        newRowData[connectField.columnName] = {};
                        newRowData[connectField.columnName][linkIdKey] = uuid;
                     });
                  });
               })
               .then(() => {
                  if (!allValid) {
                     webix.alert({
                        title: "Invalid Data",
                        ok: "Okay",
                        text:
                           "One or more connected records referenced an unknown item."
                     });
                     uiCleanUp();

                     return Promise.resolve();
                  }
                  // NOTE: Parallel exectuion of all these:
                  var allSaves = [];

                  function createRecord(objModel, newRowsData, element, total) {
                     return new Promise((resolve, reject) => {
                        element.doRecordRulesPre(newRowsData);

                        objModel
                           .batchCreate({ batch: newRowsData })
                           .catch((errMessage) => {
                              reject(errMessage);
                           })
                           .then((result) => {
                              var recordRules = [];

                              // Show errors of each row
                              Object.keys(result.errors).forEach((rowIndex) => {
                                 let error = result.errors[rowIndex];
                                 if (error) {
                                    itemFailed(
                                       rowIndex,
                                       error.message ||
                                          error.sqlMessage ||
                                          error
                                    );
                                 }
                              });

                              Object.keys(result.data).forEach((rowIndex) => {
                                 let rowData = result.data[rowIndex];
                                 recordRules.push(
                                    new Promise((next, err) => {
                                       // Process Record Rule
                                       element
                                          .doRecordRules(rowData)
                                          .then(() => {
                                             itemPass(rowIndex);
                                             next();
                                          })
                                          .catch((errMessage) => {
                                             itemFailed(rowIndex, errMessage);
                                             err("that didn't work");
                                          });
                                    })
                                 );
                              });
                              Promise.all(recordRules)
                                 .catch((err) => {
                                    // newRowsData.forEach((row) => {
                                    //    itemFailed(row.id, err);
                                    // });
                                    reject(err);
                                 })
                                 .then(() => {
                                    newRowsData.forEach((row) => {
                                       // itemPass(row.id);
                                       numDone++;
                                       if (numDone % 50 == 0) {
                                          _logic.refreshRemainingTimeText(
                                             startUpdateTime,
                                             validRows.length,
                                             numDone
                                          );
                                       }
                                    });
                                    if (numDone == total) {
                                       uiCleanUp();
                                    }
                                    resolve();
                                 });
                           });
                     });
                  }

                  validRows.forEach((data) => {
                     let newRowData = data.data;
                     allSaves.push({ id: data.id, data: newRowData });
                  });

                  // we are going to store these promises in an array of arrays with 50 in each sub array
                  var throttledSaves = [];
                  var index = 0;
                  var total = allSaves.length;
                  while (allSaves.length) {
                     throttledSaves[index] = allSaves.splice(0, 50);
                     index++;
                  }

                  // execute the array of array of 100 promises one at at time
                  function performThrottledSaves(
                     currentRecords,
                     remainingRecords,
                     importer,
                     total
                  ) {
                     // execute the next 100
                     // const requests = currentRecords.map((data) => {
                     //    return createRecord(
                     //       objModel,
                     //       data.record,
                     //       data.data,
                     //       importer
                     //    );
                     // });
                     const requests = createRecord(
                        objModel,
                        currentRecords,
                        importer,
                        total
                     );
                     requests
                        .then(() => {
                           // when done get the next 10
                           var nextRecords = remainingRecords.shift();
                           // if there are any remaining in the group call performThrottledSaves
                           if (nextRecords && nextRecords.length) {
                              return performThrottledSaves(
                                 nextRecords,
                                 remainingRecords,
                                 importer,
                                 total
                              );
                           } else {
                              // uiCleanUp();
                              return Promise.resolve();
                           }
                        })
                        .catch((err) => {
                           // Handle errors here
                           return Promise.resolve(err);
                        });
                  }

                  // now we are going to processes these new containers one at a time
                  // $$(ids.datatable).blockEvent();
                  // this is when the real work starts so lets begin our countdown timer now
                  startUpdateTime = new Date();
                  // get the first group of Promises out of the collection
                  var next = throttledSaves.shift();
                  // execute our Promise iterator
                  return performThrottledSaves(
                     next,
                     throttledSaves,
                     this,
                     total
                  );
               })
               .catch((err) => {
                  // resolve Error UI
                  webix.alert({
                     title: "Error Creating Records",
                     ok: "Okay",
                     text: "One or more records failed upon creation."
                  });
                  // $$(ids.datatable).unblockEvent();
                  uiCleanUp();
                  console.error(err);
               });
         }
      });

      return {
         ui: _ui,
         init: _init,
         logic: _logic
      };
   }
};
