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
      // get our passed params
      //console.log("params -------------->", req);
      let rc = req.query.rc ? req.query.rc : undefined;
      let fyper = req.query.fyper ? req.query.fyper : undefined;
      // get the users preferred language
      let languageCode = req.user.data.languageCode
         ? req.user.data.languageCode
         : "en";

      if (req.query.languageCode) {
         languageCode = req.query.languageCode;
      }

      if (languageCode == "zh-hans") {
         languageCode = "zh";
      }

      /**
      /* @const balances
      /* aka GL Segments. Should be filtered by the fiscal period the report is based on.
      /* mcc_code: balance link to rc, rc link to mcc, mcc has a code. The rc code should
      /* should start with mcc code.
    */
      let balances = [];
      //    {
      //       mcc_code: "01",
      //       COA Num: 3991,
      //       Running Balance: 8110
      //    },
      //    {
      //       mcc_code: "01",
      //       COA Num: 4111,
      //       Running Balance: 1230
      //    },
      //    {
      //       mcc_code: "02",
      //       COA Num: 4111,
      //       Running Balance: 5020
      //    },
      //    {
      //       mcc_code: "03",
      //       COA Num: 4111,
      //       Running Balance: 130
      //    },
      //    {
      //       mcc_code: "02",
      //       COA Num: 4222,
      //       Running Balance: 1000
      //    },
      //    {
      //       mcc_code: "03",
      //       COA Num: 4221,
      //       Running Balance: 500
      //    },
      //    {
      //       mcc_code: "01",
      //       COA Num: 5111,
      //       Running Balance: 230
      //    },
      //    {
      //       mcc_code: "02",
      //       COA Num: 5211,
      //       Running Balance: 420
      //    },
      //    {
      //       mcc_code: "02",
      //       COA Num: 7211,
      //       Running Balance: 420
      //    }
      // ];

      /**
     /* @const mccs
     /* Can read from the MCC object
     */
      let mccs = [
         { code: "01", label: "Staff" },
         { code: "02", label: "SLM" },
         { code: "03", label: "Digital Strategies" },
         { code: "04", label: "LeaderImpact" },
         { code: "05", label: "GCM" },
         { code: "06", label: "Resource ministries" },
         { code: "07", label: "LDHR" },
         { code: "08", label: "Fund development" },
         { code: "09", label: "Operations" },
         { code: "10", label: "National Leadership" },
         { code: "11", label: "Other/None" }
      ];

      function calculateGroupSums(...groups) {
         // console.log("groups ----->", groups);
         let sums = [];
         // console.log("mccs ----->", mccs);
         // console.log("balances ------>", balances);
         for (let m = 0; m < mccs.length; m++) {
            let sum = 0;
            for (let b = 0; b < balances.length; b++) {
               let inGroup = false;
               for (let g = 0; g < groups.length; g++) {
                  if (
                     balances[b]["COA Num"] &&
                     accountInCategory(balances[b]["COA Num"], groups[g])
                  ) {
                     inGroup = true;
                  }
               }
               // console.log("inGroup", inGroup);
               if (
                  inGroup &&
                  balances[b]["RC Code"].substring(0, 2) == mccs[m].code
               ) {
                  sum =
                     (100 * balances[b]["Running Balance"] + 100 * sum) / 100;
               }
            }
            sums.push(sum);
         }
         let totalSum = 0;
         for (let s = 0; s < sums.length; s++) {
            totalSum = (100 * sums[s] + 100 * totalSum) / 100;
         }
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

      // let myRCs = ABSystemObject.getApplication().queries(
      //    (o) => o.id == "241a977c-7748-420d-9dcb-eff53e66a43f"
      // )[0];

      //console.log("myRCs ----------------->", myRCs);

      // myRCs
      //    .queryFind(
      //       {
      //          where: {
      //             glue: "and",
      //             rules: []
      //          }
      //       },
      //       req.user.data
      //    )
      //    .then((rcs) => {
      //       console.log("My Team RCs ---------------->", rcs);
      //
      //       let rcOptions = [];
      //       rcs.forEach((rc) => {
      //          rcOptions.push(rc["BASE_OBJECT.RC Name"]);
      //       });
      //
      //       data.rcOptions = rcOptions.sort(function(a, b) {
      //          return a.toLowerCase().localeCompare(b.toLowerCase());
      //       });
      //
      //       if (!rc) {
      //          rc = data.rcOptions[0];
      //          data.rc = rc;
      //       }

      let data = {};

      let fiscalMonthObj = ABSystemObject.getApplication().objects(
         (o) => o.id == "1d63c6ac-011a-4ffd-ae15-97e5e43f2b3f"
      )[0];

      fiscalMonthObj
         .modelAPI()
         .findAll({
            where: {
               glue: "and",
               rules: [
                  {
                     key: "Status",
                     rule: "equals",
                     value: "1592549786113"
                  }
               ]
            },
            populate: false,
            sort: [
               {
                  key: "49d6fabe-46b1-4306-be61-1b27764c3b1a",
                  dir: "DESC"
               }
            ],
            limit: 12
         })
         .then((records) => {
            //console.log("Fiscal Month Records ------------------>", records);
            let fiscalMonthsArray = records;
            data.fyper = fyper || fiscalMonthsArray[0]["FY Per"];
            let fyperOptions = [];
            let i = 0;
            let currIndex = 0;
            fiscalMonthsArray.forEach((fp) => {
               var dateObj = new Date(fp["End"]);
               var month = dateObj.getUTCMonth() + 1; //months from 1-12
               var year = dateObj.getUTCFullYear();
               var prettyDate = year + "/" + (month > 9 ? month : "0" + month);
               var option = { id: fp["FY Per"], label: prettyDate };
               if (fyper == fp["FY Per"]) {
                  option.selected = true;
                  currIndex = i;
               }
               fyperOptions.push(option);
               i++;
            });
            data.fyperOptions = fyperOptions;
            var dateObj = new Date(fiscalMonthsArray[currIndex]["End"]);
            var month = dateObj.getUTCMonth() + 1; //months from 1-12
            var year = dateObj.getUTCFullYear();
            data.fyperend = year + "/" + (month > 9 ? month : "0" + month);
            let startYear = year;
            if (month < 7) {
               startYear = year - 1;
            }
            data.fyperstart = startYear + "/07";

            //console.log("Fiscal Month picked from query param -->", data.fyper);
            let balanceObj = ABSystemObject.getApplication().objects(
               (o) => o.id == "bb9aaf02-3265-4b8c-9d9a-c0b447c2d804"
            )[0];

            balanceObj
               .modelAPI()
               .findAll({
                  where: {
                     glue: "and",
                     rules: [
                        // {
                        //    key: "RC Code",
                        //    rule: "equals",
                        //    value: rc
                        // },
                        {
                           key: "FY Period",
                           rule: "equals",
                           value: data.fyper
                        }
                     ]
                  },
                  populate: false
               })
               .then((records) => {
                  // console.log("records ----->", records);
                  balances = records;

                  data.mccs = mccs;
                  data.numberOfColumns = mccs.length + 2;
                  data.accountGroups = [
                     {
                        label: "Local Income",
                        sums: calculateGroupSums(4),
                        subGroups: [
                           {
                              label: "Contributions for staff",
                              sums: calculateGroupSums(41)
                           },
                           {
                              label: "Product sales",
                              sums: calculateGroupSums(43)
                           },
                           {
                              label: "Program Income",
                              sums: calculateGroupSums(44)
                           },
                           {
                              label: "Other Income",
                              sums: calculateGroupSums(49)
                           }
                        ]
                     },
                     {
                        label: "Income from CCC",
                        sums: calculateGroupSums(5),
                        subGroups: [
                           {
                              label: "Contributions from other CCC",
                              sums: calculateGroupSums(51)
                           },
                           {
                              label: "Subsidy funding from other CCC",
                              sums: calculateGroupSums(56)
                           }
                        ]
                     },
                     {
                        label: "Income Received",
                        sums: calculateGroupSums(4, 5)
                     },
                     {
                        label: "Income transfer to CCC",
                        sums: calculateGroupSums(6),
                        subGroups: [
                           {
                              label: "Contributions to other CCC",
                              sums: calculateGroupSums(61)
                           },
                           {
                              label: "Subsidy funding to other CCC",
                              sums: calculateGroupSums(66)
                           }
                        ]
                     },
                     {
                        label: "Expenses",
                        sums: calculateGroupSums(7, 8),
                        subGroups: [
                           {
                              label: "Personnel expenses",
                              sums: calculateGroupSums(71)
                           },
                           {
                              label: "Conferences and meetings",
                              sums: calculateGroupSums(72)
                           },
                           {
                              label: "Travel and transportation",
                              sums: calculateGroupSums(75)
                           },
                           {
                              label: "Supplies and non-capitalized equipment",
                              sums: calculateGroupSums(81)
                           },
                           {
                              label: "Communications",
                              sums: calculateGroupSums(82)
                           },
                           {
                              label: "Professional services",
                              sums: calculateGroupSums(84)
                           },
                           {
                              label: "Capital expenses",
                              sums: calculateGroupSums(86)
                           },
                           {
                              label: "Facilities",
                              sums: calculateGroupSums(87)
                           },
                           {
                              label: "Other expenses",
                              sums: calculateGroupSums(89)
                           }
                        ]
                     },
                     {
                        label: "Internal Transfers",
                        sums: calculateGroupSums(9),
                        subGroups: [
                           {
                              label: "Internal income transfers",
                              sums: calculateGroupSums(91)
                           },
                           {
                              label: "Internal expense transfers",
                              sums: calculateGroupSums(95)
                           }
                        ]
                     }
                  ];

                  // Calculate Net Income Values
                  let incomeTotals = calculateGroupSums(4, 5);
                  let expenseTotals = calculateGroupSums(6, 7, 8, 9);
                  // console.log(
                  //    "expenseTotals ------------------>",
                  //    expenseTotals
                  // );
                  // console.log("incomeTotals ------------------>", incomeTotals);
                  data.netTotals = [];
                  for (let i = 0; i < incomeTotals.length; i++) {
                     data.netTotals.push(
                        (100 * incomeTotals[i] - 100 * expenseTotals[i]) / 100
                     );
                  }
                  let balSheetTotal = 0;
                  for (let b = 0; b < balances.length; b++) {
                     if (
                        balances[b]["COA Num"] &&
                        balances[b]["COA Num"].toString() == "3991"
                     ) {
                        balSheetTotal =
                           (100 * balances[b]["Running Balance"] +
                              100 * balSheetTotal) /
                           100;
                     }
                  }
                  data.balSheetTotal = balSheetTotal;

                  // console.log("data ------>", data);

                  res.view(
                     "app_builder/template/incomeVsExpense", // .ejs
                     data
                  );
               });
         });
      // });

      // Get the template source
      // const source = $("#my-template").html();

      // Compile the template into a Handlebars function
      // const template = ejs.render(source, data);

      // Pass our data object to the compiled Handlebars function
      // Insert back into the page
      // $("#welcome-message").html(template);
   }
};
