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

      let getAccFieldOptions = (accObjID) => {
         let fields = [
            {
               id: 0,
               value: L("ab.process.accounting.selectField", "*Select a Field")
            }
         ];

         if (accObjID) {
            var entry = objectList.find((o) => o.id == accObjID);
            if (entry && entry.object) {
               entry.object
                  .fields((f) => f.key == "list")
                  .forEach((f) => {
                     fields.push({ id: f.id, value: f.label, field: f });
                  });
            }
         }
         return fields;
      };

      let getAccTypeOptions = (typeFieldId) => {
         let result = [];
         let fpAccount = this.application.objects(
            (obj) => obj.id == this.objectAccount
         )[0];
         if (!fpAccount) return result;

         let fpStatusField = fpAccount.fields((f) => f.id == typeFieldId)[0];
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

      let updateAccFields = (accFields) => {
         $$(ids.objectAccount).define("options", accFields);
         $$(ids.objectAccount).refresh();
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

      let accTypeFields = getAccFieldOptions(this.objectAccount);
      let accTypeOptions = getAccTypeOptions(this.fieldAccType);

      var ui = {
         id: id,
         view: "form",
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
               options: objectList
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
               options: objectList
            },
            {
               id: ids.objectGL,
               view: "select",
               label: L("ab.process.accounting.objectGL", "*Balance Object"),
               value: this.objectGL,
               name: "objectGL",
               options: objectList
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
                        accTypeFields = getAccFieldOptions(newVal);
                        updateAccFields(accTypeFields);
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
               id: ids.fieldAccType,
               view: "select",
               label: L("ab.process.accounting.fieldAccType", "*Acc -> Type"),
               value: this.fieldAccType,
               name: "fieldAccType",
               options: accTypeFields,
               on: {
                  onChange: (newVal, oldVal) => {
                     if (newVal != oldVal) {
                        accTypeOptions = getAccTypeOptions(newVal);
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
