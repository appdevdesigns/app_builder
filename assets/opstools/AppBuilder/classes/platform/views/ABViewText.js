const ABViewTextCore = require("../../core/views/ABViewTextCore");

const ABViewTextPropertyComponentDefaults = ABViewTextCore.defaultValues();

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABViewText extends ABViewTextCore {
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
      webix.codebase = "/js/webix/extras/";

      var idBase = "ABViewTextEditorComponent";
      var ids = {
         component: App.unique(idBase + "_component")
      };

      var _ui = {
         id: ids.component,
         view: "tinymce-editor",
         value: this.text || ABViewTextPropertyComponentDefaults.text,
         config: {
            plugins: [
               "advlist autolink lists link image charmap print preview anchor",
               "searchreplace visualblocks code fullscreen",
               "insertdatetime media table contextmenu paste imagetools wordcount"
            ],
            toolbar:
               "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image",
            // menu: {
            // 	file: { title: 'File', items: 'newdocument' },
            // 	edit: { title: 'Edit', items: 'undo redo | cut copy paste pastetext | selectall' },
            // 	format: { title: 'Format', items: 'formats | removeformat' }
            // },
            init_instance_callback: (editor) => {
               editor.on("KeyUp", (event) => {
                  _logic.onChange();
               });

               editor.on("Change", function(event) {
                  _logic.onChange();
               });
            }
         }
      };

      var _init = (options) => {};

      var _logic = {
         onChange: () => {
            if (this.__onChangeFn) {
               clearTimeout(this.__onChangeFn);

               this.__onChangeFn = null;
            }

            this.__onChangeFn = setTimeout(() => {
               this.text = $$(ids.component).getValue();
               this.save();
            }, 400);
         }
      };

      return {
         ui: _ui,
         init: _init,
         logic: _logic
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

      // _logic functions

      _logic.selectSource = (dcId, oldDcId) => {
         var currView = _logic.currentEditObject();

         // Update field options in property
         this.propertyUpdateFieldOptions(ids, currView, dcId);
      };

      _logic.selectField = (field) => {
         let format = "{#label#}".replace("#label#", field.label);

         // insert text to tinymce
         tinymce.activeEditor.execCommand("mceInsertContent", false, format);
      };

      // in addition to the common .label  values, we
      // ask for:
      return commonUI.concat([
         {
            view: "counter",
            name: "height",
            label: L("ab.component.list.height", "*Height:"),
            labelWidth: App.config.labelWidthLarge
         },
         {
            name: "datacollection",
            view: "richselect",
            label: L("ab.components.list.dataSource", "*Data Source"),
            labelWidth: App.config.labelWidthLarge,
            on: {
               onChange: _logic.selectSource
            }
         },
         {
            name: "field",
            view: "list",
            autoheight: true,
            template: "#label#",
            on: {
               onItemClick: function(id, e, node) {
                  var field = this.getItem(id);

                  _logic.selectField(field);
               }
            }
         }
      ]);
   }

   /**
    * @method propertyUpdateFieldOptions
    * Populate fields of object to select list in property
    *
    * @param {Object} ids
    * @param {ABViewForm} view - the current component
    * @param {string} dvId - id of ABDatacollection
    */
   static propertyUpdateFieldOptions(ids, view, dvId) {
      var datacollection = view.application.datacollections(
         (dc) => dc.id == dvId
      )[0];

      if (!datacollection && view.parent.key == "dataview") {
         datacollection = view.application.datacollections(
            (dc) => dc.id == view.parent.settings.dataviewID
         )[0];
         $$(ids.datacollection).setValue(view.parent.settings.dataviewID);
      }

      var object = datacollection ? datacollection.datasource : null;

      // Pull field list
      $$(ids.field).clearAll();
      if (object) $$(ids.field).parse(object.fields());
      $$(ids.field).refresh();
   }

   static propertyEditorPopulate(App, ids, view) {
      super.propertyEditorPopulate(App, ids, view);

      $$(ids.height).setValue(view.settings.height);

      var dataviewID = view.settings.dataviewID
         ? view.settings.dataviewID
         : null;
      var SourceSelector = $$(ids.datacollection);

      // Pull data collections to options
      var dvOptions = view.propertyDatacollections();
      SourceSelector.define("options", dvOptions);
      SourceSelector.define("value", dataviewID);
      SourceSelector.refresh();

      this.propertyUpdateFieldOptions(ids, view, dataviewID);
   }

   static propertyEditorValues(ids, view) {
      super.propertyEditorValues(ids, view);

      view.settings.height = $$(ids.height).getValue();
      view.settings.dataviewID = $$(ids.datacollection).getValue();
   }

   /**
    * @method component()
    * return a UI component based upon this view.
    * @param {obj} App
    * @return {obj} UI component
    */
   component(App, idPrefix) {
      let baseCom = super.component(App);

      var idBase = "ABViewText_" + (idPrefix ? idPrefix : "") + this.id;
      var ids = {
         component: App.unique(idBase + "_component")
      };

      var _logic = {
         displayText: (val) => {
            var result = this.displayText(val, ids.component);

            if ($$(ids.component)) {
               $$(ids.component).define("template", result);
               $$(ids.component).refresh();
            }
         }
      };

      // an ABViewLabel is a simple Label
      var _ui = {
         id: ids.component,
         view: "template",
         autoheight: true,
         minHeight: 10,
         css: "ab-custom-template",
         borderless: true
      };

      // define height
      if (this.settings.height) _ui.height = this.settings.height;
      else _ui.autoheight = true;

      // make sure each of our child views get .init() called
      var _init = (options) => {};

      var _onShow = (viewId) => {
         baseCom.onShow(viewId);

         // listen DC events
         let dv = this.datacollection;
         if (dv && this.parent.key != "dataview") {
            this.eventAdd({
               emitter: dv,
               eventName: "changeCursor",
               listener: _logic.displayText
            });
         }

         _logic.displayText();
      };

      return {
         ui: _ui,
         init: _init,
         logic: _logic,
         onShow: _onShow
      };
   }
};
