const ABViewProperty = require("./ABViewProperty");

let L = (key, altText) => {
   return AD.lang.label.getLabel(key) || altText;
};

module.exports = class ABViewPropertyAddPage extends ABViewProperty {
   /**
    * @property default
    * return default settings
    *
    * @return {Object}
    */
   static get default() {
      return {
         formView: "none" // id of form to add new data
      };
   }

   static propertyComponent(App, idBase) {
      let ids = {
         formView: idBase + "_formView"
      };

      let ui = {
         id: ids.formView,
         name: "formView",
         view: "richselect",
         label: L("ab.component.connect.form", "*Add New Form"),
         labelWidth: App.config.labelWidthXLarge,
         on: {
            onChange: (newVal, oldVal) => {
               if (
                  newVal == L("ab.component.connect.no", "*No add new option")
               ) {
                  $$(ids.formView).setValue("");
               }

               _logic.callbacks.onSave();
            }
         }
      };

      let _init = (options) => {
         for (let c in _logic.callbacks) {
            _logic.callbacks[c] = options[c] || _logic.callbacks[c];
         }
      };

      let _logic = {
         callbacks: {
            onSave: function() {
               console.warn("NO onSave()!");
            }
         },

         setSettings: (view, settings = {}) => {
            if (view == null) return;

            // Set the options of the possible edit forms
            let editForms = [
               {
                  id: "none",
                  value: L("ab.component.connect.no", "*No add new option")
               }
            ];

            let pagesHasForm = view
               .pageRoot()
               .pages((p) => {
                  return p.views((v) => {
                     return (
                        v &&
                        v.key == "form" &&
                        v.datacollection &&
                        v.datacollection.datasource &&
                        v.datacollection.datasource.id ==
                           view.field().settings.linkObject
                     );
                  }, true).length;
               }, true)
               .map((p) => {
                  return {
                     id: p.id,
                     value: p.label
                  };
               });

            editForms = editForms.concat(pagesHasForm);

            let $selector = $$(ids.formView);
            if ($selector) {
               $selector.define("options", editForms);
               $selector.define(
                  "value",
                  settings.formView || this.default.formView
               );
               $selector.refresh();
            }
         },

         getSettings: (view) => {
            let settings = view.settings || {};

            settings.formView = $$(ids.formView).getValue();

            return settings;
         }
      };

      return {
         ui: ui,
         init: _init,
         setSettings: _logic.setSettings,
         getSettings: _logic.getSettings
      };
   }

   fromSettings(settings = {}) {
      this.settings = this.settings || {};
      this.settings.formView =
         settings.formView || this.constructor.default.formView;
   }

   component(App, idBase) {
      let ids = {
         popup: App.unique(idBase + "_popup_add_new")
      };

      let ui = "";

      if (
         this.settings.formView &&
         this.settings.formView != this.constructor.default.formView
      ) {
         let iDiv = document.createElement("div");
         iDiv.className = "ab-connect-add-new";
         iDiv.innerHTML =
            '<a href="javascript:void(0);" class="fa fa-plus ab-connect-add-new-link"></a>';
         // iDiv.appendChild(node);
         ui = iDiv.outerHTML;
      }

      let _logic = {
         callbacks: {
            onSaveData: (saveData) => {
               if ($$(ids.popup)) $$(ids.popup).close();
            },
            onCancel: () => {
               if ($$(ids.popup)) $$(ids.popup).close();

               return false;
            },
            onClearOnLoad: () => {
               return true;
            }
         },

         applicationLoad: (application) => {
            this._application = application;
         },

         onClick: (dc) => {
            let pageId = this.settings.formView;
            let page = this._application.pages((p) => p.id == pageId, true)[0];

            return _logic.openFormPopup(page, dc);
         },

         /**
          * @method openFormPopup
          *
          * @param page {ABViewPage}
          * @param dc {ABDataCollection}
          */
         openFormPopup: (page, dc) => {
            return new Promise((resolve, reject) => {
               if (this._application == null) return resolve();

               if ($$(ids.popup)) {
                  $$(ids.popup).show();
                  return resolve();
               }

               // Clone page so we modify without causing problems
               let pageClone = page.copy(null, null, { ignoreSubPages: true });
               pageClone.id = OP.Util.uuid(); // lets take the stored id can create a new dynamic one so our views don't duplicate
               // pageClone.id = pageClone.id + "-" + webix.uid(); // lets take the stored id can create a new dynamic one so our views don't duplicate
               let popUpComp = pageClone.component(App);
               let ui = popUpComp.ui;

               let popupTemplate = {
                  view: "window",
                  id: ids.popup,
                  modal: true,
                  position: "center",
                  // position:function(stthis.__addPageToolate){
                  // 	state.left = x + 20this.__addPageTool; // offset the popups
                  // 	state.top = y + 20;this.__addPageTool
                  // },
                  resize: true,
                  width: parseInt(this.settings.popupWidth) || 700,
                  height: parseInt(this.settings.popupHeight) + 44 || 450,
                  css: "ab-main-container",
                  head: {
                     view: "toolbar",
                     css: "webix_dark",
                     cols: [
                        {
                           view: "label",
                           label: page.label,
                           css: "modal_title",
                           align: "center"
                        },
                        {
                           view: "button",
                           label: "Close",
                           autowidth: true,
                           align: "center",
                           click: function() {
                              var popup = this.getTopParentView();
                              popup.close();
                           }
                        }
                     ]
                  },
                  body: {
                     view: "scrollview",
                     scroll: true,
                     body: ui
                  }
               };

               // Create popup
               webix.ui(popupTemplate).show();

               // Initial UI components
               setTimeout(() => {
                  popUpComp.init({
                     onSaveData: _logic.callbacks.onSaveData,
                     onCancelClick: _logic.callbacks.onCancel,
                     clearOnLoad: _logic.callbacks.onClearOnLoad
                  });

                  popUpComp.onShow();

                  _logic.setDefaultValue(dc, pageClone);

                  resolve();
               }, 50);
            });
         },

         setDefaultValue: (dc, page) => {
            if (!dc) return;

            let obj = dc.datasource;
            if (!obj) return;

            let linkedData = dc.getCursor();
            if (!linkedData) return;

            page.views().forEach((v) => {
               if (!v || v.key != "form") return;

               v.views().forEach((fView) => {
                  if (fView.key != "connect" || fView.settings == null) return;

                  let field = fView.field();
                  if (field == null) return;

                  let objLink = field.datasourceLink;
                  if (objLink == null || objLink.id != obj.id) return;

                  let data = {};
                  let relationName = field.relationName();
                  data[relationName] = {
                     id: linkedData.id
                  };

                  // Add custom index values
                  let indexes = obj.indexes() || [];
                  indexes.forEach((idx) => {
                     (idx.fields || []).forEach((f) => {
                        data[relationName][f.columnName] =
                           linkedData[f.columnName];
                     });
                  });

                  // Set label of selected item
                  if (linkedData.text) {
                     data[relationName].text = linkedData.text;
                  } else {
                     let rawData = {};
                     rawData[relationName] = linkedData;
                     data[relationName].text = field.format(rawData);
                  }

                  let comp = v.viewComponents[fView.id];
                  if (!comp) return;

                  field.setValue($$(comp.ui.id), data);
               });
            });
         }
      };

      let init = (options) => {
         for (let c in _logic.callbacks) {
            _logic.callbacks[c] = options[c] || _logic.callbacks[c];
         }
      };

      return {
         ui: ui,
         init: init,

         applicationLoad: _logic.applicationLoad,
         onClick: _logic.onClick,
         openFormPopup: _logic.openFormPopup
      };
   }
};

