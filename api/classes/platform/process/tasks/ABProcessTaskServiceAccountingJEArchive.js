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

const retry = require("../../UtilRetry.js");

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
      // this._dbTransaction = trx;
      this._instance = instance;

      this.batchObject = this.application.objects(
         (o) => o.id == this.objectBatch
      )[0];
      if (!this.batchObject) {
         this.log(instance, "Could not found Batch object");
         return Promise.reject(new Error("Could not found Batch object"));
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

      return (
         Promise.resolve()
            // Pull Batch
            .then(
               () =>
                  new Promise((next, bad) => {
                     retry(() =>
                        this.batchObject.modelAPI().findAll({
                           where: {
                              glue: "and",
                              rules: [
                                 {
                                    key: this.batchObject.PK(),
                                    rule: "equals",
                                    value: currentBatchID
                                 }
                              ]
                           },
                           populate: false
                        })
                     )
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
                           this.onError(this._instance, err);
                           bad(err);
                        });
                  })
            )
            // Pull JE data
            .then(
               () =>
                  new Promise((next, bad) => {
                     // get custom index value to search
                     let batchIndexVal = currentBatchID;
                     if (this.jeBatchField.indexField) {
                        batchIndexVal = this.batch[
                           this.jeBatchField.indexField.columnName
                        ];
                     }

                     let cond = {
                        where: {
                           glue: "and",
                           rules: [
                              {
                                 key: this.jeBatchField.id,
                                 rule: "equals",
                                 value: batchIndexVal
                              }
                           ]
                        },
                        populate: true
                     };

                     retry(() => this.jeObject.modelAPI().findAll(cond))
                        .then((journals) => {
                           this.journals = journals || [];
                           next();
                        })
                        .catch((err) => {
                           this.onError(this._instance, err);
                           bad(err);
                        });
                  })
            )
            // Run Process
            .then(
               () =>
                  new Promise((next, bad) => {
                     const knex = ABMigration.connection();
                     knex
                        .raw(`CALL \`JEARCHIVE_PROCESS\`("${currentBatchID}");`)
                        .then((result) => {
                           const responseVals = result[0];
                           const resultVals = responseVals[0];

                           this.newJEArchIds = resultVals.map(
                              (item) => item[this.jeArchiveObject.PK()]
                           );
                           next();
                        })
                        .catch((error) => {
                           bad(error);
                        });
                  })
            )
            // Pull JE Archives
            .then(
               () =>
                  new Promise((next, bad) => {
                     retry(() =>
                        this.jeArchiveObject.modelAPI().findAll({
                           where: {
                              glue: "and",
                              rules: [
                                 {
                                    key: this.jeArchiveObject.PK(),
                                    rule: "in",
                                    value: this.newJEArchIds
                                 }
                              ]
                           },
                           populate: true
                        })
                     )
                        .then((jeArchives) => {
                           this.jeArchives = jeArchives || [];
                           next();
                        })
                        .catch((err) => {
                           this.log(this._instance, "Error pull JE Archive");
                           this.onError(this._instance, err);
                           bad(err);
                        });
                  })
            )
            // Broadcast
            .then(
               () =>
                  new Promise((next, bad) => {
                     (this.journals || []).forEach((je) => {
                        sails.sockets.broadcast(
                           this.jeObject.id,
                           "ab.datacollection.delete",
                           {
                              objectId: this.jeObject.id,
                              id: je.uuid || je.id
                           }
                        );
                     });

                     (this.jeArchives || []).forEach((jeArch) => {
                        sails.sockets.broadcast(
                           this.jeArchiveObject.id,
                           "ab.datacollection.create",
                           {
                              objectId: this.jeArchiveObject.id,
                              data: jeArch
                           }
                        );
                     });

                     next();
                  })
            )
            // finish out the Process Task
            .then(
               () =>
                  new Promise((next /*, bad */) => {
                     this.stateCompleted(instance);
                     this.log(instance, "JE Archive process successfully");
                     next(true);
                  })
            )
            .catch((err) => {
               this.log(
                  this._instance,
                  "JE Archive process exiting due to error:"
               );
               this.onError(this._instance, err);
               throw err;
            })
      );
   }
};
