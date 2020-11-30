const AccountingFPCloseCore = require("../../../core/process/tasks/ABProcessTaskServiceAccountingFPCloseCore.js");

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

module.exports = class AccountingFPClose extends AccountingFPCloseCore {
   ////
   //// Process Instance Methods
   ////

   propertyIDs(id) {
      return {
         name: `${id}_name`,
         processFPValue: `${id}_processFPValue`,
         objectFP: `${id}_objectFP`,
         objectGL: `${id}_objectGL`,
         objectAcc: `${id}_objectAcc`,
         fieldFPStart: `${id}_fieldFPStart`,
         fieldFPOpen: `${id}_fieldFPOpen`,
         fieldFPStatus: `${id}_fieldFPStatus`,
         fieldFPActive: `${id}_fieldFPActive`,
         fieldGLStarting: `${id}_fieldGLStarting`,
         fieldGLRunning: `${id}_fieldGLRunning`,
         fieldGLAccount: `${id}_fieldGLAccount`,
         fieldGLRc: `${id}_fieldGLRc`,
         fieldGLDebit: `${id}fieldGLDebit`,
         fieldGLCredit: `${id}_fieldGLCredit`,
         fieldAccType: `${id}_fieldAccType`,
         fieldAccAsset: `${id}_fieldAccAsset`,
         fieldAccExpense: `${id}_fieldAccExpense`,
         fieldAccLiabilities: `${id}_fieldAccLiabilities`,
         fieldAccEquity: `${id}_fieldAccEquity`,
         fieldAccIncome: `${id}_fieldAccIncome`
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

      let getFieldOptions = (objID) => {
         let fields = [
            {
               id: 0,
               value: L("ab.process.accounting.selectField", "*Select a Field")
            }
         ];

         if (objID) {
            var entry = objectList.find((o) => o.id == objID);
            if (entry && entry.object) {
               entry.object.fields().forEach((f) => {
                  fields.push({ id: f.id, value: f.label, field: f });
               });
            }
         }
         return fields;
      };

      let getStatusFieldOptions = (statusFieldId) => {
         let result = [];
         let fpObject = this.application.objects(
            (obj) => obj.id == this.objectFP
         )[0];
         if (!fpObject) return result;

         let fpStatusField = fpObject.fields((f) => f.id == statusFieldId)[0];
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

      let updateFPFields = (fpFields) => {
         [ids.fieldFPStart, ids.fieldFPOpen, ids.fieldFPStatus].forEach(
            (fieldGLElem) => {
               $$(fieldGLElem).define("options", fpFields);
               $$(fieldGLElem).refresh();
            }
         );
      };

      let updateFPStatusFields = (fpStatusOptions) => {
         $$(ids.fieldFPActive).define("options", fpStatusOptions);
         $$(ids.fieldFPActive).refresh();
      };

      let updateGLFields = (glFields) => {
         [
            ids.fieldGLRunning,
            ids.fieldGLAccount,
            ids.fieldGLRc,
            ids.fieldGLDebit,
            ids.fieldGLCredit
         ].forEach((fieldGLElem) => {
            $$(fieldGLElem).define("options", glFields);
            $$(fieldGLElem).refresh();
         });
      };

      let updateAccFields = (accFields) => {
         $$(ids.fieldAccType).define("options", accFields);
         $$(ids.fieldAccType).refresh();
      };

      let updateAccTypeOptions = (accTypeOptions) => {
         [
            ids.fieldAccAsset,
            ids.fieldAccExpense,
            ids.fieldAccLiabilities,
            ids.fieldAccEquity,
            ids.fieldAccIncome
         ].forEach((fieldGLElem) => {
            $$(fieldGLElem).define("options", accTypeOptions);
            $$(fieldGLElem).refresh();
         });
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

      let fpFields = getFieldOptions(this.objectFP);
      let glFields = getFieldOptions(this.objectGL);
      let accFields = getFieldOptions(this.objectAcc);
      let fpStatusFields = getStatusFieldOptions(this.fieldFPStatus);
      let accTypeOptions = getListOptions(this.objectAcc, this.fieldAccType);

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
               id: ids.processFPValue,
               view: "select",
               label: L(
                  "ab.process.accounting.processFPValue",
                  "*Process Fiscal Period Value"
               ),
               value: this.processFPValue,
               name: "processFPValue",
               options: processValues
            },
            {
               id: ids.objectFP,
               view: "select",
               label: L("ab.process.accounting.objectFP", "*FP Object"),
               value: this.objectFP,
               name: "objectFP",
               options: objectList,
               on: {
                  onChange(newVal, oldVal) {
                     if (newVal != oldVal) {
                        // gather new set of batchFields
                        fpFields = getFieldOptions(newVal);
                        // rebuild the associated list of Fields to pick
                        updateFPFields(fpFields);
                     }
                  }
               }
            },
            {
               id: ids.objectGL,
               view: "select",
               label: L("ab.process.accounting.objectGL", "*GL Object"),
               value: this.objectGL,
               name: "objectGL",
               options: objectList,
               on: {
                  onChange(newVal, oldVal) {
                     if (newVal != oldVal) {
                        // gather new set of batchFields
                        glFields = getFieldOptions(newVal);
                        // rebuild the associated list of Fields to pick
                        updateGLFields(glFields);
                     }
                  }
               }
            },
            {
               id: ids.objectAcc,
               view: "select",
               label: L("ab.process.accounting.objectAcc", "*Account Object"),
               value: this.objectAcc,
               name: "objectAcc",
               options: objectList,
               on: {
                  onChange(newVal, oldVal) {
                     if (newVal != oldVal) {
                        accFields = getFieldOptions(newVal);
                        updateAccFields(accFields);
                     }
                  }
               }
            },
            {
               id: ids.fieldFPStart,
               view: "select",
               label: L("ab.process.accounting.fieldFPStart", "*FP -> Start"),
               value: this.fieldFPStart,
               name: "fieldFPStart",
               options: fpFields
            },
            {
               id: ids.fieldFPOpen,
               view: "select",
               label: L("ab.process.accounting.fieldFPOpen", "*FP -> Open"),
               value: this.fieldFPOpen,
               name: "fieldFPOpen",
               options: fpFields
            },
            {
               id: ids.fieldFPStatus,
               view: "select",
               label: L("ab.process.accounting.fieldFPStatus", "*FP -> Status"),
               value: this.fieldFPStatus,
               name: "fieldFPStatus",
               options: fpFields,
               on: {
                  onChange(newVal, oldVal) {
                     if (newVal != oldVal) {
                        fpStatusFields = getStatusFieldOptions(newVal);
                        updateFPStatusFields(fpStatusFields);
                     }
                  }
               }
            },
            {
               id: ids.fieldFPActive,
               view: "select",
               label: L("ab.process.accounting.fieldFPActive", "*FP -> Active"),
               value: this.fieldFPActive,
               name: "fieldFPActive",
               options: fpStatusFields
            },
            {
               id: ids.fieldGLStarting,
               view: "select",
               label: L(
                  "ab.process.accounting.fieldGLStarting",
                  "*GL -> Starting BL"
               ),
               value: this.fieldGLStarting,
               name: "fieldGLStarting",
               options: glFields
            },
            {
               id: ids.fieldGLRunning,
               view: "select",
               label: L(
                  "ab.process.accounting.fieldGLRunning",
                  "*GL -> Running BL"
               ),
               value: this.fieldGLRunning,
               name: "fieldGLRunning",
               options: glFields
            },
            {
               id: ids.fieldGLAccount,
               view: "select",
               label: L(
                  "ab.process.accounting.fieldGLAccount",
                  "*GL -> Account"
               ),
               value: this.fieldGLAccount,
               name: "fieldGLAccount",
               options: glFields
            },
            {
               id: ids.fieldGLRc,
               view: "select",
               label: L("ab.process.accounting.fieldGLRc", "*GL -> RC"),
               value: this.fieldGLRc,
               name: "fieldGLRc",
               options: glFields
            },
            {
               id: ids.fieldGLDebit,
               view: "select",
               label: L("ab.process.accounting.fieldGLDebit", "*GL -> Debit"),
               value: this.fieldGLDebit,
               name: "fieldGLDebit",
               options: glFields
            },
            {
               id: ids.fieldGLCredit,
               view: "select",
               label: L("ab.process.accounting.fieldGLCredit", "*GL -> Credit"),
               value: this.fieldGLCredit,
               name: "fieldGLCredit",
               options: glFields
            },
            {
               id: ids.fieldAccType,
               view: "select",
               label: L("ab.process.accounting.fieldAccType", "*Acc -> Type"),
               value: this.fieldAccType,
               name: "fieldAccType",
               options: accFields,
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
               id: ids.fieldAccAsset,
               view: "select",
               label: L("ab.process.accounting.fieldAccAsset", "*Acc -> Asset"),
               value: this.fieldAccAsset,
               name: "fieldAccAsset",
               options: accTypeOptions
            },
            {
               id: ids.fieldAccExpense,
               view: "select",
               label: L(
                  "ab.process.accounting.fieldAccExpense",
                  "*Acc -> Expense"
               ),
               value: this.fieldAccExpense,
               name: "fieldAccExpense",
               options: accTypeOptions
            },
            {
               id: ids.fieldAccLiabilities,
               view: "select",
               label: L(
                  "ab.process.accounting.fieldAccLiabilities",
                  "*Acc -> Liabilities"
               ),
               value: this.fieldAccLiabilities,
               name: "fieldAccLiabilities",
               options: accTypeOptions
            },
            {
               id: ids.fieldAccEquity,
               view: "select",
               label: L(
                  "ab.process.accounting.fieldAccEquity",
                  "*Acc -> Equity"
               ),
               value: this.fieldAccEquity,
               name: "fieldAccEquity",
               options: accTypeOptions
            },
            {
               id: ids.fieldAccIncome,
               view: "select",
               label: L(
                  "ab.process.accounting.fieldAccIncome",
                  "*Acc -> Income"
               ),
               value: this.fieldAccIncome,
               name: "fieldAccIncome",
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
