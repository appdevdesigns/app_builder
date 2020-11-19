//
// ABViewRuleActionFormSubmitRuleExistPage
//
//
//
const ABViewRuleAction = require("../ABViewRuleAction");

module.exports = class ABViewRuleActionFormSubmitRuleExistPage extends ABViewRuleAction {
   /**
    * @param {object} App
    *      The shared App object that is created in OP.Component
    * @param {string} idBase
    *      Identifier for this component
    */
   constructor(App, idBase) {
      super();
      var L = function(key, altText) {
         return AD.lang.label.getLabel(key) || altText;
      };

      this.App = App;
      this.key = "ABViewRuleActionFormSubmitRuleExistPage";
      this.label = L(
         "ab.component.ruleaction.abviewruleActionFormSubmitRuleExistPage",
         "*Redirect to an existing page"
      );

      this.currentObject = null; // the object this Action is tied to.

      this.formRows = []; // keep track of the Value Components being set
      // [
      //		{ fieldId: xxx, value:yyy, type:key['string', 'number', 'date',...]}
      // ]

      // Labels for UI components
      var labels = (this.labels = {
         // common: App.labels,
         component: {}
      });
   }

   // conditionFields() {
   //    var fieldTypes = ["string", "number", "date", "formula", "calculate"];

   //    var currFields = [];

   //    if (this.currentObject) {
   //       this.currentObject.fields().forEach((f) => {
   //          if (fieldTypes.indexOf(f.key) != -1) {
   //             // NOTE: the .id value must match the obj[.id]  in the data set
   //             // so if your object data looks like:
   //             // 	{
   //             //		name_first:'Neo',
   //             //		name_last: 'The One'
   //             //  },
   //             // then the ids should be:
   //             // { id:'name_first', value:'xxx', type:'string' }
   //             currFields.push({
   //                id: f.columnName,
   //                value: f.label,
   //                type: f.key
   //             });
   //          }
   //       });
   //    }

   //    return currFields;
   // }

   // valueDisplayComponent
   // Return an ABView to display our values form.
   //
   valueDisplayComponent(idBase) {
      var ids = {
         pagesAndTabs: idBase + "_PagesAndTabs"
      };

      this._ui = {
         ui: { id: ids.pagesAndTabs, view: "richselect", options: [] },

         init: () => {
            _logic.populateOptions();
         },

         _logic: _logic,

         fromSettings: (valueRules) => {
            _logic.fromSettings(valueRules);
         },
         toSettings: () => {
            return _logic.toSettings();
         }
      };

      var _logic = {
         populateOptions: () => {
            // Pull page list to "Redirect to an existing page"
            var _pageOptions = [];

            /**
             * @param pageOrTab	{Object}	- ABViewPage or ABViewTab
             * @param indent	{integer}
             * @param type		{string}	- 'page' or 'tab'
             * @param pageId	{uuid}		- the id of page (only tab)
             */
            var addPage = (pageOrTab, indent, type, pageId) => {
               indent = indent || "";

               let icon = "fa fa-file-o";
               if (type == "tab") icon = "fa fa-window-maximize";

               let pageParent = pageOrTab.pageParent();

               _pageOptions.push({
                  id: pageOrTab.id,
                  value: indent + pageOrTab.label,
                  type: type,
                  pageId: pageParent ? pageParent.id : null,

                  icon: icon
               });

               if (type == "page" || type == "tab") {
                  if (pageOrTab.pages) {
                     pageOrTab.pages().forEach(function(p) {
                        addPage(p, indent + "-", "page");
                     });
                  }

                  // add 'tab' options
                  if (pageOrTab.views) {
                     pageOrTab
                        .views((v) => v.key == "tab")
                        .forEach((tab) => {
                           // add 'tab view' to options
                           tab.views().forEach((tabView) => {
                              addPage(
                                 tabView,
                                 indent + "-",
                                 "tab",
                                 pageOrTab.id
                              );
                           });
                        });
                  }
               }
            };

            addPage(this.currentForm.pageRoot(), "", "page");

            $$(ids.pagesAndTabs).define("options", _pageOptions);
            $$(ids.pagesAndTabs).refresh();
         },

         fromSettings: (valueRules) => {
            valueRules = valueRules || {};

            $$(ids.pagesAndTabs).setValue(
               valueRules.tabId || valueRules.pageId || ""
            );
         },

         toSettings: () => {
            var result = {};

            var selectedId = $$(ids.pagesAndTabs).getValue();
            var selectedItem = $$(ids.pagesAndTabs)
               .getPopup()
               .getList()
               .config.data.filter((opt) => opt.id == selectedId)[0];
            if (selectedItem) {
               if (selectedItem.type == "tab") {
                  // store page id and tab id
                  result = {
                     pageId: selectedItem.pageId,
                     tabId: selectedId
                  };
               } else {
                  // store only page id
                  result = {
                     pageId: selectedId
                  };
               }
            }

            // return the confirm message
            return result;
         }
      };

      return this._ui;
   }

   // process
   // gets called when a form is submitted and the data passes the Query Builder Rules.
   // @param {obj} options
   process(options) {
      return new Promise((resolve, reject) => {
         // redirect page
         if (this.valueRules.pageId) {
            options.form.changePage(this.valueRules.pageId);

            if (this.valueRules.tabId) {
               var curPage = options.form.application.pages(
                  (p) => p.id == this.valueRules.pageId,
                  true
               )[0];
               if (!curPage) return resolve();

               // switch tab
               var tabView = curPage.views(
                  (v) => v.id == this.valueRules.tabId,
                  true
               )[0];
               if (!tabView) return resolve();

               var tab = tabView.parent;
               if (!tab) return resolve();

               var toggleParent = (element) => {
                  if (!element.parent) return false;
                  var parentElem = element.parent;
                  if (!parentElem.parent) return false;
                  parentElem.parent.emit("changeTab", parentElem.id);
                  toggleParent(parentElem.parent);
               };

               toggleParent(tab);
               let showIt = setInterval(function() {
                  if ($$(tabView.id) && $$(tabView.id).isVisible()) {
                     clearInterval(showIt);
                     return;
                  }
                  tab.emit("changeTab", tabView.id);
               }, 100);
            }
         }

         resolve();
      });
   }

   // fromSettings
   // initialize this Action from a given set of setting values.
   // @param {obj}  settings
   fromSettings(settings) {
      settings = settings || {};
      super.fromSettings(settings); // let the parent handle the QB

      // if we have a display component, then populate it:
      if (this._ui) {
         // now we handle our valueRules:{} object settings.
         // pass the settings off to our DisplayList component:
         this._ui.fromSettings(settings.valueRules);
      }
   }

   // toSettings
   // return an object that represents the current state of this Action
   // @return {obj}
   toSettings() {
      // settings: {
      //	message:''
      // }

      // let our parent store our QB settings
      var settings = super.toSettings();

      settings.valueRules = this._ui.toSettings();

      return settings;
   }
};

