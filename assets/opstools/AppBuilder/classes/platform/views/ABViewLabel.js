const ABViewLabelCore = require("../../core/views/ABViewLabelCore");

const ABViewLabelPropertyComponentDefaults = ABViewLabelCore.defaultValues();

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABViewLabel extends ABViewLabelCore {
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
      var idBase = "ABViewLabelEditorComponent";
      var ids = {
         component: App.unique(idBase + "_component")
      };

      var _ui = {
         type: "form",
         margin: 10,
         padding: 10,
         borderless: true,
         rows: [
            {
               id: ids.component,
               view: "label",
               label: this.text || "",
               align: this.settings.alignment
            },
            {}
         ]
      };

      _ui = this.uiFormatting(_ui);

      var _init = (options) => {};

      // var _logic = {
      // }

      return {
         ui: _ui,
         init: _init
      };
   }

   //
   // Property Editor
   //

   // static propertyEditorComponent(App) {
   // 	return ABViewPropertyComponent.component(App);
   // }

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
         // .text :  The Text displayed for this label
         {
            view: "text",
            name: "text",
            label: L("ab.component.label.text", "*Text"),
            placeholder: L(
               "ab.component.label.textPlaceholder",
               "*Text Placeholder"
            )
            // labelWidth: App.config.labelWidthMedium,
         },
         {
            view: "fieldset",
            label: L("ab.component.label.formatting", "*Format Options:"),
            body: {
               type: "clean",
               padding: 10,
               rows: [
                  {
                     view: "radio",
                     name: "format",
                     vertical: true,
                     value: ABViewLabelPropertyComponentDefaults.format,
                     options: [
                        {
                           id: 0,
                           value: L(
                              "ab.component.label.formatting.normal",
                              "*normal"
                           )
                        },
                        {
                           id: 1,
                           value: L(
                              "ab.component.label.formatting.title",
                              "*title"
                           )
                        },
                        {
                           id: 2,
                           value: L(
                              "ab.component.label.formatting.description",
                              "*description"
                           )
                        }
                     ]
                  }
               ]
            }
         },
         {
            view: "fieldset",
            label: L("ab.component.label.alignment", "*Alignment:"),
            body: {
               type: "clean",
               padding: 10,
               rows: [
                  {
                     view: "radio",
                     name: "alignment",
                     vertical: true,
                     value: ABViewLabelPropertyComponentDefaults.alignment,
                     options: [
                        {
                           id: "left",
                           value: L(
                              "ab.component.label.alignment.left",
                              "*Left"
                           )
                        },
                        {
                           id: "center",
                           value: L(
                              "ab.component.label.alignment.center",
                              "*Center"
                           )
                        },
                        {
                           id: "right",
                           value: L(
                              "ab.component.label.alignment.right",
                              "*Right"
                           )
                        }
                     ]
                  }
               ]
            }
         },
         {}
      ]);
   }

   static propertyEditorPopulate(App, ids, view) {
      super.propertyEditorPopulate(App, ids, view);

      $$(ids.text).setValue(view.text);
      $$(ids.format).setValue(view.settings.format);
      $$(ids.alignment).setValue(view.settings.alignment);
   }

   static propertyEditorValues(ids, view) {
      super.propertyEditorValues(ids, view);

      view.text = $$(ids.text).getValue();
      view.settings.format = $$(ids.format).getValue();
      view.settings.alignment = $$(ids.alignment).getValue();
   }

   /*
    * @component()
    * return a UI component based upon this view.
    * @param {obj} App
    * @return {obj} UI component
    */
   component(App) {
      // get a UI component for each of our child views
      var viewComponents = [];
      this.views().forEach((v) => {
         viewComponents.push(v.component(App));
      });

      var idBase = "ABViewLabel_" + this.id;
      var ids = {
         component: App.unique(idBase + "_component")
      };

      // an ABViewLabel is a simple Label
      var _ui = {
         type: "form",
         padding: 15,
         borderless: true,
         rows: [
            {
               id: ids.component,
               view: "label",
               // css: 'ab-component-header ab-ellipses-text',
               label: this.text || "*",
               align: this.settings.alignment,
               type: {
                  height: "auto"
               }
            }
         ]
      };
      _ui = this.uiFormatting(_ui);

      // make sure each of our child views get .init() called
      var _init = (options) => {};

      return {
         ui: _ui,
         init: _init
      };
   }

   /**
    * @method uiFormatting
    * a common routine to properly update the displayed label
    * UI with the css formatting for the given .settings
    * @param {obj} _ui the current webix.ui definition
    * @return {obj} a properly formatted webix.ui definition
    */
   uiFormatting(_ui) {
      // add different css settings based upon it's format
      // type.
      switch (parseInt(this.settings.format)) {
         // normal
         case 0:
            _ui.rows[0].css = "ab-component-label ab-ellipses-text";
            break;

         // title
         case 1:
            _ui.rows[0].css = "ab-component-header ab-ellipses-text";
            break;

         // description
         case 2:
            _ui.rows[0].css = "ab-component-description ab-ellipses-text";
            break;
      }

      return _ui;
   }
};
