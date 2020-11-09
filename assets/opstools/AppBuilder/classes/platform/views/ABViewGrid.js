const ABViewGridCore = require("../../core/views/ABViewGridCore");

const ABWorkspaceDatatable = require("../../../components/ab_work_object_workspace_datatable");
const ABPopupHideFields = require("../../../components/ab_work_object_workspace_popupHideFields");
const ABPopupSortField = require("../../../components/ab_work_object_workspace_popupSortFields");
const ABPopupFrozenColumns = require("../../../components/ab_work_object_workspace_popupFrozenColumns");
const ABPopupMassUpdate = require("../../../components/ab_work_object_workspace_popupMassUpdate");
const ABPopupSummaryColumns = require("../../../components/ab_work_object_workspace_popupSummaryColumns");
const ABPopupCountColumns = require("../../../components/ab_work_object_workspace_popupCountColumns");
const ABPopupExport = require("../../../components/ab_work_object_workspace_popupExport");

// const ABFieldImage = require("../dataFields/ABFieldImage");

const ABViewPropertyFilterData = require("./viewProperties/ABViewPropertyFilterData");
const ABViewPropertyLinkPage = require("./viewProperties/ABViewPropertyLinkPage");

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

let PopupHideFieldComponent = null;
let PopupFrozenColumnsComponent = null;
let PopupFilterProperty = null;
let PopupSummaryColumnsComponent = null;
let PopupCountColumnsComponent = null;

module.exports = class ABViewGrid extends ABViewGridCore {
   /**
    * @param {obj} values  key=>value hash of ABView values
    * @param {ABApplication} application the application object this view is under
    * @param {ABViewWidget} parent the ABViewWidget this view is a child of. (can be null)
    */
   constructor(values, application, parent, defaultValues) {
      super(values, application, parent, defaultValues);
   }

   ///
   /// Instance Methods
   ///

   /**
    * @method fromValues()
    *
    * initialze this object with the given set of values.
    * @param {obj} values
    */
   fromValues(values) {
      super.fromValues(values);

      // filter property
      this.filterHelper.fromSettings(this.settings.gridFilter);
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
      var idBase = "ABViewGridEditorComponent";

      var DataTable = this.component(App, idBase);

      return {
         ui: DataTable.ui,
         logic: DataTable.logic,
         onShow: DataTable.onShow,

         init: () => {
            // remove id of the component in caching for refresh .bind of the data collection
            let dv = this.datacollection;
            if (dv) dv.removeComponent(DataTable.ui.id);

            DataTable.init();
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

      var idBase = "ABViewGridPropertyEditor";

      // initialize our popup editors with unique names so we don't overwrite the previous editor each time
      PopupHideFieldComponent = new ABPopupHideFields(App, idBase + "_hide");
      PopupFrozenColumnsComponent = new ABPopupFrozenColumns(
         App,
         idBase + "_freeze"
      );

      PopupSummaryColumnsComponent = new ABPopupSummaryColumns(
         App,
         idBase + "_summary"
      );
      PopupCountColumnsComponent = new ABPopupCountColumns(
         App,
         idBase + "_count"
      );

      PopupFilterProperty = ABViewPropertyFilterData.propertyComponent(
         App,
         idBase + "_gridfiltermenu"
      );
      this.linkPageComponent = ABViewPropertyLinkPage.propertyComponent(
         App,
         idBase + "_gridlinkpage"
      );

      let filter_property_popup = webix.ui({
         view: "window",
         modal: true,
         position: "center",
         resize: true,
         width: 700,
         height: 450,
         css: "ab-main-container",
         head: {
            view: "toolbar",
            cols: [
               {
                  view: "label",
                  label: L("ab.component.grid.filterMenu", "*Filter Menu")
               }
            ]
         },
         body: PopupFilterProperty.ui
      });

      _logic.newObject = () => {
         var currView = _logic.currentEditObject();
         currView.settings.objectWorkspace = {
            sortFields: [],
            filterConditions: [],
            frozenColumnID: "",
            hiddenFields: [],
            summaryColumns: [],
            countColumns: []
         };
         currView.populatePopupEditors(currView);
      };

      // Open our popup editors when their settings button is clicked
      _logic.toolbarFieldsVisible = ($view) => {
         PopupHideFieldComponent.show($view, { pos: "top" });
      };

      _logic.toolbarFrozen = ($view) => {
         PopupFrozenColumnsComponent.show($view, { pos: "top" });
      };

      _logic.gridFilterMenuShow = () => {
         let currView = _logic.currentEditObject();

         // show filter popup
         filter_property_popup.show();
      };

      _logic.summaryColumns = ($view) => {
         PopupSummaryColumnsComponent.show($view, { pos: "top" });
      };

      _logic.countColumns = ($view) => {
         PopupCountColumnsComponent.show($view, { pos: "top" });
      };

      _logic.callbackHideFields = (settings) => {
         var currView = _logic.currentEditObject();

         currView.objectWorkspace = currView.objectWorkspace || {};
         currView.objectWorkspace.hiddenFields = settings;

         _logic.onChange();
      };

      _logic.callbackFrozenFields = (settings) => {
         var currView = _logic.currentEditObject();

         currView.objectWorkspace = currView.objectWorkspace || {};
         currView.objectWorkspace.frozenColumnID = settings || "";

         _logic.onChange();
      };

      _logic.callbackSaveWorkspace = (data) => {
         // when we make a change in the popups we want to make sure we save the new workspace to the properties to do so just fire an onChange event
         _logic.onChange();
      };

      _logic.gridFilterSave = () => {
         var currView = _logic.currentEditObject();
         // currView.settings.isFilterable = settings.filterOption == 1 ? true : false;

         // hide filter popup
         filter_property_popup.hide();

         // refresh settings
         this.propertyEditorValues(ids, currView);

         // trigger a save()
         this.propertyEditorSave(ids, currView);
      };

      _logic.gridFilterCancel = () => {
         // hide filter popup
         filter_property_popup.hide();
      };

      _logic.callbackSaveSummaryColumns = (data) => {
         var currObj = _logic.currentEditObject();
         currObj.settings.objectWorkspace.summaryColumns = data;

         // when we make a change in the popups we want to make sure we save the new workspace to the properties to do so just fire an onChange event
         _logic.onChange();
      };

      _logic.callbackSaveCountColumns = (data) => {
         var currObj = _logic.currentEditObject();
         currObj.settings.objectWorkspace.countColumns = data;

         // when we make a change in the popups we want to make sure we save the new workspace to the properties to do so just fire an onChange event
         _logic.onChange();
      };

      PopupHideFieldComponent.init({
         onChange: _logic.callbackHideFields // be notified when there is a change in the hidden fields
      });

      PopupFrozenColumnsComponent.init({
         onChange: _logic.callbackFrozenFields // be notified when there is a change in the hidden fields
      });

      PopupFilterProperty.init({
         onSave: _logic.gridFilterSave,
         onCancel: _logic.gridFilterCancel
      });

      PopupSummaryColumnsComponent.init({
         onChange: _logic.callbackSaveSummaryColumns // be notified when there is a change in the summary columns
      });

      PopupCountColumnsComponent.init({
         onChange: _logic.callbackSaveCountColumns // be notified when there is a change in the count columns
      });

      var view = "button";
      // in addition to the common .label  values, we
      // ask for:
      return commonUI.concat([
         {
            view: "fieldset",
            label: L("ab.component.label.gridProperties", "*Grid Properties:"),
            labelWidth: App.config.labelWidthLarge,
            body: {
               type: "clean",
               padding: 10,
               rows: [
                  {
                     view: "checkbox",
                     name: "isEditable",
                     labelRight: L(
                        "ab.component.label.isEditable",
                        "*User can edit in grid."
                     ),
                     labelWidth: App.config.labelWidthCheckbox
                  },
                  {
                     view: "checkbox",
                     name: "massUpdate",
                     labelRight: L(
                        "ab.component.label.massUpdate",
                        "*User can edit multiple items at one time."
                     ),
                     labelWidth: App.config.labelWidthCheckbox
                  },
                  {
                     view: "checkbox",
                     name: "allowDelete",
                     labelRight: L(
                        "ab.component.label.allowDelete",
                        "*User can delete records."
                     ),
                     labelWidth: App.config.labelWidthCheckbox
                  },
                  {
                     view: "checkbox",
                     name: "isSortable",
                     labelRight: L(
                        "ab.component.label.isSortable",
                        "*User can sort records."
                     ),
                     labelWidth: App.config.labelWidthCheckbox
                  },
                  {
                     view: "checkbox",
                     name: "isExportable",
                     labelRight: L(
                        "ab.component.label.isExportable",
                        "*User can export."
                     ),
                     labelWidth: App.config.labelWidthCheckbox
                  }
               ]
            }
         },
         {
            view: "fieldset",
            label: L("ab.component.label.dataSource", "*Grid Data:"),
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
                           if (newv != oldv) {
                              $$(ids.detailsPage).setValue("");
                              $$(ids.editPage).setValue("");

                              let editingGrid = _logic.currentEditObject();
                              let currDC = editingGrid.application.datacollections(
                                 (dc) => dc.id == newv
                              )[0];
                              // disallow edit data of query
                              if (currDC && currDC.sourceType == "query") {
                                 $$(ids.isEditable).setValue(false);
                                 $$(ids.massUpdate).setValue(false);
                                 $$(ids.allowDelete).setValue(false);
                                 $$(ids.isEditable).disable();
                                 $$(ids.massUpdate).disable();
                                 $$(ids.allowDelete).disable();
                              } else {
                                 $$(ids.isEditable).enable();
                                 $$(ids.massUpdate).enable();
                                 $$(ids.allowDelete).enable();
                              }
                           }
                        }
                     }
                  }
               ]
            }
         },
         {
            view: "fieldset",
            label: L("ab.component.grid.group", "*Group:"),
            labelWidth: App.config.labelWidthLarge,
            body: {
               type: "clean",
               padding: 10,
               rows: [
                  {
                     view: "multiselect",
                     name: "groupBy",
                     label: L("ab.component.grid.groupBy", "*Group by:"),
                     labelWidth: App.config.labelWidthLarge,
                     options: [],
                     on: {
                        onChange: (newV, oldV) => {
                           let currView = _logic.currentEditObject();
                           currView.propertyGroupByList(ids, newV);
                        }
                     }
                  },
                  {
                     view: "list",
                     name: "groupByList",
                     drag: true,
                     data: [],
                     height: 200,
                     template:
                        "<span class='fa fa-sort'></span>&nbsp;&nbsp; #value#",
                     on: {
                        onAfterDrop: () => {
                           let currView = _logic.currentEditObject();
                           this.propertyEditorSave(ids, currView);
                        }
                     }
                  }
               ]
            }
         },
         this.linkPageComponent.ui,
         {
            view: "fieldset",
            label: L(
               "ab.component.label.customizeDisplay",
               "*Customize Display:"
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
                              "ab.component.label.hiddenFields",
                              "*Hidden Fields:"
                           ),
                           css: "ab-text-bold",
                           width: App.config.labelWidthXLarge
                        },
                        {
                           view: view,
                           name: "buttonFieldsVisible",
                           label: L("ab.component.label.settings", "*Settings"),
                           icon: "fa fa-gear",
                           type: "icon",
                           click: function() {
                              _logic.toolbarFieldsVisible(this.$view);
                           }
                        }
                     ]
                  },
                  {
                     cols: [
                        {
                           view: "label",
                           label: L(
                              "ab.component.label.filterData",
                              "*Filter Option:"
                           ),
                           css: "ab-text-bold",
                           width: App.config.labelWidthXLarge
                        },
                        {
                           view: view,
                           name: "buttonFilterData",
                           label: L("ab.component.label.settings", "*Settings"),
                           icon: "fa fa-gear",
                           type: "icon",
                           click: function() {
                              _logic.gridFilterMenuShow(this.$view);
                           }
                        }
                     ]
                  },
                  {
                     cols: [
                        {
                           view: "label",
                           label: L(
                              "ab.component.label.freezeColumns",
                              "*Freeze Columns:"
                           ),
                           css: "ab-text-bold",
                           width: App.config.labelWidthXLarge
                        },
                        {
                           view: view,
                           name: "buttonFieldsFreeze",
                           label: L("ab.component.label.settings", "*Settings"),
                           icon: "fa fa-gear",
                           type: "icon",
                           click: function() {
                              _logic.toolbarFrozen(this.$view);
                           }
                        }
                     ]
                  },

                  {
                     cols: [
                        {
                           view: "label",
                           label: L(
                              "ab.component.label.summaryFields",
                              "*Summary Fields:"
                           ),
                           css: "ab-text-bold",
                           width: App.config.labelWidthXLarge
                        },
                        {
                           view: view,
                           name: "buttonSummaryFields",
                           label: L("ab.component.label.settings", "*Settings"),
                           icon: "fa fa-gear",
                           type: "icon",
                           click: function() {
                              _logic.summaryColumns(this.$view);
                           }
                        }
                     ]
                  },

                  {
                     cols: [
                        {
                           view: "label",
                           label: L(
                              "ab.component.label.countFields",
                              "*Count Fields:"
                           ),
                           css: "ab-text-bold",
                           width: App.config.labelWidthXLarge
                        },
                        {
                           view: view,
                           name: "buttonCountFields",
                           label: L("ab.component.label.settings", "*Settings"),
                           icon: "fa fa-gear",
                           type: "icon",
                           click: function() {
                              _logic.countColumns(this.$view);
                           }
                        }
                     ]
                  },

                  {
                     view: "counter",
                     name: "height",
                     label: L("ab.component.grid.height", "*Height:"),
                     labelWidth: App.config.labelWidthXLarge
                  },

                  {
                     view: "checkbox",
                     name: "hideHeader",
                     labelRight: L(
                        "ab.component.label.hideHeader",
                        "*Hide table header"
                     ),
                     labelWidth: App.config.labelWidthCheckbox
                  },

                  {
                     view: "checkbox",
                     name: "labelAsField",
                     labelRight: L(
                        "ab.component.label.labelAsField",
                        "*Show a field using label template"
                     ),
                     labelWidth: App.config.labelWidthCheckbox
                  },

                  {
                     view: "checkbox",
                     name: "hideButtons",
                     labelRight: L(
                        "ab.component.label.hideButtons",
                        "*Hide edit and view buttons"
                     ),
                     labelWidth: App.config.labelWidthCheckbox
                  }
               ]
            }
         },
         {}
      ]);
   }

   static propertyEditorPopulate(App, ids, view) {
      super.propertyEditorPopulate(App, ids, view);

      this.view = view;

      $$(ids.datacollection).setValue(view.settings.dataviewID);
      $$(ids.isEditable).setValue(view.settings.isEditable);
      $$(ids.massUpdate).setValue(view.settings.massUpdate);
      $$(ids.allowDelete).setValue(view.settings.allowDelete);
      $$(ids.isSortable).setValue(view.settings.isSortable);
      $$(ids.isExportable).setValue(view.settings.isExportable);
      var details = view.settings.detailsPage;
      if (view.settings.detailsTab != "") {
         details += ":" + view.settings.detailsTab;
      }
      $$(ids.detailsPage).setValue(details);
      var edit = view.settings.editPage;
      if (view.settings.editTab != "") {
         edit += ":" + view.settings.editTab;
      }
      $$(ids.editPage).setValue(edit);
      $$(ids.height).setValue(view.settings.height);
      $$(ids.hideHeader).setValue(view.settings.hideHeader);
      $$(ids.labelAsField).setValue(view.settings.labelAsField);
      $$(ids.hideButtons).setValue(view.settings.hideButtons);
      $$(ids.groupBy).setValue(view.settings.groupBy);

      // initial populate of properties and popups
      view.populateEditor(ids, view);
      view.populatePopupEditors(view);
      view.populateBadgeNumber(ids, view);

      // when a change is made in the properties the popups need to reflect the change
      this.updateEventIds = this.updateEventIds || {}; // { viewId: boolean, ..., viewIdn: boolean }
      if (!this.updateEventIds[view.id]) {
         this.updateEventIds[view.id] = true;

         view.addListener(
            "properties.updated",
            function() {
               view.populateEditor(ids, view);
               view.populatePopupEditors(view);
               view.populateBadgeNumber(ids, view);
            },
            this
         );
      }

      //Load ABDatacollection to QueryBuilder
      this.propertyUpdateGridFilterObject(ids, view);

      // Populate values to link page properties
      this.linkPageComponent.viewLoad(view);
      this.linkPageComponent.setSettings(view.settings);
   }

   static propertyEditorValues(ids, view) {
      super.propertyEditorValues(ids, view);

      // Retrive the values of your properties from Webix and store them in the view
      view.settings.dataviewID = $$(ids.datacollection).getValue();
      view.settings.isEditable = $$(ids.isEditable).getValue();
      view.settings.massUpdate = $$(ids.massUpdate).getValue();
      view.settings.allowDelete = $$(ids.allowDelete).getValue();
      view.settings.isSortable = $$(ids.isSortable).getValue();
      view.settings.isExportable = $$(ids.isExportable).getValue();

      var detailsPage = $$(ids.detailsPage).getValue();
      var detailsTab = "";
      if (detailsPage.split(":").length > 1) {
         var detailsVals = detailsPage.split(":");
         detailsPage = detailsVals[0];
         detailsTab = detailsVals[1];
      }
      view.settings.detailsPage = detailsPage;
      view.settings.detailsTab = detailsTab;

      var editPage = $$(ids.editPage).getValue();
      var editTab = "";
      if (editPage.split(":").length > 1) {
         var editVals = editPage.split(":");
         editPage = editVals[0];
         editTab = editVals[1];
      }
      view.settings.editPage = editPage;
      view.settings.editTab = editTab;

      view.settings.height = $$(ids.height).getValue();
      view.settings.hideHeader = $$(ids.hideHeader).getValue();
      view.settings.labelAsField = $$(ids.labelAsField).getValue();
      view.settings.hideButtons = $$(ids.hideButtons).getValue();
      // view.settings.groupBy = $$(ids.groupBy).getValue();

      // pull order groupBy list
      let groupByList = $$(ids.groupByList).serialize() || [];
      view.settings.groupBy = groupByList.map((item) => item.id).join(",");

      view.settings.gridFilter = PopupFilterProperty.getSettings();

      view.settings.objectWorkspace = view.settings.objectWorkspace || {};
      view.settings.objectWorkspace.hiddenFields = PopupHideFieldComponent.getValue();
      view.settings.objectWorkspace.frozenColumnID = PopupFrozenColumnsComponent.getValue();

      // link pages
      let linkSettings = this.linkPageComponent.getSettings();
      for (let key in linkSettings) {
         view.settings[key] = linkSettings[key];
      }

      // Populate values to link page properties
      this.linkPageComponent.viewLoad(view);
      this.linkPageComponent.setSettings(view.settings);
   }

   static propertyUpdateGridFilterObject(ids, view) {
      if (!view) return;

      // Populate values to QueryBuilder
      var selectedDv = view.datacollection;

      if (selectedDv) {
         let object = selectedDv.datasource;
         if (object) {
            PopupFilterProperty.objectLoad(object, selectedDv.settings.loadAll);
         }
      }
   }

   propertyGroupByList(ids, groupBy) {
      let colNames = groupBy || [];
      if (typeof colNames == "string") {
         colNames = colNames.split(",");
      }

      let options = $$(ids.groupBy)
         .getList()
         .data.find({});

      $$(ids.groupByList).clearAll();
      colNames.forEach((colName) => {
         let opt = options.filter((o) => o.id == colName)[0];
         if (opt) {
            $$(ids.groupByList).add(opt);
         }
      });
   }

   /**
    * @method component()
    * return a UI component based upon this view.
    * @param {obj} App
    * @return {obj} UI component
    */
   component(App, objId) {
      let baseCom = super.component(App);

      var idBase = objId || "ABViewGrid_" + this.id;
      var ids = {
         component: App.unique(idBase + "_component"),
         toolbar: App.unique(idBase + "_toolbar"),
         buttonDeleteSelected: App.unique(idBase + "_deleteSelected"),
         // buttonExport: App.unique('buttonExport'),
         buttonFilter: App.unique(idBase + "_buttonFilter"),
         buttonMassUpdate: App.unique(idBase + "_buttonMassUpdate"),
         buttonSort: App.unique(idBase + "_buttonSort"),
         buttonExport: App.unique(idBase + "_buttonExport"),

         globalSearchToolbar: App.unique(idBase + "_globalSearchToolbar")
      };

      var labels = {
         common: App.labels
      };

      var CurrentObject = null;

      var settings = {
         allowDelete: this.settings.allowDelete,
         detailsView: this.settings.detailsPage,
         editView: this.settings.editPage,
         isEditable: this.settings.isEditable,
         massUpdate: this.settings.massUpdate,
         configureHeaders: false,
         summaryColumns: this.settings.objectWorkspace.summaryColumns,
         countColumns: this.settings.objectWorkspace.countColumns,
         hideHeader: this.settings.hideHeader,
         labelAsField: this.settings.labelAsField,
         hideButtons: this.settings.hideButtons,
         groupBy: this.settings.groupBy,
         hiddenFields: this.settings.objectWorkspace.hiddenFields,
         frozenColumnID: this.settings.objectWorkspace.frozenColumnID || "",
         isTreeDatable: this.datacollection && this.datacollection.isGroup
      };

      let DataTable = new ABWorkspaceDatatable(App, idBase, settings);
      let PopupMassUpdateComponent = new ABPopupMassUpdate(
         App,
         idBase + "_mass"
      );
      let PopupSortDataTableComponent = new ABPopupSortField(
         App,
         idBase + "_sort"
      );
      let exportPopup = new ABPopupExport(App, idBase + "_export");

      let filterUI = this.filterHelper.component(App, idBase + "_gridfilter");
      this.filterHelper.fromSettings(this.settings.gridFilter);

      let linkPage = this.linkPageHelper.component(
         App,
         idBase + "_gridlinkpage"
      );

      let _init = (options, accessLevel) => {
         if (this.settings.dataviewID != "") {
            DataTable.init(
               {
                  onCheckboxChecked: _logic.callbackCheckboxChecked
               },
               accessLevel
            );

            PopupMassUpdateComponent.init({
               // onSave:_logic.callbackAddFields			// be notified of something...who knows...
            });

            PopupSortDataTableComponent.init({
               onChange: _logic.callbackSortData
            });

            filterUI.init({
               onFilterData: (fnFilter, filterRules) => {
                  _logic.callbackFilterData(fnFilter, filterRules); // be notified when there is a change in the filter
               }
            });

            exportPopup.init({});

            if (
               this.settings.massUpdate ||
               this.settings.isSortable ||
               this.settings.isExportable ||
               (this.settings.gridFilter &&
                  this.settings.gridFilter.filterOption &&
                  this.settings.gridFilter.userFilterPosition == "toolbar")
            ) {
               $$(ids.toolbar).show();
            }

            if (this.settings.massUpdate == false) {
               $$(ids.buttonMassUpdate).hide();
               $$(ids.buttonDeleteSelected).hide();
            }

            if (this.settings.allowDelete == false) {
               $$(ids.buttonDeleteSelected).hide();
            }

            if (this.settings.gridFilter) {
               if (
                  this.settings.gridFilter.filterOption != 1 ||
                  this.settings.gridFilter.userFilterPosition != "toolbar"
               ) {
                  $$(ids.buttonFilter).hide();
               }

               if (
                  this.settings.gridFilter.filterOption == 3 &&
                  this.settings.gridFilter.globalFilterPosition == "single"
               ) {
                  $$(DataTable.ui.id).hide();
               }

               if (this.settings.gridFilter.isGlobalToolbar)
                  $$(ids.globalSearchToolbar).show();
               else $$(ids.globalSearchToolbar).hide();
            }

            if (this.settings.isSortable == false) {
               $$(ids.buttonSort).hide();
            }

            if (this.settings.isExportable == false) {
               $$(ids.buttonExport).hide();
            }

            if (this.settings.hideHeader == true) {
               DataTable.hideHeader();
            }

            var dv = this.datacollection;
            if (dv && dv.datasource) {
               CurrentObject = dv.datasource;

               DataTable.objectLoad(CurrentObject);
               PopupMassUpdateComponent.objectLoad(CurrentObject, DataTable);
               PopupSortDataTableComponent.objectLoad(CurrentObject);
               PopupSortDataTableComponent.setValue(
                  this.settings.objectWorkspace.sortFields
               );
               this.filterHelper.objectLoad(CurrentObject);
               this.filterHelper.viewLoad(this);
               exportPopup.objectLoad(CurrentObject);
               exportPopup.dataCollectionLoad(dv);
               exportPopup.setGridComponent($$(DataTable.ui.id));
               exportPopup.setHiddenFields(
                  this.settings.objectWorkspace.hiddenFields
               );
               exportPopup.setFilename(this.label);
               DataTable.refreshHeader();

               // link page helper
               linkPage.init({
                  view: this,
                  datacollection: dv
               });

               // dv.bind($$(DataTable.ui.id));
               DataTable.datacollectionLoad(dv);

               var editPage = this.settings.editPage;
               var detailsPage = this.settings.detailsPage;
               var editTab = this.settings.editTab;
               var detailsTab = this.settings.detailsTab;
               var isEditable = this.settings.isEditable;

               // we need to recursivly look backwards to toggle tabs into view when a user choosed to select a tab for edit or details views
               function toggleTab(parentTab, wb) {
                  // find the tab
                  var tab = wb.getTopParentView().queryView({ id: parentTab });
                  // if we didn't pass and id we may have passed a domNode
                  if (tab == null) {
                     tab = $$(parentTab);
                  }

                  if (tab == null) return;

                  // set the tabbar to to the tab
                  var tabbar = tab.getParentView().getParentView();

                  if (tabbar == null) return;

                  if (tabbar.setValue) {
                     // if we have reached the top we won't have a tab
                     tabbar.setValue(parentTab);
                  }

                  // find if it is in a multiview of a tab
                  var nextTab = tabbar.queryView(
                     { view: "scrollview" },
                     "parent"
                  );
                  // if so then do this again
                  if (nextTab) {
                     toggleTab(nextTab, wb);
                  }
               }

               $$(DataTable.ui.id).attachEvent("onItemClick", function(
                  id,
                  e,
                  node
               ) {
                  var item = id;

                  if (e == "auto") {
                     // automatically choose the details page if a record matches
                     // later on we can decide if we want to have the choice to select the edit page intead.
                     _logic.changePage(dv, item, detailsPage);
                     toggleTab(detailsTab, this);
                  } else if (e.target.className.indexOf("eye") > -1) {
                     _logic.changePage(dv, item, detailsPage);
                     toggleTab(detailsTab, this);
                  } else if (e.target.className.indexOf("pencil") > -1) {
                     _logic.changePage(dv, item, editPage);
                     toggleTab(editTab, this);
                  } else if (e.target.className.indexOf("trash") > -1) {
                     // don't do anything for delete it is handled elsewhere
                  } else if (!isEditable && detailsPage.length) {
                     _logic.changePage(dv, item, detailsPage);
                     toggleTab(detailsTab, this);
                  } else if (
                     !isEditable &&
                     !detailsPage.length &&
                     editPage.length &&
                     this.config.accessLevel == 2
                  ) {
                     _logic.changePage(dv, item, editPage);
                     toggleTab(editTab, this);
                  }
               });

               // $$(DataTable.ui.id).attachEvent('onBeforeRender', function (data) {
               // 	_logic.clientSideDataFilter();
               // });

               $$(DataTable.ui.id).adjust();
            }

            // Adjust grid based off Access Level of parent view
            if (accessLevel < 2) {
               $$(ids.buttonMassUpdate).hide();
               $$(ids.buttonDeleteSelected).hide();
            }
         }
      };

      // specify height of the grid
      if (this.settings.height) DataTable.ui.height = this.settings.height;

      var tableUI = {
         type: "space",
         rows: [
            {
               view: "label",
               label: "Select an object to load.",
               inputWidth: 200,
               align: "center"
            },
            {}
         ]
      };
      if (this.settings.dataviewID != "") {
         tableUI = {
            type: "space",
            padding: 17,
            rows: [
               {
                  view: "toolbar",
                  id: ids.toolbar,
                  hidden: true,
                  css: "ab-data-toolbar",
                  cols: [
                     {
                        view: "button",
                        id: ids.buttonMassUpdate,
                        css: "webix_transparent",
                        label: L("ab.object.toolbar.massUpdate", "*Edit"),
                        icon: "fa fa-pencil-square-o",
                        type: "icon",
                        disabled: true,
                        autowidth: true,
                        click: function() {
                           _logic.toolbarMassUpdate(this.$view);
                        }
                     },
                     {
                        view: "button",
                        id: ids.buttonDeleteSelected,
                        css: "webix_transparent",
                        label: L("ab.object.toolbar.deleteRecords", "*Delete"),
                        icon: "fa fa-trash",
                        type: "icon",
                        disabled: true,
                        autowidth: true,
                        click: function() {
                           _logic.toolbarDeleteSelected(this.$view);
                        }
                     },
                     {
                        view: "button",
                        id: ids.buttonFilter,
                        css: "webix_transparent",
                        label: L("ab.object.toolbar.filterFields", "*Filters"),
                        icon: "fa fa-filter",
                        type: "icon",
                        autowidth: true,
                        click: function() {
                           _logic.toolbarFilter(this.$view);
                        }
                     },
                     {
                        view: "button",
                        id: ids.buttonSort,
                        css: "webix_transparent",
                        label: L("ab.object.toolbar.sortFields", "*Sort"),
                        icon: "fa fa-sort",
                        type: "icon",
                        autowidth: true,
                        click: function() {
                           _logic.toolbarSort(this.$view);
                        }
                     },
                     {
                        view: "button",
                        id: ids.buttonExport,
                        css: "webix_transparent",
                        label: L("ab.object.toolbar.export", "*Export"),
                        icon: "fa fa-print",
                        type: "icon",
                        autowidth: true,
                        click: function() {
                           _logic.toolbarExport(this.$view);
                        }
                     },
                     /*
							{
								view: view,
								id: ids.buttonExport,
								label: labels.component.export,
								icon: "fa fa-download",
								type: "icon",
								click: function() {
									_logic.toolbarButtonExport(this.$view);
								}
							}
                            */
                     {},
                     {
                        id: ids.globalSearchToolbar,
                        view: "search",
                        placeholder: "Search...",
                        on: {
                           onTimedKeyPress: () => {
                              let searchText = $$(
                                 ids.globalSearchToolbar
                              ).getValue();

                              filterUI.searchText(searchText);
                           }
                        }
                     }
                  ]
               },
               filterUI.ui,
               DataTable.ui
            ]
         };
      }

      // our internal business logic
      var _logic = {
         callbackCheckboxChecked: (state) => {
            if (state == "enable") {
               _logic.enableUpdateDelete();
            } else {
               _logic.disableUpdateDelete();
            }
         },

         callbackSortData: (sort_settings) => {
            let sortRules = sort_settings || [];

            $$(ids.buttonSort).define("badge", sortRules.length || null);
            $$(ids.buttonSort).refresh();

            // client sort data
            $$(DataTable.ui.id).sort(PopupSortDataTableComponent.sort);
         },

         callbackFilterData: (fnFilter, filterRules) => {
            filterRules = filterRules || [];

            if ($$(ids.buttonFilter)) {
               $$(ids.buttonFilter).define("badge", filterRules.length || null);
               $$(ids.buttonFilter).refresh();
            }

            Promise.resolve()
               .then(
                  () =>
                     new Promise((next, err) => {
                        // if (
                        //    !this.settings ||
                        //    !this.settings.gridFilter ||
                        //    this.settings.gridFilter.filterOption != 3
                        // )
                        //    // Global search
                        //    return next();

                        let dc = this.datacollection;
                        if (
                           !dc ||
                           (dc.settings.loadAll &&
                              dc.dataStatus != dc.dataStatusFlag.notInitial)
                        )
                           // Load all already
                           return next();

                        let limit = null;

                        // limit pull data to reduce time and performance loading
                        if (dc.__dataCollection.count() > 300) limit = 300;

                        // Load all data
                        dc.reloadData(0, limit)
                           .catch(err)
                           .then(() => {
                              // Should set .loadAll to this data collection ?
                              if (limit == null) dc.settings.loadAll = true;

                              next();
                           });
                     })
               )
               // client filter data
               .then(
                  () =>
                     new Promise((next, err) => {
                        if (!fnFilter) return next();

                        let table = $$(DataTable.ui.id);
                        table.filter((rowData) => {
                           // rowData is null when is not load from paging
                           if (rowData == null) return false;

                           return fnFilter(rowData);
                        });

                        if (
                           this.settings.gridFilter.globalFilterPosition ==
                           "single"
                        ) {
                           if (table.count() > 0) {
                              table.show();
                              table.select(table.getFirstId(), false);
                              table.callEvent("onItemClick", [
                                 table.getFirstId(),
                                 "auto",
                                 null
                              ]);
                           } else {
                              table.hide();
                           }
                        }

                        next();
                     })
               );
         },

         changePage: (dv, rowItem, page) => {
            let rowId = rowItem && rowItem.row ? rowItem.row : null;

            // Set cursor to data view
            if (dv) {
               dv.setCursor(rowId);
            }

            // Pass settings to link page module
            if (linkPage) {
               linkPage.changePage(page, rowId);
            }

            super.changePage(page);
         },

         selectRow: (rowData) => {
            if (!$$(DataTable.ui.id)) return;

            if (rowData == null) $$(DataTable.ui.id).unselect();
            else if (
               rowData &&
               rowData.id &&
               $$(DataTable.ui.id).exists(rowData.id)
            )
               $$(DataTable.ui.id).select(rowData.id, false);
            else $$(DataTable.ui.id).select(null, false);
         },

         /**
          * @function enableUpdateDelete
          *
          * enable the update or delete buttons in the toolbar if there are any items selected
          * we will make this externally accessible so we can call it from within the datatable component
          */
         enableUpdateDelete: function() {
            $$(ids.buttonMassUpdate).enable();
            $$(ids.buttonDeleteSelected).enable();
         },

         /**
          * @function enableUpdateDelete
          *
          * disable the update or delete buttons in the toolbar if there no items selected
          * we will make this externally accessible so we can call it from within the datatable component
          */
         disableUpdateDelete: function() {
            $$(ids.buttonMassUpdate).disable();
            $$(ids.buttonDeleteSelected).disable();
         },

         toolbarDeleteSelected: function($view) {
            var deleteTasks = [];
            $$(DataTable.ui.id).data.each(function(obj) {
               if (
                  typeof obj != "undefined" &&
                  obj.hasOwnProperty("appbuilder_select_item") &&
                  obj.appbuilder_select_item == 1
               ) {
                  deleteTasks.push(function(next) {
                     CurrentObject.model()
                        .delete(obj.id)
                        .then((response) => {
                           next();
                        }, next);
                  });
               }
            });

            if (deleteTasks.length > 0) {
               OP.Dialog.Confirm({
                  title: L("ab.massDelete.title", "*Delete Multiple Records"),
                  text: L(
                     "ab.massDelete.description",
                     "*Are you sure you want to delete the selected records?"
                  ),
                  callback: function(result) {
                     if (result) {
                        async.parallel(deleteTasks, function(err) {
                           if (err) {
                              // TODO : Error message
                           } else {
                              // Anything we need to do after we are done.
                              _logic.disableUpdateDelete();
                           }
                        });
                     }
                  }
               });
            } else {
               OP.Dialog.Alert({
                  title: "No Records Selected",
                  text:
                     "You need to select at least one record...did you drink your coffee today?"
               });
            }
         },

         toolbarFilter: ($view) => {
            filterUI.showPopup($view);
         },

         toolbarSort: ($view) => {
            PopupSortDataTableComponent.show($view);
         },

         toolbarExport: ($view) => {
            exportPopup.show($view);
         },

         toolbarMassUpdate: function($view) {
            PopupMassUpdateComponent.show($view);
         }
      };

      var _onShow = () => {
         baseCom.onShow();

         if ($$(DataTable.ui.id)) {
            $$(DataTable.ui.id).adjust();
         }

         var dv = this.datacollection;
         if (dv) {
            this.eventAdd({
               emitter: dv,
               eventName: "changeCursor",
               listener: _logic.selectRow
            });
         }
      };

      return {
         ui: tableUI,
         init: _init,
         logic: _logic,

         onShow: _onShow
      };
   }

   populateEditor(ids, view) {
      // Set the objects you can choose from in the list
      var defaultOption = {
         id: "",
         value: L("ab.component.label.selectObject", "*Select an object")
      };

      // Pull data collections to options
      var objectOptions = view.application.datacollections().map((dc) => {
         return {
            id: dc.id,
            value: dc.label
         };
      });
      objectOptions.unshift(defaultOption);
      $$(ids.datacollection).define("options", objectOptions);
      $$(ids.datacollection).refresh();
      if (view.settings.datacollection != "") {
         $$(ids.datacollection).setValue(view.settings.dataviewID);
         // $$(ids.linkedObject).show();
      } else {
         $$(ids.datacollection).setValue("");
         // $$(ids.linkedObject).hide();
      }

      // Grouping options
      let groupFields = [];
      let dv = this.datacollection;
      if (dv && dv.datasource) {
         dv.datasource
            .fields((f) => {
               return (
                  f.key != "connectObject" &&
                  view.settings.objectWorkspace.hiddenFields.indexOf(
                     f.columnName
                  ) < 0
               );
            })
            .forEach((f) => {
               groupFields.push({
                  id: f.columnName,
                  value: f.label
               });
            });
      }
      $$(ids.groupBy).define("options", groupFields);
      $$(ids.groupBy).refresh();

      this.propertyGroupByList(ids, view.settings.groupBy);
   }

   populatePopupEditors(view, dataSource) {
      var dv = this.datacollection;
      if (!dv) return;

      let object = dv.datasource;
      if (!object) return;

      PopupHideFieldComponent.objectLoad(object);
      PopupHideFieldComponent.setValue(
         view.settings.objectWorkspace.hiddenFields || []
      );
      PopupHideFieldComponent.setFrozenColumnID(
         view.settings.objectWorkspace.frozenColumnID || ""
      );
      PopupFrozenColumnsComponent.objectLoad(object);
      PopupFrozenColumnsComponent.setValue(
         view.settings.objectWorkspace.frozenColumnID || ""
      );
      PopupFrozenColumnsComponent.setHiddenFields(
         view.settings.objectWorkspace.hiddenFields || []
      );

      PopupFilterProperty.objectLoad(object);
      PopupFilterProperty.setSettings(view.settings.gridFilter);

      PopupSummaryColumnsComponent.objectLoad(object, view);
      PopupSummaryColumnsComponent.setValue(
         view.settings.objectWorkspace.summaryColumns || []
      );

      PopupCountColumnsComponent.objectLoad(object, view);
      PopupCountColumnsComponent.setValue(
         view.settings.objectWorkspace.countColumns || []
      );
   }

   populateBadgeNumber(ids, view) {
      // set badge numbers to setting buttons
      if (
         view.settings.objectWorkspace &&
         view.settings.objectWorkspace.hiddenFields
      ) {
         $$(ids.buttonFieldsVisible).define(
            "badge",
            view.settings.objectWorkspace.hiddenFields.length || null
         );
         $$(ids.buttonFieldsVisible).refresh();
      } else {
         $$(ids.buttonFieldsVisible).define("badge", null);
         $$(ids.buttonFieldsVisible).refresh();
      }

      if (view.settings.gridFilter && view.settings.gridFilter.filterOption) {
         $$(ids.buttonFilterData).define("badge", "Y");
         $$(ids.buttonFilterData).refresh();
      } else {
         $$(ids.buttonFilterData).define("badge", null);
         $$(ids.buttonFilterData).refresh();
      }

      if (
         view.settings.objectWorkspace &&
         view.settings.objectWorkspace.frozenColumnID
      ) {
         $$(ids.buttonFieldsFreeze).define("badge", "Y");
         $$(ids.buttonFieldsFreeze).refresh();
      } else {
         $$(ids.buttonFieldsFreeze).define("badge", null);
         $$(ids.buttonFieldsFreeze).refresh();
      }

      if (
         view.settings.objectWorkspace &&
         view.settings.objectWorkspace.summaryColumns
      ) {
         $$(ids.buttonSummaryFields).define(
            "badge",
            view.settings.objectWorkspace.summaryColumns.length || null
         );
         $$(ids.buttonSummaryFields).refresh();
      } else {
         $$(ids.buttonSummaryFields).define("badge", null);
         $$(ids.buttonSummaryFields).refresh();
      }

      if (
         view.settings.objectWorkspace &&
         view.settings.objectWorkspace.countColumns
      ) {
         $$(ids.buttonCountFields).define(
            "badge",
            view.settings.objectWorkspace.countColumns.length || null
         );
         $$(ids.buttonCountFields).refresh();
      } else {
         $$(ids.buttonCountFields).define("badge", null);
         $$(ids.buttonCountFields).refresh();
      }
   }

   get filterHelper() {
      if (this.__filterHelper == null)
         this.__filterHelper = new ABViewPropertyFilterData();

      return this.__filterHelper;
   }

   get linkPageHelper() {
      if (this.__linkPageHelper == null)
         this.__linkPageHelper = new ABViewPropertyLinkPage();

      return this.__linkPageHelper;
   }
};
