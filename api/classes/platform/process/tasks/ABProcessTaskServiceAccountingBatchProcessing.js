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
    * @return {Promise}
    *      resolve(true/false) : true if the task is completed.
    *                            false if task is still waiting
    */
   do(instance) {
      return new Promise((resolve, reject) => {
         var myState = this.myState(instance);

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

         // PUll the Batch Obj
         var batchObj = this.application.objects(
            (o) => o.id == this.objectBatch
         )[0];
         if (!batchObj) {
            var msg = `unable to find relevant Batch Object from our .objectBatch[${this.objectBatch}] configuration`;
            this.log(instance, msg);
            var error = new Error("AccountBatchProcessing.do(): " + msg);
            reject(error);
            return;
         }

         var fieldBatchFinancialPeriod = batchObj.fields(
            (f) => f.id == this.fieldBatchFinancialPeriod
         )[0];
         var fieldBatchEntries = batchObj.fields(
            (f) => f.id == this.fieldBatchEntries
         )[0];

         // Look up our Batch Value
         var cond = {
            where: {
               glue: "and",
               rules: [
                  { key: batchObj.PK(), rule: "equals", value: currentBatchID }
               ]
            },
            populate: true
         };
         batchObj
            .modelAPI()
            .findAll(cond)
            .then((rows) => {
               if (!rows || rows.length != 1) {
                  var msg = `unable to find Batch data for batchID[${currentBatchID}]`;
                  this.log(instance, msg);
                  var error = new Error("AccountBatchProcessing.do(): " + msg);
                  reject(error);
                  return;
               }

               var batchEntry = rows[0];
               var financialPeriod =
                  batchEntry[fieldBatchFinancialPeriod.columnName];
               var journalEntries =
                  batchEntry[fieldBatchEntries.relationName()] || [];

               // // Process Each Journal Entry Sequentially
               // var processEntry = (cb) => {
               //    if (journalEntries.length == 0) {
               //       cb();
               //    } else {
               //       var je = journalEntries.shift();
               //       this.processJournalEntry(je, financialPeriod)
               //          .then(() => {
               //             processEntry(cb);
               //          })
               //          .catch((error) => {
               //             cb(error);
               //          });
               //    }
               // };
               // processEntry((err) => {
               //    if (err) {
               //       reject(err);
               //       return;
               //    }

               //    this.stateCompleted(instance);
               //    // pass true to indicate we are done
               //    resolve(true);
               // });

               // for parallel operation:
               var allEntries = [];
               journalEntries.forEach((je) => {
                  allEntries.push(
                     this.processJournalEntry(je, financialPeriod)
                  );
               });

               Promise.all(allEntries)
                  .then(() => {
                     resolve();
                  })
                  .catch((error) => {
                     this.log(instance, error.toString());
                     reject(error);
                  });
            })
            .catch((error) => {
               this.log(
                  instance,
                  `error finding Batch data for batchID[${currentBatchID}]`
               );
               this.log(instance, error.toString());
               reject(error);
            });
      });
   }

   processJournalEntry(journalEntry, financialPeriod) {
      return new Promise((resolve, reject) => {
         var jeObject = this.application.objects(
            (o) => o.id == this.objectJE
         )[0];
         var fieldJEStatus = jeObject.fields(
            (f) => f.id == this.fieldJEStatus
         )[0];
         var fieldJEAccount = jeObject.fields(
            (f) => f.id == this.fieldJEAccount
         )[0];
         var fieldJERC = jeObject.fields((f) => f.id == this.fieldJERC)[0];

         //     if (JE.status == complete) this has already been done, so skip
         if (
            journalEntry[fieldJEStatus.columnName] == this.fieldJEStatusComplete
         ) {
            resolve();
            return;
         }

         var accountID = journalEntry[fieldJEAccount.columnName];
         var rcID = journalEntry[fieldJERC.columnName];
         this.processBalanceRecord(
            financialPeriod,
            accountID,
            rcID,
            journalEntry
         )
            .then(() => {
               // set JE.status = Complete
               journalEntry[
                  fieldJEStatus.columnName
               ] = this.fieldJEStatusComplete;

               var updateValue = {};
               updateValue[
                  fieldJEStatus.columnName
               ] = this.fieldJEStatusComplete;
               jeObject
                  .modelAPI()
                  .update(journalEntry[jeObject.PK()], updateValue)
                  .then(() => {
                     resolve();
                  })
                  .catch(reject);
            })
            .catch((error) => {
               console.error(error);
               reject(error);
            });
      });
   }

   processBalanceRecord(financialPeriodID, AccountID, RCID, journalEntry) {
      //         get BalanceRecord
      //         if (BalanceRecord not Found)
      //             Create BalanceRecord
      //         add this JE to BalanceRecord.entries

      return new Promise((resolve, reject) => {
         var brObject = this.application.objects(
            (o) => o.id == this.objectBR
         )[0];
         var fieldBRAccount = brObject.fields(
            (f) => f.id == this.fieldBRAccount
         )[0];
         var fieldBRRC = brObject.fields((f) => f.id == this.fieldBRRC)[0];
         var fieldBRFinancialPeriod = brObject.fields(
            (f) => f.id == this.fieldBRFinancialPeriod
         )[0];
         var fieldBREntries = brObject.fields(
            (f) => f.id == this.fieldBREntries
         )[0];

         var balanceRecord = null;

         async.series(
            [
               (done) => {
                  var balCond = { glue: "and", rules: [] };
                  balCond.rules.push({
                     key: fieldBRFinancialPeriod.id,
                     rule: "equals",
                     value: financialPeriodID
                  });
                  balCond.rules.push({
                     key: fieldBRAccount.id,
                     rule: "equals",
                     value: AccountID
                  });

                  if (RCID) {
                     balCond.rules.push({
                        key: fieldBRRC.id,
                        rule: "equals",
                        value: RCID
                     });
                  } else {
                     balCond.rules.push({
                        key: fieldBRRC.id,
                        rule: "is_null",
                        value: null
                     });
                  }
                  // try to find existing BalanceRecord matching our balCond
                  brObject
                     .modelAPI()
                     .findAll({ where: balCond, populate: true })
                     .then((rows) => {
                        balanceRecord = rows[0];
                        done();
                     })
                     .catch((err) => {
                        // TODO: need to pass in .instance so we can do a this.log()
                        done(err);
                     });
               },

               (done) => {
                  // create a new BalanceRecord if we didn't find one:
                  if (balanceRecord) {
                     done();
                     return;
                  }

                  var balValues = {
                     uuid: uuid()
                  };
                  balValues[
                     fieldBRFinancialPeriod.columnName
                  ] = financialPeriodID;
                  balValues[fieldBRAccount.columnName] = AccountID;
                  if (RCID) {
                     balValues[fieldBRRC.columnName] = RCID;
                  } else {
                     balValues[fieldBRRC.columnName] = null;
                  }
                  brObject
                     .modelAPI()
                     .create(balValues)
                     .then((newEntry) => {
                        balanceRecord = newEntry;
                        done();
                     })
                     .catch((err) => {
                        // TODO: need to pass in .instance so we can do a this.log()
                        done(err);
                     });
               },

               (done) => {
                  // sanity check at this point:
                  if (balanceRecord) {
                     done();
                     return;
                  }

                  var error = new Error(
                     "Unable to establish a Balance Record for journal Entry:" +
                        journalEntry.uuid
                  );
                  done(error);
               },

               (done) => {
                  // update balanceRecord with new journalEntry value:
                  // balanceRecord[fieldBREntries.columnName] =
                  //    balanceRecord[fieldBREntries.columnName] || [];
                  // balanceRecord[fieldBREntries.columnName].push(
                  //    journalEntry.uuid
                  // );

                  // var relationName = fieldBREntries.relationName();
                  let relationName = AppBuilder.rules.toFieldRelationFormat(
                     fieldBREntries.columnName
                  );

                  brObject
                     .modelAPI()
                     .relate(
                        balanceRecord[brObject.PK()],
                        fieldBREntries.id,
                        journalEntry
                     )
                     .catch((err) => reject(err))
                     .then(() => {
                        resolve();
                     });

                  // this one works!!!
                  /*
                  balanceRecord
                     .$relatedQuery(relationName)
                     .relate(journalEntry)
                     .catch((err) => reject(err))
                     .then(() => {
                        resolve();
                     });
                     */
                  // balanceRecord
                  //    .$appendRelated(relationName, journalEntry)
                  //    .$query()
                  //    .patch()
                  //    .then(() => {
                  //       done();
                  //    })
                  //    .catch((error) => {
                  //       done(error);
                  //    });

                  // brObject
                  //    .modelAPI()
                  //    .update(balanceRecord[brObject.PK()], balanceRecord)
                  //    .then((updatedValues) => {
                  //       done();
                  //    })
                  //    .catch((error) => {});
               }
            ],
            (err) => {
               if (err) {
                  reject(err);
                  return;
               }
               resolve();
            }
         );
      });
   }
};
