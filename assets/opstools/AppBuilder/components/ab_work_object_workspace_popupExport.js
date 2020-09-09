/*
 * ab_work_object_workspace_popupExport
 *
 * Manage the Export object to files popup.
 *
 */

const ABComponent = require("../classes/platform/ABComponent");

module.exports = class ABWorkObjectPopupExport extends ABComponent {
   constructor(App, idBase) {
      idBase = idBase || "ab_work_object_workspace_popupExport";

      super(App, idBase);
      var L = this.Label;

      var labels = {
         common: App.labels,
         component: {}
      };

      // internal list of Webix IDs to reference our UI components.
      var ids = {
         popupExport: this.unique(idBase + "_popupExport"),
         list: this.unique(idBase + "_popupExport_list")
      };

      // webix UI definition:
      this.ui = {
         view: "popup",
         id: ids.popupExport,
         width: 160,
         height: 180,
         select: false,
         hidden: true,
         body: {
            id: ids.list,
            view: "list",
            data: [
               { name: "CSV", icon: "file-excel-o" },
               { name: "Excel", icon: "file-excel-o" },
               { name: "PDF", icon: "file-pdf-o" },
               { name: "PNG", icon: "file-image-o" }
            ],
            template:
               "<div><i class='fa fa-#icon# webix_icon_btn' aria-hidden='true'></i> #name#</div>",
            on: {
               onItemClick: function(id, e, node) {
                  var component = this.getItem(id);

                  _logic.export(component.name);
               }
            }
         }
      };

      var _currentObject = null,
         _dataCollection = null,
         _grid = null,
         _filename,
         _hiddenFields = [];

      // for setting up UI
      this.init = (options) => {
         // register callbacks:
         for (var c in _logic.callbacks) {
            _logic.callbacks[c] = options[c] || _logic.callbacks[c];
         }

         webix.ui(this.ui);
      };

      // internal business logic
      var _logic = (this._logic = {
         dataCollectionLoad: function(dc) {
            _dataCollection = dc;
         },

         objectLoad: function(object) {
            _currentObject = object;
         },

         /**
          * @method setHiddenFields
          * @param {array} fields - an array of string
          */
         setHiddenFields: function(fields) {
            _hiddenFields = fields || [];
         },

         setFilename: function(filename) {
            _filename = filename;
         },

         setGridComponent: function($grid) {
            _grid = $grid;
         },

         /**
          * @function show()
          *
          * Show this component.
          * @param {obj} $view  the webix.$view to hover the popup around.
          */
         show: function($view) {
            $$(ids.popupExport).show($view);
         },

         export: (name) => {
            let fnExport;

            let columns = {};

            Promise.resolve()
               .then(
                  () =>
                     new Promise((next, err) => {
                        let dc = _dataCollection;
                        if (
                           !dc ||
                           (dc.settings.loadAll &&
                              dc.dataStatus != dc.dataStatusFlag.notInitial)
                        )
                           // Loaded all already
                           return next();

                        // Load all data
                        dc.reloadData(0, null)
                           .catch(err)
                           .then(() => {
                              dc.settings.loadAll = true;
                              next();
                           });
                     })
               )
               // client filter data
               .then(
                  () =>
                     new Promise((next, err) => {
                        // template of report
                        if (_currentObject) {
                           _currentObject.fields().forEach((f) => {
                              // hidden fields
                              if (_hiddenFields.indexOf(f.columnName) > -1)
                                 return;

                              columns[f.columnName] = {
                                 template: (rowData) => {
                                    return f.format(rowData);
                                 }
                              };
                           });
                        }

                        switch (name) {
                           case "CSV":
                              webix.csv.delimiter.cols = ",";

                              fnExport = webix.toCSV(_grid, {
                                 filename:
                                    _filename ||
                                    (_currentObject
                                       ? _currentObject.label
                                       : null),
                                 columns: columns
                              });
                              break;
                           case "Excel":
                              fnExport = webix.toExcel(_grid, {
                                 filename:
                                    _filename ||
                                    (_currentObject
                                       ? _currentObject.label
                                       : null),
                                 name:
                                    _filename ||
                                    (_currentObject
                                       ? _currentObject.label
                                       : null),
                                 columns: columns,
                                 filterHTML: true
                              });
                              break;
                           case "PDF":
                              fnExport = webix.toPDF(_grid, {
                                 filename:
                                    _filename ||
                                    (_currentObject
                                       ? _currentObject.label
                                       : null),
                                 filterHTML: true
                              });
                              break;
                           case "PNG":
                              fnExport = webix.toPNG(_grid, {
                                 filename:
                                    _filename ||
                                    (_currentObject
                                       ? _currentObject.label
                                       : null)
                              });
                              break;
                        }

                        fnExport
                           .catch((err) => {
                              OP.Error.log("System could not export " + name, {
                                 error: err
                              });
                           })
                           .fail((err) => {
                              OP.Error.log("System could not export " + name, {
                                 error: err
                              });
                           })
                           .then(() => {
                              $$(ids.popupExport).hide();
                           });
                        next();
                     })
               );
         }
      });

      // Expose any globally accessible Actions:
      this.actions({});

      this.dataCollectionLoad = _logic.dataCollectionLoad;
      this.objectLoad = _logic.objectLoad;
      this.setGridComponent = _logic.setGridComponent;
      this.setFilename = _logic.setFilename;
      this.setHiddenFields = _logic.setHiddenFields;
      this.show = _logic.show;
   }
};
