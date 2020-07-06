const ABViewFormDatepickerCore = require("../../core/views/ABViewFormDatepickerCore");

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABViewFormDatepicker extends ABViewFormDatepickerCore {
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
      var idBase = "ABViewFormDatepickerEditorComponent";
      var ids = {
         component: App.unique(idBase + "_component")
      };

      var datepickerElem = this.component(App).ui;
      datepickerElem.id = ids.component;

      var _ui = {
         rows: [datepickerElem, {}]
      };

      var _init = (options) => {};

      var _logic = {};

      return {
         ui: _ui,
         init: _init,
         logic: _logic
      };
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
         "ABViewFormDatepicker_" + this.id + "_f_"
      );
      var ids = {
         component: App.unique(idBase + "_component")
      };

      component.ui.id = ids.component;
      component.ui.view = "datepicker";

      // Ignore date - Only time picker
      if (field && field.settings.dateFormat == 1) {
         component.ui.type = "time";
      }

      // Date & Time picker
      if (
         field &&
         field.settings.timeFormat &&
         field.settings.timeFormat != 1
      ) {
         component.ui.timepicker = this.settings.timepicker;
      }

      // allows entering characters in datepicker input, false by default
      component.ui.editable = true;

      // default value
      if (component.ui.value && !(component.ui.value instanceof Date)) {
         component.ui.value = new Date(component.ui.value);
      }

      if (field != null) {
         component.ui.format = field.getFormat();
      }

      // make sure each of our child views get .init() called
      component.init = (options) => {};

      return component;
   }
};
