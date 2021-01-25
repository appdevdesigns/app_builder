const ABViewGanttCore = require("../../core/views/ABViewGanttCore");
const ABGanttWorkspace = require("../../../components/ab_work_object_workspace_gantt.js");
const ABGanttProperty = require("../workspaceViews/ABObjectWorkspaceViewGantt.js");

const ABViewGanttPropertyComponentDefaults = ABViewGanttCore.defaultValues();

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABViewGantt extends ABViewGanttCore {
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
      return this.component(App);
   }

   //
   // Property Editor
   //

   // static propertyEditorComponent(App) {
   // 	return ABViewPropertyComponent.component(App);
   // }

   static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {
      let commonUI = super.propertyEditorDefaultElements(
         App,
         ids,
         _logic,
         ObjectDefaults
      );

      this._ganttProperty = ABGanttProperty.component(App, "ab_widget_gantt");

      // in addition to the common .label  values, we
      // ask for:
      return commonUI.concat([
         {
            view: "fieldset",
            label: L("ab.component.label.dataSource", "*Gantt Data:"),
            labelWidth: App.config.labelWidthLarge,
            body: {
               type: "clean",
               padding: 10,
               rows: [
                  {
                     view: "select",
                     name: "datacollection",
                     label: L("ab.component.label.dataSource", "*Object:"),
                     labelWidth: App.config.labelWidthLarge,
                     on: {
                        onChange: (newv, oldv) => {
                           if (newv == oldv) return;
                        }
                     }
                  }
               ]
            }
         },
         {
            view: "fieldset",
            label: L("ab.component.label.ganttFields", "*Gantt Fields:"),
            labelWidth: App.config.labelWidthLarge,
            body: {
               view: "form",
               name: "fields",
               borderless: true,
               elements: this._ganttProperty.elements().rows
            }
         }
      ]);
   }

   static propertyEditorPopulate(App, ids, view) {
      super.propertyEditorPopulate(App, ids, view);

      $$(ids.datacollection).define("options", view.propertyDatacollections());
      $$(ids.datacollection).refresh();
      $$(ids.datacollection).setValue(view.settings.dataviewID || "");

      let dc = view.datacollection;
      if (dc && dc.datasource) {
         this._ganttProperty.init(dc.datasource);
      }
   }

   static propertyEditorValues(ids, view) {
      super.propertyEditorValues(ids, view);

      view.settings.dataviewID =
         $$(ids.datacollection).getValue() ||
         ABViewGanttPropertyComponentDefaults.dataviewID;

      let dc = view.datacollection;
      if (dc && dc.datasource) {
         this._ganttProperty.init(dc.datasource);
      }

      let fieldIds = $$(ids.fields).getValues() || {};

      view.settings.startDateFieldID =
         fieldIds.startDate ||
         ABViewGanttPropertyComponentDefaults.startDateFieldID;
      view.settings.endDateFieldID =
         fieldIds.endDate ||
         ABViewGanttPropertyComponentDefaults.endDateFieldID;
      view.settings.durationFieldID =
         fieldIds.duration ||
         ABViewGanttPropertyComponentDefaults.durationFieldID;
      view.settings.progressFieldID =
         fieldIds.progress ||
         ABViewGanttPropertyComponentDefaults.progressFieldID;
      view.settings.notesFieldID =
         fieldIds.notes || ABViewGanttPropertyComponentDefaults.notesFieldID;
   }

   /*
    * @component()
    * return a UI component based upon this view.
    * @param {obj} App
    * @return {obj} UI component
    */
   component(App) {
      let idBase = "ABViewGantt_" + this.id;
      let ids = {
         component: App.unique(idBase + "_component")
      };

      let ganttView = new ABGanttWorkspace(App, idBase);

      // make sure each of our child views get .init() called
      let _init = (options) => {
         let dc = this.datacollection;
         if (!dc) return;

         let obj = dc.datasource;
         if (!obj) return;

         ganttView.objectLoad(obj);
         ganttView.datacollectionLoad(dc);

         ganttView.setFields({
            startDateField: obj.fields(
               (f) => f.id == this.settings.startDateFieldID
            )[0],

            endDateField: obj.fields(
               (f) => f.id == this.settings.endDateFieldID
            )[0],

            durationField: obj.fields(
               (f) => f.id == this.settings.durationFieldID
            )[0],

            progressField: obj.fields(
               (f) => f.id == this.settings.progressFieldID
            )[0],

            notesField: obj.fields((f) => f.id == this.settings.notesFieldID)[0]
         });
      };

      return {
         ui: ganttView.ui,
         init: _init
      };
   }
};
