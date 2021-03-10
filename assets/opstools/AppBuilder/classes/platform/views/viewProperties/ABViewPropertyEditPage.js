const ABViewPropertyAddPage = require("./ABViewPropertyAddPage");

let L = (key, altText) => {
   return AD.lang.label.getLabel(key) || altText;
};

module.exports = class ABViewPropertyEditPage extends ABViewPropertyAddPage {
   /**
    * @property default
    * return default settings
    *
    * @return {Object}
    */
   static get default() {
      return {
         editForm: "none" // The url pointer of ABViewForm
      };
   }

   static propertyComponent(App, idBase) {
      let ids = {
         formEdit: idBase + "_editForm"
      };

      let ui = {
         id: ids.formEdit,
         name: "editForm",
         view: "richselect",
         label: L("ab.view.property.editForm", "*Edit Form"),
         labelWidth: App.config.labelWidthXLarge,
         on: {
            onChange: (newVal, oldVal) => {
               if (
                  newVal == L("ab.component.connect.no", "*No add new option")
               ) {
                  $$(ids.formEdit).setValue("");
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

            (view.pageRoot().pages(() => true, true) || []).forEach((p) => {
               if (!p) return;

               p.views(() => true, true).forEach((v) => {
                  if (
                     v &&
                     v.key == "form" &&
                     v.datacollection &&
                     v.datacollection.datasource &&
                     v.datacollection.datasource.id ==
                        view.field().settings.linkObject
                  ) {
                     editForms.push({
                        id: v.urlPointer(),
                        value: `${p.label} - ${v.label}`
                     });
                  }
               });
            });

            let $selector = $$(ids.formEdit);
            if ($selector) {
               $selector.define("options", editForms);
               $selector.define(
                  "value",
                  settings.editForm || this.default.editForm
               );
               $selector.refresh();
            }
         },

         getSettings: (view) => {
            let settings = view.settings || {};

            let $selector = $$(ids.formEdit);
            let $selectPopup = $selector.getPopup();
            let selectedItem = ($selectPopup.config.body.data || []).filter(
               (opt) => opt.id == $selector.getValue()
            )[0];
            if (selectedItem) {
               settings.editForm = selectedItem.id; // The url pointer of ABViewForm
            }

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
      this.settings.editForm =
         settings.editForm || this.constructor.default.editForm;
   }

   component(App, idBase) {
      idBase = idBase + "_popup_edit_form";

      let comp = super.component(App, idBase);

      comp.onClick = () => {
         if (
            !this._application ||
            !this.settings.editForm ||
            this.settings.editForm == this.constructor.default.editForm
         )
            return Promise.resolve();

         let form = this._application.urlResolve(this.settings.editForm);
         if (!form) return Promise.resolve(); // TODO: refactor in v2

         let page = form.pageParent();
         if (!page) return Promise.resolve(); // TODO: refactor in v2

         return comp.openFormPopup(page);
      };

      return comp;
   }
};
