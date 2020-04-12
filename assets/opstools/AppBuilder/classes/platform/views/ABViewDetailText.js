const ABViewDetailTextCore = require("../../core/views/ABViewDetailTextCore");

const ABViewDetailTextPropertyComponentDefaults = ABViewDetailTextCore.defaultValues();

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABViewDetailText extends ABViewDetailTextCore {
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
      var idBase = "ABViewDetailTextEditorComponent";
      var ids = {
         component: App.unique(idBase + "_component")
      };

      var textElem = this.component(App).ui;
      textElem.id = ids.component;

      var _ui = {
         rows: [textElem, {}]
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
      return commonUI.concat([
         {
            view: "counter",
            name: "height",
            label: L("ab.components.common.height", "*Height:"),
            labelWidth: App.config.labelWidthLarge
         }
      ]);
   }

   static propertyEditorPopulate(App, ids, view) {
      super.propertyEditorPopulate(App, ids, view);

      $$(ids.height).setValue(
         view.settings.height ||
            ABViewDetailTextPropertyComponentDefaults.height
      );
   }

   static propertyEditorValues(ids, view) {
      super.propertyEditorValues(ids, view);

      view.settings.height = $$(ids.height).getValue();
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

      var idBase = "ABViewDetailText_" + (idPrefix || "") + this.id;
      var ids = {
         component: App.unique(idBase + "_component")
      };

      component.ui.id = ids.component;

      component.ui.css = "ab-text";

      if (this.settings.height) component.ui.height = this.settings.height;

      return {
         ui: component.ui,
         init: component.init,

         logic: {
            setValue: (val) => {
               component.logic.setValue(ids.component, val);
            }
         }
      };
   }
};
