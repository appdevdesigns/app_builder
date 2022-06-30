/*
 * ab_work_object_workspace_popupDefineLabel
 *
 * Manage the Add New Data Field popup.
 *
 */

const ABComponent = require("../classes/platform/ABComponent");

module.exports = class ABWorkObjectPopupDefineLabel extends ABComponent {
   constructor(App, idBase) {
      idBase = idBase || "ab_work_object_workspace_popupDefineLabel";

      super(App, idBase);
      var L = this.Label;

      var labels = {
         common: App.labels,
         component: {
            labelFormat: L("ab.define_label.labelFormat", "*Label format"),
            selectFieldToGenerate: L(
               "ab.define_label.selectFieldToGenerate",
               "*Select field item to generate format."
            ),
            labelFields: L("ab.define_label.labelFields", "*Fields"),
            displayNoLabel: L(
               "ab.define_label.displayNoLabel",
               "*Display [No Label] when label is empty"
            )
         }
      };

      // internal list of Webix IDs to reference our UI components.
      var ids = {
         component: this.unique(idBase + "_popupLabel"),
         format: this.unique(idBase + "_popupLabel_format"),
         list: this.unique(idBase + "_popupLabel_list"),
         isNoLabelDisplay: this.unique(idBase + "_popupLabel_isNoLabelDisplay"),
         buttonSave: this.unique(idBase + "_popupLabel_buttonSave")
      };

      // webix UI definition:
      this.ui = {
         view: "popup",
         id: ids.component,
         modal: true,
         autoheight: true,
         // maxHeight: 420,
         width: 500,
         body: {
            rows: [
               {
                  view: "label",
                  label: "<b>{0}</b>".replace(
                     "{0}",
                     labels.component.labelFormat
                  )
               },
               {
                  view: "textarea",
                  id: ids.format,
                  height: 100
               },
               {
                  view: "label",
                  label: labels.component.selectFieldToGenerate
               },
               {
                  view: "label",
                  label: "<b>{0}</b>".replace(
                     "{0}",
                     labels.component.labelFields
                  )
               },
               {
                  view: "list",
                  name: "columnList",
                  id: ids.list,
                  width: 500,
                  maxHeight: 180,
                  select: false,
                  template: "#label#",
                  on: {
                     onItemClick: function(id, e, node) {
                        _logic.onItemClick(id, e, node);
                     }
                  }
               },
               {
                  height: 10
               },
               {
                  id: ids.isNoLabelDisplay,
                  view: "switch",
                  value: 0,
                  labelWidth: 0,
                  labelRight: "<b>{0}</b>".replace(
                     "{0}",
                     labels.component.displayNoLabel
                  )
               },
               {
                  cols: [
                     { fillspace: true },
                     {
                        view: "button",
                        name: "cancel",
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
                        name: "save",
                        id: ids.buttonSave,
                        label: labels.common.save,
                        type: "form",
                        autowidth: true,
                        click: function() {
                           _logic.buttonSave();
                        }
                     }
                  ]
               }
            ]
         },
         on: {
            onShow: function() {
               _logic.onShow();
            }
         }
      };

      var _currentObject = null;

      // for setting up UI
      this.init = (options) => {
         // register callbacks:
         for (var c in _logic.callbacks) {
            _logic.callbacks[c] = options[c] || _logic.callbacks[c];
         }

         webix.ui(this.ui);

         webix.extend($$(ids.list), webix.ProgressBar);
      };

      // internal business logic
      var _logic = (this._logic = {
         buttonCancel: function() {
            $$(ids.component).hide();
         },

         buttonSave: function() {
            // disable our save button
            var ButtonSave = $$(ids.buttonSave);
            ButtonSave.disable();

            // get our current labelFormt
            var labelFormat = $$(ids.format).getValue();

            // start our spinner
            var List = $$(ids.list);
            List.showProgress({ type: "icon" });

            // convert from our User Friendly {Label} format to our
            // object friendly {Name} format
            List.data.each(function(d) {
               labelFormat = labelFormat.replace(
                  new RegExp("{" + d.label + "}", "g"),
                  "{" + d.id + "}"
               );
            });

            // save the value
            _currentObject.labelFormat = labelFormat;
            _currentObject.labelSettings = _currentObject.labelSettings || {};
            _currentObject.labelSettings.isNoLabelDisplay = $$(
               ids.isNoLabelDisplay
            ).getValue();
            _currentObject
               .save()
               .then(function() {
                  // all good, so
                  List.hideProgress(); // hide the spinner
                  ButtonSave.enable(); // enable the save button
                  _logic.hide(); // hide the popup

                  // alert our parent component we are done with our changes:
                  _logic.callbacks.onSave();
               })
               .catch(function(err) {
                  List.hideProgress(); // hide the spinner
                  ButtonSave.enable(); // enable the save button

                  // display some error to the user:
                  OP.Error.log("Error trying to save our Object", {
                     error: err
                  });
               });
         },

         callbacks: {
            onCancel: function() {
               console.warn("NO onCancel()!");
            },
            onSave: function(field) {
               console.warn("NO onSave()!");
            }
         },

         hide: function() {
            $$(ids.component).hide();
         },

         objectLoad: function(object) {
            _currentObject = object;

            // clear our list
            var List = $$(ids.list);
            List.clearAll();

            // refresh list with new set of fields
            var listFields = _currentObject
               .fields((f) => {
                  // TODO: should have flag in ABField ?
                  return f.fieldUseAsLabel();
               })
               .map((f) => {
                  return {
                     id: f.id,
                     label: f.label
                  };
               });

            List.parse(listFields);
         },

         onItemClick: function(id, e, node) {
            var selectedItem = $$(ids.list).getItem(id);
            var labelFormat = $$(ids.format).getValue();
            labelFormat += "{{0}}".replace("{0}", selectedItem.label);
            $$(ids.format).setValue(labelFormat);
         },

         onShow: function() {
            var labelFormat = _currentObject.labelFormat;
            let labelSettings = _currentObject.labelSettings || {};

            var Format = $$(ids.format);
            var List = $$(ids.list);
            let DisplayNone = $$(ids.isNoLabelDisplay);

            Format.setValue("");
            Format.enable();
            List.enable();
            $$(ids.buttonSave).enable();

            // our labelFormat should be in a computer friendly {name} format
            // here we want to convert it to a user friendly {label} format
            // to use in our popup:
            if (labelFormat) {
               if (List.data && List.data.count() > 0) {
                  List.data.each(function(d) {
                     labelFormat = labelFormat.replace(
                        new RegExp("{" + d.id + "}", "g"),
                        "{" + d.label + "}"
                     );
                  });
               }
            } else {
               // no label format:
               // Default to first field
               if (List.data && List.data.count() > 0) {
                  var field = List.getItem(List.getFirstId());
                  labelFormat = "{" + field.label + "}";
               }
            }

            Format.setValue(labelFormat || "");
            DisplayNone.setValue(labelSettings.isNoLabelDisplay || false);
         },

         /**
          * @function show()
          *
          * Show this component.
          * @param {obj} $view  the webix.$view to hover the popup around.
          */
         show: function($view) {
            $$(ids.component).show($view);
         }
      });

      // Expose any globally accessible Actions:
      this.actions({});

      this.objectLoad = _logic.objectLoad;
      this.show = _logic.show;
   }
};
