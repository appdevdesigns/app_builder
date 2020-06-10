const ABViewDataviewCore = require("../../core/views/ABViewDataviewCore");
const ABViewPropertyLinkPage = require("./viewProperties/ABViewPropertyLinkPage");

const ABViewDataviewDefaults = ABViewDataviewCore.defaultValues();

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABViewDataview extends ABViewDataviewCore {
   constructor(values, application, parent, defaultValues) {
      super(values, application, parent, defaultValues);
   }

   //
   // Property Editor
   //

   static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {
      var idBase = "ABViewDataviewPropertyEditor";

      var commonUI = super.propertyEditorDefaultElements(
         App,
         ids,
         _logic,
         ObjectDefaults
      );

      this.linkPageComponent = ABViewPropertyLinkPage.propertyComponent(
         App,
         idBase
      );

      return commonUI.concat([
         {
            view: "counter",
            name: "xCount",
            min: 1, // we cannot have 0 columns per row so lets not accept it
            label: L("ab.components.dataview.xCount", "*Items in a row"),
            labelWidth: App.config.labelWidthLarge,
            step: 1
         },
         this.linkPageComponent.ui
      ]);
   }

   static propertyEditorPopulate(App, ids, view) {
      super.propertyEditorPopulate(App, ids, view);

      $$(ids.xCount).setValue(
         view.settings.xCount || ABViewDataviewDefaults.xCount
      );

      this.linkPageComponent.viewLoad(view);
      this.linkPageComponent.setSettings(view.settings);
   }

   static propertyEditorValues(ids, view) {
      super.propertyEditorValues(ids, view);

      view.settings.xCount = $$(ids.xCount).getValue();

      let linkSettings = this.linkPageComponent.getSettings();
      for (let key in linkSettings) {
         view.settings[key] = linkSettings[key];
      }
   }

   /**
    * @method fromValues()
    *
    * initialze this object with the given set of values.
    * @param {obj} values
    */
   fromValues(values) {
      super.fromValues(values);

      this.settings.detailsPage =
         this.settings.detailsPage || ABViewDataviewDefaults.detailsPage;
      this.settings.editPage =
         this.settings.editPage || ABViewDataviewDefaults.editPage;
      this.settings.detailsTab =
         this.settings.detailsTab || ABViewDataviewDefaults.detailsTab;
      this.settings.editTab =
         this.settings.editTab || ABViewDataviewDefaults.editTab;
   }

   /**
    * @method component()
    * return a UI component based upon this view.
    * @param {obj } App
    * @return {obj } UI component
    */
   component(App) {
      var com = {};

      var idBase = "ABViewDataview_" + this.id;
      var ids = {
         scrollview: App.unique(idBase + "_scrollview"),
         component: App.unique(idBase + "_component")
      };

      let linkPage = this.linkPageHelper.component(App, idBase);

      com.ui = {
         id: ids.scrollview,
         view: "scrollview",
         scroll: "y",
         body: {
            id: ids.component,
            view: "layout",
            paddingX: 15,
            paddingY: 19,
            type: "space",
            rows: []
         },
         on: {
            onAfterScroll: function() {
               let pos = this.getScrollState();

               com.logic.scroll(pos);
            }
         }
      };

      if (this.settings.height) com.ui.height = this.settings.height;

      com.init = (options) => {
         var dc = this.datacollection;
         if (!dc) return;

         // initial the link page helper
         linkPage.init({
            view: this,
            datacollection: dc
         });

         com.onShow();

         this.eventAdd({
            emitter: dc,
            eventName: "loadData",
            listener: () => {
               com.onShow();
            }
         });

         if (dc.dataStatus == dc.dataStatusFlag.notInitial) {
            // load data when a widget is showing
            dc.loadData();
         }
      };

      com.logic = {
         busy: () => {
            let Layout = $$(ids.component);

            Layout.disable();

            if (Layout.showProgress) Layout.showProgress({ type: "icon" });
         },

         ready: () => {
            let Layout = $$(ids.component);

            Layout.enable();

            if (Layout.hideProgress) Layout.hideProgress();
         },

         // we need to recursivly look backwards to toggle tabs into view when a user choosed to select a tab for edit or details views
         toggleTab: (parentTab, wb) => {
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
            var nextTab = tabbar.queryView({ view: "scrollview" }, "parent");
            // if so then do this again
            if (nextTab) {
               com.toggleTab(nextTab, wb);
            }
         },

         /**
          * @method scroll
          * @param pos - {
          * 					x: {integer},
          * 					y: {integer}
          * 				}
          */
         scroll: (pos) => {
            let loadWhen = 40;

            let y = pos.y;
            let maxYPos =
               $$(ids.component).$height - $$(ids.scrollview).$height;
            if (maxYPos - y <= loadWhen) {
               if (this.loadMoreTimer) return;

               var dc = this.datacollection;
               if (!dc) return;

               if (this._rowCount >= dc.totalCount) return;

               // loading cursor
               com.logic.busy();

               dc.loadData(this._rowCount || 0)
                  .catch(() => {
                     com.logic.ready();
                  })
                  .then(() => {
                     com.logic.ready();
                  });

               this.loadMoreTimer = setTimeout(() => {
                  this.loadMoreTimer = null;
               }, 1100);
            }
         }
      };

      com.onShow = () => {
         var editPage = this.settings.editPage;
         var detailsPage = this.settings.detailsPage;
         var editTab = this.settings.editTab;
         var detailsTab = this.settings.detailsTab;
         var accessLevel = this.parent.getUserAccess();

         let baseCom = super.component(App, this.id);
         baseCom.onShow();

         // clear UI
         webix.ui(
            [
               {
                  view: "label",
                  label: "No data",
                  height: 50,
                  align: "center"
               }
            ],
            $$(ids.component)
         );

         var dc = this.datacollection;
         if (!dc) return;

         // add loading cursor
         var Layout = $$(ids.component);
         if (Layout) webix.extend(Layout, webix.ProgressBar);

         var rows = dc.getData();

         // store total of rows
         this._rowCount = rows.length;

         // lets build a grid based off the number of columns we want in each row
         var dataGrid = [];
         var colCount = 1; // start with column 1
         var rowObj = { cols: [] }; // create row that has a cols array to push items into
         // loop through items and put them into columns
         rows.forEach((row) => {
            // if the column value is higher than the number of columns allowed begin a new row
            if (colCount > parseInt(this.settings.xCount)) {
               dataGrid.push(rowObj);
               rowObj = { cols: [] };
               colCount = 1;
            }

            // get the components configuation
            let detailCom = _.cloneDeep(super.component(App, row.id));

            // adjust the UI to make sure it will look like a "card"
            detailCom.ui.type = "space";
            detailCom.ui.css = "ab-detail-view";
            if (detailsPage || editPage) {
               detailCom.ui.css += " ab-detail-hover ab-record-" + row.id;
            }
            if (detailsPage) {
               detailCom.ui.css += " ab-detail-page";
            }
            if (editPage) {
               detailCom.ui.css += " ab-edit-page";
            }
            detailCom.ui.paddingX = 10;
            detailCom.ui.paddingY = 6;

            // put the component into the column
            rowObj.cols.push(detailCom.ui);

            // we are done with this column move to the next
            colCount++;
         });

         // get any empty cols with number of colums minus the mod of the length and the xCount
         var emptyCols =
            parseInt(this.settings.xCount) -
            (rows.length % parseInt(this.settings.xCount));

         // make sure that we need emptyCols, that we are doing more than one column per row and that the emptyCols does not equal the number per row
         if (
            emptyCols &&
            parseInt(this.settings.xCount) > 1 &&
            emptyCols != parseInt(this.settings.xCount)
         ) {
            for (var i = 0; i < emptyCols; i++) {
               // add a spacer to fill column space
               rowObj.cols.push({});
            }
         }

         // push in the last row
         dataGrid.push(rowObj);

         // dynamically create the UI with this new configuration
         webix.ui(dataGrid, $$(ids.component));

         if (detailsPage || editPage) {
            $$(ids.component).$view.onclick = (e) => {
               var clicked = false;
               if (editPage) {
                  for (let p of e.path) {
                     if (
                        p.className &&
                        p.className.indexOf("webix_accordionitem_header") > -1
                     ) {
                        clicked = true;
                        $(p.parentNode.parentNode)[0].classList.forEach((c) => {
                           if (c.indexOf("ab-record-") > -1) {
                              // var record = parseInt(c.replace("ab-record-", ""));
                              var record = c.replace("ab-record-", "");
                              linkPage.changePage(editPage, record);
                              // com.logic.toggleTab(detailsTab, ids.component);
                           }
                        });
                        break;
                     }
                  }
               }
               if (detailsPage && !clicked) {
                  for (let p of e.path) {
                     if (
                        p.className &&
                        p.className.indexOf("webix_accordionitem") > -1
                     ) {
                        $(p.parentNode.parentNode)[0].classList.forEach((c) => {
                           if (c.indexOf("ab-record-") > -1) {
                              // var record = parseInt(c.replace("ab-record-", ""));
                              var record = c.replace("ab-record-", "");
                              linkPage.changePage(detailsPage, record);
                              // com.logic.toggleTab(detailsTab, ids.component);
                           }
                        });
                        break;
                     }
                  }
               }
            };
         }

         // loop through the components so we can initialize their data
         // this has to be done after they have been attached to the view so we couldn't have done in the previous step
         rows.forEach((row) => {
            let detailCom = _.cloneDeep(super.component(App, row.id));

            detailCom.init(null, accessLevel);
            detailCom.logic.displayData(row);
         });

         $$(ids.scrollview).adjust();
      };

      return com;
   }

   get linkPageHelper() {
      if (this.__linkPageHelper == null)
         this.__linkPageHelper = new ABViewPropertyLinkPage();

      return this.__linkPageHelper;
   }
};
