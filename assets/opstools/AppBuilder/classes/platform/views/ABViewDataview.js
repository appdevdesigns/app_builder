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
         component: App.unique(idBase + "_component"),
         dataFlexView: App.unique(idBase + "_dataFlexView")
      };

      let linkPage = this.linkPageHelper.component(App, idBase);

      com.ui = {
         id: ids.component,
         body: {
            id: ids.scrollview,
            view: "scrollview",
            scroll: "y",
            body: {
               id: ids.dataFlexView,
               view: "flexlayout",
               paddingX: 15,
               paddingY: 19,
               type: "space",
               cols: []
            },
            on: {
               onAfterScroll: function() {
                  let pos = this.getScrollState();

                  com.logic.scroll(pos);
               }
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

         com.logic.busy();

         this.eventClear();

         this.eventAdd({
            emitter: dc,
            eventName: "loadData",
            listener: () => {
               com.renderData();
            }
         });
      };

      com.logic = {
         busy: () => {
            let Layout = $$(ids.dataFlexView);
            let Scroll = $$(ids.scrollview);

            // editor mode doesn't load this ui
            if (!Scroll || !Layout) return;

            Layout.disable();

            if (!Scroll.showProgress) {
               webix.extend(Scroll, webix.ProgressBar);
            }
            Scroll.showProgress({ type: "icon" });
         },

         ready: () => {
            let Layout = $$(ids.dataFlexView);
            let Scroll = $$(ids.scrollview);

            // editor mode doesn't load this ui
            if (!Scroll || !Layout) return;

            Layout.enable();

            if (Scroll && !Scroll.hideProgress) {
               webix.extend(Scroll, webix.ProgressBar);
            }
            Scroll.hideProgress();
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
               $$(ids.dataFlexView).$height - $$(ids.scrollview).$height;
            if (maxYPos - y <= loadWhen) {
               if (this.loadMoreTimer) return;

               com.setYPos(y);

               var dc = this.datacollection;
               if (!dc) return;

               if ($$(ids.dataFlexView).getChildViews().length >= dc.totalCount)
                  return;

               // loading cursor
               com.logic.busy();

               dc.loadData($$(ids.dataFlexView).getChildViews().length || 0)
                  .catch(() => {})
                  .then(() => {});

               this.loadMoreTimer = setTimeout(() => {
                  this.loadMoreTimer = null;
               }, 1100);
            }
         }
      };

      com.onShow = () => {
         var dc = this.datacollection;
         if (!dc) return;

         if (dc.dataStatus == dc.dataStatusFlag.notInitial) {
            // load data when a widget is showing
            dc.loadData();
         } else if (dc.dataStatus == dc.dataStatusFlag.initialized) {
            com.renderData();
         }
      };

      com.setYPos = (pos) => {
         this.yPosition = pos;
      };

      com.getYPos = () => {
         return this.yPosition || 0;
      };

      com.renderData = () => {
         var editPage = this.settings.editPage;
         var detailsPage = this.settings.detailsPage;
         var editTab = this.settings.editTab;
         var detailsTab = this.settings.detailsTab;
         var accessLevel = this.parent.getUserAccess();
         var records = [];

         var dc = this.datacollection;
         if (!dc) return;

         var Layout = $$(ids.dataFlexView) || $$(ids.component);

         var recordWidth = Math.floor(
            (Layout.$width - 20 - parseInt(this.settings.xCount) * 20) /
               parseInt(this.settings.xCount)
         );

         var rows = dc.getData();

         // if this amount of data is already parsed just skip the rest.
         if (Layout.currentLength == rows.length) return;

         Layout.currentLength = rows.length;

         // store total of rows
         this._startPos = Layout.getChildViews
            ? Layout.getChildViews().length
            : 0;

         let stopPos = rows.length;

         if (this._startPos == 0) {
            if (rows.length < 20) {
               stopPos = rows.length;
            } else {
               stopPos = 20;
            }
         } else if (rows.length - this._startPos > 20) {
            stopPos = this._startPos + 20;
         }

         if (dc.settings.loadAll) {
            stopPos = rows.length;
         }

         var dataGrid = [];
         for (var i = this._startPos; i < stopPos; i++) {
            // get the components configuation
            let detailCom = _.cloneDeep(super.component(App, rows[i].id));

            // adjust the UI to make sure it will look like a "card"
            detailCom.ui.type = "space";
            detailCom.ui.css = "ab-detail-view";
            if (detailsPage || editPage) {
               detailCom.ui.css += " ab-detail-hover ab-record-" + rows[i].id;
            }
            if (detailsPage) {
               detailCom.ui.css += " ab-detail-page";
            }
            if (editPage) {
               detailCom.ui.css += " ab-edit-page";
            }
            detailCom.ui.paddingX = 10;
            detailCom.ui.paddingY = 6;
            detailCom.ui.minWidth = recordWidth - 10;
            detailCom.ui.maxWidth = recordWidth;

            if (Layout.addView) {
               Layout.addView(detailCom.ui, -1);
               detailCom.init(null, accessLevel);
               setTimeout(detailCom.logic.displayData(rows[i]), 0);
            } else {
               records.push(detailCom.ui);
            }
         }

         if (records.length) {
            var flexlayout = {
               id: ids.dataFlexView,
               view: "flexlayout",
               paddingX: 15,
               paddingY: 19,
               type: "space",
               cols: records
            };
            webix.ui(flexlayout, $$(ids.component));

            for (var i = this._startPos; i < stopPos; i++) {
               let detailCom = _.cloneDeep(super.component(App, rows[i].id));
               detailCom.init(null, accessLevel);
               setTimeout(detailCom.logic.displayData(rows[i]), 0);
            }
         }

         if ($$(ids.scrollview)) {
            $$(ids.scrollview).scrollTo(0, com.getYPos());

            if (detailsPage || editPage) {
               Layout.$view.onclick = (e) => {
                  var clicked = false;
                  if (editPage) {
                     for (let p of e.path) {
                        if (
                           p.className &&
                           p.className.indexOf("webix_accordionitem_header") >
                              -1
                        ) {
                           clicked = true;
                           $(p.parentNode.parentNode)[0].classList.forEach(
                              (c) => {
                                 if (c.indexOf("ab-record-") > -1) {
                                    // var record = parseInt(c.replace("ab-record-", ""));
                                    var record = c.replace("ab-record-", "");
                                    linkPage.changePage(editPage, record);
                                    // com.logic.toggleTab(detailsTab, ids.component);
                                 }
                              }
                           );
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
                           $(p.parentNode.parentNode)[0].classList.forEach(
                              (c) => {
                                 if (c.indexOf("ab-record-") > -1) {
                                    // var record = parseInt(c.replace("ab-record-", ""));
                                    var record = c.replace("ab-record-", "");
                                    linkPage.changePage(detailsPage, record);
                                    // com.logic.toggleTab(detailsTab, ids.component);
                                 }
                              }
                           );
                           break;
                        }
                     }
                  }
               };
            }
         }

         com.logic.ready();
      };

      return com;
   }

   get linkPageHelper() {
      if (this.__linkPageHelper == null)
         this.__linkPageHelper = new ABViewPropertyLinkPage();

      return this.__linkPageHelper;
   }
};
