/*
 * ab_work_object_workspace_PopupAddView
 *
 * Manage the Sort Fields popup.
 *
 */

const ABComponent = require("../classes/platform/ABComponent");

const ABObjectWorkspaceViewGrid = require("../classes/platform/workspaceViews/ABObjectWorkspaceViewGrid");
const ABObjectWorkspaceViewKanban = require("../classes/platform/workspaceViews/ABObjectWorkspaceViewKanban");
const ABObjectWorkspaceViewGantt = require("../classes/platform/workspaceViews/ABObjectWorkspaceViewGantt");

module.exports = class AB_Work_Object_Workspace_PopupAddView extends ABComponent {
   //.extend(idBase, function(App) {

   constructor(App, idBase) {
      idBase = idBase || "ab_work_object_workspace_popupAddView";

      super(App, idBase);
      var L = this.Label;

      var _object;
      var _view;

      var labels = {
         common: App.labels,
         component: {
            name: L("ab.add_view.name", "*Name"),
            type: L("ab.add_view.type", "*Type"),
            namePlaceholder: L(
               "ab.add_view.name_placeholder",
               "*Create a name for the view"
            ),
            viewSettings: L("ab.add_view.view_settings", "*View Settings")
         }
      };

      // internal list of Webix IDs to reference our UI components
      var ids = {
         component: this.unique("_popupAddView"),
         form: this.unique("_popupAddViewForm"),
         formAdditional: this.unique("_popupAddViewFormAdditional"),
         nameInput: this.unique("_popupAddViewName"),
         typeInput: this.unique("_popupAddViewType"),
         cancelButton: this.unique("_popupAddViewCancelButton"),
         saveButton: this.unique("_popupAddViewSaveButton")
      };

      var comKanban = ABObjectWorkspaceViewKanban.component(App, idBase);
      var comGantt = ABObjectWorkspaceViewGantt.component(App, idBase);

      // Our webix UI definition:
      var formUI = {
         view: "form",
         id: ids.form,
         visibleBatch: "global",
         rules: {
            hGroup: (value, { vGroup }) => {
               return !value || value !== vGroup;
            }
         },
         elements: [
            {
               view: "text",
               label: labels.component.name,
               id: ids.nameInput,
               name: "name",
               placeholder: labels.component.namePlaceholder,
               required: true,
               invalidMessage: labels.common.invalidMessage.required,
               on: {
                  onChange: function(id) {
                     $$(ids.nameInput).validate();
                  }
               }
            },
            {
               view: "richselect",
               label: labels.component.type,
               id: ids.typeInput,
               name: "type",
               options: [
                  {
                     id: ABObjectWorkspaceViewGrid.type(),
                     value: L("ab.add_view.type.grid", "*Grid")
                  },
                  {
                     id: ABObjectWorkspaceViewKanban.type(),
                     value: L("ab.add_view.type.kanban", "*Kanban")
                  },
                  {
                     id: ABObjectWorkspaceViewGantt.type(),
                     value: L("ab.add_view.type.gantt", "*Gantt")
                  }
               ],
               value: ABObjectWorkspaceViewGrid.type(),
               required: true,
               on: {
                  onChange: function(typeView) {
                     _logic.switchType(typeView);
                  }
               }
            },
            {
               id: ids.formAdditional,
               view: "layout",
               rows: [comKanban.elements(), comGantt.elements()]
            },
            {
               margin: 5,
               cols: [
                  { fillspace: true },
                  {
                     view: "button",
                     value: labels.common.cancel,
                     css: "ab-cancel-button",
                     autowidth: true,
                     click: function() {
                        _logic.buttonCancel();
                     }
                  },
                  {
                     view: "button",
                     css: "webix_primary",
                     value: labels.common.save,
                     autowidth: true,
                     type: "form",
                     click: function() {
                        _logic.buttonSave();
                     }
                  }
               ]
            }
         ]
      };

      this.ui = {
         view: "window",
         id: ids.component,
         height: 400,
         width: 400,
         head: {
            view: "toolbar",
            css: "webix_dark",
            cols: [
               {
                  view: "label",
                  label: labels.component.viewSettings,
                  css: "modal_title",
                  align: "center"
               },
               {
                  view: "button",
                  label: labels.common.close,
                  autowidth: true,
                  align: "center",
                  click: function() {
                     _logic.buttonCancel();
                  }
               }
            ]
         },
         position: "center",
         body: formUI,
         modal: true,
         on: {
            onShow: function() {
               _logic.onShow();
            }
         }
      };

      // Our init() function for setting up our UI
      this.init = (options) => {
         // register our callbacks:
         for (var c in _logic.callbacks) {
            _logic.callbacks[c] = options[c] || _logic.callbacks[c];
         }

         webix.ui(this.ui);
      };

      // our internal business logic
      var _logic = (this._logic = {
         callbacks: {
            /**
             * @function onViewAdded
             * called when we have added a new workspace view to our Current Object.
             *
             * this is meant to alert our parent component to respond to the
             * change.
             */
            onViewAdded: function(view) {},

            /**
             * @function onViewUpdated
             * called when we have updated a workspace view in our Current Object.
             *
             * this is meant to alert our parent component to respond to the
             * change.
             */
            onViewUpdated: function(view) {}
         },

         objectLoad: (object) => {
            _object = object;
         },

         switchType: (typeView) => {
            $$(ids.formAdditional).showBatch(typeView);

            // initial
            switch (typeView) {
               case "kanban":
                  comKanban.init(_object, _view);
                  break;
               case "gantt":
                  comGantt.init(_object, _view);
                  break;
            }

            $$(ids.component).resize();
         },

         onShow: function() {
            // clear field options in the form
            $$(ids.form).clear();
            $$(ids.form).clearValidation();

            if (_view) {
               $$(ids.nameInput).setValue(_view.name);
               $$(ids.typeInput).setValue(_view.type);
            }
            // Default value
            else {
               $$(ids.nameInput).setValue("");
               $$(ids.typeInput).setValue(ABObjectWorkspaceViewGrid.type());
            }
         },

         /**
          * @function show()
          *
          * Show this component.
          */
         show: function(viewObj) {
            _view = viewObj;
            $$(ids.component).show();
         },

         /**
          * @function hide()
          *
          * hide this component.
          */
         hide: function() {
            $$(ids.component).hide();
         },

         buttonCancel: function() {
            this.hide();
         },

         buttonSave: function() {
            if (!$$(ids.form).validate()) return;

            var view = {};

            switch ($$(ids.typeInput).getValue()) {
               case ABObjectWorkspaceViewKanban.type():
                  // validate
                  if (comKanban.validate && !comKanban.validate($$(ids.form)))
                     return;

                  view = comKanban.values();
                  break;

               case ABObjectWorkspaceViewGantt.type():
                  // validate
                  if (comGantt.validate && !comGantt.validate($$(ids.form)))
                     return;

                  view = comGantt.values($$(ids.form));
                  break;
            }

            // save the new/updated view
            view.name = $$(ids.nameInput).getValue();
            view.type = $$(ids.typeInput).getValue();

            if (_view) {
               var viewObj = _object.workspaceViews.updateView(_view, view);
               this.callbacks.onViewUpdated(viewObj);
            } else {
               var viewObj = _object.workspaceViews.addView(view);
               this.callbacks.onViewAdded(viewObj);
            }
            this.hide();
         }
      });

      // Expose any globally accessible Actions:
      this.actions({});

      //
      // Define our external interface methods:
      //
      this.objectLoad = _logic.objectLoad;
      this.show = _logic.show;
   }
};
