const OBJECT_IDS = {
   FY_MONTH: "1d63c6ac-011a-4ffd-ae15-97e5e43f2b3f",
   ACCOUNT: "c1a3642d-3863-4eb7-ac98-3dd18de3e683",
   BALANCE: "bb9aaf02-3265-4b8c-9d9a-c0b447c2d804"
};

const ACCOUNT_CATEGORIES = {
   Assets: "1585806356532",
   Liabilities: "1585806356570",
   Equity: "1585806356643",
   Expenses: "1585806356789",
   Income: "1590392412833"
};

const ITEM_TYPES = {
   Header: "header",
   Total: "total",
   TotalSecondary: "secondary-total",
   TotalTertiary: "tertiary-total"
};

function GetViewData(fyMonth) {
   return {
      fyPeriod: fyMonth,
      fyOptions: [],
      items: [
         {
            title: "ASSETS",
            type: ITEM_TYPES.Header
         },
         {
            title: "Current Assets",
            type: ITEM_TYPES.Header
         },
         {
            id: 101,
            title: "1010 - Cash On Hand",
            value: 0
         },
         {
            id: 103,
            title: "1030 - RMB Bank",
            value: 0
         },
         {
            id: 104,
            title: "1040 - USD Bank",
            value: 0
         },
         {
            id: "Sum10",
            title: "Total Cash",
            type: ITEM_TYPES.TotalTertiary,
            value: (items) => {
               let val101 = items.find((x) => x.id == 101).value || 0;
               let val103 = items.find((x) => x.id == 103).value || 0;
               let val104 = items.find((x) => x.id == 104).value || 0;

               return val101 + val103 + val104;
            }
         },
         {
            id: 120,
            title: "1200 - SheBao Bank",
            value: 0
         },
         {
            id: 121,
            title: "1210 - Other Receivables",
            value: 0
         },
         {
            id: 13,
            title: "1300 - Materials for sale",
            value: 0
         },
         {
            id: 14,
            title: "1400 - Other current assets",
            value: 0
         },
         {
            id: "Sum12",
            title: "Total",
            type: ITEM_TYPES.TotalTertiary,
            value: (items) => {
               let val120 = items.find((x) => x.id == 120).value || 0;
               let val121 = items.find((x) => x.id == 121).value || 0;
               let val13 = items.find((x) => x.id == 13).value || 0;
               let val14 = items.find((x) => x.id == 14).value || 0;

               return val120 + val121 + val13 + val14;
            }
         },
         {
            id: "SumCurrentAsset",
            title: "Total current assets",
            type: ITEM_TYPES.TotalSecondary,
            value: (items) => {
               let valSum10 =
                  items.find((x) => x.id == "Sum10").value(items) || 0;
               let valSum12 =
                  items.find((x) => x.id == "Sum12").value(items) || 0;

               return valSum10 + valSum12;
            }
         },
         {
            title: "Fixed Assets",
            type: ITEM_TYPES.Header
         },
         {
            id: 15,
            title: "1500 - Land",
            value: 0
         },
         {
            id: 16,
            title: "1600 - Buildings",
            value: 0
         },
         {
            id: 17,
            title: "1700 - Equipment, furniture, vehicles",
            value: 0
         },
         {
            id: 18,
            title: "1800 - Accumulated depreciation",
            value: 0
         },
         {
            id: "SumFixAsset",
            title: "Total fixed assets",
            type: ITEM_TYPES.TotalSecondary,
            value: (items) => {
               let val15 = items.find((x) => x.id == 15).value || 0;
               let val16 = items.find((x) => x.id == 16).value || 0;
               let val17 = items.find((x) => x.id == 17).value || 0;
               let val18 = items.find((x) => x.id == 18).value || 0;

               return val15 + val16 + val17 + val18;
            }
         },
         {
            title: "TOTAL ASSETS",
            type: ITEM_TYPES.Total,
            value: (items) => {
               let valSumCurrentAsset =
                  items.find((x) => x.id == "SumCurrentAsset").value(items) ||
                  0;
               let valSumFixAsset =
                  items.find((x) => x.id == "SumFixAsset").value(items) || 0;

               return valSumCurrentAsset + valSumFixAsset;
            }
         },
         {
            title: "LIABILITIES AND FUND BALANCE",
            type: ITEM_TYPES.Header
         },
         {
            title: "Current liabilities",
            type: ITEM_TYPES.Header
         },
         {
            id: 21,
            title: "2100 - Accounts payable",
            value: 0
         },
         {
            id: 22,
            title: "2200 - Notes payable",
            value: 0
         },
         {
            id: 23,
            title: "2300 - Other current liabilities",
            value: 0
         },
         {
            id: 25,
            title: "2500 - Long-term liabilities",
            value: 0
         },
         {
            id: "SumLiabilities",
            title: "Total current liabilities",
            type: ITEM_TYPES.TotalSecondary,
            value: (items) => {
               let val21 = items.find((x) => x.id == 21).value || 0;
               let val22 = items.find((x) => x.id == 22).value || 0;
               let val23 = items.find((x) => x.id == 23).value || 0;
               let val25 = items.find((x) => x.id == 25).value || 0;

               return val21 + val22 + val23 + val25;
            }
         },
         {
            title: "Fund Balance",
            type: ITEM_TYPES.Header
         },
         {
            id: 30,
            title: "30 - Beginning fund balance",
            value: 0
         },
         {
            id: 39,
            title: "39 - Net income (loss) for the period",
            value: 0
         },
         {
            id: "SumFund",
            title: "Total Fund Balance",
            type: ITEM_TYPES.TotalSecondary,
            value: (items) => {
               let val30 = items.find((x) => x.id == 30).value || 0;
               let val39 = items.find((x) => x.id == 39).value || 0;

               return val30 + val39;
            }
         },
         {
            title: "TOTAL LIABILITIES AND FUND BALANCE",
            type: ITEM_TYPES.Total,
            value: (items) => {
               let valSumLiabilities =
                  items.find((x) => x.id == "SumLiabilities").value(items) || 0;
               let valSumFund =
                  items.find((x) => x.id == "SumFund").value(items) || 0;

               return valSumLiabilities + valSumFund;
            }
         }
      ]
   };
}

function GetFYMonths() {
   const objFYMonth = ABSystemObject.getApplication().objects(
      (o) => o.id == OBJECT_IDS.FY_MONTH
   )[0];

   if (objFYMonth == null) {
      return Promise.resolve([]);
   }

   return new Promise((next, bad) => {
      objFYMonth
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
         .then((list) => {
            next(list.map((item) => item["FY Per"]));
         })
         .catch(bad);
   });
}

function GetBalances(fyPeriod) {
   const objBalance = ABSystemObject.getApplication().objects(
      (o) => o.id == OBJECT_IDS.BALANCE
   )[0];

   if (objBalance == null || fyPeriod == null) {
      return Promise.resolve([]);
   }

   return new Promise((next, bad) => {
      objBalance
         .modelAPI()
         .findAll({
            where: {
               glue: "and",
               rules: [
                  {
                     key: "549ab4ac-f436-461d-9777-505d6dc1d4f7",
                     rule: "equals",
                     value: fyPeriod
                  }
               ]
            },
            populate: true
         })
         .then((list) => {
            next(list);
         })
         .catch(bad);
   });
}

module.exports = {
   // GET: /template/balanceSheet
   getData: (req, res) => {
      let viewData = GetViewData(req.query.month);

      Promise.resolve()
         // Pull FY month list
         .then(
            () =>
               new Promise((next, err) => {
                  GetFYMonths()
                     .then((list) => {
                        viewData.fyOptions = list;
                        next();
                     })
                     .catch(err);
               })
         )
         // Pull Balance data
         .then(
            () =>
               new Promise((next, err) => {
                  GetBalances(viewData.fyPeriod)
                     .then((list) => {
                        (list || []).forEach((bl) => {
                           if (
                              bl == null ||
                              bl.COANum__relation == null ||
                              bl.COANum__relation.Category == null
                           ) {
                              return;
                           }

                           const category = bl.COANum__relation.Category.toString();
                           if (
                              category == ACCOUNT_CATEGORIES.Assets ||
                              category == ACCOUNT_CATEGORIES.Liabilities ||
                              category == ACCOUNT_CATEGORIES.Equity
                           ) {
                              let accNum = bl.COANum__relation[
                                 "Acct Num"
                              ].toString();

                              viewData.items.forEach((reportItem) => {
                                 if (
                                    reportItem.id == null ||
                                    isNaN(reportItem.id)
                                 )
                                    return;

                                 if (accNum.indexOf(reportItem.id) == 0) {
                                    reportItem.value += parseFloat(
                                       bl["Running Balance"]
                                    );
                                 }
                              });
                           }
                        });

                        next();
                     })
                     .catch(err);
               })
         )
         // Render UI
         .then(() => {
            res.view(
               "app_builder/template/balanceSheet", // .ejs
               viewData
            );
         });
   }
};
