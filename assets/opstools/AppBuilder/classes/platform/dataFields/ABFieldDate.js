var ABFieldDateCore = require("../../core/dataFields/ABFieldDateCore");
var ABFieldComponent = require("./ABFieldComponent");

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

function defaultDateChange() {
   var defaultDateValue = $$(ids.defaultDate).getValue();
   var defaultDate = parseInt(defaultDateValue);
   switch (defaultDate) {
      case 1:
         {
            $$(ids.defaultDateValue).disable();
            $$(ids.defaultDateValue).setValue();
         }
         break;
      case 2:
         {
            $$(ids.defaultDateValue).enable();
            $$(ids.defaultDateValue).setValue(new Date());
            refreshDateValue();
         }
         break;
      case 3:
         {
            $$(ids.defaultDateValue).enable();
            $$(ids.defaultDateValue).setValue();
         }
         break;
      default:
         {
            $$(ids.defaultDateValue).disable();
            $$(ids.defaultDateValue).setValue(new Date());
         }
         break;
   }
}

function refreshDateValue() {
   var defaultFormatValue = $$(ids.dateFormat).getValue();
   var dateFormat = parseInt(defaultFormatValue);

   var formatString = "";
   switch (dateFormat) {
      //Ignore Date
      case (1, 2):
         {
            formatString = "%d/%m/%Y";
         }
         break;
      //mm/dd/yyyy
      case 3:
         {
            formatString = "%m/%d/%Y";
         }
         break;
      //M D, yyyy
      case 4:
         {
            formatString = "%M %d, %Y";
         }
         break;
      //D M, yyyy
      case 5:
         {
            formatString = "%d %M, %Y";
         }
         break;
      default:
         {
            formatString = "%d/%m/%Y";
         }
         break;
   }

   $$(ids.defaultDateValue).define("format", formatString);
   $$(ids.defaultDateValue).refresh();
}

function defaultTimeChange() {
   console.log("defaultTimeChange");
   var dateFormat = parseInt($$(ids.defaultTime).getValue());
   switch (dateFormat) {
      case 1:
         {
            $$(ids.defaultTimeValue).disable();
            $$(ids.defaultTimeValue).setValue();
         }
         break;
      case 2:
         {
            $$(ids.defaultTimeValue).enable();
            $$(ids.defaultTimeValue).setValue(new Date());
         }
         break;
      case 3:
         {
            $$(ids.defaultTimeValue).enable();
            $$(ids.defaultTimeValue).setValue();
         }
         break;
      default:
         {
            $$(ids.defaultTimeValue).disable();
            $$(ids.defaultTimeValue).setValue();
         }
         break;
   }
}

var ids = {
   default: "ab-date-default",
   currentToDefault: "ab-date-current-to-default",

   dateDisplay: "ab-date-display",

   dateFormat: "date-format",
   defaultDate: "default-date",
   defaultDateValue: "default-date-value",

   // validation
   validateCondition: "ab-date-validate-condition",
   validateRange: "ab-date-validate-range",
   validateRangeUnit: "ab-date-validate-range-unit",
   validateRangeBefore: "ab-date-validate-range-before",
   validateRangeAfter: "ab-date-validate-range-after",
   validateRangeBeforeLabel: "ab-date-validate-before-label",
   validateRangeAfterLabel: "ab-date-validate-after-label",

   validateStartDate: "ab-date-validate-start-date",
   validateEndDate: "ab-date-validate-end-date"
};

/**
 * ABFieldDateComponent
 *
 * Defines the UI Component for this Data Field.  The ui component is responsible
 * for displaying the properties editor, populating existing data, retrieving
 * property values, etc.
 */
var ABFieldDateComponent = new ABFieldComponent({
   fieldDefaults: ABFieldDateCore.defaults(),

   elements: (App, field) => {
      ids = field.idsUnique(ids, App);

      return [
         {
            view: "richselect",
            name: "dateFormat",
            id: ids.dateFormat,
            label: L("ab.dataField.date.dateFormat", "*Date Format"),
            labelWidth: 110,
            value: 2,
            options: [
               { id: 2, value: "dd/mm/yyyy" },
               { id: 3, value: "mm/dd/yyyy" },
               { id: 4, value: "M D, yyyy" },
               { id: 5, value: "D M, yyyy" }
            ],
            on: {
               onChange: (newVal, oldVal) => {
                  refreshDateValue();
               }
            }
         },
         {
            cols: [
               {
                  view: "richselect",
                  name: "defaultDate",
                  id: ids.defaultDate,
                  label: L("ab.common.default", "*Default"),
                  labelWidth: 110,
                  value: 1,
                  options: [
                     { id: 1, value: L("ab.common.none", "*None") },
                     {
                        id: 2,
                        value: L(
                           "ab.dataField.date.currentDate",
                           "*Current Date"
                        )
                     },
                     {
                        id: 3,
                        value: L(
                           "ab.dataField.date.specificDate",
                           "*Specific Date"
                        )
                     }
                  ],
                  on: {
                     onChange: (newVal, oldVal) => {
                        defaultDateChange();
                     }
                  }
               },
               {
                  view: "datepicker",
                  name: "defaultDateValue",
                  id: ids.defaultDateValue,
                  gravity: 0.5,
                  disabled: true
               }
            ]
         },
         // Validator
         {
            view: "label",
            label: L(
               "ab.dataField.date.validationCriteria",
               "*Validation criteria"
            ),
            css: "ab-text-bold"
         },
         {
            id: ids.validateCondition,
            view: "select",
            name: "validateCondition",
            label: L("ab.dataField.date.condition", "*Condition"),
            labelWidth: 100,
            value: "none",
            options: [
               { id: "none", value: L("ab.common.none", "*None") },
               {
                  id: "dateRange",
                  value: L("ab.dataField.date.validate.range", "*Range")
               },
               {
                  id: "between",
                  value: L("ab.dataField.date.validate.between", "*Between")
               },
               {
                  id: "notBetween",
                  value: L(
                     "ab.dataField.date.validate.notBetween",
                     "*Not between"
                  )
               },
               {
                  id: "=",
                  value: L("ab.dataField.date.validate.equal", "*Equal to")
               },
               {
                  id: "<>",
                  value: L(
                     "ab.dataField.date.validate.notEqual",
                     "*Not equal to"
                  )
               },
               {
                  id: ">",
                  value: L(
                     "ab.dataField.date.validate.greaterThan",
                     "*Greater than"
                  )
               },
               {
                  id: "<",
                  value: L("ab.dataField.date.validate.lessThan", "*Less than")
               },
               {
                  id: ">=",
                  value: L(
                     "ab.dataField.date.validate.greaterAndEqual",
                     "*Greater than or Equal to"
                  )
               },
               {
                  id: "<=",
                  value: L(
                     "ab.dataField.date.validate.lessAndEqual",
                     "*Less than or Equal to"
                  )
               }
            ],
            on: {
               onChange: (newVal, oldVal) => {
                  switch (newVal) {
                     case "none":
                        $$(ids.validateRange).hide();
                        $$(ids.validateStartDate).hide();
                        $$(ids.validateEndDate).hide();
                        break;
                     case "dateRange":
                        $$(ids.validateRange).show();
                        $$(ids.validateStartDate).hide();
                        $$(ids.validateEndDate).hide();
                        break;
                     case "between":
                     case "notBetween":
                        $$(ids.validateRange).hide();
                        $$(ids.validateStartDate).define("label", "Start Date");
                        $$(ids.validateStartDate).refresh();
                        $$(ids.validateStartDate).show();
                        $$(ids.validateEndDate).show();
                        break;
                     case "=":
                     case "<>":
                     case ">":
                     case "<":
                     case ">=":
                     case "<=":
                        $$(ids.validateRange).hide();
                        $$(ids.validateStartDate).define("label", "Date");
                        $$(ids.validateStartDate).refresh();
                        $$(ids.validateStartDate).show();
                        $$(ids.validateEndDate).hide();
                        break;
                  }
               }
            }
         },
         {
            id: ids.validateRange,
            hidden: true,
            rows: [
               {
                  id: ids.validateRangeUnit,
                  view: "select",
                  name: "validateRangeUnit",
                  label: L("ab.dataField.date.unit", "*Unit"),
                  labelWidth: 100,
                  options: [
                     {
                        id: "days",
                        value: L("ab.dataField.date.days", "*Days")
                     },
                     {
                        id: "months",
                        value: L("ab.dataField.date.months", "*Months")
                     },
                     {
                        id: "years",
                        value: L("ab.dataField.date.years", "*Years")
                     }
                  ],
                  on: {
                     onChange: (newVal) => {
                        $$(ids.validateRangeBeforeLabel).refresh();
                        $$(ids.validateRangeAfterLabel).refresh();
                     }
                  }
               },
               {
                  cols: [
                     {
                        id: ids.validateRangeBeforeLabel,
                        view: "template",
                        align: "left",
                        width: 140,
                        borderless: true,
                        template: () => {
                           let unit = $$(ids.validateRangeUnit).getValue(),
                              selectedUnit = $$(
                                 ids.validateRangeUnit
                              ).config.options.filter(
                                 (opt) => opt.id == unit
                              )[0];

                           var beforeLabel =
                              L("ab.dataField.date.before", "*Before") +
                              " #number# #unit#"
                                 .replace(
                                    "#number#",
                                    $$(ids.validateRangeBefore).getValue()
                                 )
                                 .replace("#unit#", selectedUnit.value);

                           return beforeLabel;
                        }
                     },
                     {
                        view: "label",
                        label: "",
                        align: "center",
                        width: 1
                     },
                     {
                        id: ids.validateRangeAfterLabel,
                        view: "template",
                        align: "right",
                        borderless: true,
                        template: () => {
                           let unit = $$(ids.validateRangeUnit).getValue(),
                              selectedUnit = $$(
                                 ids.validateRangeUnit
                              ).config.options.filter(
                                 (opt) => opt.id == unit
                              )[0];

                           var afterLabel =
                              L("ab.dataField.date.after", "*After") +
                              " #number# #unit#"
                                 .replace(
                                    "#number#",
                                    $$(ids.validateRangeAfter).getValue()
                                 )
                                 .replace("#unit#", selectedUnit.value);

                           return afterLabel;
                        }
                     }
                  ]
               },
               {
                  cols: [
                     {
                        id: ids.validateRangeBefore,
                        view: "slider",
                        name: "validateRangeBefore",
                        on: {
                           onChange: (newVal, oldValue) => {
                              $$(ids.validateRangeBeforeLabel).refresh();
                           }
                        }
                     },
                     {
                        id: ids.validateRangeAfter,
                        view: "slider",
                        name: "validateRangeAfter",
                        on: {
                           onChange: (newVal, oldValue) => {
                              $$(ids.validateRangeAfterLabel).refresh();
                           }
                        }
                     }
                  ]
               }
            ]
         },
         {
            id: ids.validateStartDate,
            name: "validateStartDate",
            view: "datepicker",
            label: L("ab.dataField.date.startDate", "*Start Date"),
            labelWidth: 100,
            hidden: true
         },
         {
            id: ids.validateEndDate,
            name: "validateEndDate",
            view: "datepicker",
            label: L("ab.dataField.date.endDate", "*End Date"),
            labelWidth: 100,
            hidden: true
         }
      ];
   },

   // defaultValues: the keys must match a .name of your elements to set it's default value.
   defaultValues: ABFieldDateCore.defaultValues(),

   // rules: basic form validation rules for webix form entry.
   // the keys must match a .name of your .elements for it to apply
   rules: {},

   // include additional behavior on default component operations here:
   // The base routines will be processed first, then these.  Any results
   // from the base routine, will be passed on to these:
   logic: {
      // isValid: function (ids, isValid) {

      // }

      populate: (ids, values) => {
         $$(ids.defaultDateValue).setValue(
            new Date(values.settings.defaultDateValue)
         );
      },

      show: function(ids) {
         // dateDisplayRefresh();
         refreshDateValue();
      }

      // dateDisplay: (date, settings) => {
      //     var dateFormat = getDateFormat(settings);

      //     return webix.Date.dateToStr(dateFormat)(date);
      // }
   },

   // perform any additional setup actions here.
   // @param {obj} ids  the hash of id values for all the current form elements.
   //					 it should have your elements + the default Header elements:
   //						.label, .columnName, .fieldDescription, .showIcon
   init: (ids) => {}
});

module.exports = class ABFieldDate extends ABFieldDateCore {
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
      return ABFieldDateComponent.component(App, idBase);
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

   // return the grid column header definition for this instance of ABFieldDate
   columnHeader(options) {
      var config = super.columnHeader(options);

      // if (this.settings.includeTime)
      // config.editor = "datetime";
      // else
      config.editor = "date";

      // allows entering characters in datepicker input, false by default
      config.editable = true;

      // NOTE: it seems that the default value is a string in ISO format.

      //// NOTE: webix seems unable to parse ISO string into => date here.
      // config.map = '(date)#'+this.columnName+'#';   // so don't use this.

      config.template = (row) => {
         if (row.$group) return row[this.columnName];

         return this.format(row);
      };

      config.format = (d) => {
         var rowData = {};
         rowData[this.columnName] = d;

         return this.format(rowData);
      };

      config.editFormat = (d) => {
         // this routine needs to return a Date() object for the editor to work with.

         if (d == "" || d == null) {
            return "";
         }

         // else retun the actual ISO string => Date() value
         return new Date(moment(d));
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
      // NOTE: what is being returned here needs to mimic an ABView CLASS.
      // primarily the .common() and .newInstance() methods.
      var formComponentSetting = super.formComponent("datepicker");

      // .common() is used to create the display in the list
      formComponentSetting.common = () => {
         return {
            key: "datepicker"
         };
      };

      return formComponentSetting;
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

   dateToString(dateFormat, dateData) {
      return webix.Date.dateToStr(dateFormat)(dateData);
   }
};
