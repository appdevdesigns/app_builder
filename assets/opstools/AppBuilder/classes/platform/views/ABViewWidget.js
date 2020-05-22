const ABViewWidgetCore = require("../../core/views/ABViewWidgetCore");

const ABPropertyComponentDefaults = ABViewWidgetCore.defaultValues();

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABViewWidget extends ABViewWidgetCore {
   constructor(values, application, parent, defaultValues) {
      super(values, application, parent, defaultValues);
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
            name: "columnSpan",
            view: "counter",
            min: 1,
            label: L("ab.components.container.columnSpan", "*Column Span"),

            hidden: true // TODO
         },
         {
            name: "rowSpan",
            view: "counter",
            min: 1,
            label: L("ab.components.container.rowSpan", "*Row Span"),

            hidden: true // TODO
         }
      ]);
   }

   static propertyEditorPopulate(App, ids, view) {
      super.propertyEditorPopulate(App, ids, view);

      $$(ids.columnSpan).setValue(
         view.position.dx || ABPropertyComponentDefaults.columnSpan
      );
      $$(ids.rowSpan).setValue(
         view.position.dy || ABPropertyComponentDefaults.rowSpan
      );
   }

   static propertyEditorValues(ids, view) {
      super.propertyEditorValues(ids, view);

      view.position.dx = $$(ids.columnSpan).getValue();
      view.position.dy = $$(ids.rowSpan).getValue();
   }

   /**
    * @function component()
    * return a UI component based upon this view.
    * @param {obj} App
    * @return {obj} UI component
    */
   component(App) {
      let base = super.component(App);

      base.onShow = (viewId) => {
         let dv = this.datacollection; // get from a function or a (get) property
         if (dv && dv.dataStatus == dv.dataStatusFlag.notInitial) {
            // load data when a widget is showing
            dv.loadData();
         }
      };

      return base;
   }
};
