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

                           let reportFields = _logic.getReportFields(dc);

                           // get connected data collections
                           // let linkedFields = [];
                           // (obj.connectFields() || []).forEach((f, index) => {
                           //    let connectedDcs = compInstance.application.datacollections(
                           //       (dColl) =>
                           //          dColl &&
                           //          dColl.datasource &&
                           //          dColl.datasource.id == f.settings.linkObject
                           //    );
                           //    (connectedDcs || []).forEach((linkedDc) => {
                           //       linkedFields.push({
                           //          id: index + 1,
                           //          name: linkedDc.label,
                           //          source: dc.id,
                           //          target: linkedDc.id
                           //       });
                           //    });
                           // });

                           // // MOCK UP for testing
                           // let linkedFields = [
                           //    {
                           //       id: "id",
                           //       name: "id",
                           //       source: "39378ee0-38f0-4b9d-a5aa-dddc61137fcd", // Player
                           //       target: "0de82362-4ab5-4f0f-8cfa-d1288d173cba" // Team
                           //    }
                           // ];

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
                     let result = [];
                     let pullDataTasks = [];
                     let dcInfos = [];
                     let dcData = {};

                     // add load data of the base dc task
                     dcInfos.push({
                        datacollectionId: config.data,
                        filter: config.query,
                        sort: config.sort
                     });

                     // add load data of the joined dc task
                     (config.joins || []).forEach((j) => {
                        dcInfos.push({
                           datacollectionId: j.sid
                        });
                        dcInfos.push({
                           datacollectionId: j.tid
                        });
                     });

                     dcInfos = _.uniqBy(dcInfos, "datacollectionId");
                     dcInfos.forEach((dcInfo) => {
                        pullDataTasks.push(
                           new Promise((next, bad) => {
                              _logic
                                 .getData({
                                    datacollectionId: dcInfo.datacollectionId,
                                    filter: dcInfo.filter,
                                    sort: dcInfo.sort
                                 })
                                 .catch(bad)
                                 .then((data) => {
                                    dcData[dcInfo.datacollectionId] =
                                       data || [];
                                    next();
                                 });
                           })
                        );
                     });

                     return Promise.resolve()
                        .then(() => Promise.all(pullDataTasks))
                        .then(
                           () =>
                              new Promise((next, bad) => {
                                 // no join settings
                                 if (!config.joins || !config.joins.length) {
                                    result = dcData[config.data] || [];
                                    return next();
                                 }

                                 (config.joins || []).forEach((j) => {
                                    let sourceDc = compInstance.application.datacollections(
                                       (dc) => dc.id == j.sid
                                    )[0];
                                    if (!sourceDc) return;

                                    let sourceObj = sourceDc.datasource;
                                    if (!sourceObj) return;

                                    let targetDc = compInstance.application.datacollections(
                                       (dc) => dc.id == j.tid
                                    )[0];
                                    if (!targetDc) return;

                                    let targetObj = targetDc.datasource;
                                    if (!targetObj) return;

                                    let sourceLinkField = sourceObj.fields(
                                       (f) => f.id == j.sf
                                    )[0];
                                    let targetLinkField = targetObj.fields(
                                       (f) => f.id == j.tf
                                    )[0];
                                    if (!sourceLinkField && !targetLinkField)
                                       return;

                                    let sourceData = dcData[j.sid] || [];
                                    let targetData = dcData[j.tid] || [];
                                    sourceData.forEach((sData) => {
                                       targetData.forEach((tData) => {
                                          let sVal =
                                             sData[
                                                sourceLinkField
                                                   ? `${j.sid}.${sourceLinkField.columnName}.id`
                                                   : `${j.sid}.id`
                                             ] || [];

                                          let tVal =
                                             tData[
                                                targetLinkField
                                                   ? `${j.tid}.${targetLinkField.columnName}.id`
                                                   : `${j.tid}.id`
                                             ] || [];

                                          if (!Array.isArray(sVal))
                                             sVal = [sVal];
                                          if (!Array.isArray(tVal))
                                             tVal = [tVal];

                                          // Add joined row to the result array
                                          let matchedVal = sVal.filter(
                                             (val) => tVal.indexOf(val) > -1
                                          );
                                          if (matchedVal && matchedVal.length) {
                                             result.push(
                                                _.extend(sData, tData)
                                             );
                                          }
                                       });
                                    });

                                    // replace joined array to source dc
                                    dcData[j.sid] = result;
                                 });

                                 // remove id
                                 (result || []).forEach((r) => {
                                    Object.keys(r).forEach((prop) => {
                                       if (prop.indexOf(".id") > -1)
                                          delete r[prop];
                                    });
                                    delete r.id;
                                 });

                                 next();
                              })
                        )
                        .then(() => Promise.resolve(result));
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

      let _logic = {
         getReportFields: (dc) => {
            if (!dc) return [];

            let object = dc.datasource;
            if (!object) return [];

            let fields = [];

            object.fields().forEach((f) => {
               let columnFormat = f.columnHeader();

               fields.push({
                  id: f.columnName,
                  name: f.label,
                  filter: f.fieldIsFilterable(),
                  edit: false,
                  type: columnFormat.editor || "text",
                  format: columnFormat.format,
                  options: columnFormat.options,
                  ref: "",
                  key: false,
                  show: true
               });

               if (f.key == "connectObject" && f.settings.isSource) {
                  let linkedDcs = compInstance.application.datacollections(
                     (dc) =>
                        dc &&
                        dc.datasource &&
                        dc.datasource.id == f.settings.linkObject
                  );
                  (linkedDcs || []).forEach((linkDc) => {
                     fields.push({
                        id: f.id,
                        name: f.label,
                        filter: false,
                        edit: false,
                        type: "reference",
                        ref: linkDc.id,
                        key: false,
                        show: false
                     });
                  });
               }
            });

            return fields;
         },

         getData: ({ datacollectionId, filter, sort }) => {
            let datacollection = compInstance.application.datacollections(
               (dcItem) => dcItem.id == datacollectionId
            )[0];
            if (!datacollection) return Promise.resolve([]);

            let object = datacollection.datasource;
            if (!object) return Promise.resolve([]);

            return Promise.resolve()
               .then(
                  () =>
                     new Promise((next, bad) => {
                        if (
                           datacollection.dataStatus ==
                           datacollection.dataStatusFlag.notInitial
                        ) {
                           datacollection
                              .loadData()
                              .catch(bad)
                              .then(() => next());
                        } else {
                           next();
                        }
                     })
               )
               .then(
                  () =>
                     new Promise((next, bad) => {
                        let reportFields = _logic.getReportFields(
                           datacollection
                        );

                        let reportData = [];
                        let rawData = datacollection.getData();
                        (rawData || []).forEach((row) => {
                           let reportRow = { id: row.id };
                           reportRow[`${datacollection.id}.id`] = row.id;

                           object.fields().forEach((field) => {
                              let columnName = field.columnName;
                              let col = `${datacollection.id}.${columnName}`;

                              reportRow[col] = field
                                 ? field.format(row)
                                 : row[columnName];

                              // FK value of the connect field
                              if (field && field.key == "connectObject") {
                                 if (Array.isArray(row[columnName])) {
                                    reportRow[`${col}.id`] = row[
                                       columnName
                                    ].map(
                                       (link) =>
                                          link[field.datasourceLink.PK()] ||
                                          link.id ||
                                          link
                                    );
                                 } else if (row[columnName]) {
                                    reportRow[`${col}.id`] =
                                       row[columnName][
                                          field.datasourceLink.PK()
                                       ] ||
                                       row[columnName].id ||
                                       row[columnName];
                                 }
                              }

                              let rField = reportFields.filter(
                                 (f) => f.id == columnName
                              )[0];
                              if (!rField) return;

                              switch (rField.type) {
                                 case "text":
                                 case "reference":
                                    reportRow[col] = (
                                       reportRow[col] || ""
                                    ).toString();
                                    break;
                                 case "number":
                                    reportRow[col] = parseFloat(
                                       reportRow[col] || 0
                                    );
                                    break;
                              }
                           });
                           reportData.push(reportRow);
                        });

                        // create a new query widget to get the filter function
                        reportFields = reportFields.map((f) => {
                           // change format of id to match the report widget
                           f.id = `${datacollection.id}.${f.id}`; // dc_id.field_id
                           return f;
                        });
                        let filterElem = webix.ui({
                           view: "query",
                           fields: reportFields,
                           value: JSON.parse(filter || "{}")
                        });

                        // create a new data collection and apply the query filter
                        let tempDc = new webix.DataCollection();
                        tempDc.parse(reportData);

                        // filter
                        let filterFn;
                        try {
                           filterFn = filterElem.getFilterFunction();
                        } catch (error) {}
                        if (filterFn) tempDc.filter(filterFn);

                        // sorting
                        (sort || []).forEach((sort) => {
                           if (sort.id)
                              tempDc.sort({
                                 as: "string",
                                 dir: sort.mod || "asc",
                                 by: `#${sort.id}#`
                              });
                        });

                        let result = tempDc.serialize();

                        // clear
                        filterElem.destructor();
                        tempDc.destructor();

                        return next(result);
                     })
               );
         }
      };

      return {
         ui: _ui,
         init: _init,
         logic: _logic,

         onShow: baseCom.onShow
      };
   }
};
