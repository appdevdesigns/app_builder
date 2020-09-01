const AccountingFPYearCloseCore = require("../../../core/process/tasks/ABProcessTaskServiceAccountingFPYearCloseCore.js");

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

module.exports = class AccountingFPYearClose extends AccountingFPYearCloseCore {
   ////
   //// Process Instance Methods
   ////
   propertyIDs(id) {
      return {
         name: `${id}_name`,
         processFPYearValue: `${id}_processFPYearValue`,
         objectFPYear: `${id}_objectFPYear`,
         objectFPMonth: `${id}_objectFPMonth`,
         objectGL: `${id}_objectGL`,
         objectAccount: `${id}_objectAccount`,
         valueFundBalances: `${id}_valueFundBalances`,
         valueNetIncome: `${id}_valueNetIncome`,
         fieldFPYearStart: `${id}_fieldFPYearStart`,
         fieldFPYearEnd: `${id}_fieldFPYearEnd`,
         fieldFPYearStatus: `${id}_fieldFPYearStatus`,
         fieldFPYearActive: `${id}_fieldFPYearActive`,
         fieldFPMonthStart: `${id}_fieldFPMonthStart`,
         fieldFPMonthEnd: `${id}_fieldFPMonthEnd`,
         fieldGLStartBalance: `${id}_fieldGLStartBalance`,
         fieldGLRunningBalance: `${id}_fieldGLRunningBalance`,
         fieldGLrc: `${id}_fieldGLrc`,
         fieldAccNumber: `${id}_fieldAccNumber`,
         fieldAccType: `${id}_fieldAccType`,
         fieldAccTypeIncome: `${id}_fieldAccTypeIncome`,
         fieldAccTypeExpense: `${id}_fieldAccTypeExpense`,
         fieldAccTypeEquity: `${id}_fieldAccTypeEquity`
      };
   }

   /**
    * propertiesShow()
    * display the properties panel for this Process Element.
    * @param {string} id
    *        the webix $$(id) of the properties panel area.
    */
   propertiesShow(id) {
      var ids = this.propertyIDs(id);

      var processValues = [{ id: 0, value: "Select a Process Value" }];
      var processDataFields = this.process.processDataFields(this);
      (processDataFields || []).forEach((row) => {
         processValues.push({ id: row.key, value: row.label });
      });

      var objectList = this.application.objects().map((o) => {
         return { id: o.id, value: o.label || o.name, object: o };
      });
      objectList.unshift({
         id: 0,
         value: L("ab.process.accounting.selectObject", "*Select an Object")
      });

      let getFieldOptions = (objID, fieldKey) => {
         let fields = [
            {
               id: 0,
               value: L("ab.process.accounting.selectField", "*Select a Field")
            }
         ];

         if (objID) {
            var entry = objectList.find((o) => o.id == objID);
            if (entry && entry.object) {
               entry.object
                  .fields((f) => f.key == fieldKey)
                  .forEach((f) => {
                     fields.push({ id: f.id, value: f.label, field: f });
                  });
            }
         }
         return fields;
      };

      let getListOptions = (objectId, fieldId) => {
         let result = [];
         let object = this.application.objects((obj) => obj.id == objectId)[0];
         if (!object) return result;

         let fpStatusField = object.fields((f) => f.id == fieldId)[0];
         if (
            !fpStatusField ||
            !fpStatusField.settings ||
            !fpStatusField.settings.options
         )
            return result;

         result = (fpStatusField.settings.options || []).map((opt) => {
            return {
               id: opt.id,
               value: opt.text
            };
         });

         return result;
      };

      let updateAccNumberFields = (accNumberFields) => {
         $$(ids.fieldAccNumber).define("options", accNumberFields);
         $$(ids.fieldAccNumber).refresh();
      };

      let updateAccFields = (accFields) => {
         $$(ids.fieldAccType).define("options", accFields);
         $$(ids.fieldAccType).refresh();
      };

      let updateAccTypeOptions = (accTypeOptions) => {
         [
            ids.fieldAccTypeIncome,
            ids.fieldAccTypeExpense,
            ids.fieldAccTypeEquity
         ].forEach((fieldGLElem) => {
            $$(fieldGLElem).define("options", accTypeOptions);
            $$(fieldGLElem).refresh();
         });
      };

      let updateFPYearDateOptions = (fpYearDateOptions) => {
         [ids.fieldFPYearStart, ids.fieldFPYearEnd].forEach((fieldGLElem) => {
            $$(fieldGLElem).define("options", fpYearDateOptions);
            $$(fieldGLElem).refresh();
         });
      };

      let updateFPYearStatusOptions = (fpYearStatusFields) => {
         $$(ids.fieldFPYearStatus).define("options", fpYearStatusFields);
         $$(ids.fieldFPYearStatus).refresh();
      };

      let updateFPYearActiveOptions = (fpYearStatusOptions) => {
         $$(ids.fieldFPYearActive).define("options", fpYearStatusOptions);
         $$(ids.fieldFPYearActive).refresh();
      };

      let updateFPMonthDateFields = (fpMonthDateOpts) => {
         [ids.fieldFPMonthStart, ids.fieldFPMonthEnd].forEach((fieldGLElem) => {
            $$(fieldGLElem).define("options", fpMonthDateOpts);
            $$(fieldGLElem).refresh();
         });
      };

      let updateGlNumberFields = (glNumberOptions) => {
         [ids.fieldGLStartBalance, ids.fieldGLRunningBalance].forEach(
            (fieldGLElem) => {
               $$(fieldGLElem).define("options", glNumberOptions);
               $$(fieldGLElem).refresh();
            }
         );
      };

      let updateGlConnectFields = (glRcOptions) => {
         $$(ids.fieldGLrc).define("options", glRcOptions);
         $$(ids.fieldGLrc).refresh();
      };

      let fpYearDateFields = getFieldOptions(this.objectFPYear, "date");
      let fpYearStatusFields = getFieldOptions(this.objectFPYear, "list");
      let fpYearStatusOptions = getListOptions(
         this.objectFPYear,
         this.fieldFPYearStatus
      );
      let fpMonthDateFields = getFieldOptions(this.objectFPMonth, "date");
      let glNumberFields = getFieldOptions(this.objectGL, "number");
      let glRcFields = getFieldOptions(this.objectGL, "connectObject");
      let accNumberFields = getFieldOptions(this.objectAccount, "number");
      let accTypeFields = getFieldOptions(this.objectAccount, "list");
      let accTypeOptions = getListOptions(
         this.objectAccount,
         this.fieldAccType
      );

      var ui = {
         id: id,
         view: "form",
         elementsConfig: {
            labelWidth: 200
         },
         elements: [
            {
               id: ids.name,
               view: "text",
               label: L("ab.process.element.name", "*Name"),
               name: "name",
               value: this.name
            },
            {
               id: ids.processFPYearValue,
               view: "select",
               label: L(
                  "ab.process.accounting.processFPYearValue",
                  "*Process Fiscal Period Year Value"
               ),
               value: this.processFPYearValue,
               name: "processFPYearValue",
               options: processValues
            },
            {
               id: ids.objectFPYear,
               view: "select",
               label: L(
                  "ab.process.accounting.objectFPYear",
                  "*FP Year Object"
               ),
               value: this.objectFPYear,
               name: "objectFPYear",
               options: objectList,
               on: {
                  onChange: (newVal, oldVal) => {
                     if (newVal != oldVal) {
                        fpYearDateFields = getFieldOptions(newVal, "date");
                        updateFPYearDateOptions(fpYearDateFields);

                        accTypeFields = getFieldOptions(newVal, "list");
                        updateFPYearStatusOptions(accTypeFields);
                     }
                  }
               }
            },
            {
               id: ids.objectFPMonth,
               view: "select",
               label: L(
                  "ab.process.accounting.objectFPMonth",
                  "*FP Month Object"
               ),
               value: this.objectFPMonth,
               name: "objectFPMonth",
               options: objectList,
               on: {
                  onChange: (newVal, oldVal) => {
                     if (newVal != oldVal) {
                        fpMonthDateFields = getFieldOptions(newVal, "date");
                        updateFPMonthDateFields(fpMonthDateFields);
                     }
                  }
               }
            },
            {
               id: ids.objectGL,
               view: "select",
               label: L("ab.process.accounting.objectGL", "*Balance Object"),
               value: this.objectGL,
               name: "objectGL",
               options: objectList,
               on: {
                  onChange: (newVal, oldVal) => {
                     if (newVal != oldVal) {
                        glNumberFields = getFieldOptions(newVal, "number");
                        updateGlNumberFields(glNumberFields);

                        glRcFields = getFieldOptions(newVal, "connectObject");
                        updateGlConnectFields(glRcFields);
                     }
                  }
               }
            },
            {
               id: ids.objectAccount,
               view: "select",
               label: L(
                  "ab.process.accounting.objectAccount",
                  "*Account Object"
               ),
               value: this.objectAccount,
               name: "objectAccount",
               options: objectList,
               on: {
                  onChange: (newVal, oldVal) => {
                     if (newVal != oldVal) {
                        accTypeFields = getFieldOptions(newVal, "list");
                        updateAccFields(accTypeFields);

                        accNumberFields = getFieldOptions(newVal, "number");
                        updateAccNumberFields(accNumberFields);
                     }
                  }
               }
            },
            {
               id: ids.valueFundBalances,
               view: "text",
               label: L(
                  "ab.process.accounting.valueFundBalances",
                  "*Fund Balances Code"
               ),
               value: this.valueFundBalances,
               name: "valueFundBalances"
            },
            {
               id: ids.valueNetIncome,
               view: "text",
               label: L(
                  "ab.process.accounting.valueNetIncome",
                  "*Net Income Code"
               ),
               value: this.valueNetIncome,
               name: "valueNetIncome"
            },
            {
               id: ids.fieldFPYearStart,
               view: "select",
               label: L(
                  "ab.process.accounting.fieldFPYearStart",
                  "*FP Year -> Start"
               ),
               value: this.fieldFPYearStart,
               name: "fieldFPYearStart",
               options: fpYearDateFields
            },
            {
               id: ids.fieldFPYearEnd,
               view: "select",
               label: L(
                  "ab.process.accounting.fieldFPYearEnd",
                  "*FP Year -> End"
               ),
               value: this.fieldFPYearEnd,
               name: "fieldFPYearEnd",
               options: fpYearDateFields
            },
            {
               id: ids.fieldFPYearStatus,
               view: "select",
               label: L(
                  "ab.process.accounting.fieldFPYearStatus",
                  "*FP Year -> Status"
               ),
               value: this.fieldFPYearStatus,
               name: "fieldFPYearStatus",
               options: fpYearStatusFields,
               on: {
                  onChange: (newVal, oldVal) => {
                     if (newVal != oldVal) {
                        fpYearStatusOptions = getListOptions(
                           this.objectFPYear || $$(ids.objectFPYear).getValue(),
                           newVal
                        );
                        updateFPYearActiveOptions(fpYearStatusOptions);
                     }
                  }
               }
            },
            {
               id: ids.fieldFPYearActive,
               view: "select",
               label: L(
                  "ab.process.accounting.fieldFPYearActive",
                  "*FP Year -> Active"
               ),
               value: this.fieldFPYearActive,
               name: "fieldFPYearActive",
               options: fpYearStatusOptions
            },
            {
               id: ids.fieldFPMonthStart,
               view: "select",
               label: L(
                  "ab.process.accounting.fieldFPMonthStart",
                  "*FP Month -> Start"
               ),
               value: this.fieldFPMonthStart,
               name: "fieldFPMonthStart",
               options: fpMonthDateFields
            },
            {
               id: ids.fieldFPMonthEnd,
               view: "select",
               label: L(
                  "ab.process.accounting.fieldFPMonthEnd",
                  "*FP Month -> End"
               ),
               value: this.fieldFPMonthEnd,
               name: "fieldFPMonthEnd",
               options: fpMonthDateFields
            },
            {
               id: ids.fieldGLStartBalance,
               view: "select",
               label: L(
                  "ab.process.accounting.fieldGLStartBalance",
                  "*GL -> Start Balance"
               ),
               value: this.fieldGLStartBalance,
               name: "fieldGLStartBalance",
               options: glNumberFields
            },
            {
               id: ids.fieldGLRunningBalance,
               view: "select",
               label: L(
                  "ab.process.accounting.fieldGLRunningBalance",
                  "*GL -> Running Balance"
               ),
               value: this.fieldGLRunningBalance,
               name: "fieldGLRunningBalance",
               options: glNumberFields
            },
            {
               id: ids.fieldGLrc,
               view: "select",
               label: L("ab.process.accounting.fieldGLrc", "*GL -> RC"),
               value: this.fieldGLrc,
               name: "fieldGLrc",
               options: glRcFields
            },
            {
               id: ids.fieldAccNumber,
               view: "select",
               label: L(
                  "ab.process.accounting.fieldAccNumber",
                  "*Acc -> Account Number"
               ),
               value: this.fieldAccNumber,
               name: "fieldAccNumber",
               options: accNumberFields
            },
            {
               id: ids.fieldAccType,
               view: "select",
               label: L("ab.process.accounting.fieldAccType", "*Acc -> Type"),
               value: this.fieldAccType,
               name: "fieldAccType",
               options: accTypeFields,
               on: {
                  onChange: (newVal, oldVal) => {
                     if (newVal != oldVal) {
                        accTypeOptions = getListOptions(
                           this.objectAccount ||
                              $$(ids.objectAccount).getValue(),
                           newVal
                        );
                        updateAccTypeOptions(accTypeOptions);
                     }
                  }
               }
            },
            {
               id: ids.fieldAccTypeIncome,
               view: "select",
               label: L(
                  "ab.process.accounting.fieldAccTypeIncome",
                  "*Acc -> Income"
               ),
               value: this.fieldAccTypeIncome,
               name: "fieldAccTypeIncome",
               options: accTypeOptions
            },
            {
               id: ids.fieldAccTypeExpense,
               view: "select",
               label: L(
                  "ab.process.accounting.fieldAccTypeExpense",
                  "*Acc -> Expense"
               ),
               value: this.fieldAccTypeExpense,
               name: "fieldAccTypeExpense",
               options: accTypeOptions
            },
            {
               id: ids.fieldAccTypeEquity,
               view: "select",
               label: L(
                  "ab.process.accounting.fieldAccTypeEquity",
                  "*Acc -> Equity"
               ),
               value: this.fieldAccTypeEquity,
               name: "fieldAccTypeEquity",
               options: accTypeOptions
            }
         ]
      };

      webix.ui(ui, $$(id));

      $$(id).show();
   }

   /**
    * propertiesStash()
    * pull our values from our property panel.
    * @param {string} id
    *        the webix $$(id) of the properties panel area.
    */
   propertiesStash(id) {
      var ids = this.propertyIDs(id);
      this.name = this.property(ids.name);

      // TIP: keep the .settings entries == ids[s] keys and this will
      // remain simple:
      this.defaults.settings.forEach((s) => {
         this[s] = this.property(ids[s]);
      });
   }
};

