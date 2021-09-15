const ABComponent = require("../classes/platform/ABComponent");
const ABPopupSortField = require("./ab_work_object_workspace_popupSortFields");
const ABViewTab = require("../classes/platform/views/ABViewTab");
const ABViewDetail = require("../classes/platform/views/ABViewDetail");
const RowFilter = require("../classes/platform/RowFilter");

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

module.exports = class AB_Work_Datacollection_Workspace_Properties extends ABComponent {
   constructor(App) {
      super(App, "ab_work_dataview_workspace_properties");

      this.App = App;

      this.labels = {
         common: App.labels,
         component: {
            properties: L("ab.datacollection.properties", "*Properties")
         }
      };

      this.ids = {
         propertyPanel: this.unique("propertyPanel"),

         dataSource: this.unique("dataSource"),
         linkDatacollection: this.unique("linkDatacollection"),
         linkField: this.unique("linkField"),
         loadAll: this.unique("loadAll"),
         fixSelect: this.unique("fixSelect"),

         filterPanel: this.unique("filterPanel"),
         preventPopulate: this.unique("preventPopulate"),
         sortPanel: this.unique("sortPanel"),

         buttonFilter: this.unique("buttonFilter"),
         buttonSort: this.unique("buttonSort"),

         list: this.unique("list")
      };

      this.callbacks = {
         onSave: function(datacollection) {}
      };

      //
      // Define our external interface methods:
      //
      this.applicationLoad = this._logic.applicationLoad;
      this.datacollectionLoad = this._logic.datacollectionLoad;

      /*
       * _templateListItem
       *
       * The Object Row template definition.
       */
      this._templateListItem = [
         "<div class='ab-page-list-item'>",
         "{common.icon()} <span class='webix_icon fa fa-#typeIcon#'></span> #label# #hasDataCollection#",
         "</div>"
      ].join("");

      this.viewList = null;
   }

   get ui() {
      let App = this.App;
      let ids = this.ids;
      let instance = this;

      return {
         width: App.config.columnWidthXLarge,
         rows: [
            {
               view: "toolbar",
               css: "ab-data-toolbar webix_dark",
               cols: [
                  { view: "spacer", width: 10 },
                  {
                     view: "label",
                     label: this.labels.component.properties
                  }
               ]
            },
            {
               view: "scrollview",
               id: ids.propertyPanel,
               body: {
                  padding: 15,
                  rows: [
                     {
                        view: "fieldset",
                        label: L(
                           "ab.component.datacollection.dataSource",
                           "*Data Source:"
                        ),
                        labelWidth: App.config.labelWidthLarge,
                        body: {
                           type: "clean",
                           padding: 10,
                           rows: [
                              {
                                 id: ids.dataSource,
                                 view: "richselect",
                                 name: "dataSource",
                                 label: L(
                                    "ab.component.datacollection.source",
                                    "*Source:"
                                 ),
                                 labelWidth: App.config.labelWidthLarge,
                                 options: {
                                    data: []
                                 },
                                 on: {
                                    onChange: (newv, oldv) => {
                                       if (newv == oldv) return;

                                       this._logic.selectSource(newv, oldv);
                                    }
                                 }
                              },
                              // link to another data collection
                              {
                                 id: ids.linkDatacollection,
                                 view: "select",
                                 name: "linkDatacollection",
                                 label: L(
                                    "ab.component.datacollection.linkDatacollection",
                                    "*Linked To:"
                                 ),
                                 labelWidth: App.config.labelWidthLarge,
                                 options: [],
                                 hidden: 1,
                                 on: {
                                    onChange: (linkedDvId, oldv) => {
                                       this._logic.initLinkFieldOptions(
                                          linkedDvId
                                       );
                                       this._logic.save();
                                    }
                                 }
                              },
                              {
                                 id: ids.linkField,
                                 view: "select",
                                 name: "linkField",
                                 label: L(
                                    "ab.component.datacollection.linkedField",
                                    "*Linked Field:"
                                 ),
                                 labelWidth: App.config.labelWidthLarge,
                                 options: [],
                                 hidden: 1,
                                 on: {
                                    onChange: (newv, oldv) => {
                                       this._logic.save();
                                    }
                                 }
                              }
                           ]
                        }
                     },
                     {
                        view: "fieldset",
                        label: L(
                           "ab.component.datacollection.advancedOptions",
                           "*Advanced Options:"
                        ),
                        labelWidth: App.config.labelWidthLarge,
                        body: {
                           type: "clean",
                           padding: 10,
                           rows: [
                              {
                                 id: ids.filterPanel,
                                 name: "filterPanel",
                                 cols: [
                                    {
                                       view: "label",
                                       label: L(
                                          "ab.component.datacollection.filterData",
                                          "*Filter Data:"
                                       ),
                                       width: App.config.labelWidthLarge
                                    },
                                    {
                                       id: ids.buttonFilter,
                                       css: "webix_primary",
                                       view: "button",
                                       name: "buttonFilter",
                                       label: L(
                                          "ab.component.datacollection.settings",
                                          "*Settings"
                                       ),
                                       icon: "fa fa-gear",
                                       type: "icon",
                                       badge: 0,
                                       click: function() {
                                          instance._logic.showFilterPopup(
                                             this.$view
                                          );
                                       }
                                    }
                                 ]
                              },
                              {
                                 id: ids.sortPanel,
                                 name: "sortPanel",
                                 cols: [
                                    {
                                       view: "label",
                                       label: L(
                                          "ab.component.datacollection.sortData",
                                          "*Sort Data:"
                                       ),
                                       width: App.config.labelWidthLarge
                                    },
                                    {
                                       id: ids.buttonSort,
                                       css: "webix_primary",
                                       view: "button",
                                       name: "buttonSort",
                                       label: L(
                                          "ab.component.datacollection.settings",
                                          "*Settings"
                                       ),
                                       icon: "fa fa-gear",
                                       type: "icon",
                                       badge: 0,
                                       click: function() {
                                          instance._logic.showSortPopup(
                                             this.$view
                                          );
                                       }
                                    }
                                 ]
                              },
                              {
                                 cols: [
                                    {
                                       view: "label",
                                       label: L(
                                          "ab.component.datacollection.loadAll",
                                          "*Load all:"
                                       ),
                                       width: App.config.labelWidthLarge
                                    },
                                    {
                                       id: ids.loadAll,
                                       view: "checkbox",
                                       name: "loadAll",
                                       label: "",
                                       on: {
                                          onChange: (newv, oldv) => {
                                             this._logic.save();
                                          }
                                       }
                                    }
                                 ]
                              },
                              {
                                 id: ids.preventPopulate,
                                 view: "checkbox",
                                 name: "preventPopulate",
                                 label: L(
                                    "ab.component.datacollection.preventPopulate",
                                    "*Do not populate related data:"
                                 ),
                                 labelWidth: 210,
                                 on: {
                                    onChange: (newv, oldv) => {
                                       this._logic.save();
                                    }
                                 }
                              },
                              {
                                 id: ids.fixSelect,
                                 view: "select",
                                 name: "fixSelect",
                                 label: L(
                                    "ab.component.datacollection.fixSelect",
                                    "*Select:"
                                 ),
                                 labelWidth: App.config.labelWidthLarge,
                                 options: [],
                                 on: {
                                    onChange: (newv, oldv) => {
                                       this._logic.save();
                                    }
                                 }
                              }
                           ]
                        }
                     },
                     {
                        view: "fieldset",
                        label: L(
                           "ab.component.datacollection.dataUsed",
                           "*Data used in..."
                        ),
                        labelWidth: App.config.labelWidthLarge,
                        body: {
                           view: App.custom.edittree.view, // "edittree",
                           id: ids.list,
                           select: true,
                           editaction: "custom",
                           editable: true,
                           editor: "text",
                           editValue: "label",
                           borderless: true,
                           padding: 0,
                           css: "ab-tree-ui",
                           minHeight: 300,
                           template: (obj, common) => {
                              return this._logic.templateListItem(obj, common);
                           },
                           type: {
                              iconGear:
                                 "<span class='webix_icon fa fa-cog'></span>"
                           },
                           on: {
                              onAfterSelect: (id) => {
                                 this._logic.onAfterSelect(id);
                              }
                           }
                        }
                     },
                     {
                        maxHeight: App.config.mediumSpacer,
                        height: App.config.mediumSpacer,
                        minHeight: App.config.mediumSpacer,
                        hidden: App.config.hideMobile
                     }
                  ]
               }
            }
         ]
      };
   }

   init(options) {
      options = options || {};

      // register our callbacks:
      for (var c in this.callbacks) {
         this.callbacks[c] = options[c] || this.callbacks[c];
      }

      if ($$(this.ids.list)) {
         webix.extend($$(this.ids.list), webix.ProgressBar);
         $$(this.ids.list).adjust();
      }

      if ($$(this.ids.propertyPanel))
         webix.extend($$(this.ids.propertyPanel), webix.ProgressBar);

      this._logic.initPopupEditors();
   }

   get _logic() {
      return {
         /**
          * @function onAfterSelect()
          *
          * Perform these actions when a View is selected in the List.
          */
         onAfterSelect: (id) => {
            var view = $$(this.ids.list).getItem(id);
            var viewObj = this._application.views((v) => v.id == view.id)[0];
            setTimeout(() => {
               this.App.actions.tabSwitch("interface");
               this.App.actions.populateInterfaceWorkspace(viewObj);
            }, 50);
         },

         applicationLoad: (application) => {
            this._application = application;

            let ids = this.ids;

            this._logic.refreshDataSourceOptions();

            if (this.FilterComponent) {
               this.FilterComponent.applicationLoad(this._application);
            } else {
               console.error(
                  ".applicationLoad() called before .initPopupEditors"
               );
            }

            this._logic.listBusy();

            // this so it looks right/indented in a tree view:
            this.viewList = new webix.TreeCollection();

            /**
             * @method addPage
             *
             * @param {ABView} page
             * @param {integer} index
             * @param {uuid} parentId
             */
            var addPage = (page, index, parentId) => {
               // add to tree collection
               var branch = {
                  id: page.viewId || page.id,
                  label: page.label,
                  icon: page.icon ? page.icon : "",
                  viewIcon: page.viewIcon ? page.viewIcon() : "",
                  datacollection: {
                     id: page.datacollection ? page.datacollection.id : ""
                  }
               };
               this.viewList.add(branch, index, parentId);

               // add sub-pages
               if (page instanceof ABViewDetail) {
                  return;
               }

               var subPages = page.pages ? page.pages() : [];
               subPages.forEach((childPage, childIndex) => {
                  addPage(childPage, childIndex, page.id);
               });

               // add non-tab components
               page
                  .views((v) => !(v instanceof ABViewTab))
                  .forEach((widgetView, widgetIndex) => {
                     var wIndex = subPages.length + widgetIndex;
                     addPage(widgetView, wIndex, page.id);
                  });

               // add tabs
               page
                  .views((v) => v instanceof ABViewTab)
                  .forEach((tab, tabIndex) => {
                     // tab views
                     tab.views().forEach((tabView, tabViewIndex) => {
                        // tab items will be below sub-page items
                        var tIndex = subPages.length + tabIndex + tabViewIndex;

                        addPage(tabView, tIndex, page.id);
                     });
                  });
            };
            this._application.pages().forEach((p, index) => {
               addPage(p, index);
            });

            // clear our list and display our objects:
            var List = $$(ids.list);
            List.clearAll();
            // List.data.unsync();
            // List.data.sync(this.viewList);
            // List.refresh();
            List.parse(this.viewList);
            List.unselectAll();

            this._logic.listReady();
         },

         datacollectionLoad: (datacollection) => {
            let ids = this.ids;

            this._datacollection = datacollection;

            let settings = {};

            if (datacollection) {
               settings = datacollection.settings || {};
            }

            // populate link data collection options
            this._logic.initLinkDatacollectionOptions();

            // populate link fields
            this._logic.initLinkFieldOptions();

            // initial populate of popups
            this._logic.populatePopupEditors();

            this._logic.populateBadgeNumber();

            // populate data items to fix select options
            this._logic.populateFixSelector();
            if (datacollection) {
               datacollection.removeListener(
                  "loadData",
                  this._logic.populateFixSelector
               );
               datacollection.on("loadData", this._logic.populateFixSelector);
            }

            // // if selected soruce is a query, then hide advanced options UI
            // if (settings.isQuery) {
            // 	$$(ids.filterPanel).hide();
            // 	$$(ids.sortPanel).hide();
            // }
            // else {
            // 	$$(ids.filterPanel).show();
            // 	$$(ids.sortPanel).show();
            // }

            this._logic.refreshDataSourceOptions();
            $$(ids.dataSource).define("value", settings.datasourceID);
            $$(ids.linkDatacollection).define(
               "value",
               settings.linkDatacollectionID
            );
            $$(ids.linkField).define("value", settings.linkFieldID);
            $$(ids.loadAll).define("value", settings.loadAll);
            $$(ids.fixSelect).define("value", settings.fixSelect);
            $$(ids.preventPopulate).define("value", settings.preventPopulate);

            $$(ids.dataSource).refresh();
            $$(ids.linkDatacollection).refresh();
            $$(ids.linkField).refresh();
            $$(ids.loadAll).refresh();
            $$(ids.preventPopulate).refresh();
            $$(ids.fixSelect).refresh();
            $$(ids.list).openAll();
         },

         refreshDataSourceOptions: () => {
            if (!this._application) return;

            let ids = this.ids;
            let datasources = [];

            // Objects
            var objects = this._application.objects().map((obj) => {
               return {
                  id: obj.id,
                  value: obj.label,
                  isQuery: false,
                  icon: "fa fa-database"
               };
            });
            datasources = datasources.concat(objects);

            // Queries
            var queries = this._application.queries().map((q) => {
               return {
                  id: q.id,
                  value: q.label,
                  isQuery: true,
                  icon: "fa fa-filter",
                  disabled: q.isDisabled()
               };
            });
            datasources = datasources.concat(queries);

            datasources.unshift({
               id: "",
               value: L("ab.datacollection.selectSource", "*Select a source")
            });

            $$(ids.dataSource).define("options", {
               body: {
                  scheme: {
                     $init: function(obj) {
                        if (obj.disabled) obj.$css = "disabled";
                     }
                  },
                  data: datasources
               }
            });

            $$(ids.dataSource).refresh();
         },

         busy: () => {
            let $propertyPanel = $$(this.ids.propertyPanel);
            if ($propertyPanel && $propertyPanel.showProgress)
               $propertyPanel.showProgress({ type: "icon" });
         },

         ready: () => {
            let $propertyPanel = $$(this.ids.propertyPanel);
            if ($propertyPanel && $propertyPanel.hideProgress)
               $propertyPanel.hideProgress();
         },

         save: () => {
            if (!this._datacollection) return Promise.resolve(); // TODO: refactor in v2

            this._logic.busy();

            let ids = this.ids;

            this._datacollection.settings = this._datacollection.settings || {};
            this._datacollection.settings.datasourceID = $$(
               ids.dataSource
            ).getValue();
            this._datacollection.settings.linkDatacollectionID = $$(
               ids.linkDatacollection
            ).getValue();
            this._datacollection.settings.linkFieldID = $$(
               ids.linkField
            ).getValue();
            this._datacollection.settings.objectWorkspace = {};
            this._datacollection.settings.objectWorkspace.filterConditions = this.FilterComponent.getValue();
            this._datacollection.settings.objectWorkspace.sortFields = this.PopupSortFieldComponent.getValue();
            this._datacollection.settings.loadAll = $$(ids.loadAll).getValue();
            this._datacollection.settings.preventPopulate = $$(
               ids.preventPopulate
            ).getValue();
            this._datacollection.settings.fixSelect = $$(
               ids.fixSelect
            ).getValue();

            let selectedDS = $$(ids.dataSource)
               .getPopup()
               .getList()
               .getItem(this._datacollection.settings.datasourceID);
            if (selectedDS)
               this._datacollection.settings.isQuery = selectedDS.isQuery;
            else this._datacollection.settings.isQuery = false;

            return new Promise((resolve, reject) => {
               this._datacollection
                  .save()
                  .catch((err) => {
                     this._logic.ready();
                     reject(err);
                  })
                  .then(() => {
                     this._datacollection.clearAll();

                     this._logic.ready();

                     this.callbacks.onSave(this._datacollection);

                     resolve();
                  });
            });
         },

         initLinkDatacollectionOptions: () => {
            let ids = this.ids;

            // get linked data collection list
            let objSource = this._datacollection
               ? this._datacollection.datasource
               : null;
            if (objSource != null) {
               let linkFields = objSource.connectFields();
               let linkObjectIds = linkFields.map((f) => f.settings.linkObject);

               let linkDvOptions = [];

               // pull data collections that are link to object
               let linkDCs = this._application.datacollections((dc) => {
                  return (
                     linkObjectIds.filter(
                        (objId) => dc.settings.datasourceID == objId
                     ).length > 0
                  );
               });

               if (linkDCs && linkDCs.length > 0) {
                  // set data collections to options
                  linkDCs.forEach((dc) => {
                     linkDvOptions.push({
                        id: dc.id,
                        value: dc.label
                     });
                  });

                  linkDvOptions.unshift({
                     id: "",
                     value: L(
                        "ab.component.datacollection.selectLinkSource",
                        "*Select a link source"
                     )
                  });

                  $$(ids.linkDatacollection).show();
                  $$(ids.linkDatacollection).define("options", linkDvOptions);
                  $$(ids.linkDatacollection).define(
                     "value",
                     this._datacollection
                        ? this._datacollection.settings.linkDatacollectionID
                        : ""
                  );
                  $$(ids.linkDatacollection).refresh();
               } else {
                  // hide options
                  $$(ids.linkDatacollection).hide();
                  $$(ids.linkField).hide();
               }
            } else {
               // hide options
               $$(ids.linkDatacollection).hide();
               $$(ids.linkField).hide();
            }
         },

         initLinkFieldOptions: (linkedDvId = null) => {
            let ids = this.ids;

            let linkFieldOptions = [];
            let linkDC = null;

            // Specify id of linked data view
            if (linkedDvId) {
               linkDC = this._application.datacollections(
                  (dc) => dc.id == linkedDvId
               )[0];
            }
            // Pull from current data view
            else if (
               this._datacollection &&
               this._datacollection.datacollectionLink
            ) {
               linkDC = this._datacollection.datacollectionLink;
            }

            // get fields that link to our ABObject
            if (linkDC) {
               let object = this._datacollection.datasource;
               let linkObject = linkDC.datasource;
               let relationFields = object
                  .connectFields()
                  .filter(
                     (link) => link.settings.linkObject == (linkObject || {}).id
                  );

               // pull fields to options
               relationFields.forEach((f) => {
                  linkFieldOptions.push({
                     id: f.id,
                     value: f.label
                  });
               });
            }

            if (linkFieldOptions.length > 0) $$(ids.linkField).show();
            else $$(ids.linkField).hide();

            let linkFieldId = linkFieldOptions[0] ? linkFieldOptions[0].id : "";
            if (this._datacollection && this._datacollection.settings) {
               linkFieldId = this._datacollection.settings.linkFieldID;
            }

            $$(ids.linkField).define("options", linkFieldOptions);
            $$(ids.linkField).define("value", linkFieldId);
            $$(ids.linkField).refresh();
         },

         populatePopupEditors: () => {
            if (this._datacollection && this._datacollection.datasource) {
               let datasource = this._datacollection.datasource;

               // array of filters to apply to the data table
               let filterConditions = {
                  glue: "and",
                  rules: []
               };
               let sortConditions = [];
               if (this._datacollection.settings.objectWorkspace) {
                  if (
                     this._datacollection.settings.objectWorkspace
                        .filterConditions
                  )
                     filterConditions = this._datacollection.settings
                        .objectWorkspace.filterConditions;

                  if (this._datacollection.settings.objectWorkspace.sortFields)
                     sortConditions = this._datacollection.settings
                        .objectWorkspace.sortFields;
               }

               // Populate data to popups
               this.FilterComponent.fieldsLoad(
                  datasource ? datasource.fields() : []
               );
               this.FilterComponent.setValue(filterConditions);
               this._datacollection.refreshFilterConditions(filterConditions);

               this.PopupSortFieldComponent.objectLoad(datasource);
               this.PopupSortFieldComponent.setValue(sortConditions);
            }
         },

         populateBadgeNumber: () => {
            let ids = this.ids;
            let datacollection = this._datacollection;

            if (
               datacollection &&
               datacollection.settings &&
               datacollection.settings.objectWorkspace &&
               datacollection.settings.objectWorkspace.filterConditions &&
               datacollection.settings.objectWorkspace.filterConditions.rules
            ) {
               $$(ids.buttonFilter).define(
                  "badge",
                  datacollection.settings.objectWorkspace.filterConditions.rules
                     .length || null
               );
               $$(ids.buttonFilter).refresh();
            } else {
               $$(ids.buttonFilter).define("badge", null);
               $$(ids.buttonFilter).refresh();
            }

            if (
               datacollection &&
               datacollection.settings &&
               datacollection.settings.objectWorkspace &&
               datacollection.settings.objectWorkspace.sortFields
            ) {
               $$(ids.buttonSort).define(
                  "badge",
                  datacollection.settings.objectWorkspace.sortFields.length ||
                     null
               );
               $$(ids.buttonSort).refresh();
            } else {
               $$(ids.buttonSort).define("badge", null);
               $$(ids.buttonSort).refresh();
            }
         },

         populateFixSelector: () => {
            let ids = this.ids;
            let dataItems = [];
            let fixSelect = "";

            if (this._datacollection && this._datacollection.datasource) {
               let datasource = this._datacollection.datasource;

               dataItems = this._datacollection.getData().map((item) => {
                  return {
                     id: item.id,
                     value: datasource ? datasource.displayData(item) : ""
                  };
               });

               // Add a current user option to allow select first row that match the current user
               if (datasource) {
                  let userFields = datasource.fields((f) => f.key == "user");
                  if (userFields.length > 0)
                     dataItems.unshift({
                        id: "_CurrentUser",
                        value: L(
                           "ab.component.datacollection.currentUser",
                           "[Current User]"
                        )
                     });

                  // Add a first record option to allow select first row
                  dataItems.unshift(
                     {
                        id: "_FirstRecord",
                        value: L(
                           "ab.component.datacollection.firstRecord",
                           "[First Record]"
                        )
                     },
                     {
                        id: "_FirstRecordDefault",
                        value: L(
                           "ab.component.datacollection.firstRecordDefault",
                           "[Default to First Record]"
                        )
                     }
                  );
               }

               dataItems.unshift({
                  id: "",
                  value: L(
                     "ab.component.datacollection.fixSelect",
                     "*Select fix cursor"
                  )
               });

               fixSelect = this._datacollection.settings.fixSelect || "";
            }

            $$(ids.fixSelect).define("options", dataItems);
            $$(ids.fixSelect).define("value", fixSelect);
            $$(ids.fixSelect).refresh();
         },

         initPopupEditors: () => {
            let idBase = "ABDatacollectionPropertyEditor";

            this.FilterComponent = new RowFilter(this.App, `${idBase}_filter`);
            this.FilterComponent.applicationLoad(this._application);
            this.FilterComponent.init({
               // when we make a change in the popups we want to make sure we save the new workspace to the properties to do so just fire an onChange event
               onChange: this._logic.onFilterChange
            });

            this.filter_popup = webix.ui({
               view: "popup",
               width: 800,
               hidden: true,
               body: this.FilterComponent.ui
            });

            this.PopupSortFieldComponent = new ABPopupSortField(
               this.App,
               `${idBase}_sort`
            );
            this.PopupSortFieldComponent.init({
               // when we make a change in the popups we want to make sure we save the new workspace to the properties to do so just fire an onChange event
               onChange: this._logic.onSortChange
            });
         },

         selectSource: (datasourceID, oldId) => {
            let ids = this.ids;

            let selectedDatasource = $$(ids.dataSource)
               .getList()
               .getItem(datasourceID);
            if (selectedDatasource && selectedDatasource.disabled) {
               // prevents re-calling onChange from itself
               $$(ids.dataSource).blockEvent();
               $$(ids.dataSource).setValue(oldId || "");
               $$(ids.dataSource).unblockEvent();
            }

            let datacollection = this._datacollection;
            let object;
            let query;

            if (datacollection) {
               object = datacollection.application.objects(
                  (obj) => obj.id == datasourceID
               )[0];
               query = datacollection.application.queries(
                  (q) => q.id == datasourceID
               )[0];

               // Set settings.datasourceID
               let dcSettings = datacollection.toObj() || {};
               dcSettings.settings = dcSettings.settings || {};
               dcSettings.settings.datasourceID = datasourceID;
               datacollection.fromValues(dcSettings);
            }

            if (object) {
               // populate fix selector
               this._logic.populateFixSelector();

               // re-create filter & sort popups
               this._logic.initPopupEditors();

               this._logic.populatePopupEditors();

               // show options
               $$(ids.filterPanel).show();
               $$(ids.sortPanel).show();
            } else if (query) {
               // hide options
               $$(ids.filterPanel).hide();
               $$(ids.sortPanel).hide();
            }

            this._logic.save();
         },

         showFilterPopup: ($button) => {
            this.filter_popup.show($button, null, { pos: "top" });
         },

         showSortPopup: ($button) => {
            this.PopupSortFieldComponent.show($button, null, {
               pos: "top"
            });
         },

         onFilterChange: () => {
            let datacollection = this._datacollection;
            if (!datacollection) return;

            let filterValues = this.FilterComponent.getValue();

            datacollection.settings.objectWorkspace.filterConditions = filterValues;

            var allComplete = true;
            filterValues.rules.forEach((f) => {
               // if all 3 fields are present, we are good.
               if (
                  f.key &&
                  f.rule &&
                  (f.value ||
                     // these rules do not have input value
                     f.rule == "is_current_user" ||
                     f.rule == "is_not_current_user" ||
                     f.rule == "contain_current_user" ||
                     f.rule == "not_contain_current_user" ||
                     f.rule == "same_as_user" ||
                     f.rule == "not_same_as_user" ||
                     f.rule == "less_current" ||
                     f.rule == "greater_current" ||
                     f.rule == "less_or_equal_current" ||
                     f.rule == "greater_or_equal_current" ||
                     f.rule == "is_empty" ||
                     f.rule == "is_not_empty")
               ) {
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
                  this._logic.save();
               }, 10);
            }
         },

         onSortChange: (sortSettings) => {
            let datacollection = this._datacollection;
            if (!datacollection) return;

            datacollection.settings = datacollection.settings || {};
            datacollection.settings.objectWorkspace =
               datacollection.settings.objectWorkspace || {};
            // store sort settings
            datacollection.settings.objectWorkspace.sortFields =
               sortSettings || [];

            this._logic.save();
         },

         /**
          * @function templateListItem
          *
          * Defines the template for each row of our ObjectList.
          *
          * @param {obj} obj the current instance of ABObject for the row.
          * @param {?} common the webix.common icon data structure
          * @return {string}
          */
         templateListItem: (item, common) => {
            var template = this._templateListItem;

            var hasDataCollection = "";
            if (
               item.datacollection &&
               this._datacollection &&
               this._datacollection.id &&
               item.datacollection.id == this._datacollection.id
            ) {
               hasDataCollection =
                  "<i class='webix_icon hasDataCollection fa fa-check-circle'></i>";
            }

            template = template
               .replace("#typeIcon#", item.icon || item.viewIcon())
               .replace("#label#", item.label)
               .replace("{common.icon()}", common.icon(item))
               .replace("#hasDataCollection#", hasDataCollection);

            return template;
         },

         listBusy: () => {
            let ids = this.ids;

            if ($$(ids.list) && $$(ids.list).showProgress)
               $$(ids.list).showProgress({ type: "icon" });
         },

         listReady: () => {
            let ids = this.ids;

            if ($$(ids.list) && $$(ids.list).hideProgress)
               $$(ids.list).hideProgress();
         }
      };
   }
};
