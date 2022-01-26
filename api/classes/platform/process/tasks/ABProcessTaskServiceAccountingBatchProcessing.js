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
      this._dbTransaction = trx;

      // Setup references to the ABObject and Fields that we will use in our
      // operations.
      this.brObject = this.application.objects((o) => o.id == this.objectBR)[0];
      this.brAccountField = this.brObject.fields(
         (f) => f.id == this.fieldBRAccount
      )[0];
      this.brRCField = this.brObject.fields((f) => f.id == this.fieldBRRC)[0];
      this.brFinancialPeriodField = this.brObject.fields(
         (f) => f.id == this.fieldBRFinancialPeriod
      )[0];
      this.brEntriesField = this.brObject.fields(
         (f) => f.id == this.fieldBREntries
      )[0];

      // Batch Object and related Fields
      this.batchObj = this.application.objects(
         (o) => o.id == this.objectBatch
      )[0];
      this.batchFinancialPeriodField = this.batchObj.fields(
         (f) => f.id == this.fieldBatchFinancialPeriod
      )[0];
      this.batchEntriesField = this.batchObj.fields(
         (f) => f.id == this.fieldBatchEntries
      )[0];

      // Journal Entry Object and Fields
      this.jeObject = this.application.objects((o) => o.id == this.objectJE)[0];
      this.jeAccountField = this.jeObject.fields(
         (f) => f.id == this.fieldJEAccount
      )[0];
      this.jeStatusField = this.jeObject.fields(
         (f) => f.id == this.fieldJEStatus
      )[0];
      this.jeRCField = this.jeObject.fields((f) => f.id == this.fieldJERC)[0];

      // TODO: continue to refactor pulling the object and field refs to here
      // and clean up the code.

      return new Promise((resolve, reject) => {
         var myState = this.myState(instance);
         this.balanceRecordsProcessed = {};
         // { balanceRecord.id : [{ JournalEntry, ..., }] }
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

         if (!this.batchObj) {
            var msg = `unable to find relevant Batch Object from our .objectBatch[${this.objectBatch}] configuration`;
            this.log(instance, msg);
            var error = new Error("AccountBatchProcessing.do(): " + msg);
            reject(error);
            return;
         }

         // condition to look up our Batch Value
         var cond = {
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
         };

         //
         // Main Work Chain
         //
         Promise.resolve()
            .then(() => {
               // prepare Account Lookup
               // pull a list of all Accounts in system

               var accountObject = this.jeAccountField.datasourceLink;

               return retry(() =>
                  accountObject
                     .modelAPI()
                     .findAll({ where: {}, populate: true })
               ).then((list) => {
                  this.allAccountRecords = list;
               });
            })
            .then(() => {
               return retry(() => this.batchObj.modelAPI().findAll(cond))
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
                        batchEntry[this.batchFinancialPeriodField.columnName];
                     var journalEntries =
                        batchEntry[this.batchEntriesField.relationName()] || [];

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
               // finish out the Process Task:
               this.stateCompleted(instance);
               this.log(instance, "Batch Processed successfully");
               resolve(true);
            })
            .catch((error) => {
               this.log(instance, error.toString());
               reject(error);
            });
      });
   }

   processJournalEntry(journalEntry, financialPeriod) {
      return new Promise((resolve, reject) => {
         // if (JE.status == complete) this has already been done, so skip
         if (
            this.jeStatusField &&
            journalEntry[this.jeStatusField.columnName] ==
               this.fieldJEStatusComplete
         ) {
            resolve();
            return;
         }

         var accountID = journalEntry[this.jeAccountField.columnName];
         if (!accountID) {
            var missingAccountError = new Error(
               `Journal Entry [${journalEntry.uuid}] is missing an Account`
            );
            reject(missingAccountError);
            return;
         }

         var rcID = journalEntry[this.jeRCField.columnName];
         this.processBalanceRecord(
            financialPeriod,
            accountID,
            rcID,
            journalEntry
         )
            .then(() => {
               if (this.jeStatusField == null) return resolve();

               // set JE.status = Complete
               journalEntry[
                  this.jeStatusField.columnName
               ] = this.fieldJEStatusComplete;

               var updateValue = {};
               updateValue[
                  this.jeStatusField.columnName
               ] = this.fieldJEStatusComplete;
               retry(() =>
                  this.jeObject
                     .modelAPI()
                     .update(
                        journalEntry[this.jeObject.PK()],
                        updateValue,
                        this._dbTransaction
                     )
               )
                  .then((updatedJE) => {
                     // Broadcast
                     sails.sockets.broadcast(
                        this.jeObject.id,
                        "ab.datacollection.update",
                        {
                           objectId: this.jeObject.id,
                           data: updateValue
                        }
                     );

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
                     key: this.brFinancialPeriodField.id,
                     rule: "equals",
                     value: financialPeriodID
                  });
                  balCond.rules.push({
                     key: this.brAccountField.id,
                     rule: "equals",
                     value: AccountID
                  });

                  if (RCID) {
                     balCond.rules.push({
                        key: this.brRCField.id,
                        rule: "equals",
                        value: RCID
                     });
                  } else {
                     balCond.rules.push({
                        key: this.brRCField.id,
                        rule: "is_null",
                        value: null
                     });
                  }
                  // try to find existing BalanceRecord matching our balCond
                  retry(() =>
                     this.brObject
                        .modelAPI()
                        .findAll({ where: balCond, populate: true })
                  )
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

                  // #Race Condition: if N parallel requests 1st try to find the
                  // balance entry and Don't, then we will get N parallel requests
                  // to create a new one.
                  // This routine will ensure only 1 unique Balance Record is created
                  // and returned to all N requests.
                  this.parallelSafeCreateBalance(
                     financialPeriodID,
                     AccountID,
                     RCID
                  )
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

                  let brID = balanceRecord[this.brObject.PK()];

                  if (this.balanceRecordsProcessed[brID] == null)
                     this.balanceRecordsProcessed[brID] = [];

                  this.balanceRecordsProcessed[brID].push(journalEntry);

                  done();

                  // this.brObject
                  //    .modelAPI()
                  //    .relate(brID, this.brEntriesField.id, journalEntry)
                  //    .catch((err) => done(err))
                  //    .then(() => {
                  //       // mark this balance record as having been processed.
                  //       this.balanceRecordsProcessed[brID] = brID;
                  //       done();
                  //    });
               },

               (done) => {
                  if (!acct3991) {
                     done();
                     return;
                  }

                  // if this account is Account3991 we don't need to do this again
                  if (
                     AccountID == this.jeAccountField.getRelationValue(acct3991)
                  ) {
                     done();
                     return;
                  }

                  // if this was a JE that was either an Income or Expnse Account
                  var jeType = this.lookupAccountType(journalEntry);
                  if (jeType == "income" || jeType == "expenses") {
                     // perform another processBalanceRecord( with account3991)
                     this.processBalanceRecord(
                        financialPeriodID,
                        this.brAccountField.getRelationValue(acct3991),
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

   /**
    * @method parallelSafeCreateBalance()
    * Ensure that multiple Balance Records for matching FPID, AID and RCID are
    * not created.
    * @param {string} financialPeriodID
    *        The uuid of the Financial Period for this Balance Record
    * @param {string} AccountID
    *        The uuid of the Account for this Balance Record
    * @param {string} RCID
    *        the uuid of the RC for this Balance Record
    * @return {Promise}
    *        resolved() when the given balance record is created.
    */
   parallelSafeCreateBalance(financialPeriodID, AccountID, RCID) {
      // if a create for this specific Balance Record is already In progress:
      // return that Promise.
      this.pendingCreates = this.pendingCreates || {};
      var key = `${financialPeriodID}:${AccountID}${RCID ? ":" + RCID : ""}`;
      if (!this.pendingCreates[key]) {
         this.pendingCreates[key] = new Promise((resolve, reject) => {
            var balValues = {
               uuid: uuid(),
               "Starting Balance": 0
            };
            balValues[
               this.brFinancialPeriodField.columnName
            ] = financialPeriodID;
            balValues[this.brAccountField.columnName] = AccountID;
            if (RCID) {
               balValues[this.brRCField.columnName] = RCID;
            } else {
               balValues[this.brRCField.columnName] = null;
            }
            retry(
               () =>
                  this.brObject
                     .modelAPI()
                     // .create(balValues, this._dbTransaction)
                     .create(balValues) // NOTE: Ignore MySQL transaction because client needs id of entry.
            )
               .then((newEntry) => {
                  // Broadcast
                  sails.sockets.broadcast(
                     this.brObject.id,
                     "ab.datacollection.create",
                     {
                        objectId: this.brObject.id,
                        data: newEntry
                     }
                  );

                  resolve(newEntry);
               })
               .catch((err) => {
                  // TODO: need to pass in .instance so we can do a this.log()
                  reject(err);
               });
         });
      }
      return this.pendingCreates[key];
   }

   /**
    * @method recalculateBalances()
    * For each balance Record that was modified, we will run a recalculation again.
    * @return {Promise}
    *        resolved() when ALL balance calculations are complete.
    */
   recalculateBalances() {
      var allBalanceRecords = [];
      // {array} allBalanceRecords
      // keep track of all the balance records that were updated in the
      // routine .processBalanceRecord() so we can recalculate them.

      // find Account 3991
      var acct3991 = this.allAccountRecords.find((a) => a["Acct Num"] == 3991);

      return Promise.resolve()
         .then(() => {
            // pull fully populated Balance Records that were updated on this run
            // pull the .ids from our hash
            var allIDs = Object.keys(this.balanceRecordsProcessed);
            var cond = {
               where: {
                  glue: "and",
                  rules: [
                     { key: this.brObject.PK(), rule: "in", value: allIDs }
                  ]
               },
               populate: true
            };
            return retry(() => this.brObject.modelAPI().findAll(cond)).then(
               (list) => {
                  allBalanceRecords = list;
               }
            );
         })
         .then(() => {
            var allUpdates = [];
            // {array} allUpdates
            // an array of all the pending update promises

            // for each balanceRecord
            (allBalanceRecords || []).forEach((balanceRecord) => {
               let brID = balanceRecord[this.brObject.PK()];

               // runningBalance = startingBalance
               // totalCredit, totalDebit = 0;
               let startingBalance = parseFloat(
                  balanceRecord["Starting Balance"]
                     ? balanceRecord["Starting Balance"]
                     : 0
               );
               let totalCredit = parseFloat(
                  balanceRecord["Credit"] ? balanceRecord["Credit"] : 0
               );
               let totalDebit = parseFloat(
                  balanceRecord["Debit"] ? balanceRecord["Debit"] : 0
               );

               // for each JournalEntry
               (this.balanceRecordsProcessed[brID] || []).forEach(
                  (journalEntry) => {
                     // prevent working with data as a string or with NULL values
                     journalEntry["Debit"] = parseFloat(
                        journalEntry["Debit"] ? journalEntry["Debit"] : 0
                     );
                     journalEntry["Credit"] = parseFloat(
                        journalEntry["Credit"] ? journalEntry["Credit"] : 0
                     );

                     // totalCredit += JE.credit
                     totalCredit += journalEntry["Credit"];

                     // totalDebit += JE.debit
                     totalDebit += journalEntry["Debit"];
                  }
               );

               //// lookup the Account type from the journalEntry
               // var accountType = this.lookupAccountType(journalEntry);

               let accountType;
               // #Fix: for account 3991, we must use the "Equity" type, not
               // what is on the journalEntry
               if (
                  acct3991 &&
                  balanceRecord[this.brAccountField.columnName] ==
                     this.brAccountField.getRelationValue(acct3991)
               ) {
                  accountType = "equity";
               }
               //// lookup the Account type from the balance
               else {
                  let accountObject = this.brAccountField.datasourceLink;
                  let categoryOptions = accountObject
                     .fields((f) => f.columnName == "Category")[0]
                     .options();
                  let account =
                     balanceRecord[this.brAccountField.relationName()];
                  let categoryOption = categoryOptions.find(
                     (o) => o.id == account["Category"]
                  );
                  accountType = (categoryOption
                     ? categoryOption.text
                     : ""
                  ).toLowerCase();
               }

               switch (accountType) {
                  // case: "asset" || "expense"
                  case "assets":
                  case "expenses":
                     balanceRecord["Running Balance"] =
                        startingBalance + totalDebit - totalCredit;
                     break;

                  // case: Liabilities, Equity, Income
                  case "liabilities":
                  case "equity":
                  case "income":
                     balanceRecord["Running Balance"] =
                        startingBalance - totalDebit + totalCredit;
                     break;

                  default:
                     // Q: what to do if a JE didn't return an expected Account Type?
                     break;
               }

               // update BalanceRecord
               balanceRecord["Credit"] = totalCredit;
               balanceRecord["Debit"] = totalDebit;

               // call .requestParams to set default values and reformat value properly
               balanceRecord = this.brObject.requestParams(balanceRecord);

               // now perform the UPDATE
               allUpdates.push(
                  new Promise((next, bad) => {
                     retry(() =>
                        this.brObject
                           .modelAPI()
                           .update(brID, balanceRecord, this._dbTransaction)
                     )
                        .then(() => {
                           // Broadcast
                           sails.sockets.broadcast(
                              this.brObject.id,
                              "ab.datacollection.update",
                              {
                                 objectId: this.brObject.id,
                                 data: balanceRecord
                              }
                           );

                           next();
                        })
                        .catch(bad);
                  })
               );
            });

            return Promise.all(allUpdates);
         });
   }

   /**
    * @method lookupAccountType()
    * return the Account category for a given JournalEntry instance.
    * @param {JournalEntry} journalEntry
    *        instance of a JournalEntry object.
    * @return {string}
    *        The text value of the Account.Categor field (all lowercase)
    */
   lookupAccountType(journalEntry) {
      // find the Account type
      var type = "";

      var accountObject = this.jeAccountField.datasourceLink;
      var categoryOptions = accountObject
         .fields((f) => f.columnName == "Category")[0]
         .options();

      var account = this.allAccountRecords.find(
         (a) =>
            this.jeAccountField.getRelationValue(a) ==
            journalEntry[this.jeAccountField.columnName]
      );
      if (!account) {
         return null;
      }

      var categoryOption = categoryOptions.find(
         (o) => o.id == account["Category"]
      );
      if (!categoryOption) {
         return null;
      }

      type = categoryOption.text;
      return type.toLowerCase();
   }
};
