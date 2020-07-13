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
      if (!this.fpYearObject) {
         this.log(instance, "Could not found FP Year object");
         return Promise.reject(new Error("Could not found FP Year object"));
      }

      this.fpMonthObject = this.application.objects(
         (o) => o.id == this.objectFPMonth
      )[0];
      if (!this.fpMonthObject) {
         this.log(instance, "Could not found FP Month object");
         return Promise.reject(new Error("Could not found FP Month object"));
      }

      this.glObject = this.application.objects((o) => o.id == this.objectGL)[0];
      if (!this.glObject) {
         this.log(instance, "Could not found Balance object");
         return Promise.reject(new Error("Could not found Balance object"));
      }

      this.accObject = this.application.objects(
         (o) => o.id == this.objectAccount
      )[0];
      if (!this.accObject) {
         this.log(instance, "Could not found Account object");
         return Promise.reject(new Error("Could not found Account object"));
      }

      var myState = this.myState(instance);

      var currentProcessValues = this.hashProcessDataValues(instance);
      var currentFPYearID = currentProcessValues[this.processFPYearValue];
      if (!currentFPYearID) {
         this.log(instance, "unable to find relevant Fiscal Year ID");
         var error = new Error(
            "AccountingFPYearClose.do(): unable to find relevant Fiscal Year ID"
         );
         return Promise.reject(error);
      }

      return (
         Promise.resolve()
            // Pull FP Year object
            .then(
               () =>
                  new Promise((next, bad) => {
                     let cond = {
                        where: {
                           glue: "and",
                           rules: [
                              {
                                 key: this.fpYearObject.PK(),
                                 rule: "equals",
                                 value: currentFPYearID
                              }
                           ]
                        },
                        populate: true
                     };

                     this.fpYearObject
                        .modelAPI()
                        .findAll(cond)
                        .then((rows) => {
                           this.currentFPYear = rows[0];
                           this.log(instance, "Found FPYearObj");
                           this.log(instance, rows);

                           if (this.currentFPYear) {
                              next();
                           } else {
                              this.log(instance, "Not Found FPYearObj");
                              bad(new Error("Not Found FPYearObj"));
                           }
                        })
                        .catch((err) => {
                           bad(err);
                        });
                  })
            )
            // 1. Find last fiscal month in fiscal year (M12)
            .then(
               () =>
                  new Promise((next, bad) => {
                     let fpMonthField = this.fpYearObject.fields(
                        (f) =>
                           f.key == "connectObject" &&
                           f.settings.linkObject == this.objectFPMonth
                     )[0];
                     if (!fpMonthField) {
                        this.log(instance, "Not Found fpMonthField");
                        return bad(new Error("Not Found fpMonthField"));
                     }

                     let fpMonthEndField = this.fpMonthObject.fields(
                        (f) => f.id == this.fieldFPMonthEnd
                     )[0];
                     if (!fpMonthEndField) {
                        this.log(instance, "Not Found fpMonthEndField");
                        return bad(new Error("Not Found fpMonthEndField"));
                     }

                     let FPmonths =
                        this.currentFPYear[fpMonthField.relationName()] || [];
                     // Sort descending
                     FPmonths = FPmonths.sort(
                        (a, b) =>
                           b[fpMonthEndField.columnName] -
                           a[fpMonthEndField.columnName]
                     );
                     if (!FPmonths[0]) {
                        this.log(instance, "Not Found the last FP month");
                        return bad(new Error("Not Found the last FP month"));
                     }

                     let cond = {
                        where: {
                           glue: "and",
                           rules: [
                              {
                                 key: this.fpMonthObject.PK(),
                                 rule: "equals",
                                 value: FPmonths[0][this.fpMonthObject.PK()]
                              }
                           ]
                        },
                        populate: true
                     };

                     this.fpMonthObject
                        .modelAPI()
                        .findAll(cond)
                        .then((rows) => {
                           this.lastFPMonth = rows[0];
                           this.log(instance, "Found the last FP Month");
                           this.log(instance, rows);

                           if (this.lastFPMonth) {
                              next();
                           } else {
                              this.log(
                                 instance,
                                 "Not Found last FP Month with balances"
                              );
                              bad(
                                 new Error(
                                    "Not Found last FP Month with balances"
                                 )
                              );
                           }
                        })
                        .catch((err) => {
                           bad(err);
                        });
                  })
            )
            // 2. Find M12 Balances with Account Number = 3500 or 3991
            .then(
               () =>
                  new Promise((next, bad) => {
                     let accNumberField = this.accObject.fields(
                        (f) => f.id == this.fieldAccNumber
                     )[0];
                     if (!accNumberField) {
                        this.log(instance, "Not Found Account Number Field");
                        return bad(new Error("Not Found Account Number Field"));
                     }

                     let cond = {
                        where: {
                           glue: "or",
                           rules: [
                              {
                                 key: accNumberField.id,
                                 rule: "equals",
                                 value: this.valueFundBalances
                              },
                              {
                                 key: accNumberField.id,
                                 rule: "equals",
                                 value: this.valueNetIncome
                              }
                           ]
                        },
                        populate: false
                     };

                     // find id of accounts with Account Number = 3500 or 3991
                     this.accObject
                        .modelAPI()
                        .findAll(cond)
                        .catch(bad)
                        .then((rows) => {
                           let accountIds = (rows || []).map(
                              (r) => r[this.accObject.PK()]
                           );

                           let fpBalanceField = this.fpMonthObject.fields(
                              (f) =>
                                 f.key == "connectObject" &&
                                 f.settings.linkObject == this.objectGL
                           )[0];
                           if (!fpBalanceField) {
                              this.log(instance, "Not Found fpBalanceField");
                              return bad(new Error("Not Found fpBalanceField"));
                           }
                           let balances =
                              this.lastFPMonth[fpBalanceField.relationName()] ||
                              [];

                           // filter balances by Account Number = 3500 or 3991
                           let glAccountField = this.glObject.fields(
                              (f) =>
                                 f.key == "connectObject" &&
                                 f.settings.linkObject == this.objectAccount
                           )[0];
                           if (!glAccountField) {
                              this.log(instance, "Not Found glAccountField");
                              return bad(new Error("Not Found glAccountField"));
                           }

                           this.balances = balances.filter(
                              (b) =>
                                 accountIds.indexOf(
                                    b[glAccountField.columnName]
                                 ) > -1
                           );

                           next();
                        });
                  })
            )
            // 3. Find the next fiscal year
            .then(
               () =>
                  new Promise((next, bad) => {
                     let fpStartField = this.fpYearObject.fields(
                        (f) => f.id == this.fieldFPYearStart
                     )[0];
                     let fpEndField = this.fpYearObject.fields(
                        (f) => f.id == this.fieldFPYearEnd
                     )[0];

                     if (!fpStartField) {
                        this.log(instance, "Not Found FP Year Start Field");
                        return bad(new Error("Not Found FP Year Start Field"));
                     }
                     if (!fpEndField) {
                        this.log(instance, "Not Found FP Year End Field");
                        return bad(new Error("Not Found FP Year End Field"));
                     }

                     let endDate = this.currentFPYear[fpEndField.columnName];
                     if (!endDate) {
                        this.log(instance, "FP Year End date is empty");
                        return bad(new Error("FP Year End date is empty"));
                     }

                     if (!(endDate instanceof Date)) {
                        endDate = new Date(endDate);
                     } else {
                        endDate = _.clone(endDate);
                     }

                     // add 1 day
                     let startDate = endDate.setDate(endDate.getDate() + 1);

                     if (fpStartField.key == "date")
                        startDate = AppBuilder.rules.toSQLDate(startDate);

                     let cond = {
                        where: {
                           glue: "and",
                           rules: [
                              {
                                 key: fpStartField.id,
                                 rule: "equals",
                                 value: startDate
                              }
                           ]
                        },
                        populate: true
                     };

                     this.fpYearObject
                        .modelAPI()
                        .findAll(cond)
                        .catch(bad)
                        .then((rows) => {
                           this.nextFpYear = rows[0];

                           if (!this.nextFpYear) {
                              this.log(instance, "Not Found Next FP Year");
                              return bad(new Error("Not Found Next FP Year"));
                           }

                           next();
                        });
                  })
            )
            // 3.1 set the next FP Year to Status = Active
            .then(
               () =>
                  new Promise((next, bad) => {
                     let fieldFPYearStatus = this.fpYearObject.fields(
                        (f) => f.id == this.fieldFPYearStatus
                     )[0];
                     if (!fieldFPYearStatus) {
                        this.log(instance, "Could not found FP status field");
                        return bad(
                           new Error("Could not found FP status field")
                        );
                     }

                     let values = {};
                     values[
                        fieldFPYearStatus.columnName
                     ] = this.fieldFPYearActive;

                     this.fpYearObject
                        .modelAPI()
                        .update(this.nextFpYear[this.fpYearObject.PK()], values)
                        .catch(bad)
                        .then((updatedNextFP) => {
                           // Broadcast the update
                           sails.sockets.broadcast(
                              this.fpYearObject.id,
                              "ab.datacollection.update",
                              {
                                 objectId: this.fpYearObject.id,
                                 data: updatedNextFP
                              }
                           );
                           next();
                        });
                  })
            )
            // 4. Find first fiscal month in the next fiscal year (M1)
            .then(
               () =>
                  new Promise((next, bad) => {
                     let fpMonthField = this.fpYearObject.fields(
                        (f) =>
                           f.key == "connectObject" &&
                           f.settings.linkObject == this.objectFPMonth
                     )[0];

                     if (!fpMonthField) {
                        this.log(instance, "Could not found FP month field");
                        return bad(new Error("Could not found FP month field"));
                     }

                     let fpMonthStartField = this.fpMonthObject.fields(
                        (f) => f.id == this.fieldFPMonthStart
                     )[0];

                     if (!fpMonthStartField) {
                        this.log(
                           instance,
                           "Could not found FP month start field"
                        );
                        return bad(
                           new Error("Could not found FP month start field")
                        );
                     }

                     let fpMonths =
                        this.nextFpYear[fpMonthField.relationName()] || [];

                     // Sort ascending
                     fpMonths = fpMonths.sort(
                        (a, b) =>
                           a[fpMonthStartField.columnName] -
                           b[fpMonthStartField.columnName]
                     );
                     this.firstFpMonth = fpMonths[0];
                     if (!this.firstFpMonth) {
                        this.log(
                           instance,
                           "Could not found the first FP month data"
                        );
                        return bad(
                           new Error("Could not found the first FP month data")
                        );
                     }

                     next();
                  })
            )
            // 5. Find All M1 Balances With Account Type = Income, Expense, or Equity
            .then(
               () =>
                  new Promise((next, bad) => {
                     let glField = this.glObject.fields(
                        (f) =>
                           f.key == "connectObject" &&
                           f.settings.linkObject == this.objectFPMonth
                     )[0];
                     if (!glField) {
                        this.log(instance, "Could not found GL field");
                        return bad(new Error("Could not found GL field"));
                     }

                     let glField = this.glObject.fields(
                        (f) =>
                           f.key == "connectObject" &&
                           f.settings.linkObject == this.objectFPMonth
                     )[0];
                     if (!glField) {
                        this.log(instance, "Could not found GL field");
                        return bad(new Error("Could not found GL field"));
                     }


                     let cond = {
                        where: {
                           glue: "and",
                           rules: [
                              {
                                 key: glField.id,
                                 rule: "equals",
                                 value: this.firstFpMonth[
                                    this.fpMonthObject.PK()
                                 ]
                              }
                           ]
                        },
                        populate: true
                     };

                     this.glObject
                        .modelAPI()
                        .findAll(cond)
                        .catch(bad)
                        .then((rows) => {
                           // TODO
                           // this.nextBalances = (rows || []).filter((b) => );
                           next();
                        });
                  })
            )
      );
   }
};
