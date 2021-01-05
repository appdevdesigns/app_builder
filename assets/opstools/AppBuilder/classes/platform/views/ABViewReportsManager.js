const ABViewReportsManagerCore = require("../../core/views/ABViewReportsManagerCore");

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABViewReportsManager extends ABViewReportsManagerCore {
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
      let idBase = "ABViewReportsManagerEditorComponent";
      let ids = {
         component: App.unique(idBase + "_component")
      };

      let component = this.component(App);

      component.ui.id = ids.component;

      component.init = (options) => {};

      return component;
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

      return commonUI.concat([]);
   }

   static propertyEditorPopulate(App, ids, view) {
      super.propertyEditorPopulate(App, ids, view);
   }

   static propertyEditorValues(ids, view) {
      super.propertyEditorValues(ids, view);

      view.settings.dataviewID = $$(ids.datacollection).getValue();
   }

   /*
    * @component()
    * return a UI component based upon this view.
    * @param {obj} App
    * @return {obj} UI component
    */
   component(App) {
      let baseCom = super.component(App);

      let idBase = "ABViewReportManager_" + this.id;
      let ids = {
         component: App.unique(idBase + "_component")
      };

      let compInstance = this;

      let _ui = {
         id: ids.component,
         view: "reports",
         toolbar: true,
         override: new Map([
            [
               reports.services.Backend,
               class MyBackend extends reports.services.Backend {
                  getModules() {
                     return webix.promise.resolve(
                        compInstance.settings.moduleList || []
                     );
                  }
                  saveModule(id, data) {
                     id = id || webix.uid();
                     compInstance.settings.moduleList =
                        compInstance.settings.moduleList || [];

                     let indexOfModule = null;
                     let module = compInstance.settings.moduleList.filter(
                        (m, index) => {
                           let isExists = m.id == id;
                           if (isExists) indexOfModule = index;

                           return isExists;
                        }
                     )[0];

                     // Update
                     if (module) {
                        compInstance.settings.moduleList[indexOfModule] = data;
                     }
                     // Add
                     else {
                        compInstance.settings.moduleList.push(data);
                     }

                     return new Promise((resolve, reject) => {
                        compInstance
                           .save()
                           .catch(reject)
                           .then(() => {
                              resolve({ id: id });
                           });
                     });
                  }
                  deleteModule(id) {
                     compInstance.settings.moduleList =
                        compInstance.settings.moduleList || [];

                     compInstance.settings.moduleList = compInstance.settings.moduleList.filter(
                        (m) => m.id != id
                     );

                     return new Promise((resolve, reject) => {
                        compInstance
                           .save()
                           .catch(reject)
                           .then(() => {
                              resolve({ id: id });
                           });
                     });
                  }

                  getModels() {
                     let reportModels = {};

                     (compInstance.application.datacollections() || []).forEach(
                        (dc) => {
                           let obj = dc.datasource;
                           if (!obj) return;

                           let reportFields = obj.fields().map((f) => {
                              return {
                                 id: f.columnName,
                                 name: f.label,
                                 filter: true,
                                 edit: false,
                                 // type: "number", // TODO
                                 type: "text",
                                 ref: "",
                                 key: false,
                                 show: true
                              };
                           });
                           reportModels[dc.id] = {
                              id: dc.id,
                              name: dc.label,
                              data: reportFields,
                              refs: []
                           };
                        }
                     );

                     return webix.promise.resolve(reportModels);
                  }

                  getQueries() {
                     return webix.promise.resolve(
                        compInstance.settings.queryList || []
                     );
                  }
                  saveQuery(id, data) {
                     id = id || webix.uid();
                     compInstance.settings.queryList =
                        compInstance.settings.queryList || [];

                     let indexOfQuery = null;
                     let query = compInstance.settings.queryList.filter(
                        (m, index) => {
                           let isExists = m.id == id;
                           if (isExists) indexOfQuery = index;

                           return isExists;
                        }
                     )[0];

                     // Update
                     if (query) {
                        compInstance.settings.queryList[indexOfQuery] = data;
                     }
                     // Add
                     else {
                        compInstance.settings.queryList.push(data);
                     }

                     return new Promise((resolve, reject) => {
                        compInstance
                           .save()
                           .catch(reject)
                           .then(() => {
                              resolve({ id: id });
                           });
                     });
                  }
                  deleteQuery(id) {
                     compInstance.settings.queryList =
                        compInstance.settings.queryList || [];

                     compInstance.settings.queryList = compInstance.settings.queryList.filter(
                        (m) => m.id != id
                     );

                     return new Promise((resolve, reject) => {
                        compInstance
                           .save()
                           .catch(reject)
                           .then(() => {
                              resolve({ id: id });
                           });
                     });
                  }

                  getData(config) {
                     let dc = compInstance.application.datacollections(
                        (dcItem) => dcItem.id == config.data
                     )[0];
                     if (!dc) return webix.promise.resolve([]);

                     let data = dc.getData();
                     (data || []).forEach((row) => {
                        (config.columns || []).forEach((col) => {
                           let columnName = col.split(".")[1]; // DC_ID.columnName format
                           row[col] = row[columnName];
                        });
                     });

                     return webix.promise.resolve(data || []);
                  }
                  getOptions(fields) {
                     // TODO
                     // [
                     //    {"id":"1","value":"South"},
                     //    {"id":"2","value":"North"},
                     //    // other options
                     //  ]
                     return webix.promise.resolve([]);
                  }
                  getFieldData(fieldId) {
                     // TODO
                     return webix.promise.resolve([]);
                  }
               }
            ]
         ])
      };

      // make sure each of our child views get .init() called
      let _init = (options) => {
         options = options || {};
         options.componentId = options.componentId || ids.component;

         return Promise.resolve();
      };

      return {
         ui: _ui,
         init: _init,

         onShow: baseCom.onShow
      };
   }
};
