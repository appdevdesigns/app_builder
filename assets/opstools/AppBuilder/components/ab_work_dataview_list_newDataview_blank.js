/*
 * ab_work_dataview_list_newDataview_blank
 *
 * Display the form for creating a new Data view.
 *
 */

const ABComponent = require("../classes/platform/ABComponent");

module.exports = class AB_Work_Query_List_newDataview_Blank extends ABComponent {
   constructor(App) {
      super(App, "ab_work_dataview_list_newDataview_blank");
      var L = this.Label;

      var labels = {
         common: App.labels,
         component: {
            datacollectionName: L("ab.datacollection.name", "*Name"),
            datacollectionNamePlaceholder: L(
               "ab.datacollection.namePlaceholder",
               "*Data view name"
            ),
            addNewDatacollection: L(
               "ab.datacollection.addNew",
               "*Add data view"
            ),
            object: L("ab.datacollection.object", "*Object"),
            objectPlaceholder: L(
               "ab.datacollection.objectPlaceholder",
               "*Select an object"
            )
         }
      };

      // internal list of Webix IDs to reference our UI components.
      var ids = {
         component: this.unique("component"),

         form: this.unique("form"),
         buttonCancel: this.unique("buttonCancel"),
         buttonSave: this.unique("buttonSave"),
         object: this.unique("object")
      };

      // Our webix UI definition:
      this.ui = {
         id: ids.component,
         header: labels.common.create,
         body: {
            view: "form",
            id: ids.form,
            rules: {},
            elements: [
               {
                  view: "text",
                  label: labels.component.datacollectionName,
                  name: "name",
                  required: true,
                  placeholder: labels.component.datacollectionNamePlaceholder,
                  labelWidth: App.config.labelWidthMedium
               },
               {
                  view: "richselect",
                  id: ids.object,
                  name: "object",
                  label: labels.component.object,
                  labelWidth: App.config.labelWidthMedium,
                  placeholder: labels.component.objectPlaceholder,
                  required: false,
                  options: [
                     { id: "one", value: "One" },
                     { id: "two", value: "Two" }
                  ]
               },
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
                        click: function() {
                           _logic.cancel();
                        }
                     },
                     {
                        view: "button",
                        css: "webix_primary",
                        id: ids.buttonSave,
                        value: labels.component.addNewDatacollection,
                        autowidth: true,
                        type: "form",
                        click: function() {
                           return _logic.save();
                        }
                     }
                  ]
               }
            ]
         }
      };

      // Our init() function for setting up our UI
      this.init = (options) => {
         // webix.extend($$(ids.form), webix.ProgressBar);

         // load up our callbacks.
         for (var c in _logic.callbacks) {
            _logic.callbacks[c] = options[c] || _logic.callbacks[c];
         }
      };

      let CurrentApplication;

      // our internal business logic
      var _logic = (this._logic = {
         callbacks: {
            onCancel: function() {
               console.warn("NO onCancel()!");
            },
            onBusyStart: function() {
               console.warn("NO onBusyStart()!");
            },
            onDone: function(query) {
               console.warn("NO onDone()!");
            }
         },

         onShow: (app) => {
            // clear form
            $$(ids.form).setValues({
               name: "",
               object: ""
            });

            CurrentApplication = app;

            if (!$$(ids.object)) return;

            // populate object list
            let datasourceOpts = [];

            if (CurrentApplication) {
               // Objects
               datasourceOpts = datasourceOpts.concat(
                  CurrentApplication.objectsIncluded().map((obj) => {
                     return {
                        id: obj.id,
                        value: obj.label,
                        icon: "fa fa-database",
                        isQuery: false
                     };
                  })
               );

               // Queries
               datasourceOpts = datasourceOpts.concat(
                  CurrentApplication.queriesIncluded().map((q) => {
                     return {
                        id: q.id,
                        value: q.label,
                        icon: "fa fa-filter",
                        isQuery: true
                     };
                  })
               );
            }

            $$(ids.object).define("options", datasourceOpts);
            $$(ids.object).refresh();

            // Set width of item list
            let $suggestView = $$(ids.object).getPopup();
            $suggestView.attachEvent("onShow", () => {
               $suggestView.define("width", 350);
               $suggestView.resize();
            });
         },

         cancel: function() {
            _logic.formClear();
            _logic.callbacks.onCancel();
         },

         formClear: function() {
            $$(ids.form).clearValidation();
            $$(ids.form).clear();
         },

         /**
          * @function save
          *
          * verify the current info is ok, package it, and return it to be
          * added to the application.createModel() method.
          */
         save: function() {
            // validate
            if (!$$(ids.form).validate()) return;

            _logic.callbacks.onBusyStart();

            let saveButton = $$(ids.buttonSave);
            saveButton.disable();

            let formVals = $$(ids.form).getValues(),
               datacollectionName = formVals["name"],
               objectId = formVals["object"];

            // get isQuery flag
            let $objectList = $$(ids.object).getList();
            let selectedObject = $objectList.getItem(objectId);

            // create an instance of ABDatacollection
            let datacollection = CurrentApplication.datacollectionNew({
               name: datacollectionName,
               label: datacollectionName,
               settings: {
                  datasourceID: objectId,
                  isQuery: selectedObject ? selectedObject.isQuery : false
               }
            });

            // save to db
            datacollection
               .save()
               .then(() => {
                  saveButton.enable();

                  _logic.callbacks.onDone(datacollection);
               })
               .catch((err) => {
                  saveButton.enable();

                  _logic.callbacks.onDone(null);
               });
         }
      });

      // Expose any globally accessible Actions:
      this.actions({});

      //
      // Define external interface methods:
      //
      this.onShow = _logic.onShow;
   }
};
