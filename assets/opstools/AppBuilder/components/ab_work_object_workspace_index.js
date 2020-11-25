/*
 * ab_work_object_workspace_index
 *
 * Manage the Object Workspace custom index popup.
 *
 */
const ABComponent = require("../classes/platform/ABComponent");
const ABIndex = require("../classes/platform/ABIndex");

module.exports = class ABWorkObjectWorkspaceIndex extends ABComponent {
   /**
    * @param {object} App
    * @param {string} idBase
    */
   constructor(App, idBase) {
      idBase = idBase || "ab_work_object_workspace";
      idBase += "_index";

      super(App, idBase);
      let L = this.Label;

      this.labels = {
         common: App.labels,
         component: {
            title: L("ab.object.index.title", "*Custom Index"),
            cancel: L("ab.common.cancel", "*Cancel"),
            save: L("ab.common.save", "*Save"),
            confirmDeleteTitle: L(
               "ab.index.delete.title",
               "*Delete this Index"
            ),
            confirmDeleteMessage: L(
               "ab.index.delete.message",
               "*Do you want to remove this index ?"
            )
         }
      };

      // internal list of Webix IDs to reference our UI components.
      this.ids = {
         popup: this.unique(idBase + "_popup"),
         form: this.unique(idBase + "_form"),
         name: this.unique(idBase + "_name"),
         fields: this.unique(idBase + "_fields"),
         unique: this.unique(idBase + "_unique"),
         removeButton: this.unique(idBase + "_removeButton"),
         saveButton: this.unique(idBase + "_saveButton")
      };

      this._logic = {};

      // Expose any globally accessible Actions:
      this.actions({});
   }

   // Our webix UI definition:
   get ui() {
      let ids = this.ids;
      let labels = this.labels;

      return {
         view: "window",
         id: ids.popup,
         head: {
            view: "toolbar",
            cols: [
               { view: "label", label: labels.component.title },
               {
                  view: "button",
                  label: "X",
                  width: 50,
                  align: "right",
                  click: () => {
                     this.close();
                  }
               }
            ]
         },
         position: "center",
         resize: true,
         modal: true,
         editable: false,
         width: 500,
         height: 500,
         body: {
            view: "form",
            id: ids.form,
            elements: [
               {
                  id: ids.name,
                  view: "text",
                  label: "Name",
                  name: "name"
               },
               {
                  id: ids.fields,
                  view: "multicombo",
                  label: "Fields",
                  name: "fieldIDs",
                  options: []
               },
               {
                  id: ids.unique,
                  view: "checkbox",
                  label: "Unique",
                  name: "unique"
               },
               {
                  cols: [
                     {
                        id: ids.removeButton,
                        view: "button",
                        type: "icon",
                        icon: "fa fa-trash-o",
                        css: "webix_danger",
                        width: 40,
                        click: () => this.removeIndex()
                     },
                     { fillspace: true },
                     {
                        view: "button",
                        value: labels.component.cancel,
                        width: 100,
                        click: () => this.close()
                     },
                     {
                        id: ids.saveButton,
                        view: "button",
                        type: "icon",
                        icon: "fa fa-floppy-o",
                        css: "webix_primary",
                        label: labels.component.save,
                        width: 100,
                        click: () => this.save()
                     }
                  ]
               }
            ]
         }
      };
   }

   init(callbacks = {}) {
      webix.ui(this.ui);

      let $form = $$(this.ids.form);
      if ($form) {
         webix.extend($form, webix.ProgressBar);
      }

      if (callbacks) {
         this._callbacks = {};
         this._callbacks.onChange = callbacks.onChange;
      }
   }

   open(object, index) {
      this.CurrentObject = object;
      this.CurrentIndex = index;

      let ids = this.ids;
      let $popup = $$(ids.popup);
      if (!$popup) return;

      $popup.show();

      let $fields = $$(ids.fields);
      if ($fields && this.CurrentObject) {
         let fields = this.CurrentObject.fields((f) => {
            return (
               f.key == "number" ||
               f.key == "date" ||
               f.key == "datetime" ||
               f.key == "boolean" ||
               f.key == "list" ||
               f.key == "email" ||
               f.key == "user" ||
               f.key == "AutoIndex" ||
               f.key == "combined" ||
               ((f.key == "string" || f.key == "LongText") &&
                  f.settings &&
                  !f.settings.supportMultilingual) ||
               (f.key == "connectObject" &&
                  // 1:M
                  ((f.settings.linkType == "one" &&
                     f.settings.linkViaType == "many") ||
                     // 1:1 isSource = true
                     (f.settings.linkType == "one" &&
                        f.settings.linkViaType == "one" &&
                        f.settings.isSource)))
            );
         }).map((f) => {
            return {
               id: f.id,
               value: f.label
            };
         });

         $fields.define("options", fields);
         $fields.refresh();
      }

      let $form = $$(this.ids.form);
      if ($form) {
         $form.clear();

         if (index) $form.setValues(index.toObj());
      }

      let $name = $$(ids.name);
      let $unique = $$(ids.unique);
      let $saveButton = $$(ids.saveButton);
      let $removeButton = $$(ids.removeButton);

      // Edit
      if (this.CurrentIndex) {
         $name.disable();
         $fields.disable();
         $unique.disable();
         $saveButton.hide();
         $removeButton.show();
      }
      // Add new
      else {
         $name.enable();
         $fields.enable();
         $unique.enable();
         $saveButton.show();
         $removeButton.hide();
      }
   }

   save() {
      let $form = $$(this.ids.form);
      if (!$form) return;

      this.busy();

      let vals = $form.getValues();
      vals.fieldIDs = vals.fieldIDs.split(",");

      // Add new
      if (this.CurrentIndex == null)
         this.CurrentIndex = new ABIndex(vals, this.CurrentObject);

      // update values
      this.CurrentIndex.fromValues(vals);
      this.CurrentIndex.save()
         .catch((err) => {
            let message = "The system could not create your index.";
            switch (err.code) {
               case "ER_DUP_ENTRY":
                  message =
                     message + " : There are duplicated values in this column.";
                  break;
            }

            webix.alert({
               type: "alert-error",
               title: "Failed",
               text: message
            });
            console.error(err);
            this.ready();
         })
         .then(() => {
            this.ready();
            this._callbacks.onChange();
            this.close();
         });
   }

   close() {
      let ids = this.ids;
      let $popup = $$(ids.popup);
      if (!$popup) return;

      $popup.hide();
   }

   busy() {
      let $form = $$(this.ids.form);
      if ($form && $form.showProgress) {
         $form.showProgress({ type: "icon" });
      }

      let $saveButton = $$(this.ids.saveButton);
      if ($saveButton) {
         $saveButton.disable();
      }

      let $removeButton = $$(this.ids.removeButton);
      if ($removeButton) {
         $removeButton.disable();
      }
   }

   ready() {
      let $form = $$(this.ids.form);
      if ($form && $form.hideProgress) {
         $form.hideProgress();
      }

      let $saveButton = $$(this.ids.saveButton);
      if ($saveButton) {
         $saveButton.enable();
      }

      let $removeButton = $$(this.ids.removeButton);
      if ($removeButton) {
         $removeButton.enable();
      }
   }

   removeIndex() {
      if (!this.CurrentIndex) return;

      OP.Dialog.Confirm({
         title: this.labels.component.confirmDeleteTitle,
         message: this.labels.component.confirmDeleteMessage,
         callback: (isOK) => {
            if (isOK) {
               this.busy();

               this.CurrentIndex.destroy()
                  .catch((err) => {
                     console.error(err);
                     this.ready();
                  })
                  .then(() => {
                     this.ready();
                     this._callbacks.onChange();
                     this.close();
                  });
            }
         }
      });
   }
};
