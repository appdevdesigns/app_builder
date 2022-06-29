const path = require("path");
const retry = require("../../UtilRetry.js");
const AccountingFPCloseCore = require(path.join(
   __dirname,
   "..",
   "..",
   "..",
   "core",
   "process",
   "tasks",
   "ABProcessTaskServiceAccountingFPCloseCore.js"
));

module.exports = class AccountingFPClose extends AccountingFPCloseCore {
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
      // this._dbTransaction = trx;
      this._instance = instance;

      // this.fpObject = this.application.objects((o) => o.id == this.objectFP)[0];
      // this.glObject = this.application.objects((o) => o.id == this.objectGL)[0];
      // this.accObject = this.application.objects(
      //    (o) => o.id == this.objectAcc
      // )[0];

      return new Promise((resolve, reject) => {
         var currentProcessValues = this.hashProcessDataValues(instance);
         var currentFiscalPeriodID = currentProcessValues[this.processFPValue];
         if (!currentFiscalPeriodID) {
            this.log(instance, "unable to find relevant Fiscal Period ID");
            var error = new Error(
               "AccountingFPClose.do(): unable to find relevant Fiscal Period ID"
            );
            reject(error);
            return;
         }
         Promise.resolve()
            .then(() => {
               const knex = ABMigration.connection();
               return retry(() =>
                  knex.raw(
                     `CALL \`CLOSE_FP_PROCESS\`("${currentFiscalPeriodID}");`
                  )
               );
            })
            // Final step
            .then(() => {
               this.log(instance, "I'm done.");
               this.stateCompleted(instance);
               resolve(true);
            })
            .catch((err) => {
               this.log(instance, "Error FP Close:");
               this.onError(this._instance, err);
               reject(err);
            });
      });
   }
};
