const ABViewPivotCore = require("../../core/views/ABViewPivotCore");
const ABFieldNumber = require("../dataFields/ABFieldNumber");

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
         height: this.settings.height
      };

      // make sure each of our child views get .init() called
      var _init = (options) => {
         options = options || {};
         options.componentId = options.componentId || ids.component;

         return (
            Promise.resolve()

               // get data
               .then(() => {
                  return new Promise((next, err) => {
                     let dv = this.datacollection;
                     if (!dv) return next();

                     this.eventAdd({
                        emitter: dv,
                        eventName: "initializedData",
                        listener: () => {
                           next();
                        }
                     });

                     switch (dv.dataStatus) {
                        case dv.dataStatusFlag.notInitial:
                           dv.loadData();
                           break;
                        case dv.dataStatusFlag.initialized:
                           next();
                           break;
                     }
                  });
               })

               // populate data into pivot
               .then(() => {
                  return new Promise((next, err) => {
                     let dv = this.datacollection;
                     if (!dv) return next();

                     let object = dv.datasource;
                     if (!object) return next();

                     let data = dv.getData();
                     let dataMapped = data.map((d) => {
                        let result = {};

                        object.fields(null, true).forEach((f) => {
                           if (f instanceof ABFieldNumber)
                              result[f.columnName] = d[f.columnName];
                           else result[f.columnName] = f.format(d);
                        });

                        return result;
                     });

                     $$(options.componentId).parse(dataMapped);

                     next();
                  });
               })

               // set pivot configuration
               .then(() => {
                  return new Promise((next, err) => {
                     if (this.settings.structure)
                        $$(options.componentId).setStructure(
                           this.settings.structure
                        );

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

