var ABFieldCustomIndexCore = require("../../core/dataFields/ABFieldCustomIndexCore");
var ABFieldComponent = require("./ABFieldComponent");

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

var ids = {
   combinedFields: "ab-new-customIndex-combinedFields"
};

/**
 * ABFieldCustomIndexComponent
 *
 * Defines the UI Component for this Data Field.  The ui component is responsible
 * for displaying the properties editor, populating existing data, retrieving
 * property values, etc.
 *
 * @param {obj} App  the current Component Application instance for the current UI.
 * @return {obj} the Component object.
 */
var ABFieldCustomIndexComponent = new ABFieldComponent({
   fieldDefaults: ABFieldCustomIndexCore.defaults(),

   elements: (App, field) => {
      ids = field.idsUnique(ids, App);

      return [
         {
            id: ids.combinedFields,
            name: "combinedFields",
            view: "multicombo",
            label: L("ab.customIndex.combinedFields", "*Combined Fields"),
            labelWidth: 130,
            disallowEdit: true,
            options: []
         }
      ];
   },

   // defaultValues: the keys must match a .name of your elements to set it's default value.
   defaultValues: ABFieldCustomIndexCore.defaultValues(),

   // rules: basic form validation rules for webix form entry.
   // the keys must match a .name of your .elements for it to apply
   rules: {
      // 'textDefault':webix.rules.isNotEmpty,
      // 'supportMultilingual':webix.rules.isNotEmpty
   },

   logic: {
      objectLoad: (object) => {
         ABFieldCustomIndexComponent.CurrentObject = object;
      },

      show: () => {
         let fields = ABFieldCustomIndexComponent.CurrentObject.fields((f) => {
            return (
               f.key == "string" ||
               f.key == "LongText" ||
               f.key == "number" ||
               f.key == "date" ||
               f.key == "datetime" ||
               f.key == "boolean" ||
               f.key == "list" ||
               f.key == "email" ||
               f.key == "user" ||
               f.key == "AutoIndex" ||
               f.key == "customIndex"
            );
         }).map((f) => {
            return {
               id: f.id,
               value: f.label
            };
         });

         let $combinedFields = $$(ids.combinedFields);
         if ($combinedFields) {
            $combinedFields.define("options", fields);
            $combinedFields.refresh();
         }
      }
   },

   // perform any additional setup actions here.
   // @param {obj} ids  the hash of id values for all the current form elements.
   //					 it should have your elements + the default Header elements:
   //						.label, .columnName, .fieldDescription, .showIcon
   init: function(ids) {}
});

module.exports = class ABFieldCustomIndex extends ABFieldCustomIndexCore {
   constructor(values, object) {
      super(values, object);
   }

   /*
    * @function propertiesComponent
    *
    * return a UI Component that contains the property definitions for this Field.
    *
    * @param {App} App the UI App instance passed around the Components.
    * @param {stirng} idBase
    * @return {Component}
    */
   static propertiesComponent(App, idBase) {
      return ABFieldCustomIndexComponent.component(App, idBase);
   }

   ///
   /// Instance Methods
   ///
   isValid() {
      var validator = super.isValid();

      // validator.addError('columnName', L('ab.validation.object.name.unique', 'Field columnName must be unique (#name# already used in this Application)').replace('#name#', this.name) );

      return validator;
   }

   ///
   /// Working with Actual Object Values:
   ///

   // return the grid column header definition for this instance of ABFieldCustomIndex
   columnHeader(options) {
      var config = super.columnHeader(options);

      config.editor = null; // read only
      config.css = "textCell";
      config.template = (rowData) => {
         return this.format(rowData);
      };

      return config;
   }

   /*
    * @funciton formComponent
    * returns a drag and droppable component that is used on the UI
    * interface builder to place form components related to this ABField.
    *
    * an ABField defines which form component is used to edit it's contents.
    * However, what is returned here, needs to be able to create an instance of
    * the component that will be stored with the ABViewForm.
    */
   formComponent() {
      return super.formComponent("fieldreadonly");
   }

   detailComponent() {
      let detailComponentSetting = super.detailComponent();

      detailComponentSetting.common = () => {
         return {
            key: "detailtext"
         };
      };

      return detailComponentSetting;
   }
};
