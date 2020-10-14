/*
 * ab_work_interface_workspace_editor_components
 *
 * Display the menu for creating a new Widget.
 *
 */

const ABComponent = require("../classes/platform/ABComponent");

module.exports = class AB_Work_Interface_Workspace_Editor_Components extends ABComponent {
   constructor(App) {
      super(App, "ab_work_interface_workspace_editor_components");
      var L = this.Label;

      var labels = {
         common: App.labels,
         component: {
            // formHeader: L('ab.application.form.header', "*Application Info"),
            components: L("ab.interface.components", "*Components"),
            addWidget: L("ab.interface.addWidget", "*Add Widget"),
            noComponents: L("ab.interface.noComponents", "*No Components")
         }
      };

      // internal list of Webix IDs to reference our UI components.
      var ids = {
         component: this.unique("component"),
         popup: this.unique("popup"),
         list: this.unique("list")
      };

      // webix UI definition:
      this.ui = {
         id: ids.component,
         css: "webix_primary",
         view: "button",
         type: "form",
         label: labels.component.addWidget,
         align: "center",
         autowidth: true,
         on: {
            onItemClick: function(id, e) {
               _logic.showPopup();
            }
         }
      };

      var CurrentView = null;

      // setting up UI
      this.init = function(options) {
         // register callbacks:
         for (var c in _logic.callbacks) {
            _logic.callbacks[c] = options[c] || _logic.callbacks[c];
         }

         webix.ui({
            view: "window",
            id: ids.popup,
            modal: true,
            width: 600,
            height: 550,
            select: false,
            resize: true,
            position: "center",
            head: {
               view: "toolbar",
               css: "webix_dark",
               cols: [
                  {
                     view: "label",
                     label: labels.component.addWidget,
                     css: "modal_title",
                     align: "center"
                  },
                  {
                     view: "button",
                     label: "Close",
                     autowidth: true,
                     align: "center",
                     click: function() {
                        _logic.hidePopup();
                     }
                  }
               ]
            },
            body: {
               id: ids.list,
               view: "dataview",
               css: "ab-datacollection-table borderless",
               borderless: true,
               xCount: 5, //the number of items in a row
               yCount: 4, //the number of items in a column
               type: {
                  borderless: true,
                  width: 100,
                  height: 100
               },
               template: function(obj, common) {
                  return _logic.template(obj, common);
               },
               on: {
                  onItemClick: function(id, e, node) {
                     var component = this.getItem(id);

                     _logic.addWidget(component);
                  }
               }
            }
         });
      };

      // internal business logic
      var _logic = (this.logic = {
         callbacks: {
            onAddingWidget: function() {
               console.warn("NO onAddingWidget()!");
            },
            onAddWidget: function() {
               console.warn("NO onAddWidget()!");
            }
         },

         /**
          * @function show()
          *
          * Show this component.
          */
         show: function() {
            $$(ids.component).show();
         },

         /**
          * @function hide()
          *
          * Hide this component.
          */
         hide: function() {
            $$(ids.component).hide();
         },

         showPopup: function() {
            $$(ids.popup).show();
         },

         hidePopup: function() {
            $$(ids.popup).hide();
         },

         /**
          * @function addWidget()
          *
          * @param component {ABView} - new component
          */
         addWidget: function(component) {
            var newComp = component.newInstance(
               CurrentView.application,
               CurrentView
            );

            // show loading cursor
            _logic.callbacks.onAddingWidget();

            // CurrentView.viewSave(newComp)
            newComp.save().then(() => {
               // callback to parent
               // hide loading cursor
               _logic.callbacks.onAddWidget();
            });

            _logic.hidePopup();
         },

         /**
          * @function template()
          * compile the template for each item in the list.
          */
         template: function(obj, common) {
            // if this is one of our ABViews:
            if (obj.common) {
               // see if a .label field is present
               var label = obj.common().label;

               // if not, then pull a multilingual field:
               if (!label) {
                  label = obj.common().labelKey;
                  label = L(label, label);
               }

               return "<div class='ab-component-in-page'><i class='fa fa-2x fa-#icon#' aria-hidden='true'></i><br/>#name#</div>"
                  .replace(/#icon#/g, obj.common().icon)
                  .replace(/#name#/g, label);
            } else {
               // maybe this is simply the "No Components" placeholder
               return obj.label;
            }
         },

         /*
          * @method viewLoad
          * A new View has been selected for editing, so update
          * our interface with the components allowed for this View.
          * @param {ABView} view  current view instance.
          */
         viewLoad: function(view) {
            CurrentView = view;

            var List = $$(ids.list);
            var Menu = $$(ids.component);

            var components = CurrentView.componentList();

            List.clearAll();

            if (components && components.length > 0) {
               List.parse(components);
               Menu.show();
            } else {
               Menu.hide();
            }

            List.refresh();
         }
      });

      // Expose any globally accessible Actions:
      this.actions({});

      // Interface methods for parent component:
      this.show = _logic.show;
      this.hide = _logic.hide;
      this.viewLoad = _logic.viewLoad;
   }
};
