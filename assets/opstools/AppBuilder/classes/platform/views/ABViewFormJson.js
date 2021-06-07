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
            )
            // options: look at propertyEditorPopulate
         }
      ]);
   }

   static propertyEditorPopulate(App, ids, view) {
      super.propertyEditorPopulate(App, ids, view);

      // set the options for the filterField
      let filterFieldOptions = [{ id: "", value: "" }];
      view.parent.views().forEach((element) => {
         if (element.key == "json" && element.settings.type == "systemObject") {
            let formElementsDefs = view.application.definitionForID(
               element.settings.fieldId
            );
            let formComponent = view.parent.viewComponents[element.id];
            filterFieldOptions.push({
               id: element.id,
               value: formComponent.ui.label
            });
         }
      });
      $$(ids.filterField).define("options", filterFieldOptions);

      if (view.settings.filterField)
         $$(ids.filterField).setValue(view.settings.filterField);

      $$(ids.type).setValue(
         view.settings.type || ABViewFormJsonPropertyComponentDefaults.type
      );
   }

   static propertyEditorValues(ids, view) {
      super.propertyEditorValues(ids, view);

      view.settings.type = $$(ids.type).getValue();
      view.settings.filterField = $$(ids.filterField).getValue();
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
      component.rowFilter.init({
         onChange: () => {
            var vals = component.logic.getValue();
            component.ui.value = vals;
         },
         showObjectName: true
      });

      component.ui.id = ids.component;

      component.init = (options, accessLevel) => {
         if (this.settings.type == "filter") {
            let filterField = component.logic.getFilterField(this);
            $$(filterField).attachEvent("onChange", function(values) {
               component.logic.refreshFilter(values);
            });
         }
      };

      component.logic = {
         displayData: () => {},

         getFilterField: (instance) => {
            if (instance.settings.filterField) {
               let filterField =
                  instance.parent.viewComponents[instance.settings.filterField];

               if (filterField.ui && filterField.ui.id) {
                  return filterField.ui.id;
               } else {
                  return "";
               }
            } else {
               return "";
            }
         },

         getSystemObjects: () => {
            // get list of all objects in the app
            let objects = this.application.objects();
            // reformat objects into simple array for Webix multicombo
            // if you do not the data causes a maximum stack error
            let objectsArray = [];
            objects.forEach((obj) => {
               objectsArray.push({ id: obj.id, label: obj.label });
            });
            // return the simple array
            return objectsArray;
         },

         refreshFilter: (values) => {
            if (values) {
               let fieldDefs = [];
               values.forEach((obj) => {
                  let object = this.application.objectByID(obj);
                  let fields = object.fields();
                  if (fields.length) {
                     fields.forEach((f) => {
                        fieldDefs.push(f);
                     });
                  }
               });
               component.rowFilter.applicationLoad(this.application);
               component.rowFilter.fieldsLoad(fieldDefs);
               if (component.ui.value)
                  component.rowFilter.setValue(component.ui.value);
            } else {
               component.rowFilter.applicationLoad(null);
               component.rowFilter.fieldsLoad([]);
               if (component.ui.value)
                  component.rowFilter.setValue(component.ui.value);
            }
         },

         getValue: () => {
            return component.rowFilter._logic.getValue();
         },

         setValue: (formVals) => {
            component.ui.value = formVals;
            component.rowFilter.setValue(formVals);
         }
      };

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
            // fetch an array of system objects
            let systemObjects = component.logic.getSystemObjects();
            component.ui.suggest = {
               selectAll: true,
               body: {
                  data: systemObjects,
                  template: webix.template("#label#")
               }
            };
            break;
         case "filter":
            component.ui.view = "forminput";
            component.ui.css = "ab-custom-field";
            component.ui.body = component.rowFilter.ui;
            break;
      }

      return webix.copy(component);
   }
};
