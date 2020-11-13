const ABViewFormCustomCore = require("../../core/views/ABViewFormCustomCore");

const ABFieldImage = require("../dataFields/ABFieldImage");
const DEFAULT_HEIGHT = 80;

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABViewFormCustom extends ABViewFormCustomCore {
   constructor(values, application, parent, defaultValues) {
      super(values, application, parent, defaultValues);
   }

   //
   //	Editor Related
   //

   /**
    * @method editorComponent
    * return the Editor for this UI component.
    * the editor should display either a "block" view or "preview" of
    * the current layout of the view.
    * @param {string} mode what mode are we in ['block', 'preview']
    * @return {Component}
    */
   editorComponent(App, mode) {
      var idBase = "ABViewFormCustomEditorComponent";
      var ids = {
         component: App.unique(idBase + "_component")
      };

      var templateElem = this.component(App).ui;
      templateElem.id = ids.component;

      var _ui = {
         rows: [templateElem, {}]
      };

      var _init = (options) => {};

      var _logic = {};

      return {
         ui: _ui,
         init: _init,
         logic: _logic
      };
   }

   /**
    * @method component()
    * return a UI component based upon this view.
    * @param {obj} App
    * @return {obj} UI component
    */
   component(App) {
      var component = super.component(App);
      var field = this.field();
      var form = this.parentFormComponent();

      // this field may be deleted
      if (!field) return component;

      var idBase = this.parentFormUniqueID(
         "ABViewFormCustom_" + this.id + "_f_"
      );
      var ids = {
         component: App.unique(idBase + "_component")
      };

      var settings = {};
      if (form) settings = form.settings;

      var requiredClass = "";
      if (field.settings.required || this.settings.required) {
         requiredClass = "webix_required";
      }

      var templateLabel = "";
      if (settings.showLabel) {
         if (settings.labelPosition == "top")
            templateLabel =
               '<label style="display:block; text-align: left; margin: 0; padding:1px 7.5px 0 3px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;" class="webix_inp_top_label ' +
               requiredClass +
               '">#label#</label>';
         else
            templateLabel =
               '<label style="width: #width#px; display: inline-block; line-height: 32px; float: left; margin: 0; padding:1px 7.5px 0 3px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;" class="' +
               requiredClass +
               '">#label#</label>';
      }

      var newWidth = settings.labelWidth;
      if (this.settings.formView) newWidth += 40;
      else if (settings.showLabel == true && settings.labelPosition == "top")
         newWidth = 0;

      let height = 38;
      if (field instanceof ABFieldImage) {
         if (field.settings.useHeight) {
            height = parseInt(field.settings.imageHeight) || DEFAULT_HEIGHT;
         } else {
            height = DEFAULT_HEIGHT + 300;
         }
      } else if (
         settings.showLabel == true &&
         settings.labelPosition == "top"
      ) {
         height = DEFAULT_HEIGHT;
      }

      var template = (
         '<div class="customField">' +
         templateLabel +
         "#template#" +
         "</div>"
      )
         .replace(/#width#/g, settings.labelWidth)
         .replace(/#label#/g, field.label)
         .replace(
            /#template#/g,
            field
               .columnHeader({
                  width: newWidth,
                  height: height,
                  editable: true
               })
               .template({})
         );

      component.ui = {
         id: ids.component,
         view: "forminput",
         labelWidth: 0,
         paddingY: 0,
         paddingX: 0,
         css: "ab-custom-field",
         name: component.ui.name,
         // label:  field.label,
         // labelPosition: settings.labelPosition, // webix.forminput does not have .labelPosition T T
         // labelWidth: settings.labelWidth,
         body: {
            // id: ids.component,
            view: App.custom.focusabletemplate.view,
            css: "customFieldCls",
            borderless: true,
            template: template,
            height: height,
            onClick: {
               customField: (id, e, trg) => {
                  if (this.settings.disable == 1) return;

                  var rowData = {};

                  var formView = this.parentFormComponent();
                  if (formView) {
                     var dv = formView.datacollection;
                     if (dv) rowData = dv.getCursor() || {};
                  }

                  // var node = $$(ids.component).$view;
                  var node = $$(trg).getParentView().$view;
                  field.customEdit(rowData, App, node, ids.component);
               }
            }
         }
      };

      component.onShow = () => {
         var elem = $$(ids.component);
         if (!elem) return;

         var rowData = {},
            node = elem.$view;

         let options = {
            formId: ids.component,
            editable: this.settings.disable == 1 ? false : true
         };

         if (field instanceof ABFieldImage) {
            options.height = field.settings.useHeight
               ? parseInt(field.settings.imageHeight) || DEFAULT_HEIGHT
               : DEFAULT_HEIGHT;
            options.width = field.settings.useWidth
               ? parseInt(field.settings.imageWidth) || newWidth
               : newWidth;
         }

         field.customDisplay(rowData, App, node, options);
      };

      // make sure each of our child views get .init() called
      component.init = (options) => {
         // component.onShow();
      };

      component.logic = {
         getValue: (rowData) => {
            var elem = $$(ids.component);

            return field.getValue(elem, rowData);
         }
      };

      return component;
   }
};
