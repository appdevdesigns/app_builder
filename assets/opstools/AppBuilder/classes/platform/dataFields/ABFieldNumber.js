const ABFieldNumberCore = require("../../core/dataFields/ABFieldNumberCore");
const ABFieldComponent = require("./ABFieldComponent");

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

/**
 * ABFieldNumberComponent
 *
 * Defines the UI Component for this Data Field.  The ui component is responsible
 * for displaying the properties editor, populating existing data, retrieving
 * property values, etc.
 *
 * @param {obj} App  the current Component Application instance for the current UI.
 * @return {obj} the Component object.
 */
var ABFieldNumberComponent = new ABFieldComponent({
   fieldDefaults: ABFieldNumberCore.defaults(),

   elements: (App, field) => {
      // var idBase = ABFieldNumberDefaults.type;
      // var ids = {
      // 	typeDecimalPlaces: this.unique(App, '_typeDecimalPlaces'),  // App.unique(idBase +'_typeDecimalPlaces'),
      // 	typeRounding: App.unique(idBase +'_typeRounding'),
      // 	validateMinimum: App.unique(idBase + '_validateMinimum'),
      // 	validateMaximum: App.unique(idBase + '_validateMaximum')
      // }

      var ids = {
         // allowRequired: '',
         default: "",
         typeDecimalPlaces: "",
         typeRounding: "",
         validate: "",
         validateMinimum: "",
         validateMaximum: ""
      };
      ids = field.idsUnique(ids, App);

      return [
         // {
         // 	view: "text",
         // 	name:'textDefault',
         // 	labelWidth: App.config.labelWidthXLarge,
         // 	placeholder: L('ab.dataField.string.default', '*Default text')
         // },
         // {
         // 	view: "checkbox",
         // 	id: ids.allowRequired,
         // 	name: "allowRequired",
         // 	labelRight: L("ab.dataField.number.required", "*Required"),
         // 	disallowEdit: true,
         // 	labelWidth: 0,
         // 	on: {
         // 		onChange: (newVal, oldVal) => {
         // 			// when require number, then should have default value
         // 			if (newVal && !$$(ids.default).getValue()) {
         // 				$$(ids.default).setValue('0');
         // 			}
         // 		}
         // 	}
         // },
         {
            view: "text",
            label: L("ab.common.default", "*Default"),
            labelWidth: App.config.labelWidthXLarge,
            id: ids.default,
            name: "default",
            placeholder: L(
               "ab.common.defaultPlaceholder",
               "*Enter default value"
            ),
            labelPosition: "top",
            on: {
               onChange: function(newVal, oldVal) {
                  // Validate number
                  if (!new RegExp("^[0-9.]*$").test(newVal)) {
                     // $$(componentIds.default).setValue(oldVal);
                     this.setValue(oldVal);
                  }
                  // when require number, then should have default value
                  // else if ($$(ids.allowRequired).getValue() && !newVal) {
                  // 	this.setValue('0');
                  // }
               }
            }
         },
         {
            view: "richselect",
            // id: componentIds.typeFormat,
            name: "typeFormat",
            label: L("ab.dataField.number.format", "*Format"),
            value: "none",
            labelWidth: App.config.labelWidthXLarge,
            options: ABFieldNumberCore.formatList()
         },
         {
            view: "richselect",
            // id: componentIds.typeDecimals,
            name: "typeDecimals",
            disallowEdit: true,
            label: L("ab.dataField.number.decimals", "*Decimals"),
            value: "none",
            labelWidth: App.config.labelWidthXLarge,
            options: ABFieldNumberCore.delimiterList(),
            on: {
               onChange: function(newValue, oldValue) {
                  if (newValue == "none") {
                     $$(ids.typeDecimalPlaces).disable();
                     $$(ids.typeRounding).disable();
                     $$(ids.typeDecimalPlaces).hide();
                     $$(ids.typeRounding).hide();
                  } else {
                     $$(ids.typeDecimalPlaces).enable();
                     $$(ids.typeRounding).enable();
                     $$(ids.typeDecimalPlaces).show();
                     $$(ids.typeRounding).show();
                  }
               }
            }
         },
         {
            view: "richselect",
            id: ids.typeDecimalPlaces,
            name: "typeDecimalPlaces",
            disallowEdit: true,
            label: L("ab.dataField.number.places", "*Places"),
            value: "none",
            labelWidth: App.config.labelWidthXLarge,
            disabled: true,
            hidden: true,
            options: [
               { id: "none", value: "0" },
               { id: 1, value: "1" },
               { id: 2, value: "2" },
               { id: 3, value: "3" },
               { id: 4, value: "4" },
               { id: 5, value: "5" },
               { id: 10, value: "10" }
            ]
         },
         {
            view: "richselect",
            id: ids.typeRounding,
            name: "typeRounding",
            label: L("ab.dataField.number.rounding", "*Rounding"),
            value: "none",
            labelWidth: App.config.labelWidthXLarge,
            vertical: true,
            disabled: true,
            hidden: true,
            options: [
               { id: "none", value: L("ab.common.default", "*Default") },
               {
                  id: "roundUp",
                  value: L("ab.dataField.number.roundUp", "*Round Up")
               },
               {
                  id: "roundDown",
                  value: L("ab.dataField.number.roundDown", "*Round Down")
               }
            ]
         },
         {
            view: "richselect",
            // id: componentIds.typeThousands,
            name: "typeThousands",
            label: L("ab.dataField.number.thousands", "*Thousands"),
            value: "none",
            labelWidth: App.config.labelWidthXLarge,
            vertical: true,
            options: ABFieldNumberCore.delimiterList()
         },

         {
            view: "checkbox",
            id: ids.validate,
            name: "validation",
            labelWidth: App.config.labelWidthCheckbox,
            labelRight: L("ab.dataField.number.validation", "*Validation"),
            on: {
               onChange: function(newVal) {
                  if (newVal) {
                     $$(ids.validateMinimum).enable();
                     $$(ids.validateMaximum).enable();
                     $$(ids.validateMinimum).show();
                     $$(ids.validateMaximum).show();
                  } else {
                     $$(ids.validateMinimum).disable();
                     $$(ids.validateMaximum).disable();
                     $$(ids.validateMinimum).hide();
                     $$(ids.validateMaximum).hide();
                  }
               }
            }
         },
         {
            view: "text",
            id: ids.validateMinimum,
            name: "validateMinimum",
            label: L("ab.dataField.number.minimum", "*Minimum"),
            labelWidth: App.config.labelWidthXLarge,
            disabled: true,
            hidden: true,
            on: {
               onChange: function(newVal, oldVal) {
                  // Validate number
                  if (!new RegExp("^[0-9.]*$").test(newVal)) {
                     $$(ids.validateMinimum).setValue(oldVal || "");
                  }
               }
            }
         },
         {
            view: "text",
            id: ids.validateMaximum,
            name: "validateMaximum",
            label: L("ab.dataField.number.maximum", "*Maximum"),
            labelWidth: App.config.labelWidthXLarge,
            disabled: true,
            hidden: true,
            on: {
               onChange: function(newVal, oldVal) {
                  // Validate number
                  if (!new RegExp("^[0-9.]*$").test(newVal)) {
                     $$(ids.validateMaximum).setValue(oldVal || "");
                  }
               }
            }
         }
      ];
   },

   // defaultValues: the keys must match a .name of your elements to set it's default value.
   defaultValues: ABFieldNumberCore.defaultValues(),

   // rules: basic form validation rules for webix form entry.
   // the keys must match a .name of your .elements for it to apply
   rules: {
      // 'textDefault':webix.rules.isNotEmpty,
      // 'supportMultilingual':webix.rules.isNotEmpty
   },

   // include additional behavior on default component operations here:
   // The base routines will be processed first, then these.  Any results
   // from the base routine, will be passed on to these:
   // 	@param {obj} ids  the list of ids used to generate the UI.  your
   //					  provided .elements will have matching .name keys
   //					  to access them here.
   //  @param {obj} values the current set of values provided for this instance
   // 					  of ABField:
   //					  {
   //						id:'',			// if already .saved()
   // 						label:'',
   // 						columnName:'',
   //						settings:{
   //							showIcon:'',
   //
   //							your element key=>values here
   //						}
   //					  }
   //
   // 		.clear(ids)  : reset the display to an empty state
   // 		.isValid(ids, isValid): perform validation on the current editor values
   // 		.populate(ids, values) : populate the form with your current settings
   // 		.show(ids)   : display the form in the editor
   // 		.values(ids, values) : return the current values from the form
   logic: {
      isValid: (ids, isValid) => {
         // validate min/max values
         if (
            $$(ids.validation).getValue() == true &&
            $$(ids.validateMinimum).getValue() &&
            $$(ids.validateMaximum).getValue()
         ) {
            isValid =
               $$(ids.validateMinimum).getValue() <
               $$(ids.validateMaximum).getValue();

            if (!isValid) {
               OP.Dialog.Alert({
                  title: "Validate values are invalid",
                  text: "Maximum value should be greater than minimum value"
               });
            }
         }

         return isValid;
      },

      /*
       * @function requiredOnChange
       *
       * The ABField.definitionEditor implements a default operation
       * to look for a default field and set it to a required field
       * if the field is set to required
       *
       * if you want to override that functionality, implement this fn()
       *
       * @param {string} newVal	The new value of label
       * @param {string} oldVal	The previous value
       */
      // requiredOnChange: (newVal, oldVal, ids) => {

      // 	// when require number, then default value needs to be reqired
      // 	$$(ids.default).define("required", newVal);
      // 	$$(ids.default).refresh();

      // },

      populate: (ids, values) => {
         if (values.settings.validation) {
            $$(ids.validateMinimum).enable();
            $$(ids.validateMaximum).enable();
         } else {
            $$(ids.validateMinimum).disable();
            $$(ids.validateMaximum).disable();
         }
      }
   },

   // perform any additional setup actions here.
   // @param {obj} ids  the hash of id values for all the current form elements.
   //					 it should have your elements + the default Header elements:
   //						.label, .columnName, .fieldDescription, .showIcon
   init: function(ids) {
      // want to hide the description? :
      // $$(ids.fieldDescription).hide();
   }
});

// NOTE: if you need a unique [edit_type] by your returned config.editor above:
webix.editors.number = webix.extend(
   {
      // TODO : Validate number only
   },
   webix.editors.text
);

module.exports = class ABFieldNumber extends ABFieldNumberCore {
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
      return ABFieldNumberComponent.component(App, idBase);
   }

   ///
   /// Working with Actual Object Values:
   ///

   // return the grid column header definition for this instance of ABFieldNumber
   columnHeader(options) {
      var config = super.columnHeader(options);

      config.editor = "number"; // [edit_type] simple inline editing.

      config.format = (d) => {
         var rowData = {};
         rowData[this.columnName] = d;

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
      return super.formComponent("numberbox");
   }

   detailComponent() {
      var detailComponentSetting = super.detailComponent();

      detailComponentSetting.common = () => {
         return {
            key: "detailtext"
         };
      };

      return detailComponentSetting;
   }
};
