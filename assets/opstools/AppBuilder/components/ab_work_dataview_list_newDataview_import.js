/*
 * ab_work_dataview_list_newDisplay_import
 *
 * Display the form for importing an existing data views into the application.
 *
 */

const ABComponent = require("../classes/platform/ABComponent");

module.exports = class AB_Work_Datacollection_List_NewDataview_Import extends ABComponent {
   constructor(App) {
      super(App, "ab_work_dataview_list_newDataview_import");
      var L = this.Label;

      var labels = {
         common: App.labels,
         component: {
            existing: L("ab.object.import.title", "*Existing")
         }
      };

      // internal list of Webix IDs to reference UI components.
      var ids = {
         component: this.unique("component"),
         form: this.unique("import"),

         filter: this.unique("filter"),
         datacollectionList: this.unique("datacollectionList"),

         buttonSave: this.unique("save"),
         buttonCancel: this.unique("cancel")
      };

      let CurrentApplication;

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
            CurrentApplication = app;

            _logic.formClear();
            _logic.busyStart();

            let availableDCs = [];
            CurrentApplication.datacollectionsExcluded().forEach((dc) => {
               availableDCs.push(dc);
            });
            $$(ids.datacollectionList).parse(availableDCs, "json");

            _logic.busyEnd();

            /*
            // CurrentApplication.datacollectionFind()
            CurrentApplication.datacollectionInfo()
               .then((datacollections) => {
                  let availableDCs = [];

                  datacollections.forEach((dc) => {
                     // skip if this object is in application
                     if (
                        CurrentApplication.datacollections(
                           (q) => q.id == dc.id
                        )[0]
                     )
                        return;

                     // translate label of objects
                     CurrentApplication.translate(dc, dc, ["label"]);

                     availableDCs.push(dc);
                  });

                  $$(ids.datacollectionList).parse(availableDCs, "json");

                  _logic.busyEnd();
               })
               .catch((err) => {
                  _logic.busyEnd();
               });
            */
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
            $$(ids.datacollectionList).filter("#label#", filterText);
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
            $$(ids.datacollectionList).clearAll();
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
            var selectedDatacollection = $$(
               ids.datacollectionList
            ).getSelectedItem();
            if (!selectedDatacollection) return false;

            saveButton.disable();
            _logic.busyStart();

            CurrentApplication.datacollectionInsert(selectedDatacollection)
               .then(() => {
                  saveButton.enable();
                  _logic.busyEnd();

                  _logic.callbacks.onDone(selectedDatacollection);
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
                  id: ids.datacollectionList,
                  select: true,
                  height: 200,
                  minHeight: 250,
                  maxHeight: 250,
                  data: [],
                  template: "<div>#label#</div>"
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
                        css: "webix_primary",
                        id: ids.buttonSave,
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

      //
      // Define external interface methods:
      //
      this.onShow = _logic.onShow;
   }
};
