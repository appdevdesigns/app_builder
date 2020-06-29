/*
 * ab_work_query_list_newQuery_import
 *
 * Display the form for importing an existing query into the application.
 *
 */

const ABComponent = require("../classes/platform/ABComponent");

module.exports = class AB_Work_Query_List_NewQuery_Import extends ABComponent {
   constructor(App) {
      super(App, "ab_work_query_list_newQuery_import");
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
         queryList: this.unique("queryList"),

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

            // find the queries not included in this Application
            let availableQueries = [];
            CurrentApplication.queriesExcluded().forEach((query) => {
               availableQueries.push(query);
            });
            $$(ids.queryList).parse(availableQueries, "json");

            _logic.busyEnd();
            /*      
            // CurrentApplication.queryFind()
            CurrentApplication.queryInfo()
               .then((queries) => {
                  let availableQueries = [];

                  queries.forEach((query) => {
                     // skip if this object is in application
                     if (CurrentApplication.queries((q) => q.id == query.id)[0])
                        return;

                     // translate label of objects
                     CurrentApplication.translate(query, query, ["label"]);

                     availableQueries.push(query);
                  });

                  $$(ids.queryList).parse(availableQueries, "json");

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
            $$(ids.queryList).filter("#label#", filterText);
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
            $$(ids.queryList).clearAll();
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
            var selectedQuery = $$(ids.queryList).getSelectedItem();
            if (!selectedQuery) return false;

            saveButton.disable();
            _logic.busyStart();

            CurrentApplication.queryInsert(selectedQuery)
               .then(() => {
                  saveButton.enable();
                  _logic.busyEnd();

                  _logic.callbacks.onDone(selectedQuery);
               })
               .catch((err) => {
                  console.log("ERROR:", err);
                  saveButton.enable();
                  _logic.busyEnd();
               });

            // CurrentApplication.queryImport(selectedQuery.id)
            //    .then((newQuery) => {
            //       saveButton.enable();
            //       _logic.busyEnd();

            //       _logic.callbacks.onDone(newQuery);
            //    })
            //    .catch((err) => {
            //       console.log("ERROR:", err);
            //       saveButton.enable();
            //       _logic.busyEnd();
            //    });
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
                  id: ids.queryList,
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
                        id: ids.buttonSave,
                        value: labels.common.import,
                        css: "webix_primary",
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
