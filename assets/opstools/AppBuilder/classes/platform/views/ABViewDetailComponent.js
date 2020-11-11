const ABViewDetailComponentCore = require("../../core/views/ABViewDetailComponentCore");

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABViewDetailComponent extends ABViewDetailComponentCore {
   constructor(values, application, parent, defaultValues) {
      super(values, application, parent, defaultValues);
   }

   static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {
      var commonUI = super.propertyEditorDefaultElements(
         App,
         ids,
         _logic,
         ObjectDefaults
      );

      return commonUI.concat([
         {
            name: "fieldLabel",
            view: "text",
            disabled: true,
            label: L("ab.component.detail.field.label", "*Field")
         }
      ]);
   }

   static propertyEditorPopulate(App, ids, view) {
      super.propertyEditorPopulate(App, ids, view);

      var field = view.field();

      if (field) {
         $$(ids.fieldLabel).setValue(field.label);
      }
   }

   /**
    * @component()
    * return a UI component based upon this view.
    * @param {obj} App
    * @param {string} idPrefix
    *
    * @return {obj} UI component
    */
   component(App, idPrefix) {
      // setup 'label' of the element
      var detailView = this.detailComponent(),
         field = this.field() || {},
         label = "";

      var settings = {};
      if (detailView) settings = detailView.settings;

      var isUsers = false;
      if (field && field.key == "user") isUsers = true;

      var templateLabel = "";
      if (settings.showLabel == true) {
         if (settings.labelPosition == "top")
            templateLabel =
               "<label style='display:block; text-align: left;' class='webix_inp_top_label'>#label#</label>#display#";
         else
            templateLabel =
               "<label style='width: #width#px; display: inline-block; float: left; line-height: 32px;'>#label#</label><div class='ab-detail-component-holder' style='margin-left: #width#px;'>#display#</div>";
      }
      // no label
      else {
         templateLabel = "#display#";
      }

      var template = templateLabel
         .replace(/#width#/g, settings.labelWidth)
         .replace(/#label#/g, field ? field.label : "");

      var height = 38;
      if (settings.labelPosition == "top") height = height * 2;

      if (
         field &&
         field.settings &&
         typeof field.settings.useHeight != "undefined" &&
         field.settings.useHeight == 1
      ) {
         height = parseInt(field.settings.imageHeight) || height;
      }

      var _ui = {
         view: "template",
         borderless: true,
         height: height,
         isUsers: isUsers,
         template: template,
         data: { display: "" } // show empty data in template
      };

      // make sure each of our child views get .init() called
      var _init = (options) => {};

      var _logic = {
         setValue: (componentId, val) => {
            if ($$(componentId))
               if (field.key == "string" || field.key == "LongText") {
                  val = val.replace(/[<]/g, "&lt;");
               }
            $$(componentId).setValues({ display: val });
         }
      };

      return {
         ui: _ui,
         init: _init,
         logic: _logic
      };
   }
};
