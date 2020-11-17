const ABViewConditionalContainerCore = require("../../core/views/ABViewConditionalContainerCore");
const RowFilter = require("../RowFilter");

const ABViewPropertyDefaults = ABViewConditionalContainerCore.defaultValues();

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

let FilterComponent = null;

module.exports = class ABViewConditionalContainer extends ABViewConditionalContainerCore {
   constructor(values, application, parent, defaultValues) {
      super(values, application, parent, defaultValues);

      // Set filter value
      this.__filterComponent = new RowFilter();
      this.__filterComponent.applicationLoad(application);
      this.populateFilterComponent();
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

      var idBase = "ABViewConditionalContainerPropertyEditor";

      _logic.changeDatacollection = (dvId) => {
         var view = _logic.currentEditObject();

         this.populatePopupEditors(ids, view, dvId);
      };

      _logic.showFilterPopup = ($view) => {
         this.filter_popup.show($view, null, { pos: "top" });
      };

      _logic.onFilterChange = () => {
         var view = _logic.currentEditObject();

         var filterValues = FilterComponent.getValue();

         view.settings.filterConditions = filterValues;

         var allComplete = true;
         filterValues.rules.forEach((f) => {
            // if all 3 fields are present, we are good.
            if (f.key && f.rule && f.value) {
               allComplete = allComplete && true;
            } else {
               // else, we found an entry that wasn't complete:
               allComplete = false;
            }
         });

         // only perform the update if a complete row is specified:
         if (allComplete) {
            // we want to call .save() but give webix a chance to properly update it's
            // select boxes before this call causes them to be removed:
            setTimeout(() => {
               this.propertyEditorSave(ids, view);
            }, 10);
         }

         this.populateBadgeNumber(ids, view);
      };

      FilterComponent = new RowFilter(App, idBase + "_filter");
      FilterComponent.init({
         // when we make a change in the popups we want to make sure we save the new workspace to the properties to do so just fire an onChange event
         onChange: _logic.onFilterChange
      });

      this.filter_popup = webix.ui({
         view: "popup",
         width: 800,
         hidden: true,
         body: FilterComponent.ui
      });

      return commonUI.concat([
         {
            name: "datacollection",
            view: "richselect",
            label: L(
               "ab.components.conditionalcontainer.dataSource",
               "*Data Source"
            ),
            labelWidth: App.config.labelWidthLarge,
            on: {
               onChange: function(dvId) {
                  _logic.changeDatacollection(dvId);
               }
            }
         },
         {
            view: "fieldset",
            name: "filter",
            label: L(
               "ab.component.conditionalcontainer.advancedOptions",
               "*Filter:"
            ),
            labelWidth: App.config.labelWidthLarge,
            body: {
               type: "clean",
               padding: 10,
               rows: [
                  {
                     cols: [
                        {
                           view: "label",
                           label: L(
                              "ab.component.conditionalcontainer.filterData",
                              "*Filter Data:"
                           ),
                           width: App.config.labelWidthLarge
                        },
                        {
                           view: "button",
                           name: "buttonFilter",
                           label: L(
                              "ab.component.conditionalcontainer.settings",
                              "*Settings"
                           ),
                           icon: "fa fa-gear",
                           type: "icon",
                           css: "webix_primary",
                           autowidth: true,
                           badge: 0,
                           click: function() {
                              _logic.showFilterPopup(this.$view);
                           }
                        }
                     ]
                  }
               ]
            }
         }
      ]);
   }

   static propertyEditorPopulate(App, ids, view) {
      super.propertyEditorPopulate(App, ids, view);

      FilterComponent.applicationLoad(view.application);

      var datacollectionId = view.settings.dataviewID
         ? view.settings.dataviewID
         : null;
      var SourceSelector = $$(ids.datacollection);

      // Pull data collections to options
      var dcOptions = view.propertyDatacollections();
      SourceSelector.define("options", dcOptions);
      SourceSelector.define("value", datacollectionId);
      SourceSelector.refresh();

      this.populatePopupEditors(ids, view);
   }

   static propertyEditorValues(ids, view) {
      super.propertyEditorValues(ids, view);

      view.settings.dataviewID = $$(ids.datacollection).getValue();
   }

   static populatePopupEditors(ids, view, datacollectionId) {
      // pull current data collection
      var dv = view.datacollection;

      // specify data collection id
      if (datacollectionId) {
         dv = view.application.datacollections(
            (d) => d.id == datacollectionId
         )[0];
      }

      if (dv && dv.datasource) {
         FilterComponent.fieldsLoad(dv.datasource.fields());
         view.__filterComponent.fieldsLoad(dv.datasource.fields());
      } else {
         FilterComponent.fieldsLoad();
         view.__filterComponent.fieldsLoad();
      }

      FilterComponent.setValue(
         view.settings.filterConditions ||
            ABViewPropertyDefaults.filterConditions
      );
      view.__filterComponent.setValue(
         view.settings.filterConditions ||
            ABViewPropertyDefaults.filterConditions
      );

      this.populateBadgeNumber(ids, view);
   }

   static populateBadgeNumber(ids, view) {
      if (
         view.settings.filterConditions &&
         view.settings.filterConditions.rules
      ) {
         $$(ids.buttonFilter).define(
            "badge",
            view.settings.filterConditions.rules.length || null
         );
         $$(ids.buttonFilter).refresh();
      } else {
         $$(ids.buttonFilter).define("badge", null);
         $$(ids.buttonFilter).refresh();
      }
   }

   /*
    * @component()
    * return a UI component based upon this view.
    * @param {obj} App
    * @return {obj} UI component
    */
   component(App) {
      var idBase = "ABViewConditionalContainer_" + this.id;
      var ids = {
         component: App.unique(idBase + "_component")
      };

      var baseComp = super.component(App);

      var ifComp = this.views()[0].component(App),
         elseComp = this.views()[1].component(App);

      ifComp.ui.batch = "if";
      elseComp.ui.batch = "else";

      var _ui = {
         id: ids.component,
         view: "multiview",
         cells: [
            {
               batch: "wait",
               view: "layout",
               rows: [
                  {
                     view: "label",
                     label: "Please wait..."
                  }
               ]
            },
            ifComp.ui,
            elseComp.ui
         ]
      };

      var _init = (options) => {
         baseComp.init(options);

         this.populateFilterComponent();

         var dv = this.datacollection;
         if (dv) {
            // listen DC events
            this.eventAdd({
               emitter: dv,
               eventName: "loadData",
               listener: () => _logic.displayView()
            });

            this.eventAdd({
               emitter: dv,
               eventName: "changeCursor",
               listener: _logic.displayView
            });
         }

         _logic.displayView();
      };

      var _logic = {
         displayView: (currData) => {
            let dv = this.datacollection;
            if (dv) {
               if (currData == null) {
                  currData = dv.getCursor();
               }

               // show 'waiting' panel
               if (
                  !currData &&
                  (dv.dataStatus == dv.dataStatusFlag.notInitial ||
                     dv.dataStatus == dv.dataStatusFlag.initializing)
               ) {
                  $$(ids.component).showBatch("wait");
                  return;
               }
            }

            var isValid = this.__filterComponent.isValid(currData);
            if (isValid) {
               // if (isValid && currData) {
               $$(ids.component).showBatch("if");
            } else {
               $$(ids.component).showBatch("else");
            }
         }
      };

      return {
         ui: _ui,
         init: _init,
         logic: _logic,

         onShow: baseComp.onShow
      };
   }

   populateFilterComponent() {
      let dc = this.datacollection;
      if (dc && dc.datasource)
         this.__filterComponent.fieldsLoad(dc.datasource.fields());
      else this.__filterComponent.fieldsLoad([]);

      this.__filterComponent.setValue(
         this.settings.filterConditions ||
            ABViewPropertyDefaults.filterConditions
      );
   }

   save() {
      // Because conditional container has always IF and ELSE containers, then it should be include them to call save too
      let includeSubViews = true;

      return super.save(includeSubViews);
   }
};

