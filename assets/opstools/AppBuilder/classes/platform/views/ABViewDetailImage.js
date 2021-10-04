const ABViewDetailImageCore = require("../../core/views/ABViewDetailImageCore");

const ABViewDetailImagePropertyComponentDefaults = ABViewDetailImageCore.defaultValues();

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABViewDetailImage extends ABViewDetailImageCore {
   /**
    * @param {obj} values  key=>value hash of ABView values
    * @param {ABApplication} application the application object this view is under
    * @param {ABView} parent the ABView this view is a child of. (can be null)
    */
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
      var idBase = "ABViewDetailImageEditorComponent";
      var ids = {
         component: App.unique(idBase + "_component")
      };

      var elem = this.component(App).ui;
      elem.id = ids.component;

      var _ui = {
         rows: [elem, {}]
      };

      var _init = (options) => {};

      var _logic = {};

      return {
         ui: _ui,
         init: _init,
         logic: _logic
      };
   }

   //
   // Property Editor
   //

   static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {
      var commonUI = super.propertyEditorDefaultElements(
         App,
         ids,
         _logic,
         ObjectDefaults
      );

      // in addition to the common .label  values, we
      // ask for:
      return commonUI.concat([
         {
            view: "counter",
            name: "height",
            label: L("ab.components.common.height", "*Height:"),
            labelWidth: App.config.labelWidthLarge
         },
         {
            view: "counter",
            name: "width",
            label: L("ab.components.common.width", "*Width:"),
            labelWidth: App.config.labelWidthLarge
         }
      ]);
   }

   static propertyEditorPopulate(App, ids, view) {
      super.propertyEditorPopulate(App, ids, view);

      $$(ids.height).setValue(
         view.settings.height ||
            ABViewDetailImagePropertyComponentDefaults.height
      );
      $$(ids.width).setValue(
         view.settings.width || ABViewDetailImagePropertyComponentDefaults.width
      );
   }

   static propertyEditorValues(ids, view) {
      super.propertyEditorValues(ids, view);

      view.settings.height = $$(ids.height).getValue();
      view.settings.width = $$(ids.width).getValue();
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
      var component = super.component(App);
      var field = this.field();

      var idBase = "ABViewDetailImage_" + (idPrefix || "") + this.id;
      var ids = {
         component: App.unique(idBase + "_component")
      };

      var defaultImageUrl = field ? field.settings.defaultImageUrl : "";

      component.ui.id = ids.component;

      if (this.settings.height) component.ui.height = this.settings.height;

      // if (this.settings.width)
      // 	component.ui.width = this.settings.width;

      var _logic = {
         setValue: (val) => {
            var imageTemplate = "";

            if (val || (!val && defaultImageUrl)) {
               let imageUrl = (imageUrl =
                  "/opsportal/image/" +
                  this.application.name +
                  "/" +
                  (val || defaultImageUrl));
               let width =
                  field && field.settings.imageWidth
                     ? field.settings.imageWidth + "px"
                     : "200px";
               let height =
                  field && field.settings.imageHeight
                     ? field.settings.imageHeight + "px"
                     : "100%";

               if (this.settings.height) height = this.settings.height + "px";

               if (this.settings.width) width = this.settings.width + "px";

               imageTemplate =
                  `<div class="ab-image-data-field">` +
                  `<div style="float: left; background-size: cover; background-position: center center; background-image:url('${imageUrl}');  width: ${width}; height: ${height}; position:relative;">` +
                  `<a href="${imageUrl}" target="_blank" title="" class="fa fa-download ab-image-data-field-download"></a>` +
                  `</div></div>`;
            }
            component.logic.setValue(ids.component, imageTemplate);
         }
      };

      return {
         ui: component.ui,
         init: component.init,

         logic: _logic
      };
   }
};
