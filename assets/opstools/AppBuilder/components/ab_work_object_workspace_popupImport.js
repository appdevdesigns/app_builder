/*
 * ab_work_object_workspace_popupImport
 *
 * Manage the Import CSV data to objects.
 *
 */

const ABComponent = require("../classes/platform/ABComponent");
const CSVImporter = require("../classes/platform/CSVImporter");

module.exports = class ABWorkObjectPopupImport extends ABComponent {
   constructor(App, idBase) {
      idBase = idBase || "ab_work_object_workspace_popupImport";

      super(App, idBase);
      var L = this.Label;

      var labels = {
         common: App.labels,
         component: {
            title: L("ab.object.importCsv", "*Import CSV"),
            selectCsvFile: L(
               "ab.object.form.csv.selectCsvFile",
               "*Choose a CSV file"
            ),

            separatedBy: L("ab.object.form.csv.separatedBy", "*Separated by"),
            headerFirstLine: L(
               "ab.object.form.csv.headerFirstLine",
               "*Header on first line"
            ),

            import: L("ab.object.form.csv.import") || "*Import",

            fileTypeErrorTitle: L(
               "ab.object.form.csv.fileTypeError",
               "*This file extension is disallow"
            ),
            fileTypeError: L(
               "ab.object.form.csv.fileTypeError",
               "*Please only upload CSV file"
            )
         }
      };

      // internal list of Webix IDs to reference our UI components.
      var ids = {
         popupImport: this.unique(idBase + "_popupImport"),
         form: this.unique(idBase + "_form"),
         importButton: this.unique(idBase + "_importButton"),

         uploadFileList: this.unique(idBase + "_uploadList"),
         separatedBy: this.unique(idBase + "_separatedBy"),
         headerOnFirstLine: this.unique(idBase + "_headerOnFirstLine"),

         columnList: this.unique(idBase + "_columnList")
      };

      var csvImporter = new CSVImporter(App);

      // webix UI definition:
      this.ui = {
         view: "window",
         id: ids.popupImport,
         head: labels.component.title,
         modal: true,
         width: 400,
         height: 500,
         position: "center",
         select: false,
         hidden: true,
         body: {
            view: "form",
            id: ids.form,
            borderless: true,
            width: 400,
            elements: [
               {
                  rows: [
                     {
                        view: "uploader",
                        name: "csvFile",
                        value: labels.component.selectCsvFile,
                        accept: "text/csv",
                        multiple: false,
                        autosend: false,
                        link: ids.uploadFileList,
                        on: {
                           onBeforeFileAdd: (fileInfo) => {
                              return _logic.loadCsvFile(fileInfo);
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
                        id: ids.separatedBy,
                        view: "richselect",
                        name: "separatedBy",
                        label: labels.component.separatedBy,
                        labelWidth: 140,
                        options: csvImporter.getSeparateItems(),
                        value: ",",
                        on: {
                           onChange: () => {
                              _logic.populateColumnList();
                           }
                        }
                     },
                     {
                        id: ids.headerOnFirstLine,
                        view: "checkbox",
                        name: "headerOnFirstLine",
                        labelRight: labels.component.headerFirstLine,
                        labelWidth: 0,
                        disabled: true,
                        value: true,
                        on: {
                           onChange: (newVal, oldVal) => {
                              _logic.populateColumnList();
                           }
                        }
                     },
                     {
                        view: "scrollview",
                        minHeight: 250,
                        body: {
                           id: ids.columnList,
                           rows: []
                        }
                     },
                     {
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
                           },
                           {
                              view: "button",
                              css: "webix_primary",
                              name: "import",
                              id: ids.importButton,
                              value: labels.component.import,
                              disabled: true,
                              autowidth: true,
                              type: "form",
                              click: () => {
                                 _logic.import();
                              }
                           }
                        ]
                     }
                  ]
               }
            ]
         }
      };

      var _currentObject = null,
         _dataRows = null;

      // for setting up UI
      this.init = (options) => {
         // register callbacks:
         for (var c in _logic.callbacks) {
            _logic.callbacks[c] = options[c] || _logic.callbacks[c];
         }

         webix.ui(this.ui);
         webix.extend($$(ids.form), webix.ProgressBar);
      };

      // internal business logic
      var _logic = (this._logic = {
         callbacks: {
            onDone: () => {}
         },

         objectLoad: function(object) {
            _currentObject = object;
         },

         /**
          * @function show()
          *
          * Show popup.
          */
         show: function() {
            $$(ids.popupImport).show();

            _logic.formClear();
         },

         hide: function() {
            $$(ids.popupImport).hide();
         },

         formClear: () => {
            $$(ids.form).clearValidation();
            $$(ids.form).clear();
            $$(ids.separatedBy).setValue(",");

            webix.ui([], $$(ids.columnList));
            $$(ids.uploadFileList).clearAll();

            $$(ids.headerOnFirstLine).disable();
            $$(ids.importButton).disable();
         },

         loadCsvFile: (fileInfo) => {
            if (!csvImporter.validateFile(fileInfo)) {
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
            var separatedBy = $$(ids.separatedBy).getValue();
            csvImporter.getDataRows(fileInfo, separatedBy).then((data) => {
               _dataRows = data;

               $$(ids.headerOnFirstLine).enable();
               $$(ids.importButton).enable();

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
            var firstLine = _dataRows[0];
            if (firstLine == null) return;

            var csvColumnList = [];
            var objColumnList = _currentObject.fields().map((f) => {
               return {
                  id: f.id,
                  label: f.label,
                  dataType: f.key,
                  icon: f.icon
               };
            });

            // check first line be header columns
            if ($$(ids.headerOnFirstLine).getValue()) {
               csvColumnList = firstLine.map(function(colName, index) {
                  return {
                     id: index + 1, // webix .options list disallow value 0
                     value: colName,
                     dataType: csvImporter.getGuessDataType(_dataRows, index)
                  };
               });
            } else {
               for (var i = 0; i < firstLine.length; i++) {
                  csvColumnList.push({
                     id: i + 1, // webix .options list disallow value 0
                     value: "Column " + (i + 1),
                     dataType: csvImporter.getGuessDataType(_dataRows, i)
                  });
               }
            }

            // Add unselect item
            csvColumnList.unshift({
               id: "none",
               value: "[No Label]"
            });

            // populate columns to UI
            var uiColumns = [];
            var selectedCsvCols = [];
            objColumnList.forEach((col) => {
               let selectVal = "none";

               // match up by data type
               let matchCol = csvColumnList.filter(
                  (c) =>
                     c.dataType == col.dataType &&
                     selectedCsvCols.indexOf(c.id) < 0
               )[0];
               if (matchCol) {
                  selectVal = matchCol.id;

                  // cache
                  selectedCsvCols.push(selectVal);
               }

               uiColumns.push({
                  view: "layout",
                  borderless: true,
                  cols: [
                     {
                        view: "template",
                        borderless: true,
                        css: { "padding-top": 10 },
                        template: '<span class="fa fa-{icon}"></span> {label}'
                           .replace("{icon}", col.icon)
                           .replace("{label}", col.label)
                     },
                     {
                        view: "richselect",
                        options: csvColumnList,
                        fieldId: col.id,
                        value: selectVal
                     }
                  ]
               });
            });
            webix.ui(uiColumns, $$(ids.columnList));
         },

         /**
          * @method import
          *
          * @return {Promise}
          */
         import: () => {
            $$(ids.importButton).disable();

            // Show loading cursor
            $$(ids.form).showProgress({ type: "icon" });

            // get richselect components
            let $selectorViews = $$(ids.columnList)
               .queryView({ view: "richselect" }, "all")
               .filter((selector) => selector.getValue() != "none");

            // Prepare insert records sequentially
            var subTasks = Promise.resolve();

            // Get object's model
            var objModel = _currentObject.model();

            _dataRows.forEach((data, index) => {
               let newRowData = {};

               // skip the first line (header)
               if ($$(ids.headerOnFirstLine).getValue() && index == 0) return;

               $selectorViews.forEach((selector) => {
                  // webix .options list disallow value 0
                  let colIndex = selector.getValue() - 1;

                  let field = _currentObject.fields(
                     (f) => f.id == selector.config.fieldId
                  )[0];
                  if (!field) return;

                  newRowData[field.columnName] = data[colIndex];
               });

               // Insert records sequentially
               subTasks = subTasks.then((x) => {
                  // Add row data
                  return objModel.create(newRowData);
               });
            });

            return subTasks.then(() => {
               _logic.formClear();
               $$(ids.importButton).enable();

               // Hide loading cursor
               $$(ids.form).hideProgress();

               _logic.hide();

               _logic.callbacks.onDone();

               return Promise.resolve();
            });
         }
      });

      // Expose any globally accessible Actions:
      this.actions({});

      this.objectLoad = _logic.objectLoad;
      this.show = _logic.show;
      this.import = _logic.import;
   }
};
