const ABViewDetailCheckboxCore = require("../../core/views/ABViewDetailCheckboxCore");

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABViewDetailCheckbox extends ABViewDetailCheckboxCore {
   /**
    * @param {obj} values  key=>value hash of ABView values
    * @param {ABApplication} application the application object this view is under
    * @param {ABView} parent the ABView this view is a child of. (can be null)
    */
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
      var idBase = "ABViewDetailCheckboxEditorComponent";
      var ids = {
         component: App.unique(idBase + "_component")
      };

      var checkboxElem = this.component(App).ui;
      checkboxElem.id = ids.component;

      var _ui = {
         rows: [checkboxElem, {}]
      };

      var _init = (options) => {};

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
      return commonUI.concat([]);
   }

   static propertyEditorPopulate(App, ids, view) {
      super.propertyEditorPopulate(App, ids, view);
   }

   static propertyEditorValues(ids, view) {
      super.propertyEditorValues(ids, view);
   }

   /**
    * @component()
    * return a UI component based upon this view.
    * @param {obj} App
    * @param {string} idPrefix
    *
    * @return {obj} UI component
    */
   component(App, idPrefix) {
      var component = super.component(App);

      var idBase = "ABViewDetailCheckbox_" + (idPrefix || "") + this.id;
      var ids = {
         component: App.unique(idBase + "_component")
      };

      component.ui.id = ids.component;

      return {
         ui: component.ui,
         init: component.init,

         logic: {
            setValue: (val) => {
               var checkbox = "";

               // Check
               if (val && JSON.parse(val))
                  checkbox =
                     '<span class="check webix_icon fa fa-check-square-o"></span>';
               // Uncheck
               else
                  checkbox =
                     '<span class="check webix_icon fa fa-square-o"></span>';

               component.logic.setValue(ids.component, checkbox);
            }
         }
      };
   }
};
