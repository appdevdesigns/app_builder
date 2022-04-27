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
const fs = require("fs");
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
   constructor(values, object, application) {
      super(values, object, application);

      this.createSP();
   }

   ////
   //// Process Instance Methods
   ////

   /**
    * @method createSP
    * this method creates the MySQL store procedure that use to process in .do function
    */
   createSP() {
      return Promise.resolve()
         .then(() => new Promise((next, bad) => {
            const scriptFilePath = __dirname + "/scripts/ns_app/BALANCE_PROCESS.sql";
            fs.readFile(scriptFilePath, 'utf8', function (err, data) {
               if (err) bad(err);
               else next(data);
            });

         }))
         .then((spStatement) => {
            const knex = ABMigration.connection();
            return knex.schema.raw(spStatement);
         });
   }

   /**
    * @method do()
    * this method actually performs the action for this task.
    * @param {obj} instance  the instance data of the running process
    * @param {Knex.Transaction?} trx - [optional]
    * @return {Promise}
    *      resolve(true/false) : true if the task is completed.
    *                            false if task is still waiting
    */
   do(instance, trx) {
      this._instance = instance;

      // Objects
      this.batchObj = this.application.objects((o) => o.id == this.objectBatch)[0];
      this.brObject = this.application.objects((o) => o.id == this.objectBR)[0];
      this.jeObject = this.application.objects((o) => o.id == this.objectJE)[0];

      // Fields
      this.batchFinancialPeriodField = this.batchObj.fields((f) => f.id == this.fieldBatchFinancialPeriod)[0];
      this.batchEntriesField = this.batchObj.fields((f) => f.id == this.fieldBatchEntries)[0];
      this.brFinancialPeriodField = this.brObject.fields((f) => f.id == this.fieldBRFinancialPeriod)[0];
      this.brAccountField = this.brObject.fields((f) => f.id == this.fieldBRAccount)[0];
      this.jeAccountField = this.jeObject.fields((f) => f.id == this.fieldJEAccount)[0];

      // get the current Batch Data from the process
      const currentProcessValues = this.hashProcessDataValues(instance);
      const currentBatchID = currentProcessValues[this.processBatchValue];
      if (!currentBatchID) {
         this.log(instance, "unable to find relevant Batch ID");
         const error = new Error(
            "AccountBatchProcessing.do(): unable to find relevant Batch ID"
         );
         return Promise.reject(error);
      }

      return Promise.resolve()
         // Pull Batch entry
         .then(() => new Promise((next, bad) => {
            this.batchObj.modelAPI().findAll({
               where: {
                  glue: "and",
                  rules: [
                     {
                        key: this.batchObj.PK(),
                        rule: "equals",
                        value: currentBatchID
                     }
                  ]
               },
               populate: true
            })
               .then((rows) => {
                  if (!rows || rows.length != 1) {
                     var msg = `unable to find Batch data for batchID[${currentBatchID}]`;
                     this.log(instance, msg);
                     var error = new Error(
                        "AccountBatchProcessing.do(): " + msg
                     );
                     bad(error);
                     return;
                  }

                  this.batchEntry = rows[0];
                  next();
               })
               .catch(bad);
         }))
         // Run Process
         .then(() => new Promise((next, bad) => {
            const knex = ABMigration.connection();
            knex.schema.raw(`CALL \`BALANCE_PROCESS\`("${currentBatchID}");`)
               .then(() => {
                  next();
               })
               .catch((error) => {
                  bad(error);
               });
         }))
         // Broadcast
         .then(() => new Promise((next, bad) => {
            if (this.batchEntry == null) {
               next();
               return;
            }

            let financialPeriod = this.batchEntry[this.batchFinancialPeriodField.columnName];
            let journalEntries = this.batchEntry[this.batchEntriesField.relationName()] || [];
            let accountIDs = _.uniq(journalEntries.map((je) => je[this.jeAccountField.columnName]).filter((accId) => accId));

            var balCond = { glue: "and", rules: [] };
            balCond.rules.push({
               key: this.brFinancialPeriodField.id,
               rule: "equals",
               value: financialPeriod
            });
            balCond.rules.push({
               key: this.brAccountField.id,
               rule: "in",
               value: accountIDs
            });

            this.brObject
               .modelAPI()
               .findAll({
                  where: balCond,
                  populate: true
               })
               .then((list) => {
                  (list || []).forEach((brItem) => {
                     sails.sockets.broadcast(
                        this.brObject.id,
                        "ab.datacollection.update",
                        {
                           objectId: this.brObject.id,
                           data: brItem
                        }
                     );
                  });

                  next();
               })
               .catch(bad);
         }))
         // finish out the Process Task:
         .then(() => new Promise((next, bad) => {
            this.stateCompleted(instance);
            this.log(instance, "Batch Processed successfully");
            next(true);
         }))
         .catch((error) => {
            this.onError(this._instance, error);
         });
   }
};
