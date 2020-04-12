const ABViewFormNumberCore = require("../../core/views/ABViewFormNumberCore");

const ABViewFormNumberPropertyComponentDefaults = ABViewFormNumberCore.defaultValues();

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABViewFormNumber extends ABViewFormNumberCore {
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
      var idBase = "ABViewFormNumberEditorComponent";
      var ids = {
         component: App.unique(idBase + "_component")
      };

      var numberElem = this.component(App).ui;
      numberElem.id = ids.component;

      var _ui = {
         type: "space",
         rows: [numberElem, {}]
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
            name: "isStepper",
            view: "checkbox",
            labelWidth: App.config.labelWidthCheckbox,
            labelRight: L(
               "ab.component.button.isStepper",
               "*Plus/Minus Buttons"
            )
         }
      ]);
   }

   static propertyEditorPopulate(App, ids, view) {
      super.propertyEditorPopulate(App, ids, view);

      $$(ids.isStepper).setValue(
         view.settings.isStepper != null
            ? view.settings.isStepper
            : ABViewFormNumberPropertyComponentDefaults.isStepper
      );
   }

   static propertyEditorValues(ids, view) {
      super.propertyEditorValues(ids, view);

      view.settings.isStepper = $$(ids.isStepper).getValue();
   }

   /**
    * @method component()
    * return a UI component based upon this view.
    * @param {obj} App
    * @return {obj} UI component
    */
   component(App) {
      var component = super.component(App);
      var field = this.field();

      var idBase = this.parentFormUniqueID(
         "ABViewFormNumber_" + this.id + "_f_"
      );
      var ids = {
         component: App.unique(idBase + "_component")
      };

      var viewType = this.settings.isStepper
         ? "counter"
         : App.custom.numbertext.view;

      component.ui.id = ids.component;
      component.ui.view = viewType;
      component.ui.type = "number";
      component.ui.validate = (val) => {
         return !isNaN(val * 1);
      };

      // make sure each of our child views get .init() called
      component.init = (options) => {};

      return component;
   }
};
