/*
 * ab_work_query_list_newQuery_blank
 *
 * Display the form for creating a new Application.
 *
 */

const ABComponent = require("../classes/platform/ABComponent");

module.exports = class AB_Work_Query_List_NewQuery_Blank extends ABComponent {
   constructor(App) {
      super(App, "ab_work_query_list_newQuery_blank");
      var L = this.Label;

      var labels = {
         common: App.labels,
         component: {
            queryName: L("ab.query.name", "*Name"),
            queryNamePlaceholder: L("ab.query.namePlaceholder", "*Query name"),
            addNewQuery: L("ab.query.addNewQuery", "*Add query"),
            object: L("ab.query.object", "*Object"),
            objectPlaceholder: L(
               "ab.query.objectPlaceholder",
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
                  label: labels.component.queryName,
                  name: "name",
                  required: true,
                  placeholder: labels.component.queryNamePlaceholder,
                  labelWidth: App.config.labelWidthMedium
               },
               {
                  view: "richselect",
                  id: ids.object,
                  name: "object",
                  label: labels.component.object,
                  labelWidth: App.config.labelWidthMedium,
                  placeholder: labels.component.objectPlaceholder,
                  required: true
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
                        id: ids.buttonSave,
                        css: "webix_primary",
                        value: labels.component.addNewQuery,
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

      let currentApp;

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
            currentApp = app;

            // populate object list
            if ($$(ids.object)) {
               let objectOpts = currentApp.objectsIncluded().map((obj) => {
                  return {
                     id: obj.id,
                     value: obj.label
                  };
               });

               $$(ids.object).define("options", objectOpts);
               $$(ids.object).refresh();

               // Set width of item list
               let $suggestView = $$(ids.object).getPopup();
               $suggestView.attachEvent("onShow", () => {
                  $suggestView.define("width", 350);
                  $suggestView.resize();
               });
            }

            // clear form
            $$(ids.form).setValues({
               name: "",
               object: ""
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
               queryName = formVals["name"],
               objectId = formVals["object"];

            let selectedObj = currentApp.objects(
               (obj) => obj.id == objectId
            )[0];

            // create an instance of ABObjectQuery
            let query = currentApp.queryNew({
               name: queryName,
               label: queryName,
               joins: {
                  alias: "BASE_OBJECT", // TODO
                  objectID: selectedObj.id,
                  links: []
               }
            });

            // save to db
            query
               .save()
               .then(() => {
                  saveButton.enable();

                  _logic.callbacks.onDone(query);
               })
               .catch((err) => {
                  // we gotta indicate there was a problem!
                  console.error(err);
                  var message = err.toString();
                  if (err.message) {
                     message = err.message;
                  }
                  webix.alert({
                     title: "Error creating Query ",
                     ok: "try again",
                     text: message,
                     type: "alert-error"
                  });

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
