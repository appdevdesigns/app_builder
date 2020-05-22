/*
 * ab_work_interface_workspace_details_components
 *
 * Display the form for creating a new Application.
 *
 */

const ABComponent = require("../classes/platform/ABComponent");

module.exports = class AB_Work_Interface_Workspace_Details_Components extends ABComponent {
   constructor(App) {
      super(App, "ab_work_interface_workspace_details_components");
      var L = this.Label;

      var labels = {
         common: App.labels,
         component: {
            // formHeader: L('ab.application.form.header', "*Application Info"),
            components: L("ab.interface.components", "*Components"),
            componentsTipText: L(
               "ab.interface.componentsTip",
               "*Drag components into Layout/Preview pane."
            ),
            componentsTipTitle: L("ab.interface.componentsTitle", "*Tip"),
            noComponents: L("ab.interface.noComponents", "*No Components")
         }
      };

      // internal list of Webix IDs to reference our UI components.
      var ids = {
         component: this.unique("component"),
         list: this.unique("list")
      };

      // webix UI definition:
      this.ui = {
         id: ids.component,
         header: function() {
            return (
               labels.component.components +
               ' <i class="info-tip fa fa-info-circle"></i>'
            );
         },
         // css: 'ab-data-toolbar',
         // tooltip: labels.component.componentsTipText,
         onClick: {
            "info-tip": function() {
               _logic.infoAlert();

               return false;
            }
         },
         body: {
            id: ids.list,
            view: "list",
            drag: "source",
            css: "ab_interface_draggable",
            // autoheight:true,
            template: function(obj, common) {
               return _logic.template(obj, common);
            },
            on: {
               onBeforeDrag: function(context, ev) {
                  _logic.onBeforeDrag(context, ev);
               }
            }
         }
      };

      var CurrentView = null;

      // setting up UI
      this.init = function() {
         // webix.extend($$(ids.form), webix.ProgressBar);
      };

      // internal business logic
      var _logic = (this.logic = {
         /**
          * @function onBeforeDrag
          * when a drag event is started, update the drag element display.
          */
         onBeforeDrag: function(context, ev) {
            var component = $$(ids.list).getItem(context.source);

            // if this component is an ABView
            if (component.common) {
               // see if a .label field is present
               // note: components from form fields have .label
               // values.
               var label = component.common().label;

               // if not, then pull the label from the .labelKey
               if (!label) {
                  label = component.common().labelKey;
                  label = L(label, label);
               }

               context.html =
                  "<div style='width:" +
                  context.from.$width +
                  "px;' class='ab-component-item-drag'>" +
                  "<i class='fa fa-{0}'></i> ".replace(
                     "{0}",
                     component.common().icon
                  ) +
                  label +
                  "</div>";
            } else {
               // otherwise this is our "no components" placeholder
               // so prevent drag-n-drop
               return false;
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

         infoAlert: function() {
            OP.Dialog.Alert({
               title: labels.component.componentsTipTitle,
               text: labels.component.componentsTipText
            });
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

               return "<div class='ab-component-in-page'><i class='fa fa-#icon# webix_icon_btn' aria-hidden='true'></i> #name#</div>"
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

            var components = view.componentList();
            if (components.length == 0) {
               components.push({
                  view: "label",
                  // id: self.componentIds.componentToolbarHeader,
                  label: labels.component.noComponents
                  // common:function(){
                  //     return {
                  //         icon:'',
                  //         labelKey:'ab.interface.noComponents'
                  //     }
                  // }
               });

               // NOTE: I'd like to prevent the drag from even happening, but currently
               // this doesn't seem to turn off the drag-n-drop feature;
               // TODO: try to turn off the d-n-d ability if we only have the no component placeholder
               List.define("drag", false);
            } else {
               List.define("drag", "source");
            }

            List.clearAll();
            List.parse(components);
            List.refresh();
         }
      });

      // Expose any globally accessible Actions:
      this.actions({
         /**
          * @function populateApplicationForm()
          *
          * Initialze the Form with the values from the provided
          * ABApplication.
          *
          * If no ABApplication is provided, then show an empty form.
          * (create operation)
          *
          * @param {ABApplication} Application
          *      [optional] The current ABApplication we are working with.
          */
         // populateApplicationForm: function(Application){
         // 	_logic.formReset();
         // 	if (Application) {
         // 		// populate Form here:
         // 		_logic.formPopulate(Application);
         // 	}
         // 	_logic.permissionPopulate(Application);
         // 	_logic.show();
         // }
      });

      // Interface methods for parent component:
      this.show = _logic.show;
      this.hide = _logic.hide;
      this.viewLoad = _logic.viewLoad;
   }
};
