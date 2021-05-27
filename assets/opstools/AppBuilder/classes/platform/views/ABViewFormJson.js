const ABViewFormJsonCore = require("../../core/views/ABViewFormJsonCore");
const RowFilter = require("../RowFilter");

const ABViewFormJsonPropertyComponentDefaults = ABViewFormJsonCore.defaultValues();

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABViewFormJson extends ABViewFormJsonCore {
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
      var idBase = "ABViewFormJsonEditorComponent";
      var ids = {
         component: App.unique(idBase + "_component")
      };
      var textView = this.component(App);

      var textUi = textView.ui;
      textUi.id = ids.component;

      var _ui = {
         rows: [textUi, {}]
      };

      var _init = (options) => {
         textView.init(options);
      };

      var _logic = {};

      return {
         ui: _ui,
         init: _init,
         logic: _logic
      };
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

      // in addition to the common .label  values, we
      // ask for:
      return commonUI.concat([
         {
            name: "type",
            view: "radio",
            label: L("ab.component.json.type", "*Type"),
            vertical: true,
            options: [
               {
                  id: "string",
                  value: L("ab.component.json.string", "*String")
               },
               {
                  id: "systemObject",
                  value: L("ab.component.json.systemObject", "*System Objects")
               },
               {
                  id: "filter",
                  value: L("ab.component.json.filter", "*Filter UI")
               }
            ],
            on: {
               onChange: (newValue, oldValue) => {
                  if (newValue == "filter") {
                     $$(ids.filterField).show();
                  } else {
                     $$(ids.filterField).hide();
                  }
               }
            }
         },
         {
            name: "filterField",
            view: "combo",
            hidden: true,
            label: L(
               "ab.component.json.filter.field",
               "*Object Field to Filter"
            ),
            labelPosition: "top",
            placeholder: L(
               "ab.component.json.filter.field.placeholder",
               "*Select a field to filter by"
            ),
            options: [
               { id: 1, value: "Field 1" },
               { id: 2, value: "Field 2" }
            ]
         }
      ]);
   }

   static propertyEditorPopulate(App, ids, view) {
      super.propertyEditorPopulate(App, ids, view);

      $$(ids.type).setValue(
         view.settings.type || ABViewFormJsonPropertyComponentDefaults.type
      );
   }

   static propertyEditorValues(ids, view) {
      super.propertyEditorValues(ids, view);

      view.settings.type = $$(ids.type).getValue();
   }

   /*
    * @component()
    * return a UI component based upon this view.
    * @param {obj} App
    * @return {obj} UI component
    */
   component(App) {
      var component = super.component(App);

      var idBase = this.parentFormUniqueID("ABViewFormJson_" + this.id + "_f_");
      var ids = {
         component: App.unique(idBase + "_component")
      };

      component.rowFilter = new RowFilter(App, "ab.view.form.json.filter");

      component.ui.id = ids.component;

      switch (
         this.settings.type ||
         ABViewFormJsonPropertyComponentDefaults.type
      ) {
         case "string":
            component.ui.view = "textarea";
            component.ui.height = 200;
            break;
         case "systemObject":
            component.ui.view = "multicombo";
            component.ui.placeholder = L(
               "ab.component.json.systemObject.placeholder",
               "*Select one or more system objects"
            );
            component.ui.button = false;
            component.ui.suggest = {
               selectAll: true,
               body: {
                  data: [
                     { id: 1, label: "System Object 1" },
                     { id: 2, label: "System Object 2" },
                     { id: 3, label: "System Object 3" },
                     { id: 4, label: "System Object 4" },
                     { id: 5, label: "System Object 5" }
                  ],
                  template: webix.template("#label#")
               }
            };
            // component.ui.on = {
            //    onChange: function() {
            //       webix.message("Data was changed");
            //    }
            // };
            break;
         case "filter":
            component.ui.view = "forminput";
            component.ui.css = "ab-rich-text";
            component.ui.body = component.rowFilter.ui;
            break;
      }

      component.onShow = () => {};

      component.init = (options, accessLevel) => {
         if (this.settings.type == "filter") {
            debugger;
            console.log(this);
            component.rowFilter.setValue({});
         }
      };

      return webix.copy(component);
   }
};
