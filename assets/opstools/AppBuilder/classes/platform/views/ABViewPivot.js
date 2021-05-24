const ABViewPivotCore = require("../../core/views/ABViewPivotCore");
const ABFieldCalculate = require("../dataFields/ABFieldCalculate");
const ABFieldFormula = require("../dataFields/ABFieldFormula");
const ABFieldNumber = require("../dataFields/ABFieldNumber");
const ABObjectQuery = require("../ABObjectQuery");

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABViewPivot extends ABViewPivotCore {
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
      var idBase = "ABViewPivotEditorComponent";
      var ids = {
         component: App.unique(idBase + "_component")
      };

      var componentBase = this.component(App);
      var component = _.cloneDeep(componentBase);

      component.ui.id = ids.component;
      component.ui.readonly = false;
      component.ui.on = {
         onBeforeApply: (structure) => {
            this.settings.structure = structure;
            this.save();
         }
      };

      component.init = (options) => {
         componentBase.init({
            componentId: ids.component
         });
      };

      return component;
   }

   //
   // Property Editor
   //

   // static propertyEditorComponent(App) {
   // 	return ABViewPropertyComponent.component(App);
   // }

   static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {
      var commonUI = super.propertyEditorDefaultElements(
         App,
         ids,
         _logic,
         ObjectDefaults
      );

      return commonUI.concat([
         {
            name: "datacollection",
            view: "richselect",
            label: L("ab.components.pivot.dataSource", "*Data Source"),
            labelWidth: App.config.labelWidthLarge
         },
         {
            view: "counter",
            name: "height",
            label: L("ab.component.pivot.height", "*Height:"),
            labelWidth: App.config.labelWidthLarge
         },
         {
            view: "checkbox",
            name: "removeMissed",
            labelRight: L(
               "ab.component.pivot.removeMissed",
               "*Remove empty data."
            ),
            labelWidth: App.config.labelWidthCheckbox
         },
         {
            view: "checkbox",
            name: "totalColumn",
            labelRight: L(
               "ab.component.pivot.totalColumn",
               "*Show a total column."
            ),
            labelWidth: App.config.labelWidthCheckbox
         },
         {
            view: "checkbox",
            name: "separateLabel",
            labelRight: L(
               "ab.component.pivot.separateLabel",
               "*Separate header label."
            ),
            labelWidth: App.config.labelWidthCheckbox
         },
         {
            view: "checkbox",
            name: "min",
            labelRight: L(
               "ab.component.pivot.min",
               "*Highlighting of a cell(s) with the least value in a row."
            ),
            labelWidth: App.config.labelWidthCheckbox
         },
         {
            view: "checkbox",
            name: "max",
            labelRight: L(
               "ab.component.pivot.max",
               "*Highlighting of a cell(s) with the biggest value in a row."
            ),
            labelWidth: App.config.labelWidthCheckbox
         },
         {
            name: "decimalPlaces",
            view: "counter",
            min: 1,
            label: L("ab.components.pivot.decimalPlaces", "*Decimal Places"),
            labelWidth: App.config.labelWidthXLarge
         }
      ]);
   }

   static propertyEditorPopulate(App, ids, view) {
      super.propertyEditorPopulate(App, ids, view);

      var datacollectionId = view.settings.dataviewID
         ? view.settings.dataviewID
         : null;
      var SourceSelector = $$(ids.datacollection);

      // Pull data collections to options
      var dcOptions = view.propertyDatacollections();
      SourceSelector.define("options", dcOptions);
      SourceSelector.define("value", datacollectionId);
      SourceSelector.refresh();

      $$(ids.removeMissed).setValue(view.settings.removeMissed);
      $$(ids.totalColumn).setValue(view.settings.totalColumn);
      $$(ids.separateLabel).setValue(view.settings.separateLabel);
      $$(ids.min).setValue(view.settings.min);
      $$(ids.max).setValue(view.settings.max);
      $$(ids.height).setValue(view.settings.height);
      $$(ids.decimalPlaces).setValue(
         view.settings.decimalPlaces == null ? 2 : view.settings.decimalPlaces
      );
   }

   static propertyEditorValues(ids, view) {
      super.propertyEditorValues(ids, view);

      view.settings.dataviewID = $$(ids.datacollection).getValue();

      view.settings.removeMissed = $$(ids.removeMissed).getValue();
      view.settings.totalColumn = $$(ids.totalColumn).getValue();
      view.settings.separateLabel = $$(ids.separateLabel).getValue();
      view.settings.min = $$(ids.min).getValue();
      view.settings.max = $$(ids.max).getValue();
      view.settings.height = $$(ids.height).getValue();
      view.settings.decimalPlaces = $$(ids.decimalPlaces).getValue();
   }

   /*
    * @component()
    * return a UI component based upon this view.
    * @param {obj} App
    * @return {obj} UI component
    */
   component(App) {
      let baseCom = super.component(App);

      var idBase = "ABViewPivot_" + this.id;
      var ids = {
         component: App.unique(idBase + "_component")
      };

      // an ABViewLabel is a simple Label
      var _ui = {
         id: ids.component,
         view: "pivot",
         readonly: true,
         removeMissed: this.settings.removeMissed,
         totalColumn: this.settings.totalColumn,
         separateLabel: this.settings.separateLabel,
         min: this.settings.min,
         max: this.settings.max,
         height: this.settings.height,
         format: (value) => {
            let decimalPlaces = this.settings.decimalPlaces || 2;
            return value && value != "0"
               ? parseFloat(value).toFixed(decimalPlaces || 0)
               : value;
         }
      };

      // make sure each of our child views get .init() called
      var _init = (options) => {
         options = options || {};
         options.componentId = options.componentId || ids.component;

         let dc = this.datacollection;
         if (!dc) return Promise.resolve(); // TODO: refactor in v2

         let object = dc.datasource;
         if (!object) return Promise.resolve(); // TODO: refactor in v2

         let $pivotComp = $$(ids.component);
         if ($pivotComp && object instanceof ABObjectQuery) {
            let customLabels = {};
            object.fields().forEach((f) => {
               customLabels[f.columnName] = f.label;
            });

            $pivotComp.define("fieldMap", customLabels);
         }

         let populateData = () => {
            let data = dc.getData();
            let dataMapped = data.map((d) => {
               let result = {};

               object.fields(null, true).forEach((f) => {
                  if (
                     f instanceof ABFieldCalculate ||
                     f instanceof ABFieldFormula ||
                     f instanceof ABFieldNumber
                  )
                     result[f.columnName] = d[f.columnName];
                  else result[f.columnName] = f.format(d);
               });

               return result;
            });

            $$(options.componentId).parse(dataMapped);

            // set pivot configuration
            if (this.settings.structure)
               $$(options.componentId).setStructure(this.settings.structure);
         };

         this.eventAdd({
            emitter: dc,
            eventName: "initializedData",
            listener: () => {
               populateData();
            }
         });

         return (
            Promise.resolve()
               // get data
               .then(() => {
                  return new Promise((next, err) => {
                     switch (dc.dataStatus) {
                        case dc.dataStatusFlag.notInitial:
                           dc.loadData();
                           break;
                        case dc.dataStatusFlag.initialized:
                           next();
                           break;
                     }
                  });
               })

               // populate data into pivot
               .then(() => {
                  return new Promise((next, err) => {
                     populateData();
                     next();
                  });
               })
         );
      };

      return {
         ui: _ui,
         init: _init,

         onShow: baseCom.onShow
      };
   }
};

