const ABViewListCore = require("../../core/views/ABViewListCore");

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABViewList extends ABViewListCore {
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
      var idBase = "ABViewListEditorComponent";

      var ListView = this.component(App, idBase);

      return {
         ui: ListView.ui,
         logic: ListView.logic,
         onShow: ListView.onShow,

         init: () => {
            // remove id of the component in caching for refresh .bind of the data collection
            let dv = this.datacollection;
            if (dv) dv.removeComponent(ListView.ui.id);

            ListView.init();
         }
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

      // _logic functions

      _logic.selectSource = (dcId, oldDcId) => {
         var currView = _logic.currentEditObject();

         // Update field options in property
         this.propertyUpdateFieldOptions(ids, currView, dcId);
      };

      return commonUI.concat([
         {
            name: "datacollection",
            view: "richselect",
            label: L("ab.components.list.dataSource", "*Data Source"),
            labelWidth: App.config.labelWidthLarge,
            on: {
               onChange: _logic.selectSource
            }
         },
         {
            name: "field",
            view: "richselect",
            label: L("ab.components.list.field", "*Field"),
            labelWidth: App.config.labelWidthLarge
         },
         {
            view: "counter",
            name: "height",
            label: L("ab.component.list.height", "*Height:"),
            labelWidth: App.config.labelWidthLarge
         }
      ]);
   }

   /**
    * @method propertyUpdateFieldOptions
    * Populate fields of object to select list in property
    *
    * @param {Object} ids
    * @param {ABViewForm} view - the current component
    * @param {string} dvId - id of ABDatacollection
    */
   static propertyUpdateFieldOptions(ids, view, dvId) {
      var datacollection = view.application.datacollections(
         (dc) => dc.id == dvId
      )[0];
      var object = datacollection ? datacollection.datasource : null;

      // Pull field list
      var fieldOptions = [];
      if (object != null) {
         fieldOptions = object.fields().map((f) => {
            return {
               id: f.id,
               value: f.label
            };
         });
      }

      $$(ids.field).define("options", fieldOptions);
      $$(ids.field).refresh();
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

      this.propertyUpdateFieldOptions(ids, view, datacollectionId);

      $$(ids.field).setValue(view.settings.field);
      $$(ids.height).setValue(view.settings.height);
   }

   static propertyEditorValues(ids, view) {
      super.propertyEditorValues(ids, view);

      view.settings.dataviewID = $$(ids.datacollection).getValue();
      view.settings.field = $$(ids.field).getValue();
      view.settings.height = $$(ids.height).getValue();
      view.settings.height =
         parseInt(view.settings.height) || ABViewList.defaultValues().height;
   }

   /*
    * @component()
    * return a UI component based upon this view.
    * @param {obj} App
    * @return {obj} UI component
    */
   component(App) {
      let baseCom = super.component(App);

      var idBase = "ABViewListEditorComponent";
      var ids = {
         component: App.unique(idBase + "_component")
      };

      var _ui = {
         id: ids.component,
         view: "dataview",
         type: {
            width: 1000,
            height: 30
         },
         template: (item) => {
            var field = this.field();
            if (!field) return "";

            return field.format(item);
         }
      };

      // set height or autoHeight
      if (this.settings.height != 0) {
         _ui.height = this.settings.height;
      } else {
         _ui.autoHeight = true;
      }

      var _init = (options) => {
         var dv = this.datacollection;
         if (!dv) return;

         // bind dc to component
         dv.bind($$(ids.component));
         // $$(ids.component).sync(dv);
      };

      // var _logic = {
      // }

      return {
         ui: _ui,
         init: _init,

         onShow: baseCom.onShow
      };
   }
};
