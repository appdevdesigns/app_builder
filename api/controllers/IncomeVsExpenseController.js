/**
 * localIncomeExpense
 *
 *
 */

const path = require("path");

const ABApplication = require(path.join(
   "..",
   "classes",
   "platform",
   "ABApplication"
));

module.exports = {
   // GET: /template/localIncomeExpense
   // get the local and expense income and calculate the sums
   getData: function(req, res) {
      /**
      /* @const balances
      /* aka GL Segments. Should be filtered by the fiscal period the report is based on.
      /* mcc_code: balance link to rc, rc link to mcc, mcc has a code. The rc code should
      /*     should start with mcc code.
    */
      const balances = [
         {
            mcc_code: "01",
            account: 3991,
            runningBalance: 8110
         },
         {
            mcc_code: "01",
            account: 4111,
            runningBalance: 1230
         },
         {
            mcc_code: "02",
            account: 4111,
            runningBalance: 5020
         },
         {
            mcc_code: "03",
            account: 4111,
            runningBalance: 130
         },
         {
            mcc_code: "02",
            account: 4222,
            runningBalance: 1000
         },
         {
            mcc_code: "03",
            account: 4221,
            runningBalance: 500
         },
         {
            mcc_code: "01",
            account: 5111,
            runningBalance: 230
         },
         {
            mcc_code: "02",
            account: 5211,
            runningBalance: 420
         },
         {
            mcc_code: "02",
            account: 7211,
            runningBalance: 420
         }
      ];

      /**
     /* @const mccs
     /* Can read from the MCC object
     */
      const mccs = [
         { code: "01", label: "Staff" },
         { code: "02", label: "SLM" },
         { code: "03", label: "Digital Strategies" },
         { code: "04", label: "LeaderImpact" },
         { code: "05", label: "GCM" }
      ];

      function calculateGroupSums(...groups) {
         const sums = [];
         mccs.forEach((dept) => {
            const sum = balances
               .filter((bal) => {
                  let inGroup = false;
                  groups.forEach((group) => {
                     if (accountInCategory(bal.account, group)) {
                        inGroup = true;
                     }
                  });
                  return inGroup && bal.mcc_code == dept.code;
               })
               .map((i) => i["runningBalance"])
               .reduce((a, b) => a + b, 0);
            sums.push(sum);
         });
         const totalSum = sums.reduce((a, b) => a + b, 0);
         sums.push(totalSum);
         return sums;
      }

      /**
     /* Check whether an a category. The first digits of the account should match the category.
     /* @function accountInCategory
     /* @param {int} account 4-5 digit
     /* @param {int} category 3-4 digits
     /* @return {bool}
     */
      function accountInCategory(account, category) {
         const accountDigits = account.toString().split("");
         const categoryDigits = category.toString().split("");
         let match = true;
         categoryDigits.forEach((digit, i) => {
            if (digit !== accountDigits[i]) {
               match = false;
            }
         });
         return match;
      }

      // Calculate Net Income Values
      const incomeTotals = calculateGroupSums(4, 5);
      const expenseTotals = calculateGroupSums(6, 7, 8, 9);
      const netTotals = [];
      incomeTotals.forEach((val, i) => {
         netTotals.push(val - expenseTotals[i]);
      });
      const balSheetTotal = balances
         .filter((bal) => bal.account == "3991")
         .map((i) => i["runningBalance"])
         .reduce((a, b) => a + b, 0);

      // Our data object
      const data = {
         mccs,
         netTotals,
         numberOfColumns: mccs.length + 2,
         balSheetTotal,
         accountGroups: [
            {
               label: "Local Income",
               sums: calculateGroupSums(4),
               subGroups: [
                  {
                     label: "41 contributions for staff",
                     sums: calculateGroupSums(41)
                  },
                  {
                     label: "42 contributions for staff",
                     sums: calculateGroupSums(42)
                  }
               ]
            },
            {
               label: "Income from AAA",
               sums: calculateGroupSums(5),
               subGroups: [
                  {
                     label: "contributions for staff",
                     sums: calculateGroupSums(51)
                  },
                  {
                     label: "contributions for staff",
                     sums: calculateGroupSums(52)
                  }
               ]
            },
            {
               label: "Income Received",
               sums: calculateGroupSums(4, 5)
            },
            {
               label: "Income transfers to AAA",
               sums: calculateGroupSums(6),
               subGroups: [
                  {
                     label: "contributions for staff",
                     sums: calculateGroupSums(61)
                  },
                  {
                     label: "contributions for staff",
                     sums: calculateGroupSums(62)
                  }
               ]
            },
            {
               label: "Expenses",
               sums: calculateGroupSums(7, 8),
               subGroups: [
                  {
                     label: "contributions for staff",
                     sums: calculateGroupSums(71)
                  },
                  {
                     label: "contributions for staff",
                     sums: calculateGroupSums(81)
                  }
               ]
            },
            {
               label: "Internal Transfers",
               sums: calculateGroupSums(9),
               subGroups: [
                  {
                     label: "contributions for staff",
                     sums: calculateGroupSums(91)
                  },
                  {
                     label: "contributions for staff",
                     sums: calculateGroupSums(92)
                  }
               ]
            }
         ]
      };

      // Get the template source
      // const source = $("#my-template").html();

      // Compile the template into a Handlebars function
      // const template = ejs.render(source, data);

      // Pass our data object to the compiled Handlebars function
      // Insert back into the page
      // $("#welcome-message").html(template);

      res.view(
         "app_builder/template/incomeVsExpense", // .ejs
         data
      );
   }
};
