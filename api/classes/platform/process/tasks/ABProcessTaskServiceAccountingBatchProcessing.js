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
         this.balanceRecordsProcessed = {};
         // { balanceRecord.id : balanceRecord.id }
         // a hash of the balance records that were updated from this batch of
         // journal entries.  This will be used at the end to perform the recalculations

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

         //
         // Main Work Chain
         //
         Promise.resolve()
            .then(() => {
               // prepare Account Lookup
               // pull a list of all Accounts in system
               var jeObject = this.application.objects(
                  (o) => o.id == this.objectJE
               )[0];
               var fieldJEAccount = jeObject.fields(
                  (f) => f.id == this.fieldJEAccount
               )[0];
               var accountObject = fieldJEAccount.datasourceLink;

               return accountObject
                  .modelAPI()
                  .findAll({ where: {}, populate: true })
                  .then((list) => {
                     this.allAccountRecords = list;
                  });
            })
            .then(() => {
               return batchObj
                  .modelAPI()
                  .findAll(cond)
                  .then((rows) => {
                     if (!rows || rows.length != 1) {
                        var msg = `unable to find Batch data for batchID[${currentBatchID}]`;
                        this.log(instance, msg);
                        var error = new Error(
                           "AccountBatchProcessing.do(): " + msg
                        );
                        reject(error);
                        return;
                     }

                     var batchEntry = rows[0];
                     var financialPeriod =
                        batchEntry[fieldBatchFinancialPeriod.columnName];
                     var journalEntries =
                        batchEntry[fieldBatchEntries.relationName()] || [];

                     // for parallel operation:
                     var allEntries = [];
                     journalEntries.forEach((je) => {
                        allEntries.push(
                           this.processJournalEntry(je, financialPeriod)
                        );
                     });

                     return Promise.all(allEntries);
                  })
                  .catch((error) => {
                     this.log(
                        instance,
                        `error processing Batch data for batchID[${currentBatchID}]`
                     );
                     this.log(instance, error.toString());
                     reject(error);
                  });
            })
            .then(() => {
               return this.recalculateBalances();
            })
            .then(() => {
               resolve();
            })
            .catch((error) => {
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
         if (!accountID) {
            var missingAccountError = new Error(
               `Journal Entry [${journalEntry.uuid}] is missing an Account`
            );
            reject(missingAccountError);
            return;
         }

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

   // Get Account Entry
   //    figure out which Account.category field ()
   //

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

         // find Account 3991
         var acct3991 = this.allAccountRecords.find(
            (a) => a["Acct Num"] == 3991
         );

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
                     uuid: uuid(),
                     "Starting Balance": 0
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

                  var brID = balanceRecord[brObject.PK()];
                  brObject
                     .modelAPI()
                     .relate(brID, fieldBREntries.id, journalEntry)
                     .catch((err) => done(err))
                     .then(() => {
                        this.balanceRecordsProcessed[brID] = brID;
                        done();
                     });
               },

               (done) => {
                  if (!acct3991) {
                     done();
                     return;
                  }

                  // if this account is ! Account3991
                  if (AccountID == acct3991.uuid) {
                     done();
                     return;
                  }

                  // if this was a JE that was either an Income or Expnse Account
                  var jeType = this.lookupAccountType(journalEntry);
                  if (jeType == "income" || jeType == "expenses") {
                     // perform another processBalanceRecord( with account3991)
                     this.processBalanceRecord(
                        financialPeriodID,
                        acct3991.uuid,
                        RCID,
                        journalEntry
                     )
                        .then(() => {
                           done();
                        })
                        .catch(done);
                  } else {
                     done();
                  }
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

   recalculateBalances() {
      var allBalanceRecords = [];

      var brObject = this.application.objects((o) => o.id == this.objectBR)[0];

      return Promise.resolve()
         .then(() => {
            // pull fully populated Balance Records that were updated on this run

            var allIDs = Object.keys(this.balanceRecordsProcessed);
            var cond = {
               where: {
                  glue: "and",
                  rules: [{ key: brObject.PK(), rule: "in", value: allIDs }]
               },
               populate: true
            };
            return brObject
               .modelAPI()
               .findAll(cond)
               .then((list) => {
                  allBalanceRecords = list;
               });
         })
         .then(() => {})
         .then(() => {
            var allUpdates = [];

            // for each balanceRecord
            (allBalanceRecords || []).forEach((balanceRecord) => {
               // runningBalance = startingBalance
               // totalCredit, totalDebit = 0;
               var runningBalance = balanceRecord["Starting Balance"];
               var totalCredit = 0;
               var totalDebit = 0;

               // for each JournalEntry
               var fieldJE = brObject.fields(
                  (f) => f.id == this.fieldBREntries
               )[0];
               (fieldJE.pullRelationValues(balanceRecord) || []).forEach(
                  (journalEntry) => {
                     // prevent working with data as a string or with NULL values
                     journalEntry["Debit"] = parseFloat(
                        journalEntry["Debit"] || 0
                     );
                     journalEntry["Credit"] = parseFloat(
                        journalEntry["Credit"] || 0
                     );

                     // lookup the Account type
                     var accountType = this.lookupAccountType(journalEntry);
                     switch (accountType) {
                        // case: "asset" || "expense"
                        case "assets":
                        case "expenses":
                           // runningBalance = runningBalance - JE.credit + JE.debit
                           runningBalance +=
                              journalEntry["Debit"] - journalEntry["Credit"];
                           break;

                        // case: Liabilities, Equity, Income
                        case "liabilities":
                        case "equity":
                        case "income":
                           // runningBalance = runningBalance - JE.debit + JE.credit
                           runningBalance +=
                              journalEntry["Credit"] - journalEntry["Debit"];
                           break;

                        default:
                           // Q: what to do if a JE didn't return an expected Account Type?
                           break;
                     }

                     // totalCredit += JE.credit
                     totalCredit += journalEntry["Credit"];

                     // totalDebit += JE.debit
                     totalDebit += journalEntry["Debit"];
                  }
               );

               // update BalanceRecord
               balanceRecord["Running Balance"] = runningBalance;
               balanceRecord["Credit"] = totalCredit;
               balanceRecord["Debit"] = totalDebit;

               allUpdates.push(
                  brObject
                     .modelAPI()
                     .update(balanceRecord[brObject.PK()], balanceRecord)
               );
            });

            return Promise.all(allUpdates);
         });
   }

   lookupAccountType(journalEntry) {
      // find the Account
      var type = "";
      var jeObject = this.application.objects((o) => o.id == this.objectJE)[0];
      var fieldJEAccount = jeObject.fields(
         (f) => f.id == this.fieldJEAccount
      )[0];

      var accountObject = fieldJEAccount.datasourceLink;
      var categoryOptions = accountObject
         .fields((f) => f.columnName == "Category")[0]
         .options();

      var account = this.allAccountRecords.find(
         (a) => a.uuid == journalEntry[fieldJEAccount.columnName]
      );
      if (!account) {
         return null;
      }

      var categoryOption = categoryOptions.find(
         (o) => o.id == account["Category"]
      );
      type = categoryOption.text;
      return type.toLowerCase();
   }
};
