const path = require("path");
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

// const ABProcessParticipant = require(path.join(
//     __dirname,
//     "..",
//     "ABProcessParticipant"
// ));

const AB = require("ab-utils");
const reqAB = AB.reqAB({}, {});
reqAB.jobID = "AccountingFPClose";

module.exports = class AccountingFPClose extends AccountingFPCloseCore {
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
      this.fpObject = this.application.objects((o) => o.id == this.objectFP)[0];

      return new Promise((resolve, reject) => {
         var myState = this.myState(instance);

         var currentProcessValues = this.hashProcessDataValues(instance);
         var currentFPID = currentProcessValues[this.processFPValue];
         if (!currentFPID) {
            this.log(instance, "unable to find relevant Fiscal Period ID");
            var error = new Error(
               "AccountingFPClose.do(): unable to find relevant Fiscal Period ID"
            );
            reject(error);
            return;
         }

         // find the next fiscal month(.startDate == my.endDate + 1)
         var cond = {
            where: {
               glue: "and",
               rules: [
                  {
                     key: this.fpObject.PK(),
                     rule: "equals",
                     value: currentFPID
                  }
               ]
            },
            populate: true
         };

         Promise.resolve()
            .then(() => {
               return this.fpObject
                  .modelAPI()
                  .findAll(cond)
                  .then((rows) => {
                     this.currentFP = rows[0];
                     this.log(instance, "Found FPObj");
                     this.log(instance, rows);
                  })
                  .catch((err) => {
                     reject(err);
                  });
            })
            .then(() => {
               // find the next fiscal month(.startDate == my.endDate + 1)
               // .open = true
               // .status = active
               // for each my.glSegment
               //    make a new GLSegment ( same Account & RC + new FiscalMonth)
               //    newGlSegment.startingBalance = currentGLSegment.runningBalance

               this.log(instance, "I'm done.");
               this.stateCompleted(instance);
               resolve(true);
            });
      });
   }
};
