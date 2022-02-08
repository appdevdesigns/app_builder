const ABProcessTaskServiceCore = require("../../../core/process/tasks/ABProcessTaskServiceCore.js");

const AccountingBatchProcessing = require("./ABProcessTaskServiceAccountingBatchProcessing.js");
const AccountingFPClose = require("./ABProcessTaskServiceAccountingFPClose.js");
const AccountingFPYearClose = require("./ABProcessTaskServiceAccountingFPYearClose.js");
const AccountingJEArchive = require("./ABProcessTaskServiceAccountingJEArchive.js");
const ABProcessTaskServiceQuery = require("./ABProcessTaskServiceQuery.js");
const ABProcessTaskServiceInsertRecord = require("./ABProcessTaskServiceInsertRecord.js");
const ABProcessTaskServiceCalculate = require("./ABProcessTaskServiceCalculate.js");

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABProcessTaskService extends ABProcessTaskServiceCore {
   ////
   //// Process Instance Methods
   ////

   propertyIDs(id) {
      return {
         name: `${id}_name`
      };
   }

   /**
    * propertiesShow()
    * display the properties panel for this Process Element.
    * @param {string} id
    *        the webix $$(id) of the properties panel area.
    */
   propertiesShow(id) {
      // var ids = this.propertyIDs(id);

      var ui = {
         id: id,
         view: "form",
         elements: [
            {
               view: "button",
               label: L(
                  "ab.process.task.service.accountingBatch",
                  "*Accounting: Process Batch"
               ),
               click: () => {
                  this.switchTo("accountingBatch", id);
               }
            },
            {
               view: "button",
               label: L(
                  "ab.process.task.service.accountingFPClose",
                  "*Accounting: Fiscal Period Close"
               ),
               click: () => {
                  this.switchTo("accountingFPClose", id);
               }
            },
            {
               view: "button",
               label: L(
                  "ab.process.task.service.accountingFPYearClose",
                  "*Accounting: Fiscal Period Year Close"
               ),
               click: () => {
                  this.switchTo("accountingFPYearClose", id);
               }
            },
            {
               view: "button",
               label: L(
                  "ab.process.task.service.accountingJEArchive",
                  "*Accounting: Journal Entry Archive"
               ),
               click: () => {
                  this.switchTo("accountingJEArchive", id);
               }
            },
            {
               view: "button",
               label: L("ab.process.task.service.query", "*Query Task"),
               click: () => {
                  this.switchTo("query", id);
               }
            },
            {
               view: "button",
               label: L(
                  "ab.process.task.service.insertRecord",
                  "*Insert Record Task"
               ),
               click: () => {
                  this.switchTo("insertRecord", id);
               }
            },
            {
               view: "button",
               label: L("ab.process.task.service.calculate", "*Calculate Task"),
               click: () => {
                  this.switchTo("calculate", id);
               }
            }
         ]
      };

      webix.ui(ui, $$(id));

      $$(id).show();
   }

   /**
    * switchTo()
    * replace this object with an instance of one of our child classes:
    * @param {string} classType
    *        a key representing with subObject to create an instance of.
    * @param {string} propertiesID
    *        the webix ui.id container for the properties panel.
    */
   switchTo(classType, propertiesID) {
      // get a copy of my values, but don't pass on .key and .type
      var myValues = this.toObj();
      delete myValues.key;
      delete myValues.type;

      // create an instance of the desired child
      var child = null;
      switch (classType) {
         case "accountingBatch":
            child = new AccountingBatchProcessing(
               myValues,
               this.process,
               this.application
            );
            break;

         case "accountingFPClose":
            child = new AccountingFPClose(
               myValues,
               this.process,
               this.application
            );
            break;

         case "accountingFPYearClose":
            child = new AccountingFPYearClose(
               myValues,
               this.process,
               this.application
            );
            break;

         case "accountingJEArchive":
            child = new AccountingJEArchive(
               myValues,
               this.process,
               this.application
            );
            break;

         case "query":
            child = new ABProcessTaskServiceQuery(
               myValues,
               this.process,
               this.application
            );
            break;

         case "insertRecord":
            child = new ABProcessTaskServiceInsertRecord(
               myValues,
               this.process,
               this.application
            );
            break;

         case "calculate":
            child = new ABProcessTaskServiceCalculate(
               myValues,
               this.process,
               this.application
            );
            break;
      }

      super.switchTo(child, propertiesID);
   }
};
