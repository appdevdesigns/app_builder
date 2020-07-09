const path = require("path");
const uuid = require("node-uuid");
const AccountingFPYearCloseCore = require(path.join(
   __dirname,
   "..",
   "..",
   "..",
   "core",
   "process",
   "tasks",
   "ABProcessTaskServiceAccountingFPYearCloseCore.js"
));

// const ABProcessParticipant = require(path.join(
//     __dirname,
//     "..",
//     "ABProcessParticipant"
// ));

const AB = require("ab-utils");
const reqAB = AB.reqAB({}, {});
reqAB.jobID = "AccountingFPYearClose";

module.exports = class AccountingFPYearClose extends AccountingFPYearCloseCore {
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
      this.fpYearObject = this.application.objects(
         (o) => o.id == this.objectFPYear
      )[0];
      this.fpMonthObject = this.application.objects(
         (o) => o.id == this.objectFPMonth
      )[0];
      this.glObject = this.application.objects((o) => o.id == this.objectGL)[0];
      this.accObject = this.application.objects(
         (o) => o.id == this.objectAccount
      )[0];

      return new Promise((resolve, reject) => {
         var myState = this.myState(instance);

         var currentProcessValues = this.hashProcessDataValues(instance);
         var currentFPYearID = currentProcessValues[this.processFPYearValue];
         if (!currentFPYearID) {
            this.log(instance, "unable to find relevant Fiscal Year ID");
            var error = new Error(
               "AccountingFPYearClose.do(): unable to find relevant Fiscal Year ID"
            );
            reject(error);
            return;
         }

         // Find last fiscal month in fiscal year (M12)
         // var cond = {
         //    where: {
         //       glue: "and",
         //       rules: [
         //          {
         //             key: this.fpObject.PK(),
         //             rule: "equals",
         //             value: currentFPID
         //          }
         //       ]
         //    },
         //    populate: true
         // };

         // Promise.resolve()
         //    .then(() => {
         //       return this.fpObject
         //          .modelAPI()
         //          .findAll(cond)
         //          .then((rows) => {
         //             this.currentFP = rows[0];
         //             this.log(instance, "Found FPObj");
         //             this.log(instance, rows);
         //          })
         //          .catch((err) => {
         //             reject(err);
         //          });
         //    })
         //    .then(() =>
         //       new Promise((next, fail) => {
         //          // make sure exists FP
         //          if (this.currentFP == null) {
         //             this.log(instance, `Count not found FP: ${currentFPID}`);
         //             return next();
         //          }

         //          // Pull the .Start field for use to search the next FP
         //          let startField = this.fpObject.fields(
         //             (f) => f.id == this.fieldFPStart
         //          )[0];
         //          if (startField == null) {
         //             this.log(instance, `Count not found the .Start field`);
         //             return next();
         //          }

         //          // Pull the .Open field for use to search the next FP
         //          let openField = this.fpObject.fields(
         //             (f) => f.id == this.fieldFPOpen
         //          )[0];
         //          if (openField == null) {
         //             this.log(instance, `Count not found the .Open field`);
         //             return next();
         //          }

         //          // find the next fiscal month(.startDate == my.endDate + 1)
         //          // .open = true
         //          // .status = active
         //          let startDate = null;
         //          if (this.currentFP.End) {
         //             if (!(this.currentFP.End instanceof Date)) {
         //                startDate = new Date(this.currentFP.End);
         //             } else {
         //                startDate = _.clone(this.currentFP.End);
         //             }

         //             // add 1 day
         //             startDate.setDate(startDate.getDate() + 1);

         //             if (startField.key == "date")
         //                startDate = AppBuilder.rules.toSQLDate(startDate);
         //          }
         //          this.fpObject
         //             .modelAPI()
         //             .findAll({
         //                where: {
         //                   glue: "and",
         //                   rules: [
         //                      {
         //                         key: startField.id,
         //                         rule: "equals",
         //                         value: startDate
         //                      },
         //                      {
         //                         key: openField.id,
         //                         rule: "equals",
         //                         value: 1
         //                      }
         //                   ]
         //                },
         //                populate: true
         //             })
         //             .then((rows) => {
         //                this.nextFP = rows[0];
         //                this.log(instance, "Found the next FPObj");
         //                this.log(instance, rows);
         //                next();
         //             })
         //             .catch((err) => {
         //                fail(err);
         //                reject(err);
         //             });
         //       }).then(
         //          () =>
         //             new Promise((next, fail) => {
         //                // make sure exists FP
         //                if (this.currentFP == null) {
         //                   return next();
         //                }

         //                // make sure exists next FP
         //                if (this.nextFP == null) {
         //                   this.log(instance, "Count not found next FP");
         //                   return next();
         //                }

         //                if (this.glObject == null) {
         //                   this.log(instance, "GL object is undefined");
         //                   return next();
         //                }

         //                let fieldFPLink = this.fpObject.fields(
         //                   (f) =>
         //                      f.key == "connectObject" &&
         //                      f.settings.linkObject == this.glObject.id
         //                )[0];
         //                if (fieldFPLink == null) {
         //                   this.log(instance, "GL connect field is undefined");
         //                   return next();
         //                }

         //                let fieldGLlink = this.glObject.fields(
         //                   (f) =>
         //                      f.key == "connectObject" &&
         //                      f.settings.linkObject == this.fpObject.id
         //                )[0];
         //                let fieldGLStarting = this.glObject.fields(
         //                   (f) => f.id == this.fieldGLStarting
         //                )[0];
         //                let fieldGLRunning = this.glObject.fields(
         //                   (f) => f.id == this.fieldGLRunning
         //                )[0];
         //                let fieldGLAccount = this.glObject.fields(
         //                   (f) => f.id == this.fieldGLAccount
         //                )[0];
         //                let fieldGLRc = this.glObject.fields(
         //                   (f) => f.id == this.fieldGLRc
         //                )[0];

         //                let linkName = fieldFPLink.relationName();
         //                let tasks = [];

         //                (this.currentFP[linkName] || []).forEach(
         //                   (glSegment) => {
         //                      let newGL = {};
         //                      newGL[this.glObject.PK()] = uuid.v4();

         //                      // link to the next FP
         //                      if (fieldGLlink) {
         //                         newGL[fieldGLlink.columnName] = this.nextFP[
         //                            this.fpObject.PK()
         //                         ];
         //                      }

         //                      // set Starting & Running Balance
         //                      if (fieldGLRunning) {
         //                         if (fieldGLStarting) {
         //                            newGL[fieldGLStarting.columnName] =
         //                               glSegment[fieldGLRunning.columnName];
         //                         }
         //                         newGL[fieldGLRunning.columnName] =
         //                            glSegment[fieldGLRunning.columnName];
         //                      }

         //                      // set link to Account
         //                      if (fieldGLAccount) {
         //                         newGL[fieldGLAccount.columnName] =
         //                            glSegment[fieldGLAccount.columnName];
         //                      }

         //                      // set link to RC
         //                      if (fieldGLRc) {
         //                         newGL[fieldGLRc.columnName] =
         //                            glSegment[fieldGLRc.columnName];
         //                      }

         //                      // make a new GLSegment ( same Account & RC + new FiscalMonth)
         //                      tasks.push(
         //                         new Promise((ok, bad) => {
         //                            this.glObject
         //                               .modelAPI()
         //                               .create(newGL)
         //                               .catch(bad)
         //                               .then((newGLResult) => {
         //                                  if (!this.nextFP[linkName])
         //                                     this.nextFP[linkName] = [];

         //                                  this.nextFP[linkName].push(
         //                                     newGLResult
         //                                  );

         //                                  // Broadcast the create
         //                                  sails.sockets.broadcast(
         //                                     this.glObject.id,
         //                                     "ab.datacollection.create",
         //                                     newGLResult
         //                                  );
         //                                  ok();
         //                               });
         //                         })
         //                      );
         //                   }
         //                );

         //                Promise.all(tasks)
         //                   .catch(fail)
         //                   .then(() => {
         //                      next();
         //                   });
         //             })
         //       )
         //    )
         //    // Set the next FP 'Status' field to 'Active'
         //    .then(
         //       () =>
         //          new Promise((next, fail) => {
         //             // make sure exists next FP
         //             if (this.nextFP == null) {
         //                this.log(instance, "Count not found next FP");
         //                return next();
         //             }

         //             if (this.fieldFPStatus == null) {
         //                this.log(
         //                   instance,
         //                   "FP status field does not be defined"
         //                );
         //                return next();
         //             }

         //             let fieldStatus = this.fpObject.fields(
         //                (f) => f.id == this.fieldFPStatus
         //             )[0];
         //             if (fieldStatus == null) {
         //                this.log(instance, "Could not found FP status field");
         //                return next();
         //             }

         //             if (this.fieldFPActive == null) {
         //                this.log(
         //                   instance,
         //                   "Active value option does not be defined"
         //                );
         //                return next();
         //             }

         //             let nextFpID = this.nextFP[this.fpObject.PK()];
         //             let values = {};
         //             values[fieldStatus.columnName] = this.fieldFPActive;

         //             this.fpObject
         //                .modelAPI()
         //                .update(nextFpID, values)
         //                .catch(fail)
         //                .then((updatedNextFP) => {
         //                   // Broadcast the create
         //                   sails.sockets.broadcast(
         //                      this.fpObject.id,
         //                      "ab.datacollection.update",
         //                      {
         //                         objectId: this.fpObject.id,
         //                         data: updatedNextFP
         //                      }
         //                   );
         //                   next();
         //                });
         //          })
         //    )
         //    // Final step
         //    .then(() => {
         //       this.log(instance, "I'm done.");
         //       this.stateCompleted(instance);
         //       resolve(true);
         //    });
      });
   }
};
