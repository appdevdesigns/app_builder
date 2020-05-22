/*
 * ab_work_object_workspace_kanban_sidePanel
 *
 * Manage the Object Workspace KanBan update data area.
 *
 */

const ABComponent = require("../classes/platform/ABComponent");
const ABViewForm = require("../classes/platform/views/ABViewForm");
const ABViewFormButton = require("../classes/platform/views/ABViewFormButton");

module.exports = class ABWorkObjectKanBan extends ABComponent {
   /**
    *
    * @param {*} App
    * @param {*} idBase
    */

   constructor(App, idBase) {
      idBase = idBase || "ab_work_object_workspace_formSidePanel";
      super(App, idBase);

      var L = this.Label;
      var labels = {
         common: App.labels,
         component: {
            editRecord: L("ab._workspace_formSidePanel", "*Edit Record")
         }
      };

      // internal list of Webix IDs to reference our UI components.
      var ids = {
         component: this.unique(idBase + "_workspace_kanban_side"),
         form: this.unique(idBase + "_workspace_kanban_side_form")
      };

      let CurrentObject = null; // current ABObject being displayed

      // Our webix UI definition:
      this.ui = {
         id: ids.component,
         width: 300,
         hidden: true,
         rows: [
            {
               view: "toolbar",
               css: "webix_dark",
               cols: [
                  {
                     view: "label",
                     label: labels.component.editRecord
                  },
                  {
                     view: "icon",
                     icon: "wxi-close",
                     align: "right",
                     click: function(id) {
                        _logic.hide();
                     }
                  }
               ]
            },
            {
               view: "scrollview",
               body: {
                  rows: [
                     {
                        id: ids.form,
                        view: "form",
                        borderless: true,
                        rows: []
                     }
                  ]
               }
            }
         ]
      };

      // Our init() function for setting up our UI
      this.init = (options) => {
         // register our callbacks:
         for (var c in _logic.callbacks) {
            _logic.callbacks[c] = options[c] || _logic.callbacks[c];
         }
      };

      // our internal business logic
      let _logic = (this._logic = {
         callbacks: {
            onAddData: function(data) {},
            onUpdateData: function(data) {},
            onClose: function() {}
         },

         objectLoad: (object) => {
            CurrentObject = object;
         },

         hide: function() {
            if ($$(ids.component)) $$(ids.component).hide();

            _logic.callbacks.onClose();
         },

         show: function(data) {
            if ($$(ids.component)) $$(ids.component).show();

            _logic.refreshForm(data);
         },

         isVisible: function() {
            return $$(ids.component) ? $$(ids.component).isVisible() : false;
         },

         refreshForm: function(data) {
            let $formView = $$(ids.form);

            if (!CurrentObject || !$formView) return;

            data = data || {};

            let formAttrs = {
               settings: {
                  columns: 1,
                  labelPosition: "top",
                  showLabel: 1,
                  clearOnLoad: 0,
                  clearOnSave: 0,
                  labelWidth: 120,
                  height: 0
               }
            };
            let form = new ABViewForm(formAttrs, CurrentObject.application);
            form.objectLoad(CurrentObject);

            // Populate child elements
            CurrentObject.fields().forEach((f, index) => {
               form.addFieldToForm(f, index);
            });

            // add default button (Save button)
            form._views.push(
               new ABViewFormButton(
                  {
                     settings: {
                        includeSave: true,
                        includeCancel: false,
                        includeReset: false
                     },
                     position: {
                        y: CurrentObject.fields().length // yPosition
                     }
                  },
                  CurrentObject.application,
                  form
               )
            );

            // add temp id to views
            form._views.forEach((v) => (v.id = OP.Util.uuid()));

            let formCom = form.component(App);

            // Rebuild form
            webix.ui(formCom.ui.rows.concat({}), $formView);
            webix.extend($formView, webix.ProgressBar);

            formCom.init({
               onBeforeSaveData: () => {
                  // show progress icon
                  if ($formView.showProgress)
                     $formView.showProgress({ type: "icon" });

                  // get update data
                  var formVals = form.getFormValues($formView, CurrentObject);

                  // validate data
                  if (!form.validateData($formView, CurrentObject, formVals))
                     return false;

                  if (formVals.id) {
                     CurrentObject.model()
                        .update(formVals.id, formVals)
                        .catch((err) => {
                           // TODO : error message
                           console.error(err);

                           if ($formView.hideProgress)
                              $formView.hideProgress({ type: "icon" });
                        })
                        .then((updateVals) => {
                           _logic.callbacks.onUpdateData(updateVals);

                           if ($formView.hideProgress)
                              $formView.hideProgress({ type: "icon" });
                        });
                  }
                  // else add new row
                  else {
                     CurrentObject.model()
                        .create(formVals)
                        .catch((err) => {
                           // TODO : error message
                           console.error(err);

                           if ($formView.hideProgress)
                              $formView.hideProgress({ type: "icon" });
                        })
                        .then((newVals) => {
                           _logic.callbacks.onAddData(newVals);

                           if ($formView.hideProgress)
                              $formView.hideProgress({ type: "icon" });
                        });
                  }

                  return false;
               }
            });

            // display data
            $formView.clear();
            $formView.parse(data);

            formCom.onShow(data);
         }
      });

      //
      // Define our external interface methods:
      //

      this.hide = _logic.hide;
      this.show = _logic.show;
      this.refresh = _logic.refreshForm;
      this.isVisible = _logic.isVisible;
      this.objectLoad = _logic.objectLoad;
   }
};
