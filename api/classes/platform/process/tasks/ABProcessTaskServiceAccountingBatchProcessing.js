const path = require("path");
const AccountingBatchProcessingCore = require(path.join(
   __dirname,
   "..",
   "..",
   "..",
   "core",
   "process",
   "tasks",
   "ABProcessTaskServiceAccountingBatchProcessingCore.js"
));

const async = require("async");
const uuid = require("uuid/v4");

// const ABProcessParticipant = require(path.join(
//    __dirname,
//    "..",
//    "ABProcessParticipant"
// ));

const retry = require("../../UtilRetry.js");

// const AB = require("ab-utils");
// const reqAB = AB.reqAB({}, {});
// reqAB.jobID = "ABProcessTaskServiceAccountingBatchProcessing";

module.exports = class AccountingBatchProcessing extends AccountingBatchProcessingCore {
   ////
   //// Process Instance Methods
   ////

   /**
    * do()
    * this method actually performs the action for this task.
    * @param {obj} instance  the instance data of the running process
    * @param {Knex.Transaction?} trx - [optional]
    * @return {Promise}
    *      resolve(true/false) : true if the task is completed.
    *                            false if task is still waiting
    */
   do(instance, trx) {
      this._instance = instance;

      return new Promise((resolve, reject) => {
         // get the current Batch Data from the process
         var currentProcessValues = this.hashProcessDataValues(instance);
         var currentBatchID = currentProcessValues[this.processBatchValue];
         if (!currentBatchID) {
            this.log(instance, "unable to find relevant Batch ID");
            var error = new Error(
               "AccountBatchProcessing.do(): unable to find relevant Batch ID"
            );
            reject(error);
            return;
         }

         const knex = ABMigration.connection();
         knex.schema.raw(`CALL \`BALANCE_PROCESS\`(${currentBatchID});`)
            .then(() => {
               // finish out the Process Task:
               this.stateCompleted(instance);
               this.log(instance, "Batch Processed successfully");
               resolve(true);
            })
            .catch((error) => {
               this.onError(this._instance, error);
               reject(error);
            });
      });
   }
};
