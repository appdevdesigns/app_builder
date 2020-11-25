/*
 * ab_work_object_list_newObject_import
 *
 * Display the form for importing an existing object into the application.
 *
 */

const ABComponent = require("../classes/platform/ABComponent");
// const ABObject = require('../classes/ABObject.js');
const ABApplication = require("../classes/platform/ABApplication");
const ABFieldManager = require("../classes/core/ABFieldManager.js");

module.exports = class AB_Work_Object_List_NewObject_Import extends ABComponent {
   constructor(App) {
      super(App, "ab_work_object_list_newObject_import");
      var L = this.Label;
      var currentApp = null;

      var labels = {
         common: App.labels,
         component: {
            existing: L("ab.object.import.title", "*Existing"),
            columns: L("ab.object.import.columns", "*Columns"),
            noFields: L("ab.object.import.noFields", "*No Fields Defined")
         }
      };

      // internal list of Webix IDs to reference UI components.
      var ids = {
         component: this.unique("component"),
         form: this.unique("import"),

         filter: this.unique("filter"),
         objectList: this.unique("objectList"),
         columnList: this.unique("columnList"),

         buttonSave: this.unique("save"),
         buttonCancel: this.unique("cancel")
      };

      /**
       * @param {object} options
       * @param {function} options.onBusyStart
       * @param {function} options.onBusyEnd
       * @param {function} options.onDone
       * @param {function} options.onCancel
       */
      this.init = (options) => {
         // webix.extend($$(ids.form), webix.ProgressBar);

         // load callbacks.
         for (var c in _logic.callbacks) {
            _logic.callbacks[c] = options[c] || _logic.callbacks[c];
         }
      };

      // internal business logic
      var _logic = (this._logic = {
         callbacks: {
            onCancel: function() {
               console.warn("NO onCancel()!");
            },
            //onSave  : function(values, cb) { console.warn('NO onSave()!') },
            onBusyStart: null,
            onBusyEnd: null,
            onDone: null
         },

         onShow: (app) => {
            currentApp = app;
            _logic.formClear();
            _logic.busyStart();

            // now all objects are *global* but an application might only
            // reference a sub set of them.  Here we just need to show
            // the objects our current application isn't referencing:

            var availableObjs = currentApp.objectsExcluded(
               (o) => !o.isSystemObject
            );
            $$(ids.objectList).parse(availableObjs, "json");

            _logic.busyEnd();
         },

         busyStart: function() {
            if (_logic.callbacks.onBusyStart) {
               _logic.callbacks.onBusyStart();
            }
         },

         busyEnd: function() {
            if (_logic.callbacks.onBusyEnd) {
               _logic.callbacks.onBusyEnd();
            }
         },

         filter: function() {
            // `this` should be from the Webix event
            var filterText = this.getValue();
            $$(ids.objectList).filter("#label#", filterText);
         },

         objectSelect: function() {
            $$(ids.columnList).clearAll();

            let selectedObj = $$(ids.objectList).getSelectedItem(false);
            if (selectedObj) {
               _logic.busyStart();

               let colNames = [];

               // Now that ABObjects are ABDefinitions, we no longer
               // have to lookup the data from the server:

               selectedObj.fields().forEach((f) => {
                  // Skip these columns
                  // TODO : skip connect field
                  // if (col.model) continue;
                  // if (col.collection) continue;

                  let fieldClass = ABFieldManager.allFields().filter(
                     (field) => field.defaults().key == f.key
                  )[0];
                  if (fieldClass == null) return;

                  // If connect field does not link to objects in app, then skip
                  if (
                     f.key == "connectObject" &&
                     !currentApp.objectsIncluded(
                        (obj) => obj.id == f.settings.linkObject
                     )[0]
                  ) {
                     return;
                  }

                  colNames.push({
                     id: f.id,
                     label: f.label,
                     isvisible: true,
                     icon: f.icon
                     // disabled: !supported
                  });
               });

               if (colNames.length == 0) {
                  colNames.push({
                     id: "none",
                     label: labels.component.noFields,
                     isvisible: true
                  });
               }

               $$(ids.columnList).parse(colNames);

               _logic.busyEnd();
            }
         },

         cancel: function() {
            _logic.formClear();
            _logic.callbacks.onCancel();
         },

         formClear: function() {
            // Filter section
            $$(ids.form).clearValidation();
            $$(ids.form).clear();
            // Lists
            $$(ids.objectList).clearAll();
            $$(ids.columnList).clearAll();
         },

         /**
          * @function hide()
          *
          * hide this component.
          */
         hide: function() {
            $$(ids.component).hide();
         },

         /**
          * @function save
          *
          * Send model import request to the server
          */
         save: function() {
            var saveButton = $$(ids.buttonSave);
            var selectedObj = $$(ids.objectList).getSelectedItem();
            if (!selectedObj) return false;

            saveButton.disable();
            _logic.busyStart();

            currentApp
               .objectInsert(selectedObj)
               .then((newObj) => {
                  saveButton.enable();
                  _logic.busyEnd();
                  _logic.callbacks.onDone(selectedObj);
               })
               .catch((err) => {
                  console.log("ERROR:", err);
                  saveButton.enable();
                  _logic.busyEnd();
               });
         },

         /**
          * @function show()
          *
          * Show this component.
          */
         show: function() {
            if ($$(ids.component)) $$(ids.component).show();
         }
      });

      // webix UI definition
      // (it references _logic functions defined above)
      this.ui = {
         id: ids.component,
         header: labels.component.existing,
         body: {
            view: "form",
            id: ids.form,
            width: 400,
            elements: [
               // Filter
               {
                  cols: [
                     {
                        view: "icon",
                        icon: "fa fa-filter",
                        align: "left"
                     },
                     {
                        view: "text",
                        id: ids.filter,
                        on: {
                           onTimedKeyPress: _logic.filter
                        }
                     }
                  ]
               },

               // Model list
               {
                  view: "list",
                  id: ids.objectList,
                  select: true,
                  height: 200,
                  minHeight: 250,
                  maxHeight: 250,
                  data: [],
                  template: "<div>#label#</div>",
                  on: {
                     onSelectChange: _logic.objectSelect
                  }
               },

               // Columns list
               {
                  view: "label",
                  label: `<b>${labels.component.columns}</b>`,
                  height: 20
               },
               {
                  view: "list",
                  id: ids.columnList,
                  datatype: "json",
                  multiselect: false,
                  select: false,
                  height: 200,
                  minHeight: 200,
                  maxHeight: 200,
                  type: {
                     height: 40,
                     isvisible: {
                        view: "checkbox",
                        width: 30
                     }
                  },
                  template: (obj, common) => {
                     // return `
                     //     <span style="float: left;">${common.isvisible(obj, common)}</span>
                     //     <span style="float: left;">${obj.label}</span>
                     // `;
                     return `
                                <span style="float: left;"><i class="fa fa-${obj.icon}"></i></span>
                                <span style="float: left;"> ${obj.label}</span>
                            `;
                  }
               },

               // Import & Cancel buttons
               {
                  margin: 5,
                  cols: [
                     { fillspace: true },
                     {
                        view: "button",
                        id: ids.buttonCancel,
                        value: labels.common.cancel,
                        css: "ab-cancel-button",
                        autowidth: true,
                        click: _logic.cancel
                     },
                     {
                        view: "button",
                        id: ids.buttonSave,
                        css: "webix_primary",
                        value: labels.common.import,
                        autowidth: true,
                        type: "form",
                        click: _logic.save
                     }
                  ]
               }
            ]
         }
      };

      // Expose any globally accessible Actions:
      this.actions({});

      //
      // Define external interface methods:
      //
      this.onShow = _logic.onShow;
   }
};
