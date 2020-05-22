const ABViewProperty = require("./ABViewProperty");

var L = (key, altText) => {
   return AD.lang.label.getLabel(key) || altText;
};

module.exports = class ABViewPropertyLinkPage extends ABViewProperty {
   constructor() {
      super();
   }

   /**
    * @property default
    * return default settings
    *
    * @return {Object}
    */
   static get default() {
      return {
         detailsPage: null, // uuid
         detailsTab: null, // uuid
         editPage: null, // uuid
         editTab: null // uuid
      };
   }

   static propertyComponent(App, idBase) {
      let base = super.propertyComponent();

      let ids = {
         detailsPage: idBase + "_linkPage_detailsPage",
         editPage: idBase + "_linkPage_editPage"
      };

      let labels = {
         common: App.labels,
         component: {
            // header: L("ab.component.grid.filterMenu", "*Filter Menu")
         }
      };

      let ui = {
         view: "fieldset",
         label: L("ab.component.label.linkedPages", "*Linked Pages:"),
         labelWidth: App.config.labelWidthLarge,
         body: {
            type: "clean",
            padding: 10,
            rows: [
               {
                  id: ids.detailsPage,
                  view: "select",
                  name: "detailsPage",
                  label: L("ab.component.label.detailsPage", "*Details Page:"),
                  labelWidth: App.config.labelWidthLarge
               },
               {
                  id: ids.editPage,
                  view: "select",
                  name: "editPage",
                  label: L("ab.component.label.editForm", "*Edit Form:"),
                  labelWidth: App.config.labelWidthLarge
               }
            ]
         }
      };

      let init = (options) => {
         // register callbacks:
         for (var c in logic.callbacks) {
            logic.callbacks[c] = options[c] || logic.callbacks[c];
         }
      };

      let logic = {
         callbacks: {
            // onCancel: function () { console.warn('NO onCancel()!') },
         },

         viewLoad: (view) => {
            this.view = view;

            let filter = (v, widgetKey) => {
               return (
                  v.key == widgetKey &&
                  v.settings.dataviewID == view.settings.dataviewID
               );
            };

            // Set the options of the possible detail views
            let pagesHasDetail = [];

            pagesHasDetail = pagesHasDetail.concat(
               view
                  .pageRoot()
                  .views((v) => {
                     return filter(v, "detail");
                  }, true)
                  .map((p) => {
                     return {
                        id: p.id,
                        value: p.label
                     };
                  })
            );

            pagesHasDetail = pagesHasDetail.concat(
               view
                  .pageRoot()
                  .pages((p) => {
                     return p.views((v) => {
                        return filter(v, "detail");
                     }, true).length;
                  }, true)
                  .map((p) => {
                     return {
                        id: p.id,
                        value: p.label
                     };
                  })
            );

            pagesHasDetail.unshift({
               id: "",
               value: L("ab.component.label.noLinkedView", "*No linked view")
            });
            $$(ids.detailsPage).define("options", pagesHasDetail);
            $$(ids.detailsPage).refresh();

            // Set the options of the possible edit forms
            let pagesHasForm = [];

            pagesHasForm = pagesHasForm.concat(
               view
                  .pageRoot()
                  .views((v) => {
                     return filter(v, "form");
                  }, true)
                  .map((p) => {
                     return {
                        id: p.id,
                        value: p.label
                     };
                  })
            );

            pagesHasForm = pagesHasForm.concat(
               view
                  .pageRoot()
                  .pages((p) => {
                     return p.views((v) => {
                        return filter(v, "form");
                     }, true).length;
                  }, true)
                  .map((p) => {
                     return {
                        id: p.id,
                        value: p.label
                     };
                  })
            );

            pagesHasForm.unshift({
               id: "",
               value: L("ab.component.label.noLinkedForm", "*No linked form")
            });
            $$(ids.editPage).define("options", pagesHasForm);
            $$(ids.editPage).refresh();
         },

         setSettings: (settings) => {
            var details = settings.detailsPage;
            if (settings.detailsTab != "") {
               details += ":" + settings.detailsTab;
            }
            $$(ids.detailsPage).setValue(details);

            var edit = settings.editPage;
            if (settings.editTab != "") {
               edit += ":" + settings.editTab;
            }
            $$(ids.editPage).setValue(edit);
         },

         getSettings: () => {
            let settings = {};

            var detailsPage = $$(ids.detailsPage).getValue();
            var detailsTab = "";
            if (detailsPage.split(":").length > 1) {
               var detailsVals = detailsPage.split(":");
               detailsPage = detailsVals[0];
               detailsTab = detailsVals[1];
            }
            settings.detailsPage = detailsPage;
            settings.detailsTab = detailsTab;

            var editPage = $$(ids.editPage).getValue();
            var editTab = "";
            if (editPage.split(":").length > 1) {
               var editVals = editPage.split(":");
               editPage = editVals[0];
               editTab = editVals[1];
            }
            settings.editPage = editPage;
            settings.editTab = editTab;

            return settings;
         }
      };

      return {
         ui: ui,
         init: init,
         logic: logic,

         viewLoad: logic.viewLoad,
         setSettings: logic.setSettings,
         getSettings: logic.getSettings
      };
   }

   /** == UI == */
   /**
    * @param {object} App
    *      The shared App object that is created in OP.Component
    * @param {string} idBase
    *      Identifier for this component
    */
   component(App, idBase) {
      let base = super.component(App, idBase);

      /**
       * @method init
       * @param {Object} options - {
       * 								view: {ABView},
       * 								datacollection: {ABDatacollection}
       * 							}
       */
      let init = (options) => {
         base.init(options);

         if (options.view) this.view = options.view;

         if (options.datacollection)
            this.datacollection = options.datacollection;
      };

      let logic = {
         changePage: (pageId, rowId) => {
            if (this.datacollection) this.datacollection.setCursor(rowId);

            if (this.view) this.view.changePage(pageId);
         }
      };

      return {
         ui: base.ui,
         init: init,
         logic: logic,

         changePage: logic.changePage
      };
   }
};
