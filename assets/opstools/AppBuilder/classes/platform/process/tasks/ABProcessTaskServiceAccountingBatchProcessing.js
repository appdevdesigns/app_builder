const AccountingBatchProcessingCore = require("../../../core/process/tasks/ABProcessTaskServiceAccountingBatchProcessingCore.js");

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

module.exports = class AccountingBatchProcessing extends AccountingBatchProcessingCore {
   ////
   //// Process Instance Methods
   ////

   propertyIDs(id) {
      return {
         name: `${id}_name`,
         processBatchValue: `${id}_processBatchValue`,
         objectBatch: `${id}_objectBatch`,
         fieldBatchEntries: `${id}_fieldBatchEntries`,
         fieldBatchFinancialPeriod: `${id}_fieldBatchFinancialPeriod`,
         objectJE: `${id}_objectJE`,
         fieldJEAccount: `${id}_fieldJEAccount`,
         fieldJERC: `${id}_fieldJERC`,
         fieldJEStatus: `${id}_fieldJEStatus`,
         fieldJEStatusComplete: `${id}_fieldJEStatusComplete`,
         objectBR: `${id}_objectBR`,
         fieldBRFinancialPeriod: `${id}_fieldBRFinancialPeriod`,
         fieldBRAccount: `${id}_fieldBRAccount`,
         fieldBRRC: `${id}_fieldBRRC`,
         fieldBREntries: `${id}_fieldBREntries`
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

      //
      // set up field settings:
      //

      var blankField = {
         id: 0,
         value: L("ab.process.accounting.selectField", "*Select a Field")
      };
      // blankField : generic Select a field entry

      function defaultFields(objID) {
         // create a new options array of Field Choices for the given obj.id

         var fields = [blankField];
         if (objID) {
            var entry = objectList.find((o) => o.id == objID);
            if (entry && entry.object) {
               entry.object.fields().forEach((f) => {
                  fields.push({ id: f.id, value: f.label, field: f });
               });
            }
         }
         return fields;
      }

      function updateFields(fieldPickers, fieldValues, defaultValue) {
         // update the list of field select choices with the new field choices

         fieldPickers.forEach((fp) => {
            var picker = $$(fp);
            if (picker) {
               picker.define("options", fieldValues);
               // if (defaultValue) {
               //    picker.define("value", defaultValue);
               // } else {
               //    picker.define("value", fieldValues[0].value);
               // }
               picker.refresh();
               picker.show();
            }
         });
      }

      var batchFields = defaultFields(this.objectBatch);
      // batchFields : the default list of fields for the Batch Object

      var fieldPickersBatch = [
         ids.fieldBatchEntries,
         ids.fieldBatchFinancialPeriod
      ];
      // fieldPickersBatch : the list of field selects to update for the Batch
      //      object.

      var jeFields = defaultFields(this.objectJE);
      // jeFields : the default list of fields for the Journal Entry Object

      var fieldPickersJE = [
         ids.fieldJEAccount,
         ids.fieldJERC,
         ids.fieldJEStatus
      ];
      // fieldPickersJE : the list of field selects to update for the Journal Entry
      //      object.

      function compileStatusValues(statusField) {
         var values = [{ id: 0, value: "Select the Complete Value" }];
         if (statusField && statusField.options) {
            statusField.options().forEach((o) => {
               values.push({ id: o.id, value: o.text });
            });
         }
         return values;
      }

      function updatePickerStatusComplete(values) {
         var wbxComplete = $$(ids.fieldJEStatusComplete);
         if (wbxComplete) {
            // update fieldJEStatusComplete options
            wbxComplete.define("options", values);
            wbxComplete.refresh();
            // show fieldJEStatusComplete
            wbxComplete.show();
         }
      }

      function onStatusComplete(newVal) {
         // pull the ABField object from newValue
         var jeEntryID = $$(ids.objectJE).getValue();
         var jeEntry = objectList.find((o) => o.id == jeEntryID);
         if (jeEntry && jeEntry.object) {
            var statusField = jeEntry.object.fields((f) => f.id == newVal)[0];
            if (statusField && statusField.options) {
               // get the options as an []
               jeFieldStatusValues = compileStatusValues(statusField);

               updatePickerStatusComplete(jeFieldStatusValues);
            }
         }
      }

      var jeFieldStatusValues = compileStatusValues();
      // jeFieldStatusValues : the list of status options from the fieldJEStatus
      //      selected entry.

      var brFields = defaultFields(this.objectBR);
      // jeFields : the default list of fields for the Journal Entry Object

      var fieldPickersBR = [
         ids.fieldBRFinancialPeriod,
         ids.fieldBRAccount,
         ids.fieldBRRC,
         ids.fieldBREntries
      ];
      // fieldPickersBR : the list of field selects to update for the Balance Record
      //      object.

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
               id: ids.processBatchValue,
               view: "select",
               label: L(
                  "ab.process.accounting.processBatchValue",
                  "*Process Batch Value"
               ),
               value: this.processBatchValue,
               name: "processBatchValue",
               options: processValues
            },
            {
               id: ids.objectBatch,
               view: "select",
               label: L("ab.process.accounting.batchObject", "*Batch Object"),
               value: this.objectBatch,
               name: "objectBatch",
               options: objectList,
               on: {
                  onChange(newVal, oldVal) {
                     if (newVal != oldVal) {
                        // gather new set of batchFields
                        batchFields = defaultFields(newVal);
                        // rebuild the associated list of Fields to pick
                        updateFields(fieldPickersBatch, batchFields);
                     }
                  }
               }
            },
            {
               id: ids.fieldBatchEntries,
               view: "select",
               label: L(
                  "ab.process.accounting.fieldBatchEntries",
                  "*Batch->JE[]"
               ),
               value: this.fieldBatchEntries,
               name: "fieldBatchEntries",
               options: batchFields,
               hidden: true
            },
            {
               id: ids.fieldBatchFinancialPeriod,
               view: "select",
               label: L(
                  "ab.process.accounting.fieldBatchFinancialPeriod",
                  "*Batch->FinancialPeriod"
               ),
               value: this.fieldBatchFinancialPeriod,
               name: "fieldBatchFinancialPeriod",
               options: batchFields,
               hidden: true
            },
            {
               id: ids.objectJE,
               view: "select",
               label: L(
                  "ab.process.accounting.batchJE",
                  "*Journal Entry Object"
               ),
               value: this.objectJE,
               name: "objectJE",
               options: objectList,
               on: {
                  onChange(newVal, oldVal) {
                     if (newVal != oldVal) {
                        // gather new set of jeFields
                        jeFields = defaultFields(newVal);
                        // rebuild the associated list of Fields to pick
                        updateFields(fieldPickersJE, jeFields);
                     }
                  }
               }
            },
            {
               id: ids.fieldJEAccount,
               view: "select",
               label: L("ab.process.accounting.fieldJEAccount", "*JE->Account"),
               value: this.fieldJEAccount,
               name: "fieldJEAccount",
               options: jeFields,
               hidden: true
            },
            {
               id: ids.fieldJERC,
               view: "select",
               label: L("ab.process.accounting.fieldJERC", "*JE->RC"),
               value: this.fieldJERC,
               name: "fieldJERC",
               options: jeFields,
               hidden: true
            },
            {
               id: ids.fieldJEStatus,
               view: "select",
               label: L("ab.process.accounting.fieldJEStatus", "*JE->Status"),
               value: this.fieldJEStatus,
               name: "fieldJEStatus",
               options: jeFields,
               hidden: true,
               on: {
                  onChange(newVal, oldVal) {
                     if (newVal != oldVal) {
                        onStatusComplete(newVal);
                     }
                  }
               }
            },
            {
               id: ids.fieldJEStatusComplete,
               view: "select",
               label: L(
                  "ab.process.accounting.fieldJEStatusComplete",
                  "*JE->Status->Complete"
               ),
               value: this.fieldJEStatusComplete,
               name: "fieldJEStatusComplete",
               options: jeFieldStatusValues,
               hidden: true
            },
            {
               id: ids.objectBR,
               view: "select",
               label: L("ab.process.accounting.objectBR", "*Balance Record"),
               value: this.objectBR,
               name: "objectBR",
               options: objectList,
               on: {
                  onChange(newVal, oldVal) {
                     if (newVal != oldVal) {
                        // gather new set of jeFields
                        brFields = defaultFields(newVal);
                        // rebuild the associated list of Fields to pick
                        updateFields(fieldPickersBR, brFields);
                     }
                  }
               }
            },
            {
               id: ids.fieldBRFinancialPeriod,
               view: "select",
               label: L(
                  "ab.process.accounting.fieldBRFinancialPeriod",
                  "*BR->FP"
               ),
               value: this.fieldBRFinancialPeriod,
               name: "fieldBRFinancialPeriod",
               options: brFields,
               hidden: true
            },
            {
               id: ids.fieldBRAccount,
               view: "select",
               label: L("ab.process.accounting.fieldBRAccount", "*BR->Account"),
               value: this.fieldBRAccount,
               name: "fieldBRAccount",
               options: brFields,
               hidden: true
            },
            {
               id: ids.fieldBRRC,
               view: "select",
               label: L("ab.process.accounting.fieldBRRC", "*BR->RC"),
               value: this.fieldBRRC,
               name: "fieldBRRC",
               options: brFields,
               hidden: true
            },
            {
               id: ids.fieldBREntries,
               view: "select",
               label: L("ab.process.accounting.fieldBREntries", "*BR->Entries"),
               value: this.fieldBREntries,
               name: "fieldBREntries",
               options: brFields,
               hidden: true
            }
         ]
      };

      webix.ui(ui, $$(id));

      // if there are already default values for our Objects,
      // unhide the field selectors:
      if (this.objectBatch && this.objectBatch != 0) {
         updateFields(fieldPickersBatch, batchFields);
      }

      if (this.objectJE && this.objectJE != 0) {
         updateFields(fieldPickersJE, jeFields);
      }

      if (this.fieldJEStatus) {
         onStatusComplete(this.fieldJEStatus);
      }

      if (this.objectBR && this.objectBR != 0) {
         updateFields(fieldPickersBR, brFields);
      }

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

      this.defaults.settings.forEach((s) => {
         this[s] = this.property(ids[s]);
      });
   }
};
