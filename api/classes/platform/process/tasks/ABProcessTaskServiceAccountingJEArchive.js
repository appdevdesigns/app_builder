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
    * @return {Promise}
    *      resolve(true/false) : true if the task is completed.
    *                            false if task is still waiting
    */
   do(instance) {
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
            // Copy JE to JE Archive
            .then(
               () =>
                  new Promise((next, bad) => {
                     let tasks = [];

                     (this.journals || []).forEach((je) => {
                        let jeArchiveValues = {};

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
                                 .create(jeArchiveValues)
                           );
                        }
                     });

                     Promise.all(tasks)
                        .catch(bad)
                        .then(() => next());
                  })
            )
      );
   }
};
