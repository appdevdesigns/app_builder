const ABViewCSVExporterCore = require("../../core/views/ABViewCSVExporterCore");

const RowFilter = require("../RowFilter");

const ABViewCSVExporterPropertyComponentDefaults = ABViewCSVExporterCore.defaultValues();

let PropertyFilter = null;

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABViewCSVExporter extends ABViewCSVExporterCore {
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
      let idBase = "ABViewCsvExporterEditorComponent";
      let component = this.component(App, idBase);

      return component;
   }

   //
   // Property Editor
   //

   static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {
      let idBase = "ABViewCSVExporter";

      let commonUI = super.propertyEditorDefaultElements(
         App,
         ids,
         _logic,
         ObjectDefaults
      );

      _logic.showFilterPopup = ($view) => {
         this.filter_popup.show($view, null, { pos: "top" });
      };

      _logic.onFilterChange = () => {
         let view = _logic.currentEditObject();
         let filterValues = PropertyFilter.getValue() || {};

         let allComplete = true;
         (filterValues.rules || []).forEach((f) => {
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
      };

      // create filter popups
      this.initPopupEditors(App, ids, _logic);

      // _logic functions

      _logic.selectSource = (dcId, oldDcId) => {
         let currView = _logic.currentEditObject();

         // this.propertyUpdateRules(ids, currView);

         // refresh UI
         currView.emit("properties.updated", currView);

         // save
         currView.settings.dataviewID = dcId;
         this.propertyEditorValues(ids, currView);
         currView.save();
      };

      return commonUI.concat([
         {
            view: "fieldset",
            label: L("ab.component.label.dataSource", "*Data:"),
            labelWidth: App.config.labelWidthLarge,
            body: {
               rows: [
                  {
                     name: "datacollection",
                     view: "richselect",
                     label: L("ab.components.form.dataSource", "*Data Source"),
                     labelWidth: App.config.labelWidthLarge,
                     skipAutoSave: true,
                     on: {
                        onChange: _logic.selectSource
                     }
                  },
                  {
                     name: "hasHeader",
                     view: "checkbox",
                     label: L(
                        "ab.components.csvExporter.hasHeader",
                        "*Header on first line"
                     ),
                     labelWidth: App.config.labelWidthXLarge
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
                           width: App.config.labelWidthLarge
                        },
                        {
                           view: "button",
                           name: "filterMenuButton",
                           css: "webix_primary",
                           label: L("ab.component.label.settings", "*Settings"),
                           icon: "fa fa-gear",
                           type: "icon",
                           badge: 0,
                           click: function() {
                              _logic.showFilterPopup(this.$view);
                           }
                        }
                     ]
                  }
               ]
            }
         },
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
                     name: "buttonLabel",
                     view: "text",
                     label: L("ab.components.csvExporter.label", "*Label"),
                     labelWidth: App.config.labelWidthLarge
                  },
                  {
                     name: "filename",
                     view: "text",
                     label: L(
                        "ab.components.csvExporter.filename",
                        "*File name"
                     ),
                     labelWidth: App.config.labelWidthLarge
                  },
                  {
                     view: "counter",
                     name: "width",
                     label: L("ab.components.csvExporter.width", "*Width:"),
                     labelWidth: App.config.labelWidthLarge
                  }
               ]
            }
         }
      ]);
   }

   static propertyEditorPopulate(App, ids, view) {
      super.propertyEditorPopulate(App, ids, view);

      // Pull data views to options
      let dcOptions = view.application.datacollections().map((dc) => {
         return {
            id: dc.id,
            value: dc.label
         };
      });

      let $DcSelector = $$(ids.datacollection);
      $DcSelector.define("options", dcOptions);
      $DcSelector.define("value", view.settings.dataviewID || null);
      $DcSelector.refresh();

      $$(ids.hasHeader).setValue(
         view.settings.hasHeader ||
            ABViewCSVExporterPropertyComponentDefaults.hasHeader
      );
      $$(ids.buttonLabel).setValue(
         view.settings.buttonLabel ||
            ABViewCSVExporterPropertyComponentDefaults.buttonLabel
      );
      $$(ids.filename).setValue(
         view.settings.filename ||
            ABViewCSVExporterPropertyComponentDefaults.filename
      );
      $$(ids.width).setValue(
         view.settings.width || ABViewCSVExporterPropertyComponentDefaults.width
      );

      // Populate data to popups
      PropertyFilter.applicationLoad(view.application);
      let dc = view.datacollection;
      let obj = dc ? dc.datasource : null;
      if (obj) {
         PropertyFilter.fieldsLoad(obj.fields());
      } else {
         PropertyFilter.fieldsLoad([]);
      }
      PropertyFilter.setValue(view.settings.where);

      this.propertyBadgeNumber(ids, view);

      //   // when a change is made in the properties the popups need to reflect the change
      //   this.updateEventIds = this.updateEventIds || {}; // { viewId: boolean, ..., viewIdn: boolean }
      //   if (!this.updateEventIds[view.id]) {
      //      this.updateEventIds[view.id] = true;

      //      view.addListener("properties.updated", () => {
      //         this.populateBadgeNumber(ids, view);
      //      });
      //   }
   }

   static initPopupEditors(App, ids, _logic) {
      var idBase = "ABViewCSVExporterPropertyEditor";

      PropertyFilter = new RowFilter(App, idBase + "_filter");
      PropertyFilter.init({
         // when we make a change in the popups we want to make sure we save the new workspace to the properties to do so just fire an onChange event
         onChange: _logic.onFilterChange
      });

      this.filter_popup = webix.ui({
         view: "popup",
         width: 800,
         hidden: true,
         body: PropertyFilter.ui
      });
   }

   static propertyEditorValues(ids, view) {
      super.propertyEditorValues(ids, view);

      view.settings.dataviewID = $$(ids.datacollection).getValue();
      view.settings.hasHeader = $$(ids.hasHeader).getValue();
      view.settings.where = PropertyFilter.getValue();

      view.settings.buttonLabel =
         $$(ids.buttonLabel).getValue() ||
         ABViewCSVExporterPropertyComponentDefaults.buttonLabel;

      view.settings.filename =
         $$(ids.filename).getValue() ||
         ABViewCSVExporterPropertyComponentDefaults.filename;

      view.settings.width =
         $$(ids.width).getValue() ||
         ABViewCSVExporterPropertyComponentDefaults.width;

      this.propertyBadgeNumber(ids, view);
   }

   static propertyBadgeNumber(ids, view) {
      if (view.settings.where && view.settings.where.rules) {
         $$(ids.filterMenuButton).define(
            "badge",
            view.settings.where.rules.length
         );
         $$(ids.filterMenuButton).refresh();
      } else {
         $$(ids.filterMenuButton).define("badge", null);
         $$(ids.filterMenuButton).refresh();
      }
   }

   component(App, idBase) {
      idBase = idBase || "ABCSVExporter_" + this.id;
      let ids = {
         button: App.unique(idBase + "_button"),
         buttonFilter: App.unique(idBase + "_button_filter"),
         popupFilter: App.unique(idBase + "_popup_filter")
      };
      let labels = {
         common: App.labels,
         component: {}
      };

      let ClientFilter = new RowFilter(App, idBase + "_filter");

      let _ui = {
         view: "layout",
         type: "clean",
         borderless: true,
         cols: [
            {
               id: ids.buttonFilter,
               view: "button",
               css: "webix_transparent",
               type: "icon",
               icon: "fa fa-filter",
               borderless: true,
               width: 50,
               label: "",
               click: () => {
                  _logic.showFilterPopup();
               }
            },
            {
               id: ids.button,
               view: "button",
               css: "webix_primary",
               type: "icon",
               icon: "fa fa-download",
               borderless: true,
               width:
                  this.settings.width ||
                  ABViewCSVExporterPropertyComponentDefaults.width,
               label:
                  this.settings.buttonLabel ||
                  ABViewCSVExporterPropertyComponentDefaults.buttonLabel,
               click: () => {
                  _logic.downloadCsvFile();
               }
            },
            { fillspace: true }
         ]
      };

      // make sure each of our child views get .init() called
      let _init = (options) => {
         let dc = this.datacollection;
         if (dc) {
            let obj = dc.datasource;

            ClientFilter.applicationLoad(obj ? obj.application : null);
            ClientFilter.fieldsLoad(obj ? obj.fields() : []);
         }

         ClientFilter.init({
            onChange: _logic.onFilterChange
         });
         webix.ui({
            view: "popup",
            id: ids.popupFilter,
            width: 800,
            hidden: true,
            body: ClientFilter.ui
         });
      };

      let _logic = (this._logic = {
         downloadCsvFile: () => {
            let url = `/app_builder/application/${this.application.id}/page/${
               this.pageRoot().id
            }/view/${this.id}/csv`;

            let where = ClientFilter.getValue();
            if (where && (where.rules || []).length) {
               var t = [];

               // Convert a object to Web Query String
               for (var a in where) {
                  var value = where[a];
                  if (value === null || value === undefined) value = "";
                  if (typeof value === "object") value = JSON.stringify(value);
                  t.push(a + "=" + encodeURIComponent(value));
               }
               where = t.join("&");

               url = `${url}?${where}`;
            }

            window.open(url);
         },
         showFilterPopup: () => {
            let $buttonFilter = $$(ids.buttonFilter);
            let $popupFilter = $$(ids.popupFilter);
            if (!$popupFilter) return;

            $popupFilter.show($buttonFilter ? $buttonFilter.$view : null);
         },
         onFilterChange: () => {
            let $buttonFilter = $$(ids.buttonFilter);
            if (!$buttonFilter) return;

            let where = ClientFilter.getValue();
            $buttonFilter.define("badge", (where.rules || []).length || null);
            $buttonFilter.refresh();
         }
      });

      return {
         ui: _ui,
         init: _init
      };
   }
};
