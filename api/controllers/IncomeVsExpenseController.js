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

function valueFormat(number) {
   if (number == null) return;

   return number.toLocaleString("en-US", { minimumFractionDigits: 2 });
}

module.exports = {
   // GET: /template/localIncomeExpense
   // get the local and expense income and calculate the sums
   getData: function(req, res) {
      // get our passed params
      //console.log("params -------------->", req);
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
         // var t1 = new Date();

         // console.log("groups ----->", groups);
         let sums = [];
         // console.log("mccs ----->", mccs);
         // console.log("balances ------>", balances);
         for (let m = 0; m < mccs.length; m++) {
            let sum = 0;
            for (let b = 0; b < balances.length; b++) {
               let inGroup = false;
               let isExpense = false;
               for (let g = 0; g < groups.length; g++) {
                  if (
                     balances[b]["COA Num"] &&
                     accountInCategory(balances[b]["COA Num"], groups[g])
                  ) {
                     inGroup = true;
                  }
                  // check if item is expense so we can subtract from sum later
                  if (
                     balances[b]["COA Num"] &&
                     accountInCategory(balances[b]["COA Num"], 95)
                  ) {
                     isExpense = true;
                  }
               }
               // console.log("inGroup", inGroup);
               if (
                  inGroup &&
                  balances[b]["Running Balance"] &&
                  balances[b]["RC Code"] &&
                  balances[b]["RC Code"].substring(0, 2) == mccs[m].code
               ) {
                  if (isExpense) {
                     sum =
                        (100 * sum - 100 * balances[b]["Running Balance"]) /
                        100;
                  } else {
                     sum =
                        (100 * sum + 100 * balances[b]["Running Balance"]) /
                        100;
                  }
               }
            }
            sums.push(sum);
         }
         let totalSum = 0;
         for (let s = 0; s < sums.length; s++) {
            totalSum = (100 * sums[s] + 100 * totalSum) / 100;
         }
         sums.push(totalSum);
         // var t2 = new Date();
         // var dif = (t2.getTime() - t1.getTime()) / 1000;
         // console.log("groups ----->", groups);
         // console.log("Time to run calculations: ", dif);
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
                  data.fnValueFormat = valueFormat;
                  data.numberOfColumns = mccs.length + 2;
                  data.accountGroups = [
                     {
                        label: {
                           en: "Local Income",
                           zh: "本地收入"
                        },
                        total: {
                           en: "Total Local Income",
                           zh: "本地总收入"
                        },
                        account: "4000",
                        sums: calculateGroupSums(4),
                        subGroups: [
                           {
                              label: {
                                 en: "Local Income",
                                 zh: "本地收入"
                              },
                              account: "4100",
                              sums: calculateGroupSums(41)
                           },
                           {
                              label: {
                                 en: "Product sales",
                                 zh: "产品销售"
                              },
                              account: "4300",
                              sums: calculateGroupSums(43)
                           },
                           {
                              label: {
                                 en: "Program Income",
                                 zh: "会议和项目收入"
                              },
                              account: "4400",
                              sums: calculateGroupSums(44)
                           },
                           {
                              label: {
                                 en: "Other Income",
                                 zh: "其他收入"
                              },
                              account: "4900",
                              sums: calculateGroupSums(49)
                           }
                        ]
                     },
                     {
                        label: {
                           en: "Income from CCC",
                           zh: "来自3C的收入"
                        },
                        total: {
                           en: "Total Income from CCC",
                           zh: "来自3C的总收入"
                        },
                        account: "5000",
                        sums: calculateGroupSums(5),
                        subGroups: [
                           {
                              label: {
                                 en: "Contributions from other CCC",
                                 zh: "通过其他CCC收到的捐款"
                              },
                              account: "5100",
                              sums: calculateGroupSums(51)
                           },
                           {
                              label: {
                                 en: "Subsidy funding from other CCC",
                                 zh: "来自其他CCC的补贴和拨款"
                              },
                              account: "5600",
                              sums: calculateGroupSums(56)
                           }
                        ]
                     },
                     {
                        label: {
                           en: "",
                           zh: ""
                        },
                        total: {
                           en: "Total Income Received",
                           zh: "总收入"
                        },
                        account: "4000 & 5000",
                        sums: calculateGroupSums(4, 5)
                     },
                     {
                        label: {
                           en: "Income transfer to CCC",
                           zh: "转给其他3C的支出"
                        },
                        total: {
                           en: "Total Income transfer to CCC",
                           zh: "转给其他3C的总支出"
                        },
                        account: "6000",
                        sums: calculateGroupSums(6),
                        subGroups: [
                           {
                              label: {
                                 en: "Contributions to other CCC",
                                 zh: "给其他CCC的捐款转出"
                              },
                              account: "6100",
                              sums: calculateGroupSums(61)
                           },
                           {
                              label: {
                                 en: "Subsidy funding to other CCC",
                                 zh: "给其他CCC的补贴拨款转出"
                              },
                              account: "6600",
                              sums: calculateGroupSums(66)
                           }
                        ]
                     },
                     {
                        label: {
                           en: "Expenses",
                           zh: "支出费用"
                        },
                        total: {
                           en: "Total Expenes",
                           zh: "总支出费用"
                        },
                        account: "7000 & 8000",
                        sums: calculateGroupSums(7, 8),
                        subGroups: [
                           {
                              label: {
                                 en: "Personnel expenses",
                                 zh: "工资和员工福利"
                              },
                              account: "7100",
                              sums: calculateGroupSums(71)
                           },
                           {
                              label: {
                                 en: "Conferences and meetings",
                                 zh: "大会和会议费用"
                              },
                              account: "7200",
                              sums: calculateGroupSums(72)
                           },
                           {
                              label: {
                                 en: "Travel and transportation",
                                 zh: "差旅费"
                              },
                              account: "7500",
                              sums: calculateGroupSums(75)
                           },
                           {
                              label: {
                                 en: "Supplies and non-capitalized equipment",
                                 zh: "用品和设备以及设备维修和保养"
                              },
                              account: "8100",
                              sums: calculateGroupSums(81)
                           },
                           {
                              label: {
                                 en: "Communications",
                                 zh: "电话和通信"
                              },
                              account: "8200",
                              sums: calculateGroupSums(82)
                           },
                           {
                              label: {
                                 en: "Professional services",
                                 zh: "专业费用"
                              },
                              account: "8400",
                              sums: calculateGroupSums(84)
                           },
                           {
                              label: {
                                 en: "Capital expenses",
                                 zh: "固定资产支出"
                              },
                              account: "8600",
                              sums: calculateGroupSums(86)
                           },
                           {
                              label: {
                                 en: "Facilities",
                                 zh: "设施费用"
                              },
                              account: "8700",
                              sums: calculateGroupSums(87)
                           },
                           {
                              label: {
                                 en: "Other expenses",
                                 zh: "其他费用"
                              },
                              account: "8900",
                              sums: calculateGroupSums(89)
                           }
                        ]
                     },
                     {
                        label: {
                           en: "Internal Transfers",
                           zh: "内部转账"
                        },
                        total: {
                           en: "Total Internal Transfers",
                           zh: "内部转账总费用"
                        },
                        account: "9000",
                        sums: calculateGroupSums(9),
                        subGroups: [
                           {
                              label: {
                                 en: "Internal income transfers",
                                 zh: "内部转账收入"
                              },
                              account: "9100",
                              sums: calculateGroupSums(91)
                           },
                           {
                              label: {
                                 en: "Internal expense transfers",
                                 zh: "内部转账支出"
                              },
                              account: "9500",
                              sums: calculateGroupSums(95)
                           }
                        ]
                     }
                  ];

                  // Calculate Net Income Values
                  let incomeReceivedTotals = calculateGroupSums(4, 5);
                  let incomeTransferTotals = calculateGroupSums(6);
                  // let expenseTotals = calculateGroupSums(6, 7, 8, 9);
                  let expenseTotals = calculateGroupSums(7, 8);
                  let internalTransferTotals = calculateGroupSums(9);

                  // console.log(
                  //    "expenseTotals ------------------>",
                  //    expenseTotals
                  // );
                  // console.log("incomeTotals ------------------>", incomeTotals);
                  let netTotals = [];
                  for (let i = 0; i < incomeReceivedTotals.length; i++) {
                     // Total Income Received - Total Income transfer to CCC - Total Expenses + Total Internal Transfers
                     let val =
                        (100 * incomeReceivedTotals[i] -
                           100 * incomeTransferTotals[i] -
                           100 * expenseTotals[i] +
                           100 * internalTransferTotals[i]) /
                        100;
                     netTotals.push(val);
                  }
                  data.netTotals = netTotals;
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
                  data.languageCode = languageCode;
                  data.total = {
                     en: "Total",
                     zh: "总额"
                  };
                  data.netIncomeLoss = {
                     en: "NET INCOME (LOSS)",
                     zh: "净收入(损失)"
                  };
                  data.netIncomeLossBalance = {
                     en: "Net Income (loss) from Balance Sheet",
                     zh: "Balance Sheet 中的净收入(损失) "
                  };

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
