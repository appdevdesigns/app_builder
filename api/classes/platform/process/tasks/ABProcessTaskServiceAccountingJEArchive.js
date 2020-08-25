const path = require("path");
const AccountingJEArchiveCore = require(path.join(
   __dirname,
   "..",
   "..",
   "..",
   "core",
   "process",
   "tasks",
   "ABProcessTaskServiceAccountingJEArchiveCore.js"
));

const AB = require("ab-utils");
const reqAB = AB.reqAB({}, {});
reqAB.jobID = "AccountingJEArchive";

module.exports = class AccountingFPYearClose extends AccountingJEArchiveCore {
   ////
   //// Process Instance Methods
   ////

   /**
    * do()
    * this method actually performs the action for this task.
    * @param {obj} instance  the instance data of the running process
    * @param {Knex.Transaction?} trx - [optional]
    *
    * @return {Promise}
    *      resolve(true/false) : true if the task is completed.
    *                            false if task is still waiting
    */
   do(instance, trx) {
      this._dbTransaction = trx;

      this.batchObject = this.application.objects(
         (o) => o.id == this.objectBatch
      )[0];
      if (!this.batchObject) {
         this.log(instance, "Could not found Batch object");
         return Promise.reject(new Error("Could not found Batch object"));
      }

      this.batchFiscalMonthField = this.batchObject.fields(
         (f) => f.id == this.fieldBatchFiscalMonth
      )[0];
      if (!this.batchFiscalMonthField) {
         this.log(instance, "Could not found Batch: Fiscal Month field");
         return Promise.reject(
            new Error("Could not found Batch: Fiscal Month field")
         );
      }

      this.balanceObject = this.application.objects(
         (o) => o.id == this.objectBalance
      )[0];
      if (!this.balanceObject) {
         this.log(instance, "Could not found Balance object");
         return Promise.reject(new Error("Could not found Balance object"));
      }

      this.balanceAccountField = this.balanceObject.fields(
         (f) => f.id == this.fieldBrAccount
      )[0];
      if (!this.balanceAccountField) {
         this.log(instance, "Could not found Batch: Account field");
         return Promise.reject(
            new Error("Could not found Batch: Account field")
         );
      }

      this.balanceRcField = this.balanceObject.fields(
         (f) => f.id == this.fieldBrRC
      )[0];
      if (!this.balanceRcField) {
         this.log(instance, "Could not found Batch: RC field");
         return Promise.reject(new Error("Could not found Batch: RC field"));
      }

      this.jeObject = this.application.objects((o) => o.id == this.objectJE)[0];
      if (!this.jeObject) {
         this.log(instance, "Could not found JE object");
         return Promise.reject(new Error("Could not found JE object"));
      }

      this.jeArchiveObject = this.application.objects(
         (o) => o.id == this.objectJEArchive
      )[0];
      if (!this.jeArchiveObject) {
         this.log(instance, "Could not found JE Archive object");
         return Promise.reject(new Error("Could not found JE Archive object"));
      }

      this.jeBatchField = this.jeObject.fields(
         (f) =>
            f &&
            f.key == "connectObject" &&
            f.settings.linkObject == this.objectBatch
      )[0];
      if (!this.jeBatchField) {
         this.log(instance, "Could not found the connect JE to Batch field");
         return Promise.reject(
            new Error("Could not found the connect JE to Batch field")
         );
      }

      this.jeAccountField = this.jeObject.fields(
         (f) => f && f.id == this.fieldJeAccount
      )[0];
      if (!this.jeAccountField) {
         this.log(instance, "Could not found the connect JE to Account field");
         return Promise.reject(
            new Error("Could not found the connect JE to Account field")
         );
      }

      this.jeRcField = this.jeObject.fields(
         (f) => f && f.id == this.fieldJeRC
      )[0];
      if (!this.jeRcField) {
         this.log(instance, "Could not found the connect JE to RC field");
         return Promise.reject(
            new Error("Could not found the connect JE to RC field")
         );
      }

      this.jeArchiveBalanceField = this.jeArchiveObject.fields(
         (f) => f && f.id == this.fieldJeArchiveBalance
      )[0];
      if (!this.jeArchiveBalanceField) {
         this.log(
            instance,
            "Could not found the connect JE Archive to BR field"
         );
         return Promise.reject(
            new Error("Could not found the connect JE Archive to BR field")
         );
      }

      var currentProcessValues = this.hashProcessDataValues(instance);
      var currentBatchID = currentProcessValues[this.processBatchValue];
      if (!currentBatchID) {
         this.log(instance, "unable to find relevant Batch ID");
         var error = new Error(
            "AccountingJEArchive.do(): unable to find relevant Batch ID"
         );
         return Promise.reject(error);
      }

      return (
         Promise.resolve()
            // Pull Batch
            .then(
               () =>
                  new Promise((next, bad) => {
                     this.batchObject
                        .modelAPI()
                        .findAll({
                           where: {
                              glue: "and",
                              rules: [
                                 {
                                    key: "uuid",
                                    rule: "equals",
                                    value: currentBatchID
                                 }
                              ]
                           },
                           populate: false
                        })
                        .then((batch) => {
                           this.batch = batch[0];

                           if (!this.batch) {
                              this.log(instance, "Could not found Batch");
                              var error = new Error("Could not found Batch");
                              return bad(error);
                           }
                           next();
                        })
                        .catch((err) => {
                           bad(err);
                        });
                  })
            )
            // Pull JE data
            .then(
               () =>
                  new Promise((next, bad) => {
                     let cond = {
                        where: {
                           glue: "and",
                           rules: [
                              {
                                 key: this.jeBatchField.id,
                                 rule: "equals",
                                 value: currentBatchID
                              }
                           ]
                        },
                        populate: true
                     };

                     this.jeObject
                        .modelAPI()
                        .findAll(cond)
                        .then((journals) => {
                           this.journals = journals || [];
                           next();
                        })
                        .catch((err) => {
                           bad(err);
                        });
                  })
            )
            // Pull Balances
            .then(
               () =>
                  new Promise((next, bad) => {
                     this.balances = [];

                     if (!this.journals || !this.journals.length) return next();

                     let fiscalMonthId = this.batch[
                        this.batchFiscalMonthField.columnName
                     ];

                     let tasks = [];

                     (this.journals || []).forEach((je) => {
                        if (
                           !je ||
                           !je[this.jeAccountField.columnName] ||
                           !je[this.jeRcField.columnName]
                        )
                           return;

                        let cond = {
                           where: {
                              glue: "and",
                              rules: [
                                 {
                                    key: this.fieldBrFiscalMonth,
                                    rule: "equals",
                                    value: fiscalMonthId
                                 },
                                 {
                                    key: this.fieldBrAccount,
                                    rule: "equals",
                                    value: je[this.jeAccountField.columnName]
                                 },
                                 {
                                    key: this.fieldBrRC,
                                    rule: "equals",
                                    value: je[this.jeRcField.columnName]
                                 }
                              ]
                           },
                           populate: false
                        };

                        tasks.push(
                           new Promise((ok, no) => {
                              this.balanceObject
                                 .modelAPI()
                                 .findAll(cond)
                                 .then((balances) => {
                                    this.balances = this.balances.concat(
                                       balances || []
                                    );
                                    ok();
                                 })
                                 .catch((err) => {
                                    ok();
                                 });
                           })
                        );
                     });

                     Promise.all(tasks)
                        .catch(bad)
                        .then(() => next());
                  })
            )
            // Copy JE to JE Archive
            .then(
               () =>
                  new Promise((next, bad) => {
                     let tasks = [];

                     (this.journals || []).forEach((je) => {
                        let jeArchiveValues = {};

                        // link to Balance
                        let balance = (this.balances || []).filter(
                           (b) =>
                              b[this.balanceAccountField.columnName] ==
                                 je[this.jeAccountField.columnName] &&
                              b[this.balanceRcField.columnName] ==
                                 je[this.jeRcField.columnName]
                        )[0];
                        if (balance) {
                           let customBrIndex = "uuid";

                           if (this.jeArchiveBalanceField.indexField) {
                              customBrIndex = this.jeArchiveBalanceField
                                 .indexField.columnName;
                           }

                           jeArchiveValues[
                              this.jeArchiveBalanceField.columnName
                           ] = balance[customBrIndex];
                        }

                        Object.keys(this.fieldsMatch).forEach((fId) => {
                           let fJe = this.jeObject.fields(
                              (f) => f.id == this.fieldsMatch[fId]
                           )[0];
                           if (fJe == null) return;

                           let fArc = this.jeArchiveObject.fields(
                              (f) => f.id == fId
                           )[0];
                           if (fArc == null) return;

                           // Connect field
                           if (fJe.key == "connectObject") {
                              jeArchiveValues[fArc.columnName] =
                                 je[fJe.columnName];

                              jeArchiveValues[fArc.relationName()] =
                                 je[fJe.relationName()];
                           }
                           // Other field
                           else if (je[fJe.columnName] != null) {
                              jeArchiveValues[fArc.columnName] =
                                 je[fJe.columnName];
                           }
                        });

                        if (Object.keys(jeArchiveValues).length > 1) {
                           this.log(instance, "Creating JE Archive ...");
                           this.log(instance, JSON.stringify(jeArchiveValues));

                           tasks.push(
                              this.jeArchiveObject
                                 .modelAPI()
                                 .create(jeArchiveValues, trx)
                           );
                        }
                     });

                     Promise.all(tasks)
                        .catch(bad)
                        .then(() => next());
                  })
            )
            // Remove JEs
            .then(
               () =>
                  new Promise((next, bad) => {
                     if (!this.balances || !this.balances.length) return next();

                     let jeIds = (this.journals || []).map((je) => je.uuid);
                     if (!jeIds || !jeIds.length) return next();

                     this.log(instance, "Deleting JE ...");
                     this.log(instance, JSON.stringify(jeIds));

                     this.jeObject
                        .modelAPI()
                        .modelKnex()
                        .query(trx)
                        .delete()
                        .where("uuid", "IN", jeIds)
                        .catch(bad)
                        .then(() => next());
                  })
            )
      );
   }
};
